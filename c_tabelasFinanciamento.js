module.exports = function() {
    const calcUtil = require('./calcUtil.js');
    let tabelas = {}
    
    this.setVariaveis = function (variaveis) {
        tabelas = variaveis.tabelas
    }
    
    this.validar = function (d) {
    }

    this.posLeituraArquivo = function (d) {
        return d;
    }
        
    this.calcular = (d) => {
        var a_indice_correcao = 0
        var guarda_indice = 0 
        let juros = (d.juros / 100)
        if (d.juros_periodo == "a") {
            juros = Math.pow(1+juros, (1/12)) - 1
        }
        let dia = d.dia
        var sdc = Number(d.valor)
        var iof_mes = d.iof_perc
        if (d.iof_periodo == "a") {
            iof_mes = iof_mes / 12
        }

        let resultado = { planilha: [  { dia, sd: d.valor } ] }
        resultado.cabecalho = [ 'Parcela', 'Data',]
        resultado.rodape = [ 't', 'x']
        resultado.soma = { parcelas: 0, juros: 0, amortizacao: 0, iof: 0, seguro: 0, tac: 0 }
        if (d.correcao_monetaria) {
            resultado.cabecalho.push('Índice Correção (%)')
            resultado.cabecalho.push('Saldo devedor + Correção')
            resultado.rodape.push('x')
            resultado.rodape.push('x')
        } else {
            resultado.cabecalho.push('Saldo devedor')
            resultado.rodape.push('x')
        }
        resultado.cabecalho.push('Amortização')
        resultado.rodape.push('amortizacao')

        resultado.cabecalho.push('Juros' )
        resultado.rodape.push('juros')

        if (d.iof){
            resultado.cabecalho.push('IOF')
            resultado.rodape.push('iof')
        } 
        if (d.seguro) { 
            resultado.cabecalho.push('Seguro')
            resultado.rodape.push('seguro')
        }

        if (d.tac) {
            resultado.cabecalho.push('TAC')
            resultado.rodape.push('tac')
        }

        resultado.cabecalho.push('Prestação')
        resultado.rodape.push('parcelas')

        resultado.cabecalho.push('Saldo Devedor')
        resultado.rodape.push('x')

        

        // analisa TACs (somente agrupamento)
        var tacList = [] 
        var tac = 0
        var mesesCorteZeros = [ 23607,23835,23869,23924,23935 ]

        if (d.tac) { 
            for (let i in d.tacList) {
                if (d.tacList[i].dia) {
                    let d1 = calcUtil.dia2intMesAno( d.tacList[i].dia )
                    if (!tacList[ d1 ]) tacList[ d1 ] = 0
                    tacList[ d1 ] += d.tacList[i].valor
                    resultado.soma.tac += d.tacList[i].valor
                }
            }
        }


        // Carência
        if (d.carencia > 1) {
            for (let x=1; x<= d.carencia; x++) {
                dia = calcUtil.somaMes(dia)
                var jurosV = sdc * juros;
                var parcela = jurosV

                resultado.planilha.push({
                    parcela: `carência ${x}/${d.carencia}` ,
                    sdc: sdc.toFixed(2),
                    dia,
                    prestacao: parcela,
                    juros: jurosV, 
                    amortizacao: 0,
                    sd: sdc.toFixed(2),
                })
            }
        }

        if (d.carencia == 1) {
            dia = calcUtil.somaMes(dia)
        }

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
                    if (tabelas[ d.indexador ][ diai ]) {
                        if (tabelas[ d.indexador ][ diai ].valor != -100) {
                            indice_correcao = tabelas[ d.indexador ][ diai ].valor
                        }
                    }
                }
            }

            if (d.modo_saldo == 'anterior') {
                guarda_indice = indice_correcao
                indice_correcao = a_indice_correcao
            }
            sdc = sdc * (1 + (indice_correcao/100))
            saldo_calc = sdc

            // cortes de zeros
            if (x>1) { // se for depois da primeira parcela
                let cortar = 1
                if (mesesCorteZeros.indexOf( diai ) >= 0) { cortar = 1000 }
                if (diai == 23935) { cortar = 2750 }
                saldo_calc = saldo_calc / cortar
                sdc  = sdc / cortar
                d.parcela /= d.parcela / cortar
            }

            // calculo da amortização
            if (d.sistema == 'PRICE') {
                var a = Math.pow(1+juros, (d.parcelas - x) + 1 );
                var parcela  = (saldo_calc * ( (a * juros) / (a - 1) ) ).toFixed(2)
                var jurosV = saldo_calc * juros;
                var amortizacao = parcela - jurosV;
                var sd = saldo_calc - amortizacao;
            }

            if (d.sistema == "SACRE") {
                var amortizacao = saldo_calc / (d.parcelas - (x-1));
                var jurosV = saldo_calc * juros;
                var parcela = amortizacao + jurosV;
                var sd = saldo_calc - amortizacao;
            }

            if (d.sistema == "SAC") {
                var amortizacao = saldo_calc / (d.parcelas - (x-1));
                var jurosV = saldo_calc * juros;
                var parcela = amortizacao + jurosV;
                var sd = saldo_calc - amortizacao;
            }

            //TAC
            tac = 0;
            if (d.tac && tacList[ diai ]) {
                tac = tacList[ diai ]
                parcela += tac
            }

            // IOF
            var iof = 0;
            if (d.iof) {
                var base_iof = 0;
                if (d.iof_juros) base_iof += jurosV;
                if (d.iof_amortizacao) base_iof += amortizacao;
                if (d.iof_tac) base_iof += tac;
                iof = base_iof * (iof_mes/100);
                parcela += iof;
            }

            // seguro
            var seguroV = 0
            if (d.seguro) {
                if (d.modo_seguro=='depois') {
                    seguroV = sdc * (d.seguro_valor/100)
                } else {
                    seguroV = sd * (d.seguro_valor/100)
                }
                
                parcela += seguroV
            }

            resultado.planilha.push({
                parcela: x,
                sdc: sdc.toFixed(2),
                dia,
                prestacao: parcela,
                juros: jurosV.toFixed(2), 
                amortizacao: amortizacao.toFixed(2),
                sd: sd.toFixed(2),
                iof: iof.toFixed(2),
                seguro: seguroV.toFixed(2),
                tac: tac.toFixed(2),
                ic: indice_correcao.toFixed(4),
            })

            resultado.soma.amortizacao += Number(amortizacao)
            resultado.soma.juros += jurosV
            resultado.soma.iof +=  Number(iof)
            resultado.soma.seguro += seguroV
            resultado.soma.parcelas +=  Number(parcela)

            dia = calcUtil.somaMes(dia)
            sdc = sd

            if (d.modo_saldo == 'anterior') {
                a_indice_correcao = guarda_indice
            }
        }

        return resultado 
    }

    this.criar = function ( infoInicial ) {
        return {
            idCalc: infoInicial.idCalc,
            hash: infoInicial.hash,
            idDono: infoInicial.idDono,
            nome: 'cálculo sem nome',
            email: '',
            dataAtual: calcUtil.diaHoje(),
            juros: 1,
            juros_periodo: 'm',
            carencia: 0,
            parcelas: 60,
            sistema: 'PRICE',
            indexador: 18,
            correcao_monetaria: false,
            recalcular: 1,
            modo_saldo: 'anterior',
            iof: false,
            iof_periodo: 'm',
            iof_perc: 3.38,
            iof_juros: true,
            iof_amortizacao: false,
            iof_tac: false,
            seguro: false,
            seguro_valor: 0,
            modo_seguro: 'antes',
            tac: false,
            tacList: [{dia:'',valor:0,desc:''}],
        }
    }

}
