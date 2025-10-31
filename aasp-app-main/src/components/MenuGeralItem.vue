<script setup lang="ts">
import MenuList from '@/components/MenuGeralItem.vue'
import { usePerfilStore } from '@/stores/PerfilStore'
import { defineProps, ref, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
const route = useRoute()

const perfilStore = usePerfilStore()

const props = defineProps({
    menuItems: {
        type: Array,
        required: true
    },
    submenu: {
        type: Number,
        required: false
    },
    selecionado: {
        type: String,
        required: false
    },
    menuSel: {
        type: String,
        required: false
    }
})

const menuSel = props.menuSel || 'recentes'

const findLink = (items, linkToFind) => {
    for (const item of items) {
        if (item.link === linkToFind || item.link == menuSel) {
            return true;
        }
    }
    return false;
}

function itemLiberado(item):boolean{
    return ((item.dev && perfilStore.getNomePerfil==='XYZA3...') || !item.dev)
}
function toggleClasse(id) {
    const elemento = document.getElementById(id);

    if (elemento.classList.contains('collapse')) {
        elemento.classList.remove('collapse');
    } else {
        elemento.classList.add('collapse');
    }
}
</script>

<template>
    <ul :class="{ 'submenu': (props.submenu >= 0) }" class="nav flex-column">
        <li class="nav-item collapsibleListClosed " v-for="(item, index) in props.menuItems" :key="index">
            <span v-if="item.children" class="nav-link px-0 py-2">

                <button class="accordion-button" type="button" @click="toggleClasse('menu' + index + 'submenu' + props.submenu)">
                    <i class="ai-circle-arrow-right fs-lg opacity-90 me-2"></i>
                    <h5>{{ item.name }}</h5>
                </button>
            </span>

            <span v-if="!item.children && itemLiberado(item)" class="nav-item">
                <RouterLink :to="item.link"
                            class="nav-link fs-sm fw-normal py-1 ps-1 pe-0 mb-1 "
                            :class="{ 'badge bg-faded-info text-info fs-sm mt-2 selecao-lateral': item.link == route.fullPath }"
                            data-scroll="data-scroll" >
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <span>{{ item.name }}</span>
                        <span v-if=item.badge class="badge bg-danger small-badge ">{{ item.badge }}</span>
                    </div>
                </RouterLink>
            </span>

            <div v-if="item.children " :class="{ '': (!findLink(item.children, props.selecionado)) }" class="accordion-collapse" :id="'menu' + index + 'submenu' + props.submenu">
                <menu-list v-if="item.children" :menu-items="item.children" :submenu="index"></menu-list>
            </div>

        </li>
    </ul>
</template>

<style scoped>
    .submenu {
        padding-left: 15px;
        border-left: var(--ar-border-width) var(--ar-border-style) var(--ar-border-color) !important;
        margin-left: .5rem !important;
    }
    .small-badge {
        font-size: 0.5rem; /* Adjust this value as needed */
        height: 20px; /* Adjust this value as needed */
        line-height: 20px; /* Adjust this value as needed */
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
