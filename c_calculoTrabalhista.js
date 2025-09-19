
const calcUtil = require('./calcUtil.js');

module.exports = function() {
    const calcUtil = require('./calcUtil.js');
    let tabelas = {}

    this.setCampo = function (calcM, campo, valor) {

        if (typeof calcM === 'undefined' || calcM == null) {
            return calcM 
        }
        let feito = false

        if (campo.indexOf('variaveis.') === 0) {
            let c1 = campo.split('.')
            calcM.v[ c1[1] ] = valor
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

    this.posLeituraArquivo = function (d) {    
        return d;
    }

    this.calcular = (d) => {
     
        return d;
    }

    this.criar = function ( infoInicial ) {
        return {
            tipo: "calculoTrabalhista",
            idCalc: infoInicial.idCalc, 
            hash: infoInicial.hash, 
            idDono: infoInicial.idDono, 
            email: '', 
            nome: "novo calculo trabalhista",
            v: {
                    "nomeCalc": "novo calculo trabalhista",
                    "assinante": false,
                    "repetirValor": true,
                    "descGratA": "Gratificação de função",
                    "descGratB": "Gratificação por tempo de serviço",
                    "descGratC": "Gorjeta",
                    "checkGratA": false,
                    "checkGratB": false,
                    "checkGratC": true,
                    "epocaPropria": 0,
                    "modo_avisoprevio": 1,
                    "modo_prescricao": 5,
                    "dsrDom": false,
                    "dsrSeg": true,
                    "dsrTer": false,
                    "dsrQua": false,
                    "dsrQui": false,
                    "dsrSex": false,
                    "dsrSab": false,
                    "dsrFer": false,
                    "dsrIdTabela": 1,
                    "dsrFeriados": "111000100101210401051210021115112512",
                    "salarioReflex_base1": "mes",
                    "salarioReflex_base2": "nao",
                    "salarioReflex_base3": "nao",
                    "salarioReflex_base4": "nao",
                    "salarioReflex_base5": "nao",
                    "HEReflex_base1": true,
                    "HEReflex_base2": false,
                    "HEReflex_base3": false,
                    "HEReflex_base4": false,
                    "HEReflex_base5": false,
                    "HEReflex_base6": false,
                    "HEReflex_base7": false,
                    "HEReflex_base8": false,
                    "dataad": "",
                    "datade": "",
                    "datadi": "",
                    "dataes": "",
                    "percHE1": 50,
                    "percHE2": 100,
                    "modoDigitacaoHora": "s",
                    "horasInterMetodo": "percentual",
                    "juros_modo_calc_selic": "composto", 
                    "salario": false,
                    "ferias": false,
                    "multasRescisorias": false,
                    "saldoSalarial": false,              
            }

        }
    }


}
