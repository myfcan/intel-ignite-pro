import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { guidesMetadata } from '@/data/guides';
import { Clock, BookOpen, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useGuideProgress } from '@/hooks/useGuideProgress';

/**
 * Guides Page: Lista dos 7 guias sobre IAs populares
 *
 * Exibe cards dos guias (ChatGPT, Claude, Gemini, Grok, Sora, Midjourney, Perplexity)
 * Cada card mostra: logo, título, descrição, dificuldade, duração
 */
export default function Guides() {
  const navigate = useNavigate();
  const [userId, setUserId] = React.useState<string | undefined>();
  const { isGuideCompleted, loading } = useGuideProgress(userId);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id);
    });
  }, []);

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
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 bg-white rounded-xl border border-gray-200 hover:border-primary transition-all shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm text-gray-700">Voltar</span>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                Guia de Bolso IA
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Domine as principais ferramentas de IA em minutos
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                   style={{background: 'linear-gradient(135deg, #6CB1FF 0%, #837BFF 100%)'}}>
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{guidesMetadata.length}</p>
                <p className="text-gray-600 text-sm">Guias Disponíveis</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                   style={{background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)'}}>
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {guidesMetadata.reduce((sum, g) => sum + g.sections, 0)}
                </p>
                <p className="text-gray-600 text-sm">Seções de Conteúdo</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                   style={{background: 'linear-gradient(135deg, #F59E0B 0%, #DC2626 100%)'}}>
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">100%</p>
                <p className="text-gray-600 text-sm">Grátis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guidesMetadata.map((guide) => {
            const completed = isGuideCompleted(guide.id);
            
            return (
            <div
              key={guide.id}
              className={`relative group cursor-pointer bg-white rounded-xl border-2 hover:shadow-lg transition-all overflow-hidden ${
                completed ? 'border-green-300 hover:border-green-400' : 'border-gray-100 hover:border-indigo-300'
              }`}
              onClick={() => handleGuideClick(guide.id)}
            >
              {/* Badge Novo ou Completo */}
              {completed ? (
                <span className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-md z-10 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  COMPLETO
                </span>
              ) : guide.isNew ? (
                <span className="absolute top-3 right-3 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-md z-10">
                  NOVO
                </span>
              ) : null}

              <div className="p-6">
                {/* Logo com gradiente de fundo */}
                <div className="mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
                    {guide.logo ? (
                      <img
                        src={guide.logo}
                        alt={guide.aiName}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <BookOpen className="w-8 h-8 text-indigo-600" />
                    )}
                  </div>
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
                  <span className={`text-xs px-2 py-1 rounded ${difficultyColors[guide.difficulty]}`}>
                    {guide.difficulty === 'beginner' && 'Iniciante'}
                    {guide.difficulty === 'intermediate' && 'Intermediário'}
                    {guide.difficulty === 'advanced' && 'Avançado'}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
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
                <button 
                  className="w-full py-2 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                  style={{
                    background: completed 
                      ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' 
                      : 'linear-gradient(135deg, #6CB1FF 0%, #837BFF 100%)'
                  }}
                >
                  {completed ? 'Revisar Guia' : 'Iniciar Guia'}
                </button>
              </div>
            </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-2xl p-8 text-white text-center shadow-xl" style={{background: 'linear-gradient(135deg, #6CB1FF 0%, #837BFF 100%)'}}>
          <h2 className="text-2xl font-bold mb-2">
            Pronto para dominar a IA?
          </h2>
          <p className="text-white/90 mb-6">
            Escolha um guia acima e comece sua jornada agora mesmo
          </p>
          <button
            className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-white/90 transition-all shadow-lg"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Ver Todos os Guias
          </button>
        </div>
      </div>
    </div>
  );
}
