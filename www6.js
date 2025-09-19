const porta_api = 5056
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const Encryption = require('./Encryption');
const calcUtil = require('./calcUtil');
const axios = require('axios')
const randomstring = require("randomstring");
const BN = require('bignumber.js');

require('dotenv').config()

//---------------------------------------------------------------------

const mysql = require('mysql2');
const {RowDataPacket} = require("mysql2");

const mysql_info = {
  host: process.env.MYSQL_host,
  user: process.env.MYSQL_user,
  password: process.env.MYSQL_password2,
    database: process.env.MYSQL_database
}

const con = mysql.createPool(mysql_info);

app.get('/front6/ping', async function (req, res) {
  res.send('{success:1,programa:"www6.js"}')
})


const cors1 = {
    origin: function (origin, callback) {
        console.log(origin)
            callback(null, true)
    },
    credentials: true,
    exposedHeaders: 'Set-Cookie',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};

app.use(function (req, res, next) {
    req.headers.origin = req.headers.origin || req.headers.host;
    next();
});
app.use(cors(cors1));


const lista_tabelas = [
  { nome: 'igpm', query: `select * from igpm WHERE valor<>-100 order by dia `, resumo: 1},
  { nome: 'igpm_2', query: `select * from igpm order by dia `, resumo: 0},
  { nome: 'inss', query: `SELECT * from inss order by dia DESC, percentual asc`, resumo: 0},
  { nome: 'irrf', query: `SELECT * from irrf order by dia desc, faixa_de asc`, resumo: 0},
  { nome: 'ipca', query: `SELECT * from ipca where dia>='19640101' and valor<>-100 order by dia asc`, resumo: 1},
  { nome: 'ipca_2', query: `SELECT * from ipca where dia>='19640101' order by dia asc`, resumo: 0},
  { nome: 'sinduscon', query: `select * from sinduscon WHERE valor<>-100 order by dia`, resumo: 1},
  { nome: 'cub_sc', query: `select * from cub_sc WHERE valor<>-100 order by dia `, resumo: 0},
  { nome: 'igp', query: `select * from igp WHERE valor<>-100 order by dia `, resumo: 1},
  { nome: 'igp_2', query: `select * from igp  order by dia `, resumo: 0},
  { nome: 'icv', query: `select * from icv WHERE valor<>-100 order by dia `, resumo: 1},
  // { nome: 'icv_2', query: `select * from icv order by dia `, resumo: 0},
  { nome: 'incc', query: `select * from incc WHERE valor<>-100 order by dia `, resumo: 1},
  { nome: 'inpc', query: `select * from inpc WHERE valor<>-100 order by dia `, resumo: 1},
  { nome: 'inpc_2', query: `select * from inpc order by dia `, resumo: 0},
  { nome: 'ipc_fipe', query: `select * from ipc_fipe WHERE valor<>-100 order by dia `, resumo: 1},
  { nome: 'ipc_fgv_2', query: `select * from ipc_fgv  order by dia `, resumo: 0},
  { nome: 'ipc_fipe_2', query: `select * from ipc_fipe order by dia `, resumo: 0},
  { nome: 'ipc_fgv', query: `select * from ipc_fgv WHERE valor<>-100 order by dia `, resumo: 1},
  { nome: 'ipca_e', query: `select * from ipca_e WHERE valor<>-100 order by dia `, resumo: 1},
  { nome: 'ipca_e_2', query: `select * from ipca_e order by dia `, resumo: 0},
  { nome: 'ivar', query: `select * from ivar WHERE valor<>-100 order by dia `, resumo: 1},
  { nome: 'ivar_2', query: `select * from ivar order by dia `, resumo: 0},
  { nome: 'cdi', query: `select * from cdi WHERE valor<>-100 order by dia `, resumo: 2},
  { nome: 'btn', query: `select * from btn WHERE valor<>-100 order by dia `, resumo: 2},
  { nome: 'salario_minimo', query: `select * from salario_minimo WHERE valor<>-100 order by dia `, resumo: 2},
  { nome: 'selic', query: `select * from selic WHERE valor<>-100 order by dia `, resumo: 2},
  { nome: 'poupanca', query: `select * from poupanca_196 WHERE valor<>-100 order by dia `, resumo: 2},
  { nome: 'tbf', query: `select * from tbf WHERE valor<>-100 order by dia `, resumo: 2},
  { nome: 'tjlp', query: `select * from tjlp WHERE valor<>-100 order by dia `, resumo: 2},
  { nome: 'tr', query: `select * from tr WHERE valor<>-100 order by dia `, resumo: 2},
  { nome: 'ufesp', query: `select * from ufesp WHERE valor<>-100 order by dia `, resumo: 2},
  { nome: 'ufir', query: `select * from ufir WHERE valor<>-100 and dia like '%01' order by dia `, resumo: 2},
  { nome: 'ufm', query: `select * from ufm WHERE valor<>-100 order by dia `, resumo: 2},
  { nome: 'ufr_pb', query: `select * from ufr_pb WHERE valor<>-100 order by dia `, resumo: 2},
  { nome: 'upc', query: `select * from upc WHERE valor<>-100 order by dia `, resumo: 2},
  { nome: 'aasp', query: `select * from aasp WHERE valor<>-100 order by dia `, resumo: 0},
  { nome: 'tjrj_lei_11690', query: `select * from tjrj_lei_11690 WHERE valor<>-100 order by dia `, resumo: 0},
  { nome: 'tjrj', query: `select * from tjrj WHERE valor<>-100 order by dia `, resumo: 0},
  { nome: 'tjes', query: `select * from tjes WHERE valor<>-100 order by dia `, resumo: 0},
  { nome: 'tjmg', query: `select * from tjmg WHERE valor<>-100 order by dia `, resumo: 0},
  { nome: 'salfam', query: `select * from salario_familia order by dia desc, de asc`, resumo: 0},
  { nome: 'segdes', query: `select * from seguro_desemprego order by dia desc`, resumo: 0},
  { nome: 'urv', query: `select * from urv WHERE valor<>-100 order by dia `, resumo: 0},
  { nome: 'dolar_cc', query: `select * from dolar_cc WHERE dia>='20230101' and valor<>-100 order by dia `, resumo: 3},
  { nome: 'dolar_cv', query: `select * from dolar_cv WHERE dia>='20230101' and valor<>-100 order by dia `, resumo: 3},
  { nome: 'euro_compra_r', query: `select * from euro_compra_r WHERE  dia>='20230101' and valor<>-100 order by dia `, resumo: 3},
  { nome: 'euro_venda_r', query: `select * from euro_venda_r WHERE  dia>='20230101' and valor<>-100 order by dia `, resumo: 3},

  { nome: 'tabelas_trabalhistas', query: `SELECT id,nome,dia FROM tabelas_trabalhistas WHERE id > 1 AND ocultar=0 AND dia<'20300101' ORDER BY dia DESC, nome`}
]

var tabelas = {}
var tabelasMenor = {}


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());


//----------------------------------------------------------------------------------------------------------------
function cookie_uncrypt(cookie_criptografado) {
  //!IMPORTANTE: deixar igual ao php no verifica login
  const key = process.env.cookie_key 
  const interacoes = 481
  const encryption = new Encryption()
  const cookie_descriptografado = encryption.decrypt(cookie_criptografado, key, interacoes)
  return JSON.parse(cookie_descriptografado);
}

//================================================================================================================

app.get('/front6/tabela/:tabela',  function (req, res) {
  var tabela = req.params.tabela;
  res.json(tabelas[tabela])
});

function calcularTabelaMenor(tabela) {
  let r = []
  let l = tabelas[tabela].length-1
  let limite = l - 12

  while (l >= 0 && l > limite) {
    let t = tabelas[tabela][l]
    r.unshift(t);
    l--;
  }

  let acumulado = 1 
  for (let i = 0; i < r.length; i++) {
    let v = r[i].valor
    acumulado = new BN(acumulado).times(new BN(1).plus(new BN(v).dividedBy(100)))
    r[i].acumulado = new BN(acumulado).minus(1).times(100).toNumber()
  }

  // console.table(r)
  tabelasMenor[tabela] = r
}

app.get('/front6/tabelaMenor/:tabela',  function (req, res) {
  var tabela = req.params.tabela;
  console.log('consultando: ', tabela)

  if (!tabelasMenor[tabela]) {
    calcularTabelaMenor(tabela)
  }
  res.json(tabelasMenor[tabela])
});




app.get('/front6/pacotes',  function (req, res) {
  const q = `SELECT id, preco, nome, meses
             FROM assina_pacote
             WHERE id in (149,151,261,280,600,601,610,611)`

  con.query(q, function(e,r,f) {
    res.json({pacotes: r})
  })

});



app.get('/front6/tabelaTrabalhista/:id',  function (req, res) {
  var id = req.params.id;
  const q = `SELECT * FROM tabelas_trabalhistas  WHERE id="${id}"`

  con.query(q, function(e,r,f) {
    if (e) {console.log(e);}
    res.json(r)
  })

});






//================================================================================================================
//========= RESUMO =======================================================================================================

app.get('/front6/resumo',   function  (req, res) {
  let r = {}
  let l = tabelas['igpm'].length-3
  let diai = tabelas['igpm'][l].dia

  let l2 = tabelas['salario_minimo'].length-3
  let diai2 = tabelas['salario_minimo'][l2].dia

  let l3 = tabelas['dolar_cc'].length-3
  let diai3 = tabelas['dolar_cc'][l3].dia

  for (let i in tabelas) {
    if (lista_tabelas.find( x => x.nome == i && x.resumo == 1)) {
      r[i] = tabelas[i].filter( x => x.dia >= diai)
    }
    if (lista_tabelas.find( x => x.nome == i && x.resumo == 2)) {
      r[i] = tabelas[i].filter( x => x.dia >= diai2)
    }
    if (lista_tabelas.find( x => x.nome == i && x.resumo == 3)) {
      r[i] = tabelas[i].filter( x => x.dia >= diai3)
    }
  }

  res.json(r)
});



function execQuery(nome, query) {
  con.query(query, function(e,r,f) {
    tabelas[nome] = r
  })
}

function lerTabelas() {
  tabelasMenor = {}
  for (var i in lista_tabelas) {
    execQuery(lista_tabelas[i].nome, lista_tabelas[i].query)
  }
}

app.listen(porta_api, () => {
  console.log('Servidor www6-api porta: '+porta_api);
});

setInterval( function() { lerTabelas() }, 1000 * 60 * 15) // 15 minutos
lerTabelas()