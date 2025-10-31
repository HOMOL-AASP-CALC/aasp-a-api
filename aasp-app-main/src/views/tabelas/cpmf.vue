<script setup>
import { onMounted } from 'vue'
import axios from 'axios'

// Para SEO no Vue, podemos usar document.title e meta manualmente
const route = window.location.pathname

onMounted(() => {
    document.title = 'CPMF: Contribuição Provisória sobre Movimentação Financeira'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
        metaDescription.setAttribute('content', 'Tabela completa da Contribuição Provisória sobre Movimentação Financeira')
    } else {
        const meta = document.createElement('meta')
        meta.name = 'description'
        meta.content = 'Tabela completa da Contribuição Provisória sobre Movimentação Financeira'
        document.head.appendChild(meta)
    }

    const linkCanonical = document.querySelector('link[rel="canonical"]')
    if (linkCanonical) {
        linkCanonical.href = 'https://www.debit.com.br' + route
    } else {
        const link = document.createElement('link')
        link.rel = 'canonical'
        link.href = 'https://www.debit.com.br' + route
        document.head.appendChild(link)
    }

    // Requisição para rastreador
    axios.post(
        'https://api.seuservidor.com/menu/rastreador', // substitua pela URL real
        {
            pagina: 'tabelas-cpmf',
            id_dono: 0,
            parametros: '',
        },
        { withCredentials: true }
    ).then(res => {
        console.log('Rastreador enviado:', res.data)
    }).catch(err => console.error(err))
})
</script>

<template>
    <div>
        <section class="bg-secondary py-5" style="background-color: #f6f9fc;">
            <div class="container pt-5 pb-lg-1 pb-xl-2 py-xxl-5">
                <h1 class="h2 mb-2">CPMF - Contribuição Provisória sobre Movimentação Financeira</h1>
            </div>
            <div style="height: 200px;"></div>
        </section>

        <section class="container white-mode" style="margin-top: -260px;">
            <div class="row row-cols-1 row-cols-sm-1 row-cols-md-2 row-cols-xl-2 g-4 pb-2 pb-sm-4 pb-lg-5">
                <div class="col">
                    <div class="card border-0">
                        <div class="card-body">
                            <div class="tab-content">
                                <div class="tab-pane fade show active" id="preview6" role="tabpanel">
                                    <div class="table-responsive mb-3">
                                        <table class="table table-hover">
                                            <thead>
                                            <tr>
                                                <th class="titulo1">Período</th>
                                                <th class="titulo1">Percentual</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td>15/08/1996<p class="fs-xs">E.C. N<sup>o</sup>12/99 15/08/1996</p></td>
                                                <td>0,25%</td>
                                            </tr>
                                            <tr>
                                                <td>de 23/01/1997 a 31/12/1997<p class="fs-xs">Lei n<sup>o</sup>9.311, de 24 de outubro de 1.996</p></td>
                                                <td>0,20%</td>
                                            </tr>
                                            <tr>
                                                <td>de 01/01/1998 31/12/1998<p class="fs-xs">Lei n<sup>o</sup> 9.539, de 12 de dezembro de 1.997</p></td>
                                                <td>0,20%</td>
                                            </tr>
                                            <tr>
                                                <td>de 01/01/1999 a 21/01/1999<p class="fs-xs">Lei n<sup>o</sup>9.539, de 12 de dezembro de 1.997</p></td>
                                                <td>0,20%</td>
                                            </tr>
                                            <tr>
                                                <td>de 22/01/1999 a 16/06/1999<p class="fs-xs">Suspensa</p></td>
                                                <td>0,00%</td>
                                            </tr>
                                            <tr>
                                                <td>de 17/06/1999 a 31/12/1999<p class="fs-xs">E.C. n<sup>o</sup> 21/99 18/03/1999</p></td>
                                                <td>0,38%</td>
                                            </tr>
                                            <tr>
                                                <td>de 01/01/2000 a 17/06/2000<p class="fs-xs">E.C. n<sup>o</sup> 21/99 18/03/1999</p></td>
                                                <td>0,38%</td>
                                            </tr>
                                            <tr>
                                                <td>de 18/06/2000 a 17/03/2001<p class="fs-xs">E.C. n<sup>o</sup>21/99 18/03/1999</p></td>
                                                <td>0,30%</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    de 18/03/2001 a 17/06/2002<p class="fs-xs">Decreto E.C. n<sup>o</sup> 3.775, 16 de mar&ccedil;o de 2.001 <br>
                                                    Instru&ccedil;&atilde;o Normativa SRF E.C. n<sup>o</sup> 173, de 11 de julho de 2.002</p>
                                                </td>
                                                <td>0,38%</td>
                                            </tr>
                                            <tr>
                                                <td>de 01/01/2002 a 31/12/2002<p class="fs-xs">Instru&ccedil;&atilde;o Normativa SRF n<sup>o</sup> 173, de 11 de julho de 2002</p></td>
                                                <td>0,38%</td>
                                            </tr>
                                            <tr>
                                                <td>de 01/01/2003 a 31/12/2003<p class="fs-xs">Instru&ccedil;&atilde;o Normativa SRF n<sup>o</sup> 173, de 11 de julho de 2002</p></td>
                                                <td>0,38%</td>
                                            </tr>
                                            <tr>
                                                <td>de 01/01/2004 a 31/12/2007<p class="fs-xs">E.C. n<sup>o</sup> 42/2003 18/03/2003</p></td>
                                                <td>0,38%</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>
