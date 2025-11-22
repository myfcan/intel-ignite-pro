import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { guidesMetadata } from '@/data/guides';
import { Clock, BookOpen, Sparkles, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="group flex items-center gap-2 mb-4 px-4 py-2 text-sm font-semibold text-slate-700 
                         bg-white hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100
                         border border-slate-200 hover:border-slate-300
                         rounded-xl transition-all duration-300 
                         hover:shadow-md hover:-translate-y-0.5"
              >
              <ArrowLeft className="h-4 w-4 group-hover:text-slate-900 transition-colors" />
              <span className="group-hover:text-slate-900 transition-colors">Painel</span>
              </button>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              Guia de Bolso IA
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
          <Card className="p-6 bg-white border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{guidesMetadata.length}</div>
            <div className="text-gray-600">Guias Disponíveis</div>
          </Card>
          <Card className="p-6 bg-white border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 text-secondary" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {guidesMetadata.reduce((sum, g) => sum + g.sections, 0)}
            </div>
            <div className="text-gray-600">Seções de Conteúdo</div>
          </Card>
          <Card className="p-6 bg-white border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">100%</div>
            <div className="text-gray-600">Grátis</div>
          </Card>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guidesMetadata.map((guide) => (
            <Card
              key={guide.id}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden bg-white border border-gray-200 hover:border-primary"
              onClick={() => handleGuideClick(guide.id)}
            >

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
                    <Badge className="bg-accent text-white">Novo</Badge>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
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
                <Button className="w-full mt-4">
                  Iniciar Guia
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-primary to-secondary text-white text-center">
          <h2 className="text-2xl font-bold mb-2">
            Pronto para dominar a IA?
          </h2>
          <p className="text-white/80 mb-6">
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
