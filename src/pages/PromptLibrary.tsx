import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { allPromptCategories } from '@/data/prompts';
import {
  Sparkles,
  Mail,
  PenTool,
  TrendingUp,
  BookOpen,
  Video,
  Briefcase,
  Share2,
  Search as SearchIcon,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

const categoryIcons: Record<string, any> = {
  email: Mail,
  blog: PenTool,
  marketing: TrendingUp,
  study: BookOpen,
  content: Video,
  business: Briefcase,
  social: Share2,
  seo: SearchIcon
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
  const totalPrompts = allPromptCategories.reduce((sum, cat) => sum + cat.prompts.length, 0);
  const freePrompts = allPromptCategories.reduce(
    (sum, cat) => sum + cat.prompts.filter(p => !p.isPremium).length,
    0
  );
  const premiumPrompts = totalPrompts - freePrompts;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              Super Prompts
            </h1>
            <p className="text-gray-600 mt-2">
              Templates profissionais prontos para usar em qualquer IA
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="rounded-xl p-6 shadow-sm hover:shadow-md transition-all border"
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
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                   style={{background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'}}>
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{totalPrompts}</p>
                <p className="text-gray-600 text-sm">Prompts Disponíveis</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-6 shadow-sm hover:shadow-md transition-all border"
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
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                   style={{background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'}}>
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{freePrompts}</p>
                <p className="text-gray-600 text-sm">Prompts Grátis</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-6 shadow-sm hover:shadow-md transition-all border"
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
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                   style={{background: 'linear-gradient(135deg, #F59E0B 0%, #DC2626 100%)'}}>
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{allPromptCategories.length}</p>
                <p className="text-gray-600 text-sm">Categorias</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {allPromptCategories.map((category) => {
            const Icon = categoryIcons[category.id] || Sparkles;
            const freeCount = category.prompts.filter(p => !p.isPremium).length;
            const premiumCount = category.prompts.length - freeCount;

            return (
              <div
                key={category.id}
                className="group cursor-pointer rounded-xl border-2 hover:border-indigo-300 hover:shadow-lg transition-all"
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
                <div className="relative mb-4">
                  {/* Badge Popular */}
                  {category.isPopular && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded z-10 shadow-md">
                      Popular
                    </span>
                  )}
                  <div className="w-full h-32 rounded-t-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-16 h-16 text-indigo-600" />
                  </div>
                </div>

                <div className="p-6 pt-0">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {category.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">{freeCount} grátis</span>
                    {premiumCount > 0 && (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">{premiumCount} premium</span>
                    )}
                  </div>

                  {/* CTA */}
                  <button className="w-full py-2 border-2 border-indigo-500 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2">
                    Ver Prompts
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* How to use */}
        <div className="mt-12 rounded-2xl p-8 text-white shadow-xl" style={{background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'}}>
          <h2 className="text-2xl font-bold mb-4">Como usar os prompts?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Escolha uma categoria</h3>
              <p className="text-white/90 text-sm">
                Navegue pelas categorias e encontre o tipo de prompt que precisa
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Personalize as variáveis</h3>
              <p className="text-white/90 text-sm">
                Preencha os campos específicos do seu contexto
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Use no ChatGPT ou Claude</h3>
              <p className="text-white/90 text-sm">
                Copie e cole em qualquer IA generativa
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
