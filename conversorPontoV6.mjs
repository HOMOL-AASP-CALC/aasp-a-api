import fs from "fs";
import path from "path";
import randomstring from "randomstring";
import { fileURLToPath } from "url";

// Suporte ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fsAsync = fs.promises;

// ---------------------------------------------------------------------
//  CONSTANTES E ESTRUTURAS BASE
// ---------------------------------------------------------------------

// Estrutura vazia para cada dia (6 pares de e/s)
const ESTRUTURA_DIA_VAZIA = {
    h: [
        { e: "", s: "", m: "t" },
        { e: "", s: "", m: "t" },
        { e: "", s: "", m: "t" },
        { e: "", s: "", m: "t" },
        { e: "", s: "", m: "t" },
        { e: "", s: "", m: "t" }
    ],
    c: {
        du: true,
        atividade: "u",
        s: 0,
        f: false
    }
};

// Estrutura mínima do cartão de ponto
function criarEstruturaCartaoBase() {
    return {
        tipo: "cartaoPonto",
        idCalc: null,
        hash: "",
        idDono: null,
        email: "",
        nome: "novo cartão de ponto",
        intervalos: 2,
        periodoAquisitivo: 1,
        metodologia: "d",

        percentuaisHE: [
            { inicio: "", fim: "", ate2: "50", ate3: "50", ate4: "50", ate5: "50", ate6: "50", folga: "100" }
        ],

        periodoNoturno: [
            { inicio: "", fim: "", horai: "22:00", horaf: "05:00" }
        ],

        jornada: [
            { inicio: "", fim: "", seg: "08:00", ter: "08:00", qua: "08:00", qui: "08:00", sex: "08:00", sab: "04:00", dom: "00:00", folga: "00:00" }
        ],

        jornadas: [
            { inicio: "", fim: "", jornada: "44:00", ate10: "50", ate20: "50", ate30: "50", ate40: "50", ate50: "50", ate60: "50" }
        ],

        cartao: {},

        dataCriacao: new Date().toISOString().replace(/[-:TZ]/g, "").substring(0, 12),
        editavel: true
    };
}

// ---------------------------------------------------------------------
//  HELPERS
// ---------------------------------------------------------------------

function mkdirIfNotExists(dir) {
    return fsAsync.mkdir(dir, { recursive: true }).catch(err => {
        if (err.code !== "EEXIST") throw err;
    });
}

function timeToMinutes(str) {
    if (!str || !str.includes(":")) return 0;
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
}

function addMinutes(str, mins) {
    if (!str.includes(":")) return str;
    const [h, m] = str.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m + mins, 0, 0);

    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function getCustomDayIndex(yyyymmdd) {
    const y = Number(yyyymmdd.slice(0, 4));
    const m = Number(yyyymmdd.slice(4, 6));
    const d = Number(yyyymmdd.slice(6, 8));
    return new Date(y, m - 1, d).getDay();
}

function getDaysInMonth(yyyymmdd) {
    const y = Number(yyyymmdd.slice(0, 4));
    const m = Number(yyyymmdd.slice(4, 6));
    return new Date(y, m, 0).getDate();
}

function dia2intMesAno(yyyymmdd) {
    const y = Number(yyyymmdd.slice(0, 4));
    const m = Number(yyyymmdd.slice(4, 6));
    return y * 12 + m;
}

// ---------------------------------------------------------------------
//  FUNÇÃO PRINCIPAL
// ---------------------------------------------------------------------

export async function converterPontoParaCartaoPonto(idCartao, idDono = 85) {
    const baseDir = path.resolve(__dirname, "../calculos_trabalhista_antigo");
    const baseDirDestino = path.resolve(__dirname, "../calculos_atualiza");
    const pasta = Math.floor(idCartao / 10000);
    const dirPasta = path.join(baseDir, String(pasta));
    const dirPastaDestino = path.join(baseDirDestino, String(pasta));

    await mkdirIfNotExists(dirPasta);
    await mkdirIfNotExists(dirPastaDestino);

    const arquivoEntrada = path.join(dirPasta, `${idCartao}.ponto`);
    console.log(`🔄 Convertendo entrada ${arquivoEntrada}...`);

    const arquivoSaida = path.join(dirPastaDestino, `${idCartao}.cartaoPonto`);

    let pontoData;
    try {
        pontoData = await fsAsync.readFile(arquivoEntrada, "utf8");
        // exibir 3 primeiras linhas
        console.log(pontoData.split(/\r?\n/).slice(0, 3).join("\n"));
    } catch (err) {
        console.error(`❌ Arquivo ${arquivoEntrada} não encontrado.`, err.message);
        return null;
    }

    // Criar nova estrutura base (sem contaminar próxima execução)
    const estrutura = criarEstruturaCartaoBase();
    estrutura.idDono = idDono;
    estrutura.hash = randomstring.generate({ length: 12 });

    // Coletores
    const punchesByDate = {};
    const periodsSet = new Set();

    let idCalc = null;
    let nome = "Sem Nome";
    let modoDigitacao = 0;
    let dspNoturno = 0;
    let dspJornada = 0;
    let dataInicial = null;
    let dataFinal = null;

    const percdia = {};
    const percnight = {};
    const jornada = {};

    // Regex
    const punchRX = /^(e|s)(\d+)_(\d{8})=(.*)$/;
    const metaRX = /^([a-zA-Z_]+)=(.*)$/; //versao anterior /^(\w+)=(.*)$/;
    const percdiaRX = /^(percdia(ini|fim|2|3|4|5|6|folga))_(\d+)=(.*)$/;
    const notRX = /^(hrnoturno_(dataini|datafim|horaini|horafim))_(\d+)=(.*)$/;
    const jordRX = /^(jordia_(ini|fim|seg|ter|qua|qui|sex|sab|dom|desc))_(\d+)=(.*)$/;

    let maxPerc = 0;
    let maxNot = 0;
    let maxJord = 0;

    // ---------------------------------------------------------------------
    //    PARSE DO ARQUIVO
    // ---------------------------------------------------------------------
    const lines = pontoData.split(/\r?\n/);
    for (const ln of lines) {
        const line = ln.trim();
        if (!line) continue;

        let m;

        // e1/s1/e2/s2...
        if ((m = line.match(punchRX))) {
            const tipo = m[1];
            const idx = Number(m[2]);
            const date = m[3];
            const val = m[4].trim();

            //todo: verificar necessidade
            // if (!punchesByDate[date]) punchesByDate[date] = {};
            // punchesByDate[date][`${tipo}${idx}`] = val;
            // periodsSet.add(date.slice(0, 6));

            // Sempre considerar o dia, mesmo vazio
            if (!punchesByDate[date]) punchesByDate[date] = {};

            punchesByDate[date][`${tipo}${idx}`] = val; // pode ser ""

            periodsSet.add(date.slice(0, 6));

            continue;
        }

        // Metadados básicos
        if ((m = line.match(metaRX))) {
            const k = m[1];
            const v = m[2].trim();

            if (k === "id_calc") idCalc = Number(v);
            else if (k === "nome") nome = v;
            else if (k === "modo_digitacao") modoDigitacao = Number(v);
            else if (k === "dsphorario_noturno") dspNoturno = Number(v);
            else if (k === "dspjornadadiaria") dspJornada = Number(v);

            continue;
        }



        // percentuais dia
        if ((m = line.match(percdiaRX))) {
            const tipo = m[2];
            const idx = Number(m[3]);
            const val = m[4].trim();

            if (!percdia[idx]) percdia[idx] = {};

            let key;
            if (tipo === "ini") key = "inicio";
            else if (tipo === "fim") key = "fim";
            else if (tipo === "folga") key = "folga";
            else key = "ate" + tipo;

            percdia[idx][key] = val;
            maxPerc = Math.max(maxPerc, idx);
            continue;
        }

        // noturno
        if ((m = line.match(notRX))) {
            const tipo = m[2];
            const idx = Number(m[3]);
            const val = m[4].trim();

            if (!percnight[idx]) percnight[idx] = {};

            let key;
            if (tipo === "dataini") key = "inicio";
            else if (tipo === "datafim") key = "fim";
            else if (tipo === "horaini") key = "horai";
            else key = "horaf";

            percnight[idx][key] = val;
            maxNot = Math.max(maxNot, idx);
            continue;
        }

        // jornada diária
        if ((m = line.match(jordRX))) {
            const tipo = m[2];
            const idx = Number(m[3]);
            const val = m[4].trim();

            if (!jornada[idx]) jornada[idx] = {};

            let key;
            if (tipo === "ini") key = "inicio";
            else if (tipo === "fim") key = "fim";
            else if (tipo === "desc") key = "folga";
            else key = tipo; // seg/ter/qua...

            jornada[idx][key] = val;
            maxJord = Math.max(maxJord, idx);
            continue;
        }
    }

    estrutura.idCalc = idCalc;
    estrutura.nome = nome;

    // ---------------------------------------------------------------------
    //  MODO DIGITACAO = 1 (gerar e1/s1/e2)
    // ---------------------------------------------------------------------
    if (modoDigitacao === 1) {
        for (const dt of Object.keys(punchesByDate)) {
            const p = punchesByDate[dt];
            const e1 = p.e1;
            const s1_dur = p.s1;
            const s2 = p.s2;

            if (e1 && s1_dur && s2) {
                const durMin = timeToMinutes(s1_dur);

                const s1_calc = addMinutes(e1, 240);
                const e2_calc = addMinutes(s1_calc, durMin);

                punchesByDate[dt] = {
                    e1,
                    s1: s1_calc,
                    e2: e2_calc,
                    s2
                };
            }

            //todo: verificar necessidade
            // else {
            //     punchesByDate[dt] = {};
            // }
        }
    }

    // ---------------------------------------------------------------------
    //   Percentuais HE
    // ---------------------------------------------------------------------
    if (maxPerc > 0) {
        estrutura.percentuaisHE = [];
        for (let i = 1; i <= maxPerc; i++) {
            const c = percdia[i] || {};
            estrutura.percentuaisHE.push({
                inicio: c.inicio || "",
                fim: c.fim || "",
                ate2: c.ate2 || "0",
                ate3: c.ate3 || "0",
                ate4: c.ate4 || "0",
                ate5: c.ate5 || "0",
                ate6: c.ate6 || "0",
                folga: c.folga || "0"
            });
        }
    }

    // ---------------------------------------------------------------------
    //   Período noturno
    // ---------------------------------------------------------------------
    if (dspNoturno === 1 && maxNot > 0) {
        estrutura.periodoNoturno = [];
        for (let i = 1; i <= maxNot; i++) {
            const c = percnight[i] || {};
            estrutura.periodoNoturno.push({
                inicio: c.inicio || "",
                fim: c.fim || "",
                horai: c.horai || "",
                horaf: c.horaf || ""
            });
        }
    }

    // ---------------------------------------------------------------------
    //   Jornada diária
    // ---------------------------------------------------------------------
    if (dspJornada === 1 && maxJord > 0) {
        estrutura.jornada = [];
        for (let i = 1; i <= maxJord; i++) {
            const c = jornada[i] || {};
            estrutura.jornada.push({
                inicio: c.inicio || "",
                fim: c.fim || "",
                seg: c.seg || "00:00",
                ter: c.ter || "00:00",
                qua: c.qua || "00:00",
                qui: c.qui || "00:00",
                sex: c.sex || "00:00",
                sab: c.sab || "00:00",
                dom: c.dom || "00:00",
                folga: c.folga || "00:00"
            });
        }
    }

    // ---------------------------------------------------------------------
    //  Construção do cartão diário
    // ---------------------------------------------------------------------
    const meses = [...periodsSet].sort();

    for (const ym of meses) {
        const keyPeriodo = String(dia2intMesAno(`${ym}01`));
        const dias = getDaysInMonth(`${ym}01`);

        estrutura.cartao[keyPeriodo] = {};

        // pré-preencher mês
        for (let d = 1; d <= dias; d++) {
            const diaStr = String(d);
            const ymd = `${ym}${String(d).padStart(2, "0")}`;

            const clone = JSON.parse(JSON.stringify(ESTRUTURA_DIA_VAZIA));

            const dow = getCustomDayIndex(ymd);
            const weekend = dow === 0 || dow === 6;

            clone.c.s = dow;
            clone.c.du = dow !== 0;
            clone.c.atividade = dow === 0 ? "d" : "u";
            clone.c.f = weekend;

            estrutura.cartao[keyPeriodo][diaStr] = clone;
        }

        // sobrescrever com batidas
        for (let d = 1; d <= dias; d++) {
            const ymd = `${ym}${String(d).padStart(2, "0")}`;
            const batidas = punchesByDate[ymd];
            if (!batidas) continue;

            const diaStr = String(d);
            const arr = estrutura.cartao[keyPeriodo][diaStr].h;

            const pares = [];

            for (let i = 1; i <= 6; i++) {
                const e = batidas[`e${i}`];
                const s = batidas[`s${i}`];
                if (e || s) {
                    pares.push({ e: e || "", s: s || "", m: "t" });
                }
            }

            for (let i = 0; i < 6; i++) {
                if (pares[i]) arr[i] = pares[i];
            }
        }
    }

    // ---------------------------------------------------------------------
    // SALVAR ARQUIVO JSON
    // ---------------------------------------------------------------------

   //adicionar no final da estrutura "convertido: "v5"
    estrutura.convertido = "v5";

    try {
        await fsAsync.writeFile(arquivoSaida, JSON.stringify(estrutura, null, 4), "utf8");
        console.log(`✅ Cartão ${idCartao} convertido: ${arquivoSaida}`);
        return true;
    } catch (err) {
        console.error("❌ Erro idponto", idCartao," ao salvar JSON:", err.message);
        return false;
    }
}
