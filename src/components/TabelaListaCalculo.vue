<template>
    <div class="table-responsive mb-3">
        <table class="table table-hover">
            <thead>
            <tr>
                <th></th>
                <th>Protocolo</th>
                <th>Nome</th>
                <th class="data-hora">Data e hora</th>
                <th>Login</th>
                <th>Op&ccedil;&otilde;es</th>
            </tr>
            </thead>
            <tbody>
                <tr v-for="item in calculosOrdenados" :key="item.id">
                    <td><input type="checkbox" v-show="idDono != ''" ></td>
                    <td><a :href="urlTrab+'?id='+item.id">{{ item.id }}</a></td>
                    <td><a :href="urlTrab+'?id='+item.id">{{ item.nome }}</a></td>
                    <td>{{ convertedDate(item.diahora) }}</td>
                    <td>{{ item.login }}</td>
                    <td class="opcoes">
                        <a href='{{linha.ed}}' title='Editar'><i class='ai-file-text' style='font-size: 22px;'></i></a>
                        <a href='{{linha.cp}}' title='Copiar' ng-show='linha.cp'><i class='ai-copy' style='font-size: 22px;'></i></a>
                        <a ng-click='mostra_rename(linha.pos)' title='Renomear'><i class='ai-pen' style='font-size: 22px;'></i></a>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { usePerfilStore } from '@/stores/PerfilStore'
import { useRoute } from 'vue-router'
import axios from 'axios'

export default {
    async setup() {
        // await new Promise(resolve => setTimeout(resolve, 1000))
        const perfil = usePerfilStore()
        let idDono = perfil.idDono
        let programa_del = perfil.permissoes

        const route = useRoute();
        let tipo = route.query.tipo ? route.query.tipo : 'atual'

        let { data: calculos } = await axios.post(
            `${import.meta.env.VITE_API_URL}/lista/calculos`,
            { tipo: 'atual', pagina: '', busca: '' },
            {withCredentials:true}
        ).catch((e)=>{
            console.log(e)
        })

        return {
            "tipo" : tipo,
            calculos,
            "programa_del": programa_del,
            "idDono": idDono,
            urlTrab: 'https://trabalhista.debit.com.br/',
        }
    },
    computed: {
        calculosOrdenados() {
            return this.calculos.sort((a, b) => {
                return a.id < b.id ? 1 : -1
            })
        },
    },
    updated() {
        console.log('updated!')
    },
    methods: {

        convertedDate(date) {
            const year = date.substring(0, 4)
            const month = date.substring(4, 6)
            const day = date.substring(6, 8)
            return `${day}-${month}-${year}`
        },
    },
}
</script>

<style scoped>
    @import "@/assets/css/debit.css";
    @import "@/assets/css/icones.css";
    @import "@/assets/css/css-google-fonts1.css";
    @import "@/assets/css/css-google-fonts2.css";
    tr a{
        text-decoration: none;
        color: #576071;
    }
    .data-hora{
        min-width: 120px;
    }
    .opcoes{
        min-width: 90px;
    }
</style>