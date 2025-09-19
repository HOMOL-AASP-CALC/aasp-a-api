const calcUtil = require("./calcUtil")
const indexadorMesclavel = {
    47: 'Sem correção',
    1: 'ORTN / OTN',
    73: 'BTN',
    42: 'IPC (IBGE)',
    41: 'IPC-r (IBGE)',
    18: 'INPC (IBGE)',
    17: 'IPCA (IBGE)',
    45: 'IPCA-E (IBGE)',
    105: 'Ufir',
    23: 'Selic (simples)',
    24: 'Selic (capitlzd)',
    107: 'IRSM',
    106: 'URV (mensal)',
    3: 'IGP-DI (FGV)',
    4: 'IPC (FGV)',
    80: 'Média IGP/INPC',
    10: 'TR (Bacen)',
    16: 'IGP-M (FGV)',
    87: 'Poupança (Bacen:196)',
    95: 'Poupança (Bacen:7828)'
}

module.exports = {
    montaCalc:  async function (myDoc, dump) {
        var escreveuCustas = false
        let escreveuDeducoes = false

        myDoc.addPage({ size : 'A4'})
        // console.log(' myDoc.y',  myDoc.y)

        if (dump.erro) {
            return;
        }

        var temp1 = [] 
        // ordenar os valores

        if (dump.info.calc_abater_valores) {
            for (var i in dump.lista) {
                if (dump.lista[i].valor > 0 && !dump.lista[i].custas) {
                    temp1.push(dump.lista[i])
                }
            }

            for (var i in dump.lista) {
                if (dump.lista[i].custas == true) {
                    temp1.push(dump.lista[i])
                }
            }

            for (var i in dump.lista) {
                if (dump.lista[i].valor < 0 && !dump.lista[i].custas) {
                    temp1.push(dump.lista[i])
                }
            }

        } else {
            for (var i in dump.lista) {
                if (!dump.lista[i].custas) {
                    temp1.push(dump.lista[i])
                }
            }

            for (var i in dump.lista) {
                if (dump.lista[i].custas == true) {
                    temp1.push(dump.lista[i])
                }
            }
        }

        dump.lista = temp1

        if (dump.info.descricao) {
            var tabelaDescricao = {
                headers: [],
                rows: [],
                titulo: '',
                tipo: 'quadroDescricao',
                borda: false
            };
            myDoc.fontSize(10).fillOpacity(1)
            myDoc.fontSize(10)
            tabelaDescricao.rows.push( ['desc', dump.info.descricao])
            myDoc.table(tabelaDescricao, 10, myDoc.y , { width: 185, rowSpacing: 1 });
            // myDoc.y +=10
        }   
        myDoc.y += 10;
        // coloca em ordem cronológica se necessário
        if (dump.info.calc_ordem) {
            dump.lista.sort(function(a, b) {
                return calcUtil.dia2yyyymmddInt(a.dia) - calcUtil.dia2yyyymmddInt(b.dia) ;
            });
            // console.log(dump.lista)
        }

        // agora ordem - primeiro valores, depois custas
        dump.lista.sort(function(a, b) {
            if (a.custas && !b.custas) {
                return 1
            } else if (!a.custas && b.custas) {
                return -1
            } else {
                return 0
            }
        });

        var tabela = {
            headers: [],
            rows: [],
            titulo: '',
            tipo: 'normal',
            borda: true 
        };

        var tabelaResumo = {
            headers: [],
            rows: [],
            titulo: '',
            tipo: 'resumo' 
        };

        var tabelaTopo = {
            headers: [],
            rows: [],
            titulo: '',
            tipo: 'quadroSuperior1' 
        };

        myDoc.fontSize(10)

        var dia_atualiza_erro = ''
        if (dump.info.diaAtualizacaoErro) {
            dia_atualiza_erro = ` - Corrija no formulário:  ${dump.info.diaAtualizacaoErro}` 
        }

        tabelaTopo.rows.push( ['desc', 'Correção monetária'])
        if (dump.info.calc_selic) {
            tabelaTopo.rows.push( ['desc3',`Valores atualizados utilizando ${dump.info.nomeIndexador} até ${dump.info.selic_inicio}, após SELIC até ${dump.info.selic_fim} ${dia_atualiza_erro}` ])
        } else {
            tabelaTopo.rows.push( ['desc3',`Valores atualizados até ${dump.info.dia_atualiza} ${dia_atualiza_erro} utilizando ${dump.info.nomeIndexador}` ] )
        }
        
        myDoc.table(tabelaTopo, 10, myDoc.y , { width: 80, rowSpacing: 1 });

        if (dump.info.indexador > 1000) {
            let miniTab = {
                headers: [],
                rows: [ ],
                titulo: '',
                tipo: 'miniTab',
                numCols: 3 
            };
            let desc = '';
            miniTab.rows.push( ['desc4', 'Composição da tabela de correção:'] )
            miniTab.rows.push( ['normal', 'Início', 'Fim', 'Indexador'] )

            for (let i in dump.info.resumoTJ) {
                let r = dump.info.resumoTJ[i];
                if (r.desc) { 
                    desc = r.desc 
                } else  {
                    desc = indexadorMesclavel[ r.indexador ]
                }
                miniTab.rows.push(['normal', calcUtil.mesAno2dia(r.inicio), calcUtil.mesAno2dia( r.fim ), desc ]);
            }
            // miniTab.rows.push(['normal', '', '', ''])
            myDoc.table(miniTab, 10, myDoc.y, { width: 185, rowSpacing: 1 });
            myDoc.y += 10
        }

        myDoc.fontSize(8)

        var resumoSoma = {
            valores: { v: 0, c: 0},
            jurosm: { v: 0, c: 0},
            jurosc: { v: 0, c: 0},
            multa: { v: 0, c: 0},
            honorarios: { v: 0, c: 0},
            selic: { v: 0, c: 0},
            total: { v: 0, c: 0} 
        }    

        if (dump.info.calc_modo_impressao == 'c') {
            tabela.rows = [] 
            tabela.tipo = "colunado"
            var numCols = 4
            var novoRow = [ 'colunado', 'Data', 'Valor original', 'Valor atualizado' ]
            if (dump.info.calc_jurosm) {
                novoRow.push('Juros Moratórios')
                numCols++
            }
            if (dump.info.calc_jurosc) {
                novoRow.push('Juros Compensatórios')
                numCols++
            } 
            if (dump.info.calc_multa) {
                novoRow.push('Multa')
                numCols++
            }
            if (dump.info.calc_selic) {
                novoRow.push('Selic')
                numCols++
            }
            if (dump.info.calc_honorarios) {
                novoRow.push('Honorários')
                numCols++
            }
            tabela.numCols = numCols 
            
            novoRow.push('Total')
            tabela.rows.push(novoRow)
        }


        for (var lista in dump.lista) {
            var l = dump.lista[lista]
            // tabela.rows = [] 

            // if (l.valor != 0)  {
            if ((l.valor != 0) && ((l.custas==false) || (l.custas == true && dump.info.calc_custas)))  {
                resumoSoma.valores.v +=Number( l.resultado_atualizacao)
                resumoSoma.jurosm.v +=Number( l.resultado_jurosm)
                resumoSoma.jurosc.v +=Number( l.resultado_jurosc)
                resumoSoma.multa.v +=Number( l.resultado_multa)
                resumoSoma.selic.v +=Number( l.resultado_selic)
                resumoSoma.honorarios.v +=Number( l.resultado_honorarios)
                resumoSoma.total.v +=Number( l.resultado_total)

                if (dump.info.calc_modo_impressao == 'e' || dump.info.calc_modo_impressao == 'm') {  
                    tabela.rows = [] 
                    
                    if (!escreveuCustas && l.custas) {
                        tabela.rows.push([ 'desc3', 'Custas']) 
                        escreveuCustas = true
                    }

                    if (!escreveuDeducoes && dump.info.calc_abater_valores && l.valor < 0) {
                        tabela.rows.push([ 'desc3', 'Subtotal']) 

                        tabela.rows.push([ 'normal', '', 'Valores atualizados', '', calcUtil.formataNum(dump.info.soma_resultado_atualizacao,2)])
                        tabela.rows.push([ 'normal', '', 'Honorários', '', calcUtil.formataNum(dump.info.soma_resultado_honorarios,2)])
                        tabela.rows.push([ 'normal', '', 'Honorários de sucumbência',  '', calcUtil.formataNum(dump.info.valor_honorarios_sucumbencia,2)])
                        tabela.rows.push([ 'normal', '', 'Multa art 523 NCPC',  '', calcUtil.formataNum(dump.info.valor_multa_ncpc,2)])

                        // myDoc.y -=5;
                        myDoc.table(tabela, 10, myDoc.y-15 , { width: 185, rowSpacing: 1 });
                        tabela.rows = []

                        // myDoc.y += 10;
                        tabela.rows.push([ 'desc3', 'Deduções e abatimentos']) 
                        escreveuDeducoes = true

                    }
                    
                    if (l.desc) {
                        tabela.rows.push([ 'desc2', l.desc ])     
                    }

                    tabela.rows.push([ 'normal', 'Valor Orig.', `valor em ${l.dia}`, '', calcUtil.formataNum(l.valor,2)])

                    if (dump.info.calc_modo_impressao == 'e' || dump.info.calc_modo_impressao == 'm') { 
                        if (dump.info.modo_indexador == 'multi' || dump.info.multi_interno ) {
                            for (var m in l.memoriaSimplesMAM) {
                                var lm = l.memoriaSimplesMAM[m]

                                tabela.rows.push([ 'normal', lm.dia, lm.indexador + ' ' + lm.memoriaSimples, calcUtil.formataNum(lm.resultado,2)])
                            }
                        } else {
                            let nomeTab = ''
                            if (dump.info.indexador < 1000) {
                                nomeTab = ': '+dump.info.nomeIndexador
                            }

                            if (l.mostrarSelic) {
                                tabela.rows.push([ 'normal', 'Corr. Mon.', `de ${l.dia} a ${l.selic_ini}${nomeTab}`, l.memoriaSimples, calcUtil.formataNum(l.resultado_atualizacao,2)])

                            } else {
                                tabela.rows.push([ 'normal', 'Corr. Mon.', `de ${l.dia} a ${dump.info.dia_atualiza}`, l.memoriaSimples, calcUtil.formataNum(l.resultado_atualizacao,2)])
                            }
                        }                    
                    
                    }
                    
                    if (dump.info.calc_modo_impressao == 'm') {    
                        let l1 = ['mesames','', 'Data', 'memória de cálculo', 'valor']
                        if (dump.info.calc_jurosc) {
                            l1.push('juros compensatórios')
                        }
                        if (dump.info.calc_jurosm) {
                            l1.push('juros moratórios')
                        }
                        if (dump.info.calc_jurosc || dump.info.calc_jurosm) {
                            l1.push('total')
                        }  
                        l1.push('') // coluna vazia
                        tabela.rows.push(l1)

                        for (var m in l.memoria) {
                            var m1 = l.memoria[m]
                            if (dump.info.modo_indexador == 'multi' || dump.info.multi_interno ) {
                                l1 = [ 'mesames', '',  m1.dia, m1.indice+' '+m1.str, calcUtil.formataNum(m1.valor,2)]
                            } else {
                                l1 = [ 'mesames', '', m1.dia, m1.str, calcUtil.formataNum(m1.valor,2)] 
                            }
                            let total1 = Number( m1.valor)
                            if (dump.info.calc_jurosc) {
                                l1.push( `${calcUtil.formataNum(m1.jurosc_v,2)} (${calcUtil.formataNum(m1.jurosc_p,2)}%)`)
                                total1 += Number(m1.jurosc_v)
                            }
                            if (dump.info.calc_jurosm) {
                                l1.push(`${calcUtil.formataNum(m1.jurosm_v,2)} (${calcUtil.formataNum(m1.jurosm_p,2)}%)`)
                                total1 += Number(m1.jurosm_v)
                            }
                            if (dump.info.calc_jurosm || dump.info.calc_jurosc) {
                                l1.push(`${calcUtil.formataNum(total1,2)}`)
                            }
                            l1.push('')

                            tabela.rows.push(l1)
                        }
                    }

                    // multas, honorarios, juros
                    if (dump.info.calc_jurosm && !escreveuDeducoes ) {
                        let desc1 = ''
                        if (typeof l.jurosm_desc !== 'undefined' && l.jurosm_desc.length > 0) {
                           desc1 = l.jurosm_desc.join("\n");
                        } else {
                            console.log('calculo sem descricao no juros - calcPDF linha 191: ')
                        }
                        tabela.rows.push([ 'normal',  'Juros Morat.', 
                                            desc1,
                                            `${calcUtil.moeda(dump.info.dia_atualiza)} ${ calcUtil.formataNum(l.base_jurosm,2) } x ${ calcUtil.formataNum(l.resultado_jurosm_percentual,2)}% `,
                                            calcUtil.formataNum(l.resultado_jurosm,2)])
                        resumoSoma.jurosm.v += Number(l.resultado_jurosm)
                    }

                    if (dump.info.calc_jurosc && !escreveuDeducoes ) {
                        let desc1 = ''
                        if (typeof l.jurosc_desc !== 'undefined' && l.jurosc_desc.length > 0) {
                           desc1 = l.jurosc_desc.join("\n");
                        } else {
                            console.log('calculo sem descricao no juros - calcPDF linha 263: ')
                        }

                        tabela.rows.push([ 'normal',  'Juros Compens.', 
                        desc1,
                        `${calcUtil.moeda(dump.info.dia_atualiza)} ${ calcUtil.formataNum(l.resultado_atualizacao,2) } x ${ calcUtil.formataNum(l.resultado_jurosc_percentual,2)}% `,
                        calcUtil.formataNum(l.resultado_jurosc,2)])
                    }

                    if (dump.info.calc_multa && !escreveuDeducoes ) {
                        tabela.rows.push(['normal', 'Multa', '',  `${ calcUtil.moeda(dump.info.dia_atualiza ) } ${ calcUtil.formataNum(l.resultado_multa_base,2) } x ${ calcUtil.formataNum( l.resultado_multa_percentual,2) }%`, calcUtil.formataNum(l.resultado_multa,2)])
                        resumoSoma.multa.v += Number(l.resultado_multa)
                    }

                    // if (dump.info.calc_selic) {
                    if (l.mostrarSelic) {
                        tabela.rows.push(['normal', 'Selic',`de ${l.selic_ini} a ${l.selic_fim}`, `R$ ${calcUtil.formataNum(l.base,2)}  x ${calcUtil.formataNum(l.resultado_selic_percentual,2)}%`, calcUtil.formataNum(l.resultado_selic,2)])
                        resumoSoma.selic.v += Number(l.resultado_selic)
 
                        if (dump.info.calc_modo_impressao == 'm') {     
                            for (var m in l.resultado_selic_mesAmes) {
                                var m1 = l.resultado_selic_mesAmes[m]
                                tabela.rows.push([ 'mesames', '', m1.dia, m1.str, calcUtil.formataNum(m1.valor,2), ''])
                            }
                        }
                        
                    }



                    if (dump.info.calc_honorarios && !escreveuDeducoes ) {
                        tabela.rows.push(['normal', 'Honorários', '', `R$ ${ calcUtil.formataNum(l.honorarios_base,2) } x ${ calcUtil.formataNum( dump.info.honorarios.valor,2) }%`,`${calcUtil.formataNum(l.resultado_honorarios,2)}` ])
                        resumoSoma.honorarios.v += Number(l.resultado_honorarios)
                    }

                    if ((dump.info.calc_honorarios || dump.info.calc_multa || dump.info.calc_jurosm || dump.info.calc_jurosc) && (!dump.info.calc_abater_valores)) {
                        tabela.rows.push(['normal', 'Subtotal', ``, ``,  calcUtil.formataNum(l.resultado_total,2)])

                        resumoSoma.total.v += Number(l.resultado_total) 
                    }
                    myDoc.table(tabela, 10, myDoc.y , { width: 185, rowSpacing: 1 });
                    myDoc.y += 15
                } else {

                    if (l.desc) {
                        tabela.rows.push([ 'desc2', l.desc ])     
                    }
                    var novoRow = [ 'colunado', l.dia, calcUtil.formataNum(l.valor,2), calcUtil.formataNum(l.resultado_atualizacao,2) ]
                    if (dump.info.calc_jurosm) {
                        novoRow.push( calcUtil.formataNum(l.resultado_jurosm, 2) + ' ('+ calcUtil.formataNum(l.resultado_jurosm_percentual,2) + '%)' )
                    }
                    if (dump.info.calc_jurosc) {
                        novoRow.push( calcUtil.formataNum(l.resultado_jurosc,2) + ' ('+ calcUtil.formataNum(l.resultado_jurosc_percentual,2) + '%)')
                    } 
                    if (dump.info.calc_multa) {
                        novoRow.push( calcUtil.formataNum(l.resultado_multa,2))
                    }
                    if (dump.info.calc_selic) {
                        novoRow.push( calcUtil.formataNum(l.resultado_selic,2))
                    }

                    if (dump.info.calc_honorarios) {
                        novoRow.push( calcUtil.formataNum(l.resultado_honorarios,2))
                    }
                    novoRow.push( calcUtil.formataNum(l.resultado_total, 2) )
                    tabela.rows.push(novoRow)
               
                }
                // console.log('---------------', tabela)
                // myDoc.table(tabela, 10, myDoc.y , { width: 185, rowSpacing: 1 });
            }
        }

        if (dump.info.calc_modo_impressao == 'c') {
            var nColunas = 0
            var maisUmTotal = (typeof dump.info.valor_honorarios_sucumbencia  !== 'undefined' && dump.info.valor_honorarios_sucumbencia > 0)  || (typeof dump.info.valor_multa_ncpc !== 'undefined' &&  dump.info.valor_multa_ncpc > 0)

            var novoRow = [ 'colunado', (maisUmTotal) ? 'Subtotal' : 'Total', '', 
                            calcUtil.formataNum(resumoSoma.valores.v,2),  
                        ]
            if (dump.info.calc_jurosm) {
                novoRow.push( calcUtil.formataNum(resumoSoma.jurosm.v, 2) )
                nColunas++
            }
            if (dump.info.calc_jurosc) {
                novoRow.push( calcUtil.formataNum(resumoSoma.jurosc.v,2))
                nColunas++
            } 
            if (dump.info.calc_multa) {
                novoRow.push( calcUtil.formataNum(resumoSoma.multa.v,2))
                nColunas++
            }
            if (dump.info.calc_selic) {
                novoRow.push( calcUtil.formataNum(resumoSoma.selic.v,2))
                nColunas++
            }
            if (dump.info.calc_honorarios) {
                novoRow.push( calcUtil.formataNum(resumoSoma.honorarios.v,2))
                nColunas++
            }
            novoRow.push( calcUtil.formataNum(resumoSoma.total.v, 2) )
            tabela.rows.push(novoRow)
            


            if (typeof dump.info.valor_multa_ncpc !== 'undefined' &&  dump.info.valor_multa_ncpc > 0) {
                novoRow = [ 'colunado', 'Multa do art. 523 NCPC', '',  '']
                for (var i1 = 0; i1 < nColunas; i1++) { 
                    novoRow.push( '' )
                }
                novoRow.push( calcUtil.formataNum(dump.info.valor_multa_ncpc,2) )  
                    
                tabela.rows.push(novoRow)
            }

            if (dump.info.calc_multa_ncpc && dump.info.multa523.honorarios523_a_parte &&  dump.info.valor_honorarios_ncpc > 0) {
                novoRow = [ 'colunado', 'Honorários ref. a multa art. 523 NCPC', '',  '']
                for (var i1 = 0; i1 < nColunas; i1++) { 
                    novoRow.push( '' )
                }
                novoRow.push( calcUtil.formataNum(dump.info.valor_honorarios_ncpc,2) )  
                    
                tabela.rows.push(novoRow)
            }


            if (typeof dump.info.valor_honorarios_sucumbencia  !== 'undefined' && dump.info.valor_honorarios_sucumbencia > 0) {
                novoRow = [ 'colunado', 'Honorários de sucumbência', '',  '']
                for (var i1 = 0; i1 < nColunas; i1++) { 
                    novoRow.push( '' )
                }
                novoRow.push(calcUtil.formataNum(dump.info.valor_honorarios_sucumbencia,2) )
                            
                tabela.rows.push(novoRow)
            }


            if (maisUmTotal) {
                novoRow = [ 'colunado', 'Total', '', '']
                for (var i1 = 0; i1 < nColunas; i1++) { 
                    novoRow.push( '' )
                }
                novoRow.push(calcUtil.formataNum(dump.info.totalzao,2))
                tabela.rows.push(novoRow)
            }
     

            myDoc.table(tabela, 10, myDoc.y , { width: 185, rowSpacing: 1}); 
        
        } else {


            // ---------
            // resumo
            // ---------

            tabelaResumo.rows = []

            let soma_desatualiza = ''
            let soma_desatualiza2 = ''
            let soma_desatualiza3 = ''

            for (let w = 0; w <= 6; w++) {
                if (dump.info.soma_resultado_desatualizado[w].valor != 0) {
                    soma_desatualiza += `${dump.info.soma_resultado_desatualizado[w].moeda} ${calcUtil.formataNum(dump.info.soma_resultado_desatualizado[w].valor,2)} \n`
                }
                if (dump.info.soma_custas_desatualizado[w] &&  dump.info.soma_custas_desatualizado[w].valor != 0) {
                    soma_desatualiza2 += `${dump.info.soma_custas_desatualizado[w].moeda} ${calcUtil.formataNum(dump.info.soma_custas_desatualizado[w].valor,2)} \n`
                }
                if (dump.info.soma_custas_desatualizado[w] &&  dump.info.soma_custas_desatualizado[w].valor+dump.info.soma_resultado_desatualizado[w].valor != 0) {
                    soma_desatualiza3 += `${dump.info.soma_custas_desatualizado[w].moeda} ${calcUtil.formataNum(dump.info.soma_custas_desatualizado[w].valor+dump.info.soma_resultado_desatualizado[w].valor,2)} \n`
                }
            }

            tabelaResumo.rows.push(['desc', 'Resumo'])
            tabelaResumo.rows.push(['resumo', '', 'Valores', 'Custas', 'Total'])

            tabelaResumo.rows.push(['resumo', 'Valores sem atualização', soma_desatualiza, soma_desatualiza2, soma_desatualiza3 ])

            tabelaResumo.rows.push(['resumo', 'Valores atualizados', calcUtil.formataNum(dump.info.soma_resultado_atualizacao,2), calcUtil.formataNum(dump.info.soma_custas_atualizacao,2), calcUtil.formataNum(dump.info.soma_resultado_atualizacao+dump.info.soma_custas_atualizacao,2)])

            if (resumoSoma.jurosm.v != 0) {
                tabelaResumo.rows.push(['resumo', 'Juros moratórios', calcUtil.formataNum(dump.info.soma_resultado_jurosm,2), calcUtil.formataNum(dump.info.soma_custas_jurosm,2), calcUtil.formataNum(dump.info.soma_resultado_jurosm+dump.info.soma_custas_jurosm,2)])
            }

            if (resumoSoma.jurosc.v > 0) {
                tabelaResumo.rows.push(['resumo', 'Juros compensatórios', 
                calcUtil.formataNum(dump.info.soma_resultado_jurosc,2), 
                calcUtil.formataNum(dump.info.soma_custas_jurosc,2), 
                calcUtil.formataNum(dump.info.soma_resultado_jurosc+dump.info.soma_custas_jurosc,2)])
            }

            if (resumoSoma.multa.v != 0) {
                tabelaResumo.rows.push(['resumo', 'Multa', calcUtil.formataNum(dump.info.soma_resultado_multa,2), calcUtil.formataNum(dump.info.soma_custas_multa,2), calcUtil.formataNum(dump.info.soma_resultado_multa+dump.info.soma_custas_multa,2)])
            }

            if (resumoSoma.selic.v != 0) {
                tabelaResumo.rows.push(['resumo', 'Selic', calcUtil.formataNum(dump.info.soma_resultado_selic,2), calcUtil.formataNum(dump.info.soma_custas_selic,2), calcUtil.formataNum(dump.info.soma_resultado_selic+dump.info.soma_custas_selic,2)])
            }


            if (dump.info.soma_resultado_honorarios != 0) { 
                tabelaResumo.rows.push(['resumo', 'Honorários', calcUtil.formataNum(dump.info.soma_resultado_honorarios,2), calcUtil.formataNum(dump.info.soma_custas_honorarios,2), calcUtil.formataNum(dump.info.soma_resultado_honorarios+dump.info.soma_custas_honorarios,2)])
            }

            if (dump.info.valor_multa_ncpc != 0) {
                tabelaResumo.rows.push(['resumo', 'Multa do art. 523 NCPC', '-', '-', calcUtil.formataNum(dump.info.valor_multa_ncpc,2)])
            }
            
            if ((dump.info.calc_multa_ncpc && dump.info.multa523.honorarios523_a_parte &&  dump.info.valor_honorarios_ncpc > 0)) {
                tabelaResumo.rows.push(['resumo', 'Honorários ref. a multa art. 523 NCPC', '-', '-', calcUtil.formataNum(dump.info.valor_honorarios_ncpc,2)])
            }



            if (dump.info.valor_honorarios_sucumbencia != 0) {
                var s1 = ''
                if (dump.info.sucumbencias.modo == 'p') {
                    s1 = `(${calcUtil.formataNum(dump.info.sucumbencias.valor,2)}%)`
                }
                tabelaResumo.rows.push(['resumo', `Honorários de sucumbência ${s1}`, '-', '-', calcUtil.formataNum(dump.info.valor_honorarios_sucumbencia,2)])
            }

            if (dump.info.calc_abater_valores ) {
                tabelaResumo.rows.push(['resumo', 'Deduções / abatimentos', calcUtil.formataNum(dump.info.soma_deducoes_atualizacao+dump.info.soma_deducoes_selic,2), '0,00', calcUtil.formataNum(dump.info.soma_deducoes_atualizacao+dump.info.soma_deducoes_selic,2) ])
            }

            tabelaResumo.rows.push(['resumo', 'Total', calcUtil.formataNum(dump.info.soma_final_resultado,2), calcUtil.formataNum(dump.info.soma_final_custas,2), calcUtil.formataNum(dump.info.totalzao,2)])
            myDoc.table(tabelaResumo, 10, myDoc.y , { width: 185, rowSpacing: 1 });
        } 

        myDoc.rodape () 

        myDoc.end();
    }

 }
  