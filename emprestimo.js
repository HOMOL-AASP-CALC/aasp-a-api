const porta_api = 3103
const fs = require('fs')
const calcUtil = require('./calcUtil.js');

var http = require('http');
var express = require('express');
var cors = require('cors')

var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
// var urlencodedParser = bodyParser.urlencoded({ extended: false })


require('dotenv').config()  
var qs = require('querystring')
var cookieParser = require('cookie-parser');

const cors1 = {
    origin: "https://atualiza.debit.com.br",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
}

var mysql_senha = process.env.MYSQL_password2 
if (process.env.MYSQL_host == "localhost") {
	cors1.origin = "http://atualiza.fastbet.win"
} 

const mysql = require('mysql2')  
var mysql_info = {host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: mysql_senha, database: process.env.MYSQL_database }
const con = mysql.createPool(mysql_info).promise()

var app = express();
app.use(cors(  cors1 ))
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
var calc = {}  


resetCalc = function(id) {
	return { 
		info: {
			idCalc: id,
            nomecalc: 'Diego Martins Tormen',
            valor: 213502.77,
            juros: 11.0000,
            juros_periodo: 'a',
            parcelas: 20,
            dia: '08/12/2017',
            carencia: 1,
            juros_carencia: 0,
            sistema: 'SAC',
            correcao_monetaria: 's',
            indexador: 10,
            recalcular: 12,
            modo_saldo: 'mesmo',
            iof:'',
            iof_perc: 0,
            iof_periodo: 'm',
            iof_amortizacao: '',
            iof_juros: '',
            iof_tac: '',
            tac: '',
            tac_dia1: '',
            tac_valor1: 0,
            tac_desc1: '',
            tac_dia2: '',
            tac_valor2: 0,
            tac_desc2: '',
            tac_dia3: '',
            tac_valor3: 0,
            tac_desc3: '',
            tac_dia4: '',
            tac_valor4: 0,
            tac_desc4: '',
            tac_dia5: '', 
            tac_valor5: 0,
            tac_desc5: '',
            seguro: '',
            seguro_valor: 0,
            modo_seguro: 'depois',
		},
		permissoes: [   ]  
	} 

}


permissoes_ativas = async function  (idCalc, idLogin) {
    // retornos
    // editar - e
    // visualizar - v

    var retorno = [ ] 
	var tipoCalc = 'EMPR'

	// console.log('permissoes_ativas', idCalc, idLogin)

	if (idCalc == 0) {
		var agora = new Date().toISOString().slice(0, 19).replace('T', '').replaceAll(':', '').replaceAll('-', '');
		agora = agora.substring(0,12)
		var q1 = `INSERT INTO lista_calculo (nome,tipo,id_login, diahora, id_multiusuario, ativo)  values ('Novo cálculo', '${tipoCalc}', ${idLogin}, '${agora}', 0, 1) `
		var [res2] = await con.query(q1)
		idCalc = res2.insertId
		retorno = [{ id: idLogin  , permissao: "e", novoId: idCalc }] 
		return retorno
	}

    var q0 = `SELECT id, id_login FROM lista_calculo WHERE id=${idCalc} `
	var [res1] = await con.query(q0)

	if (res1.length > 0) { 
		retorno = [{ id: res1[0].id_login  , permissao: "e" }] 
	} 
	
	// verifica se o cálculo foi compartilhado com ele
	var [res2] = await con.query(`select id, id_login, tipo_acesso from atualiza_share where id_calc=${idCalc} `)
		
	for (var i in res2) {
		retorno.push({id: res2[i].id_login, permissao: res2[i].tipo_acesso })
	}

    return retorno 
}

app.get('/emprestimo/tabelaFinanciamento/:idCalc', jsonParser, async function (req, res) {
	var idCalc = req.params.idCalc
	var c = cookie_uncrypt( req.cookies['c_v_app'] )

	var permissao1 = await permissoes_ativas( idCalc, c.v_id_dono )

	if (permissao1.length > 0 && permissao1[0].novoId) {
		idCalc = permissao1[0].novoId
	}

	var p1 = permissao1.find( x => x.id == c.v_id_dono )

	if (typeof p1 === 'undefined' || p1 == null) {
		console.log('sem permissão para acessao o cálculo', idCalc, c.v_id_dono)
		res.send( {sucess:0,erro: 'sem permissão para acessao o cálculo'} )
		return;
	}
})

app.get('/emprestimo/ping', async function(req, res) {
	res.send('{ok:1,programa:"emprestimo.js"}')
})


server.listen(porta_api, () => {
  console.log('Debit Financiamento Server v.2023 - porta: '+porta_api);
});


function formataN(n) {
	var x = Number(n)
	return  (x<10) ? '0'+String(x) : String(x)
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



function cookie_uncrypt(cookie_criptografado) {
	const key = process.env.cookie_key  
	const interacoes = 481
	const Encryption = require('./Encryption.js')
	const encryption = new Encryption()
	const cookie_descriptografado = encryption.decrypt(cookie_criptografado, key, interacoes)
	cookie = JSON.parse(cookie_descriptografado)
	return cookie;
}

