/*
 * Calc.js é um módulo local do nosso projeto.
 *
 * Em Node.js, cada arquivo pode ser visto como um módulo.
 * O módulo pode exportar o que queremos que outros arquivos
 * usem, usando module.exports.
 */

// Definimos uma classe de calculadora simples.
class Calc {
    constructor() {
        // O constructor pode preparar o objeto, se necessário.
    }

    add(a, b) {
        return a + b;
    }

    sub(a, b) {
        return a - b;
    }

    mul(a, b) {
        return a * b;
    }

    div(a, b) {
        if (b === 0) return null;
        return a / b;
    }
}

// Esta função é apenas para mostrar que podemos exportar
// mais de uma coisa de um mesmo módulo.
function umaFuncParaExportar(a) {
    return 'Oi, sou ' + a;
}

// Aqui estamos exportando a classe Calc e a função umaFuncParaExportar.
// Quem fizer require('./Calc') vai receber esse objeto.
module.exports = { Calc, umaFuncParaExportar };
