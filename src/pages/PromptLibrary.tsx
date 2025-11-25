import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mainPromptCategories } from '@/data/prompts';
import {
  Sparkles,
  DollarSign,
  Gift,
  Home,
  Briefcase,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

const categoryIcons: Record<string, any> = {
  'extra-income': DollarSign,
  'free': Gift,
  'daily-life': Home,
  'business': Briefcase
};

/**
 * PromptLibrary Page: Lista de categorias de prompts
 *
 * Exibe 8 categorias de prompts estilo Coursiv
 * Cada card mostra: ícone, nome, descrição, quantidade de prompts
 */
export default function PromptLibrary() {
  const navigate = useNavigate();

  // Calcular estatísticas
  const totalPrompts = mainPromptCategories.reduce((sum, cat) => sum + cat.prompts.length, 0);
  const freePrompts = mainPromptCategories.reduce(
    (sum, cat) => sum + cat.prompts.filter(p => !p.isPremium).length,
    0
  );
  const premiumPrompts = totalPrompts - freePrompts;

  return (
    <div className="min-h-screen bg-[#FAFBFC] overflow-x-hidden">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 md:py-8">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="group flex items-center gap-2 mb-3 sm:mb-4 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 
                       bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100
                       border border-gray-200 hover:border-gray-300
                       rounded-xl transition-all duration-300 
                       hover:shadow-md hover:-translate-y-0.5"
            >
              <ArrowLeft className="h-3 h-3 sm:h-4 sm:w-4 group-hover:text-gray-900 transition-colors flex-shrink-0" />
              <span className="group-hover:text-gray-900 transition-colors">Painel</span>
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3 break-words">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
              <span>Super Prompts</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Templates profissionais prontos para usar em qualquer IA
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 md:py-12 overflow-x-hidden">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all border overflow-hidden"
               style={{
                 background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
                 backgroundImage: `
                   linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%),
                   radial-gradient(circle, rgba(139, 92, 246, 0.08) 1px, transparent 1px)
                 `,
                 backgroundSize: 'cover, 16px 16px',
                 backgroundPosition: 'center, 0 0',
                 borderColor: 'rgba(139, 92, 246, 0.2)',
               }}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{background: 'linear-gradient(135deg, #6CB1FF 0%, #837BFF 100%)'}}>
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalPrompts}</p>
                <p className="text-gray-600 text-xs sm:text-sm truncate">Prompts Disponíveis</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all border overflow-hidden"
               style={{
                 background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
                 backgroundImage: `
                   linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%),
                   radial-gradient(circle, rgba(139, 92, 246, 0.08) 1px, transparent 1px)
                 `,
                 backgroundSize: 'cover, 16px 16px',
                 backgroundPosition: 'center, 0 0',
                 borderColor: 'rgba(139, 92, 246, 0.2)',
               }}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'}}>
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{freePrompts}</p>
                <p className="text-gray-600 text-xs sm:text-sm truncate">Prompts Grátis</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all border overflow-hidden"
               style={{
                 background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
                 backgroundImage: `
                   linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%),
                   radial-gradient(circle, rgba(139, 92, 246, 0.08) 1px, transparent 1px)
                 `,
                 backgroundSize: 'cover, 16px 16px',
                 backgroundPosition: 'center, 0 0',
                 borderColor: 'rgba(139, 92, 246, 0.2)',
               }}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{background: 'linear-gradient(135deg, #F59E0B 0%, #DC2626 100%)'}}>
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{mainPromptCategories.length}</p>
                <p className="text-gray-600 text-xs sm:text-sm truncate">Categorias</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {mainPromptCategories.map((category) => {
            const Icon = categoryIcons[category.id] || Sparkles;
            const freeCount = category.prompts.filter(p => !p.isPremium).length;
            const premiumCount = category.prompts.length - freeCount;

            return (
              <div
                key={category.id}
                className="group cursor-pointer rounded-xl border-2 hover:border-indigo-300 hover:shadow-lg transition-all overflow-hidden"
                onClick={() => navigate(`/prompt-library/${category.id}`)}
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
                <div className="relative">
                  {/* Badge Popular */}
                  {category.isPopular && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded z-10 shadow-md">
                      Popular
                    </span>
                  )}
                  <div className="w-full h-24 sm:h-32 rounded-t-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-indigo-600" />
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors break-words">
                    {category.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                    {category.description}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded whitespace-nowrap">{freeCount} grátis</span>
                    {premiumCount > 0 && (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded whitespace-nowrap">{premiumCount} premium</span>
                    )}
                  </div>

                  {/* CTA */}
                  <button className="w-full py-2 border-2 border-indigo-500 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2">
                    <span>Ver Prompts</span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* How to use */}
        <div className="mt-8 sm:mt-12 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white shadow-xl overflow-hidden" style={{background: 'linear-gradient(135deg, #6CB1FF 0%, #837BFF 100%)'}}>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">Como usar os prompts?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center mb-2 sm:mb-3">
                <span className="text-xl sm:text-2xl font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Escolha uma categoria</h3>
              <p className="text-white/90 text-xs sm:text-sm">
                Navegue pelas categorias e encontre o tipo de prompt que precisa
              </p>
            </div>
            <div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center mb-2 sm:mb-3">
                <span className="text-xl sm:text-2xl font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Personalize as variáveis</h3>
              <p className="text-white/90 text-xs sm:text-sm">
                Preencha os campos específicos do seu contexto
              </p>
            </div>
            <div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center mb-2 sm:mb-3">
                <span className="text-xl sm:text-2xl font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Use no ChatGPT ou Claude</h3>
              <p className="text-white/90 text-xs sm:text-sm">
                Copie e cole em qualquer IA generativa
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
