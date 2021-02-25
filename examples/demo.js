let Parameter = require("./parameter");

let parameter = new Parameter({
  convert: true,
});

parameter.addRule('even', (rule, value)=>{
  console.log(arguments)
  if(value % 2 !== 0){
    return '不是一个偶数';
  }
  return null;
});

let data = {
  email: 'chenkai@mapplat.com',
  name: 'xiao hong',
  age: 24,
  gender: 'male',
  arr: ['1','2', '3'],
  arr2: [1,2,3,9,10,4,19],
  evenNum: 8,
};

let rule = {
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

console.log(JSON.stringify(errors));
console.log(data);