import { useNavigate } from 'react-router-dom';
import { ChevronLeft, GraduationCap, Lock, Star, Clock, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CursoExclusivo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500
                            flex items-center justify-center shadow-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">Curso Exclusivo</h1>
                <p className="text-xs text-slate-600">Conteúdo Premium</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-8 text-white">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl
                              flex items-center justify-center shadow-xl">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm
                              px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  <Star className="w-4 h-4" />
                  Conteúdo Premium
                </div>
                <h2 className="text-3xl font-bold mb-3">Curso Exclusivo de IA</h2>
                <p className="text-white/90 text-lg mb-6 max-w-2xl">
                  Acesse conteúdo premium e aprofunde seus conhecimentos com aulas exclusivas,
                  materiais extras e certificação profissional.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400
                              flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">50+</p>
                  <p className="text-sm text-slate-600">Aulas Exclusivas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-400
                              flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">20h</p>
                  <p className="text-sm text-slate-600">De Conteúdo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400
                              flex items-center justify-center shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">Certificado</p>
                  <p className="text-sm text-slate-600">Profissional</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Módulos do Curso */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">Módulos do Curso</h3>
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
              <Card
                key={index}
                className={`hover:shadow-lg transition-all ${
                  modulo.locked ? 'opacity-60' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 flex items-center gap-2">
                        {modulo.title}
                        {modulo.locked && (
                          <Lock className="w-4 h-4 text-slate-400" />
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
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
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                          : ''
                      }
                    >
                      {modulo.locked ? 'Bloqueado' : 'Começar'}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Premium */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500
                          rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900">
              Desbloqueie Todo o Conteúdo
            </h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Faça upgrade para o plano Pro e tenha acesso ilimitado a todos os módulos,
              certificação profissional e suporte prioritário.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500
                       hover:from-purple-600 hover:via-pink-600 hover:to-rose-600
                       text-white font-semibold px-8 shadow-lg"
            >
              Fazer Upgrade Agora
            </Button>
            <p className="text-sm text-slate-500 mt-4">
              A partir de R$ 97/mês • Cancele quando quiser
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
