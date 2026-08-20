const express = require('express');
const app = express();

// Importa a instância única (Singleton) do DAO
// Atenção às maiúsculas no caminho conforme exigido
const musicaDAO = require('./DAO/MusicaDAO');
const { Parte } = require('./karaoke/parte');

// Middleware para ler JSON no corpo da requisição (body)
app.use(express.json());

// Parte 7.2: Serve os arquivos estáticos da pasta public/ (index.html, estilo.css, player.js)
app.use(express.static('public'));

// ==========================================
// ROTAS DA API REST (/api/musicas)
// ==========================================

// 1. GET /api/musicas -> Lista todas as músicas (sem as partes)
app.get('/api/musicas', (req, res) => {
  const musicas = musicaDAO.listarTodas();
  const resumo = [];

  for (let i = 0; i < musicas.length; i++) {
    const m = musicas[i];
    resumo.push({
      id: m.id,
      nome: m.nome,
      artista: m.artista,
      totalPartes: m.partes.length
    });
  }

  res.json(resumo);
});

// 2. GET /api/musicas/:id -> Busca música por ID (com as partes)
app.get('/api/musicas/:id', (req, res) => {
  const id = Number(req.params.id);
  const musica = musicaDAO.buscarPorId(id);

  if (!musica) {
    return res.status(404).json({ erro: `Música com id ${id} não encontrada` });
  }

  res.json(musica);
});

// 3. POST /api/musicas -> Cria uma nova música
app.post('/api/musicas', (req, res) => {
  const { nome, artista } = req.body;

  if (!nome || !artista) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, artista' });
  }

  const novaMusica = musicaDAO.inserir(nome, artista);
  res.status(201).json(novaMusica);
});

// 4. PUT /api/musicas/:id -> Atualiza nome e artista de uma música existente
app.put('/api/musicas/:id', (req, res) => {
  const id = Number(req.params.id);
  const { nome, artista } = req.body;

  if (!nome || !artista) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, artista' });
  }

  const atualizada = musicaDAO.atualizar(id, nome, artista);

  if (!atualizada) {
    return res.status(404).json({ erro: `Música com id ${id} não encontrada` });
  }

  res.status(200).json(atualizada);
});

// 5. DELETE /api/musicas/:id -> Remove uma música pelo ID
app.delete('/api/musicas/:id', (req, res) => {
  const id = Number(req.params.id);
  const removida = musicaDAO.remover(id);

  if (!removida) {
    return res.status(404).json({ erro: `Música com id ${id} não encontrada` });
  }

  res.status(200).json({ mensagem: 'Música removida com sucesso', musica: removida });
});

// 6. POST /api/musicas/:id/partes -> Adiciona uma parte (letra, tempoEspera, tag) a uma música
app.post('/api/musicas/:id/partes', (req, res) => {
  const id = Number(req.params.id);
  const { letra, tempoEspera, tag } = req.body;

  if (!letra || tempoEspera === undefined || !tag) {
    return res.status(400).json({ erro: 'Campos obrigatórios: letra, tempoEspera, tag' });
  }

  const musica = musicaDAO.buscarPorId(id);

  if (!musica) {
    return res.status(404).json({ erro: `Música com id ${id} não encontrada` });
  }

  const novaParte = new Parte(letra, tempoEspera, tag);
  musicaDAO.adicionarPartes(id, novaParte);

  res.status(201).json(musica);
});

// ==========================================
// MIDDLEWARE DE TRATAMENTO DE ERROS (Parte 1.3)
// deve ser o último app.use()
// ==========================================
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err.message);

  if (err.status === 400) {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição' });
  }

  res.status(500).json({ erro: 'Erro interno do servidor' });
});

// Inicialização do Servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000! Acesse: http://localhost:3000');
});