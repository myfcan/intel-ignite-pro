import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { IntonationAnalyzer } from '@/components/admin/IntonationAnalyzer';

export default function AdminIntonationTest() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/manual')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">🎙️ Análise de Entonação TTS</h1>
              <p className="text-sm text-muted-foreground">
                Teste textos antes de gerar áudio para detectar problemas de entonação
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <IntonationAnalyzer />

        <div className="mt-6 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h3 className="font-semibold mb-3">💡 O que o sistema detecta:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-red-600">🔴</span>
              <div>
                <div className="font-medium">Palavras em CAIXA ALTA</div>
                <div className="text-muted-foreground">
                  Causam "gritos" no áudio (ex: AGORA, HOJE, VOCÊ)
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-600">🟡</span>
              <div>
                <div className="font-medium">Múltiplas exclamações/interrogações</div>
                <div className="text-muted-foreground">
                  Causam entonação exagerada (!!, ???)
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-600">🟡</span>
              <div>
                <div className="font-medium">Ênfase excessiva</div>
                <div className="text-muted-foreground">
                  Negrito com CAIXA ALTA (**PALAVRA**)
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">🟢</span>
              <div>
                <div className="font-medium">Frases muito longas</div>
                <div className="text-muted-foreground">
                  Mais de 150 caracteres sem pontuação
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">🟢</span>
              <div>
                <div className="font-medium">Sequências de emojis</div>
                <div className="text-muted-foreground">
                  3 ou mais emojis seguidos causam pausas estranhas
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
