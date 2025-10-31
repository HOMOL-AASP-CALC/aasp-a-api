export interface CarrinhoPacote {
    formaPagamento: string | 'C' | 'B' | 'P',
    nomeCartao: string,
    numeroCartao: string,
    codSeguranca: string,
    validadeMes: string,
    validadeAno: string,
    admCartao: string,
    nUsuAdd: number,
    mesesAdd: number,
    agent: string,
    vencimento: string,
    codigoDesconto: string,
    idPacContrat: string,
    periodo: number,
    pedido: number
}
