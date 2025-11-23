import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, Bot, Zap } from 'lucide-react';
import { PlaygroundRealChat } from '@/components/lessons/PlaygroundRealChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AIPlayground() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500
                            flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">AI Playground</h1>
                <p className="text-xs text-slate-600">Experimente IA em tempo real</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
          <div className="mb-8">
            <div className="rounded-2xl p-8 text-white relative overflow-hidden"
                 style={{
                   background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                 }}>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl
                              flex items-center justify-center shadow-xl">
                  <Bot className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-3">Bem-vindo ao AI Playground!</h2>
                <p className="text-white/90 text-lg mb-6 max-w-2xl">
                  Experimente o poder da Inteligência Artificial em tempo real.
                  Teste prompts, explore recursos e aprenda na prática.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5" />
                      <span className="font-semibold">Respostas Instantâneas</span>
                    </div>
                    <p className="text-sm text-white/80">
                      IA responde em segundos
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5" />
                      <span className="font-semibold">Aprenda Fazendo</span>
                    </div>
                    <p className="text-sm text-white/80">
                      Prática em tempo real
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-5 h-5" />
                      <span className="font-semibold">Teste Prompts</span>
                    </div>
                    <p className="text-sm text-white/80">
                      Experimente diferentes estilos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sugestões de Uso */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Experimente estas ideias:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer border transition-all"
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
              <CardHeader className="pb-3">
                <CardTitle className="text-base">✍️ Escrever Conteúdo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  "Escreva um email profissional sobre..."
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer border transition-all"
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
              <CardHeader className="pb-3">
                <CardTitle className="text-base">🧠 Brainstorming</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  "Me dê 10 ideias criativas para..."
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer border transition-all"
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
              <CardHeader className="pb-3">
                <CardTitle className="text-base">📊 Análise de Dados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  "Analise estes dados e sugira..."
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer border transition-all"
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
              <CardHeader className="pb-3">
                <CardTitle className="text-base">🎨 Conteúdo Criativo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  "Crie uma história sobre..."
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer border transition-all"
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
              <CardHeader className="pb-3">
                <CardTitle className="text-base">💼 Negócios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  "Elabore um plano de marketing para..."
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer border transition-all"
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
              <CardHeader className="pb-3">
                <CardTitle className="text-base">🔍 Pesquisa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  "Explique de forma simples o conceito de..."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Playground Chat */}
        <div className="mb-8">
          <PlaygroundRealChat
            lessonId="ai-playground-standalone"
          />
        </div>

        {/* Dicas */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Dicas para Melhores Resultados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Seja específico:</strong> Quanto mais detalhado o prompt, melhor a resposta</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Dê contexto:</strong> Explique o cenário ou objetivo do seu pedido</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Itere:</strong> Refine o resultado pedindo ajustes e melhorias</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Experimente:</strong> Teste diferentes abordagens e estilos</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
