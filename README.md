# Debit A API

Este projeto reúne diversas rotinas de cálculo e ferramentas utilizadas pelo sistema Debit. A aplicação é baseada em Node.js.

## Instalação

1. Certifique-se de possuir o **Node.js** instalado (versão 16 ou superior).
2. Clone este repositório e instale as dependências:

```bash
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto definindo as variáveis de ambiente utilizadas. Segue um exemplo de configuração:

```ini
MYSQL_host=localhost
MYSQL_user=usuario
MYSQL_password=senha
MYSQL_password2=senha2
MYSQL_database=debit

pasta_calculos=/caminho/para/calculos
pasta_log=/caminho/para/logs
servidorAPI=https://api.debit.com.br
servidorGeralAPI=https://geral.debit.com.br
uploadDir=/caminho/para/uploads
urlLogoInfo=https://exemplo.com/logo
urlRenomeiaCalc=https://exemplo.com/renomear
```

A quantidade de variáveis depende dos módulos que serão utilizados. Ajuste conforme a necessidade do seu ambiente.

## Uso

Após configurar as variáveis de ambiente, inicie o servidor com:

```bash
npm start
```

## Documentação da API

Inicie o arquivo `redoc.js` para servir a documentação gerada a partir do
`openapi_debit_api.js`. Após iniciado, acesse `http://localhost:3102/api-docs`
para visualizar a documentação no formato **Redoc**.

Há um exemplo simples de consumo da API no arquivo `exemplo-client-api.js`. Para executá-lo:

```bash
node exemplo-client-api.js
```

## Scripts disponíveis

- `npm start` – inicia a aplicação principal.
- `npm test` – executa os testes (por padrão apenas exibe uma mensagem).

## Licença

MIT
