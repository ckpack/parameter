import type { Rules } from './checkers';

export type convertFunction = (value:any) => any;

/**
 * 返回参数类型
 * @param value 参数
 * @returns 是否是函数
 */
export const toTypeString = (value: any) => {
  return Object.prototype.toString.call(value);
};

/**
 * 返回参数类型
 * @param value 参数
 * @returns type
 */
export const toRawType = (value: any) => {
  return toTypeString(value).slice(8, -1);
};

export const checkProperty = (params = {}, key : PropertyKey) => Object.prototype.hasOwnProperty.call(params, key);

export const convertValue = (value: any, convertType: string | convertFunction | undefined) => {
  if (!convertType) return value;
  switch (convertType) {
    case 'int':
      return parseInt(value, 10);
    case 'string':
      return String(value);
    case 'number':
      return Number(value);
    case 'boolean':
      return !!value;
    default:
      return typeof convertType === 'function' ? convertType(value) : value;
  }
};

export const formatRule = (rule:any):Rules => {
  const rawType = toRawType(rule);
  switch (rawType) {
    case 'String':
      return { type: rule };
    case 'RegExp':
      return { type: 'string', regexp: rule };
    case 'Array':
      return { type: 'enum', enum: rule };
    default:
      return rule;
  }
};
