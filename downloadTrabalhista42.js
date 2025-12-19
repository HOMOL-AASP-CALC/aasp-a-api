require('dotenv').config();

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const mysql = require('mysql2/promise');

const BASE_OUTPUT_DIR =  process.env.pasta_trabalhista_antigo; //. '/Users/mrozgrin/calculos_atualiza';
const DOWNLOAD_DELAY_MS = 0;
const PDF_URL_TEMPLATE = 'https://legacy.debit.com.br/trabalhista4/pdf.php?id_calc=';
const PDF_URL_TEMPLATE_HTML = 'https://legacy.debit.com.br/trabalhista4/html.php?id_calc=';
const MATA_URL = 'https://legacy.debit.com.br/trabalhista4/assassino2.php?id=';


async function createPool() {
  const password = process.env.MYSQL_password2;
  if (!password) {
    throw new Error('Variável de ambiente MYSQL_password não configurada.');
  }

  const pool = await mysql.createPool({
    host: process.env.MYSQL_host,
    user: process.env.MYSQL_user,
    password,
    database: process.env.MYSQL_database,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
  });

  return pool;
}

function calcularPasta(idCalculo) {
  return Math.floor(idCalculo / 10000).toString();
}

async function garantirPasta(caminhoPasta) {
  await fs.promises.mkdir(caminhoPasta, { recursive: true });
}

async function baixarPdf(idCalculo) {
  const url = `${PDF_URL_TEMPLATE}${idCalculo}`;
  const urlHTML = `${PDF_URL_TEMPLATE_HTML}${idCalculo}`;
  const pasta = calcularPasta(idCalculo);
  const destinoPasta = path.join(BASE_OUTPUT_DIR, pasta);
  await garantirPasta(destinoPasta);

  const destinoArquivo = path.join(destinoPasta, `${idCalculo}.t4.pdf`);
  const destinoArquivoHTML = path.join(destinoPasta, `${idCalculo}.t4.html`);
  const urlMATA = `${MATA_URL}${idCalculo}`;

  console.log(`PDF ${idCalculo}`);
  const resposta = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
  await fs.promises.writeFile(destinoArquivo, resposta.data);

  const resposta2 = await axios.get(urlHTML, { responseType: 'arraybuffer', timeout: 60000 });
  await fs.promises.writeFile(destinoArquivoHTML, resposta2.data);
  const resposta3 = await  axios.get(urlMATA, { responseType: 'arraybuffer', timeout: 60000 });
  console.log(resposta3.data.toString('utf-8'));
}

async function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function executar() {
  const pool = await createPool();

  try {
    const [registros] = await pool.query('SELECT id FROM lista_calculo WHERE tipo = ? and lixo=0 ORDER BY id ASC limit 50000', ['t4']);

    console.log(`Encontrados ${registros.length} cálculos do tipo t4.`);

    for (let index = 0; index < registros.length; index += 1) {
      const { id } = registros[index];
      const idCalculo = Number(id);
      if (!Number.isFinite(idCalculo)) {
        console.warn(`ID inválido recebido: ${id}`);
        continue;
      }

      try {
        await baixarPdf(idCalculo);
        await pool.query(`UPDATE lista_calculo SET tipo="T41" WHERE id = ${idCalculo}`);
      } catch (erroDownload) {
        console.error(`Falha ao baixar cálculo ${id}:`, erroDownload.message || erroDownload);
      }

      if (index < registros.length - 1) {
        await esperar(DOWNLOAD_DELAY_MS);
      }
    }
  } catch (erroConsulta) {
    console.error('Erro ao consultar a tabela lista_calculo:', erroConsulta.message || erroConsulta);
  } finally {
    await pool.end();
  }
}

executar().catch((erro) => {
  console.error('Erro não tratado:', erro.message || erro);
});
