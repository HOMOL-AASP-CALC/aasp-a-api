<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const moedas = ref([])

// API
const servidorGeralAPI = import.meta.env.VITE_API_URL

onMounted(async () => {
    // Define o título da página
    document.title = 'Histórico das moedas brasileiras desde 1942 | Debit'

    try {
        await axios.post(
            `${servidorGeralAPI}/menu/rastreador`,
            {
                pagina: 'tabelas-moedas',
                id_dono: 0,
                parametros: '',
            },
            { withCredentials: true }
        )
    } catch (err) {
        console.error('Erro ao registrar rastreador', err)
    }

    // Lista estática das moedas (conforme HTML original)
    moedas.value = [
        {
            ano: 1942,
            sigla: 'Cr$',
            nome: 'Cruzeiro',
            imagem: '/images/moeda1942.jpg',
            descricao: `De 01/11/1942 a 12/02/1967 <br>
      Um Cruzeiro equivalia a mil réis, ou seja, <br> 1.000,00 réis = Cr$ 1,00`,
        },
        {
            ano: 1967,
            sigla: 'NCr$',
            nome: 'Cruzeiro Novo',
            imagem: '/images/moeda1967.jpg',
            descricao: `De 13/02/1967 a 14/05/1970 <br>
      Um Cruzeiro Novo equivalia a mil Cruzeiros, ou seja,<br> Cr$ 1.000,00 = NCr$ 1,00`,
        },
        {
            ano: 1970,
            sigla: 'Cr$',
            nome: 'Cruzeiro',
            imagem: '/images/moeda1970.jpg',
            descricao: `De 15/05/1970 a 27/02/1986 <br>
      Um Cruzeiro (após a extinção da expressão "novo")<br> equivale a um cruzeiro novo, ou seja,<br> NCr$ 1,00 = Cr$ 1,00`,
        },
        {
            ano: 1986,
            sigla: 'CZ$',
            nome: 'Cruzado',
            imagem: '/images/moeda1986.jpg',
            descricao: `De 28/02/1986 a 15/01/1989 <br>
      Um Cruzado equivalia a mil cruzeiros, ou seja,<br> Cr$ 1.000,00 = CZ$ 1,00`,
        },
        {
            ano: 1989,
            sigla: 'NCZ$',
            nome: 'Cruzado Novo',
            imagem: '/images/moeda1989.jpg',
            descricao: `De 16/01/1989 a 15/03/1990 <br>
      Um Cruzado Novo equivale a mil cruzados, ou seja,<br> CZ$ 1.000,00 = NCZ$ 1,00`,
        },
        {
            ano: 1990,
            sigla: 'Cr$',
            nome: 'Cruzeiro',
            imagem: '/images/moeda1990.jpg',
            descricao: `De 16/03/1990 a 31/07/1993<br> Cruzeiro equivalia a um Cruzado Novo, ou seja, <br> NCZ$ 1,00 = Cr$ 1,00`,
        },
        {
            ano: 1993,
            sigla: 'Cr$',
            nome: 'Cruzeiro Real',
            imagem: '/images/moeda1993.jpg',
            descricao: `De 01/08/1993 a 30/06/1994<br> Um Cruzeiro Real equivalia a mil Cruzeiros, ou seja, <br> CR$ 1.000.00 = CR$ 1,00`,
        },
        {
            ano: 1994,
            sigla: 'R$',
            nome: 'Real',
            imagem: '/images/moeda1994.jpg',
            descricao: `De 01/07/1994 até os dias atuais<br> Um Real equivale a dois mil e setecentos e <br> cinquenta cruzeiros reais, ou seja:<br> CR$ 2.750.00 = R$ 1,00`,
        },
    ]
})
</script>

<template>
    <div>
        <!-- Page content-->
        <section id="content" style="background-color: #f6f9fc;">
            <section class="bg-secondary py-5">
                <div class="container pt-5 pb-lg-1 pb-xl-2 py-xxl-5">
                    <h1 class="h2 mb-2">Histórico das moedas brasileiras desde 1942</h1>
                </div>
                <div style="height: 200px;"></div>
            </section>

            <!-- Tabela / Cards -->
            <section class="container white-mode" style="margin-top: -260px;">
                <div class="row row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-3 row-cols-xl-3 g-4 pb-2 pb-sm-4 pb-lg-5">
                    <div v-for="(moeda, index) in moedas" :key="index" class="col">
                        <div class="card border-0">
                            <div class="card-body pb-0">
                                <div class="h5">
                                    <img :alt="moeda.nome" :src="moeda.imagem" width="100%">
                                    <h5 class="ms-2">{{ moeda.ano }} - {{ moeda.sigla }} - {{ moeda.nome }}</h5>
                                </div>
                            </div>
                            <p class="list-group list-group-flush mb-4 mx-5" v-html="moeda.descricao"></p>
                        </div>
                    </div>
                </div>
            </section>
        </section>
    </div>
</template>


