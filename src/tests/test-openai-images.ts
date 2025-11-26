/**
 * Teste da edge function generate-slide-images com OpenAI DALL-E 3
 * 
 * Como usar:
 * 1. Abra o console do DevTools
 * 2. Cole este código
 * 3. Execute: testOpenAIImages()
 */

import { supabase } from '@/integrations/supabase/client';

export async function testOpenAIImages() {
  console.log('🧪 Testando geração de 1 imagem com OpenAI DALL-E 3...\n');

  const startTime = Date.now();

  try {
    const { data, error } = await supabase.functions.invoke('generate-slide-images', {
      body: {
        slides: [
          {
            id: 'test-1',
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
    const slide = data.slides[0];
    
    console.log(`✅ Sucesso em ${Math.round(elapsedTime / 1000)}s!`);
    console.log('📊 Stats:', data.stats);
    console.log('🖼️ Imagem gerada:', slide.imageUrl ? 'SIM' : 'NÃO');
    
    if (slide.imageUrl) {
      console.log('📏 Tamanho:', Math.round(slide.imageUrl.length / 1024), 'KB');
      console.log('\n✨ Preview da imagem:');
      
      // Criar elemento de imagem para visualizar
      const img = document.createElement('img');
      img.src = slide.imageUrl;
      img.style.maxWidth = '400px';
      img.style.border = '2px solid #10b981';
      img.style.borderRadius = '8px';
      img.style.marginTop = '10px';
      document.body.appendChild(img);
      
      console.log('👆 Imagem adicionada ao final da página');
    }

    if (data.errors && data.errors.length > 0) {
      console.warn('⚠️ Erros:', data.errors);
    }

    return { success: true, data, elapsedTime };

  } catch (err) {
    console.error('❌ Erro fatal:', err);
    return { success: false, error: err };
  }
}

// Auto-executar ao carregar
console.log('✅ Teste OpenAI carregado!');
console.log('🚀 Execute: testOpenAIImages()');
