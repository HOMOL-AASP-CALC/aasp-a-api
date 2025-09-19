module.exports = function() {
    const calcUtil = require('./calcUtil.js');

   
    this.lista = [] 

    this.mNatureza = {
        'm': { 'normal': 1, 'esp15': 2.33, 'esp20': 1.75, 'esp25': 1.4, 'mar': 1.41, 'mar25': 1.81 },
        'f': { 'normal': 1, 'esp15': 2, 'esp20': 1.5, 'esp25': 1.2, 'mar': 1.41, 'mar25': 1.61}
    }

    this.mDef = {
        'm': [ 
            { '0': 1, '1': 0.94, '2': 0.83, '3':  0.71 },    // deficiencia 0 - normal
            { '0': 1.06, '1': 1, '2': 0.88, '3':  0.76 },    // deficiencia 1 - leve
            { '0': 1.21, '1': 1.14, '2': 1, '3':  0.86 },   // deficiencia 2 - moderada
            { '0': 1.4, '1': 1.32, '2': 1.16, '3':  1 },   // deficiencia 3 - grave
            ],
        'f': [
            { '0': 1, '1': 0.93, '2': 0.8, '3':  0.67 },
            { '0': 1.07, '1': 1, '2': 0.86, '3':  0.71 },
            { '0': 1.25, '1': 1.17, '2': 1, '3':  0.83 },
            { '0': 1.5, '1': 1.4, '2': 1.2, '3':  1 }  
                
            ]
        }

    this.setVariaveis = function (variaveis) {
        tabelas = variaveis.tabelas
        tabJ = variaveis.tabJ
        tabelaPrevReajuste = variaveis.tabelaPrevReajuste 
    }

    this.setCampoRetorno = function (calcM, campo, valor) {
        let feito  = false
        let retorno = {} 

        if (!feito) {
            calcM[campo] = valor
        }
    
        return { calcM, retorno }
    }

    this.validar = function (d) {
    }

    this.posLeituraArquivo = function (d) {
        return d;
    }

    this.criar = function ( infoInicial ) {
        return {
            nomeSegurado: '',
            dataNasc: '',
            genero: 'm',
            especieBeneficio: '42',
            dataInicioBeneficio: '',
            conflitoNaturezaDeficiencia: 'x', 

            idCalc: infoInicial.idCalc,
            hash: infoInicial.hash,
            idDono: infoInicial.idDono,
            nome: 'cálculo sem nome',
            email: '',
            valorList: [],
            deficienciaList: [],
        }
    }

    this.interSec = function (item1, item2) {
        if (item1.admissao == '' || item1.saida == '' || item2.admissao == '' || item2.saida == '') {
            return [ item2 ]
        }

        let d1a = calcUtil.dia2yyyymmddInt(item1.admissao)
        let d1s = calcUtil.dia2yyyymmddInt(item1.saida)

        let d2a = calcUtil.dia2yyyymmddInt(item2.admissao)
        let d2s = calcUtil.dia2yyyymmddInt(item2.saida)

        if (d1a > d2s || d1s < d2a) {
            return [ item2 ]
        }

        if ( d1a < d2a && d1s > d2a && d1s < d2s ) {
            item2.admissao = calcUtil.somaDia( item1.saida )
            return [ item2 ]
        }

        if (d1a > d2a && d1a < d2s && d1s > d2s) {
            item2.saida = calcUtil.diminuiDia( item1.admissao )
            return [ item2 ]
        }

        if (d1a < d2a && d1s > d2s) {
            item2.admissao = ''
            item2.saida = ''
            return [ item2 ]
        }

        if (d1a > d2a && d1s < d2s) {
            let item3 = {
                admissao: calcUtil.somaDia( item1.saida ),
                saida: item2.saida,
                desc: item2.desc,
                desc2: item2.desc2,
                natureza: item2.natureza,
                id: item2.id
            }
            item2.saida = calcUtil.diminuiDia( item1.admissao )
            return [ item2, item3 ]
        }

        return [ ] 
    }

    this.qualDeficiencia = function (dia, listaDef) {
        let l = listaDef.length
        let deficiencia = 0
        for (let i=0; i < l; i++) {
            let d1a = calcUtil.dia2yyyymmddInt(listaDef[i].inicio)
            let d1s = calcUtil.dia2yyyymmddInt(listaDef[i].fim)
            if (d1a <= dia && dia <= d1s) {
                deficiencia = listaDef[i].grau
                break
            }
        }
        return deficiencia
    }

    this.maiorPeriodoComDeficiencia = function(listaDef)  {
        let r = 0
        let nDias = 0 
        
        for (let i in listaDef) {
            let n = calcUtil.diffDatas360(listaDef[i].inicio, listaDef[i].fim)
            if (n > nDias) {
                nDias = n
                r = listaDef[i].grau
            }
        }

        return r 
    }

    this.classificar = function (item1, listaDef, genero1) {
        // console.log(listaDef)
        let d1a = calcUtil.dia2yyyymmddInt(item1.admissao)
        let d1s = calcUtil.dia2yyyymmddInt(item1.saida)
        let lista = [] 
        let deficienciaAtual = this.qualDeficiencia(d1a, listaDef)
        let inicioDefAtual = item1.admissao

        const sdef = JSON.stringify([{dias: 0, mDef: 0, mNatureza: 0, mMaritimo:0, resultado:0},{dias: 0, mDef: 0, mNatureza: 0, mMaritimo:0, resultado:0},{dias: 0, mDef: 0, mNatureza: 0, mMaritimo:0, resultado:0},{dias: 0, mDef: 0, mNatureza: 0, mMaritimo:0, resultado:0}]) 
        
        while (d1a <= d1s) { 
            let deficienciaDia = this.qualDeficiencia(d1a, listaDef)

            if (deficienciaDia != deficienciaAtual) {
                let item = { admissao: inicioDefAtual, saida: calcUtil.diminuiDia(calcUtil.yyyymmdd2dia(d1a)), deficiencia: deficienciaAtual, def: JSON.parse(sdef)  }
                lista.push(item)
                inicioDefAtual =  calcUtil.yyyymmdd2dia(d1a) 
                deficienciaAtual = deficienciaDia
            }
            d1a = calcUtil.dia2yyyymmddInt( calcUtil.somaDia( calcUtil.yyyymmdd2dia(d1a) ) )
        }

        let item = { admissao: inicioDefAtual, saida: calcUtil.diminuiDia(calcUtil.yyyymmdd2dia(d1a)), deficiencia: deficienciaAtual, def: JSON.parse(sdef)  }
        lista.push(item)


        let grauAnterior = 0 
        if ( listaDef.length > 0 ) {
            grauAnterior = this.maiorPeriodoComDeficiencia(listaDef) // [ listaDef.length-1 ].grau 
        }

        for (let i in lista) {
            let d = calcUtil.diffDatas360(lista[i].admissao, lista[i].saida)+1
            let genero = genero1

            let codDef = this.mDef[ genero ][ lista[i].deficiencia ][ grauAnterior]
            let mNatureza = this.mNatureza[ genero ][ item1.natureza ]
            // console.log('mNatureza', mNatureza, genero, item1.natureza) 
            let mMaritimo = 1 

            if (this.conflitoDN == 'd') { mNatureza = 1; }
            if (this.conflitoDN == 'n') { codDef = 1; }

            // console.log('resultado', d, codDef , mNatureza , mMaritimo)
            lista[i].def[lista[i].deficiencia] =  { dias: d, mDef: codDef, mNatureza, mMaritimo, resultado: Math.floor(d * codDef * mNatureza * mMaritimo) }
        }

        return lista
    }

    this.classificarListaDef = function (lista, listaDef, genero1) {
        let retorno = []

        for (let i in lista) {
            let listaClassificada = this.classificar( lista[i], listaDef, genero1 )
            // console.log(`${listaClassificada}: ${i}`, JSON.stringify( listaClassificada, null, 4 ) );

            for (let k in listaClassificada) {
                retorno.push( listaClassificada[k] )
            }
        }
        return retorno
    }

    this.addLista = function (item, dl, genero1) {
        let addDepois = [] 
        let lista = JSON.parse(JSON.stringify(this.lista))
        for (let i in lista) {
            let inter = this.interSec( lista[i], item )
            let l = inter.length 

            if (l > 1) {
                item = inter[0]
                for (let j=1; j < l; j++) {
                    addDepois.push( inter[j] )
                }
            } 
        }
        if (item.admissao != '' && item.saida != '') {
            lista.push( item )
        }
        
        for (let i in addDepois) {
            this.addLista(lista, addDepois[i], dl, genero1)
        }

        let lista2 = lista.filter( (x) => x.desc2 == item.desc2 )
        let lista3 = this.classificarListaDef( lista2, dl, genero1 )
        return lista3 
    }

    this.totalDias = function (periodos) {
        let total = 0
        for (let i in periodos) {
            total += calcUtil.diffDatas360(periodos[i].admissao, periodos[i].saida  )
        }
        return total
    }

    this.diasComuns = function (item1, item2) {
        let d1a = calcUtil.dia2yyyymmddInt(item1.admissao)
        let d1s = calcUtil.dia2yyyymmddInt(item1.saida)
        let d2a = calcUtil.dia2yyyymmddInt(item2.admissao)
        let d2s = calcUtil.dia2yyyymmddInt(item2.saida)

        if (d1a <= d2a && d1s <= d2s && d1s >= d2a) {
            return calcUtil.diffDatas360(item2.admissao, item1.saida)
        }

        if (d1a >= d2a && d1s >= d2s && d1a <= d2s) {
            return calcUtil.diffDatas360(item1.admissao, item2.saida)
        }

        if (d1a <= d2a && d1s >= d2s) {
            return calcUtil.diffDatas360(item2.admissao, item2.saida)
        }

        if (d1a >= d2a && d1s <= d2s) {
            return calcUtil.diffDatas360(item1.admissao, item1.saida)
        }

        return 0;

    }


    this.totalDiasPeriodo = function (lista2) {
        let t = 0
        for (let i in lista2) {
            for (let j in lista2[i].def) {
                t += lista2[i].def[j].resultado
            }  
        }
        return t
    }

    this.consolidaPeriodos = function (l) {
        this.lista = [] 
        for (let i in l) {
            let p = l[i].periodos
            for (let j in p) {
                this.lista.push(p[j])
            }
        }
    }

    this.corte = function (item, diaCorte) {
        let d1a = calcUtil.dia2yyyymmddInt(item.admissao)
        let d1s = calcUtil.dia2yyyymmddInt(item.saida)
        let dCorte = calcUtil.dia2yyyymmddInt(diaCorte)

        if (d1a <= dCorte && dCorte <= d1s ) {
            let item1 = JSON.parse(JSON.stringify(item))
            item1.saida = calcUtil.diminuiDia(diaCorte)
            item.natureza = 'normal'
            item.admissao = diaCorte
            return [ item1, item ]
        } 

        return [ item ] 
    }

    this.calcular = async (d) => {
        let l = d.valorList.length
        let dl = d.deficienciaList
        let somaDias = 0

        // criar um descritor para cada item da lista
        for (let i=0; i < l; i++) {
            d.valorList[i].desc2 = i
        }

        // verifica se existe conflito entre natureza e deficiencia
        let e1 = d.valorList.filter( x => (x.natureza == 'esp15' || x.natureza == 'esp20' || x.natureza == 'esp25')) 
        let d1 = d.deficienciaList.filter( x => x.grau != '0')
        if (e1.length > 0 && d1.length > 0) {
            if (d.conflitoNaturezaDeficiencia == 'd') {
                this.conflitoDN  = 'd'
            } else {
                this.conflitoDN = 'n'
            }
        } else {
            this.conflitoDN = 'x'
        }

        // console.log(d)
        // console.log('****')

        // ajusta o valorList separando antes e depois de 2019 
        let nValorList = [] 
        for (let i=0; i < l; i++) {
            let item = d.valorList[i]
            if (item.natureza == 'esp15' || item.natureza == 'esp20' || item.natureza == 'esp25' ||  item.natureza == 'mar25') {
                let item1 = this.corte(  item,  '13/11/2019'  )

                for (let j in item1) {
                    nValorList.push(item1[j])
                }
            } else {
                nValorList.push(item)
            }
        }
        d.nValorList = nValorList
        let nl = nValorList.length

        for (let i=0; i < nl; i++) {
            let item =  JSON.parse( JSON.stringify( d.nValorList[i] ) )
            
            if ( calcUtil.dataOk(item.admissao) && calcUtil.dataOk(item.saida) && item.admissao != '' && item.saida != '') {
                let a = this.addLista( item, dl, d.genero)
                // console.log('>>>>', a)
                d.nValorList[i].periodos = a // a.filter( (item) => item.desc == d.valorList[i].desc )
                d.nValorList[i].totalDias = this.totalDiasPeriodo( d.nValorList[i].periodos )
                d.nValorList[i].consolidaTotalDias = calcUtil.totalDias2cal360( d.nValorList[i].totalDias )
                somaDias += d.nValorList[i].totalDias
                this.consolidaPeriodos( d.valorList )
            }
        }

        // console.log(JSON.stringify(d) )

        return { somaDias, consolidaTotalDias: calcUtil.totalDias2cal360(somaDias),  lista: d.nValorList }  
    }

}
