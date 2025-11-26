import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, Bot, Zap } from 'lucide-react';
import { PlaygroundRealChat } from '@/components/lessons/PlaygroundRealChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AIPlayground() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50 shadow-sm flex-shrink-0">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-shrink-0"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Voltar</span>
            </Button>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500
                            flex items-center justify-center shadow-lg flex-shrink-0">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-sm sm:text-base md:text-lg truncate">AI Playground</h1>
                <p className="text-[10px] sm:text-xs text-slate-600 truncate">Experimente IA em tempo real</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with ScrollArea */}
      <ScrollArea className="flex-1">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Hero Section */}
          <div className="mb-6 sm:mb-8">
            <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white relative overflow-hidden"
                 style={{
                   background: 'linear-gradient(135deg, #6CB1FF 0%, #837BFF 100%)',
                 }}>
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl
                              flex items-center justify-center shadow-xl">
                  <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 break-words">Bem-vindo ao AI Playground!</h2>
                <p className="text-white/90 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 leading-snug">
                  Experimente o poder da Inteligência Artificial em tempo real.
                  Teste prompts, explore recursos e aprenda na prática.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="font-semibold text-sm sm:text-base">Respostas Instantâneas</span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/80">
                      IA responde em segundos
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="font-semibold text-sm sm:text-base">Aprenda Fazendo</span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/80">
                      Prática em tempo real
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="font-semibold text-sm sm:text-base">Teste Prompts</span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/80">
                      Experimente diferentes estilos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Playground Chat */}
        <div className="mb-6 sm:mb-8">
          <PlaygroundRealChat
            lessonId="ai-playground-standalone"
          />
        </div>

        {/* Sugestões de Uso */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3 sm:mb-4 px-1">Experimente estas ideias:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-all bg-white border-slate-200 overflow-hidden">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  Escrever Conteúdo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                  "Escreva um email profissional sobre..."
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all bg-white border-slate-200 overflow-hidden">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  Brainstorming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                  "Me dê 10 ideias criativas para..."
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all bg-white border-slate-200 overflow-hidden">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  Análise de Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                  "Analise estes dados e sugira..."
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all bg-white border-slate-200 overflow-hidden">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  Conteúdo Criativo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                  "Crie uma história sobre..."
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all bg-white border-slate-200 overflow-hidden">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  Negócios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                  "Elabore um plano de marketing para..."
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all bg-white border-slate-200 overflow-hidden">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  Pesquisa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                  "Explique de forma simples o conceito de..."
                </p>
              </CardContent>
            </Card>
          </div>
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
      </ScrollArea>
    </div>
  );
}
