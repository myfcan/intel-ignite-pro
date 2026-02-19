// Index page - Landing page (v1.0.1)
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, Star, Users, TrendingUp, Zap, Clock, Target, 
  BookOpen, MessageSquare, BarChart3, Sparkles, Award, CheckCircle2,
  PlayCircle, ChevronRight, Trophy, Rocket, DollarSign, Calendar,
  Shield, Brain, Layers, Palette, Bot, FileText, Briefcase, LineChart,
  PenTool, Workflow
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dashboardMockup from "@/assets/dashboard-mockup.jpg";
import lessonMockup from "@/assets/lesson-mockup.jpg";
import chatMockup from "@/assets/chat-mockup.jpg";
import analyticsMockup from "@/assets/analytics-mockup.jpg";
import designMockup from "@/assets/design-mockup.jpg";
import botMockup from "@/assets/bot-mockup.jpg";
import iphoneChatMockup from "@/assets/iphone-chat-mockup.jpg";
import iphoneChatHero from "@/assets/iphone-chat-hero.jpg";
import { usePrefetchMainPages } from "@/hooks/usePrefetch";
import logoAiliv from "@/assets/ailiv-logo-new.png";

const Index = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("pro");
  
  // Redireciona usuários logados para o dashboard
  useEffect(() => {
    import("@/integrations/supabase/client").then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) navigate("/dashboard", { replace: true });
      });
    });
  }, [navigate]);

  // Prefetch Dashboard, Onboarding and TrailDetail in background
  usePrefetchMainPages();
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => navigate('/')}
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                ease: [0.22, 1, 0.36, 1],
                delay: 0.1
              }}
            >
              <img 
                src={logoAiliv} 
                alt="Ailiv" 
                className="h-12 sm:h-14 w-auto object-contain transition-all duration-300 hover:scale-110 hover:brightness-125 hover:drop-shadow-[0_0_12px_rgba(255,215,0,0.6)]"
              />
            </motion.div>
            <Button onClick={() => navigate('/auth?mode=signup')} className="gradient-hero text-white">
              Começar Agora
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Social Proof Badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-8 animate-fade-in">
              <Badge variant="secondary" className="px-4 py-2 text-sm shadow-soft">
                <Users className="w-4 h-4 mr-2" />
                🔥 3.847 alunos ativos
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm shadow-soft">
                <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
                ⭐ 4.9/5.0 avaliação
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm shadow-soft">
                <Target className="w-4 h-4 mr-2" />
                🎯 98% recomendam
              </Badge>
            </div>

            <h1 className="mb-6 text-balance animate-fade-in" style={{animationDelay: '0.2s'}}>
              Domine a IA em <span className="gradient-hero bg-clip-text text-transparent">28 Dias</span> e Transforme Seu Futuro Profissional
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 text-balance max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.4s'}}>
              Aprenda a usar Inteligência Artificial de forma prática, ganhe produtividade e descubra como gerar renda extra — mesmo sem ser técnico.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <Button 
                size="lg" 
                className="text-lg h-14 px-8 gradient-hero text-white shadow-cyan-glow hover:shadow-pink-glow transition-all"
                onClick={() => navigate('/auth?mode=signup')}
              >
                Começar Minha Transformação
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg h-14 px-8 border-2"
              >
                Ver Como Funciona
                <PlayCircle className="ml-2 w-5 h-5" />
              </Button>
            </div>

            {/* Hero Mockup */}
            <div className="mt-16 animate-fade-in flex justify-center" style={{animationDelay: '0.8s'}}>
              <div className="relative w-64">
                <div className="absolute inset-0 bg-gradient-mesh opacity-40 blur-3xl"></div>
                <img 
                  src={iphoneChatHero} 
                  alt="Chat IA no iPhone"
                  className="relative rounded-[2.5rem] shadow-2xl w-full hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Milhares Já Transformaram */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Milhares Já Transformaram Suas Vidas com IA</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Profissionais como você estão economizando horas, aumentando renda e se destacando no mercado
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[
              {
                name: "Maria Clara",
                age: 47,
                role: "Dentista",
                initials: "MC",
                quote: "Economizo 2h por dia em tarefas administrativas",
                badge: "💰 +R$2.400/mês economizados",
                color: "primary"
              },
              {
                name: "Roberto Silva",
                age: 52,
                role: "Contador",
                initials: "RS",
                quote: "Conquistei 5 clientes novos oferecendo serviços de IA",
                badge: "📈 +R$4.300/mês em renda extra",
                color: "blue"
              },
              {
                name: "Ana Oliveira",
                age: 44,
                role: "Empresária",
                initials: "AO",
                quote: "Automatizei 80% das minhas tarefas repetitivas",
                badge: "⏰ 15h/semana recuperadas",
                color: "accent"
              },
              {
                name: "Carlos Mendes",
                age: 56,
                role: "Advogado",
                initials: "CM",
                quote: "Produzo relatórios 5x mais rápido",
                badge: "🚀 5x mais produtivo",
                color: "success"
              }
            ].map((story, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-medium transition-smooth">
                <div className={`w-20 h-20 mx-auto mb-4 gradient-${story.color} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-medium`}>
                  {story.initials}
                </div>
                <div className="font-bold text-lg">{story.name}, {story.age} anos</div>
                <div className="text-sm text-muted-foreground mb-3">{story.role}</div>
                <p className="text-sm mb-4 italic">"{story.quote}"</p>
                <Badge variant="success" className="text-xs">
                  {story.badge}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Por Que as Pessoas Adoram */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Por Que Mais de 3.800 Profissionais Escolheram o Inteligência Ignite</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: <Target className="w-8 h-8" />,
                title: "Aprendizado Personalizado",
                description: "Quiz inteligente cria sua trilha baseada no seu perfil, objetivos e tempo disponível. Aprenda exatamente o que você precisa."
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Resultados em Minutos",
                description: "Cada aula entrega algo aplicável HOJE. Não é teoria - você faz e vê o resultado na hora. Primeira conquista em 10 minutos."
              },
              {
                icon: <Brain className="w-8 h-8" />,
                title: "Feito Para +38 Anos",
                description: "Sem jargão técnico. Sem complicação. Explicações claras como se estivéssemos tomando café juntos. Você vai entender."
              },
              {
                icon: <DollarSign className="w-8 h-8" />,
                title: "Gere Renda Extra",
                description: "Descubra 12 formas de monetizar suas habilidades em IA. Alunos faturam de R$1.000 a R$8.000/mês extras."
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Comunidade Ativa",
                description: "Mais de 3.800 profissionais trocando experiências, dúvidas e oportunidades todos os dias."
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Aprenda no Seu Ritmo",
                description: "10min por dia no celular já é suficiente. Pause, retome, reveja. Sua jornada, suas regras."
              }
            ].map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-medium transition-smooth">
                <div className="w-16 h-16 gradient-hero rounded-2xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Trilhas */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Explore Trilhas de IA Personalizadas Para Seus Objetivos</h2>
            <p className="text-xl text-muted-foreground">
              Cada trilha é um caminho completo com aulas práticas, projetos reais e certificado
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {[
              {
                icon: <Zap className="w-12 h-12" />,
                title: "IA para Produtividade",
                lessons: "8 aulas",
                duration: "2h30",
                level: "Iniciante",
                description: "Automatize emails, reuniões e tarefas do dia a dia",
                tag: null,
                mockup: dashboardMockup
              },
              {
                icon: <DollarSign className="w-12 h-12" />,
                title: "Renda Extra com IA",
                lessons: "12 aulas",
                duration: "4h",
                level: "Intermediário",
                description: "Aprenda a vender serviços e criar produtos com IA",
                tag: null,
                mockup: lessonMockup
              },
              {
                icon: <FileText className="w-12 h-12" />,
                title: "Criação de Conteúdo",
                lessons: "10 aulas",
                duration: "3h",
                level: "Iniciante",
                description: "Posts, emails, artigos e scripts em minutos",
                tag: "🔥 Mais popular",
                mockup: chatMockup
              },
              {
                icon: <BarChart3 className="w-12 h-12" />,
                title: "Análise de Dados com IA",
                lessons: "15 aulas",
                duration: "5h",
                level: "Avançado",
                description: "Transforme dados em decisões inteligentes",
                tag: null,
                mockup: analyticsMockup
              },
              {
                icon: <Palette className="w-12 h-12" />,
                title: "Design e Imagens com IA",
                lessons: "9 aulas",
                duration: "3h",
                level: "Iniciante",
                description: "Crie logos, posts e imagens profissionais",
                tag: null,
                mockup: designMockup
              },
              {
                icon: <Bot className="w-12 h-12" />,
                title: "Chatbots e Automação",
                lessons: "11 aulas",
                duration: "4h",
                level: "Intermediário",
                description: "Construa assistentes virtuais para seu negócio",
                tag: null,
                mockup: botMockup
              }
            ].map((trail, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-medium transition-smooth group">
                {trail.tag && (
                  <div className="bg-accent text-white px-4 py-2 text-sm font-semibold text-center">
                    {trail.tag}
                  </div>
                )}
                
                {/* Mockup Preview */}
                <div className="h-48 overflow-hidden border-b relative">
                  <img 
                    src={trail.mockup} 
                    alt={`Preview ${trail.title}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                  <div className="absolute bottom-4 right-4 w-14 h-14 gradient-hero rounded-xl flex items-center justify-center text-white shadow-medium">
                    {trail.icon}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{trail.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {trail.lessons}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {trail.duration}
                    </span>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      {trail.level}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{trail.description}</p>
                  <Button className="w-full gradient-primary text-white" variant="default">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Começar Trilha
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" className="text-lg px-8">
              Ver Todas as 12 Trilhas
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="mb-4">Como Funciona: Da Primeira Aula ao Primeiro Resultado</h2>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                icon: <FileText className="w-10 h-10" />,
                title: "Quiz Personalizado",
                time: "2 min",
                description: "Respondemos 5 perguntas sobre você e criamos sua trilha personalizada",
                color: "primary"
              },
              {
                step: 2,
                icon: <BookOpen className="w-10 h-10" />,
                title: "Aulas Curtas e Práticas",
                time: "5-10 min",
                description: "Assista, pratique com IA real e complete exercícios na hora",
                color: "blue"
              },
              {
                step: 3,
                icon: <Sparkles className="w-10 h-10" />,
                title: "Aplique no Mundo Real",
                time: "Imediato",
                description: "Cada aula entrega algo usável: um email, post, lista, automação",
                color: "accent"
              },
              {
                step: 4,
                icon: <Rocket className="w-10 h-10" />,
                title: "Evolua e Ganhe",
                time: "Contínuo",
                description: "Desbloqueie certificados, badges e novas oportunidades de renda",
                color: "success"
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                {index < 3 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary to-accent opacity-30 z-0" />
                )}
                <Card className="p-6 text-center relative z-10 hover:shadow-medium transition-smooth h-full">
                  <div className={`w-20 h-20 mx-auto mb-4 gradient-${step.color} rounded-2xl flex items-center justify-center text-white shadow-medium`}>
                    {step.icon}
                  </div>
                  <Badge variant="outline" className="mb-3">{step.time}</Badge>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Desafio 28 Dias */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Card className="p-10 gradient-mesh text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
                    <Trophy className="w-5 h-5" />
                    <span className="font-semibold">Desafio Exclusivo</span>
                  </div>
                  <h2 className="mb-4 text-white">🔥 Desafio Ignite: 28 Dias Para Dominar IA</h2>
                  <p className="text-xl text-white/90">
                    Comprometa-se com 10 minutos por dia e veja sua vida transformar
                  </p>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-8">
                  {[
                    { days: "Dia 1-7", phase: "Fundamentos", status: "✅" },
                    { days: "Dia 8-14", phase: "Aplicação Prática", status: "✅" },
                    { days: "Dia 15-21", phase: "Projetos Reais", status: "🔄" },
                    { days: "Dia 22-28", phase: "Monetização", status: "🔒" }
                  ].map((phase, index) => (
                    <Card key={index} className="p-4 bg-white/10 backdrop-blur-sm border-white/20 text-center">
                      <div className="text-3xl mb-2">{phase.status}</div>
                      <div className="font-semibold text-sm mb-1">{phase.days}</div>
                      <div className="text-xs opacity-90">{phase.phase}</div>
                    </Card>
                  ))}
                </div>

                <div className="grid md:grid-cols-4 gap-6 text-center">
                  {[
                    { value: "89%", label: "completam o desafio" },
                    { value: "12min", label: "Média por dia" },
                    { value: "1.247", label: "badges conquistados" },
                    { value: "R$2.1k", label: "renda extra média" }
                  ].map((stat, index) => (
                    <div key={index}>
                      <div className="text-3xl font-bold mb-1">{stat.value}</div>
                      <div className="text-sm opacity-90">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <Button size="lg" variant="secondary" className="text-lg px-8 h-14">
                    <Trophy className="w-5 h-5 mr-2" />
                    Aceitar o Desafio de 28 Dias
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Sua Jornada em 4 Passos */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Sua Jornada Personalizada em 4 Passos Simples</h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {[
              {
                step: "Passo 1",
                day: "Dia 0",
                title: "Comece Hoje",
                description: "Faça o quiz, escolha seu plano e acesse tudo na hora",
                result: null,
                icon: <Sparkles className="w-6 h-6" />
              },
              {
                step: "Passo 2",
                day: "Dias 1-7",
                title: "Primeira Semana",
                description: "Complete o módulo Fundamentos e faça sua primeira automação",
                result: "3 horas economizadas",
                icon: <Zap className="w-6 h-6" />
              },
              {
                step: "Passo 3",
                day: "Dias 8-60",
                title: "Segundo Mês",
                description: "Domine 2-3 trilhas e comece a aplicar em projetos reais",
                result: "Primeiro cliente ou projeto concluído",
                icon: <Target className="w-6 h-6" />
              },
              {
                step: "Passo 4",
                day: "Dia 90+",
                title: "Transformação",
                description: "Torne-se referência em IA e abra novas oportunidades",
                result: "R$2k-5k/mês em renda extra",
                icon: <Trophy className="w-6 h-6" />
              }
            ].map((journey, index) => (
              <Card key={index} className="p-8 hover:shadow-medium transition-smooth">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 gradient-hero rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-medium">
                    {journey.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline">{journey.step}</Badge>
                      <Badge variant="secondary">{journey.day}</Badge>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{journey.title}</h3>
                    <p className="text-muted-foreground mb-3">{journey.description}</p>
                    {journey.result && (
                      <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-semibold">Resultado típico: {journey.result}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Aumente Seu Potencial */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Aumente Seu Potencial de Renda com Inteligência Ignite</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Aprenda novas habilidades digitais e ferramentas de IA para melhorar seu trabalho e aumentar sua renda. Comece agora.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
            {[
              {
                icon: <FileText className="w-8 h-8" />,
                title: "Criação de Conteúdo",
                income: "R$500-2.000/mês",
                description: "Posts, emails e copy para empresas",
                demand: "Muito Alta"
              },
              {
                icon: <Brain className="w-8 h-8" />,
                title: "Consultoria em IA",
                income: "R$1.500-5.000/mês",
                description: "Ajude negócios a implementarem IA",
                demand: "Alta"
              },
              {
                icon: <Layers className="w-8 h-8" />,
                title: "Automação de Processos",
                income: "R$800-3.000/mês",
                description: "Configure chatbots e workflows",
                demand: "Crescente"
              },
              {
                icon: <Palette className="w-8 h-8" />,
                title: "Design com IA",
                income: "R$600-2.500/mês",
                description: "Logos, posts e materiais visuais",
                demand: "Muito Alta"
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Análise de Dados",
                income: "R$1.200-4.000/mês",
                description: "Relatórios e insights com IA",
                demand: "Alta"
              },
              {
                icon: <Bot className="w-8 h-8" />,
                title: "Criação de Produtos Digitais",
                income: "R$1.000-8.000/mês",
                description: "E-books, cursos, templates",
                demand: "Média"
              }
            ].map((opportunity, index) => (
              <Card key={index} className="p-6 hover:shadow-medium transition-smooth">
                <div className="w-14 h-14 gradient-primary rounded-xl flex items-center justify-center text-white mb-4">
                  {opportunity.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{opportunity.title}</h3>
                <div className="text-2xl font-bold gradient-hero bg-clip-text text-transparent mb-2">
                  {opportunity.income}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{opportunity.description}</p>
                <Badge variant="outline" className="text-xs">
                  🎯 Demanda: {opportunity.demand}
                </Badge>
              </Card>
            ))}
          </div>

          <Card className="p-8 max-w-4xl mx-auto bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold gradient-hero bg-clip-text text-transparent mb-2">
                  R$2.847/mês
                </div>
                <div className="text-sm text-muted-foreground">💰 Renda média extra</div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-hero bg-clip-text text-transparent mb-2">
                  67%
                </div>
                <div className="text-sm text-muted-foreground">📈 faturam no 1º mês</div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-hero bg-clip-text text-transparent mb-2">
                  Ilimitado
                </div>
                <div className="text-sm text-muted-foreground">🚀 Potencial de crescimento</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Escolha Seu Plano e Comece Hoje</h2>
            <p className="text-xl text-muted-foreground">
              Todos os planos incluem acesso vitalício e garantia de 7 dias
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Starter",
                price: "R$ 97",
                period: "/mês",
                description: "Perfeito para começar sua jornada",
                features: [
                  "4 trilhas completas",
                  "50+ aulas práticas",
                  "IA tutora 24/7",
                  "Comunidade exclusiva",
                  "Certificados digitais"
                ],
                cta: "Começar Agora",
                variant: "outline" as const
              },
              {
                name: "Pro",
                price: "R$ 197",
                period: "/mês",
                description: "Mais popular entre profissionais",
                features: [
                  "12 trilhas completas",
                  "100+ aulas práticas",
                  "IA tutora premium",
                  "Mentorias em grupo",
                  "Projetos reais",
                  "Certificados profissionais",
                  "Suporte prioritário"
                ],
                cta: "Começar Agora",
                variant: "default" as const,
                popular: true
              },
              {
                name: "Elite",
                price: "R$ 397",
                period: "/mês",
                description: "Para quem quer máximo resultado",
                features: [
                  "Tudo do Pro +",
                  "Mentoria 1:1 mensal",
                  "Acesso antecipado",
                  "Networking exclusivo",
                  "Oportunidades de parceria",
                  "Consultoria de carreira"
                ],
                cta: "Começar Agora",
                variant: "outline" as const
              }
            ].map((plan, index) => (
              <Card key={index} className={`p-8 relative ${plan.popular ? 'border-2 border-primary shadow-cyan-glow' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="gradient-hero text-white px-4 py-1">
                      🔥 Mais Popular
                    </Badge>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold gradient-hero bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full ${plan.popular ? 'gradient-hero text-white' : ''}`}
                  variant={plan.variant}
                  size="lg"
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="gradient-mesh p-12 text-center shadow-large max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 text-white">
              <Badge className="bg-white/20 text-white border-white/30 mb-6 px-6 py-2">
                <Calendar className="w-4 h-4 mr-2" />
                Últimas vagas para turma de Janeiro
              </Badge>
              
              <h2 className="mb-6 text-white">
                Comece Sua Jornada na IA Hoje
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Junte-se a milhares de profissionais que já estão dominando a Inteligência Artificial e transformando suas carreiras
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="text-lg h-14 px-8 shadow-large"
                  onClick={() => navigate('/auth?mode=signup')}
                >
                  Garantir Minha Vaga Agora
                  <Rocket className="ml-2 w-5 h-5" />
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>Garantia de 7 dias</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>3.847 alunos ativos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-white" />
                  <span>4.9/5.0 avaliação</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 gradient-hero rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold gradient-hero bg-clip-text text-transparent">
                  Inteligência Ignite
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ensino de qualidade em IA para todas as idades
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Plataforma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Trilhas</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Como Funciona</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Preços</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Para Empresas</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Recursos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Casos de Sucesso</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Suporte</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Privacidade</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 Inteligência Ignite. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
