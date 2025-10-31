import {createRouter, createWebHistory, LocationQuery, NavigationGuardNext, RouteRecordRaw} from 'vue-router'
import { useCookies } from "vue3-cookies"
import {limpezaCookies} from "../utils/limpezaCookies";
import { usePerfilStore } from '@/stores/PerfilStore'
import api from "@/plugins/axios";
import IndicadoresEconomicos from "@/views/tabelas/indicadores-economicos.vue";
import ReajusteAluguel from "@/views/tabelas/reajuste-aluguel.vue";
import ReajusteAluguelAntigo from '@/views/tabelas/reajuste-aluguel-antigo/[indice].vue'
import TabelasJudiciais  from '@/views/tabelas/[judiciais].vue'
import CorrecaoMonetariaTrabalhista from "@/views/tabelas/correcao-monetaria-trabalhista.vue";
import TabelasIrrf from "@/views/tabelas/tabelas-irrf.vue";
import TabelasInss from "@/views/tabelas/tabelas-inss.vue";
import SalarioFamilia from "@/views/tabelas/salario-familia.vue";
import SeguroDesemprego from "@/views/tabelas/seguro-desemprego.vue";
import Moedas from "@/views/tabelas/moedas.vue";
import Cpmf from "@/views/tabelas/cpmf.vue";
import JurosSC from "@/views/tabelas/juros-simples-e-compostos.vue";

const { cookies } = useCookies()
const urlDebit = import.meta.env.VITE_DEBIT_URL
const urlApp = import.meta.env.VITE_APP_URL
//domain from urlDebit
let domain: string = urlDebit

//lazy loading - rotas dinamicas
const ListaAPI = () => import( '@/views/menu/api/ListaAPI.vue')
const AddAPI = () => import( '@/views/menu/api/AddAPI.vue')

const ContateSuporte = () => import( '@/views/ContateSuporte.vue')
const Aviso = () => import( '@/views/Aviso.vue')
const ListaCalculo = () => import('@/views/ListaCalculo.vue')
const SuporteLista = () => import('@/views/menu/SuporteLista.vue')
const SuporteWhats = () => import('@/views/menu/SuporteWhats.vue')
const EditarLogotipo = () => import('@/views/menu/EditarLogotipo.vue')
const DesativarRecebimentoEmail = () => import('@/views/DesativarRecebimentoEmail.vue')
const PerfilGeral = () => import('@/views/menu/PerfilGeral.vue')
const DeletaConta = () => import('@/views/DeletaConta.vue')
const EditarPerfil = () => import('@/views/menu/EditarPerfil.vue')
const Dsr = () => import('@/views/Dsr.vue')
const CartaoPonto = () => import('@/views/CartaoPonto.vue')
const CartaoPrint = () => import('@/views/CartaoPrint.vue')
const Financiamento = () => import('@/views/Financiamento.vue')
const FinanciamentoSaldoDevedor = () => import('@/views/FinanciamentoSaldoDevedor.vue')
const indicePersonalizado = () => import('@/views/indicePersonalizado.vue')
const indiceMesclado = () => import('@/views/indiceMesclado.vue')
const Login = () => import('@/views/Login.vue')
const Cadastro = () => import('@/views/Cadastro.vue')
//aasp
const AaspLogin = () => import('@/views/aasp/AaspLogin.vue')
const AaspLoginCallbackHomolog = () => import('@/views/aasp/AaspLoginCallback.vue')
const AaspLoginHomolog = () => import('@/views/aasp/AaspLogin.vue')
const AaspLogoutHomolog = () => import('@/views/aasp/AaspLogout.vue')

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', component: ListaCalculo, alias: '/lista' },
        { path: '/menu/suporte-lista', component: SuporteLista, alias: '/menu/SuporteLista' },
        { path: '/aviso', name: 'Aviso', component: Aviso, },
        { path: '/contate-suporte', name: 'ContateSuporte', component: ContateSuporte, },
        { path: '/menu/editar-logotipo', component: EditarLogotipo, alias: '/editarLogotipo' },
        { path: '/menu/api', name: 'Lista', component: ListaAPI, },
        { path: '/menu/add-api', name: 'AddAPI', component: AddAPI, },
        { path: '/desativar-recebimento-email', name: 'DesativarRecebimentoEmail', component: DesativarRecebimentoEmail, },
        { path: '/menu/perfil-geral', name: 'PerfilGeral', component: PerfilGeral, },
        { path: '/deleta-conta', name: 'DeletaConta', component: DeletaConta, },
        { path: '/financiamento', name: 'Financiamento', component: Financiamento, },
        { path: '/financiamento-saldo-devedor', name: 'FinanciamentoSaldoDevedor', component: FinanciamentoSaldoDevedor, },
        { path: '/login', name: 'Login', component: Login, },
        { path: '/cadastro', name: 'Cadastro', component: Cadastro, },
        { path: '/menu/editar-perfil', name: 'EditarPerfil', component: EditarPerfil, },
        { path: '/cp/:id?/:pag?', name: 'CartaoPonto', component: CartaoPonto, },
        { path: '/cp_print/:id?', name: 'CartaoPrint', component: CartaoPrint, },
        { path: '/dsr/:id?', name: 'Dsr', component: Dsr, },
        { path: '/indice-personalizado/:id?', name: 'indicePersonalizado', component: indicePersonalizado, },
        { path: '/indice-mesclado/:id?', name: 'indiceMesclado', component: indiceMesclado, },
        { path: '/suporte-whats', component: SuporteWhats, alias: '/suporte-whats' },
        //aasp
        { path: '/aasp/:redirectCallback?', component: AaspLogin, alias: '/Aasp' },
        { path: '/aasp/redir/:redirectCallback?', component: AaspLoginCallbackHomolog, alias: '/Aasp' },
        { path: '/aasp/aasp-login-callback', component: AaspLoginCallbackHomolog, alias: '/AaspLoginCallbackHomolog' },
        { path: '/aasp/aasp-login', component: AaspLoginHomolog, alias: '/AaspLoginHomolog' },
        { path: '/aasp/aasp-logout', component: AaspLogoutHomolog, alias: '/AaspLogoutHomolog' },

        //rotas sem login
        { path: '/tabelas/indicadores-economicos', component: IndicadoresEconomicos },
        { path: '/tabelas/reajuste-aluguel', component: ReajusteAluguel },
        { path: '/tabelas/correcao-monetaria-trabalhista', component: CorrecaoMonetariaTrabalhista },
        { path: '/tabelas/tabelas-irrf', component: TabelasIrrf },
        { path: '/tabelas/tabelas-inss', component: TabelasInss },
        { path: '/tabelas/salario-familia', component: SalarioFamilia },
        { path: '/tabelas/seguro-desemprego', component: SeguroDesemprego },
        { path: '/tabelas/moedas', component: Moedas },
        { path: '/tabelas/cpmf', component: Cpmf },
        { path: '/tabelas/reajuste-aluguel-antigo/:indice', component: ReajusteAluguelAntigo },
        { path: '/tabelas/juros-simples-e-compostos/:perc', component: JurosSC },
        { path: '/tabelas/:judiciais', component: TabelasJudiciais, props: route => ({ id: route.query.id })},

        //fim rotas sem login

        {
            path: '/lista',
            name: 'ListaCalculo',
            props: true,
            component: ListaCalculo,
            children: [
                //fx { path: '/lista/:tipoSel', component: ListaCalculo},
                { path: ':tipoSel', component: ListaCalculo},
            ]
        },
        {
            path: '/logout',
            name: 'Logout',
            beforeEnter: async (to, from, next) => {
                console.log('[Router] /logout acionado')
                await handleLogout()
                next('/login') // Redireciona normalmente após logout
                return
            },
            component: { render: () => null } // Rota sem componente visual
        } as RouteRecordRaw,

    ]
})

async function handleLogout(next?: NavigationGuardNext) {
    console.log('[Logout] Iniciando...')

    limpezaCookies()
    console.log('deslogar fx')
    const hostname = window.location.hostname


    //limpar store
    const perfilStore = usePerfilStore()
    perfilStore.reset()

    window.location.href = '/login'
}

router.beforeEach(async (to, from, next) => {
    console.log('domain: ', domain)
    domain = domain.replace('https://', '').replace('http://', '').replace('www.', '')

    if (
        ['/cadastro', '/esqueci-senha', '/recuperar-senha', '/login', '/desativar-recebimento-email'].includes(to.path)
    ) {
        console.log('log/cad/pass bef')
        next()
        return
    }

    if (to.path.includes('aasp')) {
        console.log('aasp route hit')
        next()
        return
    }

    console.log('[check] ck tk')
    if ((!cookies.get('c_v_app') || cookies.get('c_v_app').length < 10)) {

        console.log('[check] rt pac')
        if (to.path.includes('carrinho-pacote')) {
            console.log('carrinho-pacote')
            const tokenRevenda = cookies.get('c_v_r')
            localStorage.setItem('v_redir', to.path)
            if (tokenRevenda) {
                console.log('tem token revenda', tokenRevenda)
                next({ name: 'Cadastro' })
                return
            } else {
                console.log('nao tem token revenda')
                next({ name: 'Login' })
                return
            }
            return
        }
        console.log('logout bef 2')
        await handleLogout(next)
        return
    }

    const v_redir = localStorage.getItem('v_redir')
    if (v_redir) {
        console.log('tem v_redir', v_redir)
        localStorage.removeItem('v_redir')
        window.location.href = urlApp + v_redir
        return
    }

    try {
        const response = await api.post('/auth/valida-sessao')

        console.log('resposta valida sessao', response)
        if (response.status != 200) {
            console.log('logout valida sessao')
            await handleLogout(next)
            return
        }

        const resp = await response.data
        console.log('resp', resp)
        if (resp.success === 1 && resp.autenticado === 1) {
            console.log('autenticado')
            next()
            return
        }
        if (resp.success === 1 && resp.deslogar == 1) {
            console.log('logout, sessao expirada')

            await handleLogout(next)
            return
        }
        console.log('nao autenticado')
        await handleLogout(next)

    } catch (e) {
        console.log('erro na validação de sessão', e)
        await handleLogout(next)

    }
})

export default router
