<script setup>
import { onMounted } from "vue"
import axios from "axios"
import { useRoute } from "vue-router";
const route = useRoute();

const servidorAPI = import.meta.env.VITE_API_URL;
import TabelaIndiceAluguel from "@/components/tabelaIndiceAluguel.vue"

</script>

<template>
    <div class="tagPrincipal">
        <section id="content" class="bg-secondary">
            <section class="bg-secondary py-5">
                <div class="container pt-5 pb-lg-1 pb-xl-2 py-xxl-3">
                    <h1 class="h2 mb-2 mh2">
                        Calculadora para reajuste de aluguéis e tabelas
                    </h1>
                </div>
            </section>

            <section class="container white-mode">
                <div class="row row-cols-1 row-cols-sm-1 row-cols-md-1 row-cols-xl-2 g-4 pb-2 pb-sm-4 pb-lg-5">

                    <!-- Tabelas -->
                    <TabelaIndiceAluguel tabela="igp" titulo="IGP-DI (FGV)" />
                    <TabelaIndiceAluguel tabela="igpm" titulo="IGP-M (FGV)" />
                    <TabelaIndiceAluguel tabela="ivar" titulo="IVAR (FGV)" />
                    <TabelaIndiceAluguel tabela="inpc" titulo="INPC (IBGE)" />
                    <TabelaIndiceAluguel tabela="ipca" titulo="IPCA (IBGE)" />
                    <TabelaIndiceAluguel tabela="ipc_fipe" titulo="IPC (FIPE)" />
                    <TabelaIndiceAluguel tabela="ipc_fgv" titulo="IPC-DI (FGV)" />
                    <TabelaIndiceAluguel tabela="ipca_e" titulo="IPCA-E (IBGE)" />

                </div>
            </section>
        </section>
    </div>
</template>

<style scoped>
.tagPrincipal {
    background-color: #f6f9fc;
}

.mh2 {
    font-family: "Inter", sans-serif !important;
    margin-top: 30px;
}

.mh5 {
    font-family: "Inter", sans-serif !important;
    font-size: 18px !important;
    font-weight: 600;
}

.mtabela td {
    font-family: "Inter", sans-serif !important;
    font-size: 14px !important;
    color: #000;
}

.mtabela th {
    font-weight: 600;
    font-size: 16px !important;
}
</style>