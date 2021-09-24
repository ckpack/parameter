import { convertValue, checkProperty, formatRule, toRawType } from './utils';
import { DEF_CHECKERS, Error, Rule } from './checkers';

interface ParameterOptions {
  isConvert?:Boolean,
  isStrict?:Boolean,
};

const DEF_CONVERT: {
  [type:string]: string
} = {
  number: 'number',
  int: 'int',
  string: 'string',
  boolean: 'boolean',
  array: 'string',
  enum: 'string',
  custom: 'string'
};

class Parameter {
  isConvert: Boolean;
  isStrict: Boolean;
  constructor (options: ParameterOptions = {}) {
    const { isConvert = false, isStrict = false } = options;
    this.isConvert = isConvert;
    this.isStrict = isStrict;
  }

  validate (rules:{
    [key:string]: Rule | string
  }, params:{
    [key:string]: any
  } = {}, options:ParameterOptions = {}) {
    if (toRawType(rules) !== 'Object' || toRawType(params) !== 'Object') {
      throw new TypeError('rules or params need object type');
    }

    // 严格模式下如果数据中不存在rules中会被过滤掉
    const { isStrict = this.isStrict, isConvert = this.isConvert } = options;
    if (isStrict) {
      Object.keys(params).forEach((key) => {
        if (!checkProperty(rules, key)) {
          delete params[key];
        }
      });
    }

    const errors:Error[] = [];

    Object.keys(rules).forEach((key) => {
      // 严格模式下如果数据中不存在rules中会被过滤掉
      const value = params[key];
      const rule:Rule = formatRule(rules[key]);

      // 检查是否可选，设置默认值
      const isExist = value !== null && value !== undefined;
      if (!isExist) {
        if (rule.required !== false) {
          errors.push({
            message: 'required',
            field: key,
            code: 'missing_field'
          });
        }
        // support default value
        if (checkProperty(rule, 'default')) {
          params[key] = rule.default;
        }
        return;
      }

      // isConvert
      if (isConvert) {
        params[key] = !Array.isArray(value)
          ? convertValue(params[key], rule.convertType || DEF_CONVERT[rule.type || 'string'])
          : value.map((val) => convertValue(val, rule.itemType));
      }

      // 检查参数是否合法
      const checker = rule.checker || DEF_CHECKERS[rule.type || 'string'];
      if (!checker) {
        throw new TypeError(`rule type must be one of  ${Object.keys(DEF_CHECKERS).join(', ')}, but the following type was passed: ${rule.type}`);
      }
      const msg = checker.call(this, rule, params[key], params);
      if (msg) {
        errors.push({
          message: rule.msg || msg,
          code: 'invalid',
          field: key
        });
      }
    });

    if (errors.length) {
      return errors;
    }
    return null;
  }

  addRule (type:string, checkRule:any) {
    DEF_CHECKERS[type] = checkRule;
  }
}

export {
  Parameter
};

export type {
  Error,
  Rule,
  ParameterOptions
};
