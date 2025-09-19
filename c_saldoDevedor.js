module.exports = function() {
    const calcUtil = require('./calcUtil.js');
    const mesesCorteZeros = [ 23607,23835,23869,23924,23935 ]
    let tabelas = {}
    
    this.setVariaveis = function (variaveis) {
        tabelas = variaveis.tabelas
    }
    
    this.validar = function (d) {
    }

    this.posLeituraArquivo = function (d) {
        return d;
    }

    this.calcular= (d) => {
        var a_indice_correcao = 0
        var guarda_indice = 0 
        let juros = (d.juros / 100)
        if (d.juros_periodo == "a") {
            juros = Math.pow(1+juros, (1/12)) - 1
        }
        let dia = d.dia
        var sdc = Number(d.valor)
        let sd =Number( 0 )
        var iof_mes = d.iof_perc
        if (d.iof_periodo == "a") {
            iof_mes = iof_mes / 12
        }

        let resultado = { planilha: [  { dia, sd: d.valor } ] }
        resultado.cabecalho = [ 'Tempo Financiamento (meses)', 'Data',]

        resultado.soma = {  juros: 0, amortizacao: 0, iof: 0, seguro: 0, tac: 0 }
        if (d.correcao_monetaria) {
            resultado.cabecalho.push('Índice Correção (%)')
            resultado.cabecalho.push('Saldo devedor + Correção')
        } else {
            resultado.cabecalho.push('Saldo devedor')
        }
        resultado.cabecalho.push('Juros' )

        if (d.iof){
            resultado.cabecalho.push('IOF')
        } 
        if (d.seguro) { 
            resultado.cabecalho.push('Seguro')
        }

        if (d.tac) {
            resultado.cabecalho.push('TAC')
        }

        resultado.cabecalho.push('Amortização')
        resultado.cabecalho.push('Saldo Devedor')

        // analisa TACs (somente agrupamento)
        var tacList = [] 
        var tac = Number(0)

        if (d.tac) { 
            for (let i in d.tacList) {
                if (d.tacList[i].dia) {
                    let d1 = calcUtil.dia2intMesAno( d.tacList[i].dia )
                    if (!tacList[ d1 ]) tacList[ d1 ] = 0
                }
            }
        }

        var n_amortizacao = 0
        for (let x=1; x<= d.parcelas; x++) {
            var saldo_calc = sdc
            let diai = calcUtil.dia2intMesAno( dia )

            // índice correção
            var indice_correcao  = 0
            if (d.correcao_monetaria && x>1) {
                if (d.indexador == -2) {
                    indice_correcao = 0.5
                }
                if (d.indexador == -1) {
                    indice_correcao = 1
                }
                if (d.indexador>0) {
                    let diai1 = diai - 1
                    if (tabelas[ d.indexador ][ diai1 ]) {
                        if (tabelas[ d.indexador ][ diai1 ].valor != -100) {
                            indice_correcao = tabelas[ d.indexador ][ diai1 ].valor
                        }
                    }
                    // console.log(dia, diai, diai1, indice_correcao)
                }
                
            }

            if (d.modo_saldo == 'anterior') {
                guarda_indice = indice_correcao
                indice_correcao = a_indice_correcao
            }
            sdc = sdc * (1 + (indice_correcao/100))
            saldo_calc = sdc
            sd = saldo_calc

            // cortes de zeros
            if (x>1) { // se for depois da primeira parcela
                let cortar = 1
                if (mesesCorteZeros.indexOf( diai ) >= 0) { cortar = 1000 }
                if (diai == 23935) { cortar = 2750 }
                saldo_calc = saldo_calc / cortar
                sdc  = sdc / cortar
                d.parcela /= d.parcela / cortar
            }

            // calculo do juros
            var jurosV = saldo_calc * juros;
            sd = saldo_calc + jurosV;

        
            //TAC
            tac =Number(0)
            if (d.tac && tacList[ diai ]) {
                tac = Number( tacList[ diai ].valor )
                sd += tac
            }

            // IOF
            var iof = Number(0)
            if (d.iof) {
                var base_iof = 0;
                if (d.iof_juros) base_iof += jurosV;
                if (d.iof_saldoDevedor) base_iof += sd;
                if (d.iof_tac) base_iof += tac;
                iof = base_iof * (iof_mes/100);
                sd += iof;
            }

            // seguro
            var seguroV = Number(0)
            if (d.seguro) {
                if (d.modo_seguro=='depois') {
                    seguroV = sdc * (d.seguro_valor/100)
                } else {
                    seguroV = sd * (d.seguro_valor/100)
                }
                
                sd += seguroV
            }

            // calculo da amortização
            resultado.planilha.push({
                col1: x, 
                sdc: sdc,
                dia,
                juros: jurosV, 
                amortizacao: 0,
                sd: sd,
                iof: iof,
                seguro: seguroV,
                tac: tac,
                ic: indice_correcao.toFixed(4),
            })

            resultado.soma.amortizacao += Number(amortizacao)
            resultado.soma.juros += jurosV
            resultado.soma.iof +=  Number(iof)
            resultado.soma.seguro += seguroV

            sdc = sd

            var amortizacao = 0
            if (d.amortizacao) {
                for (let i in d.amortizacaoList) {
                    if (d.amortizacaoList[i].dia) {
                        let d1 = calcUtil.dia2intMesAno( d.amortizacaoList[i].dia)
                        if (d1 == diai) {
                            n_amortizacao++ 
                            var amortizacaoV = d.amortizacaoList[i].valor
                            sd -= amortizacaoV

                            resultado.planilha.push({
                                col1: `${n_amortizacao}o pagamento`, 
                                sdc: sdc,
                                dia: d.amortizacaoList[i].dia,
                                juros: null, 
                                amortizacao: amortizacaoV,
                                sd: sd,
                                iof: null,
                                seguro: null,
                                tac: null,
                                ic: null,
                            })

                            sdc = sd
                        }
                    }
                }            
            }

            dia = calcUtil.somaMes(dia)
            
            // console.table(resultado.planilha)

            if (d.modo_saldo == 'anterior') {
                a_indice_correcao = guarda_indice
            }
        }

        return resultado 
    }

    this.criar = function ( infoInicial ) {
        return {
            tipo: "saldoDevedor",
            idCalc: infoInicial.idCalc, 
            hash: infoInicial.hash, 
            idDono: infoInicial.idDono, 
            nome: "novo cálculo de saldo devedor",
            juros: 1,
            juros_periodo: "m",
            carencia: 0,
            sistema: "PRICE",
            parcelas: 60,
            indexador: 18,
            correcao_monetaria: false,
            recalcular: 1,
            modo_saldo: "anterior",
            iof: true,
            iof_periodo: "m",
            iof_perc: 3.38,
            iof_juros: true,
            iof_amortizacao: false,
            iof_tac: false,
            seguro: false,
            seguro_valor: 0,
            modo_seguro: "antes",
            tac: false,
            tacList: [{dia:"",valor:0,desc:""}],
            amortizacaoList: [{dia:"",valor:0,desc: ""}],
        }
    }
}