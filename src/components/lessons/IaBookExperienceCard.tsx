import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Wand2, Heart, Code2, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { RewardCelebration } from "@/components/gamification/RewardCelebration";

console.log("🔥🔥🔥 ARQUIVO IaBookExperienceCard.tsx FOI CARREGADO 🔥🔥🔥");

type BookTheme = "technical" | "fantasy" | "romance";

interface ThemeConfig {
  name: string;
  icon: typeof Sparkles;
  coverGradient: string;
  accentColor: string;
  badge: string;
  leftPageContent: {
    title: string;
    subtitle: string;
    description: string;
  };
  chapters: string[];
}

const themes: Record<BookTheme, ThemeConfig> = {
  technical: {
    name: "I.A. BOOK",
    icon: Sparkles,
    coverGradient: "from-primary via-primary to-primary/80",
    accentColor: "primary",
    badge: "I.A. BOOK",
    leftPageContent: {
      title: "Introdução",
      subtitle: "Seu guia completo",
      description: "Este livro foi criado especialmente para você dominar as técnicas mais avançadas de Inteligência Artificial de forma prática e objetiva."
    },
    chapters: [
      "1. O Que É Inteligência Artificial",
      "2. Primeiros Passos com ChatGPT",
      "3. Criando Conteúdo de Valor",
      "4. Automatizando Tarefas Diárias"
    ]
  },
  fantasy: {
    name: "MAGIC TOME",
    icon: Wand2,
    coverGradient: "from-purple-600 via-purple-700 to-purple-900",
    accentColor: "purple-500",
    badge: "MAGIC BOOK",
    leftPageContent: {
      title: "O Livro dos Feitiços",
      subtitle: "Magia ancestral",
      description: "Nas páginas antigas deste grimório, encontram-se os segredos mais poderosos da magia antiga, passados de geração em geração."
    },
    chapters: [
      "1. Feitiços de Proteção",
      "2. Poções Mágicas Essenciais",
      "3. Encantamentos de Luz",
      "4. Rituais de Transformação"
    ]
  },
  romance: {
    name: "LOVE STORY",
    icon: Heart,
    coverGradient: "from-pink-500 via-rose-500 to-red-500",
    accentColor: "rose-500",
    badge: "ROMANCE",
    leftPageContent: {
      title: "Cartas de Amor",
      subtitle: "Uma história inesquecível",
      description: "Cada palavra escrita nestas páginas carrega a intensidade de um amor que transcende o tempo e o espaço."
    },
    chapters: [
      "1. O Primeiro Encontro",
      "2. Momentos Inesquecíveis",
      "3. Desafios do Coração",
      "4. Para Sempre Juntos"
    ]
  }
};

export function IaBookExperienceCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<BookTheme>("technical");
  const [typedChapters, setTypedChapters] = useState<string[]>(["", "", "", ""]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [showChapterContent, setShowChapterContent] = useState(false);
  const [typedLeftContent, setTypedLeftContent] = useState("");
  const [typedRightContent, setTypedRightContent] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [showStamp, setShowStamp] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const theme = themes[currentTheme];
  const ThemeIcon = theme.icon;

  // Conteúdo do capítulo 1
  const chapter1LeftContent = "A Inteligência Artificial (IA) é uma tecnologia revolucionária que permite que máquinas aprendam, raciocinem e tomem decisões de forma autônoma. Ela está transformando todos os setores da economia e da sociedade.";
  const chapter1RightContent = "Neste capítulo, você vai descobrir os conceitos fundamentais da IA, entender como ela funciona na prática e aprender a identificar oportunidades para aplicá-la no seu dia a dia e no seu trabalho.";

  useEffect(() => {
    console.log("📕 Livro carregado!");
    const timer = setTimeout(() => {
      console.log("🔓 Abrindo livro...");
      setIsOpen(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Efeito typewriter nos capítulos
  useEffect(() => {
    if (!isOpen) return;
    
    // Reset typed chapters quando mudar tema
    setTypedChapters(["", "", "", ""]);
    setSelectedChapter(null);
    setShowChapterContent(false);
    setTypedLeftContent("");
    setTypedRightContent("");

    const startDelay = 2200;
    const chapterDelay = 150;
    const typingSpeed = 30;

    theme.chapters.forEach((chapter, chapterIndex) => {
      const chapterStartTime = startDelay + (chapterIndex * chapterDelay);
      
      for (let i = 0; i <= chapter.length; i++) {
        setTimeout(() => {
          setTypedChapters(prev => {
            const newChapters = [...prev];
            newChapters[chapterIndex] = chapter.slice(0, i);
            return newChapters;
          });
        }, chapterStartTime + (i * typingSpeed));
      }
    });

    // Auto-selecionar capítulo 1 após todos os capítulos aparecerem
    setTimeout(() => {
      setSelectedChapter(0);
      
      // Abrir conteúdo do capítulo após 1s
      setTimeout(() => {
        setShowChapterContent(true);
        
        // Digitar conteúdo da página esquerda
        for (let i = 0; i <= chapter1LeftContent.length; i++) {
          setTimeout(() => {
            setTypedLeftContent(chapter1LeftContent.slice(0, i));
          }, i * 25);
        }
        
        // Digitar conteúdo da página direita (começa após a esquerda)
        setTimeout(() => {
          for (let i = 0; i <= chapter1RightContent.length; i++) {
            setTimeout(() => {
              setTypedRightContent(chapter1RightContent.slice(0, i));
            }, i * 25);
          }
          
          // Após terminar de digitar tudo, fechar o livro e celebrar
          setTimeout(() => {
            console.log("📖 Fechando livro...");
            setIsClosing(true);
            setIsOpen(false);
            
            // Mostrar carimbo após fechar
            setTimeout(() => {
              setShowStamp(true);
              
              // Mostrar página de créditos
              setTimeout(() => {
                setShowStamp(false);
                setShowCredits(true);
                
                // Mostrar celebração final
                setTimeout(() => {
                  setShowCredits(false);
                  setShowCelebration(true);
                  
                  // Fazer desaparecer após 4 segundos
                  setTimeout(() => {
                    setShowCelebration(false);
                  }, 4000);
                }, 3000);
              }, 2000);
            }, 2500);
          }, (chapter1RightContent.length * 25) + 2000);
        }, chapter1LeftContent.length * 25);
      }, 1000);
    }, 4000);
  }, [isOpen, currentTheme]);

  const handleThemeChange = (newTheme: BookTheme) => {
    setCurrentTheme(newTheme);
    setIsOpen(false);
    setIsClosing(false);
    setShowStamp(false);
    setShowCredits(false);
    setShowCelebration(false);
    setTimeout(() => setIsOpen(true), 100);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 md:py-12 px-4 relative">
      <RewardCelebration type="lesson" trigger={showCelebration} />
      
      {/* Carimbo "Obra Completa" */}
      <AnimatePresence>
        {showStamp && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: -12 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              duration: 0.8,
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="relative">
              {/* Círculo externo do carimbo */}
              <div className="w-64 h-64 rounded-full border-8 border-red-600 flex items-center justify-center bg-red-600/10 backdrop-blur-sm">
                {/* Círculo interno */}
                <div className="w-56 h-56 rounded-full border-4 border-red-600 flex flex-col items-center justify-center gap-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <Trophy className="w-16 h-16 text-red-600" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-3xl font-black text-red-600 tracking-wider">
                      OBRA
                    </p>
                    <p className="text-3xl font-black text-red-600 tracking-wider">
                      COMPLETA
                    </p>
                  </div>
                </div>
              </div>
              {/* Efeito de tinta respingada */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.6, 0.4] }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-full"
                style={{
                  filter: "blur(8px)",
                  background: "radial-gradient(circle, rgba(220,38,38,0.3) 0%, transparent 70%)"
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Página de Créditos */}
      <AnimatePresence>
        {showCredits && (
          <motion.div
            initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: 90, scale: 0.8 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="bg-gradient-to-br from-card via-card to-card/95 rounded-2xl p-12 shadow-2xl border-2 border-border min-w-[400px] min-h-[500px] flex flex-col items-center justify-center space-y-8">
              {/* Ornamento superior */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
              />
              
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2"
                >
                  <h3 className="text-3xl font-serif font-bold text-foreground">
                    {theme.name}
                  </h3>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">
                    Uma Obra Original
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="pt-6 space-y-3"
                >
                  <p className="text-sm text-muted-foreground italic">
                    Escrito por
                  </p>
                  <p className="text-2xl font-serif font-semibold text-foreground">
                    Você
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="pt-6 text-xs text-muted-foreground space-y-1"
                >
                  <p>{new Date().getFullYear()}</p>
                  <p className="flex items-center justify-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Criado com I.A.
                    <Sparkles className="w-3 h-3" />
                  </p>
                </motion.div>
              </div>

              {/* Ornamento inferior */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mensagem de celebração */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="bg-gradient-to-br from-primary via-primary to-primary/80 rounded-2xl p-8 shadow-2xl border-4 border-primary-foreground/20 text-center space-y-4 max-w-md">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <Trophy className="w-16 h-16 text-primary-foreground mx-auto" />
              </motion.div>
              
              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground">
                  🎉 Parabéns, Autor!
                </h3>
                <p className="text-primary-foreground/90 text-base md:text-lg font-semibold">
                  Você acaba de criar seu próprio livro!
                </p>
                <p className="text-primary-foreground/80 text-sm">
                  Uma conquista de grande mérito. Você transformou ideias em páginas, criou capítulos completos e deu vida a uma obra única.
                </p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-4 border-t border-primary-foreground/20"
              >
                <div className="flex items-center justify-center gap-2 text-primary-foreground/90 text-sm font-medium">
                  <BookOpen className="w-4 h-4" />
                  <span>Sua jornada como autor começa aqui</span>
                  <Sparkles className="w-4 h-4" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Theme Selector */}
      <div className="flex justify-center gap-3 mb-8 flex-wrap">
        <button
          onClick={() => handleThemeChange("technical")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
            currentTheme === "technical" 
              ? "border-primary bg-primary/10 text-primary" 
              : "border-border hover:border-primary/50"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Técnico</span>
        </button>
        <button
          onClick={() => handleThemeChange("fantasy")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
            currentTheme === "fantasy" 
              ? "border-purple-500 bg-purple-500/10 text-purple-500" 
              : "border-border hover:border-purple-500/50"
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span className="text-sm font-medium">Fantasia</span>
        </button>
        <button
          onClick={() => handleThemeChange("romance")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
            currentTheme === "romance" 
              ? "border-rose-500 bg-rose-500/10 text-rose-500" 
              : "border-border hover:border-rose-500/50"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span className="text-sm font-medium">Romance</span>
        </button>
      </div>

      <div className="relative" style={{ perspective: '2500px' }}>
        
        {/* LIVRO FECHADO - Capa que vira para trás */}
        <motion.div
          className="absolute inset-0 rounded-2xl shadow-2xl min-h-[400px] md:min-h-[600px] w-full md:w-[400px] mx-auto"
          initial={{ rotateY: 0, z: 100 }}
          animate={isOpen ? { 
            rotateY: -165,
            x: window.innerWidth < 768 ? -150 : -350,
            z: -50,
            scale: 0.95
          } : { 
            rotateY: 0,
            x: 0,
            z: 100,
            scale: 1
          }}
          transition={{ 
            duration: 2.0,
            ease: [0.16, 1, 0.3, 1]
          }}
          style={{ 
            transformStyle: 'preserve-3d',
            transformOrigin: 'right center',
            pointerEvents: isOpen ? 'none' : 'auto'
          }}
        >
          {/* FRENTE DA CAPA */}
          <div 
            className="absolute inset-0 rounded-2xl overflow-hidden flex items-center justify-center p-8 md:p-12"
            style={{ 
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            {/* Gradiente de fundo da capa */}
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.coverGradient} rounded-2xl`} />
            
            {/* Reflexo glossy animado */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              animate={{
                background: [
                  'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 30%, transparent 50%, transparent 100%)',
                  'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.3) 70%, transparent 90%, transparent 100%)',
                  'linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 30%, transparent 50%, transparent 100%)'
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Páginas empilhadas na lateral */}
            <motion.div 
              className="absolute right-0 top-2 bottom-2 w-2"
              initial={{ opacity: 1 }}
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="absolute right-0 bg-background/90 border-r border-background/50"
                  style={{
                    top: `${4 + i * 1.5}px`,
                    bottom: `${4 + i * 1.5}px`,
                    right: `${i * 1.5}px`,
                    width: '2px',
                    boxShadow: '1px 0 2px rgba(0,0,0,0.1)'
                  }}
                />
              ))}
            </motion.div>

            <div className="relative z-10 text-center space-y-6 md:space-y-8">
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-background/10 backdrop-blur-sm border border-primary-foreground/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <ThemeIcon className="w-3 h-3 md:w-4 md:h-4 text-primary-foreground" />
                <span className="text-xs md:text-sm font-medium text-primary-foreground">{theme.badge}</span>
              </motion.div>

              <motion.h2
                className="text-3xl md:text-5xl font-bold text-primary-foreground px-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                {theme.name}
              </motion.h2>
            </div>
          </div>

          {/* CONTRACAPA (verso da capa) */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-card via-card to-card/90 rounded-2xl flex items-center justify-center p-8 md:p-12"
            style={{ 
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <motion.div 
              className="text-center space-y-4 md:space-y-6 max-w-sm"
              initial={{ opacity: 0 }}
              animate={isOpen ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 1.5, duration: 0.6 }}
            >
              <div className="text-xs md:text-sm text-muted-foreground space-y-3">
                <p className="italic">
                  "Um guia completo e transformador que mudará sua perspectiva."
                </p>
                <p className="text-xs">
                  ⭐⭐⭐⭐⭐ (4.9/5)
                </p>
              </div>
              
              <div className="pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  ISBN: 978-1-2345-6789-0
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* LIVRO ABERTO - Duas páginas lado a lado com conteúdo dinâmico */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-0 shadow-2xl rounded-2xl overflow-hidden relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isOpen ? { 
            opacity: 1,
            scale: 1
          } : { 
            opacity: 0,
            scale: 0.8
          }}
          transition={{ 
            delay: isOpen ? 0.8 : 0,
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1]
          }}
          style={{ 
            transformStyle: 'preserve-3d',
            pointerEvents: isOpen ? 'auto' : 'none'
          }}
        >
          {/* Sombra da lombada (centro do livro) */}
          <motion.div
            className="hidden md:block absolute left-1/2 top-0 bottom-0 w-8 -ml-4 pointer-events-none z-20"
            initial={{ opacity: 0 }}
            animate={isOpen ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            style={{
              background: 'linear-gradient(90deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.1) 100%)',
              boxShadow: '0 0 20px rgba(0,0,0,0.15)'
            }}
          />

          {/* Página esquerda - DINÂMICA */}
          <motion.div
            className="bg-card p-6 md:p-10 min-h-[400px] md:min-h-[600px] flex items-center justify-center border-b md:border-b-0 md:border-r border-border/50 relative overflow-hidden"
            animate={showChapterContent ? { rotateY: 2 } : { rotateY: 2 }}
            transition={{ duration: 1.5 }}
            style={{ 
              transformStyle: 'preserve-3d',
              transformOrigin: 'right center'
            }}
          >
            {/* Gradiente de iluminação */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 30%, rgba(0,0,0,0.05) 100%)'
              }}
            />
            {/* Gradiente de curvatura */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 200% 100% at 100% 50%, transparent 0%, rgba(0,0,0,0.08) 100%)'
              }}
            />

            {/* Páginas empilhadas na borda EXTERNA esquerda */}
            <div className="hidden md:block absolute left-0 top-8 bottom-8">
              {Array.from({ length: 25 }, (_, i) => (
                <div
                  key={i}
                  className="absolute bg-card border-l-2 border-border/60 rounded-l-sm"
                  style={{
                    top: `${i * 2}px`,
                    bottom: `${i * 2}px`,
                    left: `-${i * 1.5}px`,
                    width: '3px',
                    boxShadow: '-2px 0 4px rgba(0,0,0,0.15)',
                    zIndex: 25 - i
                  }}
                />
              ))}
            </div>

            {/* CONTEÚDO ALTERNADO */}
            <div className="relative z-10 w-full">
              <AnimatePresence mode="wait">
                {!showChapterContent ? (
                  // Conteúdo original - Introdução
                  <motion.div 
                    key="intro"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4 md:space-y-6 max-w-md mx-auto"
                  >
                    <div className="space-y-3">
                      <h3 className="text-xl md:text-2xl font-bold text-foreground">
                        {theme.leftPageContent.title}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground font-medium">
                        {theme.leftPageContent.subtitle}
                      </p>
                    </div>
                    
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {theme.leftPageContent.description}
                    </p>

                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BookOpen className="w-4 h-4" />
                        <span>Criado com IA</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // Conteúdo do capítulo
                  <motion.div 
                    key="chapter"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
                      {theme.chapters[0]}
                    </h2>
                    
                    {/* Ilustração decorativa */}
                    <div className="flex items-center justify-center my-6 opacity-20">
                      <div className="relative w-32 h-32">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-primary" />
                      </div>
                    </div>
                    
                    <p className="text-sm md:text-base text-foreground leading-relaxed">
                      {typedLeftContent}
                      {typedLeftContent.length < chapter1LeftContent.length && (
                        <span className="inline-block w-[2px] h-[18px] bg-primary ml-1 animate-pulse" />
                      )}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Página direita - DINÂMICA */}
          <motion.div
            className="bg-card p-6 md:p-10 min-h-[400px] md:min-h-[600px] relative overflow-hidden"
            animate={showChapterContent ? { rotateY: -2 } : { rotateY: -2 }}
            transition={{ duration: 1.5 }}
            style={{ 
              transformStyle: 'preserve-3d',
              transformOrigin: 'left center'
            }}
          >
            {/* Gradiente de iluminação */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(270deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 30%, rgba(0,0,0,0.05) 100%)'
              }}
            />
            {/* Gradiente de curvatura */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 200% 100% at 0% 50%, transparent 0%, rgba(0,0,0,0.08) 100%)'
              }}
            />

            {/* Páginas empilhadas na borda EXTERNA direita */}
            <div className="hidden md:block absolute right-0 top-8 bottom-8">
              {Array.from({ length: 25 }, (_, i) => (
                <div
                  key={i}
                  className="absolute bg-card border-r-2 border-border/60 rounded-r-sm"
                  style={{
                    top: `${i * 2}px`,
                    bottom: `${i * 2}px`,
                    right: `-${i * 1.5}px`,
                    width: '3px',
                    boxShadow: '2px 0 4px rgba(0,0,0,0.15)',
                    zIndex: 25 - i
                  }}
                />
              ))}
            </div>

            {/* CONTEÚDO ALTERNADO */}
            <div className="space-y-4 md:space-y-6 relative z-10">
              <AnimatePresence mode="wait">
                {!showChapterContent ? (
                  // Índice original
                  <motion.div
                    key="index"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Status badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 border border-primary/20">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-primary"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 2.0 }}
                      />
                      <span className="text-xs font-medium text-primary">Resposta da I.A.</span>
                    </div>

                    {/* Title */}
                    <div className="mt-4">
                      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                        Estrutura do Livro
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Índice gerado automaticamente
                      </p>
                    </div>

                    {/* Chapters list */}
                    <div className="space-y-2 md:space-y-3 mt-4">
                      {theme.chapters.map((chapter, index) => (
                        <motion.div
                          key={index}
                          className={`flex items-start gap-2 md:gap-3 p-2 md:p-3 rounded-lg border transition-all ${
                            selectedChapter === index 
                              ? 'bg-primary/20 border-primary shadow-lg scale-105' 
                              : 'bg-muted/30 border-border hover:border-primary/40'
                          }`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={isOpen ? { 
                            opacity: 1, 
                            x: 0,
                            scale: selectedChapter === index ? 1.05 : 1
                          } : { opacity: 0, x: -10 }}
                          transition={{ 
                            delay: 2.0 + (index * 0.15), 
                            duration: 0.4
                          }}
                        >
                          <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                            selectedChapter === index
                              ? 'bg-primary border-2 border-primary'
                              : 'bg-primary/15 border border-primary/30'
                          }`}>
                            <span className={`text-xs font-bold ${
                              selectedChapter === index ? 'text-primary-foreground' : 'text-primary'
                            }`}>{index + 1}</span>
                          </div>
                          <p className={`text-xs md:text-sm font-medium leading-relaxed pt-0.5 min-h-[20px] md:min-h-[24px] ${
                            selectedChapter === index ? 'text-primary font-bold' : 'text-foreground'
                          }`}>
                            {typedChapters[index]}
                            {isOpen && typedChapters[index].length < chapter.length && (
                              <span className="inline-block w-[2px] h-[14px] md:h-[16px] bg-primary ml-1 animate-pulse" />
                            )}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Final note */}
                    <motion.p
                      className="text-xs text-muted-foreground italic text-center pt-3 md:pt-4 border-t border-border mt-4"
                      initial={{ opacity: 0 }}
                      animate={isOpen ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: 3.0, duration: 0.5 }}
                    >
                      ✨ Estrutura criada em segundos pela I.A.
                    </motion.p>
                  </motion.div>
                ) : (
                  // Conteúdo do capítulo - página direita
                  <motion.div
                    key="chapter-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    {/* Mini ilustração de conceitos */}
                    <div className="flex gap-4 items-center justify-center my-4 opacity-30">
                      <motion.div 
                        className="flex flex-col items-center gap-2"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                      >
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Code2 className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground">Código</span>
                      </motion.div>
                      
                      <motion.div 
                        className="flex flex-col items-center gap-2"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                      >
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground">IA</span>
                      </motion.div>
                      
                      <motion.div 
                        className="flex flex-col items-center gap-2"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                      >
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground">Aprenda</span>
                      </motion.div>
                    </div>
                    
                    <p className="text-sm md:text-base text-foreground leading-relaxed">
                      {typedRightContent}
                      {typedRightContent.length > 0 && typedRightContent.length < chapter1RightContent.length && (
                        <span className="inline-block w-[2px] h-[18px] bg-primary ml-1 animate-pulse" />
                      )}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
