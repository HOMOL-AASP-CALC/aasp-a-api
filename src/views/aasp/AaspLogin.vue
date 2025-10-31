<script setup lang="ts">
import { onMounted } from 'vue'
import { User, UserManager } from 'oidc-client'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Buffer } from 'buffer';

const linkLogin = import.meta.env.VITE_API_URL + '/auth/login'

let userManager: UserManager;
let user!: User | null;
let userdados: any;

const DOMINIO = import.meta.env.VITE_DOMINIO
const state = Math.random().toString(36).substring(2);

const appUrl = import.meta.env.VITE_APP_URL

// Config do SSO
const config = {
    authority: "https://mnemosine.homolog.aasp.org.br",
    client_id: "calculos_debit_prod",
    redirect_uri: appUrl+"/aasp/aasp-login-callback", // URL de resposta do login
    post_logout_redirect_uri: appUrl+"/aasp/aasp-logout", // URL de logout
    response_type: "id_token token",
    scope: "openid profile",
    filterProtocolClaims: true,
    loadUserInfo: true,
    state: state
}

userManager = new UserManager(config);

async function login(user: any, redir = false){
    try {
        console.log('Logando na Debit v-mne...')

        // limpar cookie antes de enviar
        Cookies.remove('c_v_app', {path: '/', domain: DOMINIO});

        const data = { cod: user.access_token, aasp: true };
        const response = await axios.post(
            linkLogin,
            data,
            { withCredentials: true }
        )

        //if 200 redirect to app
        if (response.status == 200 && response.data.sucesso == 1) {
            const servidorAPP = import.meta.env.VITE_APP_URL

            window.location.href = servidorAPP + '/lista/atual'
        } else if (response.status == 200 && response.data.sucesso == 0) {
            ssoLogin();
        }
    } catch (error) {
        console.log('Erro ao logar no Debit')
        console.error(error)
        window.location.href = "https://www.aasp.org.br/suporte-profissional/calculos/";
    }
}

// Manda o cliente para a tela de login
function ssoLogin(){
    console.log('ssoLogin v-mne')
    userdados = sessionStorage.getItem("oidc.user:https://sso.aasp.org.br:calculos_debit_prod");

    console.log('userdados', userdados)
    if(!userdados){
        console.log('nao tem userdados')

        userManager.getUser().then((usr) => {
            if (usr) {
                user = usr;
                console.log("Usuário autenticado v-mne");
            } else {
                // Usuário não autenticado, redirecionar para o provedor de identidade
                console.log('Usuário não autenticado v-mne, redirecionar...')
                userManager.signinRedirect();
            }
        });
    }
    return true;
}

// verifica login ao carregar pagina vue
onMounted(async () => {
    const hashSub = window.location.hash.substring(1)
    if (hashSub) {

        //convert to object
        const user = hashSub.split('&').reduce((acc: any, curr) => {
            const [key, value] = curr.split('=');
            acc[key] = value;
            return acc;
        }, {});

        if (user && user.access_token) {
            verificaAssociado(user.access_token).then((r) => {
                if(r){
                    login(user);
                }else{
                    console.log('Não Associado')
                    //logout
                    userManager.signoutRedirect();
                }
            })
        } else {
            console.log('Deslogado')
            ssoLogin();
        }
    } else {
        console.log('sem URL, redirect aasp...')
        ssoLogin();
    }
})

async function verificaAssociado(accessToken: string){
    const parts = accessToken.split('.')

    const payload = Buffer.from(parts[1], 'base64').toString('utf8')

    const decodedPayload = JSON.parse(payload)

    if (payload && decodedPayload['Associado'] == 'S' && decodedPayload['StatusAssociado'] == '1') {
        return true
    }

    return false
}

</script>

<template>
    <section id='content' class='bg-secondary'>
        <div class='container py-5 mt-4 mt-lg-5 mb-lg-4 my-xl-5'>
            <div class='row pt-sm-2 pt-lg-0'>
                <div class="spinner"></div>
                <h5>Carregando...</h5>
            </div>
        </div>
    </section>
</template>

<style scoped>
.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border-left-color: #09f;
    animation: spin 1s ease infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
