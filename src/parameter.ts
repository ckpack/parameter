import type { checkFunction, Error, Rules, RulesOrigin } from './checkers';
import { convertValue, checkProperty, formatRule, toRawType } from './utils';
import { DEF_CHECKERS, ERROR_CODE } from './checkers';
import { getMessage } from './locale';
export { setLocale, getLocale, zhLocale, enLocale } from './locale';

export type {
  checkFunction,
  Error,
  Rules
};
export interface ParameterOptions {
  isCoerceTypes?:Boolean,
  isRemoveAdditional?:Boolean,
  isUseDefault?:Boolean,
  emptyValues?: unknown[],
};

const DEF_CONVERT: {
  [type:string]: string
} = {
  number: 'number',
  int: 'int',
  string: 'string',
  boolean: 'boolean',
  array: 'string',
  enum: 'string'
};

export type ValidateRules = Record<string, RulesOrigin>;
export type ValidateParams = Record<string, any>;

export const defineRule = (rule: RulesOrigin) => rule;
export const defineRules = (rules: ValidateRules) => rules;

export class Parameter {
  isCoerceTypes: Boolean;
  isRemoveAdditional: Boolean;
  isUseDefault: Boolean;
  emptyValues: unknown[];
  constructor (options: ParameterOptions = {}) {
    const { isCoerceTypes = false, isRemoveAdditional = false, isUseDefault = true, emptyValues = [null, undefined, NaN, ''] } = options;
    this.isCoerceTypes = isCoerceTypes;
    this.isRemoveAdditional = isRemoveAdditional;
    this.isUseDefault = isUseDefault;
    this.emptyValues = emptyValues;
  }

  schema (rules: ValidateRules, options?: ParameterOptions) {
    return (params: ValidateParams) => this.validate(rules, params, options);
  }

  validate (rules: ValidateRules, params:ValidateParams, options?:ParameterOptions) {
    if (toRawType(rules) !== 'Object' || toRawType(params) !== 'Object') {
      throw new TypeError(getMessage('error_rules_and_params', { rules, params }));
    }

    // isRemoveAdditional = true 不存在rules中属性的值会被过滤
    const { isRemoveAdditional = this.isRemoveAdditional, isCoerceTypes = this.isCoerceTypes, isUseDefault = this.isUseDefault, emptyValues = this.emptyValues } = options || {};
    if (isRemoveAdditional) {
      Object.keys(params).forEach((key) => {
        if (!checkProperty(rules, key)) {
          delete params[key];
        }
      });
    }

    const errors:Error[] = [];

    Object.keys(rules).forEach((key) => {
      const value = params[key];
      const rule = formatRule(rules[key]);

      if (typeof rule === 'function') {
        const message = rule(value);
        message && errors.push({
          message: message,
          code: ERROR_CODE.invalid,
          field: key
        });
        return;
      }

      const { message } = rule;
      const isEmpty = emptyValues.includes(value);
      // 如果值为empty检查是否可选、设置默认值
      if (isEmpty) {
        if (rule.isRequired !== false) {
          errors.push({
            message: message || getMessage('missing_required', { field: key }),
            field: key,
            code: ERROR_CODE.missingField
          });
          return;
        }
        if (isUseDefault && checkProperty(rule, 'default')) {
          params[key] = rule.default;
        }
        return;
      }

      // 是否强制类型转换
      if (isCoerceTypes) {
        if (!Array.isArray(value)) {
          if (rule.convertType || rule.type) {
            params[key] = convertValue(params[key], rule.convertType || (rule.type && DEF_CONVERT[rule.type]));
          }
        } else {
          if (rule.itemType) {
            params[key] = value.map((val) => convertValue(val, rule.itemType));
          }
        }
      }

      // 检查参数是否合法
      const checker = rule.checker || (rule.type && DEF_CHECKERS[rule.type]);
      if (!checker) {
        throw new TypeError(getMessage('error_rule_type', { types: Object.keys(DEF_CHECKERS).join(', '), type: rule.type }));
      }
      const checkerError = checker.call(this, rule, params[key]);
      if (checkerError) {
        errors.push({
          message: message || checkerError,
          code: ERROR_CODE.invalid,
          field: key
        });
      }
    });

    return errors.length ? errors : undefined;
  }

  addRule (type:string, checker:checkFunction) {
    DEF_CHECKERS[type] = checker;
  }
}
