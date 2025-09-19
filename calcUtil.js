const BigNumber = require('bignumber.js');

module.exports = {
    
    // dia -> dd/mm/aaaa
    // int -> (mm * 12) + 1
    // dinv -> aaaammdd      -> dia invertido (notação de datas anteriores)

    zeroStr (n) {
        var x = parseInt(n)
        if (x < 10) {
            return '0'+String(n)
        } else {
            return String(n)
        }
    },

    dia2dinv (dia) {
        return dia.substring(6)+dia.substring(3,5)+dia.substring(0,2)
    },

    dia2intDia : function(d) {
        if (typeof d === 'undefined') return 0;
        return parseInt(d.substring(0,2))
    },

    dia2intMes : function(d) {
        if (typeof d === 'undefined') return 0;
        return parseInt(d.substring(3,5))
    },

    dia2intAno : function(d) {
        if (typeof d === 'undefined') return 0;
        return parseInt(d.substring(6,10))
    },

    intData2Mes : function (i) {
        let x = ( i % 12 )
        if ( x == 0 ) x = 12 
        return x 
    },

    intData2Ano : function (i) {
        let x = Math.floor( i / 12 )
        let y = ( i % 12 )
        if (y == 0) x-- 
        return x 
    }, 

	dia2intMesAno : function (d) {
        if (typeof d === 'undefined') return 0;
        if (typeof d !== 'string') d = d.toString()
	  let mes = parseInt(d.substring(3,5)) 
      let ano = parseInt(d.substring(6,10))
	  return  (ano * 12) + mes   
	}, 	

    hora2min : function (d) {
        if (typeof d === 'undefined') return 0;
        if (typeof d !== 'string') d = d.toString()
        if (d.length < 5) return 0;
        let hora = parseInt(d.substring(0,2)) 
        let minuto = parseInt(d.substring(3,5))
        return  (hora * 60) + minuto    
    },
    
    min2hora: function (d) {
        let hora = Math.floor( d / 60 )
        let minuto = d - (hora * 60)
        return  this.zeroStr(hora) + ':' + this.zeroStr(minuto)    
    }, 

    diminuiDia (dia) {
        let d = this.dia2intDia(dia)
        let m = this.dia2intMes(dia)
        let a = this.dia2intAno(dia)

        d--

        if (d < 1) {
            m--
            if (m < 1) {
                a--;
                m=12;
            }
            stemp = '01/'+this.zeroStr(m)+'/'+a
            d = this.diasMes(stemp)
        }

        return this.zeroStr(d) + '/' + this.zeroStr(m) + '/' + a
    }, 

    diminuiMes (dia) {
        var d = this.dia2intDia(dia)
        var m = this.dia2intMes(dia)
        var a = this.dia2intAno(dia)
        m-- 
        if (m < 1) {
            m=12
            a--
        }
        return this.zeroStr(d) + '/' + this.zeroStr(m) + '/' + a
    },

    diminuiAno (dia) {
        var d = this.dia2intDia(dia)
        var m = this.dia2intMes(dia)
        var a = this.dia2intAno(dia)
        a-- 
        return this.zeroStr(d) + '/' + this.zeroStr(m) + '/' + a
    },

    diminuiAnos (dia, qtde) {
        var d = this.dia2intDia(dia)
        var m = this.dia2intMes(dia)
        var a = this.dia2intAno(dia)
        a = a - qtde
        return this.zeroStr(d) + '/' + this.zeroStr(m) + '/' + a
    },

    somaAno (dia) {
        var d = this.dia2intDia(dia)
        var m = this.dia2intMes(dia)
        var a = this.dia2intAno(dia)
        a++ 
        return this.zeroStr(d) + '/' + this.zeroStr(m) + '/' + a
    },


    somaMes (dia) {
        if (typeof dia === 'undefined') return '';
        if (typeof dia !== 'string') dia = dia.toString()

        var d = this.dia2intDia(dia)
        var m = this.dia2intMes(dia)
        var a = this.dia2intAno(dia)
        m++
        if (m>12) {
            m=1
            a++
        }
        return this.zeroStr(d) + '/' + this.zeroStr(m) + '/' + a
    },

    somaDia (dia) {
        var d = this.dia2intDia(dia)
        var m = this.dia2intMes(dia)
        var a = this.dia2intAno(dia)

        d++
        if (d > this.diasMes(dia)) {
            d=1
            m++
            if (m>12) {
                m=1
                a++
            }
        }
        return this.zeroStr(d) + '/' + this.zeroStr(m) + '/' + a
    },

    diaHoje () {
        var data = new Date(),
        dia  = data.getDate().toString().padStart(2, '0'),
        mes  = (data.getMonth()+1).toString().padStart(2, '0'), //+1 pois no getMonth Janeiro começa com zero.
        ano  = data.getFullYear();
        return dia+"/"+mes+"/"+ano;     
    },

    totalDias2cal360 ( totalDays ) {
        const resultYears = Math.floor(totalDays / 360);
        const remainingDays = totalDays % 360;
        const resultMonths = Math.floor(remainingDays / 30);
        const resultDays = remainingDays % 30;
        return {
            anos: resultYears,
            meses:resultMonths,
            dias: resultDays
        }

    },

    diffDatas360(a, b) {
        // Parse as datas de entrada
        let ad = this.dia2intDia(a)
        let am = this.dia2intMes(a)
        let aa = this.dia2intAno(a)
        let bd = this.dia2intDia(b)
        let bm = this.dia2intMes(b)
        let ba = this.dia2intAno(b)
        let anoDiff = ba - aa;
        let mesDiff = bm - am;
        let diaDiff = bd - ad;

        // Ajustar se os dias forem negativos
        if (diaDiff < 0) {
            mesDiff -= 1;
            diaDiff += 30;  // Assumindo 30 dias por mês
        }
    
        // Ajustar se os meses forem negativos
        if (mesDiff < 0) {
            anoDiff -= 1;
            mesDiff += 12;
        }
    
        // Converter a diferença total para a metodologia de 360 dias por ano
        return  (anoDiff * 360) + (mesDiff * 30) + diaDiff;
    },

    diaSemana (dia) {
        if (!dia || dia==null) return -1;
        var d = this.dia2intDia(dia)
        var m = this.dia2intMes(dia)
        var a = this.dia2intAno(dia)
        var dt = new Date(a, m-1, d)
        return dt.getDay();
    },

	yyyymmdd2intMesAno : function (d) {
        var mes = parseInt(d.substring(4,6))
        var ano = parseInt(d.substring(0,4))
        return  (ano * 12) + mes   
      }, 

    yyyymmdd2dia : function (d) {
        if (typeof d === 'undefined') return ''
        if (typeof d !== 'string') d =d.toString()
        if (d.length < 8  ) return ''
        var dia = d.substring(6,8)
        var mes = d.substring(4,6)
        var ano = d.substring(0,4)  
        return  `${dia}/${mes}/${ano}`    
      }, 

    dia2yyyymmdd : function (dia1) {
        if (typeof dia1 === 'undefined') return ''
        if (typeof dia1 !== 'string') d =d.toString()

        var d = this.dia2intDia(dia1)
        var m = this.dia2intMes(dia1)
        var a = this.dia2intAno(dia1)
        var dia = this.zeroStr(d)
        var mes = this.zeroStr(m)
        var ano = a 

        return  `${ano}${mes}${dia}`    
    },

    dia2yyyymmddInt  (dia1) {
        let x = this.dia2yyyymmdd(dia1)
        if (x == '') return 0;
        let r = parseInt( x )
        if (isNaN(r)) {
            return 0;
        }
        return r;
    },

    moeda ( dia ) {
        dia = this.dia2yyyymmddInt(dia)
        var d150570 = 19700515;
        var d022886 = 19860228;
        var d011589 = 19890115;
        var d022890 = 19900316;
        var d080193 = 19930801;
        var d070194 = 19940701;
      
        var r = '';
        if (dia <=  d150570) r = 'NCr$';
        else if(dia >  d150570 && dia < d022886) r = 'Cr$';
        else if(dia >= d022886 && dia < d011589) r = 'CZ$';
        else if(dia >= d011589 && dia < d022890) r = 'NCZ$';
        else if(dia >= d022890 && dia < d080193) r = 'Cr$';
        else if(dia >= d080193 && dia < d070194) r ='CR$';
        else if(dia >= d070194) r = 'R$';
      
        return r;
    },
      
    divisorMoeda (dia1, dia2) {
        dia1 = this.dia2yyyymmddInt(dia1)
        dia2 = this.dia2yyyymmddInt(dia2)

        d022886 = 19860228;
        d011589 = 19890115;
        d022890 = 19900228;
        d080193 = 19930801;
        d070194 = 19940701;
      
        var r = 0;
        if(dia1 < d022886 && dia2 >= d022886) r = 1000;
        else if(dia1 < d011589 && dia2 >= d011589) r = 1000;
        else if(dia1 < d080193 && dia2 >= d080193) r = 1000;
        else if(dia1 < d070194 && dia2 >= d070194) r = 2750;
      
        return r;
    },

    int2Hora (h) {
        if (!h) return '00:00'
        let hora = parseInt(h/60)
        let minuto = h % 60
        return this.zeroStr(hora) + ':' + this.zeroStr(minuto)
    },
    
    mesAno2dia  (d) {
        if (!d) return 0;
        if (d.length < 10) return 0;
        d = parseInt(d)
        var ano = Math.floor( d / 12 )
        var mes = d-(ano*12)
        if (mes==0) { mes = 12; ano--; } 
        var zero = (mes<10) ? '0' : '' 
        return  `${zero}${mes}/${ano}`   
    }, 

    mesAno2intMes (d) {
        if (!d) return 0;
        if (d.length < 10) return 0;
        d = parseInt(d)
        var ano = Math.floor( d / 12 )
        var mes = d-(ano*12)
        if (mes==0) { mes = 12; ano--; } 
        return  parseInt(mes)   
    }, 

    mesAno2intAno  (d) {
        if (!d) return 0;
        if (d.length < 10) return 0;
        d = parseInt(d)
        var ano = Math.floor( d / 12 )
        var mes = d-(ano*12)
        if (mes==0) { mes = 12; ano--; } 
        return  parseInt(ano)   
    }, 

    mesAno2dinv  (d) {
        if (d.length < 10) return 0;
        d = parseInt(d)
        var ano = Math.floor( d / 12 )
        var mes = d-(ano*12)
        if (mes==0) { mes = 12; ano--; }  
        var zero = (mes<10) ? '0' : '' 
        return  `${ano}${zero}${mes}01`   
    }, 

    anoBisexto  (ano) {
        return ((ano%4)==0)
    }, 

    diasMes : function(data) {
        var meses = {'1': 31, '2': 28, '3':31, '4':30, '5':31, '6':30, '7':31,'8':31, '9':30, '10':31, '11': 30, '12': 31};
        var m = meses[this.dia2intMes(data)]

        if ((m==28) && (this.anoBisexto(this.dia2intAno(data)) )) {
            m = 29 
        }
        return m;
    },

    salario13 : function(ini, fim, ampliar) {
        var i = this.dia2intMesAno(ini)
        var f = this.dia2intMesAno(fim)
        var i_dia = this.dia2intDia(ini)
        var f_dia = this.dia2intDia(fim)

        var i_ano = this.dia2intAno(ini)
        var f_ano = this.dia2intAno(fim)


        var prop = 0 
        var resultado =  [ ]

        for (var q = i; q <= f; q++) {
            var temp = {}  
            prop++

            var mes = ((q%12)==0) ? 12 : (q%12)
            if ((mes == 12) || (q == f)) {
                if ((q==f) && (ampliar)) { prop++ }
                if ((q==f) && (f_dia < 15)) { prop-- }
                if ( ( this.intData2Ano(q) == this.intData2Ano(i) ) && (i_dia > 15) )  { prop-- } 

                temp.dia = q
                temp.proporcao = prop

                if (resultado.length <= 0) {
                    if (i_ano == f_ano) {
                        var pa_ini = this.zeroStr( i_dia ) +  '/'+ this.zeroStr( this.intData2Mes(i) ) + '/' + this.intData2Ano( q ) 
                    } else {
                        var pa_ini = '01/01/' + this.intData2Ano(q) 
                    }
                } else {
                    var pa_ini = '01/01/' + this.intData2Ano(q) 
                }
                if (q == f) {
                    var pa_fim = this.zeroStr( f_dia ) +  '/'+ this.zeroStr( this.intData2Mes(q) ) + '/' + this.intData2Ano( q ) 
                } else {
                    var pa_fim = '31/12/' + this.intData2Ano(q) 
                }

                prop = 0 
                temp.debug_dia = this.mesAno2dia(q)
                temp.pa_ini = pa_ini
                temp.pa_fim = pa_fim  

                if (temp.proporcao>0) {
                    resultado.push(temp)
                }
            } 
        }

        return resultado 
    }, 

    feriasTodas : function(ini, fim, ampliar) {

        var res =  [ ]
        var ma_admis = this.dia2intMesAno(ini)
        var ma_demis = this.dia2intMesAno(fim)

        var propferias = ma_demis - ma_admis + 1 
        var ini_ferias = ini 

        while (propferias > 12) {
            var linha = {} 
            
            linha.dia = this.dia2intMesAno( this.somaAno( ini_ferias ) ) 
            linha.pa_ini = ini_ferias 
            linha.pa_fim = this.somaAno( this.diminuiDia( ini_ferias ))
            linha.prop = 12
            linha.tipo = 'g'

            ini_ferias = this.somaAno( ini_ferias )
            propferias -= 12
            res.push(linha)
        }

        linha = {}
        linha.dia = this.dia2intMesAno(  this.strPrimeiroDia( fim ) ) 
        linha.pa_ini = ini_ferias
        linha.pa_fim = fim 

        var a = ini_ferias
        var a1 = ini_ferias
        var b = fim 
        propferias = 0

        while ( this.dia2yyyymmddInt(a1) < this.dia2yyyymmddInt(b)) {
            var u = this.diasMes( a )
            var x = ( u - this.dia2intDia(a) ) + 1
            if (x > 14) propferias++;
            a = this.somaMes( this.strPrimeiroDia(a) )
            a1 = this.strUltimoDia( a )
        }

        x = this.dia2intDia(fim)
        if (x > 14) propferias++;
        if (ampliar) propferias++;
        linha.prop = propferias
        linha.tipo = 'p'

        res.push( linha)

        return res 
    },

    feriasProporcionais :  function(ini, fim, ampliar) {
        var ma_admis = this.dia2intMesAno(ini)
        var ma_demis = this.dia2intMesAno(fim)
        var admis_dia = this.dia2intDia(ini)
        var demis_dia = this.dia2intDia(fim)
        var propferias = (ma_demis - ma_admis) + 1

        while (propferias > 12) propferias -= 12


        if (admis_dia >= 15) propferias--;
        if (demis_dia < 15) propferias--;
  
        if ( (admis_dia < 15) && (demis_dia >= 15) && ((demis_dia-admis_dia) < 15) ) { 
            propferias--; 
        }

        if  (propferias < 0) propferias += 12
        if (ampliar) propferias++ 

        return propferias
    },

    diasAviso : function(ini, fim) {
        var meses = this.mesesInteiros(ini, fim)
        if (meses < 12) meses = 0
        var n = Math.floor(meses / 12) * 3
        if (n < 0) n = 0
        n += 30
        if (n > 90) n = 90
        return n 
    }, 

    mesesInteiros : function(a, b) {
        var ad = this.dia2intDia( a ) 
        var am = this.dia2intMes( a )
        var aa = this.dia2intAno( a )
        var ba = this.dia2intAno( b )
        var bm = this.dia2intMes( b )

        if (aa==ba && am==bm) {
            return 0 
        } else {
            if (ad>1) {
                ad = 1
                am++
            }
            if (am==13) {
                am = 1
                aa++
            }
        }
        return (12 * (ba - aa -1)) + (bm + 12 - am)
    },


    datePascoa (aano) {
        var resto = (aano % 19) + 1

        switch (resto) {
            case 1: r = new Date(aano, 3, 14); break;
            case 2: r = new Date(aano, 3, 4); break;
            case 3: r = new Date(aano, 2, 23); break;
            case 4: r = new Date(aano, 3, 11); break;
            case 5: r = new Date(aano, 2, 31); break;
            case 6: r = new Date(aano, 3, 18); break;
            case 7: r = new Date(aano, 3, 8); break;
            case 8: r = new Date(aano, 2, 28); break;
            case 9: r = new Date(aano, 3, 16); break;
            case 10: r = new Date(aano, 3, 5); break;
            case 11: r = new Date(aano, 2, 25); break;
            case 12: r = new Date(aano, 3, 13); break;
            case 13: r = new Date(aano, 3, 2); break;
            case 14: r = new Date(aano, 2, 22); break;
            case 15: r = new Date(aano, 3, 10); break;
            case 16: r = new Date(aano, 2, 30); break;
            case 17: r = new Date(aano, 3, 24); break;
            case 18: r = new Date(aano, 3, 7); break;
            case 19: r = new Date(aano, 2, 27); break;
        }

        var a = r.getDay ()         
        if (a > 0) {
            r.setDate(  r.getDate () + (7-a) )
        }

        return r
    },

    dateFeriadoMovel (dia, config) {
        var ano = dia.getYear () + 1900
        var pascoa = this.datePascoa (ano)   
        var sextaSanta =  new Date( pascoa.getTime() - (  (24*60*60*1000) * 2)  )   
        var corpus =  new Date( pascoa.getTime() + (  (24*60*60*1000) * 60)  )
        var carnaSab =  new Date( pascoa.getTime() - (  (24*60*60*1000) * 50)  )
        var carnaDom =  new Date( pascoa.getTime() - (  (24*60*60*1000) * 49)  )
        var carnaSeg =  new Date( pascoa.getTime() - (  (24*60*60*1000) * 48)  )
        var carnaTer =  new Date( pascoa.getTime() - (  (24*60*60*1000) * 47)  )
        var carnaQua =  new Date( pascoa.getTime() - (  (24*60*60*1000) * 46)  )

        r = 0
        if ((config[0]==1) && (dia.getTime() == pascoa.getTime())) r = 1
        if ((config[1]==1) && (dia.getTime() == sextaSanta.getTime())) r = 1
        if ((config[2]==1) && (dia.getTime() == corpus.getTime())) r = 1
        if ((config[3]==1) && (dia.getTime() == carnaSab.getTime())) r = 1
        if ((config[4]==1) && (dia.getTime() == carnaDom.getTime())) r = 1
        if ((config[5]==1) && (dia.getTime() == carnaSeg.getTime())) r = 1
        if ((config[6]==1) && (dia.getTime() == carnaTer.getTime())) r = 1
        if ((config[7]==1) && (dia.getTime() == carnaQua.getTime())) r = 1

        return r 
    }, 

    str2arrayFeriados (str) {
        r = []
        while (str.length > 0) {
            var d = parseInt(str.substring(0, 2))
            var m = parseInt(str.substring(2, 4))
            r.push({d,m})
            str = str.substring(4)
        }
        return r 
    },

    dateFeriadoFixo (dia, arrayFeriados) {
        var d = dia.getDate()
        var m = dia.getMonth()+1
        for (var i in arrayFeriados) {
            if (arrayFeriados[i].d == d && arrayFeriados[i].m == m) return 1
        }
        return 0 
    },

    dataOk (dia) {
        if (typeof dia === 'undefined') return false;
        if (dia.length != 10) return false;

        var d = this.dia2intDia( dia )
        var m = this.dia2intMes( dia )
        var a = this.dia2intAno( dia )
        var dm = this.diasMes( dia )

        if (a < 1964 || a > 2050) return false;
        if (m < 1 || m > 12) return false;
        if (d < 1 || d > dm) return false;

        return true;
    },

    str2date (str) {
        var d = str.substring(0,2)
        var m = parseInt(str.substring(3,5))-1
        var a = str.substring(6)

        return new Date(a,m,d)
    }, 

    strPrimeiroDia (str) {
        return '01/'+str.substring(3)
    },

    strUltimoDia (str) {
        return this.diasMes(str)+'/'+str.substring(3) 
    }, 

    dsrDetalhado (strIni, strFim, feriados, config) {
        var dateIni = this.str2date( strIni )
        var dateFim = this.str2date( strFim )
        var ferM = feriados.substring(0,8)
        var ferF = this.str2arrayFeriados( feriados.substring(8) )

        var r = {
            segunda: 0,
            terca: 0,
            quarta: 0,
            quinta: 0,
            sexta: 0,
            sabado: 0,
            domingo: 0,
            feriado: 0 
        }

        while (dateIni.getTime() <= dateFim.getTime()) {
            var diaSemana = dateIni.getDay () 
            // if (config.dsrFer) {
                if ( this.dateFeriadoFixo( dateIni, ferF) ) diaSemana = 7
                if ( this.dateFeriadoMovel( dateIni, ferM) ) diaSemana = 7 
            // }

            switch (diaSemana) {
                case 0: r.domingo++; break;
                case 1: r.segunda++; break;
                case 2: r.terca++; break;
                case 3: r.quarta++; break;
                case 4: r.quinta++; break;
                case 5: r.sexta++; break;
                case 6: r.sabado++; break;
                case 7: r.feriado++; break;
            }

            dateIni.setTime(  dateIni.getTime() + (24*60*60*1000) )
        }

        r.diasU = 0
        r.diasD = 0

        if (config.dsrDom) { r.diasD += r.domingo } else { r.diasU += r.domingo }
        if (config.dsrSeg) { r.diasD += r.segunda } else { r.diasU += r.segunda }
        if (config.dsrTer) { r.diasD += r.terca } else { r.diasU += r.terca }
        if (config.dsrQua) { r.diasD += r.quarta } else { r.diasU += r.quarta }
        if (config.dsrQui) { r.diasD += r.quinta } else { r.diasU += r.quinta }
        if (config.dsrSex) { r.diasD += r.sexta } else { r.diasU += r.sexta }
        if (config.dsrSab) { r.diasD += r.sabado } else { r.diasU += r.sabado }
        if (config.dsrFer) { r.diasD += r.feriado } else { r.diasU += r.feriado }

        return r;
    },

    mesesInteiros(a,b){
        var ad = this.dia2intDia(a)
        var am = this.dia2intMes(a)
        var aa = this.dia2intAno(a) - 1900

        var bd = this.dia2intDia(b)
        var bm = this.dia2intMes(b)
        var ba = this.dia2intAno(b) - 1900
      
        if(aa == ba && am == bm) {
            return 0
        }  else {
        //   if(ad > 1 && ad != bd){
          if(ad > 1) {
            ad = 1;
            am++;
            if(am == 13){
              am = 1;
              aa++;
            }
          }
         return 12 * (ba - aa - 1) + (bm + 12 - am);
        }
      },

      diasQuebrados(a,b){
        var ad = this.dia2intDia(a)
        var am = this.dia2intMes(a)
        var aa = this.dia2intAno(a) - 1900
        var bd = this.dia2intDia(b)
        var bm = this.dia2intMes(b)
        var ba = this.dia2intAno(b) - 1900
      
        var tot1 = this.diasMes(a) - ad
        var tot2 = bd
        var desc = 0

        if (ad == 1) {
            desc = (aa==ba && am==bm) ? 0 : this.diasMes(a)
        }
        var pass = (am != bm || aa != ba) ? tot1 + tot2 : bd - ad 

        return Math.abs(pass - desc)
      },

      limpaNum (v) {
        if (typeof v !== 'string') v = v.toString() 
        if (v == '') return 0;
        const char_centavos = ",";
        const char_milhar = ".";
        v = v.split(char_milhar).join('');
        v = v.replace(char_centavos, ".");
        return parseFloat(v);      
      },

      diferencaDatasDias(a,b) {
        var ad = this.dia2intDia(a)
        var am = this.dia2intMes(a) - 1
        var aa = this.dia2intAno(a)
        var bd = this.dia2intDia(b)
        var bm = this.dia2intMes(b) - 1
        var ba = this.dia2intAno(b)

        var date1 = new Date(aa, am, ad)
        var date2 = new Date(ba, bm, bd)
        var diff = Math.abs(date1.getTime() - date2.getTime()); 
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
      },

      calcJuros(dia, diaFim, v, modo, proRata) {
        var rju = 0
        var mi = this.mesesInteiros(dia, diaFim)
        var dq = this.diasQuebrados(dia, diaFim)

        let idia = this.dia2yyyymmddInt(dia)
        let fdia = this.dia2yyyymmddInt(diaFim)
        if (idia > fdia) { return 0; }

        // Alteração super importante dia 27/08/2024 sobre juros capitalizados 
        var x2 = 0 
        if (!proRata) {
            var x1 = this.dia2intDia(diaFim)
            x2 = this.dia2intDia(dia)

            if ((x1 >= x2) &&
                (((this.dia2intMes( dia ) != this.dia2intMes( diaFim )) && (this.dia2intAno(dia) != this.dia2intAno( diaFim ))) || 
                ((this.dia2intMes( dia ) == this.dia2intMes( diaFim )) && (this.dia2intAno( dia ) != this.dia2intAno( diaFim ))  && ( dq >= this.diasMes(diaFim) )) ||
                ((this.dia2intMes( dia ) != this.dia2intMes( diaFim )) && (this.dia2intAno( dia ) == this.dia2intAno( diaFim )))))
            {
                mi++ 
            }
            dq = 0
            if ((x2 == 1) && ( mi > 0 ) && (this.dia2intMes(dia) !=  this.dia2intMes(diaFim)  )){
                mi--
            }
        }

        if (modo == 'c') { // composto
            var c2 = 1 + (v / 100)
            var c1 = Math.pow(c2, (1/30))
            var c3 = Math.pow(c2, mi)
            rju = Math.pow(c1, dq)
            if (!proRata) rju = 1
            rju = ((rju * c3)-1)*100
            return rju
        } else { // simples
            var c1 = v / 30
            rju = c1 * dq
            c3 = v * mi
            rju = rju + c3
            if (rju < 0) rju = 0
            return rju 
        }
      },

    zeroStr3 (n) {
        var x = parseInt(n)
        if (x < 10)  return '00'+String(n)
        if (x < 100)  return '0'+String(n)
        return String(n)
    },

    hora2intHora : function(d) {
        if (!d) return 0;
        var x = d.indexOf(":")
        if (!x) x = d.indexOf(",")
        if (!x || x<0) return parseInt(d)
        
        return parseInt(d.substring(0,x))
    },

    hora2intMinuto : function(d) {
        if (!d) return 0;
        var x = d.indexOf(":")
        if (x<0) x = d.indexOf(",")
        if (!x || x<0)  return 0;
        if (x+1 == d.length) return 0;
        var s = d.substring(x+1)
        if (s.length==1) s = s+"0"
        return parseInt(s)
    },


      formataHora( s ) {
        if (s == '' || typeof(s) ==='undefined') return "00:00";
        s = String(s)
        s = s.replace(',', ':')
        s = s.replace('.', ':')
        if (s.length == 1) { s = '0' + s; }
        if ((s.length >= 2) && (s[1] ==":")) { s = s + '0' ; } 

        var x = s.indexOf(':')
        if (x < 0) s = s + ':'

        if (s.length == 3) {  s = s+'00'; } 
        if (s.length == 4) s = s+'0'
        return s;
      },

      formataHora3( s ) {
        if (s == '' || typeof(s) ==='undefined') return "000:00";
        s = String(s)
        s = s.replace(',', ':')
        s = s.replace('.', ':')

        var h = this.hora2intHora(s)
        var m = this.hora2intMinuto(s)

     

        var r = this.zeroStr3(h)+":"+this.zeroStr(m)

        return r;
      },

      formataNum: function (n, c) {
        var m = 0;
        var char_centavos = ",";
        var char_milhar = ".";
  
        n = String(n);
  
        if (n=="null") return "";
        if (n=="x") return "-";
  
        if (n.indexOf("e")>0) { 
          n = '0';
        }
  
        var len = n.length;
        var ponto = n.indexOf(".");
        if (ponto>0) {
          n = n.substr(0,ponto) + char_centavos + n.substr(ponto+1);
        }
  
        if (len>0) {
          if (n[0]==char_centavos) {
            n = '0'+n;
            len++;
            ponto++;
          }
        }
  
        if (c>0) {
          if (ponto<0) {
            n = n + char_centavos;
            ponto = len;
            len++;
          }
          while (  ( ( len-1) - ponto) < c) {
            n = n + '0';
            len++;
          }
          
          if (( ( len-1) - ponto) > c) {
            n = n.substr(0,   ponto+c+1);
          }
          // pontos de milhar 
          m = ponto -3;
          while (m > 0) {
            if ((m!=1) || ((m==1) && (n.substr(0,1)!="-" ))) {
              n = n.substr(0, m)+char_milhar+n.substr(m);
            }
            m = m - 3;
          }
        } else {
        
          if (ponto < 0) ponto = n.length;
          m = ponto -3;
          while (m > 0) {
            if ((m!=1) || ((m==1) && (n.substr(0,1)!="-" ))) {
              n = n.substr(0, m)+char_milhar+n.substr(m);
            }
            m = m - 3;
          }    
        }
  
        return n;
      },
      horaStoD: function (s) {
        if (s.length==6) {
            var hora = this.hora2intHora(s)
            var minutos = this.hora2intMinuto(s)
            minutos = Math.floor( (minutos / 60) * 100 ) 
            s = this.zeroStr3(hora) + ',' + this.zeroStr(minutos)
        }
        return s;
    },

    horaDtoS: function (s) {
        if (s.length==6) {
            var hora = this.hora2intHora(s)
            var minutos = this.hora2intMinuto(s)
            minutos = Math.floor( (minutos / 100) * 60 ) 
            s = this.zeroStr3(hora) + ':' + this.zeroStr(minutos)
        }
        return s;
    },

    JSON_parseAutoCorrige: function ( dados) {
        try {
            j = JSON.parse(dados)
            return j 
       } catch (e) {
            var x = String(e)
            var p1 = x.indexOf("position ")+9;
            var posicao = x.substring(p1)    
            var recorte = dados.substring(0,posicao)
            try {
                var j2 = JSON.parse(recorte)
            } catch (e) {
                var j2 = {} 
            }
            
            return j2
       }
    }
}

