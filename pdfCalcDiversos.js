const calcUtil = require("./calcUtil")

module.exports = {
    calculosJudiciais:  async function (myDoc, d, calc) {
        const selectIndexadores = [ 
            { id: 0, nome: 'sem correção'},
              { id: 1, nome: 'ORTN / OTN'},
              { id: 73, nome: 'BTN'},
              { id: 42, nome: 'IPC'},
              { id: 41, nome: 'IPC-r'},
              { id: 18, nome: 'INPC'},
              { id: 17, nome: 'IPCA'},
              { id: 45, nome: 'IPCA-E'},
              { id: 107, nome: 'IRSM'},
              { id: 23, nome: 'Selic'},
              { id: 105, nome: 'Ufir'},
              { id: 106, nome: 'URV'},
              { id: 3, nome: 'IGP-DI'},
              { id: 4, nome: 'IPC'},
              { id: 80, nome: 'Média INPC/IGP'},
              { id: -1, nome: 'Fixado'},
            ]
        const mysql = require('mysql2') 
        con = mysql.createPool({
            host: process.env.awsMYSQL_host, 	
            user: process.env.awsMYSQL_user,	
            password: process.env.awsMYSQL_password, 
            database: 'calculos' })

        const fraseHonoSucum  = function(form) {
            let r = ''
            if (form.calcularHonoSucum) { 
                if (form.honoSucumModo == 'causa') {
                r = `Honorários de sucumbência de ${ calcUtil.formataNum(form.honoSucumPercentual,2) }% sobre o valor da causa.`
                }
                if (form.honoSucumModo == 'condenacao') {
                r = `Honorários de sucumbência de ${ calcUtil.formataNum(form.honoSucumPercentual,2) }% sobre o valor da condenação.`
                }
                if (form.honoSucumModo == 'certo') {
                r = `Honorários de sucumbência com valor certo.`
                }
            }
            return r 
        }

        const fraseHonoCumpr = function(form) {
                let r = ''
          
                if (form.calcularHonoComp) {  
                  if (form.honoCompModo == 'valorExecucao') {
                    r = `Honorários de advocatícios de ${ calcUtil.formataNum(form.honoCompPercentual,2) }% sobre o valor da condenação e sucumbência`
                  }
                  if (form.honoCompModo == 'apenasSucumbecia') {
                    r = `Honorários de advocatícios de ${ calcUtil.formataNum(form.honoCompPercentual,2) }% sobre o valor da sucumbência`
                  }
                  if (form.honoCompModo == 'baseUsuario') {
                    r = `Honorários de advocatícios com base informada pelo usuário`
                  }
                }
                return r 
        }

        const fraseJuros = function(jurosTab ) {
            let r = ''
        
            for (var i in jurosTab) {
                let item = jurosTab[i]
                if (i>0) { 
                    r += ', após'; 
                    // if (i == jurosTab.length-1) {
                    //     r += ' após '
                    // }
                }
                if (item.modo == '0') {  r += 'sem juros' }
                if (item.modo == '6') {  r += '6% ao ano' }
                if (item.modo == '12') { r += '12% ao ano' }
                if (item.modo == 'P')  { r += 'poupança' }
                if (i < jurosTab.length-1) { r += ' até ' + calcUtil.mesAno2dia(item.ate)  }
            }
    
            r = 'Juros: '+r+' até a data da atualização'
            return r 
        }

        
        let [t1] = await con.promise().query('select * from tabelasJudiciais where id='+d.indexador)

        let resumoTotalizacao = { headers: [], rows: [], titulo: '',  borda: true, 
            columnAlign: function(i, tipoLinha, numeroLinha) {
                if (i <= 1) return 'left'; 
                return 'right';
            },
            columnContainerWidth: function(i, tipoLinha) {
                if (i <= 1) return 412; 
                return 106;
            }
        };

        let descricaoCalc = { headers: [], rows: [], titulo: '',  borda: false, 
            columnAlign: function(i, tipoLinha, numeroLinha) {
                return 'center';
            },
            columnContainerWidth: function(i, tipoLinha) {
                return 518
            }
        };

    
        let parametroCalc = { headers: [], rows: [], titulo: '',  borda: false, 
            columnAlign: function(i, tipoLinha, numeroLinha) {
                if (i <= 1 ) return 'left'; 
                return 'right';
            },
            columnContainerWidth: function(i, tipoLinha) {
                return 518
            }
        };

        let tabelinhaList = { headers: [], rows: [], titulo: '',  borda: false, 
            columnAlign: function(i, tipoLinha, numeroLinha) {
                if (i <= 1 || tipoLinha.tipo == 'tabelinha') return 'left'; 
                return 'right';
            },
            columnContainerWidth: function(i, tipoLinha) {
                if (tipoLinha.tipo == 'tabelinha') { return (i>2) ? 100 : 86; }
                return 518
            }
        };

        let valoresList = { headers: [], rows: [], titulo: '',  borda: true, 
            columnAlign: function(i, tipoLinha, numeroLinha) {
                return (i <= 1) ? 'left' : 'right';
            },
            columnContainerWidth: function(i, tipoLinha) {
                let ncol = 9
                return 530 / ncol;
            }
        };

        let suList = { headers: [], rows: [], titulo: '',  borda: true, 
            columnAlign: function(i, tipoLinha, numeroLinha) {
                return (i <= 1) ? 'left' : 'right';
            },
            columnContainerWidth: function(i, tipoLinha) {
                if (i==1) return 106
                if (i==2) return 43
                return 530 / 10;
            }
        };

        let formatacao1 = { tipo: 'desc', font: 'Helvetica-Bold', fontSize: 9, fundoCinza: true }
        let formatacao2 = { tipo: 'normal', font: 'Helvetica', fontSize: 9,fundoCinza: false }
        let formatacao3 = { altura: 16, tipo: 'desc', font: 'Helvetica-Bold', fontSize: 6, fundoCinza: true }
        let formatacao3b = { altura: 25, tipo: 'desc', font: 'Helvetica-Bold', fontSize: 6, fundoCinza: true }
        let formatacao4 = {  tipo: 'normal', font: 'Helvetica', fontSize: 6,fundoCinza: false }
        let formatacao4b = { altura: 18, tipo: 'normal', font: 'Helvetica', fontSize: 6,fundoCinza: false }
        let formatacao4c = { altura: 28, tipo: 'normal', font: 'Helvetica', fontSize: 6,fundoCinza: false }
        let ftabelinha = { tipo: 'tabelinha', font: 'Helvetica', fontSize: 8,fundoCinza: false }


        descricaoCalc.rows.push([formatacao2, d.descricao])

        resumoTotalizacao.rows.push([formatacao1, 'Descrição', 'Total'])
        for (let i in calc.totalizacao.planilha) {
            let item = calc.totalizacao.planilha[i]
            let f = formatacao2
            if (item.desc == 'Subtotal' || item.desc == 'Sucumbências') f = formatacao1
            resumoTotalizacao.rows.push([f, item.desc, calcUtil.formataNum(item.valor,2)])
        }
        resumoTotalizacao.rows.push([formatacao1, 'Total em '+d.dataAtual, calcUtil.formataNum( calc.totalizacao.totalizacaoFinal ,2 )])

        parametroCalc.rows.push( [formatacao1, 'Critérios e parâmetros dos cálculos'])
        parametroCalc.rows.push( [formatacao2, `Valores atualizados até ${d.dataAtual}`])

        if (d.calcularHonoSucum) {
            parametroCalc.rows.push( [formatacao2, fraseHonoSucum(d) ])
        }
        
        if (d.calcularHonoComp) {
            parametroCalc.rows.push( [formatacao2, fraseHonoCumpr(d) ])
        }
        

        parametroCalc.rows.push( [formatacao2, fraseJuros(d.jurosTab) ])
        parametroCalc.rows.push( [formatacao2, `Critério de correção monetária:`])
        parametroCalc.rows.push( [formatacao2, t1[0].nome ])

        let resumoTab = JSON.parse( t1[0].resumoTab )
        for (let i = 0; i < resumoTab.length; i++) {
            let e = resumoTab[i];
            let desc = e.desc || '' 
            tabelinhaList.rows.push( [ftabelinha, calcUtil.mesAno2dia(e.inicio), calcUtil.mesAno2dia( e.fim), selectIndexadores.find((item)=>{ return item.id==e.indexador }).nome,  desc ])
        }

        let formulaG = 'G = (C + E) x F'
        if (d.modoSelic == 'princ') {
            formulaG = 'G = C x F' 
        }
        valoresList.rows.push([formatacao3, '', 'A', 'B', 'C = A x B', 'D', 'E = C x D', 'F', formulaG, 'H = C + E + G' ])
        valoresList.rows.push([formatacao3b, 'Data', 'Principal', 'Coef.C. Monetária', 'Principal Corrigido', 'Juros', 'Juros Principal', 'Selic', 'Selic Valor', 'Total' ])
        for (let i in calc.valores.planilha) {
            let item = calc.valores.planilha[i]
            valoresList.rows.push([formatacao4b, calcUtil.mesAno2dia( item.dia ), calcUtil.formataNum(item.principal,2), calcUtil.formataNum(item.correcaoMonetaria,9), calcUtil.formataNum(item.principalCorrigido,2), calcUtil.formataNum(item.juros,2), calcUtil.formataNum(item.jurosPrincipal,2), calcUtil.formataNum(item.selic,2), calcUtil.formataNum(item.selicValor,2), calcUtil.formataNum(item.total,2)   ])
        }
        valoresList.rows.push([formatacao3, 'Total', '', '', calcUtil.formataNum(calc.valores.totalPrincipal,2), '', calcUtil.formataNum(calc.valores.totalJuros,2), '', calcUtil.formataNum(calc.valores.totalSelic,2), calcUtil.formataNum(calc.valores.totalFinal,2),])

        suList.rows.push([formatacao3, '', '', 'A', 'B', 'C = A x B', 'D', 'E', 'F = C x (D+E)', 'G=(C+E) x F' ])
        suList.rows.push([formatacao3b,'Descrição', 'Data', 'Principal', 'Coef.C. Monetária', 'Principal Corrigido', 'Juros', 'Selic', 'Juros / Selic Valor', 'Total' ])        
        for (let i in calc.sucumbencias.planilha) {
            let item = calc.sucumbencias.planilha[i]
            suList.rows.push([ (item.desc.length>30) ? formatacao4c : formatacao4, item.desc, calcUtil.mesAno2dia( item.dia ), calcUtil.formataNum(item.principal,2), calcUtil.formataNum(item.correcaoMonetaria,9), calcUtil.formataNum(item.principalCorrigido,2), calcUtil.formataNum(item.juros,2),  calcUtil.formataNum(item.selic,2), calcUtil.formataNum(item.selicValor,2), calcUtil.formataNum(item.total,2)   ])
        }
        suList.rows.push([formatacao3, 'Total', '', '', '',calcUtil.formataNum(calc.sucumbencias.totalSucumPrincipal,2), '', '', calcUtil.formataNum(calc.sucumbencias.totalSucumSelic,2), calcUtil.formataNum(calc.sucumbencias.totalSucumFinal,2),])

        myDoc.title = 'RESUMO E TOTALIZAÇÃO DO CÁLCULO' 
        myDoc.addPage({ size : 'A4'})
        myDoc.table(descricaoCalc, 10, myDoc.y, { width: 185, rowSpacing: 1,paddingLeft:5, paddingTop:3, paddingBottom:4, columnSpacing:15, rowSpacing:6 });
        myDoc.y += 10
        myDoc.table(resumoTotalizacao, 10, myDoc.y, { width: 185, rowSpacing: 1,paddingLeft:5, paddingTop:3, paddingBottom:4, columnSpacing:15, rowSpacing:6 });
        myDoc.table(parametroCalc, 10, myDoc.y+20, { width: 185, rowSpacing: 1, paddingLeft:5, paddingTop:2, paddingBottom:3, columnSpacing:15, rowSpacing:3 });
        myDoc.table(tabelinhaList, 10, myDoc.y, { width: 185, rowSpacing: 1, paddingLeft:5, paddingTop:2, paddingBottom:2, columnSpacing:15, rowSpacing:3 });

        if (valoresList.rows.length >2) {
            myDoc.title = 'DEMONSTRATIVO DOS VALORES' 
            myDoc.rodape () 
            myDoc.addPage({ size : 'A4'})
            myDoc.table(valoresList, 10, myDoc.y , {  rowSpacing: 4,paddingLeft:5, paddingTop:6, paddingBottom:3, columnSpacing:15 });
        }

        if (suList.rows.length >2) {
            myDoc.title = 'DEMONSTRATIVO DAS SUCUMBÊNCIAS'
            myDoc.rodape () 
            myDoc.addPage({ size : 'A4'})
            myDoc.table(suList, 10, myDoc.y , {  rowSpacing: 4,paddingLeft:5, paddingTop:6, paddingBottom:3, columnSpacing:15  });
        }

        myDoc.rodape () 
        myDoc.end();
    }

 }
  