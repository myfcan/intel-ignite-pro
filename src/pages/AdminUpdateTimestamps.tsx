import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminUpdateTimestamps() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const lessonText = `Você sabia que você já usa inteligência artificial várias vezes por dia, mesmo sem perceber?

A IA está presente no seu celular quando você desbloqueia com o rosto, no Netflix quando ele sugere filmes que você vai gostar, no WhatsApp quando ele corrige suas palavras, e até no Google Maps quando ele te mostra o melhor caminho.

A verdade é que a IA já faz parte da sua vida há muito tempo! E agora você vai aprender a reconhecer onde ela está e como usar isso a seu favor.

Sabe aquela sensação de que o Netflix conhece seu gosto? Ou quando o Spotify monta aquela playlist perfeita? Isso é inteligência artificial!

Essas plataformas analisam tudo que você assiste e ouve, e usam IA para entender seus gostos. Quanto mais você usa, mais a IA aprende sobre você e melhores ficam as sugestões.

É como ter um amigo que conhece perfeitamente seu gosto e sempre te indica coisas incríveis!

Já reparou como o Instagram e o Facebook sempre mostram posts de assuntos que você gosta? Ou como aparecem anúncios de produtos que você estava pensando em comprar?

Isso também é inteligência artificial! Ela analisa o que você curte, comenta e compartilha, e usa essas informações para personalizar o que você vê.

A IA está constantemente aprendendo sobre seus interesses para tornar sua experiência melhor.

Muito bem! Você acabou de descobrir que já usa IA todos os dias sem perceber! Legal, né?

Mas não para por aí. Agora você pode usar IA de forma consciente e intencional para facilitar ainda mais sua vida. Que tal fazer um teste rápido pra ver se você consegue identificar onde mais a IA está presente?

É rapidinho e bem divertido! Vamos lá?

O WhatsApp também usa IA de várias formas! Quando ele sugere respostas rápidas, quando corrige suas palavras automaticamente, ou quando identifica spam.

E os assistentes como Alexa, Google Assistant e Siri? São pura inteligência artificial! Eles entendem sua voz, processam o que você pediu e executam tarefas.

Cada vez que você pede "Alexa, qual a previsão do tempo?" ou "Ok Google, toca uma música", você está usando IA avançada!

Agora você tem um superpoder: consegue identificar onde a IA está trabalhando! E o melhor: você aprendeu que ela não é algo complicado ou distante.

A IA já está aqui, facilitando sua vida todos os dias. E nas próximas aulas, você vai aprender a usar ferramentas de IA de forma consciente para economizar tempo, ter ideias criativas e resolver problemas.

O futuro já começou, e você está pronto pra aproveitar!`.trim();

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
