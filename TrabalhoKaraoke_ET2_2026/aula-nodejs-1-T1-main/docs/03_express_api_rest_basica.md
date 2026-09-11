# 03 — Express.js: Criando um Webservice REST do Zero

**Disciplina:** Programação III
**Curso:** Ensino Médio Integrado — Técnico em Informática
**Instituição:** IFSul - Campus Passo Fundo

---

## Pré-requisitos

- Leitura do material [A Metáfora do Restaurante: Entendendo o Protocolo HTTP](./metafora_restaurante_http.md)
- Node.js instalado
- Noções básicas de JavaScript (objetos, arrays, funções)
- Material anterior: [02 - Configuração de Servidor Web](./02_configuracao_servidor_web.md)

---

## 1. Recapitulando: o restaurante HTTP

Na aula anterior, comparamos a Web a um restaurante. Recapitulando os personagens:

| Personagem              | Na Web                                  |
| ----------------------- | --------------------------------------- |
| Cliente (você na mesa) | Navegador, Insomnia, Thunder Client     |
| Garçom (HTTP)          | O protocolo que padroniza a conversa    |
| Cozinha (Servidor)      | O programa Node.js que processa pedidos |
| Bilhete de pedido       | A**Requisição** (Request)       |
| Prato que volta à mesa | A**Resposta** (Response)          |

O garçom só aceita bilhetes padronizados. Cada bilhete tem um **verbo** indicando o que o cliente quer:

| Verbo HTTP | Ação no restaurante             | Ação na API              |
| ---------- | --------------------------------- | -------------------------- |
| `GET`    | "Me traga o cardápio"            | Ler dados                  |
| `POST`   | "Anote um pedido novo"            | Criar dados                |
| `PUT`    | "Substitua o prato 5 por um novo" | Atualizar dados (completo) |
| `DELETE` | "Cancele o pedido 8"              | Remover dados              |

A cozinha sempre responde com um **código de status**:

- **200** — Pedido entregue com sucesso
- **201** — Pedido novo registrado
- **400** — Bilhete com letra ilegível (dados inválidos)
- **404** — Prato não encontrado no cardápio
- **500** — A cozinha pegou fogo (erro interno)

Esses conceitos são a base de tudo que faremos a partir de agora. Se algo não ficou claro, releia o material da metáfora antes de continuar.

---

## 2. Express.js: o framework que monta o restaurante

No material anterior, vimos que o Express funciona como o "painel de controle" do Node.js. Sem ele, teríamos que tratar manualmente as Strings brutas do protocolo HTTP. Com ele, definimos regras claras e legíveis.

A estrutura mínima de um servidor Express segue sempre o mesmo esqueleto:

```javascript
// 1. Importar o Express
const express = require('express');

// 2. Criar a aplicação (a "loja")
const app = express();

// 3. Configurar middlewares (pré-processamento)
app.use(express.json());

// 4. Definir rotas (os "balcões de atendimento")
app.get('/', (req, res) => {
    res.send('Servidor funcionando');
});

// 5. Abrir a loja (escutar a porta)
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
```

Cada parte tem uma função específica:

| Etapa                                    | O que faz                                                      |
| ---------------------------------------- | -------------------------------------------------------------- |
| `require('express')`                   | Carrega a biblioteca no programa                               |
| `express()`                            | Cria a instância da aplicação                               |
| `app.use(...)`                         | Registra**middlewares** (processamentos intermediários) |
| `app.get(...)`, `app.post(...)` etc. | Define**rotas** — cada rota é um "balcão"             |
| `app.listen(porta)`                    | Abre o servidor para receber conexões                         |

### O que é um middleware?

Na metáfora do restaurante, pense no middleware como o **maître** que recebe cada cliente antes de encaminhá-lo à mesa. Ele verifica o traje, confere a reserva, organiza os acompanhantes. Só depois disso o cliente chega ao garçom.

No Express, middlewares processam a requisição antes de ela chegar às rotas. O mais comum:

```javascript
app.use(express.json());
```

Essa linha diz: *"Toda requisição que chegar com corpo em formato JSON, converta automaticamente para um objeto JavaScript."* Sem isso, o `req.body` ficaria `undefined`.

---

## 3. Caso prático: a API do Karaokê

Vamos construir uma API REST completa para a aplicação do Karaokê que já conhecemos. A API vai gerenciar uma música e suas partes (versos, refrões).

O projeto já tem uma estrutura de arquivos que separa responsabilidades. Vamos aproveitá-la.

### 3.1 Estrutura de dados

Já temos duas classes prontas:

**`parte.js`** — representa um trecho da música:

```javascript
class Parte {
    constructor(letra, tempoEspera, tag) {
        this.letra = letra;        // texto do trecho
        this.tempoEspera = tempoEspera; // milissegundos na tela
        this.tag = tag;            // identificador: "verso1", "refrão1" etc.
    }
}

module.exports = { Parte };
```

**`musica.js`** — representa a música completa, com uma lista de partes:

```javascript
class Musica {
    constructor(nome, artista) {
        this.nome = nome;
        this.artista = artista;
        this.partes = [];
    }

    addParte(parte) {
        try {
            if (!parte.letra || !parte.tempoEspera || !parte.tag) {
                throw new Error("Parte da Musica com problema!");
            }
            this.partes.push(parte);
        } catch (error) {
            console.log("Erro ao addParte: " + error.message);
        }
    }

    getLetraInteira() {
        let letra = "";
        this.partes.forEach((parte) => {
            letra += parte.letra;
        });
        return letra;
    }
}

module.exports = { Musica };
```

Observe a última linha de cada arquivo: `module.exports = { Musica }`. Voltaremos a falar sobre isso na seção final. Por ora, saiba que essa linha permite que outros arquivos usem a classe via `require()`.

### 3.2 O player: quem monta a música

No nosso projeto, já existe um arquivo `player.js` que funciona como o "script principal" — ele importa as classes, cria o objeto da música e adiciona todas as partes. Vamos aproveitar esse arquivo e adaptá-lo para também **exportar** o objeto `musica`, permitindo que o servidor o utilize.

**`player.js`** — monta a música e exporta para uso externo:

```javascript
// player.js — script principal: monta a música
const { Musica } = require('./musica');
const { Parte } = require('./parte');

const musica = new Musica('My Hero', 'Foo Fighters');

musica.addParte(new Parte('Too alarmin now to talk about \n Take your pictures down and shake it out', 11000, 'verso1'));
musica.addParte(new Parte('Truth or consequence, say it aloud \n Use that evidence, race it around', 10000, 'verso2'));
musica.addParte(new Parte('There goes my hero', 4000, 'refrão1'));
musica.addParte(new Parte('Watch him as he goes', 4000, 'refrão2'));
musica.addParte(new Parte("He's ordinary", 5000, 'refrão3'));
musica.addParte(new Parte("Don't the best of them bleed it out", 5000, 'verso3'));
musica.addParte(new Parte('While the rest of them peter out?', 5000, 'verso4'));
musica.addParte(new Parte('Kudos, my hero \nLeavin all the best', 6000, 'refrão4'));
musica.addParte(new Parte('You know my hero \nThe one thats on', 6000, 'refrão5'));

// Exporta o objeto da música para que outros arquivos possam usá-lo
module.exports = { musica };
```

A linha `module.exports = { musica }` é a chave: ela torna o objeto acessível por qualquer arquivo que fizer `require('./player')`.

### 3.3 O arquivo principal: `app.js`

Agora criamos o `app.js` — o ponto de entrada do servidor. Ele importa o `musica` do player e configura o Express:

```javascript
// app.js — ponto de entrada do servidor Express
const express = require('express');
const { Parte } = require('./parte');
const { musica } = require('./player');  // importa a música montada pelo player

const app = express();
const PORT = 3000;

// Middlewares para interpretar o corpo das requisições
app.use(express.json());                          // corpo em JSON
app.use(express.urlencoded({ extended: true }));   // corpo de formulários HTML
```

O `app.js` não sabe como a música foi construída. Ele recebe `musica` pronto e se preocupa apenas com as rotas e o servidor HTTP. Cada arquivo cuida do que é seu.

Os dados ficam **em memória**. Se o servidor for reiniciado, os dados voltam ao estado original. Em aulas futuras, vamos persistir dados em banco de dados.

---

## 4. Os métodos HTTP na prática

Agora vamos implementar cada verbo HTTP como uma rota do Express. Para cada um, a tabela mostra a correspondência com a metáfora do restaurante.

### 4.1 GET — Ler dados ("Me traga o cardápio")

O método GET serve para **consultar** informações. Ele nunca altera dados no servidor.

#### Rota 1: Obter a música completa

```javascript
// GET /api/musica — retorna a música completa em JSON
app.get('/api/musica', (req, res) => {
    res.json({
        nome: musica.nome,
        artista: musica.artista,
        letraInteira: musica.getLetraInteira(),
        partes: musica.partes
    });
});
```

**O que acontece aqui:**

1. O cliente envia `GET http://localhost:3000/api/musica`
2. O Express identifica a rota e executa a função callback
3. `res.json(...)` serializa o objeto para JSON e envia como resposta com status 200

**Teste no navegador:** basta digitar `http://localhost:3000/api/musica` na barra de endereços — o navegador faz GET por padrão.

#### Rota 2: Obter uma parte específica (parâmetro de rota)

E se o cliente quiser apenas a parte de índice 2? Usamos **parâmetros de rota** (route params), indicados por `:nomeDaVariavel`:

```javascript
// GET /api/partes/:indice — parâmetro de rota (route param)
// Exemplo: GET /api/partes/0  →  retorna a primeira parte
app.get('/api/partes/:indice', (req, res) => {
    const i = Number(req.params.indice);

    if (isNaN(i) || i < 0 || i >= musica.partes.length) {
        return res.status(404).json({ erro: `Parte ${req.params.indice} não encontrada` });
    }

    res.json(musica.partes[i]);
});
```

**Conceitos novos:**

- `req.params.indice` — o Express extrai o valor da URL e coloca neste objeto. Se a URL for `/api/partes/3`, então `req.params.indice` vale `"3"` (String).
- `Number(...)` — precisamos converter de String para número.
- `res.status(404)` — encadeia o status code antes de enviar o JSON. Aqui usamos 404 porque a parte solicitada não existe ("prato não encontrado no cardápio").

#### Rota 3: Filtrar partes por query string

Outra forma de passar dados no GET é pela **query string** — aqueles parâmetros depois do `?` na URL:

```javascript
// GET /api/partes?tag=verso1 — query string
app.get('/api/partes', (req, res) => {
    const { tag } = req.query;  // extrai o parâmetro da query string

    if (tag) {
        const filtradas = musica.partes.filter(p => p.tag === tag);
        return res.json(filtradas);
    }

    // Sem filtro → retorna todas as partes
    res.json(musica.partes);
});
```

**Diferença entre route param e query string:**

| Mecanismo    | Sintaxe na URL             | Acesso no Express     | Quando usar                        |
| ------------ | -------------------------- | --------------------- | ---------------------------------- |
| Route param  | `/api/partes/3`          | `req.params.indice` | Identificar um recurso específico |
| Query string | `/api/partes?tag=verso1` | `req.query.tag`     | Filtrar, buscar, paginar           |

Na metáfora: o route param é como pedir "o prato número 3". A query string é como dizer "quero ver apenas os pratos vegetarianos do cardápio".

---

### 4.2 POST — Criar dados ("Anote um pedido novo")

O método POST serve para **criar** algo novo no servidor. Os dados viajam no **corpo** (body) da requisição, não na URL.

```javascript
// POST /api/partes — recebe JSON no body
// Body esperado: { "letra": "...", "tempoEspera": 5000, "tag": "verso5" }
app.post('/api/partes', (req, res) => {
    const { letra, tempoEspera, tag } = req.body;  // dados do body JSON

    if (!letra || !tempoEspera || !tag) {
        return res.status(400).json({ erro: 'Campos obrigatórios: letra, tempoEspera, tag' });
    }

    const novaParte = new Parte(letra, tempoEspera, tag);
    musica.addParte(novaParte);

    res.status(201).json({
        mensagem: 'Parte adicionada',
        parte: novaParte,
        totalPartes: musica.partes.length
    });
});
```

**O que acontece aqui:**

1. O cliente envia um `POST` para `/api/partes` com um corpo JSON
2. O middleware `express.json()` (que configuramos lá no início) converte o JSON em objeto e coloca em `req.body`
3. Validamos os campos — se faltar algo, devolvemos **400 Bad Request** ("bilhete com letra ilegível")
4. Se estiver tudo certo, criamos a parte e devolvemos **201 Created** ("pedido novo registrado")

**Teste:** essa rota não funciona pelo navegador (que só faz GET pela barra de endereços). Veja a seção 6 sobre como testar com o **REST Client** do VS Code.

---

### 4.3 PUT — Atualizar dados ("Substitua esse prato inteiro")

O método PUT serve para **substituir** um recurso existente por completo. Você envia todos os campos novamente, mesmo os que não mudaram.

```javascript
// PUT /api/partes/:indice — atualiza uma parte existente por completo
// Body esperado: { "letra": "...", "tempoEspera": 5000, "tag": "verso1_v2" }
app.put('/api/partes/:indice', (req, res) => {
    const i = Number(req.params.indice);

    if (isNaN(i) || i < 0 || i >= musica.partes.length) {
        return res.status(404).json({ erro: `Parte ${i} não encontrada` });
    }

    const { letra, tempoEspera, tag } = req.body;

    if (!letra || !tempoEspera || !tag) {
        return res.status(400).json({ erro: 'Campos obrigatórios: letra, tempoEspera, tag' });
    }

    // Substitui a parte na posição indicada
    musica.partes[i] = new Parte(letra, tempoEspera, tag);

    res.json({
        mensagem: `Parte ${i} atualizada`,
        parte: musica.partes[i]
    });
});
```

**Fluxo:**

1. O cliente envia `PUT /api/partes/2` com o corpo contendo os dados novos
2. Validamos se o índice existe (404 se não) e se os campos estão preenchidos (400 se não)
3. Substituímos o objeto no array
4. Devolvemos 200 com a parte atualizada

Na metáfora do restaurante: o cliente derrubou o prato 2 no chão. Ele pede ao garçom: "substitua este prato inteiro por um novo, exatamente como eu estou descrevendo aqui."

**Teste:** use o REST Client com um arquivo `.http` (veja a seção 6).

---

### 4.4 DELETE — Remover dados ("Cancele aquele pedido")

O método DELETE remove um recurso do servidor.

```javascript
// DELETE /api/partes/:indice — remove uma parte da música
app.delete('/api/partes/:indice', (req, res) => {
    const i = Number(req.params.indice);

    if (isNaN(i) || i < 0 || i >= musica.partes.length) {
        return res.status(404).json({ erro: `Parte ${i} não encontrada` });
    }

    const removida = musica.partes.splice(i, 1)[0];  // remove e captura

    res.json({
        mensagem: `Parte ${i} removida`,
        parteRemovida: removida,
        totalPartes: musica.partes.length
    });
});
```

**Conceito novo: `splice(i, 1)`**
O método `splice` do Array remove elementos pela posição. `splice(i, 1)` diz: "a partir da posição `i`, remova 1 elemento". Ele retorna um array com os elementos removidos — por isso o `[0]` no final.

Na metáfora: "Garçom, cancele o pedido número 4. Pode jogar a ficha fora."

**Teste:** use o REST Client com `DELETE http://localhost:3000/api/partes/0` (veja a seção 6).

Após essa chamada, a parte que era índice 1 passa a ser índice 0. Todos os índices subsequentes "descem" uma posição.

---

## 5. Resumo: CRUD completo

Agora temos todas as operações **CRUD** (Create, Read, Update, Delete) mapeadas:

| Operação                   | Verbo HTTP | Rota                                                  | Status de sucesso |
| ---------------------------- | ---------- | ----------------------------------------------------- | ----------------- |
| **C**reate (criar)     | `POST`   | `/api/partes`                                       | 201 Created       |
| **R**ead (ler)         | `GET`    | `/api/musica`, `/api/partes`, `/api/partes/:id` | 200 OK            |
| **U**pdate (atualizar) | `PUT`    | `/api/partes/:id`                                   | 200 OK            |
| **D**elete (remover)   | `DELETE` | `/api/partes/:id`                                   | 200 OK            |

Esse padrão é a base de praticamente toda API REST que você vai encontrar na Web — de redes sociais a serviços bancários.

---

## 6. Rodando e testando a API

### 6.1 Iniciar o servidor

Abra o terminal integrado do VS Code (`Ctrl+J`) e execute:

```bash
node app.js
```

O terminal exibirá: `Servidor Express rodando em http://localhost:3000`

Deixe esse terminal rodando. Para parar o servidor, pressione `Ctrl+C`.

### 6.2 O problema do navegador

O navegador serve bem para requisições GET — basta digitar a URL na barra de endereços. Mas ele não oferece uma forma nativa de enviar POST, PUT ou DELETE com corpo JSON. Para testar todos os verbos HTTP, precisamos de uma ferramenta dedicada.

### 6.3 REST Client: testando APIs direto no VS Code

A extensão **REST Client** permite enviar requisições HTTP diretamente de arquivos `.http` dentro do VS Code. Sem interface gráfica extra, sem trocar de janela. Você escreve a requisição como texto, clica em "Send Request" e vê a resposta ao lado.

#### Instalação

1. Abra o VS Code
2. Vá em **Extensões** (ícone de quadradinhos na barra lateral, ou `Ctrl+Shift+X`)
3. Pesquise por **REST Client**
4. Instale a extensão de autor **Huachao Mao** (identificador: `humao.rest-client`)

#### Como funciona

1. Crie um arquivo com extensão `.http` na pasta do projeto (ex: `testes.http`)
2. Escreva as requisições seguindo o formato abaixo
3. Acima de cada requisição, aparecerá o link clicável **"Send Request"**
4. Clique nele — a resposta aparece em uma nova aba ao lado

#### Formato de uma requisição

Cada requisição segue esta estrutura:

```
MÉTODO  URL
Cabeçalho: Valor

Corpo (para POST e PUT)
```

Para separar uma requisição da outra no mesmo arquivo, use `###` (três cerquilhas).

#### Arquivo de testes completo

Crie o arquivo `testes.http` na raiz do projeto do karaokê com o conteúdo abaixo. Cada bloco é uma requisição independente.

```http
### ============================================
### TESTES DA API DO KARAOKÊ
### ============================================

### --- GET: Música completa ---
GET http://localhost:3000/api/musica

### --- GET: Todas as partes ---
GET http://localhost:3000/api/partes

### --- GET: Parte por índice (route param) ---
GET http://localhost:3000/api/partes/0

### --- GET: Filtrar por tag (query string) ---
GET http://localhost:3000/api/partes?tag=verso1

### --- GET: Parte inexistente (espera 404) ---
GET http://localhost:3000/api/partes/999

### --- POST: Adicionar nova parte ---
POST http://localhost:3000/api/partes
Content-Type: application/json

{
    "letra": "There goes my hero\nHe's ordinary",
    "tempoEspera": 8000,
    "tag": "refrão6"
}

### --- POST: Tentativa sem campos obrigatórios (espera 400) ---
POST http://localhost:3000/api/partes
Content-Type: application/json

{
    "letra": "Faltando campos"
}

### --- PUT: Atualizar a parte de índice 2 ---
PUT http://localhost:3000/api/partes/2
Content-Type: application/json

{
    "letra": "There goes my hero (versão alternativa)",
    "tempoEspera": 6000,
    "tag": "refrão1_alt"
}

### --- DELETE: Remover a parte de índice 0 ---
DELETE http://localhost:3000/api/partes/0

### --- GET: Verificar estado após as alterações ---
GET http://localhost:3000/api/partes
```

#### Lendo a resposta

Ao clicar em "Send Request", o VS Code abre uma aba com a resposta completa. A primeira linha mostra o protocolo e o **status code**:

```
HTTP/1.1 200 OK
```

Em seguida, os cabeçalhos da resposta e, ao final, o corpo JSON. Compare o status recebido com o que você esperava:

| Requisição                          | Status esperado     | Significa           |
| ------------------------------------- | ------------------- | ------------------- |
| GET de recurso existente              | `200 OK`          | Dados retornados    |
| POST com dados válidos               | `201 Created`     | Recurso criado      |
| POST/PUT com campos faltando          | `400 Bad Request` | Dados inválidos    |
| GET/PUT/DELETE de índice inexistente | `404 Not Found`   | Recurso não existe |

#### Dicas de uso

- **Variáveis:** defina variáveis no topo do arquivo para evitar repetição:
  ```http
  @baseUrl = http://localhost:3000

  ### GET: Música completa
  GET {{baseUrl}}/api/musica
  ```
- **Ordem importa:** execute as requisições de cima para baixo para que os testes façam sentido (ex: POST antes de DELETE)
- **Versionamento:** o arquivo `.http` pode ser commitado no Git junto com o projeto, servindo como documentação viva da API

---

## 7. A rota HTML — servindo a página do Karaokê

Além de responder com JSON (API), o mesmo servidor pode servir páginas HTML. O código abaixo cria a interface visual do karaokê na rota raiz `/`:

```javascript
// Rota HTML — página do karaokê
app.get('/', (req, res) => {
    const partesJSON = JSON.stringify(musica.partes);

    res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>${musica.nome} — ${musica.artista}</title>
    <!-- ... estilos CSS ... -->
</head>
<body>
    <h1>${musica.nome}</h1>
    <h2>${musica.artista}</h2>
    <div id="palco"><!-- letra aparece aqui --></div>
    <button id="btnPlay">▶ Play</button>

    <script>
        // Os dados da API são injetados diretamente no HTML
        const partes = ${partesJSON};
        // ... lógica de reprodução ...
    </script>
</body>
</html>`);
});
```

Aqui acontece algo interessante: o servidor **injeta** os dados diretamente no HTML usando template literals. A variável `${partesJSON}` é substituída pelo JSON das partes antes de o HTML chegar ao navegador. O cliente recebe uma página pronta, com os dados embutidos.

Acesse `http://localhost:3000/` no navegador para ver o karaokê funcionando.

---

## 8. Fechamento do servidor

A última linha do arquivo coloca tudo para funcionar:

```javascript
app.listen(PORT, () => {
    console.log(`Servidor Express rodando em http://localhost:${PORT}`);
});
```

O `app.listen()` abre a porta e mantém o programa rodando em loop infinito, aguardando conexões. Para parar o servidor, pressione `Ctrl+C` no terminal.

---

## 9. Visão geral da estrutura atual

Até aqui, as rotas ficam todas no `app.js`, enquanto os dados vivem no `player.js`. A estrutura do projeto:

```
karaoke/
├── musica.js       ← Classe Musica
├── parte.js        ← Classe Parte
├── player.js       ← Monta a música e exporta musica
├── app.js        ← Servidor Express (rotas + HTML)
├── package.json    ← Manifesto do projeto
└── node_modules/   ← Dependências instaladas (express)
```

Já separamos os dados (player) do servidor (index). Mas o `app.js` ainda acumula todas as rotas da API e a renderização do HTML num arquivo só. Conforme a aplicação cresce, isso se torna um problema.

É aqui que entra um tema central da programação profissional.

---

## 10. Por que modularizar? Separando rotas em arquivos próprios

### O problema do arquivo acumulador

Olhe para o nosso `app.js`. Ele ainda concentra:

- Configuração do Express e middlewares
- Todas as rotas de API (GET, POST, PUT, DELETE)
- A geração da página HTML completa
- A inicialização do servidor

Funciona para um projeto pequeno. Mas imagine que a aplicação cresce — você precisa adicionar autenticação, gerenciar playlists, ter rotas para usuários, conectar com banco de dados. Se tudo ficar no mesmo arquivo, em poucas semanas você terá um `app.js` de 2000 linhas onde ninguém consegue encontrar nada.

Esse cenário tem nome: **código espaguete**. Tudo emaranhado, difícil de ler, difícil de manter, difícil de trabalhar em equipe.

### A solução: módulos

O Node.js oferece um sistema de módulos que permite dividir o código em arquivos independentes, cada um com uma responsabilidade clara. Já fizemos isso: `Musica` e `Parte` vivem em seus próprios arquivos, e `player.js` monta os dados e os exporta. O `app.js` importa tudo via `require()`.

O mecanismo funciona com duas peças:

| Peça    | Arquivo que**exporta** | Arquivo que**importa** |
| -------- | ---------------------------- | ---------------------------- |
| Função | `module.exports`           | `require()`                |

#### `module.exports` — o que o arquivo expõe ao mundo

No final de `musica.js`, temos:

```javascript
module.exports = { Musica };
```

Essa linha diz: "quem fizer `require('./musica')` vai receber um objeto contendo a classe `Musica`."

Você pode exportar qualquer coisa: classes, funções, objetos, constantes.

```javascript
// Exportar uma função
module.exports = { calcularMedia };

// Exportar múltiplas coisas
module.exports = { Musica, criarPlaylist, TEMPO_PADRAO };
```

#### `require()` — buscar o que outro arquivo exportou

No `app.js`, fazemos:

```javascript
const { Parte } = require('./parte');
const { musica } = require('./player');
```

O `require('./player')` executa o arquivo `player.js` e retorna o que foi atribuído a `module.exports`. A desestruturação `{ musica }` extrai diretamente o objeto da música que o player montou e exportou.

### Na prática: separando as rotas da API

Em um projeto organizado, criaríamos um arquivo dedicado às rotas. Veja como ficaria a separação:

**`routes/partes.js`** — apenas as rotas da API:

```javascript
const express = require('express');
const router = express.Router();  // mini-aplicação de rotas
const { Parte } = require('../parte');
const { musica } = require('../player'); // importa os dados diretamente


    router.get('/', (req, res) => {
        const { tag } = req.query;
        if (tag) {
            return res.json(musica.partes.filter(p => p.tag === tag));
        }
        res.json(musica.partes);
    });

    router.get('/:indice', (req, res) => {
        const i = Number(req.params.indice);
        if (isNaN(i) || i < 0 || i >= musica.partes.length) {
            return res.status(404).json({ erro: `Parte ${i} não encontrada` });
        }
        res.json(musica.partes[i]);
    });

    router.post('/', (req, res) => {
        const { letra, tempoEspera, tag } = req.body;
        if (!letra || !tempoEspera || !tag) {
            return res.status(400).json({ erro: 'Campos obrigatórios: letra, tempoEspera, tag' });
        }
        const novaParte = new Parte(letra, tempoEspera, tag);
        musica.addParte(novaParte);
        res.status(201).json({ mensagem: 'Parte adicionada', parte: novaParte });
    });

    router.put('/:indice', (req, res) => {
        const i = Number(req.params.indice);
        if (isNaN(i) || i < 0 || i >= musica.partes.length) {
            return res.status(404).json({ erro: `Parte ${i} não encontrada` });
        }
        const { letra, tempoEspera, tag } = req.body;
        if (!letra || !tempoEspera || !tag) {
            return res.status(400).json({ erro: 'Campos obrigatórios: letra, tempoEspera, tag' });
        }
        musica.partes[i] = new Parte(letra, tempoEspera, tag);
        res.json({ mensagem: `Parte ${i} atualizada`, parte: musica.partes[i] });
    });

    router.delete('/:indice', (req, res) => {
        const i = Number(req.params.indice);
        if (isNaN(i) || i < 0 || i >= musica.partes.length) {
            return res.status(404).json({ erro: `Parte ${i} não encontrada` });
        }
        const removida = musica.partes.splice(i, 1)[0];
        res.json({ mensagem: `Parte ${i} removida`, parteRemovida: removida });
    });

// Exporta o router configurado
module.exports = router;
```

**`app.js`** — agora enxuto, apenas configuração e orquestração:

```javascript
const express = require('express');
const rotasPartes = require('./routes/partes');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API delegadas ao módulo de rotas
app.use('/api/partes', rotasPartes);

// Rota HTML do karaokê
app.get('/', (req, res) => {
    // ... HTML do karaokê ...
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
```

Observe a linha central da modularização:

```javascript
app.use('/api/partes', rotasPartes);
```

O `app.use()` monta o router no prefixo `/api/partes`. Todas as rotas definidas dentro do router (no arquivo `routes/partes.js`) passam a responder nesse caminho. O router define `router.get('/')` — e o Express combina com o prefixo, resultando em `GET /api/partes`.

### Estrutura modularizada

```
karaoke/
├── musica.js           ← Classe Musica
├── parte.js            ← Classe Parte
├── player.js           ← Monta a música e exporta musica
├── app.js            ← Configuração Express + inicialização
├── routes/
│   └── partes.js       ← Rotas da API separadas
├── package.json
└── node_modules/
```

Cada arquivo tem uma responsabilidade única. Se precisar adicionar rotas de usuários, cria-se `routes/usuarios.js`. Se precisar de rotas de playlists, `routes/playlists.js`. O `app.js` apenas monta e orquestra.

### Benefícios da modularização

| Sem modularização                  | Com modularização                       |
| ------------------------------------ | ----------------------------------------- |
| Um arquivo gigante                   | Arquivos pequenos e focados               |
| Difícil de encontrar uma rota       | Cada arquivo é um "mapa" claro           |
| Conflitos em trabalho em equipe      | Cada pessoa edita um arquivo diferente    |
| Teste manual do sistema inteiro      | Possibilidade de testar módulos isolados |
| Erros se propagam por todo o código | Erros ficam contidos no módulo           |

---

## 11. Referência rápida

### Objeto `req` (Request) — o que o cliente enviou

| Propriedade    | Descrição                       | Exemplo               |
| -------------- | --------------------------------- | --------------------- |
| `req.params` | Parâmetros da URL (`:id`)      | `req.params.indice` |
| `req.query`  | Query string (`?chave=valor`)   | `req.query.tag`     |
| `req.body`   | Corpo da requisição (POST, PUT) | `req.body.letra`    |
| `req.method` | Verbo HTTP usado                  | `"GET"`, `"POST"` |

### Objeto `res` (Response) — o que o servidor devolve

| Método                         | Descrição                           |
| ------------------------------- | ------------------------------------- |
| `res.send(texto)`             | Envia texto ou HTML                   |
| `res.json(objeto)`            | Envia JSON (converte automaticamente) |
| `res.status(codigo)`          | Define o status code (pode encadear)  |
| `res.status(201).json({...})` | Combina status + JSON                 |

### Sistema de módulos do Node.js

| Ação            | Código                                           |
| ----------------- | ------------------------------------------------- |
| Exportar          | `module.exports = { MinhaClasse, minhaFuncao }` |
| Importar          | `const { MinhaClasse } = require('./arquivo')`  |
| Router do Express | `const router = express.Router()`               |
| Montar router     | `app.use('/prefixo', router)`                   |

---

## Referências

- [Documentação Oficial do Express — Hello World](https://expressjs.com/pt-br/starter/hello-world.html)
- [Guia de Roteamento do Express](https://expressjs.com/pt-br/guide/routing.html)
- [HTTP Status Codes (MDN)](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Reference/Status)
- Material: Metáfora do Restaurante
- Material: Configuração de Servidor Web
