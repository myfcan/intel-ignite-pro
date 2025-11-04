import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Copy, Download, CheckCircle2, RefreshCw } from 'lucide-react';
import { fundamentos01, fundamentos01AudioText } from '@/data/lessons/fundamentos-01';

interface SectionMarker {
  phrase: string;
  sectionId: string;
}

export default function AdminAudioGenerator() {
  // Texto padrão pré-preenchido para facilitar
  const defaultText = `Olá! Eu sou a MAIA, e vou te guiar nesta jornada pela Inteligência Artificial.

Você já usou IA hoje e provavelmente nem percebeu. Quando você pediu uma música por voz no celular, corrigiu um texto automaticamente, ou recebeu sugestões de produtos para comprar... tudo isso foi IA trabalhando para você, nos bastidores.

Mas aqui está a verdade: enquanto você usa IA sem entender como funciona, outras pessoas já estão usando de forma estratégica para ganhar mais dinheiro, economizar horas de trabalho e criar novas oportunidades.

A boa notícia? Você está no lugar certo para mudar isso agora mesmo.

Então, o que é Inteligência Artificial de verdade?

Vou te explicar sem complicação: IA são sistemas de computador que aprendem padrões observando milhões de exemplos, e depois usam esse aprendizado para tomar decisões ou criar coisas novas.

Não é mágica. Não é um robô pensante como nos filmes de ficção científica. É matemática muito bem aplicada, algoritmos poderosos processando dados em velocidade absurda.

Pense assim: quando você ensina seu filho a reconhecer um cachorro, você mostra várias fotos de cachorros diferentes, certo? Depois de ver muitos exemplos, ele consegue identificar um cachorro novo que nunca viu antes, mesmo que seja de uma raça diferente ou de cor diferente.

A Inteligência Artificial funciona exatamente da mesma forma, só que em escala gigantesca. Ela vê milhões de exemplos e aprende os padrões.

Por isso o Google Fotos reconhece automaticamente seu rosto em fotos antigas. Por isso o corretor do seu celular sabe exatamente qual palavra você quis escrever antes mesmo de terminar. Por isso a Netflix consegue recomendar aquele filme perfeito que você nem sabia que queria assistir.

E o mais importante de tudo: você NÃO precisa entender a matemática complexa por trás disso. Você só precisa saber COMO USAR essa ferramenta poderosa a seu favor, no seu dia a dia, no seu trabalho, nos seus projetos.

Deixa eu te mostrar onde você já usa IA todos os dias sem perceber.

Está no Netflix quando ele sugere aquele filme que parece ter sido escolhido especialmente para você. Está no Waze quando ele calcula em segundos a rota mais rápida considerando o trânsito em tempo real de milhares de carros. Está no seu banco quando o sistema detecta uma compra suspeita no seu cartão e te avisa imediatamente de uma possível fraude.

A IA está filtrando o spam do seu email para você não perder tempo com besteira. Está criando as legendas automáticas daquele vídeo do YouTube que você assistiu ontem. Está escolhendo quais posts você vê primeiro no Instagram. Está sugerindo as próximas músicas no Spotify.

A Inteligência Artificial já está literalmente em TODO LUGAR da sua vida digital.

Mas a grande diferença de agora é esta: você não precisa mais apenas usar IA de forma passiva, recebendo o que as empresas programaram para você. Agora você pode conversar DIRETAMENTE com a IA. Pode pedir para ela criar textos profissionais, fazer planilhas complexas, gerar ideias criativas, resolver problemas difíceis, ensinar assuntos novos.

É como se você tivesse acabado de ganhar um assistente pessoal que está disponível 24 horas por dia, 7 dias por semana, que sabe sobre praticamente qualquer assunto do mundo, e está pronto para te ajudar sempre que você precisar. E de graça!

Agora a pergunta de ouro: por que VOCÊ, especificamente, precisa aprender isso agora?

Vou te dar três motivos muito práticos e reais:

PRIMEIRO MOTIVO: Economia brutal de tempo.

Tarefas que antes levavam horas do seu dia agora podem ser feitas em minutos. Escrever um email profissional bem estruturado? Dois minutos. Criar um relatório completo com dados organizados? Cinco minutos. Fazer um post atrativo para redes sociais? Um minuto. Traduzir um documento inteiro? Trinta segundos.

Imagina o que você pode fazer com essas horas extras que vai ganhar todo santo dia.

SEGUNDO MOTIVO: Renda extra real.

Pessoas comuns, sem formação e sem conhecimento em tecnologia, estão ganhando de 5 mil a 20 mil reais extras por mês, oferecendo: Criação de conteúdo para empresas. Legendas para vídeos. Transcrições de áudio. Textos para sites e blogs. Posts profissionais para redes sociais.

A demanda por esses serviços é absolutamente gigantesca e só está crescendo. E você pode começar amanhã mesmo.

TERCEIRO MOTIVO: Não ficar para trás.

As empresas já estão usando IA para tudo. Seus concorrentes, colegas de trabalho, até seus vizinhos já estão usando. Quem não souber usar IA nos próximos anos vai ficar em séria desvantagem no mercado de trabalho.

É exatamente como foi não saber usar computador nos anos dois mil. Lembra? Quem resistiu e ficou para trás perdeu oportunidades enormes de emprego, de crescimento profissional, de renda.

A história está se repetindo agora com a IA. E você tem a chance de estar do lado certo desta vez.

Então, qual é o seu próximo passo concreto?

É muito simples: daqui a pouquinho, você vai ter sua primeira conversa real com uma Inteligência Artificial. Sem medo, sem complicação, sem pressão.

Eu vou te guiar passo a passo no que fazer, no que falar, como perguntar. Você vai ver com seus próprios olhos que é muito mais fácil e natural do que parece.

É literalmente como mandar uma mensagem no WhatsApp para um amigo. Se você consegue fazer isso - e eu sei que você consegue - você consegue usar IA perfeitamente.

Preparado para dar o primeiro passo dessa jornada incrível? Então vamos nessa! O futuro está esperando por você.`;

  const [text, setText] = useState(defaultText);
  const [markers, setMarkers] = useState<SectionMarker[]>([
    { phrase: 'Olá! Eu sou a MAIA', sectionId: 'gancho' },
    { phrase: 'Então, o que é Inteligência Artificial de verdade?', sectionId: 'conceito' },
    { phrase: 'Deixa eu te mostrar onde você já usa IA', sectionId: 'onde-esta' },
    { phrase: 'Agora a pergunta de ouro:', sectionId: 'porque-voce-precisa' },
    { phrase: 'Então, qual é o seu próximo passo concreto?', sectionId: 'proximos-passos' }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sectionTimestamps, setSectionTimestamps] = useState<Record<string, number>>({});
  const [wordTimestamps, setWordTimestamps] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [timestampsSaved, setTimestampsSaved] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Carregar lessons do tipo 'guided'
  useEffect(() => {
    const fetchLessons = async () => {
      const { data } = await supabase
        .from('lessons')
        .select('id, title')
        .eq('lesson_type', 'guided')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      if (data) {
        setLessons(data);
      }
    };
    
    fetchLessons();
  }, []);

  const handleRegenerateFundamentos = async () => {
    setIsRegenerating(true);
    
    try {
      const lessonId = '11111111-1111-1111-1111-111111111101';
      
      toast.info('Regenerando áudio com timestamps...');
      
      const { data, error } = await supabase.functions.invoke('generate-audio-elevenlabs', {
        body: {
          text: fundamentos01AudioText,
          lesson_id: lessonId,
          voice_id: 'EXAVITQu4vr4xnSDxMaL',
          model_id: 'eleven_multilingual_v2'
        }
      });
      
      if (error) throw error;
      
      console.log('Resposta da edge function:', data);
      
      if (data?.word_timestamps && data.word_timestamps.length > 0) {
        toast.success(`✅ ${data.total_words} palavras com timestamps salvos no banco!`);
        toast.info('🔄 Recarregue a página da lição para ver o karaoke funcionando!');
      } else {
        toast.warning('Áudio gerado mas timestamps não disponíveis');
      }
      
    } catch (error) {
      console.error('Erro ao regenerar:', error);
      toast.error('Erro: ' + (error as Error).message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('Por favor, insira o texto da lição');
      return;
    }

    setIsGenerating(true);
    setTimestampsSaved(false);
    
    try {
      console.log('Chamando edge function para gerar áudio com timestamps...');
      
      const { data, error } = await supabase.functions.invoke('generate-audio-with-timestamps', {
        body: {
          text: text.trim(),
          section_markers: markers,
          voice_id: 'EXAVITQu4vr4xnSDxMaL', // Sarah
          model_id: 'eleven_multilingual_v2',
          lesson_id: (selectedLessonId && selectedLessonId !== 'none') ? selectedLessonId : undefined
        }
      });

      if (error) {
        console.error('Erro da edge function:', error);
        throw error;
      }

      console.log('Resposta recebida:', data);

      // Converter base64 para blob
      const audioBlob = base64ToBlob(data.audio_base64, 'audio/mpeg');
      const url = URL.createObjectURL(audioBlob);
      
      setAudioUrl(url);
      setSectionTimestamps(data.section_timestamps || {});
      setWordTimestamps(data.word_timestamps || []);
      
      // Se lesson_id foi fornecido, salvar também o áudio e marcar como salvo
      if (selectedLessonId && selectedLessonId !== 'none' && data.word_timestamps && data.word_timestamps.length > 0) {
        // Fazer upload do áudio para storage
        const fileName = `lesson-${selectedLessonId}-${Date.now()}.mp3`;
        const { error: uploadError } = await supabase.storage
          .from('lesson-audios')
          .upload(fileName, audioBlob, {
            contentType: 'audio/mpeg',
            upsert: true
          });
        
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('lesson-audios')
            .getPublicUrl(fileName);
          
          // Atualizar lesson com audio_url e word_timestamps
          const { error: updateError } = await supabase
            .from('lessons')
            .update({ 
              audio_url: urlData.publicUrl,
              word_timestamps: data.word_timestamps
            })
            .eq('id', selectedLessonId);
          
          if (!updateError) {
            setTimestampsSaved(true);
            toast.success('✅ Áudio e timestamps salvos no banco!');
          } else {
            console.error('Erro ao atualizar lesson:', updateError);
            toast.success('🎉 Áudio gerado! ⚠️ Erro ao salvar no banco');
          }
        } else {
          console.error('Erro ao fazer upload:', uploadError);
          toast.success('🎉 Áudio gerado! ⚠️ Erro ao fazer upload');
        }
      } else {
        toast.success('Áudio gerado com sucesso! 🎉');
      }
      
    } catch (error) {
      console.error('Erro ao gerar áudio:', error);
      toast.error('Falha ao gerar áudio. Verifique o console para mais detalhes.');
    } finally {
      setIsGenerating(false);
    }
  };

  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const copyTimestamps = () => {
    const completeData = {
      section_timestamps: sectionTimestamps,
      word_timestamps: wordTimestamps,
      stats: {
        total_sections: Object.keys(sectionTimestamps).length,
        total_words: wordTimestamps.length
      }
    };
    navigator.clipboard.writeText(JSON.stringify(completeData, null, 2));
    toast.success('Timestamps completos copiados para clipboard!');
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'lesson-audio.mp3';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success('Download iniciado!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎙️ Gerador de Áudio com Timestamps
          </h1>
          <p className="text-gray-600">
            Cole o texto da lição e gere o áudio com timestamps automáticos
          </p>
        </div>

        {/* Botão especial para regenerar Fundamentos 01 */}
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <RefreshCw className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Regenerar Timestamps - Fundamentos 01
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                  Esta ferramenta vai regenerar os timestamps palavra-por-palavra para a lição "O que é IA e por que você precisa dela" 
                  usando os novos campos <code className="bg-purple-100 px-1 rounded">spokenContent</code> de cada section.
                </p>
                <div className="bg-white/50 rounded p-3 text-xs text-gray-700 space-y-1 mb-3">
                  <div>✅ Gera áudio completo com ElevenLabs</div>
                  <div>✅ Extrai timestamps palavra-por-palavra automaticamente</div>
                  <div>✅ Salva no banco de dados (tabela <code>lessons</code>)</div>
                  <div>✅ Sincronização perfeita entre áudio e texto falado</div>
                </div>
              </div>
            </div>
            <Button
              onClick={handleRegenerateFundamentos}
              disabled={isRegenerating}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Regenerando timestamps...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Regenerar Timestamps Agora
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Selecionar Aula (Opcional - salva automaticamente no banco)
              </label>
              <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma aula guiada..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma (apenas gerar áudio)</SelectItem>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedLessonId && selectedLessonId !== 'none' && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Áudio e timestamps serão salvos automaticamente no banco
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Texto da Lição (Audio Text)
              </label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Cole aqui o texto completo da lição..."
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Frases Marcadoras (detectadas automaticamente no texto)
              </label>
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg border">
                {markers.map((marker, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-semibold text-purple-600">{marker.sectionId}:</span>{' '}
                    <span className="text-gray-700">"{marker.phrase}"</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !text.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando áudio e processando timestamps...
                </>
              ) : (
                '🎵 Gerar Áudio com Timestamps'
              )}
            </Button>
          </div>
        </Card>

        {audioUrl && Object.keys(sectionTimestamps).length > 0 && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">✅ Áudio Gerado!</h2>
              {timestampsSaved && (
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <CheckCircle2 className="w-5 h-5" />
                  Salvo no banco!
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg border p-4">
              <audio src={audioUrl} controls className="w-full" />
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Timestamps de Seções:</h3>
              <div className="bg-gray-50 p-4 rounded-lg border font-mono text-sm space-y-1">
                {Object.entries(sectionTimestamps).map(([section, time]) => (
                  <div key={section}>
                    <span className="text-purple-600 font-bold">{section}:</span>{' '}
                    <span className="text-gray-900">{time}s</span>
                  </div>
                ))}
              </div>
            </div>

            {wordTimestamps.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">
                  Timestamps de Palavras ({wordTimestamps.length} palavras):
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border max-h-64 overflow-y-auto">
                  <div className="text-xs space-y-1 font-mono">
                    {wordTimestamps.slice(0, 50).map((wt, i) => (
                      <div key={i} className="text-gray-700">
                        {wt.start.toFixed(2)}s - {wt.end.toFixed(2)}s: "{wt.word}"
                      </div>
                    ))}
                    {wordTimestamps.length > 50 && (
                      <div className="text-gray-500 italic pt-2">
                        ... e mais {wordTimestamps.length - 50} palavras
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={copyTimestamps} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copiar Todos os Timestamps
              </Button>
              <Button onClick={downloadAudio} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Baixar Áudio
              </Button>
            </div>

            {!timestampsSaved && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Dica:</strong> Selecione uma aula acima antes de gerar o áudio para salvar automaticamente no banco de dados!
                </p>
              </div>
            )}
            
            {timestampsSaved && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-900">
                  <strong>✅ Sucesso!</strong> O áudio e os timestamps foram salvos no banco de dados. Agora o efeito karaoke vai funcionar automaticamente na aula!
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
