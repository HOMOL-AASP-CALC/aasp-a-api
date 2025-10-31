<script setup lang='ts'>
import { ref } from 'vue'
import MenuGeralList from '@/components/MenuGeralItem.vue'
import { useRoute } from 'vue-router'
import {usePerfilStore} from "@/stores/PerfilStore";

const route = useRoute()
const perfilStore = usePerfilStore();

// 🔹 Mapas de menus por cliente
const menusWhitelabel: Record<string, any[]> = {
    default: [
        {
            name: 'Financeiro',
            children: [
                { name: 'Atualização Monetária', link: '/lista/atual' },
                { name: 'Cálculos Judiciais (CNJ)', link: '/lista/jud', badge:'' },
                { name: 'Tabelas Judiciais', link: '/lista/tabjud', badge:'' },
                { name: 'Tabelas de Financiamento', link: '/lista/finan' },
                { name: 'Saldo devedor de Financiamento', link: '/lista/deved' },

            ]
        },
        {
            name: 'Trabalhista',
            children: [
                { name: 'Cálculo Trabalhista', link: '/lista/trab' },
                { name: 'Cartão de Ponto', link: '/lista/cponto' },
                { name: 'Tabela de DSR', link: '/lista/dsr' },
            ],
        }
    ]
}

const menuItems = ref(
    menusWhitelabel.default
)

if(!perfilStore.logadoSSO ) {
    menuItems.value.splice(1, 0, {
        name: 'Previdenciário',
        children: [
            {name: 'Contagem de Tempo', link: '/lista/prevct'},
            {name: 'Diferenças não recebidas', link: '/lista/difn'},
        ],
    })
}

if (perfilStore.carregado && perfilStore.permiteTabelasPersonalizadas) {
    const financeiro = menuItems.value.find(m => m.name === 'Financeiro')
    if (financeiro) {
        financeiro.children.push({ name: 'Tabelas personalizadas', link: '/lista/indices' })
    }
}

</script>

<template>
    <aside class="bg-white card col-3 pe-lg-4 pb-2 pb-sm-4 border-0">
        <div class="bg-white card border-0 py-1 p-md-2 p-xl-3 p-xxl-4 ">
            <!-- col-lg-3 -->
            <div class="d-flex flex-column  pt-2 pt-lg-0" style="margin-left: auto; margin-right: auto; width: 95% !important;">
                <div class="h-100 mt-2" data-simplebar="init">
                    <div class="simplebar-wrapper" style="margin: 0px;">

                        <div class="simplebar-height-auto-observer-wrapper">
                            <div class="simplebar-height-auto-observer"></div>
                        </div>

                        <div class="simplebar-mask">
                            <div class="simplebar-offset" style="right: 0px; bottom: 0px;">
                                <div class="simplebar-content-wrapper" style="height: auto; overflow: hidden;">
                                    <div class="simplebar-content" style="padding: 0px;">
                                        <menu-geral-list  :menu-items="menuItems" :selecionado="route.fullPath"></menu-geral-list>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="simplebar-placeholder" style="width: auto; height: 240px;"></div>
                    </div>
                    <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
                        <div class="simplebar-scrollbar" style="width: 0px; display: none;"></div>
                    </div>
                    <div class="simplebar-track simplebar-vertical" style="visibility: hidden;">
                        <div class="simplebar-scrollbar" style="height: 0px; display: none;"></div>
                    </div>
                </div>
            </div>
        </div>
    </aside>
</template>
