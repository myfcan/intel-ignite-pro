import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Copy, Download } from 'lucide-react';

interface SectionMarker {
  phrase: string;
  sectionId: string;
}

export default function AdminAudioGenerator() {
  const [text, setText] = useState('');
  const [markers, setMarkers] = useState<SectionMarker[]>([
    { phrase: 'Olá! Eu sou a MAIA, e vou te guiar nesta jornada pela Inteligência Artificial.', sectionId: 'gancho' },
    { phrase: 'Então, o que é Inteligência Artificial de verdade?', sectionId: 'conceito' },
    { phrase: 'Deixa eu te mostrar onde você já usa IA todos os dias sem perceber.', sectionId: 'onde-esta' },
    { phrase: 'Agora a pergunta de ouro: por que VOCÊ, especificamente, precisa aprender isso agora?', sectionId: 'porque-voce-precisa' },
    { phrase: 'Então, qual é o seu próximo passo concreto?', sectionId: 'proximos-passos' }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [timestamps, setTimestamps] = useState<Record<string, number> | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('Por favor, insira o texto da lição');
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Chamando edge function para gerar áudio com timestamps...');
      
      const { data, error } = await supabase.functions.invoke('generate-audio-with-timestamps', {
        body: {
          text: text.trim(),
          section_markers: markers,
          voice_id: 'EXAVITQu4vr4xnSDxMaL', // Sarah
          model_id: 'eleven_multilingual_v2'
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
      setTimestamps(data.section_timestamps);
      
      toast.success('Áudio gerado com sucesso! 🎉');
      
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
    if (!timestamps) return;
    
    const code = `sections: [
  { id: 'gancho', timestamp: ${timestamps.gancho || 0}, ... },
  { id: 'conceito', timestamp: ${timestamps.conceito || 0}, ... },
  { id: 'onde-esta', timestamp: ${timestamps['onde-esta'] || 0}, ... },
  { id: 'porque-voce-precisa', timestamp: ${timestamps['porque-voce-precisa'] || 0}, ... },
  { id: 'proximos-passos', timestamp: ${timestamps['proximos-passos'] || 0}, ... }
]`;
    
    navigator.clipboard.writeText(code);
    toast.success('Timestamps copiados!');
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

        <Card className="p-6">
          <div className="space-y-4">
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

        {audioUrl && timestamps && (
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">✅ Áudio Gerado!</h2>
            
            <div className="bg-white rounded-lg border p-4">
              <audio src={audioUrl} controls className="w-full" />
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Timestamps Detectados:</h3>
              <div className="bg-gray-50 p-4 rounded-lg border font-mono text-sm space-y-1">
                {Object.entries(timestamps).map(([section, time]) => (
                  <div key={section}>
                    <span className="text-purple-600 font-bold">{section}:</span>{' '}
                    <span className="text-gray-900">{time}s</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={copyTimestamps} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copiar Timestamps
              </Button>
              <Button onClick={downloadAudio} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Baixar Áudio
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Próximo passo:</strong> Copie os timestamps acima e atualize o arquivo{' '}
                <code className="bg-blue-100 px-2 py-1 rounded">src/data/lessons/fundamentos-01.ts</code>{' '}
                com os valores corretos.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
