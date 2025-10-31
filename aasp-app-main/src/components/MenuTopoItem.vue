<template>
    <router-link :to="to" :icone="icone" class='dropdown-item'>
        <i :class='icone' class="fs-lg opacity-70 me-2"></i>
        <slot />
    </router-link>
</template>

<script>
export default {
    props: {
        to: {
            type: String,
            default: '/',
        },
        icone: {
            type: String,
            default: '',
        },
    },
    name: "SidebarItem",
}
</script>
