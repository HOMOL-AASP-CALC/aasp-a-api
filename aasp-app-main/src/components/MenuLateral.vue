<template>
    <aside class="col-lg-3 pe-lg-4 pe-xl-5 mt-n3">
        <div class="position-lg-sticky top-0">
            <div class="d-none d-lg-block" style="padding-top: 105px;"></div>
            <div class="offcanvas-lg offcanvas-start" id="sidebarAccount">
                <button class="btn-close position-absolute top-0 end-0 mt-3 me-3 d-lg-none" type="button" data-bs-dismiss="offcanvas" data-bs-target="#sidebarAccount"></button>
                <div class="offcanvas-body">
                    <div class="pb-2 pb-lg-0 mb-4 mb-lg-5">
                        <i class="h2 text-nav fw-normal ai-user d-block rounded-circle mb-2" width="80" alt="{{perfilStore.nomePerfil}}"></i>
                        <h3 class="h5 mb-1">
                            {{ perfilStore.nomePerfil }}
                        </h3>
                        <p class="fs-sm text-muted mb-0">
                            {{ login }}
                        </p>
                    </div>
                    <nav class="nav flex-column pb-2 pb-lg-4 mb-3">
                        <h4 class="fs-xs fw-medium text-muted text-uppercase pb-1 mb-2">Conta</h4>

                        <MenuLateralItem to='/menu/perfil-geral' icone='ai-settings'>Geral</MenuLateralItem>
                        <MenuLateralItem to='/menu/editar-perfil' icone='ai-user-check'>Meus dados</MenuLateralItem>
                        <MenuLateralItem to='/menu/altera-senha' icone='ai-lock-closed'>Alterar senha</MenuLateralItem>

                    </nav>
                    <nav class="nav flex-column pb-2 pb-lg-4 mb-1">
                        <h4 class="fs-xs fw-medium text-muted text-uppercase pb-1 mb-2">Dashboard</h4>
                        <MenuLateralItem to='/menu/minha-assinatura' icone='ai-cart'>Minha Assinatura</MenuLateralItem>
                        <MenuLateralItem to='/menu/usuarios' icone='ai-user-group'>Meus usuários</MenuLateralItem>
                        <MenuLateralItem v-if="perfilStore.getNomePerfil==='XYZA3...'" to='/menu/usuarios-corporativos' icone='ai-user-group'>Compartilhar Assinatura</MenuLateralItem>
                        <MenuLateralItem to='/menu/api' icone='ai-code'>API</MenuLateralItem>
                        <MenuLateralItem to='/menu/revenda' icone='ai-rocket'>Programa de Parceria</MenuLateralItem>
                    </nav>
                    <nav class="nav flex-column">
                        <a class="nav-link fw-semibold py-2 px-0" :href="url+'/fale-conosco'"><i class="ai-messages fs-5 opacity-60 me-2"></i>Suporte<span class="badge bg-danger ms-auto"></span></a>
                        <a class="nav-link fw-semibold py-2 px-0" :href="urlApp+'/menu/logout'"><i class="ai-logout fs-5 opacity-60 me-2"></i>Deslogar</a>
                    </nav>
                </div>
            </div>
        </div>
    </aside>
</template>


<script>
import { ref, onMounted, defineComponent } from 'vue'
import { usePerfilStore } from '@/stores/PerfilStore'
import MenuLateralItem from "./MenuLateralItem.vue"

export default defineComponent({
    name: "MenuLateral",
    components: {
        MenuLateralItem
    },
    setup(){
        const url = import.meta.env.VITE_DEBIT_URL
        const urlLegacy = import.meta.env.VITE_DEBIT_LEGACY_URL
        const urlApp = import.meta.env.VITE_APP_URL

        const perfilStore = ref([]);
        const login = ref('');

        const pega_dados = async () => {
            perfilStore.value = usePerfilStore()
            await perfilStore.value.getPerfil('MenuLateral')
            login.value = perfilStore.value.listaUsuarios.find(obj => obj.id_usuario === 0).login
        };

        onMounted(() => {
            pega_dados();
        });

        return {
            perfilStore,
            login,
            url,
            urlLegacy,
            urlApp
        }
    },
})
</script>
