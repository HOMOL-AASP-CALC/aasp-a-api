<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, RouterLink } from "vue-router";

// Helpers locais
function yyyymmdd2dia(dateStr) {
    return dateStr.replace(/(\d{4})(\d{2})(\d{2})/, "$3/$2/$1");
}

function formataNum(num, casas = 2) {
    if (num == null) return "";
    return Number(num).toLocaleString("pt-BR", {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas,
    });
}

const route = useRoute();
const servidorAPI = import.meta.env.VITE_API_URL;

// Refs reativas
const data = ref(null);
const pending = ref(true);
const error = ref(null);

// Buscar dados
async function fetchIndicadores() {
    try {
        pending.value = true;
        const res = await fetch(`${servidorAPI}/front/resumo`);
        if (!res.ok) throw new Error("Erro ao buscar dados");
        data.value = await res.json();
    } catch (err) {
        error.value = err;
    } finally {
        pending.value = false;
    }
}

onMounted(() => {
    fetchIndicadores();

    // Chamada de rastreador
    fetch(`${servidorAPI}/menu/rastreador`, {
        method: "POST",
        body: JSON.stringify({
            pagina: "indicadores-economicos",
            id_dono: 0,
            parametros: "",
        }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });
});

// Computed
const indicadoresJudiciaisLista = computed(() => {
    return data.value?.indicadoresJudiciais || [];
});

const indicadoresJudiciaisFiltrados = computed(() => {
    const ids = [3859, 3858, 3857, 3856, 7982];
    return indicadoresJudiciaisLista.value.filter((d) => ids.includes(d.id));
});

// UFESP filtrada
const mesAtual = new Date().getMonth() + 1;
const anoAtual = new Date().getFullYear();

const ufespFiltrada = computed(() => {
    if (!data.value?.ufesp) return [];
    return data.value.ufesp.filter((d) => {
        const ano = Math.floor(d.dia / 10000);
        const mes = Math.floor((d.dia % 10000) / 100);
        return ano < anoAtual || (ano === anoAtual && mes <= mesAtual);
    });
});
</script>

<template>

    <!-- container my-3 py-5 my-lg-3 my-xl-4 my-xxl-5 -->
    <section id="content"  class="tagPrincipal " >
        <section class="bg-secondary py-5">
            <div class="container pt-5 pb-lg-1 pb-xl-2 py-xxl-5">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><RouterLink class="dropdown-item" :to="`/tabelas/indicadores-economicos`">Indicadores econômicos</RouterLink></li>
                    </ol>
                </nav>
                <h1 class="h2 mb-2 mh2">Indicadores econômicos</h1>



                <div  style="max-width: 800px; margin-bottom: -30px;">
                    <p>
                        Descubra os principais indicadores econômicos do Brasil em tempo real. Aqui, você encontra informações atualizadas sobre índices de inflação, taxas de juros, cotações de moedas e muito mais. Ideal para profissionais de finanças, estudantes e qualquer pessoa interessada em economia. Mantenha-se informado sobre as tendências econômicas com dados confiáveis e precisos.
                    </p>
                </div>
            </div>
        </section>

        <section class="container white-mode">
            <div class="row row-cols-1 row-cols-sm-1 row-cols-md-2 row-cols-xl-2 g-4 pb-2 pb-sm-4 pb-lg-5">

                <div class="col">
                    <div class="card border-0">
                        <div class="card-body pb-0">
                            <h2 class="h5ms-2 mh5">Indicadores de inflação</h2>
                        </div>


                        <div class="card-body">
                            <div class="tab-content">
                                <div class="tab-pane fade show active" id="preview6" role="tabpanel">
                                    <div class="table-responsive mb-3">
                                        <table v-if="data && Object.keys(data) && Object.keys(data).length" class="mtabela table table-hove ">
                                            <thead>
                                            <tr>
                                                <th></th>
                                                <th v-for="d in data.igpm">{{ $yyyymmdd2dia(d.dia.toString()).substring(3) }}</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr><td  style="text-align: left;">
                                                <RouterLink class="links2" :to="`/tabelas/igp-fgv-indice-geral-de-precos`">IGP-DI</RouterLink>
                                            </td><td v-for="d in data.igp">{{  $formataNum(d.valor,2)  }}%</td></tr>

                                            <tr>
                                                <td  style="text-align: left;">
                                                    <RouterLink class="links2" :to="`/tabelas/igpm-fgv-indice-geral-de-precos-mercado`">IGP-M</RouterLink>
                                                </td><td v-for="d in data.igpm">{{ $formataNum( d.valor,2)  }}%</td></tr>


                                            <tr>
                                                <td  style="text-align: left;">
                                                    <RouterLink class="links2" :to="`/tabelas/incc-indice-nacional-da-construcao-civil`">INCC-DI</RouterLink>
                                                </td>
                                                <td v-for="d in data.incc">{{  $formataNum(d.valor,2 )  }}%</td></tr>

                                            <tr><td  style="text-align: left;">
                                                <RouterLink class="links2" :to="`/tabelas/inpc-indice-nacional-de-precos-ao-consumidor`">
                                                    INPC (IBGE)
                                                </RouterLink>
                                            </td><td v-for="d in data.inpc">{{  $formataNum(d.valor,2)  }}%</td></tr>

                                            <tr><td  style="text-align: left;">
                                                <RouterLink class="links2" :to="`/tabelas/ipc-indice-de-precos-ao-consumidor-fipe`">
                                                    IPC (FIPE)
                                                </RouterLink>
                                            </td><td v-for="d in data.ipc_fipe">{{  $formataNum(d.valor,2)  }}%</td></tr>

                                            <tr><td  style="text-align: left;">
                                                <RouterLink class="links2" :to="`/tabelas/ipc-indice-de-precos-ao-consumidor-fgv`">
                                                    IPC (FGV)
                                                </RouterLink></td><td v-for="d in data.ipc_fgv">{{  $formataNum(d.valor,2)  }}%</td></tr>
                                            <tr>
                                                <td style="text-align: left; ">
                                                    <RouterLink class="links2" :to="`/tabelas/ipca-indice-nacional-de-precos-ao-consumidor-amplo`">IPCA (IBGE)</RouterLink>
                                                </td>
                                                <td v-for="d in data.ipca">{{  $formataNum(d.valor,2)  }}%</td>
                                            </tr>
                                            <tr><td  style="text-align: left;">
                                                <RouterLink class="links2" :to="`/tabelas/ipcae-indice-de-precos-ao-consumidor-amplo-especial`">
                                                    IPCA-E (IBGE)
                                                </RouterLink>
                                            </td><td v-for="d in data.ipca_e">{{  $formataNum(d.valor,2)  }}%</td></tr>

                                            <tr><td  style="text-align: left;">
                                                <RouterLink class="links2" :to="`/tabelas/ivar-indice-variacao-de-alugueis-residenciais`">
                                                    IVAR (FGV)
                                                </RouterLink>
                                            </td><td v-for="d in data.ivar">{{  $formataNum(d.valor,2)  }}%</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div class="col">
                    <div class="card border-0">
                        <div class="card-body pb-0">
                            <h2 class="h5ms-2 mh5">Indicadores diversos</h2>
                        </div>


                        <div class="card-body">
                            <div class="tab-content">
                                <div class="tab-pane fade show active" id="preview6" role="tabpanel">
                                    <div class="table-responsive mb-3">
                                        <table v-if="data && Object.keys(data) && Object.keys(data).length" class="mtabela table table-hove ">
                                            <thead>
                                            <tr>
                                                <th></th>
                                                <th v-for="d in data.salario_minimo || []">{{ $yyyymmdd2dia(d.dia.toString()).substring(3) }}</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr><td   style="text-align: left;">
                                                <RouterLink class="links2" :to="`/tabelas/cdi`">CDI</RouterLink></td><td v-for="d in data.cdi">{{  $formataNum(d.valor,4)  }}</td></tr>
                                            <tr><td   style="text-align: left;">
                                                <RouterLink class="links2" :to="`/tabelas/btn-bonus-do-tesouro-nacional`">BTN-TR</RouterLink></td><td v-for="d in data.btn">{{  $formataNum(d.valor,4)  }}</td></tr>
                                            <tr><td   style="text-align: left;">
                                                <RouterLink class="links2" :to="`/tabelas/salario-minimo`">Salário Mínimo</RouterLink></td><td v-for="d in data.salario_minimo">{{ $formataNum( d.valor,2)  }}</td></tr>
                                            <tr><td   style="text-align: left;">
                                                <RouterLink class="links2" :to="`/tabelas/poupanca`">Poupança</RouterLink></td><td v-for="d in data.poupanca">{{  $formataNum(d.valor, 4 )  }}</td></tr>
                                            <tr><td   style="text-align: left;">
                                                <RouterLink class="links2" :to="`/tabelas/selic`">Selic</RouterLink></td><td v-for="d in data.selic">{{  $formataNum(d.valor, 4 )  }}</td></tr>

                                            <tr><td   style="text-align: left;">
                                                <RouterLink class="links2" :to="`/tabelas/taxaLegal`">Taxa Legal</RouterLink></td><td v-for="d in data.taxa_legal">{{  $formataNum(d.valor, 4 )  }}</td></tr>

                                            <tr><td   style="text-align: left;">
                                                <RouterLink class="links2" :to="`/tabelas/tbf`">TBF</RouterLink></td><td v-for="d in data.tbf">{{  $formataNum(d.valor,4)  }}%</td></tr>
                                            <tr><td   style="text-align: left;">
                                                <RouterLink class="links2" :to="`/tabelas/tjlp`">TJLP (Bacen)</RouterLink></td><td v-for="d in data.tjlp">{{  $formataNum(d.valor,4)  }}%</td></tr>
                                            <tr><td   style="text-align: left;">
                                                <RouterLink class="links2" :to="`/tabelas/tr-bacen`">TR (Bacen)</RouterLink></td><td v-for="d in data.tr">{{  $formataNum(d.valor,4)  }}%</td></tr>
                                            <tr>
                                                <td   style="text-align: left;">
                                                    <RouterLink class="links2" :to="`/tabelas/ufesp`">Ufesp</RouterLink>
                                                </td>
                                                <td v-for="d in ufespFiltrada" :key="d.dia">
                                                    {{
                                                        $formataNum(d.valor,2)
                                                    }}
                                                </td>
                                            </tr>
                                            <tr><td   style="text-align: left;">
                                                <RouterLink class="links2" :to="`/tabelas/ufir`">Ufir</RouterLink></td><td v-for="d in data.ufir.slice(0,3)">{{  $formataNum(d.valor,2)  }}</td></tr>
                                            <tr><td   style="text-align: left;">
                                                <RouterLink class="links2" :to="`/tabelas/ufr-pb`">UFR (PB)</RouterLink></td><td v-for="d in data.ufr_pb">{{  $formataNum(d.valor,2)  }}</td></tr>
                                            <tr><td   style="text-align: left;">
                                                <RouterLink class="links2" :to="`/tabelas/upc-unidade-padrao-de-capital`">UPC</RouterLink></td><td v-for="d in data.upc">{{  $formataNum(d.valor,2)  }}</td></tr>
                                            <tr><td   style="text-align: left;">
                                                <RouterLink class="links2" :to="`/tabelas/ufm-sp`">UFM (Cidade de SP)</RouterLink></td><td v-for="d in data.ufm">{{  $formataNum(d.valor,2)  }}</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col">
                    <div class="card border-0">
                        <div class="card-body pb-0">
                            <h2 class="h5ms-2 mh5">Tabelas judiciais</h2>
                        </div>

                        <div class="card-body">
                            <div class="tab-content">
                                <div class="tab-pane fade show active" id="preview6" role="tabpanel">
                                    <div class="table-responsive mb-3">
                                        <p class="links1">
                                            <RouterLink class="links2" :to="`/tabelas/tribunal-justica-sp-depre`">Débitos Judiciais (TJ/SP) - DEPRE</RouterLink><br />
                                            <RouterLink class="links2" :to="`/tabelas/tribunal-justica-sp-calculos-civeis-em-geral-lei-14905`">Débitos Judiciais (TJ/SP) - cálculos cíveis em geral - lei 14.905/2024</RouterLink><br />
                                            <RouterLink class="links2" :to="`/tabelas/tribunal-justica-es`">Débitos Judiciais (TJ/ES)</RouterLink><br />
                                            <RouterLink class="links2" :to="`/tabelas/tribunal-justica-mg`">Débitos Judiciais (TJ/MG)</RouterLink><br />
                                            <RouterLink class="links2" :to="`/tabelas/tribunal-justica-rj-lei-11690-2009`">Débitos Judiciais (TJ/RJ) - lei 11.690/2009</RouterLink><br />
                                            <RouterLink class="links2" :to="`/tabelas/tribunal-justica-rj-lei-6899-1981`">Débitos Judiciais (TJ/RJ) - lei 6.899/81</RouterLink><br />
                                            <template v-for="d in indicadoresJudiciaisFiltrados" :key="d.id">
                                                <RouterLink
                                                    :to="{ path: d.urlAmigavel, query: { id: d.id } }"
                                                    class="links2"
                                                >
                                                    Trabalhista:
                                                    {{ d.nome.length > 55 ? d.nome.substring(0, 55) + '...' : d.nome }}
                                                </RouterLink>
                                                <br>
                                            </template>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col">
                    <div class="card border-0">
                        <div class="card-body pb-0">
                            <h2 class="h5ms-2 mh5">Indicadores judiciais: Tabela Prática</h2>
                        </div>

                        <div class="card-body">
                            <div class="tab-content">
                                <div class="tab-pane fade show active" id="preview6" role="tabpanel">
                                    <div class="table-responsive mb-3">
                                        <p class="links1">
                                            <template v-for="d in indicadoresJudiciaisLista" :key="d.id">
                                                <RouterLink
                                                    :to="{ path: d.urlAmigavel, query: { id: d.id } }"
                                                    class="links2"
                                                >
                                                    {{ d.nome.length > 66 ? d.nome.substring(0, 66) + '...' : d.nome }}
                                                </RouterLink>
                                                <br />
                                            </template>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div class="col">
                    <div class="card border-0">
                        <div class="card-body pb-0">
                            <h2 class="h5ms-2 mh5">Indicadores diários</h2>
                        </div>

                        <div class="card-body">
                            <div class="tab-content">
                                <div class="tab-pane fade show active" id="preview6" role="tabpanel">
                                    <div class="table-responsive mb-3">
                                        <p class="links1">
                                            <RouterLink  class="links2" :to="`/tabelas/dolar-comercial-compra`">Dólar Compra</RouterLink><br />
                                            <RouterLink  class="links2" :to="`/tabelas/dolar-comercial-venda`">Dólar Venda</RouterLink><br />
                                            <RouterLink  class="links2" :to="`/tabelas/euro-compra`">Euro Compra</RouterLink><br />
                                            <RouterLink  class="links2" :to="`/tabelas/euro-venda`">Euro Venda</RouterLink><br />
                                            <RouterLink  class="links2" :to="`/tabelas/urv-unidade-real-de-valor`">URV</RouterLink><br />
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div class="col">
                    <div class="card border-0">
                        <div class="card-body pb-0">
                            <h2 class="h5ms-2 mh5">Outras tabelas úteis</h2>
                        </div>

                        <div class="card-body">
                            <div class="tab-content">
                                <div class="tab-pane fade show active" id="preview6" role="tabpanel">
                                    <div class="table-responsive mb-3">
                                        <p class="links1">
                                            <RouterLink class="links2" :to="`/tabelas/reajuste-aluguel`">Reajuste de aluguel</RouterLink><br />
                                            <RouterLink class="links2" :to="`/tabelas/tabelas-irrf`">IRRF: Imposto de renda</RouterLink><br />
                                            <RouterLink class="links2" :to="`/tabelas/tabelas-inss`">INSS</RouterLink><br />
                                            <RouterLink class="links2" :to="`/tabelas/salario-familia`">Salário família</RouterLink><br />
                                            <RouterLink class="links2" :to="`/tabelas/seguro-desemprego`">Seguro desemprego</RouterLink><br />
                                            <RouterLink class="links2" :to="`/tabelas/juros-simples-e-compostos/1`">Juros simples e compostos</RouterLink><br />
                                            <RouterLink class="links2" :to="`/tabelas/moedas`">Histórico das moedas brasileiras</RouterLink><br />
                                            <RouterLink class="links2" :to="`/tabelas/cpmf`">Contribuição provisória sobre movimentação financeira</RouterLink><br />
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div class="col" >
                    <div class="card border-0">
                        <div class="card-body pb-0">
                            <h2 class="h5ms-2 mh5">Calcule a variação</h2>
                        </div>

                        <div class="card-body pb-0">
                            <CalculadoraVariacao />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </section>


</template>

<style scoped>
.tagPrincipal {
    background-color: #f6f9fc;
}

.mh2 {
    font-family:  "Inter", sans-serif !important;
    margin-top: 30px;
}

.mh5 {
    font-family:  "Inter", sans-serif !important;
    font-size:18px !important;
    font-weight: 600;
}

.mtabela td {
    font-family:  "Inter", sans-serif !important;
    font-size:14px !important;
    color: #000;
    text-align: right;
    padding: 4px;
}

.mtabela th {
    font-weight: 600;
    font-size:16px !important;
    text-align: right;

}

.mtabela tr:hover {
    font-weight: 600;
    font-size:16px !important;
    text-align: right;
    background-color: #eee;
    cursor: pointer;
}

.tagPrincipal {
    background-color: #f6f9fc;
    padding-bottom: 50px;
}

.links1 {
    line-height: 26px;
}

.links2 {
    cursor: pointer;
    text-decoration: underline;
    color: #000;
    padding-left: 0px;
}

</style>