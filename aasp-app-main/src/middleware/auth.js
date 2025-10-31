export default defineNuxtRouteMiddleware((to, from) => {
    console.log("Acessando o admin auth middleware");
    console.log(to);
})