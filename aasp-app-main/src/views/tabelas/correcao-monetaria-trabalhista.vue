<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { yyyymmdd2dia, formataNum } from '@/utils/calcUtils'
import { RouterLink } from 'vue-router'

const data = ref({ indicadoresJudiciais: [] })
const loading = ref(true)
const error = ref(null)

const servidorAPI = import.meta.env.VITE_API_URL

onMounted(async () => {
    try {
        const response = await axios.get(`${servidorAPI}/front/resumo-trabalhista`)
        data.value = response.data

        // Rastreador (equivalente ao axios post do Nuxt)
        axios.post(
            `${servidorAPI}/menu/rastreador`,
            {
                pagina: 'correcao-monetaria-trabalhista',
                id_dono: 0,
                parametros: '',
            },
            { withCredentials: true }
        ).catch(console.error)

        // Configura título da página
        document.title = 'Justiça do Trabalho (TST) - Correção de Débitos Trabalhistas'
    } catch (err) {
        error.value = err
        console.error('Erro ao buscar os dados:', err)
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="tagPrincipal">
        <section id="content" class="bg-secondary">
            <section class="bg-secondary py-5">
                <div class="container pt-5 pb-lg-1 pb-xl-2 py-xxl-5">
                    <h1 class="h2 mb-2 mh2">Tabelas de cálculos trabalhistas</h1>
                </div>
            </section>

            <section class="container white-mode">
                <div v-if="loading">Carregando...</div>
                <div v-else-if="error">Erro ao carregar os dados.</div>
                <div v-else class="row row-cols-1 row-cols-sm-1 row-cols-md-1 row-cols-xl-1 g-4 pb-2 pb-sm-3 pb-lg-5">
                    <div class="col">
                        <div class="card border-0">
                            <div class="card-body">
                                <div class="tab-content">
                                    <div class="tab-pane fade show active" role="tabpanel">
                                        <div class="table-responsive mb-3">
                                            <p class="links1">
                                                <template
                                                    v-for="d in data.indicadoresJudiciais.filter(d => [3859, 3858, 3857, 3856, 7982].includes(d.id))"
                                                    :key="d.id"
                                                >
                                                    <RouterLink :to="{ path: d.urlAmigavel, query: { id: d.id } }" class="links2">
                                                        {{ d.nome }}
                                                    </RouterLink>
                                                    <br>
                                                </template>
                                            </p>
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
