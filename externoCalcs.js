var porta_api = 3101

const fs = require('fs')
const calcUtil = require('./calcUtil.js');
require('dotenv').config()  
const crypto = require('crypto')

var http = require('http');
var express = require('express');
var cors = require('cors')
var bodyParser = require('body-parser')
// var jsonParser = bodyParser.json()
var cs1 = require('./calc.js')
var calcServer = new cs1() 
var pasta_env = process.env.pasta_calculos


var qs = require('querystring')
var cookieParser = require('cookie-parser');

const randomstring = require("randomstring");

const cors1 = {
    origin: "https://app.debit.com.br",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}

var mysql_senha = process.env.MYSQL_password
if (process.env.MYSQL_host == "localhost") {
	cors1.origin = "http://app.fastbet.win"
} 
else {
	mysql_senha = mysql_senha+"#";
}

const allowedDomains = ['https://debit-www6.pages.dev','http://fastbet.win', 'http://calcs.fastbet.win', 'https://calcs.debit.com.br',
                        'http://app.fastbet.win', 'https://app.debit.com.br',
						'http://www.fastbet.win', 'https://www.debit.com.br', 'https://debit.com.br',
					];

// Middleware para configurar CORS com múltiplos domínios
const corsOptionsDelegate = function (req, callback) {
  let corsOptions= {
    methods: 'GET,POST',
    credentials: true
  }
  console.log(req.header('Origin'))
  
  if (allowedDomains.indexOf(req.header('Origin')) !== -1) {
    // console.log('entrou')
    corsOptions.origin =true; // Permitir domínio na lista
  } else {
    // console.log('nao permitiu')
    corsOptions.origin= false ; // Bloquear domínios não permitidos
  }
  callback(null, corsOptions);
};



const mysql = require('mysql2')  
var mysql_info = {host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: mysql_senha, database: process.env.MYSQL_database }

var con = null 
var con2 = null 

var app = express();
// console.log(cors1)
// app.use(cors(  cors1 ))
app.use(cors(  corsOptionsDelegate ))
// console.log( corsOptionsDelegate() )
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
var axios = require('axios');
const calc = require('./calc.js');

function sanitizeInput(value) {
    if (typeof value === 'string') {
        return value.replace(/[^\w.@-]/g, '').trim();
    }
    return value;
}



const dicionarioTabelas = {
	'igpm': 16,
	'ipca': 17,
	'igp': 3,
	'poupanca': 6,
	'salariominimo': 8,
	'tr': 10,
	'tjsp': 11,
	'dolar': 13,
	'inpc': 18,
	'selic': 23,
	'euro': 35,
	'ipcae': 45,
	'tst': 61,
	'ivar': 96,
	'incc': 28
}


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


var handleDisconnect = function() {
	con =   mysql.createPool(mysql_info).promise()

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

// var mysql_info2 ={
//     host: process.env.awsMYSQL_host, 	
//     user: process.env.awsMYSQL_user,	
//     password: process.env.awsMYSQL_password, 
//     database:  'calculos' }
var mysql_info2 = {host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: mysql_senha, database: 'calculos' }
var conCalculos = mysqlDisconnect(mysql_info2)


app.get('/externoCalcs/listaTabelas',  cors( cors1 ), function (req, res) {
	var c = req.cookies['c_v_app']
	res.send(calcServer.listaTabelas.filter( e => e.ativo_novo_atualiza == 1 ))
})

app.get('/externoCalcs/ping',  function(req, res) {
	console.log('ping')
	res.send('{ok:1,programa:"externoCalcs.js"}')
})


app.post('/externoCalcs/variacao',  async function(req, res) {
	var rCompacto = req.body
	console.log(JSON.stringify( req.body) ) 

	var indiceAtualizacao = dicionarioTabelas[req.body.indiceAtualizacao];
	var dataInicio = req.body.dataInicio;
	var dataFim = req.body.dataFim
	var dataFim2 = calcUtil.somaMes( req.body.dataFim )

	if (!indiceAtualizacao) {
		res.json({erro: 'indiceAtualizacao não existe'})
		return;
	}

	if (calcUtil.dia2yyyymmddInt( dataFim ) >  parseInt(calcServer.listaTabelas[ indiceAtualizacao ].maximo )) {  rCompacto.dataFimErro = true; }
	if (calcUtil.dia2yyyymmddInt( dataInicio ) <  parseInt(calcServer.listaTabelas[ indiceAtualizacao ].inicio ))  {  rCompacto.dataInicioErro = true; }

	var calcBase = await calcServer.a_perc(dataInicio, 100, dataFim2, indiceAtualizacao)
	rCompacto.resultado = calcBase.resultado - 100
	console.log(rCompacto)
	res.json(rCompacto)
})


app.post('/externoCalcs/salvarAtualiza',  async function(req, res) {
	console.log(JSON.stringify( req.body) ) 

       var email = sanitizeInput(req.body.email);
       var localizador = sanitizeInput(req.body.localizador);
       var idLogin = 0

       var q = 'SELECT id FROM login WHERE email = ?'
       var [ dadosLogin ] = await con.execute(q, [email])

       var q = 'SELECT * FROM api_calcs WHERE localizador = ?'
       var [ dadosCalculo ] = await con.execute(q, [localizador])

	if ( dadosLogin.length <= 0) {
		// criar login e descobrir o idLogin
		var senha = randomstring.generate({ length: 8, charset: 'alphabetic' });
		let md5_senha2 = crypto.createHash('md5').update(senha).digest("hex")
		let ativacao = randomstring.generate({ length: 4, charset: 'numeric' });
		let hash_ativacao = crypto.createHash('md5').update(ativacao).digest("hex")

               q = 'INSERT INTO login (nome, email, login, senha, telefone, contador, diacadastro, ativacao, hash_ativacao, ativo, id_atendente_crm, endpoint_atua, revendedor) VALUES (?,?,?,?,?,0, now(), ?, ?, 0, 0, 1, 10)';
               var [resultadoInsert] = await con.execute(q, [email, email, email, md5_senha2, '', ativacao, hash_ativacao])
		idLogin = resultadoInsert[0].insertId

		var substituicoes = {
			'login': email,
			'senha': senha,
			'ativacao': ativacao,
			'link_ativacao_cadastro': `https://debit.com.br/menu/ativacao20.php?cod2=${hash_ativacao}&id=${idLogin}` 
		}
		const dados = {
				// 'id_login': 0,
				'email': email,
				'id_modelo': 115,
				'momento_agendado': 0,
				'substituicoes': JSON.stringify(substituicoes),
				'programa_insercao': 'externoCalcs.js-1'
			}

		// console.log(	process.env.servidorGeralAPI + '/email/agenda_email')
		// console.log( dados )
		axios.post(	process.env.servidorGeralAPI + '/email/agenda_email', dados,{	headers: { 'Origin': process.env.servidorGeralAPI }	})  

	} else {
		var idLogin = dadosLogin[0].id
		const dados = {
			'id_login': idLogin,
			'id_modelo': 116,
			'momento_agendado': 0,
			'substituicoes': JSON.stringify({}),
			'programa_insercao': 'externoCalcs.js-2'
		}
		axios.post(	process.env.servidorGeralAPI + '/email/agenda_email', dados,{	headers: { 'Origin': process.env.servidorGeralAPI }	})
	}

	// criar o calculo no lista
	var agora1 = agora()
       var q = 'INSERT INTO atualizacaoMonetaria (nome,tipo, login,id_login, diahora, id_multiusuario, ativo) VALUES (?,?,?,?,?,0,1)';
       var idCalc = 0
       var [resultadoInsert] = await conCalculos.promise().execute(q, ['Cálculo feito externo', 'A3', email, idLogin, agora1])
	idCalc = resultadoInsert[0].insertId

	// pega o id do calculo e grava no atualiza
	var calc2 = JSON.parse(dadosCalculo[0].dados)
	var calc1 = preparaCalcBase( dicionarioTabelas[ calc2.indiceAtualizacao ], calc2.dataAtualizacao, calc2.lista)
	salvarCalc( calc1, idCalc)

	res.send('{sucesso:1}') 
})



app.post('/externoCalcs/atualiza',  async function(req, res) {
	console.log(req.body) 

	var indiceAtualizacao = dicionarioTabelas[req.body.indiceAtualizacao];
	var dataAtualizacao = req.body.dataAtualizacao;
	var lista = req.body.lista;
	var localizador = req.body.localizador
	var d = JSON.stringify( req.body) 
	var diahora = agora() 

	if (!indiceAtualizacao) {
		res.json({erro: 'indiceAtualizacao não existe'})
	}

       if (localizador) {
               var q = 'update api_calcs SET dados=? WHERE localizador = ?'
               await con2.promise().execute(q, [d, localizador])
       } else {
               localizador = randomstring.generate({ length: 16, charset: 'alphabetic' });
               var q = 'insert into api_calcs (diahora, localizador, tipo, id_login, dados) values (?,?,?,?,?)'
               await con2.promise().execute(q, [diahora, localizador, 'atual', 0, d])
       }

	var calcBase = preparaCalcBase( indiceAtualizacao, dataAtualizacao, lista )
	var resultado = await calcServer.atualiza(calcBase, false, -1, true )
	// var resultado = await calcServer.atualiza(calcBase)

	var rCompacto = req.body

	if (resultado.info.diaAtualizacaoErro != '') {
		rCompacto.success = 0 
		rCompacto.diaAtualizacaoErro = resultado.info.diaAtualizacaoErro
	}

	var somaSimples  = 0
	for (var i in resultado.lista) {
		if (resultado.lista[i].diaErro) {
			rCompacto.success = 0 
			rCompacto.lista[i].diaErro = resultado.lista[i].diaErro
			rCompacto.lista[i].resultado = 0
		} else {
			rCompacto.lista[i].resultado = resultado.lista[i].resultado_atualizacao
			somaSimples += resultado.lista[i].resultado_atualizacao
		}
	}

	if (somaSimples == 0) {
		rCompacto.valorErro =  'Todos os valores estão zerados'
		res.json({erro: 'Todos os valores estão zerados'})
		return;
	}

	rCompacto.resultado = resultado.info.soma_final
	rCompacto.localizador = localizador
	// console.log(rCompacto)
	res.json(rCompacto)
})



function preparaCalcBase( indiceAtualizacao, dataAtualizacao, lista) {
	var calcBase = { 
		info: {
			dia_atualiza: dataAtualizacao,
			diaAtualizacaoErro: '',
			indexador: indiceAtualizacao, 
			calc_modo_impressao: 'e',
			calc_jurosm: false,
			calc_jurosc: false,
			calc_multa: false,
			calc_honorarios: false,
			calc_custas: false,
			calc_ordem: false,
			calc_perc_prorata: '0',
			calc_perc_indice_neg:  '1',
			modo_indexador: 'um',
			multi_interno: false,
			sucumbencias: { modo: 'p', valor: 10 },
			juros_moratorios: {modo: 's',percentual: '1',tipo_calculo: 's',pro_rata: 0,a_partir: 'vencimento',data_citacao: '',juros_detalhado: [ ] },
			multa: { percentual: '2', tipo_calculo: 'p', multa_sobre_juros: false, multa_valor_vincendo: false, multa_sobre_valor_original: false },
			honorarios: { modo: 'p', valor: 10 }
		},
		lista: [ ],
	} 

	var x = 1	
	var somaSimples = 0 
	for (var i in lista) {
		calcBase.lista.push( { id: x++, dia: lista[i].dia, valor: lista[i].valor, desc: "", custas: false} )
		somaSimples += lista[i].valor
	}
	return calcBase
}


salvarCalc = function ( calc1, idCalc ) {
	console.log('calc1', calc1)

	var dados = {
    	info: calc1.info,
    	lista: calc1.lista
    }
	dados.info.nome = 'Cálculo feito sem login'
	dados.info.idCalc = idCalc 
	
	var j_dados = JSON.stringify(dados) 

    var n = parseInt(idCalc / 1500)
    var pasta = pasta_env + '/' + n 
    var nomearq = pasta + '/'+ idCalc + '.a3'

    // verifica se a pasta existe 
    if (!fs.existsSync(pasta)) {
        fs.mkdirSync(pasta);
    }
	console.log('salvando arquivo: ', nomearq)
	console.log('j_dados: ', j_dados)
	try {
		fs.writeFileSync(nomearq, j_dados);
	} catch (err) {
		console.log(err);
	}
}

app.get('/externoCalcs/getAtualiza/:localizador', cors( cors1 ), async function(req, res) {
       var localizador = sanitizeInput(req.params.localizador)
       var q = 'SELECT * FROM api_calcs WHERE localizador = ?'

       var [ dados ] = await con.execute(q, [localizador])
	var d = JSON.parse(dados[0].dados)

	var indiceAtualizacao = dicionarioTabelas[ d.indiceAtualizacao ];
	var dataAtualizacao = d.dataAtualizacao;
	var lista = d.lista;

	var calcBase = preparaCalcBase( indiceAtualizacao, dataAtualizacao, lista )
	var resultado = await calcServer.atualiza(calcBase)
	var rCompacto = d 

	if (resultado.info.diaAtualizacaoErro != '') {
		rCompacto.success = 0 
		rCompacto.diaAtualizacaoErro = resultado.info.diaAtualizacaoErro
	}


	for (var i in resultado.lista) {
		if (resultado.lista[i].diaErro) {
			rCompacto.success = 0 
			rCompacto.lista[i].diaErro = resultado.lista[i].diaErro
			rCompacto.lista[i].resultado = 0
		} else {
			rCompacto.lista[i].resultado = resultado.lista[i].resultado_atualizacao
		}
	}

	rCompacto.resultado = resultado.info.soma_final
	rCompacto.localizador = localizador 
	console.log(rCompacto)
	res.json(rCompacto)
})


server.listen(porta_api, () => {
  console.log('Debit Cálculos Externos Server v.2023: '+ porta_api);
});


function formataN(n) {
	var x = Number(n)
	return  (x<10) ? '0'+x.toString() : x.toString()
}


function  agora() {
	var currentdate = new Date(); 
	return  `${formataN(currentdate.getFullYear())}${formataN(currentdate.getMonth()+1)}${formataN(currentdate.getDate())}${formataN(currentdate.getHours())}${formataN(currentdate.getMinutes())}` 
}



