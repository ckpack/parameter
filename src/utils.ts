/**
 * 返回参数类型
 * @param value 参数
 * @returns 是否是函数
 */
const toTypeString = (value: unknown) => {
  return Object.prototype.toString.call(value);
};

/**
 * 返回参数类型
 * @param value 参数
 * @returns type
 */
const toRawType = (value: any) => {
  return toTypeString(value).slice(8, -1);
};

const checkProperty = (params = {}, key : PropertyKey) => Object.prototype.hasOwnProperty.call(params, key);

const convertValue = (value: any, convertType:string | Function = 'string') => {
  if (typeof convertType === 'function') {
    return convertType(value);
  }
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
      return value;
  }
};

const formatRule = (rule = {}) => {
  const rawType = toRawType(rule);
  switch (rawType) {
    case 'String':
      return { type: rule };
    case 'RegExp':
      return { type: 'string', format: rule };
    case 'Array':
      return { type: 'enum', values: rule };
    default:
      return rule;
  }
};

export {
  toRawType,
  checkProperty,
  convertValue,
  formatRule
};
