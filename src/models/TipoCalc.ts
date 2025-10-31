export enum TipoCalc {
    atual = 1,
    finan = 2,
    deved = 3,
    jud = 4,
    tabjud = 5,
    cponto = 6,
    difn = 7,
    prevct = 8,
}

// Função para retornar o valor numérico de uma chave do enum
export function getTipoCalcNum(tipoCalc: string): number | undefined {
    // Converte a string para minúsculo para garantir que o valor seja compatível
    const tipoCalcKey = tipoCalc.toLowerCase() as keyof typeof TipoCalc;
    return TipoCalc[tipoCalcKey];  // Retorna o valor numérico ou undefined se não encontrado
}

// Função para retornar a chave pelo valor numerico do enum
export function getTipoCalcKey(tipoCalc: number): string | undefined {
    const tipoCalcKey = Object.keys(TipoCalc).find(key => TipoCalc[key as keyof typeof TipoCalc] === tipoCalc);
    return tipoCalcKey ? tipoCalcKey : undefined;  // Retorna a chave ou undefined se não encontrado
}