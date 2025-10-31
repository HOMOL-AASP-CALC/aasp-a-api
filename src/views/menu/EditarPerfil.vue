<template>
    <!-- Page content-->
    <section id="content" class="bg-secondary">
        <div class="container py-5 mt-4 mt-lg-5 mb-lg-4 my-xl-5">
            <div class="row pt-sm-2 pt-lg-0">

                <!-- Sidebar (offcanvas on sreens < 992px)-->
                <menu-lateral></menu-lateral>

                <!-- Page content-->
                <div class="col-lg-9 pt-4 pb-2 pb-sm-4">
                    <h1 class="h2 mb-4">Dados cadastrais</h1>

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
<!--                                    Form para apagar logotipo-->
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
                                                           name="exibir" v-model='member.exibir' :checked='member.exibir'>
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
                                                    <button class="btn btn-primary ms-sm-3" type="button" :disabled='enviandoLogotipo' @click='uploadImage'>Salvar</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <!-- fim add modal -->
                            </div>

                            <div class="d-flex align-items-center mt-sm-n1 pt-4 mt-3 mt-lg-3 mt-xl-5">
                                <i class="ai-user text-primary lead pe-1 me-2"></i>
                                <h2 class="h4 mb-0">Informações básicas</h2>
                            </div>
                            <div class="row g-3 g-sm-4 mt-0 mt-lg-1">
                                <div class="col-12 d-sm-flex align-items-center pt-sm-1 pt-md-1">
                                    <div class="form-label text-muted mb-2 mb-sm-0 me-sm-4">Tipo de cadastro:</div>
                                    <div class="form-check form-check-inline mb-0">
                                        <input class="form-check-input" type="radio" id='pf' v-model='tipo' value="pf" :checked="pf" >
                                        <label class="form-check-label" for="pf">Pessoa Física</label>
                                    </div>
                                    <div class="form-check form-check-inline mb-0">
                                        <input class="form-check-input" type="radio" id='pj' v-model='tipo' value="pj" :checked="pj">
                                        <label class="form-check-label" for="pj">Pessoa Jurídica</label>
                                    </div>
                                </div>

                                <div class="col-sm-6">
                                    <label class="form-label" for="email">Email / Login</label>
                                    <input class="form-control" type="email" v-model='perfil.email'>
                                    <span v-show="errosForm.email" style="color: red;font-size:12px; display: none;"><br>E-mail inválido</span>
                                    <span v-show="errosForm.emailExiste" style="color: red;font-size:12px;"><br>Este email já esta em uso</span>
                                </div>

                                <div class="col-sm-6">
                                    <label class="form-label" for="emailCobranca">Email de cobrança</label>
                                    <input class="form-control" id='emailCobranca' type="emailCobranca" v-model='perfil.email_cobranca'>
                                    <span v-show="errosForm.emailCobranca" style="color: red;font-size:12px; display: none;"><br>E-mail inválido</span>
                                </div>

                                <div class="col-sm-6">
                                    <label class="form-label" v-if='pf' for="nome">Nome</label>
                                    <label class="form-label" v-if='pj' for="nome">Contato</label>
                                    <input  class="form-control" type="text" v-model='perfil.nome'>
                                    <span v-show="errosForm.nome" style="color: red;font-size:12px;"><br>Campo inválido</span>
                                </div>

                                <!--                                if PJ-->
                                <div v-if='pj' class="col-sm-6">
                                    <label class="form-label" for="empresa">Empresa</label>
                                    <input class="form-control" type="text" v-model="perfil.razao">
                                    <span v-show="errosForm.razao" style="color: red;font-size:12px; display: none;"><br>Nome inválido</span>
                                </div>
                                <div v-if='pj' class="col-sm-6">
                                    <label class="form-label" for="cnpj">CNPJ</label>
                                    <input class="form-control" type="text" v-model='perfil.cnpj'>
                                    <span v-show="errosForm.cnpj" style="color: red;font-size:12px; display: none;"><br>CNPJ inválido</span>
                                </div>
                                <div v-if='pj' class="col-sm-6">
                                    <label class="form-label" for="insc_estadual">Inscrição Estadual</label>
                                    <input class="form-control" type="text" v-model='perfil.inscrest' id="insc_estadual">
                                </div>
                                <div v-if='pj' class="col-sm-6">
                                    <label class="form-label" for="insc_municipal">Inscrição Municipal</label>
                                    <input class="form-control" type="text" v-model='perfil.inscrmun'>
                                </div>

                                <div v-if='pf' class="col-sm-6">
                                    <label class="form-label" for="cpf">CPF</label>
                                    <input class="form-control" type="text" v-model='perfil.cpf'>
                                    <span v-show="errosForm.cpf" style="color: red;font-size:12px; display: none;"><br>CPF inválido</span>
                                </div>

                                <div class="col-sm-6">
                                    <label class="form-label" for="telefone">Telefone</label>
                                    <input class="form-control" type="tel" v-model='perfil.telefone'
                                           data-format="{&quot;numericOnly&quot;: true, &quot;delimiters&quot;: [&quot; &quot;, &quot; &quot;, &quot; &quot;], &quot;blocks&quot;: [2, 5, 4]}"
                                           placeholder="__ _____ ____">
                                    <span v-show="errosForm.telefone" style="color: red;font-size:12px; display: none;"><br>Telefone inválido</span>
                                </div>

                                <div class="col-sm-6">
                                    <label class="form-label" for="endereco">Endereço</label>
                                    <input class="form-control" type="text" v-model='perfil.endereco'>
                                    <span v-show="errosForm.endereco" style="color: red;font-size:12px; display: none;"><br>Endereço inválido</span>
                                </div>

                                <div class="col-sm-6">
                                    <label class="form-label" for="no">Número</label>
                                    <input class="form-control" type="text" v-model='perfil.no'>
                                    <span v-show="errosForm.no" style="color: red;font-size:12px; display: none;"><br>Número inválido</span>
                                </div>

                                <div class="col-sm-6">
                                    <label class="form-label" for="complemento">Complemento</label>
                                    <input class="form-control" type="text" v-model='perfil.complemento'>
                                    <span v-show="errosForm.complemento" style="color: red;font-size:12px; display: none;"><br>Complemento inválido</span>
                                </div>

                                <div class="col-sm-6">
                                    <label class="form-label" for="bairro">Bairro</label>
                                    <input class="form-control" type="text" v-model='perfil.bairro'>
                                    <span v-show="errosForm.bairro" style="color: red;font-size:12px; display: none;"><br>Bairro inválido</span>
                                </div>

                                <div class="col-sm-6">
                                    <label class="form-label" for="cidade">Cidade</label>
                                    <input class="form-control" type="text" v-model='perfil.cidade'>
                                    <span v-show="errosForm.cidade" style="color: red;font-size:12px; display: none;"><br>Cidade inválida</span>
                                </div>

                                <div class="col-sm-6">
                                    <label class="form-label" for="country">Estado</label>
                                    <select class="form-select" v-model="perfil.estado">
                                        <option v-for="(estado, uf) in estados" :key="uf" :value="uf" :selected="uf === perfil.estado">{{estado}}</option>
                                    </select>
                                    <span v-show="errosForm.estado" style="color: red;font-size:12px; display: none;"><br>Estado inválido</span>
                                </div>

                                <div class="col-sm-6">
                                    <label class="form-label" for="cep">CEP</label>
                                    <input class="form-control" type="text" v-model='perfil.cep'>
                                    <span v-show="errosForm.cep" style="color: red;font-size:12px; display: none;"><br>CEP inválido</span>
                                </div>

                                <div id="resposta1" class="alert alert-success d-flex mb-4 d-none">
                                    <i class="ai-triangle-alert fs-xl me-2"></i>
                                    <p class="mb-0">Perfil alterado com sucesso!
                                        <a href='/public' class='alert-link'>Menu</a>
                                    </p>
                                </div>

                                <div id="btn_form" class="col-12 d-flex justify-content-end pt-3">
                                    <RouterLink class="btn btn-secondary" to='/menu/perfil-geral'>Cancel</RouterLink>
                                    <button @click='salvaDados' class="btn btn-primary ms-3" type="button">Alterar meus dados</button>
                                </div>

                                <div v-show='enviado' class="alert alert-primary alert-dismissible fade show" role="alert">
                                    <span class="fw-semibold">Sucesso:</span> Seus dados foram alterados.
                                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                </div>
                            </div>
                        </div>

                    </section>
                </div>
            </div>
        </div>
    </section>
</template>

<script>

import MenuLateral from '@/components/MenuLateral.vue'
import { computed, onMounted, reactive, ref } from 'vue'
import estadosJson from '../../services/estados.json'
import useValidaCpfCnpj from '../../services/validaCpfCnpj'
import axios from 'axios'
import { useRouter } from 'vue-router'

export default {
    name: 'EditarPerfil',
    components: {
        MenuLateral,
    },
    setup(){
        const member = reactive({
            altura: 150,
            largura: 150,
            coverImage: '',
            exibir: true
        })

        let logotipoID = ref('')
        const modalLogotipoClose = ref(null)
        const enviandoLogotipo = ref(false)

        const router = useRouter();

        const debitUrl = import.meta.env.VITE_DEBIT_URL
        const debitLegacyUrl = import.meta.env.VITE_DEBIT_LEGACY_URL

        let tipo = ref('pf')
        const perfil = reactive({})

        let enviado = ref(false)
        const permiteUpload = ref(false)

        const estados = estadosJson

        const pf = computed(() => {
            return tipo.value === 'pf'
        })

        const pj = computed(() => {
            return tipo.value === 'pj'
        })

        let errUpload = ref(false)

        const pega_dados = async () => {
            try {
                console.log('chamada api')
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/menu/dadosPerfil`, {withCredentials: true })
                const cadastro = response.data.cadastro[0]
                const logotipo = response.data.logotipo[0]
                console.log(logotipo)

                if(cadastro.cnpj && cadastro.razao){
                    tipo.value = 'pj'
                    cadastro.tipoCadastro = 'pj'
                } else {
                    tipo.value = 'pf'
                    cadastro.tipoCadastro = 'pf'
                }

                Object.assign(perfil, cadastro)

                if(logotipo) {
                    Object.assign(member, {
                        coverImage: debitLegacyUrl+'/menu/logoimg.php?id='+logotipo.logotipo_imp,
                        exibir: logotipo.exibir_logotipo_imp ?? true
                    })
                    logotipoID.value = logotipo.logotipo_imp
                }
            } catch (error) {
                console.log(error);
            }
        }

        onMounted(() => {
            pega_dados()
        })

        const salvaDados = async () => {
            const resultValidacao = validarFormulario()
            if (!resultValidacao) {
                return
            }

            perfil.tipoCadastro = tipo.value

            console.log('enviando...')
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/menu/alterarPerfil`,
                    perfil,
                    { withCredentials: true }
                )
                const data = response.data

                if (data.success === 1) {
                    enviado.value = true
                    console.log('sucesso')
                    //redirecionar para pagina perfil-geral depois de 1 segundo usando vue router
                    await setTimeout(() => {
                        console.log('redirecionando...')
                        router.push('/menu/perfil-geral')
                    }, 500)
                }else{
                    console.log('erro')
                    errosForm.emailExiste = true
                }

            } catch (error) {
                console.log(error);
            }
        }

        let errosForm = reactive({
            nome: false,
            email: false,
            emailCobranca: false,
            emailExiste: false,
            cpf: false,
            telefone: false,
            endereco: false,
            complemento: false,
            bairro: false,
            cidade: false,
            estado: false,
            cep: false,
            razao: false,
            cnpj: false,
        })

        function validarFormulario(){
            Object.keys(errosForm).forEach((key) => {
                Object.assign(errosForm, { [key]: false })
            })

            if(tipo.value === 'pf'){
                if (!perfil.nome) { errosForm.nome = true }
                //regex to validate perfil.cpf format cpf
                // if(!perfil.cpf.match(/^(\d{3}\.?\d{3}\.?\d{3}\-?\d{2})$/)) { errosForm.cpf = true }
                if(!useValidaCpfCnpj(perfil.cpf)) { errosForm.cpf = true }
            }
            if(tipo.value === 'pj'){
                if (!perfil.nome) { errosForm.nome = true }
                //regex to validate perfil.cnpj format cnpj
                if(!perfil.cnpj.match(/^(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})$/)) { errosForm.cnpj = true }
                if (!perfil.razao) { errosForm.razao = true }
            }

            if (!perfil.email) { errosForm.email = true }
            //regex to validate perfil.email format email
            if(!perfil.email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) { errosForm.email = true }

            if(perfil.email_cobranca) {
                if (!perfil.email_cobranca.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)) {
                    errosForm.emailCobranca = true
                }
            }

            if (perfil.telefone.length < 8) { errosForm.telefone = true }
            if (!perfil.endereco) { errosForm.endereco = true }
            if (!perfil.no) { errosForm.no = true }
            if (!perfil.bairro) { errosForm.bairro = true }
            if (!perfil.cidade) { errosForm.cidade = true }
            if (!perfil.estado) { errosForm.estado = true }
            //regex to validate perfil.cep format cep
            if(!perfil.cep.match(/^[0-9]{5}[-]?[0-9]{3}$/)) { errosForm.cep = true }

            return !Object.values(errosForm).includes(true);
        }

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
            enviandoLogotipo.value = true

            try {
                let res = await axios.post(`${import.meta.env.VITE_API_URL}/menu/uploadLogo`,
                    { exibir: member.exibir, image: member.coverImage },
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
            enviandoLogotipo.value = false
        }

        return {
            perfil,
            estados,
            pf,
            pj,
            salvaDados,
            errosForm,
            enviado,
            permiteUpload,
            debitUrl,
            debitLegacyUrl,
            member,
            tipo,
            logotipoID,
            handleImage,
            uploadImage,
            createBase64Image,
            modalLogotipoClose,
            enviandoLogotipo,
            urlApi: import.meta.env.VITE_API_URL,
            errUpload
        }
    }
}
</script>

<style scoped>
    @import '@/assets/css/debit.css';
    @import '@/assets/css/icones.css';
</style>
