import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminUpdateTimestamps() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const lessonText = `Você sabia que você já usa inteligência artificial várias vezes por dia, mesmo sem perceber? Vamos descobrir juntos onde a IA está escondida no seu celular!

Sabe aquela sensação de que o Netflix conhece seu gosto? Não é mágica, é inteligência artificial! O algoritmo aprende com o que você assiste e sugere filmes que você provavelmente vai gostar. A mesma coisa acontece no Spotify quando ele cria aquelas playlists personalizadas que parecem ler sua mente.

Já reparou como o Instagram e o Facebook sempre mostram exatamente o tipo de conteúdo que você gosta? Isso é IA trabalhando nos bastidores, aprendendo seus interesses e te mostrando mais do que você curte. Às vezes até assusta um pouco, né?

Muito bem! Você acabou de descobrir como a IA está presente no seu dia a dia de maneiras que você nem imaginava. Agora vou te mostrar mais um exemplo super comum.

O WhatsApp também usa IA de várias formas! Aquelas sugestões de resposta rápida que aparecem, a correção automática quando você digita errado, e até a organização das suas conversas mais importantes. Tudo isso é inteligência artificial ajudando você sem você nem perceber. E os assistentes virtuais como Siri, Google Assistente e Alexa? Eles são pura IA!

Agora você tem um superpoder: consegue identificar a IA no seu dia a dia! Sempre que usar o celular, vai perceber como ela está ali, facilitando sua vida de formas que antes passavam despercebidas. Legal, né?`;

  const sectionMarkers = [
    {
      phrase: "Você sabia que você já usa inteligência artificial",
      sectionId: "ia-em-todo-lugar"
    },
    {
      phrase: "Sabe aquela sensação de que o Netflix conhece seu gosto?",
      sectionId: "netflix-spotify"
    },
    {
      phrase: "Já reparou como o Instagram e o Facebook",
      sectionId: "redes-sociais"
    },
    {
      phrase: "Muito bem! Você acabou de descobrir",
      sectionId: "transition-to-playground"
    },
    {
      phrase: "O WhatsApp também usa IA de várias formas!",
      sectionId: "whatsapp-assistentes"
    },
    {
      phrase: "Agora você tem um superpoder",
      sectionId: "seu-superpoder"
    }
  ];

  const processTimestamps = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      // Passo 1: Chamar edge function para gerar timestamps
      toast.info('Gerando timestamps com ElevenLabs...');
      
      const { data: timestampsData, error: edgeFunctionError } = await supabase.functions.invoke(
        'generate-audio-with-timestamps',
        {
          body: {
            text: lessonText,
            voice_id: 'Xb7hH8MSUJpSbSDYk0k2',
            model_id: 'eleven_multilingual_v2',
            section_markers: sectionMarkers
          }
        }
      );

      if (edgeFunctionError) {
        throw new Error(`Erro ao gerar timestamps: ${edgeFunctionError.message}`);
      }

      console.log('📊 Timestamps recebidos:', timestampsData);

      // Passo 2: Atualizar banco de dados
      toast.info('Atualizando banco de dados...');

      const { error: updateError } = await supabase
        .from('lessons')
        .update({
          audio_url: 'maia-dia-a-dia.mp3',
          word_timestamps: timestampsData.word_timestamps
        })
        .eq('id', '11111111-1111-1111-1111-111111111102');

      if (updateError) {
        throw new Error(`Erro ao atualizar banco: ${updateError.message}`);
      }

      // Passo 3: Verificar resultado
      const { data: verifyData, error: verifyError } = await supabase
        .from('lessons')
        .select('id, title, audio_url, word_timestamps')
        .eq('id', '11111111-1111-1111-1111-111111111102')
        .single();

      if (verifyError) {
        throw new Error(`Erro ao verificar: ${verifyError.message}`);
      }

      const wordTimestampsArray = verifyData.word_timestamps as any[];
      
      setResult({
        section_timestamps: timestampsData.section_timestamps,
        total_words: wordTimestampsArray?.length || 0,
        audio_url: verifyData.audio_url,
        alignment_data: timestampsData.alignment_data
      });

      toast.success('✅ Timestamps atualizados com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro:', error);
      toast.error(error.message || 'Erro ao processar timestamps');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <h1 className="text-2xl font-bold mb-4">🔧 Admin: Atualizar Timestamps da Aula 02</h1>
          <p className="text-muted-foreground mb-6">
            Esta ferramenta vai gerar timestamps completos para a aula "Reconhecendo IA no dia a dia"
            e atualizar o banco de dados com o áudio correto.
          </p>

          <Button
            onClick={processTimestamps}
            disabled={isProcessing}
            size="lg"
            className="w-full"
          >
            {isProcessing ? 'Processando...' : 'Gerar e Atualizar Timestamps'}
          </Button>
        </div>

        {result && (
          <div className="bg-card rounded-lg border p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-green-600">✅ Sucesso!</h2>
            
            <div className="space-y-2">
              <p><strong>Áudio URL:</strong> {result.audio_url}</p>
              <p><strong>Total de palavras:</strong> {result.total_words}</p>
              <p><strong>Duração total:</strong> {result.alignment_data?.total_duration?.toFixed(1)}s</p>
            </div>

            <div className="bg-muted p-4 rounded">
              <h3 className="font-semibold mb-2">Section Timestamps:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(result.section_timestamps, null, 2)}
              </pre>
            </div>

            <div className="bg-green-50 dark:bg-green-950 p-4 rounded border border-green-200 dark:border-green-800">
              <p className="text-sm">
                <strong>✨ Próximo passo:</strong> Acesse a aula 02 para ver o áudio correto tocando 
                com sincronização completa palavra por palavra!
              </p>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="bg-muted rounded-lg p-6 text-center">
            <div className="animate-pulse space-y-2">
              <p>🎤 Gerando áudio e timestamps com ElevenLabs...</p>
              <p className="text-sm text-muted-foreground">
                Isso pode levar alguns segundos...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
