var porta_api = 3102

const calcUtil = require('./calcUtil.js');

var http = require('http');
var express = require('express');
var cors = require('cors')

var cs1 = require('./calc.js')
var calcServer = new cs1() 

require('dotenv').config()  
var qs = require('querystring')

var cookieParser = require('cookie-parser');

const cors1 = {
	origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}

var mysql_senha = process.env.MYSQL_password2

const mysql = require('mysql2');  
const { default: axios } = require('axios');
var mysql_info = {host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: mysql_senha, database: process.env.MYSQL_database }

const servidorAPI2 = process.env.servidorAPI  

var con = null 
var chaves = {} 

var app = express();
// console.log(cors1)
app.use(cors(  cors1 ))
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);

const dicionarioTabelas = {
	'btn': 1,
	'igp': 3,
	'ipc-fgv': 4,
	'ipc-fipe': 5,
	'poupanca': 6,
	'salariominimo': 8,
	'cub': 9,
	'tr': 10,
	'dolar': 13,
	'igpm': 16,
	'ipca': 17,
	'inpc': 18,
	'selic': 23,
	'ufesp': 19,
	'ufir': 105,
	'ufm-sp': 21,
	'tbf': 25,
	'upc': 26,
	'tjlp': 27,
	'incc': 28,
	'cdi': 29,
	'euro': 35,
	'ipc-r': 41,
	'ipa-di': 43,
	'ipcae': 45,
	'ivar': 96,
	'irsm': 107,
	'media-igp-inpc': 80,
	'tj-sp-depre': 112,
	'tj-sp-calculos-civil-geral': 11, 
	'tj-rj-lei_6899': 48,
	'tj-rj-lei_14905': 111,
	'tj-rj-lei_11960': 97,
	'tj-es': 59,
    'tj-mg': 57,
	'ivgr-bacen': 113
}


var handleDisconnect = function() {
	con =   mysql.createPool(mysql_info)

	con.on('error', function(err) {
		if(err.code === 'PROTOCOL_CONNECTION_LOST - 2 ') { 
			handleDisconnect(); 
		} else { 
			throw err; 
		}
	});
}

handleDisconnect();


const addChave = async (chave) => {
	let sql = `select api_tokens.id, api_tokens.id_login from api_tokens,cliente_planos where token='${chave}' and cliente_planos.id_login=api_tokens.id_login  `
		
	// console.log(sql)
	let [rows ] = await con.promise().execute(sql)
	if (typeof rows[0] === 'undefined') {
		return false;
	}
	chaves[chave] = rows[0].id_login 
	return chaves[chave]
}

app.get('/atualiza-v1/listaTabelas',  cors( cors1 ), async function (req, res) {
	let r = [] 
	for (var i in dicionarioTabelas) {
		let tabela = dicionarioTabelas[i] 
		let nome =  calcServer.listaTabelas[tabela].nome 
		r.push( { tabela: i, nome, permiteSelic: false } )
	}

	let [ lista1 ] = await con.promise().execute(`select id, nome, urlamigavel from calculos.tabelasJudiciais where tabGlobal=1 order by nome`)
	for (let i in lista1) {
		let tabela = lista1[i]
		r.push( { tabela: tabela.urlamigavel, nome: tabela.nome, permiteSelic: true } )
	}

	r.sort( function(a, b) {
		if (a.nome < b.nome) {
			return -1;
		}
		if (a.nome > b.nome) {
			return 1;
		}
		return 0;
	})

	// console.table(r)
	res.send(r)
})


app.post('/atualiza-v1/lerTabela',  cors( cors1 ), async function (req, res) {
	let chaveCliente = req.body.apikey;
	let indexador = req.body.tabela;
	let dataAtualizacao = req.body.dataAtualizacao;
	let dataInicioSelic = req.body.dataInicioSelic;
	let chaveOk = chaves[chaveCliente]

	if (!chaveOk) {
		chaveOk = await addChave(chaveCliente)
	}

	if (!chaveOk) {
		res.json({erro: 'apikey inválida: Obtenha uma apikey através do site www.debit.com.br. Após o login, clique no menu superior direito, clique em API.'})
		return;
	}

	let tabelaNormal = dicionarioTabelas[indexador]
	let tabelaJudicial = 0 

	console.log('lerTabela', JSON.stringify(req.body) )

	// se não for tabela normal, procura na tabela judicial
	if (typeof tabelaNormal == 'undefined' || tabelaNormal == null) {
		let q = `select id from calculos.tabelasJudiciais where urlamigavel='${indexador}'`
		// console.log(q)
		let [rows] = await con.promise().execute(q)

		if (typeof rows[0] !== 'undefined') {
			tabelaJudicial = rows[0].id
		} else {	
			res.send({erro: 'tabela não encontrada'})
			return;
		}
	}

	if (tabelaJudicial > 0) {

		if (!dataInicioSelic) {
			dataInicioSelic = dataAtualizacao
		}

		// console.log('dataAtualizacao', dataAtualizacao, 'dataInicioSelic', dataInicioSelic)

		if (!dataAtualizacao) {
			dataAtualizacao = calcUtil.strPrimeiroDia( calcUtil.diaHoje() )
		}

		if (!dataInicioSelic) {
			dataInicioSelic = dataAtualizacao 
		}

		if (!calcUtil.dataOk(dataAtualizacao)) {
			res.json({erro: 'dataAtualizacao inválida'})
			return;
		}

		if ((dataInicioSelic !=  dataAtualizacao) &&  (!calcUtil.dataOk(dataInicioSelic)) ) {
			res.json({erro: 'dataInicioSelic inválida'})
			return;
		}

		let url1 = `${servidorAPI2}/calculosDiversos/tabelaDireta` 

		let dados = {
			dataAtual: dataAtualizacao, 
			indexador: tabelaJudicial,
			jurosTab: [ { modo: 'L', ate: calcUtil.dia2intMesAno(dataInicioSelic) } ],
			modoSelic: 'princJuros',
			calc_selic: true,
			selic_inicio: calcUtil.dia2intMesAno( dataInicioSelic ),            
		}

		axios.post(url1,  dados).then( function(r) {
			let x = r.data
			let x2 = []
			for (var i in x) {
				let dia = calcUtil.mesAno2dia(parseInt( x[i].mesano ) )  
				if (x[i].mesano > 23578) {
					x2.push( { data: dia, indice: x[i].indiceGerado, selic: x[i].selicAcumulada, juros: x[i].juros } )
				}
			}
			res.send(x2)
		})
		.catch(function (error) {
			console.log('erro axios processos.js - lerTabelaJudicial -  l: 191 - ', url1)
		}); 
	} else {
		let tab = await calcServer.tabelas[ tabelaNormal ]
		let tab2 = [] 
		for (var i in tab) {
			if (tab[i].valor != -100) {
				let dia = calcUtil.yyyymmdd2dia( tab[i].dia.toString() ).substring(3)
				tab2.push( { data: dia, valor: tab[i].valor } )
			}
		}	
		res.send(tab2)	
	}

})




app.post('/atualiza-v1/atualiza',  async function(req, res) {
        console.log(agora()+" atualiza: "+JSON.stringify( req.body) )

        const {
                indiceAtualizacao: indiceNome,
                dataAtualizacao,
                lista: listaParam,
                apikey: chaveCliente
        } = req.body

        if (!chaveCliente) {
                res.json({erro: 'apikey não informada'})
                return;
        }

        let lista = listaParam
        if (typeof listaParam === 'string') {
                try {
                        lista = JSON.parse(listaParam)
                } catch (e) {
                        res.json({erro: 'lista de valores inválida'})
                        return;
                }
        }

        if (!Array.isArray(lista)) {
                res.json({erro: 'lista de valores inválida'})
                return;
        }

        if (!dataAtualizacao || !calcUtil.dataOk(dataAtualizacao)) {
                res.json({erro: 'dataAtualizacao inválida'})
                return;
        }

        const indiceAtualizacao = dicionarioTabelas[indiceNome];

        var chaveOk = chaves[chaveCliente]

	if (!chaveOk) {
		chaveOk = await addChave(chaveCliente)
	}

	if (!chaveOk) {
		res.json({erro: 'apikey inválida: Obtenha uma apikey através do site www.debit.com.br. Após o login, clique no menu superior direito, clique em API.'})
		return;
	}

	if (!indiceAtualizacao) {
		res.json({erro: 'indiceAtualizacao não existe'})
		return;
	}

	var calcBase = { 
		api: true,
		info: {
			dia_atualiza: dataAtualizacao,
			diaAtualizacaoErro: '',
			indexador: indiceAtualizacao, // igp-m 
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

	var resultado = await calcServer.atualiza(calcBase)
	var rCompacto = req.body

	if (typeof resultado ===	'undefined' || typeof resultado.info ===	'undefined') {
		res.json({erro: 'erro na atualização'})
		return;
	}

	if (resultado.info.diaAtualizacaoErro != '') {
		rCompacto.success = 0 
		rCompacto.diaAtualizacaoErro = resultado.info.diaAtualizacaoErro
	}


	if (somaSimples == 0) {
		rCompacto.valorErro =  'Todos os valores estão zerados'
		res.json({erro: 'Todos os valores estão zerados'})
		return;
	}


	for (var i in resultado.lista) {
		// console.log('resultado.lista[i].diaErro: ', resultado.lista[i].diaErro)
		if (resultado.lista[i].diaErro) {
			rCompacto.success = 0 
			rCompacto.lista[i].diaErro = resultado.lista[i].diaErro
			rCompacto.lista[i].resultado = 0
		} else {
			rCompacto.lista[i].resultado = resultado.lista[i].resultado_atualizacao
		}
	}

	rCompacto.resultado = resultado.info.soma_final

	res.json(rCompacto)
})

app.get('/atualiza-v1/ping',  function(req, res) {
	res.send('{ok:1,programa:"client-api.js"}')
})


server.listen(porta_api, () => {
  console.log('Debit API atualiza Server v.2025: '+ porta_api);
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



