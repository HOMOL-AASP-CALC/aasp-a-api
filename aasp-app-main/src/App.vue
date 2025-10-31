<script setup lang="ts">
import { RouterView, useRoute } from "vue-router"
import AppHeader from "./components/AppHeader.vue"
import AppFooter from "./components/AppFooter.vue"
import { usePerfilStore } from "@/stores/PerfilStore"
import { onMounted, ref, watch } from "vue"
import { getRuntimeHost } from '@/utils/runtimeHost'

const route = useRoute()
const perfilStore = usePerfilStore()
const isPerfilLoaded = ref(false)

const carregarPerfil = () => {
    console.log('Carregando perfil...')
    perfilStore.getPerfil('App')
}

const hostname = getRuntimeHost()
const dominioDebit = ref(true)
const tenant = ref('debit')
const cssLoaded = ref(false)

//verificase hostname é diferente do env
const envHost = import.meta.env.VITE_APP_DOMAIN
const dominioEnv = envHost.replace('.com.br', '').replace('.com', '')

if (!hostname.includes(dominioEnv)) {
    console.warn('O host atual não é do dominio configurado, carregando perfil padrão.')
    dominioDebit.value = false
}

function loadTenantCss(name) {
    return fetch(`/css/theme-${name}.css`)
        .then(response => {
            if (!response.ok) throw new Error('CSS não encontrado')
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = `/css/theme-${name}.css`
            document.head.appendChild(link)
            cssLoaded.value = true
        })
}

onMounted(() => {
    console.log('version: ' + __VERSION__)
    console.log('h: ' + getRuntimeHost())
    carregarPerfil()
    loadTenantCss(tenant.value)
        .then(() => {
            console.log('CSS carregado com sucesso.')
        })
        .catch(err => {
            console.error('Erro ao carregar CSS:', err)
        })
})

watch(() => perfilStore.carregado, (newVal) => {
    isPerfilLoaded.value = newVal
})

// Sempre que a rota mudar, verifica se precisa recarregar perfil
watch(() => route.path, (newPath) => {
    if (newPath === '/login') {
        carregarPerfil()
    }
})


</script>


<template>
    <AppHeader v-if="isPerfilLoaded"></AppHeader>
    <main class="bg-gray">
        <RouterView v-if="isPerfilLoaded" />
    </main>
    <AppFooter v-if="isPerfilLoaded && dominioDebit"></AppFooter>
</template>
