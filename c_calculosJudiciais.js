const calc = require('./calc.js');

module.exports = function() {
    const calcUtil = require('./calcUtil.js');
    
    let tabJ = {} 
    let tabelas = {}
    let tabelaMaximo = {}

    this.setVariaveis = function (variaveis) {
        tabelas = variaveis.tabelas
        tabJ = variaveis.tabJ
        lista = variaveis.tabelaMaximo
        tabelaMaximo = {}
        // console.table(lista)
        for (let x in lista) {
            tabelaMaximo[ lista[x].indice ] = lista[x] 
            if (lista[x].indice == 23) {
                tabelaMaximo[ 31 ] = JSON.parse( JSON.stringify( lista[x] ) )
                tabelaMaximo[ 31 ].indice = 31
                tabelaMaximo[ 31 ].nome = 'SELIC + 1% (RFB)'
                let d1 = calcUtil.yyyymmdd2dia( tabelaMaximo[ 31 ].maximo )
                d1 = calcUtil.somaMes( d1 )
                tabelaMaximo[ 31 ].maximo = parseInt( calcUtil.dia2yyyymmdd( d1 ) ) 
            }
        }
        // console.log('tabelaMaximo', tabelaMaximo)
    }

    this.validar = function (d) {
    }

    this.posLeituraArquivo = function (d) {
        // console.log(d.tabelaPersonalizada)
        if (d.tabelaPersonalizada && d.tabelaPersonalizada.length > 0) {
            d.tabelaPersonalizada = d.tabelaPersonalizada.filter( x => (x.m) )
        }
        // console.table(d.tabelaPersonalizada)
        return d;
    }

    this.criar = function ( infoInicial ) {
        return {
            idCalc: infoInicial.idCalc,
            hash: infoInicial.hash,
            idDono: infoInicial.idDono,
            nome: 'cálculo sem nome',
            email: '',
            dataAtual: calcUtil.diaHoje(),
            indexador: 1,
            valorList: [{dia:'',valor:0,desc:''}],
            sucumList: [{dia:'',valor:0,desc:''}],
            jurosTab: [ { modo: 'L', ate: 0 } ],
            modoSelic: 'princJuros',
            tabelaPersonalizada: [ ],
            honoSucumDiaInicioJuros: '',
        }
    }

    this.calcularJurosTab = function (fim, d)  {
        let jurosTab = d.jurosTab
        let r = []
        let modo = 'x'
        let p = 0
        let linhaModo = 0
        let l = jurosTab.length-1

        // out/1964 = 23578
        // primeiro seleciona todos os percentuais que serão utilizados
        for (let x=23578; x<=fim-1; x++) {
            if (linhaModo < l ) {
                if (x > jurosTab[ linhaModo ].ate) {
                    linhaModo++
                }
            } 
            modo = jurosTab[ linhaModo ].modo
            // console.log('modo: ', modo)

            if (modo == '0') { p = 0 }
            if (modo == '6') { p =  0.5 }
            if (modo == '12') { p = 1 }
            if (modo == 'P') { 
                p = 0
                if (tabelas[ 108 ][ x ]) {
                    p = tabelas[ 108 ][ x ].valor
                } 
            }
            if (modo == 'L') { 
                p = 0
                if (tabelas[ 109 ][ x ]) {
                    p = tabelas[ 109 ][ x ].valor
                } 
            }
            if (d.calc_selic && d.selic_inicio <= x) {
                p = 0 
            }
            r[ x ] = { p, dia: calcUtil.mesAno2dia(x) }
        }
        r[ fim ] = { p: 0, dia: calcUtil.mesAno2dia(fim) } // ultimo dia

        // console.table(r)

        // volta somando 
        let soma = 0
        for (let x=fim; x >= 23578; x--) {
            soma += r[ x ].p
            r[ x ].j = soma 
        }

        // monta a coluna de somar
        // console.table(r)
        return  r;
    }

    this.pegaTabelaJudicialIndexada = async (d) => {
        let tabM = null 

        if (d.indexador > 0) {
            tabM = await this.leTabelaJudicial(d.indexador)
        } else {
            tabM = {
                tipo: 'tabelasJudiciais',
                idCalc: '-1',
                nome: 'Tabela Personalizada',
                vl: d.tabelaPersonalizada 
            }
        }

        if (typeof d.calc_selic !== 'undefined' && d.calc_selic) {
            tabM.selic_calc = d.calc_selic
            tabM.selic_inicio = d.selic_inicio
        }

        let t1 = tabJ.calcular( tabM ).vl
        let rt = this.resumoT( t1 )
        let t = tabJ.limitarCorrecao( t1, d.dataAtual )

        let r = {}
        for (let x in t) {
            r[ t[x].m ] = t[x]
        }
        return { r, rt, nome: tabM.nome } 
    }   

    this.resumoT = function( valorList ) {
        let resumo = [] 
        let inicio = 0
        let indexador = 0
        let especial = {}
    
        for (var i in valorList) {
            var item = valorList[i]
            // console.log(JSON.stringify(item))
            if (inicio == 0 || indexador == -1 || indexador != item.i) {
                if (inicio != 0) {
                    if (indexador == -1) {
                        resumo.push( { inicio, fim: item.m-1, indexador, desc: 'Fixado em ' + calcUtil.formataNum(especial.valorEspecifico,2)+'%'  } )
                    } else {
                        resumo.push( { inicio, fim: item.m-1, indexador } )
                    }
                }
                inicio = item.m
                indexador = item.i
            }
            especial = item.especial
        }
    
        if (item) {
            resumo.push( { inicio: inicio, fim: item.m, indexador: indexador } )
        }
        // console.log(resumo)
        return resumo;
    }

    this.tabelaDireta = async (d) => {
        // console.log(d)
        let j2 = []
        let t1 = await this.pegaTabelaJudicialIndexada(d)
        let t = t1.r
        let mesanoAtual = calcUtil.dia2intMesAno( d.dataAtual )
        let j = this.calcularJurosTab( mesanoAtual , d)

        // console.log(d)

        for (let i in t) {
            let item = t[i]
            if (typeof j[ item.m ] === 'undefined') {
                j[ item.m ] = { j: 0, p: 0 }
            } 
            
            j[ item.m ].indiceGerado = item.indiceGerado
            j[ item.m ].selicAcumulada = item.selicAcumulada
            j[ item.m ].indexador = item.indexador
            j[ item.m ].variacao = item.variacao
        }

        for (let x in j) {
            if (j[x]) { 
              j2.push( { mesano: x, juros: j[x].j, indiceGerado: j[x].indiceGerado, selicAcumulada: j[x].selicAcumulada, indexador: j[x].indexador, variacao: j[x].variacao } )
            }
        }

        let dataMaxima = 0
        let indexador1 = t1.rt[ t1.rt.length-1 ].indexador
        if ( indexador1 >= 0) {
            console.log('indexador, maximo', indexador1 ); // , tabelaMaximo[ indexador1].maximo )
            if (typeof tabelaMaximo[ indexador1 ] === 'undefined') {
                console.log('############################### c_calculosJudiciais linha 208 ---------------- não achei o indexador')
                dataMaxima = '01/01/1980'
            } else {
                dataMaxima = calcUtil.yyyymmdd2dia( tabelaMaximo[ indexador1 ].maximo )
            }
            
        } else {
            dataMaxima = '01/' + calcUtil.mesAno2dia( j2[ j2.length-1 ].mesano )
        }
        

        if (d.completa) {
            return {
                tabela: j2,
                resumo: t1.rt,
                nome: t1.nome,
                dataMaxima  
            }
        } else {
            return j2 
        }
        
    }

    

    this.calcular = async (d) => {
        let t1 = await this.pegaTabelaJudicialIndexada(d)
        let t = t1.r
        let resumoTab = t1.rt

        // console.log(t[24265])
        let mesanoAtual = calcUtil.dia2intMesAno( d.dataAtual )
        let moeda = calcUtil.moeda( d.dataAtual )
        let jurosT = this.calcularJurosTab(mesanoAtual, d)

        let r = []
        let totalPrincipal = 0
        let totalSelic = 0
        let totalJuros = 0
        let totalSucumPrincipal = 0
        let totalSucumSelic = 0
        let totalSucumFinal = 0
        if (!d.modoSelic) d.modoSelic = 'princJuros'
        
        for (let i in d.valorList) {
            let item = d.valorList[i]
            if (item.dia && item.valor != 0) {
                let mesano = calcUtil.dia2intMesAno( item.dia )
                let tma = t[ mesano ]
                // console.log('l: 157 - ',item, mesano, tma)
                if (!tma) {
                    tma = {
                        m: mesano,
                        ano: 0,
                        i: 1,
                        especial: undefined,
                        indiceGerado: 0,
                        indiceOriginal: 0,
                        variacao: 0,
                        selicAcumulada: 0 
                    }
                    console.log('### zerei tma')
                }
                // console.log('### mesano', item, mesano, tma)
                // calc
                let principalCorrigido = item.valor * tma.indiceGerado 
                var juros = 0
                if (jurosT[ mesano ] && jurosT[ mesano ].j) {
                    juros = jurosT[ mesano ].j 
                }
                let jurosPrincipal = (juros/100) * principalCorrigido 
                
                let selicValor = (tma.selicAcumulada / 100) * (principalCorrigido + jurosPrincipal)
                if (d.modoSelic == 'princ') {
                    selicValor = (tma.selicAcumulada / 100) * principalCorrigido 
                }
                let total = principalCorrigido + jurosPrincipal + selicValor

                totalPrincipal += principalCorrigido
                totalSelic += selicValor
                totalJuros += jurosPrincipal

                r.push({
                    dia: mesano,
                    principal: item.valor,
                    correcaoMonetaria: tma.indiceGerado,
                    principalCorrigido,
                    juros,
                    jurosPrincipal,
                    selic: tma.selicAcumulada,
                    selicValor,
                    total,
                    desc: item.desc
                })
            }
        }

        let totalFinal = totalPrincipal + totalSelic + totalJuros
        let sucumbencias = []

        for (let x in d.sucumList) {
            if (d.sucumList[x].valor != 0 && d.sucumList[x].dia != '' && d.sucumList[x].dia ) {
                let linha = {}
                let iniJur = calcUtil.dia2intMesAno( d.sucumList[x].dia ) 
                linha.desc = d.sucumList[x].desc 
                linha.dia = calcUtil.dia2intMesAno( d.sucumList[x].dia ) 
                linha.principal = d.sucumList[x].valor
                if (typeof t[ linha.dia ] === 'undefined' || typeof t[ linha.dia ].indiceGerado === 'undefined') {
                    linha.correcaoMonetaria = 0 
                } else {
                    linha.correcaoMonetaria = t[ linha.dia ].indiceGerado
                }
                linha.principalCorrigido = linha.principal * linha.correcaoMonetaria
                if (typeof linha.juros === 'undefined') {
                    linha.juros = 0
                }  else {
                    linha.juros = jurosT[ iniJur ].j
                }

                if (typeof t[ iniJur ] === 'undefined' || typeof t[ iniJur ].indiceGerado === 'undefined') {
                    linha.selic = 0
                } else {
                    linha.selic = t[ iniJur ].selicAcumulada
                }
                linha.selicValor = linha.principalCorrigido * ((linha.selic+linha.juros) / 100)
                linha.total = linha.selicValor + linha.principalCorrigido

                totalSucumPrincipal += linha.principalCorrigido 
                totalSucumSelic += linha.selicValor
                totalSucumFinal += linha.total 
                sucumbencias.push(linha)
            }
        }

        if (d.calcularHonoSucum) {
            let linha = {}
            
            if (d.honoSucumModo == 'certo') {
                let iniJur = calcUtil.dia2intMesAno( d.honoSucumDiaInicioJuros)
                linha.desc = `Hon. adv. fixados sobre valor certo - ${calcUtil.moeda(d.honoSucumDiaFixacao)} ${calcUtil.formataNum(d.honoSucumValor,2)}` 
                linha.dia = calcUtil.dia2intMesAno( d.honoSucumDiaFixacao ) 
                linha.principal = d.honoSucumValor
                linha.correcaoMonetaria = 0
                linha.juros = 0
                linha.selic = 0

                if (typeof t[ linha.dia ] !== 'undefined' && typeof t[ linha.dia ].indiceGerado !=='undefined') {
                    linha.correcaoMonetaria = t[ linha.dia ].indiceGerado
                }
                
                if (typeof jurosT[ iniJur ] !== 'undefined' && typeof jurosT[ iniJur ].j !== 'undefined') {
                    linha.juros = jurosT[ iniJur ].j 
                }

                if (typeof t[ iniJur ] !== 'undefined' && typeof t[ iniJur ].selicAcumulada !== 'undefined') {
                    linha.selic = t[ iniJur ].selicAcumulada
                } 

                linha.principalCorrigido = linha.principal * linha.correcaoMonetaria
                linha.selicValor = linha.principalCorrigido * ((linha.selic+linha.juros) / 100)
                linha.total = linha.selicValor + linha.principalCorrigido
            }

            if (d.honoSucumModo == 'causa') {
                if (!d.honoSucumDiaInicioJuros) d.honoSucumDiaInicioJuros = ''
                let iniJur = calcUtil.dia2intMesAno( d.honoSucumDiaInicioJuros )
                linha.desc = `Hon. adv. fixados sobre valor da causa - ${calcUtil.moeda(d.honoSucumDiaAjuzuizamento)} ${calcUtil.formataNum(d.honoSucumValorCausa,2)}` 
                linha.dia = calcUtil.dia2intMesAno( d.honoSucumDiaAjuzuizamento ) 
                linha.principal = d.honoSucumValorCausa * d.honoSucumPercentual / 100 
                linha.correcaoMonetaria = 0
                linha.juros = 0
                linha.selic = 0 

                if (typeof t[ linha.dia ] !== 'undefined' & typeof t[ linha.dia ].indiceGerado !== 'undefined') {
                    linha.correcaoMonetaria = t[ linha.dia ].indiceGerado
                }
                
                if (typeof jurosT[ iniJur ] !== 'undefined' && typeof jurosT[ iniJur ].j !== 'undefined' && jurosT[ iniJur ].j) {
                    linha.juros = jurosT[ iniJur ].j 
                }

                if (typeof t[ iniJur ] !== 'undefined' && typeof t[ iniJur ].selicAcumulada !== 'undefined') {
                    linha.selic = t[ iniJur ].selicAcumulada
                }

                linha.principalCorrigido = linha.principal * linha.correcaoMonetaria
                linha.selicValor = linha.principalCorrigido * ((linha.selic+linha.juros) / 100)
                linha.total = linha.selicValor + linha.principalCorrigido
            }

            if (d.honoSucumModo == 'condenacao') {
                linha.desc = `Hon. adv. fixados sobre valor da condenação - ${calcUtil.moeda(d.dataAtual)} ${calcUtil.formataNum(totalFinal,2)}` 
                linha.dia = calcUtil.dia2intMesAno( d.dataAtual ) 
                linha.principal = "x"
                linha.correcaoMonetaria = "x"
                linha.principalCorrigido = totalPrincipal * (d.honoSucumPercentual / 100)
                linha.juros = "x"
                linha.selic = "x"
                linha.selicValor = (totalJuros + totalSelic) * (d.honoSucumPercentual / 100)
                linha.total = linha.selicValor + linha.principalCorrigido
            }

            totalSucumPrincipal += linha.principalCorrigido 
            totalSucumSelic += linha.selicValor
            totalSucumFinal += linha.total
            sucumbencias.push(linha)
        }

        if (d.calcularHonoComp) {
            let linha = {}

            if (d.honoCompModo == 'baseUsuario') {
                // console.log(d)
                let iniJur = d.honoCompData ? calcUtil.dia2intMesAno( d.honoCompData) : 0
                linha.desc = `Hon. adv. sobre valor informado pelo usuário - ${calcUtil.moeda(d.honoCompData)} ${calcUtil.formataNum(d.honoCompValor,2)}` 
                linha.dia = d.honoCompData ? calcUtil.dia2intMesAno( d.honoCompData ) : 0 
                linha.principal = d.honoCompValor * d.honoCompPercentual / 100
                if (typeof t[ linha.dia ] !== 'undefined' && typeof t[ linha.dia ].indiceGerado !== 'undefined') {
                    linha.correcaoMonetaria = t[ linha.dia ].indiceGerado
                } else {
                    linha.correcaoMonetaria = 0
                }
                
                linha.principalCorrigido = linha.principal * linha.correcaoMonetaria
                linha.juros = 0
                if (typeof t[ iniJur ] !== 'undefined' && typeof t[ iniJur ].indiceGerado !== 'undefined') {
                    linha.juros = jurosT[ iniJur ].j 
                }
                
                linha.selic = 0
                if (typeof t[ iniJur ] !== 'undefined' && typeof t[ iniJur ].selicAcumulada !== 'undefined') {
                    linha.selic = t[ iniJur ].selicAcumulada
                }
                
                linha.selicValor = linha.principalCorrigido * ((linha.selic+linha.juros) / 100)
                linha.total = linha.selicValor + linha.principalCorrigido
            }

            if (d.honoCompModo == 'apenasSucumbecia') {
                let vr = totalSucumFinal
                linha.desc = `Hon. adv. fixados sobre valor da sucumbência - ${calcUtil.moeda(d.dataAtual)} ${calcUtil.formataNum(vr,2)} x 10%` 
                linha.dia = calcUtil.dia2intMesAno( d.dataAtual ) 
                linha.principal = "x"
                linha.correcaoMonetaria = "x"
                linha.principalCorrigido = vr / 10  // 10% da sucumbência
                linha.juros = "x" 
                linha.selic = "x"
                linha.selicValor = "x"
                linha.total = linha.principalCorrigido
            }

            if (d.honoCompModo == 'valorExecucao') {
                let vr = totalSucumFinal + totalFinal 
                linha.desc = `Hon. adv. fixados sobre valor da execução - ${calcUtil.moeda(d.dataAtual)} ${calcUtil.formataNum(vr,2)} x 10%` 
                linha.dia = calcUtil.dia2intMesAno( d.dataAtual )
                linha.principal = "x"
                linha.correcaoMonetaria = "x"
                linha.principalCorrigido = vr / 10  // 10% da sucumbência
                linha.juros = "x" 
                linha.selic = "x"
                linha.selicValor = "x"
                linha.total = linha.principalCorrigido
            }

            totalSucumPrincipal += linha.principalCorrigido 
            totalSucumSelic += linha.selicValor
            totalSucumFinal += linha.total 
            sucumbencias.push(linha)
        }

        let totalizacaoNum = totalFinal + totalSucumFinal
        
        let totalizacao = [{ desc: `Valores (principal corrigido: ${moeda} ${calcUtil.formataNum(totalPrincipal,2)} + Juros: ${moeda} ${calcUtil.formataNum(totalJuros,2)} + Selic ${moeda}  ${calcUtil.formataNum(totalSelic,2)})  `, valor: totalFinal} ]

        if (sucumbencias.length>0) {
            totalizacao.push({ desc: 'Sucumbências', valor: 'x' })
        }

        for (let x in sucumbencias) {
            totalizacao.push({
                desc: sucumbencias[x].desc + `(principal corrigido: ${moeda} ${calcUtil.formataNum(sucumbencias[x].principalCorrigido ,2)} + Juros/Selic ${moeda}  ${calcUtil.formataNum(sucumbencias[x].selicValor,2)}) `,
                valor: sucumbencias[x].total
            })
        }

        let totalizacaoFinal = totalizacaoNum

        if (d.outrasSucum) {
            totalizacao.push({ desc: 'Subtotal', valor: totalizacaoNum })

            if (d.outrasSucumMulta10) {
                totalizacao.push({ desc: 'Multa 10% - art. 523, §1º, CPC/2015 (antigo art. 475-J, CPC/1976)', valor: totalizacaoNum * 0.1 })
                totalizacaoFinal += (totalizacaoNum * 0.1)
            }

            if (d.outrasSucumHono10) {
                totalizacao.push({ desc: 'Honorários advocatícios 10% - art. 523, §1º, CPC/2015', valor: totalizacaoNum * 0.1 })
                totalizacaoFinal += (totalizacaoNum * 0.1)
            }
        }

        let res = { 
                        valores: { planilha: r, totalPrincipal, totalSelic, totalJuros, totalFinal },
                        sucumbencias: { planilha: sucumbencias, totalSucumPrincipal, totalSucumSelic, totalSucumFinal }, 
                        totalizacao: { planilha: totalizacao, totalizacaoFinal },
                        resumoTab 
                }
        // console.log(res)
        return res 
    }

}
