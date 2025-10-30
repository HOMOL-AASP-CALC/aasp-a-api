const BigNumber = require('bignumber.js');
let juros = 10
let a  = new BigNumber(juros)

var b = a.pow( 2 )

console.log(b)
console.log(b.toNumber())