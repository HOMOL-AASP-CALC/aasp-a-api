const porta_api = 3301

const calcUtil = require('./calcUtil.js');
const pdf = require('./pdfCalcDiversos.js');
const htmlCalc = require('./htmlCalcDiversos.js');

const http = require('http');
const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors')
const bodyParser = require('body-parser')
const PDFDocument = require("./pdfkit-tables-v2");
const axios = require('axios');
const randomstring = require("randomstring");
const crypto = require('crypto')
const fs = require('fs');
const helmet = require('helmet')
const calcHTMLAtualiza = require('./atualizaHTML_v3_1.js');

require('dotenv').config()  
var qs = require('querystring')
var cookieParser = require('cookie-parser');
var urlLogoInfo =  process.env.urlLogoInfo 
const pasta_env  = process.env.pasta_calculos

const superHashAbreCalc = 'superHashRozgrin'

var mysql_senha = process.env.MYSQL_password2
var listaTabelas  = [] 
var tabelas = {} 
var tabelaPrevReajuste = {}
var listaTabelaCache = [] 
var cs1 = require('./calc.js')
var calcServerAtualiza = new cs1() 


const mysql = require('mysql2')  
var mysql_info = {host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: mysql_senha, database: process.env.MYSQL_database, multipleStatements: true,    waitForConnections: true,    connectionLimit: 10,    queueLimit: 0 }
var mysql_info2 ={
    host: process.env.MYSQL_host, 	
    user: process.env.MYSQL_user,	
    password: process.env.MYSQL_password2, 
    database:  process.env.MYSQL_database_calculos, multipleStatements: true,    waitForConnections: true,    connectionLimit: 10,    queueLimit: 0 }
var mysql_info3 ={
    host: process.env.MYSQL_host, 	
    user: process.env.MYSQL_user,	
    password: process.env.MYSQL_password2, 
    database:  process.env.MYSQL_database_controle, multipleStatements: true,    waitForConnections: true,    connectionLimit: 10,    queueLimit: 0 }


var calcMem = { prevDifNRecebidas: {}, cartaoPonto: {}, calculosJudiciais: {}, saldoDevedor: {}, tabelasJudiciais: {}, tabelasFinanciamento: {}, atualizacaoMonetaria: {}, prevCT: {}, calculoTrabalhista: {} }
var calculadora = {} 
calculadora.calculosJudiciais = new( require('./c_calculosJudiciais.js') );
calculadora.atualizacaoMonetaria = new( require('./c_atualizacaoMonetaria.js') );
calculadora.tabelasJudiciais = new( require('./c_tabelasJudiciais.js') );
calculadora.tabelasFinanciamento = new( require('./c_tabelasFinanciamento.js') );
calculadora.saldoDevedor = new( require('./c_saldoDevedor.js') );
calculadora.cartaoPonto = new( require('./c_cartaoPonto.js') );
calculadora.prevDifNRecebidas = new( require('./c_prevDifNRecebidas.js') );
calculadora.prevCT = new( require('./c_prevCT.js') );
calculadora.calculoTrabalhista = new( require('./c_calculoTrabalhista.js') );

const allowedDomains = JSON.parse( process.env.allowedDomains )

// Middleware para configurar CORS com múltiplos domínios
const corsOptionsDelegate = function (req, callback) {
  let corsOptions= {
    methods: 'GET,POST',
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

const app = express();


app.use(helmet());
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  })

app.use(cors(  corsOptionsDelegate ))
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    debug: false,
    useTempFiles : true,
    tempFileDir : process.env.uploadDir  
}));


const server = http.createServer(app);

const mysqlDisconnect = function(m_info) {
    var m1 = mysql.createPool(m_info)

    m1.on('error', function(err) {
        // console.log('---- mysql desconectou no atualiza.js - linha 105 ---- ', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST - 2 ') { 
          mysqlDisconnect(m_info.dbName); 
        } else { 
            throw err; 
        }
    });

    return m1;
}

var con = mysqlDisconnect(mysql_info)
var conCalculos = mysqlDisconnect(mysql_info2)
var conControle = mysqlDisconnect(mysql_info3)

// var conCalculos = mysqlDisconnect('calculos')
// var conControle = mysqlDisconnect('debit_controle')

const setarTabelas = function() {
    // console.table(tabelas[31])
    calculadora.tabelasJudiciais.setVariaveis( { tabelas } )
    calculadora.atualizacaoMonetaria.setVariaveis( { calcServerAtualiza, con } )
    calculadora.saldoDevedor.setVariaveis( { tabelas } )
    calculadora.tabelasFinanciamento.setVariaveis( { tabelas } )
    calculadora.calculosJudiciais.setVariaveis( { tabelas, tabJ: calculadora.tabelasJudiciais, tabelaMaximo:listaTabelas } )
    calculadora.prevDifNRecebidas.setVariaveis( { tabelaPrevReajuste, tabelas, tabJ: calculadora.tabelasJudiciais } )
}

calculadora.calculosJudiciais.leTabelaJudicial = async function (id) { return leArquivo('tabelasJudiciais', id) }   
calculadora.prevDifNRecebidas.leTabelaJudicial = async function (id) { return leArquivo('tabelasJudiciais', id) }   

app.get('/calculosDiversos/ping',  function(req, res) {
	res.send('{ok:1,programa:"calculosDiversos.js"}')
})

app.get('/calculosDiversos/listaTabelas', async  function(req, res) {
    // console.log(listaTabelaCache)
    let r = JSON.parse( JSON.stringify(listaTabelaCache) )

    let q1 = `SELECT id, nome, resumoTab FROM tabelasJudiciais WHERE  tabGlobal=1 and lixo=0 order by nome`
    let [ r2 ] = await conCalculos.promise().query(q1)

    for (let x in r2) {
        r.push( { indice: r2[x].id+1000, nome: r2[x].nome, inicio: 0, mesclavel: 0 } )
    }

    // console.table(r)

    res.send(r) 
})

app.post('/calculosDiversos/uploadArq', async function(req, res) {
    let d = req.body 
    let nomeArq = process.env.uploadDir+'/'+d.idCalc+'.pdf'

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.send('{success:0}');
    }

    let arq = req.files.arq;
    arq.mv(nomeArq,  async function (err) {  
      let dataBuffer = await fs.promises.readFile(nomeArq);
        if (typeof calculadora[ d.tipo ].uploadArq === 'function') {
            let r = await calculadora[ d.tipo ].uploadArq( dataBuffer, calcMem[ d.tipo ][ d.idCalc ], d);
            salvaCalculo( d.idCalc, d.tipo, calcMem[ d.tipo ][ d.idCalc ])
            res.send({success:1, retorno: r});
            return;
        }
        res.send('{success:0}');
    });

  });

app.get('/calculosDiversos/listaTabelasJudiciais',  function(req, res) {
    let c = cookie_uncrypt( req.cookies['c_v_app'] )  

    if (!c || !c.v_id_dono) {
        c = { v_id_dono: 0 }
    }

    let q1 = `SELECT id, nome, dados as indexadoresTab FROM tabelasJudiciais WHERE (id_login='${c.v_id_dono}' or tabGlobal=1) and lixo=0 order by nome`
    conCalculos.query(q1, 
		async function(err, results, campos) {
            if (results) {
                for (let x in results) {
                    if (results[x].indexadoresTab == null || results[x].indexadoresTab == '' || results[x].indexadoresTab == 'null') {
                        let t1 = await  leArquivo('tabelasJudiciais', results[x].id)
                        // console.log(t)
                        let t = JSON.parse(JSON.stringify(t1))
                        results[x].indexadoresTab = JSON.stringify(t)
                        t.hash = null 
                        conCalculos.query(`UPDATE tabelasJudiciais SET dados='${JSON.stringify(t)}' WHERE id='${results[x].id}'`)
                    }
                }

                tabelaMaximo = results
                res.send(results)
            } else {
                res.send([])
            }
    })
})  

app.get('/calculosDiversos/listaIndicesMesclaveis',  function(req, res) {
    con.query(`SELECT indice as id, nome, tabela, inicio FROM maximo WHERE mesclavel=1 order by nome`, 
		function(err, results, campos) {
            if (results) {
                tabelaMaximo = results
                res.send(results)
            } else {
                res.send([])
            }
    })
})  


app.get('/calculosDiversos/listaIndicesPerc',  function(req, res) {
    con.query(`SELECT indice as id, nome, tabela, inicio FROM maximo WHERE ativo=1 and calculo='perc' order by nome`, 
		function(err, results, campos) {
            if (results) {
                tabelaMaximo = results
                res.send(results)
            } else {
                res.send([])
            }
    })
})  

app.get('/calculosDiversos/leIndiceMesclado/:id',  function(req, res) {
    // console.log('leIndiceMesclado leIndiceMesclado')
    if (!req.params.id || req.params.id==0 || typeof req.params.id === 'undefined' ) {
        res.send({
            nome: '',
            indices: [
                { inicio: '', fim: '', id: 0},{ inicio: '', fim: '', id: 0},{ inicio: '', fim: '', id: 0},
                { inicio: '', fim: '', id: 0},{ inicio: '', fim: '', id: 0}
            ]
        })
        return;
    }
    con.query(`SELECT * FROM composicao_indice WHERE id="${req.params.id}" `, 
		function(err, results, campos) {
            if (results) {
                let d_json = results[0].dados_json
                if (!d_json) { d_json = '[]' }
                res.send({
                    nome: results[0].nome,
                    indices: JSON.parse( d_json )
                })
            } else {
                res.send([])
            }
    })
}) 


app.post('/calculosDiversos/salvaIndiceMesclado',  function(req, res) {
    let c = cookie_uncrypt( req.cookies['c_v_app'] )

    if (!c || !c.v_id_dono) {
        res.send({})
        return;
    }
    
    let d = req.body;
    let d2 = (d.indices[1].inicio) ? calcUtil.dia2yyyymmdd( d.indices[1].inicio ) : ''
    let d3 = (d.indices[2].inicio) ? calcUtil.dia2yyyymmdd( d.indices[2].inicio ) : ''
    let d4 = (d.indices[3].inicio) ? calcUtil.dia2yyyymmdd( d.indices[3].inicio ) : ''
    let d5 = (d.indices[4].inicio) ? calcUtil.dia2yyyymmdd( d.indices[4].inicio ) : ''

    // console.table(tabelaMaximo)
    let a1 = tabelaMaximo.findIndex( (e) => { return e.id == d.indices[0].id } )
    let a2 = tabelaMaximo.findIndex( (e) => { return e.id == d.indices[1].id } )
    let a3 = tabelaMaximo.findIndex( (e) => { return e.id == d.indices[2].id } )
    let a4 = tabelaMaximo.findIndex( (e) => { return e.id == d.indices[3].id } )
    let a5 = tabelaMaximo.findIndex( (e) => { return e.id == d.indices[4].id } )

    let i1 = (a1 >= 0) ? tabelaMaximo[a1].tabela : '--'
    let i2 = (a2 >= 0) ? tabelaMaximo[a2].tabela : '--'
    let i3 = (a3 >= 0) ? tabelaMaximo[a3].tabela : '--'
    let i4 = (a4 >= 0) ? tabelaMaximo[a4].tabela : '--'
    let i5 = (a5 >= 0) ? tabelaMaximo[a5].tabela : '--'

    let dados_json = JSON.stringify(d.indices)
    d.idCalc = parseInt(d.idCalc)

    if (d.idCalc) {
        let q1 = `UPDATE composicao_indice SET nome='${d.nome}', dados_json='${dados_json}', dia2='${d2}',  dia3='${d3}',dia4='${d4}',dia5='${d5}', indice1='${i1}', indice2='${i2}', indice3='${i3}', indice4='${i4}', indice5='${i5}' WHERE id="${d.idCalc}" AND id_login='${c.v_id_dono}' `
        con.query(q1)
        res.send({idCalc: d.idCalc})
        return;
    } else {
        let q1 = `INSERT INTO composicao_indice (nome, dados_json, dia2, dia3, dia4, dia5, indice1, indice2, indice3, indice4, indice5, id_login) VALUES ("${d.nome}", '${dados_json}', "${d2}", "${d3}", "${d4}", "${d5}", "${i1}", "${i2}", "${i3}", "${i4}", "${i5}", "${c.v_id_dono}") `


        con.query(q1, function(err, results, campos) {
            let idCalc1 = results.insertId
            res.send({idCalc: idCalc1 })
        })   
    }
}) 


app.get('/calculosDiversos/infoUsuario', function (req, res) {
	var c = req.cookies['c_v_app']
    let r = cookie_uncrypt(c)
    // console.log('infoUsuario', r)   
	res.send(r)
})


app.get('/calculosDiversos/pdf/:tipo/:id', async function(req, res) {
	let id = req.params.id
    let tipo = req.params.tipo
	let c = cookie_uncrypt( req.cookies['c_v_app'] ) 

	var logoInfo = 'sem_logo'
    try {
        let url1 = urlLogoInfo+'/'+c.v_id_dono
		var logoInfoTemp = await axios.get(url1)
		logoInfo = logoInfoTemp.data
	} catch	(err) {
        console.log(err)
		console.log('erro ao abrir o logo no axios. id_Calc')
		logoInfo = 'sem_logo'
	}

    let myDoc = new PDFDocument({  bufferPages: true,  autoFirstPage: false,   logoInfo }) 
    let buffers = [];
    myDoc.on('data', buffers.push.bind(buffers));
    myDoc.on('end', () => {
        let pdfData = Buffer.concat(buffers);
        res.writeHead(200, {
        'Content-Length': Buffer.byteLength(pdfData),
        'Content-Type': 'application/pdf'})
        .end(pdfData);
    });

    let q1 = `SELECT * FROM ${tipo} WHERE id="${id}" and id_login="${c.v_id_dono}" `
    conCalculos.query(q1, async function(err, results, campos) {
        if (results.length > 0) {
            if (tipo == 'calculosJudiciais') {
                let dados = JSON.parse(results[0].dados)
                let calc = await calcularCalculoJudicial(dados) 
                pdf.calculosJudiciais( myDoc, dados, calc )
            } 
        } 
    })
})


app.get('/calculosDiversos/html/:tipo/:id', async function(req, res) {
	let id = req.params.id
    let tipo = req.params.tipo
	let c = cookie_uncrypt( req.cookies['c_v_app'] ) 

	var logoInfo = 'sem_logo'
    try {
        let url1 = urlLogoInfo+'/'+c.v_id_dono
        console.log(url1)
		var logoInfoTemp = await axios.get(url1)
		logoInfo = logoInfoTemp.data
	} catch	(err) {
        console.log(err)
		console.log('erro ao abrir o logo no axios. id_Calc')
		logoInfo = 'sem_logo'
	}

    let q1 = `SELECT * FROM ${tipo} WHERE id="${id}" and id_login="${c.v_id_dono}" `
    conCalculos.query(q1, async function(err, results, campos) {
        if (results.length > 0) {
            if (tipo == 'calculosJudiciais') {
                let dados = JSON.parse(results[0].dados)
                let calc = await calcularCalculoJudicial(dados) 
                res.send( htmlCalc.calculosJudiciais( dados, calc ) )
            } 
        }  else {
            res.send('')
        }
        if (err) {
            res.send('')
        }
    })
  
})

const path = require('path'); 
const calc = require('./calc.js');

app.get('/calculosDiversos/images/:img', (req, res) => {
    console.log('pegando imagem')
    if (req.params.img == 'debit_logo1.png') {
        const filePath = path.join(__dirname, 'public', req.params.img);
        console.log('filePath', filePath)   
        res.sendFile(filePath, (err) => {
            if (err) {
              // Se ocorrer um erro ao enviar o arquivo, envia um código de status 404.
              console.log(err);
              res.status(404).send("Arquivo não encontrado!");
            }
          });
    }
});

  
const criaCalculo  = async function (tipo, id_dono=4, usuario_logado=0) {
    console.log('criaCalculo', tipo, id_dono, usuario_logado)
    let agora1= agora_yyyymmdd(true)
    let hashCalc = randomstring.generate({ length: 18, charset: 'alphabetic' });
    let tipo1 = ''
    let assinante = false 
    if (tipo == 'atualizacaoMonetaria') {   
        tipo1 = 'A3' 
        if (id_dono != 4) {
            assinante = await consultaAssinatura( id_dono )
        } 
    } 
    if (tipo == 'calculoTrabalhista') {   
        tipo1 = 'T5' 
        if (id_dono != 4) {
            assinante = await consultaAssinatura( id_dono )
        } 
    } 
    if (tipo == 'cartaoPonto') {   
        tipo1 = '6' 
    } 
    let q1 = `INSERT INTO ${tipo} (nome,id_login, diahora, id_multiusuario, ativo, tipo)  values ('Novo cálculo', ${id_dono}, '${agora1}', '${usuario_logado}', 1, '${tipo1}') `
    let [ r ] = await conCalculos.promise().query(q1)
    // console.log('tipo', tipo, calculadora[ tipo ]  )
    let res = calculadora[ tipo ].criar({ idCalc: r.insertId, hash: hashCalc, idDono: id_dono, assinante, diaMaximo: calcUtil.yyyymmdd2dia(listaTabelas[16].maximo.toString() ) })
    res.dataCriacao = agora1 
    res.editavel = true 
    salvaCalculo( r.insertId, tipo, res)
    return res
}

const salvaCalculo = function (id, tipo, dados) {
    var dados = JSON.stringify( dados )
    var idCalc = parseInt( id )
    var n = parseInt(idCalc / 10000)
    if (tipo == 'atualizacaoMonetaria' || tipo == 'calculoTrabalhista') {
        n = parseInt(idCalc / 1500)
    } 
    
    var pasta = pasta_env + '/' + n 
    var nomearq = pasta + '/'+ idCalc + '.' + tipo

    if (tipo == 'atualizacaoMonetaria') {
        nomearq = pasta + '/'+ idCalc + '.a3'
    } 
    if (tipo == 'calculoTrabalhista') {
        pasta = process.env.pasta_trabalhista + '/' + n
        nomearq = pasta + '/'+ idCalc + '.t5'
    }

    // verifica se a pasta existe 
    if (!fs.existsSync(pasta)) {
        fs.mkdirSync(pasta);
    }

    console.log('salvando: ', nomearq)

    fs.writeFile(nomearq, dados, function (err) {
        if (err) return console.log(err);
    });
}

const consultaAssinatura = async function (id) {
    if (id == 'undefined' || id == 'null')  { return false; }
    let hoje = agora_yyyymmdd().substring(0, 8)

    let q1 = `SELECT * FROM cliente_planos WHERE id_login="${id}" and validade >= '${hoje}' `
    let [ r1 ] = await con.promise().query(q1)
    return (r1.length > 0)
}

const leCalculo = async function (tipo, id, idDono, hash) {
    // console.log('leCalculo', tipo, id, idDono, hash) 
    var idCalc = parseInt( id )
    var n = parseInt(idCalc / 10000)
    let extensao = tipo 
    let pasta1 = pasta_env+ '/' + n 

    if (tipo == 'atualizacaoMonetaria' || tipo == 'calculoTrabalhista') {
        
    } 
    
    if (tipo == 'atualizacaoMonetaria') {
        extensao = 'a3'
        n = parseInt(idCalc / 1500)
    } 
    if (tipo == 'calculoTrabalhista') {
        extensao = 't5'
        n = parseInt(idCalc / 1500)
        pasta1 = process.env.pasta_trabalhista + '/' + n
    }

    var nomearq = pasta1 + '/'+ idCalc + '.' + extensao

    console.log('Lendo arquivo: ', nomearq)

    // verifica se a pasta existe 
    if (!fs.existsSync(pasta1)) { fs.mkdirSync(pasta1); }

    var json1 = {}
    if (fs.existsSync( nomearq )) {
        let dados = await fs.promises.readFile(nomearq, 'utf8')
        // console.log('dados', dados)
        json1 = calcUtil.JSON_parseAutoCorrige(dados)
        json1.editavel = true
        
        if (hash == json1.hash) {
            let idd = json1.idDono
            if (!idd) { idd = idDono }
            var assinante = await consultaAssinatura( json1.idDono )
            json1.assinante = assinante
        } 

        if (hash == superHashAbreCalc) {
            json1.assinante = true
        } 

        if (idDono == 4 || idDono == 0) {
            json1.assinante = false
        }


        let dataCriacao = '01/03/2024'
        if (json1.dataCriacao) {
            dataCriacao = calcUtil.yyyymmdd2dia( json1.dataCriacao )
        } else {
            json1.dataCriacao = '202403010000'
        }

        let agora = calcUtil.yyyymmdd2dia( agora_yyyymmdd() )
        let dif = calcUtil.diferencaDatasDias( dataCriacao, agora )

        if (dif > 1 && !json1.assinante) {
            json1.editavel = false
        }

        if (idDono == json1.idDono || hash == json1.hash) {
            calcMem[ tipo ][ id ] = json1  
        }         
    } 

    return json1
}

const leArquivo = async function (tipo, id) {
    if (tipo == 'atualizacaoMonetaria') {
        var n = parseInt(id / 1500)
        var pasta = pasta_env + '/' + n 
        var nomearq = pasta + '/'+ id + '.a3'
    } else {
        var n = parseInt(id / 10000)
        var pasta = pasta_env + '/' + n 
        var nomearq = pasta + '/'+ id + '.' + tipo
    }
    console.log('Lendo arquivo (apenas leitura): ', nomearq)

    // verifica se a pasta existe 
    if (!fs.existsSync(pasta)) { fs.mkdirSync(pasta); }

    var json1 = {}
    if (fs.existsSync( nomearq )) {
        let dados = await fs.promises.readFile(nomearq, 'utf8')
        json1 = calcUtil.JSON_parseAutoCorrige(dados) 
        let agora = Date.now() 
        json1.ultimaAtividade = agora      
    } 

    return json1
}

app.post('/calculosDiversos/tabelaDireta',  async function(req, res) {
    let param = req.body
    // console.log('tabelaDireta', JSON.stringify(param) )

    if (!param.indexador || typeof param.indexador === 'undefined') {
        res.send( { erro: 'Falta o indexador' } )
        return;
    }

    let r = await calculadora.calculosJudiciais.tabelaDireta( param )

    for (let i in r.tabela) {
        if (r.tabela[i].indexador >= 0) {
            if (typeof listaTabelas[ r.tabela[i].indexador ] !== 'undefined') {
                r.tabela[i].indexadorStr = listaTabelas[ r.tabela[i].indexador ] .nome ;
            } else {
                r.tabela[i].indexadorStr = 'Índice não encontrado'
            }
        }
    }
    // console.table(r.tabela)
    res.send( r )
})




app.get('/calculosDiversos/pdfA/:versao/:tipo/:idCalc',  async function(req, res) {
    
    let versao = req.params.versao
    let tipo = req.params.tipo
    let idCalc = req.params.idCalc
    let pasta = process.env.pasta_atualiza_antigo + '/' + parseInt(idCalc / 10000)

    if (tipo == 'TRAB') {
        pasta = process.env.pasta_trabalhista_antigo + '/' + parseInt(idCalc / 10000)
    }

    let c = cookie_uncrypt( req.cookies['c_v_app'] )

    try {
        const [rows] = await conCalculos.promise().query('SELECT id_login FROM atualizacaoMonetaria WHERE id = ? LIMIT 1',[idCalc]);

        if (!rows || rows.length === 0) {
            res.send({ sucesso: 0, msg: 'calculo_nao_encontrado' });
            return;
        }

        if (rows[0].id_login != c.v_id_dono) {
            res.send({ sucesso: 0, msg: 'sem_permissao' });
            return;
        }

        try {
            const nomeArquivo = `${pasta}/${idCalc}.${versao}.${tipo}`;
            console.log('tentando ler arquivo: ', nomeArquivo)
            if (!fs.existsSync(nomeArquivo)) {
                res.status(404).send({ sucesso: 0, msg: 'arquivo_nao_encontrado' });
                return;
            }
            if (tipo == 'pdf') {
                const pdfBuffer = await fs.promises.readFile(nomeArquivo);
                res.writeHead(200, {
                    'Content-Type': 'application/pdf',
                    'Content-Length': pdfBuffer.length
                });
                res.end(pdfBuffer);
               return;
            } else {
                const htmlContent = await fs.promises.readFile(nomeArquivo);
                res.send(htmlContent);
                return;
            }
        } catch (err) {
            console.error('erro lendo arquivo:', err);
            res.status(500).send({ sucesso: 0, msg: 'erro_ler_arquivo' });
            return;
        }

    } catch (err) {
        console.error('erro consulta lista_calculo:', err);
        res.send({ sucesso: 0, msg: 'erro_consulta' });
        return;
    }
})


app.get('/calculosDiversos/pdfT4/:tipo/:idCalc',  async function(req, res) {
    let tipo = req.params.tipo
    let idCalc = req.params.idCalc
    let pasta = process.env.pasta_trabalhista_antigo + '/' + parseInt(idCalc / 10000)

    let c = cookie_uncrypt( req.cookies['c_v_app'] )

    try {
        const [rows] = await con.promise().query('SELECT id_login FROM lista_calculo WHERE id = ? LIMIT 1',[idCalc]);

        if (!rows || rows.length === 0) {
            res.send({ sucesso: 0, msg: 'calculo_nao_encontrado' });
            return;
        }

        if (rows[0].id_login != c.v_id_dono) {
            res.send({ sucesso: 0, msg: 'sem_permissao' });
            return;
        }

        try {
            const nomeArquivo = `${pasta}/${idCalc}.t4.${tipo}`;
            if (!fs.existsSync(nomeArquivo)) {
                res.status(404).send({ sucesso: 0, msg: 'arquivo_nao_encontrado' });
                return;
            }
            if (tipo == 'pdf') {
                const pdfBuffer = await fs.promises.readFile(nomeArquivo);
                res.writeHead(200, {
                    'Content-Type': 'application/pdf',
                    'Content-Length': pdfBuffer.length
                });
                res.end(pdfBuffer);
               return;
            } else {
                const htmlContent = await fs.promises.readFile(nomeArquivo);
                res.send(htmlContent);
                return;
            }
        } catch (err) {
            console.error('erro lendo arquivo:', err);
            res.status(500).send({ sucesso: 0, msg: 'erro_ler_arquivo' });
            return;
        }

    } catch (err) {
        console.error('erro consulta lista_calculo:', err);
        res.send({ sucesso: 0, msg: 'erro_consulta' });
        return;
    }
})

app.get('/calculosDiversos/pontoAntigo/:idCalc',  async function(req, res) {
    let tipo = req.params.tipo
    let idCalc = req.params.idCalc
    let pasta = process.env.pasta_trabalhista_antigo + '/' + parseInt(idCalc / 10000)
    let c = cookie_uncrypt( req.cookies['c_v_app'] )

    try {
        const [rows] = await con.promise().query('SELECT id_login FROM calculos.cartaoPonto WHERE id = ? LIMIT 1',[idCalc]);

        if (!rows || rows.length === 0) {
            res.send({ sucesso: 0, msg: 'calculo_nao_encontrado' });
            return;
        }

        if (rows[0].id_login != c.v_id_dono) {
            res.send({ sucesso: 0, msg: 'sem_permissao' });
            return;
        }

        try {
            const nomeArquivo = `${pasta}/${idCalc}.cartaoPonto.html`;
            if (!fs.existsSync(nomeArquivo)) {
                res.status(404).send({ sucesso: 0, msg: 'arquivo_nao_encontrado' });
                return;
            }

            const htmlContent = await fs.promises.readFile(nomeArquivo, 'utf8');
            res.setHeader('Content-Disposition', 'inline');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.send(htmlContent);
            return;
  
        } catch (err) {
            console.error('erro lendo arquivo:', err);
            res.status(500).send({ sucesso: 0, msg: 'erro_ler_arquivo' });
            return;
        }

    } catch (err) {
        console.error('erro consulta lista_calculo:', err);
        res.send({ sucesso: 0, msg: 'erro_consulta' });
        return;
    }
})



app.post('/calculosDiversos/leParcial',  async function(req, res) {
    let idCalc = req.body.id
    let tipo = req.body.tipo
    let hash = req.params.hash
    let c = cookie_uncrypt( req.cookies['c_v_app'] )
    if (!c.v_id_dono) { c = { v_id_dono :  4 };  }

    if (!calcMem[ tipo ][ idCalc ]) {
        calcMem[ tipo ][ idCalc ] = await leCalculo( tipo, idCalc, c.v_id_dono, hash)
    }

    res.send( calculadora[ tipo ].pegaDadosParcial( calcMem[ tipo ][ idCalc ], req.body ) )
})

app.post('/calculosDiversos/leCalculo',  async function(req, res) {
    let c = cookie_uncrypt( req.cookies['c_v_app'] )

    let id = req.body.id
    let tipo = req.body.tipo
    let hash = req.body.hash

    if (hash == 'undefined' || hash == 'null')  { hash = '' }  
    if (tipo == 'undefined' || tipo == 'null')  { tipo = '' } 
    if (id == 'undefined' || id == 'null')  { id=0 } 

    if (!tipo) {
        res.send( {e:4})
        console.log('tipo invalido: ', tipo)
        return;
    }
   
    if (!c.v_id_dono) {
        c = { v_id_dono: 4, v_usuario_logado: 0 }
    }



    if (!id || id==0 || typeof id === 'undefined') {
        let ncalc = await criaCalculo(tipo, c.v_id_dono, c.v_usuario_logado)
        ncalc = calculadora[ tipo ].posLeituraArquivo( ncalc ) 

        calcMem[ tipo ][ ncalc.idCalc ] = ncalc
        res.send( ncalc )
        return;
    } else {
        let calc = calcMem[ tipo ][ id ]
       
        if (!calc || calc == null || typeof calc === 'undefined') {
            if (!hash) {
                let q1 = `SELECT * FROM ${tipo} WHERE id="${id}" and id_login="${c.v_id_dono}" `
                let [ results ] = await conCalculos.promise().query(q1) 
                if (results.length > 0) {
                    calc = await leCalculo( tipo, id, c.v_id_dono, '')
                } 
                calc.hash = randomstring.generate({ length: 18, charset: 'alphabetic' });
            } else {
                calc = await leCalculo( tipo, id, 0, hash)
            }
        }

        if (!calc.idCalc) {
            calc.idCalc = id
        }

        // torna editável se for assinante (pelo cookie)
        if (c.v_assinante_atualiza || c.v_assinante_trabalhista || c.v_logado_sso) {
            calc.editavel = true
        }

        if (calc && (calc.idDono == c.v_id_dono || calc.hash == hash)) {
            calc = calculadora[ tipo ].posLeituraArquivo( calc )
            res.send( calc )
            return ;
        }
        res.send( {e:1} )
    }
}) 

app.get('/calculosDiversos/atualizaHTML/:id/:hash', async function(req, res) {
    let idCalc = req.params.id
    let hash = req.params.hash
    let tipo = 'atualizacaoMonetaria'
    let c = cookie_uncrypt( req.cookies['c_v_app'] )
    let calcM = calcMem[ tipo ][ idCalc ]
    if (!c.v_id_dono) { c = { v_id_dono :  4 };  }
    let statusAssinante = false
    if (c.v_assinante_atualiza) { statusAssinante = true }

    if (!calcM) {
        calcM = await leCalculo( tipo, idCalc, c.v_id_dono, hash)
    }

    if (calcM) {
        if ((c.v_id_dono == calcM.idDono && c.v_id_dono != 4) || (calcM.hash == hash)) {
            let r = await calculadora[ tipo ].calcular( calcM, statusAssinante)

            res.send( calcHTMLAtualiza.montaCalc( r ))
            return;
        }
    } 

    res.send({sucesso:0})
});


app.get('/calculosDiversos/html/:tipo/:id/:hash', async function(req, res) {
    let idCalc = req.params.id
    let hash = req.params.hash
    let tipo = req.params.tipo

    if (typeof calculadora[ tipo ] === 'undefined') {
        res.send('erro');
        return;
    }

    let c = cookie_uncrypt( req.cookies['c_v_app'] )
    let calcM = calcMem[ tipo ][ idCalc ]
    if (!c.v_id_dono) { c = { v_id_dono :  4 };  }
    let statusAssinante = false
    if (c.v_assinante_atualiza) { statusAssinante = true }

    if (!calcM) {
        calcM = await leCalculo( tipo, idCalc, c.v_id_dono, hash)
    }

    if (calcM) {
        if ((c.v_id_dono == calcM.idDono && c.v_id_dono != 4) || (calcM.hash == hash)) {
            let r = await calculadora[ tipo ].calcular( calcM, statusAssinante)
            let rHtml = calculadora[ tipo ].imprimirHTML( r )

            res.send( rHtml )
            return;
        }
    } 

    res.send({sucesso:0})
});

app.get('/calculosDiversos/copiar/:tipo/:id',  async function(req, res) {
    let c = cookie_uncrypt( req.cookies['c_v_app'] )
    if (!c || !c.v_id_dono) { res.send({erro:1, msg:'usuario invalido'}); console.log('cookie invalido'); return; }

    let id = req.params.id
    let tipo = req.params.tipo

    if (typeof tipo === 'undefined' || !tipo) {
        res.send({fuck:0});
        return;
    }

    let agora1= agora_yyyymmdd()
    agora1 = agora1.substring(0,12)
    let q = `INSERT INTO ${tipo} (nome, id_login, id_multiusuario, diahora, ativo) SELECT CONCAT(nome, ' - cópia'), id_login, id_multiusuario, "${agora1}", 1 FROM ${tipo} WHERE id="${id}" AND id_login="${c.v_id_dono}" ` 
    console.log(q)
    if (tipo == "cartaoPonto") {
        q = `INSERT INTO ${tipo} (nome, tipo, id_login, id_multiusuario, diahora, ativo) SELECT CONCAT(nome, ' - cópia'), 6, id_login, id_multiusuario, "${agora1}", 1 FROM ${tipo} WHERE id="${id}" AND id_login="${c.v_id_dono}" `
    }
    let [ r ] = await conCalculos.promise().query(q)
    // console.log(r)
    let novoId = r.insertId

    let n = parseInt(id / 10000)
    let pasta = pasta_env + '/' + n 
    var nomearqVelho = pasta + '/'+ id + '.'+ tipo

    n = parseInt(novoId / 10000)
    var pastaNovo = pasta_env + '/' + n 
    var nomearqNovo = pastaNovo + '/'+ novoId + '.'+ tipo

    console.log('Copiando arquivo: ', nomearqVelho, nomearqNovo)

    // verifica se a pasta existe 
    if (!fs.existsSync(pasta)) { fs.mkdirSync(pasta); }
    if (!fs.existsSync(pastaNovo)) { fs.mkdirSync(pastaNovo); }

    if (fs.existsSync( nomearqVelho )) {
        let dados = await fs.promises.readFile(nomearqVelho, 'utf8')  
        let dados1 = JSON.parse(dados)
        dados1.idCalc = novoId   

        fs.promises.writeFile(nomearqNovo, JSON.stringify(dados1), 'utf8')  
    } 

    res.send({success:true})
})


app.get('/converte/:tipo',  async function(req, res) {
    let tipo = req.params.tipo
    let q = `select id, id_login, dados from ${tipo}`
    let [ r ] = await conCalculos.promise().query(q)

    for (let x in r) {
        let j = ''
        try {
            j = JSON.parse(r[x].dados)
            j.idDono = r[x].id_login
            salvaCalculo( r[x].id, tipo, j)
        } catch {
            console.log('erro ao converter: ', r[x].id )
        }
    }

    res.send({success:true})
})


const criaUsuario = async (email, emailBoasVindasID, parceiroHash, produto) => {
    let url1 = process.env.servidorGeralAPI + '/email/agenda_email'
    let url2 = process.env.servidorGeralAPI + '/email/agenda-jornada-cadastro'
    let senha = randomstring.generate({ length: 8, charset: 'alphabetic' });
    let md5_senha2 = crypto.createHash('md5').update(senha).digest("hex")
    let ativacao = randomstring.generate({ length: 4, charset: 'numeric' });
    let hash_ativacao = crypto.createHash('md5').update(ativacao).digest("hex")
    let codVendedor = 11
    if (produto == 'atualizacaoMonetaria') { codVendedor = 12 }
    if (produto == 'cartaoPonto') { codVendedor = 13 }
    if (produto == 'tabelasFinanciamento') { codVendedor = 14 }
    if (produto == 'calculosJudiciais') { codVendedor = 15 }
    if (produto == 'saldoDevedor') { codVendedor = 16 }
    if (produto == 'tabelasJudiciais') { codVendedor = 17 }


	let q = `INSERT INTO login (nome, email, login, senha, telefone, contador, diacadastro, ativacao, hash_ativacao, ativo, id_atendente_crm, endpoint_atua, revendedor, indicacao_revenda_token) VALUES ('${email}', '${email}', '${email}', '${md5_senha2}', '', 0, now(), '${ativacao}', '${hash_ativacao}', 0, 0, 1, ${codVendedor}, '${parceiroHash}')`;
    // console.log(q)
    let resultadoInsert = await con.promise().query(q)
    // console.log(resultadoInsert)
    idLogin = resultadoInsert[0].insertId

    //cadastra um link de revenda para divulgacao
    const hoje = calcUtil.dia2yyyymmdd( calcUtil.diaHoje() )
    q = `INSERT INTO revendaToken (id_login, nome, percentualDesconto, percentualParceiro, token, criado)
            VALUES ('${idLogin}', 'Parceria', '5', '5', UUID(), '${hoje}') `
            console.log(q)
    con.query(q)

    let substituicoes = {
        'login': email,
        'senha': senha,
        'ativacao': ativacao,
        'link_ativacao_cadastro': `https://www.debit.com.br` 
    }
    let dados = {
        'id_login': idLogin,
        'id_modelo': emailBoasVindasID,
        'momento_agendado': 0,
        'substituicoes': JSON.stringify(substituicoes),
        'programa_insercao': 'calculosDiversos.js-l:647'
    }

    axios.post( url1, dados,{	headers: { 'Origin': process.env.servidorGeralAPI }	}).catch( function (err) {
        console.log('nao enviou o email: '+url1)
    })
    axios.post( url2, {'id_login': idLogin},{	headers: { 'Origin': process.env.servidorGeralAPI }	}).catch( function (err) {
        console.log('nao enviou o email: '+url2)
    })

    return idLogin
}

const associaCalc = async (email, tipo, idCalc, parceiroHash) => {

    let idLogin = 0 
    let novoLogin = false 
    let q = `SELECT id FROM login WHERE email = '${email}'`
    let [ r ] = await con.promise().query(q) 
    let linkCalc = `https://calcs.debit.com.br/calculadoraCalculoJudicial?id=${idCalc}&hash=${calcMem[ tipo ][ idCalc ].hash}`
    if (tipo == 'atualizacaoMonetaria') {
        linkCalc = `https://calculadoras.debit.com.br/atualizacaoMonetaria?id=${idCalc}&hash=${calcMem[ tipo ][ idCalc ].hash}`
    }
    
    if (r.length>0) {
        idLogin = r[0].id
        var dados = {
            'id_login': idLogin,
            'id_modelo': 116,
            'momento_agendado': 0,
            'substituicoes': JSON.stringify({linkCalc}),
            'programa_insercao': 'externoCalcs.js-2'
        }
        let url1 = process.env.servidorGeralAPI + '/email/agenda_email'
    
        axios.post( url1, dados,{	headers: { 'Origin': process.env.servidorGeralAPI }	}).catch( function (err) {
            console.log('l: 678 - axios error: '+url1)
        }) 

    } else {
        idLogin = await criaUsuario(email, 115, parceiroHash, tipo)
        novoLogin = true
    }

    calcMem[ tipo ][ idCalc ].idDono = idLogin
    calcMem[ tipo ][ idCalc ].assinante = await consultaAssinatura( idLogin )
    // console.log('calcMem[ tipo ][ idCalc ].assinante', calcMem[ tipo ][ idCalc ].assinante)

    let q1 = `UPDATE ${tipo} SET id_login='${idLogin}' WHERE id='${idCalc}' `;
    conCalculos.query(q1)   
    return novoLogin
}


app.post('/calculosDiversos/salvaCampo',  async function(req, res) {
    let d = req.body;
    let c = cookie_uncrypt( req.cookies['c_v_app'] )
    let calcM = calcMem[ d.tipo ][ d.idCalc ]
    let calcMTemp = {}
    let novoLogin = false
    if (!d.parceiroHash) { 
        d.parceiroHash = req.cookies['c_v_r']
    }

    if (!c.v_id_dono) { c = { v_id_dono :  4 };  }

    if (!calcM) {
        calcM = await leCalculo( d.tipo, d.idCalc, c.v_id_dono, d.hash)
    }

    if (calcM) {
        if ((c.v_id_dono == calcM.idDono && c.v_id_dono != 4) || (calcM.hash == d.hash)) {
            
            if (d.campo == 'email' && calcM.email != d.valor) {
                novoLogin = await associaCalc( d.valor, d.tipo, d.idCalc, d.parceiroHash )
            }

            if (d.campo == 'nome') {
                d.valor = d.valor.replace("'", " ")
                conCalculos.query(`UPDATE ${d.tipo} SET nome='${d.valor}' WHERE id='${d.idCalc}' `)
            }

            if (d.formatoCampo == 'StringJSON') { d.valor  = JSON.parse(d.valor) }
            if (d.valor == 'true') { d.valor = true }
            if (d.valor == 'false') { d.valor = false }
            
            let feito = 0

            if (typeof calculadora[ d.tipo ].setCampo !== 'undefined') {
                console.log('setCampo', d.tipo, d.campo, d.valor)
                calcM = await calculadora[ d.tipo ].setCampo( calcM, d.campo, d.valor )   
                feito = 1
            } 

            if (typeof calculadora[ d.tipo ].setCampoRetorno !== 'undefined') {
                calcMTemp = calculadora[ d.tipo ].setCampoRetorno( calcM, d.campo, d.valor )   
                calcM = calcMTemp.calcM
                feito = 2
            } 
            
            if (!feito) {
                calcM[ d.campo ] = d.valor
            }

            let agora = Date.now() 
            calcM.ultimaAtividade = agora    
            salvaCalculo( d.idCalc, d.tipo, calcM)

            if (novoLogin) { 
                // console.log('l: 891 - novoLogin', novoLogin)
                if (!calcMTemp.retorno) { calcMTemp.retorno = {} }
                calcMTemp.retorno.novoLogin = true
                feito = 2
            }

            if (feito == 2) {
                res.send({sucesso:1, retorno: calcMTemp.retorno })
            }   else {
                res.send({sucesso:1})
            }          
            return;
        }
    } 

    console.log('não salvou o campo', d )
    console.log('passei #564',c.v_id_dono, calcM.idDono, calcM.hash, d.hash)
    res.send({sucesso:0})
})

app.post('/calculosDiversos/resultado',  async function(req, res) {
    let d = req.body;
    let c = cookie_uncrypt( req.cookies['c_v_app'] )
    let calcM = calcMem[ d.tipo ][ d.idCalc ]
    let statusAssinante = false

    if (!c.v_id_dono) { c = { v_id_dono :  4 };  }
    if (c.v_assinante_atualiza) { statusAssinante = true }

    if (!calcM) {
        calcM = await leCalculo( d.tipo, d.idCalc, c.v_id_dono, d.hash)
    }

    if (calcM) {
        // console.log('passei #626',c.v_id_dono, calcM.idDono, calcM.hash, d.hash)
        if ((c.v_id_dono == calcM.idDono && c.v_id_dono != 4) || (calcM.hash == d.hash)) {
            let r = await calculadora[ d.tipo ].calcular( calcM,  statusAssinante)
            res.send(r)

            if (d.tipo == 'cartaoPonto') {
                let q = `UPDATE cartaoPonto SET calc_trab='${JSON.stringify(r.resultado)}' WHERE id='${d.idCalc}' `;
                conCalculos.query(q)
            }
            return;
        }
    } 

    console.log('sem permissão para abrir o calculo', d )
    res.send({sucesso:0})
})

app.post('/calculosDiversos/comparaResultado',  async function(req, res) {
    let d = req.body;
    let resultado1 = {}
    let resultado2 = {}


    console.log(d)

    d.hash = superHashAbreCalc
    // d.tipo = 'atualizacaoMonetaria'

    let calcM = await leCalculo( d.tipo, d.idCalc, 0, d.hash)
    let calcM2 = JSON.parse(JSON.stringify(calcM))
    // console.log('calcM', calcM)

    // console.log(d)

    if (calcM) {
        if (typeof calcM === 'undefined') {
            res.send({sucesso:0}); return;
        }

        if (d.tipo == 'atualizacaoMonetaria') {
            let r1 = await calculadora[ d.tipo ].calcular( calcM,  true)
            resultado1 = r1.info 

            calcM2.info.dia_atualiza = calcUtil.somaMes( calcM2.info.dia_atualiza )

            let r2 = await calculadora[ d.tipo ].calcular( calcM2,  true)
            resultado2 = r2.info 
        } 

        if (d.tipo == 'calculosJudiciais') {
            // console.log(calcM)
            let r1 = await calculadora[ d.tipo ].calcular( calcM,  true)
            resultado1 = r1.totalizacao.totalizacaoFinal 

            calcM2.dataAtual = calcUtil.somaMes( calcM2.dataAtual )

            let r2 = await calculadora[ d.tipo ].calcular( calcM2,  true)
            resultado2 = r2.totalizacao.totalizacaoFinal  
        } 

        res.send({ sucesso: 1, resultado1, resultado2 })
        return;
    } 

    res.send({sucesso:0})
})


app.post('/calculosDiversos/salvarCalcEmail',  async function(req, res) {
	// console.log('salvarCalcEmail', req.body ) 

	var email = req.body.email;
	var tipo = req.body.tipo;
    var idCalc = req.body.idCalc;
    var hashCalc = req.body.hashCalc
	var idLogin = 0 
    let url1 = process.env.servidorGeralAPI + '/email/agenda_email'

	var q = `SELECT id FROM login WHERE email = '${email}'`
    // console.log(q)
	var [ dadosLogin ] = await con.promise().query(q)

	if ( dadosLogin.length <= 0) {
// ***** CRIA USUÁRIO
	} else {
		var idLogin = dadosLogin[0].id
		var dados = {
			'id_login': idLogin,
			'id_modelo': 116,
			'momento_agendado': 0,
			'substituicoes': JSON.stringify({}),
			'programa_insercao': 'externoCalcs.js-2'
		}
		
        axios.post( url1, dados,{	headers: { 'Origin': process.env.servidorGeralAPI }	}).catch( function (err) {
            console.log('erro: '+url1)
            console.log('nao enviou o email')
        })
    }
    

	var q = `UPDATE ${tipo} SET id_login='${idLogin}', ativo='1' WHERE id='${idCalc}' and hashCalc='${hashCalc}' `;
	conCalculos.query(q)

	res.send('{sucesso:1}') 
})

app.post('/calculosDiversos/rastreador', async function (req, res) {
    const { id_dono, pagina, parametros } = req.body;  
    const query = `INSERT INTO rastreador_www2 (id_login, pagina, parametros, datahora, ip) VALUES (?, ?, ?, ?, ?)`
    const YmdHis = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
    con.query(query, [id_dono, pagina, parametros, YmdHis, req.ip])
    return res.status(200).send({ success: 1 })
  })


app.post('/calculosDiversos/gravaPesquisa', async function (req, res) {
    const { id, pagina, resposta, mensagem, hash, email, idCalc } = req.body;  
    let c = cookie_uncrypt( req.cookies['c_v_app'] )

    if (!c || !c.v_id_dono) { var id_login = 0 } else { var id_login = c.v_id_dono    }
    if (!idCalc) { 
        res.status(200).send({ success: 0 })
        return;
    }

    if (hash) {
        var query ='UPDATE pesquisa1 SET mensagem=? WHERE hash=? AND id=?' 
        var [ r ] = await conControle.promise().query(query, [mensagem, hash, id ])
        res.status(200).send({ success: 1 })
    } else {
        var hashCalc = randomstring.generate({ length: 8, charset: 'alphabetic' });
        var agora1= agora_yyyymmdd()
        agora1 = agora1.substring(0,12)

        var query = `INSERT INTO pesquisa1 (id_login, pagina, resposta, diahora, hash, email, idCalc) VALUES (?, ?, ?, ?, ?, ?, ?)`
        var [ r ] = await conControle.promise().query(query, [id_login, pagina, resposta, agora1, hashCalc, email, idCalc])
        res.status(200).send({ success: 1, id: r.insertId, hash: hashCalc })
    }

})

app.get('/lista', function (req, res) {
	var l  = "<html><h1>Cálculos Diversos</h1><br />"
	var l = l + "<table style='padding: 10px; border: 1px solid grey;'>"
	for (c in calcMem.calculosJudiciais) {
		if (calcMem.calculosJudiciais[c] != null) {
			l = l+ "<tr><td>" + c + "</td></tr>"
		}
	}

	var l = l+ "</table>"
	res.send(l)
})

app.get('/calculosDiversos/listaC', function(req, res) {
    const tipos = ['prevDifNRecebidas', 'calculosJudiciais', 'saldoDevedor', 'tabelasJudiciais', 'tabelasFinanciamento', 'atualizacaoMonetaria', 'cartaoPonto']
    let r = ''
    for (var ti in tipos) {
        let tipo = tipos[ti]
        for (var i in calcMem[tipo]) {
            let calc = calcMem[tipo][i]
            try {
                let js = JSON.stringify(calc)
                if (js.length>4) {
                    r = r + `${tipo} - ${i} - ${js.length}<br>`
                }
            } catch {
                r = r + `${tipo} - ${i} - erro <br>`
            }
        }
    }
    res.send(r)
})

server.listen(porta_api, () => {
  console.log('Debit Calculos Diversos v.2024 / porta: '+ porta_api);
});


function cookie_uncrypt(cookie_criptografado) {
	const key = process.env.cookie_key  
	const interacoes = process.env.cookie_interacoes  //!IMPORTANTE: deixar igual ao php no verifica login
	const Encryption = require('./Encryption.js')
	const encryption = new Encryption()
	const cookie_descriptografado = encryption.decrypt(cookie_criptografado, key, interacoes)
	cookie = JSON.parse(cookie_descriptografado)

    if (!cookie || !cookie.v_id_dono || typeof cookie.v_id_dono === 'undefined') { 
        cookie = { v_id_dono: 0, v_usuario_logado: 0 }
    }

	return cookie;
}


const le_tabelas = async function () {
    var [res1] =  await con.promise().query('select indice, maximo, nome, calculo, tabela, inicio, mesclavel, ativo_novo_atualiza from maximo where (ativo=1 or ativo_novo_atualiza=1)  order by nome') 
    var d1 = 0

    listaTabelas  = []
    for (var i in res1) {
        listaTabelas[ res1[i].indice ] = res1[i]
        if (res1[i].indice == 23) {
            listaTabelas[31] = JSON.parse( JSON.stringify(res1[i]) ) 
            listaTabelas[31].indice = 31
            listaTabelas[31].nome = 'Selic + 1% (RFB)'
        }
    }

    for (var i in listaTabelas) {
        var id = listaTabelas[i].indice
        var tab1 = listaTabelas[i].tabela
        var tipo_calculo = listaTabelas[i].calculo

        if (tipo_calculo != "multi") {
            var q = `SELECT * FROM ${tab1} where dia like '%01' order by dia asc`
            var [res2] =  await con.promise().query(q)
            
            tabelas[ id ] =  [ ] 
            for (var k in res2) {	
                d1 = calcUtil.yyyymmdd2intMesAno( res2[k].dia.toString() ) 
                tabelas[ id ][ d1 ] = res2[ k ]
            }
        }

        if (id == 31) { // SELIC Receita Federal  (31) - copia a Selic normal e acrescenta 1% no último mês
            d1++ 
            tabelas[31] = JSON.parse( JSON.stringify(tabelas[31]) ) // igual a SELIC 
            tabelas[31][d1] = { dia: parseInt(calcUtil.mesAno2dinv(d1)), valor: 1 } // coloca no ultimo mês o valor 1
        }
    }


    listaTabelaCache =  listaTabelas
                        .filter( (e) => { return e.ativo_novo_atualiza == 1 } )
                        .sort(
                            function(a, b) {
                                if (a.nome < b.nome) { return -1 }
                                if (a.nome > b.nome) { return 1 }
                                return 0
                            }
                        )


    let [ aaa ] = await con.promise().query( `SELECT * FROM prevReajustes order by diai asc`)
    tabelaPrevReajuste = {} 
    for (let x in aaa) {
        tabelaPrevReajuste[ aaa[x].diai ] = { percentual: aaa[x].percentual, mesReajuste: aaa[x].mesReajuste }
    }
    setarTabelas() 
    // console.table(tabelas[31])
    // console.log(mysql_info, tabelaPrevReajuste)

}


function  agora_yyyymmdd(menor = false) {
	let currentdate = new Date(); 
	let r =  formataN(currentdate.getFullYear()) +
	         formataN(currentdate.getMonth()+1) + 
			 formataN(currentdate.getDate())  +
			 formataN(currentdate.getHours())  +
			  formataN(currentdate.getMinutes()) +  
			 formataN(currentdate.getSeconds());
    if (menor) {
        return r.substring(0,12)
    } else {
        return r 
    }
}

function formataN(n) {
	var x = Number(n)
	return  (x<10) ? '0'+x.toString() : x.toString()
}


setInterval( function() {

	let agora = Date.now() 
    let agora1 = agora_yyyymmdd(true)

    const tipos = ['prevCT', 'prevDifNRecebidas', 'calculosJudiciais', 'saldoDevedor', 'tabelasJudiciais', 'tabelasFinanciamento', 'atualizacaoMonetaria', 'cartaoPonto']
    for (var ti in tipos) {
        let tipo = tipos[ti]
        for (var i in calcMem[tipo]) {
            let calc = calcMem[tipo][i]

            if (typeof calc !== 'undefined' &&  calc != null && typeof calc.ultimaAtividade === 'undefined') {
                calc.ultimaAtividade = agora
            }

            /* 2 * 60 * 60 * 1000 = 2 horas */
            if (( calc != null ) && typeof calc.ultimaAtividade !== 'undefined' && (agora - calc.ultimaAtividade > (7 * 60 * 1000))) {
                calcMem[tipo][i] = null 
                conCalculos.query(`UPDATE ${tipo} SET data_atualizacao='${agora1}' WHERE id='${i}'`)
                console.log(`limpando a ${ti} do calc ${i}`)
            }
        }
    }
}, 5 * 60000 * 1)


le_tabelas () 
setInterval( function() {
    le_tabelas() 
}, 60000 * 15)
