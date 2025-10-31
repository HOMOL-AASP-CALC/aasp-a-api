<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import { useReCaptcha } from 'vue-recaptcha-v3';
    import axios from 'axios';
    import { useRoute, useRouter } from 'vue-router';
    import Cookies from 'js-cookie';
    import { limpezaCookies } from '../utils/limpezaCookies';
    import { usePerfilStore } from '@/stores/PerfilStore';

    const perfilStore = usePerfilStore();

    const urlCadastro = import.meta.env.VITE_APP_URL+'/cadastro'
    const urlEsqueciSenha = import.meta.env.VITE_APP_URL+'/esqueci-senha'
    const router = useRouter();

    const hostnameAtual = window.location.hostname;
    const urlPadrao = import.meta.env.VITE_APP_URL;
    const DOMINIO = import.meta.env.VITE_DOMINIO;

    function getDominio(url: string) {
        try {
            return new URL(url).hostname;
        } catch {
            return '';
        }
    }

    let servidorAPP = urlPadrao;

    const { executeRecaptcha, recaptchaLoaded } = useReCaptcha();

    const formLogin = ref(null)

    const form = ref({
        login: '',
        senha: '',
        recaptchaToken: ''
    })
    const loading = ref(false)

    const erro = ref(false)

    const erroLogin = ref(false)
    const erroSenha = ref(false)
    const passwordType = ref<'password'|'text'>('password')

    const linkLogin = import.meta.env.VITE_API_URL + '/auth/login'

    const route = useRoute()
    console.log(route.query)
    let queryParams = route.query

    if(queryParams.email){
        form.value.login = queryParams.email.toString()
    }

    let erroLoginMensagem = ref('')

    function checkErro(codigoErro: number) {
        switch (codigoErro) {
            case 1:
                erroLoginMensagem.value = 'Login e senha inválidos'
                break
            case 2:
                erroLoginMensagem.value = 'Favor preencher corretamente os dados'
                break
            case 3:
                erroLoginMensagem.value = 'Login falhou. Tente novamente ou tente redefinir a senha.'
                break
            case 4:
                erroLoginMensagem.value = 'Usuário não autenticado. Tente novamente'
                break
            default:
                erroLoginMensagem.value = 'Erro'
                break
        }
    }

    async function recaptcha() {
        await recaptchaLoaded();
        const token = await executeRecaptcha('login');
        return token;
    }

    onMounted(async () => {
        await SetCaptchaToken()
        setInterval(function () { SetCaptchaToken(); }, 2 * 60 * 1000);
    })

    async function SetCaptchaToken(){
        form.value.recaptchaToken = await recaptcha()
    }

    async function handleSubmit(){
        loading.value = true
        //limpa erros
        erro.value = false
        erroLogin.value = false
        erroSenha.value = false

        //valida campos
        if (form.value.login == '' || form.value.login.length < 2) {
            erroLogin.value = true
            erro.value = true
        }
        if (form.value.senha == '' || form.value.senha.length < 4) {
            console.log('erro senha')
            console.log(form.value.senha)
            erroSenha.value = true
            erro.value = true
        }

        if (erro.value) {
            console.log('Form submission prevented.');
            loading.value = false
            return;
        }



        try {
            // limpar cookie antes de enviar
            limpezaCookies()
            Cookies.remove('c_v_app', { path: '/', domain: DOMINIO });


            const response = await axios.post(
                linkLogin,
                {
                    login: form.value.login,
                    senha: form.value.senha,
                    recaptchaToken: form.value.recaptchaToken
                },
                {withCredentials: true}
            )
            // Reativar o envio de cookies
            console.log(response.data)
            //if 200 redirect to app
            if (response.status == 200 && response.data.sucesso == 1) {
                window.location.href = servidorAPP + '/lista/atual'
            } else if(response.status == 200 && response.data.sucesso == 0) {
                erro.value = true
                checkErro(response.data.erro)
                console.log('erro: ', response.data.erro)
            } else {
                erro.value = true
            }
        } catch (error) {
            console.error(error)
        }
        loading.value = false
        await SetCaptchaToken() //reload
    }

    async function tooglePassword(){
        if(passwordType.value === 'password'){
            passwordType.value = 'text'
        }else{
            passwordType.value = 'password'
        }
    }
</script>

<template>
    <section class="container pb-5 pt-2 pt-sm-3 pt-md-4 pt-lg-5 my-xl-3 my-xxl-5">
        <div style="height: 100px;"></div>
        <div class="d-flex flex-column position-relative h-75">
            <div class="container mt-auto">
                <div class="row align-items-center justify-content-center">
                    <!-- Sign in form-->

                    <div class="col-md-6 mb-5 mb-md-0">
                        <div class="card dark-mode border-0 bg-primary py-md-3 py-lg-4 px-lg-4 px-xl-5">
                            <div class="card-body">
                                <h1 class="py-2 pb-lg-3">Já sou Cadastrado</h1>
                                <p class="pb-3 mb-3 mb-lg-4">Não tem cadastro?
                                    <a style="color: #FFF; font-weight: bold" href="https://www.aasp.org.br/associe-se/">Quero me registrar</a>
                                </p>
                                <form ref="formLogin" @submit.prevent='handleSubmit()' :action='linkLogin' method='POST' name='form_login' id='form_login'>
                                    <div class="pb-3 mb-3">
                                        <div class="position-relative">
                                            <i class="ai-mail fs-lg position-absolute top-50 start-0 translate-middle-y text-light opacity-80 ms-3"></i>
                                            <input v-model='form.login'
                                                   name="login"
                                                   class="form-control form-control-lg ps-5" type="text" placeholder="Login"
                                                   required />
                                            <div v-if='erroLogin' class="invalid-feedback">Login inválido</div>
                                        </div>
                                    </div>
                                    <div class="mb-4">
                                        <div class="position-relative">
                                            <i class="ai-lock-closed fs-lg position-absolute top-50 start-0 translate-middle-y text-light opacity-80 ms-3"></i>
                                            <div class="password-toggle">
                                                <input v-model='form.senha'
                                                       :type="passwordType"
                                                       name="senha"
                                                       class="form-control form-control-lg ps-5"
                                                       placeholder="Senha"
                                                       required />
                                                <label class="password-toggle-btn" aria-label="Show/hide password">
                                                    <input @click='tooglePassword' class="password-toggle-check" type="checkbox" />
                                                    <span class="password-toggle-indicator"></span>
                                                </label>
                                                <div v-if='erroSenha' class="invalid-feedback">Senha inválida</div>
                                            </div>
                                        </div>
                                    </div>
                                    <input :value='form.recaptchaToken' type="hidden" name="recaptchaToken" />
                                    <div class="d-flex flex-wrap align-items-center justify-content-between pb-4">
                                        <span class="my-1"></span>
                                        <a class="text-light fs-sm fw-semibold text-decoration-none my-1"
                                           href="https://www.aasp.org.br/">Esqueci minha senha</a>
                                    </div>
                                    <button type="submit" class="btn btn-lg btn-light w-100 mb-4"
                                            :class="{ 'disabled': loading }"
                                            :disabled="loading" >
                                        <span v-if="loading" class="spinner-border spinner-border-sm mr-1"></span>
                                        Acessar
                                    </button>
                                    <div v-if='erro && erroLoginMensagem' class="alert alert-warning" role="alert">
                                        {{ erroLoginMensagem }}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
    .btn1 {
        cursor: pointer;
    }
    .invalid-feedback {
        color: #ffcc00;
        font-size:12px;
        display: block;
    }
    .password-toggle {
        position: relative;
    }
    .password-toggle .form-control {
        padding-right: 3rem;
    }

    .password-toggle-btn {
        position: absolute;
        top: 50%;
        right: 0.625rem;
        margin-bottom: 0;
        padding: 0.5rem;
        transform: translateY(-50%);
        font-size: 1rem;
        line-height: 1;
        cursor: pointer;
    }
    .password-toggle-btn .password-toggle-indicator {
        transition: color 0.2s ease-in-out;
        color: var(--ar-gray-600);
        font-family: "around-icons";
        font-size: 1.25em;
        font-style: normal;
    }
    .password-toggle-btn .password-toggle-indicator::before {
        content: "\e9ef";
    }
    .password-toggle-btn .password-toggle-indicator:hover {
        color: var(--ar-gray-800);
    }
    .password-toggle-btn .password-toggle-check {
        position: absolute;
        left: 0;
        z-index: -1;
        width: 1rem;
        height: 1.25rem;
        opacity: 0;
    }
    .password-toggle-btn .password-toggle-check:checked ~ .password-toggle-indicator::before {
        content: "\e995";
    }
</style>
