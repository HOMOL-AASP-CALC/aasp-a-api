const axios = require('axios');
require('dotenv').config()  
var servidorAPI = process.env.servidorAPI


async function rodar() {

    let url1 = `${servidorAPI}/s3052/renomeia` 

    let dados = {
        nome: 'yyyy Newww',
        idCalc: 26058672
    }
  
    await axios.post(url1, dados).then( function(r) {
        console.log( JSON.stringify(r.data) )
    })

}

rodar()