<script setup lang='ts'>
import {reactive, ref } from 'vue'
import axios from 'axios'

const member = reactive({
    altura: 150,
    largura: 150,
    coverImage: '',
})

let logotipoID = ref('')
const modalLogotipoClose = ref(null)

const debitUrl = import.meta.env.VITE_DEBIT_URL
const debitLegacyUrl = import.meta.env.VITE_DEBIT_LEGACY_URL
const urlApi = import.meta.env.VITE_API_URL

let tipo = ref('pf')
const perfil = reactive({})

let enviado = ref(false)
const permiteUpload = ref(false)

let errUpload = ref(false)

const pega_dados = async () => {
    try {
        console.log('chamada api')
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/menu/dadosPerfil`, {withCredentials: true })
        const cadastro = response.data.cadastro[0]
        const logotipo = response.data.logotipo[0]
        console.log(logotipo)

        Object.assign(perfil, cadastro)

        if(logotipo) {
            Object.assign(member, {
                coverImage: debitLegacyUrl+'/menu/logoimg.php?id='+logotipo.logotipo_imp,
                exibir: logotipo.exibir_logotipo_imp
            })
            logotipoID.value = logotipo.logotipo_imp
        }
    } catch (error) {
        console.log(error);
    }
}

pega_dados()

function handleImage(e) {
    const selectedImage = e.target.files[0]
    createBase64Image(selectedImage)
}
function createBase64Image(file) {
    const reader = new FileReader()
    reader.onload = (e) => {
        member.coverImage = e.target.result
        // uploadImage()
    }
    reader.readAsDataURL(file)
}

const handleErrorResponse = (error) => {
    let errorResponse;
    if(error.response && error.response.data) {
        // I expect the API to handle error responses in valid format
        errorResponse = error.response.data;
        // JSON stringify if you need the json and use it later
    } else if(error.request) {
        // TO Handle the default error response for Network failure or 404 etc.,
        errorResponse = error.request.message || error.request.statusText;
    } else {
        errorResponse = error.message;
    }
    throw new Error(errorResponse);
}
async function uploadImage() {
    errUpload.value = false

    const image = member.coverImage
    try {
        let res = await axios.post(`${import.meta.env.VITE_API_URL}/menu/uploadLogo`,
            { 'image': image },
            {
                withCredentials: true
            }
        )
        if(res) {
            modalLogotipoClose.value.click()
        }
    } catch (err) {
        errUpload.value = true
        handleErrorResponse(err)
    }
}

</script>

<template>
    <!-- Page content-->
    <section id="content" class="bg-secondary" style='min-height: 900px'>
        <div class="container py-5 mt-4 mt-lg-5 mb-lg-4 my-xl-5">
            <div class="row pt-sm-2 pt-lg-0">

                <!-- Page content-->
                <div class="col-lg-12 pt-4 pb-2 pb-sm-4">
<!--                    <h1 class="h2 mb-4">Dados cadastrais</h1>-->

                    <!-- Basic info-->
                    <section class="card border-0 py-1 p-md-2 p-xl-3 p-xxl-4 mb-4">
                        <div class="card-body">
                            <div class="d-flex align-items-center mt-sm-n1 pb-4 mb-0 mb-lg-1 mb-xl-2"><i class="ai-image text-primary lead pe-1 me-2"></i>
                                <h2 class="h4 mb-0">Logotipo</h2>
                            </div>
                            <p class="fs-sm text-muted mb-2 mt-0">Configure seu logotipo para impressão.</p>
                            <div class="d-flex align-items-center">
                                <div class="dropdown" >
                                    <a class="logoPerfil d-flex flex-column justify-content-end position-relative overflow-hidden rounded-circle bg-position-center flex-shrink-0"
                                       href="#"
                                       data-bs-toggle="dropdown" aria-expanded="false"
                                       :style="{ backgroundImage: `url(${member.coverImage})` }"
                                       style="width: 80px; height: 80px; background-size: cover;"
                                    >

                                        <span class="d-block text-light text-center lh-1 pb-1" style="background-color: rgba(0,0,0,.5)"><i class="ai-camera"></i></span>
                                    </a>
                                    <div class="dropdown-menu my-1">
                                        <!-- Call Add Modal-->
                                        <a class="dropdown-item fw-normal" href="#addCard" data-bs-toggle="modal">
                                            <i class="ai-camera fs-base opacity-70 me-2"></i>Alterar logotipo
                                        </a>
                                        <form :action="debitLegacyUrl+'/menu/logotipo_app.php?rm=1'" method="POST" class="modal-body needs-validation pt-0" novalidate>
                                            <input type='hidden' name='imgID' :value='logotipoID'>
                                            <button class="dropdown-item text-danger fw-normal" type='submit'><i class="ai-trash fs-base me-2"></i>Apagar logotipo</button>
                                        </form>
                                    </div>
                                </div>
                                <div class="ps-3">
                                    <a class="h5 mb-2 dropdown-item fw-normal" href="#addCard" data-bs-toggle="modal">
                                        <i class="ai-camera fs-base opacity-70 me-2"></i>Alterar
                                    </a>
                                    <form v-if='logotipoID' :action="debitLegacyUrl+'/menu/logotipo_app.php?rm=1'" method="POST" class="h5 mb-0 modal-body needs-validation pt-0" novalidate>
                                        <input type='hidden' name='imgID' :value='logotipoID'>
                                        <button class="dropdown-item text-danger fw-normal" type='submit'><i class="ai-trash fs-base me-2"></i>Apagar</button>
                                    </form>
                                </div>
                                <!-- inicio add modal-->
                                <div class="modal fade" id="addCard" data-bs-backdrop="static" tabindex="-1" role="dialog">
                                    <div class="modal-dialog modal-dialog-centered" role="document">
                                        <div class="modal-content">
                                            <div class="modal-header border-0">
                                                <h4 class="modal-title">Logotipo</h4>
                                                <button ref='modalLogotipoClose' class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                                            </div>
                                            <form enctype="multipart/form-data" :action="urlApi+'/menu/uploadLogo'" method="POST" class="modal-body needs-validation pt-0" novalidate>

                                                <div class="form-check form-switch d-flex pb-md-2 mb-4">
                                                    <input class="form-check-input flex-shrink-0" type="checkbox"
                                                           name="exibe_logo" :checked='member.exibir'>
                                                    <input type='hidden' name='dono' :value='perfil.id'>
                                                    <input type='hidden' name='imgID' :value='logotipoID'>
                                                    <label class="form-check-label ps-3 ps-sm-4" for="product-sold">
                                                        <span class="h6 d-block mb-2">Impressão</span>
                                                        <span class="fs-sm text-muted">Deseja exibir o logotipo na impressão?</span>
                                                    </label>
                                                </div>

                                                <div class="mb-4" >
                                                    <label class="form-label" for="card-name"></label>
                                                    <div class="d-flex align-items-center">
                                                        <p class="d-inline-block flex-shrink-0 bg-secondary rounded-2 p-md-4 p-lg-5"
                                                           style="width: 400px; height: 200px; background-size: cover;"
                                                           :style="{ backgroundImage: `url(${member.coverImage})` }"
                                                        >
                                                        </p>
                                                    </div>
                                                </div>
                                                <div class="row row-cols-2 g-4 pb-2 pb-sm-3 mb-4">
                                                    <div class="col col-12">
                                                        <span v-if='!permiteUpload'>
                                                            <button @click='permiteUpload=true' class="btn btn-sm btn-outline-primary w-100 w-md-auto">Trocar logotipo</button>
                                                        </span>
                                                        <span v-else>
                                                            <label class="form-label" for="card-expiration">Envie o arquivo de seu logotipo (somente JPG, PNG ou GIF)</label>
    <!--                                                        <input class="form-control" type="file" accept='image/gif,image/png,image/jpg,image/jpeg' name="arquivo" >-->
                                                            <input @change="handleImage" class="form-control" type="file" accept='image/gif,image/png,image/jpg,image/jpeg' name="arq" >

                                                        </span>
                                                        <p v-if='errUpload===true' class="alert text-danger mt-1" role="alert">
                                                          A imagem não pode ter mais que 500kb.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div class="d-flex flex-column flex-sm-row">
                                                    <button class="btn btn-secondary mb-3 mb-sm-0" type="reset" data-bs-dismiss="modal">Cancelar</button>
                                                    <button class="btn btn-primary ms-sm-3" type="button" @click='uploadImage'>Salvar</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <!-- fim add modal -->
                            </div>
                        </div>

                    </section>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
    @import '@/assets/css/debit.css';
    @import '@/assets/css/icones.css';
</style>
