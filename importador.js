const porta_api = 3008
// require('events').EventEmitter.prototype._maxListeners = 100;
const fs = require('fs')

var http = require('http');
var express = require('express');

var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()


const mysql = require('mysql-promise')() 


require('dotenv').config()  

var pasta_env = process.env.pasta_calculos


var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const server = http.createServer(app);
// const axios = require('axios').default;
var calcUtil = require('./calcUtil.js');

var calc = {}  
var tabelaMaximo = [] 

var senha = process.env.MYSQL_password
if (process.env.MYSQL_host == "localhost") {
} else {
	senha = senha+"#";
}


resetCalc = function(id) {
	calc[ id ] = { 
		info: {
			nome: '',
			calc_modo_impressao: 'e',
			calc_jurosm: false,
			calc_jurosc: false,
			calc_multa: false,
			calc_honorarios: false,
			calc_custas: false,
			calc_ordem: false,
			ultimoID: 1,
            calc_perc_prorata:  '0',
            calc_perc_indice_neg:  '0',
            custas:{"juros_moratorios":false,"juros_compensatorios":false,"multa":false,"honorarios":false,"ncpc":false,"selic":false}
		},
		lista: [  ],
		// permissao: [ infoUsuario  ]  
	} 
}

var converte_strJuros = function (str) {
    if (typeof str === 'undefined') return []
    var s = str.replaceAll("[", "").replaceAll("]", "").replaceAll('"', "").split(",")
    var r = [] 

    for (var i=0; i < s.length; i +=4 ) {
        r.push({ inicio: calcUtil.yyyymmdd2dia(s[i]), fim: calcUtil.yyyymmdd2dia(s[i+1]), percentual: s[i+2], tipo: s[i+3] }) 
    }
    
    // console.log(r)
    return r 
}

var pegaVariavel = function (str, variavel) {
    variavel = variavel + "="
    var i = str.indexOf(variavel) + variavel.length
    var j = str.indexOf(";", i)
    return str.substring(i, j)
}

var converteMesclado = function ( idCalc, res1 ) {

    if (res1.modocalc == "p") {
        var d1 = res1.dados.split("\n")
        var dados = [] 
        for (var i in d1) {
            var d2 = d1[i].split("=")
            if (d2[0] != "" && d2[1] != "") {
                dados.push({dia: d2[0], valor: d2[1]})
            }
        }
        // console.log(dados)

    } else {
                   
        var hoje = calcUtil.diaHoje () 
        var indice1  = pegaIdTabela( res1.indice1 )
        var indice2  = pegaIdTabela( res1.indice2 )
        var indice3  = pegaIdTabela( res1.indice3 )
        var indice4  = pegaIdTabela( res1.indice4 )
        var indice5  = pegaIdTabela( res1.indice5 )

        var i1 = tabelaMaximo.find( function (el) { return el.tabela == res1.indice1 })
        
        console.log(res1.indice1)

        if (typeof i1 === 'undefined') {
            // console.log('cancelando ', idCalc)
            // return 
            var inicio_dia1 = "19650101";
        } else {
            var inicio_dia1 = i1.inicio
        }

        var dia2 = ''
        var dia3 = ''
        var dia4 = ''
        var dia5 = ''

        var dia1 = calcUtil.yyyymmdd2dia( String(inicio_dia1) )
        if (res1.dia2 != null) dia2 = calcUtil.yyyymmdd2dia( res1.dia2 )
        if (res1.dia3 != null) dia3 = calcUtil.yyyymmdd2dia( res1.dia3 )
        if (res1.dia4 != null) dia4 = calcUtil.yyyymmdd2dia( res1.dia4 )
        if (res1.dia5 != null) dia5 = calcUtil.yyyymmdd2dia( res1.dia5 )

        var fim1 = ''
        var fim2 = ''
        var fim3 = ''
        var fim4 = ''
        var fim5 = ''

        if (res1.dia2) {
            var fim1 = calcUtil.diminuiMes(dia2) 
        } else {
            fim1 = hoje 
        }
        
        if (res1.dia3) {
            var fim2 = calcUtil.diminuiMes(dia3)
        } else {
            var fim2 = hoje 
        }
        
        if (res1.dia4) {
            var fim3 = calcUtil.diminuiMes(dia4) 
        } else {
            var fim3 = hoje 
        }
        
        if (res1.dia5) {
            var fim4 = calcUtil.diminuiMes(dia5) 
            var fim4 = hoje 
        } else {
            var fim4 = hoje 
        }

        if (indice2<=0) fim2 = ''
        if (indice3<=0) fim3 = ''
        if (indice4<=0) fim4 = ''
        if (indice5<=0) fim5 = ''

        var dados = [
            {inicio: dia1, fim: fim1, id: indice1 },
            {inicio: dia2, fim: fim2, id: indice2 },
            {inicio: dia3, fim: fim3, id: indice3 },
            {inicio: dia4, fim: fim4, id: indice4 },
            {inicio: dia5, fim: fim5, id: indice5 },
        ]
    }

    var dados_str = JSON.stringify(dados)
    var q = `update composicao_indice set dados_json='${dados_str}' where id=${idCalc}`
    console.log(q)
    mysql.query(q)
}


//====== ^^^^^^^^^^^^^ 

app.get('/converteMesclado/:idCalc', jsonParser, async function (req, res) {
	var idCalc = req.params.idCalc

    await mysql.configure({host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: senha, database: 'debit' }); 
    await mysql.query(`select * from composicao_indice where id=${idCalc}`).
                spread( function(res1) {
                    console.log(res1)
                    if (res1.length == 0) {
                        console.log('id não existe')
                        return
                    }
                    converteMesclado(idCalc, res1[0])                
                })
    res.send({success:1})
})



app.get('/converteTodosMesclados', jsonParser, async function (req, res) {
    console.log('convertendo os indices mesclados')
    await mysql.configure({host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: senha, database: 'debit' }); 
    await mysql.query(`select * from composicao_indice where modocalc="" and dados_json="" and indice1<>"" and indice1<>"--" ORDER BY id ASC `).
                spread( function(res1) {
                    
                    if (res1.length == 0) {
                        console.log('id não existe')
                        return
                    }

                    for (var n in res1) {
                        converteMesclado(res1[n].id, res1[n])
                    }
                                    
                })
    res.send({success:1})
})

app.get('/convertePercentualMoeda', jsonParser, async function (req, res) {
    console.log('convertendo os indices percentual e moeda')
    await mysql.configure({host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: senha, database: 'debit' }); 
    await mysql.query(`select * from composicao_indice where modocalc<>""`).
                spread( function(res1) {
                    
                    if (res1.length == 0) {
                        console.log('id não existe')
                        return
                    }

                    for (var n in res1) {
                        convertePercentual(res1[n].id, res1[n])
                    }
                                    
                })
    res.send({success:1})
})

 const importaCalc = async function (idCalc, mysql) {
    // console.log('$$$$$$ importando: ', idCalc)
    resetCalc(idCalc)
    let nao_convertido = false

    // await mysql.configure({host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: senha, database: 'debit' }); 
    await mysql.query(`select * from atualiza_principal where id=${idCalc}`).
                spread(async  function(res1) {
                    if (res1.length == 0) {
                        console.log('id não existe')
                        return
                    }
                    
                    calc[ idCalc ].idCalc = idCalc 
                    calc[ idCalc ].info.modo_indexador ='um' 
                    calc[ idCalc ].info.indexador = res1[0].indice

                    if (calc[ idCalc ].info.indexador[0] == "#") {
                        // res.send({error: 'indexador multi não implementado ainda'});
                        console.log('indexador multi não implementado ainda', idCalc)
                        nao_convertido = true
                    }

                    calc[ idCalc ].info.idCalc = idCalc
                    calc[ idCalc ].info.indexador = res1[0].indice
                    calc[ idCalc ].info.dia_atualiza = calcUtil.yyyymmdd2dia( res1[0].dia_atualiza)
                    calc[ idCalc ].info.descricao = res1[0].calc_descricao_topo
                    calc[ idCalc ].info.calc_modo_impressao = res1[0].calc_modo_impressao
                    calc[ idCalc ].info.calc_jurosm = (res1[0].calc_jurosm == 1)
                    calc[ idCalc ].info.calc_jurosc = (res1[0].calc_jurosc == 1)
                    calc[ idCalc ].info.calc_honorarios = (res1[0].calc_honorarios == 1)
                    calc[ idCalc ].info.calc_multa = (res1[0].calc_multa == 1)
                    calc[ idCalc ].info.calc_sucumbencia = (res1[0].calc_sucumbencia == 1)
                    calc[ idCalc ].info.calc_multa_ncpc = (res1[0].calc_multa_ncpc == 1)
                    calc[ idCalc ].info.calc_perc_prorata = res1[0].calc_perc_prorata
                    calc[ idCalc ].info.calc_perc_indice_neg = res1[0].calc_perc_indice_neg
                    calc[ idCalc ].info.calc_ordem = res1[0].ordenar 

                    if (calc[ idCalc ].info.calc_multa_ncpc) {
                        var campo = res1[0].multa_ncpc;
                        var a_campo = campo.split(';')
                        // console.log(a_campo)

                        calc[ idCalc ].info.multa523 = {
                            valor_atualizado: (a_campo[0] == "1"),
                            sucumbencias: (a_campo[1] == "1"),
                            custas: (a_campo[2] == "1"),
                            juros_moratorios: (a_campo[3] == "1"),
                            juros_compensatorios: (a_campo[4] == "1"),
                            multa: (a_campo[5] == "1"),
                            honorarios: (a_campo[6] == "1")
                        }
                    }

                    if (calc[ idCalc ].info.calc_sucumbencia) {
                        var campo = res1[0].sucumbencia;
                        // console.log('campo sucumbencia: ', campo)

                        if (campo == null) {
                            campo = "t;0.00;10"
                        }
                        var a_campo = campo.split(';')
                        calc[ idCalc ].info.sucumbencias = {
                            valor: a_campo[0] == "d" ? parseFloat((a_campo[1]/100) *a_campo[2] ): parseFloat(a_campo[2]), 
                            modo: a_campo[0] == "t" ? "p" : "v", // p = percentual ou v = valor
                        }
                    }

                    if (calc[ idCalc ].info.calc_honorarios) {
                        var campo = res1[0].honorarios;
                        var a_campo = campo.split(';')

                        calc[ idCalc ].info.honorarios = {
                            valor: parseFloat(a_campo[0]),
                            modo: a_campo[1] == "p" ? "p" : "v", // p = percentual ou v = valor
                        }
                    }

                    if (calc[ idCalc ].info.calc_multa) {
                        var campo = res1[0].multa;
                        var a_campo = campo.split(';')

                        calc[ idCalc ].info.multa = {
                            percentual: a_campo[0],
                            tipo_calculo: a_campo[1] == "d" ? "d" : "p", // d = multa diária ou "" sem nada 
                            multa_sobre_juros: (a_campo[3] == "1"),
                        }
                    }

                    if (calc[ idCalc ].info.calc_jurosm) {
                        var campo = res1[0].juros;
                        var a_campo = campo.split(';')
                        // console.log('#####', a_campo)

                        if (typeof a_campo[6] === 'undefined') {
                            calc[ idCalc ].info.juros_moratorios = 	{
                                modo: 's',
                                percentual: a_campo[0],
                                tipo_calculo: a_campo[1],
                                pro_rata: 0,
                                a_partir: 'vencimento',
                                data_citacao: '',
                                juros_detalhado: [
                                    { inicio: '', fim: '', percentual: 0, tipo: 's'},{ inicio: '', fim: '', percentual: 0, tipo: 's'},
                                    { inicio: '', fim: '', percentual: 0, tipo: 's'},{ inicio: '', fim: '', percentual: 0, tipo: 's'} 
                                  ]
                              }
                        } else {
                            var a_juros = converte_strJuros(a_campo[6])
                            calc[ idCalc ].info.juros_moratorios = {
                                percentual: a_campo[0],
                                tipo_calculo: a_campo[1],
                                pro_rata: a_campo[2] == "sim" ? 1 : 0,
                                a_partir: a_campo[3] == "1" ? "vencimento" : "citacao",
                                data_citacao: calcUtil.yyyymmdd2dia( a_campo[4] ),
                                modo: a_campo[5], // simples ou avançado 
                                juros_detalhado: a_juros 
                            }
                        }
                    }

                    if (calc[ idCalc ].info.calc_jurosc) {
                        var campo = res1[0].jurosc;
                        var a_campo = campo.split(';')
                        var a_juros = converte_strJuros(a_campo[6])

                        calc[ idCalc ].info.juros_compensatorios = {
                            percentual: a_campo[0],
                            tipo_calculo: a_campo[1],
                            pro_rata: a_campo[2] == "sim" ? 1 : 0,
                            a_partir: a_campo[3] == "1" ? "vencimento" : "citacao",
                            data_citacao: calcUtil.yyyymmdd2dia( a_campo[4] ),
                            modo: a_campo[5], // simples ou avançado 
                            juros_detalhado: a_juros 
                        }
                    }

                })

    if (nao_convertido) {
        return "nao_convertido";
    }

    await mysql.query(`select * from atualiza_dados where id_calc=${idCalc}`).
                spread( function(res1) {
                    
                    // console.log(res1)
                    if (res1.length == 0) {
                        // console.log('sem valores para converter')
                        return
                    }
                    for (var n in res1) {
                        var linha = {
                            id: parseInt(n+1),
                            dia: calcUtil.yyyymmdd2dia( res1[n].calc_dia),
                            valor: res1[n].calc_valor,
                            desc: res1[n].calc_desc,
                            custas: (res1[n].calc_custa==1)
                        }

                        if (linha.custas) {
                            calc[ idCalc ].info.calc_custas = true;
                        }

                        // se tiver juros_moratorios individualiado
                        var s = res1[n].juros 

                        if (s) {
                            linha.juros_moratorios = {
                                modo: pegaVariavel(s, 'juros_completo'),
                                pro_rata: pegaVariavel(s, 'juros_prorata') == "nao" ? 0 : 1,
                                juros_detalhado: []
                            }

                            for (var m = 1; m <=3; m++) {
                                linha.juros_moratorios.juros_detalhado.push( {
                                    inicio: calcUtil.yyyymmdd2dia( pegaVariavel(s, `jinicio${m}`) ), 
                                    fim:  calcUtil.yyyymmdd2dia(  pegaVariavel(s, `jfim${m}`) ), 
                                    percentual:  pegaVariavel(s, `jvalor${m}`), 
                                    tipo:  pegaVariavel(s, `jmodo${m}`) 
                                })
                            }
                        }

                        // se tiver juros_compensatorios individualiado
                        var s = res1[n].jurosc 
                        if (s) {
                            linha.juros_compensatorios = {
                                modo: pegaVariavel(s, 'juros_completo'),
                                pro_rata: pegaVariavel(s, 'juros_prorata') == "nao" ? 0 : 1,
                                juros_detalhado: []
                            }

                            for (var m = 1; m <=3; m++) {
                                linha.juros_compensatorios.juros_detalhado.push( {
                                    inicio: calcUtil.yyyymmdd2dia( pegaVariavel(s, `jinicio${m}`) ), 
                                    fim:  calcUtil.yyyymmdd2dia(  pegaVariavel(s, `jfim${m}`) ), 
                                    percentual:  pegaVariavel(s, `jvalor${m}`), 
                                    tipo:  pegaVariavel(s, `jmodo${m}`) 
                                })
                            }
                        }

                        var s = res1[n].multa 
                        if (s) {
                            linha.multa  = {
                                // mvalor1=10.00;mmodo1=;multa_completo=2;multa_475=;multa_juros=;multa_vincendo=;multa_sem_correcao=
                                "modo": "2",
                                "percentual": pegaVariavel(s, 'mvalor1'),
                                "tipo_calculo": "p",
                                "multa_sobre_juros": (pegaVariavel(s, 'multa_juros') == "sim"),
                                "multa_valor_vincendo": (pegaVariavel(s, 'multa_vincendo') == "sim"), 
                                "multa_sobre_valor_original": (pegaVariavel(s, 'multa_sem_correcao') == "sim")
                            }
                        }

                        var s = res1[n].honorario 
                        if (s == '0') {
                            linha.honorarios  = { modo: '3' }
                        }


                        if ((linha.valor != 0) && (linha.dia != '')) {
                            calc[ idCalc ].lista.push( linha )
                        }
                    }
                })

    salvarCalc(idCalc)
    return "ok"; // calc[ idCalc];
}


app.get('/importa/:idCalc', jsonParser, async function (req, res) {
    var idCalc = req.params.idCalc
    await mysql.configure({host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: senha, database: 'debit' }); 

    let c = await importaCalc(idCalc, mysql)
    res.send(c) 
})

const importaTodos = async function () {
        await mysql.configure({host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: senha, database: 'debit' }); 
    await mysql.query(`select id from calculos.atualizacaoMonetaria where tipo='a2' order by id  `).
                spread(async  function(res1) {   
                    if (res1.length == 0) {
                        console.log('sem valores para converter', idCalc)
                        return
                    }
                    for (var n in res1) {
                        var idCalc = res1[n].id
                        let c = await importaCalc(idCalc, mysql)
                        console.log('importando: ', idCalc, c)
                        if (c == "nao_convertido") {
                            console.log('não convertido: ', idCalc)
                        } else {
                            // console.log('convertido: ', idCalc)
                            salvarCalc(idCalc)
                            mysql.query(`update calculos.atualizacaoMonetaria set tipo='A3' where id=${idCalc}`)
                        }
                        
                    }
                })
 }


app.get('/importaTodos', jsonParser, async function (req, res) {
    importaTodos();
    res.send({success:1})
})


app.get('/ping', async function(req, res) {
	res.send('{ok:1,programa:"importador.js"}')
})

server.listen(porta_api, () => {
  console.log('Importador do Debit Atualiza Server v.2023 - porta: '+porta_api);
});


salvarCalc = function ( idCalc ) {
    // if (! this.salvarAtivo ) return;
    var dados = {
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

    // console.log('salvando: ', nomearq)
    // console.log(j_dados)

    fs.writeFile(nomearq, j_dados, function (err) {
        if (err) return console.log(err);
    });
}



var configuraTabelaMaximo = async function () {
    await mysql.configure({host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: senha, database: 'debit' }); 
    await mysql.query(`select * from maximo`).spread( function(res1) {
        // console.log(res1)
        for (var n in res1) {
            tabelaMaximo.push( { id: res1[n].indice, tabela: res1[n].tabela, inicio: res1[n].inicio})
        }
    })
}

var pegaIdTabela = function (tabela) {
    var x = tabelaMaximo.find( function (el) { return el.tabela == tabela })
    // console.log('x',x)
    if (typeof x === 'undefined') return 0
    return x.id 
}

configuraTabelaMaximo  () 


importaTodos(); 

