import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  aiAppsDirectory,
  categoryInfo,
  getAppsByCategory,
  getFeaturedApps,
  searchApps
} from '@/data/ai-apps/apps-directory';
import { AICategory } from '@/types/aiApp';
import {
  Search,
  ExternalLink,
  Star,
  Sparkles,
  FileText,
  Image,
  Video,
  Mic,
  Code,
  Search as SearchIcon,
  Zap,
  ArrowLeft
} from 'lucide-react';

const categoryIcons = {
  text: FileText,
  image: Image,
  video: Video,
  audio: Mic,
  code: Code,
  research: SearchIcon,
  productivity: Zap
};

/**
 * AIDirectory Page: Biblioteca de 30+ ferramentas IA
 *
 * Features:
 * - Filtro por categoria
 * - Busca por nome/tag
 * - Featured apps
 * - Links diretos
 */
export default function AIDirectory() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<AICategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar apps
  const filteredApps = React.useMemo(() => {
    let apps = aiAppsDirectory;

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      apps = getAppsByCategory(selectedCategory);
    }

    // Filtro por busca
    if (searchQuery.trim()) {
      apps = searchApps(searchQuery);
      // Se tem busca, também filtra por categoria selecionada
      if (selectedCategory !== 'all') {
        apps = apps.filter(app => app.category === selectedCategory);
      }
    }

    return apps;
  }, [selectedCategory, searchQuery]);

  const featuredApps = getFeaturedApps();

  const pricingColors = {
    free: 'bg-green-100 text-green-800',
    freemium: 'bg-blue-100 text-blue-800',
    paid: 'bg-purple-100 text-purple-800'
  };

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
              Diretório de IA
            </h1>
            <p className="text-gray-600 mt-2">
              Descubra as melhores ferramentas de IA para cada necessidade
            </p>
          </div>

          {/* Search */}
          <div className="mt-6">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar ferramentas IA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
          >
            Todas ({aiAppsDirectory.length})
          </Button>
          {categoryInfo.map((cat) => {
            const Icon = categoryIcons[cat.id];
            const count = getAppsByCategory(cat.id).length;
            return (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.id)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {cat.name} ({count})
              </Button>
            );
          })}
        </div>

        {/* Featured Apps Section */}
        {selectedCategory === 'all' && !searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Destaques
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredApps.slice(0, 6).map((app) => (
                <Card key={app.id} className="p-6 hover:shadow-xl transition-shadow bg-white border border-gray-200 hover:border-primary">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {app.logo ? (
                        <img src={app.logo} alt={app.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <Sparkles className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Destaque
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold mb-2">{app.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{app.shortDescription}</p>

                  <div className="flex gap-2 mb-4">
                    <Badge variant="outline" className={pricingColors[app.pricing]}>
                      {app.pricing === 'free' && 'Grátis'}
                      {app.pricing === 'freemium' && 'Freemium'}
                      {app.pricing === 'paid' && 'Pago'}
                    </Badge>
                    {app.rating && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {app.rating}
                      </Badge>
                    )}
                  </div>

                  <Button
                    onClick={() => window.open(app.url, '_blank')}
                    className="w-full"
                    variant="outline"
                  >
                    Acessar
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Apps Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {selectedCategory === 'all' ? 'Todas as Ferramentas' : categoryInfo.find(c => c.id === selectedCategory)?.name}
            <span className="text-gray-400 ml-2">({filteredApps.length})</span>
          </h2>

          {filteredApps.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500">Nenhuma ferramenta encontrada</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps.map((app) => (
                <Card key={app.id} className="p-6 hover:shadow-lg transition-all group bg-white border border-gray-200 hover:border-primary">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {app.logo ? (
                        <img src={app.logo} alt={app.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <Sparkles className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    {app.isNew && (
                      <Badge className="bg-green-500 text-white">Novo</Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {app.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{app.shortDescription}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className={pricingColors[app.pricing]}>
                      {app.pricing === 'free' && 'Grátis'}
                      {app.pricing === 'freemium' && 'Freemium'}
                      {app.pricing === 'paid' && 'Pago'}
                    </Badge>
                    {app.rating && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {app.rating}
                      </Badge>
                    )}
                  </div>

                  {app.priceRange && (
                    <p className="text-xs text-gray-500 mb-4">{app.priceRange}</p>
                  )}

                  <Button
                    onClick={() => window.open(app.url, '_blank')}
                    className="w-full"
                    variant="outline"
                  >
                    Acessar
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
