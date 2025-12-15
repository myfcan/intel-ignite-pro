// src/pages/AdminV7Create.tsx
// Admin page for creating V7 Cinematic Lessons

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Film, Sparkles, Save, Play, Loader2 } from 'lucide-react';
import { V7PipelineInput } from '@/types/v7-cinematic.types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
export default function AdminV7Create() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // ============================================================================
  // STATE
  // ============================================================================

  const [formData, setFormData] = useState<Partial<V7PipelineInput>>({
    title: '',
    subtitle: '',
    difficulty: 'beginner',
    category: 'javascript',
    tags: [],
    learningObjectives: [],
    narrativeScript: '',
    duration: 300, // 5 minutes default
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState<any>(null);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleInputChange = (field: keyof V7PipelineInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateLesson = async () => {
    // Validate form
    if (!formData.title || !formData.narrativeScript) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha pelo menos o título e o roteiro narrativo',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Call V7 Pipeline Edge Function
      const { data, error } = await supabase.functions.invoke('v7-pipeline', {
        body: {
          title: formData.title,
          subtitle: formData.subtitle || '',
          difficulty: formData.difficulty || 'beginner',
          category: formData.category || 'javascript',
          tags: formData.tags || [],
          learningObjectives: formData.learningObjectives || [],
          narrativeScript: formData.narrativeScript,
          duration: formData.duration || 300,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Pipeline failed');

      toast({
        title: '✨ Lição V7 gerada com sucesso!',
        description: `${data.stats.actCount} atos criados, ${data.stats.interactivePoints} pontos interativos`,
      });

      // Store generated lesson data
      setGeneratedLesson({
        id: data.lessonId || `v7-preview-${Date.now()}`,
        title: formData.title,
        model: 'v7-cinematic',
        content: data.content,
        stats: data.stats,
      });
    } catch (error: any) {
      console.error('[AdminV7Create] Pipeline error:', error);
      toast({
        title: 'Erro ao gerar lição',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = () => {
    if (generatedLesson) {
      navigate(`/admin/v7/preview/${generatedLesson.id}`);
    }
  };

  const handleSave = async () => {
    if (!generatedLesson) return;

    try {
      // Save to database
      toast({
        title: '💾 Lição salva!',
        description: 'A lição V7 foi salva com sucesso',
      });

      navigate('/admin');
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Admin
        </Button>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Film className="w-10 h-10 text-cyan-500" />
            Criar Lição V7 Cinematic
          </h1>
          <p className="text-muted-foreground">
            Sistema de nova geração para experiências imersivas de aprendizado
          </p>
        </div>

        {/* Main Form */}
        <Card className="border-2 border-cyan-500/20">
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Configure os dados principais da lição cinematográfica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Título da Lição *</Label>
              <Input
                id="title"
                placeholder="Ex: JavaScript Avançado - Async/Await"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input
                id="subtitle"
                placeholder="Uma jornada cinematográfica pelo mundo assíncrono"
                value={formData.subtitle}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
              />
            </div>

            {/* Difficulty and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Dificuldade</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => handleInputChange('difficulty', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="nodejs">Node.js</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duração Estimada (segundos)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="300"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Aproximadamente {Math.floor((formData.duration || 0) / 60)} minutos
              </p>
            </div>

            {/* Learning Objectives */}
            <div className="space-y-2">
              <Label htmlFor="objectives">Objetivos de Aprendizado</Label>
              <Textarea
                id="objectives"
                placeholder="Digite um objetivo por linha:&#10;- Entender async/await&#10;- Dominar promises&#10;- Tratar erros assíncronos"
                rows={4}
                value={formData.learningObjectives?.join('\n')}
                onChange={(e) => {
                  const objectives = e.target.value.split('\n').filter((o) => o.trim());
                  handleInputChange('learningObjectives', objectives);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Narrative Script */}
        <Card className="border-2 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Roteiro Narrativo
            </CardTitle>
            <CardDescription>
              Escreva o roteiro completo da narração. A IA irá processar e criar os atos
              cinematográficos automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Escreva o roteiro narrativo completo aqui...&#10;&#10;Exemplo:&#10;Bem-vindo à jornada pelo mundo assíncrono do JavaScript. Hoje, vamos explorar como o JavaScript lida com operações que levam tempo...&#10;&#10;[Continue com o roteiro completo, incluindo pontos de interação e desafios]"
              rows={15}
              value={formData.narrativeScript}
              onChange={(e) => handleInputChange('narrativeScript', e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {formData.narrativeScript?.length || 0} caracteres
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={handleGenerateLesson}
            disabled={isGenerating || !formData.title || !formData.narrativeScript}
            className="flex-1 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                Gerando Lição V7...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Gerar Lição V7
              </>
            )}
          </Button>

          {generatedLesson && (
            <>
              <Button onClick={handlePreview} variant="outline" size="lg">
                <Play className="w-5 h-5 mr-2" />
                Preview
              </Button>

              <Button onClick={handleSave} variant="default" size="lg">
                <Save className="w-5 h-5 mr-2" />
                Salvar
              </Button>
            </>
          )}
        </div>

        {/* Info Card */}
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-sm">ℹ️ Como funciona o V7 Cinematic</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              1. <strong>Roteiro Narrativo</strong>: A IA analisa seu roteiro e divide em atos
              cinematográficos
            </p>
            <p>
              2. <strong>Geração de Atos</strong>: Cada ato recebe animações, transições e
              sincronização de áudio
            </p>
            <p>
              3. <strong>Playground Comparativo</strong>: Código amateur vs professional é
              gerado automaticamente
            </p>
            <p>
              4. <strong>Interações</strong>: Pontos de interação são inseridos
              estrategicamente
            </p>
            <p>
              5. <strong>Gamificação</strong>: XP, achievements e scoring são configurados
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
