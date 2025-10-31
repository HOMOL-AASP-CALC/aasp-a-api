<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import { yyyymmdd2dia, formataNum, diminuiMes, diminuiAno } from '@/utils/calcUtils'

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_UP })

const props = defineProps({
    tabela: { type: String, default: 'igpm' },
    titulo: { type: String, default: 'IGP-M (FGV)' }
})

const servidorAPI = import.meta.env.VITE_API_URL

// Reativos
const data = ref([])
const meses = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
    try {
        const url = `${servidorAPI}/front/tabela/${props.tabela}_2`
        const response = await axios.get(url)
        data.value = response.data

        // calculando os valores acumulados
        for (let i = 12; i < data.value.length; i++) {
            const dia = data.value[i].dia
            const a1 = new BigNumber(data.value[i].acumulado)
            const indice = new BigNumber(a1.dividedBy(data.value[i - 12].acumulado).toNumber())
            const perc = indice.minus(1).multipliedBy(100)

            meses.value.push({ dia, indice, perc })
        }
    } catch (err) {
        error.value = err
        console.error('Erro ao buscar os dados:', err)
    } finally {
        loading.value = false
    }
})

// últimos 3 meses
const meses2 = computed(() => meses.value.slice(-3))
</script>



<template>

    <section class="container white-mode" >
        <div class="card border-0">
            <div class="card-body pb-0">
                <h2 class="h5ms-2 mh5">{{  titulo }}</h2>
            </div>

            <!-- {{  data }} -->
            <div class="card-body">
                <div class="tab-content">
                    <div class="tab-pane fade show active" id="preview6" role="tabpanel">
                        <div class="table-responsive mb-3">

                            <table class="mtabela table table-hove ">

                                <tbody v-for="d1 in meses2">
                                <tr>
                                    <td>
                                        <table style="width:100%">
                                            <tbody>
                                            <tr >
                                                <td style="text-align: left;">{{  yyyymmdd2dia(d1.dia.toString() ).substring(3)  }}</td>
                                                <td style="text-align: right;">{{  formataNum( d1.perc,2)  }}%</td>
                                            </tr>
                                            <tr>
                                                <td style="text-align: left;">Índice multiplicador:</td><td>{{  formataNum(d1.indice.toFixed(4),4)  }}</td>
                                            </tr>
                                            <tr>
                                                <td style="text-align: left;" colspan="2">Correção de {{  yyyymmdd2dia(  diminuiAno(  d1.dia.toString() ) ).substring(3)  }} a {{  yyyymmdd2dia(  diminuiMes(  d1.dia.toString() ) ).substring(3)  }} </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                </tbody>

                            </table>
                        </div>

                        <router-link :to="`/tabelas/reajuste-aluguel-antigo/${props.tabela}`"  class="btn btn-outline-primary btn-sm" type="button">Ver índices antigos</router-link>
                    </div>
                </div>
            </div>
        </div>
        <br />
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
    text-align: right;
    padding: 4px;
}

.mtabela th {
    font-weight: 600;
    font-size:16px !important;
    text-align: right;

}

.mtabela tr:hover {
    font-weight: 600;
    font-size:16px !important;
    text-align: right;
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

</style>
