import type { checkFunction } from './checkers';
import { convertValue, checkProperty, formatRule, toRawType } from './utils';
import { DEF_CHECKERS, Error, Rule } from './checkers';

export type {
  checkFunction,
  Error,
  Rule
};
export interface ParameterOptions {
  isCoerceTypes?:Boolean,
  isRemoveAdditional?:Boolean,
  isUseDefault?:Boolean,
  emptyValues?: any[],
};

export const DEF_CONVERT: {
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

  validate (rules:{
    [key:string]: Rule | string
  }, params:{
    [key:string]: any
  } = {}, options:ParameterOptions = {}) {
    if (toRawType(rules) !== 'Object' || toRawType(params) !== 'Object') {
      throw new TypeError('rules or params need object type');
    }

    // isRemoveAdditional = true 如果数据中不存在rules中会被过滤掉
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
      // 严格模式下如果数据中不存在rules中会被过滤掉
      const value = params[key];
      const rule:Rule = formatRule(rules[key]);

      // 检查是否可选，设置默认值
      const isEmpty = emptyValues.includes(value);

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

  addRule (type:string, checkRule:checkFunction) {
    DEF_CHECKERS[type] = checkRule;
  }
}
