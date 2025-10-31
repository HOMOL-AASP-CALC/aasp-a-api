<script setup lang=ts>
import { ref } from 'vue'
// import useValidaCpfCnpj from '../../services/validaCpfCnpj'
// import router from '@/router'
import axios from 'axios'

import router from '@/router'

let id = ref(0)
let nome = ref('')

if(history.state.id && history.state.nome){
    id.value = history.state.id
    nome.value = history.state.nome
}

let enviado = ref(false)

async function gerarToken(){
    console.log('enviando...')
    if (nome.value.length > 0) {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/menu/api_add_edit/${id.value}`, { nome: nome.value }, { withCredentials: true })
            console.log(response)
            const data = response.data

            if (data.success === 1) {
                console.log('sucesso')
                enviado.value = true
                // redirecionar para editar-divida depois de 500ms usando vue router
                setTimeout(() => {
                    router.push('/menu/api')
                }, 200)
            } else {
                console.log('erro: ', data)
            }

        } catch (error) {
            console.log('erro')
            console.log(error);
        }
    }
}

</script>

<template>
    <!-- Page content-->
    <section id="content" class="bg-secondary">
        <div class="container py-5 mt-4 mt-lg-5 mb-lg-4 my-xl-5">
            <div class="row pt-sm-2 pt-lg-0">
                <!-- Page content-->
                <div class="col-lg-12 pt-4 pb-2 pb-sm-4">
                    <h1 class="h2 mb-4">APIs</h1>

                    <!-- Basic info-->
                    <section class="card border-0 py-1 p-md-2 p-xl-3 p-xxl-4 mb-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center mt-sm-n1 pb-4 mb-0 mb-lg-1 mb-xl-3"><i class="ai-user text-primary lead pe-1 me-2"></i>
                                <h2 class="h4 mb-0">Gerar Token</h2>
                            </div>

                            <div class="row g-3 g-sm-4 mt-0 mt-lg-2">
                                <div class="col-sm-12">
                                    <label class="form-label" for="Nome">Nome</label>
                                    <input class="form-control" type="text" v-model='nome' name="nome" maxlength="50">
                                </div>

                                <div id="btn_form" class="col-12 d-flex justify-content-end pt-3">
                                    <RouterLink class="btn btn-secondary" to='/menu/api'>Voltar</RouterLink>
                                    <button vi @click.prevent="gerarToken" class="btn btn-primary ms-3" type="button">
                                        <span v-if='id'>Alterar</span>
                                        <span v-else>Gerar</span>
                                    </button>
                                </div>

                                <div v-show='enviado' class="alert alert-primary alert-dismissible fade show" role="alert">
                                    <span class="fw-semibold">Sucesso:</span> Seus dados foram alterados.
                                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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
