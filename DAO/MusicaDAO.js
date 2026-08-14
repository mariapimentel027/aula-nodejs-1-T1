// dao/musicaDAO.js
const { Musica } = require('../karaoke/musica');

class MusicaDAO {
    constructor() {
        // "banco de dados" em memória — array de objetos Musica
        this.musicas = [];
        this.proximoId = 0;
        this._carregarDadosIniciais();
    }

    _carregarDadosIniciais() {
    const beijinhodoce = this.inserir('Beijinho Doce', 'As Galvão');
    evidencias.addParte('Que beijinho doce que ele tem', 'Depois que beijei ele', 'Nunca mais amei ninguém',
        'Que beijinho doce foi ele','Quem trouxe de longe pra mim','Se me abraça apertado, suspiro dobrado',
        'Que amor sem fim', 'Coração quem manda','Quando a gente ama','Se estou junto dele','Sem dar um beijinho coração reclama'
    );

    const aindaontem = this.inserir('Ainda Ontem Chorei de Saudade', 'João Mineiro e Marciano');
    evidencias.addParte('Você me pede na carta', 'Que eu desapareça', 'Que eu nunca mais te procure',
        'Pra sempre te esqueça', 'Posso fazer sua vontade', 'Atender seu pedido', 'Mas esquecer é bobagem', 'É tempo perdido', 
        'Ainda ontem chorei de saudade', 'Relendo a carta, sentindo o perfume', 'Mas que fazer com essa dor que me invade?', 
        'Mato esse amor ou me mata o ciúme', 'O dia inteiro te odeio', 'Te busco e te caço', 
        'Mas em meu sonho, de noite', 'Eu te beijo e te abraço', 'Porque os sonhos são meus',
        'Ninguém rouba e nem tira', 'Melhor sonhar na verdade', 'Que amar na mentira', 'Ainda ontem chorei de saudade',
        'Relendo a carta, sentindo o perfume', 'Mas que fazer com essa dor que me invade?', 
        'Mato esse amor ou me mata o ciúme'
    );

    }

    // Retorna todas as músicas
    listarTodas() {
        return this.musicas;
    }

    // Busca uma música pelo ID
    buscarPorId(id) {
        return this.musicas.find(m => m.id === id) || null;
    }

    // Insere uma nova música e retorna o objeto criado (com ID)
    inserir(nome, artista) {
        const novaMusica = new Musica(nome, artista);
        novaMusica.id = this.proximoId++;
        this.musicas.push(novaMusica); //persistir objeto
        return novaMusica;
    }

    // Atualiza nome e artista de uma música existente
    atualizar(id, nome, artista) {
        const musica = this.buscarPorId(id);
        if (!musica) return null;

        musica.nome = nome;
        musica.artista = artista;
        return musica;
    }

    // Remove uma música pelo ID
    remover(id) {
        const indice = this.musicas.findIndex(m => m.id === id);
        if (indice === -1) return null;

        return this.musicas.splice(indice, 1)[0];
    }
}

// Exporta uma INSTÂNCIA única (Singleton)
module.exports = new MusicaDAO();