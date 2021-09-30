/* eslint-env jest */
import { Parameter } from '../src/parameter';

describe(__filename, () => {
  test('Parameter', async () => {
    const parameter = new Parameter({});
    expect(parameter.validate({
      password: {
        type: 'string',
        regexp: /.{6}/
      },
      role: {
        type: 'enum',
        enum: ['admin', 'user']
      },
      name: {
        type: 'string',
        min: 2,
        max: 20
      },
      age: {
        type: 'int',
        min: 1,
        max: 200
      }
    }, {
      password: 'h',
      name: 'x',
      age: -10
    })).toEqual([
      {
        message: 'should match /.{6}/',
        code: 'invalid',
        field: 'password'
      },
      { message: 'required', field: 'role', code: 'missing_field' },
      {
        message: 'length should bigger than 2',
        code: 'invalid',
        field: 'name'
      },
      { message: 'should bigger than 1', code: 'invalid', field: 'age' }
    ]);
    expect(parameter.validate({
      password: {
        type: 'string',
        regexp: /.{6}/
      },
      role: {
        type: 'enum',
        enum: ['admin', 'user']
      },
      name: {
        type: 'string',
        min: 2,
        max: 20
      },
      age: {
        type: 'int',
        min: 1,
        max: 200
      }
    }, {
      role: 'admin',
      password: '123456@',
      name: 'hello-world',
      age: 10
    })).toEqual(null);

    expect(parameter.validate({
      ids: {
        type: 'array',
        itemType: 'int',
        itemRule: {
          min: 1
        }
      }
    }, {
      ids: [0, 1, 2, 2.5]
    })).toEqual([{ code: 'invalid', field: 'ids', message: [{ code: 'invalid', field: '[0]', message: 'should bigger than 1' }, { code: 'invalid', field: '[3]', message: 'should be a integer' }] }]);
    expect(parameter.validate({
      ids: {
        type: 'array',
        itemType: 'int',
        itemRule: {
          min: 1
        }
      }
    }, {
      ids: [1, 2, 2]
    })).toEqual(null);
  });
  test('Parameter isCoerceTypes', async () => {
    const parameter = new Parameter({
      isCoerceTypes: true
    });
    const data = {
      isAdmin: 'true',
      age: '18',
      ids: ['1', '2', '3']
    };
    expect(parameter.validate({
      isAdmin: 'boolean',
      age: 'int',
      ids: {
        type: 'array',
        itemType: 'int',
        itemRule: {
          min: 1
        }
      }
    }, data)).toEqual(null);
    expect(data.isAdmin).toEqual(true);
    expect(data.age).toEqual(18);
    expect(data.ids).toEqual([1, 2, 3]);
  });
  test('Parameter isRemoveAdditional', async () => {
    const parameter = new Parameter({
      isUseDefault: true,
      isRemoveAdditional: true
    });
    const data = {
      username: 'hello'
    };
    expect(parameter.validate({
      age: {
        isRequired: false,
        default: 0,
        type: 'int',
        min: 1,
        max: 200
      }
    }, data)).toEqual(null);
    expect(data).toEqual({
      age: 0
    });
  });

  test('Parameter isRequired', async () => {
    const parameter = new Parameter();
    expect(parameter.validate({
      name: {
        isRequired: true,
        type: 'string',
        min: 2,
        max: 20
      },
      age: {
        isRequired: false,
        type: 'int',
        min: 1,
        max: 200
      }
    }, {
      name: 'hello'
    })).toEqual(null);
  });

  test('Parameter isUseDefault', async () => {
    const parameter = new Parameter({
      isUseDefault: true
    });
    const data = {
      age: undefined
    };
    expect(parameter.validate({
      age: {
        isRequired: false,
        default: 0,
        type: 'int',
        min: 1,
        max: 200
      }
    }, data)).toEqual(null);
    expect(data.age).toEqual(0);
  });

  test('Parameter addRule', async () => {
    const parameter = new Parameter();
    parameter.addRule('times', (rule, value) => {
      const { times } = rule;
      return value % times === 0 ? null : `not an integer multiple of ${times}`;
    });

    parameter.addRule('even', (rule, value) => {
      return value % 2 === 0 ? null : `${value} is not even`;
    });
    expect(parameter.validate({
      someNumber: {
        type: 'times',
        times: 3
      }
    }, {
      someNumber: 2
    })).toEqual([{ code: 'invalid', field: 'someNumber', message: 'not an integer multiple of 3' }]);

    expect(parameter.validate({
      someNumber: {
        type: 'even'
      }
    }, {
      someNumber: 1
    })).toEqual([{ code: 'invalid', field: 'someNumber', message: '1 is not even' }]);
    expect(parameter.validate({
      someNumber: 'even'
    }, {
      someNumber: 1
    })).toEqual([{ code: 'invalid', field: 'someNumber', message: '1 is not even' }]);
    expect(parameter.validate({
      someNumber: 'even'
    }, {
      someNumber: 2
    })).toEqual(null);
  });

  test('Parameter object', async () => {
    const parameter = new Parameter();
    expect(parameter.validate({
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
    }, {
      people: {
        name: 'xiao hong',
        age: 45
      }
    })).toEqual(null);

    expect(parameter.validate({
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
    }, {
      people: {
        name: 'xiao hong',
        age: 'xxx'
      }
    })).toEqual([{ code: 'invalid', field: 'people', message: [{ code: 'invalid', field: 'age', message: 'should be a integer' }] }]);
  });
});
