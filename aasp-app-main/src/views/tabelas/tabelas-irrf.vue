<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

// --- helpers substituindo $yyyymmdd2dia, $formataNum, $moeda, $yyyymmddHoje, $diminuiMes
function yyyymmdd2dia(yyyymmdd) {
    return `${yyyymmdd.substring(6, 8)}/${yyyymmdd.substring(4, 6)}/${yyyymmdd.substring(0, 4)}`
}

function formataNum(valor, casas = 2) {
    if (valor == null) return ''
    return Number(valor).toFixed(casas)
}

function moeda(dia) {
    return 'R$'
}

function yyyymmddHoje() {
    const hoje = new Date()
    const dia = String(hoje.getDate()).padStart(2, '0')
    const mes = String(hoje.getMonth() + 1).padStart(2, '0')
    const ano = hoje.getFullYear()
    return `${ano}${mes}${dia}`
}

function diminuiMes(yyyymmdd) {
    const ano = parseInt(yyyymmdd.substring(0,4))
    const mes = parseInt(yyyymmdd.substring(4,6))
    const dia = yyyymmdd.substring(6,8)
    let novoMes = mes - 1
    let novoAno = ano
    if (novoMes === 0) {
        novoMes = 12
        novoAno -= 1
    }
    return `${novoAno}${String(novoMes).padStart(2,'0')}${dia}`
}

// --- configuração da API
const runtimeConfig = {
    public: {
        servidorGeralAPI: import.meta.env.VITE_API_URL
    }
}

const route = useRoute()
const meses = ref([])

let fimtab = yyyymmddHoje()

// --- carregar dados da tabela
async function carregarTabelas() {
    try {
        const { data } = await axios.get(`${runtimeConfig.public.servidorGeralAPI}/front/tabela/irrf`)
        // montar meses
        for (const item of data) {
            const m = meses.value.find((mes) => mes.dia === item.dia)
            if (!m) {
                meses.value.push({
                    dia: item.dia,
                    titulo: item.dia !== fimtab
                        ? `de ${yyyymmdd2dia(item.dia).substring(3)} a ${yyyymmdd2dia(fimtab).substring(3)}`
                        : `de ${yyyymmdd2dia(item.dia).substring(3)}`,
                    tab: data.filter(i => i.dia === item.dia)
                })
                fimtab = diminuiMes(item.dia)
            }
        }
    } catch (err) {
        console.error('Erro ao carregar tabelas IRRF:', err)
    }
}

// --- rastreador
onMounted(async () => {
    await carregarTabelas()

    axios.post(
        `${runtimeConfig.public.servidorGeralAPI}/menu/rastreador`,
        {
            pagina: 'tabelas-irrf',
            id_dono: 0,
            parametros: '',
        },
        { withCredentials: true }
    )
})
</script>

<template>
    <div class="tagPrincipal">
        <section id="content" class="bg-secondary">
            <section class="bg-secondary py-5">
                <div class="container pt-5 pb-lg-1 pb-xl-2 py-xxl-3">
                    <h1 class="h2 mb-2 mh2">
                        Tabelas do IRRF de 1989 a {{ meses[0]?.dia.substring(0, 4) }}
                    </h1>
                </div>
                <div style="height: 250px;"></div>
            </section>

            <section class="container white-mode" style="margin-top: -260px;">
                <div class="row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-xl-2 g-4 pb-2 pb-sm-4 pb-lg-5">
                    <div v-for="m in meses" :key="m.dia" class="col">
                        <div class="card border-0">
                            <div class="card-body pb-0">
                                <h2 class="h5 ms-2 mh5">Tabela de IRRF {{ m.titulo }}</h2>
                            </div>

                            <div class="card-body">
                                <div class="tab-content">
                                    <div class="tab-pane fade show active" id="preview6" role="tabpanel">
                                        <div class="table-responsive mb-3">
                                            <table class="mtabela table table-hover">
                                                <thead>
                                                <tr>
                                                    <th>Base de cálculo</th>
                                                    <th style="text-align: right;">Alíquota</th>
                                                    <th style="text-align: right;">Dedução</th>
                                                </tr>
                                                </thead>
                                                <tbody v-for="(t,index) in m.tab" :key="index">
                                                <tr>
                                                    <td v-if="t.faixa_ate>0">
                                                        de {{ moeda(m.dia) }} {{ formataNum(t.faixa_de,2) }} até {{ moeda(m.dia) }} {{ formataNum(t.faixa_ate,2) }}
                                                    </td>
                                                    <td v-else>a partir de {{ moeda(m.dia) }} {{ formataNum(t.faixa_de,2) }}</td>
                                                    <td style="text-align: right;" v-if="t.faixa_de<=0">isento</td>
                                                    <td style="text-align: right;" v-if="t.faixa_de>0">{{ formataNum(t.aliquota,2) }}%</td>
                                                    <td style="text-align: right;">{{ moeda(m.dia) }} {{ formataNum(t.deducao,2) }}</td>
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
    font-family: "Inter", sans-serif !important;
    margin-top: 30px;
}
.mh5 {
    font-family: "Inter", sans-serif !important;
    font-size: 18px !important;
    font-weight: 600;
}
.mtabela td {
    font-family: "Inter", sans-serif !important;
    font-size: 14px !important;
    color: #000;
}
.mtabela th {
    font-weight: 600;
    font-size: 16px !important;
}
</style>
