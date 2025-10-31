<script setup lang='ts'>
import { usePerfilStore } from '@/stores/PerfilStore'
import TopoAASP from '@/components/TopoAASP.vue'
import TopoSemLogo from '@/components/topoSemLogo.vue'
import { computed, watch, watchEffect } from 'vue'

const perfilStore = usePerfilStore()

const logadoAASP = computed(() =>
    perfilStore.carregado &&
    perfilStore.logadoSSO == 1
)

const deslogado = computed(() =>
    perfilStore.carregado &&
    !perfilStore.logadoSSO &&
    !perfilStore.idDono
)

console.log('PERFILSTORE', perfilStore.carregado)
console.log('deslogado', deslogado.value)

watch(
    () => [perfilStore.carregado, perfilStore.idDono],
    ([carregado, idDono]) => {
        console.log('Atualizou topo', carregado, idDono)
    },
    { immediate: true }
)

watchEffect(() => {
    console.log('🧪 perfilStore:', {
        carregado: perfilStore.carregado,
        idDono: perfilStore.idDono,
        logadoSSO: perfilStore.logadoSSO,
    })
})
</script>

<template>
    <template v-if="perfilStore.carregado">
        <TopoAASP v-if="logadoAASP" />
        <TopoSemLogo v-else/>
    </template>
    <template v-else>
        <TopoSemLogo v-if="deslogado" />
    </template>
</template>