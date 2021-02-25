# Parameter
Base on [parameter](https://www.npmjs.com/package/parameter)；

Added tip parameter, which is used to prompt errors when parameter verification fails.

# Install 
```
npm i @ckpack/parameter --save
```

# Usage

`Parameter` Class

- `constructor([options])` - new Class `Parameter` instance
  - `options.convert` - 数据的类型进行转换,如 string:`'5'` => number `5`, default to `false`
  - `strict` - 如果为`true` 如果数据中的key在对应rule中不存在会被删除，default to `false`
- `validate(rule, value, opts)` - 校验 `value` 是否符合 `rule`. 如果不符合会返回错误数组
- `addRule(type, check)` - 增加自定义规则
   - `type` - 规则类型
   - `check(rule, value, obj)` - 回调函数，返回的信息表示错误

# Rule

#### common rule

- `required` - if `required` is set to false, this property can be null or undefined. default to `true`.
- `type` - The type of property, every type has it's own rule for the validate.
- `convertType` - Make parameter convert the input param to the specific type, support `int`, `number`, `string` and `boolean`, also support a function to customize your own convert method.
- `default` - The default value of property, once the property is allowed non-required and missed, parameter will use this as the default value. **This may change the original input params**.

#### int

If type is `int`, there has tow addition rules:

- `max` - The maximum of the value, `value` must <= `max`.
- `min` - The minimum of the value, `value` must >= `min`.

Default `convertType` is `int`.

#### number

If type is `number`, there has tow addition rules:

- `max` - The maximum of the value, `value` must <= `max`.
- `min` - The minimum of the value, `value` must >= `min`.

Default `convertType` is `number`.

#### string

If type is `string`, there has four addition rules:

- `allowEmpty`(alias to `empty`) - allow empty string, default to false. If `rule.required` set to false, `allowEmpty` will be set to `true` by default.
- `format` - A `RegExp` to check string's format.
- `max` - The maximum length of the string.
- `min` - The minimum length of the string.
- `trim` - Trim the string before check, default is `false`.

Default `convertType` is `string`

#### boolean

Match `boolean` type value.

Default `convertType` is `boolean`.

#### enum

If type is `enum`, it requires an addition rule:

- `values` - An array of data, `value` must be one on them. ***this rule is required.***

#### array

If type is `array`, there has four addition rule:

- `itemType` - The type of every item in this array.
- `rule` - An object that validate the items of the array. Only work with `itemType`.
- `max` - The maximun length of the array.
- `min` - The minimun lenght of the array.


# example
```js

let parameter = new Parameter({
  convert: true,
});

parameter.addRule('even', (rule, value)=>{
  if(value % 2 !== 0){
    return '不是一个偶数';
  }
  return null;
});

var data = {
  email: 'chenkai@mapplat.com',
  name: 'xiao hong',
  age: 24,
  gender: 'male',
  arr: ['1','2', '3'],
  arr2: [1,2,3,9,10,4,19],
  evenNum: 8,
};
var rule = {
  email: /^[0-9a-zA-Z_.-]{2,20}@[0-9a-zA-Z_-]{1,20}(\.[a-zA-Z0-9_-]{2,8}){1,2}$/,
  name: {
    type: 'string',
    min: 0,
  },
  age: {
      type: 'int',
      min: 0,
      msg: '需要是一个大于0的整数',
      convert: false,
  },
  gender: ['male', 'female', 'unknown'],
  arr: {
    type: 'array',
    min: 0,
    itemType: 'int',
  },
  evenNum: {
    type: 'even',
  }
};

let errors = parameter.validate(rule, data, {
  strict: true,
});

```


