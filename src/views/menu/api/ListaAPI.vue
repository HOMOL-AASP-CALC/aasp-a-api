<script setup lang="ts">

import { onMounted, ref } from 'vue'
import axios from 'axios'
import router from '@/router'

const urlApi = import.meta.env.VITE_API_URL
const urlDebit = import.meta.env.VITE_DEBIT_URL

const tokens = ref<string[]>([])
const modalExcluirClose = ref(null)

async function pegaDados(){
    try {
        const response = await axios.get(`${urlApi}/menu/api`, {withCredentials: true })
        console.log(response.data)

        //if response has sucesso = 1
        if (response.data.success === 1) {
            console.log(response.data.tokens)
            tokens.value = response.data.tokens
        } else {
            tokens.value = []
        }
    } catch (error) {
        console.log(error)
    }
}

async function deletarToken(id) {
    try {
        await axios.get(
            `${import.meta.env.VITE_API_URL}/menu/api_del/${id}`,
            { withCredentials: true }
        )
        await pegaDados()

        modalExcluirClose.value.click()
    } catch (error) {
        console.log(error)
    }
    console.log('deleta')
}

function editarToken(id, nome) {
    router.push({name: `AddAPI`, state:{ id: id, nome: nome }} )
}

onMounted(() => {
    pegaDados()
})
</script>

<template>
    <section id='content' class='bg-secondary'>
        <div class='container py-5 mt-4 mt-lg-5 mb-lg-4 my-xl-5'>
            <div class='row pt-sm-2 pt-lg-0'>

                <!-- Page content-->
                <div class="col-lg-12 pt-4 pb-2 pb-sm-4">
                    <h1 class="h2 mb-4">APIs</h1>

                    <!-- Orders-->
                    <section class="card border-0 py-1 p-md-2 p-xl-3 p-xxl-4">
                        <div class="card-body">
                            <div
                                class="d-flex align-items-center mt-sm-n1 pb-4 mb-0 mb-lg-1 mb-xl-3"
                            >
                                <i class="ai-key text-primary lead pe-1 me-2 "></i>
                                <h2 class="h4 mb-0">Minhas chaves de API</h2>
                                <a class="btn btn-sm btn-secondary me-2  ms-auto"
                                            :href="urlDebit+'/api-calculos'">
                                    Como implementar
                                    <font-awesome-icon icon="fa-question-circle" class='mx-1' />
                                </a>
                                <RouterLink class="btn btn-sm btn-secondary"
                                            to='/menu/add-api'>
                                    <i class="ai-plus ms-n1 me-2"></i>Adicionar
                                </RouterLink>
                            </div>
                            <!-- Orders accordion-->

                            <div v-if="tokens == 0" class="accordion accordion-alt accordion-orders" id="orders">
                                Nenhum token feito até o momento.
                            </div>

                            <div v-else class="accordion accordion-alt accordion-orders" id="orders">
                                <div class="accordion-item border-top mb-0" v-for="(token) in tokens" :key="token.id" >
                                    <div class="accordion-header">
                                        <span class="d-flex fs-4 fw-normal text-decoration-none py-3 collapsed" >
                                            <div class="d-flex w-100" style="max-width: 540px;">
                                                <div class="me-3 me-sm-4">
                                                    <div class="d-none d-sm-block fs-sm text-muted mb-2">Nome</div>
                                                    <div class="fs-sm fw-medium text-dark">
                                                        {{ token.nome }}
                                                    </div>
                                                </div>
                                                <div class="me-3 me-sm-4">
                                                    <div class="fs-sm text-muted mb-2">Token</div>
                                                    <div class="fs-sm fw-medium text-dark">
                                                        {{token.token}}
                                                    </div>
                                                </div>
                                                <div class="me-3 me-sm-4">
                                                    <div class="fs-sm text-muted mb-2">Criado em</div>
                                                    <div class="fs-sm fw-medium text-dark">
                                                        {{token.criado.toString()
                                                        .replace(/(\d{4})(\d{2})(\d{2})/, '$3/$2/$1')}}
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="accordion-button-img d-none d-sm-flex ms-auto">
                                                <div class="me-3 me-sm-4">
                                                    <div class="fs-sm text-muted mb-2">Opções</div>
                                                    <div class="fs-sm fw-medium text-dark">
                                                        <font-awesome-icon  @click="editarToken(token.id, token.nome)" icon="file-text"  title='Editar' class='me-2' style='font-size: 20px; color:#666;'/>
                                                        <font-awesome-icon @click="deletarToken(token.id)" icon="trash"  class='me-2' style='font-size: 22px;   cursor: pointer;'/>
                                                    </div>
                                                </div>
                                            </div>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Default modal -->
                            <div class="modal fade" id="modalExcluirToken" tabindex="-1" role="dialog">
                                <div class="modal-dialog modal-sm" role="document">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h4 class="modal-title">Excluir API Token</h4>

                                            <button ref='modalExcluirClose' class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            <p>Você tem certeza que deseja deletar este token?</p>
                                        </div>
                                        <div class="modal-footer">
                                            <button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Cancelar</button>
                                            <button class="btn btn-outline-danger" type="button" @click="deletarToken()">Excluir</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
@import '@/assets/css/debit.css';
@import '@/assets/css/icones.css';
</style>
