const calcUtil = require('./calcUtil');

function adjustDates(valorList) {
    // Converter as datas para o formato desejado e preparar a lista de saída
    let newList = [];
    let tempList = valorList.map(item => ({
        admissao: item.admissao,
        saida: item.saida,
        desc: item.desc,
        admissaoInt: calcUtil.dia2yyyymmddInt(item.admissao),
        saidaInt: calcUtil.dia2yyyymmddInt(item.saida)
    }));

    // Ordenar a lista pelo campo admissaoInt
    tempList.sort((a, b) => a.admissaoInt - b.admissaoInt);

    for (let i = 0; i < tempList.length; i++) {
        let current = tempList[i];

        for (let j = i + 1; j < tempList.length; j++) {
            let next = tempList[j];

            // Verificar se há interseção
            if (current.saidaInt >= next.admissaoInt) {
                // Ajustar as datas para remover a interseção
                next.admissaoInt = calcUtil.dia2yyyymmddInt(calcUtil.somaDia(current.saida));
                // Recalcular o período para dividir
                let middleDate = calcUtil.diminuiDia(calcUtil.yyyymmdd2dia(next.admissaoInt));
                newList.push({
                    admissao: current.admissao,
                    saida: middleDate,
                    desc: current.desc
                });
                current.admissao = calcUtil.yyyymmdd2dia(next.admissaoInt);
                current.admissaoInt = next.admissaoInt;
            }
        }

        // Adicionar o período ajustado à nova lista
        newList.push({
            admissao: current.admissao,
            saida: current.saida,
            desc: current.desc
        });
    }

    return newList;
}

// Exemplo de uso
const valorList = [
    { admissao: '01/01/2021', saida: '05/01/2022', desc: 'aa' },
    { admissao: '01/01/2022', saida: '01/01/2023', desc: 'bb' },
    { admissao: '05/05/2023', saida: '05/06/2023', desc: 'cc' },
    { admissao: '05/04/2022', saida: '05/07/2023', desc: 'dd' },
];

const result = adjustDates(valorList);
console.log(result);
