<script setup lang="ts">
import { ref } from 'vue'

let tipo = ref<string>('')
async function menuEstaAtivo(menu: string) {
    if (menu === tipo.value) {
        return 'active'
    } else {
        return ''
    }
}
</script>

<template>
    <ul class="mx-5 mt-sm-4 nav nav-tabs card-header-tabs flex-nowrap align-items-center mb-n1" role="tablist">
        <li class="vr opacity-20 my-3 me-3"></li>
        <li class="nav-item me-3" role="presentation">
            <router-link :to="`/lista/atual`" :class="menuEstaAtivo('atual')" class="nav-link px-0 py-2 border-0 rounded-1">Atualização monetária</router-link>
        </li>
        <li class="vr opacity-20 my-3 me-3"></li>
        <li  class="nav-item me-3" role="presentation">
            <router-link :to="`/lista/trab`" :class="menuEstaAtivo('trab')" class="nav-link px-0 py-2 border-0 rounded-1">Trabalhista</router-link>
        </li>
        <li class="vr opacity-20 my-3 me-3"></li>
        <li class="nav-item me-3" role="presentation">
            <router-link :to="`/lista/cponto`" :class="menuEstaAtivo('ponto')" class="nav-link px-0 py-2 border-0 rounded-1">Cartão de ponto</router-link>
        </li>
        <li class="vr opacity-20 my-3 me-3"></li>
        <li class="nav-item me-3" role="presentation">
            <router-link :to="`/lista/dsr`" :class="menuEstaAtivo('dsr')" class="nav-link px-0 py-2 border-0 rounded-1">Tabela DSR</router-link>
        </li>
        <li class="vr opacity-20 my-3 me-3"></li>
        <li class="nav-item me-3" role="presentation">
            <router-link :to="`/lista/finan`" :class="menuEstaAtivo('fin')" class="nav-link px-0 py-2 border-0 rounded-1">Financiamento</router-link>
        </li>
        <li class="vr opacity-20 my-3 me-3"></li>
    </ul>
</template>

<style scoped>

</style>
