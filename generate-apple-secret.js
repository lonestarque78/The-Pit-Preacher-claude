const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('C:\\Users\\Brian\\AuthKey_6U3XMSP8CM.p8');

const token = jwt.sign({}, privateKey, {
  algorithm: 'ES256',
  expiresIn: '180d',
  audience: 'https://appleid.apple.com',
  issuer: 'A889U662UJ',
  subject: 'com.thepitpreacher.web',
  keyid: '6U3XMSP8CM'
});

console.log(token);