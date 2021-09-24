import { toRawType, formatRule } from './utils';

interface Rule {
  min?: number,
  max?: number,
  format?: RegExp,
  values?: any[],
  custom?: Function,
  msg?: string,
  Rule?: Rule,
  type?: string,
  itemType?: string,
  itemChecker?: Function,
  required?:Boolean,
  default?: any,
  convertType?: string,
  checker?: Function,
};

interface Error {
  message?: string,
  field?: string,
  code?: string,
};

const DEF_CHECKERS: {
  [key:string]: any,
} = {};

const checkInt = (Rule:Rule, value: any) => {
  if (typeof value !== 'number' || value % 1 !== 0) {
    return 'should be an integer';
  }

  if (Rule.max && value > Rule.max) {
    return `should smaller than ${Rule.max}`;
  }

  if (Rule.min && value < Rule.min) {
    return `should bigger than ${Rule.min}`;
  }
  return null;
};

const checkNumber = (Rule:Rule, value: any) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'should be a number';
  }
  if (Rule.max && value > Rule.max) {
    return `should smaller than ${Rule.max}`;
  }

  if (Rule.min && value < Rule.min) {
    return `should bigger than ${Rule.min}`;
  }
  return null;
};

const checkString = (Rule:Rule, value: any) => {
  if (typeof value !== 'string') {
    return 'should be a string';
  }

  if (Rule.max && value.length > Rule.max) {
    return `length should smaller than ${Rule.max}`;
  }
  if (Rule.min && value.length < Rule.min) {
    return `length should bigger than ${Rule.min}`;
  }

  if (Rule.format && !Rule.format.test(value)) {
    return `should match ${Rule.format}`;
  }
  return null;
};

const checkBoolean = (Rule = {}, value: any) => {
  if (typeof value !== 'boolean') {
    return 'should be a boolean';
  }
  return null;
};

const checkEnum = (Rule:Rule, value: any) => {
  if (!Array.isArray(Rule.values)) {
    throw new Error('check enum need array type values');
  }
  if (Rule.values.indexOf(value) === -1) {
    return `should be one of ${Rule.values.join(', ')}`;
  }
  return null;
};

const checkCustom = (Rule:Rule, value: any) => {
  const { custom } = Rule;
  if (!custom || toRawType(custom) !== 'Function') {
    throw new Error('custom need function type values');
  }
  return custom(Rule, value);
};

const checkArray = (Rule:Rule, value: any, params = {}) => {
  if (!Array.isArray(value)) {
    return 'should be an array';
  }

  if (Rule.max && value.length > Rule.max) {
    return `length should smaller than ${Rule.max}`;
  }
  if (Rule.min && value.length < Rule.min) {
    return `length should bigger than ${Rule.min}`;
  }

  if (!Rule.itemType) return null;
  const checker = Rule.itemChecker || DEF_CHECKERS[Rule.itemType];
  if (!checker) {
    throw new TypeError(`Rule type: ${Rule.type} must be one of ${Object.keys(DEF_CHECKERS).join(', ')}`);
  }
  const errors: Error[] = [];
  const subRule = formatRule(Rule.Rule);
  value.forEach((v, i) => {
    const index = `[${i}]`;
    const msg = checker.call(this, subRule, value[i], params);
    if (msg) {
      errors.push({
        message: Rule.msg || msg,
        code: 'invalid',
        field: `${index}`
      });
    }
  });

  if (errors.length) {
    return errors;
  }
  return null;
};

Object.assign(DEF_CHECKERS, {
  number: checkNumber,
  int: checkInt,
  string: checkString,
  boolean: checkBoolean,
  enum: checkEnum,
  custom: checkCustom,
  array: checkArray
});

export {
  DEF_CHECKERS
};
export type {
  Rule,
  Error
};
