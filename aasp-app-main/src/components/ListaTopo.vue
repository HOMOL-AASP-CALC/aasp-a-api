<script setup lang="ts">

</script>

<template>
    <div class="card-body pb-0 ">
        <div class="d-flex align-items-center mt-sm-n1 pb-0 mb-0 mb-lg-1 mb-xl-2">
                            <span class='lista_calculo_icone_grande' :style="{'background-color': corIcone}">
                                <span :class="['icon', iconeApp]"></span>
                            </span>
            <h2 ref='tituloLista' class="h4 mb-0">{{ strTipo }}</h2>
            <span class="ms-auto"></span>

            <div v-if='!store.planoAtivo' class="ms-auto ms-n1 me-2">
                <div class="flex d-inline-flex justify-content-end pb-1">
                    <a :href="url+'/precos'" class="btn btn-sm btn-outline-primary">
                        Assine já
                    </a>
                </div>
            </div>

            <div v-if="temPermissao(tipo, 'ver_calc')" class="ms-auto ms-n1 me-2">
                <div class="d-flex align-items-center justify-content-end pb-1 search-wrapper">

                                    <span v-if=programaDel class='px-1'>
                                        <button v-if='lixo === false && selecionados.size > 0' class="btn btn-sm btn-outline-danger me-2" id="click_del" @click="deletarSelecionados()"><i class="ai-trash px-1"></i>DELETAR - {{selecionados.size}}</button>
                                        <button v-else-if='lixo === true && selecionados.size > 0' class="btn btn-sm btn-outline-danger me-2" @click="deletarSelecionados()"><i class="material-icons px-1"></i>RECUPERAR ITEM - {{selecionados.size}}</button>
                                    </span>
                    <div v-if="(usuarioLogado && !multiLiberado)" class='px-1'>
                        <router-link to='/menu/suporte-lista' class="btn btn-sm btn-primary me-2">
                            Usuario bloqueado, entre em contato com o Suporte.
                        </router-link>
                    </div>
                    <div v-else-if="tipo==='indices'" class='px-1'>
                        <div class="btn-group dropdown">
                            <button type="button" class="btn btn-sm btn-primary me-2 dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="ai-plus px-1"></i>NOVO ÍNDICE
                            </button>
                            <div class="dropdown-menu dropdown-menu-end my-1">
                                <a :href="urlCalculadoras+'/mescladoEdit?id=0'" class="dropdown-item">Índice mesclado</a>
                                <a :href="urlApp+'/indice-personalizado'" class="dropdown-item">Índice personalizado</a>
                                <a :href="urlLegacy+'/indices/media_edit10.php'" class="dropdown-item">Média de índices</a>
                            </div>
                        </div>
                    </div>
                    <span v-else-if='showBusca === false' class='px-1'>
                                        <template v-if="(tipo === 'atual')">
                                            <button v-if='endpointAtua != "0"'
                                                    @click="redirectEndpointAtualiza()" class="btn btn-sm btn-primary me-2" id="click_novo">
                                                <i class="ai-plus px-1"></i> {{ textoNovoCalc }}
                                            </button>
                                            <template v-else>
<!--                                                <a :href=linkNovoCalc class="btn btn-sm btn-primary me-2" id="click_novo">-->
                                                <!--                                                    <i class="ai-plus px 1 me-2"></i>VERSÃO ANTIGA-->
                                                <!--                                                </a>-->
                                                <a :href='urlAtua + "/?id=0"' class="btn btn-sm btn-primary me-2" id="click_novo">
                                                    <i class="ai-plus px 1 me-2"></i>Novo Cálculo
                                                </a>
                                            </template>

                                        </template>
                                        <a v-else :href=linkNovoCalc class="btn btn-sm btn-primary me-2" id="click_novo">
                                            <i class="ai-plus px-1"></i> {{ textoNovoCalc }}
                                        </a>
                                    </span>

                    <input type=hidden name='tipo' value="{{tipo}}">

                    <input type="text" class="form-control small-2 me-2" v-show="showBusca"
                           v-model="busca" placeholder="Buscar" name="busca"
                           @keyup="debouncedPegarCalculos"/>
                    <font-awesome-icon v-if="!lixo && !showBusca" @click="toggleBusca()" icon="search"  class='me-2' style='font-size: 22px;   cursor: pointer;'/>

                    <font-awesome-icon v-if="!lixo && showBusca" @click="toggleBusca()" icon="xmark"  class="me-2 limpar-busca-icon" style='font-size: 22px;   cursor: pointer;'/>

                    <font-awesome-icon v-if="!lixo && !showBusca" @click="toggleLixo()" icon="trash"  class='me-2' style='font-size: 22px;   cursor: pointer;'/>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>