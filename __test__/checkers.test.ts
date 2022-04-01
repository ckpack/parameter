/* eslint-env jest */
import { DEF_CHECKERS } from '../src/checkers';

describe(__filename, () => {
  test('int', async () => {
    const { int: checkInt } = DEF_CHECKERS;
    expect(checkInt({
      min: 8
    }, 3)).toEqual('Should bigger than 8');
    expect(checkInt({
      min: 8,
      max: 20
    }, 23)).toEqual('Should smaller than 20');
    expect(checkInt({
      min: 8,
      max: 20
    }, undefined)).toEqual('Should be a integer');
    expect(checkInt({
      min: 8,
      max: 20
    }, 1.1)).toEqual('Should be a integer');
    expect(checkInt({
      min: 8,
      max: 20
    }, 9.0)).toEqual(undefined);
  });

  test('number', async () => {
    const { number: checkNumber } = DEF_CHECKERS;
    expect(checkNumber({
      min: 8
    }, 3)).toEqual('Should bigger than 8');
    expect(checkNumber({
      min: 8,
      max: 20
    }, 23)).toEqual('Should smaller than 20');

    expect(checkNumber({
      min: 8,
      max: 20
    }, 'test')).toEqual('Should be a number');
    expect(checkNumber({
      min: 8,
      max: 20
    }, 10)).toEqual(undefined);
  });

  test('string', async () => {
    const { string: checkString } = DEF_CHECKERS;
    expect(checkString({
      min: 8
    }, 3)).toEqual('Should be a string');
    expect(checkString({
      min: 8,
      max: 20
    }, 'he')).toEqual('Length should bigger than 8');
    expect(checkString({
      min: 8,
      max: 20
    }, 'hello world')).toEqual(undefined);
    expect(checkString({
      min: 8,
      max: 20
    }, 'Length should bigger than 8')).toEqual('Length should smaller than 20');
    expect(checkString({
      min: 8,
      max: 20,
      regexp: /\d+/
    }, '0123456789')).toEqual(undefined);
    expect(checkString({
      min: 8,
      max: 20,
      regexp: /\d+/
    }, 'hello world')).toEqual('Wrong format');
  });

  test('boolean', async () => {
    const { boolean: checkBoolean } = DEF_CHECKERS;
    expect(checkBoolean({}, 0)).toEqual('Should be a boolean');
    expect(checkBoolean({}, true)).toEqual(undefined);
    expect(checkBoolean({}, false)).toEqual(undefined);
  });

  test('enum', async () => {
    const { enum: checkEnum } = DEF_CHECKERS;
    expect(checkEnum({
      enum: [0, true, 'hello']
    }, 0)).toEqual(undefined);
    expect(checkEnum({
      enum: [0, true, 'hello']
    }, false)).toEqual('Value should be one of 0,true,hello');
  });

  test('array', async () => {
    const { array: checkArray } = DEF_CHECKERS;
    expect(checkArray({
      itemType: 'string',
      itemRule: {
        min: 8,
        max: 20
      }
    }, ['hello', 'hello world'])).toEqual([{ code: 'invalid', field: '[0]', message: 'Length should bigger than 8' }]);
    expect(checkArray({
      itemType: 'string',
      itemRule: {
        min: 2,
        max: 20
      }
    }, ['hello', 'hello world'])).toEqual(undefined);

    expect(checkArray({
      itemChecker: (rule:any, value:any) => {
        const { times } = rule;
        return value % times === 0 ? undefined : `not an integer multiple of ${times}`;
      },
      itemRule: {
        times: 3
      }
    }, [3, 6, 7])).toEqual([{ code: 'invalid', field: '[2]', message: 'not an integer multiple of 3' }]);

    expect(checkArray({
      itemChecker: (rule:any, value:any) => {
        const { times } = rule;
        return value % times === 0 ? undefined : `not an integer multiple of ${times}`;
      },
      itemRule: {
        times: 3
      }
    }, [3, 6, 9])).toEqual(undefined);
  });
});
