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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
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
              <Sparkles className="w-8 h-8 text-orange-600" />
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
          <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <div className="text-4xl font-bold mb-2">{totalPrompts}</div>
            <div className="text-orange-100">Prompts Disponíveis</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <div className="text-4xl font-bold mb-2">{freePrompts}</div>
            <div className="text-green-100">Prompts Grátis</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <div className="text-4xl font-bold mb-2">{allPromptCategories.length}</div>
            <div className="text-purple-100">Categorias</div>
          </Card>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {allPromptCategories.map((category) => {
            const Icon = categoryIcons[category.id] || Sparkles;
            const freeCount = category.prompts.filter(p => !p.isPremium).length;
            const premiumCount = category.prompts.length - freeCount;

            return (
              <Card
                key={category.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                onClick={() => navigate(`/prompt-library/${category.id}`)}
              >
                {/* Color header */}
                <div className={`h-32 ${category.color} flex items-center justify-center relative overflow-hidden`}>
                  <Icon className="w-16 h-16 text-white opacity-90" />
                  {category.isPopular && (
                    <Badge className="absolute top-3 right-3 bg-yellow-500 text-white border-0">
                      Popular
                    </Badge>
                  )}
                </div>

                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {category.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {category.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {freeCount} grátis
                    </span>
                    {premiumCount > 0 && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        {premiumCount} premium
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <Button variant="outline" className="w-full group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-colors">
                    Ver Prompts
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* How to use */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-orange-600 to-pink-600 text-white">
          <h2 className="text-2xl font-bold mb-4">Como usar os prompts?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Escolha uma categoria</h3>
              <p className="text-orange-100 text-sm">
                Navegue pelas categorias e encontre o tipo de prompt que precisa
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Personalize as variáveis</h3>
              <p className="text-orange-100 text-sm">
                Preencha os campos específicos do seu contexto
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Use no ChatGPT ou Claude</h3>
              <p className="text-orange-100 text-sm">
                Copie e cole em qualquer IA generativa
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
