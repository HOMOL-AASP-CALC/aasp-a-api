<script setup lang="ts">

import axios from 'axios'
import { onMounted, ref } from 'vue'
import { usePerfilStore } from '@/stores/PerfilStore'
// import MenuLateral from '@/components/MenuLateral.vue'

const tipoStatus = []
tipoStatus[1] = "Pedente com a Debit";
tipoStatus[2] = "Pedente com o cliente";
tipoStatus[3] = "Finalizado";
tipoStatus[4] = "Pedente com a Debit";
tipoStatus[5] = "Pedente com a Debit";
tipoStatus[10] = "Sugestão";

const urlAPI = import.meta.env.VITE_API_URL
const urlDebit = import.meta.env.VITE_DEBIT_URL
const chamados = ref([])

const finalizar = ref('n')
const texto = ref('')

const chamadoSelecionado = ref({})
const historicoSelecionado = ref({})

const perfilStore = usePerfilStore()

onMounted(async () => {
    const resp = await listarChamados()
    chamados.value = resp.chamados

    console.log('chamados preenchidos: ', chamados.value)

    const logadoAASP = ref(false)

    perfilStore.getPerfil()
    logadoAASP.value = !!perfilStore.logadoSSO

    console.log('logadoAASP: ', logadoAASP.value)

    async function listarChamados() {
        console.log('listarChamados')
        const resp = await axios.get(
            `${urlAPI}/menu/suporte/lista`,
            {
                withCredentials: true
            }
        )
        return resp.data
    }
})

async function selecionaChamado(id: number) {
    console.log('selecionaChamado: ', id)
    const resp = await pegarChamado(id)
    console.log(resp)
    chamadoSelecionado.value = resp.chamado[0]
    console.log('chamadoSelecionado: ', chamadoSelecionado.value)
    historicoSelecionado.value = resp.historico.sort((a: number, b: number) => {
        if (a.dia < b.dia) {
            return 1
        }
        if (a.dia > b.dia) {
            return -1
        }
        return 0
    })
}

async function pegarChamado(id: number) {
    console.log('pegarChamado')
    const resp = await axios.get(
        `${urlAPI}/menu/suporte/${id}`,
        {
            withCredentials: true
        }
    )
    return resp.data
}

async function enviarMensagem() {
    console.log('enviarMensagem')
    const resp = await axios.post(
        `${urlAPI}/menu/suporte/${chamadoSelecionado.value.id}`,
        {
            texto: texto.value,
            finalizar: finalizar.value
        },
        {
            withCredentials: true
        }
    )
    if(resp.data.success === 1) {
        await selecionaChamado(chamadoSelecionado.value.id)
        texto.value = ''
        finalizar.value = 'n'
    }
}

var url = 'https://wati-integration-prod-service.clare.ai/v2/watiWidget.js?16485';
var s = document.createElement('script');
s.type = 'text/javascript';
s.async = true;
s.src = url;
var options = {
    "enabled":true,
    "chatButtonSetting":{
        "backgroundColor":"#00e785",
        "ctaText":"Posso ajudar?",
        "borderRadius":"25",
        "marginLeft": "0",
        "marginRight": "20",
        "marginBottom": "20",
        "ctaIconWATI":false,
        "position":"right"
    },
    "brandSetting":{
        "brandName":"Debit",
        "brandSubTitle":"undefined",
        "brandImg":"https://www.debit.com.br/favicon.ico",
        "welcomeText":"Como podemos ajuda-lo?",
        "messageText":"Olá, %0AEu tenho uma duvida sobre...%0A{{page_link}}",
        "backgroundColor":"#00e785",
        "ctaText":"Fale Conosco",
        "borderRadius":"25",
        "autoShow":false,
        "phoneNumber":"5511982816811"
    }
};
s.onload = function() {
    CreateWhatsappChatWidget(options);
};
var x = document.getElementsByTagName('script')[0];
x.parentNode.insertBefore(s, x);

    (function(w,d,u){
        var s=d.createElement('script');s.async=true;s.src=u+'?'+(Date.now()/60000|0);
        var h=d.getElementsByTagName('script')[0];h.parentNode.insertBefore(s,h);
    })(window,document,'https://cdn.bitrix24.com.br/b27875433/crm/site_button/loader_1_k9wa0c.js');
</script>

<template>
    <!-- Page content-->
    <section id='content' class='bg-secondary'>
        <div class='container py-5 mt-4 mt-lg-5 my-xl-5'>
            <div class='row pt-sm-2 pt-lg-0'>
                <div class="col-lg-12 pt-4 pb-2 pb-sm-4">
                    <div class="d-flex align-items-center mt-sm-n1 pb-4 mb-0 mb-lg-1 mb-xl-3">
                        <h1 class="h2 mb-4">Suporte</h1>
                        <a class="btn btn-sm btn-success ms-auto" :href="urlDebit+'/fale-conosco'">ABRIR UM SUPORTE</a>
                    </div>

                    <div class="row position-relative overflow-hidden gx-2 zindex-1">
                        <template v-if=chamados >
                            <!-- Contacts list-->
                            <div class="col-xl-4" style="min-height: 400px">
                                <div class="offcanvas-xl offcanvas-start position-absolute position-xl-relative h-100 bg-light rounded-5 border border-xl-0" id="contactsList" data-bs-scroll="true"
                                     data-bs-backdrop="false">
                                    <div class="rounded-5 overflow-hidden">
                                        <div class="card-header w-100 border-0 px-4 pt-4 pb-3">
                                            <div class="d-flex d-xl-none justify-content-end mt-n2 mb-2">
                                                <button class="btn btn-outline-secondary border-0 px-3 me-n2" type="button" data-bs-dismiss="offcanvas" data-bs-target=" #contactsList"><i
                                                    class="ai-cross me-2"></i>Fechar
                                                </button>
                                            </div>
                                            <div class="position-relative">
                                                <h6 class=" fw-medium text-muted text-uppercase pb-1 mb-2">Chamados</h6>
                                            </div>
                                        </div>
                                        <div class="card-body px-0 pb-4 pb-xl-0 pt-1" data-simplebar style="max-height: 700px;">
                                            <div v-for='chamado in chamados' :key='chamado.id'
                                                 role='button'
                                                 style='cursor: pointer;'
                                                 @click='selecionaChamado(chamado.id)'
                                                 class="chamadoSelect d-flex align-items-center text-decoration-none px-4 py-3">
                                                <div class="d-flex justify-content-between w-100 ps-2 ms-1 my-1">
                                                    <div class="me-3">
                                                        <div class="h6 mb-1">
                                                            {{chamado.titulo}}
                                                        </div>
                                                        <p v-if='tipoStatus[chamado.status] == "Finalizado"' class="text-body fs-sm mb-0">Finalizado</p>
                                                        <p v-else class='text-body fs-sm mb-0'>Previsão para:
                                                            {{ chamado.previsao.replace(/(\d{4})(\d{2})(\d{2})/, "$3/$2/$1") }}
                                                        </p>
                                                    </div>
                                                    <div class="text-end">
                                                        <span class="d-block fs-xs text-muted">
                                                            {{ chamado.criado.substring(0,8).replace(/(\d{4})(\d{2})(\d{2})/, "$3/$2/$1") }}
                                                        </span>
                                                        <span v-if='tipoStatus[chamado.status] != "Finalizado"' class="badge bg-danger fs-xs lh-1 py-1 px-2">!</span>
                                                        <span v-else class="badge bg-danger fs-xs lh-1 py-1 px-2"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Chat window-->

                            <div class="col-xl-8">
                                <div class="card h-100 border-0">
                                    <!-- Hader-->
                                    <div class="navbar card-header w-100 mx-0 px-4">
                                        <div class="position-relative flex-shrink-0 mb-3">
                                            {{ tipoStatus[chamadoSelecionado.status] }}
                                        </div>
                                        <div class="d-flex align-items-center w-100 px-sm-3">
                                            <button class="navbar-toggler d-xl-none me-3 me-sm-4" type="button" data-bs-toggle="offcanvas" data-bs-target="#contactsList" aria-controls="contactsList"
                                                    aria-label="Toggle contacts list">
                                                <span class="navbar-toggler-icon"></span>
                                            </button>
                                            <div class="position-relative flex-shrink-0">
                                                SUPORTE #{{ chamadoSelecionado.id }}
                                            </div>
                                            <div class="h6 ps-2 ms-1 mb-0">
                                                {{chamadoSelecionado.titulo}}
                                            </div>
                                        </div>

                                    </div>
                                    <!-- Body-->
                                    <div v-if='historicoSelecionado' class="card-body pb-0 pt-4" data-simplebar style="">

                                        <!-- Message-->
                                        <div v-for='msg in historicoSelecionado' :key=msg.id class="mb-3" style="">
                                            <div class="d-flex align-items-end mb-2">
                                                <div class="flex-shrink-0 pe-2 me-1">
                                                    <p class="rounded-circle" width="48" alt="Avatar">
                                                        {{ msg.autor ? '' : 'Equipe Debit' }}
                                                    </p>
                                                </div>
                                                <div :class="msg.autor < 1 ? 'message-box-start text-dark':'message-box-end bg-primary text-white'">
                                                    {{ msg.texto.replace('\n', '<br>') }}
                                                </div>
                                            </div>
                                            <div class="fs-xs text-muted text-end">
                                                {{ msg.dia.substring(0,8).replace(/(\d{4})(\d{2})(\d{2})/, "$3/$2/$1")}}
                                                <br>
                                                {{ msg.dia.substring(8,12).replace(/(\d{2})(\d{2})/, "$1:$2") }}

                                            </div>
                                        </div>
                                    </div>
                                    <!-- Footer (Textarea)-->
                                    <div v-if='chamadoSelecionado' class="bg-white card-footer w-100 border-0 mx-0 px-4">
                                        <div class="nav flex-nowrap align-items-center">
                                            <div class="col-12 d-sm-flex align-items-center pt-sm-2 pt-md-3">
                                                <div class="form-label text-muted mb-2 mb-sm-0 me-sm-4">Finalizar:</div>
                                                <div class="form-check form-check-inline mb-0">
                                                    <input v-model=finalizar class="form-check-input" type="radio" name="finalizar" value="s">
                                                    <label class="form-check-label" for="female">Sim</label>
                                                </div>
                                                <div class="form-check form-check-inline mb-0">
                                                    <input v-model=finalizar class="form-check-input" type="radio" name="finalizar" value="n" checked>
                                                    <label class="form-check-label" for="other">Não</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="d-flex align-items-end border rounded-3 pb-3 pe-3 mx-sm-3">
                                            <textarea v-model=texto id="texto" class="form-control border-0" rows="3" placeholder="Type a message" style="resize: none;"></textarea>

                                            <div class="nav flex-nowrap align-items-center">

                                                <button class="mdl-button mdl-js-button mdl-js-ripple-effect btn_outros" style="text-align: center; display:none;" id="btn_loading"><img
                                                    src="/images/loading.gif" width="20px"> &nbsp;ENVIANDO MENSAGEM...
                                                </button>
                                                <button @click=enviarMensagem class="btn btn-sm btn-secondary ms-3" type="button" id="enviar10">Enviar</button>
                                            </div>

                                            <input type=hidden id='id_protocolo' :value='chamadoSelecionado.id'>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <!-- Page content-->
                        <div v-else class="col col-12 col-lg-12 col-xl-12 pt-4 pb-2 pb-sm-4">
                            <!-- Basic info-->
                            <section class="card border-0 py-1 p-md-2 p-xl-3 p-xxl-4 mb-4">
                                <div class="card-body">
                                    <div class="d-flex align-items-center mt-sm-n1 pb-4 mb-0 mb-lg-1 mb-xl-3"><i class="ai-circle-alert text-primary lead pe-1 me-2"></i>
                                        <h2 class="h4 mb-0">Não existem chamados abertos.</h2>
                                    </div>
                                    <div class='card-body'>
                                        <div class='tab-content d-flex justify-content-start flex-wrap'>
                                            Se deseja entrar em contato conosco, por favor
                                            <a :href="urlAPI+'/fale-conosco'" class="mx-1"> abra um chamado.</a>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
    @import "@/assets/css/debit.css";
    .chamadoSelect:hover {
        background-color: #f0f0f0;
    }
</style>
