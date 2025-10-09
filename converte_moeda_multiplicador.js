require('dotenv').config()  

const tabela = 'tjsp_precatorios'

const mysql_senha = process.env.MYSQL_password2

const mysql = require('mysql2')  
var mysql_info = {host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: mysql_senha, database: process.env.MYSQL_database }

var	con =   mysql.createPool(mysql_info).promise() ;

const converte = async function () {

    let q = `SELECT dia, valor, 7.88252300/valor as indice FROM ${tabela} ORDER BY dia `
    console.log(q)
    let [ res1 ] = await con.query(q)
    console.table(res1)


}

converte()