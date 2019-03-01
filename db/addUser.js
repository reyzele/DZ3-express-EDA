const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const db = require('./lowDB.js');
const psw = require('../libs/password');

let email = '';
let hash = '';
let salt = '';
let password = {};

rl.question('Email: ', answer => {
  email = answer;
  rl.question('Password: ', answer => {
    password = psw.setPassword(answer);
    hash = password.hash;
    salt = password.salt;
    rl.close();
  });
});

rl.on('close', () => {
  db.set('user', { email, hash, salt }).write();
});
