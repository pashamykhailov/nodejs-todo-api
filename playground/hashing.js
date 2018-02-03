const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

let message = 'hello';
let hash = SHA256(message).toString();

console.log(`message: ${message}`);
console.log(`hash: ${hash}`);