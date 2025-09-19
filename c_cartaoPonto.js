
const calcUtil = require('./calcUtil.js');

const padrao_percentuaisHE = [{ inicio: '', fim: '', ate2: '50', ate3: '50',ate4: '50', ate5: '50', ate6: '50', folga: '100' }]
const padrao_periodoNoturno = [{ inicio: '', fim: '', horai: '22:00', horaf: '05:00' }]
const padrao_jornada = [{ inicio: '', fim: '', seg: '08:00', ter: '08:00',qua: '08:00', qui: '08:00', sex: '08:00',  sab: '04:00',  dom: '00:00',  folga: '00:00' }]
const padrao_jornadas = [{ inicio: '', fim: '', jornada: '44:00', ate10: '50', ate20: '50', ate30: '50', ate40: '50', ate50: '50', ate60: '50' }]


module.exports = function() {
    const calcUtil = require('./calcUtil.js');
    let tabelas = {}

    this.montaCartaoPonto = function (ma) {
        let cpDados = { }
        let maStr = calcUtil.mesAno2dia(ma)
        let d = '01/'+ maStr
        let f = calcUtil.diasMes(d)
        let semana = calcUtil.diaSemana( d ) 

        for (let i = 1; i <= f; i++) {
            let d1 = i.toString().padStart(2, '0') + '/' + maStr
            let dsr = calcUtil.dsrDetalhado( d1, d1, '1110001001012104010507091210021115112512', {  dsrDom: false, dsrSeg: false, dsrTer: false, dsrQua: false, dsrQui: false, dsrSex: false, dsrSab: false, dsrFer: true })
            let feriado = (dsr.diasD > 0)
            cpDados[i] = { 
                h: [ { e: '', s: '', m: 't' }, { e: '', s: '', m: 't' }, { e: '', s: '', m: 't' }, { e: '', s: '', m: 't' }, { e: '', s: '', m: 't' }, { e: '', s: '', m: 't' }], 
                c: { 
                    du: (semana>0), 
                    atividade: (semana == 0 || feriado) ? 'd' : 'u', 
                    s: semana,
                    f: feriado  
                } 
            }
            semana++
            if (semana > 6) { semana = 0 }
        }

        return cpDados;
    }

    this.repetir = function (calcM, solicitacao) {
        let mai = calcUtil.dia2intMesAno( solicitacao.datai )
        let maf = calcUtil.dia2intMesAno( solicitacao.dataf )
        let diai = calcUtil.dia2intDia( solicitacao.datai )
        let diaf = calcUtil.dia2intDia( solicitacao.dataf )
        let copiaHorarios =  JSON.stringify( solicitacao.horarios ) 

        let revContaDia = 0 
        let revTrabalhando = true

        for (let i = mai; i <= maf; i++) {
            let totalSeg = 0
            let totalTer = 0
            let totalQua = 0
            let totalQui = 0
            let totalSex = 0
            let totalSab = 0
            let totalDom = 0
            let totalDescanso = 0
            let primeiroMes = (i == mai)
            let ultimoMes = (i == maf)

            if (!calcM.cartao[ i ]) {
                calcM.cartao[ i ] = this.montaCartaoPonto( i )
            }

            for (let j in calcM.cartao[ i ]) {
                if (primeiroMes && j < diai) { continue; }
                if (ultimoMes && j > diaf) { continue; }

                if (solicitacao.modo == 'd') {
                    // repetição por dia da semana
                    // if (calcM.cartao[ i ][ j ].c.atividade == 'u') {
                        if (calcM.cartao[ i ][ j ].c.s == 1 && totalSeg < solicitacao.qtdeSeg ) { totalSeg++; calcM.cartao[ i ][ j ].h = JSON.parse(copiaHorarios); }
                        if (calcM.cartao[ i ][ j ].c.s == 2 && totalTer < solicitacao.qtdeTer ) { totalTer++; calcM.cartao[ i ][ j ].h = JSON.parse(copiaHorarios); }
                        if (calcM.cartao[ i ][ j ].c.s == 3 && totalQua < solicitacao.qtdeQua ) { totalQua++; calcM.cartao[ i ][ j ].h = JSON.parse(copiaHorarios); }
                        if (calcM.cartao[ i ][ j ].c.s == 4 && totalQui < solicitacao.qtdeQui ) { totalQui++; calcM.cartao[ i ][ j ].h = JSON.parse(copiaHorarios); }
                        if (calcM.cartao[ i ][ j ].c.s == 5 && totalSex < solicitacao.qtdeSex ) { totalSex++; calcM.cartao[ i ][ j ].h = JSON.parse(copiaHorarios); }
                        if (calcM.cartao[ i ][ j ].c.s == 6 && totalSab < solicitacao.qtdeSab ) { totalSab++; calcM.cartao[ i ][ j ].h = JSON.parse(copiaHorarios); }
                        if (calcM.cartao[ i ][ j ].c.s == 0 && totalDom < solicitacao.qtdeDom ) { totalDom++; calcM.cartao[ i ][ j ].h = JSON.parse(copiaHorarios); }
                    // } else {
                    //     if (totalDescanso < solicitacao.qtdeDescanso) {
                    //         calcM.cartao[ i ][ j ].h =  JSON.parse(copiaHorarios);
                    //         totalDescanso++ 
                    //     }
                    // }
                } else {
                    // repetição por revezamento
                    revContaDia++

                    if (revTrabalhando) {
                        calcM.cartao[ i ][ j ].h =  JSON.parse(copiaHorarios);
                        
                        if (revContaDia >= parseInt( solicitacao.preencher) ) {
                            revContaDia = 0
                            revTrabalhando = false
                        }
                    } else {
                        if (revContaDia >= parseInt( solicitacao.pular) ) {
                            revContaDia = 0
                            revTrabalhando = true
                        }
                    }
                }
            }
        }
    }

    this.setCampo = function (calcM, campo, valor) {
        if (typeof calcM === 'undefined' || calcM == null || typeof calcM.cartao === 'undefined' || calcM.cartao == null ) {
            return calcM 
        }
        let feito = false

        if (campo == 'horario') {
            if (!calcM.cartao[ valor.mesano ]) {
                calcM.cartao[ valor.mesano ] = this.montaCartaoPonto( valor.mesano )
            }

            if (valor.es == 'e' || valor.es == 's') {
                calcM.cartao[ valor.mesano ][ valor.dia ].h[ valor.periodo ][ valor.es ] = valor.valor
            }

            if (valor.es == 'modo-dia') {
                calcM.cartao[ valor.mesano ][ valor.dia ].c.atividade = valor.valor
            }

            if (valor.es == 'modo-periodo') {
                calcM.cartao[ valor.mesano ][ valor.dia ].h[ valor.periodo ].m = valor.valor
            }
            feito = true
        }

        if (campo == 'repetir' && !feito) {
            this.repetir(calcM, valor)
            feito = true
        }

        if (!feito) {
            calcM[campo] = valor
        }

        return calcM 
    }
    
    this.setVariaveis = function (variaveis) {
        tabelas = variaveis.tabelas
    }
    
    this.validar = function (d) {
    }

    this.pegaDadosParcial = function ( calcM, solicitacao ) {
        let r = null
        if ( typeof calcM.cartao === 'undefined') {
            calcM.cartao = {} 
        }  
        if (typeof calcM.cartao[ solicitacao.mesano ] === 'undefined' ) {
            r = this.montaCartaoPonto( solicitacao.mesano )
        } else {
            r = calcM.cartao[ solicitacao.mesano ]
        }
        return r
    }

    this.temDigitacao = function (d) {
        for (let i in d) {
            for (let j=0; j<6; j++) { 
                if (d[i].h[j].e != '' || d[i].h[j].s != '') {
                    // console.log(i, d[i].h[j])
                    return true
                }
            }
        }
        return false;
    }

    this.posLeituraArquivo = function (d) {
        let d1 = JSON.parse( JSON.stringify(d) )
        let ultma = 24500
        let sair = false

        if (typeof d1.cartao === 'undefined') {
            d1.cartao = {}
            d1.ultma = 24000
            return d1;
        }

        while (ultma > 24000 && !sair) {
            ultma--
            if (typeof d1.cartao[ultma]!== 'undefined' &&  this.temDigitacao(d1.cartao[ultma])) {
                sair = true
            }   
        }   

        if (ultma == 24000) {
            ultma = calcUtil.dia2intMesAno(calcUtil.diaHoje())
            d1.cartaoAtual = this.montaCartaoPonto(ultma)
        } else {
            d1.cartaoAtual = d1.cartao[ultma]
        }
        d1.ultma = ultma 
        
        return d1;
    }

    this.cropCartao = function (d) {
        let d1 = JSON.parse( JSON.stringify(d) )
        let r = { primeiroMes: 0, primeiroDia: 1, ultimoMes: 0, ultimoDia: 1 }

        // procura primeiro dia com digitacao
        let sair  = false
        for (let i in d1.cartao) {
            if (!sair) {
                for (let j in d1.cartao[i]) {
                    for (let k in d1.cartao[i][j].h) {
                        if (!sair && (d1.cartao[i][j].h[k].e != '' || 
                        d1.cartao[i][j].h[k].s != '' || 
                        d1.cartao[i][j].c.atividade == 'fj'|| 
                        d1.cartao[i][j].c.atividade == 'fi'|| 
                        d1.cartao[i][j].c.atividade == 'fe')) {
                            r.primeiroMes = i
                            r.primeiroDia = j
                            // console.log('setando o dia ', j)
                            sair = true;
                            break
                        }
                    }
                }
            }
        }

        // procura ultimo dia com digitacao
        for (let i in d1.cartao) {
            for (let j in d1.cartao[i]) {
                for (let k in d1.cartao[i][j].h) {
                    if (d1.cartao[i][j].h[k].e != '' || d1.cartao[i][j].h[k].s != '' || d1.cartao[i][j].c.atividade == 'fj'|| d1.cartao[i][j].c.atividade == 'fi'|| d1.cartao[i][j].c.atividade == 'fe') {
                        r.ultimoMes = i
                        r.ultimoDia = j
                        break
                    }
                }
            }
        }

        return r; 

    }    

    this.qualFaixa = function (dia, lista) {
        let faixa = 0

        if (typeof lista !== 'undefined' && lista.length > 0) {
            for (let i = 0; i < lista.length; i++) {
                if (dia >= calcUtil.dia2yyyymmddInt( lista[i].inicio ) && dia <= calcUtil.dia2yyyymmddInt( lista[i].fim) )   {
                    faixa = i
                    break
                }
            }
        }

        return faixa
    }

    this.qualJornada = function (dia, c, lista) {
        if (typeof lista === 'undefined' || lista.length == 0) {
            lista = padrao_jornada
        }
        let faixa = this.qualFaixa(dia, lista)

        // tratar como dia util
        if (c.atividade == 'u') {
            if (c.s == 0) { return lista[faixa].dom }
            if (c.s == 1) { return lista[faixa].seg }
            if (c.s == 2) { return lista[faixa].ter }
            if (c.s == 3) { return lista[faixa].qua }
            if (c.s == 4) { return lista[faixa].qui }
            if (c.s == 5) { return lista[faixa].sex }
            if (c.s == 6) { return lista[faixa].sab }
        }

        // tratar como dia util
        if (c.atividade == 'd') {
            return "00:00"
        }
    }
    
    this.consolidarHE = function (d, p, descanso) {
        const faixas = [ 'ate2', 'ate2', 'ate3', 'ate4', 'ate5', 'ate6' ]
        let r = {} 

        for (let x = 0; x < faixas.length; x++) {
            if (descanso) {
                perc = parseInt(p.folga)
            } else {
                perc = parseInt(p[ faixas[x] ])
            }
            
            if (typeof r[perc] === 'undefined') {
                r[perc] = { d: 0, n: 0 } 
            }
            r[perc].d += parseInt( d.hedf[x] ) 
            r[perc].n += parseInt( d.henf[x] ) 
        }

        return r 
    }


    this.combinarSomar = function(obj1, obj2) {
        let resultado = { ...obj1 }; 

        Object.keys(obj2).forEach(chave => {
          if (obj1.hasOwnProperty(chave) && typeof obj1[chave] === 'object' && obj1[chave] !== null && typeof obj2[chave] === 'object' && obj2[chave] !== null) {
            resultado[chave] = this.combinarSomar(obj1[chave], obj2[chave]);
          } else if (obj1.hasOwnProperty(chave) && typeof obj1[chave] === 'number' && typeof obj2[chave] === 'number') {
            resultado[chave] += obj2[chave];
          } else {
            resultado[chave] = obj2[chave];
          }
        });
      
        return resultado;
    }

    this.calcularDia = function (horarios, jornada1, tab_hn1, metodologia) {
        let hd = 0
        let hn = 0
        let hed = 0
        let hen = 0
        let hedf = [ 0, 0, 0, 0, 0, 0, 0 ]
        let henf = [ 0, 0, 0, 0, 0, 0, 0 ]
        let he_faixa = 0
        let hs = 0 // horas sobreaviso
        let hii = 0 // horas in itinere
        
        const fator_hora_noturna =  8/7 
        let configVar = { faixaHE: 60  }

        if (metodologia != 'd') {
            configVar = { faixaHE: 600 } 
        } 


        // variaveis das horas noturnas
        let tab_hn = {
            i: calcUtil.hora2min( tab_hn1.horai ),
            f: calcUtil.hora2min( tab_hn1.horaf ) 
        }
        tab_hn.f2 = tab_hn.f + 1440

        // variavel das horas extras
        let jornada = calcUtil.hora2min( jornada1 )
        let tempo_transcorrido = 0 
        let he_proxFaixa = jornada + configVar.faixaHE

        for (let i in horarios) {
            let noite = false
            h = horarios[i]

            if (h.e != '' && h.s != '') {
                emin = calcUtil.hora2min(h.e)
                smin = calcUtil.hora2min(h.s)
                if (smin < emin) { 
                    smin += 1440 
                }

                for (let l = emin; l < smin; l++) {
                    // se for horas trabalhadas
                    if (h.m == 't') {
                        // horas normais ou noturnas
                        noite = ((l < tab_hn.f) || (l >= tab_hn.i && l < (tab_hn.f2 ) )) 
                        if (noite) { 
                            hn += fator_hora_noturna
                        } else {
                            hd++
                        }

                        if (  Math.round(tempo_transcorrido) >= he_proxFaixa && he_faixa < 5)  {
                            he_faixa++
                            he_proxFaixa += configVar.faixaHE
                        }

                        // horas extras 
                        if ( Math.round(tempo_transcorrido) >= jornada) {
                            if (noite) {
                                let l2 = l
                                if (l2>1140) { l2 -= 1440}
                                hen += fator_hora_noturna
                                henf[ he_faixa ] += fator_hora_noturna 
                            } else {
                                hed++
                                hedf[ he_faixa ]++
                            }
                        }
                        
                        // transcorrer tempo
                        if (noite) {
                            tempo_transcorrido += fator_hora_noturna
                        } else {
                            tempo_transcorrido++
                        }   
                    }

                    // se for horas trabalhadas
                    if (h.m == 'sa') {
                        hs++ 
                    }

                    // se for horas in itinere
                    if (h.m == 'ii') {
                        hii++ 
                    }
                }
            }
        }

        // ajuste final 
        if (hen >0 || hn >0) {
            hn = parseInt( Math.round(hn))
            hen = parseInt( Math.round(hen))

            let soma1 = hd + hn
            let soma2 = hed + hen + jornada
            let verifica1 = soma1 - soma2

            // pequena correção de um minuto no final
            if (verifica1 > 0) {
                // console.log('*** precisou corrigir', verifica1)
                hen++
                henf[ he_faixa ]++  
            }
        } 
  
        return { 
            hd,
            hn,
            hed,
            hen,
            hs,
            hii,
            henf, hedf 
        }
    }


    this.calcular = (d) => {
        let c = d.cartao 
        let resultado = { } 
        let horariosSemana = []
        let pa = d.periodoAquisitivo
        if (typeof pa === 'undefined')  { pa = 1 }
        let res = {} 

        let  k1 = Object.keys(c); 
        let ultimoMes = k1[k1.length - 1]



        if (typeof d.percentuaisHE === 'undefined') {
            d.percentuaisHE = padrao_percentuaisHE
        }
        if (typeof d.periodoNoturno === 'undefined') {
            d.periodoNoturno = padrao_periodoNoturno
        }
        if (typeof d.jornada === 'undefined') {
            d.jornada = padrao_jornada
        }
        if (typeof d.jornadas === 'undefined') {
            d.jornadas = padrao_jornadas
        }
        
        for (let mes in c) {
            let cartao = c[mes]
            let mesPA = parseInt(mes) 

            k1 = Object.keys(cartao); 
            let ultimoDia = k1[k1.length - 1]

            if (pa==1) { res = {};  }

            for (let dia in cartao) {
                let diaStr = dia.toString().padStart(2, '0') + '/' + calcUtil.mesAno2dia(parseInt( mes ))
                let descanso1 = (cartao[dia].c.atividade=='d')
                let diaInt = calcUtil.dia2yyyymmddInt(diaStr)
                let jornada = this.qualJornada( diaInt, cartao[dia].c, d.jornada )
                let faixa_jornadas = this.qualFaixa( diaInt, cartao[dia].c, d.jornadas )
                let faixa_hn = this.qualFaixa( diaInt, d.periodoNoturno )
                let faixa_p = this.qualFaixa( diaInt, d.percentuaisHE )

                if (pa != 1 && pa == dia) {
                    resultado[ mesPA ] = res
                    res = {} 
                    mesPA++
                } 

                d.cartao[mes][dia].c.dia = diaStr 
                if ( d.metodologia == 'd' ) {
                    d.cartao[mes][dia].res = this.calcularDia ( cartao[dia].h, jornada, d.periodoNoturno[ faixa_hn ], d.metodologia  )
                    d.cartao[mes][dia].res.he = this.consolidarHE( d.cartao[mes][dia].res, d.percentuaisHE[ faixa_p ], descanso1)
                    res = this.combinarSomar( d.cartao[mes][dia].res, res )
                } else {
                    // calculo semanal
                    if ((cartao[dia].c.s == 0)  || (dia == ultimoDia && mes == ultimoMes)) {
                        // console.log('mes, dia', mes, dia)
                        d.cartao[mes][dia].res = this.calcularDia ( horariosSemana, d.jornadas[ faixa_jornadas ].jornada, d.periodoNoturno[ faixa_hn ], d.metodologia   )
                        d.cartao[mes][dia].res.he = this.consolidarHE( d.cartao[mes][dia].res, d.percentuaisHE[ faixa_p ], descanso1)
                        res = this.combinarSomar( d.cartao[mes][dia].res, res )

                        horariosSemana = []
                    } else {
                        d.cartao[mes][dia].res = {} 
                        for (let i in cartao[dia].h) {
                            horariosSemana.push( cartao[dia].h[i] )
                        }
                    }
                }
            }
            if (pa == 1) {
                resultado[ mes ] = res
            } else {
                resultado[ mesPA ] = res
            }
            
        }
      
        d.crop = this.cropCartao(d)
        d.resultado = resultado
        return d;
    }

    this.criar = function ( infoInicial ) {
        return {
            tipo: "cartaoPonto",
            idCalc: infoInicial.idCalc, 
            hash: infoInicial.hash, 
            idDono: infoInicial.idDono, 
            email: '', 
            nome: "novo cartão de ponto",
            intervalos: 2,
            periodoAquisitivo: 1,
            metodologia: 'd', 
            percentuaisHE: [{ inicio: '', fim: '', ate2: '50', ate3: '50',ate4: '50', ate5: '50', ate6: '50', folga: '100' }],
            periodoNoturno: [{ inicio: '', fim: '', horai: '22:00', horaf: '05:00' }],
            jornada: [{ inicio: '', fim: '', seg: '08:00', ter: '08:00',qua: '08:00', qui: '08:00', sex: '08:00',  sab: '04:00',  dom: '00:00',  folga: '00:00' }],
            jornadas: [{ inicio: '', fim: '', jornada: '44:00', ate10: '50', ate20: '50', ate30: '50', ate40: '50', ate50: '50', ate60: '50' }],
            cartao: {} 
        }
    }


}
