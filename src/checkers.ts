export interface RuleBase {
  type?: string,
  message?: string,
  isRequired?:Boolean,
  default?: any,
  checker?: Function,
  convertType?: string,
  [key:string]: any,
};
export interface RuleInt extends RuleBase {
  min?: number,
  max?: number,
};
export interface RuleNumber extends RuleBase {
  min?: number,
  max?: number,
};
export interface RuleString extends RuleBase {
  min?: number,
  max?: number,
  regexp?: RegExp,
};
export interface RuleBoolean extends RuleBase {};

export interface RuleCustom extends RuleBase {
};

export interface RuleObject extends RuleBase {
  rule?: RuleBase,
};
export interface RuleEnum extends RuleBase {
  enum?: any[],
};
export interface RuleArray extends RuleBase {
  min?: number,
  max?: number,
  itemType?: string,
  itemRule?: RuleBase,
  itemChecker?: Function,
};
export type Rules = RuleInt | RuleNumber | RuleString | RuleBoolean | RuleEnum | RuleArray | RuleObject | RuleCustom;

export interface Error {
  message?: string,
  field?: string,
  code?: string,
};

export type checkFunction = (rule: Rules, value: any) => string | null | Error;

export const DEF_CHECKERS: {
  number: checkFunction,
  int: checkFunction,
  string: checkFunction,
  boolean: checkFunction,
  enum: checkFunction,
  array: checkFunction,
  object: checkFunction,
  [key:string]: checkFunction,
} = <any>{};

const checkInt = (rule:RuleInt, value: any) => {
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

const checkNumber = (rule:RuleNumber, value: any) => {
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

const checkString = (rule:RuleString, value: any) => {
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

const checkBoolean = (rule:RuleBoolean, value: any) => {
  if (typeof value !== 'boolean') {
    return 'should be a boolean';
  }
  return null;
};

const checkEnum = (rule:RuleEnum, value: any) => {
  if (!Array.isArray(rule.enum)) {
    throw new Error('check enum need array type enum');
  }
  if (rule.enum.indexOf(value) === -1) {
    return `should be one of ${rule.enum.join(', ')}`;
  }
  return null;
};

const checkArray = (rule:RuleArray, value: any) => {
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

const checkObject = function (this:any, rule:RuleObject, value: any) {
  if (typeof value !== 'object') {
    return 'should be a object';
  }
  return rule.rule ? this.validate(rule.rule, value) : null;
};

Object.assign(DEF_CHECKERS, {
  number: checkNumber,
  int: checkInt,
  string: checkString,
  boolean: checkBoolean,
  enum: checkEnum,
  array: checkArray,
  object: checkObject
});
