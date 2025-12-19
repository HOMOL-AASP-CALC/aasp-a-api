// javascript
import fs from 'fs';
// import path from 'path';
import { createPool } from 'mysql2/promise';
import pLimit from "p-limit";
import { config } from 'dotenv';

import { converterPontoParaCartaoPonto } from './conversorPontoV6.mjs';
// import { geraHtm } from "./conversorHtm.js";
import axios from "axios";

const fsAsync = fs.promises;

config();

/* ---------------------------------------
   CONFIGURAÇÕES
---------------------------------------- */
// const BASE_PATH = '../calcs';
const LOG_FILE = './processamento.log';

//TODO: ajustar concorrência conforme capacidade do servidor
const USER_CONCURRENCY = 4//4;   // usuários em paralelo
const FILE_CONCURRENCY = 10//10;  // arquivos por usuário em paralelo

// pool MySQL otimizado (usar versão promise)
const mysql_info = {
    host: process.env.MYSQL_host,
    user: process.env.MYSQL_user,
    password: process.env.MYSQL_password2,
    database: process.env.MYSQL_database,
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let db = null;
function handleDisconnect2() {
    // usar createPool da API promise
    db = createPool(mysql_info);
}

handleDisconnect2();


/* ---------------------------------------
   LOG BUFFERIZADO (não trava o Node)
---------------------------------------- */
let logBuffer = [];

function logar(msg) {
    logBuffer.push(`${new Date().toISOString()} - ${msg}`);
}

setInterval(async () => {
    if (!logBuffer.length) return;
    const lote = logBuffer.join("\n") + "\n";
    logBuffer = [];
    await fs.promises.appendFile(LOG_FILE, lote);
}, 1000);

/* ---------------------------------------
   UTIL: verificar existência do arquivo
---------------------------------------- */
async function existeArquivo(filePath) {
    try {
        await fs.promises.access(filePath);
        return true;
    } catch {
        return false;
    }
}

/* ---------------------------------------
   PROCESSAMENTO DE UM ARQUIVO
---------------------------------------- */
async function processarArquivo(idLogin, id) {
    const numPasta2 = Math.floor(id / 10000);
    const dir = `../calculos_trabalhista_antigo/${numPasta2}`;

    try {
        // garante que a pasta exista
        await fsAsync.mkdir(dir, { recursive: true });

        //faz chamada para api, que gera o HTML antigo
        const resp = await executarAPI('/gera-htm/'+id, { idCalculo: id });

        const fileDataStr = resp.data?.htmlResposta;
        //gerar arquivo .htm
        await fsAsync.writeFile(`../calculos_trabalhista_antigo/${numPasta2}/${id}.cartaoPonto.html`, fileDataStr, { flag: 'w+' });
        //gerar arquivo .ponto
        const pontoDataStr = resp.data?.pontoResposta;
        await fsAsync.writeFile(`../calculos_trabalhista_antigo/${numPasta2}/${id}.ponto`, pontoDataStr, { flag: 'w+' });

        //faz chamada para api que converter para v6
        const convertido = await converterPontoParaCartaoPonto(id, idLogin);

        if(convertido){
            //no banco, remove versao 5, e adiciona tipo 6
            const qUpTipo = `UPDATE calculos.cartaoPonto SET versao=6, tipo=6
                    WHERE id_login='${idLogin}'
                      AND id='${id}'`
            await db.query(qUpTipo)
        }
        //apagar arquivo ponto
        await fsAsync.unlink(`../calculos_trabalhista_antigo/${numPasta2}/${id}.ponto`);

        logar(`OK: user ${idLogin} - ${id}`);
    } catch (err) {
        logar(`ERRO: user ${idLogin} - ${id} - ${err.message}`);
    }
}

const api = axios.create({ timeout: 15000 });
const API_URL = process.env.servidorAPI3;
async function executarAPI(endpoint, payload) {
    if (!API_URL) {
        throw new Error("API_URL não definida (VITE_API3_URL ou API3_URL).");
    }

    console.log(`🔗 API: ${API_URL}/cponto${endpoint}`);

    // retry exponencial: 3 tentativas
    let delay = 1000;
    for (let i = 0; i < 3; i++) {
        try {
            return await api.post(`${API_URL}/cponto${endpoint}`, payload);
        } catch (err) {
            if (i === 2) throw err;
            await new Promise((res) => setTimeout(res, delay));
            delay *= 2;
        }
    }
}

/* ---------------------------------------
   PROCESSAR UM USUÁRIO
---------------------------------------- */
async function processarUsuario(idLogin, ids) {
    console.log(`👤 Usuário ${idLogin} (${ids.length} cálculos)...`);

    const limit = pLimit(FILE_CONCURRENCY);

    await Promise.all(
        ids.map(id => limit(() => processarArquivo(idLogin, id)))
    );

    // evita starvation — libera o loop
    await new Promise(res => setImmediate(res));
}

/* ---------------------------------------
   PILHA DE CONCORRÊNCIA ENTRE USUÁRIOS
---------------------------------------- */
async function processarListaComConcorrencia(lista, concorrencia, fn) {
    let i = 0;

    const workers = Array.from({ length: concorrencia }, async () => {
        while (i < lista.length) {
            const item = lista[i++];
            await fn(item);
            await new Promise(res => setImmediate(res)); // evita empacotamento
        }
    });

    await Promise.all(workers);
}

/* ---------------------------------------
   FUNÇÃO PRINCIPAL
---------------------------------------- */
async function processarCartoes() {
    console.log('🔍 Buscando IDs ativos no banco...');

    //TODO: remover o idlogin para pegar todo mundo e id do ponto
    // versao = 5
    const [rows] = await db.query(`
        SELECT id_login, id
        FROM calculos.cartaoPonto
        WHERE lixo >= 1 AND
         id_login in (721035) AND
         id <= 10400000 AND
         tipo != 6
        ORDER BY id_login
    `);

    console.log(`✅ ${rows.length} registros encontrados.`);

    // Agrupar por usuário
    const usuarios = new Map();
    for (const r of rows) {
        if (!usuarios.has(r.id_login)) usuarios.set(r.id_login, []);
        usuarios.get(r.id_login).push(r.id);
    }

    const userEntries = Array.from(usuarios.entries());

    console.log(`👥 ${userEntries.length} usuários para processar.`);

    // Processamento com concorrência
    await processarListaComConcorrencia(
        userEntries,
        USER_CONCURRENCY,
        async ([idLogin, ids]) => {
            await processarUsuario(idLogin, ids);
        }
    );

    console.log('🏁 Processamento concluído.');

    await db.end();
}

/* ---------------------------------------
   EXECUÇÃO
---------------------------------------- */
processarCartoes().catch(err => {
    console.error('❌ Erro geral:', err);
    logar(`FATAL: ${err.message}`);
});
