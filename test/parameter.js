let assert = require('assert');
let Parameter = require('../index');

let parameter = new Parameter();

describe('parameter', function () {
    it('验证通过', function () {

        var data = {
            name: 'foo',
            age: 24,
            gender: 'male'
        };
        var rule = {
            name: 'string',
            age: {
                type: 'int',
                min: 1,
                msg: '需要是一个大于1的整数',
                convertType: 'int'
            },
            gender: ['male', 'female', 'unknown']
        };

        let errors = parameter.validate(rule, data);
        assert.equal(errors, null)
    });
    it('验证msg提示', function () {

        var data = {
            name: 'foo',
            age: -24,
            gender: 'male'
        };
        var rule = {
            name: 'string',
            age: {
                type: 'int',
                min: 1,
                msg: '需要是一个大于1的整数',
                convertType: 'int'
            },
            gender: ['male', 'female', 'unknown']
        };

        let errors = parameter.validate(rule, data);
        assert.equal(errors[0].message, '需要是一个大于1的整数')
    });
});