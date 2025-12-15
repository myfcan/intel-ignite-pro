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
  getHotApps,
  getPremiumApps,
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
  ArrowLeft,
  Bot,
  TrendingUp,
  DollarSign,
  Headphones,
  BarChart,
  GraduationCap,
  Heart,
  Scale,
  Wallet,
  Users,
  LucideIcon,
  Flame,
  Crown
} from 'lucide-react';

const categoryIcons: Record<string, LucideIcon> = {
  text: FileText,
  image: Image,
  video: Video,
  audio: Mic,
  code: Code,
  research: SearchIcon,
  productivity: Zap,
  automation: Bot,
  marketing: TrendingUp,
  sales: DollarSign,
  'customer-service': Headphones,
  data: BarChart,
  education: GraduationCap,
  healthcare: Heart,
  legal: Scale,
  finance: Wallet,
  hr: Users,
  agents: Sparkles
};

type SpecialFilter = 'all' | 'hot' | 'premium' | 'featured';

export default function AIDirectory() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<AICategory | 'all'>('all');
  const [specialFilter, setSpecialFilter] = useState<SpecialFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const hotApps = getHotApps();
  const premiumApps = getPremiumApps();
  const featuredApps = getFeaturedApps();

  // Filtrar apps
  const filteredApps = React.useMemo(() => {
    let apps = aiAppsDirectory;

    // Filtro especial (Hot, Premium, Destaque)
    if (specialFilter === 'hot') {
      apps = hotApps;
    } else if (specialFilter === 'premium') {
      apps = premiumApps;
    } else if (specialFilter === 'featured') {
      apps = featuredApps;
    }

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      apps = apps.filter(app => app.category === selectedCategory);
    }

    // Filtro por busca
    if (searchQuery.trim()) {
      const searchResults = searchApps(searchQuery);
      apps = apps.filter(app => searchResults.some(s => s.id === app.id));
    }

    return apps;
  }, [selectedCategory, specialFilter, searchQuery, hotApps, premiumApps, featuredApps]);

  const pricingColors = {
    free: 'bg-green-100 text-green-800',
    freemium: 'bg-blue-100 text-blue-800',
    paid: 'bg-purple-100 text-purple-800'
  };

  const handleCategoryClick = (category: AICategory | 'all') => {
    setSelectedCategory(category);
  };

  const handleSpecialFilterClick = (filter: SpecialFilter) => {
    setSpecialFilter(filter);
    if (filter !== 'all') {
      setSelectedCategory('all');
    }
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
              Ferramentas de IA
            </h1>
            <p className="text-gray-600 mt-2">
              Descubra as melhores ferramentas de IA para cada necessidade ({aiAppsDirectory.length} ferramentas)
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
        {/* Special Filters (Hot, Premium, Destaque) */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            variant={specialFilter === 'all' ? 'default' : 'outline'}
            onClick={() => handleSpecialFilterClick('all')}
            className="flex items-center gap-2"
          >
            Todas ({aiAppsDirectory.length})
          </Button>
          <Button
            variant={specialFilter === 'hot' ? 'default' : 'outline'}
            onClick={() => handleSpecialFilterClick('hot')}
            className={`flex items-center gap-2 ${specialFilter === 'hot' ? 'bg-orange-500 hover:bg-orange-600' : 'border-orange-300 text-orange-600 hover:bg-orange-50'}`}
          >
            <Flame className="w-4 h-4" />
            Hot ({hotApps.length})
          </Button>
          <Button
            variant={specialFilter === 'premium' ? 'default' : 'outline'}
            onClick={() => handleSpecialFilterClick('premium')}
            className={`flex items-center gap-2 ${specialFilter === 'premium' ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-300 text-purple-600 hover:bg-purple-50'}`}
          >
            <Crown className="w-4 h-4" />
            Premium ({premiumApps.length})
          </Button>
          <Button
            variant={specialFilter === 'featured' ? 'default' : 'outline'}
            onClick={() => handleSpecialFilterClick('featured')}
            className={`flex items-center gap-2 ${specialFilter === 'featured' ? 'bg-yellow-500 hover:bg-yellow-600' : 'border-yellow-400 text-yellow-600 hover:bg-yellow-50'}`}
          >
            <Star className="w-4 h-4" />
            Destaque ({featuredApps.length})
          </Button>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'secondary' : 'ghost'}
            onClick={() => handleCategoryClick('all')}
          >
            Todas Categorias
          </Button>
          {categoryInfo.map((cat) => {
            const Icon = categoryIcons[cat.id] || Sparkles;
            return (
              <Button
                key={cat.id}
                size="sm"
                variant={selectedCategory === cat.id ? 'secondary' : 'ghost'}
                onClick={() => handleCategoryClick(cat.id)}
                className="flex items-center gap-1"
              >
                <Icon className="w-3 h-3" />
                {cat.name}
              </Button>
            );
          })}
        </div>

        {/* Results Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {specialFilter === 'hot' && <Flame className="w-6 h-6 text-orange-500" />}
            {specialFilter === 'premium' && <Crown className="w-6 h-6 text-purple-500" />}
            {specialFilter === 'featured' && <Star className="w-6 h-6 text-yellow-500" />}
            {specialFilter === 'all' && 'Todas as Ferramentas'}
            {specialFilter === 'hot' && 'Ferramentas Hot'}
            {specialFilter === 'premium' && 'Ferramentas Premium'}
            {specialFilter === 'featured' && 'Ferramentas em Destaque'}
            <span className="text-gray-400 ml-2 text-lg font-normal">({filteredApps.length})</span>
          </h2>
          {selectedCategory !== 'all' && (
            <p className="text-gray-500 mt-1">
              Categoria: {categoryInfo.find(c => c.id === selectedCategory)?.name}
            </p>
          )}
        </div>

        {/* Apps Grid */}
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
                  <div className="flex gap-1">
                    {app.isHot && (
                      <Badge className="bg-orange-500 text-white">
                        <Flame className="w-3 h-3 mr-1" />
                        Hot
                      </Badge>
                    )}
                    {app.isPremium && (
                      <Badge className="bg-purple-600 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                    {app.isFeatured && !app.isHot && !app.isPremium && (
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Destaque
                      </Badge>
                    )}
                    {app.isNew && (
                      <Badge className="bg-green-500 text-white">Novo</Badge>
                    )}
                  </div>
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
  );
}
