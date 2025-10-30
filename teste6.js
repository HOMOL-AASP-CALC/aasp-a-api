require('dotenv').config()  


var mysql_senha = process.env.MYSQL_password

const mysql = require('mysql2')  
var mysql_info = {host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: mysql_senha, database: process.env.MYSQL_database }

var	con =   mysql.createPool(mysql_info).promise() ;
var dados = [{"dia":"04/1979","valor":3.45},{"dia":"05/1979","valor":1.76},{"dia":"06/1979","valor":3},{"dia":"07/1979","valor":5.36},{"dia":"08/1979","valor":5.79},{"dia":"09/1979","valor":6.61},{"dia":"10/1979","valor":5.06},{"dia":"11/1979","valor":6.1},{"dia":"12/1979","valor":4.51},{"dia":"01/1980","valor":6.56},{"dia":"02/1980","valor":4.15},{"dia":"03/1980","valor":5.12},{"dia":"04/1980","valor":4.85},{"dia":"05/1980","valor":5.53},{"dia":"06/1980","valor":5.52},{"dia":"07/1980","valor":5.51},{"dia":"08/1980","valor":5.15},{"dia":"09/1980","valor":4.45},{"dia":"10/1980","valor":9.65},{"dia":"11/1980","valor":8.03},{"dia":"12/1980","valor":6.8},{"dia":"01/1981","valor":6.21},{"dia":"02/1981","valor":6.05},{"dia":"03/1981","valor":5.35},{"dia":"04/1981","valor":6.54},{"dia":"05/1981","valor":5.51},{"dia":"06/1981","valor":5.07},{"dia":"07/1981","valor":6.2},{"dia":"08/1981","valor":6.12},{"dia":"09/1981","valor":5.28},{"dia":"10/1981","valor":4.62},{"dia":"11/1981","valor":5.23},{"dia":"12/1981","valor":5.69},{"dia":"01/1982","valor":6.71},{"dia":"02/1982","valor":6.58},{"dia":"03/1982","valor":5.24},{"dia":"04/1982","valor":5.65},{"dia":"05/1982","valor":6.66},{"dia":"06/1982","valor":7.14},{"dia":"07/1982","valor":6.39},{"dia":"08/1982","valor":5.57},{"dia":"09/1982","valor":4.3},{"dia":"10/1982","valor":3.91},{"dia":"11/1982","valor":5.26},{"dia":"12/1982","valor":8.19},{"dia":"01/1983","valor":9.14},{"dia":"02/1983","valor":8.04},{"dia":"03/1983","valor":7.22},{"dia":"04/1983","valor":6.57},{"dia":"05/1983","valor":6.71},{"dia":"06/1983","valor":10.83},{"dia":"07/1983","valor":11.43},{"dia":"08/1983","valor":9.85},{"dia":"09/1983","valor":11.27},{"dia":"10/1983","valor":10.1},{"dia":"11/1983","valor":7.37},{"dia":"12/1983","valor":8.34},{"dia":"01/1984","valor":9.39},{"dia":"02/1984","valor":9.74},{"dia":"03/1984","valor":9.83},{"dia":"04/1984","valor":9.52},{"dia":"05/1984","valor":8.71},{"dia":"06/1984","valor":9.96},{"dia":"07/1984","valor":9.11},{"dia":"08/1984","valor":8.57},{"dia":"09/1984","valor":11.1},{"dia":"10/1984","valor":10.49},{"dia":"11/1984","valor":10.33},{"dia":"12/1984","valor":11.62},{"dia":"01/1985","valor":11.84},{"dia":"02/1985","valor":10.95},{"dia":"03/1985","valor":9.94},{"dia":"04/1985","valor":8.58},{"dia":"05/1985","valor":7.2},{"dia":"06/1985","valor":8.33},{"dia":"07/1985","valor":10.08},{"dia":"08/1985","valor":11.61},{"dia":"09/1985","valor":10.09},{"dia":"10/1985","valor":10.25},{"dia":"11/1985","valor":14.18},{"dia":"12/1985","valor":15.75},{"dia":"01/1986","valor":15.01},{"dia":"02/1986","valor":12.46},{"dia":"03/1986","valor":3.18}]

const converte = async function () {


    for (let i in dados) {
        let item = dados[i]
        let v = item.valor
        let d = item.dia[3]+item.dia[4]+item.dia[5]+item.dia[6]+item.dia[0]+item.dia[1]+'01' 

        let q = `insert into inpc (dia, valor) values ('${d}', '${v}');`
        console.log(q)
        // let [res2] = await con.query(q)
    }
    
    // console.table(res1)


}

converte()