/* eslint-env jest */
import { Parameter } from '../src/parameter';

describe(__filename, () => {
  test('Parameter', async () => {
    const parameter = new Parameter({});
    expect(parameter.validate({
      tt: 'number'
    }, {
      tt: 'tt'
    })).toEqual([{ message: 'should be a number', code: 'invalid', field: 'tt' }]);

    expect(parameter.validate({
      tt: 'number'
    }, {
      tt: 5
    })).toEqual(null);

    expect(parameter.validate({
      tt: {
        type: 'number',
        min: 10
      }
    }, {
      tt: 5
    })).toEqual(null);
  });
});
