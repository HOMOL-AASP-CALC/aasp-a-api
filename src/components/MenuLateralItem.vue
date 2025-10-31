<template>
    <router-link :to="to" :icone="icone" class="nav-link fw-semibold py-2 px-0">
        <i :class='icone' class="fs-5 opacity-60 me-2"></i>
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
