import { useNavigate } from 'react-router-dom';
import { ChevronLeft, GraduationCap, Lock, Star, Clock, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CursoExclusivo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar ao Dashboard
            </Button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                   style={{background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'}}>
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Curso Exclusivo</h1>
                <p className="text-xs text-gray-600">Conteúdo Premium</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Dark Tech */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
               style={{
                 background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
                 border: '1px solid rgba(139, 92, 246, 0.3)',
                 boxShadow: `
                   0 0 40px rgba(139, 92, 246, 0.15),
                   0 0 80px rgba(139, 92, 246, 0.08),
                   inset 0 0 60px rgba(139, 92, 246, 0.05)
                 `
               }}>
            
            {/* Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />
            
            {/* Purple Gradient at Bottom */}
            <div 
              className="absolute inset-x-0 bottom-0 h-32 opacity-40"
              style={{
                background: 'linear-gradient(to top, rgba(139, 92, 246, 0.4) 0%, transparent 100%)'
              }}
            />
            
            {/* Conteúdo */}
            <div className="relative z-10 flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl"
                     style={{
                       background: 'rgba(139, 92, 246, 0.2)',
                       border: '1px solid rgba(139, 92, 246, 0.4)'
                     }}>
                  <GraduationCap className="w-8 h-8 text-purple-300" />
                </div>
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold mb-4"
                     style={{
                       background: 'rgba(139, 92, 246, 0.2)',
                       border: '1px solid rgba(139, 92, 246, 0.3)'
                     }}>
                  <Star className="w-4 h-4 text-purple-300" />
                  <span className="text-gray-200">Conteúdo Premium</span>
                </div>
                <h2 className="text-3xl font-bold mb-3 text-gray-100">Curso Exclusivo de IA</h2>
                <p className="text-gray-300 text-lg mb-6 max-w-2xl">
                  Acesse conteúdo premium e aprofunde seus conhecimentos com aulas exclusivas,
                  materiais extras e certificação profissional.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats - NOVO DESIGN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                   style={{background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'}}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">50+</p>
                <p className="text-sm text-gray-600">Aulas Exclusivas</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                   style={{background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)'}}>
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">20h</p>
                <p className="text-sm text-gray-600">De Conteúdo</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                   style={{background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'}}>
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Certificado</p>
                <p className="text-sm text-gray-600">Profissional</p>
              </div>
            </div>
          </div>
        </div>

        {/* Módulos do Curso */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Módulos do Curso</h3>
          <div className="space-y-4">
            {[
              {
                title: 'Módulo 1: Fundamentos Avançados de IA',
                lessons: 12,
                duration: '4h',
                locked: false
              },
              {
                title: 'Módulo 2: Prompt Engineering Profissional',
                lessons: 10,
                duration: '3.5h',
                locked: true
              },
              {
                title: 'Módulo 3: Automação com IA',
                lessons: 15,
                duration: '5h',
                locked: true
              },
              {
                title: 'Módulo 4: IA para Negócios',
                lessons: 8,
                duration: '3h',
                locked: true
              },
              {
                title: 'Módulo 5: Projetos Práticos',
                lessons: 5,
                duration: '4.5h',
                locked: true
              }
            ].map((modulo, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl p-6 shadow-sm border-2 border-gray-100 hover:border-indigo-300 hover:shadow-md transition-all ${
                  modulo.locked ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold mb-2 flex items-center gap-2 text-gray-900">
                      {modulo.title}
                      {modulo.locked && (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {modulo.lessons} aulas
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {modulo.duration}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant={modulo.locked ? 'outline' : 'default'}
                    disabled={modulo.locked}
                    className={
                      !modulo.locked
                        ? 'font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all'
                        : ''
                    }
                    style={
                      !modulo.locked
                        ? {background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'}
                        : {}
                    }
                  >
                    {modulo.locked ? 'Bloqueado' : 'Começar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Premium - NOVO DESIGN */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border-l-4 border-purple-500 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
               style={{background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'}}>
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-gray-900">
            Desbloqueie Todo o Conteúdo
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Faça upgrade para o plano Pro e tenha acesso ilimitado a todos os módulos,
            certificação profissional e suporte prioritário.
          </p>
          <Button
            size="lg"
            className="font-semibold px-8 shadow-lg text-white hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            style={{background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'}}
          >
            Fazer Upgrade Agora
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            A partir de R$ 97/mês • Cancele quando quiser
          </p>
        </div>
      </main>
    </div>
  );
}