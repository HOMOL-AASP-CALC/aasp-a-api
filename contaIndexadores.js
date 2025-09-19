
require('dotenv').config()
const fs = require('fs').promises
const mysql = require('mysql2/promise')
const calcUtil = require('./calcUtil.js')

async function main() {
    let mysqlPassword = process.env.MYSQL_password
    if (process.env.MYSQL_host !== 'localhost') {
        mysqlPassword = mysqlPassword + '#'
    }

    const con = mysql.createPool({
        host: process.env.MYSQL_host,
        user: process.env.MYSQL_user,
        password: mysqlPassword,
        database: 'calculos'
    })

    const [rows] = await con.query('SELECT id FROM atualizacaoMonetaria where tipo="a3" ')
    const pasta = process.env.pasta_calculos
    const counts = {}

    for (const row of rows) {
        const id = row.id
        const n = parseInt(id / 1500)
        const filePath = `${pasta}/${n}/${id}.a3`
        try {
            const data = await fs.readFile(filePath, 'utf8')
            const json = calcUtil.JSON_parseAutoCorrige(data)
            const nomeIndexador = json?.info?.nomeIndexador
            if (nomeIndexador) {
                counts[nomeIndexador] = (counts[nomeIndexador] || 0) + 1
            }
            // console.log(`Lido ${filePath} - Indexador: ${nomeIndexador || 'desconhecido'}`)
        } catch (err) {
            // console.error(`Erro lendo ${filePath}: ${err.message}`)
        }
    }

    let a = [] 
    for (const key in counts) {
        if (counts[key] >= 100) {
            a.push({ indexador: key, count: counts[key] })
        }
    }

    
    const csvLines = ['indexador,count', ...a.map(item => `${item.indexador},${item.count}`)]
    await fs.writeFile('counts.csv', csvLines.join('\n'), 'utf8')
    await con.end()
}

main().catch(err => {
    console.error('Erro geral', err)
})