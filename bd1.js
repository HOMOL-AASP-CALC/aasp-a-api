


require('dotenv').config()  
const mysql = require('mysql2')
const axios = require('axios').default;
var calcUtil = require('./calcUtil.js');

var con = null; 

this. mysql_senha = process.env.MYSQL_password2
// if (process.env.MYSQL_host != "localhost") {
//     this.mysql_senha = this.mysql_senha+"#";
// }
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


const consulta1 = async () => {
    var d = calcUtil.dia2yyyymmdd( calcUtil.diaHoje() )
    var d = '20231002'
    var q  = "SELECT cliente_planos.id_login FROM `cliente_planos`, login WHERE login.id=cliente_planos.id_login and validade >= '30000000' and revendedor <> 6 group by cliente_planos.id_login ORDER BY `cliente_planos`.`id_login` ASC"
    var [r] =  await con.query(q) 
    console.log(q)
    console.table(r)

    for (var i in r) {
        q = `delete from cliente_planos WHERE id_login = '${r[i].id_login}';  `
        console.log(q)
    }

    return (r)
}

consulta1()
console.log('-- fim -- ')

// enviaSlack('aa', 'bb')
// enviaSlack(r[i].id_login, r[i].nome+' - '+r[i].email)


