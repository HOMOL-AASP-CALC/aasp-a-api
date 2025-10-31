<script setup lang="ts">

import PaginacaoLista from "@/components/PaginacaoLista.vue";
</script>

<template>
    <div class="card-body">
        <div class="tab-content">
            <div v-if="temPermissao(tipo, 'ver_calc')" class="tab-pane fade show active">
                <div v-show=lixo>
                    <p class="h4  mb-2 col-4" style='color: indianred'>
                        <font-awesome-icon icon="undo" @click="toggleLixo()" class='mx-1' style='font-size: 22px; cursor: pointer;'/>
                        Lixeira
                    </p>
                    <hr class=mb-5>
                </div>
                <!-- Primary alert with additional content -->
                <div v-if=calculos.length class="table-responsive mb-3">
                    <table class="table table-hover">
                        <thead>
                        <tr>
                            <th></th>
                            <th>Protocolo</th>
                            <th>Nome</th>
                            <th class="data-hora">Data e hora</th>
                            <th>Login</th>
                            <th>Op&ccedil;&otilde;es</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="item in calculosFiltrados"
                            :key="item.id">
                            <td>
                                <div style="height:100%;width:100%;">
                                    <input v-show="permiteExcluir" type="checkbox" @click="toggleSelecao(item)" class='form-check-input'/>
                                </div>
                            </td>
                            <td>
                                <a :href="item.ed">
                                    <div style="height:100%;width:100%">
                                        {{ item.id }}
                                    </div>
                                </a>
                            </td>
                            <td>
                                <a v-if=!item.edit :href="item.ed">
                                    <div style="height:100%;width:100%">
                                        <font-awesome-icon v-if='item.compartilhado' icon="user-friends" class='me-2' style='font-size: 12px;'
                                                           title='compartilhado' data-bs-toggle="tooltip" data-bs-placement="right" />
                                        {{ transformarAcentosUTF8(item.nome) }}
                                    </div>
                                </a>
                                <span v-else>
                                                    <input  type=text v-model="nomeTemp" style='height: 22px;width:80%;'>
                                                    <font-awesome-icon icon="check" class='mx-1' style='color: green; font-size: 22px;   cursor: pointer;' @click='salvarNome(item)' />
                                                    <font-awesome-icon icon="undo" class='mx-1' style='color: red; font-size: 22px; cursor: pointer;' @click='cancelarNome(item)' />
                                                </span>
                            </td>
                            <td>{{ convertedDate(item.diahora?.toString()) }}</td>
                            <td>{{ item.login }}</td>
                            <td class="opcoes" style='min-width: 120px; color:#666;'>
                                <a v-if=item.ed :href='item.ed'>
                                    <font-awesome-icon  icon="file-text"  title='Editar' class='me-2' style='font-size: 20px; color:#666;'/>
                                </a>

                                <span v-if="tipo == 'cponto' && item.tipo != 6">
                                                    <a v-if=item.cp href="javascript:void(0)" @click="duplicaCP(item.id)">
                                                        <font-awesome-icon  icon="copy" title='Copiar' class='me-2' style='font-size: 20px; cursor: pointer;'/>
                                                    </a>
                                                </span>
                                <span v-else-if="item.tipo != 'A2'">
                                                    <span v-if="item.tipo == 'A3'" @click='copiarCalculoA3(item)'>
                                                        <font-awesome-icon  icon="copy" title='Copiar' class='me-2' style='font-size: 20px; cursor: pointer;'/>
                                                    </span>
                                                    <span v-else-if="tipo == 'jud' || tipo == 'tabjud' || tipo == 'finan' || tipo == 'deved' || tipo == 'cponto'"
                                                          @click='copiarCalculoRds(item)'>
                                                        <font-awesome-icon  icon="copy" title='Copiar' class='me-2' style='font-size: 20px; cursor: pointer;'/>
                                                    </span>
                                                    <a v-else :href='copiarCalculo(item)'>
                                                        <font-awesome-icon  icon="copy" title='Copiar' class='me-2' style='font-size: 20px; cursor: pointer;'/>
                                                    </a>
                                                </span>

                                <font-awesome-icon v-if=item.rn icon="pencil" @click="showRenomear(item)" title="Renomear" style='font-size: 20px; cursor: pointer;'/>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <paginacao-lista  :offset="offset" :limit="limit" :total="total" @trocar-pagina="trocarPagina" />
                </div>
                <div v-if="loading" type="button" class="pe-none">
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Carregando...
                </div>
                <div v-else-if="!loading && calculos.length===0" type="button" class="pe-none">
                    <!-- Light alert -->
                    <div class="alert d-flex alert-light" role="alert" ng-show='!tabela.length'>
                        <i class="ai-bell fs-xl pe-1 me-2"></i>
                        <div v-if='tipo === "tabjud"'>Você ainda não possui nenhuma tabela.</div>
                        <div v-else>Você ainda não possui nenhum cálculo efetuado. Clique em <b>{{ textoNovoCalc }}</b> para editar seu primeiro cálculo.</div>
                    </div>
                </div>

            </div>
            <div v-else>
                <!-- Light alert -->
                <div class="alert d-flex alert-light" role="alert" ng-show='!tabela.length'>
                    <i class="ai-bell fs-xl pe-1 me-2"></i>
                    <div><b>Sem permissão! </b>Verifique suas permissões com o administrador da sua conta.</div>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>

</style>