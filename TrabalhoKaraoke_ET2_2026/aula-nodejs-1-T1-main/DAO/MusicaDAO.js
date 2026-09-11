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
        beijinhodoce.addParte(new Parte('Que beijinho doce foi ele', 4000, 'Refrão'));
        beijinhodoce.addParte(new Parte('Quem trouxe de longe pra mim', 4000, 'Refrão'));
        beijinhodoce.addParte(new Parte('Se me abraça apertado, suspiro dobrado', 4000, 'Refrão'));
        beijinhodoce.addParte(new Parte('Que amor sem fim!', 4000, 'Refrão'));
        beijinhodoce.addParte(new Parte('Coração quem manda', 3000, 'Verso'));
        beijinhodoce.addParte(new Parte('Quando a gente ama', 3000, 'Verso'));
        beijinhodoce.addParte(new Parte('Se estou junto dele', 3000, 'Verso'));
        beijinhodoce.addParte(new Parte('Sem dar um beijinho coração reclama', 3000, 'Verso'));

        const aindaontem = this.inserir('Ainda Ontem Chorei de Saudade', 'João Mineiro e Marciano');
        aindaontem.addParte(new Parte('Você me pede na carta que eu desapareça', 3000, 'Verso 1'));
        aindaontem.addParte(new Parte('Que eu nunca mais te procure e para sempre te esqueça', 3000, 'Verso 1'));
        aindaontem.addParte(new Parte('Posso fazer sua vontade atender seu pedido', 3000, 'Verso 1'));
        aindaontem.addParte(new Parte('Mas esquecer é bobagem é tempo perdido', 3000, 'Verso 1'));
        aindaontem.addParte(new Parte('Ainda ontem chorei de saudade', 4000, 'Refrão'));
        aindaontem.addParte(new Parte('Relendo a carta, sentindo o perfume', 4000, 'Refrão'));
        aindaontem.addParte(new Parte('Mas o que fazer com essa dor que me invade?', 4000, 'Refrão'));
         aindaontem.addParte(new Parte('Mato esse amor ou me mata o ciúme', 4000, 'Refrão'));
        aindaontem.addParte(new Parte('O dia inteiro te odeio te busco e te caço', 3000, 'Verso 1'));
        aindaontem.addParte(new Parte('Mas em meu sonho de noite, te beijo e te abraço', 3000, 'Verso 1'));
         aindaontem.addParte(new Parte('Porque os sonhos são meus, ninguém rouba e nem tira', 3000, 'Verso 1'));
          aindaontem.addParte(new Parte('Melhor sonhar na verdade que amar na mentira', 3000, 'Verso 1'));
           aindaontem.addParte(new Parte('Ainda ontem chorei de saudade', 4000, 'Refrão'));
            aindaontem.addParte(new Parte('Relendo a carta, sentindo o perfume', 4000, 'Refrão'));
             aindaontem.addParte(new Parte('Mas o que fazer com essa dor que me invade?', 4000, 'Refrão'));
             aindaontem.addParte(new Parte('Mato esse amor ou me mata o ciúme', 4000, 'Refrão'));
            

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