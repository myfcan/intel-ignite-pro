/**
 * 🔄 UPDATE AULA 06 - Adicionar ExperienceCards
 *
 * Script para atualizar a Aula 06 no banco de dados
 * com os 12 experienceCards corretos.
 */

import { supabase } from '../integrations/supabase/client';

const AULA_06_ID = 'e8a82f35-2818-42ff-b71b-565fca199f59';

const experienceCards = [
  {
    type: 'core-triangle',
    sectionIndex: 2,
    anchorText: 'tema, público e promessa',
    props: {
      title: 'Tríade Central',
      subtitle: 'Três decisões fundamentais',
    },
  },
  {
    type: 'module-map',
    sectionIndex: 2,
    anchorText: 'mapa de módulos',
    props: {
      title: 'Mapa de Módulos',
      subtitle: 'Cada módulo resolve uma etapa',
    },
  },
  {
    type: 'objective-focus',
    sectionIndex: 2,
    anchorText: 'objetivos de cada parte',
    props: {
      title: 'Objetivos de Aprendizagem',
      subtitle: 'O que a pessoa precisa conseguir',
    },
  },
  {
    type: 'video-course-view',
    sectionIndex: 3,
    anchorText: 'curso em vídeo passo a passo',
    props: {
      title: 'Curso em Vídeo',
      subtitle: 'Módulos com demonstrações práticas',
    },
  },
  {
    type: 'ebook-view',
    sectionIndex: 3,
    anchorText: 'eBook para leitura independente',
    props: {
      title: 'Versão eBook',
      subtitle: 'Capítulos com textos e checklists',
    },
  },
  {
    type: 'multi-format',
    sectionIndex: 3,
    anchorText: 'mesma base, formatos diferentes',
    props: {
      title: 'Múltiplos Formatos',
      subtitle: 'Um conhecimento, vários produtos',
    },
  },
  {
    type: 'tool-groups',
    sectionIndex: 4,
    anchorText: 'três grupos de ferramentas',
    props: {
      title: '3 Grupos de I.A.',
      subtitle: 'Texto, Visual e Vídeo',
    },
  },
  {
    type: 'text-tools',
    sectionIndex: 4,
    anchorText: 'modelos de linguagem para estrutura e texto',
    props: {
      title: 'Ferramentas de Texto',
      subtitle: 'ChatGPT, Claude, Gemini',
    },
  },
  {
    type: 'visual-tools',
    sectionIndex: 4,
    anchorText: 'I.A. para capas e materiais visuais',
    props: {
      title: 'Ferramentas Visuais',
      subtitle: 'DALL-E, Midjourney, Gemini',
    },
  },
  {
    type: 'coauthor-role',
    sectionIndex: 5,
    anchorText: 'coautora, não dona',
    props: {
      title: 'I.A. como Coautora',
      subtitle: 'Parceira, não dona do trabalho',
    },
  },
  {
    type: 'editor-in-chief',
    sectionIndex: 5,
    anchorText: 'você decide o que entra e o que fica de fora',
    props: {
      title: 'Você no Comando',
      subtitle: 'O filtro final é seu',
    },
  },
  {
    type: 'long-term-asset',
    sectionIndex: 5,
    anchorText: 'ativo de longo prazo',
    props: {
      title: 'Ativo de Longo Prazo',
      subtitle: 'Conteúdo que trabalha por anos',
    },
  },
];

async function updateAula06() {
  console.log('\n🔄 ATUALIZANDO AULA 06 NO BANCO\n');
  console.log('='.repeat(60));

  // 1. Buscar aula atual
  console.log('\n1️⃣ Buscando aula atual...');
  const { data: currentLesson, error: fetchError } = await supabase
    .from('lessons')
    .select('id, title, content')
    .eq('id', AULA_06_ID)
    .single();

  if (fetchError || !currentLesson) {
    console.error('❌ Erro ao buscar aula:', fetchError?.message);
    return;
  }

  console.log('✅ Aula encontrada:', currentLesson.title);

  // 2. Verificar estado atual de experienceCards
  const currentContent = currentLesson.content as any;
  const currentCardsCount = currentContent?.experienceCards?.length || 0;
  console.log('\n📊 Estado atual:');
  console.log(`   experienceCards no banco: ${currentCardsCount} cards`);

  if (currentCardsCount === 12) {
    console.log('⚠️  A aula já tem 12 cards. Deseja sobrescrever? (Ctrl+C para cancelar)');
    // Em produção, você adicionaria um prompt aqui
  }

  // 3. Atualizar com novos experienceCards
  console.log('\n2️⃣ Atualizando experienceCards...');

  const updatedContent = {
    ...currentContent,
    experienceCards: experienceCards,
  };

  const { error: updateError } = await supabase
    .from('lessons')
    .update({ content: updatedContent })
    .eq('id', AULA_06_ID);

  if (updateError) {
    console.error('❌ Erro ao atualizar:', updateError.message);
    return;
  }

  console.log('✅ Aula atualizada com sucesso!');

  // 4. Verificar resultado
  console.log('\n3️⃣ Verificando resultado...');
  const { data: updatedLesson, error: verifyError } = await supabase
    .from('lessons')
    .select('id, title, content')
    .eq('id', AULA_06_ID)
    .single();

  if (verifyError || !updatedLesson) {
    console.error('❌ Erro ao verificar:', verifyError?.message);
    return;
  }

  const finalContent = updatedLesson.content as any;
  const finalCardsCount = finalContent?.experienceCards?.length || 0;

  console.log('📊 Estado final:');
  console.log(`   experienceCards no banco: ${finalCardsCount} cards`);

  if (finalCardsCount === 12) {
    console.log('\n✅ SUCESSO! Os 12 experienceCards foram inseridos corretamente!');
    console.log('\n📋 Lista de cards:');
    finalContent.experienceCards.forEach((card: any, idx: number) => {
      console.log(`   ${idx + 1}. [S${card.sectionIndex}] ${card.type}`);
    });
  } else {
    console.log('\n⚠️  Algo deu errado. Esperado: 12 cards. Encontrado:', finalCardsCount);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ SCRIPT CONCLUÍDO\n');
}

// Executar
updateAula06().catch((err) => {
  console.error('\n❌ ERRO FATAL:', err);
  process.exit(1);
});
