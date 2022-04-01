export interface Locale {
  error_rules_and_params?: string,
  error_rule_type?: string,
  missing_required?: string,
  int_type?: string,
  int_max?: string,
  int_min?: string,
  number_type?: string,
  number_max?: string,
  number_min?: string,
  string_type?: string,
  string_max?: string,
  string_min?: string,
  string_regexp?: string,
  boolean_type?: string,
  enum_type?: string,
  enum_value?: string,
  array_type?: string,
  array_min?: string,
  array_max?: string,
  array_checker?: string,
  object_type?: string,
};

const zhLocale: Locale = {
  error_rules_and_params: '验证的规则和值需要是对象类型',
  error_rule_type: '规则类型必须是 {types} 之一，但传递了以下类型：{type}',
  missing_required: '不能为空',
  int_type: '应该是一个整数',
  int_min: '应该大于{min}',
  int_max: '应该小于{max}',
  number_type: '应该是一个数字',
  number_min: '应该大于{min}',
  number_max: '应该小于{max}',
  string_type: '应该是一个字符串',
  string_min: '数组长度应该大于{min}',
  string_max: '数组长度应该小于{max}',
  string_regexp: '格式错误',
  boolean_type: '应该是一个boolean',
  enum_type: '枚举需要是数组类型',
  enum_value: '值应该为{enum}中的一个',
  array_type: '应该是一个数组',
  array_min: '数组长度应该大于{min}',
  array_max: '数组长度应该小于{max}',
  array_checker: 'itemChecker 和 itemType 不能都为空',
  object_type: '应该是一个对象'
};

const enLocale: Locale = {
  error_rules_and_params: 'Validated rules and params need to be of type object',
  error_rule_type: 'Rule type must be one of {types}, but the following type was passed: {type}',
  missing_required: 'cannot be empty',
  int_type: 'Should be a integer',
  int_min: 'Should bigger than {min}',
  int_max: 'Should smaller than {max}',
  number_type: 'Should be a number',
  number_min: 'Should bigger than {min}',
  number_max: 'Should smaller than {max}',
  string_type: 'Should be a string',
  string_min: 'Length should bigger than {min}',
  string_max: 'Length should smaller than {max}',
  string_regexp: 'Wrong format',
  boolean_type: 'Should be a boolean',
  enum_type: 'Enums need to be of type array',
  enum_value: 'Value should be one of {enum}',
  array_type: 'Should be an array',
  array_min: 'Length should bigger than {min}',
  array_max: 'Length should smaller than {max}',
  array_checker: 'ItemChecker and itemType cannot both be empty',
  object_type: 'Should be a object'
};

let _locale = enLocale;
function setLocale (locale:Locale) {
  _locale = locale;
}
function getLocale () {
  return _locale;
}

/**
 * 格式化
 * @param message - 格式化前语言对应的内容
 * @param params - 格式化message的参数
 * @returns - 格式化后语言对应的内容
 */
function formatMessage (message: string, params?: Record<string, any>) {
  if (!message || typeof message !== 'string' || !params) return message;
  const messageArr = message.split(/[{}]/);

  let messageFormat = '';
  for (let index = 0; index < messageArr.length; index += 1) {
    const item = messageArr[index];
    if (!item) continue;
    if (index % 2 !== 0) {
      if (item in params || Array.isArray(params)) {
        messageFormat += params[item];
      } else {
        throw new Error(`${item} not in params`);
      }
    } else {
      messageFormat += item;
    }
  }
  return messageFormat;
}

function getMessage (key: keyof Locale, params?: Record<string, any>) {
  const message = _locale[key] || enLocale[key];
  return message && formatMessage(message, params);
}

export {
  zhLocale,
  enLocale,
  getLocale,
  setLocale,
  getMessage
};
