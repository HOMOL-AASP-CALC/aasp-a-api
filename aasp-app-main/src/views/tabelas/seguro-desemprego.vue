<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { yyyymmdd2dia, formataNum, moeda } from '../../utils/calcUtils.js' // seu util convertido

const data = ref([])
const mesFinal = ref('')

// URL da API
const servidorGeralAPI = import.meta.env.VITE_API_URL

onMounted(async () => {
    try {
        const response = await axios.get(`${servidorGeralAPI}/front/tabela/segdes`)
        data.value = response.data

        // mesFinal
        if (data.value.length > 0) {
            mesFinal.value = data.value[0].dia.substring(6,8) + '/' + data.value[0].dia.substring(0,4)
        }

        // rastreador
        await axios.post(
            `${servidorGeralAPI}/menu/rastreador`,
            {
                pagina: 'tabelas/seguro-desemprego',
                id_dono: 0,
                parametros: '',
            },
            { withCredentials: true }
        )
    } catch (err) {
        console.error('Erro ao carregar dados', err)
    }

    // Título da página (pode usar document.title diretamente)
    document.title = 'Histórico do Seguro Desemprego: de 1991 a ' + mesFinal.value
})
</script>

<template>
    <div class="tagPrincipal">
        <section id="content" class="bg-secondary">
            <section class="bg-secondary py-5">
                <div class="container pt-5 pb-lg-1 pb-xl-2 py-xxl-3">
                    <h1 class="h2 mb-2 mh2">Histórico das tabelas do seguro desemprego</h1>
                </div>
                <div style="height: 250px;"></div>
            </section>

            <section class="container white-mode" style="margin-top: -260px;">
                <div class="row row-cols-1 row-cols-sm-1 row-cols-md-2 row-cols-xl-2 g-4 pb-2 pb-sm-4 pb-lg-5">
                    <div v-for="m in data" :key="m.dia" class="col">
                        <div class="card border-0">
                            <div class="card-body pb-0">
                                <h2 class="h5ms-2 mh5">Seguro desemprego ref. {{ yyyymmdd2dia(m.dia).substring(3) }}</h2>
                            </div>
                            <div class="card-body">
                                <div class="tab-content">
                                    <div class="tab-pane fade show active" id="preview6" role="tabpanel">
                                        <div class="table-responsive mb-3">
                                            <table class="table table-hover">
                                                <thead>
                                                <tr>
                                                    <th>Faixas de salário médio</th>
                                                    <th style="text-align: left;">Valor da parcela</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                <tr>
                                                    <td>Até: {{ moeda(m.dia) }} {{ formataNum(m.limite_min,2) }}</td>
                                                    <td style="text-align: left;">Multiplica-se o salário médio por 0,8 (80%).</td>
                                                </tr>
                                                <tr>
                                                    <td>Mais de {{ moeda(m.dia) }} {{ m.limite_min }} <br>Até {{ moeda(m.dia) }} {{ formataNum(m.limite_max,2) }}</td>
                                                    <td style="text-align: left;">
                                                        O que exceder a {{ moeda(m.dia) }} {{ formataNum(m.limite_min ,2) }} multiplica-se<br />
                                                        por 0,5 (50%) e soma-se a {{ moeda(m.dia) }} {{ formataNum(Math.floor(m.limite_min * 0.8),2)}}.
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>Acima de {{ moeda(m.dia) }} {{ m.limite_max }}</td>
                                                    <td style="text-align: left;">O valor da parcela<br /> será {{ moeda(m.dia) }} {{ formataNum(m.beneficio_max,2) }} invariavelmente.</td>
                                                </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> <!-- v-for -->
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
    font-size:18px !important;
    font-weight: 600;
}

.mtabela td {
    font-family: "Inter", sans-serif !important;
    font-size:14px !important;
    color: #000;
}

.mtabela th {
    font-weight: 600;
    font-size:16px !important;
}
</style>
