/**
 * Script de teste para validar geração de imagens V3
 *
 * Como usar:
 * 1. Copie este código no console do navegador (DevTools)
 * 2. Execute teste1Imagem() primeiro
 * 3. Se funcionar, execute teste14Imagens()
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TESTE 1: Uma imagem simples
// ============================================================================
export async function teste1Imagem() {
  console.log('🧪 Testando geração de 1 imagem...');

  const startTime = Date.now();

  try {
    const { data, error } = await supabase.functions.invoke('generate-slide-images', {
      body: {
        slides: [
          {
            id: 'test-slide-1',
            slideNumber: 1,
            contentIdea: 'Uma pessoa trabalhando com inteligência artificial em um laptop moderno'
          }
        ],
        batchSize: 1,
        batchIndex: 0
      }
    });

    if (error) {
      console.error('❌ Erro:', error);
      return { success: false, error };
    }

    const elapsedTime = Date.now() - startTime;
    console.log(`✅ Sucesso em ${elapsedTime}ms!`);
    console.log('📊 Stats:', data.stats);
    console.log('🖼️ Imagem gerada:', data.slides[0].imageUrl ? 'SIM' : 'NÃO');

    if (data.slides[0].imageUrl) {
      console.log('📏 Tamanho:', Math.round(data.slides[0].imageUrl.length / 1024), 'KB');
    }

    return { success: true, data };

  } catch (err) {
    console.error('❌ Erro fatal:', err);
    return { success: false, error: err };
  }
}

// ============================================================================
// TESTE 2: 14 imagens (4 batches)
// ============================================================================
export async function teste14Imagens() {
  console.log('🧪 Testando geração de 14 imagens em batches...');

  const slides = [
    { id: 'slide-1', slideNumber: 1, contentIdea: 'Pessoa trabalhando com IA' },
    { id: 'slide-2', slideNumber: 2, contentIdea: 'Gráfico mostrando crescimento' },
    { id: 'slide-3', slideNumber: 3, contentIdea: 'Rede neural artificial' },
    { id: 'slide-4', slideNumber: 4, contentIdea: 'Robô e humano colaborando' },
    { id: 'slide-5', slideNumber: 5, contentIdea: 'Dashboard com métricas' },
    { id: 'slide-6', slideNumber: 6, contentIdea: 'Código de programação' },
    { id: 'slide-7', slideNumber: 7, contentIdea: 'Conceito de machine learning' },
    { id: 'slide-8', slideNumber: 8, contentIdea: 'Transformação digital' },
    { id: 'slide-9', slideNumber: 9, contentIdea: 'Análise de dados' },
    { id: 'slide-10', slideNumber: 10, contentIdea: 'Automação de processos' },
    { id: 'slide-11', slideNumber: 11, contentIdea: 'Interface futurista' },
    { id: 'slide-12', slideNumber: 12, contentIdea: 'Inovação tecnológica' },
    { id: 'slide-13', slideNumber: 13, contentIdea: 'Sucesso empresarial' },
    { id: 'slide-14', slideNumber: 14, contentIdea: 'Celebração de conquistas' }
  ];

  const BATCH_SIZE = 4;
  const totalBatches = Math.ceil(slides.length / BATCH_SIZE);

  console.log(`📦 Total: ${slides.length} imagens em ${totalBatches} batches`);

  let allSlides = [...slides];
  const overallStartTime = Date.now();

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    console.log(`\n🔄 Batch ${batchIndex + 1}/${totalBatches}...`);
    const batchStartTime = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke('generate-slide-images', {
        body: {
          slides: allSlides,
          batchSize: BATCH_SIZE,
          batchIndex: batchIndex
        }
      });

      if (error) {
        console.error(`❌ Erro no batch ${batchIndex + 1}:`, error);
        return { success: false, batch: batchIndex + 1, error };
      }

      const batchElapsedTime = Date.now() - batchStartTime;
      console.log(`✅ Batch ${batchIndex + 1} completo em ${batchElapsedTime}ms`);
      console.log(`   📊 Stats:`, data.stats);

      // Atualizar slides com imagens geradas
      allSlides = data.slides;

    } catch (err) {
      console.error(`❌ Erro fatal no batch ${batchIndex + 1}:`, err);
      return { success: false, batch: batchIndex + 1, error: err };
    }
  }

  const overallElapsedTime = Date.now() - overallStartTime;
  const successCount = allSlides.filter((s: any) => s.imageUrl && s.imageUrl !== '').length;

  console.log('\n🎉 TESTE COMPLETO!');
  console.log(`✅ ${successCount}/${slides.length} imagens geradas com sucesso`);
  console.log(`⏱️ Tempo total: ${Math.round(overallElapsedTime / 1000)}s (${Math.round(overallElapsedTime / 1000 / 60)}min)`);

  return {
    success: successCount === slides.length,
    successCount,
    totalCount: slides.length,
    totalTime: overallElapsedTime,
    slides: allSlides
  };
}

// ============================================================================
// TESTE 3: Validar no pipeline completo (criar aula V3)
// ============================================================================
export async function testeAulaCompleta() {
  console.log('🧪 Testando criação de aula V3 completa via pipeline...');
  console.log('⚠️ Este teste cria uma aula REAL no banco de dados');
  console.log('📝 Você pode deletá-la depois no Admin');

  const aulaTest = {
    model: 'v3',
    title: 'Teste de Geração de Imagens V3',
    trackId: 'YOUR_TRACK_ID', // ⚠️ SUBSTITUIR com trackId válido
    trackName: 'Teste',
    orderIndex: 999,
    v3Data: {
      audioText: 'Este é um teste de geração de imagens para o modelo V3. Estamos validando que todas as imagens são geradas corretamente antes do áudio.',
      slides: [
        { id: 'slide-1', slideNumber: 1, contentIdea: 'Conceito de inteligência artificial' },
        { id: 'slide-2', slideNumber: 2, contentIdea: 'Pessoa trabalhando com dados' },
        { id: 'slide-3', slideNumber: 3, contentIdea: 'Gráfico de crescimento' }
      ],
      finalPlaygroundConfig: {
        type: 'real-playground',
        instruction: 'Teste de playground'
      }
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Pergunta teste?',
        data: {
          options: ['A', 'B', 'C'],
          correctAnswer: 'A'
        }
      }
    ],
    estimatedTimeMinutes: 5
  };

  console.log('📋 JSON da aula:', JSON.stringify(aulaTest, null, 2));
  console.log('\n💡 Para testar:');
  console.log('1. Copie o JSON acima');
  console.log('2. Vá em Admin → Pipeline → Create Batch');
  console.log('3. Cole o JSON (como array: [{ ... }])');
  console.log('4. Clique em "Create Batch"');
  console.log('5. Monitore os logs do pipeline');
  console.log('\n✅ Se funcionar, você verá:');
  console.log('   - "🖼️ Gerando imagens dos slides..."');
  console.log('   - "📦 Processando 3 imagens em 1 batches de 4"');
  console.log('   - "✅ Batch 1/1: 3 imagens geradas"');
  console.log('   - "✅ Total: 3/3 imagens geradas com sucesso"');

  return aulaTest;
}

console.log('✅ Scripts de teste carregados!');
console.log('');
console.log('📋 Comandos disponíveis:');
console.log('  teste1Imagem()        - Testa 1 imagem (rápido)');
console.log('  teste14Imagens()      - Testa 14 imagens em batches (lento)');
console.log('  testeAulaCompleta()   - Mostra como testar via pipeline');
console.log('');
console.log('🚀 Comece com: await teste1Imagem()');
