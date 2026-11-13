// Conecta este DAO ao Supabase.
const supabase = require('./supabaseClient');

// Busca uma música junto com o nome do artista e suas partes.
const CAMPOS_DA_MUSICA =
    'id, nome, artista:artistas(nome), partes(id, ordem, letra, tempo_espera, tag)';

// Adapta os nomes das colunas do banco ao formato usado pela aplicação.
function organizarMusica(registro) {
    return {
        id: registro.id,
        nome: registro.nome,
        artista: registro.artista.nome,
        partes: registro.partes.map(parte => ({
            letra: parte.letra,
            tempoEspera: parte.tempo_espera,
            tag: parte.tag
        }))
    };
}

class MusicaDAO {
    // Lista todas as músicas com seus artistas e partes.
    async listarTodas() {
        const { data, error } = await supabase
            .from('musicas')
            .select(CAMPOS_DA_MUSICA)
            .order('id')
            .order('ordem', { referencedTable: 'partes' });

        if (error) throw error;
        return data.map(organizarMusica);
    }

    // Procura uma música pelo ID. Retorna null quando não encontrar.
    async buscarPorId(id) {
        const { data, error } = await supabase
            .from('musicas')
            .select(CAMPOS_DA_MUSICA)
            .eq('id', Number(id))
            .order('ordem', { referencedTable: 'partes' })
            .maybeSingle();

        if (error) throw error;
        return data ? organizarMusica(data) : null;
    }

    // Procura o artista pelo nome; se não existir, cadastra-o.
    async obterIdDoArtista(nome) {
        const { data: artista, error: erroBusca } = await supabase
            .from('artistas')
            .select('id')
            .eq('nome', nome)
            .maybeSingle();

        if (erroBusca) throw erroBusca;
        if (artista) return artista.id;

        const { data: novoArtista, error: erroCadastro } = await supabase
            .from('artistas')
            .insert({ nome })
            .select('id')
            .single();

        if (erroCadastro) throw erroCadastro;
        return novoArtista.id;
    }

    // Cadastra uma música ligada ao artista e devolve os dados dela.
    async inserir(nome, artista) {
        const artistaId = await this.obterIdDoArtista(artista);
        const { data, error } = await supabase
            .from('musicas')
            .insert({ nome, artista_id: artistaId })
            .select(CAMPOS_DA_MUSICA)
            .single();

        if (error) throw error;
        return organizarMusica(data);
    }

    // Cadastra uma parte no final da sequência da música.
    async adicionarPartes(idMusica, parte) {
        const { data: ultimaParte, error: erroBusca } = await supabase
            .from('partes')
            .select('ordem')
            .eq('musica_id', Number(idMusica))
            .order('ordem', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (erroBusca) throw erroBusca;

        const { error } = await supabase
            .from('partes')
            .insert({
                musica_id: Number(idMusica),
                ordem: ultimaParte ? ultimaParte.ordem + 1 : 1,
                letra: parte.letra,
                tempo_espera: parte.tempoEspera,
                tag: parte.tag
            });

        if (error) throw error;
    }

    // Atualiza o nome e o artista de uma música existente.
    async atualizar(id, nome, artista) {
        const artistaId = await this.obterIdDoArtista(artista);
        const { data, error } = await supabase
            .from('musicas')
            .update({ nome, artista_id: artistaId })
            .eq('id', Number(id))
            .select(CAMPOS_DA_MUSICA)
            .maybeSingle();

        if (error) throw error;
        return data ? organizarMusica(data) : null;
    }

    // Apaga primeiro as partes relacionadas e depois a música.
    async remover(id) {
        const musica = await this.buscarPorId(id);
        if (!musica) return null;

        const { error: erroPartes } = await supabase
            .from('partes')
            .delete()
            .eq('musica_id', Number(id));

        if (erroPartes) throw erroPartes;

        const { error: erroMusica } = await supabase
            .from('musicas')
            .delete()
            .eq('id', Number(id));

        if (erroMusica) throw erroMusica;
        return musica;
    }
}

// Exporta uma instância para ser usada pelas rotas do servidor.
module.exports = new MusicaDAO();
