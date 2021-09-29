import { toRawType } from './utils';

export interface Rule {
  min?: number,
  max?: number,
  regexp?: RegExp,
  trim?:Boolean,
  enum?: any[],
  custom?: Function,
  message?: string,
  rule?: Rule,
  type?: string,
  itemType?: string,
  itemRule?: Rule
  itemChecker?: Function,
  default?: any,
  convertType?: string,
  checker?: Function,
  isRequired?:Boolean,
  [key:string]: any,
};

export interface Error {
  message?: string,
  field?: string,
  code?: string,
};

export type checkFunction = (rule: Rule, value: any) => string | null | Error | Error;

export const DEF_CHECKERS: {
  number: checkFunction,
  int: checkFunction,
  string: checkFunction,
  boolean: checkFunction,
  enum: checkFunction,
  custom: checkFunction,
  array: checkFunction
  [key:string]: checkFunction,
} = <any>{};

const checkInt = (rule:Rule, value: any) => {
  if (typeof value !== 'number' || value % 1 !== 0) {
    return 'should be a integer';
  }

  if (rule.max && value > rule.max) {
    return `should smaller than ${rule.max}`;
  }

  if (rule.min && value < rule.min) {
    return `should bigger than ${rule.min}`;
  }
  return null;
};

const checkNumber = (rule:Rule, value: any) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'should be a number';
  }
  if (rule.max && value > rule.max) {
    return `should smaller than ${rule.max}`;
  }

  if (rule.min && value < rule.min) {
    return `should bigger than ${rule.min}`;
  }
  return null;
};

const checkString = (rule:Rule, value: any) => {
  if (typeof value !== 'string') {
    return 'should be a string';
  }

  if (rule.max && value.length > rule.max) {
    return `length should smaller than ${rule.max}`;
  }
  if (rule.min && value.length < rule.min) {
    return `length should bigger than ${rule.min}`;
  }

  if (rule.regexp && !rule.regexp.test(value)) {
    return `should match ${rule.regexp}`;
  }
  return null;
};

const checkBoolean = (rule:void, value: any) => {
  if (typeof value !== 'boolean') {
    return 'should be a boolean';
  }
  return null;
};

const checkEnum = (rule:Rule, value: any) => {
  if (!Array.isArray(rule.enum)) {
    throw new Error('check enum need array type enum');
  }
  if (rule.enum.indexOf(value) === -1) {
    return `should be one of ${rule.enum.join(', ')}`;
  }
  return null;
};

const checkCustom = (rule:Rule, value: any) => {
  const { custom } = rule;
  if (!custom || toRawType(custom) !== 'Function') {
    throw new Error('custom need function type values');
  }
  return custom(rule, value);
};

const checkArray = (rule:Rule, value: any) => {
  if (!Array.isArray(value)) {
    return 'should be an array';
  }

  if (rule.max && value.length > rule.max) {
    return `length should smaller than ${rule.max}`;
  }
  if (rule.min && value.length < rule.min) {
    return `length should bigger than ${rule.min}`;
  }
  const checker = rule.itemChecker || (rule.itemType && DEF_CHECKERS[rule.itemType]);
  if (!checker) {
    throw new TypeError(`rule type: ${rule.type} must be one of ${Object.keys(DEF_CHECKERS).join(', ')}`);
  }
  const errors: Error[] = [];
  value.forEach((v, i) => {
    const index = `[${i}]`;
    const message = checker(rule.itemRule, value[i]);
    if (message) {
      errors.push({
        message: rule.message || message,
        code: 'invalid',
        field: `${index}`
      });
    }
  });

  return errors.length ? errors : null;
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
