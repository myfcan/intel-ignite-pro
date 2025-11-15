// =============================================
// EDGE FUNCTION: PROCESSAR AULA
// Pipeline completo para criar aulas automaticamente
// =============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const ALICE_VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice BR
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface Sessao {
  numero: number;
  titulo: string;
  texto_original: string;
  texto_limpo?: string;
  texto_formatado?: string;
  timestamp_inicio?: number;
  timestamp_fim?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { aulaId } = await req.json();
    
    if (!aulaId) {
      throw new Error('aulaId é obrigatório');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ============= FASE 1: CARREGAR DADOS (10%) =============
    await atualizarProgresso(supabase, aulaId, 10, 'Carregando dados da aula...');
    await logarInfo(supabase, 'processar-aula', `Iniciando processamento de aula ${aulaId}`);

    const { data: aula, error: aulaError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', aulaId)
      .single();

    if (aulaError || !aula) {
      throw new Error('Aula não encontrada');
    }

    const sessoes: Sessao[] = aula.content?.sections || [];
    const modelo = aula.lesson_type || 'v1';
    const exercicios = aula.exercises || [];

    // ============= FASE 2: LIMPAR TEXTOS (25%) =============
    await atualizarProgresso(supabase, aulaId, 25, 'Preparando textos para áudio...');
    
    const sessoesLimpas = sessoes.map(s => ({
      ...s,
      texto_limpo: limparTextoParaAudio(s.texto_original || '')
    }));

    await logarInfo(supabase, 'processar-aula', `Textos limpos: ${sessoesLimpas.length} sessões`);

    // ============= FASE 3: GERAR ÁUDIOS (40-70%) =============
    await atualizarProgresso(supabase, aulaId, 40, 'Gerando áudio com IA (ElevenLabs)...');

    let audioUrl = null;
    let audioUrls: string[] = [];
    let wordTimestamps = null;

    if (modelo === 'v2') {
      // V2: Um áudio por sessão
      for (let i = 0; i < sessoesLimpas.length; i++) {
        const progresso = 40 + (i / sessoesLimpas.length) * 30;
        await atualizarProgresso(supabase, aulaId, Math.round(progresso), `Gerando áudio ${i+1}/${sessoesLimpas.length}...`);
        
        const url = await gerarAudioComRetry(sessoesLimpas[i].texto_limpo!, supabase);
        audioUrls.push(url);
      }
    } else {
      // V1 e V3: Áudio único
      const textoCompleto = sessoesLimpas.map(s => s.texto_limpo).join(' ');
      const resultado = await gerarAudioComTimestamps(textoCompleto, supabase);
      audioUrl = resultado.url;
      wordTimestamps = resultado.timestamps;
    }

    await logarInfo(supabase, 'processar-aula', `Áudios gerados: ${audioUrls.length || 1} arquivo(s)`);

    // ============= FASE 4: FORMATAR TEXTOS (75%) =============
    await atualizarProgresso(supabase, aulaId, 75, 'Formatando conteúdo para exibição...');

    const sessoesFormatadas = sessoesLimpas.map(s => ({
      ...s,
      texto_formatado: formatarTextoExibicao(s.texto_original || '')
    }));

    // ============= FASE 5: CALCULAR TIMESTAMPS (85%) =============
    await atualizarProgresso(supabase, aulaId, 85, 'Calculando timestamps...');

    const duracaoTotal = aula.estimated_time || 300;
    const sessoesComTimestamps = calcularTimestamps(sessoesFormatadas, duracaoTotal);

    // ============= FASE 6: SALVAR NO BANCO (95%) =============
    await atualizarProgresso(supabase, aulaId, 95, 'Salvando aula no banco de dados...');

    const contentAtualizado = {
      ...aula.content,
      sections: sessoesComTimestamps
    };

    const updateData: any = {
      content: contentAtualizado,
      exercises: exercicios,
      status: 'pronta',
      progresso_criacao: 100,
      fase_criacao: 'Concluído',
      is_active: true
    };

    if (audioUrl) updateData.audio_url = audioUrl;
    if (audioUrls.length > 0) updateData.audio_urls = audioUrls;
    if (wordTimestamps) updateData.word_timestamps = wordTimestamps;

    const { error: updateError } = await supabase
      .from('lessons')
      .update(updateData)
      .eq('id', aulaId);

    if (updateError) {
      throw new Error(`Erro ao salvar: ${updateError.message}`);
    }

    // ============= FASE 7: SUCESSO (100%) =============
    await atualizarProgresso(supabase, aulaId, 100, 'Aula criada com sucesso! ✅');
    await logarInfo(supabase, 'processar-aula', `Aula ${aulaId} processada com sucesso`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        lessonId: aulaId,
        audioUrl,
        audioUrls 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Erro no processamento:', error);
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    await logarErro(supabase, 'processar-aula', error.message);

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// =============================================
// FUNÇÕES AUXILIARES
// =============================================

function limparTextoParaAudio(texto: string): string {
  return texto
    .replace(/[*_#\[\]]/g, '') // Remove markdown
    .replace(/🎯|🚀|💡|✨|📚|🔥|⚡|🎨|🌟|💪|🏆|👨‍💼|👩‍💼/g, '') // Remove emojis
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
}

function formatarTextoExibicao(texto: string): string {
  return texto
    .replace(/^#\s+(.+)$/gm, '<h1 class="text-2xl font-bold mb-4">🎯 $1</h1>')
    .replace(/^##\s+(.+)$/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-primary">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    + '\n\n<span class="text-2xl">✨</span>';
}

function calcularTimestamps(sessoes: Sessao[], duracaoTotal: number): Sessao[] {
  const intervalo = duracaoTotal / sessoes.length;
  return sessoes.map((s, i) => ({
    ...s,
    timestamp_inicio: Math.round(i * intervalo),
    timestamp_fim: Math.round((i + 1) * intervalo)
  }));
}

async function gerarAudioComRetry(texto: string, supabase: any, tentativa = 1): Promise<string> {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ALICE_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: texto,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            speed: 1.1
          }
        })
      }
    );

    if (!response.ok && tentativa < 3) {
      await logarInfo(supabase, 'elevenlabs', `Tentativa ${tentativa} falhou, retentando...`);
      await new Promise(r => setTimeout(r, 2000 * tentativa));
      return gerarAudioComRetry(texto, supabase, tentativa + 1);
    }

    const audioBuffer = await response.arrayBuffer();
    const fileName = `audio-${Date.now()}.mp3`;
    
    // Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lesson-audios')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('lesson-audios')
      .getPublicUrl(fileName);

    return urlData.publicUrl;

  } catch (error: any) {
    if (tentativa < 3) {
      await logarInfo(supabase, 'elevenlabs', `Erro na tentativa ${tentativa}, retentando...`);
      await new Promise(r => setTimeout(r, 2000 * tentativa));
      return gerarAudioComRetry(texto, supabase, tentativa + 1);
    }
    throw error;
  }
}

async function gerarAudioComTimestamps(texto: string, supabase: any): Promise<{url: string, timestamps: any}> {
  const url = await gerarAudioComRetry(texto, supabase);
  
  // Calcular timestamps aproximados baseado em palavras
  const palavras = texto.split(/\s+/);
  const duracaoPorPalavra = 0.5; // segundos
  
  const timestamps = palavras.map((palavra, i) => ({
    word: palavra,
    start: i * duracaoPorPalavra,
    end: (i + 1) * duracaoPorPalavra
  }));

  return { url, timestamps };
}

async function atualizarProgresso(supabase: any, aulaId: string, progresso: number, fase: string) {
  await supabase
    .from('lessons')
    .update({
      progresso_criacao: progresso,
      fase_criacao: fase,
      status: progresso === 100 ? 'pronta' : 'processando'
    })
    .eq('id', aulaId);
}

async function logarInfo(supabase: any, contexto: string, mensagem: string) {
  await supabase
    .from('system_logs')
    .insert({
      tipo: 'info',
      contexto,
      mensagem
    });
}

async function logarErro(supabase: any, contexto: string, mensagem: string) {
  await supabase
    .from('system_logs')
    .insert({
      tipo: 'erro',
      contexto,
      mensagem
    });
}
