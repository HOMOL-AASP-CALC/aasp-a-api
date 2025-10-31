// calcUtil.js
export function diaHoje() {
    const data = new Date()
    const dia = "01"
    const mes = (data.getMonth() + 1).toString().padStart(2, '0')
    const ano = data.getFullYear()
    return `${dia}/${mes}/${ano}`
}

export function mesAno2dia(d) {
    if (typeof d === 'string' && d.length < 10) return 0
    d = parseInt(d)
    let ano = Math.floor(d / 12)
    let mes = d - (ano * 12)
    if (mes === 0) {
        mes = 12
        ano--
    }
    const zero = mes < 10 ? '0' : ''
    return `${zero}${mes}/${ano}`
}

export function zeroStr(n) {
    const x = parseInt(n)
    return x < 10 ? '0' + String(n) : String(n)
}

export function somaMes(dia) {
    let d = parseInt(dia.substring(0, 2))
    let m = parseInt(dia.substring(3, 5))
    let a = parseInt(dia.substring(6, 10))
    m++
    if (m > 12) {
        m = 1
        a++
    }
    return `${d.toString().padStart(2,'0')}/${m.toString().padStart(2,'0')}/${a}`
}

export function strPrimeiroDia(str) {
    return '01/' + str.substring(3)
}

export function diminuiMes(dia) {
    let d = parseInt(dia.substring(6, 8))
    let m = parseInt(dia.substring(4, 6))
    let a = parseInt(dia.substring(0, 4))
    m--
    if (m < 1) {
        m = 12
        a--
    }
    return `${a}${m.toString().padStart(2,'0')}${d.toString().padStart(2,'0')}`
}

export function diminuiAno(dia) {
    let d = parseInt(dia.substring(6, 8))
    let m = parseInt(dia.substring(4, 6))
    let a = parseInt(dia.substring(0, 4))
    a--
    return `${a}${m.toString().padStart(2,'0')}${d.toString().padStart(2,'0')}`
}

export function yyyymmddHoje() {
    const data = new Date()
    const dia = "01"
    const mes = (data.getMonth() + 1).toString().padStart(2,'0')
    const ano = data.getFullYear()
    return `${ano}${mes}${dia}`
}

export function limpaNum(v) {
    if (v === '') return 0
    const char_centavos = ","
    const char_milhar = "."
    v = v.split(char_milhar).join('')
    v = v.replace(char_centavos, ".")
    return parseFloat(v)
}

export function yyyymmdd2dia(d) {
    if (d.length < 8) return ''
    const dia = d.substring(6,8)
    const mes = d.substring(4,6)
    const ano = d.substring(0,4)
    return `${dia}/${mes}/${ano}`
}

export function moeda(dia) {
    dia = parseInt(dia)
    const d150570 = 19700515
    const d022886 = 19860228
    const d011589 = 19890115
    const d022890 = 19900316
    const d080193 = 19930801
    const d070194 = 19940701
    let r = ''
    if (dia <= d150570) r = 'NCr$'
    else if (dia > d150570 && dia < d022886) r = 'Cr$'
    else if (dia >= d022886 && dia < d011589) r = 'CZ$'
    else if (dia >= d011589 && dia < d022890) r = 'NCZ$'
    else if (dia >= d022890 && dia < d080193) r = 'Cr$'
    else if (dia >= d080193 && dia < d070194) r = 'CR$'
    else if (dia >= d070194) r = 'R$'
    return r
}

export function formataNum(n, c) {
    let m = 0
    const char_centavos = ","
    const char_milhar = "."
    n = String(n)
    if (n === "null") return ""
    if (n.indexOf("e") > 0) n = '0'

    let len = n.length
    let ponto = n.indexOf(".")
    if (ponto > 0) {
        n = n.substr(0,ponto) + char_centavos + n.substr(ponto+1)
    }
    if (len > 0 && n[0] === char_centavos) {
        n = '0' + n
        len++
        ponto++
    }
    if (c > 0) {
        if (ponto < 0) {
            n = n + char_centavos
            ponto = len
            len++
        }
        while (((len-1) - ponto) < c) {
            n = n + '0'
            len++
        }
        if (((len-1) - ponto) > c) {
            n = n.substr(0, ponto + c + 1)
        }
        m = ponto - 3
        while (m > 0) {
            if ((m != 1) || ((m == 1) && (n.substr(0,1) != "-"))) {
                n = n.substr(0, m) + char_milhar + n.substr(m)
            }
            m -= 3
        }
    } else {
        if (ponto < 0) ponto = n.length
        m = ponto - 3
        while (m > 0) {
            if ((m != 1) || ((m == 1) && (n.substr(0,1) != "-"))) {
                n = n.substr(0, m) + char_milhar + n.substr(m)
            }
            m -= 3
        }
    }
    return n
}
