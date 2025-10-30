require('dotenv').config()  


var mysql_senha = process.env.MYSQL_password

const mysql = require('mysql2')  
var mysql_info = {host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: mysql_senha, database: process.env.MYSQL_database }

var	con =   mysql.createPool(mysql_info).promise() ;

const converte = async function () {

// tjsp_precatorios

    let q = `SELECT dia, valor, 101.08758600/valor as indice FROM tjsp_cnj303_2019 ORDER BY dia `
    console.log(q)
    let [ res1 ] = await con.query(q)
    console.table(res1)


}

converte()