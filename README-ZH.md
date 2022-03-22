# Parameter

通过简单的配置验证JSON数据

## API

`Parameter` Class

+ `constructor([options])` - `Parameter` 构造函数
  + `options.isUseDefault` - 是否使用默认值, 默认值: `true`
  + `options.isRemoveAdditional` - 是否删除未在规则中定义的参数, 默认值: `false`
  + `options.isCoerceTypes` - 是否开启参数类型转换, 默认值: `false`
  + `options.emptyValues` - 包含在内的值将被视为空值,此时如果开启`isUseDefault`, 参数会被设置为对应值, 默认值:`[null, undefined, NaN, '']`
+ `schema(rule, [options])` - 返回一个具有固定参数的validate
+ `validate(rule, value, [options])` - 验证 `value` 是否符合 `rule`。 如果违反规则，则返回错误数组
  + `rule` -  规则
  + `value` - 待验证的JSON参数
  + `options` - 可选参数，可用于覆盖构造函数中的参数
+ `addRule(type, checkFunction)` - 添加自定义验证规则
  + `type` - 自定义验证规则类型, 必须为字符串类型
  + `checkFunction(rule, value)` - 自定义验证规则函数该函数接受两个参数，第一个参数为规则，第二个参数为值

## 例子

```js
import { Parameter } from '@ckpack/parameter';

const parameter = new Parameter();

// check rule
const rule = {
  isAdmin: {
    type: 'boolean',
  },
  age: {
    type: 'int',
    min: 0,
  },
  role: {
    type: 'enum',
    enum: ['am', 'pm'],
  }
  ids: {
    type: 'array',
    itemType: 'int',
    itemRule: {
      min: 1
    }
  }
}

// check value
const data = {
  isAdmin: true,
  age: 18,
  role: 'am',
  ids: [1, 2, 3]
};

const errors = parameter.validate(rule, data);
```

[其他用例](/__test__/parameter.test.ts)

## RULE

### common rules

+ `type`: 规则类型
+ `message`: 自定义错误信息
+ `isRequired`: 是否检查空值, 默认值: `true`
+ `default`: 是`isUseDefault`是`true`，空值会设置默认值，默认: `undefined`

### int

如果 type 为 `int`，则有以下选项规则

+ `max` - 值的最大值，值必须 <= `max`
+ `min` - 值的最小值，值必须 >= `min`

```js
{
  score: 'int',
}
// or
{
  score: {
    type: 'int',
    min: 0,
    max: 200,
  }
}
```

### number

如果 type 为 `number`，则有以下选项规则

+ `max` - 值的最大值，值必须 <= `max`
+ `min` - 值的最小值，值必须 >= `min`

example

```js
{
  score: 'number',
}
// or
{
  score: {
    type: 'number',
    min: 0,
    max: 100,
  }
}
```

### string

如果 type 为 `string`，则有以下选项规则

+ `regexp` - 检查字符串格式的正则表达式
+ `max` - 字符串的最大长度
+ `min` - 字符串的最小长度

example

```js
{
  username: 'string',
}
// or
{
  username: {
    type: 'string',
    regexp: /\S{4,20}/
  }
}
```

### boolean

如果类型是 `boolean`

example

```js
{
  isAll: 'boolean',
}
// or
{
  isAll: {
    type: 'boolean',
  }
}
```

### array

如果 type 为 `array`，则有以下选项规则

+ `itemType` - 数组中每个子项目的类型
+ `itemRule` - 数组中每个子项目的规则
+ `itemChecker`- 每个项目的检查器，在这种情况下你可以省略 `itemType` 和 `itemRule`
+ `max` - 数组的最大长度
+ `min` - 数组的最小长度

example

```js
{
  ids: {
    itemType: 'int',
    itemRule: {
      min: 1,
      max: 1000,
    },
    min: 0,
    max: 100,
  }
}
```

### enum

如果 type 为 `enum`，则有以下规则

+ `enum`- 一个数据数组，值必须是其中一个

example

```js
{
  sex: ['man', 'woman']
}
// or
{
  sex: {
    type: 'enum'
    enum: ['man', 'woman']
  }
}
```

### object

如果type是`object`，有以下规则

+ `rule`- 验证对象属性的对象

example

```js
{
  people: {
    type: 'object',
    rule: {
      name: 'string',
      age: {
        isRequired: false,
        type: 'int',
        min: 1,
        max: 200
      }
    }
  }
}
```

### custom rule

定义自定义规则，

示例

```js
// custom check
parameter.addRule('even', (rule, value) => {
  return value % 2 === 0 ? null : `${value} is not even`;
});
```

使用自定义规则

```js
{
  someNumber: 'even'
}
//or
{
  someNumber: {
    type: "even",
  }
}
```

您也可以添加选项规则

```js
import { Parameter } from '@ckpack/parameter';
const parameter = new Parameter();
parameter.addRule('times', (rule, value) => {
  const { times } = rule;
  return value % times === 0 ? null : `not an integer multiple of ${times}`;
});

// rule
{
  someNumber: {
    type: "times",
    times: 3,
  }
}
```
