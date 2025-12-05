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
    31: 'Selic + 1% (RFB)',
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
    montaCalc ( dump, parceiro ) {
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

        if (typeof dump.info.calc_abater_valores==='undefined') {
            dump.info.calc_abater_valores = true
        } 
        
        if (dump.info.calc_abater_valores) {
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

        if (!parceiro) {
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
        } else {


    
        myDoc += `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="140" viewBox="0 0 488 124" enable-background="new 0 0 488 124" xml:space="preserve">
<path fill="#FEFEFE" opacity="1.000000" stroke="none" 
	d="
M407.000000,125.000000 
	C271.333374,125.000000 136.166748,125.000000 1.000091,125.000000 
	C1.000060,83.666718 1.000060,42.333439 1.000030,1.000118 
	C163.666565,1.000079 326.333130,1.000079 488.999756,1.000039 
	C488.999847,42.333218 488.999847,83.666435 488.999939,124.999832 
	C461.833344,125.000000 434.666656,125.000000 407.000000,125.000000 
M113.375610,79.123383 
	C100.671188,57.332928 87.966766,35.542473 75.098793,13.471506 
	C62.813511,29.728487 60.031918,64.236305 78.399574,89.658554 
	C92.089539,108.606506 123.356834,124.568291 136.306870,118.529747 
	C128.786255,105.574905 121.285278,92.653900 113.375610,79.123383 
M282.737152,106.062943 
	C282.737152,79.485092 282.737152,52.907242 282.737152,26.367647 
	C277.909821,26.367647 273.522430,26.367647 268.671570,26.367647 
	C268.671570,36.732380 268.671570,46.743137 268.671570,57.142155 
	C257.302216,47.273651 242.186264,47.151138 231.915421,56.436291 
	C221.170486,66.150017 219.550964,85.139885 228.510422,97.104164 
	C233.371384,103.595383 239.962570,107.149826 247.995361,107.884987 
	C255.942856,108.612358 262.856171,106.029633 268.766174,100.210258 
	C268.953186,102.775650 269.093109,104.695427 269.238953,106.696014 
	C273.769135,106.696014 277.911682,106.696014 282.737152,106.062943 
M202.688049,50.781982 
	C197.502502,50.369526 201.333054,55.257359 199.277527,56.699516 
	C186.490540,44.977905 169.690872,49.524784 162.176483,57.010929 
	C151.828903,67.319618 150.692749,86.100677 159.954025,97.787315 
	C164.286224,103.254044 169.970413,106.517876 176.790359,107.621574 
	C185.459335,109.024506 193.112442,106.646408 199.690140,100.203346 
	C199.870316,102.721970 200.007126,104.634315 200.138855,106.475464 
	C204.849960,106.475464 209.243546,106.475464 213.492050,106.475464 
	C213.492050,87.734718 213.492050,69.364220 213.492050,50.781269 
	C209.955185,50.781269 206.798203,50.781269 202.688049,50.781982 
M465.550049,52.809982 
	C453.560150,47.448986 442.002808,48.082668 431.855286,56.645000 
	C422.188965,64.801315 420.142487,75.814102 423.377838,87.582916 
	C426.559631,99.156708 434.833130,105.564445 446.520660,107.628036 
	C458.552887,109.752487 471.526733,104.401512 476.493591,95.182831 
	C473.640900,93.003082 470.756989,90.799461 467.939087,88.646301 
	C455.273438,99.178627 439.524506,96.770683 437.079437,83.584480 
	C451.380646,83.584480 465.578888,83.584480 479.735535,83.584480 
	C481.141449,70.330536 477.727814,59.888393 465.550049,52.809982 
M57.249317,54.172501 
	C57.037426,51.687729 56.825531,49.202957 56.613640,46.718185 
	C56.015919,46.566086 55.418201,46.413990 54.820480,46.261890 
	C40.727200,70.444580 26.633917,94.627274 12.495783,118.886925 
	C13.844508,119.547813 14.144382,119.827888 14.434062,119.817719 
	C36.389061,119.046799 54.135536,109.796806 67.984436,92.941956 
	C68.722565,92.043617 68.670113,89.705276 68.028275,88.586578 
	C62.045704,78.159187 58.596157,66.969643 57.249317,54.172501 
M380.869904,54.315113 
	C371.101959,63.757236 373.315063,76.284721 385.895081,81.446335 
	C390.325562,83.264168 395.277008,83.820831 399.688293,85.673210 
	C401.741486,86.535370 404.505890,89.246483 404.356232,90.882385 
	C404.183380,92.771683 401.448486,95.193886 399.307892,95.988274 
	C393.496307,98.144951 389.715454,96.037277 385.514435,89.423370 
	C381.448883,89.423370 377.505157,89.423370 373.357544,89.423370 
	C373.737427,96.888847 377.432190,101.850777 383.611969,105.033806 
	C391.342865,109.015800 399.347961,108.901665 407.307831,105.813751 
	C414.576294,102.994072 418.833374,97.047211 418.745117,90.363663 
	C418.651764,83.294800 414.317505,77.723511 406.499115,75.097252 
	C402.408295,73.723083 398.139038,72.888657 394.010376,71.615746 
	C391.237701,70.760910 388.422363,69.508682 388.972809,65.848816 
	C389.552032,61.997746 392.580780,60.351269 395.896088,61.007286 
	C398.471832,61.516960 400.742310,63.642242 403.104431,65.119904 
	C403.971008,65.662010 404.682709,66.924500 405.513519,66.969826 
	C409.253998,67.173866 413.011871,67.058838 416.965759,67.058838 
	C416.526062,59.373329 413.183075,54.370377 406.698090,51.770420 
	C397.998199,48.282463 389.484985,48.519222 380.869904,54.315113 
M322.249939,75.735168 
	C320.689636,79.799278 319.129364,83.863396 317.241730,88.780136 
	C316.243866,86.392014 315.585632,84.908180 314.998535,83.396713 
	C311.207886,73.637367 307.489838,63.849041 303.584717,54.135857 
	C303.060547,52.832092 301.695435,51.044403 300.587006,50.943848 
	C296.414917,50.565342 292.187897,50.792000 287.323914,50.792000 
	C294.270691,67.465866 300.838531,83.243088 307.417358,99.015739 
	C310.724304,106.944084 310.735504,106.793671 319.502502,106.923729 
	C322.475830,106.967834 323.871552,106.026619 325.002197,103.287949 
	C331.787079,86.853180 338.776642,70.502960 345.671143,54.113277 
	C346.073364,53.157192 346.244019,52.103710 346.609375,50.780663 
	C342.668121,50.780663 339.156799,51.022942 335.695892,50.708908 
	C332.566315,50.424938 331.325989,51.782642 330.360321,54.524654 
	C327.932129,61.419750 325.203064,68.208893 322.249939,75.735168 
M366.697815,64.510773 
	C366.697815,60.058834 366.697815,55.606899 366.697815,51.111832 
	C361.738434,51.111832 357.352356,51.111832 353.033600,51.111832 
	C353.033600,69.851448 353.033600,88.249496 353.033600,106.601135 
	C357.654419,106.601135 361.927032,106.601135 366.697723,106.601135 
	C366.697723,92.740013 366.697723,79.123329 366.697815,64.510773 
M364.097504,27.069313 
	C362.829102,26.722370 361.576630,26.161699 360.289551,26.065866 
	C355.009644,25.672739 350.580719,29.510197 350.498199,34.406773 
	C350.412445,39.498112 355.183380,44.031479 360.469696,42.821926 
	C363.273193,42.180458 366.444122,39.839355 367.892456,37.357162 
	C370.052490,33.655293 368.229065,30.017551 364.097504,27.069313 
z"/>
<path fill="#EC662E" opacity="1.000000" stroke="none" 
	d="
M113.579956,79.428146 
	C121.285278,92.653900 128.786255,105.574905 136.306870,118.529747 
	C123.356834,124.568291 92.089539,108.606506 78.399574,89.658554 
	C60.031918,64.236305 62.813511,29.728487 75.098793,13.471506 
	C87.966766,35.542473 100.671188,57.332928 113.579956,79.428146 
z"/>
<path fill="#313131" opacity="1.000000" stroke="none" 
	d="
M282.395691,106.379478 
	C277.911682,106.696014 273.769135,106.696014 269.238953,106.696014 
	C269.093109,104.695427 268.953186,102.775650 268.766174,100.210258 
	C262.856171,106.029633 255.942856,108.612358 247.995361,107.884987 
	C239.962570,107.149826 233.371384,103.595383 228.510422,97.104164 
	C219.550964,85.139885 221.170486,66.150017 231.915421,56.436291 
	C242.186264,47.151138 257.302216,47.273651 268.671570,57.142155 
	C268.671570,46.743137 268.671570,36.732380 268.671570,26.367647 
	C273.522430,26.367647 277.909821,26.367647 282.737152,26.367647 
	C282.737152,52.907242 282.737152,79.485092 282.395691,106.379478 
M259.084442,63.955975 
	C249.078339,60.524525 240.229828,64.562935 237.500534,73.806740 
	C234.750153,83.122002 240.203461,92.570351 249.485489,94.571732 
	C256.775391,96.143570 264.518585,92.046028 267.408508,85.087250 
	C270.724976,77.101311 267.917053,69.377632 259.084442,63.955975 
z"/>
<path fill="#323232" opacity="1.000000" stroke="none" 
	d="
M203.164642,50.781624 
	C206.798203,50.781269 209.955185,50.781269 213.492050,50.781269 
	C213.492050,69.364220 213.492050,87.734718 213.492050,106.475464 
	C209.243546,106.475464 204.849960,106.475464 200.138855,106.475464 
	C200.007126,104.634315 199.870316,102.721970 199.690140,100.203346 
	C193.112442,106.646408 185.459335,109.024506 176.790359,107.621574 
	C169.970413,106.517876 164.286224,103.254044 159.954025,97.787315 
	C150.692749,86.100677 151.828903,67.319618 162.176483,57.010929 
	C169.690872,49.524784 186.490540,44.977905 199.277527,56.699516 
	C201.333054,55.257359 197.502502,50.369526 203.164642,50.781624 
M199.102722,74.626167 
	C196.164291,66.252281 189.841354,61.876884 181.811554,62.660873 
	C174.506012,63.374149 168.762161,68.925156 167.946533,76.153542 
	C167.171738,83.020035 169.321487,88.743263 175.267151,92.487282 
	C180.849197,96.002327 186.735916,95.805550 192.227570,92.246071 
	C198.305939,88.306290 200.450562,82.493202 199.102722,74.626167 
z"/>
<path fill="#333333" opacity="1.000000" stroke="none" 
	d="
M465.892761,52.958038 
	C477.727814,59.888393 481.141449,70.330536 479.735535,83.584480 
	C465.578888,83.584480 451.380646,83.584480 437.079437,83.584480 
	C439.524506,96.770683 455.273438,99.178627 467.939087,88.646301 
	C470.756989,90.799461 473.640900,93.003082 476.493591,95.182831 
	C471.526733,104.401512 458.552887,109.752487 446.520660,107.628036 
	C434.833130,105.564445 426.559631,99.156708 423.377838,87.582916 
	C420.142487,75.814102 422.188965,64.801315 431.855286,56.645000 
	C442.002808,48.082668 453.560150,47.448986 465.892761,52.958038 
M453.228760,61.882282 
	C442.959686,61.940720 437.301453,66.196548 437.452911,73.552124 
	C446.939087,73.552124 456.418304,73.552124 465.946228,73.552124 
	C464.689270,66.362907 461.742859,63.553455 453.228760,61.882282 
z"/>
<path fill="#EC662E" opacity="1.000000" stroke="none" 
	d="
M57.296974,54.615028 
	C58.596157,66.969643 62.045704,78.159187 68.028275,88.586578 
	C68.670113,89.705276 68.722565,92.043617 67.984436,92.941956 
	C54.135536,109.796806 36.389061,119.046799 14.434062,119.817719 
	C14.144382,119.827888 13.844508,119.547813 12.495783,118.886925 
	C26.633917,94.627274 40.727200,70.444580 54.820480,46.261890 
	C55.418201,46.413990 56.015919,46.566086 56.613640,46.718185 
	C56.825531,49.202957 57.037426,51.687729 57.296974,54.615028 
z"/>
<path fill="#323232" opacity="1.000000" stroke="none" 
	d="
M381.167969,54.101086 
	C389.484985,48.519222 397.998199,48.282463 406.698090,51.770420 
	C413.183075,54.370377 416.526062,59.373329 416.965759,67.058838 
	C413.011871,67.058838 409.253998,67.173866 405.513519,66.969826 
	C404.682709,66.924500 403.971008,65.662010 403.104431,65.119904 
	C400.742310,63.642242 398.471832,61.516960 395.896088,61.007286 
	C392.580780,60.351269 389.552032,61.997746 388.972809,65.848816 
	C388.422363,69.508682 391.237701,70.760910 394.010376,71.615746 
	C398.139038,72.888657 402.408295,73.723083 406.499115,75.097252 
	C414.317505,77.723511 418.651764,83.294800 418.745117,90.363663 
	C418.833374,97.047211 414.576294,102.994072 407.307831,105.813751 
	C399.347961,108.901665 391.342865,109.015800 383.611969,105.033806 
	C377.432190,101.850777 373.737427,96.888847 373.357544,89.423370 
	C377.505157,89.423370 381.448883,89.423370 385.514435,89.423370 
	C389.715454,96.037277 393.496307,98.144951 399.307892,95.988274 
	C401.448486,95.193886 404.183380,92.771683 404.356232,90.882385 
	C404.505890,89.246483 401.741486,86.535370 399.688293,85.673210 
	C395.277008,83.820831 390.325562,83.264168 385.895081,81.446335 
	C373.315063,76.284721 371.101959,63.757236 381.167969,54.101086 
z"/>
<path fill="#323232" opacity="1.000000" stroke="none" 
	d="
M322.422302,75.387833 
	C325.203064,68.208893 327.932129,61.419750 330.360321,54.524654 
	C331.325989,51.782642 332.566315,50.424938 335.695892,50.708908 
	C339.156799,51.022942 342.668121,50.780663 346.609375,50.780663 
	C346.244019,52.103710 346.073364,53.157192 345.671143,54.113277 
	C338.776642,70.502960 331.787079,86.853180 325.002197,103.287949 
	C323.871552,106.026619 322.475830,106.967834 319.502502,106.923729 
	C310.735504,106.793671 310.724304,106.944084 307.417358,99.015739 
	C300.838531,83.243088 294.270691,67.465866 287.323914,50.792000 
	C292.187897,50.792000 296.414917,50.565342 300.587006,50.943848 
	C301.695435,51.044403 303.060547,52.832092 303.584717,54.135857 
	C307.489838,63.849041 311.207886,73.637367 314.998535,83.396713 
	C315.585632,84.908180 316.243866,86.392014 317.241730,88.780136 
	C319.129364,83.863396 320.689636,79.799278 322.422302,75.387833 
z"/>
<path fill="#343434" opacity="1.000000" stroke="none" 
	d="
M366.697754,65.008713 
	C366.697723,79.123329 366.697723,92.740013 366.697723,106.601135 
	C361.927032,106.601135 357.654419,106.601135 353.033600,106.601135 
	C353.033600,88.249496 353.033600,69.851448 353.033600,51.111832 
	C357.352356,51.111832 361.738434,51.111832 366.697815,51.111832 
	C366.697815,55.606899 366.697815,60.058834 366.697754,65.008713 
z"/>
<path fill="#343434" opacity="1.000000" stroke="none" 
	d="
M364.432861,27.264692 
	C368.229065,30.017551 370.052490,33.655293 367.892456,37.357162 
	C366.444122,39.839355 363.273193,42.180458 360.469696,42.821926 
	C355.183380,44.031479 350.412445,39.498112 350.498199,34.406773 
	C350.580719,29.510197 355.009644,25.672739 360.289551,26.065866 
	C361.576630,26.161699 362.829102,26.722370 364.432861,27.264692 
z"/>
<path fill="#FBFBFB" opacity="1.000000" stroke="none" 
	d="
M259.456543,64.096863 
	C267.917053,69.377632 270.724976,77.101311 267.408508,85.087250 
	C264.518585,92.046028 256.775391,96.143570 249.485489,94.571732 
	C240.203461,92.570351 234.750153,83.122002 237.500534,73.806740 
	C240.229828,64.562935 249.078339,60.524525 259.456543,64.096863 
z"/>
<path fill="#FCFCFC" opacity="1.000000" stroke="none" 
	d="
M199.168640,75.012863 
	C200.450562,82.493202 198.305939,88.306290 192.227570,92.246071 
	C186.735916,95.805550 180.849197,96.002327 175.267151,92.487282 
	C169.321487,88.743263 167.171738,83.020035 167.946533,76.153542 
	C168.762161,68.925156 174.506012,63.374149 181.811554,62.660873 
	C189.841354,61.876884 196.164291,66.252281 199.168640,75.012863 
z"/>
<path fill="#F8F8F8" opacity="1.000000" stroke="none" 
	d="
M453.657776,61.914505 
	C461.742859,63.553455 464.689270,66.362907 465.946228,73.552124 
	C456.418304,73.552124 446.939087,73.552124 437.452911,73.552124 
	C437.301453,66.196548 442.959686,61.940720 453.657776,61.914505 
z"/>
</svg>` 

        }

         
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
                        // if (dump.info.calc_modo_impressao == 'm') {
                        //     myDoc += `<tr><td colspan=4 style="text-align: center;" >`
                        //     myDoc += `<table  width='70%'  class="tabelaMesAMes">`
                          
                        //     for (var m in l.resultado_selic_mesAmes) {
                        //         var class1 = "esquerda"
                        //         var m1 = l.resultado_selic_mesAmes[m]
                        //         myDoc += `<tr>`
                        //         myDoc += `<td style="width: 80px;" class="${class1}">${m1.dia}</td>` 
                        //         myDoc += `<td style="width: 80%;" class="${class1}">${m1.str}</td>`
                        //         myDoc += `<td style="width: 120px;text-align: right;">${calcUtil.formataNum(m1.valor,2)}</td>`
                        //         myDoc += `</tr>`
                        //     }
                            
                        //     myDoc += `</table></td></tr>`
                        // }
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
  