import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Wand2, Plus, Trash2, Eye, Save, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { IaBookExperienceCard } from '@/components/lessons/IaBookExperienceCard';

interface Section {
  id: string;
  title: string;
  audioStart?: number;
  audioEnd?: number;
}

interface ExperienceCard {
  type: 'ia-book' | 'ia-image-generator' | 'ia-chat-simulator';
  sectionIndex: number;
  timestamp: number;
  props?: Record<string, any>;
}

interface CardSuggestion {
  type: 'ia-book' | 'ia-image-generator' | 'ia-chat-simulator';
  sectionIndex: number;
  timestamp: number;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  keywords: string[];
}

export default function AdminV5CardConfig() {
  const navigate = useNavigate();
  
  // Estado do JSON da lição
  const [lessonJson, setLessonJson] = useState('');
  const [parsedLesson, setParsedLesson] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  
  // Estado dos cards
  const [experienceCards, setExperienceCards] = useState<ExperienceCard[]>([]);
  const [previewCard, setPreviewCard] = useState<ExperienceCard | null>(null);
  
  // Estado de salvamento
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado de sugestões automáticas
  const [suggestions, setSuggestions] = useState<CardSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeTextForCards = (): CardSuggestion[] => {
    if (!parsedLesson || !sections.length) return [];

    const cardKeywords = {
      'ia-book': ['livro', 'escrever', 'autor', 'capítulo', 'publicar', 'obra', 'literatura', 'narrativa'],
      'ia-image-generator': ['imagem', 'visual', 'design', 'criar', 'gerar', 'ilustração', 'arte', 'foto'],
      'ia-chat-simulator': ['conversa', 'chat', 'diálogo', 'perguntar', 'responder', 'interação', 'mensagem'],
    };

    const foundSuggestions: CardSuggestion[] = [];

    sections.forEach((section: any, sectionIndex) => {
      const content = (section.visualContent || '').toLowerCase();
      if (!content) return;

      const words = content.split(/\s+/);
      const totalWords = words.length;
      
      // Calcular duração do áudio da seção (se disponível)
      const audioDuration = section.timestamp?.end && section.timestamp?.start 
        ? section.timestamp.end - section.timestamp.start 
        : 60; // fallback: 60s

      // Procurar por cada tipo de card
      Object.entries(cardKeywords).forEach(([cardType, keywords]) => {
        keywords.forEach((keyword) => {
          const regex = new RegExp(`\\b${keyword}\\w*\\b`, 'gi');
          const matches = content.match(regex);
          
          if (matches && matches.length > 0) {
            // Encontrar posição da primeira ocorrência
            const firstMatch = matches[0];
            const firstIndex = content.indexOf(firstMatch.toLowerCase());
            const wordsBeforeMatch = content.substring(0, firstIndex).split(/\s+/).length;
            
            // Calcular percentual da posição no texto
            const textPercentage = wordsBeforeMatch / totalWords;
            
            // Estimar timestamp baseado na posição no texto
            const estimatedTimestamp = Math.round(textPercentage * audioDuration);
            
            // Calcular confiança
            const matchCount = matches.length;
            const confidence: 'high' | 'medium' | 'low' = 
              matchCount >= 3 ? 'high' : matchCount >= 2 ? 'medium' : 'low';

            foundSuggestions.push({
              type: cardType as any,
              sectionIndex,
              timestamp: estimatedTimestamp,
              confidence,
              reasoning: `Detectada ${matchCount}x a palavra "${keyword}" (~${Math.round(textPercentage * 100)}% do texto)`,
              keywords: matches.slice(0, 3), // Primeiras 3 ocorrências
            });
          }
        });
      });
    });

    // Remover duplicatas (mesma seção + mesmo tipo)
    const uniqueSuggestions = foundSuggestions.reduce((acc, curr) => {
      const exists = acc.find(
        s => s.sectionIndex === curr.sectionIndex && s.type === curr.type
      );
      
      if (!exists || curr.confidence === 'high') {
        return [...acc.filter(s => 
          !(s.sectionIndex === curr.sectionIndex && s.type === curr.type)
        ), curr];
      }
      return acc;
    }, [] as CardSuggestion[]);

    // Ordenar por confiança e seção
    return uniqueSuggestions.sort((a, b) => {
      const confidenceOrder = { high: 3, medium: 2, low: 1 };
      if (confidenceOrder[a.confidence] !== confidenceOrder[b.confidence]) {
        return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
      }
      return a.sectionIndex - b.sectionIndex;
    });
  };

  const handleAutoSuggest = () => {
    setIsAnalyzing(true);
    
    // Simular delay de análise (para UX)
    setTimeout(() => {
      const suggested = analyzeTextForCards();
      setSuggestions(suggested);
      setIsAnalyzing(false);
      
      toast({
        title: suggested.length > 0 ? "✨ Sugestões geradas!" : "⚠️ Nenhuma sugestão encontrada",
        description: suggested.length > 0 
          ? `${suggested.length} experience cards sugeridos baseados no conteúdo`
          : "Não encontrei palavras-chave relevantes no texto das seções",
      });

      console.log('🧠 [V5-CONFIG] Sugestões automáticas:', suggested);
    }, 800);
  };

  const handleAcceptSuggestion = (suggestion: CardSuggestion) => {
    const newCard: ExperienceCard = {
      type: suggestion.type,
      sectionIndex: suggestion.sectionIndex,
      timestamp: suggestion.timestamp,
      props: {},
    };
    
    setExperienceCards([...experienceCards, newCard]);
    
    // Remover da lista de sugestões
    setSuggestions(suggestions.filter(s => s !== suggestion));
    
    toast({
      title: "✅ Card adicionado",
      description: `${suggestion.type} adicionado na Seção ${suggestion.sectionIndex + 1}`,
    });
  };

  const handleAcceptAllSuggestions = () => {
    const newCards: ExperienceCard[] = suggestions.map(s => ({
      type: s.type,
      sectionIndex: s.sectionIndex,
      timestamp: s.timestamp,
      props: {},
    }));
    
    setExperienceCards([...experienceCards, ...newCards]);
    setSuggestions([]);
    
    toast({
      title: "✅ Todas as sugestões aceitas",
      description: `${newCards.length} cards adicionados`,
    });
  };

  const handleAnalyzeJson = () => {
    try {
      const parsed = JSON.parse(lessonJson);
      
      // Validar estrutura básica
      if (!parsed.title) {
        throw new Error('JSON precisa ter campo "title"');
      }
      
      if (!parsed.content?.sections || !Array.isArray(parsed.content.sections)) {
        throw new Error('JSON precisa ter "content.sections" como array');
      }

      setParsedLesson(parsed);
      setSections(parsed.content.sections);
      
      toast({
        title: "✅ JSON analisado!",
        description: `Detectadas ${parsed.content.sections.length} seções na lição "${parsed.title}"`,
      });
      
      console.log('📊 [V5-CONFIG] JSON analisado:', {
        title: parsed.title,
        sectionsCount: parsed.content.sections.length,
        sections: parsed.content.sections.map((s: any) => ({
          id: s.id,
          title: s.title,
        })),
      });
      
    } catch (error: any) {
      console.error('❌ [V5-CONFIG] Erro ao analisar JSON:', error);
      toast({
        title: "Erro ao analisar JSON",
        description: error.message || "JSON inválido. Verifique a sintaxe.",
        variant: "destructive",
      });
    }
  };

  const handleAddCard = () => {
    const newCard: ExperienceCard = {
      type: 'ia-book',
      sectionIndex: 0,
      timestamp: 0,
      props: {},
    };
    
    setExperienceCards([...experienceCards, newCard]);
    console.log('➕ [V5-CONFIG] Card adicionado:', newCard);
  };

  const handleUpdateCard = (index: number, updates: Partial<ExperienceCard>) => {
    const updated = [...experienceCards];
    updated[index] = { ...updated[index], ...updates };
    setExperienceCards(updated);
    console.log(`🔄 [V5-CONFIG] Card ${index} atualizado:`, updates);
  };

  const handleRemoveCard = (index: number) => {
    const updated = experienceCards.filter((_, i) => i !== index);
    setExperienceCards(updated);
    console.log(`🗑️ [V5-CONFIG] Card ${index} removido`);
  };

  const handlePreviewCard = (card: ExperienceCard) => {
    setPreviewCard(card);
    console.log('👁️ [V5-CONFIG] Preview:', card);
  };

  const renderCardPreview = () => {
    if (!previewCard) return null;

    switch (previewCard.type) {
      case 'ia-book':
        return <IaBookExperienceCard key="preview" />;
      
      case 'ia-image-generator':
        return (
          <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-600" />
            <p className="text-lg font-semibold text-purple-900">IaImageGeneratorCard</p>
            <p className="text-sm text-purple-600 mt-2">Card ainda não implementado</p>
          </div>
        );
      
      case 'ia-chat-simulator':
        return (
          <div className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <p className="text-lg font-semibold text-blue-900">IaChatSimulatorCard</p>
            <p className="text-sm text-blue-600 mt-2">Card ainda não implementado</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  const handleCreateLesson = async () => {
    if (!parsedLesson) {
      toast({
        title: "JSON não analisado",
        description: "Cole o JSON e clique em 'Analisar JSON' primeiro.",
        variant: "destructive",
      });
      return;
    }

    if (experienceCards.length === 0) {
      toast({
        title: "Nenhum card configurado",
        description: "Adicione pelo menos um experience card.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Adicionar experienceCards ao conteúdo
      const lessonData = {
        ...parsedLesson,
        model: 'v5', // Forçar modelo V5
        content: {
          ...parsedLesson.content,
          experienceCards,
        },
      };

      // Inserir no banco
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          title: lessonData.title,
          trail_id: lessonData.trail_id,
          order_index: lessonData.order_index || 0,
          estimated_time: lessonData.estimated_time || 5,
          content: lessonData.content,
          exercises: lessonData.exercises || [],
          audio_url: lessonData.audio_url || null,
          word_timestamps: lessonData.word_timestamps || null,
          model: 'v5',
          is_active: false, // Começa inativa para revisão
          lesson_type: 'guided',
          difficulty_level: 'beginner',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "✅ Lição V5 criada!",
        description: `Lição "${lessonData.title}" criada com ${experienceCards.length} experience cards.`,
      });

      console.log('🎉 [V5-CONFIG] Lição V5 criada:', data);

      // Limpar formulário
      setLessonJson('');
      setParsedLesson(null);
      setSections([]);
      setExperienceCards([]);
      setPreviewCard(null);

    } catch (error: any) {
      console.error('❌ [V5-CONFIG] Erro ao criar lição:', error);
      toast({
        title: "Erro ao criar lição",
        description: error.message || "Não foi possível criar a lição V5.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/manual')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Wand2 className="w-8 h-8 text-purple-600" />
              Criar Lição V5 com Experience Cards
            </h1>
            <p className="text-muted-foreground">
              Cole o JSON da lição, configure os cards interativos e crie uma lição V5
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Coluna Esquerda: Configuração */}
          <div className="space-y-6">
            {/* Step 1: JSON da Lição */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-sm font-bold">1</span>
                  Cole o JSON da Lição
                </CardTitle>
                <CardDescription>
                  JSON completo com title, content.sections, exercises, etc.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={lessonJson}
                  onChange={(e) => setLessonJson(e.target.value)}
                  placeholder='{"title": "...", "trail_id": "...", "content": {"sections": [...]}}'
                  className="font-mono text-xs min-h-[200px]"
                />
                
                <Button
                  onClick={handleAnalyzeJson}
                  disabled={!lessonJson.trim()}
                  className="w-full"
                  variant="outline"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analisar JSON
                </Button>

                {parsedLesson && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-semibold text-green-900">{parsedLesson.title}</p>
                    <p className="text-sm text-green-700">
                      {sections.length} seções detectadas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 1.5: Sugestões Automáticas */}
            {parsedLesson && (
              <Card className="border-2 border-amber-200 bg-amber-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    Sugestões Automáticas de Cards
                  </CardTitle>
                  <CardDescription>
                    Analisamos o conteúdo das seções para sugerir experience cards baseados em palavras-chave
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleAutoSuggest}
                    disabled={isAnalyzing}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    variant="default"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isAnalyzing ? 'Analisando...' : 'Sugerir Cards Automaticamente'}
                  </Button>

                  {suggestions.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{suggestions.length} sugestões encontradas</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleAcceptAllSuggestions}
                        >
                          Aceitar Todas
                        </Button>
                      </div>

                      {suggestions.map((suggestion, idx) => (
                        <Card key={idx} className="border-2 border-amber-200">
                          <CardContent className="pt-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant={
                                    suggestion.confidence === 'high' ? 'default' :
                                    suggestion.confidence === 'medium' ? 'secondary' : 'outline'
                                  }>
                                    {suggestion.confidence === 'high' ? '🔥' : suggestion.confidence === 'medium' ? '👍' : '🤔'} {suggestion.confidence}
                                  </Badge>
                                  <Badge variant="outline">
                                    {suggestion.type === 'ia-book' ? '📚' :
                                     suggestion.type === 'ia-image-generator' ? '🎨' : '💬'} {suggestion.type}
                                  </Badge>
                                </div>
                                
                                <p className="text-sm">
                                  <strong>Seção {suggestion.sectionIndex + 1}</strong> aos <strong>{suggestion.timestamp}s</strong>
                                </p>
                                
                                <p className="text-xs text-muted-foreground">
                                  {suggestion.reasoning}
                                </p>
                                
                                <div className="flex gap-1 flex-wrap">
                                  {suggestion.keywords.map((kw, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {kw}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <Button
                                size="sm"
                                onClick={() => handleAcceptSuggestion(suggestion)}
                              >
                                Aceitar
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Adicionar Cards */}
            {parsedLesson && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white text-sm font-bold">2</span>
                    Configure os Experience Cards
                  </CardTitle>
                  <CardDescription>
                    Adicione cards interativos manualmente ou aceite as sugestões automáticas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleAddCard}
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Card Manualmente
                  </Button>

                  {experienceCards.length > 0 && (
                    <div className="space-y-3">
                      {experienceCards.map((card, index) => (
                        <Card key={index} className="border-2">
                          <CardContent className="pt-6 space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary">Card {index + 1}</Badge>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handlePreviewCard(card)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveCard(index)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>

                            <Separator />

                            {/* Seção */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Seção</label>
                              <Select
                                value={card.sectionIndex.toString()}
                                onValueChange={(value) =>
                                  handleUpdateCard(index, { sectionIndex: parseInt(value) })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {sections.map((section, idx) => (
                                    <SelectItem key={idx} value={idx.toString()}>
                                      Seção {idx + 1}: {section.title || section.id}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Timestamp */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Timestamp (segundos no áudio da seção)
                              </label>
                              <Input
                                type="number"
                                min={0}
                                step={0.1}
                                value={card.timestamp}
                                onChange={(e) =>
                                  handleUpdateCard(index, {
                                    timestamp: parseFloat(e.target.value),
                                  })
                                }
                                placeholder="Ex: 15.5"
                              />
                            </div>

                            {/* Tipo de Card */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Tipo de Card</label>
                              <Select
                                value={card.type}
                                onValueChange={(value: any) =>
                                  handleUpdateCard(index, { type: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ia-book">
                                    📚 IaBookExperienceCard
                                  </SelectItem>
                                  <SelectItem value="ia-image-generator" disabled>
                                    🎨 IaImageGeneratorCard (em breve)
                                  </SelectItem>
                                  <SelectItem value="ia-chat-simulator" disabled>
                                    💬 IaChatSimulatorCard (em breve)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Criar Lição */}
            {experienceCards.length > 0 && (
              <Card className="border-2 border-green-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-sm font-bold">3</span>
                    Criar Lição V5
                  </CardTitle>
                  <CardDescription>
                    Salvar no banco de dados com todos os experience cards configurados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleCreateLesson}
                    disabled={isSaving}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Criando...' : 'Criar Lição V5'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Coluna Direita: Preview */}
          <div className="space-y-6">
            <Card className="min-h-[600px] sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview do Card
                </CardTitle>
                <CardDescription>
                  Visualização em tempo real do experience card selecionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!previewCard ? (
                  <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                    <AlertCircle className="w-16 h-16 text-muted-foreground/30" />
                    <div>
                      <p className="text-lg font-medium text-muted-foreground">
                        Nenhum card selecionado
                      </p>
                      <p className="text-sm text-muted-foreground/60 mt-1">
                        Adicione um card e clique no ícone de olho para visualizar
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-900">
                        📍 Seção {previewCard.sectionIndex + 1} | ⏱️ {previewCard.timestamp}s
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Este card aparece {previewCard.timestamp} segundos após o início do áudio
                        da seção {previewCard.sectionIndex + 1}
                      </p>
                    </div>
                    
                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-6">
                      {renderCardPreview()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumo dos Cards */}
            {experienceCards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📋 Resumo dos Cards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {experienceCards.map((card, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            Card {index + 1}: {card.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Seção {card.sectionIndex + 1} · {card.timestamp}s
                          </p>
                        </div>
                        <Badge variant="secondary">{card.type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
