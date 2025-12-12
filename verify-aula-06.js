/**
 * 🔍 VERIFICAR AULA 06 NO BANCO
 *
 * Verifica se a Aula 06 está no banco e quantos experienceCards tem
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variáveis de ambiente não encontradas');
  console.log('VITE_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', SUPABASE_KEY ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyAula06() {
  console.log('\n🔍 VERIFICANDO AULA 06 NO BANCO DE DADOS\n');
  console.log('='.repeat(60));

  const AULA_06_ID = 'e8a82f35-2818-42ff-b71b-565fca199f59';
  const AULA_06_TITLE = 'Conteúdo profundo: cursos, livros e infoprodutos com I.A.';

  // VERIFICAÇÃO 1: Buscar por ID
  console.log('\n1️⃣ Buscando por ID:', AULA_06_ID);
  const { data: byId, error: errorById } = await supabase
    .from('lessons')
    .select('id, title, model, is_active, content, created_at')
    .eq('id', AULA_06_ID)
    .single();

  if (errorById) {
    console.log('❌ Erro ao buscar por ID:', errorById.message);
  } else if (!byId) {
    console.log('❌ Aula NÃO encontrada por ID');
  } else {
    console.log('✅ Aula encontrada por ID!');
    console.log('   Título:', byId.title);
    console.log('   Modelo:', byId.model);
    console.log('   Ativa:', byId.is_active);
    console.log('   Created:', new Date(byId.created_at).toLocaleString('pt-BR'));

    // Analisar experienceCards
    const content = byId.content;
    let totalCards = 0;
    let cardsLocation = '';

    // Verificar root-level experienceCards
    if (content?.experienceCards && Array.isArray(content.experienceCards)) {
      totalCards = content.experienceCards.length;
      cardsLocation = 'root-level (AdminV5 format)';

      console.log('\n   📊 EXPERIENCE CARDS:');
      console.log('   ✅ Localização:', cardsLocation);
      console.log('   ✅ Total:', totalCards);

      console.log('\n   📋 Lista de cards:');
      content.experienceCards.forEach((card, idx) => {
        console.log(`   ${idx + 1}. [S${card.sectionIndex}] ${card.type || card.cardType}`);
        console.log(`      anchorText: "${card.anchorText}"`);
        if (card.props) {
          console.log(`      title: "${card.props.title || card.title}"`);
        }
      });
    }

    // Verificar sections-level experienceCards
    if (totalCards === 0 && content?.sections && Array.isArray(content.sections)) {
      const sectionCards = [];
      content.sections.forEach((section, idx) => {
        if (section.experienceCards && Array.isArray(section.experienceCards)) {
          section.experienceCards.forEach(card => {
            sectionCards.push({ ...card, sectionIndex: idx + 1 });
          });
        }
      });

      if (sectionCards.length > 0) {
        totalCards = sectionCards.length;
        cardsLocation = 'sections-level (pipeline format)';

        console.log('\n   📊 EXPERIENCE CARDS:');
        console.log('   ✅ Localização:', cardsLocation);
        console.log('   ✅ Total:', totalCards);

        console.log('\n   📋 Lista de cards:');
        sectionCards.forEach((card, idx) => {
          console.log(`   ${idx + 1}. [S${card.sectionIndex}] ${card.type || card.cardType}`);
          console.log(`      anchorText: "${card.anchorText}"`);
        });
      }
    }

    if (totalCards === 0) {
      console.log('\n   ❌ EXPERIENCE CARDS: NENHUM ENCONTRADO');
      console.log('   📌 O campo content.experienceCards está vazio ou não existe');
      console.log('   📌 As sections também não têm experienceCards');
    }
  }

  // VERIFICAÇÃO 2: Buscar por título
  console.log('\n' + '='.repeat(60));
  console.log('\n2️⃣ Buscando por título:', AULA_06_TITLE);
  const { data: byTitle, error: errorByTitle } = await supabase
    .from('lessons')
    .select('id, title, model, is_active, created_at')
    .ilike('title', `%${AULA_06_TITLE}%`);

  if (errorByTitle) {
    console.log('❌ Erro ao buscar por título:', errorByTitle.message);
  } else if (!byTitle || byTitle.length === 0) {
    console.log('❌ Nenhuma aula encontrada com esse título');
  } else {
    console.log(`✅ Encontradas ${byTitle.length} aula(s) com título similar:`);
    byTitle.forEach((lesson, idx) => {
      console.log(`\n   ${idx + 1}. ${lesson.title}`);
      console.log(`      ID: ${lesson.id}`);
      console.log(`      Modelo: ${lesson.model}`);
      console.log(`      Ativa: ${lesson.is_active}`);
      console.log(`      Match com ID esperado: ${lesson.id === AULA_06_ID ? '✅ SIM' : '❌ NÃO'}`);
    });
  }

  // VERIFICAÇÃO 3: Listar TODAS as aulas V5
  console.log('\n' + '='.repeat(60));
  console.log('\n3️⃣ Listando TODAS as aulas V5 no banco:');
  const { data: allV5, error: errorAllV5 } = await supabase
    .from('lessons')
    .select('id, title, is_active, created_at')
    .eq('model', 'v5')
    .order('created_at', { ascending: false });

  if (errorAllV5) {
    console.log('❌ Erro ao listar aulas V5:', errorAllV5.message);
  } else if (!allV5 || allV5.length === 0) {
    console.log('❌ Nenhuma aula V5 encontrada no banco');
  } else {
    console.log(`✅ Total de aulas V5 no banco: ${allV5.length}\n`);
    allV5.forEach((lesson, idx) => {
      const isTarget = lesson.id === AULA_06_ID;
      const marker = isTarget ? '🎯' : '  ';
      console.log(`${marker} ${idx + 1}. ${lesson.title}`);
      console.log(`   ID: ${lesson.id}`);
      console.log(`   Ativa: ${lesson.is_active ? '✅' : '❌'}`);
      console.log(`   Created: ${new Date(lesson.created_at).toLocaleString('pt-BR')}`);
      if (isTarget) {
        console.log(`   ⭐ ESTA É A AULA 06 QUE ESTAMOS PROCURANDO!`);
      }
      console.log('');
    });
  }

  console.log('='.repeat(60));
  console.log('\n✅ VERIFICAÇÃO COMPLETA\n');
}

verifyAula06().catch(err => {
  console.error('\n❌ ERRO FATAL:', err);
  process.exit(1);
});
