<!-- <template>
    <div>
        <h2>Pai</h2>
        <p>Mês: {{ mes }}</p>
        <p>Ano: {{ ano }}</p>
        <hr />
        <Filho
            v-bind:mes="mes.toString()"
            :ano="ano"
            v-on:update:checkedValues="onCheckedValuesUpdate"
        ></Filho>
    </div>
</template> -->

<template>
    <section id="content" class="bg-secondary">
        <div class="container py-5 mt-4 mt-lg-5 mb-lg-4 my-xl-5">
            <div class="row pt-sm-2 pt-lg-0">
                <!-- Sidebar (offcanvas on sreens < 992px)-->
                <!-- <menu-lateral ></menu-lateral> -->

                <!-- Page content-->
                <div class="col-lg-12 pt-4 pb-2 pb-sm-4">
                    <!-- <h1 class="h2 mb-4">Descanso Semanal Remunerado (DSR)</h1> -->

                    <!-- Orders-->
                    <section class="card border-0 py-1 p-md-2 p-xl-3 p-xxl-4">
                        <div class="card-body">
                            <div
                                class="d-flex align-items-center mt-sm-n1 pb-4 mb-0 mb-lg-1 mb-xl-3"
                            >
                                <!-- <i class="ai-cart text-primary lead pe-1 me-2"></i> -->
                                <h2 class="h4 mb-0">
                                    Descanso Semanal Remunerado (DSR)
                                </h2>
                            </div>

                            <table class="tabela_geral">
                                <tr>
                                    <td>
                                        <table class="tabela_geral">
                                            <tr>
                                                <td colspan="3">
                                                    <span
                                                        ><b
                                                            >Nome da tabela:</b
                                                        ></span
                                                    ><br />
                                                    <input
                                                        type="text"
                                                        v-model="nome"
                                                        class="form-control"
                                                        style="width: 100%"
                                                    />
                                                    <br />
                                                </td>
                                            </tr>

                                            <tr>
                                                <td>
                                                    <Filho
                                                        :mes="1"
                                                        :ano="ano"
                                                        v-on:update:checkedValues="
                                                            onCheckedValuesUpdate
                                                        "
                                                        :pre-selected-days="
                                                            preSelectedDays
                                                        "
                                                    ></Filho>
                                                </td>
                                                <td>
                                                    <Filho
                                                        :mes="2"
                                                        :ano="ano"
                                                        v-on:update:checkedValues="
                                                            onCheckedValuesUpdate
                                                        "
                                                        :pre-selected-days="
                                                            preSelectedDays
                                                        "
                                                    ></Filho>
                                                </td>
                                                <td>
                                                    <Filho
                                                        :mes="3"
                                                        :ano="ano"
                                                        v-on:update:checkedValues="
                                                            onCheckedValuesUpdate
                                                        "
                                                        :pre-selected-days="
                                                            preSelectedDays
                                                        "
                                                    ></Filho>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <Filho
                                                        :mes="4"
                                                        :ano="ano"
                                                        v-on:update:checkedValues="
                                                            onCheckedValuesUpdate
                                                        "
                                                        :pre-selected-days="
                                                            preSelectedDays
                                                        "
                                                    ></Filho>
                                                </td>
                                                <td>
                                                    <Filho
                                                        :mes="5"
                                                        :ano="ano"
                                                        v-on:update:checkedValues="
                                                            onCheckedValuesUpdate
                                                        "
                                                        :pre-selected-days="
                                                            preSelectedDays
                                                        "
                                                    ></Filho>
                                                </td>
                                                <td>
                                                    <Filho
                                                        :mes="6"
                                                        :ano="ano"
                                                        v-on:update:checkedValues="
                                                            onCheckedValuesUpdate
                                                        "
                                                        :pre-selected-days="
                                                            preSelectedDays
                                                        "
                                                    ></Filho>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <Filho
                                                        :mes="7"
                                                        :ano="ano"
                                                        v-on:update:checkedValues="
                                                            onCheckedValuesUpdate
                                                        "
                                                        :pre-selected-days="
                                                            preSelectedDays
                                                        "
                                                    ></Filho>
                                                </td>
                                                <td>
                                                    <Filho
                                                        :mes="8"
                                                        :ano="ano"
                                                        v-on:update:checkedValues="
                                                            onCheckedValuesUpdate
                                                        "
                                                        :pre-selected-days="
                                                            preSelectedDays
                                                        "
                                                    ></Filho>
                                                </td>
                                                <td>
                                                    <Filho
                                                        :mes="9"
                                                        :ano="ano"
                                                        v-on:update:checkedValues="
                                                            onCheckedValuesUpdate
                                                        "
                                                        :pre-selected-days="
                                                            preSelectedDays
                                                        "
                                                    ></Filho>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <Filho
                                                        :mes="10"
                                                        :ano="ano"
                                                        v-on:update:checkedValues="
                                                            onCheckedValuesUpdate
                                                        "
                                                        :pre-selected-days="
                                                            preSelectedDays
                                                        "
                                                    ></Filho>
                                                </td>
                                                <td>
                                                    <Filho
                                                        :mes="11"
                                                        :ano="ano"
                                                        v-on:update:checkedValues="
                                                            onCheckedValuesUpdate
                                                        "
                                                        :pre-selected-days="
                                                            preSelectedDays
                                                        "
                                                    ></Filho>
                                                </td>
                                                <td>
                                                    <Filho
                                                        :mes="12"
                                                        :ano="ano"
                                                        :pre-selected-days="
                                                            preSelectedDays
                                                        "
                                                        v-on:update:checkedValues="
                                                            onCheckedValuesUpdate
                                                        "
                                                    ></Filho>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td style="padding-left: 30px">
                                        <table>
                                            <tr>
                                                <td><b>Feriados móveis:</b></td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <input
                                                        id="movel1"
                                                        type="checkbox"
                                                        v-model="feriados"
                                                        :value="'pascoa'"
                                                    /><label for="movel1"
                                                        >&nbsp;Páscoa</label
                                                    >
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <input
                                                        id="movel2"
                                                        type="checkbox"
                                                        v-model="feriados"
                                                        :value="'sexta_santa'"
                                                    /><label for="movel2"
                                                        >&nbsp;Sexta-feira
                                                        santa</label
                                                    >
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <input
                                                        id="movel3"
                                                        type="checkbox"
                                                        v-model="feriados"
                                                        :value="'corpus_christ'"
                                                    /><label for="movel3"
                                                        >&nbsp;Corpus
                                                        Christ</label
                                                    >
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <input
                                                        id="movel4"
                                                        type="checkbox"
                                                        v-model="feriados"
                                                        :value="'sabado_carnaval'"
                                                    /><label for="movel4"
                                                        >&nbsp;Sábado de
                                                        Carnaval</label
                                                    >
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <input
                                                        id="movel5"
                                                        type="checkbox"
                                                        v-model="feriados"
                                                        :value="'domingo_carnaval'"
                                                    /><label for="movel5"
                                                        >&nbsp;Domingo de
                                                        Carnaval</label
                                                    >
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <input
                                                        id="movel6"
                                                        type="checkbox"
                                                        v-model="feriados"
                                                        :value="'segunda_carnaval'"
                                                    /><label for="movel6"
                                                        >&nbsp;Segunda de
                                                        Carnaval</label
                                                    >
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <input
                                                        id="movel7"
                                                        type="checkbox"
                                                        v-model="feriados"
                                                        :value="'terca_carnaval'"
                                                    /><label for="movel7"
                                                        >&nbsp;Terça de
                                                        Carnaval</label
                                                    >
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <input
                                                        id="movel8"
                                                        type="checkbox"
                                                        v-model="feriados"
                                                        :value="'quarta_carnaval'"
                                                    /><label for="movel8"
                                                        >&nbsp;Quarta de
                                                        Carnaval</label
                                                    >
                                                </td>
                                            </tr>
                                        </table>

                                        <br /><br />
                                        <button
                                            class="btn btn-primary"
                                            type="button"
                                            @click="enviaDados()"
                                        >
                                            Salvar
                                        </button>

                                        <!-- <div id="var10" @click="toggleItem('var10')">aaaaaaaaa</div> -->
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </section>
</template>







<script>
// import { ref, watchEffect } from 'vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { usePerfilStore } from '@/stores/PerfilStore'

import Filho from '@/components/GeraMes.vue'

export default {
    name: 'Pai',
    components: { Filho },
    setup() {
        const ano = ref(new Date().getFullYear());
        const checkedValues = ref([])
        const feriados = ref([])
        const nome = ref('')
        const route = useRoute()
        const router = useRouter()
        const id = ref(route.params.id)
        const preSelectedDays = ref([])
        const perfilStore = ref([])

        perfilStore.value = usePerfilStore()
        perfilStore.value.getPerfil()

        // console.log('id.value = '+id.value)

        // const onCheckedValuesUpdate = id => values => {
        function onCheckedValuesUpdate(values) {
            // const onCheckedValuesUpdate = (id) => (checkedValues) => {
            console.log(values.arr_dias)

            checkedValues.value = values.arr_dias
            // console.log('Received data from child:', checkedValues.value)

            let mes_interecao
            if (mes_interecao < 10) mes_interecao = '0' + values.mes
            else mes_interecao = values.mes

            if(preSelectedDays.value){
                //tira todos os registros do mes interagido
                preSelectedDays.value = preSelectedDays.value.filter(
                    (value) => !value.endsWith(mes_interecao)
                )
                // console.log('preSelectedDays.value:', preSelectedDays.value)
                
                //concatena com o selecionado do mes interagido
                preSelectedDays.value = preSelectedDays.value.concat(
                    Object.values(checkedValues.value)
                )
                
                //ordena como no banco
                preSelectedDays.value.sort((a, b) => {
                    const lastCompare = a.slice(-2) - b.slice(-2)
                    return lastCompare === 0
                    ? a.slice(0, 2) - b.slice(0, 2)
                    : lastCompare
                })
            }else{
                preSelectedDays.value = checkedValues.value
            }

            // console.log('preSelectedDays:', preSelectedDays.value)
        }

        
        const pega_dados = async () => {

            if (id.value > 0) {
                try {
                    console.log('pega_dados')


                    const response = await axios.get(
                        `${import.meta.env.VITE_API_URL}/menu/dsr_view/${
                            id.value
                        }`,
                        { withCredentials: true }
                    )

                    console.log(response.data)

                    if (response.data === '') {
                        const routePath = '/lista/dsr'
                        const resolvedPath = router.resolve(routePath).href
                        router.push(resolvedPath)
                    }

                    nome.value = response.data.nome

                    const todos_feriados = response.data.dados
                    const feriados_moveis = todos_feriados.substring(0, 8)
                    const feriados_fixos = todos_feriados.substring(8)

                    let arr_feriados_fixos = feriados_fixos.match(/.{1,4}/g)
                    preSelectedDays.value = arr_feriados_fixos
                    // console.log('preSelectedDays.value = '+preSelectedDays.value)

                    let arr_feriados_moveis = feriados_moveis.match(/.{1,1}/g)
                    // console.log('arr_feriados_moveis = '+arr_feriados_moveis)

                    if (arr_feriados_moveis[0] == 1)
                        feriados.value.push('pascoa')
                    if (arr_feriados_moveis[1] == 1)
                        feriados.value.push('sexta_santa')
                    if (arr_feriados_moveis[2] == 1)
                        feriados.value.push('corpus_christ')
                    if (arr_feriados_moveis[3] == 1)
                        feriados.value.push('sabado_carnaval')
                    if (arr_feriados_moveis[4] == 1)
                        feriados.value.push('domingo_carnaval')
                    if (arr_feriados_moveis[5] == 1)
                        feriados.value.push('segunda_carnaval')
                    if (arr_feriados_moveis[6] == 1)
                        feriados.value.push('terca_carnaval')
                    if (arr_feriados_moveis[7] == 1)
                        feriados.value.push('quarta_carnaval')

                    // let arr_dias_padrao_calendario = arr_feriados_fixos.map(item => {
                    //     let novoItem = item.slice(2) + item.slice(0,2);
                    //     return novoItem;
                    // });
                    // preSelectedDays.value = arr_dias_padrao_calendario
                    // console.log('preSelectedDays.value = '+preSelectedDays.value)
                } catch (error) {
                    console.log(error)
                }
            }
        }

        const enviaDados = async () => {
            let feriados_moveis_str = ''
            feriados_moveis_str += feriados.value.includes('pascoa') ? '1' : '0'
            feriados_moveis_str += feriados.value.includes('sexta_santa')
                ? '1'
                : '0'
            feriados_moveis_str += feriados.value.includes('corpus_christ')
                ? '1'
                : '0'
            feriados_moveis_str += feriados.value.includes('sabado_carnaval')
                ? '1'
                : '0'
            feriados_moveis_str += feriados.value.includes('domingo_carnaval')
                ? '1'
                : '0'
            feriados_moveis_str += feriados.value.includes('segunda_carnaval')
                ? '1'
                : '0'
            feriados_moveis_str += feriados.value.includes('terca_carnaval')
                ? '1'
                : '0'
            feriados_moveis_str += feriados.value.includes('quarta_carnaval')
                ? '1'
                : '0'
            // console.log('feriados_moveis_str = '+feriados_moveis_str)

            let feriados_fixos_str = ''
            if(preSelectedDays.value) feriados_fixos_str = preSelectedDays.value.join('')
            // console.log('feriados_fixos_str = '+feriados_fixos_str)

            let feriados_str = feriados_moveis_str + feriados_fixos_str
            // console.log('feriados_str = '+feriados_str)

            await axios
                .post(
                    `${import.meta.env.VITE_API_URL}/menu/dsr_add`,
                    {
                        id_dsr: id.value,
                        nome: nome.value,
                        feriados: feriados_str,
                    },
                    { withCredentials: true }
                )
                .then((response) => {
                    // console.log(response.data)
                })
                .catch((error) => {
                    console.log(error)
                })

            // console.log(feriados.value)
            // console.log(`${window.location.origin}${import.meta.env.VITE_DEBIT_URL}/lista/dsr`)

            const routePath = '/lista/dsr'
            const resolvedPath = router.resolve(routePath).href
            router.push(resolvedPath)
        }

        onMounted(() => {
            pega_dados()
        })

        return {
            onCheckedValuesUpdate,
            enviaDados,
            pega_dados,
            ano,
            checkedValues,
            feriados,
            nome,
            preSelectedDays,
            id,
            perfilStore,
        }
    },
}
</script>


