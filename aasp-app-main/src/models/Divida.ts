export interface Divida {
    id: number
    titulo: string
    numeroContrato: string
    tipoContrato: string
    descricao: string
    valorOriginal: string
    dataOriginal: string
    valorProposto: string
    dataProposta: string
    estaPago: boolean
    dataPagamento: string
    numeroBanco: string
    codigoBoleto: string
    dataVencimento: string
    idCredor: number
    idDevedor: number
    idDono: number
}
