require('dotenv').config({ quiet: true });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
auth: { 
    persistSession: false, autoRefreshToken: false, detectSessionInUrl: false 
}
});

const { data, error } = await supabase
.from('partes') // da tabela partes
.select('id, ordem, letra, tempo_espera,tag') // selecione estas colunas
.eq('musica_id', 1) // onde musica_id = 1
.order('ordem'); // ordenado por ordem

console.log(data.entries.toString);