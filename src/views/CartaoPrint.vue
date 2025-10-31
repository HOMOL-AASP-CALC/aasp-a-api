<template>
    <div v-html="resultadoHtml"></div>
</template>

<script>
import { ref, onMounted, reactive, provide } from 'vue'
import axios from 'axios'
import { usePerfilStore } from '@/stores/PerfilStore'
import { useRoute, useRouter } from 'vue-router'

export default {
    setup() {

        const route = useRoute()
        const router = useRouter()

        const id = ref('')

        if (route.params.id) id.value = route.params.id

        const pag = ref('')

        const loading = ref('0') // 0 = carregando; 1 = carregado

        if (route.params.pag == 'resultado') {
            pag.value = 3
        } else {
            pag.value = 1
        }

        if (pag.value == 2){
            resultadoHtml.value = ''
        }

        const arrPercDia = reactive([])
        const arrPercSem = reactive([])

        const arrJornadaDiaria = reactive([])
        const arrPeriodoNot = reactive([])

        const perfilStore = ref([])

        const selectDsr = ref([])

        const modoApuracao = ref('diario')
        const jornadaTrabalho = ref('padrao')
        const periodosNoturnos = ref('padrao')

        const nomeCalculo = ref('')
        const descricaoCalculo = ref('')
        const dataInicial = ref('')
        const dataFinal = ref('')
        const modoDigitacao = ref('entradaIntervaloSaida')
        const tabelaDSR = ref('1')
        const periodoInicio = ref('1')

        const inicioSemana = ref('0')
        const diasTrabalhados = ref('7')
        const jornadaSemanalProporcional = ref('sim')

        const dsrDados = ref('')

        const modalClose = ref(null)

        const tipo_repeticao = ref('repetir')
        const repeticaoDataInicial = ref('')
        const repeticaoDataFinal = ref('')

        const modo1Entrada = ref('')
        const modo1Intervalo1 = ref('')
        const modo1Intervalo2 = ref('')
        const modo1Saida = ref('')

        const modo2Entrada = ref('')
        const modo2Saida = ref('')
        const modo2Intervalo = ref('')

        const qtde_segundas = ref('0')
        const qtde_tercas = ref('0')
        const qtde_quartas = ref('0')
        const qtde_quintas = ref('0')
        const qtde_sextas = ref('0')
        const qtde_sabados = ref('0')
        const qtde_domingos = ref('0')
        const qtde_descansos = ref('0')
        const qtde_feriados = ref('0')

        const revezamento_dias_sim = ref('')
        const revezamento_dias_nao = ref('')

        const tipoModal = ref('1')

        const ckDescanso1 = ref(false)
        const ckDescanso2 = ref(false)
        const ckDescanso3 = ref(false)
        const ckDescanso4 = ref(false)
        const ckDescanso5 = ref(false)
        const ckDescanso6 = ref(false)
        const ckDescanso7 = ref(false)
        const ckDescanso8 = ref(false)

        const arrRepeticaoHorarios = ref({})

        perfilStore.value = usePerfilStore()
        perfilStore.value.getPerfil()

        const dadosArquivo = reactive([])
        const resultadoHtml = ref('')

        const updatedMessage = ref('')

        const updateMessage = (msg) => {
            updatedMessage.value = msg
        }

        provide('updateMessage', updateMessage)

        const inputValues = ref({})

        //====================================================================================================
        const formatacaoData = (event) => {
            let formattedValue = event.target.value
                .replace(/\D/g, '') // remove non-numeric characters
                .replace(/^(\d{2})(\d)/g, '$1/$2') // add a slash after the first two digits
                .replace(/^(\d{2})\/(\d{2})(\d{1,4})/, '$1/$2/$3') // format to dd/mm/aaaa

            event.target.value = formattedValue
        }

        //-----------------------------------------------------------------------------------------
        const formatacaoSomenteNum = (event) => {
            let formattedValue = event.target.value
                .replace(/\D/g, '') // remove non-numeric characters
                .slice(0, 4)

            event.target.value = formattedValue
        }

        const formatarHorario = (event) => {
            let input = event.target
            let value = input.value.replace(/\D/g, '')
            let formattedValue = ''

            if (value.length > 0) {
                formattedValue = value.slice(0, 4).match(/.{1,2}/g).join(':')
            }

            input.value = formattedValue
        }

        //-----------------------------------------------------------------------------------------
        function formatDate(input) {
            const year = input.slice(0, 4)
            const month = input.slice(4, 6)
            const day = input.slice(6, 8)
            return `${day}/${month}/${year}`
        }
        //-----------------------------------------------------------------------------------------
        const fetchRows = () => {
            arrPercDia.splice(0, arrPercDia.length,
                {
                    dataInicial: '',
                    dataFinal: '',
                    ate2: '50',
                    de2a3: '50',
                    de3a4: '50',
                    de4a5: '50',
                    mais5: '100',
                    folga: '100'
                }
            )

            arrPercSem.splice(0, arrPercSem.length,
                {
                    dataInicial: '',
                    dataFinal: '',
                    jornadaSemanal: '44',
                    ate10: '50',
                    de10a20: '50',
                    de20a30: '50',
                    de30a40: '50',
                    de40a50: '50',
                    mais50: '100'
                }
            )

            arrJornadaDiaria.splice(0, arrJornadaDiaria.length,
                {
                    dataInicial: '',
                    dataFinal: '',
                    seg: '08:00',
                    ter: '08:00',
                    qua: '08:00',
                    qui: '08:00',
                    sex: '08:00',
                    sab: '04:00',
                    dom: '00:00',
                    des: '00:00'
                }
            )

            arrPeriodoNot.splice(0, arrPeriodoNot.length,
                {
                    dataInicial: '',
                    dataFinal: '',
                    horarioInicial: '22:00',
                    horarioFinal: '05:00'
                }
            )
        }

        fetchRows()

        //-----------------------------------------------------------------------------------------
        function addRow(num) {
            if (num == 1 && arrPercDia.length < 5) {
                arrPercDia.push({
                    dataInicial: '',
                    dataFinal: '',
                    ate2: '',
                    de2a3: '',
                    de3a4: '',
                    de4a5: '',
                    mais5: '',
                    folga: ''
                })
            }

            if (num == 4 && arrPercSem.length < 5) {
                arrPercSem.push(
                    {
                        dataInicial: '',
                        dataFinal: '',
                        jornadaSemanal: '',
                        ate10: '',
                        de10a20: '',
                        de20a30: '',
                        de30a40: '',
                        de40a50: '',
                        mais50: ''
                    }
                )
            }

            if (num == 2 && arrJornadaDiaria.length < 5) {
                arrJornadaDiaria.push({
                    dataInicial: '',
                    dataFinal: '',
                    seg: '',
                    ter: '',
                    qua: '',
                    qui: '',
                    sex: '',
                    sab: '',
                    dom: '',
                    des: ''
                })
            }

            if (num == 3 && arrPeriodoNot.length < 5) {
                arrPeriodoNot.push({
                    dataInicial: '',
                    dataFinal: '',
                    horarioInicial: '',
                    horarioFinal: ''
                })
            }
        }

        //-----------------------------------------------------------------------------------------
        function formatarData2(input) {
            const year = input.slice(0, 4)
            const month = input.slice(4, 6)
            const day = input.slice(6, 8)
            return `${day}/${month}/${year}`
        }
        //====================================================================================================

        const pega_dados = async () => {

            if (route.params.id) id.value = route.params.id

            if (id.value > 0) {
                loading.value = '0'

                const response2 = await axios.get(
                    `${import.meta.env.VITE_API3_URL}/cponto/verifica_cponto/${id.value}`,
                    { withCredentials: true }
                )

                if (response2.data.length && response2.data != 0) {

                    if (response2.data[0].versao != 5) {
                        await router.push('../../../lista/cponto')
                    }

                    nomeCalculo.value = response2.data[0].nome

                    try {
                        console.log('pega_dados 2')
                        loading.value = '0'

                        const appDiv = document.getElementById('app')
                        appDiv.innerHTML = ''

                        appDiv.innerHTML = '<div style="text-align: center; margin-top:100px;"><span type="button" class="pe-none"><span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Carregando...</span></div>'

                        const response = await axios.get(
                            `${import.meta.env.VITE_API3_URL}/cponto/consulta/${id.value}`,
                            { withCredentials: true }
                        )
                        console.log('chamada api')

                        if (response.data) {

                            if (response.data.resultado == 0) {
                                const routePath = '/cp'
                                const resolvedPath = router.resolve(routePath).href
                                await router.push(resolvedPath)
                            } else {
                                const linhas = response.data.split('\n')
                                const objeto = {}

                                for (const linha of linhas) {
                                    const [chave, valor] = linha.split('=')
                                    objeto[chave] = valor
                                }

                                dadosArquivo.value = objeto

                                descricaoCalculo.value = objeto.cabecalho
                                dataInicial.value = formatDate(objeto.data_inicial)
                                dataFinal.value = formatDate(objeto.data_final)
                                if (objeto.modo_digitacao == 0) modoDigitacao.value = 'entradaIntervaloSaida'
                                else modoDigitacao.value = 'entradaSaidaIntervalo'

                                tabelaDSR.value = Number(objeto.tabela_dsr)

                                periodoInicio.value = objeto.periodo_aquisitivo
                                if (objeto.modo_apuracao == 0) modoApuracao.value = 'diario'
                                if (objeto.modo_apuracao == 1) modoApuracao.value = 'semanal'
                                inicioSemana.value = objeto.apuracao_semana
                                diasTrabalhados.value = objeto.apuracao_dia
                                if (objeto.proporcao_semanal == 1) jornadaSemanalProporcional.value = 'sim'
                                if (objeto.proporcao_semanal == 0) jornadaSemanalProporcional.value = 'nao'

                                if (objeto.dspjornadadiaria == 1) jornadaTrabalho.value = 'personalizado'
                                if (objeto.dspjornadadiaria == 0) jornadaTrabalho.value = 'padrao'

                                if (objeto.dsphorario_noturno == 1) periodosNoturnos.value = 'personalizado'
                                if (objeto.dsphorario_noturno == 0) periodosNoturnos.value = 'padrao'

                                arrPercDia.length = 0
                                arrPercSem.length = 0
                                arrJornadaDiaria.length = 0
                                arrPeriodoNot.length = 0

                                for (let i = 1; i <= 5; i++) {
                                    if (objeto.hasOwnProperty(`percdiaini_${i}`)) {

                                        arrPercDia.push({
                                            dataInicial: formatDate(objeto[`percdiaini_${i}`]),
                                            dataFinal: formatDate(objeto[`percdiafim_${i}`]),
                                            ate2: objeto[`percdia2_${i}`],
                                            de2a3: objeto[`percdia3_${i}`],
                                            de3a4: objeto[`percdia4_${i}`],
                                            de4a5: objeto[`percdia5_${i}`],
                                            mais5: objeto[`percdia6_${i}`],
                                            folga: objeto[`percdiafolga_${i}`]
                                        })
                                    }

                                    if (objeto.hasOwnProperty(`percsemanal_ini_${i}`)) {
                                        arrPercSem.push({
                                            dataInicial: formatDate(objeto[`percsemanal_ini_${i}`]),
                                            dataFinal: formatDate(objeto[`percsemanal_fim_${i}`]),
                                            jornadaSemanal: objeto[`percsemanal_jornada_${i}`],
                                            ate10: objeto[`percsemanal_10_${i}`],
                                            de10a20: objeto[`percsemanal_20_${i}`],
                                            de20a30: objeto[`percsemanal_30_${i}`],
                                            de30a40: objeto[`percsemanal_40_${i}`],
                                            de40a50: objeto[`percsemanal_50_${i}`],
                                            mais50: objeto[`percsemanal_60_${i}`]
                                        })
                                    }

                                    if (objeto.hasOwnProperty(`jordia_ini_${i}`)) {

                                        arrJornadaDiaria.push({
                                            dataInicial: formatDate(objeto[`jordia_ini_${i}`]),
                                            dataFinal: formatDate(objeto[`jordia_fim_${i}`]),
                                            seg: objeto[`jordia_seg_${i}`],
                                            ter: objeto[`jordia_ter_${i}`],
                                            qua: objeto[`jordia_qua_${i}`],
                                            qui: objeto[`jordia_qui_${i}`],
                                            sex: objeto[`jordia_sex_${i}`],
                                            sab: objeto[`jordia_sab_${i}`],
                                            dom: objeto[`jordia_dom_${i}`],
                                            des: objeto[`jordia_desc_${i}`]
                                        })
                                    }

                                    if (objeto.hasOwnProperty(`hrnoturno_dataini_${i}`)) {

                                        arrPeriodoNot.push({
                                            dataInicial: formatDate(objeto[`hrnoturno_dataini_${i}`]),
                                            dataFinal: formatDate(objeto[`hrnoturno_datafim_${i}`]),
                                            horarioInicial: objeto[`hrnoturno_horaini_${i}`],
                                            horarioFinal: objeto[`hrnoturno_horafim_${i}`]
                                        })
                                    }
                                }

                                if (pag.value == '1') {
                                    loading.value = '1'
                                }
                            }
                        }

                        if (dadosArquivo.value) {

                            const e1Entries = Object.entries(dadosArquivo.value).filter(([key, value]) =>
                                key.startsWith('e1_')
                            )
                            const e2Entries = Object.entries(dadosArquivo.value).filter(([key, value]) =>
                                key.startsWith('e2_')
                            )
                            const s1Entries = Object.entries(dadosArquivo.value).filter(([key, value]) =>
                                key.startsWith('s1_')
                            )
                            const s2Entries = Object.entries(dadosArquivo.value).filter(([key, value]) =>
                                key.startsWith('s2_')
                            )
                            const wEntries = Object.entries(dadosArquivo.value).filter(([key, value]) =>
                                key.startsWith('w_')
                            )

                            const e1Obj = Object.fromEntries(e1Entries)
                            const e2Obj = Object.fromEntries(e2Entries)
                            const s1Obj = Object.fromEntries(s1Entries)
                            const s2Obj = Object.fromEntries(s2Entries)
                            const wObj = Object.fromEntries(wEntries)

                            const diaStatus = {
                                0: 'Trabalho',
                                1: 'Descanso',
                                2: 'Feriado',
                                3: 'Falta',
                                4: 'Falta Justificada'
                            }

                            let dataInicialFormatada = parseInt(dataInicial.value.split('/').reverse().join(''))
                            let dataFinalFormatada = parseInt(dataFinal.value.split('/').reverse().join(''))

                            for (const key in e1Obj) {
                                let dataCampo = key.split('_')[1]
                                let dataCampoForm = formatarData2(dataCampo)
                                let dataCampoInt = parseInt(dataCampo)

                                if (dataCampoInt >= dataInicialFormatada && dataCampoInt <= dataFinalFormatada) {

                                    let key_e1 = `e1_${dataCampo}`
                                    let key_e2 = `e2_${dataCampo}`
                                    let key_s1 = `s1_${dataCampo}`
                                    let key_s2 = `s2_${dataCampo}`
                                    let key_w = `w_${dataCampo}`

                                    if (e2Obj[key_e2] === undefined) {
                                        inputValues.value[dataCampoForm] = {
                                            entrada: `${e1Obj[key_e1]}`,
                                            inicio_intervalo: `${s1Obj[key_s1]}`,
                                            saida: `${s2Obj[key_s2]}`
                                        }
                                    } else {
                                        inputValues.value[dataCampoForm] = {
                                            entrada: `${e1Obj[key_e1]}`,
                                            inicio_intervalo: `${s1Obj[key_s1]}`,
                                            fim_intervalo: `${e2Obj[key_e2]}`,
                                            saida: `${s2Obj[key_s2]}`
                                        }
                                    }

                                }
                            }

                            for (const key in wObj) {
                                let dataCampo = key.split('_')[1]
                                let dataCampoForm = formatarData2(dataCampo)
                                let dataCampoInt = parseInt(dataCampo)

                                if (dataCampoInt >= dataInicialFormatada && dataCampoInt <= dataFinalFormatada) {
                                    inputValues.value[dataCampoForm] = {
                                        ...inputValues.value[dataCampoForm],
                                        considerar_como: diaStatus[`${wObj[key]}`]
                                    }
                                }
                            }
                        }

                        const respostaExec2 = await axios.post(
                            `${import.meta.env.VITE_API3_URL}/cponto/executa`,
                            {
                                idCartao: id.value,
                                nomeCalculo: nomeCalculo.value,
                                descricaoCalculo: descricaoCalculo.value,
                                dataInicial: dataInicial.value,
                                dataFinal: dataFinal.value,
                                modoDigitacao: modoDigitacao.value,
                                tabelaDSR: tabelaDSR.value,
                                dsrDados: dsrDados.value,
                                periodoInicio: periodoInicio.value,
                                modoApuracao: modoApuracao.value,
                                inicioSemana: inicioSemana.value,
                                diasTrabalhados: diasTrabalhados.value,
                                jornadaSemanalProporcional: jornadaSemanalProporcional.value,
                                arrPercDia: arrPercDia,
                                arrPercSem: arrPercSem,
                                periodosNoturnos: periodosNoturnos.value,

                                arrPeriodoNot: arrPeriodoNot,

                                jornadaTrabalho: jornadaTrabalho.value,
                                arrJornadaDiaria: arrJornadaDiaria,

                                arrCartao: inputValues.value
                            },
                            { withCredentials: true }
                        )

                        appDiv.innerHTML = respostaExec2.data.htmlResposta
                        loading.value = '1'

                    } catch (error) {
                        console.log(error)
                    }
                } else {
                    await router.push('../../../lista/cponto')
                }
            }
        }

        onMounted(async () => {

            const appDiv = document.getElementById('app')
            appDiv.innerHTML = ''

            try {
                const response = await axios.get(`${import.meta.env.VITE_API3_URL}/cponto/dsr_view/pega_todos`, { withCredentials: true })
                selectDsr.value = response.data
                selectDsr.value.sort((a, b) => a.nome.localeCompare(b.nome))

                const novoRegistro = {
                    nome: 'Tabela Padrão (apenas feriados nacionais)',
                    id: 1,
                    dados: '1110001001012104010507091210021115112512'
                }

                selectDsr.value.unshift(novoRegistro)

                dsrDados.value = novoRegistro.dados

            } catch (error) {
                console.error('Erro ao buscar DSRs:', error)
            }

            await pega_dados()

            window.print()
        })

        //====================================================================================================
        return {
            id,
            pag,
            arrPercDia,
            arrJornadaDiaria,
            arrPeriodoNot,
            arrPercSem,

            addRow,
            perfilStore,
            formatacaoData,
            formatacaoSomenteNum,
            formatarHorario,
            selectDsr,
            modoApuracao,
            jornadaTrabalho,
            periodosNoturnos,

            nomeCalculo,
            descricaoCalculo,
            dataInicial,
            dataFinal,
            modoDigitacao,
            tabelaDSR,
            periodoInicio,

            inicioSemana,
            diasTrabalhados,
            jornadaSemanalProporcional,

            dsrDados,
            modalClose,

            tipo_repeticao,
            repeticaoDataInicial,
            repeticaoDataFinal,
            modo1Entrada,
            modo1Intervalo1,
            modo1Intervalo2,
            modo1Saida,
            modo2Entrada,
            modo2Saida,
            modo2Intervalo,
            revezamento_dias_nao,
            revezamento_dias_sim,
            qtde_segundas,
            qtde_tercas,
            qtde_quartas,
            qtde_quintas,
            qtde_sextas,
            qtde_sabados,
            qtde_domingos,
            qtde_descansos,
            qtde_feriados,
            ckDescanso1,
            ckDescanso2,
            ckDescanso3,
            ckDescanso4,
            ckDescanso5,
            ckDescanso6,
            ckDescanso7,
            ckDescanso8,

            arrRepeticaoHorarios,
            tipoModal,

            dadosArquivo,
            resultadoHtml,
            loading,

            pega_dados
        }
    }
}
</script>
