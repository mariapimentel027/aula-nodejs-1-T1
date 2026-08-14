// Importa a instância única (Singleton) do DAO
// (atenção às maiúsculas: DAO/MusicaDAO)
const musicaDAO = require('./DAO/MusicaDAO');


// 1. Importar o Express
const express = require('express');

// importacao do player
const player = require('./karaoke/player');
const { Parte } = require('./karaoke/parte');
 
// importacao do DAO de musicas
const musicaDAO = require('./DAO/MusicaDAO');
const { Musica } = require('./karaoke/musica');

//uso do DAO
const musica3x4 = musicaDAO.inserir('3x4', 'Engenheiros do Haway');
musicaDAO.atualizar(musica3x4.id, musica3x4.nome, 'Engenheiros do Hawaii');
console.log(JSON.stringify(musicaDAO.listarTodas()));
musicaDAO.remover(0);
console.log(JSON.stringify(musicaDAO.listarTodas()));





// 2. Criar a aplicação (a "loja")
const app = express();

// 3. Configurar middlewares (pré-processamento)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Definir rotas (os "balcões de atendimento")
app.get('/', (req, res) => {
    res.send('Olá, cliente!');
});

/**ROTA HTTP
 *  /recurso + método HTTP
 *  /musica/1 --> GET : retorna dados da musica JSON
 *  
 */


app.get('/musicas/:id', (req, res) =>{
    //processamento da requisicao
    const id = req.params.id;
    const dadosMusica = JSON.stringify(player.musica);
    res.statusCode = 200;
    res.send(dadosMusica);
});

//expor partes da musica

app.get('/musicas/:id/partes/:parte', (req, res) =>{
    const parteIndex = Number(req.params.parte);
    if (Number.isNaN(parteIndex) || parteIndex < 0 || parteIndex >= player.musica.partes.length) {
        return res.status(404).json({msg: "Parte nao existe!"});
    }

    const dadosParte = player.musica.partes[parteIndex];
    res.status(200).json(dadosParte);
});
let cont = 0;
app.get('/musicas/:id/play', async (req, res)=>{
    try{
        player.play().then(()=>{
            console.log(`Execucao ${cont++} terminou.`);
        });

        res.status(200).send({msg:`Musica ${player.musica.nome} está tocando...` })

    }catch(error){
        console.log("ERROR no play: " + error.message);
        //res.statusCode= 404; //se musica n existir
        res.statusCode = 500; //o erro é responsabilidade do servidor
        res.send({error: "Player indisponível" });
    }
});

app.post('/musicas/:id/partes', (req, res) =>{
    const { letra, tempoEspera, tag } = req.body;
    console.log(`meu-header: ${req.headers["meu-header"]}`);

    if (!letra || !tempoEspera || !tag) {
        return res.status(400).json({ erro: 'Campos obrigatórios: letra, tempoEspera, tag' });
    }

    const tempo = Number(tempoEspera);
    if (Number.isNaN(tempo) || tempo <= 0) {
        return res.status(400).json({ erro: 'tempoEspera deve ser um número maior que zero' });
    }

    const parteAdd = new Parte(letra, tempo, tag);

    try {
        player.musica.addParte(parteAdd);
        res.status(201).json({ parteAdd });

    } catch (error) {
        return res.status(400).json({ erro:  error.message });
    }

});


app.listen(3000, ()=>{ console.log(`Servidor inciado.`) });

// Middleware de erro — deve ser o último app.use() SEM ERROS
app.use((err, req, res, next) => {
console.error('Erro no servidor:', err.message);
if (err.status === 400) {
return res.status(400).json({ erro: 'JSON inválido no corpo da requisição' });
}
res.status(500).json({ erro: 'Erro interno do servidor' });
});