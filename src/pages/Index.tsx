import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, BookOpen, Target, TrendingUp, Zap, Brain, Sparkles, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Aprenda no Seu Ritmo",
      description: "Aulas adaptadas para quem tem 38+ anos, com linguagem clara e exemplos práticos"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Trilhas Personalizadas",
      description: "8 trilhas completas desde fundamentos até monetização com IA"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "IA Interativa",
      description: "Converse com nossa IA tutora para tirar dúvidas e praticar"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Gamificação",
      description: "Sequências diárias, pontos e conquistas para manter motivação"
    }
  ];

  const stats = [
    { value: "8", label: "Trilhas de Aprendizado" },
    { value: "100+", label: "Aulas Práticas" },
    { value: "50+", label: "Exercícios Interativos" },
    { value: "24/7", label: "IA Disponível" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-foreground px-4 py-2 rounded-full mb-6 transition-smooth">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Plataforma especializada para 38+ anos</span>
            </div>
            
            <h1 className="mb-6 text-balance">
              Domine a <span className="gradient-primary bg-clip-text text-transparent">Inteligência Artificial</span> e Transforme Sua Carreira
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
              Aprenda IA do zero com método exclusivo para adultos. Aumente sua produtividade, 
              gere renda extra ou simplesmente entenda a tecnologia que está mudando o mundo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg h-14 px-8 shadow-medium"
                onClick={() => navigate('/auth?mode=signup')}
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg h-14 px-8"
                onClick={() => navigate('/auth?mode=login')}
              >
                Já tenho conta
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              ✓ Sem cartão de crédito &nbsp;•&nbsp; ✓ Comece agora mesmo &nbsp;•&nbsp; ✓ Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Por Que Nossa Plataforma é Diferente?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Criada especialmente para adultos que querem aprender IA de forma prática e aplicada
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 shadow-soft hover:shadow-medium transition-smooth border-2">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-primary-foreground mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trails Preview */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Trilhas de Aprendizado</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Do básico ao avançado, aprenda no seu próprio ritmo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: "🎓", title: "Fundamentos de IA", desc: "Aprenda os conceitos básicos" },
              { icon: "📱", title: "IA no Dia a Dia", desc: "Aplicações práticas" },
              { icon: "💼", title: "IA nos Negócios", desc: "Use IA profissionalmente" },
              { icon: "💰", title: "Renda Extra", desc: "Monetize suas habilidades" },
              { icon: "🤖", title: "ChatGPT Avançado", desc: "Domine o ChatGPT" },
              { icon: "✨", title: "Prompt Engineering", desc: "Arte de conversar com IA" }
            ].map((trail, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-medium transition-smooth">
                <div className="text-5xl mb-4">{trail.icon}</div>
                <h3 className="text-lg font-bold mb-2">{trail.title}</h3>
                <p className="text-sm text-muted-foreground">{trail.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="gradient-primary p-12 text-center shadow-medium">
            <div className="max-w-3xl mx-auto text-primary-foreground">
              <h2 className="mb-6 text-primary-foreground">
                Comece Sua Jornada na IA Hoje
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Junte-se a milhares de profissionais que já estão dominando a Inteligência Artificial
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg h-14 px-8 shadow-medium"
                onClick={() => navigate('/auth?mode=signup')}
              >
                Criar Conta Gratuita
                <Users className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 IA Academy. Ensino de qualidade para todas as idades.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;