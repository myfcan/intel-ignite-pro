import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

// Texto completo da Seção 1
const SECTION_TEXT = `Semana passada eu fui na padaria do Zé. Mesma padaria de sempre: café com leite, pão na chapa, fila na porta. Mas tinha uma coisa diferente.

Na parede, um cartaz novo, bonito. Cores combinando, tipografia certa, parecia peça feita por agência.

Eu perguntei:
"Zé, você contratou um designer agora?"

Ele riu:
"Que nada. Minha filha de quatorze anos fez isso com Inteligência Artificial. Ela só escreveu o que queria e a I.A. montou tudo em poucos minutos."

Pausa para processar: a filha do Zé, que até semana passada fazia trabalho de escola no Word, agora cria cartaz que parece de profissional.

E o Zé, que mal mexe no computador, já está economizando dinheiro em material gráfico.

Enquanto muita gente ainda acha que Inteligência Artificial é coisa distante, a filha do Zé já virou "designer oficial" do bairro.

Moral da história: o mundo não esperou ninguém estar pronto. Quem testou primeiro saiu na frente.`;

// Configuração dos cards
const CARDS_CONFIG = [
  {
    id: 1,
    anchorText: 'um cartaz novo, bonito',
    startSecond: 10, // ~10s após início (intro)
    duration: 42,    // ~42s baseado em 105 palavras
    title: 'Designer Adolescente',
    description: 'A filha do Zé transformou uma ideia em cartaz profissional usando I.A.'
  },
  {
    id: 2,
    anchorText: 'mexe no computador',
    startSecond: 52, // Após card 1 (10 + 42)
    duration: 20,    // ~20s baseado em 50 palavras
    title: 'Economia Real',
    description: 'Zé já economiza dinheiro enquanto outros ainda duvidam.'
  }
];

// Estimativa total da seção
const TOTAL_DURATION = 72; // ~180 palavras / 2.5 palavras por segundo

// Card Effect 1: Designer Adolescente
const CardEffectTeenageDesigner = ({ isActive }: { isActive: boolean }) => {
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    if (!isActive) {
      setPhase(0);
      return;
    }
    
    const phases = [0, 1, 2, 3, 4];
    let currentPhase = 0;
    
    const interval = setInterval(() => {
      currentPhase = (currentPhase + 1) % phases.length;
      setPhase(currentPhase);
    }, 8000); // 8s por fase para ~40s total
    
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[400px] h-[50vh] max-h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-violet-950 via-purple-950 to-fuchsia-950">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-violet-500 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-fuchsia-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 rounded-full border border-violet-400/30 mb-3"
          >
            <span className="text-violet-300 text-sm font-medium">🎨 Transformação Real</span>
          </motion.div>
          <h3 className="text-2xl font-bold text-white">Designer Adolescente</h3>
          <p className="text-violet-200/70 text-sm mt-1">14 anos + I.A. = Resultado profissional</p>
        </div>

        {/* Animation Area */}
        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === 0 && (
              <motion.div
                key="phase0"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="w-24 h-24 mx-auto mb-4 bg-violet-500/30 rounded-2xl flex items-center justify-center">
                  <span className="text-5xl">📝</span>
                </div>
                <p className="text-white font-medium">Ela escreveu o que queria...</p>
                <p className="text-violet-300/70 text-sm mt-2">"Quero um cartaz bonito para a padaria"</p>
              </motion.div>
            )}
            
            {phase === 1 && (
              <motion.div
                key="phase1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="w-24 h-24 mx-auto mb-4 bg-fuchsia-500/30 rounded-2xl flex items-center justify-center animate-pulse">
                  <span className="text-5xl">🤖</span>
                </div>
                <p className="text-white font-medium">A I.A. processou...</p>
                <p className="text-fuchsia-300/70 text-sm mt-2">Cores, tipografia, layout...</p>
              </motion.div>
            )}
            
            {phase === 2 && (
              <motion.div
                key="phase2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="w-32 h-40 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-2xl flex items-center justify-center">
                  <div className="text-center text-white p-2">
                    <div className="text-xs font-bold mb-1">PADARIA DO ZÉ</div>
                    <div className="text-[8px]">Pão fresquinho</div>
                    <div className="text-[8px]">todo dia!</div>
                  </div>
                </div>
                <p className="text-white font-medium">Em poucos minutos...</p>
                <p className="text-amber-300/70 text-sm mt-2">Cartaz pronto, nível agência!</p>
              </motion.div>
            )}
            
            {phase === 3 && (
              <motion.div
                key="phase3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-500/30 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl">📄</span>
                    </div>
                    <p className="text-red-300/70 text-xs">Antes: Word</p>
                  </div>
                  <div className="text-3xl text-white">→</div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500/30 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl">🎨</span>
                    </div>
                    <p className="text-green-300/70 text-xs">Depois: Designer</p>
                  </div>
                </div>
                <p className="text-white font-medium">Semana passada: trabalho de escola</p>
                <p className="text-green-300/70 text-sm mt-2">Hoje: cartaz profissional</p>
              </motion.div>
            )}
            
            {phase === 4 && (
              <motion.div
                key="phase4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="w-24 h-24 mx-auto mb-4 bg-emerald-500/30 rounded-full flex items-center justify-center">
                  <span className="text-5xl">✨</span>
                </div>
                <p className="text-white font-medium text-lg">Resultado:</p>
                <p className="text-emerald-300 text-sm mt-2">"Designer oficial" do bairro</p>
                <p className="text-white/50 text-xs mt-4">Com 14 anos.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-4">
          {[0, 1, 2, 3, 4].map((p) => (
            <div
              key={p}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                p === phase ? 'bg-violet-400 w-6' : 'bg-violet-400/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Card Effect 2: Economia Real
const CardEffectEconomyReal = ({ isActive }: { isActive: boolean }) => {
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    if (!isActive) {
      setPhase(0);
      return;
    }
    
    const phases = [0, 1, 2];
    let currentPhase = 0;
    
    const interval = setInterval(() => {
      currentPhase = (currentPhase + 1) % phases.length;
      setPhase(currentPhase);
    }, 6000); // 6s por fase para ~18s total
    
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[400px] h-[50vh] max-h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 right-10 w-32 h-32 bg-emerald-500 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-cyan-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full border border-emerald-400/30 mb-3"
          >
            <span className="text-emerald-300 text-sm font-medium">💰 Economia Real</span>
          </motion.div>
          <h3 className="text-2xl font-bold text-white">Zé Economizando</h3>
          <p className="text-emerald-200/70 text-sm mt-1">Enquanto outros ainda duvidam...</p>
        </div>

        {/* Animation Area */}
        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === 0 && (
              <motion.div
                key="phase0"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-6 mb-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-red-500/30 rounded-xl flex items-center justify-center mb-2">
                      <span className="text-3xl">💸</span>
                    </div>
                    <p className="text-red-300/70 text-xs">Antes</p>
                    <p className="text-red-400 text-sm font-bold">R$ 500/mês</p>
                    <p className="text-red-300/50 text-xs">designer freelancer</p>
                  </div>
                  <div className="text-3xl text-white">→</div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-emerald-500/30 rounded-xl flex items-center justify-center mb-2">
                      <span className="text-3xl">✅</span>
                    </div>
                    <p className="text-emerald-300/70 text-xs">Agora</p>
                    <p className="text-emerald-400 text-sm font-bold">R$ 0</p>
                    <p className="text-emerald-300/50 text-xs">filha + I.A.</p>
                  </div>
                </div>
                <p className="text-white font-medium">Mal mexe no computador...</p>
                <p className="text-emerald-300/70 text-sm mt-2">Mas já está economizando!</p>
              </motion.div>
            )}
            
            {phase === 1 && (
              <motion.div
                key="phase1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-8 mb-6">
                  <div className="text-center opacity-50">
                    <div className="w-16 h-16 bg-gray-500/30 rounded-full flex items-center justify-center mb-2">
                      <span className="text-2xl">🤔</span>
                    </div>
                    <p className="text-gray-400 text-xs">Muita gente</p>
                    <p className="text-gray-300/70 text-xs">"I.A. é coisa distante"</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-amber-500/30 rounded-full flex items-center justify-center mb-2 ring-4 ring-amber-400/50">
                      <span className="text-3xl">⭐</span>
                    </div>
                    <p className="text-amber-300 text-xs font-medium">Filha do Zé</p>
                    <p className="text-amber-200/70 text-xs">"Designer do bairro"</p>
                  </div>
                </div>
                <p className="text-white font-medium">Quem testou primeiro...</p>
                <p className="text-amber-300/70 text-sm mt-2">Saiu na frente!</p>
              </motion.div>
            )}
            
            {phase === 2 && (
              <motion.div
                key="phase2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                  <span className="text-5xl">🏆</span>
                </div>
                <p className="text-white font-bold text-xl mb-2">Moral da história:</p>
                <p className="text-amber-300 text-lg">"O mundo não esperou</p>
                <p className="text-amber-300 text-lg">ninguém estar pronto."</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-4">
          {[0, 1, 2].map((p) => (
            <div
              key={p}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                p === phase ? 'bg-emerald-400 w-6' : 'bg-emerald-400/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function AdminTestCardSync() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= TOTAL_DURATION) {
            setIsPlaying(false);
            return TOTAL_DURATION;
          }
          return newTime;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  // Determine active card based on current time
  useEffect(() => {
    let newActiveCard: number | null = null;
    
    for (const card of CARDS_CONFIG) {
      const cardEnd = card.startSecond + card.duration;
      if (currentTime >= card.startSecond && currentTime < cardEnd) {
        newActiveCard = card.id;
        break;
      }
    }
    
    setActiveCard(newActiveCard);
  }, [currentTime]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setActiveCard(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get highlighted text based on current time
  const getHighlightedText = () => {
    const currentCard = CARDS_CONFIG.find(c => c.id === activeCard);
    if (!currentCard) return null;
    
    const anchorIndex = SECTION_TEXT.toLowerCase().indexOf(currentCard.anchorText.toLowerCase());
    if (anchorIndex === -1) return null;
    
    return {
      anchorText: currentCard.anchorText,
      anchorIndex
    };
  };

  const highlightInfo = getHighlightedText();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <h1 className="text-2xl font-bold text-foreground">
          Teste de Sincronização - Card Effects
        </h1>
        <p className="text-muted-foreground mt-1">
          Validação de timing: anchorText → duration → card ativo
        </p>
      </div>

      {/* Timer Controls */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Button
                variant={isPlaying ? "secondary" : "default"}
                size="lg"
                onClick={handlePlayPause}
              >
                {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {isPlaying ? 'Pausar' : 'Iniciar'}
              </Button>
              
              <Button variant="outline" size="lg" onClick={handleReset}>
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>

              <div className="flex-1 mx-4">
                <Progress value={(currentTime / TOTAL_DURATION) * 100} className="h-3" />
              </div>

              <div className="flex items-center gap-2 text-lg font-mono bg-muted px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground font-bold">{formatTime(currentTime)}</span>
                <span className="text-muted-foreground">/ {formatTime(TOTAL_DURATION)}</span>
              </div>
            </div>

            {/* Cards Timeline */}
            <div className="mt-4 relative h-12 bg-muted rounded-lg overflow-hidden">
              {CARDS_CONFIG.map((card) => (
                <div
                  key={card.id}
                  className={`absolute h-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                    activeCard === card.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-primary/20 text-primary'
                  }`}
                  style={{
                    left: `${(card.startSecond / TOTAL_DURATION) * 100}%`,
                    width: `${(card.duration / TOTAL_DURATION) * 100}%`
                  }}
                >
                  Card {card.id}: {card.duration}s
                </div>
              ))}
              
              {/* Current time indicator */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-destructive z-10"
                style={{ left: `${(currentTime / TOTAL_DURATION) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Text Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Texto da Seção 1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed">
              {highlightInfo ? (
                <>
                  {SECTION_TEXT.substring(0, highlightInfo.anchorIndex)}
                  <mark className="bg-primary/30 text-foreground px-1 rounded">
                    {SECTION_TEXT.substring(
                      highlightInfo.anchorIndex, 
                      highlightInfo.anchorIndex + highlightInfo.anchorText.length
                    )}
                  </mark>
                  {SECTION_TEXT.substring(highlightInfo.anchorIndex + highlightInfo.anchorText.length)}
                </>
              ) : (
                SECTION_TEXT
              )}
            </div>

            {/* Card Info */}
            <div className="mt-6 space-y-3">
              {CARDS_CONFIG.map((card) => (
                <div
                  key={card.id}
                  className={`p-3 rounded-lg border transition-all duration-300 ${
                    activeCard === card.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Card {card.id}:</span>{' '}
                      <span className="text-muted-foreground">{card.title}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {card.startSecond}s → {card.startSecond + card.duration}s ({card.duration}s)
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    anchorText: "<span className="text-primary">{card.anchorText}</span>"
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card Preview Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Card Ativo</span>
              {activeCard && (
                <span className="text-sm font-normal text-muted-foreground">
                  Card {activeCard} - {CARDS_CONFIG.find(c => c.id === activeCard)?.title}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {activeCard === 1 && (
                <motion.div
                  key="card1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <CardEffectTeenageDesigner isActive={true} />
                </motion.div>
              )}
              
              {activeCard === 2 && (
                <motion.div
                  key="card2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <CardEffectEconomyReal isActive={true} />
                </motion.div>
              )}
              
              {!activeCard && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-h-[400px] h-[50vh] max-h-[500px] rounded-2xl bg-muted/50 border-2 border-dashed border-border flex items-center justify-center"
                >
                  <div className="text-center text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Aguardando...</p>
                    <p className="text-sm mt-1">
                      {currentTime < CARDS_CONFIG[0].startSecond
                        ? `Card 1 inicia em ${Math.ceil(CARDS_CONFIG[0].startSecond - currentTime)}s`
                        : 'Nenhum card ativo'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">~180</div>
                <div className="text-sm text-muted-foreground">palavras total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{TOTAL_DURATION}s</div>
                <div className="text-sm text-muted-foreground">duração estimada</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">2.5</div>
                <div className="text-sm text-muted-foreground">palavras/seg</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">2</div>
                <div className="text-sm text-muted-foreground">cards na seção</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
