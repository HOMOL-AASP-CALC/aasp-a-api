module.exports = function() { 
    const calcUtil = require('./calcUtil.js');
    const BigNumber = require('bignumber.js');
    const pdf = require('pdf-parse');

    let tabJ = {} 
    let tabelas = {}
    let tabelaPrevReajuste = {}  

    this.setVariaveis = function (variaveis) {
        // console.log('setVariaveis', variaveis)
        tabelas = variaveis.tabelas
        tabJ = variaveis.tabJ
        tabelaPrevReajuste = variaveis.tabelaPrevReajuste 
    }

    this.temSal13 = function (ma) {
        let m = calcUtil.mesAno2intMes( ma )
        let a = calcUtil.mesAno2intAno( ma )

        let r = 0 
        if (((m == 12) || (m == 8 )) && a > 2005) { r = 0.5 }
        if (m == 12 && a <= 2005) { r = 1 }
        return r 
    }

    this.indicePropMes = function (d) {
        let dia = calcUtil.dia2intDia( d )
        let diasMes = calcUtil.diasMes( d )        
        if (diasMes > 30) diasMes = 30

        let r = diasMes - dia + 1
        let r1 = r / diasMes
        return r1
    }
    
    this.bigNumberFit = function (n) {
        if (typeof n != 'String') {
            n = n.toString()
        }
		var s_n = n.toString();
		if (s_n.length > 15) {
			var r = parseFloat(s_n.substring(0,15))
			// console.log(r)
			return  r
		}
		return n;
	}

    this.extractDataFromPDF = async function (dataBuffer)  {
        return pdf(dataBuffer).then((data) => {
          const text = data.text;

          const regex = /(\d{2}\/\d{4})\s+([\d.,]{2,})/g;
          let match;
          const lista = [];
      
          while ((match = regex.exec(text)) !== null) {
            const c = match[1];
            const r = match[2];
            const r2 = calcUtil.limpaNum(r);
            if (r.length <= 2) continue;
            lista.push({ c, r, r2 });
          }
      
          return { lista };
        }).catch((error) => {
            console.error(error)
            // console.error('erro ao converter o pdf');
          return { lista: [] };
        });
      };


    this.uploadArq =  async (arq, calcM, opcoes) => {
        let dadosPDF = await this.extractDataFromPDF(arq);

        for (let x in dadosPDF.lista) {
            let dia =  dadosPDF.lista[x].c;
            let valor = dadosPDF.lista[x].r2;

            await calcM.valorList.find((item) => {
                // console.log(item)
                if (item.dia == dia) {
                    item.valorPago = valor;
                    item.valorDevido = 0;
                }
            })
        }

        return calcM.valorList
    }

    this.calcReajustes = function (calcM, i, f, valor, diai) {
        let r = {} 
        let rSal = {} 
        let primeiro = true
        let primeiroAno = true 
        let mesReferencia = i
        // item: { reajuste      }

        for (let x = i; x <= f; x++) {
            // console.log('### x = ',x)
            let reajuste = 0
            
            if (typeof tabelaPrevReajuste[ x ] !== 'undefined' && tabelaPrevReajuste[ x ].mesReajuste) {
                if (!primeiro) {
                    let BNReajuste = new BigNumber(tabelaPrevReajuste[ mesReferencia ].percentual)
                    let BNValor =  new BigNumber( this.bigNumberFit( valor ) )

                    reajuste = tabelaPrevReajuste[ mesReferencia ].percentual
                    valor = BNValor.times(BNReajuste.dividedBy(100).plus(1)).toNumber()
                }
                mesReferencia = x
            }

            let v1 = valor

            // fazer o primemiro benefecio ser proporcional ao numero de dias do mes
            if (primeiro && diai > 1) {
                let indice = this.indicePropMes( calcM.dataInicioBeneficio )
                v1 *= indice
            }

            // verifica se tem 13o. e calcula
            if (this.temSal13( x ) ) {
                
                let vSal = 0 
                if (primeiroAno) {
                    let mes = calcUtil.mesAno2intMes( x )
                    if (mes == 12) {
                        let proporcao = x - i 
                        if ( calcUtil.dia2intDia(calcM.dataInicioBeneficio) <= 15 ) {
                            proporcao++
                        } 
                        vSal = v1* (proporcao / 12)
                        primeiroAno = false
                    } 
                } else {
                    let s13 = calcM.valorList.find( y => (y.diai == x && y.sal13 != 0) )
                    if (typeof s13 !== 'undefined') {
                        vSal = v1 * s13.sal13 
                    }
                } 
                rSal[ x ] = { valor: vSal, reajuste }
            }

            r[ x ] = { valor: v1, reajuste }
            primeiro = false 
        }

        return { normal: r, sal: rSal } 
    }

    this.setCampoRetorno = function (calcM, campo, valor) {
        let feito  = false
        let retorno = {} 
        // console.log('setCampoRetorno', campo,valor)
        // console.log(calcM)

        if (typeof calcM === 'undefined' || calcM == null ) {
            return calcM 
        }

        if (campo == 'dataAjuizamento') {
            // se alterar o ajuizamento, altera a prescrição
            calcM.dataPrescricao = calcUtil.diminuiAnos( valor, 5 )
            calcM.dataPrescricaoMesAno = calcUtil.dia2intMesAno( calcM.dataPrescricao )
        }

        if (campo == 'autoPreencher' || campo == 'dataInicioBeneficio' || campo == 'dataLimite' || campo == 'calcularParcelasVincendas') {
            if (campo != 'autoPreencher') {
                calcM[campo] = valor
            }

            // ajustando o grid 
            let i = calcUtil.dia2intMesAno(calcM.dataInicioBeneficio)
            let f = calcUtil.dia2intMesAno(calcM.dataLimite)

            if (calcM.calcularParcelasVincendas) {
                f += 12;
            }

            // se for vazio, coloca o ultimo item
            if (calcM.valorList.length <= 0) {
                let temS = this.temSal13( f ) 
                calcM.valorList = [{ dia: calcUtil.mesAno2dia( f ), diai: f, valorDevido: 0, valorPago: 0, sal13: 0, reajuste: 0}]
                if ( temS ) {
                    calcM.valorList.push({ dia: calcUtil.mesAno2dia( f ), diai: f, valorDevido: 0, valorPago: 0, sal13: temS, reajuste: 0})
                }
            }

            // se for menor que o primeiro, coloca o primeiro
            while (calcM.valorList[ 0 ].diai > i) {
                let diatemp = calcM.valorList[ 0 ].diai - 1
                let temS = this.temSal13( diatemp ) 
                if ( temS ) {
                    calcM.valorList.unshift({ dia: calcUtil.mesAno2dia( diatemp ), diai: diatemp, valorDevido: 0, valorPago: 0, sal13: temS, reajuste: 0})
                }
                calcM.valorList.unshift({ dia: calcUtil.mesAno2dia( diatemp ), diai: diatemp, valorDevido: 0, valorPago: 0, sal13: 0, reajuste: 0})
            } 

            // completa os meses faltantes 
            let ultimo = calcM.valorList[ calcM.valorList.length-1 ] 
            while (ultimo.diai < f) {
                let diatemp = ultimo.diai + 1
                calcM.valorList.push({ dia: calcUtil.mesAno2dia( diatemp ), diai: diatemp, valorDevido: 0, valorPago: 0, sal13: 0})
                let temS = this.temSal13( diatemp ) 
                if ( this.temSal13( temS ) ) {
                    calcM.valorList.push({ dia: calcUtil.mesAno2dia( diatemp ), diai: diatemp, valorDevido: 0, valorPago: 0, sal13: temS, reajuste: 0})
                }
                ultimo = calcM.valorList[ calcM.valorList.length-1 ] 
            }

            // tira datas em excesso
            calcM.valorList = calcM.valorList.filter( x => (x.diai >= i && x.diai <= f) )

            
            if (campo == 'autoPreencher') {
                // console.log(campo, valor)
                let reajustes1 = {} 

                if (valor.tipo == 'devido') {
                    reajustes1 = this.calcReajustes(calcM, i, f, valor.valor, calcUtil.dia2intDia(calcM.dataInicioBeneficio))
                } else {
                    let d1 = calcM.dataInicioBeneficio 
                    if (valor.dib != '') {
                        d1 = valor.dib
                    }
                    reajustes1 = this.calcReajustes(calcM, calcUtil.dia2intMesAno(d1), f, valor.valor, calcUtil.dia2intDia(d1))
                }
                
                let reajustes = reajustes1.normal
                let reajustesSal = reajustes1.sal
    

                for (let x in calcM.valorList) {
                    let dia  = calcM.valorList[x].diai

                    if (valor.tipo == 'devido') {
                        calcM.valorList[x].valorDevido = 0
                        if (calcM.valorList[x].sal13 > 0) {
                            if (typeof reajustesSal[ dia ] !== 'undefined') {
                                calcM.valorList[x].valorDevido = reajustesSal[ dia ].valor
                            }
                        } else  {
                            if (typeof reajustes[ dia ] !== 'undefined') {
                                calcM.valorList[x].valorDevido = reajustes[ dia ].valor
                            }
                        }
                    }
                     else  {
                        calcM.valorList[x].valorPago = 0 
                        if (calcM.valorList[x].sal13 > 0) {
                            if (typeof reajustesSal[ dia ] !== 'undefined') {
                                calcM.valorList[x].valorPago = reajustesSal[ dia ].valor
                            }
                        } else {
                            if (typeof reajustes[ dia ] !== 'undefined') {
                                calcM.valorList[x].valorPago = reajustes[ dia ].valor
                            }
                        }
                    }
                    if (typeof reajustes[ dia ] !== 'undefined') {
                        calcM.valorList[x].reajuste = reajustes[ dia ].reajuste
                    } else {
                        calcM.valorList[x].reajuste = 0
                    
                    }
                }

                // console.table( calcM.valorList )
            }

            retorno = { valorList: calcM.valorList }
        }


        if (!feito) {
            calcM[campo] = valor
        }
    
        return { calcM, retorno }
    }

    this.validar = function (d) {
    }

    this.posLeituraArquivo = function (d) {
        // console.log('posLeituraArquivo')
        
        if (d.tabelaPersonalizada.length > 0) {
            d.tabelaPersonalizada = d.tabelaPersonalizada.filter( x => (x.m) )
        }
        // console.table(d.tabelaPersonalizada)
        return d;
    }

    this.criar = function ( infoInicial ) {
        return {
            nomeSegurado: '',
            dataNasc: '',
            genero: 'm',
            especieBeneficio: '42',
            dataInicioBeneficio: '',
            dataAjuizamento: '',
            dataPrecricao: '',
            dataCitacao: '',

            idCalc: infoInicial.idCalc,
            hash: infoInicial.hash,
            idDono: infoInicial.idDono,
            nome: 'cálculo sem nome',
            email: '',
            dataAtual: calcUtil.diaHoje(),
            dataLimite: calcUtil.diaHoje(),
            indexador: 7,
            valorList: [],
            sucumList: [],
            jurosTab: [ { modo: 6, ate: 24264 }, { modo: 0, ate: 0 } ],
            modoSelic: 'princJuros',
            honoSucumDiaInicioJuros: '',
            honoSucumDiaSentenca: '',
            honoSucumDiaAcordao: '', 
            tabelaPersonalizada: [ ],
            calcularParcelasVincendas: false
        }
    }

    this.calcularJurosTab = function (fim, d)  {
        // console.log(d)
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
            if (d.calc_selic && d.selic_inicio <= x) {
                p = 0 
            }
            r[ x ] = { p, dia: calcUtil.mesAno2dia(x) }
        }
        r[ fim ] = { p: 0, dia: calcUtil.mesAno2dia(fim) } // ultimo dia

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

        let t = tabJ.calcular( tabM ).vl
        // console.log('t: 93 - ',t)
        let rt = this.resumoT( t )

        let r = {}
        for (let x in t) {
            r[ t[x].m ] = t[x]
        }
        return { r, rt } 
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

        let prescricaoInt = calcUtil.dia2yyyymmddInt( d.dataPrecricao)

        let baseHonorarios = 0
        let limiteHonorarios = 30000 
        if (d.honoSucumModo == 'condenacaoSentenca') {
            limiteHonorarios = calcUtil.dia2intMesAno( d.honoSucumDiaSentenca )
        }
        if (d.honoSucumModo == 'condenacaoAcordao') {
            limiteHonorarios = calcUtil.dia2intMesAno( d.honoSucumDiaAcordao )
        }
       
        for (let i in d.valorList) {
            let item = d.valorList[i]
            item.valor = item.valorDevido - item.valorPago
            if (item.valor < 0) item.valor = 0
            // console.log(item)

            // if (item.dia && item.valor != 0) {
                let mesano = calcUtil.dia2intMesAno( '01/'+item.dia )
                let tma = t[ mesano ]
                let diaInt = calcUtil.dia2yyyymmddInt( '01/'+item.dia  )

                item.valor = item.valorDevido - item.valorPago
                if (item.valor < 0) item.valor = 0

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

                if (diaInt < prescricaoInt) {
                    item.valor = 0
                    item.valorDevido = 0
                    item.valorPago = 0
                }

                if (mesano <= limiteHonorarios) {
                    baseHonorarios += total
                }

                r.push({
                    dia: mesano,
                    reajuste: item.reajuste,
                    valorDevido: item.valorDevido,
                    valorPago: item.valorPago,
                    principal: item.valor,
                    correcaoMonetaria: tma.indiceGerado,
                    principalCorrigido,
                    juros,
                    jurosPrincipal,
                    selic: tma.selicAcumulada,
                    selicValor,
                    total,
                    desc: item.desc,
                    prescrito: (diaInt < prescricaoInt)
                })
            // }
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
                linha.correcaoMonetaria = t[ linha.dia ].indiceGerado
                linha.principalCorrigido = linha.principal * linha.correcaoMonetaria
                linha.juros = jurosT[ iniJur ].j 
                linha.selic = t[ iniJur ].selicAcumulada
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
                linha.correcaoMonetaria = t[ linha.dia ].indiceGerado
                linha.principalCorrigido = linha.principal * linha.correcaoMonetaria
                linha.juros = jurosT[ iniJur ].j 
                linha.selic = t[ iniJur ].selicAcumulada
                linha.selicValor = linha.principalCorrigido * ((linha.selic+linha.juros) / 100)
                linha.total = linha.selicValor + linha.principalCorrigido
            }

            if (d.honoSucumModo == 'causa') {
                if (!d.honoSucumDiaInicioJuros) d.honoSucumDiaInicioJuros = ''
                let iniJur = calcUtil.dia2intMesAno( d.honoSucumDiaInicioJuros )
                linha.desc = `Hon. adv. fixados sobre valor da causa - ${calcUtil.moeda(d.honoSucumDiaAjuzuizamento)} ${calcUtil.formataNum(d.honoSucumValorCausa,2)}` 
                linha.dia = calcUtil.dia2intMesAno( d.honoSucumDiaAjuzuizamento ) 
                linha.principal = d.honoSucumValorCausa * d.honoSucumPercentual / 100 
                linha.correcaoMonetaria = t[ linha.dia ].indiceGerado
                linha.principalCorrigido = linha.principal * linha.correcaoMonetaria
                linha.juros = 0
                if (typeof jurosT[ iniJur ] !== 'undefined' && typeof jurosT[ iniJur ].j !== 'undefined' && jurosT[ iniJur ].j) {
                    linha.juros = jurosT[ iniJur ].j 
                }
                if (typeof t[ iniJur ] === 'undefined' || typeof t[ iniJur ].selicAcumulada === 'undefined') {
                    linha.selic = 0 
                } else {
                    linha.selic = t[ iniJur ].selicAcumulada
                }
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

            if (d.honoSucumModo == 'condenacaoSentenca') {
                linha.desc = `Hon. adv. fixados sobre valor da condenação até a data da sentença (${d.honoSucumDiaSentenca}) - ${calcUtil.moeda(d.honoSucumDiaSentenca)} ${calcUtil.formataNum(baseHonorarios,2)}` 
                linha.dia = calcUtil.dia2intMesAno( d.dataAtual ) 
                linha.principal = "x"
                linha.correcaoMonetaria = "x"
                linha.principalCorrigido = baseHonorarios * (d.honoSucumPercentual / 100)
                linha.juros = "x"
                linha.selic = "x"
                linha.selicValor = (totalJuros + totalSelic) * (d.honoSucumPercentual / 100)
                linha.total = linha.selicValor + linha.principalCorrigido
            }

            if (d.honoSucumModo == 'condenacaoAcordao') {
                linha.desc = `Hon. adv. fixados sobre valor da condenação até a data do Acórdão (${d.honoSucumDiaAcordao}) - ${calcUtil.moeda(d.honoSucumDiaAcordao)} ${calcUtil.formataNum(baseHonorarios,2)}` 
                linha.dia = calcUtil.dia2intMesAno( d.dataAtual ) 
                linha.principal = "x"
                linha.correcaoMonetaria = "x"
                linha.principalCorrigido = baseHonorarios * (d.honoSucumPercentual / 100)
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
                let iniJur = d.honoCompData ? calcUtil.dia2intMesAno( d.honoCompData) : 0
                linha.desc = `Hon. adv. sobre valor informado pelo usuário - ${calcUtil.moeda(d.honoCompData)} ${calcUtil.formataNum(d.honoCompValor,2)}` 
                linha.dia = d.honoCompData ? calcUtil.dia2intMesAno( d.honoCompData ) : 0 
                linha.principal = d.honoCompValor
                linha.correcaoMonetaria = t[ linha.dia ].indiceGerado
                linha.principalCorrigido = linha.principal * linha.correcaoMonetaria
                linha.juros = jurosT[ iniJur ].j 
                linha.selic = t[ iniJur ].selicAcumulada
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
