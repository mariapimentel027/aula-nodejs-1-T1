require('dotenv').config({ quiet: true });
const supabase = require('../DAO/supabaseClient');

const musicas = [
    {
        nome: 'Beijinho Doce',
        artista: 'As Galvão',
        partes: [
            ['Que beijinho doce que ele tem', 3000, 'Verso'],
            ['Depois que beijei ele, nunca mais amei ninguém', 4000, 'Refrão'],
            ['Que beijinho doce foi ele', 4000, 'Refrão'],
            ['Quem trouxe de longe pra mim', 4000, 'Refrão'],
            ['Se me abraça apertado, suspiro dobrado', 4000, 'Refrão'],
            ['Que amor sem fim!', 4000, 'Refrão'],
            ['Coração quem manda', 3000, 'Verso'],
            ['Quando a gente ama', 3000, 'Verso'],
            ['Se estou junto dele', 3000, 'Verso'],
            ['Sem dar um beijinho coração reclama', 3000, 'Verso']
        ]
    },
    {
        nome: 'Ainda Ontem Chorei de Saudade',
        artista: 'João Mineiro e Marciano',
        partes: [
            ['Você me pede na carta que eu desapareça', 3000, 'Verso 1'],
            ['Que eu nunca mais te procure e para sempre te esqueça', 3000, 'Verso 1'],
            ['Posso fazer sua vontade atender seu pedido', 3000, 'Verso 1'],
            ['Mas esquecer é bobagem é tempo perdido', 3000, 'Verso 1'],
            ['Ainda ontem chorei de saudade', 4000, 'Refrão'],
            ['Relendo a carta, sentindo o perfume', 4000, 'Refrão'],
            ['Mas o que fazer com essa dor que me invade?', 4000, 'Refrão'],
            ['Mato esse amor ou me mata o ciúme', 4000, 'Refrão'],
            ['O dia inteiro te odeio te busco e te caço', 3000, 'Verso 1'],
            ['Mas em meu sonho de noite, te beijo e te abraço', 3000, 'Verso 1'],
            ['Porque os sonhos são meus, ninguém rouba e nem tira', 3000, 'Verso 1'],
            ['Melhor sonhar na verdade que amar na mentira', 3000, 'Verso 1'],
            ['Ainda ontem chorei de saudade', 4000, 'Refrão'],
            ['Relendo a carta, sentindo o perfume', 4000, 'Refrão'],
            ['Mas o que fazer com essa dor que me invade?', 4000, 'Refrão'],
            ['Mato esse amor ou me mata o ciúme', 4000, 'Refrão']
        ]
    }
];

function verificarErro(error) {
    if (error) throw error;
}

async function obterOuCriarArtista(nome) {
    const { data: existente, error: buscaError } = await supabase
        .from('artistas')
        .select('id')
        .eq('nome', nome)
        .maybeSingle();

    verificarErro(buscaError);
    if (existente) return existente.id;

    const { data: novo, error: insercaoError } = await supabase
        .from('artistas')
        .insert({ nome })
        .select('id')
        .single();

    verificarErro(insercaoError);
    return novo.id;
}

async function carregarMusica(musica) {
    const artistaId = await obterOuCriarArtista(musica.artista);
    const { data: existente, error: buscaError } = await supabase
        .from('musicas')
        .select('id')
        .eq('nome', musica.nome)
        .maybeSingle();

    verificarErro(buscaError);

    let musicaId = existente?.id;
    if (!musicaId) {
        const { data: novaMusica, error: insercaoError } = await supabase
            .from('musicas')
            .insert({ nome: musica.nome, artista_id: artistaId })
            .select('id')
            .single();

        verificarErro(insercaoError);
        musicaId = novaMusica.id;
    }

    const { data: partesExistentes, error: partesError } = await supabase
        .from('partes')
        .select('id')
        .eq('musica_id', musicaId);

    verificarErro(partesError);

    if (partesExistentes.length > 0) {
        if (partesExistentes.length !== musica.partes.length) {
            throw new Error(
                `A música "${musica.nome}" já tem ${partesExistentes.length} partes; ` +
                `esperadas ${musica.partes.length}. Nenhuma parte foi alterada.`
            );
        }
        console.log(`Já carregada: ${musica.nome}`);
        return;
    }

    const registros = musica.partes.map(([letra, tempo_espera, tag], index) => ({
        musica_id: musicaId,
        ordem: index + 1,
        letra,
        tempo_espera,
        tag
    }));

    const { error: insercaoPartesError } = await supabase
        .from('partes')
        .insert(registros);

    verificarErro(insercaoPartesError);
    console.log(`Carregada: ${musica.nome} (${registros.length} partes)`);
}

(async () => {
    for (const musica of musicas) {
        await carregarMusica(musica);
    }
})().catch(error => {
    console.error('Falha ao carregar músicas no Supabase:', error.message);
    process.exitCode = 1;
});
