<template>
</template>

<script>
import { usePerfilStore } from '@/stores/PerfilStore'

export default {
    name: "AppFooter.vue",
    setup() {
        const url = import.meta.env.VITE_DEBIT_URL
        const urlApp = import.meta.env.VITE_APP_URL

        let perfilStore = usePerfilStore()

        return {
            url,
            urlApp,
            perfilStore,
        }
    }
}
</script>
