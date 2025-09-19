const calc = require('./calc.js');

module.exports = function() {
    const calcUtil = require('./calcUtil.js');
    
    let calcServer = {}
    let con = null 


    this.setVariaveis = function (variaveis) {
        calcServer = variaveis.calcServerAtualiza
        con = variaveis.con
    }

    this.validar = function (d) {
    }

    this.posLeituraArquivo = function (d) {
        return d;
    }

    this.criar = function ( infoInicial ) {
        let r = {"info":{"idCalc":0,"nome":"Novo cálculo","selic_inicio":"01/11/2019","dia_atualiza":"01/01/2024","diaAtualizacaoErro":"","indexador":16,"calc_modo_impressao":"e","calc_jurosm":false,"calc_jurosc":false,"calc_multa":false,"calc_honorarios":false,"calc_custas":false,"calc_ordem":false,"calc_perc_prorata":"0","calc_perc_indice_neg":"1","ultimoID":2,"modo_indexador":"um","multi_interno":false,"sucumbencias":{"modo":"p","valor":10},"multa523":{"valor_atualizado":true,"juros_moratorios":false,"juros_compensatorios":false,"multa":false,"honorarios":false,"sucumbencias":false,"custas":false},"juros_moratorios":{"modo":"s","percentual":"1","tipo_calculo":"s","pro_rata":0,"a_partir":"vencimento","data_citacao":"","juros_detalhado":[{"inicio":"","fim":"","percentual":0,"tipo":"s"},{"inicio":"","fim":"","percentual":0,"tipo":"s"},{"inicio":"","fim":"","percentual":0,"tipo":"s"},{"inicio":"","fim":"","percentual":0,"tipo":"s"}]},"juros_compensatorios":{"modo":"s","percentual":"1","tipo_calculo":"s","pro_rata":0,"a_partir":"vencimento","data_citacao":"","juros_detalhado":[{"inicio":"","fim":"","percentual":0,"tipo":"s"},{"inicio":"","fim":"","percentual":0,"tipo":"s"},{"inicio":"","fim":"","percentual":0,"tipo":"s"},{"inicio":"","fim":"","percentual":0,"tipo":"s"}]},"custas":{"juros_moratorios":false,"selic":false,"juros_compensatorios":false,"multa":false,"honorarios":false},"multa":{"percentual":"2","tipo_calculo":"p","multa_sobre_juros":false,"multa_valor_vincendo":false,"multa_sobre_valor_original":false},"honorarios":{"modo":"p","valor":10},"metodologia_h523":"2","honorarios523_a_parte":false,"soma_resultado_atualizacao":0,"soma_resultado_multa":0,"soma_resultado_honorarios":0,"soma_resultado_jurosc":0,"soma_resultado_jurosm":0,"soma_final_resultado":0,"soma_custas_atualizacao":0,"soma_custas_multa":0,"soma_custas_honorarios":0,"soma_custas_jurosc":0,"soma_custas_jurosm":0,"soma_final_custas":0,"soma_final":0,"valor_honorarios_sucumbencia":0,"valor_multa_ncpc":0,"valor_honorarios_ncpc":0,"totalzao":0,"descricao":""},"lista":[{"id":1,"dia":"","valor":0,"desc":"","custas":false,"memoria":[],"memoriaSimples":"","resultado_atualizacao":0,"resultado_jurosm":0,"resultado_jurosm_percentual":0,"resultado_jurosc":0,"resultado_jurosc_percentual":0,"resultado_multa":0,"resultado_multa_percentual":0,"resultado_honorarios":0,"resultado_honorarios_percentual":0,"resultado_total":0},{"id":2,"dia":"","valor":0,"desc":"","custas":true,"memoria":[],"memoriaSimples":"","resultado_atualizacao":0,"resultado_jurosm":0,"resultado_jurosm_percentual":0,"resultado_jurosc":0,"resultado_jurosc_percentual":0,"resultado_multa":0,"resultado_multa_percentual":0,"resultado_honorarios":0,"resultado_honorarios_percentual":0,"resultado_total":0}]}
        r.idCalc =  infoInicial.idCalc
        r.hash = infoInicial.hash 
        r.info.idCalc =  infoInicial.idCalc
        r.info.idDono =  infoInicial.idDono
        // r.info.dia_atualiza =  calcUtil.diaHoje()
        r.info.dia_atualiza = infoInicial.diaMaximo
        r.info.calc_abater_valores = false 
        r.assinante = infoInicial.assinante

        return r
    }

    this.calcular = async (c, assinante = false) => {
        var a = await calcServer.atualiza(c, true, -1, assinante) 
        // var a = await calcServer.atualiza(c, true, -1, true) 

        // console.log('### resultado ##')
        // console.log(a)
        return a 
    }

    this.setCampo =  async function (calcM, campo, valor) {
        // console.log('atualizacaoMonetaria.setCampo')
        // console.log(campo, valor)

        if (!calcM.info) calcM.info = { }
        if (calcM.idDono) calcM.info.idDono = calcM.idDono

		if (campo == 'indexador') {
			if (valor >= 200 & valor < 300) {
				calcM.info.multi_interno = true
				calcM.info.modo_indexador = "um"

				let dAtual = calcServer.listaTabelas[ valor ] 
				let info2 = dAtual.tabela
				
				let [res2] = await con.promise().query('SELECT nome, dados_json FROM composicao_indice WHERE id='+info2)

				calcM.info.multiIndexador = { 
					nome: res2[0].nome, 
					indices: JSON.parse(res2[0].dados_json),
					id: info2	
				}

				// --- verifica qual é o maximo da correção
				var id_ultimo_indice = 0
				var pos_ultimo_indice = 0
				for (var i1 in calcM.info.multiIndexador.indices) {
					if (calcM.info.multiIndexador.indices[i1].id >0) {
						id_ultimo_indice = calcM.info.multiIndexador.indices[i1].id
						pos_ultimo_indice = i1 
					}
				}

				q3 = calcServer.listaTabelas[ id_ultimo_indice ]
				calcM.info.multiIndexador.indices[pos_ultimo_indice].fim = calcUtil.yyyymmdd2dia( q3.maximo.toString() )
			} else {
				calcM.info.multi_interno = false
			}
		}

        if (campo == 'lista') {
            calcM.lista = valor
            return calcM
        }

        if (campo== 'jurosTab') {
            let jtemp = [] 
            let ultimoMes = 23569
            let n = 0 
            let ptemp = 0 
            let ttemp = 's'
            for (var i in valor) {
                ptemp = 0 
                ttemp = 's'

                n = i 

                if (valor[i].modo == '6') {
                    ptemp = 0.5
                }

                if (valor[i].modo == '12') {
                    ptemp = 1
                }

                if (valor[i].modo == 'P') {
                    ttemp = 'poupanca_204_simples'
                }

                if (valor[i].modo == 'L') {
                    ttemp = 'taxalegal'
                }

                jtemp.push({
                    inicio: '01/'+ calcUtil.mesAno2dia( ultimoMes+1 ),
                    fim: calcUtil.strUltimoDia('01/'+ calcUtil.mesAno2dia( valor[i].ate ) ),
                    percentual: ptemp,
                    tipo: ttemp
                })
                ultimoMes = valor[i].ate
            }

            jtemp[n].fim =  calcM.info.dia_atualiza
            calcM.info.juros_moratorios.juros_detalhado = jtemp
            if (jtemp.length > 1) {
                calcM.info.juros_moratorios.modo = 'a'
            } else {
                calcM.info.juros_moratorios.modo = 's'  
                calcM.info.juros_moratorios.percentual = ptemp
                calcM.info.juros_moratorios.tipo_calculo = ttemp
            }
            // console.table(jtemp)
            return calcM
        }

        if (campo.indexOf(".") > 0) {
            let [campo1, campo2] = campo.split('.')
            if (!calcM.info[campo1]) calcM.info[campo1] = { }
            calcM.info[campo1][campo2] = valor
            return calcM
        }

        calcM.info[campo] = valor
        return calcM
    }

}
