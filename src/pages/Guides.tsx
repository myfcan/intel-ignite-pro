import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { guidesMetadata } from '@/data/guides';
import { Clock, BookOpen, Sparkles } from 'lucide-react';

/**
 * Guides Page: Lista dos 7 guias sobre IAs populares
 *
 * Exibe cards dos guias (ChatGPT, Claude, Gemini, Grok, Sora, Midjourney, Perplexity)
 * Cada card mostra: logo, título, descrição, dificuldade, duração
 */
export default function Guides() {
  const navigate = useNavigate();

  const categoryColors = {
    text: 'bg-blue-500',
    image: 'bg-purple-500',
    video: 'bg-pink-500',
    research: 'bg-cyan-500',
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  const handleGuideClick = (guideId: string) => {
    navigate(`/guides/${guideId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-600" />
                Guias IA Essenciais
              </h1>
              <p className="text-gray-600 mt-2">
                Domine as principais ferramentas de inteligência artificial em minutos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <div className="text-4xl font-bold mb-2">{guidesMetadata.length}</div>
            <div className="text-purple-100">Guias Disponíveis</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <div className="text-4xl font-bold mb-2">
              {guidesMetadata.reduce((sum, g) => sum + g.sections, 0)}
            </div>
            <div className="text-blue-100">Seções de Conteúdo</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <div className="text-4xl font-bold mb-2">100%</div>
            <div className="text-green-100">Grátis</div>
          </Card>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guidesMetadata.map((guide) => (
            <Card
              key={guide.id}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              onClick={() => handleGuideClick(guide.id)}
            >
              {/* Category color bar */}
              <div className={`h-2 ${categoryColors[guide.category as keyof typeof categoryColors] || 'bg-gray-500'}`} />

              <div className="p-6">
                {/* Logo + New Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                    {guide.logo ? (
                      <img
                        src={guide.logo}
                        alt={guide.aiName}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  {guide.isNew && (
                    <Badge className="bg-green-500 text-white">Novo</Badge>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {guide.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {guide.description}
                </p>

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className={difficultyColors[guide.difficulty]}>
                    {guide.difficulty === 'beginner' && 'Iniciante'}
                    {guide.difficulty === 'intermediate' && 'Intermediário'}
                    {guide.difficulty === 'advanced' && 'Avançado'}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {guide.estimatedTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {guide.sections} seções
                  </div>
                </div>

                {/* CTA */}
                <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                  Iniciar Guia
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">
            Pronto para dominar a IA?
          </h2>
          <p className="text-purple-100 mb-6">
            Escolha um guia acima e comece sua jornada agora mesmo
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Ver Todos os Guias
          </Button>
        </Card>
      </div>
    </div>
  );
}
