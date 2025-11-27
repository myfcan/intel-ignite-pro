import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type ImageAPI = 'openai' | 'leonardo';

export default function AdminTestImageGeneration() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [selectedApi, setSelectedApi] = useState<ImageAPI>('leonardo');

  const handleTestGeneration = async () => {
    setIsGenerating(true);
    setImageUrl(null);
    setStats(null);

    try {
      const startTime = Date.now();
      
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
          batchIndex: 0,
          api: selectedApi // Adicionar seleção de API
        }
      });

      const elapsedTime = Date.now() - startTime;

      if (error) {
        console.error('Erro ao gerar imagem:', error);
        toast.error(`Erro: ${error.message}`);
        return;
      }

      if (data?.slides?.[0]?.imageUrl) {
        setImageUrl(data.slides[0].imageUrl);
        setStats({
          ...data.stats,
          elapsedTime: Math.round(elapsedTime / 1000),
          api: selectedApi
        });
        toast.success(`Imagem gerada com ${selectedApi === 'leonardo' ? 'Leonardo.ai' : 'OpenAI DALL-E 2'}!`);
      } else {
        toast.error('Nenhuma imagem foi gerada');
      }

    } catch (err: any) {
      console.error('Erro fatal:', err);
      toast.error(`Erro fatal: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/admin')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold mb-2">Teste de Geração de Imagens</h1>
          <p className="text-muted-foreground">
            Teste a edge function generate-slide-images com OpenAI DALL-E 3
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teste Rápido</CardTitle>
          <CardDescription>
            Selecione a API e clique no botão para gerar uma imagem de teste
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">API de Geração</label>
            <Select value={selectedApi} onValueChange={(value) => setSelectedApi(value as ImageAPI)}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                <SelectItem value="leonardo">Leonardo.ai (Recomendado)</SelectItem>
                <SelectItem value="openai">OpenAI DALL-E 2</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {selectedApi === 'leonardo' 
                ? 'Leonardo.ai: Alta qualidade, 1792x1024, photorealistic'
                : 'OpenAI DALL-E 2: Rápido, 1024x1024, mais simples'}
            </p>
          </div>
          <Button
            onClick={handleTestGeneration}
            disabled={isGenerating}
            size="lg"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando imagem...
              </>
            ) : (
              'Gerar Imagem de Teste'
            )}
          </Button>

          {stats && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h3 className="font-semibold">Estatísticas:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>API: {stats.api === 'leonardo' ? 'Leonardo.ai' : 'OpenAI DALL-E 2'}</div>
                <div>Tempo: {stats.elapsedTime}s</div>
                <div>Total de slides: {stats.total}</div>
                <div>Sucesso: {stats.success}</div>
                <div>Falhas: {stats.failed}</div>
              </div>
            </div>
          )}

          {imageUrl && (
            <div className="space-y-2">
              <h3 className="font-semibold">Imagem Gerada:</h3>
              <img
                src={imageUrl}
                alt="Imagem gerada"
                className="w-full max-w-2xl rounded-lg border-2 border-primary"
              />
              <p className="text-sm text-muted-foreground">
                Tamanho: {Math.round(imageUrl.length / 1024)} KB
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
