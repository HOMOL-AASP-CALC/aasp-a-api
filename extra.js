var porta_api = 3049
var nserver = '' 

if (process.argv.length > 2) {
	nserver = process.argv[2] 
	porta_api = parseInt(nserver) + 3050 
}


const fs = require('fs')
const fs2 = require('fs').promises
const calcUtil = require('./calcUtil.js');

var http = require('http');
var express = require('express');
var cors = require('cors')

var bodyParser = require('body-parser')
// var jsonParser = bodyParser.json()
// var urlencodedParser = bodyParser.urlencoded({ extended: false })


require('dotenv').config()  
var qs = require('querystring')

var cookieParser = require('cookie-parser');
var pasta_env = process.env.pasta_calculos

const cors1 = {
    origin: "https://atualiza.debit.com.br",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}

var mysql_senha = process.env.MYSQL_password

if (process.env.MYSQL_host == "localhost") {
	cors1.origin = "http://app.fastbet.win"
} 
else {
	mysql_senha = mysql_senha+"#";
// 	var caminho = '/atualizaSocket/' 
}
const mysql = require('mysql2')  
var mysql_info = {host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: mysql_senha, database: process.env.MYSQL_database }

var con = null 
var con2 = null 

var app = express();
app.use(cors(  cors1 ))
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
var axios = require('axios');


var handleDisconnect = function() {
	con =   mysql.createPool(mysql_info).promise() // mysql1.createConnection(mysql_info); 

	con.on('error', function(err) {
		console.log('---- mysql desconectou no atualiza.js ---- ', err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
			handleDisconnect(); 
		} else { 
			throw err; 
		}
	});
}

handleDisconnect();

var handleDisconnect2 = function() {
	con2 =   mysql.createPool(mysql_info)

	con2.on('error', function(err) {
		console.log('---- mysql desconectou no atualiza.js - linha 105 ---- ', err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST - 2 ') { 
			handleDisconnect2(); 
		} else { 
			throw err; 
		}
	});
}

handleDisconnect2();

const mysqlDisconnect = function(m_info) {
    var m1 = mysql.createPool(m_info)

    m1.on('error', function(err) {
        console.log('---- mysql desconectou no atualiza.js - linha 105 ---- ', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST - 2 ') { 
          mysqlDisconnect(m_info.dbName); 
        } else { 
            throw err; 
        }
    });

    return m1;
}

var mysql_info2 ={
    host: process.env.awsMYSQL_host, 	
    user: process.env.awsMYSQL_user,	
    password: process.env.awsMYSQL_password, 
    database:  'calculos' }
var conCalculos = mysqlDisconnect(mysql_info2)


permissoes_ativas = async function  (idCalc, cookie1, idMultiusuario = 0) {
    // retornos
    // editar - e
    // visualizar - v

	var idLogin = cookie1.v_id_dono 
    var retorno = [ ] 
	if (typeof idLogin === 'undefined' || idLogin == 0 || idCalc == 0) { return []; }

    var q0 = `SELECT id, id_login FROM atualizacaoMonetaria WHERE id=${idCalc} `
    // console.log(q0)
	var [res1] = await conCalculos.promise().query(q0)

	if (res1.length > 0) { //  && (res1[0].id_login == idLogin) && (retorno.permissao =="n")) {
		retorno = [{ id: res1[0].id_login, permissao: "e", assinante: cookie1.v_assinante_atualiza }] 
	} 
	
	// verifica se o cálculo foi compartilhado com ele
	var [res2] = await con.query(`select id, id_login, tipo_acesso from atualiza_share where id_calc=${idCalc} `)
		
	for (var i in res2) {
		retorno.push({id: res2[i].id_login, permissao: res2[i].tipo_acesso, assinante: cookie1.v_assinante_atualiza  })
	}

    return retorno 
}

app.get('/atualizaExtra/ping',  function(req, res) {
	res.send('{ok:1,programa:"extra.js"}')
})


app.get('/atualizaExtra/copiar/:id', async function(req, res) {
	var id = req.params.id
	var c = cookie_uncrypt( req.cookies['c_v_app'] ) 

	var permissao1 = await permissoes_ativas( id, c )
    console.log('copiando cálculo '+id)
	if (permissao1.length > 0 && permissao1[0].novoId) {
		res.send('calculo inexistente')
		return; 
	}
	var p1 = permissao1.find( x => x.id == c.v_id_dono )

	if (typeof p1 === 'undefined' || p1 == null) {
		// console.log('sem permissão para acessao o cálculo')
		res.send( {sucess:0,erro: 'sem permissão para acessao o cálculo'} )
		return;
	}

	conCalculos.query(`SELECT * FROM atualizacaoMonetaria WHERE id='${id}'`, 
		function(err, results, campos) {
			if (err) {	console.log(err); res.send({success:0});  return; }

			var nome = 'Cópia de '+results[0].nome
			var idMultiusuario = results[0].id_multiusuario
			var agora1 = agora_yyyymmdd().substring(0,12)
			var idLogin = results[0]['id_login'] 
			var n_origem = parseInt(id / 1500)
			var pasta_origem = pasta_env + '/' + n_origem.toString() 

			var q1 = `INSERT INTO atualizacaoMonetaria (nome,tipo,id_login, diahora, id_multiusuario, ativo)  values ('${nome}', 'A3', ${idLogin}, '${agora1}', '${idMultiusuario}', 1) `
			// console.log(q1)
			conCalculos.query(q1, 
				function(err2, results2) {
					var novoCalculoId = results2.insertId
					var n_destino = parseInt(novoCalculoId / 1500)
					var pasta_destino = pasta_env + '/' + n_destino.toString() 

					var nomearq_origem  = pasta_origem + '/'+id+'.a3'
					var nomearq_destino = pasta_destino + '/'+novoCalculoId+'.a3'

					if (!fs.existsSync(pasta_destino)) {
						fs.mkdirSync(pasta_destino);
					}

					fs.readFile(nomearq_origem, 'utf8', (err, dados) => {
						if (err) {
						  console.log('erro ao ler o arquivo para copia-lo: '+id)
						//   console.error(err);
						//   res.send('{success:0}')
						  return;
						}
						var json_dados = calcUtil.JSON_parseAutoCorrige(dados) 
						if (typeof json_dados === 'undefined') {
							// res.send('{success:0}')
							return;						
						}
						if (typeof json_dados.info === 'undefined') {
							// res.send('{success:0}')
							return;						
						}
						json_dados.info.nome = nome
						json_dados.info.idCalc = novoCalculoId
						dados = JSON.stringify(json_dados)
				
						fs.writeFile(nomearq_destino, dados, function (err) {
							if (err){
								console.log('erro ao ler o arquivo para copia-lo')
								res.send('erro escrita arquivo')
								console.log(err);
								return;
							}  
						});
					})
				}
			)
		}
	);

	res.send({success:1})
});

function formataN(n) {
	var x = Number(n)
	return  (x<10) ? '0'+x.toString() : x.toString()
}

function  agora() {
	var currentdate = new Date(); 
	return  formataN(currentdate.getDate()) + "/"
					+ (formataN(currentdate.getMonth()+1))  + "/" 
					+ formataN(currentdate.getFullYear()) + " "  
					+ formataN(currentdate.getHours()) + ":"  
					+ formataN(currentdate.getMinutes()) + ":" 
					+ formataN(currentdate.getSeconds());
}

function  agora_yyyymmdd() {
	var currentdate = new Date(); 
	return  formataN(currentdate.getFullYear()) +
	         formataN(currentdate.getMonth()+1) + 
			 formataN(currentdate.getDate())  +
			 formataN(currentdate.getHours())  +
			  formataN(currentdate.getMinutes()) +  
			 formataN(currentdate.getSeconds());
}


server.listen(porta_api, () => {
  console.log('Debit Atualiza Extra Functions v.2024 / porta: '+ porta_api);
});


function formataN(n) {
	var x = Number(n)
	return  (x<10) ? '0'+x.toString() : x.toString()
}

function cookie_uncrypt(cookie_criptografado) {
	const key = process.env.cookie_key 	
	const interacoes = 481 //!IMPORTANTE: deixar igual ao php no verifica login
	const Encryption = require('./Encryption.js')
	const encryption = new Encryption()
	const cookie_descriptografado = encryption.decrypt(cookie_criptografado, key, interacoes)
	cookie = JSON.parse(cookie_descriptografado)
	return cookie;
}
