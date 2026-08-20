# Plano de Desenvolvimento do Player de Karaokê

## Interface (HTML/CSS)
- Lista do lado para exibição das músicas disponíveis.
- Parte central para exibição do título, artista, letra da música e partes.
- Botão de controle para iniciar.

## Lógica do Client-side // algumas coisas pesquisadas na IA
- `carregarPlaylist()`: Busca a lista de músicas na API REST `/api/musicas`.
- `escolherMusica(id)`: Obtém os detalhes e partes da música selecionada na API `/api/musicas/:id`.
- `tocar()`: Percorre e exibe as frases da música no palco respeitando o tempo de espera (`tempoEspera`).