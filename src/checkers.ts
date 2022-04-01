import { Parameter } from './parameter';
import type { ValidateParams } from './parameter';
import { getMessage } from './locale';

export const ERROR_CODE = {
  missingField: 'missing_field',
  invalid: 'invalid'
};

type RuleTypes = 'int' | 'number' | 'string' | 'boolean' | 'enum' | 'array' | 'object' | string;

export interface RuleBase {
  type?: RuleTypes;
  message?: string,
  isRequired?:Boolean,
  default?: unknown,
  // eslint-disable-next-line no-use-before-define
  checker?: checkFunction,
  convertType?: string,
  [key:string]: RuleBase | any,
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
  enum?: unknown[],
};
export interface RuleArray extends RuleBase {
  min?: number,
  max?: number,
  itemType?: string,
  itemRule?: RuleBase,
  itemChecker?: Function,
};

export type RuleFunction = ((value:any) => string | undefined);
export type Rules = RuleInt | RuleNumber | RuleString | RuleBoolean | RuleEnum | RuleArray | RuleObject | RuleCustom;
export type checkFunction = (rule: Rules, value: any) => string | undefined;
export type RulesOrigin = Rules | RuleTypes | RegExp | RuleFunction;

export interface Error {
  message?: string,
  field?: string,
  code?: string,
};

export const DEF_CHECKERS: {
  int: checkFunction,
  number: checkFunction,
  string: checkFunction,
  boolean: checkFunction,
  enum: checkFunction,
  array: checkFunction,
  object: checkFunction,
  [key:string]: checkFunction,
} = <any>{};

const checkInt = (rule:RuleInt, value: unknown) => {
  if (typeof value !== 'number' || value % 1 !== 0) {
    return getMessage('int_type', { value });
  }

  if (rule.max && value > rule.max) {
    return getMessage('int_max', { max: rule.max, value });
  }

  if (rule.min && value < rule.min) {
    return getMessage('int_min', { min: rule.min, value });
  }
};

const checkNumber = (rule:RuleNumber, value: unknown) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return getMessage('number_type', { value });
  }
  if (rule.max && value > rule.max) {
    return getMessage('number_max', { max: rule.max, value });
  }

  if (rule.min && value < rule.min) {
    return getMessage('number_min', { min: rule.min, value });
  }
};

const checkString = (rule:RuleString, value: unknown) => {
  if (typeof value !== 'string') {
    return getMessage('string_type', { value });
  }

  if (rule.max && value.length > rule.max) {
    return getMessage('string_max', { max: rule.max, value });
  }
  if (rule.min && value.length < rule.min) {
    return getMessage('string_min', { min: rule.min, value });
  }

  if (rule.regexp && !rule.regexp.test(value)) {
    return getMessage('string_regexp', { regexp: rule.regexp.toString(), value });
  }
};

const checkBoolean = (rule:RuleBoolean, value: unknown) => {
  if (typeof value !== 'boolean') {
    return getMessage('boolean_type', { value });
  }
};

const checkEnum = (rule:RuleEnum, value: unknown) => {
  if (!Array.isArray(rule.enum)) {
    throw new Error(getMessage('enum_type', { enum: rule.enum }));
  }
  if (rule.enum.indexOf(value) === -1) {
    return getMessage('enum_value', { enum: rule.enum, value });
  }
};

const checkArray = (rule:RuleArray, value: unknown) => {
  if (!Array.isArray(value)) {
    return getMessage('array_type', { value });
  }

  if (rule.max && value.length > rule.max) {
    return getMessage('array_max', { max: rule.max, value });
  }
  if (rule.min && value.length < rule.min) {
    return getMessage('array_min', { min: rule.min, value });
  }
  const checker = rule.itemChecker || (rule.itemType && DEF_CHECKERS[rule.itemType]);
  if (!checker) {
    throw new TypeError(getMessage('array_checker', { itemType: rule.itemType, itemChecker: rule.itemChecker }));
  }
  const errors: Error[] = [];
  value.forEach((v, i) => {
    const index = `[${i}]`;
    const message = checker(rule.itemRule, value[i]);
    if (message) {
      errors.push({
        message: rule.message || message,
        code: ERROR_CODE.invalid,
        field: `${index}`
      });
    }
  });

  return errors.length ? errors : undefined;
};

const checkObject = function (this:Parameter, rule:RuleObject, value: ValidateParams) {
  if (typeof value !== 'object') {
    return getMessage('object_type', { value });
  }
  return rule.rule ? this.validate(rule.rule, value) : undefined;
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
