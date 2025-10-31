<template>
    <div class="container py-5 my-5 " :class="{'fixed-topo-aasp': (store.logadoSSO)}">
        <!-- Primary alert with additional content -->
<!--                <div class="alert alert-primary row pt-sm-2 pt-lg-0" role="alert">-->

<!--                    <h6 class="pt-1 alert-heading">Gostaríamos de informar nossos horários de funcionamento para as próximas semanas:</h6>-->
<!--                    <hr class="text-primary opacity-25 mb-1">-->
<!--                    <p class='m-0 pb-2'>Nos dias 23, 26, 27 e 30 de dezembro de 2024 e dias 02 e 03 de janeiro de 2025, estaremos respondendo as mensagens entre 10h e 12h.</p>-->

<!--                    <p class="mb-1">Agradecemos pela confiança e desejamos a todos um Bom Natal e um Ano Novo repleto de realizações!</p>-->
<!--                </div>-->

        <div class="row pt-sm-2 pt-lg-0">
            <!-- Sidebar (offcanvas on sreens < 992px)-->
            <menu-geral/>
            <div class="col-9">
                <div class="card border-0 bg-white position-relative py-lg-1 py-xl-2 mb-4">
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
                </div>
            </div>
        </div>
    </div>

</template>

<script lang='ts'>

import ListaCalculoService from '@/services/ListaCalculoService'
import { useRoute, useRouter } from 'vue-router'
import { usePerfilStore } from '@/stores/PerfilStore'
import PaginacaoLista from '@/components/PaginacaoLista.vue'
import axios from 'axios'
import MenuGeral from '@/components/MenuGeral.vue'
import { ref } from 'vue'

let perfilStore = usePerfilStore()

interface Calculo {
    id: number;
    nome: string;
    diahora: string;
    login: string;
    ed: string;
    rn: boolean;
    cp: boolean;
    compartilhado: boolean;
    edit?: boolean;
    tipo?: string|number;
}

type CalculosFiltrados = Calculo[];

interface Preenchimento {
    tipo: string;
    strTipo: string;
    iconeApp: string;
    corIcone: string;
    linkNovoCalc: string;
    textoNovoCalc: string;
    programaRen: string;
    programaDel: string;
    urlTipo: string;
    linkEditarCalc: string;
}

type Preenchimentos = Preenchimento[];

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

export default {
    components: {MenuGeral, PaginacaoLista},
    props: ['tipoSel'],
    data() {
        return {
            store: perfilStore,
            tipo: 'atual',
            calculos: [],
            loading: true,
            loaded: false,
            offset: 1,
            offsetAnterior: 1,
            limit: 100,
            total: 0,
            programa_del: '',
            idDono: perfilStore.idDono,
            urlTipo: '',
            lixo: false,
            strTipo: '',
            iconeApp: '',
            corIcone: '',
            linkNovoCalc: '',
            textoNovoCalc: '',
            linkEditarCalc: '',
            programaRen: '',
            programaDel: '',
            selecionados: new Set(),
            busca: '',
            buscaAnterior: '',
            showBusca: false,
            nomeTemp: '',
            url: '',
            urlLegacy: '',
            urlCalculadoras: '',
            urlApp: '',
            urlTrab: '',
            urlAtua: '',
            permissoes: perfilStore.permissoes,
            logadoAASP: 0,
            endpointAtua: '',
            endpointCponto: '',
            router: useRouter(),
            preenchimentos: [] as Preenchimentos,
            debouncedPegarCalculos: debounce(this.pegarCalculos, 400),
            storeCarregado: perfilStore.carregado,
            calculosCache: {},
            calculosCountTotalCache: {},
        }
    },
    async created() {
        this.url = import.meta.env.VITE_DEBIT_URL
        this.urlLegacy = import.meta.env.VITE_DEBIT_LEGACY_URL
        this.urlCalculadoras = import.meta.env.VITE_CALCULADORAS_URL
        this.urlApp = import.meta.env.VITE_APP_URL
        this.urlTrab = import.meta.env.VITE_TRAB_URL
        this.urlAtua = import.meta.env.VITE_ATUA_URL

        this.showBusca = false

        this.preenchimentos = [
            {
                tipo: 'atual',
                strTipo: 'Atualização monetária',
                iconeApp: 'icon-stats-dots',
                corIcone: 'orange',
                linkNovoCalc: `${this.urlLegacy}/atualiza2/c10.php`,
                textoNovoCalc: 'NOVO CÁLCULO',
                programaRen: `${this.urlLegacy}/menu/rename_calc.php`,
                programaDel: `${this.urlLegacy}/menu/delete_calc.php?lixo=${this.lixo}&ids=`,
                urlTipo: `${this.urlLegacy}/atualiza2/c10.php`,
                linkEditarCalc: ''
            },
            {
                tipo: 'trab',
                strTipo: 'Cálculo trabalhista',
                iconeApp: 'icon-calculator',
                corIcone: '#0D47A1',
                linkNovoCalc: `${this.urlTrab}/?id=0`,
                textoNovoCalc: 'NOVO CÁLCULO',
                programaRen: `${this.urlLegacy}/menu/rename_calc.php`,
                programaDel: `${this.urlLegacy}/menu/delete_calc.php?lixo=${this.lixo}&ids=`,
                urlTipo: 'https://trabalhista.debit.com.br/',
                linkEditarCalc: ''
            },
            {
                tipo: 'indices',
                strTipo: 'Índices personalizados',
                iconeApp: 'icon-stats-bars',
                corIcone: '#00796B',
                linkNovoCalc: `${this.urlLegacy}/atualiza2/c10.php`,
                textoNovoCalc: 'CRIAR ÍNDICE',
                programaRen: `${this.urlLegacy}/menu/ren_tab.php`,
                programaDel: `${this.urlLegacy}/menu/delete_tab.php?lixo=${this.lixo}&ids=`,
                urlTipo: 'https://app.debit.com.br/indices',
                linkEditarCalc: ''
            },
            {
                tipo: 'cponto',
                strTipo: 'Cartão de ponto',
                iconeApp: 'icon-clock',
                corIcone: 'red',
                linkNovoCalc: perfilStore.logadoSSO ? this.urlCalculadoras+'/cartaoPonto_aa' : this.urlCalculadoras+'/cartaoPonto',
                textoNovoCalc: 'NOVO CARTÃO',
                programaRen: `${this.urlLegacy}/menu/rename_ponto.php`,
                programaDel: `${this.urlLegacy}/menu/delete_ponto.php?lixo=${this.lixo}&ids=`,
                urlTipo: 'https://app.debit.com.br/cp',
                linkEditarCalc: `${this.urlApp}/cp/` //+ id
            },
            {
                tipo: 'dsr',
                strTipo: 'Descanso Semanal Remunerado (DSR)',
                iconeApp: 'icon-calendar',
                corIcone: '#9C27B0',
                linkNovoCalc: this.urlApp + '/dsr',
                textoNovoCalc: 'NOVA TABELA',
                programaRen: `${this.urlLegacy}/menu/rename_calc.php`,
                programaDel: `/menu/delete_calc.php?lixo=${this.lixo}&ids=`,
                urlTipo: 'https://app.debit.com.br/dsr',
                linkEditarCalc: `${this.urlApp}/dsr/` //+id
            },
            {
                tipo: 'finan',
                strTipo: 'Tabelas de financiamento',
                iconeApp: 'icon-home',
                corIcone: '#00796B',
                linkNovoCalc: perfilStore.logadoSSO ? this.urlCalculadoras+'/tabelaFinanciamento_aa' : this.urlCalculadoras+'/tabelaFinanciamento',
                textoNovoCalc: 'NOVO CÁLCULO',
                programaRen: `${this.urlLegacy}/menu/rename_calc.php`,
                programaDel: `${this.urlLegacy}/menu/delete_calc.php?lixo=${this.lixo}&ids=`,
                urlTipo: 'https://app.debit.com.br/finan',
                linkEditarCalc: perfilStore.logadoSSO ? `${this.urlCalculadoras}/tabelaFinanciamento_aa?id=` : `${this.urlCalculadoras}/tabelaFinanciamento?id=`
            },
            {
                tipo: 'deved',
                strTipo: 'Saldo devedor de Financiamento',
                iconeApp: 'icon-home',
                corIcone: '#00796B',
                linkNovoCalc: perfilStore.logadoSSO ? this.urlCalculadoras + "/saldoDevedor_aa":this.urlCalculadoras + "/saldoDevedor",
                textoNovoCalc: 'NOVO CÁLCULO',
                programaRen: '/menu/rename_calc.php',
                programaDel: `/menu/delete_calc.php?lixo=${this.lixo}&ids=`,
                urlTipo: 'https://app.debit.com.br/deved',
                linkEditarCalc: perfilStore.logadoSSO ? `${this.urlCalculadoras}/saldoDevedor_aa?id=` : `${this.urlCalculadoras}/saldoDevedor?id=`
            },
            {
                tipo: 'jud',
                strTipo: 'Calculos Judiciais (CNJ)',
                iconeApp: 'icon-pen',
                corIcone: '#563d7c',
                linkNovoCalc: perfilStore.logadoSSO ? this.urlCalculadoras + "/calculoJudicial_aa" : this.urlCalculadoras + "/calculoJudicial",
                textoNovoCalc: 'NOVO CÁLCULO',
                programaRen: `${this.urlLegacy}/menu/rename_calc.php`,
                programaDel: `${this.urlLegacy}/menu/delete_calc.php?lixo=${this.lixo}&ids=`,
                urlTipo: 'https://app.debit.com.br/jud',
                linkEditarCalc: perfilStore.logadoSSO ? `${this.urlCalculadoras}/calculoJudicial_aa?id=` : `${this.urlCalculadoras}/calculoJudicial?id=`
            },
            {
                tipo: 'tabjud',
                strTipo: 'Tabelas Judiciais',
                iconeApp: 'icon-table',
                corIcone: '#563d7c',
                linkNovoCalc: perfilStore.logadoSSO ? this.urlCalculadoras + "/tabelaJudicial_aa" :  this.urlCalculadoras + "/tabelaJudicial",
                textoNovoCalc: 'NOVA TABELA',
                programaRen: `${this.urlLegacy}/menu/rename_calc.php`,
                programaDel: `${this.urlLegacy}/menu/delete_calc.php?lixo=${this.lixo}&ids=`,
                urlTipo: 'https://app.debit.com.br/tabjud',
                linkEditarCalc:  perfilStore.logadoSSO ? `${this.urlCalculadoras}/tabelaJudicial_aa?id=` : `${this.urlCalculadoras}/tabelaJudicial?id=`
            },
            {
                tipo: 'difn',
                strTipo: 'Previdenciário - Diferenças não recebidas',
                iconeApp: 'icon-table',
                corIcone: '#000000',
                linkNovoCalc: perfilStore.logadoSSO ? this.urlCalculadoras + "/calculoPrevidenciario1" :  this.urlCalculadoras + "/calculoPrevidenciario1",
                textoNovoCalc: 'NOVO CÁLCULO',
                programaRen: `${this.urlLegacy}/menu/rename_calc.php`,
                programaDel: `${this.urlLegacy}/menu/delete_calc.php?lixo=${this.lixo}&ids=`,
                urlTipo: 'https://app.debit.com.br/difn',
                linkEditarCalc:  perfilStore.logadoSSO ? `${this.urlCalculadoras}/calculoPrevidenciario1?id=` : `${this.urlCalculadoras}/calculoPrevidenciario1?id=`
            },
            {
                tipo: 'prevct',
                strTipo: 'Previdenciário - Contagem de Tempo',
                iconeApp: 'icon-table',
                corIcone: '#000000',
                linkNovoCalc: perfilStore.logadoSSO ? this.urlCalculadoras + "/calculoPrevidenciario1" :  this.urlCalculadoras + "/calculoPrevidenciario1",
                textoNovoCalc: 'NOVO CÁLCULO',
                programaRen: `${this.urlLegacy}/menu/rename_calc.php`,
                programaDel: `${this.urlLegacy}/menu/delete_calc.php?lixo=${this.lixo}&ids=`,
                urlTipo: 'https://app.debit.com.br/prevct',
                linkEditarCalc:  perfilStore.logadoSSO ? `${this.urlCalculadoras}/prevContagemTempo?id=` : `${this.urlCalculadoras}/prevContagemTempo?id=`
            }
        ]
    },
    async mounted() {
        this.showBusca = false
        const perfilStore = usePerfilStore();

        if (this.tipoSel) {
            this.tipo = this.tipoSel
        } else {
            this.tipo = 'atual'
        }

        const route = useRoute();
        if (route.query.tipo) {
            this.tipo = route.query.tipo.toString()
        }

        await perfilStore.getPerfil('Lista')

        this.storeCarregado = perfilStore.carregado

        if (this.storeCarregado) {
            this.logadoAASP = perfilStore.logadoSSO

            try {
                const resp = ListaCalculoService.getEndpointCponto()
                if (resp.status === 200) {
                    this.endpointCponto = resp.data.endpoint
                }
            } catch (ex) {
                console.log("Error in fetch endpointCponto");
            }

            this.carregaTipoCalculo(this.tipo)
            this.pegarCalculos()

            try {
                let resp = await ListaCalculoService.getEndpoint(perfilStore.getIdDono)
                if (resp.status === 200) {
                    this.endpointAtua = resp.data.endpoint.toString()
                    console.log('endpointAtua: ', this.endpointAtua)
                }
            } catch (ex) {
                console.log("Error in fetch endpoint");
            }

            const wa_btnSetting = {"btnColor":"#16BE45","ctaText":"","cornerRadius":40,"marginBottom":20,"marginLeft":20,"marginRight":20,"btnPosition":"right","whatsAppNumber":"5511957691370","welcomeMessage":"Olá, Tenho uma duvida!","zIndex":999999,"btnColorScheme":"light"};
            const wa_widgetSetting = {"title":"Denise","subTitle":"Suporte","headerBackgroundColor":"#1c529b","headerColorScheme":"light","greetingText":"Olá! \nComo podemos ajuda-lo?","ctaText":"Iniciar Whatsapp","btnColor":"#1c529b","cornerRadius":40,"welcomeMessage":"Hello","btnColorScheme":"light","brandImage":"/android-chrome-512x512.png","darkHeaderColorScheme":{"title":"#333333","subTitle":"#4F4F4F"}};
            _waEmbed(wa_btnSetting, wa_widgetSetting);
        }
    },

    computed: {
        nomeDono() {
            return perfilStore.getNomePerfil
        },
        usuarioLogado() {
            return Boolean(perfilStore.usuarioLogado > 2)
        },
        multiLiberado() {
            console.log('perfilStore.multiLiberado: ', perfilStore.multiLiberado)
            return perfilStore.multiLiberado
        },
        calculosOrdenados() {
            if (this.tipo == 'cponto' || this.tipo == 'indices') {
                // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                return this.calculos.sort((a, b) => {
                    return a.id < b.id
                })
            } else {
                // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                return this.calculos.sort((a, b) => {
                    return a.diahora < b.diahora
                })
            }
        },
        calculosFiltrados() : CalculosFiltrados{
            if (this.busca.length > 0 && this.busca.length <= 3) {
                return this.calculosOrdenados.filter((item) => {
                    if (item.nome.toLowerCase().includes(this.busca.toLowerCase())
                        || item.id.toString().includes(this.busca.toLowerCase())) {
                        return true
                    }
                })
            }
            // console.log('this.calculosOrdenados')
            // console.log(this.calculosOrdenados)
            return this.calculosOrdenados
        },
    },
    updated() {
        const route = useRoute();

        if (route.params && route.params.tipoSel !== undefined && route.params.tipoSel !== this.tipo) {
            if (route.params.tipoSel) {
                this.tipo = route.params.tipoSel
            }

            this.calculos = []
            this.showBusca = false
            this.pegarCalculos()
            this.carregaTipoCalculo()
        }
    },
    watch: {
        lixo() {
            this.calculos = []
            this.pegarCalculos()
            this.carregaTipoCalculo()
        },
        permissoes: function (newValue, oldValue) {
            // apply your logic here, e.g. invoke your listener function
            console.log('was: ', oldValue, ' now: ', newValue)
        }
    },
    methods: {
        getUsuarios() {
            return perfilStore.getUsuarios
        },
        getIdDono() {
            return Number(perfilStore.idDono)
        },
        permiteRenomear() {
            return this.temPermissao(this.tipo, 'editar_calc')
        },
        permiteCopia() {
            return this.temPermissao(this.tipo, 'copiar_calc');
        },
        cancelarNome(item) {
            item.edit = !item.edit
            this.nomeTemp = ''
        },
        salvarNome(item) {
            const dados = {id_dono: this.idDono, tipo: this.tipo, nome: this.nomeTemp, id: item.id}
            ListaCalculoService.renomearCalculo(dados)
                .catch((e) => {
                    console.log(e)
                })
                .then((resp) => {
                    if (resp.data === true) {
                        item.nome = this.nomeTemp
                        this.showRenomear(item)
                    }
                })
        },
        permiteExcluir() {
            this.temPermissao(this.tipo, 'del_calc')
        },
        showRenomear(item) {
            if ((item.edit === undefined || item.edit === false)) {
                item.edit = !item.edit
                this.nomeTemp = item.nome
            } else {
                this.cancelarNome(item)
            }
        },
        linkEditar(id, tipoCalc) {
            if (tipoCalc == 'A2') {
                if (this.linkNovoCalc) {
                    return this.urlLegacy + "/atualiza2/c10.php?alteradb=n&id_calc=" + id
                }
            }
            if (tipoCalc == 'A3') {
                if (this.linkNovoCalc) {
                    return this.urlAtua + "/?id=" + id
                }
            }
            if (tipoCalc == 'ATUA') {
                if (this.linkNovoCalc) {
                    return this.urlLegacy + "/atualiza/calculo10.php?alteradb=n&id_calc=" + id
                }
            }
            if (tipoCalc == 'T4') {
                return this.urlLegacy + "/trabalhista4/t10g.php?id_calc=" + id + "&form_grupo=249"
            }
            if (tipoCalc == 'T5') {
                return this.urlTrab + "?id=" + id
            }
            if (tipoCalc == 'TRAB') {
                return this.urlLegacy + "/trabalhista/ct40.php?id_calc=" + id
            }
            if (this.tipo == 'indices') {
                if (tipoCalc == "p") {
                    return this.urlApp + "/indice-personalizado/" + id
                } else {
                    return this.urlCalculadoras + "/mescladoEdit?id=" + id
                }
            }
            if (this.tipo == 'cponto' && tipoCalc == 6) {
                console.log('id: ', id)
                return this.urlCalculadoras + "/cartaoPonto?id=" + id
            }
            if (this.tipo == 'cponto' && tipoCalc == '') {
                return this.urlApp + "/cp/" + id
            }

            return this.linkEditarCalc + id
        },

        temPermissao(produto, permissao) {
            // console.log('temPermissao: ', produto, permissao)
            // console.log('perfilStore: ', perfilStore.permissoes)
            //quando o perfil é do dono, ele tem todas as permissões
            if (perfilStore.idDono && !this.usuarioLogado) {
                return true
            }
            if (perfilStore.permissoes === null) {
                return true
            }

            if (produto === 'atual') {
                produto = 'calc'
            } else if (produto === 'finan' || produto === 'deved') {
                produto = 'emprest'
            } else if (produto === 'trab') {
                produto = 'trab'
            } else {
                produto = 'calc'
            }

            const allPerm = {
                calc: {
                    ver_calc: 1,
                    editar_calc: 2,
                    del_calc: 4,
                    nao_visualizar_outro: 8
                },
                emprest: {
                    editar_calc: 1,
                    del_calc: 2,
                    ver_calc: 4,
                    nao_visualizar_outro: 8
                },
                trab: {
                    editar_calc: 1,
                    ver_calc: 2,
                    del_calc: 4,
                    nao_visualizar_outro: 8
                },
            };

            // console.log(jsonArray);

            // console.log('perfilStore.permissoes[]: ',produto, perfilStore.permissoes[produto])
            // console.log('allPerm[produto][permissao]: ', allPerm[produto][permissao])
            // console.log(Boolean(perfilStore.permissoes[produto] & allPerm[produto][permissao]))

            return Boolean(perfilStore.permissoes[produto] & allPerm[produto][permissao])
        },
        toggleSelecao(calc) {
            if (this.selecionados.has(calc)) {
                this.selecionados.delete(calc)
            } else {
                this.selecionados.add(calc)
            }
        },
        toggleLixo() {
            this.lixo = !this.lixo
            this.selecionados.clear()
        },
        toggleBusca() {
            this.showBusca = !this.showBusca
            this.busca = ''
            this.pegarCalculos()
        },
        async redirectEndpointAtualiza() {
            if (!this.endpointAtua) {
                try {
                    let resp = await ListaCalculoService.getEndpoint(perfilStore.getIdDono)
                    if (resp.status === 200) {
                        this.endpointAtua = resp.data.endpoint
                    }
                } catch (ex) {
                    console.log("Error in fetch endpoint");
                }
            }

            if (this.endpointAtua || this.endpointAtua == null) {
                window.location.href = this.urlAtua + "/?id=0"
                console.log('A')
            } else {
                window.location.href = this.linkNovoCalc
                console.log('LinkNovoCalc')
            }
        },
        deletarSelecionados() {
            const ids = Array.from(this.selecionados).map((calc) => calc.id)

            const dados = {id_dono: this.idDono, tipo: this.tipo, lixo: this.lixo, ids: ids}

            ListaCalculoService
                .deleteLista(dados)
                .catch((e) => {
                    console.log(e)
                })
                .then((resp) => {
                    if (resp.data === true) {
                        this.calculos = this.calculos.filter((item) => {
                            return !ids.includes(item.id)
                        })
                        this.selecionados.clear()
                    }
                })
        },
        convertedDate(date) {
            if (date) {
                const ano = date.substring(0, 4)
                const mes = date.substring(4, 6)
                const dia = date.substring(6, 8)
                const hora = date.substring(8, 10)
                const minuto = date.substring(10, 12)
                return `${dia}/${mes}/${ano} ${hora}:${minuto}`
            }
            return ''
        },
        async pegarCalculos(event = null) {
            // If event key length is more than 1 or search length is less than 4, stop loading and return
            if ((event?.key.length > 1) || (this.busca.length > 0 && this.busca.length < 4)) {
                this.loading = false;
                return;
            }

            // If search is not empty and is the same as the previous search and offset is the same as the previous offset, stop loading and return
            if (this.busca && this.busca === this.buscaAnterior && this.offset === this.offsetAnterior) {
                console.log('if this.busca: ', this.busca);
                this.loading = false;
                return;
            }

            this.loading = true;
            const dados = {id_dono: this.idDono, tipo: this.tipo, lixo: this.lixo, busca: this.busca};

            // Verifique se os cálculos estão no cache
            // Armazene os cálculos no cache
            const cacheKey = this.tipo + this.offset;
            if(!this.busca && !this.lixo) {
                if (this.calculosCache[cacheKey]) {
                    console.log('cache recuperado: ', cacheKey)
                    this.calculos = this.calculosCache[cacheKey]
                    this.total = this.calculosCountTotalCache[cacheKey]
                    this.loading = false
                    return;
                }
            }

            try {
                console.log('pegarCalculos req get ');
                let resp = await ListaCalculoService.getLista(dados, this.offset, this.limit);
                console.log('resp calc', resp.status);
                this.calculos = this.processCalculos(resp.data);
                this.total = resp.headers.get('X-Total-Count');
                this.buscaAnterior = this.busca;

                // Armazene os cálculos no cache
                if(!this.busca && !this.lixo) {
                    this.calculosCache[cacheKey] = this.calculos;
                    this.calculosCountTotalCache[cacheKey]  = this.total;
                }
            } catch (e) {
                console.log(e);
            } finally {
                this.loading = false;
            }
        },

        processCalculos(data: any[]) {
            const permRenomear = this.permiteRenomear;
            const permCopiar = this.permiteCopia;
            const idDono = this.getIdDono();
            const usu = this.getUsuarios();


            // Transforma o array 'usu' em um objeto para acesso direto
            const usuObj = usu.reduce((obj, item) => {
                obj[item.id_usuario] = item;
                return obj;
            }, {});

            const mapeado = [];
            data.forEach((c) => {
                c.compartilhado = false;
                let usuario = null;

                if (!c.id_multiusuario && (!c.id_login || c.id_login === idDono)) {
                    //dono
                    usuario = usuObj[0];
                } else if (c.id_multiusuario) {
                    //multiusuario
                    usuario = usuObj[c.id_multiusuario];
                } else {
                    //compartilhado
                    usuario = usuObj[c.id_login];
                    c.compartilhado = true;
                }
                c.login = usuario?.login;
                c.ed = this.linkEditar(c.id, c.tipo);
                c.rn = permRenomear;
                c.cp = permCopiar;
                mapeado.push(c);
            });

            return mapeado;
        },
        trocarPagina(pagina) {
            this.offset = pagina
            this.pegarCalculos()
        },
        preencheTipo: function (strTipo, iconeApp, corIcone, linkNovoCalc, textoNovoCalc, programaRen, programaDel, urlTipo, linkEditarCalc) {
            this.strTipo = strTipo
            this.iconeApp = iconeApp
            this.corIcone = corIcone
            this.linkNovoCalc = linkNovoCalc
            this.textoNovoCalc = textoNovoCalc
            this.programaRen = programaRen
            this.programaDel = programaDel
            this.urlTipo = urlTipo
            this.linkEditarCalc = linkEditarCalc
        },
        carregaTipoCalculo() {
            const tipoPreenchimento = this.preenchimentos.find(p => p.tipo === this.tipo)

            if (tipoPreenchimento) {
                this.preencheTipo(tipoPreenchimento.strTipo, tipoPreenchimento.iconeApp, tipoPreenchimento.corIcone, tipoPreenchimento.linkNovoCalc, tipoPreenchimento.textoNovoCalc, tipoPreenchimento.programaRen, tipoPreenchimento.programaDel, tipoPreenchimento.urlTipo, tipoPreenchimento.linkEditarCalc)
            }
        },
        copiarCalculo(item) {
            const dados = {
                id_dono: this.idDono,
                tipo: this.tipo,
                nome: this.nomeTemp,
                id: item.id,
                subtipo: item.tipo
            }

            return ListaCalculoService.copiarCalculo(dados)
        },
        async copiarCalculoA3(item) {
            const dados = {id_dono: this.idDono, tipo: this.tipo, nome: this.nomeTemp, id: item.id, subtipo: item.tipo}
            console.log('cp: ', dados)

            if (dados.subtipo === 'A3') {
                console.log('copiando...')
                await axios.get(
                    `${import.meta.env.VITE_ATUA3_URL}/atualizaExtra/copiar/` + dados.id,
                    {withCredentials: true}
                ).then((response) => {
                    console.log('response = ', response)
                }).catch((error) => {
                    console.log('error = ', error)
                })
                console.log('copiado')

                // reload
                window.location.reload();
            }
        },
        async copiarCalculoRds(item) {
            console.log('rds')
            console.log('item: ', item)
            const dados = {id_dono: this.idDono, tipo: this.tipo, nome: this.nomeTemp, id: item.id, subtipo: item.tipo}
            const url = ListaCalculoService.copiarCalculo(dados)

            console.log('copiando...url: ', url)
            await axios.get(
                url,
                {withCredentials: true}
            ).then((response) => {
                console.log('response = ', response)
            }).catch((error) => {
                console.log('error = ', error)
            })
            console.log('copiado')

            // reload
            window.location.reload();
        },
        transformarAcentosUTF8(t) {
            t = t.replace('&aacute;', 'á');
            t = t.replace('&iacute;', 'í');
            t = t.replace('&Iacute;', 'Í');
            t = t.replace('&ccedil;', 'ç');
            t = t.replace('&atilde;', 'ã');
            t = t.replace('&eacute;', 'é');
            t = t.replace('&oacute;', 'ó');
            return t;
        },

        async duplicaCP(idCalc) {
            console.log('duplica idCalc = ', idCalc)
            const idCartaoNovo = await ListaCalculoService.duplicaCP(idCalc)

            // reload
            window.location.reload();
        },
    },
}
</script>

<style scoped>
@import "@/assets/css/debit.css";
@import "@/assets/css/icones.css";
@import "@/assets/css/css-google-fonts1.css";
@import "@/assets/css/css-google-fonts2.css";
tr a{
    text-decoration: none;
    color: #576071;
}
.data-hora{
    min-width: 130px;
}
.opcoes{
    min-width: 90px;
}
/* Adicionando um padding extra no input para dar espaço ao ícone X */
.search-wrapper {
    position: relative;
}

.limpar-busca-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
}

.d-inline-flex {
    display: inline-flex;
}

.btn-sm, .form-control {
    height: auto; /* Garante que ambos tenham uma altura dinâmica compatível */
    display: inline-flex; /* Faz os elementos ficarem em linha e alinhados */
    align-items: center; /* Garante o alinhamento vertical dos itens */
    padding: 0.375rem 0.75rem; /* Ajusta o padding para ser mais consistente entre os elementos */
}

.search-wrapper .form-control {
    vertical-align: middle; /* Alinha o campo de input verticalmente com os botões */
}

.search-wrapper .btn-sm {
    vertical-align: middle; /* Alinha os botões com o campo de input */
}

.fixed-topo-aasp {
    margin-top: 0 !important;
}
</style>
