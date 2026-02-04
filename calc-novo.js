const { default: axios } = require('axios');

module.exports = function() {
	require('dotenv').config()  
	const mysql = require('mysql2')
	const calcUtil = require('./calcUtil.js');
	const BigNumber = require('bignumber.js');

	this. mysql_senha = process.env.MYSQL_password2 
	var servidorAPI = process.env.servidorAPI


	this.mysql_info = {host: process.env.MYSQL_host, 	user: process.env.MYSQL_user,	password: this.mysql_senha, database: process.env.MYSQL_database, multipleStatements: true,    waitForConnections: true,    connectionLimit: 10,    queueLimit: 0 }
	this.listaTabelas  = [] 
	this.tabelas  = {} 
	var that = this 
	var infoIndicePersonalizado_i = 0
	var infoIndicePersonalizado_f = 0 
	var diaCalculoGratuito = 0 

	this.tipos_calc_juros = {
		's':  'simples (mensal)',
		'sa':  'simples (anual)',
		'c': 'capitalizados mensalmente' ,
		'cs': 'capitalizados semestralmente' ,
		'ca': 'capitalizados anualmente',
		'selics': 'Selic não capitalizada' ,
		'taxalegal': 'taxa legal (Lei 14.905/24)' ,
		'selics_mais1': 'Selic não capitalizada + 1% no final' ,
		'selica': 'Selic capitalizada mensalmente' ,
		'poupanca_nova_simples': 'Poupança (Bacen tabela 196, a partir de 04/05/2012) não capitalizada mensalmente',
		'poupanca_nova': 'Poupança (Bacen tabela 196, a partir de 04/05/2012) capitalizada mensalmente',
		'poupanca_204_simples': 'Poupança - Rentabilidade adicional no período (Bacen tabela 204, a partir de 01/02/1991) não capitalizada mensalmente',
		'poupanca_204': 'Poupança - Rentabilidade adicional no período (Bacen tabela 204, a partir de 01/02/1991) capitalizada mensalmente',
		'poupanca_simples': 'Poupança não capitalizada mensalmente' ,
		'poupanca': 'Poupança capitalizada mensalmente',
   }

	this.handleDisconnect = function() {
		that.con =   mysql.createPool(this.mysql_info).promise() // mysql1.createConnection(mysql_info); 

		that.con.on('error', function(err) {
			console.log('---- mysql desconectou ---- ', err);
			if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
				handleDisconnect(); 
			} else { 
				throw err; 
			}
		});
	}
	
	this.handleDisconnect();


	this.a_moeda = async  function(dia, v1, dia_atualiza, idTab) {
		var dia0 = dia 
		var dia1 =  dia
		var dia2 =  dia_atualiza 
		var memoria = [] 
		v1 = Number(v1)

		if (idTab > 200) {
			var tabelaUsadaTudo = await this.le_tabela_personalizada( idTab )
			var tabelaUsada = tabelaUsadaTudo.dados
			var nomeIndice = tabelaUsadaTudo.nome 
		} else {
			var tabelaUsada = this.tabelas[ idTab ]
			var nomeIndice = this.listaTabelas[ idTab ].nome
		}

		var i0 = tabelaUsada[ calcUtil.dia2intMesAno( dia0 ) ]
		var i1 = i0 

		if (typeof i0 === 'undefined')  {
			console.log('sem indice', dia, v1, dia_atualiza, idTab)
			return { resultado: 0, memoria }
		} 

		var indice0 = new BigNumber( i0.valor )
		var memoria = [{  
				dia: dia,
				str: calcUtil.moeda(dia)+calcUtil.formataNum(v1, 2),
				valor: v1.toFixed(2),
				indice: nomeIndice 
			}] 

		var memoriaSimples = calcUtil.moeda(dia)+' '+calcUtil.formataNum(v1, 2)

		dia1 = dia2.substring(0,2)+dia1.substring(2)
		var adia1 = dia1
		dia1 = calcUtil.somaMes( dia1 )

		var avalor = new BigNumber(v1.toFixed(15))
		var linha = 0

		if (calcUtil.dia2yyyymmddInt(dia1) > calcUtil.dia2yyyymmddInt(dia2)) {
			dia1 = dia2 
		}

		while ( calcUtil.dia2yyyymmddInt(dia1) <= calcUtil.dia2yyyymmddInt(dia2) ) {
			var i1 = tabelaUsada[ calcUtil.dia2intMesAno( adia1 ) ]
			var i2 = tabelaUsada[ calcUtil.dia2intMesAno( dia1 ) ]


			if (typeof i1 === 'undefined' || typeof i2 === 'undefined')  {
				return { resultado: 0, memoria }
			}
	
			var indice1 = new BigNumber(i1.valor)
			var indice2 = new BigNumber(i2.valor)
			var v = new BigNumber(v1.toFixed(15))

			if ((linha==0) && (calcUtil.dia2yyyymmddInt(dia0) >= 19890101 && calcUtil.dia2yyyymmddInt(dia0) < 19890115)) {
				indice0 = indice0.times(1000)
				indice1 = indice1.times(1000)
			}

			var valor = ( v.dividedBy(indice0 ).times(indice2) )

			let t = { 
				indice: nomeIndice, 
				dia: dia1,
				str: calcUtil.moeda(dia1)+calcUtil.formataNum(avalor.toFixed(2), 2)+' : '+indice1+' x '+indice2,
				valor: valor.toFixed(2)
			}

			memoria.push( t )

			adia1 = dia1 
			avalor = valor 
			dia1 = calcUtil.somaMes( dia1 ) 
			linha++ 
		}

		memoriaSimples = memoriaSimples+' : '+indice0+' x '+indice2
		var res = { resultado: Number(valor).toFixed(2), memoria, memoriaSimples } 
		// console.log(res)
		return res
	}

	this.a_tabelaJudicial = async function(dia, v1, dia_atualiza, tj) {
		v1 = Number(v1)

		let dia2 =  dia_atualiza 
		let valor = v1
		var nomeIndice = '' 
		let d = calcUtil.dia2intMesAno(dia)
		let dAtual = calcUtil.dia2intMesAno(dia_atualiza)
		let indiceN = tj[ d ].indiceGerado / tj[ dAtual ].indiceGerado
		// console.table(tj) 
		
		let memoria = [{  
				indice: nomeIndice,
				dia: dia,
				str: calcUtil.moeda(dia)+' '+calcUtil.formataNum(v1, 2),
				valor: v1.toFixed(2)
			}] 
		let memoriaSimples = calcUtil.moeda(dia)+' '+calcUtil.formataNum(v1, 2)

		if (calcUtil.dia2intMesAno(dia) == calcUtil.dia2intMesAno(dia2)) {
			valor = v1 * indiceN
			memoria = [{  
				indice: nomeIndice,
				dia: dia,
				str: calcUtil.moeda(dia)+' '+calcUtil.formataNum(valor, 2)+' x '+indiceN,
				valor: valor.toFixed(2)
			}] 
		}
		
		let dia1 = calcUtil.somaMes(dia)
		
		while ( calcUtil.dia2yyyymmddInt( calcUtil.strPrimeiroDia(dia1)  ) <= calcUtil.dia2yyyymmddInt(dia2) ) {
			let indexadorStr = '' 
			let d1 =  calcUtil.dia2intMesAno( dia1 ) 
			// console.log('tj[ d1 + 1 ]',tj[ d1 + 1 ])
			let variacao1 = 0 
			if (typeof tj[ d1 - 1 ] !== 'undefined') {
				variacao1 = tj[ d1 - 1 ].variacao 
			}

			if (tj[d1].indexador < 0) {
				indexadorStr = `(fixado em: ${calcUtil.formataNum(variacao1,2)}%)`
			}
			if (tj[d1].indexador == 1 || tj[d1].indexador == 73) {
				indexadorStr = `(${tj[ d1 ].indexadorStr})`
			} 
			if (tj[d1].indexador > 1 && tj[d1].indexador != 73) {
				indexadorStr = `(${tj[ d1 - 1 ].indexadorStr}: ${calcUtil.formataNum(variacao1,2)}%)`
			}
			
			let avalor = valor 
			let ac = indiceN / tj[ d1 ].indiceGerado
			valor = v1 * ac 

			let t = { 
				indice: nomeIndice,
				dia: dia1,
				str: calcUtil.moeda(dia1)+' '+calcUtil.formataNum(avalor.toFixed(2), 2)+' x '+calcUtil.formataNum(ac, 9)+' '+indexadorStr,
				valor: valor.toFixed(2)
			}
			memoria.push( t )
			dia1 = calcUtil.somaMes(dia1)
		}


		valor = v1 * indiceN 
		memoriaSimples = memoriaSimples+' x '+calcUtil.formataNum(indiceN, 9) 
		var res = { resultado: valor.toFixed(2), memoria, memoriaSimples } 
		return res
	}

	this.a_moedainv = async function(dia, v1, dia_atualiza, idTab) {
		var dia0 = dia 
		var dia1 =  dia
		var dia2 =  dia_atualiza 
		var memoria = [] 
		v1 = Number(v1)

		if (idTab > 200) {
			var tabelaUsadaTudo = await this.le_tabela_personalizada( idTab )
			var tabelaUsada = tabelaUsadaTudo.dados
			var nomeIndice = tabelaUsadaTudo.nome
		} else {
			var tabelaUsada = this.tabelas[ idTab ]
			var nomeIndice = this.listaTabelas[ idTab ].nome
		}

		var i0 = tabelaUsada[ calcUtil.dia2intMesAno( dia0 ) ]
		var i1 = i0 

		if (typeof i0 === 'undefined')  {
			// console.log('nao existe indice ')
			return { resultado: 0, memoria }
		} 

		var indice0 = new BigNumber( i0.valor )
		var memoria = [{  
				indice: nomeIndice, 
				dia: dia,
				str: calcUtil.moeda(dia)+calcUtil.formataNum(v1, 2),
				valor: v1.toFixed(2)
			}] 

		var memoriaSimples = calcUtil.moeda(dia)+' '+calcUtil.formataNum(v1, 2)

		dia1 = dia2.substring(0,2)+dia1.substring(2)
		var adia1 = dia1
		dia1 = calcUtil.somaMes( dia1 )

		var avalor = new BigNumber(v1)
		var linha = 0

		if (calcUtil.dia2yyyymmddInt(dia1) > calcUtil.dia2yyyymmddInt(dia2)) {
			dia1 = dia2 
		}

		while ( calcUtil.dia2yyyymmddInt(dia1) <= calcUtil.dia2yyyymmddInt(dia2) ) {
			var i1 = tabelaUsada[ calcUtil.dia2intMesAno( adia1 ) ]
			var i2 = tabelaUsada[ calcUtil.dia2intMesAno( dia1 ) ]
			
			if (typeof i1 === 'undefined' || typeof i2 === 'undefined')  {
				console.log('zerando o cálculo por falta de índice: ',idTab,  dia1, dia2)
				return { resultado: 0, memoria }
			}
	
			var indice1 = new BigNumber(i1.valor)
			var indice2 = new BigNumber(i2.valor)
			var v = new BigNumber(v1)

			if ((linha==0) && (calcUtil.dia2yyyymmddInt(dia0) >= 19890101 && calcUtil.dia2yyyymmddInt(dia0) < 19890115)) {
				indice0 = indice0.times(1000)
				indice1 = indice1.times(1000)
			}

			var valor = ( v.dividedBy(indice2 ).times(indice0) )

			let t = { 
				dia: dia1,
				str: calcUtil.moeda(dia1)+calcUtil.formataNum(avalor.toFixed(2), 2)+' : '+indice2+' x '+indice1,
				valor: valor.toFixed(2),
				indice: nomeIndice 
			}

			memoria.push( t )

			adia1 = dia1 
			avalor = valor 
			dia1 = calcUtil.somaMes( dia1 ) 
			linha++ 
		}

		memoriaSimples = memoriaSimples+' : '+indice2+' x '+indice0
		var res = { resultado: Number(valor).toFixed(2), memoria, memoriaSimples } 

		return res
	}

	this.a_perc = async function(dia, v1, dia_atualiza, idTab, calc_perc_indice_neg=true, prorata=false) {
		if (typeof dia_atualiza === 'undefined' || typeof dia === 'undefined') {
			return { resultado: 0, memoria: [], memoriaSimples: '' } 
		}
		
		if (typeof dia !== 'string') {
			dia = dia.toString()
		}
		
		var dia0 = dia 
		var dia1 =  dia
		var dia2 =  dia_atualiza 

		var memoria = [] 
		// console.log('---- ', dia1, dia2)
		var mesmoMes = calcUtil.dia2intMesAno(dia1) == calcUtil.dia2intMesAno(dia2) 
		var ajuste1989 = 0
		v1 = Number(v1)

		var campo = (calc_perc_indice_neg) ? "acumulado" : "acumulado_positivo"

		if (idTab > 200) {
			var tabelaUsadaTudo = await this.le_tabela_personalizada( idTab )
			var tabelaUsada = tabelaUsadaTudo.dados
			var nomeIndice =  tabelaUsadaTudo.nome 
			campo = 'acumulado'
		} else {
			var tabelaUsada = this.tabelas[ idTab ]
			var nomeIndice = this.listaTabelas[ idTab ].nome
		}

		var dia0ma = calcUtil.dia2intMesAno( dia0 )
		var i0 = tabelaUsada[ dia0ma ]
		var i1 = i0 

		if (typeof i0 === 'undefined')  {
			console.log('saindo fora!!!!!! linha 240 calc.js: ', idTab, dia0)
			return { resultado: 0, memoria }
		} 

		i0[campo] = this.bigNumberFit(i0[campo])
		var indice0 = new BigNumber( i0[campo] )
		
		var memoria = [{  
				dia: dia,
				str: calcUtil.moeda(dia)+calcUtil.formataNum(v1, 2),
				valor: v1.toFixed(2),
				indice: nomeIndice 
			}] 
		var memoriaSimples = calcUtil.moeda(dia)+' '+calcUtil.formataNum(v1, 2)

		dia1 = dia2.substring(0,2)+dia1.substring(2)
		var adia1 = dia1
		dia1 = calcUtil.somaMes( calcUtil.strPrimeiroDia( dia1 ) )

		var avalor = new BigNumber(v1.toFixed(15))
		var valor = avalor
		var indiceRedutor = 1 
		var linha = 0 

		if ((calcUtil.dia2yyyymmddInt(dia0) >= 19890101 && calcUtil.dia2yyyymmddInt(dia0) < 19890115 )) {
			ajuste1989 = 1000 
		}

		while ( calcUtil.dia2yyyymmddInt(dia1) <= calcUtil.dia2yyyymmddInt(dia2) ) {
			var i1 = tabelaUsada[ calcUtil.dia2intMesAno( adia1 ) ]
			var i2 = tabelaUsada[ calcUtil.dia2intMesAno( dia1 ) ]

			if (typeof i1 === 'undefined' || typeof i2 === 'undefined')  {
				return { resultado: 0, memoria }
			}

			var indice1perc = new BigNumber(i1.valor)

			i2[campo] = this.bigNumberFit(i2[campo])
			var indice2 = new BigNumber(i2[campo])

			// inicio pro rata
			if ((linha == 0) && (prorata)) {
				var ac_pro = (indice1perc / calcUtil.diasMes( dia0 )) * ((calcUtil.diasMes( dia0 )-calcUtil.dia2intDia( dia0 ))+1);	
				indiceRedutor = ((1+(ac_pro/100)) / (1+(indice1perc/100)) )	
				if (!calc_perc_indice_neg && ac_pro < 0) {
					indiceRedutor = 1
				}
				indice1perc = ac_pro
			}
			// fim pro rata

			var v = new BigNumber(v1.toFixed(15))

			var str_ignorar = ''
			if ((!calc_perc_indice_neg) && (indice1perc < 0)) {
				str_ignorar = ' (ignorado)'
			} else {
				valor = v.dividedBy(indice0).times(indice2).times(indiceRedutor.toFixed(15) ) 
			}

			var divisorMoeda1 = calcUtil.divisorMoeda(adia1, dia1)
			if (ajuste1989) {
				valor = valor.dividedBy(1000)
				if (linha==0) {
					divisorMoeda1 = 1000
				}
			}

			var divisorStr = ''
			if (divisorMoeda1 > 0) {
				divisorStr = ' : '+divisorMoeda1 
				// valor = valor.dividedBy(divisorMoeda1)
			}

			let t = { 
				dia: dia1,
				indice: nomeIndice, 
				str: calcUtil.moeda(dia1)+' '+calcUtil.formataNum(avalor.toFixed(2), 2)+' x '+calcUtil.formataNum(indice1perc.toFixed(4), 4)+'%'+str_ignorar+divisorStr,
				valor: valor.toFixed(2)
			}

			memoria.push( t )

			adia1 = dia1 
			avalor = valor 
			dia1 = calcUtil.somaMes( dia1 ) 
			linha++
		}

		if ((prorata) && (calcUtil.dia2intDia(dia2) > 1)) {
			var i1 = tabelaUsada[ calcUtil.dia2intMesAno( dia2 ) ]

			var indice1perc = new BigNumber(i1.valor)

			if (mesmoMes) {
				var ac_pro = (indice1perc / calcUtil.diasMes( dia0 )) * ((calcUtil.diasMes( dia0 )-calcUtil.dia2intDia( dia0 ))+1);	
				indiceRedutor = ((1+(ac_pro/100)) / (1+(indice1perc/100)) )	
				if (!calc_perc_indice_neg && ac_pro < 0) {
					indiceRedutor = 1
				}
				indice1perc = ac_pro
				indice1perc = (indice1perc / calcUtil.diasMes( dia2 )) * calcUtil.dia2intDia( dia2 );

				// seria a fórmula correta, no entanto não foi aplicada no programa anterior
				// var n_dias = (calcUtil.dia2intDia( dia2 ) - calcUtil.dia2intDia( dia0 )) +1 
				// indice1perc = indice1perc.dividedBy(calcUtil.diasMes( dia0 )).times(n_dias)
			} else {
				indice1perc = (indice1perc / calcUtil.diasMes( dia2 )) * calcUtil.dia2intDia( dia2 );
			}

			if ((!calc_perc_indice_neg) && (indice1perc < 0)) {
				var textoIgnorado = ' (ignorado)'
			} else {
				valor *= (1+(indice1perc/100))
				var textoIgnorado = ''
			}
				
			let t = { 
				indice: nomeIndice, 
				dia: dia2,
				str: calcUtil.moeda(dia2)+calcUtil.formataNum(avalor.toFixed(2), 2)+' x '+indice1perc+'% '+textoIgnorado,
				valor: valor.toFixed(2)
			}
			memoria.push( t )
		}

		var indiceN = valor / v1 
		memoriaSimples = memoriaSimples+' x '+calcUtil.formataNum(indiceN, 6) 
		
		var n1 = Number(valor.toFixed(15))
		var res = { resultado: n1, memoria, memoriaSimples } 
		return res
	}

	this.pegasoma = async function (dia1, dia2, tabela, adicionar_mes_soma=1, calc_prorata=false) { 
		
	  	let casasDecimais = (tabela == 109) ? 6 : 2 
	  	let dia0 = dia1 
	  	let dia2original = dia2
		let resultado = 0;
	  	let resultadoDetalhado = []

		let tabela1 = JSON.parse( JSON.stringify( this.tabelas[ tabela ] )) 
		let tabela_selic = (tabela==31 || tabela==72) 
		// let tabela_selic = (tabela==23 || tabela==31 || tabela==72) 

		if (tabela==31 || tabela==72)  {  // selic_receita
			if (adicionar_mes_soma) dia1 = calcUtil.somaMes(dia1);
		}
	  
		primeiro_dia1 = calcUtil.yyyymmdd2intMesAno( calcUtil.dia2yyyymmdd(dia1) )
		primeiro_dia2 = calcUtil.yyyymmdd2intMesAno( calcUtil.dia2yyyymmdd(dia2) ) 	  

		if (primeiro_dia1 > primeiro_dia2) {
			return { resultado: 0};
		}

		resultado = new BigNumber(0);
		let n_item = 0;
		for (let e1 = primeiro_dia1;  e1 <= primeiro_dia2; e1++) {
			let e = tabela1[e1]

			if (typeof e === 'undefined') {
				e = { dia: e1, valor: 0 }
			}

			if (typeof e.valor === 'undefined') {
				e.valor = 0
			}

			// calcula pro-rata 
			if ( (calc_prorata) && (n_item==0) ) {
				e.valor = (e.valor / calcUtil.diasMes( dia0 )) * ( (calcUtil.dia2intDia( dia2 )  - calcUtil.dia2intDia( dia0 )) +1);
			}
			// fim calcula pro-rata
			if ((calc_prorata) && (e1 == primeiro_dia2) && (n_item > 0) ) {
				e.valor = (e.valor / calcUtil.diasMes( dia2original )) * calcUtil.dia2intDia( dia0 );	
			}

			let v = 0;
			if (e && typeof e.valor !== 'undefined' && e.valor != null) {
				v = e.valor
			}
			
			if (tabela_selic && e1 == primeiro_dia2) { v = 1;  }
			if (e && v != -100) {
				resultado = resultado.plus( v.toFixed(15)  );
				let resultado2 = null;

				if (tabela_selic && n_item > 0) {
					let r2 = new BigNumber(resultadoDetalhado[ n_item-1 ].resultado) 
					r2 = r2.plus(1)
					resultado2 = r2.toNumber().toFixed(casasDecimais)
				}

				if (resultado2 === null) {
					resultado2 = resultado.toNumber().toFixed(casasDecimais)
				}

				resultadoDetalhado.push( { dia: e.dia, valor: v, resultado: resultado.toFixed(casasDecimais), resultado2 } )

				n_item++;
			}
		}


	  return { resultado: Number(resultado), resultadoDetalhado };
	}



	this.pegamul = async function (dia1, dia2, tabela) { 
		var resultado = 0;
 
		primeiro_dia1 = calcUtil.dia2yyyymmddInt( calcUtil.strPrimeiroDia(dia1) )
		primeiro_dia2 = calcUtil.dia2yyyymmddInt( calcUtil.strPrimeiroDia(dia2) ) 
  
		resultado = this.tabelas[ tabela ].reduce( function(parcialSum, e) {
		  if (!parcialSum) parcialSum = 1 
		  if ((e.dia >= primeiro_dia1 && e.dia <= primeiro_dia2)) {
			  return parcialSum * (1+(e.valor/100)) 
		  } else {
			  return parcialSum
		  }
		}, 0)
		return (resultado - 1)*100
	}


	this.a_selic = async function(dia, v1, dia_atualiza, idTab, adicionar_mes_soma=false, prorata=false) {
		// console.log(dia, v1, dia_atualiza, idTab)
		v1 = Number(v1)
		var dia0 = dia 
		var dia1 =  dia // calcUtil.strPrimeiroDia( dia )
		var dia2 =  dia_atualiza 
		var memoria = [] 
		var v0 = new BigNumber(v1.toFixed(15))
		var valor = v0
		var nomeIndice = this.listaTabelas[ idTab ].nome
		
		var memoria = [{  
				indice: nomeIndice,
				dia: dia,
				str: calcUtil.moeda(dia)+' '+calcUtil.formataNum(v1, 2),
				valor: v1.toFixed(2)
			}] 
		var memoriaSimples = calcUtil.moeda(dia)+' '+calcUtil.formataNum(v1, 2)

		 

		if ((calcUtil.dia2intMesAno(dia0) == calcUtil.dia2intMesAno(dia2)) && (prorata)) {
			var resultado1 = await this.pegasoma(dia0, dia2, idTab, adicionar_mes_soma, true)
			var resultado = resultado1.resultado
			var valor = valor.times(1+(resultado.toFixed(12)/100))
			memoria = [{  
				indice: nomeIndice,
				dia: dia,
				str: calcUtil.moeda(dia)+' '+calcUtil.formataNum(v1, 2)+' x '+resultado+'%',
				valor: valor.toFixed(2) 
			}] 
		}
	

		var ac1 = await this.pegasoma(dia0, dia2, idTab, adicionar_mes_soma, prorata) 
		let n_ac1 = ac1.resultadoDetalhado.length
		let t = null 
		let valor_final = valor

		for (let pos=0; pos < n_ac1; pos++) {
			let dia5 = calcUtil.yyyymmdd2dia(ac1.resultadoDetalhado[ pos ].dia)

			if (pos>0) {
				let ac = ac1.resultadoDetalhado[ pos ].resultado2
				let valor = new BigNumber(v0)
				valor =valor.times( ((ac/100)+1).toFixed(15) )
				valor_final = valor 
				t = { 
					indice: nomeIndice,
					dia: dia5,
					str: calcUtil.moeda(dia5)+' '+calcUtil.formataNum(v0, 2)+' x '+ac+'%',
					valor: valor.toFixed(2) 
				}
				memoria.push( t )
			} 	
		}

		var indiceN = valor_final / v1 
		memoriaSimples = memoriaSimples+' x '+calcUtil.formataNum(indiceN, 6) 
		var res = { resultado: valor_final, memoria, memoriaSimples } 

		return res
	}

	this.calcJurosAnuais = async function(dia, valor, prorata, dataini, fim, tipo_anual, periodo_meses=12) {
		var r = 1;
		var i = dia;
		var jmes = valor / periodo_meses;
		var i2 = 0 
	  
	
		if (tipo_anual == "ano") {
		   while ( calcUtil.dia2yyyymmddInt(i) < calcUtil.dia2yyyymmddInt(fim) )  {
			 if (periodo_meses == 12)
			   i2 = calcUtil.somaAno(i);
			 else  {
			   i2 = i;
			   for (var a=1; a<=periodo_meses; a++) {
				 i2 = calcUtil.somaMes(i2);
			   }
			 }
			 if (calcUtil.dia2yyyymmddInt(i2) > calcUtil.dia2yyyymmddInt(fim)) i2 = fim;
			 
			 var j1 = calcUtil.calcJuros(i, i2, jmes, 'simples', false) 
			 r *= 1+(j1/100)
	  
			 if (periodo_meses == 12)
			   i = calcUtil.somaAno(i);
			 else  {
			   for (a=1; a<=periodo_meses; a++)
				 i = calcUtil.somaMes(i);
			 }
		   }
		} else {
			while (calcUtil.dia2yyyymmddInt(i) < calcUtil.dia2yyyymmddInt(fim)) {
			  var ano = calcUtil.dia2intAno(i)+1;
			  var i2 = `01/01/${ano}`;
			  if ( calcUtil.dia2yyyymmddInt(i2) > calcUtil.dia2yyyymmddInt(fim) ) i2 = fim;
			  j1 = calcUtil.calcJuros(i, i2, jmes, 's', false);	 
		 
			  r *= 1+(j1/100);
			  i = i2;
			}	
		}
		return (r-1)*100;
	}

	this.calcSelicAnual = async function(dia, fim, tipo_anual) {
		var r = 1;
		var i = dia;

		if (tipo_anual=="ano") {
			while ( calcUtil.dia2yyyymmddInt(i) < calcUtil.dia2yyyymmddInt(fim)) {
			  var i2 = calcUtil.somaAno(i);
			  if ( calcUtil.dia2yyyymmddInt($i2) > calcUtil.dia2yyyymmddInt(fim) )i2 = calcUtil.somaDia(fim);
	   
			  var j2 = await this.pegasoma(i, i2, 23 /*selic simples*/) 
			  var j1 = j2.resultado
			  r *= 1+(j1/100);
			  i = calcUtil.somaAno($);
			}
		 } else {
			while ( calcUtil.dia2yyyymmddInt(i) < calcUtil.dia2yyyymmddInt(fim)){
				var ano = calcUtil.dia2intAno(i)+1;
				var i2 = `01/01/${ano}`; 
								
				if ( calcUtil.dia2yyyymmddInt(i2) > calcUtil.dia2yyyymmddInt(fim) ) i2 = calcUtil.somaMes(fim);
				var j2 = await this.pegasoma(i, i2, 23 /*selic simples*/) 
				var j1 = j2.resultado
				r *= 1+(j1/100);
				i = calcUtil.somaAno($);

				i = i2;
			  }
		 }

		 return (r-1)*100;
	}

	this.pega_juros = async function  (dia, diaFim, jInfo) {


		var r = 0;
		if (typeof jInfo === 'undefined') { console.log('juros não preenchido'); return 0; } 

		if (jInfo.tipo_calculo == 's' || jInfo.tipo_calculo == 'c') {
			r = calcUtil.calcJuros(dia, diaFim, jInfo.percentual, jInfo.tipo_calculo, jInfo.pro_rata == '1') 
		}

		if (jInfo.tipo_calculo == 'sa') { // simples anual
			r = calcUtil.calcJuros(dia, diaFim, jInfo.percentual/12, 's', jInfo.pro_rata == '1') 
		}

        if (jInfo.tipo_calculo  == "poupanca") {
			var idTab = 6; // poupanca
			var temp1 = await this.a_perc(dia, 10000000000, diaFim, idTab, true, false) 
			// console.log('l: 572 ', temp1)
			var temp2 = new BigNumber(temp1.resultado.toFixed(15))
			r = temp2.dividedBy(100000000).minus(100);
			// r = 0 
		}

		if (jInfo.tipo_calculo  == "poupanca_nova") {
			var idTab = 87; // poupanca_196
			var temp1 = await this.a_perc(dia, 10000000000, diaFim, idTab, true, false) 
			// console.log(temp1)	
			var temp2 = new BigNumber(temp1.resultado.toFixed(15))
			r = temp2.dividedBy(100000000).minus(100);
			// r = 0
		}

		if (jInfo.tipo_calculo  == "poupanca_204") {
			var idTab = 94; // poupanca_204
			var temp1 = await this.a_perc(dia, 10000000000, diaFim, idTab, true, false) 
			var temp2 = new BigNumber(temp1.resultado.toFixed(15))
			r = temp2.dividedBy(100000000).minus(100);
			// r = 0 
		}

		if (jInfo.tipo_calculo  == "taxalegal") {
			var idTab = 109; // taxa_legal 

			let rA = { resultado: 0}
			let rB = { resultado: 0}
			let diaI = calcUtil.dia2yyyymmddInt(dia)

			// 1% até 31/07/2024
			if (diaI < 20240731) {
				rA.resultado = calcUtil.calcJuros(dia, '31/07/2024', 1, 'simples', jInfo.pro_rata == '1') 
				rB = await this.pegasoma('01/08/2024', diaFim, idTab, 0, jInfo.pro_rata == '1')
				// console.log(rA, rB)
			} else {
				rB = await this.pegasoma(dia, diaFim, idTab, 0, jInfo.pro_rata == '1')
			}

			r = rA.resultado + rB.resultado
		}

		if (jInfo.tipo_calculo  == "poupanca_simples") {
			var idTab = 6; // poupanca
			let r1 = await this.pegasoma(dia, diaFim, idTab)
			r = r1.resultado
		}

		if (jInfo.tipo_calculo  == "poupanca_nova_simples") {
			var idTab = 87; 
			let r1 = await this.pegasoma(dia, diaFim, idTab)
			r = r1.resultado
		}

		if (jInfo.tipo_calculo  == "poupanca_204_simples") {
			var idTab = 94;
			let r1 = await this.pegasoma(dia, diaFim, idTab)
			r = r1.resultado
		}
		
		if (jInfo.tipo_calculo  == "selics") {
			var idTab = 23; // selic
			let r1 = await this.pegasoma(dia, diaFim, idTab)
			r = r1.resultado
		}

		if (jInfo.tipo_calculo  == "selics_mais1") {
			var idTab = 23; // selic
			let r1 = await this.pegasoma(dia, diaFim, idTab)
			r = r1.resultado+1
		}

		if (jInfo.tipo_calculo  == "selica") {
			var idTab = 23; // selic
			r = await this.pegamul(dia, diaFim, idTab)
		}

		if (jInfo.tipo_calculo  == "ca") {
			r = await this.calcJurosAnuais(dia, jInfo.percentual, jInfo.pro_rata == '1', dia, diaFim, "dez", 12)
		}

		if (jInfo.tipo_calculo  == "cs") {
			r =await  this.calcJurosAnuais(dia, jInfo.percentual, jInfo.pro_rata == '1', dia, diaFim, "dez", 6)
		}

		if (jInfo.tipo_calculo == "selicano") {
			r =  await this.calcSelicAnual( dia, diaFim, "dez");
		}

		// console.log( 'r',r )

		return r
	}


	this.pegaJurosCompleto = async function(dia, diaFim, jInfo1, alterarDatas=true) {
		var r = 0;
		var rstr = [] 

		if (typeof jInfo1 === 'undefined') { 
			console.log('##### ERRO JInfo não existe', jInfo1)
		}

		var jInfo = JSON.parse(JSON.stringify(jInfo1))
		var diaCitacaoI = calcUtil.dia2yyyymmddInt(jInfo.data_citacao)

		if (jInfo.a_partir == "citacao") {
			let diaI1 = calcUtil.dia2yyyymmddInt(dia)
			if (diaI1 < diaCitacaoI) {
				dia = jInfo.data_citacao
			}
		}
		
		if (jInfo.a_partir == "data-fixa") {
			dia = jInfo.data_citacao
		}

		var diaI = calcUtil.dia2yyyymmddInt(dia)

		// não deixa calcular juros para datas posteriores a da tabela da selic 
		if (jInfo.tipo_calculo  == "taxalegal") {
			let diaFimInt = calcUtil.dia2yyyymmddInt(diaFim)
			if (diaFimInt > this.listaTabelas[ 23 ].maximo) {
				diaFim = calcUtil.yyyymmdd2dia(this.listaTabelas[ 23 ].maximo.toString() )
			}
		}

		if (jInfo.modo != 'a') {
			r = await this.pega_juros(dia, diaFim, jInfo)
			let desc1 = this.tipos_calc_juros[jInfo.tipo_calculo]
			if (jInfo.tipo_calculo == 'c' || jInfo.tipo_calculo == 's' || jInfo.tipo_calculo == 'ca' || jInfo.tipo_calculo == 'cs'|| jInfo.tipo_calculo == 'sa') {
				desc1 = calcUtil.formataNum(jInfo.percentual,2)+'% '+desc1
			}
			rstr.push(`de ${dia} a ${diaFim}: ${desc1} `)
		} else {
			// nova parte - se for selic limitar até a selic e pronto!
			// ------------------- 2020-10-20
			for (var i in jInfo.juros_detalhado) {
				var j = jInfo.juros_detalhado[i]
				var jInfoTemp = {
					"percentual": j.percentual,
					"tipo_calculo": j.tipo,
					"pro_rata": jInfo.pro_rata,
					"a_partir": jInfo.a_partir,
					"data_citacao": jInfo.data_citacao,					
				}

				var jInicioI = calcUtil.dia2yyyymmddInt(j.inicio)
				var jFimI = calcUtil.dia2yyyymmddInt(j.fim)

				if (jInfo.a_partir != "vencimento" && i==0) {			
					j.inicio = jInfo.data_citacao
					jInicioI = diaCitacaoI
				}

				if ((jInicioI < diaI) && (alterarDatas)) {
					j.inicio = dia
					jInicioI = diaI
				}

				if ((j.inicio != '') && (j.fim  != '') && (jInicioI < jFimI) ) {
					let jr = await this.pega_juros(j.inicio, j.fim, jInfoTemp)
					let desc1 = this.tipos_calc_juros[j.tipo]
					if (j.tipo == 'c' || j.tipo == 's') {
						desc1 = calcUtil.formataNum(j.percentual,2)+'% '+desc1
					}
					rstr.push(`de ${j.inicio} a ${j.fim}: ${desc1} `)
					r += Number(jr)
				} 
			}
		}


		return { percentual: r, descricao: rstr } 
	}

	this.indiceSelecionado = function ( c ) {
        var x = this.listaTabelas[ c.info.indexador ]
        if (!x) {
          x = {id: 0, str: "", inicio: "", maximo: "", tipo_calculo: "moeda"} 
        }
        return x 
    },

	this.analiseDia = function ( d, c, cliente_assinante = false, temSelic  ) {
		if (d == null) {  return 0; }
		if (d == "") {  return 0; }
		if (!calcUtil.dataOk( d )) {  return 1;	}
		var dInt = calcUtil.dia2yyyymmddInt( d )

		if ( c.info.modo_indexador == 'um' && !c.info.multi_interno ) {
			if ( dInt >  parseInt(this.indiceSelecionado(c).maximo )) { 
				// console.log('diaerro = 2 - ',dInt, this.indiceSelecionado(c).maximo );
				 return 2; 
			}
			if ( dInt <  parseInt(this.indiceSelecionado(c).inicio )) {  return 3; }

			if (temSelic) {
				if ( dInt >  calcUtil.dia2yyyymmddInt( c.info.selic_fim )) {  
					return 4; 
				}	
			} else {
				if ( dInt >  calcUtil.dia2yyyymmddInt( c.info.dia_atualiza )) {  
					// console.log('dInt, c.info.dia_atualiza', dInt, calcUtil.dia2yyyymmddInt(c.info.dia_atualiza), c.info.selic_fim  ) 
					return 4; 
				}					
			}
		} 
		if ( c.info.modo_indexador == 'multi' || c.info.multi_interno ) {
			var dia_i = calcUtil.dia2yyyymmddInt( c.info.multiIndexador.indices[0].inicio )
			var dia_f = calcUtil.dia2yyyymmddInt( c.info.multiIndexador.indices[ c.info.multiIndexador.indice_f ].fim )

			if ( dInt <  dia_i) {  return 3; }		
			if ( dInt >  dia_f) {  return 2; }
		}
		if ( c.info.modo_indexador == 'personal' && !c.info.multi_interno) {
			var dia_i = parseInt(infoIndicePersonalizado_i)
			var dia_f = parseInt(infoIndicePersonalizado_f)
			
			if ( dInt <  dia_i) {  return 3; }		
			if ( dInt >  dia_f) {  return 2; }
		}

		// ultima alteração: 2020-10-20
		if ( !cliente_assinante &&  dInt < diaCalculoGratuito && !c.api)  {
			// console.log('diaerro = 5: ', !cliente_assinante,  (dInt < diaCalculoGratuito), !c.api)
			return 5 // somente para assinantes
		}
		
		return 0     
	}

	this.limitarJurosSelic = function( dados, inicio ) {
		let info1 = JSON.parse( JSON.stringify(dados) )
		let i = calcUtil.dia2yyyymmddInt(inicio)
		let pos = info1.juros_detalhado.length 
		let deletar = 10

		for (let p=pos-1; p>=0; p--) {
			let dia_i = calcUtil.dia2yyyymmddInt( info1.juros_detalhado[p].inicio )
			let dia_f = calcUtil.dia2yyyymmddInt( info1.juros_detalhado[p].fim )
			
			if ((dia_i < i) && (i < dia_f)) {
				info1.juros_detalhado[p].fim = inicio
			} 
			if (dia_i > i){
				deletar = p
			}
		}
		info1.juros_detalhado.splice(deletar)

		return info1 
	}

	this.moedaUnica = function  ( dia ) {
		dia = calcUtil.dia2yyyymmddInt(dia)
		var d150570 = 19700515;
		var d022886 = 19860228;
		var d011589 = 19890115;
		var d022890 = 19900316;
		var d080193 = 19930801;
		var d070194 = 19940701;
	
		var r = '';
		if (dia <=  d150570) r = 0; //  'NCr$';
		else if(dia >  d150570 && dia < d022886) r = 1; // 'Cr$';
		else if(dia >= d022886 && dia < d011589) r = 2; // 'CZ$';
		else if(dia >= d011589 && dia < d022890) r = 3; // 'NCZ$';
		else if(dia >= d022890 && dia < d080193) r = 4; // 'Cr$';
		else if(dia >= d080193 && dia < d070194) r = 5; // 'CR$';
		else if(dia >= d070194) r = 6; // 'R$';

		return r;
	}

	this.atualiza = async function ( c, comMemoria, nLinha = -1, cliente_assinante = false ) {
		var soma_resultado_desatualizado = [
			{ moeda: 'NCr$', valor: 0 },
			{ moeda: 'Cr$', valor: 0 },
			{ moeda: 'CZ$', valor: 0 },
			{ moeda: 'NCZ$', valor: 0 },
			{ moeda: 'Cr$', valor: 0 },
			{ moeda: 'CR$', valor: 0 },
			{ moeda: 'R$', valor: 0 }
		]

		var soma_resultado_atualizacao = 0 
		var soma_resultado_jurosm = 0 
		var soma_resultado_jurosc = 0 
		var soma_resultado_multa = 0 
		var soma_resultado_honorarios = 0 
		var soma_resultado_selic = 0

		var soma_custas_desatualizado = [
			{ moeda: 'NCr$', valor: 0 },
			{ moeda: 'Cr$', valor: 0 },
			{ moeda: 'CZ$', valor: 0 },
			{ moeda: 'NCZ$', valor: 0 },
			{ moeda: 'Cr$', valor: 0 },
			{ moeda: 'CR$', valor: 0 },
			{ moeda: 'R$', valor: 0 }
		]
		var soma_custas_atualizacao = 0 
		var soma_custas_jurosm = 0 
		var soma_custas_jurosc = 0 
		var soma_custas_multa = 0 
		var soma_custas_honorarios = 0 
		var soma_custas_selic = 0
		
		var soma_deducoes_atualizacao = 0 
		var soma_deducoes_selic = 0
		let calculeiComSelic = 0 
		var tabelaJudicial = {} 

		if (typeof c === 'undefined' || c==null) { console.log('erro ao tentar efetuar o cálculo (c)'); return {};  }
		if (typeof c.info === 'undefined') { console.log('erro ao tentar efetuar o cálculo'); return c;  }
		var temp_dia_atualiza = c.info.dia_atualiza
		
		// nova opcão simulada
		if (typeof c.info.calc_selic === 'undefined' ) { 
			c.info.calc_selic = false
			c.info.selic_inicio = '01/12/2021'
		}

		if (typeof c === 'undefined' || c == null || typeof c.info === 'undefined') { console.log('erro ao tentar efetuar o cálculo'); return null;  }
		
		if (c.info.indexador == 23 && c.info.calc_perc_prorata) {
			c.info.calc_perc_prorata = false
		}

		// analisa data de atualização
		c.info.diaAtualizacaoErro = ''

		if (!calcUtil.dataOk(c.info.dia_atualiza)) {
			c.info.diaAtualizacaoErro = 'Data incorreta'
		}

		if (c.info.modo_indexador == 'um' && !c.info.multi_interno) {
			// se for utilizar tabelas padrão
			var infoIndice = {} 
			if (c.info.indexador < 1000) {
				infoIndice = this.listaTabelas[ c.info.indexador ]
		
				if (typeof infoIndice === 'undefined') {
					console.log('erro: índice não encontrado')
					return;
				} 
			} else {
				// utilizando tabelas judiciais
				let url1 = `${servidorAPI}/calculosDiversos/tabelaDireta` 
				let dados = {
					completa: true, 
					dataAtual: c.info.dia_atualiza, 
					indexador: parseInt(c.info.indexador)-1000,
					jurosTab: [ { modo: 12, ate: 0 } ],
					modoSelic: 'princJuros',
					calc_selic: false,
					selic_inicio: c.info.dia_atualiza // calcUtil.dia2intMesAno( t.v.dataci )            
				}
				
				await axios.post(url1, dados).then( function(r) {
					 tabelaJudicial = {} 
					 let ultimoMes = 0
					 let tabela1 = r.data.tabela
					
					 for (let i in tabela1) {
						// tabelaJudicial[ tabela1[i].mesano ] = tabela1[i].indiceGerado
						tabelaJudicial[ tabela1[i].mesano ] = tabela1[i] 
						ultimoMes = tabela1[i].mesano
					 }
					 infoIndice.maximo =  calcUtil.dia2yyyymmdd(calcUtil.strUltimoDia(  r.data.dataMaxima ) )
					//  infoIndice.maximo = calcUtil.dia2yyyymmdd(  r.data.dataMaxima ) 
					 infoIndice.calculo = 'tabelasJudiciais'
					 infoIndice.nome = r.data.nome
					 c.info.tabelaJudicial = tabelaJudicial
					 c.info.resumoTJ = r.data.resumo
				})

				let ultimoItem = c.info.resumoTJ.length-1
				// se o ultimo item for selic
				if (!c.info.calc_selic && c.info.resumoTJ[ultimoItem].indexador == 23) { 
					c.info.calc_selic =	true 
					c.info.selic_inicio = '01/' + calcUtil.mesAno2dia(c.info.resumoTJ[ultimoItem].inicio) 
				}
		
			}

			if (c.info.indexador == 23 || c.info.indexador == 24 || c.info.indexador == 72 ) {
				c.info.calc_selic = false
			}

			if (c.info.calc_selic || c.info.indexador == 1005) {
				c.info.selic_fim = temp_dia_atualiza
				let dia1 = parseInt(this.listaTabelas[ 23 ].maximo)
				if (c.info.indexador == 1005) {
					dia1 = calcUtil.somaMes( calcUtil.yyyymmdd2dia( this.listaTabelas[ 23 ].maximo.toString() ) )
					dia1 = calcUtil.dia2yyyymmddInt(dia1)
				}
				if (calcUtil.dia2yyyymmddInt(c.info.selic_fim) >  dia1) {
					c.info.diaAtualizacaoErro = "Podemos atualizar somente até " + calcUtil.yyyymmdd2dia( dia1 )
				}
			} else {
				if (calcUtil.dia2yyyymmddInt(c.info.dia_atualiza) >  parseInt(infoIndice.maximo)) {
					c.info.diaAtualizacaoErro = "Podemos atualizar somente até " + calcUtil.yyyymmdd2dia(infoIndice.maximo.toString() )
				}
			}
			if (calcUtil.dia2yyyymmddInt(c.info.dia_atualiza) <  parseInt(infoIndice.inicio)) {
				c.info.diaAtualizacaoErro = "A data mínima de atualização é " + calcUtil.yyyymmdd2dia(infoIndice.inicio.toString() )
			}
		} 
		
		if (c.info.modo_indexador == 'multi' || c.info.multi_interno) {
			c.info.calc_selic = false // se for multiplos indices, desligar a selic

			var infoIndice_I = this.listaTabelas[ c.info.multiIndexador.indices[0].id ]
			
			for (var n in c.info.multiIndexador.indices) {
				if (c.info.multiIndexador.indices[n].id>0) { 
					var infoIndice_F = this.listaTabelas[ c.info.multiIndexador.indices[n].id ]
					c.info.multiIndexador.indice_f = n 
				}
			}

			c.info.multiIndexador.indices[ c.info.multiIndexador.indice_f ].fim = calcUtil.yyyymmdd2dia(infoIndice_F.maximo.toString() ) 

			if (calcUtil.dia2yyyymmddInt(c.info.dia_atualiza) >  parseInt(infoIndice_F.maximo)) {
				c.info.diaAtualizacaoErro = "Podemos atualizar somente até " + calcUtil.yyyymmdd2dia(infoIndice_F.maximo.toString() )
			}
			
			if ((typeof infoIndice_I !== 'undefined') && (typeof infoIndice_I.inicio !== 'undefined') &&  (calcUtil.dia2yyyymmddInt(c.info.dia_atualiza) <  parseInt(infoIndice_I.inicio))) {
				c.info.diaAtualizacaoErro = "A data mínima de atualização é " + calcUtil.yyyymmdd2dia(infoIndice_I.inicio.toString() )
			}			
		}

		if (c.info.modo_indexador == 'personal'  && !c.info.multi_interno) {
			var infoIndice1 = await this.le_tabela_personalizada( c.info.indexador )

			// pega o primeira data não zerada
			infoIndicePersonalizado_i = infoIndice1.dados.find( function(e) { return typeof e !== 'undefined' &&  e.valor != 0; })
			
			if (typeof infoIndicePersonalizado_i !== 'undefined') {
				infoIndicePersonalizado_i = infoIndicePersonalizado_i.dia
			} else {
				infoIndicePersonalizado_i = 0
			}
			infoIndicePersonalizado_f = 0
			var sair = false
			for (var i = 24600; i>=0 && !sair; i--) { // testa de 2050 para trás
				if (typeof infoIndice1.dados[i] !== 'undefined'  &&  infoIndice1.dados[i].valor != 0 && infoIndice1.dados[i].dia!= '' &&  infoIndicePersonalizado_f < infoIndice1.dados[i].dia) {
					infoIndicePersonalizado_f = infoIndice1.dados[i].dia
					sair = true
				}
			}

			if (infoIndice1.modocalc == "p") {
				infoIndicePersonalizado_f = calcUtil.dia2yyyymmddInt( calcUtil.somaMes( calcUtil.yyyymmdd2dia( infoIndicePersonalizado_f.toString() )  ) )
			}

			if (calcUtil.dia2yyyymmddInt(c.info.dia_atualiza) >  parseInt(infoIndicePersonalizado_f )) {
				c.info.diaAtualizacaoErro = "Índice personalizado: tabela sem valores para atualizar até " + calcUtil.yyyymmdd2dia( infoIndicePersonalizado_f.toString() )
			}
			if (calcUtil.dia2yyyymmddInt(c.info.dia_atualiza) <  parseInt( infoIndicePersonalizado_i )) {
				c.info.diaAtualizacaoErro = "Índice personalizado: A data mínima de atualização é " + calcUtil.yyyymmdd2dia(infoIndicePersonalizado_i.toString() )
			}
		} 
	
		for (var i in c.lista) {	
			// console.log(c)
			if (c.lista[i] == null) { 
				c.lista[i] = { dia: '', resultado: 0, memoria: [] }
			}
			var temp1 = { resultado: 0, memoria: [] } 
			// console.log(c.lista[i])
			var dia_v = c.lista[i].dia
			c.lista[i].memoria = []
			c.lista[i].memoriaSimples = ''
			c.lista[i].diaErro = 0 

			var dia_v_ok = calcUtil.dataOk( dia_v )

			if (dia_v == '' || c.lista[i].valor == 0 || !dia_v_ok || c.info.diaAtualizacaoErro != '') {
				c.lista[ i ].resultado_atualizacao = 0 
				c.lista[ i ].resultado_jurosm = 0 
				c.lista[ i ].resultado_jurosm_percentual = 0 
				c.lista[ i ].resultado_jurosc = 0 
				c.lista[ i ].resultado_jurosc_percentual = 0 
				c.lista[ i ].resultado_multa = 0 
				c.lista[ i ].resultado_multa_percentual = 0 
				c.lista[ i ].resultado_honorarios= 0 
				c.lista[ i ].resultado_honorarios_percentual = 0 
				c.lista[ i ].resultado_total = 0

				if (!dia_v_ok && dia_v != '') {
					c.lista[i].diaErro = 1
				}
			}

			if (dia_v != '' && c.lista[i].valor != 0 && dia_v_ok && c.info.diaAtualizacaoErro == '') {
				if (typeof c.info.calc_abater_valores==='undefined') {
					c.info.calc_abater_valores = false
				} else {
					if (c.info.calc_abater_valores == 'false') {
						c.info.calc_abater_valores = false
					}
				}
				let separarNeg = (c.info.calc_abater_valores && c.lista[i].valor < 0 && !c.lista[i].custas)
				// console.log('separarNeg', separarNeg)

				// verifica se esta parcela tem selic =====
				calculeiComSelic = 0
				if ((c.info.calc_selic || c.info.indexador==1005)  && 
					(
						(!c.lista[i].custas) ||
						(c.lista[i].custas && typeof c.info.custas.selic !== 'undefined' && c.info.custas.selic == true ) ||
						(c.lista[i].custas && typeof c.info.custas.selic === 'undefined') // esta linha: quando não existia a opção, ele calculava com selic
					) 
					){
					c.info.selic_fim = temp_dia_atualiza
					c.info.dia_atualiza = c.info.selic_inicio
					
					calculeiComSelic = 23
				} else {
					c.info.dia_atualiza = temp_dia_atualiza
				}
				/// verifica se tem selic fim 	

				if (nLinha < 0 || nLinha == i ) {
					c.lista[ i ].resultado_atualizacao = 0 
					c.lista[ i ].resultado_jurosm = 0 
					c.lista[ i ].resultado_jurosm_percentual = 0 
					c.lista[ i ].resultado_jurosc = 0 
					c.lista[ i ].resultado_jurosc_percentual = 0 
					c.lista[ i ].resultado_multa = 0 
					c.lista[ i ].resultado_multa_percentual = 0 
					c.lista[ i ].resultado_honorarios= 0 
					c.lista[ i ].resultado_honorarios_percentual = 0 
					c.lista[ i ].resultado_total = 0
					
					// Analise da data
					c.lista[i].diaErro = this.analiseDia(c.lista[i].dia, c, cliente_assinante, calculeiComSelic)

					if (c.lista[i].diaErro == 2 || c.lista[i].diaErro == 4) { // data maior que o máximo
						dia_v = c.info.dia_atualiza
					}

					// Correção Monetária 
					
					if (c.info.modo_indexador == 'um' && !c.info.multi_interno) {
						let desvio1 = false			
						c.info.nomeIndexador = infoIndice.nome
						if (infoIndice.calculo == "tabelasJudiciais") {
							if ( calcUtil.dia2yyyymmddInt(dia_v) <= calcUtil.dia2yyyymmddInt(c.info.dia_atualiza) ) {
								var temp2 = await this.a_tabelaJudicial( dia_v, c.lista[i].valor, c.info.dia_atualiza, c.info.tabelaJudicial )

								temp1 = temp2.resultado
							} else {
								var temp2 = { memoria: [], memoriaSimples: '', resultado: c.lista[i].valor }
								temp1 = c.lista[i].valor
							}
							 							
							desvio1 = true
						}

						if (infoIndice.calculo == "moeda") {
							if ( calcUtil.dia2yyyymmddInt(dia_v) <= calcUtil.dia2yyyymmddInt(c.info.dia_atualiza) ) {
								var temp2 = await this.a_moeda( dia_v, c.lista[i].valor, c.info.dia_atualiza, c.info.indexador )
								temp1 = temp2.resultado
							} else {
								var temp2 = { memoria: [], memoriaSimples: '', resultado: c.lista[i].valor }
								temp1 = c.lista[i].valor
							}
							
							desvio1 = true
						}
						if (infoIndice.calculo == "moedainv") {
							if ( calcUtil.dia2yyyymmddInt(dia_v) <= calcUtil.dia2yyyymmddInt(c.info.dia_atualiza) ) {
								var temp2 = await this.a_moedainv( dia_v, c.lista[i].valor, c.info.dia_atualiza, c.info.indexador )
								temp1 = temp2.resultado
							} else {
								var temp2 = { memoria: [], memoriaSimples: '', resultado: c.lista[i].valor }
								temp1 = c.lista[i].valor
							}
							desvio1 = true
						}
						if (infoIndice.calculo == "perc") {
							var temp2 = await this.a_perc( dia_v, c.lista[i].valor, c.info.dia_atualiza, c.info.indexador, c.info.calc_perc_indice_neg=='1', c.info.calc_perc_prorata=='1' )
							temp1 = temp2.resultado
							desvio1 = true
						}
						if (infoIndice.calculo == "selic") {
							var temp2 = await this.a_selic( dia_v, c.lista[i].valor, c.info.dia_atualiza, c.info.indexador, false, c.info.calc_perc_prorata=='1' ) 	
							temp1 = temp2.resultado
							desvio1 = true
						}

						if (typeof c.lista[i] !== 'undefined') {
							if (!desvio1) {
								c.lista[ i ].memoriaSimples = temp1.memoriaSimples 
							} else  {
								c.lista[ i ].memoriaSimples = temp2.memoriaSimples 
							}

							if (comMemoria) {
								if (!desvio1) {
									c.lista[ i ].memoria = temp1.memoria
								} else  {
									c.lista[ i ].memoria = temp2.memoria
								}
							} 
							c.lista[ i ].resultado_atualizacao = temp1 
						}
					} 
					
					if (c.info.modo_indexador == 'personal'  && !c.info.multi_interno) {
						var infoIndice = await this.le_tabela_personalizada( c.info.indexador )

						c.info.nomeIndexador = infoIndice.nome
						if (infoIndice.modocalc == "m") {
							temp1 = await this.a_moeda( dia_v, c.lista[i].valor, c.info.dia_atualiza, c.info.indexador )
						}
						if (infoIndice.modocalc == "mi") {
							temp1 = await this.a_moedainv( dia_v, c.lista[i].valor, c.info.dia_atualiza, c.info.indexador )
						}
						if (infoIndice.modocalc == "p") {  // p = percentual
							temp1 = await this.a_perc( dia_v, c.lista[i].valor, c.info.dia_atualiza, c.info.indexador, c.info.calc_perc_indice_neg=='1', c.info.calc_perc_prorata=='1' )
						}

						
						if (comMemoria) {
							c.lista[ i ].memoria = temp1.memoria
						}
						c.lista[ i ].memoriaSimples = temp1.memoriaSimples 
						c.lista[ i ].resultado_atualizacao = temp1.resultado
					} 

					if (c.info.modo_indexador == 'multi' || c.info.multi_interno) {
						
						c.info.nomeIndexador = c.info.multiIndexador.nome
						c.lista[ i ].memoria = []
						var valor1 = Number( c.lista[i].valor ) 
						var memoriaSimplesMAM = []
						var ultimaLinha = false

						for (var j in c.info.multiIndexador.indices) {
							var indice = c.info.multiIndexador.indices[j]
							var indice_prox = c.info.multiIndexador.indices[Number(j)+1]

							if (typeof indice_prox === 'undefined' || indice_prox == null || indice_prox.inicio == '' || indice_prox.id <= 0) {
								indice.fim = c.info.dia_atualiza
								ultimaLinha = true 
							} else {
								indice.fim = indice_prox.inicio
							}
							
							if (indice.id > 0) {
								var dia_a = c.info.dia_atualiza
								var dia_v = c.lista[i].dia

								if (calcUtil.dia2yyyymmddInt(dia_v) > calcUtil.dia2yyyymmddInt(dia_a)) {
									dia_v = dia_a 
								}
								
								var infoIndice = this.listaTabelas[ indice.id ]
								// console.log( 'l:896 - infoIndice', infoIndice)
								
								if (calcUtil.dia2yyyymmddInt(dia_v) < calcUtil.dia2yyyymmddInt(indice.inicio)) {
									dia_v = indice.inicio 
								}

								if (calcUtil.dia2yyyymmddInt(dia_a) > calcUtil.dia2yyyymmddInt(indice.fim)) {
									dia_a = indice.fim 
								}

								if (ultimaLinha) {
									indice.fim = calcUtil.yyyymmdd2dia( infoIndice.maximo.toString() ) 
								}

								if (calcUtil.dia2yyyymmddInt(dia_v) <= calcUtil.dia2yyyymmddInt(indice.fim)) {
									if (infoIndice.calculo == "moeda") {
										temp1 = await this.a_moeda( dia_v, valor1, dia_a, indice.id )
										valor1 = Number(temp1.resultado)
									}

									if (infoIndice.calculo == "moedainv") {
										temp1 = await this.a_moedainv( dia_v, valor1, dia_a, indice.id )
										valor1 = Number(temp1.resultado)
									}

									if (infoIndice.calculo == "perc") {
										temp1 =  await this.a_perc( dia_v, valor1, dia_a, indice.id, true, false )
										// console.log(temp1)
										valor1 = Number(temp1.resultado) 
									}

									if (infoIndice.calculo == "selic") {
										temp1 =  await this.a_selic(dia_v, valor1, dia_a, indice.id, false, false ) 
										valor1 = Number(temp1.resultado)
									}

									
									if (comMemoria) {
										if (c.lista[ i ].memoria.length > 0) {
											temp1.memoria.shift() 
										}
										c.lista[ i ].memoria.push( ...temp1.memoria ) 
									}

									memoriaSimplesMAM.push( { dia: dia_v, memoriaSimples: temp1.memoriaSimples, resultado: temp1.resultado, indexador: infoIndice.nome }  )
								} 
								c.lista[ i ].resultado_atualizacao = temp1.resultado
								c.lista[ i ].memoriaSimplesMAM = memoriaSimplesMAM 
							}
							
						}
					} 
				} /// calcular se for o nLinha adequado - fim 


				if (typeof c.lista[ i ].resultado_atualizacao === 'undefined') {
					c.lista[ i ].resultado_atualizacao = 0 
				}
			
				if (c.lista[i].diaErro == 5) { // se for gratuito e antigo, então não calcula
					c.lista[ i ].resultado_atualizacao = 0
				}

				c.lista[ i ].resultado_total = parseFloat(c.lista[ i ].resultado_atualizacao)
				if (c.lista[i].custas) {
					// console.log(c.info)
					if (c.info.calc_custas) {
						soma_custas_atualizacao +=  parseFloat(c.lista[ i ].resultado_atualizacao)
					}
				} else {
					if (separarNeg) {
						soma_deducoes_atualizacao +=  parseFloat(c.lista[ i ].resultado_atualizacao)
					} else {
						soma_resultado_atualizacao +=  parseFloat(c.lista[ i ].resultado_atualizacao)
					}
					
				}

				if (c.lista[i].custas) {
					soma_custas_desatualizado[ this.moedaUnica(c.lista[i].dia) ].valor  += parseFloat(c.lista[ i ].valor)
				} else {
					soma_resultado_desatualizado[ this.moedaUnica(c.lista[i].dia) ].valor  += parseFloat(c.lista[ i ].valor)
				}
				// }

				// Juros Compensatórios
				c.lista[ i ].resultado_jurosc = 0
				c.lista[ i ].resultado_jurosc_percentual = 0
				c.lista[ i ].jurosc_desc = [] 
				if (c.info.calc_jurosc) {
					var dia1 = c.lista[i].dia
					var dia2 = c.info.dia_atualiza
					var info1 = c.info.juros_compensatorios
					var zerarCalc = false 
					var alterarDatas = true

					if (typeof c.lista[i].juros_compensatorios !== 'undefined') {
						if (c.lista[i].juros_compensatorios.modo == 1) {
							zerarCalc = true 
						}

						if (c.lista[i].juros_compensatorios.modo == 2) {
							alterarDatas = false 
							info1 = {
								a_partir: "vencimento",
								modo: 'a',
								data_citacao: '', 
								pro_rata: c.lista[i].juros_compensatorios.pro_rata,
								juros_detalhado: c.lista[i].juros_compensatorios.juros_detalhado,
							} 
						}
					}

					
					if (zerarCalc) {
						c.lista[ i ].resultado_jurosc_percentual = 0 
					} else {
						if (dia1 != '') {
							// calcular os juros mes a mes
							for (let j1 in c.lista[ i ].memoria) {
								let m1 = c.lista[ i ].memoria[j1]

								if (c.info.calc_selic) {
									info1 = this.limitarJurosSelic(info1, c.info.selic_inicio)
								}
								let dia10 = m1.dia
								if (calcUtil.dia2yyyymmddInt(dia10) > calcUtil.dia2yyyymmddInt(dia2)) {
									dia10 = dia2
									c.lista[ i ].memoria[j1].dia = dia10
								}
								// let pj1 =  await this.pegaJurosCompleto(dia1, m1.dia, info1, alterarDatas)
								let pj1 =  await this.pegaJurosCompleto(dia1, dia10, info1, alterarDatas)
								m1.jurosc_p = pj1.percentual
								m1.jurosc_v = m1.valor * (pj1.percentual/100)
								m1.total = m1.valor + m1.jurosc_v
							}
							//-----

							if (c.info.calc_selic) {
								info1 = this.limitarJurosSelic(info1, c.info.selic_inicio)
							}
							let pj =  await this.pegaJurosCompleto(dia1, dia2, info1, alterarDatas)
							c.lista[ i ].resultado_jurosc_percentual = pj.percentual
							c.lista[ i ].jurosc_desc = pj.descricao	
						}
					}

					if (c.lista[i].custas && c.info.custas && !c.info.custas.juros_compensatorios) {
						c.lista[ i ].resultado_jurosc_percentual = 0  
					}

					// calculo
					c.lista[ i ].resultado_jurosc = c.lista[ i ].resultado_atualizacao * (c.lista[ i ].resultado_jurosc_percentual/100)
					
					if (c.lista[i].custas) {
						soma_custas_jurosc += parseFloat(c.lista[ i ].resultado_jurosc)
					} else {
						if (!separarNeg) {
							soma_resultado_jurosc += parseFloat(c.lista[ i ].resultado_jurosc)
						} else {
							c.lista[ i ].resultado_jurosc = 0
						}
					} 
					c.lista[ i ].resultado_total += parseFloat(c.lista[ i ].resultado_jurosc) 
				}

				// Juros Moratorios
				c.lista[ i ].resultado_jurosm = 0 
				c.lista[ i ].resultado_jurosm_percentual = 0 
				c.lista[ i ].jurosm_desc = [] 
				if (c.info.calc_jurosm) {
					var dia1 = c.lista[i].dia
					var dia2 = c.info.dia_atualiza

					if (typeof c.info.juros_moratorios === 'undefined') {
						c.info.juros_moratorios = {"percentual":1,"tipo_calculo":"s","pro_rata":0,"a_partir":"vencimento","data_citacao":"","modo":"s","juros_detalhado":[{"inicio":"","fim":"","percentual":"0","tipo":"s"},{"inicio":"","fim":"","percentual":"0","tipo":"s"}] }
					}

					var info1 = c.info.juros_moratorios
					var zerarCalc = false 
					var alterarDatas = true

					if (typeof c.lista[i].juros_moratorios !== 'undefined') {
						// console.log('passei 1549')
						if (c.lista[i].juros_moratorios.modo == 1) {
							zerarCalc = true 
						}

						if (c.lista[i].juros_moratorios.modo == 2) {
							alterarDatas = false 
							info1 = {
								a_partir: "vencimento",
								modo: 'a',
								data_citacao: '', 
								pro_rata: c.lista[i].juros_moratorios.pro_rata,
								juros_detalhado: c.lista[i].juros_moratorios.juros_detalhado,
							} 
						}
					} else {
						c.lista[i].juros_moratorios = JSON.parse(JSON.stringify(c.info.juros_moratorios))
						c.lista[i].juros_moratorios.modo = 3
					}
	
					c.lista[ i ].resultado_jurosm_percentual = 0 
					if (!zerarCalc) {
						if (dia1 != '') {
							for (let j1 in c.lista[ i ].memoria) {
								let m1 = c.lista[ i ].memoria[j1]

								if (c.info.calc_selic) {
									info1 = this.limitarJurosSelic(info1, c.info.selic_inicio)
								}
								let pj1 =  await this.pegaJurosCompleto(dia1, m1.dia, info1, alterarDatas)
								m1.jurosm_p = pj1.percentual
								let base_jurosm = parseFloat(c.lista[ i ].resultado_atualizacao)
								if (c.info.calc_jurosc && c.info.juros_compensatorios.MsobreC == true) {
									base_jurosm += c.lista[ i ].resultado_jurosc
								}
								m1.jurosm_v = base_jurosm * (pj1.percentual/100)
							}

							if (c.info.calc_selic) {
								info1 = this.limitarJurosSelic(info1, c.info.selic_inicio)
							}
							

							let pj =  await this.pegaJurosCompleto(dia1, dia2, info1, alterarDatas)
							c.lista[ i ].resultado_jurosm_percentual = pj.percentual
							c.lista[ i ].jurosm_desc = pj.descricao	
						}
					}

					// anular o calculo se não estiver selecionado nas custas
					if (c.lista[i].custas && c.info.custas && !c.info.custas.juros_moratorios) {
						c.lista[ i ].resultado_jurosm_percentual = 0  
					}
			
					// calculo
					c.lista[ i ].base_jurosm = parseFloat(c.lista[ i ].resultado_atualizacao)
					if (c.info.calc_jurosc && c.info.juros_compensatorios.MsobreC == true) {
						c.lista[ i ].base_jurosm += c.lista[ i ].resultado_jurosc
					}

					c.lista[ i ].resultado_jurosm = c.lista[ i ].base_jurosm * (c.lista[ i ].resultado_jurosm_percentual/100)
					if (c.lista[i].custas) {
						soma_custas_jurosm += parseFloat(c.lista[ i ].resultado_jurosm)
					} else {
						if (!separarNeg) {
							soma_resultado_jurosm += parseFloat(c.lista[ i ].resultado_jurosm)
						} else {
							c.lista[ i ].resultado_jurosm = 0
						}
					}
					
					c.lista[ i ].resultado_total += parseFloat(c.lista[ i ].resultado_jurosm) 
				}


				// Multa (normal)
				c.lista[ i ].resultado_multa = 0 
				c.lista[ i ].resultado_multa_percentual = 0
				if (c.info.calc_multa) {
					var info1 = c.info.multa
					var resolvido = false

					if (typeof c.lista[ i ].multa !== 'undefined') {
						if (c.lista[ i ].multa.modo == 1) {
							resolvido = true
						}

						if (c.lista[ i ].multa.modo == 2) {
							var info1 = c.lista[ i ].multa 
						}
					}
					
					var dia1 = c.lista[i].dia
					var dia2 = c.info.dia_atualiza

		
					if (typeof info1 === 'undefined') {
						info1 = { percentual: '2', tipo_calculo: 'p', multa_sobre_juros: false, multa_valor_vincendo: false, multa_sobre_valor_original: false }
					}

					if (!resolvido) {
						if (info1.tipo_calculo == "d") {
							c.lista[ i ].resultado_multa = info1.percentual * calcUtil.diferencaDatasDias(dia1, dia2) 
							c.lista[ i ].resultado_multa_percentual = 'xx'
						} else {
							c.lista[ i ].resultado_multa_percentual = info1.percentual 
							var base = parseFloat( c.lista[ i ].resultado_atualizacao )
							if (info1.multa_sobre_valor_original) {
								base = parseFloat(c.lista[ i ].valor)
							} 
							if (info1.multa_sobre_juros) {
								if (c.info.calc_jurosm) {
									base += parseFloat( c.lista[ i ].resultado_jurosm)
								}
								if (c.info.calc_jurosc) {
									base += parseFloat( c.lista[ i ].resultado_jurosc)
								}
							}
							if ((calcUtil.dia2yyyymmddInt(dia1) > calcUtil.dia2yyyymmddInt(dia2)) && !info1.multa_valor_vincendo) {
								base = 0 
								c.lista[ i ].resultado_multa_percentual = 0
							}

							c.lista[ i ].resultado_multa_base = base 
							c.lista[ i ].resultado_multa = parseFloat( base * (c.lista[ i ].resultado_multa_percentual/100) )
						}
					}

					if (c.lista[i].custas && c.info.custas && !c.info.custas.multa) {
						c.lista[ i ].resultado_multa = 0  
					}

					if (c.lista[i].custas) {
						soma_custas_multa += parseFloat(c.lista[ i ].resultado_multa)
					} else {
						if (!separarNeg) {
							soma_resultado_multa += parseFloat(c.lista[ i ].resultado_multa)
						} else {
							c.lista[ i ].resultado_multa = 0 
						}
					}
					c.lista[ i ].resultado_total += parseFloat(c.lista[ i ].resultado_multa)  
				}






				// nova opc SELIC
				if (c.info.indexador == 1005) {
					calculeiComSelic = 72
				}

				c.lista[ i ].resultado_selic = 0 
				c.lista[ i ].resultado_selic_percentual = 0 
				c.lista[ i ].mostrarSelic = (calculeiComSelic > 0) 

				// console.log(': 1718 - calculeiComSelic',calculeiComSelic)

				if (calculeiComSelic>0) {
					let idTab = calculeiComSelic
					
					c.lista[ i ].resultado_atualizacao = parseFloat(c.lista[ i ].resultado_atualizacao)
					c.lista[ i ].base = c.lista[ i ].resultado_atualizacao + c.lista[ i ].resultado_jurosm + c.lista[ i ].resultado_jurosc + parseFloat( c.lista[ i ].resultado_multa  )
					
					c.lista[ i ].selic_ini = c.info.selic_inicio
					
					if (typeof c.info.juros_moratorios == 'undefined') {
						c.info.juros_moratorios = {"modo":"s","percentual":"1","tipo_calculo":"s","pro_rata":0,"a_partir":"vencimento","data_citacao":"","juros_detalhado":[{"inicio":"","fim":"","percentual":0,"tipo":"s"},{"inicio":"","fim":"","percentual":0,"tipo":"s"},{"inicio":"","fim":"","percentual":0,"tipo":"s"},{"inicio":"","fim":"","percentual":0,"tipo":"s"}]}
					}

					if ( calcUtil.dia2yyyymmddInt(c.lista[ i ].dia) > calcUtil.dia2yyyymmddInt(c.info.selic_inicio) ) {
						c.lista[ i ].selic_ini = c.lista[ i ].dia
					}

					if (c.info.calc_jurosm) {
						if ( calcUtil.dia2yyyymmddInt(c.lista[ i ].dia) > calcUtil.dia2yyyymmddInt(c.info.selic_inicio) &&  c.info.juros_moratorios.a_partir == 'vencimento'   ) {
							c.lista[ i ].selic_ini = c.lista[ i ].dia
						}

						if ( calcUtil.dia2yyyymmddInt(c.lista[ i ].dia) > calcUtil.dia2yyyymmddInt(c.info.selic_inicio) &&  c.info.juros_moratorios.a_partir == 'citacao'   ) {
							let diaCitacaoI = calcUtil.dia2yyyymmddInt(c.info.juros_moratorios.data_citacao)
							c.lista[ i ].selic_ini = c.lista[ i ].dia

							if ( calcUtil.dia2yyyymmddInt(c.lista[ i ].dia) < diaCitacaoI ) {
								c.lista[ i ].selic_ini = c.info.juros_moratorios.data_citacao
							}	
						
							c.lista[ i ].selic_ini = c.lista[ i ].dia
						}

						if ( c.info.juros_moratorios.a_partir == 'data-fixa'  && calcUtil.dia2yyyymmddInt(c.info.juros_moratorios.data_citacao) > calcUtil.dia2yyyymmddInt(c.info.selic_inicio)  ) {
							c.lista[ i ].selic_ini = c.info.juros_moratorios.data_citacao
						}
					}

					c.lista[ i ].selic_fim = c.info.selic_fim
					let selicCalc = await this.pegasoma(c.lista[ i ].selic_ini, c.lista[ i ].selic_fim, idTab, false, false)

					// console.log(': 1762 - selicCalc',selicCalc, c.lista[ i ].selic_ini, c.lista[ i ].selic_fim, idTab)

					c.lista[ i ].resultado_selic_percentual = selicCalc.resultado
					
					if (comMemoria) {
						c.lista[ i ].resultado_selic_mesAmes = [] 
						for (let k in selicCalc.resultadoDetalhado) {
							c.lista[ i ].resultado_selic_mesAmes.push( { 
								dia: calcUtil.yyyymmdd2dia( selicCalc.resultadoDetalhado[k].dia), 
								str: 'R$ '+calcUtil.formataNum( c.lista[ i ].resultado_atualizacao,2) + '  x  '+ calcUtil.formataNum( selicCalc.resultadoDetalhado[k].resultado,2) + '%  (Selic: '+calcUtil.formataNum(selicCalc.resultadoDetalhado[k].valor,2) + '%)',
								valor: c.lista[ i ].resultado_atualizacao * ((selicCalc.resultadoDetalhado[k].resultado/100)+1) 
							} )
						}
					}
					c.lista[ i ].resultado_selic = c.lista[ i ].base * (c.lista[ i ].resultado_selic_percentual/100)

					if (c.lista[i].custas) {
						soma_custas_selic += parseFloat(c.lista[ i ].resultado_selic)
					} else {
						if (!separarNeg) {
							// console.log('soma_resultado_selic',c.lista[ i ].resultado_selic)
							soma_resultado_selic += parseFloat(c.lista[ i ].resultado_selic)
						} else {
							soma_deducoes_selic += parseFloat(c.lista[ i ].resultado_selic)
						}
					}

					c.lista[ i ].resultado_total += parseFloat( c.lista[ i ].resultado_selic)
				}







				// honorários
				c.lista[ i ].resultado_honorarios_percentual = 0 
				c.lista[ i ].resultado_honorarios = 0
				// console.log('c.info.calc_honorarios', c.info.calc_honorarios)
				if (c.info.calc_honorarios) {
					var info1 = c.info.honorarios
					if (typeof info1 === 'undefined') {
						info1 = { modo: 'p', valor: 10 }
					}

					if (info1.modo == "p") {
						c.lista[ i ].resultado_honorarios_percentual = info1.valor 
						var base = parseFloat(c.lista[ i ].resultado_atualizacao) + parseFloat(c.lista[ i ].resultado_selic)
						if (c.lista[ i ].resultado_jurosm) base += parseFloat(c.lista[ i ].resultado_jurosm)
						if (c.lista[ i ].resultado_jurosc) base += parseFloat(c.lista[ i ].resultado_jurosc)
						if (c.lista[ i ].resultado_multa) base += parseFloat(c.lista[ i ].resultado_multa)
						c.lista[ i ].honorarios_base = base
						c.lista[ i ].resultado_honorarios = base * (c.lista[ i ].resultado_honorarios_percentual/100)
					}

					if (typeof c.lista[ i ].honorarios !== 'undefined') {
						if (c.lista[ i ].honorarios.modo == "3") {
							c.lista[ i ].resultado_honorarios_percentual = 0 
							c.lista[ i ].resultado_honorarios = 0
						}
					}

					if (c.lista[i].custas && c.info.custas && !c.info.custas.honorarios) {
						c.lista[ i ].resultado_honorarios = 0  
					}

					if (c.lista[i].custas) {
						soma_custas_honorarios += parseFloat(c.lista[ i ].resultado_honorarios)
					} else {
						if (!separarNeg) {
							soma_resultado_honorarios += parseFloat(c.lista[ i ].resultado_honorarios)
						} else {
							c.lista[ i ].resultado_honorarios = 0 
						}
					}
					c.lista[ i ].resultado_total +=parseFloat( c.lista[ i ].resultado_honorarios) 

					if (typeof c.info.honorarios == 'undefined') {
						c.info.honorarios = { modo: 'p', valor: 10 }
					}
					if (c.info.honorarios.modo == "v") {
						soma_resultado_honorarios = c.info.honorarios.valor
					}
				}
			}
		}
		
		c.info.soma_resultado_desatualizado = soma_resultado_desatualizado 
		c.info.soma_resultado_atualizacao = soma_resultado_atualizacao 
		c.info.soma_resultado_multa = soma_resultado_multa
		c.info.soma_resultado_honorarios = soma_resultado_honorarios
		c.info.soma_resultado_jurosc = soma_resultado_jurosc
		c.info.soma_resultado_jurosm = soma_resultado_jurosm

		c.info.soma_resultado_selic = soma_resultado_selic
		c.info.soma_final_resultado = soma_resultado_atualizacao + soma_resultado_multa + soma_resultado_honorarios + soma_resultado_jurosc + soma_resultado_jurosm + soma_resultado_selic
		
		c.info.soma_deducoes_atualizacao = soma_deducoes_atualizacao
		c.info.soma_deducoes_selic = soma_deducoes_selic

		c.info.soma_final_resultado += soma_deducoes_atualizacao + soma_deducoes_selic
		
		if (c.info.calc_custas) {
			c.info.soma_custas_atualizacao = soma_custas_atualizacao 
			c.info.soma_custas_multa = soma_custas_multa
			c.info.soma_custas_honorarios = soma_custas_honorarios
			c.info.soma_custas_jurosc = soma_custas_jurosc
			c.info.soma_custas_jurosm = soma_custas_jurosm
			c.info.soma_final_custas = soma_custas_atualizacao + soma_custas_multa + soma_custas_honorarios + soma_custas_jurosc + soma_custas_jurosm  
		} else {
			soma_custas_atualizacao = 0 
			soma_custas_multa = 0
			soma_custas_jurosm = 0 
			soma_custas_jurosc = 0 
			soma_custas_honorarios = 0 
			soma_custas_selic = 0 
			soma_custas_desatualizado = 0 
		}

		c.info.soma_custas_desatualizado = soma_custas_desatualizado 
		c.info.soma_custas_atualizacao = soma_custas_atualizacao 
		c.info.soma_custas_multa = soma_custas_multa
		c.info.soma_custas_selic = soma_custas_selic
		c.info.soma_custas_honorarios = soma_custas_honorarios
		c.info.soma_custas_jurosc = soma_custas_jurosc
		c.info.soma_custas_jurosm = soma_custas_jurosm
		c.info.soma_final_custas = soma_custas_atualizacao + soma_custas_multa + soma_custas_honorarios + soma_custas_jurosc + soma_custas_jurosm  + soma_custas_selic
		c.info.soma_final = c.info.soma_final_resultado + c.info.soma_final_custas  
		

		c.info.valor_honorarios_sucumbencia = 0 
		if (c.info.calc_sucumbencia) {

			if (typeof c.info.sucumbencias == 'undefined') {
				c.info.sucumbencias = {modo: 'p', valor: 10 }
			}
			if (typeof c.info.sucumbencias.modo != 'undefined' && c.info.sucumbencias.modo == 'p')	{	
				let b1 = c.info.soma_final
				// console.log(c.info.custas)
				if (!c.info.custas.ncpc) {
					b1 -= c.info.soma_final_custas
				}
				if (c.info.calc_abater_valores) {
					b1 -= c.info.soma_deducoes_atualizacao
				}
				c.info.valor_honorarios_sucumbencia =  b1 * (c.info.sucumbencias.valor/100)
			} else {
				c.info.valor_honorarios_sucumbencia = c.info.sucumbencias.valor
			}
		}

		c.info.valor_multa_ncpc = 0 
		c.info.valor_honorarios_ncpc = 0 
		if (c.info.calc_multa_ncpc) {
			var base = 0
	
			if (typeof c.info.multa523 === 'undefined') {
				c.info.multa523 = { valor_atualizado: true, juros_moratorios: true, juros_compensatorios: true, multa: true, honorarios: true, sucumbencias: true, custas: true, selic: true, metodologias: '1', metodologia_h523: '1', honorarios523_a_parte: false }
			}

			if (c.info.multa523.valor_atualizado) base += c.info.soma_resultado_atualizacao
			if (c.info.multa523.juros_moratorios) base += c.info.soma_resultado_jurosm
			if (c.info.multa523.juros_compensatorios) base += c.info.soma_resultado_jurosc
			if (c.info.multa523.multa) base += c.info.soma_resultado_multa
			if (c.info.multa523.honorarios) base += c.info.soma_resultado_honorarios
			if (c.info.multa523.sucumbencias) base += c.info.valor_honorarios_sucumbencia
			if (c.info.multa523.custas) base += c.info.soma_final_custas
			if (c.info.multa523.selic) base += c.info.soma_resultado_selic

			c.info.valor_multa_ncpc = base * 0.1 

			if (c.info.multa523.honorarios523_a_parte) {
				if (c.info.multa523.metodologia_h523 == "2") {
					c.info.valor_honorarios_ncpc = c.info.valor_multa_ncpc
				} else {
					// console.log(c.info.multa523)
					var base_hono_ncpc = 0
					if (c.info.multa523.valor_atualizado) base_hono_ncpc += c.info.soma_resultado_atualizacao
					if (c.info.multa523.juros_moratorios) base_hono_ncpc += c.info.soma_resultado_jurosm
					if (c.info.multa523.juros_compensatorios) base_hono_ncpc += c.info.soma_resultado_jurosc
					if (c.info.multa523.multa) base_hono_ncpc += c.info.soma_resultado_multa
					if (c.info.multa523.honorarios) base_hono_ncpc += c.info.soma_resultado_honorarios
					if (c.info.multa523.sucumbencias) base_hono_ncpc += c.info.valor_honorarios_sucumbencia
					if (c.info.multa523.custas) base_hono_ncpc += c.info.soma_final_custas
					base_hono_ncpc += c.info.valor_multa_ncpc

					base_hono_ncpc += c.info.soma_resultado_selic
					c.info.valor_honorarios_ncpc = (base_hono_ncpc / 10)
				}
			}

		}		

		c.info.totalzao = c.info.soma_final  + c.info.valor_honorarios_sucumbencia + c.info.valor_multa_ncpc + c.info.valor_honorarios_ncpc

		if (c.info.calc_selic || c.info.indexador == 1005) {
			c.info.dia_atualiza = temp_dia_atualiza
		}

		return c;
	}



	this.le_tabelas = async function () {
		diaCalculoGratuito = calcUtil.dia2yyyymmddInt( calcUtil.diminuiAno( calcUtil.diminuiAno( calcUtil.diaHoje() )))

		var senha = process.env.MYSQL_password2
		var [res1] =  await this.con.query('select indice, maximo, nome, calculo, tabela, inicio, mesclavel, ativo_novo_atualiza from maximo where (ativo=1 or ativo_novo_atualiza=1)  order by nome') 

		this.listaTabelas  = []
		for (var i in res1) {
			this.listaTabelas[ res1[i].indice ] = res1[i]
		}

		for (var i in this.listaTabelas) {
			var id = this.listaTabelas[i].indice
			var tab1 = this.listaTabelas[i].tabela
			var tipo_calculo = this.listaTabelas[i].calculo

			if (tipo_calculo != "multi") {
				var q = `SELECT * FROM ${tab1} order by dia asc`
				var [res2] =  await this.con.query(q)
				
				this.tabelas[ id ] =  [ ] 
				for (var k in res2) {	
					var d1 = calcUtil.yyyymmdd2intMesAno( res2[k].dia.toString() ) 
					this.tabelas[ id ][ d1 ] = res2[ k ]
				}
			}
		}
	}

	this.dataMinMax = function (dados) {
		var min = 21000000
		var max = 0 

		for (var i in dados) {
			var dia = parseInt(dados[i].dia)
			if (dia < min) min = dia
			if (dia > max) max = dia
		}
		return { min,  max }
	}

	this.le_tabela_personalizada = async function (idTab) {
		var [res1] =  await this.con.query('select * from composicao_indice where id='+idTab) 
		var dados = [] 
		var dados_cru = res1[0].dados 
		var dados_cru2 = dados_cru.split('\n')
		for (var i in dados_cru2) {
			var linha = dados_cru2[i].split('=')
			if (linha[0] != '' && linha[1] != '') {
				dados[ calcUtil.yyyymmdd2intMesAno(linha[0]) ] = { dia: linha[0], valor: Number(linha[1]) } 
			}
		}

		// console.table(dados)

		if (res1[0].modocalc == "p") {
			var mm = this.dataMinMax(dados)
			var ac = 10000
			var d = mm.min

			while (d <= mm.max) {
				var str_d = d.toString()  
				// console.log('------ passei 1361', str_d)
				// var index = dados.findIndex( function (el) { return el.dia == str_d } )
				var index = calcUtil.yyyymmdd2intMesAno( str_d )
				dados[index].acumulado = ac
				if (dados[index].valor == '') dados[index].valor = 0
				v1 = dados[index].valor
				ac *= (1 + (v1/100))

				var x2 = calcUtil.yyyymmdd2dia( d.toString() ) 
				var x1 = calcUtil.somaMes( x2)
				
				
				var divisorMoeda1 = calcUtil.divisorMoeda(x2, x1)
				// console.log('x1, x2', x1, x2, divisorMoeda1)
				if (divisorMoeda1 > 0) {
					ac /= divisorMoeda1
				}
				
				d =  calcUtil.dia2yyyymmddInt( x1 )
			}
		}

		return { dados, nome: res1[0].nome, modocalc: res1[0].modocalc }
	}

	this.le_tabelas () 
		setInterval( function() {
			that.le_tabelas() 
	}, 60000 * 15)

	this.bigNumberFit = function (n) {
		if (typeof n === 'undefined') {
			n = Number(0)
		}
		var s_n = n.toString();
		if (s_n.length > 15) {
			var r = parseFloat(s_n.substring(0,15))
			// console.log(r)
			return  r
		}
		return n;
	}



} 

