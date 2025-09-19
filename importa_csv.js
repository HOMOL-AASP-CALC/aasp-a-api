require('dotenv').config()  
const fs = require('fs')
const calcUtil = require('./calcUtil.js');

const nomearq = '/Users/mrozgrin/Desktop/poupanca_204.csv' 
var mysql_senha = process.env.MYSQL_password

const mysql = require('mysql2')  
var mysql_info = {host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: mysql_senha, database: process.env.MYSQL_database }

var	con =   mysql.createPool(mysql_info)

const converte =  function () {
    fs.readFile(nomearq, 'utf8', (err, dados) => {
        console.log(dados)
        var linhas = dados.split('\n')
        for (let i in linhas) {
            var linha = linhas[i]
            var campos = linha.split(';')
            var dia =  calcUtil.dia2yyyymmdd(campos[0])
            var valor = campos[2].replace(',','.')



            let q = `insert into poupanca_204_datafim (dia, valor) VALUES ('${dia}', '${valor}' )`
            // console.log(dia, valor)
            console.log(q)
            con.query(q)    
        
        }
 
    })
}

converte()