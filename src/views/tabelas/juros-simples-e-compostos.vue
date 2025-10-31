<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import BigNumber from 'bignumber.js'

// Substitua pelo seu formatter global ou crie localmente
function formataNum(valor, casas) {
    return Number(valor).toFixed(casas)
}

const route = useRoute()
const perc = Number(route.params.perc) || 0
const perc_str = formataNum(perc, 2) + '%'

const meses = [[], [], [], [], [], [], [], [], [], []]
let nomeTabela = ref('Juros simples e compostos de ' + perc_str)

let grupo = 0
let contador = 0

for (let i = 1; i <= 480; i++) {
    contador++
    if (contador > 48) {
        contador = 1
        grupo++
    }
    let composto = new BigNumber(perc)
    composto = composto.dividedBy(100).plus(1).exponentiatedBy(i).minus(1).multipliedBy(100)

    meses[grupo].push({
        p: i,
        s: i * perc,
        c: composto.toNumber()
    })
}

// SEO manual
onMounted(() => {
    document.title = `Tabela de juros de ${perc_str} | Debit`

    let metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
        metaDescription.setAttribute('content', `Tabela de juros de ${perc_str} | Debit`)
    } else {
        const meta = document.createElement('meta')
        meta.name = 'description'
        meta.content = `Tabela de juros de ${perc_str} | Debit`
        document.head.appendChild(meta)
    }

    let linkCanonical = document.querySelector('link[rel="canonical"]')
    if (linkCanonical) {
        linkCanonical.href = 'https://www.debit.com.br' + route.fullPath
    } else {
        const link = document.createElement('link')
        link.rel = 'canonical'
        link.href = 'https://www.debit.com.br' + route.fullPath
        document.head.appendChild(link)
    }

    // Rastreio via API
    axios.post(
        'https://api.seuservidor.com/menu/rastreador', // substitua pela URL real
        {
            pagina: 'tabelas-juros',
            id_dono: 0,
            parametros: '',
        },
        { withCredentials: true }
    ).then(res => console.log('Rastreador enviado:', res.data))
        .catch(err => console.error(err))
})
</script>

<template>
    <section id="content" class="tagPrincipal">
        <section class="bg-secondary py-5">
            <div class="container pt-5 pb-lg-1 pb-xl-2 py-xxl-3">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item">
                            <router-link class="dropdown-item" to="/tabelas/indicadores-economicos">Indicadores econômicos</router-link>
                        </li>
                        <li class="breadcrumb-item">{{ nomeTabela }}</li>
                    </ol>
                </nav>
                <h1 class="h2 mb-2 mh2">{{ nomeTabela }}</h1>
            </div>

            <section class="container white-mode">
                <div class="row row-cols-1 g-4 pb-2 pb-sm-4 pb-lg-5">
                    <div class="card border-0">
                        <div class="card-body">
                            <h3 class="h6 mb-2 mh2">Selecione o percentual:</h3>
                            <div class="tab-content">
                                <router-link class="link2" to="/tabelas/juros-simples-e-compostos/0.5">Juros de 0,50% ao mês</router-link><br />
                                <router-link class="link2" to="/tabelas/juros-simples-e-compostos/1">Juros de 1,00% ao mês</router-link><br />
                                <router-link class="link2" to="/tabelas/juros-simples-e-compostos/1.5">Juros de 1,50% ao mês</router-link><br />
                                <router-link class="link2" to="/tabelas/juros-simples-e-compostos/2">Juros de 2,00% ao mês</router-link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </section>

        <section class="container white-mode">
            <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-3 g-4 pb-2 pb-sm-4 pb-lg-5">
                <div class="col" v-for="(a, idx) in meses" :key="idx">
                    <div class="card border-0">
                        <div class="card-body">
                            <div class="tab-content">
                                <div class="tab-pane fade show active" id="preview6" role="tabpanel">
                                    <div class="table-responsive mb-3">
                                        <table class="mtabela table table-hover">
                                            <thead>
                                            <tr>
                                                <th style="text-align: left;">Período</th>
                                                <th>Juros simples</th>
                                                <th>Juros compostos</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr v-for="(b, j) in a" :key="j">
                                                <td>{{ b.p }}</td>
                                                <td>{{ formataNum(b.s, 4) }}%</td>
                                                <td>{{ formataNum(b.c, 4) }}%</td>
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
</template>

<style scoped>
.tagPrincipal {
    background-color: #f6f9fc;
    padding-bottom: 50px;
}

.mh2 {
    font-family: "Inter", sans-serif !important;
    margin-top: 30px;
}

.mtabela td {
    font-family: "Inter", sans-serif !important;
    font-size: 14px !important;
    color: #000;
    text-align: right;
    padding: 4px;
}

.mtabela th {
    font-weight: 600;
    font-size: 16px !important;
    text-align: right;
}

.mtabela tr:hover {
    font-weight: 600;
    font-size: 16px !important;
    text-align: right;
    background-color: #eee;
    cursor: pointer;
}

.links1 {
    line-height: 26px;
}

.link2 {
    cursor: pointer;
    text-decoration: underline;
    color: #000;
    padding-left: 0px;
}
</style>
