# Aula de Node.js - Módulos com require

Este repositório mostra um exemplo simples de como o Node.js importa e exporta módulos usando o sistema CommonJS, com a função `require()`.

## O que é um módulo?

Em Node.js, qualquer arquivo `.js` pode ser um módulo.
Um módulo é um pedaço de código que pode exportar funções, classes ou valores.
Quando outro arquivo precisa desse código, ele usa `require()` para importar.

## Como funciona a exportação (`module.exports`)

No arquivo `Calc.js`, o módulo exporta duas coisas:

- a classe `Calc`
- a função `umaFuncParaExportar`

```js
module.exports = { Calc, umaFuncParaExportar };
```

Isso significa que outro arquivo pode usar exatamente esses itens.
O `Calc.js` também pode ter código interno que não é exportado.
Ele fica privado dentro do módulo.

## Como funciona a importação (`require()`)

No arquivo `index.js`, nós usamos:

```js
const { Calc, umaFuncParaExportar } = require('./Calc');
```

Veja o que acontece:

1. `require('./Calc')` diz ao Node.js: "abra o arquivo `Calc.js`".
2. O Node executa o código do arquivo e lê o que foi colocado em `module.exports`.
3. O resultado é um objeto com as propriedades exportadas.
4. `const { Calc, umaFuncParaExportar } = ...` pega essas propriedades do objeto.

Assim, `Calc` e `umaFuncParaExportar` ficam disponíveis em `index.js`.

## Exemplo prático no repositório

O `index.js` mostra como usar a classe importada:

```js
const calc = new Calc();
console.log(calc.add(2, 2));
console.log(calc.sub(3, 2));
```

E também usa a função exportada:

```js
console.log(umaFuncParaExportar('PROG III'));
```

## Módulo local vs módulo npm

O projeto também traz outro tipo de importação:

```js
const chalk = require('chalk');
```

Esse é um módulo instalado pelo `npm` e não um arquivo do projeto.
Ele fica dentro de `node_modules` e o Node o encontra automaticamente.

Use módulos locais quando o código estiver em seu próprio projeto.
Use módulos npm quando precisar de bibliotecas prontas, como o `chalk`.

## Passo a passo para rodar o projeto

1. Instale as dependências (no mesmo diretório do projeto):

```bash
npm install
```

2. Execute o projeto:

```bash
node index.js
```

## Por que isso é útil?

Separar o código em módulos ajuda a deixar o projeto organizado.
Cada arquivo pode cuidar de uma parte diferente:

- `Calc.js` contém a lógica da calculadora
- `index.js` usa a calculadora e mostra o resultado
- outros módulos podem ser adicionados sempre que necessário

Isso é a base para construir projetos maiores em Node.js, mantendo o código fácil de entender e reutilizar.

## Resumo rápido

- `module.exports` define o que o módulo entrega para outros arquivos.
- `require('./Calc')` carrega um módulo local.
- `require('chalk')` carrega um módulo npm.
- A desestruturação (`const { ... } = require(...)`) permite pegar só o que você precisa.
- Node.js usa CommonJS nesse projeto, que é o padrão tradicional para módulos em Node.
