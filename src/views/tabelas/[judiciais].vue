<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import axios from 'axios'

import TabelaJudicial from '@/components/tabelaJudicial2.vue'

const route = useRoute()

// Monitorar mudanças na rota
onBeforeRouteUpdate((to, from, next) => {
    if (to.query.id !== from.query.id) {
        // poderia disparar busca novamente aqui se quiser
    }
    next()
})

const tabelaIndexadores = [
    { id: 47, nome: 'sem corr.', nomeGrande: 'Sem correção' },
    { id: 1, nome: 'ORTN', nomeGrande: 'ORTN / OTN' },
    { id: 73, nome: 'BTN', nomeGrande: 'BTN' },
    { id: 42, nome: 'IPC', nomeGrande: 'IPC (IBGE)' },
    { id: 41, nome: 'IPC-r', nomeGrande: 'IPC-r (IBGE)' },
    { id: 18, nome: 'INPC', nomeGrande: 'INPC (IBGE)' },
    { id: 17, nome: 'IPCA', nomeGrande: 'IPCA (IBGE)' },
    { id: 45, nome: 'IPCA-E', nomeGrande: 'IPCA-E (IBGE)' },
    { id: 105, nome: 'Ufir', nomeGrande: 'Ufir' },
    { id: 23, nome: 'Selic S', nomeGrande: 'Selic (simples)' },
    { id: 24, nome: 'Selic C', nomeGrande: 'Selic (capitlzd)' },
    { id: 107, nome: 'IRSM', nomeGrande: 'IRSM' },
    { id: 106, nome: 'URV', nomeGrande: 'URV (mensal)' },
    { id: 3, nome: 'IGP-DI', nomeGrande: 'IGP-DI (FGV)' },
    { id: 4, nome: 'IPC', nomeGrande: 'IPC (FGV)' },
    { id: 80, nome: 'Média IGP/INPC', nomeGrande: 'Média IGP/INPC' },
    { id: 10, nome: 'TR', nomeGrande: 'TR (Bacen)' },
    { id: 16, nome: 'IGP-M', nomeGrande: 'IGP-M (FGV)' },
    { id: 87, nome: 'Poup.', nomeGrande: 'Poupança (BC:196)' },
    { id: 95, nome: 'Poup.', nomeGrande: 'Poupança (BC:7828)' },
]

// helpers
function mesAno2dia(d) {
    if (!d) return 0
    d = parseInt(d)
    let ano = Math.floor(d / 12)
    let mes = d - ano * 12
    if (mes == 0) {
        mes = 12
        ano--
    }
    let zero = mes < 10 ? '0' : ''
    return `${zero}${mes}/${ano}`
}

function dia2mesAno(data) {
    if (!data) return 0
    data = data.replace(/^0+/, '') // Remove zeros à esquerda
    let [mes, ano] = data.split('/').map(n => parseInt(n, 10))
    if (!mes || !ano) return 0
    if (mes === 12) {
        ano++
        mes = 0
    }
    return ano * 12 + mes
}

const hoje = new Date()
const dia = String(hoje.getDate()).padStart(2, '0')
const mes = String(hoje.getMonth() + 1).padStart(2, '0')
const ano = hoje.getFullYear()
const diaHoje = `${dia}/${mes}/${ano}`

// Config local (em Vue puro não tem runtimeConfig)
const servidorAPI = import.meta.env.VITE_API_URL

let selic_inicio = ref('')
let dataAtual = ref(diaHoje)
let tabela = ref({})
let resumo = ref({})
let nomeTabela = ref('')
let maximo = ref('')
let maximoSelic = ref(diaHoje)
let percentualSelic = ref(0)
let totalAtualizado = ref(0)
const loading = ref(false)
const errado = ref(false)
const erradoSelic = ref(false)

const valorOriginal = ref('1.000.000,00')
const coeficiente = ref(0.1111)
const dataSelecionada = ref('01/01/1984')

const valorAtualizado = computed(() => {
    const strCoeficiente = coeficiente.value.toString().replace(',', '.')
    const numCoeficiente = parseFloat(strCoeficiente)
    let strValorOriginal = valorOriginal.value.replace(/\./g, '')
    strValorOriginal = strValorOriginal.replace(',', '.')
    const numValorOriginal = parseFloat(strValorOriginal)
    return numCoeficiente * numValorOriginal
})

const url1 = `${servidorAPI}/calculosDiversos/tabelaDireta`
let dados = ref({
    completa: true,
    dataAtual: dataAtual.value,
    indexador: route.query.id,
    jurosTab: [{ modo: 12, ate: 0 }],
    modoSelic: 'princJuros',
    calc_selic: true,
})

// carregar dados iniciais (antes usava useAsyncData)
async function carregarDadosIniciais() {
    try {
        const { data } = await axios.post(url1, dados.value, {
            headers: { 'Content-Type': 'application/json' },
        })
        tabela.value = data.tabela
        resumo.value = formataResumo(data.resumo)
        nomeTabela.value = data.nome
        maximo.value = data.dataMaxima
        dataAtual.value = data.dataMaxima
        adicionaDescricaoIndexador(resumo)
        verificaSelic(resumo)
    } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err)
    }
}
await carregarDadosIniciais()

// formata resumo
function formataResumo(resumo) {
    return resumo.map(d => ({
        inicio: mesAno2dia(d.inicio),
        fim: mesAno2dia(d.fim),
        indexador: d.indexador,
        indexadorNome: buscarNomePorId(d),
    }))
}

// buscar dados via botão
async function buscarDados() {
    loading.value = true
    dados.value.dataAtual = dataAtual.value
    dados.value.selic_inicio =
        selic_inicio.value && selic_inicio.value.length === 10 ? selic_inicio.value : ''
    try {
        const { data } = await axios.post(url1, dados.value, {
            headers: { 'Content-Type': 'application/json' },
        })
        tabela.value = data.tabela
        resumo.value = formataResumo(data.resumo)
        nomeTabela.value = data.nome
        maximo.value = data.dataMaxima
        adicionaDescricaoIndexador(resumo)
        verificaSelic(resumo)
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

function verificaSelic(resumoTabela) {
    let ultimoIndexador = resumoTabela.value[resumoTabela.value.length - 1]
    if (ultimoIndexador.indexador == 23) {
        let ultimoSelic = resumoTabela.value.filter(r => r.indexador == 23).pop()
        selic_inicio.value = '01/' + ultimoSelic.inicio
        const dataSelecionadaMesAno = dia2mesAno(dataSelecionada.value.substring(3, 10))
        const buscaMesAno = tabela.value.find(r => r.mesano == dataSelecionadaMesAno)
        percentualSelic.value = buscaMesAno.selicAcumulada.toFixed(2)
        totalAtualizado = (valorAtualizado.value * (1 + percentualSelic.value / 100)).toFixed(2)
    } else {
        percentualSelic.value = 0
        totalAtualizado.value = 0
    }
}

function adicionaDescricaoIndexador(resumoTabela) {
    for (let i in resumoTabela.value) {
        let d = resumoTabela.value[i]
        const correspondente = resumo.value.find(r => d.inicio >= r.inicio && d.fim <= r.fim)
        if (correspondente && correspondente.desc) {
            d['desc'] = correspondente.desc
        }
    }
}

function buscarNomePorId(d1) {
    const indexador = tabelaIndexadores.find(x => x.id === d1.indexador)
    return indexador ? indexador.nome : d1?.desc ?? ''
}

const buscarCoeficiente = () => {
    if (!dataSelecionada.value || dataSelecionada.value.length < 10) {
        coeficiente.value = null
        return
    }
    const mesAno = dataSelecionada.value.substring(3, 10)
    const dt = dia2mesAno(mesAno)
    if (!dt) {
        coeficiente.value = null
        return
    }
    if (!tabela.value || !Array.isArray(tabela.value)) {
        coeficiente.value = null
        return
    }
    const item = tabela.value.find(entry => entry.mesano == dt)
    coeficiente.value = item ? item.indiceGerado : null
}
watch(dataSelecionada, buscarCoeficiente)
watch(valorOriginal, buscarCoeficiente)
buscarCoeficiente()

function handleErradoUpdate(event) {
    erradoSelic.value = event
}
</script>

<template>
    <!-- troquei NuxtLink por router-link -->
    <router-link :to="`/tabelas/indicadores-economicos`">Indicadores econômicos</router-link>
    <TabelaJudicial
        v-if="!loading"
        :resumo="resumo"
        :dados="tabela"
        :nomeTabela="nomeTabela"
    />
    <div v-else class="loading">Carregando dados...</div>
</template>
