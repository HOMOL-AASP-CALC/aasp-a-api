
var qs = require('querystring')

function cookie_uncrypt(cookie_criptografado) {

	const key = 'd2f7ea0c8f811d44854d068a6f55b3ba8db3c1d75f3a6d2c46f1a2e7d6d87e6f' //!IMPORTANTE: deixar igual ao php no verifica login
	const interacoes = 481 //!IMPORTANTE: deixar igual ao php no verifica login
	const Encryption = require('./Encryption.js')
	const encryption = new Encryption()
	const cookie_descriptografado = encryption.decrypt(cookie_criptografado, key, interacoes)
	let cookie = JSON.parse(cookie_descriptografado)
	return cookie;
}

// function encode_utf8(s) {
//     return unescape(encodeURIComponent(s));
//   }


// function decode_utf8(s) {
//     return decodeURIComponent(escape(s));
//   }

var s = "eyJjaXBoZXJ0ZXh0IjoidDJyd04yUlprTEh4MG8xcU93VktnWU1mdXF2eHYxSGdBN1VmR3pvN1p5ZkRuNlZMa0RnQjlwcTd5em9xeWNURzMxQnREUnBPR2xpRVhUdDVwZ2RvWGJvdkhtSjYzdDgxY0p4dzFUbEtrRWljQ2NORUZLRWRzUGhcL3RpczhFZzVGSjdwQzFpVytId2x3NElQdGdIY0NnQT09IiwiaXYiOiIwZGIzMGZiZjAyYTgxZDA3ZTQ4NDdmMDMyZTdjMWQ4YiIsInNhbHQiOiJhNDc2MDEzYmFkNzA5MDg4Y2U3MzBiOWQ0ZmVjODZhMmE0NWJmZTJmOTY3ZjQ4ZWUwZmQ3MTFjYTEyOWY2YWY0MmRmM2QxNThkYjJkOGE2YTZiNTM5ZTBlZjhhNjIwZWE1OGM4M2M2NjZiMWZlMWFlNzg1OTBlOWE2OGZiMmRmY2NkNmZjMmVkZDBhM2E1NGFmOGQ0YzVkZjQzNTJjMDcwZGI5YjdjODk1ZTdmMzBiMTYxOGIwZWUyYmJlMmE0ZjlhMmU4NWVlMGRkODZkY2Q0YmZiYTVlNjYzYjQwNjZhZGVhMWNhZGVmOTRkMDczZGFjMDNjODViZmQ1MzJiYjJiZThlOWM2ZDNjZTI2ZmE0NGE0OGUxYzVmY2ZhMWM0ZjcwOTNmYmFkZmM0ODQ0ZTgxODdhYzhhNWY2N2EyYTQ3NDEwN2FlN2MyY2NkZjY3YzkwYzZhMmQ1ZTcyYmE0YTcwODgzYzI4NGUyZDY5NWZmMGUyNjA0ZmRhZjVjNmY2MTZjNDEzZmMyYzYwOWE4NmNlZjM3ZjMxNjczZjY0MTA0ZTBmYjQ1MzJhYTdkOWIyNzVmN2E2ZDRiNDhlYmZhYTI5OGNmNWIzODVkZjQ1MzhhZWZlNTgzNjE4ZGRjYmUzZWEwMGNmNjkxZGM2MDg3NGQ0Y2M1NjAxNTRhYmFkYzFiNSIsIml0ZXJhdGlvbnMiOjQ4MX0%3D"
// s = encode_utf8(s)
s = qs.unescape(s);

var  a = cookie_uncrypt(s) 
console.log(a)

