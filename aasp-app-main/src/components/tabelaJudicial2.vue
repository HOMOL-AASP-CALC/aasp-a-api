<script setup>

import axios from "axios";
import { ref, onMounted, computed, defineProps } from 'vue';

const tabelaRef = ref(null);

const props = defineProps({
    dados: {
        type: Object,
        default: () => ({})
    },
    resumo: {
        type: Object,
        default: () => ({})
    },
    nomeTabela:{
        type: String,
        default: 'Tabela Judicial'
    },
})

const tabelaIndexadores = [
    { id: 47, nome: 'sem corr.', nomeGrande: 'Sem correção'},
    { id: 1, nome: 'ORTN', nomeGrande: 'ORTN / OTN'},
    { id: 73, nome: 'BTN', nomeGrande: 'BTN'},
    { id: 42, nome: 'IPC', nomeGrande: 'IPC (IBGE)'},
    { id: 41, nome: 'IPC-r', nomeGrande: 'IPC-r (IBGE)'},
    { id: 18, nome: 'INPC', nomeGrande: 'INPC (IBGE)'},
    { id: 17, nome: 'IPCA', nomeGrande: 'IPCA (IBGE)'},
    { id: 45, nome: 'IPCA-E', nomeGrande: 'IPCA-E (IBGE)'},
    { id: 105, nome: 'Ufir', nomeGrande: 'Ufir'},
    { id: 23, nome: 'Selic S', nomeGrande: 'Selic (simples)'},
    { id: 24, nome: 'Selic C', nomeGrande: 'Selic (capitlzd)'},
    { id: 107, nome: 'IRSM', nomeGrande: 'IRSM'},
    { id: 106, nome: 'URV', nomeGrande: 'URV (mensal)'},
    { id: 3, nome: 'IGP-DI', nomeGrande: 'IGP-DI (FGV)'},
    { id: 4, nome: 'IPC', nomeGrande: 'IPC (FGV)'},
    { id: 80, nome: 'Média IGP/INPC', nomeGrande: 'Média IGP/INPC'},
    { id: 10, nome: 'TR', nomeGrande: 'TR (Bacen)'},
    { id: 16, nome: 'IGP-M', nomeGrande: 'IGP-M (FGV)'},
    { id: 87, nome: 'Poup.', nomeGrande: 'Poupança (BC:196)'},
    { id: 95, nome: 'Poup.', nomeGrande: 'Poupança (BC:7828)'},
]

const tabelaJudicial = ref({})
const agregado = ref({})
const tabela1 = ref();
const dados = props.dados
const resumo = ref();
const anoAtual = new Date().getFullYear()

async function rodar() {
    try {
        let ultimoMes = 0
        // const tabela1 = props.dados
        if (Array.isArray(dados)) {
            tabela1.value = dados;
            resumo.value = props.resumo
        } else {
            throw new TypeError('Response data is not an array');
        }

        for (const item of tabela1.value) {
            tabelaJudicial.value[item.mesano] = item
            ultimoMes = item.mesano
        }


        for (let i in tabelaJudicial.value ) {
            let d = tabelaJudicial.value[i]

            if (!!isNaN(d.mesano)) {
                console.error('Erro ao realizar a solicitação: Mesano inválido')
                continue
            }

            let data = mesAno2dia(d.mesano).toString()
            let mes = data.substring(0,2)
            let ano = data.substring(3,7)
            if (ano < 1964) {
                continue
            }

            if (typeof agregado.value[ ano ] == 'undefined') {
                agregado.value[ ano ] = []
                agregado.value[ ano ].exibirSelic = false
            }

            d['mes'] = mes

            // Procura um intervalo correspondente no resumo
            const correspondente = resumo.value.find(
                (r) => d.mesano >= r.inicio && d.mesano <= r.fim
            );
            // Adiciona o campo "desc" se ele existir no resumo
            if (correspondente && correspondente.desc) {
                d['desc'] = correspondente.desc;
            }

            agregado.value[ano].push( d )
            if (d.selicAcumulada > 0)
                agregado.value[ ano ].exibirSelic = true
        }
        //remover 1964 do agregado
        delete agregado.value[1964]

    } catch (error) {
        console.error('Erro ao realizar a solicitação:', error)
    }
}


function mesAno2ano(d) {
    if (!d) return 0;
    d = parseInt(d)
    const ano = Math.floor( d / 12 )
    return  ano.toString()
}
function mesAno2mes(d) {
    if (!d) return 0;
    // if (d.length < 10) return 0;
    d = parseInt(d)
    let ano = Math.floor( d / 12 )
    let mes = d-(ano*12)
    if (mes==0) { mes = 12; ano--; }
    let zero = (mes<10) ? '0' : ''
    return  `${zero}${mes}`
}


function mesAno2dia(d) {
    if (!d) return 0;
    // if (d.length < 10) return 0;
    d = parseInt(d)
    let ano = Math.floor( d / 12 )
    let mes = d-(ano*12)
    if (mes==0) { mes = 12; ano--; }
    let zero = (mes<10) ? '0' : ''
    return  `${zero}${mes}/${ano}`
}

const { $yyyymmdd2dia } = useNuxtApp()
const { $formataNum } = useNuxtApp()

const buscarNomePorId = computed(() => (d1) => {
    const indexador = tabelaIndexadores.find(x => x.id === d1.indexador)
    return indexador ? indexador.nome : d1?.desc ?? '' // Valor padrão caso não encontre
})

const test = ref('')
const runtimeConfig = useRuntimeConfig();

onMounted( () => {
    rodar();
    console.log('passei')
    const data1 = axios.get(`${runtimeConfig.public.servidorGeralAPI}/front/infoUsuario`,{ withCredentials: true }).then(
        (response) => {
            let d = response.data
            test.value = d.v_nome_perfil
        }
    )
})

rodar();

//converter resumo objetos para array
let indices = []
for (let i in props.resumo) {
    let d = props.resumo[i]
    indices.push([d.inicio, d.fim, d.indexadorNome])
}


</script>

<template>
    <section  ref="tabelaRef" id="content"  class="tagPrincipal">
        <section class="bg-secondary py-5">
            <div style="height: 160px;">

            </div>
        </section>

    </section>
    <section class="container white-mode" style="margin-top: -260px;">

        <div v-if="agregado && Object.keys(agregado).length" class="row row-cols-12 row-cols-sm-12 row-cols-md-12 row-cols-xl-12 g-4 pb-2 pb-sm-4 pb-lg-5">
            <div class="col containerAno" v-for="a in agregado" >
                <div class="card border-0">
                    <div class="card-body pb-0">
                        <h2 class="h5ms-2 mh5">{{ mesAno2ano(a[0].mesano) }}</h2>
                    </div>


                    <div class="card-body">
                        <div class="tab-content">
                            <div class="tab-pane fade show active" id="preview6" role="tabpanel">
                                <div class="table-responsive mb-3"  style="overflow-x: hidden">
                                    <table  class="mtabela table table-hove ">
                                        <thead>
                                        <tr>
                                            <th>Mês</th>
                                            <th>Índice</th>
                                            <th v-show="a.exibirSelic">Selic</th>
                                            <th>Variação</th>
                                            <th>Indexador</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr v-for="d1 in a">
                                            <td>{{ mesAno2mes(d1.mesano)}}</td>
                                            <td>{{$formataNum(d1.indiceGerado,9) }}</td>
                                            <td v-show="a.exibirSelic">{{$formataNum(d1.selicAcumulada,2)}}%</td>
                                            <td>
                                                {{ $formataNum(d1.variacao, 2)+'%' }}
                                            </td>
                                            <td>{{
                                                    buscarNomePorId(d1)
                                                }}</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.tagPrincipal {
    background-color: #f6f9fc;
}

.mh2 {
    font-family:  "Inter", sans-serif !important;
    margin-top: 30px;
}

.mh5 {
    font-family:  "Inter", sans-serif !important;
    font-size:18px !important;
    font-weight: 600;
}

.mtabela td {
    font-family:  "Inter", sans-serif !important;
    font-size:14px !important;
    color: #000;
    text-align: center;
    padding: 4px;
}

.mtabela th {
    font-weight: 600;
    font-size:16px !important;
    text-align: center;

}

.mtabela tr:hover {
    font-weight: 600;
    font-size:16px !important;
    text-align: center;
    background-color: #eee;
    cursor: pointer;
}

.tagPrincipal {
    background-color: #f6f9fc;
    padding-bottom: 50px;
}

.links1 {
    line-height: 26px;
}

.links2 {
    cursor: pointer;
    text-decoration: underline;
    color: #000;
    padding-left: 0px;
}
.containerAno {
    max-width: 700px;
}
</style>
