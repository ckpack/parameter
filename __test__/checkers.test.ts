/* eslint-env jest */
import { DEF_CHECKERS } from '../src/checkers';

describe(__filename, () => {
  test('int', async () => {
    const { int: checkInt } = DEF_CHECKERS;
    expect(checkInt({
      min: 8
    }, 3)).toEqual('should bigger than 8');
    expect(checkInt({
      min: 8,
      max: 20
    }, 23)).toEqual('should smaller than 20');
    expect(checkInt({
      min: 8,
      max: 20
    }, undefined)).toEqual('should be a integer');
    expect(checkInt({
      min: 8,
      max: 20
    }, 1.1)).toEqual('should be a integer');
    expect(checkInt({
      min: 8,
      max: 20
    }, 9.0)).toEqual(null);
  });

  test('number', async () => {
    const { number: checkNumber } = DEF_CHECKERS;
    expect(checkNumber({
      min: 8
    }, 3)).toEqual('should bigger than 8');
    expect(checkNumber({
      min: 8,
      max: 20
    }, 23)).toEqual('should smaller than 20');

    expect(checkNumber({
      min: 8,
      max: 20
    }, 'test')).toEqual('should be a number');
    expect(checkNumber({
      min: 8,
      max: 20
    }, 10)).toEqual(null);
  });

  test('string', async () => {
    const { string: checkString } = DEF_CHECKERS;
    expect(checkString({
      min: 8
    }, 3)).toEqual('should be a string');
    expect(checkString({
      min: 8,
      max: 20
    }, 'he')).toEqual('length should bigger than 8');
    expect(checkString({
      min: 8,
      max: 20
    }, 'hello world')).toEqual(null);
    expect(checkString({
      min: 8,
      max: 20
    }, 'length should bigger than 8')).toEqual('length should smaller than 20');
    expect(checkString({
      min: 8,
      max: 20,
      regexp: /\d+/
    }, '0123456789')).toEqual(null);
    expect(checkString({
      min: 8,
      max: 20,
      regexp: /\d+/
    }, 'hello world')).toEqual('should match /\\d+/');
  });

  test('boolean', async () => {
    const { boolean: checkBoolean } = DEF_CHECKERS;
    expect(checkBoolean({}, 0)).toEqual('should be a boolean');
    expect(checkBoolean({}, true)).toEqual(null);
    expect(checkBoolean({}, false)).toEqual(null);
  });

  test('enum', async () => {
    const { enum: checkEnum } = DEF_CHECKERS;
    expect(checkEnum({
      enum: [0, true, 'hello']
    }, 0)).toEqual(null);
    expect(checkEnum({
      enum: [0, true, 'hello']
    }, false)).toEqual('should be one of 0, true, hello');
  });

  test('array', async () => {
    const { array: checkArray } = DEF_CHECKERS;
    expect(checkArray({
      itemType: 'string',
      itemRule: {
        min: 8,
        max: 20
      }
    }, ['hello', 'hello world'])).toEqual([{ code: 'invalid', field: '[0]', message: 'length should bigger than 8' }]);
    expect(checkArray({
      itemType: 'string',
      itemRule: {
        min: 2,
        max: 20
      }
    }, ['hello', 'hello world'])).toEqual(null);

    expect(checkArray({
      itemChecker: (rule:any, value:any) => {
        const { times } = rule;
        return value % times === 0 ? null : `not an integer multiple of ${times}`;
      },
      itemRule: {
        times: 3
      }
    }, [3, 6, 7])).toEqual([{ code: 'invalid', field: '[2]', message: 'not an integer multiple of 3' }]);

    expect(checkArray({
      itemChecker: (rule:any, value:any) => {
        const { times } = rule;
        return value % times === 0 ? null : `not an integer multiple of ${times}`;
      },
      itemRule: {
        times: 3
      }
    }, [3, 6, 9])).toEqual(null);
  });
});
