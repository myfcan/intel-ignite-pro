import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  FileJson, 
  BookOpen, 
  Copy, 
  CheckCircle,
  FolderOpen,
  Rocket,
  FileText,
  Code
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';

// JSON Modelo INPUT para Pipeline V7-vv
import V7Aula1InputModelo from '@/data/v7-aula1-input-modelo.json';

export default function AdminModelos() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyJsonToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(V7Aula1InputModelo, null, 2));
      setCopied(true);
      toast.success('JSON copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error('Erro ao copiar JSON');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FolderOpen className="w-8 h-8 text-emerald-500" />
              Guia de Modelos
            </h1>
            <p className="text-muted-foreground mt-1">
              Templates JSON, documentação e guias de uso
            </p>
          </div>
        </div>

        {/* JSON Modelo Aula 1 - Destaque */}
        <Card className="border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-500/10 to-green-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileJson className="w-7 h-7 text-emerald-500" />
              JSON Modelo Padrão - Aula 1 V7-vv
              <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full">REFERÊNCIA</span>
            </CardTitle>
            <CardDescription>
              Espelho exato da Aula 1 funcionando - Use como base para criar novas aulas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <p>✅ 11 cenas completas (dramatic, narrative, interaction, playground, revelation, cta, gamification)</p>
              <p>✅ anchorText.pauseAt APENAS em cenas interativas (quiz, playground, cta)</p>
              <p>✅ Método PERFEITO com letter-reveal</p>
              <p>✅ Quiz 4 opções com feedback narrado</p>
              <p>✅ Playground amador vs profissional</p>
              <p>✅ CTA com 2 botões corretos (Continuar/Voltar)</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="flex-1 min-w-[160px] bg-emerald-600 hover:bg-emerald-700"
                onClick={copyJsonToClipboard}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 mr-2" />
                    Copiar JSON Modelo
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 min-w-[160px] border-emerald-500/50 hover:bg-emerald-500/10"
                onClick={() => navigate('/admin/v7-vv')}
              >
                <Rocket className="w-5 h-5 mr-2" />
                Usar no Pipeline
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Documentação V7-vv */}
          <Card className="border-2 border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                Documentação V7-vv
              </CardTitle>
              <CardDescription>
                Guia completo do formato V7-vv
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>📖 Estrutura do JSON</p>
                <p>📖 Tipos de cenas suportados</p>
                <p>📖 AnchorText e pauseAt</p>
                <p>📖 Visual Effects</p>
              </div>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigate('/admin/v7/docs')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Ver Documentação
              </Button>
            </CardContent>
          </Card>

          {/* Tipos de Cena */}
          <Card className="border-2 border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-500" />
                Tipos de Cena
              </CardTitle>
              <CardDescription>
                Referência rápida dos tipos disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1 font-mono">
                <p><span className="text-yellow-500">dramatic</span> - Abertura impactante</p>
                <p><span className="text-yellow-500">narrative</span> - Explicação com visuais</p>
                <p><span className="text-yellow-500">comparison</span> - Lado a lado</p>
                <p><span className="text-yellow-500">interaction</span> - Quiz (+ anchorText)</p>
                <p><span className="text-yellow-500">playground</span> - Prática (+ anchorText)</p>
                <p><span className="text-yellow-500">revelation</span> - Revelação dramática</p>
                <p><span className="text-yellow-500">gamification</span> - Recompensas</p>
              </div>
            </CardContent>
          </Card>

          {/* Micro Visuals Suportados */}
          <Card className="border-2 border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                Micro Visuals
              </CardTitle>
              <CardDescription>
                Tipos de microVisual suportados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1 font-mono">
                <p><span className="text-green-500">icon</span> - Ícone animado</p>
                <p><span className="text-green-500">text</span> - Texto dinâmico</p>
                <p><span className="text-green-500">number</span> - Número/estatística</p>
                <p><span className="text-green-500">image</span> - Imagem/ilustração</p>
                <p><span className="text-green-500">badge</span> - Badge/etiqueta</p>
                <p><span className="text-green-500">highlight</span> - Destaque</p>
                <p><span className="text-green-500">letter-reveal</span> - Revelação letra a letra</p>
              </div>
            </CardContent>
          </Card>

          {/* Visual Effects */}
          <Card className="border-2 border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-500" />
                Visual Effects
              </CardTitle>
              <CardDescription>
                Efeitos visuais disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1 font-mono">
                <p><span className="text-cyan-500">mood</span> - dramatic, calm, danger, success</p>
                <p><span className="text-cyan-500">particles</span> - confetti, sparks, ember</p>
                <p><span className="text-cyan-500">glow</span> - Efeito de brilho</p>
                <p><span className="text-cyan-500">shake</span> - Tremor de câmera</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dica */}
        <Card className="border border-border/50 bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Dica de uso</p>
                <p>
                  Copie o JSON Modelo, cole no Pipeline V7-vv e modifique os textos de narração e conteúdo visual. 
                  Mantenha a estrutura de cenas para garantir que o processamento funcione corretamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
