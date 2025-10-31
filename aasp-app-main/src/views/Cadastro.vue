<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import { useRoute, useRouter } from 'vue-router';
    import { setCookieRevenda, getCookieRevenda } from '@/composables/useRevendaCookie';
    import { useReCaptcha } from 'vue-recaptcha-v3'
    import axios from 'axios'

    let cadastrado = ref(false)

    let nome = ref('')
    let telefone = ref('')
    let email = ref('')
    let termos = ref(false)

    let erro = ref(false)
    let erroNome = ref(false)
    let erroTelefone = ref(false)
    let erroEmail = ref(false)
    let erroEmailExiste = ref(false)
    let erroCadastro = ref(false)
    let erroTermos = ref(false)

    let revendaToken = ref('')

    const servidorAPI = import.meta.env.VITE_API_URL

    const route = useRoute()
    let from = ref('')
    if(route.query.from){
        console.log('from', route.query.from)
        from.value = route.query.from.toString()
    }

    if(route.query.email){
        console.log('convite', route.query.email)
        email.value = route.query.email.toString()
    }

    onMounted(() => {
        console.log('verificando revenda')
        //verifica se tem token de revenda ?r=x1d4g-23... com cookies
        revendaToken.value = getCookieRevenda()
        if(revendaToken.value){
            console.log('token revenda - ', revendaToken.value)
        }
    })

    const { executeRecaptcha, recaptchaLoaded } = useReCaptcha()

    async function recaptcha() {
        // optional you can await for the reCaptcha load
        await recaptchaLoaded()

        // get the token, a custom action could be added as argument to the method
        const token = await executeRecaptcha('cadastro')

        return token
    }

    async function cadastrar(){
        //limpa erros
        erro.value = false
        erroNome.value = false
        erroTelefone.value = false
        erroEmail.value = false
        erroEmailExiste.value = false
        erroCadastro.value = false
        erroTermos.value = false

        console.log('submit')

        //valida campos
        if (nome.value == '' || nome.value.length < 4) {
            erroNome.value = true
            erro.value = true
        }
        // if (telefone.value == '' || !telefone.value.match(/^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$/)) {
        //     erroTelefone.value = true
        //     erro.value = true
        // }

        if (email.value == '' || !email.value.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)) {
            erroEmail.value = true
            erro.value = true
        }

        if (termos.value == false) {
            erroTermos.value = true
            erro.value = true
        }

        if (erro.value) {
            console.log('erro')
            return;
        }

        // get the token on your method
        const token = await recaptcha()

        const resp = await axios.post(
            `${servidorAPI}/front/cadastro`,
            {
                token: token,
                nome: nome.value,
                telefone: telefone.value,
                email: email.value,
                termos: termos.value,
                origem: from.value,
                revenda: revendaToken.value
            },
            {
                withCredentials: true
            }
        )

        if (resp.data.success === 1) {
            console.log('cadastrado')
            cadastrado.value = true
            return;
        } else {
            console.log('erro cadastro')
            console.log(resp.data)
            if (resp.data.code == 3) {
                erroEmailExiste.value = true
            }else{
                erroCadastro.value = true;
            }
            return;
        }
    }

    function formatTelefone() {
        //change value telefone from  object
        let tel = telefone.value

        //limit to 15 digits
        if (tel.length > 15) {
            tel = tel.substring(0, 15)
        }

        tel = tel.replace(/\D/g, "")
        tel = tel.replace(/^(\d{2})(\d)/g, "($1) $2");
        tel = tel.replace(/(\d)(\d{4})$/, "$1-$2");

        telefone.value = tel;
    }
</script>

<template>
    <section class="container pb-5 pt-2 pt-sm-3 pt-md-4 pt-lg-5 my-xl-3 my-xxl-5">
        <div v-if='cadastrado===false' class="my-2 d-lg-flex position-relative h-100">
            <!-- Sign up form-->
            <div  class="d-flex flex-column align-items-center w-lg-50 h-100 px-3 px-lg-5 pt-5">
                <div class="w-100 mt-auto" style="max-width: 526px;">
                    <h1>Desejo me cadastrar</h1>
                    <p class="pb-3 mb-3 mb-lg-4">
                        Já tem uma conta?
                        <RouterLink to='/login'>
                            Faça Login!
                        </RouterLink>
                    </p>
                    <form @submit.prevent class="needs-validation" novalidate>
<!--                        <div class="row row-cols-1 row-cols-sm-2">-->
<!--                            <div class="col mb-4">-->
<!--                                <input v-model='nome' class="form-control form-control-lg" type="text" name="cadNome"  placeholder="Nome" required>-->
<!--                                <div v-show="erroNome" class="invalid-feedback">Nome inválido</div>-->
<!--                            </div>-->
<!--                            <div class="col mb-4">-->
<!--                                <input v-model='telefone' @input='formatTelefone' maxlength="15" class="form-control form-control-lg" type="text" name="cadTelefone" placeholder="Telefone" required>-->
<!--                                <div v-show="erroTelefone" class="invalid-feedback">Telefone inválido</div>-->
<!--                            </div>-->
<!--                        </div>-->

                        <div class="mb-4">
                        <input v-model='nome' class="form-control form-control-lg" type="text" name="cadNome"  placeholder="Nome" required>
                        <div v-show="erroNome" class="invalid-feedback">Nome inválido</div>
                        </div>
                        <div class="mb-4">
                            <input v-model='email' name='cadEmail' id='cadEmail' class="form-control form-control-lg" type="email"
                                   placeholder="E-mail (login)" required>
                            <div v-show="erroEmail" class="invalid-feedback">E-mail inválido</div>
                            <span v-show="erroEmailExiste" class="invalid-feedback"><br>Este email já esta em uso</span>
                        </div>
                        <div class="pb-4">
                            <div class="form-check my-2">
                                <input v-model='termos' class="form-check-input" type="checkbox" id="terms" required>
                                <label class="form-check-label ms-1" for="terms">Eu aceito os
                                    <a href='https://www.debit.com.br/menu/termos-de-uso'>
                                        Termos & Condições
                                    </a>
                                </label>
                                <div v-show="erroTermos" class="invalid-feedback">Aceite os termos de uso</div>
                            </div>
                            <div id="recap2">
                                <div id="RecaptchaCad" class="g-recaptcha-cad"></div>
                                <input type="hidden" class="hiddenRecaptcha" name="cadHiddenRecaptcha"
                                       id="cadHiddenRecaptcha">
                            </div>
                            <input v-model='revendaToken' type="hidden" name="revendaToken">
                        </div>
                        <button @click='cadastrar' class="btn btn-lg btn-primary w-100 mb-4">Cadastrar</button>
                    </form>
                </div>
            </div>

            <div class="w-50 bg-size-cover bg-repeat-0 bg-position-center" >
                <img class="d-dark-mode-none" src="/images/account/cover.jpg" alt="Image" style="border-radius: 20px;">
            </div>
        </div>
        <div v-else class="my-2 d-lg-flex position-relative h-100">
            <div v-if='!erroCadastro' class="d-flex flex-column align-items-center w-lg-100 h-100 px-3 px-lg-5 pt-5">
                <div class='container py-5 mt-4 mt-lg-5 mb-lg-4 my-xl-5'>
                    <div class='row pt-sm-2 pt-lg-0'>

                        <!-- Page content-->
                        <div class="col-lg-12 pt-4 pb-2 pb-sm-4 ">
                            <section class="card border-0 py-1 p-md-2 p-xl-3 p-xxl-4 mb-4">

                            <!-- Basic info-->
                                <div class="card-body">
                                    <div class="d-flex align-items-center mt-sm-n1 pb-4 mb-0 mb-lg-1 mb-xl-3"><i class="ai-like text-primary lead pe-1 me-2"></i>
                                        <h2 class="h4 mb-0">Bem-vindo à <a href="https://debit.com.br/" style="color:black;">Debit.com.br</a></h2>
                                    </div>

                                    <div class='align-items-center justify-content-center justify-content-lg-start pb-3 pb-sm-5'>
                                        <p>Para obter acesso a Debit, você precisa ATIVAR sua conta.</p>
                                        <div class="alert alert-info alert-dismissible fade show" role="alert">
                                            <span class="fw-semibold">Verifique seu e-mail:</span> Enviamos os dados de ACESSO para seu e-mail de cadastro.<br>
                                        </div>
                                        <p>Após a confirmação, você poderá acessar os cálculos da Debit.</p>
                                        <p>Obrigado por se cadastrar.</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="d-flex flex-column align-items-center w-lg-100 h-100 px-3 px-lg-5 pt-5">
                <div class='container py-5 mt-4 mt-lg-5 mb-lg-4 my-xl-5'>
                    <div class='row pt-sm-2 pt-lg-0'>

                        <!-- Page content-->
                        <div class="col-lg-9 pt-4 pb-2 pb-sm-4">
                            <h1 class="h2 mb-4">Atenção</h1>
                            <!-- Basic info-->
                            <section class="card border-0 py-1 p-md-2 p-xl-3 p-xxl-4 mb-4">
                                <div class="card-body">
                                    <div class="d-flex align-items-center mt-sm-n1 pb-4 mb-0 mb-lg-1 mb-xl-3"><i class="ai-like text-primary lead pe-1 me-2"></i>
                                        <h2 class="h4 mb-0">Este e-mail já possui um cadastro.</h2>
                                    </div>
                                    <div class='align-items-center justify-content-center justify-content-lg-start pb-3 pb-sm-5'>
                                        <p>Você já possui cadastro neste site.<br><br>Clique em recuperar senha para acessar seu cadastro.</p>
                                        <p>
                                            <RouterLink to='/esqueci-senha' class='btn btn-lg btn-primary rounded-pill w-100 w-sm-auto me-sm-3 me-xl-4 mb-2 mb-sm-0'>
                                                Recuperar minha senha
                                            </RouterLink>
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
    .invalid-feedback {
        color: red;
        font-size:12px;
        display: block;
    }
</style>
