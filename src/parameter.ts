import type { checkFunction, Error, Rules } from './checkers';
import { convertValue, checkProperty, formatRule, toRawType } from './utils';
import { DEF_CHECKERS } from './checkers';

export type {
  checkFunction,
  Error,
  Rules
};
export interface ParameterOptions {
  isCoerceTypes?:Boolean,
  isRemoveAdditional?:Boolean,
  isUseDefault?:Boolean,
  emptyValues?: any[],
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

export const defineRule = (rule: Rules|string) => rule;
export const defineRules = (rules: Record<string, Rules|string>) => rules;

export class Parameter {
  isCoerceTypes: Boolean;
  isRemoveAdditional: Boolean;
  isUseDefault: Boolean;
  emptyValues: any[];
  constructor (options: ParameterOptions = {}) {
    const { isCoerceTypes = false, isRemoveAdditional = false, isUseDefault = true, emptyValues = [null, undefined, NaN, ''] } = options;
    this.isCoerceTypes = isCoerceTypes;
    this.isRemoveAdditional = isRemoveAdditional;
    this.isUseDefault = isUseDefault;
    this.emptyValues = emptyValues;
  }

  validate (rules: Record<string, Rules|string>, params:Record<string, any>, options:ParameterOptions = {}) {
    if (toRawType(rules) !== 'Object' || toRawType(params) !== 'Object') {
      throw new TypeError('rules or params need object type');
    }

    // isRemoveAdditional = true 不存在rules中属性的值会被过滤
    const { isRemoveAdditional = this.isRemoveAdditional, isCoerceTypes = this.isCoerceTypes, isUseDefault = this.isUseDefault, emptyValues = this.emptyValues } = options;
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

      const isEmpty = emptyValues.includes(value);
      // 如果值为empty检查是否可选、设置默认值
      if (isEmpty) {
        if (rule.isRequired !== false) {
          errors.push({
            message: 'required',
            field: key,
            code: 'missing_field'
          });
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
        throw new TypeError(`rule type must be one of  ${Object.keys(DEF_CHECKERS).join(', ')}, but the following type was passed: ${rule.type}`);
      }
      const message = checker.call(this, rule, params[key], params);
      if (message) {
        errors.push({
          message: rule.message || message,
          code: 'invalid',
          field: key
        });
      }
    });

    return errors.length ? errors : null;
  }

  addRule (type:string, checker:checkFunction) {
    DEF_CHECKERS[type] = checker;
  }
}
