<script setup lang='ts'>
import { ref, onMounted, watch, inject } from 'vue';

const props = defineProps({
    dsr: String,
    modoDigitacao: String,
    arrRepeticaoHorarios: Object,
    dadosArquivo: Object,
    dataInicial: String,
    dataFinal: String,
    editavel: Boolean,
})

const dataInicial = ref(props.dataInicial)
const dataFinal = ref(props.dataFinal)

console.log('dataInicial.value = ', dataInicial.value)
console.log('dataFinal.value = ', dataFinal.value)

const selectedOption = ref(null)
const daysInMonth = ref([]);
const inputValues = ref({});
const inputErrors = ref({});

const feriadosMoveis = ref({});
const feriadosFixos = ref([]);

const modoDigitacao = ref(props.modoDigitacao);

const updateMessage = inject('updateMessage');

updateMessage(inputValues.value);

if (props.dadosArquivo.value) {
    console.log('modo digitacao: ', modoDigitacao.value)
    console.log(props.dadosArquivo.value)

    if (modoDigitacao.value == 'entradaIntervaloSaida') {
        preencherEntradaIntervaloSaida()
    }else if (modoDigitacao.value == 'entradaSaidaIntervalo') {
        preencherEntradaSaidaIntervalo()
    }
}

const strFeriadosMoveis = props.dsr.substring(0, 8);
feriadosMoveis.value = strFeriadosMoveis.split('');

const strFeriadosFixos = props.dsr.substring(8);

for (let i = 0; i < strFeriadosFixos.length; i += 4) {
    const registro = strFeriadosFixos.substring(i, i + 4);
    const dia = registro.substring(0, 2);
    const mes = registro.substring(2, 4);
    const objeto = { dia: dia, mes: mes };
    feriadosFixos.value.push(objeto);
}

const arrMeses = mesesEntreDatas(dataInicial.value, dataFinal.value);

function preencherEntradaSaidaIntervalo(){
    console.log('preencherEntradaSaidaIntervalo')
    //formato antigo
    const eiEntries = Object.entries(props.dadosArquivo.value).filter(([key, value]) =>
        key.startsWith("ei_")
    );
    const siEntries = Object.entries(props.dadosArquivo.value).filter(([key, value]) =>
        key.startsWith("si_")
    );
    const iEntries = Object.entries(props.dadosArquivo.value).filter(([key, value]) =>
        key.startsWith("i_")
    );
    const wEntries = Object.entries(props.dadosArquivo.value).filter(([key, value]) =>
        key.startsWith("w_")
    );
    //formato novo
    const e1Entries = Object.entries(props.dadosArquivo.value).filter(([key, value]) =>
        key.startsWith("e1_")
    );
    const e2Entries = Object.entries(props.dadosArquivo.value).filter(([key, value]) =>
        key.startsWith("e2_")
    );
    const s1Entries = Object.entries(props.dadosArquivo.value).filter(([key, value]) =>
        key.startsWith("s1_")
    );
    const s2Entries = Object.entries(props.dadosArquivo.value).filter(([key, value]) =>
        key.startsWith("s2_")
    );

    //formato antigo
    const eiObj = Object.fromEntries(eiEntries);
    const siObj = Object.fromEntries(siEntries);
    const iObj = Object.fromEntries(iEntries);
    const wObj = Object.fromEntries(wEntries);
    //formato novo
    const e1Obj = Object.fromEntries(e1Entries);
    const e2Obj = Object.fromEntries(e2Entries);
    const s1Obj = Object.fromEntries(s1Entries);
    const s2Obj = Object.fromEntries(s2Entries);

    const diaStatus = {
        0: 'Trabalho',
        1: 'Descanso',
        2: 'Feriado',
        3: 'Falta',
        4: 'Falta Justificada',
    };

    let dataInicialFormatada = parseInt(dataInicial.value.split('/').reverse().join(''))
    let dataFinalFormatada = parseInt(dataFinal.value.split('/').reverse().join(''))

    if(Object.keys(eiObj).length > 0) {
        console.log('formato antigo')
        for (const key in eiObj) {
            let dataCampo = key.split('_')[1]
            let dataCampoForm = formatarData2(dataCampo);
            let dataCampoInt = parseInt(dataCampo)

            if (dataCampoInt >= dataInicialFormatada && dataCampoInt <= dataFinalFormatada) {
                let key_ei = `ei_${dataCampo}`
                let key_si = `si_${dataCampo}`
                let key_i = `i_${dataCampo}`
                let key_w = `w_${dataCampo}`

                inputValues.value[dataCampoForm] = {
                    entrada: `${eiObj[key_ei]}`,
                    inicio_intervalo: `${iObj[key_i]}`,
                    saida: `${siObj[key_si]}`,
                }
            }
        }
    } else if (Object.keys(e1Obj).length) {
        console.log('formato Novo')
        for (const key in e1Obj) {
            let dataCampo = key.split('_')[1]
            let dataCampoForm = formatarData2(dataCampo);
            let dataCampoInt = parseInt(dataCampo)

            if (dataCampoInt >= dataInicialFormatada && dataCampoInt <= dataFinalFormatada) {
                //novo
                let key_e1 = `e1_${dataCampo}`
                let key_s1 = `s1_${dataCampo}`
                let key_s2 = `s2_${dataCampo}`

                inputValues.value[dataCampoForm] = {
                    entrada: `${e1Obj[key_e1]}`,
                    inicio_intervalo: `${s1Obj[key_s1]}`,
                    saida: `${s2Obj[key_s2]}`,
                }
            }
        }
    }

    for (const key in wObj) {
        let dataCampo = key.split('_')[1]
        let dataCampoForm = formatarData2(dataCampo);
        let dataCampoInt = parseInt(dataCampo)

        if (dataCampoInt >= dataInicialFormatada && dataCampoInt <= dataFinalFormatada) {
            inputValues.value[dataCampoForm] = {
                ...inputValues.value[dataCampoForm],
                considerar_como: diaStatus[`${wObj[key]}`]
            };
        }
    }
}
function preencherEntradaIntervaloSaida(){
    console.log('preencherEntradaIntervaloSaida')
    const e1Entries = Object.entries(props.dadosArquivo.value).filter(([key, value]) =>
        key.startsWith("e1_")
    );
    const e2Entries = Object.entries(props.dadosArquivo.value).filter(([key, value]) =>
        key.startsWith("e2_")
    );
    const s1Entries = Object.entries(props.dadosArquivo.value).filter(([key, value]) =>
        key.startsWith("s1_")
    );
    const s2Entries = Object.entries(props.dadosArquivo.value).filter(([key, value]) =>
        key.startsWith("s2_")
    );
    const wEntries = Object.entries(props.dadosArquivo.value).filter(([key, value]) =>
        key.startsWith("w_")
    );

    const e1Obj = Object.fromEntries(e1Entries);
    const e2Obj = Object.fromEntries(e2Entries);
    const s1Obj = Object.fromEntries(s1Entries);
    const s2Obj = Object.fromEntries(s2Entries);
    const wObj = Object.fromEntries(wEntries);

    const diaStatus = {
        0: 'Trabalho',
        1: 'Descanso',
        2: 'Feriado',
        3: 'Falta',
        4: 'Falta Justificada',
    };

    let dataInicialFormatada = parseInt(dataInicial.value.split('/').reverse().join(''))
    let dataFinalFormatada = parseInt(dataFinal.value.split('/').reverse().join(''))

    for (const key in e1Obj) {
        let dataCampo = key.split('_')[1]
        let dataCampoForm = formatarData2(dataCampo);
        let dataCampoInt = parseInt(dataCampo)

        if (dataCampoInt >= dataInicialFormatada && dataCampoInt <= dataFinalFormatada) {

            let key_e1 = `e1_${dataCampo}`
            let key_e2 = `e2_${dataCampo}`
            let key_s1 = `s1_${dataCampo}`
            let key_s2 = `s2_${dataCampo}`
            let key_w = `w_${dataCampo}`

            if (e2Obj[key_e2] !== undefined) {
                inputValues.value[dataCampoForm] = {
                    entrada: `${e1Obj[key_e1]}`,
                    inicio_intervalo: `${s1Obj[key_s1]}`,
                    fim_intervalo: `${e2Obj[key_e2]}`,
                    saida: `${s2Obj[key_s2]}`,
                };
            }

        }
    }

    for (const key in wObj) {
        let dataCampo = key.split('_')[1]
        let dataCampoForm = formatarData2(dataCampo);
        let dataCampoInt = parseInt(dataCampo)

        if (dataCampoInt >= dataInicialFormatada && dataCampoInt <= dataFinalFormatada) {
            inputValues.value[dataCampoForm] = {
                ...inputValues.value[dataCampoForm],
                considerar_como: diaStatus[`${wObj[key]}`]
            };
        }
    }
}
function calcularPascoa(ano) {
    const a = ano % 19;
    const b = Math.floor(ano / 100);
    const c = ano % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const L = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * L) / 451);
    const month = Math.floor((h + L - 7 * m + 114) / 31);
    const day = ((h + L - 7 * m + 114) % 31) + 1;

    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');

    return `${formattedDay}/${formattedMonth}/${ano}`;
}
function calcularFeriados(pascoa) {
    const sextaSanta = new Date(pascoa.getTime());
    sextaSanta.setDate(pascoa.getDate() - 2);
    const corpusChristi = new Date(pascoa.getTime());
    corpusChristi.setDate(pascoa.getDate() + 60);

    const sabadoCarnaval = new Date(pascoa.getTime());
    sabadoCarnaval.setDate(pascoa.getDate() - 50);
    const domingoCarnaval = new Date(pascoa.getTime());
    domingoCarnaval.setDate(pascoa.getDate() - 49);
    const segundaCarnaval = new Date(pascoa.getTime());
    segundaCarnaval.setDate(pascoa.getDate() - 48);
    const tercaCarnaval = new Date(pascoa.getTime());
    tercaCarnaval.setDate(pascoa.getDate() - 47);
    const quartaCarnaval = new Date(pascoa.getTime());
    quartaCarnaval.setDate(pascoa.getDate() - 46);

    return {
        pascoa: formatarData(pascoa),
        sextaSanta: formatarData(sextaSanta),
        corpusChristi: formatarData(corpusChristi),
        sabadoCarnaval: formatarData(sabadoCarnaval),
        domingoCarnaval: formatarData(domingoCarnaval),
        segundaCarnaval: formatarData(segundaCarnaval),
        tercaCarnaval: formatarData(tercaCarnaval),
        quartaCarnaval: formatarData(quartaCarnaval),
    };
}
function formatarData(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${dia}/${mes}/${ano}`;
}
function formatarData2(input) {
    const year = input.slice(0, 4);
    const month = input.slice(4, 6);
    const day = input.slice(6, 8);
    return `${day}/${month}/${year}`;
}
const hasInputError = (date, field) => {
    if (inputErrors.value[date] !== undefined) {
        if (field == 'entrada' && inputErrors.value[date].entrada) {
            return true
        }
        if (field == 'inicio_intervalo' && inputErrors.value[date].inicio_intervalo) {
            return true
        }
        if (field == 'fim_intervalo' && inputErrors.value[date].fim_intervalo) {
            return true
        }
        if (field == 'saida' && inputErrors.value[date].saida) {
            return true
        }
    }
};
const updateInputValue = (date, field, value) => {
    console.log('updateInputValue')
    if (value.length === 5) {
        inputValues.value[date][field] = value;
    } else {
        delete inputValues.value[date][field];
    }
};
const mascaraHora = (event) => {
    console.log('mascaraHora')
    let input = event.target;
    let value = input.value.replace(/\D/g, '');
    let formattedValue = '';

    if (value.length > 0) {
        formattedValue = value.slice(0, 4).match(/.{1,2}/g).join(':');
    }

    input.value = formattedValue;
};
function mesesEntreDatas(startDate, endDate) {
    const [startDay, startMonth, startYear] = startDate.split('/').map(Number);
    const [endDay, endMonth, endYear] = endDate.split('/').map(Number);
    const months = {};

    for (let year = startYear; year <= endYear; year++) {
        const pascoa = calcularPascoa(year)
        const objDataPascoa = pascoa.split("/");
        const dataPascoa = new Date(year, (objDataPascoa[1] - 1), objDataPascoa[0]);
        const feriados = calcularFeriados(dataPascoa);

        if (feriadosMoveis.value[0] == 1 && ((new Date(feriados.pascoa.split('/').reverse().join('/'))) < (new Date(dataFinal.value.split('/').reverse().join('/'))))
            && ((new Date(feriados.pascoa.split('/').reverse().join('/'))) > (new Date(dataInicial.value.split('/').reverse().join('/'))))
        ) {
            inputValues.value[feriados.pascoa] = Object.assign({}, inputValues.value[feriados.pascoa], {
                considerar_como: 'Descanso',
                feriado: 1
            });
        }

        //-------------------------------------------

        if (feriadosMoveis.value[1] == 1 && ((new Date(feriados.sextaSanta.split('/').reverse().join('/'))) < (new Date(dataFinal.value.split('/').reverse().join('/'))))
            && ((new Date(feriados.sextaSanta.split('/').reverse().join('/'))) > (new Date(dataInicial.value.split('/').reverse().join('/'))))
        ) {
            if (props.dadosArquivo.value) {
                inputValues.value[feriados.sextaSanta] = Object.assign({}, inputValues.value[feriados.sextaSanta], {
                    considerar_como: 'Descanso',
                    feriado: 1
                });
            } else {
                inputValues.value[feriados.sextaSanta] = Object.assign({}, inputValues.value[feriados.sextaSanta], { feriado: 1 });
            }
        }

        //-------------------------------------------

        if (feriadosMoveis.value[2] == 1 && ((new Date(feriados.corpusChristi.split('/').reverse().join('/'))) < (new Date(dataFinal.value.split('/').reverse().join('/'))))
            && ((new Date(feriados.corpusChristi.split('/').reverse().join('/'))) > (new Date(dataInicial.value.split('/').reverse().join('/'))))
        ) {
            if (props.dadosArquivo.value) {
                inputValues.value[feriados.corpusChristi] = Object.assign({}, inputValues.value[feriados.corpusChristi], { feriado: 1 });
            } else {
                inputValues.value[feriados.corpusChristi] = Object.assign({}, inputValues.value[feriados.corpusChristi], {
                    considerar_como: 'Descanso',
                    feriado: 1
                });
            }
        }

        //-------------------------------------------

        if (feriadosMoveis.value[3] == 1 && ((new Date(feriados.sabadoCarnaval.split('/').reverse().join('/'))) < (new Date(dataFinal.value.split('/').reverse().join('/'))))
            && ((new Date(feriados.sabadoCarnaval.split('/').reverse().join('/'))) > (new Date(dataInicial.value.split('/').reverse().join('/'))))
        ) {
            if (props.dadosArquivo.value) {
                inputValues.value[feriados.sabadoCarnaval] = Object.assign({}, inputValues.value[feriados.sabadoCarnaval], { feriado: 1 });
            } else {
                inputValues.value[feriados.sabadoCarnaval] = Object.assign({}, inputValues.value[feriados.sabadoCarnaval], {
                    considerar_como: 'Descanso',
                    feriado: 1
                });
            }
        }

        //-------------------------------------------

        if (feriadosMoveis.value[4] == 1 && ((new Date(feriados.domingoCarnaval.split('/').reverse().join('/'))) < (new Date(dataFinal.value.split('/').reverse().join('/'))))
            && ((new Date(feriados.domingoCarnaval.split('/').reverse().join('/'))) > (new Date(dataInicial.value.split('/').reverse().join('/'))))
        ) {
            if (props.dadosArquivo.value) {
                inputValues.value[feriados.domingoCarnaval] = Object.assign({}, inputValues.value[feriados.domingoCarnaval], { feriado: 1 });
            } else {
                inputValues.value[feriados.domingoCarnaval] = Object.assign({}, inputValues.value[feriados.domingoCarnaval], {
                    considerar_como: 'Descanso',
                    feriado: 1
                });
            }
        }

        //-------------------------------------------

        if (feriadosMoveis.value[5] == 1 && ((new Date(feriados.segundaCarnaval.split('/').reverse().join('/'))) < (new Date(dataFinal.value.split('/').reverse().join('/'))))
            && ((new Date(feriados.segundaCarnaval.split('/').reverse().join('/'))) > (new Date(dataInicial.value.split('/').reverse().join('/'))))
        ) {
            if (props.dadosArquivo.value) {
                inputValues.value[feriados.segundaCarnaval] = Object.assign({}, inputValues.value[feriados.segundaCarnaval], { feriado: 1 });
            } else {
                inputValues.value[feriados.segundaCarnaval] = Object.assign({}, inputValues.value[feriados.segundaCarnaval], {
                    considerar_como: 'Descanso',
                    feriado: 1
                });
            }
        }

        //-------------------------------------------

        if (feriadosMoveis.value[6] == 1 && ((new Date(feriados.tercaCarnaval.split('/').reverse().join('/'))) < (new Date(dataFinal.value.split('/').reverse().join('/'))))
            && ((new Date(feriados.tercaCarnaval.split('/').reverse().join('/'))) > (new Date(dataInicial.value.split('/').reverse().join('/'))))
        ) {
            if (props.dadosArquivo.value) {
                inputValues.value[feriados.tercaCarnaval] = Object.assign({}, inputValues.value[feriados.tercaCarnaval], { feriado: 1 });
            } else {
                inputValues.value[feriados.tercaCarnaval] = Object.assign({}, inputValues.value[feriados.tercaCarnaval], {
                    considerar_como: 'Descanso',
                    feriado: 1
                });
            }
        }

        //-------------------------------------------

        if (feriadosMoveis.value[7] == 1 && ((new Date(feriados.quartaCarnaval.split('/').reverse().join('/'))) < (new Date(dataFinal.value.split('/').reverse().join('/'))))
            && ((new Date(feriados.quartaCarnaval.split('/').reverse().join('/'))) > (new Date(dataInicial.value.split('/').reverse().join('/'))))
        ) {
            if (props.dadosArquivo.value) {
                inputValues.value[feriados.quartaCarnaval] = Object.assign({}, inputValues.value[feriados.quartaCarnaval], { feriado: 1 });
            } else {
                inputValues.value[feriados.quartaCarnaval] = Object.assign({}, inputValues.value[feriados.quartaCarnaval], {
                    considerar_como: 'Descanso',
                    feriado: 1
                });
            }
        }

        //-------------------------------------------------------------------------------------------------------

        for (let i = 0; i < feriadosFixos.value.length; i++) {
            let diaFeriadoFixo = `${feriadosFixos.value[i].dia}/${feriadosFixos.value[i].mes}/${year}`

            if (((new Date(diaFeriadoFixo.split('/').reverse().join('/'))) <= (new Date(dataFinal.value.split('/').reverse().join('/'))))) {
                let diaFeriadoYMD = parseInt(year + feriadosFixos.value[i].mes + feriadosFixos.value[i].dia)
                let inicioYMD = parseInt(dataInicial.value.split('/').reverse().join(''))
                let fimYMD = parseInt(dataFinal.value.split('/').reverse().join(''))

                if (diaFeriadoYMD >= inicioYMD && diaFeriadoYMD <= fimYMD) {
                    if (props.dadosArquivo.value) {
                        inputValues.value[`${feriadosFixos.value[i].dia}/${feriadosFixos.value[i].mes}/${year}`] = Object.assign({}, inputValues.value[`${feriadosFixos.value[i].dia}/${feriadosFixos.value[i].mes}/${year}`], { feriado: 1 });
                    } else {
                        inputValues.value[`${feriadosFixos.value[i].dia}/${feriadosFixos.value[i].mes}/${year}`] = Object.assign({}, inputValues.value[`${feriadosFixos.value[i].dia}/${feriadosFixos.value[i].mes}/${year}`], {
                            considerar_como: 'Descanso',
                            feriado: 1
                        });
                    }
                }


            }
        }

        const monthStart = (year === startYear) ? startMonth : 1;
        const monthEnd = (year === endYear) ? endMonth : 12;
        for (let month = monthStart; month <= monthEnd; month++) {
            const date = new Date(year, month - 1);
            const yearMonth = `${year}${month.toString().padStart(2, '0')}`;
            const monthName = date.toLocaleString('default', { month: 'long' });
            const monthNameUpperCasa = monthName.charAt(0).toUpperCase() + monthName.slice(1);
            months[yearMonth] = `${monthNameUpperCasa}/${year}`;

            // console.log('year, month',year, month)
            updateDaysInMonth(year, month)
        }
    }

    return months;
}
function quantiaDiasMes(year, month) {
    return new Date(year, month, 0).getDate();
}
function updateDaysInMonth(year, month) {
    const numDays = quantiaDiasMes(year, month);
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const dayOfWeekOffset = firstDayOfMonth.getDay();

    const [initialDay, initialMonth, initialYear] = dataInicial.value.split('/').map(Number);
    const [finalDay, finalMonth, finalYear] = dataFinal.value.split('/').map(Number);

    let startDay = 1;
    if (year === initialYear && month === initialMonth) {
        startDay = initialDay;
    }

    let endDay = numDays;
    if (year === finalYear && month === finalMonth) {
        if (finalDay >= numDays) {
            endDay = numDays;
        } else {
            endDay = finalDay;
        }
    }

    daysInMonth.value = Array.from({ length: endDay - startDay + 1 }, (_, i) => {
        const day = i + startDay;
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.toLocaleString('default', { weekday: 'long' });
        const formattedDayOfWeek = dayOfWeek.slice(0, 3).charAt(0).toUpperCase() + dayOfWeek.slice(1, 3).toLowerCase();
        const formattedDate = day.toString().padStart(2, '0') + '/' + month.toString().padStart(2, '0') + '/' + year;
        const isSunday = dayOfWeek.toLowerCase() === 'domingo';

        if (
            (inputValues.value[formattedDate] && !inputValues.value[formattedDate].considerar_como) || !inputValues.value[formattedDate]
        ) {
            {
                if (isSunday) {
                    inputValues.value[formattedDate] = {
                        ...inputValues.value[formattedDate],
                        considerar_como: 'Descanso'
                    };
                } else {
                    inputValues.value[formattedDate] = {
                        ...inputValues.value[formattedDate],
                        considerar_como: 'Trabalho'
                    };
                }
            }
        }

        return { formattedDayOfWeek, formattedDate, isSunday };
    });
}
const anterior = () => {
    console.log('anterior')
    const currentIndex = Object.keys(arrMeses).indexOf(selectedOption.value);
    if (currentIndex > 0) {
        selectedOption.value = Object.keys(arrMeses)[currentIndex - 1];
    }
};
const proxima = () => {
    console.log('proxima')
    const currentIndex = Object.keys(arrMeses).indexOf(selectedOption.value);
    if (currentIndex < Object.keys(arrMeses).length - 1) {
        selectedOption.value = Object.keys(arrMeses)[currentIndex + 1];
    }
};
const validarHora = (hora) => {
    console.log('validaHora')
    const regexHora = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    return regexHora.test(hora);
};
const proximaHora = (event) => {
    console.log('proximaHora')
    const input = event.target;
    const value = input.value;

    if (value.length === 5 && validarHora(value)) {
        input.classList.remove('hora-invalida');
        const inputs = input.closest('tr').querySelectorAll('input[type="text"]');
        const currentIndex = Array.from(inputs).indexOf(input);

        if (currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1].focus();
        } else {
            const currentRow = input.closest('tr');
            const nextRow = currentRow.nextElementSibling;
            if (nextRow) {
                const entradaInput = nextRow.querySelector('input[type="text"]');
                entradaInput.focus();
            }
        }
    }
    if (value.length === 0) {
        input.classList.remove('hora-invalida');
    }
};
const processarHora = (event, formattedDate, campo) => {
    console.log('processarHora')
    mascaraHora(event);
    proximaHora(event);
    const input = event.target;
    const value = input.value;

    if (value.length === 5) {
        const horaValida = validarHora(value);
        if (!horaValida) {
            inputErrors.value[formattedDate] = {
                ...inputErrors.value[formattedDate],
                [campo]: true
            };
        } else {
            inputErrors.value[formattedDate] = {
                ...inputErrors.value[formattedDate],
                [campo]: false
            };
        }
    }
};
const listaEntreDatas = (startDate, endDate, dadosArr) => {
    console.log('listaEntreDatas')
    const startDate2 = startDate.split('/')
    const endDate2 = endDate.split('/')

    const start = new Date(`${startDate2[2]}-${startDate2[1]}-${startDate2[0]}`);
    const end = new Date(`${endDate2[2]}-${endDate2[1]}-${endDate2[0]}`);
    let currentDate = start;

    let ultimoMes
    let countSegunda = 0
    let countTerca = 0
    let countQuarta = 0
    let countQuinta = 0
    let countSexta = 0
    let countSabado = 0
    let countDomingo = 0
    let countDescanso = 0
    let countFeriado = 0

    let countRevezamentoSim = 0
    let countRevezamentoNao = 0

    while (currentDate <= end) {
        let dataAtual = currentDate.toISOString().split('T')[0]

        const date = new Date(dataAtual);
        const weekDays = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
        const dayOfWeek = weekDays[date.getDay()];

        const arrData = dataAtual.split('-');

        if (dadosArr.tipoModal == 1) {

            if (dadosArr.tipo_repeticao == 'repetir') {

                if (ultimoMes != arrData[1]) {
                    ultimoMes = arrData[1]

                    countSegunda = countTerca = countQuarta = countQuinta = countSexta = countSabado = countDomingo = 0
                    countDescanso = 0
                    countFeriado = 0
                }

                if (
                    (dadosArr.qtde_segundas && dayOfWeek == 'segunda' && dadosArr.qtde_segundas > countSegunda)
                    || (dadosArr.qtde_tercas && dayOfWeek == 'terca' && dadosArr.qtde_tercas > countTerca)
                    || (dadosArr.qtde_quartas && dayOfWeek == 'quarta' && dadosArr.qtde_quartas > countQuarta)
                    || (dadosArr.qtde_quintas && dayOfWeek == 'quinta' && dadosArr.qtde_quintas > countQuinta)
                    || (dadosArr.qtde_sextas && dayOfWeek == 'sexta' && dadosArr.qtde_sextas > countSexta)
                    || (dadosArr.qtde_sabados && dayOfWeek == 'sabado' && dadosArr.qtde_sabados > countSabado)
                    || (dadosArr.qtde_domingos && dayOfWeek == 'domingo' && dadosArr.qtde_domingos > countDomingo)
                ) {
                    if (props.modoDigitacao == 'entradaIntervaloSaida') {
                        console.log('entradaIntervaloSaida')
                        console.log(dadosArr.modo1Intervalo1)
                        inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`] = {
                            ...inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`],
                            entrada: dadosArr.modo1Entrada,
                            inicio_intervalo: dadosArr.modo1Intervalo1,
                            fim_intervalo: dadosArr.modo1Intervalo2,
                            saida: dadosArr.modo1Saida,
                        };
                    }

                    if (props.modoDigitacao == 'entradaSaidaIntervalo') {
                        console.log('entradaSaidaIntervalo')
                        inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`] = {
                            ...inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`],
                            entrada: dadosArr.modo2Entrada,
                            inicio_intervalo: dadosArr.modo2Intervalo,
                            saida: dadosArr.modo2Saida,
                        };
                    }

                    if (dayOfWeek == 'segunda' && dadosArr.qtde_segundas < 5) {
                        countSegunda++
                    }
                    if (dayOfWeek == 'terca' && dadosArr.qtde_tercas < 5) {
                        countTerca++
                    }
                    if (dayOfWeek == 'quarta' && dadosArr.qtde_quartas < 5) {
                        countQuarta++
                    }
                    if (dayOfWeek == 'quinta' && dadosArr.qtde_quintas < 5) {
                        countQuinta++
                    }
                    if (dayOfWeek == 'sexta' && dadosArr.qtde_sextas < 5) {
                        countSexta++
                    }
                    if (dayOfWeek == 'sabado' && dadosArr.qtde_sabados < 5) {
                        countSabado++
                    }
                    if (dayOfWeek == 'domingo' && dadosArr.qtde_domingos < 5) {
                        countDomingo++
                    }
                }

                if ((dadosArr.qtde_descansos && dadosArr.qtde_descansos > countDescanso) && (
                    (inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`]?.considerar_como == 'Descanso')
                    || (!inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`] && dayOfWeek == 'domingo')
                )) {

                    if (props.modoDigitacao == 'entradaIntervaloSaida') {
                        console.log('entradaIntervaloSaida2')
                        console.log(dadosArr.modo1Intervalo1)
                        inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`] = {
                            ...inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`],
                            entrada: dadosArr.modo1Entrada,
                            inicio_intervalo: dadosArr.modo1Intervalo1,
                            fim_intervalo: dadosArr.modo1Intervalo2,
                            saida: dadosArr.modo1Saida,
                            considerar_como: 'Descanso',
                        };
                    }
                    if (props.modoDigitacao == 'entradaSaidaIntervalo') {
                        console.log('entradaSaidaIntervalo2')
                        inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`] = {
                            ...inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`],
                            entrada: dadosArr.modo2Entrada,
                            inicio_intervalo: dadosArr.modo2Intervalo,
                            saida: dadosArr.modo2Saida,
                            considerar_como: 'Descanso',
                        };
                    }

                    if (dadosArr.qtde_descansos < 5) {
                        countDescanso++
                    }
                }

                if (dadosArr.qtde_feriados && dadosArr.qtde_feriados > countFeriado
                    && inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`]?.feriado) {

                    if (props.modoDigitacao == 'entradaIntervaloSaida') {
                        console.log('entradaIntervaloSaida3')
                        console.log(dadosArr.modo1Intervalo1)
                        inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`] = {
                            ...inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`],
                            entrada: dadosArr.modo1Entrada,
                            inicio_intervalo: dadosArr.modo1Intervalo1,
                            fim_intervalo: dadosArr.modo1Intervalo2,
                            saida: dadosArr.modo1Saida,
                        };
                    }
                    if (props.modoDigitacao == 'entradaSaidaIntervalo') {
                        console.log('entradaSaidaIntervalo3')
                        inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`] = {
                            ...inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`],
                            entrada: dadosArr.modo2Entrada,
                            inicio_intervalo: dadosArr.modo2Intervalo,
                            saida: dadosArr.modo2Saida,
                        };
                    }

                    if (dadosArr.qtde_feriados < 5) {
                        countFeriado++
                    }
                }

            }

            if (dadosArr.tipo_repeticao == 'revezamento') {
                if (dadosArr.revezamento_dias_sim == countRevezamentoSim && dadosArr.revezamento_dias_nao > countRevezamentoNao) {
                    inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`] = {
                        ...inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`],
                        entrada: '',
                        inicio_intervalo: '',
                        fim_intervalo: '',
                        saida: '',
                    };

                    countRevezamentoNao++
                }

                if (dadosArr.revezamento_dias_sim > countRevezamentoSim) {
                    console.log(dadosArr.modo1Intervalo1)
                    if (props.modoDigitacao == 'entradaIntervaloSaida') {
                        console.log('entradaIntervaloSaida4')
                        inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`] = {
                            ...inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`],
                            entrada: dadosArr.modo1Entrada,
                            inicio_intervalo: dadosArr.modo1Intervalo1,
                            fim_intervalo: dadosArr.modo1Intervalo2,
                            saida: dadosArr.modo1Saida,
                        };
                    }
                    if (props.modoDigitacao == 'entradaSaidaIntervalo') {
                        console.log('entradaSaidaIntervalo4')
                        inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`] = {
                            ...inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`],
                            entrada: dadosArr.modo2Entrada,
                            inicio_intervalo: dadosArr.modo2Intervalo,
                            saida: dadosArr.modo2Saida,
                        };
                    }

                    countRevezamentoSim++
                }

                if (dadosArr.revezamento_dias_nao == countRevezamentoNao) {
                    countRevezamentoSim = countRevezamentoNao = 0
                }
            }

            if (dadosArr.tipo_repeticao == 'apagar') {
                inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`] = {
                    ...inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`],
                    entrada: '',
                    inicio_intervalo: '',
                    fim_intervalo: '',
                    saida: '',
                };
            }
        }

        if (dadosArr.tipoModal == 2) {

            if (dadosArr.tipo_repeticao == 'repetir') {
                if (
                    (dadosArr.ckDescanso1 && dayOfWeek == 'segunda')
                    || (dadosArr.ckDescanso2 && dayOfWeek == 'terca')
                    || (dadosArr.ckDescanso3 && dayOfWeek == 'quarta')
                    || (dadosArr.ckDescanso4 && dayOfWeek == 'quinta')
                    || (dadosArr.ckDescanso5 && dayOfWeek == 'sexta')
                    || (dadosArr.ckDescanso6 && dayOfWeek == 'sabado')
                    || (dadosArr.ckDescanso7 && dayOfWeek == 'domingo')
                    || (dadosArr.ckDescanso8 && inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`]?.feriado)
                ) {
                    inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`] = {
                        ...inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`],
                        considerar_como: 'Descanso',
                    };
                }
            }


            if (dadosArr.tipo_repeticao == 'revezamento') {
                if (dadosArr.revezamento_dias_sim == countRevezamentoSim && dadosArr.revezamento_dias_nao > countRevezamentoNao) {
                    inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`] = {
                        ...inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`],
                        considerar_como: 'Trabalho',
                    };

                    countRevezamentoNao++
                }

                if (dadosArr.revezamento_dias_sim > countRevezamentoSim) {
                    inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`] = {
                        ...inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`],
                        considerar_como: 'Descanso',
                    };

                    countRevezamentoSim++
                }

                if (dadosArr.revezamento_dias_nao == countRevezamentoNao) {
                    countRevezamentoSim = countRevezamentoNao = 0
                }
            }

            if (dadosArr.tipo_repeticao == 'apagar') {
                inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`] = {
                    ...inputValues.value[`${arrData[2]}/${arrData[1]}/${arrData[0]}`],
                    considerar_como: 'Trabalho',
                };
            }
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }
}

watch(selectedOption, () => {
    const year = parseInt(selectedOption.value.slice(0, 4));
    const month = parseInt(selectedOption.value.slice(4, 6));

    updateDaysInMonth(year, month);
});
watch(() => props.arrRepeticaoHorarios,
    (dadosArr) => {
        console.log("dadosArr:-----------------------------------------------", dadosArr);
        listaEntreDatas(dadosArr.repeticaoDataInicial, dadosArr.repeticaoDataFinal, dadosArr);
    },
)

onMounted(() => {
    console.log('cponto20')
    selectedOption.value = Object.keys(arrMeses)[0];
})
</script>

<template>
    <div class="card-body">

        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 class="h4 mb-0" style="margin-top:-25px;">Cartão de Ponto</h2>

            <table style="width:180px;">
                <tr>
                    <td>
                        <button class="btn btn-secondary btn-outline-secondary" style="width:10px;"
                            @click="anterior">&lt;</button>
                    </td>
                    <td>
                        <select id="select-options" v-model="selectedOption" class="form-select"
                            style="width:150px; height: 45px;">
                            <option v-for="(value, key) in arrMeses" :value="key" :key="key">{{ value }}</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn btn-secondary btn-outline-secondary" style="width:10px;"
                            @click="proxima">></button>
                    </td>
                </tr>
            </table>
        </div>

        <div class="row g-3 g-sm-4 mt-0 mt-lg-2 ">
            <table>
                <tr>
                    <td></td>
                    <td>Data</td>
                    <td>Entrada</td>
                    <td v-if="modoDigitacao==='entradaIntervaloSaida'">Início Intervalo</td>
                    <td v-if="modoDigitacao==='entradaIntervaloSaida'">Fim Intervalo</td>
                    <td>Saída</td>
                    <td v-if="modoDigitacao==='entradaSaidaIntervalo'">Intervalo</td>

                    <td>Considerar como:</td>
                </tr>

                <tr v-for="(dayInfo, key) in daysInMonth" :key='key'>
                    <td :class="{ 'descanso': inputValues[dayInfo.formattedDate]['considerar_como'] === 'Descanso' }">{{
                        dayInfo.formattedDayOfWeek }}</td>
                    <td :class="{ 'descanso': inputValues[dayInfo.formattedDate]['considerar_como'] === 'Descanso' }">{{
                        dayInfo.formattedDate }}</td>
                    <td>
                        <input :disabled='!editavel' type="text" class="form-control" maxlength="5"
                            :class="{ 'hora-invalida': hasInputError(dayInfo.formattedDate, 'entrada') }"
                            v-model="inputValues[dayInfo.formattedDate]['entrada']"
                            @input="processarHora($event, dayInfo.formattedDate, 'entrada')"
                            @blur="updateInputValue(dayInfo.formattedDate, 'entrada', $event.target.value)">
                    </td>

                    <td v-if="modoDigitacao==='entradaIntervaloSaida'">
                        <input :disabled='!editavel' type="text" class="form-control" maxlength="5"
                            :class="{ 'hora-invalida': hasInputError(dayInfo.formattedDate, 'inicio_intervalo') }"
                            v-model="inputValues[dayInfo.formattedDate]['inicio_intervalo']"
                            @input="processarHora($event, dayInfo.formattedDate, 'inicio_intervalo')"
                            @blur="updateInputValue(dayInfo.formattedDate, 'inicio_intervalo', $event.target.value)">
                    </td>

                    <td v-if="modoDigitacao==='entradaIntervaloSaida'">
                        <input :disabled='!editavel' type="text" class="form-control" maxlength="5"
                            :class="{ 'hora-invalida': hasInputError(dayInfo.formattedDate, 'fim_intervalo') }"
                            v-model="inputValues[dayInfo.formattedDate]['fim_intervalo']"
                            @input="processarHora($event, dayInfo.formattedDate, 'fim_intervalo')"
                            @blur="updateInputValue(dayInfo.formattedDate, 'fim_intervalo', $event.target.value)">
                    </td>

                    <td>
                        <input :disabled='!editavel' type="text" class="form-control" maxlength="5"
                            :class="{ 'hora-invalida': hasInputError(dayInfo.formattedDate, 'saida') }"
                            v-model="inputValues[dayInfo.formattedDate]['saida']"
                            @input="processarHora($event, dayInfo.formattedDate, 'saida')"
                            @blur="updateInputValue(dayInfo.formattedDate, 'saida', $event.target.value)">
                    </td>

                    <td v-if="modoDigitacao==='entradaSaidaIntervalo'">
                        <input :disabled='!editavel' type="text" class="form-control" maxlength="5"
                            :class="{ 'hora-invalida': hasInputError(dayInfo.formattedDate, 'inicio_intervalo') }"
                            v-model="inputValues[dayInfo.formattedDate]['inicio_intervalo']"
                            @input="processarHora($event, dayInfo.formattedDate, 'inicio_intervalo')"
                            @blur="updateInputValue(dayInfo.formattedDate, 'inicio_intervalo', $event.target.value)">
                    </td>

                    <td>
                        <select :disabled='!editavel' class="form-select" v-model="inputValues[dayInfo.formattedDate]['considerar_como']">
                            <option value="Trabalho">Trabalho</option>
                            <option value="Descanso">Descanso</option>
                            <option value="Falta">Falta</option>
                            <option value="Falta Justificada">Falta Justificada</option>
                        </select>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<style scoped>
.form-control {
    width: 70px;
    border: 1px #ddd solid;
    height: 20px;
    border-radius: 5px;
}

.form-select {
    background-color: #fff;
    border: 1px #ddd solid;
    height: 30px;
    border-radius: 5px;
    padding: 0px;
    padding-left: 7px;
}

input.hora-invalida {
    border: 1px solid red;
    background-color: #ffdddd;
}

.descanso {
    color: #e79a19 !important;
    font-weight: 700;
}
</style>
