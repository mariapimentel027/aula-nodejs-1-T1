
/**
 * Aula de Node.js - 1ª Sexta-feira
 * 
 * Este projeto mostra como usar módulos em Node.js.
 * Um módulo é um arquivo JavaScript que pode exportar
 * funções, classes ou variáveis para outro arquivo usar.
 * 
 * Aqui usamos:
 * - Um módulo local: './Calc' (nosso código da calculadora)
 * - Um módulo npm: 'chalk' (biblioteca instalada no projeto)
 */

// Importando um módulo local que criamos em Calc.js.
// O require('./Calc') carrega o arquivo Calc.js e pega
// apenas o que ele exporta através de module.exports.
const { Calc, umaFuncParaExportar } = require('./Calc');

// Importando um módulo de terceiros que está instalado
// dentro da pasta node_modules do projeto.
// Essa biblioteca nos ajuda a colorir o texto no terminal.
const chalk = require('chalk');

// Mostra um título colorido no terminal usando o módulo chalk.
console.log(chalk.blue('----- CALCULADORA DO NODE.JS ------'));

// Criamos um objeto da classe Calc que veio de Calc.js.
const calc = new Calc();

// Usamos métodos dessa classe para fazer operações.
console.log(calc.add(2, 2));
console.log(calc.sub(3, 2));

// Chamamos também uma função simples exportada pelo módulo Calc.
console.log(umaFuncParaExportar('PROG III'));
