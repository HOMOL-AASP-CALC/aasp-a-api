<template>
    <div class="container py-5 mt-4 mt-lg-5 mb-lg-4 my-xl-5">
        <div class="row pt-sm-2 pt-lg-0">
            <!-- Sidebar (offcanvas on sreens < 992px)-->
            <menu-lateral></menu-lateral>

            <!-- Page content-->
            <div class="col-lg-9 pt-4 pb-2 pb-sm-4">
                <h1 class="h2 mb-4">Geral</h1>
                <!-- Basic info-->
                <section class="card border-0 py-1 p-md-2 p-xl-3 p-xxl-4 mb-4">
                    <div class="card-body">
                        <div class="d-flex align-items-center mt-sm-n1 pb-4 mb-0 mb-lg-1 mb-xl-3">
                            <i class="ai-user text-primary lead pe-1 me-2"></i>
                            <h2 class="h4 mb-0">Informações básicas</h2>
                            <RouterLink class="btn btn-sm btn-secondary ms-auto"
                                        to='/menu/editar-perfil'>
                                <i class="ai-edit ms-n1 me-2"></i>Editar
                            </RouterLink>
                        </div>
                        <div class="d-md-flex align-items-center">
                            <div class="d-sm-flex align-items-center">
                                <div
                                    class="rounded-circle bg-position-center flex-shrink-0 border border-secondary"
                                    style="width: 80px; height: 80px; background-size: cover;"
                                    :style="{ backgroundImage: `url(${imgPerfil})` }"
                                ></div>
                                <div class="pt-3 pt-sm-0 ps-sm-3">
                                    <h3 class="h5 mb-2">
                                        {{ data.nome }}
                                        <i class="ai-circle-check-filled fs-base text-success ms-2"></i>
                                    </h3>
                                    <div class="text-muted fw-medium d-flex flex-wrap flex-sm-nowrap align-iteems-center">
                                        <div class="d-flex align-items-center me-3">
                                            <i class="ai-user me-1"></i>
                                            Login: {{ data.login }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row py-4 mb-2 mb-sm-3">
                            <div class="col-md-6 mb-4 mb-md-0">
                                <table class="table mb-0">
                                    <tbody>
                                        <tr>
                                            <td class="border-0 text-muted py-1 px-0">
                                                <i class="ai-phone me-1"></i>
                                                Telefone
                                            </td>
                                            <td class="border-0 text-dark fw-medium py-1 ps-3">
                                                {{ data.telefone }}
                                            </td>
                                        </tr>
                                        <tr v-if='data.email != data.login'>
                                            <td class="border-0 text-muted py-1 px-0">
                                                <i class="ai-mail me-1"></i>
                                                Email de cadastro
                                            </td>
                                            <td class="border-0 text-dark fw-medium py-1 ps-3">
                                                {{ data.email }}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="border-0 text-muted py-1 px-0">
                                                <i class="ai-mail-filled me-1"></i>
                                                Email de cobrança
                                            </td>
                                            <td class="border-0 text-dark fw-medium py-1 ps-3">
                                                {{ data.email_cobranca }}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>
                <div id="cartao_perfil" class="row row-cols-1 row-cols-md-2 g-4 mb-4">
                    <!-- Address-->
                    <section class="col">
                        <div class="card h-100 border-0 py-1 p-md-2 p-xl-3 p-xxl-4">
                            <div class="card-body">
                                <div class="d-flex align-items-center mt-sm-n1 pb-4 mb-1 mb-lg-2">
                                    <i class="ai-map-pin text-primary lead pe-1 me-2"></i>
                                    <h2 class="h4 mb-0">Endereços</h2>
                                    <RouterLink v-if='data.endereco?.length > 0' class="btn btn-sm btn-secondary ms-auto"
                                                to='/menu/editar-perfil'>
                                        <i class="ai-edit ms-n1 me-2"></i>
                                        Editar
                                    </RouterLink>
                                </div>
                                <div class="ps-3 fs-sm">
                                    <p v-if='data.endereco?.length > 0' class="mb-0">
                                        {{ data.endereco }} {{ data.no }},<br>
                                        {{ data.cidade }} - {{ data.estado }}
                                    </p>
                                    <div v-else class="card h-100 justify-content-center align-items-center border-dashed rounded-3 py-5 px-3 px-sm-4">
                                        <RouterLink class="stretched-link d-flex align-items-center fw-semibold text-decoration-none"
                                                    to='/menu/editar-perfil'>
                                            <i class="ai-circle-plus fs-xl me-2"></i>
                                            Adicionar endereço
                                        </RouterLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <!-- Add payment method-->
                    <section class="col">
                        <div class="card h-100 border-0 py-1 p-md-2 p-xl-3 p-xxl-4">
                            <div class="card-body">
                                <div class="d-flex align-items-center mt-sm-n1 pb-4 mb-1 mb-lg-2">
                                    <i class="ai-wallet text-primary lead pe-1 me-2"></i>
                                    <h2 class="h4 mb-0">Cartão</h2>

                                    <a v-if="data.nomegcartao"
                                        class="btn btn-sm btn-secondary ms-auto"
                                        href="#addCard"
                                        data-bs-toggle="modal">
                                        <i class="ai-edit ms-n1 me-2"></i>
                                        Trocar Cartão
                                    </a>
                                </div>
                                <div v-if="!data.nomegcartao" class="d-flex align-items-center pb-4 mb-2 mb-sm-3">
                                    <img alt='outros' width="52px" src="/outros.png" />
                                    <div class="ps-3 fs-sm">
                                        <div class="card h-100 justify-content-center align-items-center border-dashed rounded-3 py-5 px-3 px-sm-4">
                                            <a
                                                class="stretched-link d-flex align-items-center fw-semibold text-decoration-none"
                                                href="#addCard"
                                                data-bs-toggle="modal"
                                            >
                                                <i class="ai-circle-plus fs-xl me-2"></i>
                                                Adicionar novo cartão
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div v-else class="d-flex align-items-center pb-4 mb-2 mb-sm-3">
                                    <img
                                        :src="`/bandeiras/${bandeiraCartao}.png`"
                                        alt="bandeiras"
                                        width="52"
                                    />

                                    <div class="ps-3 fs-sm">
                                        <div class="text-dark"></div>
                                        <div class="text-muted">
                                            {{ data.admcartao }} **** **** ****
                                            {{ data.numCartaoCortado }}
                                        </div>
                                        <div class="text-muted">
                                            Cred - Validade
                                            {{ data.valcartaoMes }}/{{ data.valcartaoAno }}
                                        </div>
                                    </div>

                                    <span class="text-danger ms-auto" data-bs-toggle="modal" data-bs-target="#modalExcluiCartao" style="cursor:pointer">
                                        Deletar
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <section class="card border-0 py-1 p-md-2 p-xl-3 p-xxl-4">
                    <div class="card-body">
                        <div class="d-flex align-items-center mt-sm-n1 pb-4 mb-0 mb-lg-1">
                            <!-- <i class="ai-cart text-primary lead pe-1 me-2"></i> -->
                            <h2 class="h4 mb-0">Outras opções</h2>
                        </div>

                        <RouterLink class="btn btn-sm btn-outline-danger ms-auto"
                                    to='/deleta-conta'>Deletar conta
                        </RouterLink>
                    </div>
                </section>

            </div>
        </div>
    </div>

    <!-- Default modal -->
    <div class="modal fade" id="modalExcluiCartao" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-sm" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">Excluir cartão</h4>
                    <button ref='modalExcluirClose' class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>A exclusão do carão impedira a renovação automatica que mantem o preço atual da assinatura.</p>
                    <p>Tem certeza que deseja excluir o cartão?</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Cancelar</button>
                    <button class="btn btn-outline-danger" type="button" @click="deleta_cartao()">Excluir</button>
                </div>
            </div>
        </div>
    </div>

    <div
        class="modal fade"
        id="addCard"
        data-bs-backdrop="static"
        tabindex="-1"
        role="dialog"
    >
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header border-0">
                    <h4 class="modal-title">Adicionar novo cartão</h4>
                    <button
                        class="btn-close"
                        type="button"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                        ref="modalClose"
                    ></button>
                </div>

                <div class="modal-body needs-validation pt-0">
                    <div class="mb-4">
                        <label class="form-label" for="nomeg"
                            >Nome impresso no cartão</label
                        >
                        <input
                            name="nomeg"
                            id="nomeg"
                            maxlength="30"
                            class="form-control"
                            :class="{ borda_erro2: erroNome }"
                            type="text"
                            placeholder="Nome impresso no cartão"
                            v-model="nomeCartaoCredito"
                            @input="formatacaoNome"
                        />
                    </div>
                    <div class="mb-4">
                        <label class="form-label" for="cartao">
                            Número do cartão
                        </label>
                        <div class="input-group" :class="{ borda_erro: erroCartao }">
                            <input
                                name="cartao"
                                id="cartao"
                                maxlength="20"
                                class="form-control"
                                :class="{ form_erro: erroCartao }"
                                type="text"
                                placeholder="XXXX XXXX XXXX XXXX"
                                v-model="numeroCartaoCredito"
                                @input="formatacaoCartaoCredito"
                            />
                            <div class="input-group-text py-0">
                                <div class="credit-card-icon" :style="styleFormCartao"></div>
                            </div>
                        </div>
                    </div>
                    <div class="row row-cols-2 g-4 pb-2 pb-sm-3 mb-4">
                        <div class="col">
                            <label class="form-label" for="vencimento">
                                Data de validade
                            </label>
                            <input
                                id="vencimento"
                                name="vencimento_cartao"
                                class="form-control"
                                :class="{ borda_erro2: erroVencimento }"
                                @input="formatacaoVencimento"
                                type="text"
                                placeholder="MM/AA"
                                v-model="vencimentoCartaoCredito"
                                maxlength="5"
                            />
                        </div>
                        <div class="col">
                            <label class="form-label" for="seguranca"
                                >Código de segurança (CVV)</label
                            >
                            <input
                                name="seguranca"
                                id="seguranca"
                                maxlength="4"
                                class="form-control"
                                :class="{ borda_erro2: erroCod }"
                                @input="formatacaoCod"
                                type="text"
                                v-model="codCartaoCredito"
                                placeholder="XXX"
                                required
                            />
                            <!-- --ar-danger -->
                        </div>
                    </div>
                    <input type="hidden" name="m_cartao" id="m_cartao" />
                    <input type="hidden" name="y_cartao" id="y_cartao" />
                    <div class="d-flex flex-column flex-sm-row">
                        <button
                            class="btn btn-secondary mb-3 mb-sm-0"
                            type="reset"
                            data-bs-dismiss="modal"
                        >
                            Cancel
                        </button>
                        <button
                            id="btn_avancar"
                            class="btn btn-primary ms-sm-3"
                            @click.prevent="enviaDadosCartao"
                        >
                            Salvar novo cartão
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import MenuLateral from '@/components/MenuLateral.vue'

function descobrirBandeira(cardNumber) {
    // Remove any spaces or dashes from the card number
    if(cardNumber) {
        cardNumber = cardNumber.replace(/[\s-]/g, '')
    }

    // Check for common card number prefixes
    if (/^4\d{12}(\d{3})?$/.test(cardNumber)) {
        return 'visa'
    } else if (/^2306/.test(cardNumber) || /^5[1-5]\d{14}$/.test(cardNumber)) {
        return 'mastercard'
    } else if (/^3[47]\d{13}$/.test(cardNumber)) {
        return 'amex'
    } else if (
        /^4011(78|79)|^43(1274|8935)|^45(1416|7393|763(1|2))|^504175|^627780|^63(6297|6368|6369)|(65003[5-9]|65004[0-9]|65005[01])|(65040[5-9]|6504[1-3][0-9])|(65048[5-9]|65049[0-9]|6505[0-2][0-9]|65053[0-8])|(65054[1-9]|6505[5-8][0-9]|65059[0-8])|(65070[0-9]|65071[0-8])|(65072[0-7])|(65090[1-9]|6509[1-6][0-9]|65097[0-8])|(65165[2-9]|6516[67][0-9])|(65500[0-9]|65501[0-9])|(65502[1-9]|6550[34][0-9]|65505[0-8])|^(506699|5067[0-6][0-9]|50677[0-8])|^(509[0-8][0-9]{2}|5099[0-8][0-9]|50999[0-9])|^65003[1-3]|^(65003[5-9]|65004\d|65005[0-1])|^(65040[5-9]|6504[1-3]\d)|^(65048[5-9]|65049\d|6505[0-2]\d|65053[0-8])|^(65054[1-9]|6505[5-8]\d|65059[0-8])|^(65070\d|65071[0-8])|^65072[0-7]|^(65090[1-9]|65091\d|650920)|^(65165[2-9]|6516[6-7]\d)|^(65500\d|65501\d)|^(65502[1-9]|6550[3-4]\d|65505[0-8])$/
            .test( cardNumber )
    ){
        return 'elo'
    } else if (/^(?:5[0678]\d\d|6304|6390|67\d\d)\d{8,15}$/.test(cardNumber)) {
        return 'maestro'
    } else {
        return 'outros'
    }
}

export default {
    components: {
        MenuLateral,
    },
    setup() {
        const url = import.meta.env.VITE_DEBIT_URL
        const urlLegacy = import.meta.env.VITE_DEBIT_LEGACY_URL

        const data = ref([])
        const imgPerfil = ref('')
        const nomeCartaoCredito = ref('')
        const numeroCartaoCredito = ref('')
        const vencimentoCartaoCredito = ref('')
        const codCartaoCredito = ref('')
        const erroNome = ref(false)
        const erroCartao = ref(false)
        const erroVencimento = ref(false)
        const erroCod = ref(false)
        const modalClose = ref(null)
        const modalExcluirClose = ref(null)
        const bandeiraCartao = ref('')
        const styleFormCartao = ref('')

        const formatacaoNome = (event) => {
            const formattedValue = event.target.value.replace(/[^a-zA-Z ]/g, '')

            event.target.value = formattedValue
        }
        const formatacaoCartaoCredito = (event) => {
            let formattedValue = event.target.value
                .replace(/\D/g, '')
                .replace(/(\d{4})(?=\d)/g, '$1 ')

            if (formattedValue.length > 19) {
                formattedValue = formattedValue.slice(0, 19)
            }

            numeroCartaoCredito.value = formattedValue

            let resultado_bandeira = descobrirBandeira(
                numeroCartaoCredito.value
            )
            if (
                resultado_bandeira === 'outros' ||
                resultado_bandeira === 'elo' ||
                resultado_bandeira === 'maestro'
            ) {
                styleFormCartao.value = 'background-position: 0 0px; !important'
            }
            if (resultado_bandeira === 'amex')
                styleFormCartao.value =
                    'background-position: 0 -52px; !important'
            if (resultado_bandeira === 'mastercard')
                styleFormCartao.value =
                    'background-position: 0 -156px; !important'
            if (resultado_bandeira === 'visa')
                styleFormCartao.value =
                    'background-position: 0 -182px; !important'
        }
        const formatacaoVencimento = (event) => {
            const formattedValue = event.target.value
                .replace(/\D/g, '') // remove non-numeric characters
                .replace(/(\d{2})(?=\d)/g, '$1/') // add a slash after the first two digits
                .slice(0, 5) // only keep the first 5 characters (month/year)

            event.target.value = formattedValue
        }
        const formatacaoCod = (event) => {
            const formattedValue = event.target.value
                .replace(/\D/g, '') // remove non-numeric characters
                .slice(0, 4) // only keep the first 5 characters (month/year)

            event.target.value = formattedValue
        }

        const pega_dados = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/menu/dados_gerais`,
                    { withCredentials: true }
                )

                data.value = response.data.select1[0]
                response.data.select1[0].numCartaoCortado =
                    response.data.select1[0].nocartao?.toString().substr(12, 4)
                response.data.select1[0].valcartaoMes =
                    response.data.select1[0].valcartao?.toString().substr(0, 2)
                response.data.select1[0].valcartaoAno =
                    response.data.select1[0].valcartao?.toString().substr(2, 2)

                bandeiraCartao.value = descobrirBandeira(
                    response.data.select1[0].nocartao
                )

                imgPerfil.value = urlLegacy+'/menu/logoimg.php?id='+response.data.select4[0]?.logotipo_imp

            } catch (error) {
                console.log(error)
            }
        }

        const deleta_cartao = async () => {
            try {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/menu/deleta_cartao`,
                    {
                        deleta: 1,
                    },
                    { withCredentials: true }
                )
                await pega_dados()

                modalExcluirClose.value.click()
            } catch (error) {
                console.log(error)
            }
            console.log('deleta_cartao')
        }


        const enviaDadosCartao = async () => {
            if (nomeCartaoCredito.value.length > 5) {
                erroNome.value = false
            } else {
                erroNome.value = true
            }

            if (descobrirBandeira(numeroCartaoCredito.value)==='outros' || numeroCartaoCredito.value.length<18) {
                erroCartao.value = true
            } else {
                erroCartao.value = false
            }

            console.log(erroCartao.value)

            let mes = vencimentoCartaoCredito.value.split('/')[0]
            let ano = vencimentoCartaoCredito.value.split('/')[1]
            mes = Number(mes)
            ano = Number(ano)

            let d = new Date()
            let ano_atual = d.getFullYear().toString().substr(2, 2)
            ano_atual = Number(ano_atual)

            let mes_atual = d.getMonth() + 1
            mes_atual = parseInt(mes_atual, 10);

            if((ano === ano_atual && mes < mes_atual) ){
                console.log('ano === ano_atual && mes < mes_atual')
            }
            if((ano === ano_atual ) ){
                console.log('ano === ano_atual ')
            }
            if(( mes < mes_atual) ){
                console.log(' mes < mes_atual')
            }

            if (
                vencimentoCartaoCredito.value === '' ||
                vencimentoCartaoCredito.value.length < 5 ||
                mes > 12 ||
                (ano === ano_atual && mes < mes_atual) ||
                ano < ano_atual
            ) {
                erroVencimento.value = true
            } else {
                erroVencimento.value = false
            }

            if (codCartaoCredito.value.length >= 3) {
                erroCod.value = false
            } else {
                erroCod.value = true
            }

            if (
                erroNome.value == false &&
                erroCartao.value == false &&
                erroVencimento.value == false &&
                erroCod.value == false
            ) {
                modalClose.value.click()

                await axios.post(
                    `${import.meta.env.VITE_API_URL}/menu/edita_perfil`,
                    {
                        nomeCartaoCredito: nomeCartaoCredito.value,
                        numeroCartaoCredito: numeroCartaoCredito.value,
                        vencimentoCartaoCredito: vencimentoCartaoCredito.value,
                        codCartaoCredito: codCartaoCredito.value,
                    },
                    { withCredentials: true }
                )
                await pega_dados()

                nomeCartaoCredito.value = ''
                numeroCartaoCredito.value = ''
                vencimentoCartaoCredito.value = ''
                codCartaoCredito.value  = ''
            }
        }

        onMounted(() => {
            pega_dados()
        })

        return {
            url,
            data,
            imgPerfil,
            nomeCartaoCredito,
            numeroCartaoCredito,
            vencimentoCartaoCredito,
            codCartaoCredito,
            erroNome,
            erroCartao,
            erroVencimento,
            erroCod,
            bandeiraCartao,
            styleFormCartao,
            formatacaoNome,
            formatacaoCartaoCredito,
            formatacaoVencimento,
            formatacaoCod,
            enviaDadosCartao,
            modalClose,
            modalExcluirClose,
            deleta_cartao,
        }
    },
}

</script>

<style scoped>
@import '@/assets/css/debit.css';
@import '@/assets/css/icones.css';

.borda_erro {
    border-color: #ed5050;
}

.borda_erro2 {
    border-color: #ed5050 !important;
    color: red;
}

.form_erro {
    color: red;
}
</style>
