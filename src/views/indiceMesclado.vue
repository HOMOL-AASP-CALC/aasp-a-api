<template>
    <section id="content" class="bg-secondary">
        <div class="container py-5 mt-4 mt-lg-5 mb-lg-4 my-xl-5">
            <div class="row pt-sm-2 pt-lg-0">

                <div class="col-lg-12 pt-4 pb-2 pb-sm-4">
                    <section class="card border-0 py-1 p-md-2 p-xl-3 p-xxl-4">
                        <div class="card-body" style="padding-bottom: 15px;">
                            <div class="d-flex align-items-center mt-sm-n1 mb-0 mb-lg-1 ">
                                <h2 class="h4 mb-0">Criar índice mesclado</h2>
                            </div>
                            <br>
                            <div style="display: flex; justify-content: center;">
                                <table class="tab1" style="width: 70%;">
                                    <tr>
                                        <td>Nome:</td>
                                        <td>
                                            <input class="form-control" type="text" id="" name="nome" v-model="nome">
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>Data inicial</td>
                                        <td>Índice</td>
                                    </tr>


                                    <!-- 1 -->
                                    <tr>
                                        <td>
                                        </td>
                                        <td>
                                            <select class="form-control" id="indice1" name="indice1" v-model="indice1">
                                                <option :value="data.tabela" v-for="data in arrIndices" :key="data.indice">{{ data.nome }}</option>
                                            </select>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>
                                            <select class="form-control" id="" name="dia2" v-model="dia2">
                                                <option v-for="data in datesList" :key="data.valor" :value="data.valor">{{ data.data }}</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select class="form-control" id="indice2" name="indice2" v-model="indice2">
                                                <option :value="data.tabela" v-for="data in arrIndices" :key="data.indice">{{ data.nome }}</option>
                                            </select>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>
                                            <select class="form-control" id="" name="dia3" v-model="dia3">
                                                <option v-for="data in datesList" :key="data.valor" :value="data.valor">{{ data.data }}</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select class="form-control" id="indice3" name="indice3" v-model="indice3">
                                                <option :value="data.tabela" v-for="data in arrIndices" :key="data.indice">{{ data.nome }}</option>
                                            </select>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>
                                            <select class="form-control" id="" name="dia4" v-model="dia4">
                                                <option v-for="data in datesList" :key="data.valor" :value="data.valor">{{ data.data }}</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select class="form-control" id="indice4" name="indice4" v-model="indice4">
                                                <option :value="data.tabela" v-for="data in arrIndices" :key="data.indice">{{ data.nome }}</option>
                                            </select>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td>
                                            <select class="form-control" id="" name="dia5" v-model="dia5">
                                                <option v-for="data in datesList" :key="data.valor" :value="data.valor">{{ data.data }}</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select class="form-control" id="indice5" name="indice5" v-model="indice5">
                                                <option :value="data.tabela" v-for="data in arrIndices" :key="data.indice">{{ data.nome }}</option>
                                            </select>
                                        </td>
                                    </tr>

                                </table>

                            </div>

                            <br>
                            <div style="text-align: center;">
                                <button id="btn_avancar" class="btn btn-primary ms-sm-3" @click="enviaDados()"> Salvar
                                    índice </button>
                            </div>

                        </div>
                    </section>

                </div>
            </div>
        </div>
    </section>



    <table class="flutuar">
        <tr>
            <td>
                <a href="#" class="btn_anterior" title="Lista de Cálculos" @click="$router.push('/lista/indices')"><i
                        class="material-icons">menu</i></a>
            </td>
            <!-- 
            <td>
                <a href="#" class="btn_anterior" title="Página Anterior" @click="voltaPag()"><i class="material-icons">arrow_back</i></a>
            </td> 
            -->
            <!-- <td>
                <a href="#" class="btn_proximo" title="Próxima página"><i class="material-icons"
                        style="vertical-align: middle;" @click="enviaDados()">arrow_forward</i></a>
            </td> -->
        </tr>
    </table>
</template>

<script>

import { ref, onMounted , reactive} from 'vue';
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'


export default {
    setup() {
        const route = useRoute()
        const router = useRouter()

        const idIndice = ref('')
        const nome = ref('')

        const indice1 = ref('--')
        const indice2= ref('--')
        const indice3 = ref('--')
        const indice4 = ref('--')
        const indice5 = ref('--')
        const dia2 = ref('19640101')
        const dia3 = ref('19640101')
        const dia4 = ref('19640101')
        const dia5 = ref('19640101')

        const arrIndices = ref({})

        const datesList = ref([]);
        
        const generateDates = () => {
            const startYear = 1964;
            const currentYear = new Date().getFullYear();

            for (let year = startYear; year <= currentYear; year++) {
                for (let month = 1; month <= 12; month++) {
                    const formattedMonth = String(month).padStart(2, '0');
                    const dateStr = `${formattedMonth}/${year}`;
                    const valueStr = `${year}${formattedMonth}01`;
                    datesList.value.push({ data: dateStr, valor: valueStr });
                }
            }
        };

        if (route.params.id){
            idIndice.value = route.params.id;
            console.log('idIndice.value');
            console.log(idIndice.value);

        }
        

        //-------------------------------------------------------------------------------------------------------------------

        const enviaDados = async () => {

            const respostaExec1 = await axios.post(
                `${import.meta.env.VITE_API_URL}/menu/indic_mesclado_add_edit`,
                {
                    idIndice: idIndice.value,
                    nome:nome.value,
                    indice1:indice1.value,
                    indice2:indice2.value,
                    indice3:indice3.value,
                    indice4:indice4.value,
                    indice5:indice5.value,
                    dia2:dia2.value,
                    dia3:dia3.value,
                    dia4:dia4.value,
                    dia5:dia5.value,
                },
                { withCredentials: true }
            )

            const routePath = '/lista/indices'
            const resolvedPath = router.resolve(routePath).href
            router.push(resolvedPath)

        }

        //-------------------------------------------------------------------------------------------------------------------

        const pega_dados = async () => {
            // console.log('pega_dados')

            try {
                const respostaExec1 = await axios.post(`${import.meta.env.VITE_API_URL}/menu/indic_mesclado_consulta`, { 
                    idIndice: idIndice.value,
                }, { withCredentials: true })

                
                if(respostaExec1.data){
                    nome.value = respostaExec1.data.nome
                    indice1.value = respostaExec1.data.indice1
                    indice2.value = respostaExec1.data.indice2
                    indice3.value = respostaExec1.data.indice3
                    indice4.value = respostaExec1.data.indice4
                    indice5.value = respostaExec1.data.indice5
                    dia2.value = respostaExec1.data.dia2
                    dia3.value = respostaExec1.data.dia3
                    dia4.value = respostaExec1.data.dia4
                    dia5.value = respostaExec1.data.dia5
                }


            } catch (error) {
                console.error('error:', error);
            }
        }

        //-------------------------------------------------------------------------------------------------------------------

        onMounted(async () => {
            if (idIndice.value) await pega_dados();

            generateDates()
            
            console.log('datesList.value')
            console.log(datesList.value)

            const response1 =  await axios.get(`${import.meta.env.VITE_API_URL}/menu/indic_mesclado_indices`)
            
            arrIndices.value = response1.data
            arrIndices.value.unshift({tabela: '--',nome: '--'});


            console.log('arrIndices');
            console.log(arrIndices.value);

        });

        return {
            enviaDados,
            arrIndices,
            datesList,
            nome,
            indice1,
            indice2,
            indice3,
            indice4,
            indice5,
            dia2,
            dia3,
            dia4,
            dia5,
        }

    }
}


</script>

<style scoped>
.tab1 {
    border-width: 4px;
}

.tab1 tr td {
    border: 1px solid #eaeaea;
    padding: 8px;
}

.form-control {
    appearance: auto;
    height: 32px;
    padding: 0px;
}
</style>
