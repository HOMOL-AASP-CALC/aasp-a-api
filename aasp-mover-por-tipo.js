/**
 * aasp-mover-por-tipo.js
 *
 * Percorre recursivamente a pasta de origem (SRC_ROOT), localiza arquivos cujo
 * nome começa com um código numérico (ex: 281018.a1.pdf), consulta a tabela
 * `atualizacaoMonetaria` no MySQL para descobrir o id_login do registro, depois
 * verifica na tabela `login` se login.tipo = '6'. Caso positivo, move o arquivo
 * para a pasta de destino (DST_ROOT) espelhando toda a estrutura de subpastas.
 *
 * Uso:
 *   node aasp-mover-por-tipo.js [opções]
 *
 * Opções:
 *   --dry-run          Apenas simula, não move nenhum arquivo
 *   --limit N          Processa no máximo N arquivos
 *   --concurrency N    Número de operações paralelas (padrão: 10)
 *   --ext .pdf         Extensão de arquivo a filtrar (padrão: qualquer)
 *   --src /caminho     Sobrescreve SRC_ROOT do .env
 *   --dst /caminho     Sobrescreve DST_ROOT do .env
 *
 * Variáveis de ambiente (.env):
 *   MYSQL_host
 *   MYSQL_user
 *   MYSQL_password
 *   MYSQL_database          banco onde está a tabela atualizacaoMonetaria (ex: calculos)
 *   MYSQL_database_login    banco onde está a tabela login (ex: debit)
 *   SRC_ROOT                pasta raiz de origem  (ex: ~/calculos_atualiza_antigo)
 *   DST_ROOT                pasta raiz de destino (ex: ~/aasp_atualiza_antigo)
 */

"use strict";

require("dotenv").config();

const fs   = require("fs");
const fsp  = require("fs/promises");
const path = require("path");
const mysql = require("mysql2/promise");
const os   = require("os");

// ─── helpers de CLI ──────────────────────────────────────────────────────────

function argValue(flag, def = null) {
  const i = process.argv.indexOf(flag);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  if (!v || v.startsWith("--")) return def;
  return v;
}
function hasFlag(flag) {
  return process.argv.includes(flag);
}

// ─── configuração ────────────────────────────────────────────────────────────

const DRY_RUN     = hasFlag("--dry-run");
const LIMIT       = Number(argValue("--limit",       "0"))  || 0;
const CONCURRENCY = Number(argValue("--concurrency", "10")) || 10;
const FILTER_EXT  = argValue("--ext", null);   // ex: ".pdf"  (null = todos)

// Expande ~ para o home do usuário
function expandHome(p) {
  if (!p) return p;
  if (p.startsWith("~/") || p === "~") {
    return path.join(os.homedir(), p.slice(1));
  }
  return p;
}

const SRC_ROOT = expandHome(argValue("--src", null) || process.env.SRC_ROOT || "");
const DST_ROOT = expandHome(argValue("--dst", null) || process.env.DST_ROOT || "");

const DB_CALCULOS = process.env.MYSQL_database       || "calculos";
const DB_LOGIN    = process.env.MYSQL_database_login || "debit";

// ─── limitador de concorrência ───────────────────────────────────────────────

function createLimiter(max) {
  let active = 0;
  const queue = [];
  const run = () => {
    if (active >= max) return;
    const job = queue.shift();
    if (!job) return;
    active++;
    job()
      .catch(() => {})
      .finally(() => { active--; run(); });
  };
  return (fn) =>
    new Promise((resolve, reject) => {
      queue.push(async () => {
        try { resolve(await fn()); }
        catch (e) { reject(e); }
      });
      run();
    });
}

// ─── varredura recursiva de arquivos ─────────────────────────────────────────

async function walkFiles(dir, filterExt) {
  const found = [];
  async function recurse(current) {
    let entries;
    try {
      entries = await fsp.readdir(current, { withFileTypes: true });
    } catch (e) {
      console.warn(`[WARN] Não foi possível ler pasta: ${current} — ${e.message}`);
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await recurse(full);
      } else if (entry.isFile()) {
        if (!filterExt || entry.name.toLowerCase().endsWith(filterExt.toLowerCase())) {
          found.push(full);
        }
      }
    }
  }
  await recurse(dir);
  return found;
}

// ─── extrai o código numérico do nome do arquivo ─────────────────────────────
// Exemplos aceitos:
//   281018.a1.pdf  → 281018
//   281018.pdf     → 281018
//   281018         → 281018
// Retorna null se o nome não começar com dígitos.

function extractCode(filename) {
  const base = path.basename(filename);
  const m = base.match(/^(\d+)/);
  return m ? m[1] : null;
}

// ─── consulta MySQL ───────────────────────────────────────────────────────────

/**
 * Retorna o tipo do login associado ao arquivo (campo login.tipo).
 * Relacionamento: atualizacaoMonetaria.id = código do arquivo,
 *                 atualizacaoMonetaria.id_login = login.id
 */
async function fetchLoginTipo(pool, codigo) {
  const id = parseInt(codigo, 10);
  if (!Number.isFinite(id) || id <= 0) return null;

  const sql = `
    SELECT l.tipo
    FROM \`${DB_CALCULOS}\`.atualizacaoMonetaria am
    INNER JOIN \`${DB_LOGIN}\`.login l ON l.id = am.id_login
    WHERE am.id = ?
    LIMIT 1
  `;
  const [rows] = await pool.execute(sql, [id]);
  if (!rows || rows.length === 0) return null;
  return String(rows[0].tipo);
}

// ─── move arquivo espelhando a estrutura de pastas ───────────────────────────

async function moveFile(srcFile, srcRoot, dstRoot) {
  // Caminho relativo a partir da raiz de origem
  const rel     = path.relative(srcRoot, srcFile);
  const dstFile = path.join(dstRoot, rel);
  const dstDir  = path.dirname(dstFile);

  await fsp.mkdir(dstDir, { recursive: true });
  await fsp.rename(srcFile, dstFile);
  return dstFile;
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {

  // Validações básicas
  if (!SRC_ROOT) {
    console.error("[ERRO] SRC_ROOT não definido. Use --src ou variável de ambiente SRC_ROOT.");
    process.exit(1);
  }
  if (!DST_ROOT) {
    console.error("[ERRO] DST_ROOT não definido. Use --dst ou variável de ambiente DST_ROOT.");
    process.exit(1);
  }
  if (!fs.existsSync(SRC_ROOT)) {
    console.error(`[ERRO] Pasta de origem não encontrada: ${SRC_ROOT}`);
    process.exit(1);
  }

  console.log("=".repeat(60));
  console.log("  aasp-mover-por-tipo.js");
  console.log("=".repeat(60));
  console.log(`  Origem      : ${SRC_ROOT}`);
  console.log(`  Destino     : ${DST_ROOT}`);
  console.log(`  Banco calc  : ${DB_CALCULOS}`);
  console.log(`  Banco login : ${DB_LOGIN}`);
  console.log(`  Filtro ext  : ${FILTER_EXT || "(todos)"}`);
  console.log(`  Dry-run     : ${DRY_RUN ? "SIM" : "NÃO"}`);
  console.log(`  Limite      : ${LIMIT || "sem limite"}`);
  console.log(`  Concorrência: ${CONCURRENCY}`);
  console.log("=".repeat(60));

  // Conexão MySQL
  const pool = await mysql.createPool({
    host            : process.env.MYSQL_host,
    user            : process.env.MYSQL_user,
    password        : process.env.MYSQL_password,
    database        : DB_CALCULOS,
    waitForConnections: true,
    connectionLimit : 10,
    multipleStatements: false,
  });

  // Varredura de arquivos
  console.log("\nVarredura de arquivos...");
  let files = await walkFiles(SRC_ROOT, FILTER_EXT);
  console.log(`  Total encontrado: ${files.length} arquivo(s)`);

  if (LIMIT > 0) {
    files = files.slice(0, LIMIT);
    console.log(`  Limitado a: ${files.length} arquivo(s)`);
  }

  // Contadores
  let countMoved    = 0;
  let countSkipped  = 0;
  let countNoCode   = 0;
  let countNotFound = 0;
  let countFailed   = 0;

  const limiter = createLimiter(CONCURRENCY);

  await Promise.all(
    files.map((srcFile) =>
      limiter(async () => {
        const filename = path.basename(srcFile);
        const codigo   = extractCode(filename);

        // Arquivo sem código numérico no nome
        if (!codigo) {
          countNoCode++;
          console.log(`[SEM-CÓDIGO] ${srcFile}`);
          return;
        }

        let tipo;
        try {
          tipo = await fetchLoginTipo(pool, codigo);
        } catch (err) {
          countFailed++;
          console.error(`[FAIL-DB] ${filename} (código ${codigo}): ${err.message}`);
          return;
        }

        // Não encontrado no banco
        if (tipo === null) {
          countNotFound++;
          console.log(`[NÃO-ENCONTRADO] ${filename} (código ${codigo})`);
          return;
        }

        // Tipo diferente de 6 → ignora
        if (tipo !== "6") {
          countSkipped++;
          console.log(`[IGNORADO] ${filename} — tipo=${tipo}`);
          return;
        }

        // Tipo = 6 → mover
        if (DRY_RUN) {
          const rel     = path.relative(SRC_ROOT, srcFile);
          const dstFile = path.join(DST_ROOT, rel);
          countMoved++;
          console.log(`[DRY-RUN] ${srcFile}  →  ${dstFile}`);
          return;
        }

        try {
          const dstFile = await moveFile(srcFile, SRC_ROOT, DST_ROOT);
          countMoved++;
          console.log(`[MOVIDO] ${srcFile}  →  ${dstFile}`);
        } catch (err) {
          countFailed++;
          console.error(`[FAIL-MOVE] ${srcFile}: ${err.message}`);
        }
      })
    )
  );

  await pool.end();

  // Resumo final
  console.log("\n" + "=".repeat(60));
  console.log("  RESUMO");
  console.log("=".repeat(60));
  console.log(`  Movidos (tipo=6)   : ${countMoved}`);
  console.log(`  Ignorados (tipo≠6) : ${countSkipped}`);
  console.log(`  Não encontrados BD : ${countNotFound}`);
  console.log(`  Sem código no nome : ${countNoCode}`);
  console.log(`  Falhas             : ${countFailed}`);
  console.log("=".repeat(60));
}

main().catch((e) => {
  console.error("[ERRO FATAL]", e);
  process.exit(1);
});
