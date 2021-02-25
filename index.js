/* eslint-disable class-methods-use-this  */
/* eslint-disable no-restricted-syntax  */
/* eslint-disable guard-for-in  */
/* eslint-disable no-continue  */
/* eslint-disable no-use-before-define  */

function checkInt(rule, value) {
  if (typeof value !== 'number' || value % 1 !== 0) {
    return 'should be an integer';
  }

  if ('max' in rule && value > rule.max) {
    return `should smaller than ${rule.max}`;
  }

  if ('min' in rule && value < rule.min) {
    return `should bigger than ${rule.min}`;
  }
  return null;
}

function checkNumber(rule, value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'should be a number';
  }
  if ('max' in rule && value > rule.max) {
    return `should smaller than ${rule.max}`;
  }

  if ('min' in rule && value < rule.min) {
    return `should bigger than ${rule.min}`;
  }
  return null;
}

function checkString(rule, value) {
  if (typeof value !== 'string') {
    return 'should be a string';
  }

  if ('max' in rule && value.length > rule.max) {
    return `length should smaller than ${rule.max}`;
  }
  if ('min' in rule && value.length < rule.min) {
    return `length should bigger than ${rule.min}`;
  }

  if (rule.format && !rule.format.test(value)) {
    return `should match ${rule.format}`;
  }
  return null;
}

function checkBoolean(rule, value) {
  if (typeof value !== 'boolean') {
    return 'should be a boolean';
  }
  return null;
}

function checkArray(rule, value, obj) {
  if (!Array.isArray(value)) {
    return 'should be an array';
  }

  if ('max' in rule && value.length > rule.max) {
    return `length should smaller than ${rule.max}`;
  }
  if ('min' in rule && value.length < rule.min) {
    return `length should bigger than ${rule.min}`;
  }

  if (!rule.itemType) return null;
  const checker = rule.itemChecker || TYPE_MAP[rule.itemType];
  if (!checker) {
    throw new TypeError(`rule type must be one of  ${Object.keys(TYPE_MAP).join(', ')}, but the following type was passed: ${rule.type}`);
  }
  const errors = [];
  const subRule = this.formatRule(rule.rule);
  value.forEach((v, i) => {
    const index = `[${i}]`;
    const msg = checker.call(this, subRule, value[i], obj);
    if (msg) {
      errors.push({
        message: rule.msg || msg,
        code: 'invalid',
        field: `key:${index}`,
      });
    }
  });

  if (errors.length) {
    return errors;
  }
  return null;
}

function checkEnum(rule, value) {
  if (!Array.isArray(rule.values)) {
    throw new Error('check enum need array type values');
  }
  if (rule.values.indexOf(value) === -1) {
    return `should be one of ${rule.values.join(', ')}`;
  }
  return null;
}

function checkCustom(rule, value) {
  const { custom } = rule;
  if (typeof custom !== 'function') {
    throw new Error('custom need function type values');
  }
  return custom(rule, value);
}

const TYPE_MAP = {
  number: checkNumber,
  int: checkInt,
  string: checkString,
  boolean: checkBoolean,
  array: checkArray,
  enum: checkEnum,
  custom: checkCustom,
};

const CONVERT_MAP = {
  number: 'number',
  int: 'int',
  string: 'string',
  boolean: 'boolean',
  array: 'string',
  enum: 'string',
  custom: 'string',
};

class Parameter {
  constructor(opts = {}) {
    this.opts = opts;

    this.convert = this.opts.convert || false;
    this.strict = this.opts.strict || false;
  }

  validate(rules, obj, opts = {}) {
    if (typeof rules !== 'object') {
      throw new TypeError('need object type rule');
    }
    if (typeof obj !== 'object') {
      throw new TypeError('need object type data');
    }

    // 严格模式下如果数据中不存在rules中会被过滤掉
    const isStrict = 'strict' in opts ? opts.strict : this.strict;
    if (isStrict) {
      for (const key in obj) {
        if (key in rules) continue;
        delete obj[key];
      }
    }

    const errors = [];

    for (const key in rules) {
      const rule = this.formatRule(rules[key]);
      let value = obj[key];

      if (typeof value === 'string' && rule.trim === true) {
        obj[key] = value.trim();
        value = obj[key];
      }

      // 检查是否可选，设置默认值
      const isExist = value !== null && value !== undefined;
      if (!isExist) {
        if (rule.required !== false) {
          errors.push({
            message: 'required',
            field: key,
            code: 'missing_field',
          });
        }
        // support default value
        if ('default' in rule) {
          obj[key] = rule.default;
        }
        continue;
      }

      // convert
      const isConvert = 'convert' in rule ? rule.convert : this.convert;
      if (isConvert) {
        this.convertValue(rule, obj, key);
      }

      // 检查参数是否合法
      const checker = rule.checker || TYPE_MAP[rule.type];
      if (!checker) {
        throw new TypeError(`rule type must be one of  ${Object.keys(TYPE_MAP).join(', ')}, but the following type was passed: ${rule.type}`);
      }
      const msg = checker.call(this, rule, obj[key], obj);
      if (msg) {
        errors.push({
          message: rule.msg || msg,
          code: 'invalid',
          field: key,
        });
      }
    }

    if (errors.length) {
      return errors;
    }
    return null;
  }

  addRule(type, check) {
    TYPE_MAP[type] = check;
  }

  formatRule(rule) {
    rule = rule || {};
    if (typeof rule === 'string') {
      rule = { type: rule };
    } else if (Array.isArray(rule)) {
      rule = { type: 'enum', values: rule };
    } else if (rule instanceof RegExp) {
      rule = { type: 'string', format: rule };
    }
    return rule;
  }

  convertValue(rule, obj, key) {
    const value = obj[key];

    // 数组
    if (Array.isArray(value)) {
      const itemType = rule.itemType;
      if (typeof itemType === 'function') {
        obj[key] = value.map((val) => itemType(val, obj));
        return;
      }
      switch (itemType) {
        case 'int':
        case 'number':
          obj[key] = value.map((val) => Number(val));
          break;
        case 'string':
          obj[key] = value.map((val) => `${val}`);
          break;
        default:
      }
      return;
    }
  
    const convertType = rule.convertType || CONVERT_MAP[rule.type];
    if (typeof convertType === 'function') {
      obj[key] = convertType(value, obj);
      return;
    }
    switch (convertType) {
      case 'int':
        obj[key] = parseInt(value, 10);
        break;
      case 'string':
        obj[key] = String(value);
        break;
      case 'number':
        obj[key] = Number(obj[key]);
        break;
      case 'boolean':
        obj[key] = !!value;
        break;
      default:
    }
  }
}

module.exports = Parameter;
