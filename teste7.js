const { json } = require('express');
const fs = require('fs');  // Importa o módulo File System
const nome = '/Users/mrozgrin/backup/calculos_atualiza/1031/10311690.cartaoPonto';  // Caminho do arquivo
// Função para ler o arquivo
fs.readFile(nome, 'utf8', (err, data) => {
    let d = JSON.parse(data) // Converte o conteúdo do arquivo para JSON
    console.table(d.cartao);  // Exibe o conteúdo do arquivo
});
