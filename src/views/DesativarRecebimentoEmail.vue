<script setup lang='ts'>
import { ref } from 'vue'
import axios from 'axios'

const resposta1 = ref('')
const msgErro = ref('')
const msgSucesso = ref('')

const enviado = ref(false)

const urlDebit = import.meta.env.VITE_DEBIT_WWW2

const token = ref('')
const email = ref('')

const urlParams = new URLSearchParams(window.location.search)
email.value = urlParams.get('em') || ''
token.value = urlParams.get('token') || ''

token.value = Math.random().toString(16).substring(2)

resposta1.value = 'd-none'

async function desativarRecebimento (){
    enviado.value = true

    if (email.value === '' || token.value === '') {
        msgErro.value = 'Link de desativação inválido'
        resposta1.value = 'd-flex'
    } else {
        try {
            const response = await axios
                .post(
                    `${import.meta.env.VITE_API_URL}/menu/desativar-recebimento-emails`,
                    {
                        email: email.value,
                        token: token.value,
                    },
                    { withCredentials: true }
                )
            console.log('resp: ',response.data)
            if (response.data?.success == 1) {
                msgErro.value = ''
                msgSucesso.value = 'Cancelamento efetuado! Redirecionando...'
                resposta1.value = 'd-flex'
                //redirecionar para /login apos 5 segundos
                setTimeout(() => {
                    window.location.href = `${urlDebit}`
                }, 3000)
            } else if (response.data?.success == 0){
                msgErro.value = 'Link expirado ou inválido'
                resposta1.value = 'd-flex'
                enviado.value = false
            } else {
                msgErro.value = 'Falha ao cancelar. Entre em contato com suporte'
                resposta1.value = 'd-flex'
                enviado.value = false
            }
        } catch(error) {
            console.log(error)
            enviado.value = false
        }
    }
}

</script>
<template>
    <section id="content" class="bg-secondary">
        <div class="container py-5 mt-4 mt-lg-5 mb-lg-4 my-xl-5">
            <div class="row pt-sm-2 pt-lg-0">
                <!-- Sidebar (offcanvas on sreens < 992px)-->

                <!-- Page content-->
                <div class="col-lg-9 pt-4 pb-2 pb-sm-4">
                    <h1 class="h2 mb-4">Cancelar recebimento de Emails</h1>

                    <!-- Orders-->
                    <section
                        class="card border-0 py-1 p-md-2 p-xl-3 p-xxl-4 mb-4"
                    >
                        <div class="card-body">
                            <div class='mt-auto' style='max-width: 700px;'>
                                <div
                                    class="d-flex align-items-center mt-sm-n1 pb-4 mb-0 mb-lg-1 mb-xl-3"
                                >
                                    <i
                                        class="ai-user text-primary lead pe-1 me-2"
                                    ></i>
                                    <h2 class="h4 mb-0">O que acontece ao cancelar?</h2>
                                </div>
                                <p class='pb-2'>Ao cancelar, você deixará de receber emails sobre:</p>
                                <ul class='list-unstyled pb-2 pb-lg-0 mb-4 mb-lg-5'>
                                    <li class='d-flex mb-2'><span class='text-primary fw-semibold me-2'>*</span>
                                        Acesso a Ofertas e Promoções Exclusivas.
                                    </li>
                                    <li class='d-flex mb-2'><span class='text-primary fw-semibold me-2'>*</span>
                                        Informação Atualizada sobre Produtos e Serviços.
                                    </li>
                                    <li class='d-flex mb-2'><span class='text-primary fw-semibold me-2'>*</span>
                                        Conteúdo Relevante e Educacional.
                                    </li>
                                </ul>
                                <small class='pb-2'>* Você ainda receberá e-mails sobre alterações de senha e informações da sua assinatura.</small>
                            </div>

                                <div class="col-sm-6 my-2">
                                    <div id="resposta" :class="resposta1">
                                        <i
                                            class="ai-circle-info fs-xl me-2"
                                        ></i>
                                        <p v-if='msgErro.length > 0' class="mb-0 error">{{ msgErro }}</p>
                                        <p v-if='msgSucesso.length > 0' class="fs-xl mb-0 info">{{ msgSucesso }}</p>
                                    </div>
                                </div>
                                <div
                                    class="row align-items-center g-3 g-sm-4 pb-3"
                                >

                                    <div class="col-sm-6">
                                        <a class="btn btn-sm btn-outline-info ms-auto" :class="enviado ? 'd-none' : ''" :href='urlDebit'>
                                            Não cancelar recebimento
                                        </a>
                                    </div>
                                    <div class="col-sm-6">
                                        <button class="btn btn-sm btn-outline-danger ms-auto" :disabled='enviado' @click='desativarRecebimento()'>
                                            Cancelar recebimento
                                        </button>
                                    </div>
                                </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </section>
</template>
