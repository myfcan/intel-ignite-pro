/**
 * 🚀 ATUALIZAR AULA 06 - CONSOLE DO NAVEGADOR
 *
 * COMO USAR:
 * 1. Abra o app no navegador (qualquer página)
 * 2. Abra o Console do navegador (F12 → Console)
 * 3. Cole TODO este arquivo no console
 * 4. Pressione Enter
 *
 * O script irá atualizar a Aula 06 no banco com os 15 experienceCards corretos.
 */

(async () => {
  console.log('\n🚀 INICIANDO ATUALIZAÇÃO DA AULA 06\n');
  console.log('='.repeat(60));

  const AULA_06_ID = 'e8a82f35-2818-42ff-b71b-565fca199f59';

  const experienceCards = [
    {
      type: 'deep-content-vs-rapido',
      sectionIndex: 1,
      anchorText: 'conteúdo profundo',
      props: { title: 'Por que conteúdo profundo importa?', subtitle: 'Da atenção rápida à confiança duradoura.' }
    },
    {
      type: 'knowledge-structure',
      sectionIndex: 1,
      anchorText: 'organizar seu conhecimento em algo maior',
      props: { title: 'Do solto ao estruturado', subtitle: 'Quando o que você sabe vira um projeto único.' }
    },
    {
      type: 'authority-builder',
      sectionIndex: 1,
      anchorText: 'autoridade e confiança',
      props: { title: 'Autoridade não nasce em um post', subtitle: 'Ela é construída em camadas.' }
    },
    {
      type: 'core-decisions',
      sectionIndex: 2,
      anchorText: 'tema, público e promessa',
      props: { title: 'As 3 decisões que destravam tudo', subtitle: 'Tema, público e promessa.' }
    },
    {
      type: 'module-map',
      sectionIndex: 2,
      anchorText: 'mapa de módulos',
      props: { title: 'Mapa de módulos', subtitle: 'Seu conhecimento em etapas claras.' }
    },
    {
      type: 'objective-focus',
      sectionIndex: 2,
      anchorText: 'objetivos de cada parte',
      props: { title: 'Objetivo de cada etapa', subtitle: 'O que o aluno ganha em cada ponto.' }
    },
    {
      type: 'product-shelf',
      sectionIndex: 3,
      anchorText: 'curso em vídeo',
      props: { title: 'Curso em vídeo', subtitle: 'Quando sua voz e presença guiam o aluno.' }
    },
    {
      type: 'ebook-creator',
      sectionIndex: 3,
      anchorText: 'eBook ou livro',
      props: { title: 'eBook ou livro', subtitle: 'Quando o conhecimento ganha páginas.' }
    },
    {
      type: 'lesson-series',
      sectionIndex: 3,
      anchorText: 'sequência de aulas',
      props: { title: 'Série de aulas', subtitle: 'Quando cada encontro empurra o aluno para o próximo nível.' }
    },
    {
      type: 'text-ai-helper',
      sectionIndex: 4,
      anchorText: 'I.A. de texto',
      props: { title: 'I.A. de texto em ação', subtitle: 'Do briefing solto ao esqueleto pronto.' }
    },
    {
      type: 'visual-ai-helper',
      sectionIndex: 4,
      anchorText: 'I.A. de imagem e vídeo',
      props: { title: 'Imagens e vídeos com I.A.', subtitle: 'Visuais que reforçam a mensagem.' }
    },
    {
      type: 'you-are-the-author',
      sectionIndex: 4,
      anchorText: 'você continua sendo o autor',
      props: { title: 'Você é o diretor criativo', subtitle: 'A I.A. acelera, mas não decide por você.' }
    },
    {
      type: 'ai-limitations',
      sectionIndex: 5,
      anchorText: 'I.A. não substitui revisão humana',
      props: { title: 'Limites da I.A.', subtitle: 'Ela acerta muita coisa, mas não tudo.' }
    },
    {
      type: 'copy-paste-risk',
      sectionIndex: 5,
      anchorText: 'copiar e colar sem adaptar',
      props: { title: 'O perigo do copiar e colar', subtitle: 'Quando tudo fica com a mesma cara.' }
    },
    {
      type: 'next-steps-deep-content',
      sectionIndex: 5,
      anchorText: 'primeiro rascunho, não rascunho final',
      props: { title: 'Próximos passos com segurança', subtitle: 'Use a I.A. como ponto de partida, não como ponto final.' }
    }
  ];

  // Importar supabase do módulo global (assumindo que está disponível)
  const { createClient } = window.supabase || await import('@supabase/supabase-js');

  // Pegar credenciais do ambiente (se disponível via import.meta.env ou window)
  const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || window.VITE_SUPABASE_URL;
  const SUPABASE_KEY = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || window.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Variáveis de ambiente não encontradas.');
    console.log('💡 Tente executar este script a partir do código-fonte (src/scripts/update-aula-06.ts)');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

  // 2. Verificar estado atual
  const currentContent = currentLesson.content;
  const currentCardsCount = currentContent?.experienceCards?.length || 0;
  console.log(`\n📊 Estado atual: ${currentCardsCount} experienceCards no banco`);

  // 3. Atualizar
  console.log('\n2️⃣ Atualizando experienceCards...');

  const updatedContent = {
    ...currentContent,
    experienceCards: experienceCards
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

  const finalContent = updatedLesson.content;
  const finalCardsCount = finalContent?.experienceCards?.length || 0;

  console.log(`📊 Estado final: ${finalCardsCount} experienceCards no banco`);

  if (finalCardsCount === 15) {
    console.log('\n✅ SUCESSO! Os 15 experienceCards foram inseridos corretamente!');
    console.log('\n📋 Lista de cards:');
    finalContent.experienceCards.forEach((card, idx) => {
      console.log(`   ${idx + 1}. [S${card.sectionIndex}] ${card.type}`);
    });
  } else {
    console.warn('\n⚠️  Algo deu errado. Esperado: 15 cards. Encontrado:', finalCardsCount);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ SCRIPT CONCLUÍDO!\n');
})();
