# Parameter

JSON validator for Node.js and browser by using simple configuration rule

## Usage

### API

`Parameter` Class

+ `constructor([options])` - New Class `Parameter` instance
  - `options.isUseDefault` - If use default value, default to `true`
  - `options.isRemoveAdditional` - Delete is not defined in the rule as an attribute, default to `false`
  - `options.isCoerceTypes` - Change data type of data to match type keyword, default to `false`
  - `options.emptyValues` - The contained value will be treated as a empty value, default to `[null, undefined, NaN, '']`
+ `validate(rule, value, [options])` - Validate the `value` conforms to `rule`. return an array of errors if break rule
  - `rule` -  The rule of the verified json
  - `value` - JSON to be verified
  - `options` - Override the definition of `constructor([options])`
+ `addRule(type, checkFunction)` - Add custom rules.
   - `type` - Rule type, required and must be string type.
   - `checkFunction(rule, value)` - Custom check rule function.

### Example

```js
import { Parameter } from '@ckpack/parameter';

const parameter = new Parameter({
  isCoerceTypes: true
});

// custom check
parameter.addRule('times', (rule, value) => {
  const { times } = rule;
  return value % times === 0 ? null : `not an integer multiple of ${times}`;
});

// json value
const data = {
  isAdmin: 'true',
  age: '18',
  someNumber: 5,
  ids: ['1', '2', '3']
};

// check rule
const rule = {
  isAdmin: 'boolean',
  age: 'int',
  someNumber: {
    type: 'times',
    time: 3,
  },
  ids: {
    type: 'array',
    itemType: 'int',
    itemRule: {
      min: 1
    }
  }
}

const errors = parameter.validate(rule, data);
```

[complex example](/__test__/parameter.test.ts)

### RULE

#### common rules
+ type: The rule type
+ message: Custom error message
+ isRequired: If check the empty value, default to `true`
+ default: Is `isUseDefault` is `true`, the empty value will be set default value, default to  `undefined`
#### int
If type is `int`, There are the following options rules
+ `max` - The maximum of the value, value must <= `max`
+ `min` - The minimum of the value, value must >= `min`
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
#### number
If type is `number`, There are the following options rules
+ `max` - The maximum of the value, value must <= `max`
+ `min` - The minimum of the value, value must >= `min`

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
#### string
If type is `string`, There are the following options rules
+ `regexp` - A RegExp to check string's format
+ `max` - The maximum length of the string
+ `min` - The minimum length of the string

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
#### boolean
If type is `boolean`

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
#### array
If type is `array`, There are the following options rules
+ `itemType` - The type of every item in this array
+ `itemRule` - The rule of every item in this Rule
+ `itemChecker`- The checker of every item, in this case you can omit `itemType` and `itemRule`
+ `max` - The maximun length of the array
+ `min` - The minimum length of the array

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
If type is `enum`, There are the following rules
+ `enum`- An array of data, value must be one on them

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
### custom rule

definition custom rule， example
```js
// custom check
parameter.addRule('even', (rule, value) => {
  return value % 2 === 0 ? null : `${value} is not even`;
});
```
use the custom rule

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

you alse can add options rules

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

## [Documentation](https://ckpack.github.io/parameter)

## [CHANGELOG](/CHANGELOG.md)

## LICENSE [MIT](/LICENSE)