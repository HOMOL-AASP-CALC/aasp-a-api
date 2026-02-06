# Debit A API

Este projeto reúne diversas rotinas de cálculo e ferramentas utilizadas pelo sistema Debit. A aplicação é baseada em Node.js.

## Instalação

1. Certifique-se de possuir o **Node.js** instalado (versão 18 ou superior).
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



## Uso

Após configurar as variáveis de ambiente, inicie o servidor com:

```bash
pm2 start ecosystem.js
```
