
require('dotenv').config()  
const mysql = require('mysql2')
const axios = require('axios').default;
var calcUtil = require('./calcUtil.js');

const apikey = {
    denise: 'T04JPU6GB6V/B0605CZ602V/q76VrEubLXq1PP6uakIVXmq9',
    lidia: 'T04JPU6GB6V/B05V6HP7TDX/W5BqQwoGVBuyGOWC40L5MS5u'
}

var con = null; 

this. mysql_senha = process.env.MYSQL_password2 

this.mysql_info = {host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: this.mysql_senha, database: process.env.MYSQL_database }

this.handleDisconnect = function() {
    con =   mysql.createPool(this.mysql_info).promise() // mysql1.createConnection(mysql_info); 

    con.on('error', function(err) {
        console.log('---- mysql desconectou ---- ', err);
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
    var lista_valida = [] 


    var d = calcUtil.dia2yyyymmdd(  calcUtil.diminuiDia( calcUtil.diaHoje() ))  
    // var d = '20231002'

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
    

    // ----

    var q  = `SELECT id_login, validade FROM cliente_planos  WHERE  validade = '${d}'  AND cliente_planos.debauto = '0' and pacote='500' group by id_login   ORDER BY id_login, cliente_planos.validade DESC;`
    var [r] =  await con.query(q) 
    console.log(q)

    for (var i in r) {
        let r_id_login = r[i].id_login 
        let q1 = `SELECT id_login, id, dia_vcto FROM assina_pedido WHERE id_login = '${r_id_login}' and dia_vcto> '${d}' `
        let [ r1 ] = await con.query(q1)

        let q2 = `SELECT * FROM assina_pedido WHERE id_login = '${r_id_login}' and operacao='P' and melhor_pacote!='500' `
        let [ r2 ] = await con.query(q2)
        // console.log(q2)
        // console.log('r2 - length', r2.length)
        
        if (r1.length == 0 && r2.length == 0) {
            enviaSlack(r[i].id_login, r[i].id_login+' - '+r[i].validade+': terminou prazo de 7 dias', 'lidia') 
        } else {
            enviaSlack(r[i].id_login, r[i].id_login+' - '+r[i].validade+': terminou prazo de 7 dias', 'denise') 
        }
    }

}

 consulta1()


// console.log('-- fim -- ')

// enviaSlack('aa', 'bb')
// enviaSlack(r[i].id_login, r[i].nome+' - '+r[i].email)
