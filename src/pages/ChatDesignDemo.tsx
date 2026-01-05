import { useState } from 'react';
import { Bot, Send, Sparkles, Zap, Star, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Mensagens de exemplo para demonstração
const demoMessages = [
  { role: 'user' as const, content: 'Crie um post sobre produtividade para LinkedIn' },
  { role: 'assistant' as const, content: '🚀 Aqui está seu post:\n\n**5 hábitos que transformaram minha produtividade:**\n\n1. Começar o dia com a tarefa mais difícil\n2. Pausas estratégicas a cada 90 minutos\n3. Dizer "não" para reuniões desnecessárias\n4. Revisar prioridades toda manhã\n5. Desligar notificações durante foco\n\nQual desses você já pratica? 👇' }
];

export default function ChatDesignDemo() {
  const navigate = useNavigate();
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Escolha o Design do Chat
        </h1>
        <p className="text-gray-400">
          Clique em um design para selecioná-lo. Veja como cada estilo apresenta as respostas da IA.
        </p>
      </div>

      {/* Grid de Designs */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DESIGN 1: Minimalista */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setSelectedDesign('minimal')}
          className={`cursor-pointer rounded-2xl border-2 transition-all ${
            selectedDesign === 'minimal' 
              ? 'border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]' 
              : 'border-gray-800 hover:border-gray-600'
          }`}
        >
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-white">Minimalista</span>
            </div>
            <p className="text-xs text-gray-500">Clean, foco no conteúdo</p>
          </div>
          
          <div className="bg-gray-950 p-4 rounded-b-2xl h-[400px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-hidden">
              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-white text-gray-900 rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%]">
                  <p className="text-sm">{demoMessages[0].content}</p>
                </div>
              </div>
              
              {/* Assistant message - MINIMALISTA */}
              <div className="flex justify-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-gray-400" />
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-tl-md px-4 py-4 max-w-[85%]">
                  <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {demoMessages[1].content}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Input preview */}
            <div className="mt-4 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-sm text-gray-500 flex-1">Digite sua mensagem...</span>
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <Send className="w-4 h-4 text-gray-900" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* DESIGN 2: Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setSelectedDesign('glass')}
          className={`cursor-pointer rounded-2xl border-2 transition-all ${
            selectedDesign === 'glass' 
              ? 'border-purple-500 shadow-[0_0_30px_rgba(147,51,234,0.3)]' 
              : 'border-gray-800 hover:border-gray-600'
          }`}
        >
          <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-white">Glassmorphism</span>
            </div>
            <p className="text-xs text-gray-400">Moderno, premium</p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-purple-950/30 p-4 rounded-b-2xl h-[400px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-hidden">
              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%] shadow-lg shadow-purple-500/20">
                  <p className="text-sm">{demoMessages[0].content}</p>
                </div>
              </div>
              
              {/* Assistant message - GLASSMORPHISM */}
              <div className="flex justify-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl rounded-tl-md px-5 py-4 max-w-[85%] shadow-xl">
                  <p className="text-sm text-gray-100 leading-relaxed whitespace-pre-wrap">
                    {demoMessages[1].content}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Input preview */}
            <div className="mt-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-sm text-gray-400 flex-1">Digite sua mensagem...</span>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Send className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* DESIGN 3: Gradiente Vibrante */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setSelectedDesign('gradient')}
          className={`cursor-pointer rounded-2xl border-2 transition-all ${
            selectedDesign === 'gradient' 
              ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
              : 'border-gray-800 hover:border-gray-600'
          }`}
        >
          <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-white">Gradiente Vibrante</span>
            </div>
            <p className="text-xs text-gray-400">Energético, impactante</p>
          </div>
          
          <div className="bg-gray-950 p-4 rounded-b-2xl h-[400px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-hidden">
              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%] shadow-lg shadow-cyan-500/20">
                  <p className="text-sm">{demoMessages[0].content}</p>
                </div>
              </div>
              
              {/* Assistant message - GRADIENTE */}
              <div className="flex justify-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex-shrink-0 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="relative max-w-[85%]">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-xl" />
                  <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-emerald-500/30 rounded-2xl rounded-tl-md px-5 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">✨ Resposta IA</span>
                    </div>
                    <p className="text-sm text-gray-100 leading-relaxed whitespace-pre-wrap">
                      {demoMessages[1].content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Input preview */}
            <div className="mt-4 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl blur-lg" />
              <div className="relative bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-sm text-gray-400 flex-1">Digite sua mensagem...</span>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Send className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Botão de confirmação */}
      {selectedDesign && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto mt-8 text-center"
        >
          <p className="text-gray-400 mb-4">
            Design selecionado: <span className="text-white font-semibold capitalize">{
              selectedDesign === 'minimal' ? 'Minimalista' :
              selectedDesign === 'glass' ? 'Glassmorphism' : 'Gradiente Vibrante'
            }</span>
          </p>
          <button
            onClick={() => {
              // Aqui implementaríamos a aplicação do design escolhido
              alert(`Design "${selectedDesign}" selecionado! Implementar aplicação.`);
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/25"
          >
            Aplicar este design →
          </button>
        </motion.div>
      )}
    </div>
  );
}
