import { supabase } from '@/integrations/supabase/client';
import { GuidedLessonData } from '@/types/guidedLesson';
import { processLessonData, logValidation } from './lessonDataProcessor';
import { cleanAudioText } from '@/lib/audioTextValidator';

/**
 * 🎯 SINCRONIZAÇÃO V2 GENÉRICA
 * 
 * Função universal para criar/atualizar qualquer aula V2 com:
 * ✅ Validação automática de dados
 * ✅ Geração de múltiplos áudios (1 por seção)
 * ✅ Upload para Storage
 * ✅ Cálculo de timestamps acumulados
 * ✅ Atualização do banco de dados
 */

interface SyncResult {
  success: boolean;
  lessonId?: string;
  message: string;
}

// Converter base64 para Blob
function base64ToBlob(base64: string, mimeType: string = 'audio/mpeg'): Blob {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

/**
 * Busca o próximo order_index disponível para uma trilha
 * @param trailId - ID da trilha
 * @returns Próximo índice disponível (máximo atual + 1)
 */
async function getNextAvailableOrderIndex(trailId: string): Promise<number> {
  const { data } = await supabase
    .from('lessons')
    .select('order_index')
    .eq('trail_id', trailId)
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  const maxIndex = data?.order_index ?? -1;
  return maxIndex + 1;
}

/**
 * Sincroniza uma lição V2 genérica no banco de dados
 * 
 * @param lessonData - Dados estruturados da lição
 * @param audioText - Texto limpo para narração (já processado)
 * @param trailTitle - Título da trilha (ex: 'Fundamentos de IA')
 * @param folderName - Nome da pasta no Storage (ex: 'aula-04')
 * @param orderIndex - Ordem na trilha (opcional)
 */
export async function syncLessonV2Generic(
  lessonData: GuidedLessonData,
  audioText: string,
  trailTitle: string,
  folderName: string,
  orderIndex?: number
): Promise<SyncResult> {
  
  try {
    console.log(`\n🎯 [SYNC V2] Iniciando: ${lessonData.title}`);
    console.log('='.repeat(60));
    
    // 1. Buscar trail
    console.log('📂 Buscando trilha:', trailTitle);
    const { data: trail, error: trailError } = await supabase
      .from('trails')
      .select('id')
      .eq('title', trailTitle)
      .single();
    
    if (trailError || !trail) {
      throw new Error(`Trilha "${trailTitle}" não encontrada`);
    }
    
    console.log('✅ Trail encontrada:', trail.id);
    
    // 2. Calcular order_index final (especificado ou auto-calculado)
    const finalOrderIndex = orderIndex ?? await getNextAvailableOrderIndex(trail.id);
    console.log(`📍 Order Index: ${finalOrderIndex} ${orderIndex === undefined ? '(auto-calculado)' : '(especificado)'}`);
    
    // 3. Validar e processar dados
    console.log('🔍 Validando dados da lição...');
    const processed = processLessonData({
      lessonData,
      audioText,
      trailId: trail.id,
      orderIndex: finalOrderIndex,
      title: lessonData.title,
      description: `Aula sobre ${lessonData.title}`
    });
    
    // Log de validação
    logValidation(processed, lessonData.title);
    
    // 🔒 BLOQUEAR SYNC SE HOUVER ERROS CRÍTICOS
    const hasExerciseErrors = processed.validation.checks
      .filter(check => check.name.includes('Exercício'))
      .some(check => !check.passed);
    
    if (hasExerciseErrors) {
      const failedExercises = processed.validation.checks
        .filter(check => check.name.includes('Exercício') && !check.passed)
        .map(check => `   ❌ ${check.name}: ${check.details}`)
        .join('\n');
      
      throw new Error(
        `\n${'='.repeat(60)}\n` +
        `❌ SINCRONIZAÇÃO BLOQUEADA!\n\n` +
        `A lição "${lessonData.title}" contém exercícios com erros estruturais:\n\n` +
        failedExercises + '\n\n' +
        `Por favor, corrija os erros nos arquivos de aula antes de sincronizar.\n` +
        `${'='.repeat(60)}`
      );
    }
    
    if (!processed.validation.allPassed) {
      console.warn('⚠️ Lição tem avisos mas continuando...');
      processed.validation.warnings.forEach(w => console.warn(`  - ${w}`));
    }
    
    // 3. Preparar textos para áudio (extrair narração limpa de cada seção)
    console.log(`🎵 Preparando ${lessonData.sections.length} seções para geração de áudio...`);
    
    const audioTexts = lessonData.sections.map((section, index) => {
      const narrationText = cleanAudioText(section.visualContent || section.content || '');
      console.log(`   Seção ${index + 1}: ${narrationText.substring(0, 50)}...`);
      return {
        sectionId: section.id,
        text: narrationText
      };
    });
    
    // 4. Gerar áudios via edge function
    console.log(`\n🎙️ Gerando ${audioTexts.length} áudios via API...`);
    
    const { data: audioData, error: audioError } = await supabase.functions.invoke(
      'generate-multiple-audios',
      { body: { audios: audioTexts } }
    );
    
    if (audioError) {
      throw new Error(`Erro ao gerar áudios: ${audioError.message}`);
    }
    
    if (!audioData?.results || audioData.results.length === 0) {
      throw new Error('Nenhum áudio foi gerado');
    }
    
    console.log(`✅ ${audioData.results.length} áudios gerados`);
    
    // 5. Upload para Storage e calcular timestamps
    console.log('\n📤 Fazendo upload dos áudios para Storage...');
    
    const updatedSections = [];
    let cumulativeTime = 0;
    
    for (let i = 0; i < audioData.results.length; i++) {
      const result = audioData.results[i];
      const section = lessonData.sections[i];
      
      // Converter base64 para Blob
      const audioBlob = base64ToBlob(result.audio_base64);
      const fileName = `${folderName}/sessao-${i + 1}.mp3`;
      
      console.log(`   Seção ${i + 1}: Uploading ${fileName} (${result.duration.toFixed(2)}s)`);
      
      // Upload para Storage
      const { error: uploadError } = await supabase.storage
        .from('lesson-audios')
        .upload(fileName, audioBlob, { 
          upsert: true, 
          contentType: 'audio/mpeg' 
        });
      
      if (uploadError) {
        console.error(`❌ Erro ao fazer upload da seção ${i + 1}:`, uploadError);
        throw uploadError;
      }
      
      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('lesson-audios')
        .getPublicUrl(fileName);
      
      // Atualizar seção com audio_url e timestamp
      updatedSections.push({
        ...section,
        audio_url: urlData.publicUrl,
        timestamp: cumulativeTime,
      });
      
      console.log(`   ✅ Seção ${i + 1}: ${urlData.publicUrl}`);
      console.log(`      Timestamp: ${cumulativeTime.toFixed(2)}s`);
      
      // Acumular tempo
      cumulativeTime += result.duration;
    }
    
    const totalDuration = cumulativeTime;
    console.log(`\n⏱️ Duração total: ${totalDuration.toFixed(2)}s`);
    
    // 6. Validar order_index antes de inserir
    console.log('\n🔍 Verificando conflitos de order_index...');
    const { data: conflictCheck } = await supabase
      .from('lessons')
      .select('id, title, order_index')
      .eq('trail_id', trail.id)
      .eq('order_index', finalOrderIndex)
      .maybeSingle();
    
    // 7. Salvar/atualizar no banco
    console.log('\n💾 Salvando no banco de dados...');
    
    const lessonContent = {
      ...lessonData,
      duration: totalDuration,
      sections: updatedSections,
    } as any; // Cast para Json do Supabase
    
    // Verificar se já existe pelo título
    const { data: existing } = await supabase
      .from('lessons')
      .select('id')
      .eq('title', lessonData.title)
      .eq('trail_id', trail.id)
      .maybeSingle();
    
    let lessonId: string;
    
    if (existing) {
      // UPDATE - Lição já existe, atualizar conteúdo
      console.log('🔄 Atualizando lição existente:', existing.id);
      
      const { error: updateError } = await supabase
        .from('lessons')
        .update({
          content: lessonContent,
          estimated_time: Math.round(totalDuration),
          order_index: finalOrderIndex
        })
        .eq('id', existing.id);
      
      if (updateError) throw updateError;
      lessonId = existing.id;
      
      console.log('✅ Lição atualizada com sucesso');
      
    } else {
      // INSERT - Nova lição
      
      // Verificar conflito de order_index antes de inserir
      if (conflictCheck && conflictCheck.id !== existing?.id) {
        throw new Error(
          `❌ Conflito de order_index!\n` +
          `Já existe uma lição com order_index ${finalOrderIndex}:\n` +
          `"${conflictCheck.title}" (ID: ${conflictCheck.id})\n` +
          `Use outro índice ou atualize a lição existente.`
        );
      }
      
      console.log('➕ Criando nova lição...');
      
      const { data: newLesson, error: insertError } = await supabase
        .from('lessons')
        .insert([{
          title: lessonData.title,
          trail_id: trail.id,
          order_index: finalOrderIndex,
          lesson_type: 'guided',
          passing_score: 70,
          estimated_time: Math.round(totalDuration),
          difficulty_level: 'beginner',
          content: lessonContent,
          is_active: true
        }])
        .select('id')
        .single();
      
      if (insertError) throw insertError;
      lessonId = newLesson!.id;
      
      console.log('✅ Lição criada com sucesso');
    }
    
    console.log('='.repeat(60));
    console.log('🎉 SINCRONIZAÇÃO COMPLETA!');
    console.log(`   ID: ${lessonId}`);
    console.log(`   Seções: ${updatedSections.length}`);
    console.log(`   Duração: ${totalDuration.toFixed(2)}s`);
    console.log('='.repeat(60) + '\n');
    
    return {
      success: true,
      lessonId,
      message: `✅ ${updatedSections.length} seções, ${totalDuration.toFixed(2)}s`
    };
    
  } catch (error: any) {
    console.error('\n❌ ERRO NA SINCRONIZAÇÃO:', error);
    console.error('='.repeat(60) + '\n');
    
    return {
      success: false,
      message: error.message || 'Erro desconhecido'
    };
  }
}
