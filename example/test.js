const path = '/home/ok';
const regex = new RegExp(`^${path}$`);

console.log(regex.test('/'));     // true
console.log(regex.test('/home'));     // false
console.log(regex.test('/home/ok'));  // false
console.log(regex.test('/home123'));  // false



// console.log(regex.test('/'));     // true
// console.log(regex.test('/home'));     // true
// console.log(regex.test('/home/ok'));  // false
// console.log(regex.test('/home123'));  // false
