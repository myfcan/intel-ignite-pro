import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { allPromptCategories } from '@/data/prompts';
import { Prompt } from '@/types/prompt';
import {
  ChevronLeft,
  Copy,
  Check,
  Lock,
  Star,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

/**
 * PromptCategory Page: Lista prompts de uma categoria específica
 *
 * URL: /prompt-library/:categoryId
 * Features:
 * - Filtro por dificuldade
 * - Modal com prompt completo
 * - Copy to clipboard
 * - Badge premium/featured
 */
export default function PromptCategory() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const category = allPromptCategories.find(cat => cat.id === categoryId);

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Categoria não encontrada
          </h1>
          <Button onClick={() => navigate('/prompt-library')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar para Biblioteca
          </Button>
        </div>
      </div>
    );
  }

  // Filtrar prompts
  const filteredPrompts = category.prompts.filter(prompt => {
    if (difficultyFilter === 'all') return true;
    return prompt.difficulty === difficultyFilter;
  });

  // Copy prompt
  const handleCopyPrompt = (prompt: Prompt) => {
    navigator.clipboard.writeText(prompt.template);
    setCopiedPrompt(prompt.id);
    toast({
      title: '✅ Prompt copiado!',
      description: 'Cole no ChatGPT, Claude ou qualquer IA',
    });
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/prompt-library')}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {category.name}
              </h1>
              <p className="text-gray-600 mt-2">{category.description}</p>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline">
                  {category.prompts.length} prompts
                </Badge>
                {category.isPopular && (
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex gap-3 mb-8">
          <Button
            variant={difficultyFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setDifficultyFilter('all')}
          >
            Todos ({category.prompts.length})
          </Button>
          <Button
            variant={difficultyFilter === 'beginner' ? 'default' : 'outline'}
            onClick={() => setDifficultyFilter('beginner')}
            className={difficultyFilter === 'beginner' ? '' : 'border-green-300'}
          >
            Iniciante ({category.prompts.filter(p => p.difficulty === 'beginner').length})
          </Button>
          <Button
            variant={difficultyFilter === 'intermediate' ? 'default' : 'outline'}
            onClick={() => setDifficultyFilter('intermediate')}
            className={difficultyFilter === 'intermediate' ? '' : 'border-yellow-300'}
          >
            Intermediário ({category.prompts.filter(p => p.difficulty === 'intermediate').length})
          </Button>
          <Button
            variant={difficultyFilter === 'advanced' ? 'default' : 'outline'}
            onClick={() => setDifficultyFilter('advanced')}
            className={difficultyFilter === 'advanced' ? '' : 'border-red-300'}
          >
            Avançado ({category.prompts.filter(p => p.difficulty === 'advanced').length})
          </Button>
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="rounded-xl p-6 border-2 hover:border-indigo-300 hover:shadow-lg transition-all group cursor-pointer relative"
              onClick={() => setSelectedPrompt(prompt)}
              style={{
                background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
                backgroundImage: `
                  linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%),
                  radial-gradient(circle, rgba(139, 92, 246, 0.08) 1px, transparent 1px)
                `,
                backgroundSize: 'cover, 16px 16px',
                backgroundPosition: 'center, 0 0',
                borderColor: 'rgba(139, 92, 246, 0.2)',
              }}
            >
              {/* Badge Premium/Featured */}
              {(prompt.isPremium || prompt.isFeatured) && (
                <div className="absolute top-2 right-2 flex gap-2 z-10">
                  {prompt.isFeatured && (
                    <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3" />
                      Destaque
                    </span>
                  )}
                  {prompt.isPremium && (
                    <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded flex items-center gap-1 shadow-md">
                      <Lock className="w-3 h-3" />
                      Premium
                    </span>
                  )}
                </div>
              )}

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>

              {/* Header */}
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                {prompt.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">
                {prompt.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-xs px-2 py-1 rounded ${difficultyColors[prompt.difficulty]}`}>
                  {prompt.difficulty === 'beginner' && 'Iniciante'}
                  {prompt.difficulty === 'intermediate' && 'Intermediário'}
                  {prompt.difficulty === 'advanced' && 'Avançado'}
                </span>
                {prompt.usageCount && prompt.usageCount > 1000 && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {prompt.usageCount.toLocaleString()} usos
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  className="flex-1 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPrompt(prompt);
                  }}
                >
                  Ver Detalhes
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyPrompt(prompt);
                  }}
                  className="px-4 py-2 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                  style={{background: 'linear-gradient(135deg, #6CB1FF 0%, #837BFF 100%)'}}
                >
                  {copiedPrompt === prompt.id ? (
                    <>
                      <Check className="w-4 h-4 inline mr-1" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 inline mr-1" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt Detail Modal */}
      <Dialog open={!!selectedPrompt} onOpenChange={() => setSelectedPrompt(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              {selectedPrompt?.title}
              {selectedPrompt?.isPremium && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  <Lock className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>{selectedPrompt?.description}</DialogDescription>
          </DialogHeader>

          {selectedPrompt && (
            <div className="space-y-6 mt-4">
              {/* Template */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center justify-between">
                  Template do Prompt
                  <Button
                    size="sm"
                    onClick={() => handleCopyPrompt(selectedPrompt)}
                  >
                    {copiedPrompt === selectedPrompt.id ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Prompt
                      </>
                    )}
                  </Button>
                </h4>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
                  {selectedPrompt.template}
                </div>
              </div>

              {/* Variables */}
              {selectedPrompt.variables.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Variáveis para personalizar:</h4>
                  <div className="space-y-3">
                    {selectedPrompt.variables.map((variable) => (
                      <div key={variable.name} className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded text-sm font-mono">
                            {`{${variable.name}}`}
                          </code>
                          <span className="font-medium">{variable.label}</span>
                          {variable.required && (
                            <Badge variant="outline" className="text-xs">Obrigatório</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{variable.placeholder}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Examples */}
              {selectedPrompt.examples.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Exemplos:</h4>
                  {selectedPrompt.examples.map((example, idx) => (
                    <div key={idx} className="border rounded-lg p-4 mb-3">
                      <h5 className="font-medium mb-2">{example.title}</h5>
                      <div className="bg-gray-50 p-3 rounded mb-2">
                        <p className="text-sm font-mono whitespace-pre-wrap">{example.output}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              <div>
                <h4 className="font-semibold mb-2">Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPrompt.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
