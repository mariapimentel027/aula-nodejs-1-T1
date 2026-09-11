
class Musica {

    constructor(nome, artista) {
        //atributos com this.atrib
        this.nome = nome;
        this.artista = artista;
        this.partes = []; // associacao com Parte
    }

    //metodos
    addParte(parte) { //parte é objeto de Parte
        if (!parte || !parte.letra || !parte.tempoEspera || !parte.tag) {
            throw new Error('Parte da Musica com problema!');
        }

        this.partes.push(parte);
    }

    getLetraInteira(){
        // this.partes -->todas as partes

        let letra = "";

        this.partes.forEach((parte) => {
            letra += parte.letra;
        });
        return letra;
    }
}

module.exports = {Musica};