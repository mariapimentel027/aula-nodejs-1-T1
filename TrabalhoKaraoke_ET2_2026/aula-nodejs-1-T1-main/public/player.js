const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let musicaAtual = null;

// Elementos adaptados com os IDs exatos do seu index.html
const listaEl = document.getElementById('lista-musicas');
const tituloEl = document.getElementById('nomeMusica');
const artistaEl = document.getElementById('artista');
const tagEl = document.getElementById('tag');
const letraEl = document.getElementById('letra');
const contadorEl = document.getElementById('contador');
const btnTocar = document.getElementById('btnTocar');

// 1. Busca a lista de músicas do servidor
async function carregarPlaylist() {
  if (!listaEl) return;

  try {
    const resposta = await fetch('/api/musicas');
    const musicas = await resposta.json();

    listaEl.innerHTML = '';
    musicas.forEach((musica) => {
      const item = document.createElement('li');
      item.textContent = `${musica.nome} — ${musica.artista}`;
      item.style.cursor = 'pointer';
      
      item.addEventListener('click', () => escolherMusica(musica.id));
      listaEl.appendChild(item);
    });
  } catch (erro) {
    console.error('Erro ao carregar playlist:', erro);
  }
}

// 2. Busca os detalhes da música selecionada pelo ID
async function escolherMusica(id) {
  try {
    const resposta = await fetch(`/api/musicas/${id}`);
    musicaAtual = await resposta.json();

    if (tituloEl) tituloEl.textContent = musicaAtual.nome;
    if (artistaEl) artistaEl.textContent = musicaAtual.artista;
    if (tagEl) tagEl.textContent = '';
    if (letraEl) letraEl.textContent = 'Clique em Tocar para iniciar...';
    if (contadorEl) contadorEl.textContent = '';

    if (btnTocar) btnTocar.disabled = false;
  } catch (erro) {
    console.error('Erro ao escolher música:', erro);
  }
}

// 3. Toca as letras da música no palco
async function tocar() {
  if (!musicaAtual || !musicaAtual.partes) return;

  if (btnTocar) btnTocar.disabled = true;

  for (let i = 0; i < musicaAtual.partes.length; i++) {
    const parte = musicaAtual.partes[i];

    if (tagEl) tagEl.textContent = parte.tag || '';
    if (letraEl) letraEl.textContent = parte.letra;
    if (contadorEl) contadorEl.textContent = `Parte ${i + 1} de ${musicaAtual.partes.length}`;

    await sleep(parte.tempoEspera);
  }

  if (tagEl) tagEl.textContent = 'FIM';
  if (letraEl) letraEl.textContent = '🎤 Fim! Escolha outra música.';
  if (btnTocar) btnTocar.disabled = false;
}

if (btnTocar) {
  btnTocar.addEventListener('click', tocar);
}

document.addEventListener('DOMContentLoaded', carregarPlaylist);
