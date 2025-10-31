<script setup lang="ts">
import {onMounted, ref} from 'vue';
import { User, UserManager } from 'oidc-client'
import axios from 'axios';
import Cookies from "js-cookie";
import { Buffer } from 'buffer';
import {limpezaCookies} from "@/utils/limpezaCookies";

let tipoCalculo :string | null = null
const linkLogin = import.meta.env.VITE_API_URL + '/auth/login'
const DOMINIO = import.meta.env.VITE_DOMINIO

let userManager: UserManager;
let user!: User | null;
let userdados: any;

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

async function getUser() {
    let user = await userManager.getUser();
    if (!user) {
        return await userManager.signinRedirectCallback();
    }
    return user;
}

async function sso_verifica_login() {
    console.log('AASP redir v-mne')

    try {
        console.log('Get Usr...')
        let user :any = await userManager.getUser();

        if (window.location.href.includes('fastbet')) {
            user = {
                id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFFQ0FBODcwOUE2OTYzNEJCQUVCMzgxN0RGQTA0QjhGN0VGQzIwREEiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJIc3FvY0pwcFkwdTY2emdYMzZCTGozNzhJTm8ifQ.eyJuYmYiOjE3MTYzMjE1ODYsImV4cCI6MTcxNjMyMTg4NiwiaXNzIjoiaHR0cHM6Ly9zc28uYWFzcC5vcmcuYnIiLCJhdWQiOiJjYWxjdWxvc19kZWJpdF9wcm9kIiwibm9uY2UiOiJmYTlmYmQ2YWI3ZDM0ODEyOWYzMjhiMWIwMjY4N2EzMCIsImlhdCI6MTcxNjMyMTU4NiwiYXRfaGFzaCI6Im1rQnM4WTRldUw3MUFEWTI0Q3JVVGciLCJzaWQiOiI3YjU0MzBiM2ZiZGUzYzY4YzZiMTBmNmE2NWM3MzYxZiIsInN1YiI6IjUxODg4MjYiLCJhdXRoX3RpbWUiOjE3MTYzMjE1NzIsImlkcCI6ImxvY2FsIiwiYW1yIjpbInB3ZCJdfQ.G7r8pQfiRC7evBxpyyIpWIv6rJ0BidSqe_Ny-OBvHPJCUGP8twk8KT3fMmi1umD214_2NVvEOiozWnXsGA-eHBiv48EK_qTAkYTrZkQr0bjovDjFItOjeKzkAkppTd1J5keVKOtkmcQ68YTWpU75VdynKriyeh1tzPW5eDMpiNy7FpIYzSq-3T4G-cCK6vHWE8ERFAsLs_gOs6z5G864TIAhMMpKsKk_0HnmM-AFVzcfbhLeIcEDaB-b21KjXCUWXVyM7yO7liqzJs1cp6fiweV3e1z6hIrjHSYMOnkAlcXHkF4I_Vmgpc8sbHYFv-4ZKCjLs9e6ywjMmNNyU-l_tw',
                access_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFFQ0FBODcwOUE2OTYzNEJCQUVCMzgxN0RGQTA0QjhGN0VGQzIwREEiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJIc3FvY0pwcFkwdTY2emdYMzZCTGozNzhJTm8ifQ.eyJuYmYiOjE3MTYzMjE1ODYsImV4cCI6MTcxNjMyNTE4NiwiaXNzIjoiaHR0cHM6Ly9zc28uYWFzcC5vcmcuYnIiLCJhdWQiOiJodHRwczovL3Nzby5hYXNwLm9yZy5ici9yZXNvdXJjZXMiLCJjbGllbnRfaWQiOiJjYWxjdWxvc19kZWJpdF9wcm9kIiwic3ViIjoiNTE4ODgyNiIsImF1dGhfdGltZSI6MTcxNjMyMTU3MiwiaWRwIjoibG9jYWwiLCJuYW1lIjoiMTA1OTU5IiwidXNlcl9pZCI6IjUxODg4MjYiLCJuaWNrbmFtZSI6IjEwNTk1OSIsIk5vbWVQZXNzb2FGaXNpY2EiOiJBRFJJQU5PIEpBTklOSSIsIkNvZGlnb1Blc3NvYSI6IjEwNTk1OSIsIk5vbWVTb2NpYWxQZXNzb2FGaXNpY2EiOiIiLCJOb21lQ2l2aWxQZXNzb2FGaXNpY2EiOiJBRFJJQU5PIEpBTklOSSIsIkNvZGlnb1BhY290ZSI6IjQiLCJOYW1lIjoiMTA1OTU5IiwiRW1haWwiOiJqYW5pbmlAcnVmaW5vY2FtcG9zLmNvbS5iciIsIkFzc29jaWFkbyI6IlMiLCJTdGF0dXNBc3NvY2lhZG8iOiIxIiwiRmxhZ01lbnNhZ2VtIjoiMCIsImhhc2giOiJQVzdjQ3lVNVVuQkdhcFJtMERUc0xXMXBVbENQN1pJTTlDUnFxcHBCcUQ1Tkw4RWVQOHV2eStQTHp4UmpPZU03WXBadW9Fa0pqNUlTbW10VEsvdHcxYVc3T0VIaTZnVC95cXliakZBZWkwNDJuR0JybnErWDNqMWN6ZW9McWp2ZWpKRHZPb0lmMWM2YnlZWjdybXcycUVFTTgxSkRubUlaeDBjN0g2czNYV1c4U0xmSWw5cGJVOE15TDlhQWlORzVqTmZqVkFYWWxyRldzdFFDUEl6WXN3PT0iLCJzY29wZSI6WyJvcGVuaWQiLCJwcm9maWxlIl0sImFtciI6WyJwd2QiXSwiQ2xpZW50c0FjY2VzcyI6WyJqcyIsInBvcnRhbF9hYXNwX2xvY2FsIiwiaW50aW1hY29lc193ZWJmb3JtcyIsImF1dGVudGljYWNhb19leHRlcm5vIiwiY2FsY3Vsb3NfZGViaXQiLCJsb2dpbl9hYXNwX3NpdGVfYXNwMyIsImNhbGN1bG9zX2RlYml0X3Byb2QiLCJnZXJlbmNpYWRvcl9jbGllbnRhdXRoIiwiY2FkYXN0cm9fYXBpX3BqIiwic29mdHBsYW5faXByb3Rlc3RvcyIsImp1cmlzcHJ1ZGVuY2lhX3Bvcl9lbmNvbWVuZGEiLCJmaW5hbmNlaXJvcGFnYW1lbnRvIiwiZ2VyZW5jaWFkb3JfcmVhY3QiLCJhYXNwX21ldV9jdXJzbyIsIkFBU1BGbGl4X2FzcDMiLCJhcHBfZ2VyZW5jaWFkb3IiLCJyYm9fZmluYW5jZWlybyIsIk1lZGlhY2FvQWRhbSIsIk5ld0xhdyIsIlBhcmNlcmlhRk1QIiwiYWFzcF9jZXJ0aWZpY2FjYW9fZGlnaXRhbCIsImN1cnNvb25saW5lX25ldHBvaW50IiwibWFnb29iYWNrb2ZmaWNlIiwianVpdCIsIlVQUE8iLCJlY29tbWVyY2VfYWFzcCIsIm5vdm9wb3J0YWxhYXNwIiwiY3Vyc29zb25saW5lIiwiY3Vyc29zZWFkIiwiQmlibGlvdGVjYURpZ2l0YWwiLCJSZXZpc3RhVHJpYnVuYWwiLCJub3ZvX2p1cmlzcHJ1ZGVuY2lhIiwibGlua2xlaSIsImFzc2luYWRvciIsImp1Y2VzcCIsImxlY3Vwb24iLCJub3ZvX2p1cmlzcHJ1ZGVuY2lhMiIsImVhZHhucCIsIm5vdm9lYWRwb2ludCIsImFhc3BfY2VydGlmaWNhY2FvX2RpZ2l0YWwiLCJtaW5oYV9jb250YSJdfQ.G4OTihGIJuDjsmfLFjRzARWwMibTA1vjgRUhv1oDP2gda4C0eYMPit-iwW_TwHHz5NCCuif_PdJYo8GNcxHikAbE0Q0hYeMStH8R2CifoCs2BdoPFh_6Kuy9HQy6lQ3E2Fd0Qgav85aNIZvU9sk1eXsRUaCqs6J3Ej6v1FKtzj2I4vA2WuF0bXOOXP8TSJSZJOuHZPX6VxuirNiP8YnH7rA6sLqD5wiVuFmQJRi7e4UnmADiawc9_UBiQyRO92YuQIfHwJ6pPLJsK1GVAdv9ak5wNbkdcnqdbsL7RdqgDCz7bnRGUVOgYchny-OCVCRIJayTqYXFZ0vGZboWrYyXRw',
                token_type: 'Bearer',
                expires_in: 3600,
                scope: 'openid%20profile',
                state: 'd4a618de3f7b430b92945bb169940199',
                session_state: '2IH4d8v8QLkJZvbxLzCta5cdrdlT1SVB-XENz3dCyqk.bc2110ba5ccae2f382f43cd48677f169'
            }
        }

        // Logado
        if (user && user.access_token) {
            const v = await verificaAssociado(user.access_token)
            if (v) {
                console.log('v2')
                await login(user);
            } else {
                console.log('Não Associado')
                //logout
                await ssoLogout();
            }
        } else {
            console.log('Deslogado')
            ssoLogin();
        }
    } catch (e) {
        console.log("Erro no catch do sso verifica login..." + e);
        window.location.href = "https://www.aasp.org.br/suporte-profissional/calculos/";
    }
}

async function login(user: any, redir = false){
    try {
        console.log('Logando no Debit... redir v-mne')

        limpezaCookies()

        // limpar cookie antes de enviar
        Cookies.remove('c_v_app', {path: '/', domain: DOMINIO});

        //timeout 300ms
        await new Promise(resolve => setTimeout(resolve, 300));

        const data = { cod: user.access_token, aasp: true };
        const response = await axios.post(
            linkLogin,
            data,
            { withCredentials: true }
        )

        await new Promise(resolve => setTimeout(resolve, 300));
        //if 200 redirect to app
        if (response.status == 200 && response.data.sucesso == 1) {
            //post para o servidor antigo
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
    userManager.signinRedirect().catch(function(e){
        console.log("Erro no catch do sso_login..." + e);
        window.location.href = "https://mnemosine.homolog.aasp.org.br/suporte-profissional/calculos/";
    });
}

// Manda o cliente para o logout
async function ssoLogout(){
    console.log("Deslogando...");
    await userManager.signoutRedirect();
}

// Escuta o evento e logout (quando desloga pelo portal AASP)
userManager.events.addUserSignedOut(function () {
    userManager.signinRedirect().then().catch(function(e){
        console.log("Erro no catch do signinRedirect..." + e);
        window.location.href="https://aasp.debit.com.br/aasp/logout.php";
    });
});

// verifica login ao carregar pagina vue
onMounted(async () => {
    const hashSub = window.location.hash.substring(1)
    if (hashSub) {
        console.log('usuario existe callback... v-mne')

        //convert to object
        let user

        try {
            user = hashSub.split('&').reduce((acc: any, curr) => {
                const [key, value] = curr.split('=');
                acc[key] = value;
                return acc;
            }, {});
        } catch (e) {
            console.log("Erro no catch do hashSub..." + e);
            await ssoLogout();
        }

        console.log('user dec')
        console.log(user)

        if (user && user.access_token) {
            const v = await verificaAssociado(user.access_token)
            if (v) {
                console.log('v1')
                await login(user);
            } else {
                console.log('Não Associado')
                //logout
                await ssoLogout();
            }
        } else {
            console.log('Deslogado')
            ssoLogin();
        }
    } else {
        console.log('verifica usuario no callback... v-mne')
        user = await getUser();
        if (user) {
            // Usuário autenticado, faça o que for necessário
            const us = user.toStorageString();
            console.log('us', us)
            sessionStorage.setItem("oidc.user:https://mnemosine.homolog.aasp.org.br:calculos_debit_prod", us);

            console.error('Usuário autenticado no v-mne');
            console.log('tentando login c us')
            await login(us)
        }
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
                <h5>Redirecionando...</h5>
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
