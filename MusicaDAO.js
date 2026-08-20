// DAO/MusicaDAO.js
const { Musica } = require('../karaoke/musica');
const { Parte } = require('../karaoke/parte'); // Importando a Parte

class MusicaDAO {
    constructor() {
        this.musicas = [];
        this.proximoId = 0;
        this._carregarDadosIniciais();
    }

    _carregarDadosIniciais() {
        const beijinhodoce = this.inserir('Beijinho Doce', 'As Galvão');
        beijinhodoce.addParte(new Parte('Que beijinho doce que ele tem', 3000, 'Verso'));
        beijinhodoce.addParte(new Parte('Depois que beijei ele, nunca mais amei ninguém', 4000, 'Refrão'));

        const aindaontem = this.inserir('Ainda Ontem Chorei de Saudade', 'João Mineiro e Marciano');
        aindaontem.addParte(new Parte('Você me pede na carta que eu desapareça', 3000, 'Verso 1'));
        aindaontem.addParte(new Parte('Ainda ontem chorei de saudade', 4000, 'Refrão'));
    }

    listarTodas() {
        return this.musicas;
    }

    buscarPorId(id) {
       return this.musicas.find(m => m.id === Number(id)) || null;
    }

    inserir(nome, artista) {
        const novaMusica = new Musica(nome, artista);
        novaMusica.id = this.proximoId++;
        this.musicas.push(novaMusica);
        return novaMusica;
    }

    
    adicionarPartes(idMusica, parte) {
        if (parte instanceof Parte) {
            const musica = this.buscarPorId(idMusica);
            if (musica != null) {
                musica.addParte(parte);
                return true;
            }
        }
        return false;
    }

    atualizar(id, nome, artista) {
        const musica = this.buscarPorId(id);
        if (!musica) return null;

        musica.nome = nome;
        musica.artista = artista;
        return musica;
    }

    remover(id) {
        const indice = this.musicas.findIndex(m => m.id === id);
        if (indice === -1) return null;

        return this.musicas.splice(indice, 1)[0];
    }
}

module.exports = new MusicaDAO();