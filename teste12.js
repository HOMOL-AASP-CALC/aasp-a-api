const axios = require('axios');
require('dotenv').config()  
var servidorAPI = process.env.servidorAPI
var selic_inicio = '01/01/2021'
var dataAtual = '01/12/2024'


async function rodar() {

    let url1 = `${servidorAPI}/calculosDiversos/tabelaDireta` 

    let dados = {"completa":true,"dataAtual":"01/10/2025","indexador":5,"jurosTab":[{"modo":12,"ate":0}],"modoSelic":"princJuros","calc_selic":false,"selic_inicio":"01/10/2025"}

    // let dados = {"completa":true,"dataAtual":"30/09/2025","indexador":4633,"jurosTab":[{"modo":12,"ate":0}],"modoSelic":"princJuros","calc_selic":false,"selic_inicio":"30/09/2025"}
 
    // let dados = {"completa":true,"dataAtual":"02/10/2025","jurosTab":[{"modo":12,"ate":0}],"modoSelic":"princJuros","calc_selic":true}
    
    await axios.post(url1, dados).then( function(r) {
        console.log( JSON.stringify(r.data) )
    })

}

rodar()