// utils.js — Módulo utilitário (fornecido pelo professor)

/**
 * Pausa a execução por um número de milissegundos.
 *
 * Use com await dentro de uma função async:
 *
 *   await sleep(1000);  // espera 1 segundo
 *   await sleep(500);   // espera meio segundo
 * arquivo util.js
 * @param {number} ms — tempo de espera em milissegundos
 * @returns {Promise}
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { sleep };
