var porta_api = 3009
var nserver = '' 

var conversorTJ = []
conversorTJ[ 47 ] = 3939
// conversorTJ[ 11 ] = 4462
conversorTJ[ 79 ] = 4963
conversorTJ[ 55 ] = 1634
conversorTJ[ 85 ] = 4961
conversorTJ[ 200 ] = 1001
conversorTJ[ 201 ] = 1006
conversorTJ[ 202 ] = 1007
conversorTJ[ 203 ] = 1005


if (process.argv.length > 2) {
	nserver = process.argv[2] 
	porta_api = parseInt(nserver) + 3050 
}


// require('events').EventEmitter.prototype._maxListeners = 100;
const fs = require('fs')
const fs2 = require('fs').promises
const calcUtil = require('./calcUtil.js');

var http = require('http');
var express = require('express');
var cors = require('cors')

var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
// var urlencodedParser = bodyParser.urlencoded({ extended: false })

var cs1 = require('./calc.js')
var calcServer = new cs1() 

require('dotenv').config()  
var qs = require('querystring')

const PDFDocument = require("./pdfkit-tables");
var cookieParser = require('cookie-parser');
// let arqLog = fs.createWriteStream( process.env.pasta_log + '/log-atualiza.txt');
var pasta_env = process.env.pasta_calculos
const servidorAPI = process.env.servidorAPI

const calcPDF = require('./calcPDF.js');
// const calcHTML = require('./calcHTML.js');
const calcHTML = require('./atualizaHTML_v3_1.js');

var socketList = [] 

// const cors1 = {
//     origin: "https://atualiza.debit.com.br",
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     credentials: true
// }

var mysql_senha = process.env.MYSQL_password
var caminho = '/w'+porta_api;

if (process.env.MYSQL_host != "localhost") {
	mysql_senha = mysql_senha+"#";
}
const mysql = require('mysql2')  
var mysql_info = {host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: mysql_senha, database: process.env.MYSQL_database, multipleStatements: true,    waitForConnections: true,    connectionLimit: 10,    queueLimit: 0 }

var con2 = null 



const allowedDomains = ['http://fastbet.win', 'https://www.debit.com.br', 'http://calcs.fastbet.win', 
                        'https://calcs.debit.com.br','http://www.fastbet.win',"http://atualiza.fastbet.win",
                        'http://calculadoras.fastbet.win', 'https://calculadoras.debit.com.br', "https://atualiza.debit.com.br",
                        'http://calculadoras2.fastbet.win', 'https://calculadoras2.debit.com.br',
                        'http://app.fastbet.win', 'https://app.debit.com.br', 'https://api.debit.com.br',
                        'http://api.fastbet.win', 'http://atualiza.arquivosjuridicos.win', 'https://atualiza.arquivosjuridicos.com'  ];

// Middleware para configurar CORS com múltiplos domínios
const corsOptionsDelegate = function (req, callback) {
  let corsOptions= {
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
  }

  if (allowedDomains.indexOf(req.header('Origin')) !== -1) {
    // console.log('entrou')
    corsOptions.origin =true; // Permitir domínio na lista
  } else {
    // console.log('nao permitiu')
    corsOptions.origin= false ; // Bloquear domínios não permitidos
  }
  callback(null, corsOptions);
};






var app = express();
// app.use(cors(  cors1 ))
app.use(cors( corsOptionsDelegate ));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
var axios = require('axios');
var urlRenomeiaCalc =  process.env.urlRenomeiaCalc 
var urlLogoInfo =  process.env.urlLogoInfo 

//socket
const { Server } = require("socket.io");
if (!caminho) {
	// var io_var = { cors: cors1, cookie: true } 
	var io_var = {  cookie: true }
} else {	
	// var io_var = { cors: cors1, cookie: true, path: caminho, pingTimeout: 180000 } 
	var io_var = {  cookie: true, path: caminho, pingTimeout: 180000 } 
}
const io = new Server(server, io_var);

var calc = {}  


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


var grava_log = function(id_calc, comando, dados) {
	var dados1 = JSON.stringify(dados)
	var s0 = agora()+` ${id_calc} ${comando} ${dados1}`
	var s1 = agora()+` ${id_calc} ${comando} ${dados1}\n` 
	console.log(s0)
	// arqLog.write(s1)
}

resetCalc = function(id, infoUsuario) {
	var dAtual = calcServer.listaTabelas[ 16 ]
	var dia_atualiza = calcUtil.yyyymmdd2dia(dAtual.maximo.toString() )

	calc[ id ] = { 
		info: {
			idCalc: id, 
			nome: 'Novo cálculo',
			dia_atualiza,
			diaAtualizacaoErro: '',
			indexador: 16, // igp-m 
			calc_modo_impressao: 'e',
			calc_abater_valores: false,
			calc_jurosm: false,
			calc_jurosc: false,
			calc_multa: false,
			calc_honorarios: false,
			calc_custas: false,
			calc_ordem: false,
			calc_perc_prorata: '0',
			calc_perc_indice_neg:  '1',
			ultimoID: 2, // o calculo inicia com 2 valores zerados
			modo_indexador: 'um',
			multi_interno: false,
			sucumbencias: { modo: 'p', valor: 10 },
			multa523: {
				valor_atualizado: true,
				juros_moratorios: false,
				juros_compensatorios: false,
				multa: false,
				honorarios: false,
				sucumbencias: false,
				custas: false
			  },
			  juros_moratorios: {
				modo: 's',
				percentual: '1',
				tipo_calculo: 's',
				pro_rata: 0,
				a_partir: 'vencimento',
				data_citacao: '',
				juros_detalhado: [
					{ inicio: '', fim: '', percentual: 0, tipo: 's'},{ inicio: '', fim: '', percentual: 0, tipo: 's'},
					{ inicio: '', fim: '', percentual: 0, tipo: 's'},{ inicio: '', fim: '', percentual: 0, tipo: 's'} 
				  ]
			  },
			  juros_compensatorios:{
				modo: 's',
				percentual: '1',
				tipo_calculo: 's',
				pro_rata: 0,
				a_partir: 'vencimento',
				data_citacao: '',
				juros_detalhado: [
					{ inicio: '', fim: '', percentual: 0, tipo: 's'},{ inicio: '', fim: '', percentual: 0, tipo: 's'},
					{ inicio: '', fim: '', percentual: 0, tipo: 's'},{ inicio: '', fim: '', percentual: 0, tipo: 's'} 
				  ]
			  },
			  custas: {
				juros_moratorios: false,
				juros_compensatorios: false,
				multa: false,
				honorarios: false,
				ncpc: false,
				selic: false
			  }, 
			  multa: { percentual: '2', tipo_calculo: 'p', multa_sobre_juros: false, multa_valor_vincendo: false, multa_sobre_valor_original: false },
			  honorarios: { modo: 'p', valor: 10 },
			  metodologia_h523: "2",
			  honorarios523_a_parte: false
		},
		lista: [  
			{ id: 1, dia: "", valor: 0, desc: "", custas: false} ,
			{ id: 2, dia: "", valor: 0, desc: "", custas: true}  
		],
		permissoes: [   ]  
	} 

}

efetuar_calculo = async function ( c1, permissao, comMemoria = false, nLinha = -1, assinante_liberado = false ) {
	if (typeof c1 === 'undefined') { return { erro: "c1 não definido" } }
	// console.log('efetuar_calculo assinante_liberado', assinante_liberado)
	var a = await calcServer.atualiza(c1, comMemoria, nLinha, assinante_liberado)

	// isso acontece quando o usuário esta alterando entre índices normais e personalizados
	// pode ser que o cálculo não possa ser concluído até outras variáveis estarem atualizadas 
	if (typeof a === 'undefined') { return { nao_enviar: true } }
	if (a == null) { a = {} }

	if (typeof permissao !== 'undefined') {
		a.permissao = permissao.permissao
		a.assinante = permissao.assinante
		a.permissoes = null 
	}

	return a 
}


permissoes_ativas = async function  (idCalc, cookie1, idMultiusuario = 0) {
    // retornos
    // editar - e
    // visualizar - v

	var idLogin = cookie1.v_id_dono 
    var retorno = [ ] 
	if (typeof idLogin === 'undefined' || idLogin == 0) { return []; }

	if (idCalc == 0) {
		var agora1= agora_yyyymmdd()
		agora1 = agora1.substring(0,12)
		// console.log('agora1: ', agora1)
		
               var q1 = 'INSERT INTO calculos.atualizacaoMonetaria (nome,tipo,id_login, diahora, id_multiusuario, ativo)  values (?, ?, ?, ?, ?, 1)'
               var [res2] = await con2.promise().execute(q1, ['Novo cálculo', 'A3', idLogin, agora1, idMultiusuario])
		idCalc = res2.insertId
		retorno = [{ id: idLogin  , permissao: "e", novoId: idCalc }] 
		return retorno
	}

    var q0 = 'SELECT id, id_login FROM calculos.atualizacaoMonetaria WHERE id=?'
        var [res1] = await con2.promise().execute(q0, [idCalc])

	if (res1.length > 0) { //  && (res1[0].id_login == idLogin) && (retorno.permissao =="n")) {
		retorno = [{ id: res1[0].id_login, permissao: "e", assinante: cookie1.v_assinante_atualiza }] 
	} 
	
	// verifica se o cálculo foi compartilhado com ele
        var qShare = 'select id, id_login, tipo_acesso from atualiza_share where id_calc=?'
        var [res2] = await con2.promise().execute(qShare, [idCalc])
		
	for (var i in res2) {
		retorno.push({id: res2[i].id_login, permissao: res2[i].tipo_acesso, assinante: cookie1.v_assinante_atualiza  })
	}

    return retorno 
}


app.post('/s'+porta_api.toString()+'/salvaIndiceMesclado', jsonParser, async function (req, res) {
	var id = req.body.id;
	var nome = req.body.nome;
	var indices = req.body.indices
	var idCalc = req.body.idCalc;
	var c = cookie_uncrypt( req.cookies['c_v_app'] , req.headers ) 
	var id_login = c.v_id_dono 

	grava_log(idCalc, '/atualiza/salvaIndiceMesclado', req.body)

	if (typeof calc[idCalc] === 'undefined'  || calc[idCalc] ==null) {
		console.log('+++++ erro ++++ cálculo não carregado: ', idCalc)
		res.send( { status: 'erro' } )
		return;
	}

	if (nome == '') { nome = 'novo índice mesclado' }

	var existeIndice = false 
	for (var i in indices) {
		if (indices[i].id) {
			existeIndice = true
		}
	}

	if (!existeIndice) { res.send( { status: 'ok' } ); return; }

	if (!id) {
		var q = `INSERT INTO composicao_indice (nome, dados_json, lixo, id_login) VALUES ('${nome}', '${JSON.stringify(indices)}', '0', ${id_login})` 
	} else {
		var q = `UPDATE composicao_indice SET nome = '${nome}', dados_json = '${JSON.stringify(indices)}' WHERE id = ${id}`
	}

	// console.log(q)

	calc[ idCalc ].info.multi_interno = false 
	calc[ idCalc ].info.modo_indexador = "multi"
	calc[ idCalc ].info.multiIndexador = {
		nome: nome,
		indices: indices,
		id: id
	}

	var [res3] = await con2.promise().query(q)

	if (id) {
		calc[ idCalc ].info.multiIndexador.id = id
 	} else { 
		calc[ idCalc ].info.multiIndexador.id = res3.insertId 
	}
	salvarCalc( idCalc )
	
	res.send( { status: 'ok' } )
})

app.get('/atualiza/listaTabelasAtualiza',   async function (req, res) {
	let c = cookie_uncrypt( req.cookies['c_v_app'] , req.headers )
	console.log(c)
	let id_dono = c.v_id_dono 
	let r = calcServer.listaTabelas.filter( e => e.ativo_novo_atualiza == 1 )

	if (id_dono) {
		let q = `SELECT id, nome FROM calculos.tabelasJudiciais WHERE (tabAtualiza=1 or id_login = ${id_dono}) AND lixo=0`
		console.log(q)
		let [res1] = await con2.promise().query(q)

		for (let i in res1) {
			r.push( { indice: res1[i].id+1000, nome: res1[i].nome, calculo: 'tabelasJudiciais', ativo_novo_atualiza: 1 } )
		}
	}

	res.send(r)
})


app.get('/atualiza/listaTabelas',  async function (req, res) {
	let c = cookie_uncrypt( req.cookies['c_v_app'], req.headers  )
	console.log(c)
	let id_dono = c.v_id_dono 
	let r = calcServer.listaTabelas.filter( e => e.ativo_novo_atualiza == 1 )

	if (id_dono) {
		let q = `SELECT id, nome FROM calculos.tabelasJudiciais WHERE (tabGlobal=1 or id_login = ${id_dono}) AND lixo=0`
		// let q = `SELECT id, nome FROM calculos.tabelasJudiciais WHERE tabGlobal=1 AND lixo=0`
		console.log(q)
		let [res1] = await con2.promise().query(q)

		for (let i in res1) {
			r.push( { indice: res1[i].id+1000, nome: res1[i].nome, calculo: 'tabelasJudiciais', ativo_novo_atualiza: 1 } )
		}
	}

	res.send(r)
})

app.get('/atualiza/listaTabelasMescladas',   async function (req, res) {
	let c = cookie_uncrypt( req.cookies['c_v_app'], req.headers  )
	let id_dono = c.v_id_dono 

	let q = `SELECT id, nome, dados_json as dados FROM composicao_indice WHERE id_login = ${id_dono} AND modocalc="" AND lixo=0 ORDER BY nome`
	let [res1] = await con2.promise().query(q)
	res.send(res1)
})


app.get('/atualiza/listaTabelasPersonalizadas',  async function (req, res) {
	var c = cookie_uncrypt( req.cookies['c_v_app'], req.headers  )
	var id_dono = c.v_id_dono 
	// console.log('listaTabelasPersonalizadas', c)

	var q = `SELECT id, nome FROM composicao_indice WHERE id_login = '${id_dono}' AND modocalc="p" AND lixo=0 ORDER BY nome`
		
	var [res1] = await con2.promise().query(q)
	res.send(res1)
})


app.get('/atualiza/infoUsuario',  function (req, res) {
	let c = req.cookies['c_v_app']
	// console.log('infoUsuario', c)
	res.send(cookie_uncrypt(c, req.headers ))
})


app.get('/atualiza/criar',  async function (req, res) {
	// console.log('/atualiza/criar')
	let c = cookie_uncrypt( req.cookies['c_v_app'], req.headers )
	// console.log(c)
	let id_dono = c.v_id_dono
	let id_multiusuario = 0
	// if (c.v_id_multiusuario) id_multiusuario = c.v_id_multiusuario 
	if (c.v_usuario_logado) id_multiusuario = c.v_usuario_logado 
	
	if (typeof id_dono === 'undefined' || id_dono == 0) {
		res.send({idCalc: 0, msg: 'usuário não identificado'})
		return;
	}

	let agora1= agora_yyyymmdd()
	agora1 = agora1.substring(0,12)	
	let q1 = `INSERT INTO calculos.atualizacaoMonetaria (nome,tipo,id_login, diahora, id_multiusuario, ativo)  values ('Novo cálculo', 'A3', ${id_dono}, '${agora1}', '${id_multiusuario}', 1) `

	let [res2] = await con2.promise().query(q1)
	res.send({idCalc: res2.insertId})
})

app.get('/s'+porta_api.toString()+'/lista_todos_calc',   function (req, res) {

	var l  = "<html><h1>Debit Atualiza</h1><br />"
	var l = l + "<table style='padding: 10px; border: 1px solid grey;'>"
	for (c in calc) {
		if (calc[c] != null) {
			l = l+ "<tr><td>" + c + "</td></tr>"
		}
	}

	var l = l+ "</table>"
	res.send(l)
})

app.get('/s'+porta_api.toString()+'/ping',  function(req, res) {
	res.send('{ok:1,programa:"atualiza.js",nserver:'+nserver+'}')
})

app.get('/atualiza/ping',  function(req, res) {
	res.send('{ok:1,programa:"atualiza.js - nao usar mais"}')
})


app.get('/s'+porta_api.toString()+'/pdf/:id', async function(req, res) {
	var id = req.params.id
	var c = cookie_uncrypt( req.cookies['c_v_app'] , req.headers ) 

	if (typeof calc[ id ] === 'undefined' || calc[id] == null ) {
		le_arquivo( id, function (res2) {
			// calc[id].permissoes = permissao1
		}) 
		res.send('acesse o site www.debit.com.br, faça seu login para ver este cálculo');
		return;
	} 

	var permissao1 = await permissoes_ativas( id, c)
	if (permissao1.length > 0 && permissao1[0].novoId) {
		res.send('calculo inexistente')
		return; 
	}
	var p1 = permissao1.find( x => x.id == c.v_id_dono )

	if (typeof p1 === 'undefined' || p1 == null) {
		console.log('sem permissão para acessao o cálculo')
		res.send( {sucess:0,erro: 'sem permissão para acessao o cálculo'} )
		return;
	}

	var id = req.params.id

	try {
		var logoInfoTemp = await axios.get(urlLogoInfo+'?id='+c.v_id_dono)
		var logoInfo = logoInfoTemp.data

	} catch	(err) {
		console.log('erro ao abrir o logo no axios. id_Calc')
		var logoInfo = 'sem_logo'
	}
	
	// var logoInfo = logoInfoTemp.data

	var myDoc = new PDFDocument({
		bufferPages: true, 
		autoFirstPage: false, 
		logoInfo
	});

	let buffers = [];
	myDoc.on('data', buffers.push.bind(buffers));
	myDoc.on('end', () => {
		let pdfData = Buffer.concat(buffers);
		res.writeHead(200, {
		'Content-Length': Buffer.byteLength(pdfData),
		'Content-Type': 'application/pdf'})
		.end(pdfData);
	});

	calcPDF.montaCalc( myDoc, await efetuar_calculo( calc[ id ], p1, true, -1, c.v_assinante_atualiza)  ) 
});

app.get('/s'+porta_api.toString()+'/xxxxxduplicar/:id', async function(req, res) {
	var id = req.params.id
	var c = cookie_uncrypt( req.cookies['c_v_app'] , req.headers ) 

	var permissao1 = await permissoes_ativas( id, c )
	if (permissao1.length > 0 && permissao1[0].novoId) {
		res.send('calculo inexistente')
		return; 
	}
	var p1 = permissao1.find( x => x.id == c.v_id_dono )

	if (typeof p1 === 'undefined' || p1 == null) {
		console.log('sem permissão para acessao o cálculo')
		res.send( {sucess:0,erro: 'sem permissão para acessao o cálculo'} )
		return;
	}

	con2.query(`SELECT * FROM calculos.atualizacaoMonetaria WHERE id='${id}'`, 
		function(err, results, campos) {
			if (err) {	console.log(err); res.send({success:0});  return; }

			var nome = 'Cópia de '+results[0].nome
			var idMultiusuario = results[0].id_multiusuario
			var agora1 = agora_yyyymmdd().substring(0,12)
			var idLogin = results[0]['id_login'] 
			var n_origem = parseInt(id / 1500)
			var pasta_origem = pasta_env + '/' + n_origem.toString() 

			var q1 = `INSERT INTO calculos.atualizacaoMonetaria (nome,tipo,id_login, diahora, id_multiusuario, ativo)  values ('${nome}', 'A3', ${idLogin}, '${agora1}', '${idMultiusuario}', 1) `
			// console.log(q1)
			con2.query(q1, 
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
						  console.log('erro ao ler o arquivo para copia-lo')
						  console.error(err);
						  res.send('{success:0}')
						  return;
						}
						var json_dados = calcUtil.JSON_parseAutoCorrige(dados) 
						if (typeof json_dados === 'undefined') {
							res.send('{success:0}')
							return;						
						}
						if (typeof json_dados.info === 'undefined') {
							res.send('{success:0}')
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

app.get('/s'+porta_api.toString()+'/dump/:idCalc', async function(req, res) {
	var idCalc = req.params.idCalc
	res.send(calc[ idCalc ])
})

app.get('/s'+porta_api.toString()+'/html/:id', async function(req, res) {
	var id = req.params.id
	console.log('/s'+porta_api.toString()+'/html/'+id)
	var c = cookie_uncrypt( req.cookies['c_v_app'] , req.headers ) 

	var permissao1 = await permissoes_ativas( id, c )
	if (permissao1.length > 0 && permissao1[0].novoId) {
		res.send('calculo inexistente')
		return; 
	}
	var p1 = permissao1.find( x => x.id == c.v_id_dono )

	if (typeof p1 === 'undefined' || p1 == null) {
		console.log('sem permissão para acessao o cálculo')
		res.send( {sucess:0,erro: 'sem permissão para acessao o cálculo'} )
		return;
	}

	res.send( calcHTML.montaCalc( await efetuar_calculo(calc[ id ], p1, true, -1, c.v_assinante_atualiza) ))
});

function getCookieFromSocket( handshake ) {
	var cookie1 = handshake + ';'
	p1 = cookie1.indexOf("c_v_app=")
	cookie1 = cookie1.substring(p1+8)
	p1 = cookie1.indexOf(";")
	cookie1 = cookie1.substring(0, p1)
	return cookie1 
}

function addSocketList( s, idCalc, idUsuario) {
	if (typeof socketList[ idCalc ] === 'undefined') {
		socketList[ idCalc ] = []
	}

	var exist = socketList[ idCalc ].find( x => x.id == s.id )
	if (typeof exist === 'undefined') {
		socketList[ idCalc ].push( { id: s.id, idUsuario, s } )
	}
}

function emiteGeral(idCalc, sala, dados, excluir = 0) {
	for (var i in socketList[ idCalc ]) {
		if (socketList[ idCalc ][i].s.connected) {
			if ((excluir == 0) || (excluir != socketList[ idCalc ][i].idUsuario)) {
				socketList[ idCalc ][i].s.emit(sala, dados)
			}	
		} 
	}
}

async function  analiseTabelaTJ( idCalc, idTabelaTJ ) {
	let url1 = `${servidorAPI}/calculosDiversos/tabelaDireta` 
	let dados = {
		completa: true, 
		dataAtual: calc[ idCalc ].info.dia_atualiza, 
		indexador: parseInt( idTabelaTJ )-1000,
		jurosTab: [ { modo: 12, ate: 0 } ],
		modoSelic: 'princJuros',
		calc_selic: false,
		selic_inicio: calc[ idCalc ].info.dia_atualiza // calcUtil.dia2intMesAno( t.v.dataci )            
	}
	
	await axios.post(url1, dados).then( function(r) {
		let resumo = r.data.resumo
		let u = r.data.resumo.length-1
		calc[ idCalc ].info.resumoTJ = resumo  
		calc[ idCalc ].info.indexador = idTabelaTJ
		calc[ idCalc ].info.multi_interno = false 

		if (resumo[u].indexador == 23) { // se for selic
			calc[ idCalc ].info.calc_selic = true
			calc[ idCalc ].info.selic_inicio = '01/'+calcUtil.mesAno2dia(resumo[u].inicio)
		}
	})


}

io.on('connection',  (socket) => {
	var cookie1 = ''

	if ( !socket.handshake.headers.cookie ) {
		// console.log('sem cookie no socket, trocando por whitelabel', socket.handshake.query.authWhiteLabel)
		cookie1 =  socket.handshake.query.authWhiteLabel 
	} else {
		cookie1 = getCookieFromSocket( socket.handshake.headers.cookie )
	}
	cookie1 = qs.unescape(cookie1)
	socket.on('posicao', async (dados) => {
		var c = cookie_uncrypt( cookie1 )
		var idCalc = dados.idCalc
		emiteGeral(idCalc, 'posicao', dados, c.v_id_dono)
	})

	socket.on('load', async (dados) => {
		var idCalc = dados
		var c = cookie_uncrypt( cookie1 )
		if (!c.v_id_dono) { return; }

		var d1= agora_yyyymmdd()
		d1 = d1.substring(0,8)
		con2.query(
			`UPDATE login SET data_ultimo_calculo=${d1} WHERE id='${c.v_id_dono}'`, 
			function(err, results, fields) {
				if (err) {
					console.log(err);
					console.log('---- cookie: ', c)
				}
			}
		  );

		var permissao1 = await permissoes_ativas( idCalc, c, c.v_usuario_logado )
		
		if (permissao1.length > 0 && permissao1[0].novoId) {
			idCalc = permissao1[0].novoId
		}
	
		var p1 = permissao1.find( x => x.id == c.v_id_dono )
	
		if (typeof p1 === 'undefined' || p1 == null) {
			console.log('sem permissão')
			return;
		}

		addSocketList( socket, idCalc, c.v_id_dono )
	
		if (typeof calc[idCalc] === 'undefined'  || calc[idCalc] ==null) {
			le_arquivo( idCalc, async function (res2) {
				calc[idCalc].permissoes = permissao1
				var res_calc = await efetuar_calculo( res2, p1, false, -1, c.v_assinante_atualiza )
				
				if (conversorTJ[res_calc.info.indexador]) {
					await analiseTabelaTJ( idCalc, conversorTJ[res_calc.info.indexador] )
				} 
				socket.emit('calcDump', res_calc )
			})
		} else {
			calc[idCalc].permissoes = permissao1
			socket.emit('calcDump', await efetuar_calculo( calc[ idCalc ], p1, false, -1, c.v_assinante_atualiza ) )
		}

	});

	socket.on('set', async (dados) => {
		// console.log('socket-set', dados)
		var idCalc = dados.idCalc;
		var campo = dados.campo;
		var info = dados.info
		var reenviaPlanilha = true
		var id1 = -1 
		var coo = cookie_uncrypt( cookie1 )
		grava_log(idCalc, campo, info)

		if (typeof calc[idCalc] === 'undefined'  || calc[idCalc] ==null) {
			var permissao1 = await permissoes_ativas( idCalc, coo  )
			if (permissao1.length > 0 && permissao1[0].novoId) {
				idCalc = permissao1[0].novoId
			}
	
			await le_arquivo2( idCalc)
			calc[idCalc].permissoes = permissao1
		}
	
		if (campo == 'reset') {	
			socket.emit('calcDump', await efetuar_calculo( calc[ idCalc ], undefined, false, -1, coo.v_assinante_atualiza ))
			return;
		}
	 
		if (campo == 'info.nome') {
			var params = new URLSearchParams();
			params.append('id_dono', coo.v_id_dono );
			params.append('idCalc', idCalc);
			params.append('nomeCalc', info);

			axios.post(urlRenomeiaCalc, params)
			.catch(function (error) {
				console.log('erro axios processos.js l: 474 - ', urlRenomeiaCalc)
			});			
		}

		if (campo == 'info.indexador') {
			if (info >= 200 & info < 300) {
				calc[ idCalc ].info.multi_interno = true
				calc[ idCalc ].info.modo_indexador = "um"

				var dAtual = calcServer.listaTabelas[ info ] 
				var info2 = dAtual.tabela
				
				var [res2] = await con2.promise().query('SELECT nome, dados_json FROM composicao_indice WHERE id='+info2)

				calc[ idCalc ].info.multiIndexador = { 
					nome: res2[0].nome, 
					indices: JSON.parse(res2[0].dados_json),
					id: info2	
				}

				// --- verifica qual é o maximo da correção
				var id_ultimo_indice = 0
				var pos_ultimo_indice = 0
				for (var i1 in calc[ idCalc ].info.multiIndexador.indices) {
					if (calc[ idCalc ].info.multiIndexador.indices[i1].id >0) {
						id_ultimo_indice = calc[ idCalc ].info.multiIndexador.indices[i1].id
						pos_ultimo_indice = i1 
					}
				}

				q3 = calcServer.listaTabelas[ id_ultimo_indice ]
				calc[ idCalc ].info.multiIndexador.indices[pos_ultimo_indice].fim = calcUtil.yyyymmdd2dia( q3.maximo.toString() )
				// -- fim da verificação do maximo da correção
			} else {
				calc[ idCalc ].info.multi_interno = false
			}

			if (info>=1000 && calc[ idCalc ].modo_indexador == 'um') {
				await analiseTabelaTJ( idCalc, info )
			} else {
				calc[ idCalc ].info.resumoTJ = [] 
			}


		}

		if (campo == 'repetir') {
			// console.log('repetir', info)
			var n_itens = 0

			var i1 = calcUtil.dia2yyyymmddInt( info.info.data_inicial )
			var f1 = calcUtil.dia2yyyymmddInt( info.info.data_final )

			while (i1 <= f1 && n_itens < 300) {
				calc[ idCalc ].lista.push( { 
					id: ++calc[ idCalc ].info.ultimoID, 
					desc: "", 
					dia: calcUtil.yyyymmdd2dia( i1.toString() ), 
					valor: info.info.valor, 
					custas: false 
				} )	

				var i2 = calcUtil.yyyymmdd2dia( i1.toString() )
				if (info.info.tipo == "m") {
					i1 = calcUtil.dia2yyyymmddInt( calcUtil.somaMes( i2 ) )
				} else {
					i1 = calcUtil.dia2yyyymmddInt( calcUtil.somaDia( i2 ) )
				}
				n_itens++ 
				// console.log('adicionando item ', n_itens)
			}
		}

		if (campo) {
			var c = campo.split(".")
	
			if (c[0] == 'info') {
				calc[ idCalc ].info[ c[1] ] = info 
			}
	
			if (c[0] == 'addItemLista') {
				if (calc[idCalc] && calc[idCalc].lista) {
					for (var x1 = 0; x1 < 6; x1++) {
						calc[ idCalc ].lista.push( { id: ++calc[ idCalc ].info.ultimoID, desc: "", dia: "", valor: 0, custas: false } )	
					}
				}
				id1 = 20000000
			}

			if (c[0] == 'addItemListaCustas') {
				if (calc[idCalc] && calc[idCalc].lista) {
					for (var x1 = 0; x1 < 6; x1++) {
						calc[ idCalc ].lista.push( {id: ++calc[ idCalc ].info.ultimoID, desc: "", dia: "", valor: 0, custas: true } )	
					}
				}
				id1 = 20000000
			}
	
			if (c[0] == 'delItemLista') {
				var n = calc[ idCalc ].lista.findIndex( x => x.id == info )
				calc[ idCalc ].lista.splice(n, 1);
				id1 = 20000000
			}	
			
			if (c[0] == 'inverteValor') {
				var n = calc[ idCalc ].lista.findIndex( x => x.id == info )
				if (typeof calc[ idCalc ].lista[n] !== 'undefined') {
					calc[ idCalc ].lista[n].valor *= -1;
				}
				id1 = n
			}	
	 
			if (c[0] == 'multi') {
				if (typeof info.idItem !== 'undefined') {
					var idItem = info.idItem 
					for (var i in info) {
						if (i != 'idItem') {
							calc[ idCalc ].lista[ idItem ][ i ] = info [ i ]
						}
					}
				} else {
					for (var i in info) {
						if (typeof calc[ idCalc ].info[ i ] !== 'undefined') {
							calc[ idCalc ].info[ i ] = info[ i ]
						}
					}
				}
			}
	
	
			if (c[0] == 'lista') {
				var campo1 = c[2]
				id1 = c[1]
	
				if (campo1 == 'valor'){
					info = parseFloat( info )
				} 

				if (campo1 == 'desc') {
					reenviaPlanilha = false
				}

				if (typeof calc[ idCalc] !== 'undefined' && calc[ idCalc] != null && typeof calc[ idCalc].lista !== 'undefined' && typeof calc[ idCalc].lista[id1] !== 'undefined') {
					calc[ idCalc ].lista[ id1 ][ campo1 ] = info  
				} else {
					if (typeof calc[ idCalc].lista === 'undefined' ) {
						calc[ idCalc ].lista = []
					}

					calc[ idCalc ].lista[ id1 ] = { id: id1, desc: "", dia: "", valor: 0, custas: false }
					calc[ idCalc ].lista[ id1 ][ campo1 ] = info

				}
	
			}
	
			salvarCalc( idCalc )
		}
	
		var nLinha1 =  id1 //  (c[0] == 'lista') ? id1 : -1  
		// console.log('l: 827 ', coo)
		var calc1 = await efetuar_calculo(calc[ idCalc ], undefined, false, nLinha1, coo.v_assinante_atualiza )
		if (!calc1.nao_enviar && reenviaPlanilha) {
			if (c[0] == 'lista') {
				var calc2 = JSON.parse(JSON.stringify(calc1))
				if (typeof calc2.lista !== 'undefined' && typeof calc2.lista[ id1 ] !== 'undefined') {
					calc2.lista	 = calc2.lista[ id1 ]
				}
				
				// socket.emit('lista', calc2 )
				emiteGeral(idCalc, 'lista' ,calc2)
			} else {
				// socket.emit('calcDump', calc1 )
				emiteGeral(idCalc, 'calcDump' ,calc1)
			}
			
		}
		
	})
})



server.listen(porta_api, () => {
  console.log('Debit Atualiza Server v.2023 - nserver: '+nserver+' / porta: '+ porta_api);
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

// console.log('agora_yyyymmdd', agora_yyyymmdd() )


le_arquivo = function ( idCalc, callback ) {
    var n = parseInt(idCalc / 1500)
    var pasta = pasta_env + '/' + n 
    var nomearq = pasta + '/'+ idCalc + '.a3'
    console.log('Lendo arquivo: ', nomearq)

    // verifica se a pasta existe 
    if (!fs.existsSync(pasta)) { fs.mkdirSync(pasta); }
    if (fs.existsSync(nomearq)) {
    	var json1 = {}
        fs.readFile(nomearq, 'utf8', (err, dados) => {
            if (err) {
              console.error(err);
              return;
            }
			if (dados.length<2) {
				resetCalc( idCalc )
				callback(calc[idCalc])		
				return		
			}
			json1 = calcUtil.JSON_parseAutoCorrige(dados)
            calc[ idCalc ] = json1  

            if (callback) {
            	callback(json1)
            }
        });
    } else {
    	resetCalc( idCalc )
    	callback(calc[idCalc])
    }
}



le_arquivo2 = async function  ( idCalc ) {
    var n = parseInt(idCalc / 1500)
    var pasta = pasta_env + '/' + n 
    var nomearq = pasta + '/'+ idCalc + '.a3'
    console.log('Lendo arquivo (v2): ', nomearq)

    // verifica se a pasta existe 
    if (!fs.existsSync(pasta)) {  await fs2.mkdirSync(pasta); }

    if (fs.existsSync(nomearq)) {
    	var json1 = {}
        var dados = await fs2.readFile(nomearq, 'utf8')
		if (dados.length<2) {
			resetCalc( idCalc )
			callback(calc[idCalc])		
			return		
		}
		json1 = calcUtil.JSON_parseAutoCorrige(dados)
		calc[ idCalc ] = json1  
    } else {
    	resetCalc( idCalc )
    }
}


salvarCalc = function ( idCalc ) {
	if (typeof calc[ idCalc ] === 'undefined' || calc[ idCalc ] == null || typeof calc[ idCalc ].info === 'undefined') {
		return;
	}

    var dados = {
		hash: calc[ idCalc ].hash,
		idCalc: calc[ idCalc ].info.idCalc,
    	info: calc[ idCalc ].info,
    	lista: calc[ idCalc ].lista
    }
    var j_dados = JSON.stringify(dados) 

    var n = parseInt(idCalc / 1500)
    var pasta = pasta_env + '/' + n 
    var nomearq = pasta + '/'+ idCalc + '.a3'

    // verifica se a pasta existe 
    if (!fs.existsSync(pasta)) {
        fs.mkdirSync(pasta);
    }

	try {
		fs.writeFileSync(nomearq, j_dados);
	} catch (err) {
		console.log(err);
	}

}

function cookie_uncrypt(cookie_criptografado, headers) {
	const key = process.env.cookie_key //!IMPORTANTE: deixar igual ao php no verifica login
	const interacoes = 481 //!IMPORTANTE: deixar igual ao php no verifica login
	const Encryption = require('./Encryption.js')
	const encryption = new Encryption()
	const cookie_descriptografado = encryption.decrypt(cookie_criptografado, key, interacoes)
	cookie = JSON.parse(cookie_descriptografado)

	if (typeof cookie.v_id_dono === 'undefined') {
		if (headers && headers.whitelabeltoken) {
			try {
				let c2 = encryption.decrypt(headers.whitelabeltoken, key, interacoes)
				return JSON.parse(c2)

			} catch (e) {
				return null
			}
        } 
	}

	return cookie;
}

setInterval( function() {
	console.log('limpando a memória')
	let agora1 = agora_yyyymmdd(true)
	// leTabelas () 
	var agora = Date.now() 
	for (var i in calc) {
		if (typeof calc[i] !== 'undefined' &&  calc[i] != null && typeof calc[i].ultimaAtividade === 'undefined') {
			calc[i].ultimaAtividade = agora
		}

		/* 2 * 60 * 60 * 1000  = 2 horas */
		if (( calc[i] != null ) && (agora - calc[i].ultimaAtividade > (15 * 60 * 1000))) {
			console.log(`limpando a memória do calc ${i}`)
			calc[i] = null 
                        const qUpdate = 'UPDATE calculos.atualizacaoMonetaria SET data_atualizacao=? WHERE id=?'
                        con2.promise().execute(qUpdate, [agora1, i])
			// console.log(`limpando a memória do calc ${i} - ok`, JSON.stringify(calc[i]) )
		}
	}
}, 15 * 60000 * 1)


