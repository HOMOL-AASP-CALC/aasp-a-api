
var axios = require('axios');

var params = new URLSearchParams();

params.append('apikey', '1d070583-b71b-49ab-adf8-df780b0e4f11' )
params.append('tabela', 'tj_sp_depre' )

const url = 'https://client-api.debit.com.br/atualiza-v1/lerTabela'


axios.post(url, params).
then(function (resposta) {
    console.table(resposta.data)

}).catch(function (error) {
    console.log(error)
})