import api from '@/plugins/axios'

const baseLegacyUrl = import.meta.env.VITE_DEBIT_LEGACY_URL
const atuaApi = import.meta.env.VITE_SERVER_ATUA_API_URL

export default {
    getEndpoint(idDono) {
        return api.get(`/lista/endpoint_atua/${idDono}`)
    },
    getEndpointCponto() {
        return api.get(`/menu/endpoint_cponto`)
    },
    async registrarRecente(calc){
        console.log('registrando em recentes...')
        return api.post('/lista/calculo/visualizar', calc)
    },
    getLista(dados, offset, limit) {
        console.log('GETLISTA axios' )
        console.log('hdA', api.defaults.headers.Authorization)
        //remove caracteres mysql da busca
        dados.busca = dados.busca.replace(/[%_]/g, '')
        console.log('busca = ', dados.busca)

        return api.post(`/lista/calculos?pagina=${offset}&limite=${limit}`, dados)
    },
    deleteLista(dados) {
        console.log('deletando...')
        return api.post('/lista/deleteCalculos', dados)
    },
    renomearCalculo(dados) {
        console.log('renomeando...')
        return api.post('/lista/renomearCalculo', dados)
    },
    favoritarCalculo(dados) {
        console.log('favoritando...')
        return api.post('/lista/favoritar-calculo', dados)
    },
    copiarCalculo(dados) {
        const tabela = dados.tipo
        const tipo = dados.subtipo

        let url = ''

        if (tabela === "atual" || tabela === "trab") {
            switch (tipo) {
                case "A3":
                    break
                case "A2":
                    url = baseLegacyUrl + '/atualiza2/copiar_atual.php?id=' + dados.id
                    break
                case "T4":
                    url = baseLegacyUrl + '/trabalhista/copiar_ct2.php?id=' + dados.id
                    break
                case "T5":
                    url = baseLegacyUrl + '/trabalhista/copiar_ct3.php?id=' + dados.id
                    break
                case "TRAB":
                    url = baseLegacyUrl + '/trabalhista/ct40.php?id_calc=' + dados.id
                    break
                default:
                    url = ''
                    break
            }
        } else {
            let t
            switch (tabela) {
                case "jud":
                    t = 'calculosJudiciais'
                    break
                case "tabjud":
                    t = 'tabelasJudiciais'
                    break
                case "finan":
                    t = 'tabelasFinanciamento'
                    break
                case "deved":
                    t = 'saldoDevedor'
                    break
                case "cponto":
                    t = 'cartaoPonto'
                    break
                case "difn":
                    t = 'prevDifNRecebidas'
                    break
                case "prevct":
                    t = 'prevCT'
                    break
            }
        // prevCT

            url = atuaApi+`/calculosDiversos/copiar/${t}/${dados.id}`
        }

        return url
    },

    async duplicaCP(idCalc){
        console.log('ListaCalculoService.duplicaCP = ', idCalc)

        if(idCalc){
            await api.post(`${import.meta.env.VITE_API3_URL}/cponto/duplica`,{idCalc: idCalc },{ withCredentials: true })
            return true
        }else{
            return false
        }
    }
}
