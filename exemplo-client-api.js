var axios = require('axios');

const lista = [
    {"dia":"01/01/2010","valor":10000}, 
    {"dia":"01/02/2010","valor":20000}
]

const params = {
    dataAtualizacao: '01/01/2023',
    indiceAtualizacao: 'igpm',
    lista,
    apikey: '055c122b-234c-4d94-8f8e-bdd023a4fdfc'
}

const url = 'https://client-api.debit.com.br/atualiza-v1/atualiza'

axios.post(url, params).
then(function (resposta) {
    console.log(resposta.data)
}).catch(function (error) {
    console.log(error)
})


