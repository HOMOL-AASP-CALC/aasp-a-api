<template>
    <div class="container py-5 mt-4 mt-lg-5 mb-lg-4 my-xl-5">
        <div class="col-lg-9 pt-4 pb-2 pb-sm-4">
            <h1 class="h2 mb-4">Deletar conta</h1>
        </div>
        <form @submit.prevent="onSubmit">
            <section class="white-mode">
                <div
                    class="card border-0 bg-white position-relative py-lg-4 py-xl-2 mb-4"
                >
                    <div v-if="currentStep === 1">
                        <div class="card-body pb-0">
                            <h2 class="h4 mb-n2">
                                O que acontecerá ao deletar minha conta?
                            </h2>
                        </div>
                        <div class="card-body">
                            <div class="alert d-flex text-danger" role="alert">
                                <i class="ai-circle-slash fs-xl pe-1 me-2"></i>
                                <div>
                                    Você perderá acesso a todos os cálculos
                                    feitos até o momento.
                                </div>
                            </div>
                            <div class="alert d-flex text-danger" role="alert">
                                <i class="ai-circle-slash fs-xl pe-1 me-2"></i>
                                <div>
                                    Todos os outros dados serão excluídos do
                                    nosso banco de dados.
                                </div>
                            </div>
                            <div class="alert d-flex text-danger" role="alert">
                                <i class="ai-circle-slash fs-xl pe-1 me-2"></i>
                                <div>
                                    Você não poderá acessar mais a Debit usando
                                    o seu login.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="currentStep === 2">
                        <div class="card-body pb-0">
                            <h2 class="h4 mb-n2">
                                Por que você está pensando em deletar sua conta?
                            </h2>
                        </div>
                        <div class="card-body">
                            <textarea class="form-control" style="width: 600px;"
                                rows="10"
                                v-model="motivo"
                            ></textarea>
                            <label :class="{msg_erro: erroMotivo}" style="display: none" >Preencha o motivo do cancelamento</label>
                        </div>
                    </div>

                    <div v-if="currentStep === 3">
                        <div class="card-body pb-0">
                            <h2 class="h4 mb-n2">Confirme sua senha</h2>
                        </div>
                        <div class="card-body">
                            <!-- <input
                                type="text"
                                v-model="senha"
                                class="form-control"
                                style="width: 600px"
                            /> -->

                            <div class="password-toggle" style="width: 600px">
                                <input
                                    class="form-control"
                                    id="senha"
                                    v-model="senha"
                                    :type="
                                        checkbox1
                                            ? 'text'
                                            : 'password'
                                    "
                                    @input="
                                        senha =
                                            $event.target.value
                                    "
                                />
                                <label
                                    class="password-toggle-btn"
                                    aria-label="Show/hide password"
                                >
                                    <input
                                        class="password-toggle-check"
                                        type="checkbox"
                                        v-model="checkbox1"
                                    /><span
                                        class="password-toggle-indicator"
                                    ></span>
                                </label>

                            </div>

                            <label :class="{msg_erro: erroSenha}" style="display: none" >{{msgErroSenha}}</label>
                        </div>
                    </div>

                    <div v-if="currentStep === 4">
                        <div
                            v-if="exibirMensagemCancelamento"
                            class="card-body"
                        >
                            <div class="alert alert-danger" role="alert">
                                <h4 class="pt-2 alert-heading">Atenção!</h4>
                                <p>Sua conta foi deletada.</p>
                                <hr class="text-primary opacity-25 mb-3" />
                                <p class="mb-2">
                                    Agradecemos a parceria e esperamos que volte
                                    em breve.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="px-4 py-0 mx-2 my-0" v-if="cancelado === false">
                        <div class="tab-pane fade show active">
                            <button
                                type="button"
                                class="btn btn-outline-secondary mb-2 me-1"
                                @click="nextStep"
                                v-if="currentStep < 3"
                            >
                                Avançar
                            </button>

                            <div class="">
                                <a
                                    :href="url"
                                    v-if="currentStep === 3"
                                    class="btn btn-outline-primary mb-2 me-1"
                                    >Não deletar minha conta</a
                                >
                                <button
                                    type="button"
                                    v-if="currentStep === 3"
                                    @click="cancelar"
                                    class="btn btn-outline-danger mb-2 me-1"
                                >
                                    Deletar minha conta
                                </button>

                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </form>
    </div>
</template>

<script>
import { ref } from 'vue'
import axios from 'axios'

import { usePerfilStore } from '@/stores/PerfilStore'

export default {
    setup() {

        const currentStep = ref(1)
        const cancelado = ref(false)
        const url = ref(import.meta.env.VITE_DEBIT_URL)
        const motivo = ref('')
        const senha = ref('')
        const erroSenha = ref(false)
        const msgErroSenha = ref('')
        const erroMotivo = ref(false)
        const exibirMensagemCancelamento = ref('')
        const checkbox1 = ref(false)
        const perfilStore = ref([]);

        const pega_dados = async () => {
            perfilStore.value = usePerfilStore()
            await perfilStore.value.getPerfil()
        };
        pega_dados();

        const confirma_senha = async () => {
            let ret

            await axios.post(
                `${import.meta.env.VITE_API_URL}/menu/confirma_senha`,
                {
                    senha: senha.value,
                },
                { withCredentials: true }
            )
                .then((response) => {
                    if (response.data == 1) {
                        ret = 1
                    } else {
                        ret = 0
                    }
                })
                .catch((error) => {
                    console.log(error)
                    ret = 0
                })

            // console.log(ret)
            return ret
        }

        const nextStep = async () => {
            if (currentStep.value == 2) {
                if(motivo.value==''){
                    erroMotivo.value = true
                }else{
                    erroMotivo.value = false
                    currentStep.value++
                }
            } else {
                currentStep.value++
            }

        }

        const previousStep = () => {
            currentStep.value--
        }

        const cancelar = async () => {


            console.log('cancelar() call')

            if (senha.value) {
                let result_confirmacao = await confirma_senha()

                if (result_confirmacao) {
                    console.log('result_confirmacao = ' + result_confirmacao)

                    msgErroSenha.value = ''
                    erroSenha.value = false
                    currentStep.value++

                    cancelado.value = true
                    exibirMensagemCancelamento.value = true

                    await axios.post(`${import.meta.env.VITE_API_URL}/menu/deleta_conta`,
                        { motivo: motivo.value, },
                        { withCredentials: true }
                    )
                    window.location.href = `${import.meta.env.VITE_DEBIT_LEGACY_URL}/menu/logout.php`

                } else {
                    msgErroSenha.value = 'Senha incorreta.'
                    erroSenha.value = true
                }
            } else {
                msgErroSenha.value = 'Preencha o campo'
                erroSenha.value = true
            }
        }

        return {
            currentStep,
            cancelado,
            url,
            motivo,
            senha,
            msgErroSenha,
            erroSenha,
            erroMotivo,
            exibirMensagemCancelamento,
            checkbox1,

            nextStep,
            previousStep,
            cancelar,

            perfilStore,
        }
    },
}
</script>

<style scoped>

.msg_erro{
    color: red;
    font-size: 12px;
    padding-left: 10px;
    display: block !important;
}

</style>
