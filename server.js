// server.js — Web server com Express.js
const express = require('express');
const { Musica } = require('./musica');
const { Parte } = require('./parte');

const app = express();
const PORT = 3000;

// ---- middlewares para interpretar body ----
app.use(express.json());                          // parseia body com Content-Type: application/json
app.use(express.urlencoded({ extended: true }));   // parseia body de formulários HTML

// ---- monta a música ----
const myHero = new Musica('My Hero', 'Foo Fighters');

myHero.addParte(new Parte('Too alarmin now to talk about\nTake your pictures down and shake it out', 11000, 'verso1'));
myHero.addParte(new Parte('Truth or consequence, say it aloud\nUse that evidence, race it around', 10000, 'verso2'));
myHero.addParte(new Parte('There goes my hero', 4000, 'refrão1'));
myHero.addParte(new Parte('Watch him as he goes', 4000, 'refrão2'));
myHero.addParte(new Parte("He's ordinary", 5000, 'refrão3'));
myHero.addParte(new Parte("Don't the best of them bleed it out", 5000, 'verso3'));
myHero.addParte(new Parte('While the rest of them peter out?', 5000, 'verso4'));
myHero.addParte(new Parte('Kudos, my hero\nLeavin all the best', 6000, 'refrão4'));
myHero.addParte(new Parte('You know my hero\nThe one thats on', 6000, 'refrão5'));

// ---- GET /api/musica — retorna a música completa em JSON ----
app.get('/api/musica', (req, res) => {
    res.json({
        nome: myHero.nome,
        artista: myHero.artista,
        letraInteira: myHero.getLetraInteira(),
        partes: myHero.partes
    });
});

// ---- GET /api/partes/:indice — parâmetro de rota (route param) ----
// Exemplo: GET /api/partes/0  →  retorna a primeira parte
app.get('/api/partes/:indice', (req, res) => {
    const i = Number(req.params.indice);

    if (isNaN(i) || i < 0 || i >= myHero.partes.length) {
        return res.status(404).json({ erro: `Parte ${req.params.indice} não encontrada` });
    }

    res.json(myHero.partes[i]);
});

// ---- GET /api/partes?tag=verso1 — query string ----
// Exemplo: GET /api/partes?tag=refrão1
app.get('/api/partes', (req, res) => {
    const { tag } = req.query;  // extrai query string

    if (tag) {
        const filtradas = myHero.partes.filter(p => p.tag === tag);
        return res.json(filtradas);
    }

    // sem filtro → retorna todas
    res.json(myHero.partes);
});

// ---- POST /api/partes — recebe JSON no body ----
// Body esperado: { "letra": "...", "tempoEspera": 5000, "tag": "verso5" }
app.post('/api/partes', (req, res) => {
    const { letra, tempoEspera, tag } = req.body;  // dados do body JSON

    if (!letra || !tempoEspera || !tag) {
        return res.status(400).json({ erro: 'Campos obrigatórios: letra, tempoEspera, tag' });
    }

    const novaParte = new Parte(letra, tempoEspera, tag);
    myHero.addParte(novaParte);

    res.status(201).json({
        mensagem: 'Parte adicionada',
        parte: novaParte,
        totalPartes: myHero.partes.length
    });
});

// ---- rota HTML (página do karaokê) ----
app.get('/', (req, res) => {
    const partesJSON = JSON.stringify(myHero.partes);

    res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${myHero.nome} — ${myHero.artista}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0a0a1a;
            color: #e0e0e0;
            font-family: 'Segoe UI', system-ui, sans-serif;
            overflow: hidden;
        }

        h1 {
            font-size: 2.4rem;
            background: linear-gradient(135deg, #f7971e, #ffd200);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: .2rem;
        }

        h2 {
            font-size: 1.1rem;
            color: #888;
            margin-bottom: 2rem;
            font-weight: 400;
        }

        #palco {
            text-align: center;
            min-height: 200px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .tag {
            font-size: .85rem;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #f7971e;
            margin-bottom: .6rem;
            opacity: 0;
            transition: opacity .4s;
        }

        .letra {
            font-size: 1.8rem;
            line-height: 1.6;
            white-space: pre-line;
            opacity: 0;
            transform: translateY(20px);
            transition: opacity .5s, transform .5s;
        }

        .tag.visivel, .letra.visivel {
            opacity: 1;
            transform: translateY(0);
        }

        #btnPlay {
            margin-top: 2.5rem;
            padding: .8rem 2.4rem;
            font-size: 1rem;
            border: none;
            border-radius: 50px;
            background: linear-gradient(135deg, #f7971e, #ffd200);
            color: #0a0a1a;
            font-weight: 700;
            cursor: pointer;
            transition: transform .2s, box-shadow .2s;
        }

        #btnPlay:hover {
            transform: scale(1.05);
            box-shadow: 0 0 20px rgba(247, 151, 30, .4);
        }

        #btnPlay:disabled {
            opacity: .4;
            cursor: default;
            transform: none;
            box-shadow: none;
        }

        .barra-progresso {
            margin-top: 1.5rem;
            width: 300px;
            height: 4px;
            background: #222;
            border-radius: 2px;
            overflow: hidden;
        }

        .barra-progresso .fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #f7971e, #ffd200);
            transition: width .3s linear;
        }
    </style>
</head>
<body>
    <h1>${myHero.nome}</h1>
    <h2>${myHero.artista}</h2>

    <div id="palco">
        <div class="tag" id="tag"></div>
        <div class="letra" id="letra"></div>
    </div>

    <button id="btnPlay">▶  Play</button>
    <div class="barra-progresso"><div class="fill" id="fill"></div></div>

    <script>
        const partes = ${partesJSON};
        const btn   = document.getElementById('btnPlay');
        const elTag = document.getElementById('tag');
        const elLet = document.getElementById('letra');
        const fill  = document.getElementById('fill');

        function sleep(ms) {
            return new Promise(r => setTimeout(r, ms));
        }

        async function tocar() {
            btn.disabled = true;
            btn.textContent = '♫  Tocando...';

            const tempoTotal = partes.reduce((s, p) => s + p.tempoEspera, 0);
            let tempoAcum = 0;

            for (const parte of partes) {
                elTag.textContent = parte.tag;
                elLet.textContent = parte.letra;
                elTag.classList.add('visivel');
                elLet.classList.add('visivel');

                const inicio = Date.now();
                const intervalo = setInterval(() => {
                    const progParte = Math.min((Date.now() - inicio) / parte.tempoEspera, 1);
                    const progTotal = (tempoAcum + progParte * parte.tempoEspera) / tempoTotal * 100;
                    fill.style.width = progTotal + '%';
                }, 50);

                await sleep(parte.tempoEspera);
                clearInterval(intervalo);
                tempoAcum += parte.tempoEspera;

                elTag.classList.remove('visivel');
                elLet.classList.remove('visivel');
                await sleep(400);
            }

            fill.style.width = '100%';
            elTag.textContent = '';
            elLet.textContent = 'Fim!';
            elLet.classList.add('visivel');
            btn.textContent = '▶  Play';
            btn.disabled = false;
        }

        btn.addEventListener('click', tocar);
    </script>
</body>
</html>`);
});

// ---- inicia o servidor ----
app.listen(PORT, () => {
    console.log(`Servidor Express rodando em http://localhost:${PORT}`);
});
