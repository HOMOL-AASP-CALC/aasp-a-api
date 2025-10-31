<script setup>
import { ref, onMounted, reactive, watch, provide } from 'vue'
import axios from 'axios'
import { usePerfilStore } from '@/stores/PerfilStore'
import { useRoute, useRouter } from 'vue-router'
import CPonto20 from '@/components/CPonto20.vue'

const route = useRoute()
const router = useRouter()

const id = ref('')

if (route.params.id) id.value = route.params.id

const loading = ref('0') // 0 = carregando; 1 = carregado
if (!id.value) loading.value = 1

const pag = ref('')

if (route.params.pag == 'resultado') {
    console.log('pag === resultado')
    pag.value = 3
} else {
    pag.value = 1
}

if (pag.value == 2) {
    resultadoHtml.value = ''
}

const cartaoEncontrado = ref(true)

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
let perfil = usePerfilStore()

const dadosArquivo = reactive([])
const resultadoHtml = ref('')

const updatedMessage = ref('')

const updateMessage = (msg) => {
    updatedMessage.value = msg
    console.log('updatedMessage: ', updatedMessage.value)
}

provide('updateMessage', updateMessage)

const inputValues = ref({})

const editavel = ref(true)
const textoEditavel = ref('')

//====================================================================================================
const formatacaoData = (event) => {
    console.log('FORMATACAODATA')
    let formattedValue = event.target.value
        .replace(/\D/g, '') // remove non-numeric characters
        .replace(/^(\d{2})(\d)/g, '$1/$2') // add a slash after the first two digits
        .replace(/^(\d{2})\/(\d{2})(\d{1,4})/, '$1/$2/$3') // format to dd/mm/aaaa

    event.target.value = formattedValue
}
const formatacaoSomenteNum = (event) => {
    console.log('FORMATACAOSOMENTENUM')
    let formattedValue = event.target.value
        .replace(/\D/g, '') // remove non-numeric characters
        .slice(0, 4)

    event.target.value = formattedValue
}
const formatarHorario = (event) => {
    console.log('FORMATARHORARIO')
    let input = event.target
    let value = input.value.replace(/\D/g, '')
    let formattedValue = ''

    if (value.length > 0) {
        formattedValue = value.slice(0, 4).match(/.{1,2}/g).join(':')
    }

    input.value = formattedValue
}
const checaPreenchimento = (nome, valor, obrigatorio) => {
    if (obrigatorio && valor.length == 0) {
        document.getElementById(nome).classList.add('erro')
        return true
    } else {
        document.getElementById(nome).classList.remove('erro')
        return false
    }
}
const validarHora = (nome, hora, obrigatorio) => {
    console.log('VALIDARHORA')
    if (hora.length === 5) {
        const regexHora = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/
        const result = !regexHora.test(hora)

        document.getElementById(nome).classList.remove('erro')

        return result
    } else {
        if (obrigatorio) {
            document.getElementById(nome).classList.add('erro')
            return true
        }
    }
}
const validarData = (nome, data, obrigatorio) => {
    if (data.length === 10) {
        const regexData = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d\d$/

        if (!regexData.test(data)) {
            document.getElementById(nome).classList.add('erro')
            return true
        }

        const partesData = data.split('/')
        const dia = parseInt(partesData[0], 10)
        const mes = parseInt(partesData[1], 10)
        const ano = parseInt(partesData[2], 10)

        if (mes === 2) {
            const anoBissexto = (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0
            if (dia > 29 || (dia === 29 && !anoBissexto)) {
                document.getElementById(nome).classList.add('erro')
                return true
            } else {
                document.getElementById(nome).classList.remove('erro')
                return false
            }
        } else if (mes === 4 || mes === 6 || mes === 9 || mes === 11) {
            if (dia > 30) {
                document.getElementById(nome).classList.add('erro')
                return true
            } else {
                document.getElementById(nome).classList.remove('erro')
                return false
            }
        } else if (dia > 31) {
            document.getElementById(nome).classList.add('erro')
            return true
        } else if (mes > 12) {
            document.getElementById(nome).classList.add('erro')
            return true
        } else {
            document.getElementById(nome).classList.remove('erro')
            return false
        }

    } else {
        if (obrigatorio) {
            document.getElementById(nome).classList.add('erro')
            return true
        }
    }

}
function formatDate(input) {
    const year = input.slice(0, 4)
    const month = input.slice(4, 6)
    const day = input.slice(6, 8)
    return `${day}/${month}/${year}`
}
function addRow(num) {
    console.log('ADDROW')
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
function formatarData2(input) {
    const year = input.slice(0, 4)
    const month = input.slice(4, 6)
    const day = input.slice(6, 8)
    return `${day}/${month}/${year}`
}
function imprimirElemento(elem) {
    console.log('IMPRIMIRELEMENTO')
    var mywindow = window.open('', 'PRINT')

    mywindow.document.write(document.getElementById(elem).innerHTML)

    // mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus() // necessary for IE >= 10*/

    mywindow.print()
    mywindow.close()

    return true
}
async function voltaPag() {
    console.log('VOLTAPAG')
    pag.value--
    loading.value = 1
}
async function enviaRepetirHorarios() {
    console.log('ENVIAREPETIRHORARIOS')

    let erroModal = false

    if (validarData('repeticaoDataInicial', repeticaoDataInicial.value, 1)) {
        erroModal = true
    }
    if (validarData('repeticaoDataFinal', repeticaoDataFinal.value, 1)) {
        erroModal = true
    }

    if (tipoModal.value == 1) {
        if (modoDigitacao.value == 'entradaIntervaloSaida') {
            if (validarHora('modo1Entrada', modo1Entrada.value, 1)) {
                erroModal = true
            }
            if (validarHora('modo1Intervalo1', modo1Intervalo1.value, 1)) {
                erroModal = true
            }
            if (validarHora('modo1Intervalo2', modo1Intervalo2.value, 1)) {
                erroModal = true
            }
            if (validarHora('modo1Saida', modo1Saida.value, 1)) {
                erroModal = true
            }
        } else {
            if (validarHora('modo2Entrada', modo2Entrada.value, 1)) {
                erroModal = true
            }
            if (validarHora('modo2Saida', modo2Saida.value, 1)) {
                erroModal = true
            }
            if (validarHora('modo2Intervalo', modo2Intervalo.value, 1)) {
                erroModal = true
            }
        }
    }

    if (tipo_repeticao.value == 'revezamento') {
        if (revezamento_dias_sim.value.length == 0) {
            document.getElementById('revezamento_dias_sim').classList.add('erro')
            erroModal = true
        } else {
            document.getElementById('revezamento_dias_sim').classList.remove('erro')
        }
        if (revezamento_dias_nao.value.length == 0) {
            document.getElementById('revezamento_dias_nao').classList.add('erro')
            erroModal = true
        } else {
            document.getElementById('revezamento_dias_nao').classList.remove('erro')
        }
    }

    if (erroModal == false) {

        modalClose.value.click()

        console.log('modo1Intervalo1: ', modo1Intervalo1.value)

        arrRepeticaoHorarios.value = {
            'tipo_repeticao': tipo_repeticao.value,
            'repeticaoDataInicial': repeticaoDataInicial.value,
            'repeticaoDataFinal': repeticaoDataFinal.value,
            'modo1Entrada': modo1Entrada.value,
            'modo1Intervalo1': modo1Intervalo1.value,
            'modo1Intervalo2': modo1Intervalo2.value,
            'modo1Saida': modo1Saida.value,
            'modo2Entrada': modo2Entrada.value,
            'modo2Saida': modo2Saida.value,
            'modo2Intervalo': modo2Intervalo.value,
            'revezamento_dias_sim': revezamento_dias_sim.value,
            'revezamento_dias_nao': revezamento_dias_nao.value,
            'qtde_segundas': qtde_segundas.value,
            'qtde_tercas': qtde_tercas.value,
            'qtde_quartas': qtde_quartas.value,
            'qtde_quintas': qtde_quintas.value,
            'qtde_sextas': qtde_sextas.value,
            'qtde_sabados': qtde_sabados.value,
            'qtde_domingos': qtde_domingos.value,
            'qtde_descansos': qtde_descansos.value,
            'qtde_feriados': qtde_feriados.value,
            'tipoModal': tipoModal.value,
            'ckDescanso1': ckDescanso1.value,
            'ckDescanso2': ckDescanso2.value,
            'ckDescanso3': ckDescanso3.value,
            'ckDescanso4': ckDescanso4.value,
            'ckDescanso5': ckDescanso5.value,
            'ckDescanso6': ckDescanso6.value,
            'ckDescanso7': ckDescanso7.value,
            'ckDescanso8': ckDescanso8.value
        }
    }

    erroModal = false
}
function fetchRows() {
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
async function proximaPag(pagAtual) {
    console.log('PROXIMAPAG', pagAtual)

    if (pagAtual == 1) {

        loading.value = '0'

        let erroPag1 = false

        if (checaPreenchimento('nomeCalculo', nomeCalculo.value, 1)) {
            erroPag1 = true
        }

        if (validarData('dataInicial', dataInicial.value, 1)) {
            erroPag1 = true
        }

        if (validarData('dataFinal', dataFinal.value, 1)) {
            erroPag1 = true
        }

        if (validarData('dataInicial', dataInicial.value, 1) == false && validarData('dataFinal', dataFinal.value, 1) == false) {
            const dataInicialPartes = dataInicial.value.split('/')
            const dataInicialYmd = parseInt(dataInicialPartes[2] + '' + dataInicialPartes[1] + '' + dataInicialPartes[0], 10)
            const dataFinalPartes = dataFinal.value.split('/')
            const dataFinalYmd = parseInt(dataFinalPartes[2] + '' + dataFinalPartes[1] + '' + dataFinalPartes[0], 10)

            if (dataInicialYmd > dataFinalYmd) {
                erroPag1 = true
                document.getElementById('dataInicial').classList.add('erro')
                document.getElementById('dataFinal').classList.add('erro')
            }
        }

        if (modoApuracao.value == 'diario') {
            for (let x in arrPercDia) {
                if (validarData('dataInicial' + x, arrPercDia[x].dataInicial, (arrPercDia[x].dataInicial.length > 0))) {
                    erroPag1 = true
                }
                if (validarData('dataFinal' + x, arrPercDia[x].dataFinal, (arrPercDia[x].dataFinal.length > 0))) {
                    erroPag1 = true
                }

                if (arrPercDia[x].dataInicial.length ^ arrPercDia[x].dataFinal.length) {
                    erroPag1 = true
                    document.getElementById('dataInicial' + x).classList.add('erro')
                    document.getElementById('dataFinal' + x).classList.add('erro')
                }

                if (
                    validarData('dataInicial' + x, arrPercDia[x].dataInicial, (arrPercDia[x].dataInicial.length > 0)) == false
                    && validarData('dataFinal' + x, arrPercDia[x].dataFinal, (arrPercDia[x].dataFinal.length > 0)) == false
                ) {
                    const dataInicialPartes = arrPercDia[x].dataInicial.split('/')
                    const dataInicialYmd = parseInt(dataInicialPartes[2] + '' + dataInicialPartes[1] + '' + dataInicialPartes[0], 10)
                    const dataFinalPartes = arrPercDia[x].dataFinal.split('/')
                    const dataFinalYmd = parseInt(dataFinalPartes[2] + '' + dataFinalPartes[1] + '' + dataFinalPartes[0], 10)

                    if (dataInicialYmd > dataFinalYmd) {
                        erroPag1 = true
                        document.getElementById('dataInicial' + x).classList.add('erro')
                        document.getElementById('dataFinal' + x).classList.add('erro')
                    }
                }

                if (x == 0 || (arrPercDia[x].dataInicial.length > 0 && arrPercDia[x].dataFinal.length > 0)) {
                    if (checaPreenchimento('ate2' + x, arrPercDia[x].ate2, 1)) {
                        erroPag1 = true
                    }
                    if (checaPreenchimento('de2a3' + x, arrPercDia[x].de2a3, 1)) {
                        erroPag1 = true
                    }
                    if (checaPreenchimento('de3a4' + x, arrPercDia[x].de3a4, 1)) {
                        erroPag1 = true
                    }
                    if (checaPreenchimento('de4a5' + x, arrPercDia[x].de4a5, 1)) {
                        erroPag1 = true
                    }
                    if (checaPreenchimento('mais5' + x, arrPercDia[x].mais5, 1)) {
                        erroPag1 = true
                    }
                    if (checaPreenchimento('folga' + x, arrPercDia[x].folga, 1)) {
                        erroPag1 = true
                    }
                }
            }
        } else if (modoApuracao.value == 'semanal') {
            for (let x in arrPercSem) {
                if (validarData('dataInicialSem' + x, arrPercSem[x].dataInicial, (arrPercSem[x].dataInicial.length > 0))) {
                    erroPag1 = true
                }
                if (validarData('dataFinalSem' + x, arrPercSem[x].dataFinal, (arrPercSem[x].dataFinal.length > 0))) {
                    erroPag1 = true
                }

                if (arrPercSem[x].dataInicial.length ^ arrPercSem[x].dataFinal.length) {
                    erroPag1 = true
                    document.getElementById('dataInicialSem' + x).classList.add('erro')
                    document.getElementById('dataFinalSem' + x).classList.add('erro')
                }

                if (
                    validarData('dataInicialSem' + x, arrPercSem[x].dataInicial, (arrPercSem[x].dataInicial.length > 0)) == false
                    && validarData('dataFinalSem' + x, arrPercSem[x].dataFinal, (arrPercSem[x].dataFinal.length > 0)) == false
                ) {
                    const dataInicialPartes = arrPercSem[x].dataInicial.split('/')
                    const dataInicialYmd = parseInt(dataInicialPartes[2] + '' + dataInicialPartes[1] + '' + dataInicialPartes[0], 10)
                    const dataFinalPartes = arrPercSem[x].dataFinal.split('/')
                    const dataFinalYmd = parseInt(dataFinalPartes[2] + '' + dataFinalPartes[1] + '' + dataFinalPartes[0], 10)

                    if (dataInicialYmd > dataFinalYmd) {
                        erroPag1 = true
                        document.getElementById('dataInicialSem' + x).classList.add('erro')
                        document.getElementById('dataFinalSem' + x).classList.add('erro')
                    }
                }

                if (x == 0 || (arrPercSem[x].dataInicial.length > 0 && arrPercSem[x].dataFinal.length > 0)) {
                    console.log(x)
                    if (checaPreenchimento('jornadaSemanal' + x, arrPercSem[x].jornadaSemanal, 1)) {
                        erroPag1 = true
                    }
                    if (checaPreenchimento('ate10' + x, arrPercSem[x].ate10, 1)) {
                        erroPag1 = true
                    }
                    if (checaPreenchimento('de10a20' + x, arrPercSem[x].de10a20, 1)) {
                        erroPag1 = true
                    }
                    if (checaPreenchimento('de20a30' + x, arrPercSem[x].de20a30, 1)) {
                        erroPag1 = true
                    }
                    if (checaPreenchimento('de30a40' + x, arrPercSem[x].de30a40, 1)) {
                        erroPag1 = true
                    }
                    if (checaPreenchimento('de40a50' + x, arrPercSem[x].de40a50, 1)) {
                        erroPag1 = true
                    }
                    if (checaPreenchimento('mais50' + x, arrPercSem[x].mais50, 1)) {
                        erroPag1 = true
                    }
                }
            }
        }

        if (jornadaTrabalho.value == 'personalizado' && modoApuracao.value == 'diario') {
            for (let x in arrJornadaDiaria) {
                if (arrJornadaDiaria[x].dataInicial){
                    if (validarData('dataInicialJd' + x, arrJornadaDiaria[x].dataInicial, (arrJornadaDiaria[x].dataInicial.length > 0))) {
                        erroPag1 = true
                    }
                }
                if (arrJornadaDiaria[x].dataFinal){
                    if (validarData('dataFinalJd' + x, arrJornadaDiaria[x].dataFinal, (arrJornadaDiaria[x].dataFinal.length > 0))) {
                        erroPag1 = true
                    }
                }

                const dataInicialPartes = arrJornadaDiaria[x].dataInicial.split('/')
                const dataInicialYmd = parseInt(dataInicialPartes[2] + '' + dataInicialPartes[1] + '' + dataInicialPartes[0], 10)
                const dataFinalPartes = arrJornadaDiaria[x].dataFinal.split('/')
                const dataFinalYmd = parseInt(dataFinalPartes[2] + '' + dataFinalPartes[1] + '' + dataFinalPartes[0], 10)

                if (dataInicialYmd > dataFinalYmd) {
                    erroPag1 = true
                    document.getElementById('dataInicialJd' + x).classList.add('erro')
                    document.getElementById('dataFinalJd' + x).classList.add('erro')
                }
            }
        }

        if (periodosNoturnos.value == 'personalizado') {
            for (let x in arrPeriodoNot) {
                if (arrPeriodoNot[x].dataInicial) if (validarData('dataInicialPn' + x, arrPeriodoNot[x].dataInicial, (arrPeriodoNot[x].dataInicial.length > 0))) {
                    erroPag1 = true
                }
                if (arrPeriodoNot[x].dataFinal) if (validarData('dataFinalPn' + x, arrPeriodoNot[x].dataFinal, (arrPeriodoNot[x].dataFinal.length > 0))) {
                    erroPag1 = true
                }

                const dataInicialPartes = arrPeriodoNot[x].dataInicial.split('/')
                const dataInicialYmd = parseInt(dataInicialPartes[2] + '' + dataInicialPartes[1] + '' + dataInicialPartes[0], 10)
                const dataFinalPartes = arrPeriodoNot[x].dataFinal.split('/')
                const dataFinalYmd = parseInt(dataFinalPartes[2] + '' + dataFinalPartes[1] + '' + dataFinalPartes[0], 10)

                if (dataInicialYmd > dataFinalYmd) {
                    erroPag1 = true
                    document.getElementById('dataInicialPn' + x).classList.add('erro')
                    document.getElementById('dataFinalPn' + x).classList.add('erro')
                }
            }
        }

        if (erroPag1 == false) {
            pag.value++
            console.log('pag nova: ', pag.value)
        } else {
            console.log('pagAtual1 ERRO')
            loading.value = 1
        }
    }

    if (pagAtual == 2) {
        console.log('pagAtual2 ')

        loading.value = 1

        if (updatedMessage.value) {
            pag.value++
        }
    }

    if (pag.value == 3) {

        console.log('loading rodando')
        resultadoHtml.value = '<div style="text-align: center;"><span type="button" class="pe-none"><span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Carregando...</span></div>'

        const objeto = updatedMessage.value

        const array = Object.entries(objeto) // Converte o objeto em um array de pares [chave, valor]

        array.sort((a, b) => {
            const dataA = new Date(a[0].split('/').reverse().join('/'))
            const dataB = new Date(b[0].split('/').reverse().join('/'))
            return dataA - dataB
        }) // Ordena o array pela data ascendente

        updatedMessage.value = Object.fromEntries(array)

        const respostaExec1 = await axios.post(
            `${import.meta.env.VITE_API3_URL}/cponto/cponto_add_edit`,
            {
                idCartao: id.value,
                nomeCalculo: nomeCalculo.value,
                descricaoCalculo: descricaoCalculo.value,
                dataInicial: dataInicial.value
            },
            { withCredentials: true }
        )

        if (respostaExec1.data.idCartao) {
            id.value = respostaExec1.data.idCartao
        }

        if (id.value > 0) {
            console.log(updatedMessage.value)

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

                    arrCartao: updatedMessage.value
                },
                { withCredentials: true }
            )

            resultadoHtml.value = respostaExec2.data.htmlResposta
            console.log('data: ', respostaExec2.data)
            loading.value = '1'

            // if(respostaExec2.data.idCartao)
            {
                // id.value = respostaExec2.data.idCartao
                console.log('redirecionando.... id.value: ', id.value)
                const routePath = `/cp/${id.value}/resultado`
                const resolvedPath = router.resolve(routePath).href
                console.log('resolvedPath1: ', resolvedPath)
                await router.push(resolvedPath)
            }
        }
    }
}
async function pegaDados() {
    if (route.params.id) {
        id.value = route.params.id
    }

    if (id.value > 0) {
        loading.value = '0'

        const response2 = await axios.get(`${import.meta.env.VITE_API3_URL}/cponto/verifica_cponto/${id.value}`, { withCredentials: true })

        if (response2.data.length && response2.data != 0) {

            if (response2.data[0].versao != 5) {
                await router.push('/lista/cponto')
            }

            //yyyymmdd to date
            let ymdCriacao = response2.data[0].diahora.toString()
            ymdCriacao = ymdCriacao.slice(0, 4) + '/' + ymdCriacao.slice(4, 6) + '/' + ymdCriacao.slice(6, 8)

            //30 dias apos criacao
            const dataLimite = new Date(ymdCriacao)
            dataLimite.setDate(dataLimite.getDate() + 30)

            const dataAtual = new Date()
            if (!perfil.planoAtivo) {
                if (dataAtual > dataLimite) {
                    editavel.value = false
                    textoEditavel.value = `Assine para editar`
                } else {
                    editavel.value = true
                    textoEditavel.value = `Editável até ${dataLimite.toLocaleDateString()}`
                }
            }

            nomeCalculo.value = response2.data[0].nome

            try {
                if ((route.params.pag == 'resultado' && pag.value == 3) || pag.value == 1) {
                    loading.value = '0'
                    resultadoHtml.value = '<div style="text-align: center;"><span type="button" class="pe-none"><span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Carregando...</span></div>'

                    const response = await axios.get(
                        `${import.meta.env.VITE_API3_URL}/cponto/consulta/${id.value}`,
                        { withCredentials: true }
                    )

                    if (response.data) {
                        if (response.data.resultado == 0) {
                            cartaoEncontrado.value = false
                            console.log('ponto nao encontrado: ', response.data)
                            /*const routePath = '/cp'
                            const resolvedPath = router.resolve(routePath).href
                            console.log('Redirect: ', resolvedPath)
                            await router.push(resolvedPath)*/
                        } else {
                            cartaoEncontrado.value = true
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
                            if (objeto.modo_digitacao == 0){
                                modoDigitacao.value = 'entradaIntervaloSaida'
                            } else {
                                modoDigitacao.value = 'entradaSaidaIntervalo'
                            }

                            tabelaDSR.value = Number(objeto.tabela_dsr)

                            if (tabelaDSR.value == 0 || isNaN(tabelaDSR.value)) {
                                tabelaDSR.value = 1
                            }

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
                                if (Object.hasOwn(objeto,`percdiaini_${i}`)) {
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
                                if (Object.hasOwn(objeto,`percsemanal_ini_${i}`)) {
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
                                if (Object.hasOwn(objeto,`jordia_ini_${i}`)) {
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
                                if (Object.hasOwn(objeto,`hrnoturno_dataini_${i}`)) {
                                    arrPeriodoNot.push({
                                        dataInicial: formatDate(objeto[`hrnoturno_dataini_${i}`]),
                                        dataFinal: formatDate(objeto[`hrnoturno_datafim_${i}`]),
                                        horarioInicial: objeto[`hrnoturno_horaini_${i}`],
                                        horarioFinal: objeto[`hrnoturno_horafim_${i}`]
                                    })
                                }
                            }

                            if (pag.value == '1'){
                                loading.value = '1'
                            }
                        }
                    }
                }

                if (route.params.pag == 'resultado' && pag.value == 3) {

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
                            // console.log(`${key}: ${e1Obj[key]}`);
                            let dataCampo = key.split('_')[1]
                            let dataCampoForm = formatarData2(dataCampo)
                            let dataCampoInt = parseInt(dataCampo)

                            if (dataCampoInt >= dataInicialFormatada && dataCampoInt <= dataFinalFormatada) {

                                let key_e1 = `e1_${dataCampo}`
                                let key_e2 = `e2_${dataCampo}`
                                let key_s1 = `s1_${dataCampo}`
                                let key_s2 = `s2_${dataCampo}`
                                // let key_w = `w_${dataCampo}`

                                if (e2Obj[key_e2] === undefined) {
                                    console.log('INI1111111111111')
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

                    resultadoHtml.value = respostaExec2.data.htmlResposta
                    loading.value = '1'


                }

            } catch (error) {
                console.log(error)
            }

        } else {
            await router.push('../../../lista/cponto')
        }

    } else {
        loading.value = '1'
    }
}

fetchRows()

onMounted(async () => {
    async function fetchDSRs() {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API3_URL}/cponto/dsr_view/pega_todos`,
                {
                    timeout: 2000,
                    withCredentials: true
                })

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
    }

    //somente se nao for resumo
    if (pag.value != 3) {
        await fetchDSRs()
    }

    await pegaDados()
})

watch(tabelaDSR, () => {
    let arrayDsr = selectDsr.value.find((obj) => obj.id === tabelaDSR.value)
    if (arrayDsr) {
        dsrDados.value = arrayDsr.dados
    }
})
</script>

<template>
    <a data-bs-toggle="modal" href="#erro" id="erro_modal"></a>

    <section id="content" class="bg-secondary">
        <div class="container py-5 mt-4 mt-lg-5 mb-lg-4 my-xl-5">
            <div class="row pt-sm-2 pt-lg-0">
                <!-- Page content-->
                <div class="col-lg-12 pt-4 pb-2 pb-sm-4">
                    <section class="card border-0 py-1 p-md-2 p-xl-3 p-xxl-4">

                        <div class="card-body" v-if="pag == 3">
                            <div class="d-flex align-items-center mt-sm-n1 mb-0 mb-lg-1 ">
                                <h2 class="h4 mb-0">Resultado do Cartão de Ponto</h2>
                            </div>
                            <div id='resumoCartao' v-html="resultadoHtml"></div>
                        </div>


                        <!-- tabelaDSR -->
                        <CPonto20 v-if="pag == 2" :editavel="editavel" :dsr="dsrDados" :modoDigitacao="modoDigitacao"
                                  :arrRepeticaoHorarios="arrRepeticaoHorarios" :dadosArquivo="dadosArquivo"
                                  :dataInicial="dataInicial" :dataFinal="dataFinal" />

                        <div class="card-body" v-if="pag == 1">

                            <div class="d-flex align-items-center justify-content-between mt-sm-n1 pb-4 mb-0 mb-lg-1 mb-xl-3">
                                <h2 class="h4 mb-0">Cartão de Ponto</h2>
                                <div v-if='!perfil.planoAtivo' class="col-sm-4" style="text-align: right;">
                                    <a class="btn btn-sm fs-sm order-lg-3 d-none d-sm-inline-flex bg-faded-primary text-primary" rel="noopener" href="https://www.debit.com.br/precos" style="border-radius: 25px;">
                                        {{ textoEditavel }}
                                    </a>
                                </div>
                            </div>


                            <div v-if="loading == 0  && cartaoEncontrado != false">
                                <div style="text-align: center;">
                                    <span type="button" class="pe-none">
                                        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Carregando...
                                    </span>
                                </div>
                            </div>

                            <div v-if="cartaoEncontrado == false">
                                <div style="text-align: center;">
                                    <div>
                                        Cartão não encontrado, tente atualizar a pagina ou <RouterLink to='/lista/cponto'> volte para a lista</RouterLink>.
                                    </div>
                                </div>
                            </div>

                            <div class="row g-3 g-sm-4 mt-0 mt-lg-2 " v-if="loading == 1">

                                <div class="d-flex align-items-center" style="margin-top: 30px;">
                                    <!-- <i class="ai-user text-primary lead pe-1 me-2"></i> -->
                                    <h2 class="h6 mb-0">Dados para efetuar o cáculo:</h2>
                                </div>

                                <div class="row">
                                    <div class="col-sm-12">
                                        <label class="form-label" for="nomeCalculo">Nome do cálculo:</label>
                                        <input :disabled='!editavel' class="form-control" type="text" id="nomeCalculo" v-model="nomeCalculo"
                                               @blur="checaPreenchimento('nomeCalculo',nomeCalculo,1)">
                                    </div>
                                    <div class="col-sm-12">
                                        <label class="form-label" for="descricaoCalculo">Descrição do cálculo:</label>
                                        <textarea :disabled='!editavel' class="form-control" id="descricaoCalculo"
                                                  v-model="descricaoCalculo"></textarea>
                                    </div>
                                    <!-- :class="{ 'erro': validarData('dataInicial',dataInicial) }" -->
                                    <div class="col-sm-6">
                                        <label class="form-label" for="dataInicial">Data inicial:</label>
                                        <input :disabled='!editavel' class="form-control" type="text" id="dataInicial"
                                               placeholder="dd/mm/aaaa"
                                               @blur="validarData('dataInicial',dataInicial,1)"
                                               @input="formatacaoData" maxlength="10" v-model="dataInicial">
                                    </div>
                                    <!-- :class="{ 'erro': validarData('dataFinal',dataFinal) }" -->
                                    <div class="col-sm-6">
                                        <label class="form-label" for="dataFinal">Data final:</label>
                                        <input :disabled='!editavel' class="form-control" type="text" id="dataFinal" @input="formatacaoData"
                                               @blur="validarData('dataFinal',dataFinal,1)"
                                               placeholder="dd/mm/aaaa" maxlength="10" v-model="dataFinal">
                                    </div>
                                    <div class="col-sm-12">
                                        <label class="form-label" for="modoDigitacao">Modo de digitação do
                                            cartão:</label>
                                        <select :disabled='!editavel' class="form-control" id="modoDigitacao" v-model="modoDigitacao">
                                            <option value="entradaIntervaloSaida">Entrada / Intervalo / Saída</option>
                                            <option value="entradaSaidaIntervalo">Entrada / Saída / Intervalo</option>
                                        </select>
                                    </div>
                                    <div class="col-sm-12">
                                        <label class="form-label" for="tabelaDSR">
                                            Selecione a tabela de DSRs (Descanso semanal remunerado):
                                        </label>
                                        <select :disabled='!editavel' class="form-control" id="tabelaDSR" v-model="tabelaDSR">
                                            <option v-for="dsr in selectDsr" :key="dsr.id" :value="dsr.id">{{ dsr.nome
                                                }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="col-sm-12">
                                        <label class="form-label" for="periodoInicio">Período de Início de apontamento
                                            do
                                            cartão de ponto:</label>
                                        <select :disabled='!editavel' class="form-control" id="periodoInicio" v-model="periodoInicio">
                                            <option v-for="num in 31" :value="num" :key="num">{{ num }}</option>
                                        </select>
                                    </div>
                                    <div class="col-sm-12">
                                        <label class="form-label" for="modoApuracao">Modo de apuração das horas
                                            extras:</label>
                                        <select :disabled='!editavel' class="form-control" id="modoApuracao" v-model="modoApuracao">
                                            <option value="diario">Diário</option>
                                            <option value="semanal">Semanal</option>
                                        </select>
                                    </div>

                                    <div class="col-sm-12" v-if="modoApuracao === 'semanal'">
                                        <label class="form-label" for="inicioSemana">Início da Semana:</label>
                                        <select :disabled='!editavel' class="form-control" id="inicioSemana" v-model="inicioSemana">
                                            <option value="0">Domingo</option>
                                            <option value="1">Segunda-feira</option>
                                            <option value="2">Terça-feira</option>
                                            <option value="3">Quarta-feira</option>
                                            <option value="4">Quinta-feira</option>
                                            <option value="5">Sexta-feira</option>
                                            <option value="6">Sábado</option>
                                        </select>
                                    </div>

                                    <div class="col-sm-12" v-if="modoApuracao === 'semanal'">
                                        <label class="form-label" for="diasTrabalhados">Informe os dias que o
                                            funcionário
                                            trabalha na semana:</label>
                                        <select :disabled='!editavel' class="form-control" id="diasTrabalhados" v-model="diasTrabalhados">
                                            <option v-for="num in 7" :value="num" :key="num">{{ num }}</option>
                                        </select>
                                    </div>

                                    <div class="col-sm-12" v-if="modoApuracao === 'semanal'">
                                        <label class="form-label" for="jornadaSemanalProporcional">Utilizar a jornada
                                            semanal proporcionalmente, quando a(s) semana(s) do mês tiver(em) menos que
                                            7
                                            dias?</label>
                                        <select :disabled='!editavel' class="form-control" id="jornadaSemanalProporcional"
                                                v-model="jornadaSemanalProporcional">
                                            <option value="sim">Sim</option>
                                            <option value="nao">Não</option>
                                        </select>
                                    </div>

                                    <div v-if="modoApuracao === 'diario'">

                                        <table class="table" style="margin-top: 15px;">
                                            <thead>
                                            <tr>
                                                <td>Data Inicial</td>
                                                <td>Data Final</td>
                                                <td>até 2hs (%)</td>
                                                <td>de 2 às 3hs (%)</td>
                                                <td>de 3 às 4hs (%)</td>
                                                <td>de 4 às 5hs (%)</td>
                                                <td>+5hs (%)</td>
                                                <td>Folga (%)</td>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr v-for="(row, index) in arrPercDia" :key="index">
                                                <td><input :disabled='!editavel' v-model="row.dataInicial" class="form-control" type="text"
                                                           placeholder="dd/mm/aaaa" @input="formatacaoData"
                                                           maxlength="10"
                                                           @blur="validarData('dataInicial'+index, arrPercDia[index].dataInicial, (arrPercDia[index].dataInicial.length>0))"
                                                           :id="'dataInicial'+index">
                                                </td>
                                                <td><input :disabled='!editavel' v-model="row.dataFinal" class="form-control" type="text"
                                                           placeholder="dd/mm/aaaa" @input="formatacaoData"
                                                           maxlength="10"
                                                           @blur="validarData('dataFinal'+index, arrPercDia[index].dataFinal, (arrPercDia[index].dataFinal.length>0))"
                                                           :id="'dataFinal'+index">
                                                </td>

                                                <td><input :disabled='!editavel' v-model="row.ate2" class="form-control" type="text"
                                                           @input="formatacaoSomenteNum" maxlength="3"
                                                           @blur="checaPreenchimento('ate2'+index, arrPercDia[index].ate2, (index==0))"
                                                           :id="'ate2'+index"></td>

                                                <td><input :disabled='!editavel' v-model="row.de2a3" class="form-control" type="text"
                                                           @input="formatacaoSomenteNum" maxlength="3"
                                                           @blur="checaPreenchimento('de2a3'+index, arrPercDia[index].de2a3, (index==0))"
                                                           :id="'de2a3'+index"></td>

                                                <td><input :disabled='!editavel' v-model="row.de3a4" class="form-control" type="text"
                                                           @input="formatacaoSomenteNum" maxlength="3"
                                                           @blur="checaPreenchimento('de3a4'+index, arrPercDia[index].de3a4, (index==0))"
                                                           :id="'de3a4'+index"></td>

                                                <td><input :disabled='!editavel' v-model="row.de4a5" class="form-control" type="text"
                                                           @input="formatacaoSomenteNum" maxlength="3"
                                                           @blur="checaPreenchimento('de4a5'+index, arrPercDia[index].de4a5, (index==0))"
                                                           :id="'de4a5'+index"></td>

                                                <td><input :disabled='!editavel' v-model="row.mais5" class="form-control" type="text"
                                                           @input="formatacaoSomenteNum" maxlength="3"
                                                           @blur="checaPreenchimento('mais5'+index, arrPercDia[index].mais5, (index==0))"
                                                           :id="'mais5'+index"></td>

                                                <td><input :disabled='!editavel' v-model="row.folga" class="form-control" type="text"
                                                           @input="formatacaoSomenteNum" maxlength="3"
                                                           @blur="checaPreenchimento('folga'+index, arrPercDia[index].folga, (index==0))"
                                                           :id="'folga'+index"></td>
                                            </tr>
                                            </tbody>
                                        </table>
                                        <div style="text-align: right;">
                                            <button :disabled='!editavel' @click="addRow(1)" class="btn btn-primary">Adicionar Linha</button>
                                        </div>
                                    </div>


                                    <div v-if="modoApuracao === 'semanal'">

                                        <table class="table" style="margin-top: 15px;">
                                            <thead>
                                            <tr>
                                                <td>Data Inicial</td>
                                                <td>Data Final</td>
                                                <td>Jornada Semanal<br>(em horas)</td>
                                                <td>até 10hs (%)</td>
                                                <td>de 10 à 20hs (%)</td>
                                                <td>de 20 à 30hs (%)</td>
                                                <td>de 30 à 40hs</td>
                                                <td>de 40 à 50hs (%)</td>
                                                <td>+50hs</td>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr v-for="(row, index) in arrPercSem" :key="index">
                                                <td><input :disabled='!editavel' v-model="row.dataInicial" class="form-control" type="text"
                                                           placeholder="dd/mm/aaaa" @input="formatacaoData"
                                                           maxlength="10"
                                                           @blur="validarData('dataInicialSem'+index, arrPercSem[index].dataInicial, (arrPercSem[index].dataInicial.length>0))"
                                                           :id="'dataInicialSem'+index">
                                                </td>
                                                <td><input :disabled='!editavel' v-model="row.dataFinal" class="form-control" type="text"
                                                           placeholder="dd/mm/aaaa" @input="formatacaoData"
                                                           maxlength="10"
                                                           @blur="validarData('dataFinalSem'+index, arrPercSem[index].dataFinal, (arrPercSem[index].dataFinal.length>0))"
                                                           :id="'dataFinalSem'+index">
                                                </td>

                                                <td><input :disabled='!editavel' v-model="row.jornadaSemanal" class="form-control" type="text"
                                                           @input="formatacaoSomenteNum" maxlength="3"
                                                           @blur="checaPreenchimento('jornadaSemanal'+index, arrPercSem[index].jornadaSemanal, (index==0))"
                                                           :id="'jornadaSemanal'+index"></td>
                                                <td><input :disabled='!editavel' v-model="row.ate10" class="form-control" type="text"
                                                           @input="formatacaoSomenteNum" maxlength="3"
                                                           @blur="checaPreenchimento('ate10'+index, arrPercSem[index].ate10, (index==0))"
                                                           :id="'ate10'+index"></td>
                                                <td><input :disabled='!editavel' v-model="row.de10a20" class="form-control" type="text"
                                                           @input="formatacaoSomenteNum" maxlength="3"
                                                           @blur="checaPreenchimento('de10a20'+index, arrPercSem[index].de10a20, (index==0))"
                                                           :id="'de10a20'+index"></td>
                                                <td><input :disabled='!editavel' v-model="row.de20a30" class="form-control" type="text"
                                                           @input="formatacaoSomenteNum" maxlength="3"
                                                           @blur="checaPreenchimento('de20a30'+index, arrPercSem[index].de20a30, (index==0))"
                                                           :id="'de20a30'+index"></td>
                                                <td><input :disabled='!editavel' v-model="row.de30a40" class="form-control" type="text"
                                                           @input="formatacaoSomenteNum" maxlength="3"
                                                           @blur="checaPreenchimento('de30a40'+index, arrPercSem[index].de30a40, (index==0))"
                                                           :id="'de30a40'+index"></td>
                                                <td><input :disabled='!editavel' v-model="row.de40a50" class="form-control" type="text"
                                                           @input="formatacaoSomenteNum" maxlength="3"
                                                           @blur="checaPreenchimento('de40a50'+index, arrPercSem[index].de40a50, (index==0))"
                                                           :id="'de40a50'+index"></td>
                                                <td><input :disabled='!editavel' v-model="row.mais50" class="form-control" type="text"
                                                           @input="formatacaoSomenteNum" maxlength="3"
                                                           @blur="checaPreenchimento('mais50'+index, arrPercSem[index].mais50, (index==0))"
                                                           :id="'mais50'+index"></td>

                                            </tr>
                                            </tbody>
                                        </table>
                                        <div style="text-align: right;">
                                            <button :disabled='!editavel' @click="addRow(4)" class="btn btn-primary">Adicionar Linha</button>
                                        </div>
                                    </div>


                                    <!-- -------------------------------------------------------------------------------------------------------------- -->
                                    <div class="d-flex align-items-center" style="margin-top: 30px;">
                                        <!-- <i class="ai-user text-primary lead pe-1 me-2"></i> -->
                                        <h2 class="h6 mb-0">Horário Noturno: configure abaixo os períodos que deverão
                                            ser
                                            considerados norturnos:</h2>
                                    </div>


                                    <div class="col-sm-12">
                                        <label class="form-label" for="periodosNoturnos">Quais são os períodos
                                            noturnos:</label>
                                        <select :disabled='!editavel' class="form-control" id="periodosNoturnos" v-model="periodosNoturnos">
                                            <option value="padrao">Padrão</option>
                                            <option value="personalizado">Personalizado</option>
                                        </select>
                                    </div>

                                    <div v-if="periodosNoturnos === 'personalizado'">
                                        <table class="table" style="margin-top: 15px;">
                                            <thead>
                                            <tr>
                                                <td>Data Inicial</td>
                                                <td>Data Final</td>
                                                <td>Horário Inicial</td>
                                                <td>Horário Final</td>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr v-for="(arrPeriodoNot, index) in arrPeriodoNot" :key="index">
                                                <td><input :disabled='!editavel' class="form-control" type="text" placeholder="dd/mm/aaaa"
                                                           @input="formatacaoData" maxlength="10"
                                                           v-model="arrPeriodoNot.dataInicial"
                                                           @blur="validarData('dataInicialPn'+index, arrPeriodoNot.dataInicial, (arrPeriodoNot.dataInicial.length>0))"
                                                           :id="'dataInicialPn'+index"></td>
                                                <td><input :disabled='!editavel' class="form-control" type="text" placeholder="dd/mm/aaaa"
                                                           @input="formatacaoData" maxlength="10"
                                                           v-model="arrPeriodoNot.dataFinal"
                                                           @blur="validarData('dataFinalPn'+index, arrPeriodoNot.dataFinal, (arrPeriodoNot.dataFinal.length>0))"
                                                           :id="'dataFinalPn'+index"></td>
                                                <td><input :disabled='!editavel' class="form-control" type="text" @input="formatarHorario"
                                                           maxlength="5" v-model="arrPeriodoNot.horarioInicial"></td>
                                                <td><input :disabled='!editavel' class="form-control" type="text" @input="formatarHorario"
                                                           maxlength="5" v-model="arrPeriodoNot.horarioFinal"></td>
                                            </tr>
                                            </tbody>
                                        </table>
                                        <div style="text-align: right;">
                                            <button :disabled='!editavel' @click="addRow(3)" class="btn btn-primary">Adicionar Linha</button>
                                        </div>
                                    </div>

                                    <!-- -------------------------------------------------------------------------------------------------------------- -->
                                    <div v-if="modoApuracao=='diario'">
                                        <div class="d-flex align-items-center" style="margin-top: 30px;">
                                            <!-- <i class="ai-user text-primary lead pe-1 me-2"></i> -->
                                            <h2 class="h6 mb-0">Jornada de Trabalho Diário:</h2>
                                        </div>

                                        <div class="col-sm-12">
                                            <label class="form-label" for="jornadaTrabalho">Informe a jornada de
                                                trabalho:</label>
                                            <select :disabled='!editavel' class="form-control" id="jornadaTrabalho" v-model="jornadaTrabalho">
                                                <option value="padrao">Padrão</option>
                                                <option value="personalizado">Personalizado</option>
                                            </select>
                                        </div>

                                        <div v-if="jornadaTrabalho === 'personalizado'">
                                            <table class="table" style="margin-top: 15px;">
                                                <thead>
                                                <tr>
                                                    <td>Data Inicial</td>
                                                    <td>Data Final</td>
                                                    <td>Seg</td>
                                                    <td>Ter</td>
                                                    <td>Qua</td>
                                                    <td>Qui</td>
                                                    <td>Sex</td>
                                                    <td>Sab</td>
                                                    <td>Dom</td>
                                                    <td>Descanso</td>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                <tr v-for="(arrJornadaDiaria, index) in arrJornadaDiaria" :key="index">
                                                    <td><input :disabled='!editavel' class="form-control" type="text" placeholder="dd/mm/aaaa"
                                                               v-model="arrJornadaDiaria.dataInicial"
                                                               @input="formatacaoData" maxlength="10"
                                                               style="width: 120px;"
                                                               @blur="validarData('dataInicialJd'+index, arrJornadaDiaria.dataInicial, (arrJornadaDiaria.dataInicial.length>0))"
                                                               :id="'dataInicialJd'+index">
                                                    </td>
                                                    <td><input :disabled='!editavel' class="form-control" type="text" placeholder="dd/mm/aaaa"
                                                               v-model="arrJornadaDiaria.dataFinal"
                                                               @input="formatacaoData" maxlength="10"
                                                               style="width: 120px;"
                                                               @blur="validarData('dataFinalJd'+index, arrJornadaDiaria.dataFinal, (arrJornadaDiaria.dataFinal.length>0))"
                                                               :id="'dataFinalJd'+index">
                                                    </td>
                                                    <td><input :disabled='!editavel' class="form-control" type="text" @input="formatarHorario"
                                                               v-model="arrJornadaDiaria.seg" maxlength="5"></td>
                                                    <td><input :disabled='!editavel' class="form-control" type="text" @input="formatarHorario"
                                                               v-model="arrJornadaDiaria.ter" maxlength="5"></td>
                                                    <td><input :disabled='!editavel' class="form-control" type="text" @input="formatarHorario"
                                                               v-model="arrJornadaDiaria.qua" maxlength="5"></td>
                                                    <td><input :disabled='!editavel' class="form-control" type="text" @input="formatarHorario"
                                                               v-model="arrJornadaDiaria.qui" maxlength="5"></td>
                                                    <td><input :disabled='!editavel' class="form-control" type="text" @input="formatarHorario"
                                                               v-model="arrJornadaDiaria.sex" maxlength="5"></td>
                                                    <td><input :disabled='!editavel' class="form-control" type="text" @input="formatarHorario"
                                                               v-model="arrJornadaDiaria.sab" maxlength="5"></td>
                                                    <td><input :disabled='!editavel' class="form-control" type="text" @input="formatarHorario"
                                                               v-model="arrJornadaDiaria.dom" maxlength="5"></td>
                                                    <td><input :disabled='!editavel' class="form-control" type="text" @input="formatarHorario"
                                                               v-model="arrJornadaDiaria.des" maxlength="5"></td>
                                                </tr>
                                                </tbody>
                                            </table>
                                            <div style="text-align: right;">
                                                <button :disabled='!editavel' @click="addRow(2)" class="btn btn-primary">Adicionar Linha
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </section>

    <table class="flutuar">
        <tr>
            <td v-if="pag == 2">
                <a class="btn_anterior" title="Repetir Horários" data-bs-toggle="modal" href="#addCard"
                   @click="tipoModal = 1"><i class="material-icons">repeat</i></a>
            </td>

            <td v-if="pag == 2">
                <a class="btn_anterior" title="Marcar descansos" data-bs-toggle="modal" href="#addCard"
                   @click="tipoModal = 2"><i class="material-icons">event_busy</i></a>
            </td>

            <td v-if="pag == 2">
                <a href="#" class="btn_anterior" title="Página Anterior" @click="voltaPag()"><i class="material-icons">arrow_back</i></a>
            </td>

            <td v-if="pag==3 && loading==1">
                <a href="javascript:void(0)" class="btn_anterior" title="Imprimir Cálculo"
                   @click="imprimirElemento('resumoCartao')"><i class="material-icons">print</i></a>
            </td>

            <td v-if="pag==1 || (pag==3  && loading==1 )">
                <a href="javascript:void(0)" class="btn_anterior" title="Lista de Cálculos"
                   @click="$router.push('/lista/cponto');"><i class="material-icons">menu</i></a>
            </td>

            <td v-if="pag==3 && loading==1 && id">
                <a href="javascript:void(0)" class="btn_anterior" title="Página Anterior"
                   @click="pag = '1'; $router.push(`/cp/${id}`); pegaDados();"><i class="material-icons">arrow_back</i></a>
            </td>

            <td v-if="pag==1">
                <a href="javascript:void(0)" class="btn_proximo" title="Próxima página"><i class="material-icons"
                                                                                           style="vertical-align: middle;"
                                                                                           @click="proximaPag(1)">arrow_forward</i></a>
            </td>
            <td v-if="pag==2">
                <a href="javascript:void(0)" class="btn_proximo" title="Próxima página"><i class="material-icons"
                                                                                           style="vertical-align: middle;"
                                                                                           @click="proximaPag(2)">arrow_forward</i></a>
            </td>
        </tr>
    </table>

    <!-- ================================================================================================================= -->

    <div class="modal fade" id="addCard" data-bs-backdrop="static" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">

                <div class="modal-header border-0">
                    <div v-if="tipoModal==1">
                        <h4 class="modal-title">Repetir Horários</h4>
                    </div>
                    <div v-if="tipoModal==2">
                        <h4 class="modal-title">Repetir Horários</h4>
                    </div>

                    <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"
                            ref="modalClose"></button>
                </div>

                <p><b>Período e horário para repetir:</b></p>

                <table>
                    <tr>
                        <td style="vertical-align: top;">
                            <table>
                                <tr>
                                    <td>Data inicial:</td>
                                    <td>
                                        <input :disabled='!editavel' name="" type="text" @input="formatacaoData" maxlength="10"
                                               id="repeticaoDataInicial"
                                               @blur="validarData('repeticaoDataInicial',repeticaoDataInicial,1)"
                                               v-model="repeticaoDataInicial" class="form-control2" />
                                    </td>
                                </tr>
                                <tr>
                                    <td>Data final:</td>
                                    <td>
                                        <input :disabled='!editavel' name="" type="text" @input="formatacaoData" maxlength="10"
                                               id="repeticaoDataFinal"
                                               @blur="validarData('repeticaoDataFinal',repeticaoDataFinal,1)"
                                               v-model="repeticaoDataFinal" class="form-control2" />
                                    </td>
                                </tr>
                            </table>
                        </td>

                        <td style="vertical-align: top;" v-if="modoDigitacao == 'entradaIntervaloSaida'">
                            <div v-if="tipoModal==1">
                                <table>
                                    <tr>
                                        <td style="width:120px;">Entrada:</td>
                                        <td>
                                            <input :disabled='!editavel' name="" type="text" @input="formatarHorario" maxlength="5"
                                                   id="modo1Entrada"
                                                   v-model="modo1Entrada"
                                                   @blur="validarHora('modo1Entrada',modo1Entrada,1)"
                                                   class="form-control2" style="width:50px;" />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Início Intervalo:</td>
                                        <td>
                                            <input :disabled='!editavel' name="" type="text" @input="formatarHorario" maxlength="5"
                                                   id="modo1Intervalo1"
                                                   v-model="modo1Intervalo1"
                                                   @blur="validarHora('modo1Intervalo1',modo1Intervalo1,1)"
                                                   class="form-control2"
                                                   style="width:50px;" />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Fim Intervalo:</td>
                                        <td>
                                            <input :disabled='!editavel' name="" type="text" @input="formatarHorario" maxlength="5"
                                                   id="modo1Intervalo2"
                                                   v-model="modo1Intervalo2"
                                                   @blur="validarHora('modo1Intervalo2',modo1Intervalo2,1)"
                                                   class="form-control2"
                                                   style="width:50px;" />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Saída:</td>
                                        <td>
                                            <input :disabled='!editavel' name="" type="text" @input="formatarHorario" maxlength="5"
                                                   id="modo1Saida"
                                                   v-model="modo1Saida"
                                                   @blur="validarHora('modo1Saida',modo1Saida,1)"
                                                   class="form-control2" style="width:50px;" />
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>

                        <td style="vertical-align: top;" v-if="modoDigitacao == 'entradaSaidaIntervalo'">
                            <div v-if="tipoModal==1">
                                <table>
                                    <tr>
                                        <td style="width:120px;">Entrada:</td>
                                        <td>
                                            <input :disabled='!editavel' name="" type="text" class="form-control2" id="modo2Entrada"
                                                   @blur="validarHora('modo2Entrada',modo2Entrada,1)"
                                                   v-model="modo2Entrada" @input="formatarHorario" maxlength="5"
                                                   style="width:50px;" />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Saída:</td>
                                        <td>
                                            <input :disabled='!editavel' name="" type="text" class="form-control2" id="modo2Saida"
                                                   @blur="validarHora('modo2Saida',modo2Saida,1)"
                                                   v-model="modo2Saida" @input="formatarHorario" maxlength="5"
                                                   style="width:50px;" />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Intervalo:</td>
                                        <td>
                                            <input :disabled='!editavel' name="" type="text" class="form-control2" id="modo2Intervalo"
                                                   @blur="validarHora('modo2Intervalo',modo2Intervalo,1)"
                                                   @input="formatarHorario" maxlength="5"
                                                   v-model="modo2Intervalo" style="width:50px;" />
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                </table>

                <br><br>

                <p><b>Selecione o modo de repetição:</b></p>
                <table>
                    <tr>
                        <td style="display: flex; align-items: center;">
                            <input :disabled='!editavel' name="tipo_repeticao" id="repetir" value="repetir" v-model="tipo_repeticao"
                                   type="radio"
                                   class="form-control2" />
                            <label for="repetir">&nbsp;Repetir (dias da semana)</label>
                        </td>
                    </tr>
                    <tr>
                        <td style="display: flex; align-items: center;">
                            <input :disabled='!editavel' name="tipo_repeticao" id="revezamento" value="revezamento" v-model="tipo_repeticao"
                                   type="radio" class="form-control2" />
                            <label for="revezamento">&nbsp;Repetir (revezamento)</label>
                        </td>
                    </tr>
                    <tr>
                        <td style="display: flex; align-items: center;">
                            <input :disabled='!editavel' name="tipo_repeticao" id="apagar" value="apagar" v-model="tipo_repeticao"
                                   type="radio"
                                   class="form-control2" />
                            <label for="apagar">&nbsp;Apagar digitação</label>
                        </td>
                    </tr>
                </table>

                <br><br>

                <div v-if="tipo_repeticao=='repetir'">
                    <p><b>Selecione quantas vezes você quer repetir o horário acima em cada mês:</b></p>
                    <table style="width:100%">
                        <tr>
                            <td style="vertical-align: top;">
                                <table>
                                    <tr>
                                        <td style="width:45%"><label for="ckDescanso1">Segundas:</label></td>
                                        <td>
                                            <div v-if="tipoModal==1">
                                                <select :disabled='!editavel' name="qtde_segundas" v-model="qtde_segundas"
                                                        class="form-select2">
                                                    <option value="0">Nenhum</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4</option>
                                                    <option value="5">Todos</option>
                                                </select>
                                            </div>
                                            <div v-if="tipoModal==2">
                                                &nbsp;&nbsp;<input :disabled='!editavel' type="checkbox" v-model="ckDescanso1"
                                                                   id="ckDescanso1">
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label for="ckDescanso2">Terças:</label></td>
                                        <td>
                                            <div v-if="tipoModal==1">
                                                <select :disabled='!editavel' name="qtde_tercas" v-model="qtde_tercas" class="form-select2">
                                                    <option value="0">Nenhum</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4</option>
                                                    <option value="5">Todos</option>
                                                </select>
                                            </div>
                                            <div v-if="tipoModal==2">
                                                &nbsp;&nbsp;<input :disabled='!editavel' type="checkbox" v-model="ckDescanso2"
                                                                   id="ckDescanso2">
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label for="ckDescanso3">Quartas:</label></td>
                                        <td>
                                            <div v-if="tipoModal==1">
                                                <select :disabled='!editavel' name="qtde_quartas" v-model="qtde_quartas" class="form-select2">
                                                    <option value="0">Nenhum</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4</option>
                                                    <option value="5">Todos</option>
                                                </select>
                                            </div>
                                            <div v-if="tipoModal==2">
                                                &nbsp;&nbsp;<input :disabled='!editavel' type="checkbox" v-model="ckDescanso3"
                                                                   id="ckDescanso3">
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label for="ckDescanso4">Quintas:</label></td>
                                        <td>
                                            <div v-if="tipoModal==1">
                                                <select :disabled='!editavel' name="qtde_quintas" v-model="qtde_quintas" class="form-select2">
                                                    <option value="0">Nenhum</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4</option>
                                                    <option value="5">Todos</option>
                                                </select>
                                            </div>
                                            <div v-if="tipoModal==2">
                                                &nbsp;&nbsp;<input :disabled='!editavel' type="checkbox" v-model="ckDescanso4"
                                                                   id="ckDescanso4">
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label for="ckDescanso5">Sextas:</label></td>
                                        <td>
                                            <div v-if="tipoModal==1">
                                                <select :disabled='!editavel' name="qtde_sextas" v-model="qtde_sextas" class="form-select2">
                                                    <option value="0">Nenhum</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4</option>
                                                    <option value="5">Todos</option>
                                                </select>
                                            </div>
                                            <div v-if="tipoModal==2">
                                                &nbsp;&nbsp;<input :disabled='!editavel' type="checkbox" v-model="ckDescanso5"
                                                                   id="ckDescanso5">
                                            </div>
                                        </td>

                                    </tr>
                                </table>
                            </td>
                            <td style="vertical-align: top;">
                                <table>
                                    <tr>
                                        <td style="width:45%"><label for="ckDescanso6">Sábados:</label></td>
                                        <td>
                                            <div v-if="tipoModal==1">
                                                <select :disabled='!editavel' name="qtde_sabados" v-model="qtde_sabados" class="form-select2">
                                                    <option value="0">Nenhum</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4</option>
                                                    <option value="5">Todos</option>
                                                </select>
                                            </div>
                                            <div v-if="tipoModal==2">
                                                &nbsp;&nbsp;<input :disabled='!editavel' type="checkbox" v-model="ckDescanso6"
                                                                   id="ckDescanso6">
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label for="ckDescanso7">Domingos:</label></td>
                                        <td>
                                            <div v-if="tipoModal==1">
                                                <select :disabled='!editavel' name="qtde_domingos" v-model="qtde_domingos"
                                                        class="form-select2">
                                                    <option value="0">Nenhum</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4</option>
                                                    <option value="5">Todos</option>
                                                </select>
                                            </div>
                                            <div v-if="tipoModal==2">
                                                &nbsp;&nbsp;<input :disabled='!editavel' type="checkbox" v-model="ckDescanso7"
                                                                   id="ckDescanso7">
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label for="ckDescanso8">Feriados:</label></td>
                                        <td>
                                            <div v-if="tipoModal==1">
                                                <select :disabled='!editavel' name="qtde_feriados" v-model="qtde_feriados"
                                                        class="form-select2">
                                                    <option value="0">Nenhum</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4</option>
                                                    <option value="5">Todos</option>
                                                </select>
                                            </div>
                                            <div v-if="tipoModal==2">
                                                &nbsp;&nbsp;<input :disabled='!editavel' type="checkbox" v-model="ckDescanso8"
                                                                   id="ckDescanso8">
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div v-if="tipoModal==1">
                                                Descansos:
                                            </div>
                                        </td>
                                        <td>
                                            <div v-if="tipoModal==1">
                                                <select :disabled='!editavel' name="qtde_descansos" v-model="qtde_descansos"
                                                        class="form-select2">
                                                    <option value="0">Nenhum</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4</option>
                                                    <option value="5">Todos</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>

                                </table>
                            </td>
                        </tr>
                    </table>
                </div>

                <div v-if="tipo_repeticao=='revezamento'">
                    <p><b>Informe a jornada de trabalho:</b></p>
                    <table>
                        <tr>
                            <td>
                                <div v-if="tipoModal==1">
                                    Preencher com o horário acima
                                </div>
                                <div v-if="tipoModal==2">
                                    Preencher com descanso
                                </div>
                            </td>
                            <td>
                                <input :disabled='!editavel' type="text" name="revezamento_dias_sim" id="revezamento_dias_sim"
                                       @input="formatacaoSomenteNum"
                                       v-model="revezamento_dias_sim" class="form-control2" style="width: 50px;" /> dias
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align: right;">
                                <div v-if="tipoModal==1">
                                    e pular
                                </div>
                                <div v-if="tipoModal==2">
                                    e com trabalho
                                </div>
                            </td>
                            <td><input :disabled='!editavel' type="text" name="revezamento_dias_nao" id="revezamento_dias_nao"
                                       @input="formatacaoSomenteNum"
                                       v-model="revezamento_dias_nao" class="form-control2" style="width: 50px;" /> dias
                            </td>
                        </tr>
                    </table>
                </div>

                <div v-if="tipo_repeticao=='apagar'">
                    <p><b>Deletar o cartão:</b></p>
                    Clique Ok para apagar todas as informações.
                </div>

                <br><br>

                <div class="modal-body needs-validation pt-0" style="margin-left: auto !important;">

                    <div class="d-flex flex-column flex-sm-row">
                        <button class="btn btn-secondary mb-3 mb-sm-0" type="reset" data-bs-dismiss="modal">
                            Cancelar
                        </button>

                        <button id="btn_avancar" class="btn btn-primary ms-sm-3" @click.prevent="enviaRepetirHorarios">
                            Enviar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
    .form-label {
        padding-top: 15px;
    }

    .form-control {
        border: 1px #ddd solid;
        height: 43px;
        border-radius: 6px;
    }

    .form-control2 {
        border: 1px #ddd solid;
        height: 30px;
        border-radius: 5px;
    }

    .form-select {
        background-color: #fff;
        border: 1px #ddd solid;
        height: 30px;
        border-radius: 5px;
        padding: 0px;
        padding-left: 7px;
    }

    .form-select2 {
        background-color: #fff;
        border: 1px #ddd solid;
        height: 30px;
        border-radius: 5px;
        padding: 0px;
        padding-left: 7px;
        width: 120px;
    }

    .flutuar {
        position: fixed;
        bottom: 50px;
        right: 50px;
    }

    .flutuar td {
        padding-left: 5px;
    }

    .modal {
        --ar-modal-width: 650px;
    }

    input.erro {
        border: 1px solid red;
        background-color: #ffdddd;
    }

    .cartao tr {
        text-align: left !important;
    }

    .cartao td {
        text-align: left !important;
        padding-left: 5px;
    }

    table.cartao {
        border: 0px solid #000 !important;
    }

    .cartao pre {
        background-color: white !important;
        color: black !important;
        font-size: 10px;
        padding: 0;
        border: 0px;
    }

    table.cartao td.nulo {
        text-align: center !important;
    }

    .btn_proximo {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background-color: #31b07b;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        text-decoration: none;
        transition: background-color 0.3s ease;
        margin-left: 8px;
    }

    .btn_proximo:hover {
        background-color: #01579b;
    }

    .btn_proximo i.material-icons {
        color: white;
        vertical-align: middle;
    }

    .btn_anterior {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background-color: #01579b;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        text-decoration: none;
        transition: background-color 0.3s ease;
        margin-left: 8px;
    }

    .btn_anterior:hover {
        background-color: #0475d1;
    }

    .btn_anterior i.material-icons {
        color: white;
        vertical-align: middle;
    }

    body {
        overflow-x: hidden;
    }
</style>
