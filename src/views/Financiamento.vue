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
                            <div class="d-flex align-items-center mt-sm-n1 mb-0 mb-lg-1 ">
                                <h2 class="h4 mb-0">Tabela de financiamento</h2>
                            </div>
                            <br>

                            <div style="display: flex; justify-content: center;">

                                <table class="tab1">
                                    <tr>
                                        <td>Nome do cálculo:</td>
                                        <td>
                                            <input class="form-control" type="text" id="" name="nomecalc"
                                                v-model="nomecalc">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Valor Financiado:</td>
                                        <td>
                                            <input class="form-control" type="text" id="" name="valor" v-model="valor"
                                                @input="formatacaoMoeda">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Juros (taxa efetiva em %):</td>
                                        <td>

                                            <table class="tab2">
                                                <tr>
                                                    <td style="width:86.5%;">
                                                        <input class="form-control" type="text" id="" name="juros"
                                                            v-model="juros" @input="formatacaoMoeda">
                                                    </td>
                                                    <td style="width:100%;">
                                                        <select class="form-control" id="" name="juros_periodo"
                                                            v-model="juros_periodo">
                                                            <option value="m">ao mês</option>
                                                            <option value="a">ao ano</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            </table>

                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Número de parcelas:</td>
                                        <td>
                                            <input class="form-control" type="text" id="" name="parcelas" v-model="parcelas"
                                                @input="formatacaoSomenteNum">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Data do início do contrato:</td>
                                        <td>
                                            <input class="form-control" type="text" id="" name="dia" v-model="dia"
                                                @input="formatacaoData" maxlength="10">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Início do pagamento ou carência:</td>
                                        <td>
                                            <select class="form-control" id="" name="carencia" v-model="carencia">
                                                <option value="1">1a. parcela à vista</option>
                                                <option value="1">1a. parcela no próximo mês</option>
                                                <option value="{{num+1}}" v-for="num in 94" :key="num">{{ num + 1 }} meses
                                                    de
                                                    carência</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Metodologia de cálculo:</td>
                                        <td>
                                            <input type="radio" value="PRICE" id="metodologia1" name="sistema"
                                                v-model="sistema"><label for="metodologia1">&nbsp;Tabela Price: Sistema de
                                                Amortização Francês</label><br>
                                            <input type="radio" value="SAC" id="metodologia2" name="sistema"
                                                v-model="sistema"><label for="metodologia2">&nbsp;Tabela SAC: Sistema de
                                                Amortização Constante</label><br>
                                            <input type="radio" value="SACRE" id="metodologia3" name="sistema"
                                                v-model="sistema"><label for="metodologia3">&nbsp;Tabela SACRE: Sistema de
                                                Amortização Crescente</label>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><input type="checkbox" name="correcao_monetaria" id="correcao_monetaria"
                                                value="s" v-model="correcao_monetaria"><label
                                                for="correcao_monetaria">&nbsp;Correção Monetária:</label></td>
                                        <td>
                                            Índice para atualização:
                                            <select class="form-control" id="" name="indexador" v-model="indexador">
                                                <option value='29'>CDI</option>
                                                <option value='9'>CUB (Sinduscon)</option>
                                                <option value='83'>CUB Nacional (CBIC)</option>
                                                <option value='68'>CUB-SC (Sinduscon)</option>
                                                <option value='2'>ICV (Dieese)</option>
                                                <option value='3'>IGP-DI (FGV)</option>
                                                <option value='16'>IGP-M (FGV)</option>
                                                <option value='28'>INCC-DI (FGV)</option>
                                                <option value='18'>INPC (IBGE)</option>
                                                <option value='43'>IPA-DI (FGV)</option>
                                                <option value='44'>IPA-M (FGV)</option>
                                                <option value='5'>IPC (Fipe)</option>
                                                <option value='42'>IPC (IBGE)</option>
                                                <option value='4'>IPC-DI (FGV)</option>
                                                <option value='41'>IPC-r</option>
                                                <option value='17'>IPCA (IBGE)</option>
                                                <option value='45'>IPCA-E (IBGE)</option>
                                                <option value='80'>Média do INPC (IBGE) e IGP-DI (FGV)</option>
                                                <option value='6'>Poupança</option><option value='87'>Poupança nova (a partir de 04/05/2012)</option>
                                                <option value='24'>Selic (cálculo capitalizada mensalmente)</option><option value='25'>TBF</option>
                                                <option value='27'>TJLP (BACEN)</option><option value='64'>TJLP (RECEITA FEDERAL)</option>
                                                <option value='10'>TR (Bacen)</option><option value='-2'>Simular inflação de 0,5% ao mês</option>
                                                <option value='-1'>Simular inflação de 1% ao mês</option>

                                            </select>

                                            <br>
                                            Recalcular a parcela a cada (meses): <br>
                                            <select class="form-control" id="" name="recalcular" v-model="recalcular">
                                                <option value="1">Reajustar apenas saldo devedor sem recalcular parcelas
                                                </option>
                                                <option value="1" v-for="num in 120" :key="num">{{ num }}</option>
                                            </select>
                                            <br>

                                            Sobre a ordem de cálculo da correção monetária:<br>
                                            <input type="radio" value="anterior" id="correcao_moneraria1" name="modo_saldo"
                                                v-model="modo_saldo"><label for="correcao_moneraria1">&nbsp;Primeiro abater
                                                a amortização e depois atualizar monetariamente o saldo devedor</label><br>
                                            <input type="radio" value="mesmo" id="correcao_moneraria2" name="modo_saldo"
                                                v-model="modo_saldo"><label for="correcao_moneraria2">&nbsp;Corrigir o saldo
                                                devedor primeiro e depois abater amortização</label><br>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><input type="checkbox" name="iof" id="iof" v-model="iof" value="s"><label
                                                for="iof">&nbsp;IOF:</label></td>
                                        <td>
                                            Percentual do IOF: <br>


                                            <table class="tab2">
                                                <tr>
                                                    <td style="width:86.5%;">
                                                        <input class="form-control" type="text" id="" name="iof_perc"
                                                            v-model="iof_perc" @input="formatacaoMoeda">
                                                    </td>
                                                    <td style="width:100%;">
                                                        <select class="form-control" id="" name="iof_periodo"
                                                            v-model="iof_periodo">
                                                            <option value="m">ao mês</option>
                                                            <option value="a">ao ano</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            </table>

                                            <br>

                                            <input type="checkbox" name="iof_amortizacao" id="iof_amortizacao"
                                                v-model="iof_amortizacao" value="s"><label
                                                for="iof_amortizacao">&nbsp;Calcular sobre amortização</label><br>
                                            <input type="checkbox" name="iof_juros" id="iof_juros" v-model="iof_juros"
                                                value="s"><label for="iof_juros">&nbsp;Calcular sobre juros</label><br>
                                            <input type="checkbox" name="iof_tac" id="iof_tac" v-model="iof_tac"
                                                value="s"><label for="iof_tac">&nbsp;Calcular sobre TACs (quadro
                                                abaixo)</label>

                                        </td>
                                    </tr>
                                    <tr>
                                        <td><input type="checkbox" name="tac" id="tac" v-model="tac" value="s"><label
                                                for="tac">&nbsp;TAC:</label></td>
                                        <td>
                                            <table class="tab2">
                                                <tr>
                                                    <td>Data do vencimento:</td>
                                                    <td>Valor da taxa:</td>
                                                    <td>Descrição da taxa:</td>
                                                </tr>
                                                <tr v-for="num in 5" :key="num">
                                                    <td><input class="form-control" type="text" :id="'tac_dia' + num"
                                                            :name="'tac_dia' + num" :v-model="'tac_dia' + num"
                                                            @input="formatacaoData" maxlength="10"></td>
                                                    <td><input class="form-control" type="text" :id="'tac_valor' + num"
                                                            :name="'tac_valor' + num" :v-model="'tac_valor' + num"
                                                            @input="formatacaoMoeda"></td>
                                                    <td><input class="form-control" type="text" :id="'tac_desc' + num"
                                                            :name="'tac_desc' + num" :v-model="'tac_desc' + num"></td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><input type="checkbox" name="seguro" v-model="seguro" id="seguro"
                                                value="s"><label for="seguro">&nbsp;Seguro:</label></td>
                                        <td>
                                            Digite o percentual mensal que será calculado sobre o saldo devedor (%):
                                            <input class="form-control" type="text" id="" name="seguro_valor"
                                                v-model="seguro_valor">
                                            <br>

                                            <input type="radio" value="antes" id="seguro1" name="modo_seguro"
                                                v-model="modo_seguro"><label for="seguro1">&nbsp;Primeiro amortizar e depois
                                                calcular o seguro</label><br>
                                            <input type="radio" value="depois" id="seguro2" name="modo_seguro"
                                                v-model="modo_seguro"><label for="seguro2">&nbsp;Calcular o seguro e depois
                                                amortizar</label>

                                        </td>
                                    </tr>
                                </table>

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
                <a href="#" class="btn_anterior" title="Lista de Cálculos" @click="$router.push('/lista/cponto')"><i
                        class="material-icons">menu</i></a>
            </td>
            <!-- 
            <td>
                <a href="#" class="btn_anterior" title="Página Anterior" @click="voltaPag()"><i class="material-icons">arrow_back</i></a>
            </td> 
            -->
            <td>
                <a href="#" class="btn_proximo" title="Próxima página"><i class="material-icons"
                        style="vertical-align: middle;" @click="enviaDados()">arrow_forward</i></a>
            </td>
        </tr>
    </table>
</template>

<script>

import { ref, watch } from 'vue';


export default {
    setup() {
        const id_calc = ref('')
        const nomecalc = ref('')
        const valor = ref('')
        const juros = ref('')
        const juros_periodo = ref('')
        const parcelas = ref('')
        const dia = ref('')
        const carencia = ref('')
        const sistema = ref('')
        const correcao_monetaria = ref('')
        const indexador = ref('')
        const recalcular = ref('')
        const modo_saldo = ref('')
        const iof = ref('')
        const iof_perc = ref('')
        const iof_periodo = ref('')
        const iof_amortizacao = ref('')
        const iof_juros = ref('')
        const iof_tac = ref('')
        const tac = ref('')
        const tac_dia1 = ref('')
        const tac_valor1 = ref('')
        const tac_desc1 = ref('')
        const seguro = ref('')
        const seguro_valor = ref('')
        const modo_seguro = ref('')

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

        const enviaDados = async () => {
            const respostaExec1 = await axios.post(
                `${import.meta.env.VITE_SERVER_ATUA_API_URL}/emprestimo/tabelaFinanciamento/${id_calc}`,
                {
                    id_calc: id_calc.value,
                    nomecalc: nomecalc.value,
                    valor: valor.value,
                    juros: juros.value,
                    juros_periodo: juros_periodo.value,
                    parcelas: parcelas.value,
                    dia: dia.value,
                    carencia: carencia.value,
                    sistema: sistema.value,
                    correcao_monetaria: correcao_monetaria.value,
                    indexador: indexador.value,
                    recalcular: recalcular.value,
                    modo_saldo: modo_saldo.value,
                    iof: iof.value,
                    iof_perc: iof_perc.value,
                    iof_periodo: iof_periodo.value,
                    iof_amortizacao: iof_amortizacao.value,
                    iof_juros: iof_juros.value,
                    iof_tac: iof_tac.value,
                    tac: tac.value,

                    tac_dia1: tac_dia1.value,
                    tac_valor1: tac_valor1.value,
                    tac_desc1: tac_desc1.value,

                    seguro: seguro.value,
                    seguro_valor: seguro_valor.value,
                    modo_seguro: modo_seguro.value,
                },
                { withCredentials: true }
            )
        }

        // watch(valor, (newVal) => {
        //     let result = newVal.replace(/\D/g, '') // remover todas as letras e caracteres especiais
        //         .replace(/(\d)(\d{2})$/, '$1,$2') // colocar um ponto antes dos últimos 2 dígitos
        //     valor.value = result;
        // });

        return {
            enviaDados,
            formatacaoData,
            formatacaoSomenteNum,
            formatacaoMoeda,

            id_calc,
            nomecalc,
            valor,
            juros,
            juros_periodo,
            parcelas,
            dia,
            carencia,
            sistema,
            correcao_monetaria,
            indexador,
            recalcular,
            modo_saldo,
            iof,
            iof_perc,
            iof_periodo,
            iof_amortizacao,
            iof_juros,
            iof_tac,
            tac,
            tac_dia1,
            tac_valor1,
            tac_desc1,
            seguro,
            seguro_valor,
            modo_seguro,
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
    border: 0px solid #eaeaea;
    padding: 2px;
    border-width: 0px;
}</style>

