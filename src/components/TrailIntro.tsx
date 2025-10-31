import { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, X } from 'lucide-react';

interface TrailIntroProps {
  trailId: string;
  trailName: string;
  userName: string;
  onClose: () => void;
}

// Mapeamento dos áudios
const audioFiles: Record<string, string> = {
  'fundamentos': '/audio/maia-fundamentos.mp3',
  'diaadia': '/audio/maia-dia-a-dia.mp3',
  'negocios': '/audio/maia-negocios.mp3',
  'rendaextra': '/audio/maia-renda-extra.mp3',
  'conteudo': '/audio/maia-conteudo.mp3',
  'automacoes': '/audio/maia-automacoes.mp3',
  'criativa': '/audio/maia-criativa.mp3',
  'etica': '/audio/maia-etica.mp3'
};

// Textos da MAIA com exemplos práticos
const maiaTexts: Record<string, string> = {
  'fundamentos': `Olá {nome}! Eu sou a MAIA, sua assistente de inteligência artificial!

Que bom ter você aqui na trilha de Fundamentos! Sabe aquela sensação de não saber por onde começar com a IA? Acaba agora!

Em apenas 5 aulas práticas, você vai sair do zero absoluto para criar seu primeiro texto profissional com ChatGPT, fazer perguntas que a IA entende perfeitamente, e até gerar uma imagem do seu produto em segundos!

Maria, de São Paulo, 52 anos, disse que foi a coisa mais fácil que aprendeu na vida. E você vai ver que ela tem razão!

Vamos lá? Sua nova vida com IA começa agora!`,
  
  'diaadia': `Oi {nome}! MAIA aqui, pronta para revolucionar seu cotidiano!

Bem-vindo à trilha IA no Dia a Dia! Sabe aquele email difícil pro chefe que você demora 30 minutos pra escrever? Vai fazer em 30 segundos!

Aqui você aprende na prática: criar lista de compras inteligente que calcula o preço, planejar uma viagem completa com roteiro dia a dia, escrever mensagens profissionais no WhatsApp, e até organizar suas finanças pessoais!

João, contador de 45 anos, economiza 2 horas por dia usando o que aprendeu aqui. Imagina o que você vai fazer com esse tempo extra?

Preparado para uma vida mais prática? Vamos começar!`,
  
  'negocios': `Olá {nome}! MAIA na área, pronta para turbinar seus negócios!

Esta é a trilha IA nos Negócios! Aqui você aprende o que ninguém te conta: como criar uma proposta comercial matadora em 5 minutos, responder 50 clientes no WhatsApp ao mesmo tempo, e até gerar contratos personalizados!

Vou te mostrar casos reais: Ana triplicou as vendas da loja criando descrições irresistíveis pros produtos. Roberto automatizou o follow-up e não perde mais nenhum cliente. 

Seu concorrente já está usando IA. Que tal sair na frente?

Bora transformar seu negócio? Vamos nessa!`,
  
  'rendaextra': `Oi {nome}! Que alegria! Esta é a trilha que mais muda vidas!

Bem-vindo à trilha Renda Extra com IA! Vou ser direta: pessoas comuns estão ganhando R$ 2.000 a R$ 5.000 por mês criando conteúdo com IA!

Você vai aprender a cobrar R$ 500 por um pacote de posts para Instagram, R$ 300 por roteiro de vídeo, R$ 800 por um e-book completo! Tudo usando IA como sua assistente.

Carla, professora aposentada, fez R$ 3.200 no primeiro mês criando posts para pequenos negócios do bairro. E ela começou do zero aos 58 anos!

Pronto para criar sua nova fonte de renda? Vamos juntos!`,
  
  'conteudo': `Olá {nome}! MAIA aqui para despertar o criador que existe em você!

Chegou a hora de dominar a Criação de Conteúdo com IA! Esquece aquele bloqueio criativo - você vai criar 30 posts em 30 minutos!

Na prática: posts que geram 10x mais engajamento, carrosséis que param o feed, emails que têm 70% de abertura, roteiros de vídeo que prendem até o fim!

Pedro, dono de hamburgueria, passou de 200 para 5.000 seguidores em 2 meses usando as técnicas desta trilha. Os clientes triplicaram!

Ansioso para ver seu conteúdo bombando? Começamos agora!`,
  
  'automacoes': `Oi {nome}! MAIA reportando para multiplicar suas horas!

Bem-vindo à trilha de Automações Práticas! Chega de trabalho repetitivo - a IA vai fazer por você!

Exemplos reais do que você vai montar: resposta automática inteligente no WhatsApp Business que converte 3x mais, relatórios semanais que se criam sozinhos, emails que se respondem automaticamente, e planilhas que se atualizam sem você tocar!

Carlos, corretor de imóveis, automatizou o atendimento inicial e agora fecha 5 vendas a mais por mês. Tempo livre? Dobrou!

Pronto para trabalhar menos e produzir mais? Vamos automatizar!`,
  
  'criativa': `Olá {nome}! Sua MAIA artista chegou para liberar sua criatividade!

Esta é a trilha IA Criativa! Mesmo sem saber desenhar, você vai criar imagens profissionais para seu negócio!

Na prática: logos únicos em 2 minutos, fotos de produtos que parecem de estúdio, vídeos com sua cara falando (sem gravar nada!), apresentações que impressionam, e até música de fundo para seus vídeos!

Márcia tinha vergonha das fotos amadoras da sua loja online. Agora cria imagens dignas de revista e as vendas aumentaram 40%!

Pronto para ser o artista que sempre quis? Vamos criar!`,
  
  'etica': `Oi {nome}! MAIA aqui para um papo que vai proteger você e seu negócio.

Bem-vindo à trilha mais importante: Limitações e Ética da IA!

Vou te ensinar a identificar quando a IA está inventando informação, proteger seus dados e os do cliente, usar IA sem violar direitos autorais, e reconhecer golpes que usam IA!

Case real: empresa perdeu R$ 50 mil por não verificar contrato gerado por IA. Você vai aprender a evitar essas armadilhas!

Saber o que a IA NÃO pode fazer é tão importante quanto saber o que ela pode.

Vamos aprender a usar IA com segurança? Começamos já!`
};

export function TrailIntro({ trailId, trailName, userName, onClose }: TrailIntroProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Personaliza o texto com o nome do usuário
  const personalizedText = maiaTexts[trailId]?.replace('{nome}', userName) || '';
  const audioFile = audioFiles[trailId];
  
  useEffect(() => {
    if (!audioFile) return;
    
    const audio = new Audio(audioFile);
    audioRef.current = audio;
    
    // Auto-play quando componente monta
    audio.play().catch(err => {
      console.log('Auto-play bloqueado pelo navegador:', err);
    });
    setIsPlaying(true);
    
    // Atualiza progresso do áudio
    const updateProgress = () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      setProgress(percent);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioFile]);
  
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onClose();
  };
  
  if (!audioFile || !personalizedText) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl animate-slide-up relative">
        
        {/* Botão Fechar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        
        {/* Avatar da MAIA */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img 
              src="/maia-avatar.png" 
              alt="MAIA"
              className="w-32 h-32 animate-bounce-slow"
            />
            {isPlaying && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-100"></span>
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-200"></span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Título da Trilha */}
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {trailName}
        </h2>
        
        {/* Box de Texto */}
        <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl p-6 mb-6 max-h-80 overflow-y-auto">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {personalizedText}
          </p>
        </div>
        
        {/* Player de Áudio */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white hover:shadow-lg transition-all hover:scale-105"
              aria-label={isPlaying ? "Pausar" : "Reproduzir"}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
            
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            <Volume2 className="text-gray-500" size={20} />
          </div>
        </div>
        
        {/* Botões de Ação */}
        <div className="flex gap-4">
          <button
            onClick={handleClose}
            className="flex-1 py-3 px-6 border-2 border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium"
          >
            Pular Introdução
          </button>
          <button
            onClick={handleClose}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold hover:scale-105"
          >
            Começar Trilha →
          </button>
        </div>
      </div>
    </div>
  );
}
