<template>
    <section id="content" class="bg-secondary">
        <div class="container py-5 mt-4 mt-lg-5 mb-lg-4 my-xl-5">
            <div class="row pt-sm-2 pt-lg-0">

                <div class="col-lg-12 pt-4 pb-2 pb-sm-4">
                    <section class="card border-0 py-1 p-md-2 p-xl-3 p-xxl-4">
                        <div class="card-body" style="padding-bottom: 15px;">
                            <div class="d-flex align-items-center mt-sm-n1 mb-0 mb-lg-1 ">
                                <h2 class="h4 mb-0">Criar índice personalizado</h2>
                            </div>
                            <br>
                            <div style="display: flex; justify-content: center;">
                                <table class="tab1" style="width: 100%;">
                                    <tr>
                                        <td>Nome do cálculo:</td>
                                        <td>Data inicial:</td>
                                        <td>Casas decimais:</td>
                                        <td>Forma de cálculo:</td>
                                    </tr>
                                    <tr>
                                        <td style="width: 40%;">
                                            <input class="form-control" type="text" id="" name="nome" v-model="nome">
                                        </td>
                                        <td>
                                            <select class="form-control" id="" name="ano_inicio" v-model="ano_inicio">
                                                <option v-for="year in anos" :key="year" :value="year">{{ year }}</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select class="form-control" id="casas" name="casas" v-model="casas">
                                                <option :value="num + 1" v-for="num in 11" :key="num">{{ num + 1 }}</option>
                                            </select>
                                        </td>
                                        <td>
                                            <input type="radio" name="modo_calc" v-model="modo_calc" value="p" id="r1">
                                            <label for="r1">&nbsp;Percentual</label><br>
                                            <input type="radio" name="modo_calc" v-model="modo_calc" value="m" id="r2">
                                            <label for="r2">&nbsp;Moeda / Índice (BTN)</label><br>
                                            <input type="radio" name="modo_calc" v-model="modo_calc" value="mi" id="r3">
                                            <label for="r3">&nbsp;Moeda / Índice invertido (exemplo: Tabela TST)</label>

                                        </td>
                                    </tr>

                                </table>

                            </div>

                            <br>
                            <div style="text-align: center;">
                                <button id="btn_avancar" class="btn btn-primary ms-sm-3" @click="enviaDados()"> Salvar
                                    tabela </button>
                            </div>

                        </div>
                    </section>

                    <br>
                    <section class="card border-0 py-1 p-md-2 p-xl-3 p-xxl-4">
                        <div class="card-body">
                            <div style="display: flex; justify-content: center;">
                                <div>
                                    <table class="tab2">
                                        <tr v-for="(row, index) in tableRows" :key="index">
                                            <td v-for="ano in row" :key="ano">

                                                <table class="tab1">
                                                    <tr>
                                                        <td colspan="2" style=" text-align: center;"><span
                                                                style="font-size: large; font-weight: bold;">{{ ano
                                                                }}</span></td>
                                                    </tr>
                                                    <tr v-for="mes in 12" :key="mes">
                                                        <td>
                                                            <span v-if="mes < 10">0{{ mes }}</span><span v-else>{{ mes
                                                            }}</span>/{{ ano }}
                                                        </td>
                                                        <td><input type="text" :id="indice[ano + '-' + mes]" v-model="indice[ano + '-' + mes]"
                                                            @input="applyMask($event, `${ano}-${mes}`)"
                                                            class="form-control"></td>
                                                            
                                                    </tr>
                                                </table>

                                            </td>
                                        </tr>
                                    </table>
                                </div>
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

import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'


export default {
    setup() {
        const route = useRoute()
        const router = useRouter()


        const id_indice = ref('')
        const nome = ref('');
        const ano_inicio = ref('');
        const casas = ref(2);
        const modo_calc = ref('p');

        const anoAtual = new Date().getFullYear();
        ano_inicio.value = anoAtual - 5;

        const indice = ref({});

        for (let ano = ano_inicio.value; ano <= anoAtual; ano++) {
            for (let mes = 1; mes <= 12; mes++) {
                indice.value[`${ano}-${mes}`] = '';
            }
        }


        if (route.params.id) id_indice.value = route.params.id;
        // console.log('id_indice',id_indice.value)


        const anos = reactive([]);
        for (let year = 1964; year <= anoAtual; year++) {
            anos.push(year);
        }

        const initialNumber = ano_inicio.value;
        const finalNumber = anoAtual;
        const columnCount = 4;
        const tableRows = ref([]);

        const calculateTableRows = () => {
            const rows = [];
            let currentNumber = ano_inicio.value;

            while (currentNumber <= finalNumber) {
                const row = [];

                for (let i = 0; i < columnCount && currentNumber <= finalNumber; i++) {
                    row.push(Math.ceil(currentNumber)); // Arredonda para cima
                    currentNumber++;
                }

                rows.push(row);
            }

            tableRows.value = rows;
        };
        calculateTableRows()

        watch(ano_inicio, calculateTableRows);

        //-------------------------------------------------------------------------------------------------------------------
        const formatacaoData = (event) => {
            let formattedValue = event.target.value
                .replace(/\D/g, '') // remove non-numeric characters
                .replace(/^(\d{2})(\d)/g, '$1/$2') // add a slash after the first two digits
                .replace(/^(\d{2})\/(\d{2})(\d{1,4})/, '$1/$2/$3') // format to dd/mm/aaaa

            event.target.value = formattedValue
        }
        const formatacaoSomenteNum = (event) => {
            let formattedValue = event.target.value
                .replace(/\D/g, '') // remove non-numeric characters
            // .slice(0, 4) 

            event.target.value = formattedValue
        }
        const formatacaoMoeda = (event) => {
            let formattedValue = event.target.value
                .replace(/\D/g, '') // remover todas as letras e caracteres especiais
                .replace(/(\d)(\d{2})$/, '$1,$2')

            event.target.value = formattedValue
        }
        //-------------------------------------------------------------------------------------------------------------------

        const formataNum = (n, c) => {
            const char_centavos = ",";
            const char_milhar = ".";

            n = String(n);

            if (n === "null") return "";

            if (n.indexOf("e") > 0) {
                n = '0';
            }

            let len = n.length;
            let ponto = n.indexOf(".");
            if (ponto > 0) {
                n = n.substr(0, ponto) + char_centavos + n.substr(ponto + 1);
            }

            if (len > 0) {
                if (n[0] === char_centavos) {
                    n = '0' + n;
                    len++;
                    ponto++;
                }
            }

            if (c > 0) {
                if (ponto < 0) {
                    n = n + char_centavos;
                    ponto = len;
                    len++;
                }
                while (((len - 1) - ponto) < c) {
                    n = n + '0';
                    len++;
                }

                if (((len - 1) - ponto) > c) {
                    n = n.substr(0, ponto + c + 1);
                }

                // Pontos de milhar 
                let m = ponto - 3;
                while (m > 0) {
                    if ((m !== 1) || ((m === 1) && (n.substr(0, 1) !== "-"))) {
                        n = n.substr(0, m) + char_milhar + n.substr(m);
                    }
                    m = m - 3;
                }
            } else {
                if (ponto < 0) ponto = n.length;
                let m = ponto - 3;
                while (m > 0) {
                    if ((m !== 1) || ((m === 1) && (n.substr(0, 1) !== "-"))) {
                        n = n.substr(0, m) + char_milhar + n.substr(m);
                    }
                    m = m - 3;
                }
            }

            return n;
        };
        //-------------------------------------------------------------------------------------------------------------------

        //sem o menos
        // const applyMask = (event, espec) => {
        //     let data_limpa = event.target.value;

                
        //     if (data_limpa.slice(-1) === '.') {
        //         // Substituir o ponto por vírgula
        //         // data_limpa = data_limpa.replace('.', ',');
        //         data_limpa += ','
        //     }

        //     // Remover todos os caracteres, exceto números e vírgula
        //     data_limpa = data_limpa.replace(/[^0-9,]/g, '');

        //     // Verificar se já existe uma vírgula no valor
        //     const hasComma = data_limpa.includes(',');

        //     // Adicionar ponto como separador de milhar a cada três dígitos antes da vírgula
        //     if (!hasComma) {
        //         data_limpa = data_limpa.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        //     }

        //     // Remover vírgulas extras se já houver uma
        //     if (hasComma) {
        //         if(data_limpa==',') data_limpa = '0,'

        //         const parts = data_limpa.split(',');
        //         // data_limpa = parts[0] + ',' + parts.slice(1).join('');
                
        //         data_limpa = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + parts[1]
        //     }

        //     // Atualizar o valor no objeto indice
        //     indice.value[espec] = data_limpa;
        // };

        const applyMask = (event, espec) => {
            let data_limpa = event.target.value;

            let isNegative = false; // Adicionando uma flag para verificar se o número é negativo

            // Verificar se o valor começa com um sinal de menos
            if (data_limpa.startsWith('-')) {
                isNegative = true;
                data_limpa = data_limpa.slice(1); // Remover o sinal de menos para facilitar o processamento
            }

            if (data_limpa.slice(-1) === '.') {
                // Substituir o ponto por vírgula
                data_limpa += ',';
            }

            // Remover todos os caracteres, exceto números e vírgula
            data_limpa = data_limpa.replace(/[^0-9,]/g, '');

            // Verificar se já existe uma vírgula no valor
            const hasComma = data_limpa.includes(',');

            // Adicionar ponto como separador de milhar a cada três dígitos antes da vírgula
            if (!hasComma) {
                data_limpa = data_limpa.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            }

            // Remover vírgulas extras se já houver uma
            if (hasComma) {
                if(data_limpa==',') data_limpa = '0,';

                const parts = data_limpa.split(',');
                data_limpa = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + parts[1];
            }

            // Se o valor original começou com um sinal de menos, adicione o sinal de volta
            if (isNegative) {
                data_limpa = '-' + data_limpa;
            }

            // Atualizar o valor no objeto indice
            indice.value[espec] = data_limpa;
        };



        //-------------------------------------------------------------------------------------------------------------------

        const enviaDados = async () => {
            const respostaExec1 = await axios.post(
                `${import.meta.env.VITE_API_URL}/menu/indic_person_add_edit`,
                {
                    id_indice: id_indice.value,

                    nome: nome.value,
                    ano_inicio: ano_inicio.value,
                    casas: casas.value,
                    modo_calc: modo_calc.value,
                    indice: indice.value,

                },
                { withCredentials: true }
            )


            console.log('enviaDados')
            console.log(indice.value)

            const routePath = '/lista/indices'
            const resolvedPath = router.resolve(routePath).href
            router.push(resolvedPath)


        }

        //-------------------------------------------------------------------------------------------------------------------

        const pega_dados = async () => {
            // console.log('pega_dados')

            try {
                const respostaExec1 = await axios.get(`${import.meta.env.VITE_API_URL}/menu/indic_person_consulta/${id_indice.value}`, { withCredentials: true })

                // console.log(respostaExec1.data)

                if (respostaExec1.data == 0) {
                    const routePath = '/lista/indices'
                    const resolvedPath = router.resolve(routePath).href
                    router.push(resolvedPath)
                } else {
                    nome.value = respostaExec1.data.nome
                    ano_inicio.value = respostaExec1.data.datainicial.slice(0, 4);
                    casas.value = respostaExec1.data.numcasas
                    modo_calc.value = respostaExec1.data.modocalc

                    const arr_indice = respostaExec1.data.dados.split('\n');
                    // console.log(arr_indice)

                    for (let chave in arr_indice) {
                        let linha = arr_indice[chave]
                        let dado_linha = linha.split('=')

                        if (dado_linha[0].substring(4, 6) < 10) {
                            // indice.value[`${dado_linha[0].substring(0, 4)}-${dado_linha[0].substring(5, 6)}`] = dado_linha[1];
                            // if(dado_linha[1]) indice.value[`${dado_linha[0].substring(0, 4)}-${dado_linha[0].substring(5, 6)}`] = formataNum(dado_linha[1], 2);
                            if(dado_linha[1]) indice.value[`${dado_linha[0].substring(0, 4)}-${dado_linha[0].substring(5, 6)}`] = formataNum(dado_linha[1], 0);
                            else indice.value[`${dado_linha[0].substring(0, 4)}-${dado_linha[0].substring(5, 6)}`] = dado_linha[1];
                        } else {
                            // indice.value[`${dado_linha[0].substring(0, 4)}-${dado_linha[0].substring(4, 6)}`] = dado_linha[1];
                            if(dado_linha[1]) indice.value[`${dado_linha[0].substring(0, 4)}-${dado_linha[0].substring(4, 6)}`] = formataNum(dado_linha[1], 0);
                            else indice.value[`${dado_linha[0].substring(0, 4)}-${dado_linha[0].substring(4, 6)}`] = dado_linha[1];
                        }
                    }
                }


            } catch (error) {
                console.error('error:', error);
            }
        }

        //-------------------------------------------------------------------------------------------------------------------

        onMounted(async () => {
            if (id_indice.value) await pega_dados();

        });

        return {
            enviaDados,
            formatacaoData,
            formatacaoSomenteNum,
            formatacaoMoeda,

            nome,
            ano_inicio,
            casas,
            modo_calc,

            indice,

            anoAtual,

            tableRows,
            initialNumber,

            anos,

            formataNum,
            applyMask,

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

.tab2 {
    border-width: 0px;
}

.tab2 tr td {
    padding: 10px;
}</style>

