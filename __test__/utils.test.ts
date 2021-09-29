/* eslint-env jest */
import * as utils from '../src/utils';

describe(__filename, () => {
  test('toTypeString', async () => {
    const { toTypeString } = utils;
    expect(toTypeString(0)).toEqual('[object Number]');
    expect(toTypeString(true)).toEqual('[object Boolean]');
  });
  test('toRawType', async () => {
    const { toRawType } = utils;
    expect(toRawType(0)).toEqual('Number');
    expect(toRawType(true)).toEqual('Boolean');
  });
  test('checkProperty', async () => {
    const { checkProperty } = utils;
    expect(checkProperty({}, 'name')).toEqual(false);
    expect(checkProperty({ name: 'c' }, 'name')).toEqual(true);
  });
  test('convertValue', async () => {
    const { convertValue } = utils;
    expect(convertValue('18', 'int')).toEqual(18);
    expect(convertValue('18', 'number')).toEqual(18);
    expect(convertValue(true, 'string')).toEqual('true');
    expect(convertValue(true, 'boolean')).toEqual(true);
    expect(convertValue(true, '666')).toEqual(true);
    expect(convertValue('999', (value) => !!value)).toEqual(true);
  });
  test('formatRule', async () => {
    const { formatRule } = utils;
    expect(formatRule('int')).toEqual({
      type: 'int'
    });
    expect(formatRule(/\d+/)).toEqual({
      type: 'string',
      regexp: /\d+/
    });
    expect(formatRule([1, 3])).toEqual({
      type: 'enum',
      enum: [1, 3]
    });
    expect(formatRule({
      min: 8,
      max: 20
    })).toEqual({
      min: 8,
      max: 20
    });
  });
});
