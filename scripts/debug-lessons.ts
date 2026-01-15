// Script para extrair e comparar aulas do banco
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const problematicId = 'eed75742-fcce-4afa-b4db-c1beda48cd94';
  const workingId = '19f7e1df-6fb8-435f-ad51-cc44ac67618d';

  console.log('=== BUSCANDO AULAS ===\n');

  const { data: problematic, error: err1 } = await supabase
    .from('lessons')
    .select('id, title, content, audio_url, word_timestamps')
    .eq('id', problematicId)
    .single();

  if (err1) {
    console.error('Erro ao buscar aula problemática:', err1);
  } else {
    console.log('=== AULA PROBLEMÁTICA ===');
    console.log(JSON.stringify(problematic, null, 2));
  }

  const { data: working, error: err2 } = await supabase
    .from('lessons')
    .select('id, title, content, audio_url, word_timestamps')
    .eq('id', workingId)
    .single();

  if (err2) {
    console.error('Erro ao buscar aula funcional:', err2);
  } else {
    console.log('\n=== AULA FUNCIONAL ===');
    console.log(JSON.stringify(working, null, 2));
  }
}

main().catch(console.error);
