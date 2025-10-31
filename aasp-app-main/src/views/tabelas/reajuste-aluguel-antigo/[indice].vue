<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import { yyyymmdd2dia, formataNum } from '@/utils/calcUtils'

// Configura BigNumber
BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_UP })

// Props / Parâmetro de rota
import { useRoute } from 'vue-router'
const route = useRoute()
const indice = route.params.indice

// Map de nomes dos índices
const a_indice = {
    igpm: 'IGP-M (FGV)',
    igp: 'IGP (FGV)',
    inpc: 'INPC (IBGE)',
    ipc_fipe: 'IPC (FIPE)',
    ipc_fgv: 'IPC (FGV)',
    ipca: 'IPCA (IBGE)',
    ipca_e: 'IPCA-E (IBGE)',
    icv: 'ICV (DIEESE)',
    ivar: 'IVAR (FGV)',
}

// Reativos
const data = ref([])
const meses = ref({}) // objeto com anos como chave
const loading = ref(true)
const error = ref(null)

const servidorAPI = import.meta.env.VITE_API_URL

// Busca dados e calcula os índices
onMounted(async () => {
    try {
        const response = await axios.get(`${servidorAPI}/front/tabela/${indice}`)
        data.value = response.data

        for (let i = 12; i < data.value.length; i++) {
            const dia = data.value[i].dia
            const a1 = new BigNumber(data.value[i].acumulado)
            const indiceVal = a1.dividedBy(data.value[i - 12].acumulado).toNumber().toFixed(4)
            const ano = dia.toString().substring(0, 4)

            if (!meses.value[ano]) meses.value[ano] = []

            meses.value[ano].push({ dia, indice: indiceVal })
        }

    } catch (err) {
        error.value = err
        console.error('Erro ao buscar os dados:', err)
    } finally {
        loading.value = false
    }

    // Rastreador (similar ao Nuxt useMounted)
    axios.post(
        `${servidorAPI}/menu/rastreador`,
        {
            pagina: 'tabelas-reajuste-aluguel-antigo',
            id_dono: 0,
            parametros: '',
        },
        { withCredentials: true }
    ).catch(console.error)
})
</script>


<template>
    <div class="tagPrincipal">
        <section id="content" class="bg-secondary">
            <section class="bg-secondary py-5">
                <div class="container pt-5 pb-lg-1 pb-xl-2 py-xxl-3">
                    <h1 class="h2 mb-2 mh2">
                        Índices antigos para reajuste de aluguel utilizando {{ a_indice[indice] }}
                    </h1>
                </div>
            </section>

            <section class="container white-mode">
                <div v-if="loading">Carregando...</div>
                <div v-else-if="error">Erro ao carregar os dados.</div>
                <div v-else class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4 pb-2 pb-sm-4 pb-lg-5">
                    <div v-for="(m, ano) in meses" :key="ano" class="col">
                        <div class="card border-0">
                            <div class="card-body pb-0">
                                <h2 class="h5ms-2 mh5">{{ ano }}</h2>
                            </div>

                            <div class="card-body">
                                <div class="tab-content">
                                    <div class="tab-pane fade show active" role="tabpanel">
                                        <div class="table-responsive mb-3">
                                            <table class="mtabela table table-hover">
                                                <thead>
                                                <tr>
                                                    <th>Data</th>
                                                    <th style="text-align: right;">Valor</th>
                                                </tr>
                                                </thead>
                                                <tbody v-for="(t, index) in m" :key="index">
                                                <tr>
                                                    <td>{{ yyyymmdd2dia(t.dia.toString()) }}</td>
                                                    <td style="text-align: right;">{{ formataNum(t.indice, 4) }}</td>
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
        </section>
    </div>
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
}

.mtabela th {
    font-weight: 600;
    font-size:16px !important;
}

</style>
