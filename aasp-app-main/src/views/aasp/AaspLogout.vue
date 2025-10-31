<script setup lang="ts">

import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { User, UserManager } from 'oidc-client'
import Cookies from "js-cookie";
import {limpezaCookies} from "@/utils/limpezaCookies";

const state = Math.random().toString(36).substring(2);
const DOMINIO = import.meta.env.VITE_DOMINIO



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


const userManager = new UserManager(config);

onMounted(async () => {
    const us = await userManager.getUser().then(user => console.log(user))
    console.log('us', us )
    console.log('sso_logout()')
    //Limpar localStorage,sessionStorage,cookies
    limpezaCookies()
    // limpar cookie antes de enviar
    Cookies.remove('c_v_app', {path: '/', domain: DOMINIO});
    Cookies.remove('c_id_dono', {path: '/', domain: DOMINIO});
    Cookies.remove('logado_sso', {path: '/', domain: DOMINIO});

    //Redireciona para tela de logout do SSO
    userManager.signoutRedirect();
})

</script>

<template>

</template>

<style scoped>

</style>
