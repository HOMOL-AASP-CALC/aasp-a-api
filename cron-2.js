
require('dotenv').config()  
const mysql = require('mysql2')
const axios = require('axios').default;
var calcUtil = require('./calcUtil.js');
var cron = require('node-cron');
const servidorAPI = process.env.servidorAPI
const servidorGeralAPI = process.env.servidorGeralAPI

const apikey = {
    denise: 'T04JPU6GB6V/B0605CZ602V/q76VrEubLXq1PP6uakIVXmq9'
}

var con = null; 

this. mysql_senha = process.env.MYSQL_password2 
// if (process.env.MYSQL_host != "localhost") {
//     this.mysql_senha = this.mysql_senha+"#";
// }
this.mysql_info = {host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: this.mysql_senha, database: process.env.MYSQL_database }

this.handleDisconnect = function() {
    con =   mysql.createPool(this.mysql_info).promise() // mysql1.createConnection(mysql_info); 

    con.on('error', function(err) {
        // console.log('---- mysql desconectou ---- ', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
            handleDisconnect(); 
        } else { 
            throw err; 
        }
    });
}
this.handleDisconnect();



var tempo = 0 
const enviaSlack = (idLogin, str, vendedor) => {
    let dados = {"text": `${idLogin} - ${str} `}
    console.log(vendedor, dados)
    let api1 = apikey[vendedor]

    setTimeout( () => {
        axios.post(`https://hooks.slack.com/services/${api1}`, dados  )
    }, tempo)
    tempo = tempo + 2000
}

const consulta1 = async () => {
    var d = calcUtil.dia2yyyymmdd(  calcUtil.diminuiDia( calcUtil.diaHoje() ))  

    var q  = `SELECT id_login, validade FROM cliente_planos  WHERE  validade = '${d}'  AND cliente_planos.debauto = '0' and pacote!='500' group by id_login  ORDER BY id_login, cliente_planos.validade DESC;`
    console.log(q)
    var [r] =  await con.query(q) 

    for (var i in r) {
        let r_id_login = r[i].id_login 
        let q1 = `SELECT id_login, id, dia_vcto FROM assina_pedido WHERE id_login = '${r_id_login}' and dia_vcto> '${d}' `
        let [ r1 ] = await con.query(q1)
        
        if (r1.length == 0) {
            enviaSlack(r[i].id_login, r[i].id_login+' - '+r[i].validade+': deveria ter pago ontem', 'denise') 
        }
    }
}


const rastreador = async () => {
    let d1 = calcUtil.diaHoje()
    let d2 = calcUtil.diminuiDia( d1 ) 

    let q1 = 'update rastreador_www2 set parametros=substring(datahora, 1, 8);'
    let q2  = `insert into rastreador_www2_diario (dia, pagina, acessos) select  parametros, pagina, count(id) as acessos from rastreador_www2 where parametros='${d2}' group by parametros, pagina;` 
    let q3 = `delete from rastreador_www2 where parametros <> '${d1}' and parametros <> '';`

    console.log(q1)
    console.log(q2)
    console.log(q3)

    await con.query(q1) 
    await con.query(q2) 
    await con.query(q3) 

}

const querysDiarias = async () => {
    var q  = `update  rastreador_www2 set pagina=substring(pagina, 2)  where pagina != "/" and  substring(pagina, 1, 1) = "/"`
    console.log(q)
    con.query(q) 
}

const avisa_antes_vencer = async () => {
    let d1 = calcUtil.diaHoje() 
    for (let i=0; i<5; i++) {
        d1 = calcUtil.somaDia(d1 )
    }
    let d2 = calcUtil.dia2yyyymmdd( d1 )

    var q = `SELECT id_login FROM cliente_planos WHERE validade='${d2}' AND debauto!='1' AND pacote!='500' group by id_login`;
    console.log(q)
    var [r] =  await con.query(q) 
    console.table(r)

    for (let i in r) {
        let q2 = `SELECT * FROM login WHERE id='${r[i].id_login}'`
        console.log(q2)
        let [r2] = await con.query(q2)

        let id = r2[0].id
        let email = r2[0].email
        let email_cobranca = r2[0].email_cobranca
        if (email_cobranca.length > 5) { email = email_cobranca }
        let revendedor = r2[0].revendedor
        let nao_enviar_boletos = r2[0].nao_enviar_boletos_automaticamente
        let nome = r2[0].nome
        // let id_atendente_crm = r2[0].id_atendente_crm

        // pode enviar email? se não, passa para o prx cliente 
        if (!email || revendedor == 6 || nao_enviar_boletos > 0) {
            // console.log('id_login: sai fora 85 - '+email+' - '+revendedor+'  - '+nao_enviar_boletos)
            continue
        }

        let dadosGerente = { nome: 'Denise', email: 'denise.suporte@debit.com.br' }

        // verifica se ja tem pedido gerado
        // let q3 = `SELECT * FROM assina_pedido WHERE id_login='${id}'AND dia_liberado>='${calcUtil.diminuiMes(d2)}' AND dia_liberado<='${d2}' AND operacao IN ('b', 'b2', 'p') `;
        // console.log(q3)
        // let [r3] = await con.query(q3)
        // if (r3.length > 0) {
        //     console.log('id_login: este cliente ja tem pedido gerado')
        //     continue
        // }

        let frase_assinatura = 'Sua assinatura do site Debit.com.br vencerá no dia ' + calcUtil.yyyymmdd2dia(d2);
        let substituicoes = {
             nome_cliente :  nome, 
             frase_assinatura,  
             nome_atendente: dadosGerente.nome,  
             email_atendente: dadosGerente.email
            }
        let substituicoesStr = JSON.stringify(substituicoes)

        let q4 = `INSERT INTO debit_controle.envia_email_node (id_login, email, id_modelo, momento_agendado, resposta, substituicoes, programa_insercao, id_sendgrid, abriu, clicou) VALUES ('${id}', '', '30', '0', '', '${substituicoesStr}', 'node/cron-2', '', '', '') `;
        console.log(q4)
        let [r4] = await con.query(q4)

    }


}

// cron.schedule('* * * * *', () => {
//     console.log('a cada minuto');
// });



const enviaResultadosAtualizados = async () => {
    let contador = 0 
    let enviados = [] 
    let hoje = calcUtil.diaHoje() 
    
    let fim = calcUtil.diminuiMes(hoje)
    let ini = calcUtil.diminuiDia(fim)
    for (let i=0; i<7; i++) {
        ini = calcUtil.diminuiDia(ini)
    }

    fim = calcUtil.dia2yyyymmdd(fim)+'0000'
    ini = calcUtil.dia2yyyymmdd(ini)+'0000'

    
    var q = `SELECT calculos.atualizacaoMonetaria.*, debit.login.nome as nomecliente FROM calculos.atualizacaoMonetaria, debit.login WHERE (debit.login.id=calculos.atualizacaoMonetaria.id_login) and diahora >= '${ini}' AND diahora <= '${fim}' AND lixo=0 AND id_login > 5 AND revendedor!=6 ORDER BY id_login DESC;`;
    var [r] =  await con.query(q) 
    // console.table(r)

    for (let i in r) {
        let enviou = enviados.includes(r[i].id_login)
        let idCalc = r[i].id
        let nomecalc = r[i].nome
        let diahora = r[i].diahora
        let idLogin = r[i].id_login

        if (!enviou) {
            // calcular se houve mudança 
            let enviarEmail = true
            // aqui abre o calculo e compara as duas versões
            let url1 = `${servidorAPI}/calculosDiversos/comparaResultado`
            let url2 = servidorGeralAPI + '/email/agenda_email'
            // if (contador > 500 ) { return; }
            try {
                var c = await axios.post(url1, { idCalc, tipo: 'atualizacaoMonetaria' }  )
                if (typeof c.data.resultado1 !== 'undefined' && 
                    typeof c.data.resultado2 !== 'undefined' && 
                    typeof c.data.resultado2.dia_atualiza !==  'undefined' && 
                    c.data.resultado1.soma_final != 0 && 
                    c.data.resultado2.soma_final != 0 && 
                    c.data.resultado1.soma_final != c.data.resultado2.soma_final) {

                    console.log("enviar email: ", idCalc, ":", c.data.resultado1.dia_atualiza, c.data.resultado2.dia_atualiza, c.data.resultado1.soma_final, c.data.resultado2.soma_final)

                    // var idLogin = 15
                    var dados = {
                        'id_login': idLogin,
                        'id_modelo': 136,
                        'momento_agendado': 0,
                        'substituicoes': JSON.stringify({
                            nome_cliente:  r[i].nomecliente,
                            nomecalc,
                            idCalc,
                            diahora: calcUtil.yyyymmdd2dia(diahora),
                            valora: calcUtil.formataNum(c.data.resultado1.soma_final, 2),
                            valorb: calcUtil.formataNum(c.data.resultado2.soma_final,2)
                        }),
                        'programa_insercao': 'cron-calculoAtualizado.js'
                    }

                    let c1 = await axios.post( url2, dados,{	headers: { 'Origin': process.env.servidorGeralAPI }	})
                }
            } catch (e) {
                console.log(`*** axios error com idCalc ${idCalc}: `, url1)
            }
            
            // console.log(c.data)

            if (enviarEmail) {
                enviados.push(r[i].id_login)
                contador++
            }
        }

    }
    console.log('e-mails enviados: ', contador)
}



const enviaResultadosAtualizadosCJ = async () => {
    let contador = 0 
    let enviados = [] 
    let hoje = calcUtil.diaHoje() 
    
    let fim = calcUtil.diminuiMes(hoje)
    let ini = calcUtil.diminuiDia(fim)
    for (let i=0; i<7; i++) {
        ini = calcUtil.diminuiDia(ini)
    }

    fim = calcUtil.dia2yyyymmdd(fim)+'0000'
    ini = calcUtil.dia2yyyymmdd(ini)+'0000'

    
    var q = `SELECT calculos.calculosJudiciais.*, debit.login.nome as nomecliente FROM calculos.calculosJudiciais, debit.login WHERE (debit.login.id=calculos.calculosJudiciais.id_login) and diahora >= '${ini}' AND diahora <= '${fim}' AND lixo=0 AND id_login > 5 AND revendedor!=6 ORDER BY id_login DESC;`;
    var [r] =  await con.query(q) 
    console.table(r)

    for (let i in r) {
        let enviou = enviados.includes(r[i].id_login)
        let idCalc = r[i].id
        let nomecalc = r[i].nome
        let diahora = r[i].diahora
        let idLogin = r[i].id_login

        if (!enviou) {
            // calcular se houve mudança 
            let enviarEmail = true
            // aqui abre o calculo e compara as duas versões
            let url1 = `${servidorAPI}/calculosDiversos/comparaResultado`
            let url2 = servidorGeralAPI + '/email/agenda_email'
            // if (contador > 500 ) { return; }
            try {
                console.log(url1)
                var c = await axios.post(url1, { idCalc, tipo: 'calculosJudiciais' }  )

                console.log(c.data)

                if (typeof c.data.resultado1 !== 'undefined' && 
                    typeof c.data.resultado2 !== 'undefined' && 
                    typeof c.data.dia_atualiza !==  'undefined' && 
                    c.data.resultado1 != 0 && 
                    c.data.resultado2 != 0 && 
                    c.data.resultado1 != c.data.resultado2) {

                    console.log("enviar email: ", idCalc, ":", c.data.resultado1, c.data.resultado2)

                    // var idLogin = 15
                    var dados = {
                        'id_login': idLogin,
                        'id_modelo': 136,
                        'momento_agendado': 0,
                        'substituicoes': JSON.stringify({
                            nome_cliente:  r[i].nomecliente,
                            nomecalc,
                            idCalc,
                            diahora: calcUtil.yyyymmdd2dia(diahora),
                            valora: calcUtil.formataNum(c.data.resultado1.soma_final, 2),
                            valorb: calcUtil.formataNum(c.data.resultado2.soma_final,2)
                        }),
                        'programa_insercao': 'cron-calculoAtualizado.js'
                    }

                    // let c1 = await axios.post( url2, dados,{	headers: { 'Origin': process.env.servidorGeralAPI }	})
                }
            } catch (e) {
                console.log(`*** axios error com idCalc ${idCalc}: `, url1)
            }
            
            // console.log(c.data)

            if (enviarEmail) {
                enviados.push(r[i].id_login)
                contador++
            }
        }

    }
    console.log('e-mails enviados: ', contador)
}

const pegaEmail = async (idCalc, ferramenta) => {
    if (ferramenta == 'tabelaFinanciamento') {
        ferramenta = 'tabelasFinanciamento'
    }
    let q = 'select debit.login.*, calculos.'+ferramenta+'.* from debit.login, calculos.'+ferramenta+' where debit.login.id=calculos.'+ferramenta+'.id_login and calculos.'+ferramenta+'.id='+idCalc
    console.log(q)
    let [r] = await con.query(q)
    if (r.length > 0) {
        return { email: r[0].email, nome: r[0].nome }
    } else {
        console.log('não encontrou email para idCalc: ', idCalc);
        return { email: '', nome: '' }  
    }
}


const  verificaPesquisa1 = async () => {
    let q1 = `select * from debit_controle.pesquisa1 where emailEnviado = 0 and resposta='nao' limit 3`;
    let url1 = servidorGeralAPI + '/email/agenda_email'

    let [r1] = await con.query(q1)

    console.table(r1)

    for (let i in r1) {
        let idPesquisa = r1[i].id
        let ferramenta =  r1[i].pagina 
        let idCalc = r1[i].idCalc
        let idLogin = r1[i].id_login

        if (ferramenta == 'calculadoraCalculoJudicial') {
            ferramenta =  'calculosJudiciais'
        }


        let maisInfo = await pegaEmail(idCalc, ferramenta) 


        var dados = {
            'id_modelo': 139,
            'momento_agendado': 0,
            'substituicoes': JSON.stringify({ferramenta, idCalc, nome_cliente: maisInfo.nome}),
            'programa_insercao': 'cron-2.js: verificaPesquisa1'
        }
        dados.email = maisInfo.email
        dados.nome_cliente =    maisInfo.nome

        if (idLogin > 0) {
            dados.id_login = idLogin
        } else {
            if (maisInfo.email) {
                dados.email = maisInfo.email
            }
        }

        // console.log('enviando', dados)

        axios.post( url1, dados,{	headers: { 'Origin': process.env.servidorGeralAPI }	}).catch( function (err) {
            console.log('cron-2 linha: 360 - axios error: '+url1)
        }) 

        let q2 = `update debit_controle.pesquisa1 set emailEnviado=139 where id = ${idPesquisa}`;
        // console.log(q2)
        await con.query(q2)
    }

   


}


console.log('cron-2.js: iniciado');



verificaPesquisa1() 

cron.schedule('*/10 * * * *', () => {
    console.log('manda email para pesquisa mal avaliada');
    verificaPesquisa1();
});


cron.schedule('30 6 * * 2', () => {
    console.log('manda calculos juridicos atualizados');
    enviaResultadosAtualizadosCJ();
});


cron.schedule('30 6 * * 1', () => {
    console.log('manda calculos atualizados');
    enviaResultadosAtualizados();
});

cron.schedule('30 8 * * *', () => {
    console.log('avisa antes de vencer');
    avisa_antes_vencer();
});

cron.schedule('31 8 * * *', () => {
    console.log('consulta1');
    consulta1();
});


cron.schedule('0 1 * * *', () => {
    querysDiarias();
});

cron.schedule('3 0 * * *', () => {
    rastreador();
});


// consulta1();

/*

# ┌────────────── second (optional)
# │ ┌──────────── minute
# │ │ ┌────────── hour
# │ │ │ ┌──────── day of month
# │ │ │ │ ┌────── month
# │ │ │ │ │ ┌──── day of week
# │ │ │ │ │ │
# │ │ │ │ │ │
# * * * * * *

*/