const calcUtil = require("./calcUtil")

const indexadorMesclavel = {
    47: 'Sem correção',
    1: 'ORTN / OTN',
    73: 'BTN',
    42: 'IPC (IBGE)',
    41: 'IPC-r (IBGE)',
    18: 'INPC (IBGE)',
    17: 'IPCA (IBGE)',
    45: 'IPCA-E (IBGE)',
    105: 'Ufir',
    23: 'Selic (simples)',
    24: 'Selic (capitlzd)',
    107: 'IRSM',
    106: 'URV (mensal)',
    3: 'IGP-DI (FGV)',
    4: 'IPC (FGV)',
    80: 'Média IGP/INPC',
    10: 'TR (Bacen)',
    16: 'IGP-M (FGV)',
    87: 'Poupança (Bacen:196)',
    95: 'Poupança (Bacen:7828)'
}

module.exports = {
    montaCalc ( dump ) {
        if (dump.erro) {
            return "Erro ao carregar o cálculo.";
        }

        var escreveuCustas = false
        var escreveuDeducoes = false

        var myDoc = `<!DOCTYPE html><html><style>
        @font-face {    
            font-family: 'Arial';    
            font-weight: normal;    
            font-style: normal;
        }
        
        body {	
            font-size:14px;    
            font-family:'Arial';    
            color: #444;
        }
        
        table  {	 
            border-collapse: collapse;	  
            border: none; 	 
            width: 100%; 
            /*border: 1px solid red;*/
        }
        
        table td {   
            padding: 5px;	  
            border: none; 	 
            text-align: right;   
            font-size: 12px; 
            /*border: 1px orange solid;*/
        } 
        
        table td.esquerda {	 
            text-align: left; 
        }

        table td.direita {	 
            text-align: right; 
        }

        
        table th {	 
        /*	border: 1px solid #DDD; */   
            padding: 5px;	 
            text-align: right;   
            font-size: 12px; 
        }
        
        table th.esquerda {	 
            text-align: left; 
        } 
        
        table td.titulo_anexo { 
            text-align: center;    
            color: black; 
            font-size: 18px;  
            font-weight: bold;	 
            background-color: #EEE;    
            padding: 5px;
        } 
        
        .negrito {
            font-weight: bold !important;
        }
        
        .separaCalc {
            border-top: 1px dashed #DDD !important;
        }
        
        .celulaCorrecaoMonetariaTitulo {
            border: 1px solid #DDD !important;
            font-size: 14px; 
            background-color: #EAEAEA;
            text-align:center !important; 
            font-weight:bold; 
            min-height: 25px;
        }
        
        .tabelaMesAMes {
            margin:auto; 
            width: 70%;
        }
        
        .tabelaMesAMes td:nth-child(1){
            white-space: nowrap;
            font-size: 8px;
            text-align: left !important;
        }

        .tabelaMesAMes td:nth-child(2){
            white-space: nowrap;
            font-size: 8px;
            text-align: left !important;
        }
        .tabelaMesAMes td{
            white-space: nowrap;
            font-size: 8px;
            text-align: right !important;
        }

        .tabelaMesAMes td{
            white-space: nowrap;
            font-size: 8px;
            text-align: right !important;
        }

        .miniTab {
            width: 300px;
            border: 1px solid #EEE;
        }
        
        .miniTab td{
            white-space: nowrap;
            font-size: 8px;
            text-align: left ;
            border: 1px solid #EEE;
        }

        .miniTab th{
            white-space: nowrap;
            font-size: 8px;
            text-align: left;
            border: 1px solid #EEE;
        }
        
        .tabelaCabecalho {
            margin-top:20px; 
            border: 1px solid #000;
            padding: 10px;
        
        
            border-collapse: separate;
        }
        
        .tabelaCabecalho td{
            padding: 6px;
            text-align: left;
        /*	border: 1px solid pink;
            white-space: nowrap;*/
        }
        
        .tabelaResuminho {
                border: 1px solid green;
        }
        
        .tabelaValor {
            margin-top: 10px !important;
        }
        
        .tabelaResumo {
            margin: auto; 
            border: 1px solid #000;
            padding: 10px;
            width: 50%;
            border-collapse: separate;
        }
        
        .tabelaResumo td{
            padding: 6px;
        
        /*	border: 1px solid pink;
            white-space: nowrap;*/
        }
        
        .tabelaCalcColunado {
            margin: auto; 
            /*border: 1px solid #000;*/
            padding: 10px;
            width: 100%;
            border-collapse: separate;
        }
        
        .tabelaCalcColunado td{
            padding: 6px;
        
        /*	border: 1px solid pink;
            white-space: nowrap;*/
        }
        
        
        .nTabela1 {
            border: 1px solid #eee;
        }
        
        .nTabela1 td {
            border: 1px solid #eee;
            text-align: left;
        }

        .nTabela1 td:nth-child(4) { 
            text-align: right; 
        }
        
        .nTabela1 tr {
            border: 1px solid #eee;
        }
        
        .tracejadoTB {
            border-top: 1px dashed #DDD;
            border-bottom: 1px dashed #DDD;
        }

        </style>`

        var temp1 = [] 
        // ordenar os valores

        if (typeof dump.info.calc_abater_valores==='undefined' || dump.info.calc_abater_valores) {
            for (var i in dump.lista) {
                if (dump.lista[i].valor > 0 && !dump.lista[i].custas) {
                    temp1.push(dump.lista[i])
                }
            }

            for (var i in dump.lista) {
                if (dump.lista[i].custas == true) {
                    temp1.push(dump.lista[i])
                }
            }

            for (var i in dump.lista) {
                if (dump.lista[i].valor < 0 && !dump.lista[i].custas) {
                    temp1.push(dump.lista[i])
                }
            }

        } else {
            for (var i in dump.lista) {
                if (!dump.lista[i].custas) {
                    temp1.push(dump.lista[i])
                }
            }

            for (var i in dump.lista) {
                if (dump.lista[i].custas == true) {
                    temp1.push(dump.lista[i])
                }
            }
        }

        dump.lista = temp1

        // Escrevendo o cabeçalho
        myDoc += `<svg
        version="1.1"
        id="svg2"
        xml:space="preserve"
        width="120"
        height="40"
        viewBox="0 0 160 40"
        sodipodi:docname="debit novo 120x30.ai"
        xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
        xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:svg="http://www.w3.org/2000/svg"><defs
          id="defs6"><clipPath
            clipPathUnits="userSpaceOnUse"
            id="clipPath18"><path
              d="M 0,30 H 120 V 0 H 0 Z"
              id="path16" /></clipPath></defs><sodipodi:namedview
          id="namedview4"
          pagecolor="#ffffff"
          bordercolor="#666666"
          borderopacity="1.0"
          inkscape:pageshadow="2"
          inkscape:pageopacity="0.0"
          inkscape:pagecheckerboard="0" /><g
          id="g8"
          inkscape:groupmode="layer"
          inkscape:label="debit novo 120x30"
          transform="matrix(1.3333333,0,0,-1.3333333,0,40)"><path
            d="M 0,0 H 120 V 30 H 0 Z"
            style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none"
            id="path10" /><g
            id="g12"><g
              id="g14"
              clip-path="url(#clipPath18)"><g
                id="g20"
                transform="translate(24.1299,25.2764)"><path
                  d="M 0,0 C 0.007,0.511 0.281,0.588 0.783,0.599 1.765,0.619 7.168,0.659 7.556,0.54 7.931,0.424 7.911,-0.087 7.9,-0.526 7.888,-0.973 7.898,-1.433 7.898,-1.881 L 7.899,-6.028 C 7.91,-6.497 7.99,-6.9 7.687,-7.183 7.321,-7.524 7.065,-7.039 6.861,-6.849 c -0.246,0.23 -0.445,0.44 -0.682,0.674 -0.225,0.223 -1.182,1.251 -1.38,1.334 l -4.902,-4.45 c -0.509,-0.525 -1.543,-1.35 -2.034,-1.826 -0.168,-0.163 -0.271,-0.229 -0.411,-0.369 l -1.644,-1.476 c -0.574,-0.376 -1.112,0.375 -1.432,0.735 -0.124,0.14 -0.255,0.252 -0.386,0.394 -0.225,0.243 -0.516,0.55 -0.755,0.806 -0.253,0.271 -0.497,0.548 -0.747,0.814 -0.198,0.211 -0.556,0.632 -0.783,0.744 -0.176,-0.089 -2.227,-2.052 -2.417,-2.231 l -1.199,-1.102 c -0.219,-0.219 -0.37,-0.346 -0.592,-0.555 -1.054,-0.99 -1.177,-1.275 -2.04,-0.438 -0.38,0.369 -0.741,0.772 -1.106,1.195 -0.172,0.199 -0.266,0.536 -0.084,0.829 l 1.17,1.128 c 0.227,0.195 0.365,0.366 0.595,0.556 0.744,0.614 0.936,0.843 1.521,1.393 l 0.909,0.817 c 0.191,0.175 0.364,0.347 0.594,0.555 l 1.197,1.103 c 0.772,0.657 1.412,1.631 2.046,1.031 l 1.684,-1.765 c 0.372,-0.433 0.321,-0.317 0.569,-0.581 0.231,-0.247 0.88,-1.023 1.137,-1.166 0.224,0.1 1.817,1.629 2.145,1.924 l 4.209,3.922 c 0.155,0.126 0.274,0.231 0.403,0.413 z m 2.753,-21.093 c -0.711,0 -1.169,0.441 -1.18,1.145 -0.012,0.776 0,1.564 0,2.342 v 7.021 c 0,0.705 -0.088,0.796 0.169,1.01 0.496,0.411 2.834,2.615 3.065,2.729 C 5.229,-7.228 5.668,-7.687 6.056,-8.105 6.7,-8.799 7.187,-8.75 7.871,-8.708 l 0.003,-11.198 c 0,-0.727 -0.44,-1.187 -1.178,-1.187 z m -9.862,8.306 c 0.244,-0.142 0.867,-0.984 1.368,-1.322 0.573,-0.388 1.341,-0.542 2.074,-0.2 0.352,0.165 0.513,0.332 0.747,0.567 0.203,0.202 0.497,0.398 0.704,0.61 0.128,0.13 0.228,0.19 0.349,0.309 l 1.052,0.932 0.004,-8.015 c 0,-0.741 -0.465,-1.187 -1.2,-1.187 h -3.902 c -0.734,0 -1.199,0.446 -1.199,1.187 0,2.239 -0.044,4.936 0.003,7.119 m -8.675,-1.807 c 0.054,-0.103 0.513,-0.501 0.677,-0.626 0.229,-0.176 0.521,-0.362 0.864,-0.45 1.276,-0.326 2.076,0.686 2.685,1.243 l 2.058,1.864 c 0.047,-2.257 0.003,-5.029 0.003,-7.343 0,-0.732 -0.447,-1.187 -1.18,-1.187 h -3.943 c -0.737,0 -1.177,0.461 -1.177,1.187 -10e-4,1.174 -0.052,4.366 0.013,5.312 m -0.508,18.268 c -1.105,-0.154 -1.767,-0.749 -2.2,-1.437 -0.565,-0.899 -0.429,-2.007 -0.429,-3.174 v -18.066 c 0,-1.018 -0.125,-2.558 0.238,-3.404 0.974,-2.266 3.247,-1.837 5.378,-1.837 1.382,0 21.007,-0.06 21.687,0.027 1.041,0.134 1.796,0.78 2.181,1.43 0.578,0.972 0.435,1.955 0.435,3.169 v 18.065 c 0,1.039 0.122,2.538 -0.235,3.41 C 10.441,2.645 9.748,3.298 8.864,3.571 8.12,3.801 6.271,3.703 5.381,3.703 c -1.332,0 -21.05,0.058 -21.673,-0.029"
                  style="fill:#00569f;fill-opacity:1;fill-rule:evenodd;stroke:none"
                  id="path22" /></g><g
                id="g24"
                transform="translate(43.1821,8.0908)"><path
                  d="m 0,0 0.008,13.819 c 2.763,0 4.867,0.164 6.827,-1.254 C 8.323,11.488 9.314,9.573 9.256,6.887 9.199,4.224 8.219,2.431 6.751,1.294 4.864,-0.169 2.738,0 0,0 m -4.908,-3.967 c 0.4,-0.044 6.966,-0.011 7.542,-0.01 2.324,10e-4 4.428,0.38 6.22,1.321 3.058,1.604 5.521,4.738 5.56,9.543 0.042,5.053 -1.72,8.231 -5.296,9.808 -1.863,0.822 -4.145,1.11 -6.443,1.114 -0.537,0 -7.232,0.043 -7.578,-0.017 z"
                  style="fill:#00569f;fill-opacity:1;fill-rule:evenodd;stroke:none"
                  id="path26" /></g><g
                id="g28"
                transform="translate(85.3105,16.3589)"><path
                  d="m 0,0 c 1.252,0.146 2.253,-0.423 2.749,-1.111 1.342,-1.861 1.253,-7.372 -2.163,-7.81 -1.398,-0.18 -2.247,0.383 -2.814,1.07 C -2.933,-6.998 -3,-6.083 -3,-4.748 c 0,1.304 0.002,2.285 0.625,3.252 C -1.909,-0.774 -1.196,-0.14 0,0 m -7.718,-12.097 0.016,-0.149 4.771,0.001 0.009,1.81 c 0.309,-0.149 0.98,-1.758 3.425,-2.118 3.271,-0.483 5.72,1.152 7.049,3.884 C 9.282,-5.115 9.137,3.679 2.273,3.688 -1.587,3.694 -2.645,1.01 -2.914,0.987 l -0.009,9.798 -4.795,10e-4 z"
                  style="fill:#00569f;fill-opacity:1;fill-rule:evenodd;stroke:none"
                  id="path30" /></g><g
                id="g32"
                transform="translate(64.5615,13.4775)"><path
                  d="M 0,0 C -0.019,0.761 0.528,1.78 0.869,2.216 2.132,3.832 4.281,3.542 5.084,2.455 5.5,1.892 5.787,0.875 5.71,-0.005 Z m 8.792,-8.583 0.003,3.417 c -0.297,-0.056 -2.178,-1.498 -5.436,-1.13 -1.436,0.163 -2.486,0.74 -3.04,1.976 -0.131,0.291 -0.341,1.023 -0.28,1.368 l 10.126,10e-4 c 0,2.326 0.104,4.18 -0.855,6.057 C 8.572,4.55 7.329,5.732 5.513,6.247 3.636,6.778 1.25,6.666 -0.366,5.833 -1.957,5.012 -3.056,3.975 -3.855,2.381 -4.662,0.773 -4.922,-1.502 -4.617,-3.512 c 0.631,-4.16 3.587,-6.179 7.638,-6.227 1.077,-0.013 2.161,0.059 3.182,0.261 0.711,0.14 2.117,0.538 2.589,0.895"
                  style="fill:#00569f;fill-opacity:1;fill-rule:evenodd;stroke:none"
                  id="path34" /></g><g
                id="g36"
                transform="translate(106.8564,23.0249)"><path
                  d="m 0,0 -0.001,-3.357 h -2.52 V -6.896 H 0 v -5.298 c 0,-1.71 -0.117,-3.337 0.572,-4.755 0.559,-1.152 1.523,-1.929 3.078,-2.219 1.205,-0.225 3.735,-0.146 4.629,0.441 v 3.525 c -0.434,-0.123 -1.444,-0.768 -2.518,-0.215 -0.707,0.365 -0.957,1.177 -0.974,2.197 -0.034,2.097 -0.001,4.224 -0.001,6.324 l 3.492,0.001 10e-4,3.526 -3.481,0.012 -0.013,4.709 z"
                  style="fill:#00569f;fill-opacity:1;fill-rule:evenodd;stroke:none"
                  id="path38" /></g><g
                id="g40"
                transform="translate(96.9209,4.1172)"><path
                  d="M 0,0 4.737,-0.001 C 4.82,0.419 4.762,13.908 4.762,15.548 H -0.024 C -0.024,15.28 -0.077,0.3 0,0"
                  style="fill:#00569f;fill-opacity:1;fill-rule:evenodd;stroke:none"
                  id="path42" /></g><g
                id="g44"
                transform="translate(98.7217,27.0195)"><path
                  d="m 0,0 c -1.35,-0.231 -2.502,-1.35 -2.092,-2.998 0.317,-1.27 1.666,-2.12 3.335,-1.828 C 4.58,-4.244 3.873,0.663 0,0"
                  style="fill:#00569f;fill-opacity:1;fill-rule:evenodd;stroke:none"
                  id="path46" /></g></g></g></g></svg>
     `




        myDoc += `<table width='100%' class="tabelaCabecalho">`
        if (dump.info.descricao) {
            var desc1 = dump.info.descricao.replaceAll('\n','<br>')

            myDoc += `<tr>`
            myDoc += `<td colspan=3 style="text-align: center; font-size: 18px; ">${desc1}</td>` 
            myDoc += `</tr>`           
        }       

        var dia_atualiza_erro = ''
        if (dump.info.diaAtualizacaoErro) {
            dia_atualiza_erro = ` - Corrija no formulário:  ${dump.info.diaAtualizacaoErro}` 
        }
        
        myDoc += `<tr><td colspan=3 class="celulaCorrecaoMonetariaTitulo">Correção Monetária</td></tr>`
        if (dump.info.calc_selic) {
            myDoc += `<tr><td colspan=3>Valores atualizados utilizando ${dump.info.nomeIndexador} até ${dump.info.selic_inicio}, após SELIC até ${dump.info.selic_fim} </td></tr>` 
        } else {
            myDoc += `<tr><td colspan=3>Valores atualizados até ${dump.info.dia_atualiza} ${dia_atualiza_erro} utilizando ${dump.info.nomeIndexador}</td></tr>` 
        }

        if (dump.info.indexador > 1000) {
            // escrever resumo de tabela judicial
            let miniTab = '<table class="miniTab">';
            miniTab += '<tr><th>Início</th><th>Fim</th><th style="text-align: left;">Indexador</th></tr>';
            for (let i in dump.info.resumoTJ) {
                let r = dump.info.resumoTJ[i];
                let desc = '';
                if (r.desc) { 
                    desc = r.desc 
                } else  {
                    desc = indexadorMesclavel[ r.indexador ]
                }
                miniTab += `<tr><td>${ calcUtil.mesAno2dia(r.inicio) }</td><td>${ calcUtil.mesAno2dia( r.fim ) }</td><td style='text-align: left;'>${desc}</td></tr>`;
            }
            miniTab += '</table>';

            myDoc += `<tr><td colspan=3><b style='font-size: 10px;'>Composição da tabela de correção monetária:</b><br /><br />${miniTab}</td></tr>`
        }

        myDoc += `</table><br>`

        // escrevendo os valores

        var resumoSoma = {
            valores: { v: 0, c: 0},
            jurosm: { v: 0, c: 0},
            jurosc: { v: 0, c: 0},
            multa: { v: 0, c: 0},
            honorarios: { v: 0, c: 0},
            selic: {v: 0, c: 0},
            total: { v: 0, c: 0} 
        }    
        
        if (dump.info.calc_modo_impressao == 'c') {
            myDoc += `<table width='100%' class="tabelaCalcColunado">`
            myDoc += `<tr class="negrito">`
            myDoc += `<td>Data</td>` 
            myDoc += `<td>Valor original</td>`
            myDoc += `<td>Valor corrigido</td>`
            if (dump.info.calc_jurosm) {
                myDoc += `<td>Juros moratórios</td>`
            }
            if (dump.info.calc_jurosc) {
                myDoc += `<td>Juros compensatórios</td>`
            }
            if (dump.info.calc_multa) {
                myDoc += `<td>Multa</td>`
            }
            if (dump.info.calc_selic) {
                myDoc += `<td>Selic</td>`
            }
            if (dump.info.calc_honorarios) {
                myDoc += `<td>Honorários</td>`
            }
            myDoc += `<td>Total</td>`
            myDoc += `</tr>`   
        } 

        // coloca em ordem cronológica se necessário
        if (dump.info.calc_ordem) {
            dump.lista.sort(function(a, b) {
                let x = calcUtil.dia2yyyymmddInt(a.dia) - calcUtil.dia2yyyymmddInt(b.dia) ;
                return x;
            });

        }

        // agora ordem - primeiro valores, depois custas
       dump.lista.sort(function(a, b) {
            if (a.custas && !b.custas) {
                return 1
            } else if (!a.custas && b.custas) {
                return -1
            } else {
                return 0
            }
        });

        

        for (var lista in dump.lista) {
            var l = dump.lista[lista]

            if (!l.custas) { l.custas = false; }

            // console.log('l.diaErro', l.diaErro)

            if ((l.diaErro==0 || l.diaErro==2) &&  (l.valor != 0) && ((l.custas==false) || (l.custas == true && dump.info.calc_custas)))  {
                if (dump.info.calc_modo_impressao == 'c') {  
                    resumoSoma.valores.v +=Number( l.resultado_atualizacao)
                    resumoSoma.jurosm.v +=Number( l.resultado_jurosm)
                    resumoSoma.jurosc.v +=Number( l.resultado_jurosc)
                    resumoSoma.multa.v +=Number( l.resultado_multa)
                    resumoSoma.honorarios.v +=Number( l.resultado_honorarios)
                    resumoSoma.total.v +=Number( l.resultado_total)
                    var c2 = '' 

                    if (l.desc) {
                        myDoc += `<tr>`
                        myDoc += `<td colspan=10 class="negrito esquerda separaCalc">${l.desc}</td>` 
                        myDoc += `</tr>`           
                    }  else {
                        c2 = 'class="separaCalc"'
                    }
                  
                    myDoc += `<tr  >`
                    myDoc += `<td ${c2}>${l.dia}</td>`
                    myDoc += `<td ${c2}>${calcUtil.formataNum(l.valor,2)}</td>` 
                    myDoc += `<td ${c2}>${calcUtil.formataNum(l.resultado_atualizacao,2)}</td>`
                    if (dump.info.calc_jurosm) {
                        myDoc += `<td ${c2}>${calcUtil.formataNum(l.resultado_jurosm,2)} <span style="font-size:10px;">(${calcUtil.formataNum(l.resultado_jurosm_percentual,2)}%)</span></td>`
                    }
                    if (dump.info.calc_jurosc) {
                        myDoc += `<td ${c2}>${calcUtil.formataNum(l.resultado_jurosc,2)} <span style="font-size:10px;">(${calcUtil.formataNum(l.resultado_jurosc_percentual,2)}%)</span></td>`
                    }
                    if (dump.info.calc_multa) {
                        myDoc += `<td ${c2}>${calcUtil.formataNum(l.resultado_multa,2)}</td>`
                    }
                    if (dump.info.calc_selic) {
                        myDoc += `<td ${c2}>${calcUtil.formataNum(l.resultado_selic,2)}</td>`
                    }
                    if (dump.info.calc_honorarios) {
                        myDoc += `<td ${c2}>${calcUtil.formataNum(l.resultado_honorarios,2)}</td>`
                    }
                    myDoc += `<td ${c2}>${calcUtil.formataNum(l.resultado_total,2)}</td>`
                    myDoc += `</tr>`           
                       

                } else {

                    if (!escreveuCustas && l.custas) {
                        myDoc += `<h2>Custas</h2><br/>`
                        escreveuCustas = true
                    }

                    if (typeof dump.info.calc_abater_valores==='undefined') {
                        dump.info.calc_abater_valores = true
                    }

                    if (!escreveuDeducoes && dump.info.calc_abater_valores && l.valor < 0) {


                        // escrever resumo das multas e honorários
                        myDoc += `<table width='100%' class="nTabela1">`

                        myDoc += `<tr>`
                        myDoc += `<td colspan=3 class="negrito esquerda">Valores atualizados</td>`
                        myDoc += `<td class="direita" style='width: 140px;'>${calcUtil.formataNum(dump.info.soma_resultado_atualizacao,2)}</td>` 
                        myDoc += `</tr>`

                        myDoc += `<tr>`
                        myDoc += `<td colspan=3 class="negrito esquerda">Honorários</td>`
                        myDoc += `<td class="direita" style='width: 140px;'>${calcUtil.formataNum(dump.info.soma_resultado_honorarios,2)}</td>` 
                        myDoc += `</tr>`
                        
                        myDoc += `<tr>`
                        myDoc += `<td colspan=3 class="negrito esquerda">Honorários de sucumbência</td>`
                        myDoc += `<td class="direita">${calcUtil.formataNum(dump.info.valor_honorarios_sucumbencia,2)}</td>` 
                        myDoc += `</tr>`

                        myDoc += `<tr>`
                        myDoc += `<td colspan=3 class="negrito esquerda">Multa art 523 NCPC</td>`
                        myDoc += `<td class="direita">${calcUtil.formataNum(dump.info.valor_multa_ncpc,2)}</td>` 
                        myDoc += `</tr>`

                        myDoc += `</table><br />`

                        myDoc += `<h2>Deduções / abatimentos</h2><br/>`
                        escreveuDeducoes = true

                    }
                    
                    myDoc += `<table width='100%' class="nTabela1">`

                    if (l.desc) {
                        myDoc += `<tr>`
                        myDoc += `<td colspan=3 class="negrito esquerda">${l.desc}</td>` 
                        myDoc += `</tr>`           
                    }

                    if (dump.info.calc_modo_impressao == 'e' || dump.info.calc_modo_impressao == 'm') {
                        myDoc += `<tr>`
                        myDoc += `<td style='width: 80px;'>Valor Orig.</td>` 
                        myDoc += `<td style='width: 350px;'>valor em ${l.dia} </td>` 
                        myDoc += `<td style='width: 350px;'></td>`
                        myDoc += `<td style='width: 140px;'>${calcUtil.formataNum(l.valor,2)}</td>`
                        myDoc += `</tr>`

                        if (l.diaErro != 4) {
                            if (dump.info.modo_indexador == 'multi' || dump.info.multi_interno ) {
                                for (var m in l.memoriaSimplesMAM) {
                                    var lm = l.memoriaSimplesMAM[m]
                                    myDoc += `<tr>`
                                    myDoc += `<td>Corr.Mon.</td>` 
                                    myDoc += `<td>de ${lm.dia}: ${lm.indexador} </td>` 
                                    myDoc += `<td>${lm.memoriaSimples}</td>`
                                    myDoc += `<td>${calcUtil.formataNum(lm.resultado,2)}</td>`
                                    myDoc += `</tr>`
                                }
                            } else {
                                myDoc += `<tr>`
                                myDoc += `<td>Corr.Mon.</td>` 

                                let nomeTab = ''
                                if (dump.info.indexador < 1000) {
                                    nomeTab = ': '+dump.info.nomeIndexador
                                }

                                if (l.mostrarSelic) {
                                    myDoc += `<td>de ${l.dia} a ${l.selic_ini}${nomeTab} </td>`
                                } else {
                                    myDoc += `<td>de ${l.dia} a ${dump.info.dia_atualiza}${nomeTab}</td>`
                                }
                                
                                myDoc += `<td>${l.memoriaSimples}</td>`
                                myDoc += `<td>${calcUtil.formataNum(l.resultado_atualizacao,2)}</td>`
                                myDoc += `</tr>`
                            }
                        }
                    }

                    // memoria 
                    if (dump.info.calc_modo_impressao == 'm') {
                        myDoc += `<tr><td colspan=4 style="text-align: center;" >`
                        myDoc += `<table  width='70%'  class="tabelaMesAMes">`
                        myDoc += `<tr><td>Data</td><td>Memória de cálculo</td><td>Valor</td>` 

                        if (dump.info.calc_jurosc) {
                            myDoc += `<td colspan=1>Juros Compensatórios</td>`
                        }
                        if (dump.info.calc_jurosm) {
                            myDoc += `<td colspan=1>Juros Moratórios</td>`
                        }

                        if (dump.info.calc_jurosc || dump.info.calc_jurosm) {
                            myDoc += `<td>Total</td></tr>`
                        }
                        
                        
                        for (var m in l.memoria) {
                            var class1 = "esquerda"
                            var m1 = l.memoria[m]
                            let total1 = Number(m1.valor)
                            myDoc += `<tr>`
                            if (dump.info.modo_indexador == 'multi' || dump.info.multi_interno ) {
                                myDoc += `<td style="width: 130px;" class="${class1}">${m1.indice}</td>`
                            }
                            myDoc += `<td style="width: 80px;" class="${class1}">${m1.dia}</td>` 
                            myDoc += `<td  class="${class1}">${m1.str}</td>`
                            myDoc += `<td style="width: 120px;text-align: right;">${calcUtil.formataNum(m1.valor,2)}</td>`

                            if (dump.info.calc_jurosc) {
                                myDoc += `<td class="${class1}">${calcUtil.formataNum(m1.jurosc_v,2)} (${calcUtil.formataNum(m1.jurosc_p,2)}%)</td>`
                                total1 += Number(m1.jurosc_v)
                            }
                            if (dump.info.calc_jurosm) {
                                myDoc += `<td class="${class1}">${calcUtil.formataNum(m1.jurosm_v,2)} (${calcUtil.formataNum(m1.jurosm_p,2)}%)</td>`
                                total1 += Number(m1.jurosm_v)
                            }
                             
                            if (dump.info.calc_jurosc || dump.info.calc_jurosm) {
                                myDoc += `<td style="width: 120px;text-align: right;">${calcUtil.formataNum(total1,2)}</td>`
                            }
                            myDoc += `</tr>`
                        }
                        
                        myDoc += `</table></td></tr>`
                    }

                    resumoSoma.valores.v +=Number( l.resultado_atualizacao)

                    // multas, honorarios, juros
                    let descJurosM = ''
                    for (var item in l.jurosm_desc) {
                        if (descJurosM != '') descJurosM += '<br /> '
                        descJurosM += l.jurosm_desc[item]
                    }

                    if (dump.info.calc_jurosm && l.diaErro != 4 && !escreveuDeducoes) {
                        myDoc += `<tr>`
                        myDoc += `<td>Juros Morat.</td>` 
                        myDoc += `<td>${descJurosM}</td>`
                        myDoc += `<td>${calcUtil. moeda(dump.info.dia_atualiza ) } ${ calcUtil.formataNum(l.base_jurosm,2) } x ${ calcUtil.formataNum(l.resultado_jurosm_percentual,2) }% </td>`
                        myDoc += `<td>${calcUtil.formataNum(l.resultado_jurosm,2)}</td>`
                        myDoc += `</tr>`
                        resumoSoma.jurosm.v += Number(l.resultado_jurosm)
                    }

                    descJurosM = ''
                    for (var item in l.jurosc_desc) {
                        if (descJurosM != '') descJurosM += '<br /> '
                        descJurosM += l.jurosc_desc[item]
                    }

                    if (dump.info.calc_jurosc && l.diaErro != 4 && !escreveuDeducoes) {
                        myDoc += `<tr>`
                        myDoc += `<td>Juros Compens.</td>` 
                        myDoc += `<td>${descJurosM}</td>`
                        myDoc += `<td>${calcUtil. moeda(dump.info.dia_atualiza ) } ${ calcUtil.formataNum(l.resultado_atualizacao,2) } x ${ calcUtil.formataNum(l.resultado_jurosc_percentual,2) }% </td>`
                        myDoc += `<td>${calcUtil.formataNum(l.resultado_jurosc,2)}</td>`
                        myDoc += `</tr>`
                        resumoSoma.jurosc.v += Number(l.resultado_jurosc)
                    }

                    if (dump.info.calc_multa && l.diaErro != 4 && !escreveuDeducoes) {
                        if (typeof dump.info.multa === 'undefined') {
                            dump.multa = {"percentual":"1","tipo_calculo":"p","multa_sobre_juros":false}
                        }
                        myDoc += `<tr>`
                        myDoc += `<td>Multa </td><td></td>` 
                        myDoc += `<td>${ calcUtil.moeda(dump.info.dia_atualiza ) } ${ calcUtil.formataNum(l.resultado_multa_base,2) } x ${ calcUtil.formataNum( l.resultado_multa_percentual,2) }%</td>`
                        myDoc += `<td>${calcUtil.formataNum(l.resultado_multa,2)}</td>`
                        myDoc += `</tr>`
                        resumoSoma.multa.v += Number(l.resultado_multa)
                    }

                    // if (dump.info.calc_selic) {
                    if (l.mostrarSelic) {
                        myDoc += `<tr>`
                        myDoc += `<td>Selic</td>` 
                        // let s_base = `R$ ${calcUtil.formataNum(l.base,2)} x ${calcUtil.formataNum(l.resultado_selic_percentual,2)}%`

                        myDoc += `<td>de ${l.selic_ini} a ${l.selic_fim}: ${ calcUtil.formataNum(l.resultado_selic_percentual,2)}% </td>`
                        myDoc += `<td>R$ ${ calcUtil.formataNum(l.base,2) } x ${ calcUtil.formataNum(l.resultado_selic_percentual,2)}%</td>`
                        myDoc += `<td>${calcUtil.formataNum(l.resultado_selic,2)}</td>`
                        myDoc += `</tr>`
                        resumoSoma.selic.v += Number(l.resultado_selic)

                        // memoria 
                        if (dump.info.calc_modo_impressao == 'm') {
                            myDoc += `<tr><td colspan=4 style="text-align: center;" >`
                            myDoc += `<table  width='70%'  class="tabelaMesAMes">`
                          
                            for (var m in l.resultado_selic_mesAmes) {
                                var class1 = "esquerda"
                                var m1 = l.resultado_selic_mesAmes[m]
                                myDoc += `<tr>`
                                myDoc += `<td style="width: 80px;" class="${class1}">${m1.dia}</td>` 
                                myDoc += `<td style="width: 80%;" class="${class1}">${m1.str}</td>`
                                myDoc += `<td style="width: 120px;text-align: right;">${calcUtil.formataNum(m1.valor,2)}</td>`
                                myDoc += `</tr>`
                            }
                            
                            myDoc += `</table></td></tr>`
                        }
                    }

                    

                    if (dump.info.calc_honorarios && !escreveuDeducoes) {
                        if (typeof dump.info.honorarios === 'undefined') {
                            dump.honorarios = {"modo":"p","valor":10}
                        }
                        myDoc += `<tr>`
                        myDoc += `<td>Honorários</td><td></td>` 
                        if (dump.info.honorarios.modo == 'p') {
                            myDoc += `<td>${calcUtil.formataNum(l.honorarios_base,2)} x ${calcUtil.formataNum(dump.info.honorarios.valor,2)}%</td>`
                            myDoc += `<td>${calcUtil.formataNum(l.resultado_honorarios,2)}</td>`
                        } else {
                            myDoc += `<td>Honorários</td>` 
                            myDoc += `<td>${calcUtil.formataNum(l.resultado_honorarios,2)}</td>`  
                        }
                        resumoSoma.honorarios.v += Number(l.resultado_honorarios)
                        
                        myDoc += `</tr>`
                    }


                    if (dump.info.calc_selic || dump.info.calc_honorarios || dump.info.calc_multa || dump.info.calc_jurosm || dump.info.calc_jurosc) {
                        myDoc += `<tr class='negrito'>`
                        myDoc += `<td>Subtotal</td>` 
                        myDoc += `<td></td><td></td>` 
                        myDoc += `<td>${calcUtil.formataNum(l.resultado_total,2)}</td>`  
                        
                        myDoc += `</tr>`
                        resumoSoma.total.v += Number(l.resultado_total) 
                    }

                    myDoc += `</table><br />`
                } 
            }
        }

        if (dump.info.calc_modo_impressao != 'c') {
            let soma_desatualiza = '<table>'
            let soma_desatualiza2 = '<table>'
            let soma_desatualiza3 = '<table>'

            for (let w = 0; w <= 6; w++) {
                if (dump.info.soma_resultado_desatualizado[w].valor != 0) {
                    soma_desatualiza += `<tr>`
                    soma_desatualiza += `<td>${dump.info.soma_resultado_desatualizado[w].moeda} ${calcUtil.formataNum(dump.info.soma_resultado_desatualizado[w].valor,2)}</td>`
                    soma_desatualiza += `</tr>`
                }
                if (dump.info.soma_custas_desatualizado[w] && dump.info.soma_custas_desatualizado[w].valor != 0) {
                    soma_desatualiza2 += `<tr>`
                    soma_desatualiza2 += `<td>${dump.info.soma_custas_desatualizado[w].moeda} ${calcUtil.formataNum(dump.info.soma_custas_desatualizado[w].valor,2)}</td>`
                    soma_desatualiza2 += `</tr>`
                }
                if (dump.info.soma_custas_desatualizado[w] && dump.info.soma_custas_desatualizado[w].valor+dump.info.soma_resultado_desatualizado[w].valor != 0) {
                    soma_desatualiza3 += `<tr>`
                    soma_desatualiza3 += `<td>${dump.info.soma_custas_desatualizado[w].moeda} ${calcUtil.formataNum(dump.info.soma_custas_desatualizado[w].valor+dump.info.soma_resultado_desatualizado[w].valor,2)}</td>`
                    soma_desatualiza3 += `</tr>`
                }
            }
            soma_desatualiza += '</table>'
            soma_desatualiza2 += '</table>'
            soma_desatualiza3 += '</table>'

            myDoc += `<table width='100%' class="tabelaResumo" >`
            myDoc += `<tr><td colspan=4 class="celulaCorrecaoMonetariaTitulo">Resumo</td></tr>`

            myDoc += `<tr class="negrito">` 
            myDoc += `<td></td>`
            myDoc += `<td>Valores</td>` // valores
            myDoc += `<td>Custas</td>` // custas
            myDoc += `<td>Total</td>` // total
            myDoc += `</tr>` 

            myDoc += `<tr  >` 
            myDoc += `<td class="esquerda tracejadoTB">Valores sem atualização</td>`
            myDoc += `<td class="tracejadoTB">${ soma_desatualiza }</td>` // valores
            myDoc += `<td class="tracejadoTB">${ soma_desatualiza2 }</td>` // custas
            myDoc += `<td class="tracejadoTB">${ soma_desatualiza3 }</td>` // total
            myDoc += `</tr>` 


            myDoc += `<tr>` 
            myDoc += `<td class="esquerda">Valores atualizados</td>`
            myDoc += `<td>${calcUtil.formataNum(dump.info.soma_resultado_atualizacao,2)}</td>` // valores
            myDoc += `<td>${calcUtil.formataNum(dump.info.soma_custas_atualizacao,2)}</td>` // custas
            myDoc += `<td>${calcUtil.formataNum(dump.info.soma_resultado_atualizacao+dump.info.soma_custas_atualizacao,2)}</td>` // total
            myDoc += `</tr>` 

            if (resumoSoma.jurosm.v != 0) {
                myDoc += `<tr>` 
                myDoc += `<td class="esquerda">Juros moratórios</td>`
                myDoc += `<td>${calcUtil.formataNum(dump.info.soma_resultado_jurosm,2)}</td>` // valores
                myDoc += `<td>${calcUtil.formataNum(dump.info.soma_custas_jurosm,2)}</td>` // custas
                myDoc += `<td>${calcUtil.formataNum(dump.info.soma_resultado_jurosm+dump.info.soma_custas_jurosm,2)}</td>` // total
                myDoc += `</tr>` 
            }

            if (resumoSoma.jurosc.v != 0) {
                myDoc += `<tr>` 
                myDoc += `<td class="esquerda">Juros compensatórios</td>`
                myDoc += `<td>${calcUtil.formataNum(dump.info.soma_resultado_jurosc,2)}</td>` // valores
                myDoc += `<td>${calcUtil.formataNum(dump.info.soma_custas_jurosc,2)}</td>` // custas
                myDoc += `<td>${calcUtil.formataNum(dump.info.soma_resultado_jurosc+dump.info.soma_custas_jurosc,2)}</td>` // total
                myDoc += `</tr>` 
            }

            if (resumoSoma.multa.v != 0) {
                myDoc += `<tr>` 
                myDoc += `<td class="esquerda">Multa</td>`
                myDoc += `<td>${calcUtil.formataNum(dump.info.soma_resultado_multa,2)}</td>` // valores
                myDoc += `<td>${calcUtil.formataNum(dump.info.soma_custas_multa,2)}</td>` // custas
                myDoc += `<td>${calcUtil.formataNum(dump.info.soma_resultado_multa+dump.info.soma_custas_multa,2)}</td>` // total
                myDoc += `</tr>` 
            }

            if (resumoSoma.selic.v != 0) {
                myDoc += `<tr>` 
                myDoc += `<td class="esquerda">Selic</td>`
                myDoc += `<td>${calcUtil.formataNum(dump.info.soma_resultado_selic,2)}</td>` // valores
                myDoc += `<td>${calcUtil.formataNum(dump.info.soma_custas_selic,2)}</td>` // custas
                myDoc += `<td>${calcUtil.formataNum(dump.info.soma_resultado_selic+dump.info.soma_custas_selic,2)}</td>` // total
                myDoc += `</tr>` 
            }


            // if (resumoSoma.honorarios.v > 0) {
            if (dump.info.soma_resultado_honorarios != 0) {
                myDoc += `<tr>` 
                myDoc += `<td class="esquerda">Honorários</td>`
                myDoc += `<td>${calcUtil.formataNum(dump.info.soma_resultado_honorarios,2)}</td>` // valores
                myDoc += `<td>${calcUtil.formataNum(dump.info.soma_custas_honorarios,2)}</td>` // custas
                myDoc += `<td>${calcUtil.formataNum(dump.info.soma_resultado_honorarios+dump.info.soma_custas_honorarios,2)}</td>` // total
                myDoc += `</tr>` 
            }

            if (typeof dump.info.valor_honorarios_sucumbencia  !== 'undefined' && dump.info.valor_honorarios_sucumbencia > 0) {
                var s1 = ''
                if (dump.info.sucumbencias.modo == 'p') {
                    s1 = `(${calcUtil.formataNum(dump.info.sucumbencias.valor,2)}%)`
                }

                myDoc += `<tr>` 
                myDoc += `<td class="esquerda">Honorários de sucumbência ${s1}</td>`
                myDoc += `<td>-</td>` // valores
                myDoc += `<td>-</td>` // custas
                myDoc += `<td>${calcUtil.formataNum(dump.info.valor_honorarios_sucumbencia,2)}</td>` // total
                myDoc += `</tr>` 
            }

            if (typeof dump.info.valor_multa_ncpc !== 'undefined' &&  dump.info.valor_multa_ncpc > 0) {
                myDoc += `<tr>` 
                myDoc += `<td class="esquerda">Multa do art. 523 NCPC</td>`
                myDoc += `<td>-</td>` // valores
                myDoc += `<td>-</td>` // custas
                myDoc += `<td>${calcUtil.formataNum(dump.info.valor_multa_ncpc,2)}</td>` // total
                myDoc += `</tr>` 
            }


            

            if (dump.info.calc_multa_ncpc && dump.info.multa523.honorarios523_a_parte &&  dump.info.valor_honorarios_ncpc > 0) {
                myDoc += `<tr>` 
                myDoc += `<td class="esquerda">Honorários ref. a multa art. 523 NCPC</td>`
                myDoc += `<td>-</td>` // valores
                myDoc += `<td>-</td>` // custas
                myDoc += `<td>${calcUtil.formataNum(dump.info.valor_honorarios_ncpc,2)}</td>` // total
                myDoc += `</tr>` 
            }

            if (dump.info.calc_abater_valores) {
                myDoc += `<tr>` 
                myDoc += `<td class="esquerda">Deduções / abatimentos</td>`
                myDoc += `<td>${calcUtil.formataNum(dump.info.soma_deducoes_atualizacao+dump.info.soma_deducoes_selic,2)}</td>` // valores
                myDoc += `<td>0,00</td>` // custas
                myDoc += `<td>${calcUtil.formataNum(dump.info.soma_deducoes_atualizacao+dump.info.soma_deducoes_selic,2)}</td>` // total
                myDoc += `</tr>` 
            }

            myDoc += `<tr class="negrito">` 
            myDoc += `<td class="esquerda">Total</td>`
            myDoc += `<td>${calcUtil.formataNum(dump.info.soma_final_resultado,2)}</td>` // valores
            myDoc += `<td>${calcUtil.formataNum(dump.info.soma_final_custas,2)}</td>` // custas
            myDoc += `<td>${calcUtil.formataNum(dump.info.totalzao,2)}</td>` // total
            myDoc += `</tr>` 

            myDoc += `</table><br>`
        } else {
            var colSpan = 3
            var maisUmTotal = (typeof dump.info.valor_honorarios_sucumbencia  !== 'undefined' && dump.info.valor_honorarios_sucumbencia > 0)  || (typeof dump.info.valor_multa_ncpc !== 'undefined' &&  dump.info.valor_multa_ncpc > 0)
            myDoc += `<tr class="negrito">`
            if (maisUmTotal) {
                myDoc += `<td class="separaCalc esquerda">Subtotal</td>`
            } else {
                myDoc += `<td class="separaCalc esquerda">Total</td>`
            }
             
            myDoc += `<td class="separaCalc"></td>`
            myDoc += `<td class="separaCalc">${calcUtil.formataNum(resumoSoma.valores.v,2)}</td>`
            if (dump.info.calc_jurosm) { 
                myDoc += `<td class="separaCalc">${calcUtil.formataNum(resumoSoma.jurosm.v,2)}</td>`
                colSpan++
            }
            if (resumoSoma.jurosc.v > 0) { 
                myDoc += `<td class="separaCalc">${calcUtil.formataNum(resumoSoma.jurosc.v,2)}</td>`
                colSpan++
            }
            if (resumoSoma.multa.v > 0) {
                myDoc += `<td class="separaCalc">${calcUtil.formataNum(resumoSoma.multa.v,2)}</td>`
                colSpan++
            }
            if (dump.info.soma_resultado_selic > 0) {
                myDoc += `<td class="separaCalc">${calcUtil.formataNum(dump.info.soma_resultado_selic,2)}</td>`
                colSpan++
            }
            if (resumoSoma.honorarios.v > 0) {
                myDoc += `<td class="separaCalc">${calcUtil.formataNum(resumoSoma.honorarios.v,2)}</td>`
                colSpan++
            }
            myDoc += `<td class="separaCalc">${calcUtil.formataNum(resumoSoma.total.v,2)}</td>`
            myDoc += `</tr>`     
            
            if (typeof dump.info.valor_multa_ncpc !== 'undefined' &&  dump.info.valor_multa_ncpc > 0) {
                myDoc += `<tr>` 
                myDoc += `<td class="esquerda" colspan=${colSpan}>Multa do art. 523 NCPC</td>`
                myDoc += `<td>${calcUtil.formataNum(dump.info.valor_multa_ncpc,2)}</td>` // total
                myDoc += `</tr>` 
            }

            if (dump.info.calc_multa_ncpc && dump.info.multa523.honorarios523_a_parte &&  dump.info.valor_honorarios_ncpc > 0) {
                myDoc += `<tr>` 
                myDoc += `<td class="esquerda"colspan=${colSpan}>Honorários ref. a multa art. 523 NCPC</td>`
                myDoc += `<td>${calcUtil.formataNum(dump.info.valor_honorarios_ncpc,2)}</td>` // total
                myDoc += `</tr>` 
            }


            if (typeof dump.info.valor_honorarios_sucumbencia  !== 'undefined' && dump.info.valor_honorarios_sucumbencia > 0) {
                var s1 = ''
                if (dump.info.sucumbencias.modo == 'p') {
                    s1 = `(${calcUtil.formataNum(dump.info.sucumbencias.valor,2)}%)`
                }

                myDoc += `<tr>` 
                myDoc += `<td class="esquerda" colspan=${colSpan}>Honorários de sucumbência ${s1}</td>`
                myDoc += `<td>${calcUtil.formataNum(dump.info.valor_honorarios_sucumbencia,2)}</td>` // total
                myDoc += `</tr>` 
            }

            if (maisUmTotal) {
                myDoc += `<tr style="font-weight: bold;">` 
                myDoc += `<td class="esquerda" colspan=${colSpan}>Total</td>`
                myDoc += `<td>${calcUtil.formataNum(dump.info.totalzao,2)}</td>` // total
                myDoc += `</tr>` 
            }

            myDoc += `</table><br>`
        }

        myDoc += `<script>window.print();</script>`

        return myDoc;
    }

 }
  