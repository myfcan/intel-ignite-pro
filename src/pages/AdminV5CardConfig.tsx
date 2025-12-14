import { motion } from "framer-motion";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Plus, Trash2, Save, Wand2, Eye, Download, Book, Brain, Sparkles, Zap, Star, Rocket, Target, Lightbulb, Trophy, Heart, Crown, Flame, Send, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DynamicExperienceCard } from '@/components/lessons/DynamicExperienceCard';
import { DynamicCardEffect, CARD_EFFECT_TYPES, CARD_EFFECT_LABELS, CARD_EFFECT_DESCRIPTIONS, CARD_EFFECTS_BY_LESSON, isValidCardEffectType, CardEffectType } from '@/components/lessons/card-effects';

// 🎓 Configuração das Aulas disponíveis
const AVAILABLE_LESSONS = [
  {
    id: 'aula-2',
    title: 'Aula 2 - História da Maria',
    description: '14 card effects cinematográficos',
    icon: '👩‍💼'
  },
  {
    id: 'aula-4',
    title: 'Aula 4 - O Dia em que a Padaria Mudou de Nível',
    description: '16 card effects cinematográficos',
    icon: '🥖'
  },
  {
    id: 'aula-11',
    title: 'Aula 11 - Planilhas, organização e automação leve com I.A.',
    description: '15 card effects cinematográficos',
    icon: '📊'
  },
  {
    id: 'aula-08',
    title: 'Aula 08 - Vídeos simples com I.A.',
    description: '15 card effects cinematográficos',
    icon: '🎬'
  },
  {
    id: 'aula-10-plano',
    title: 'Aula 10 - Seu Plano de 30 Dias com I.A.',
    description: '15 card effects cinematográficos',
    icon: '📅'
  },
];

// 📋 Templates pré-configurados de Experience Cards por Aula
const LESSON_CARD_TEMPLATES: Record<string, ExperienceCard[]> = {
  'aula-1': [
    { sectionIndex: 1, cardIndex: 1, cardType: 'app-builder', anchorText: 'aplicativo funcional', title: 'Criador de Apps', subtitle: 'I.A. construindo aplicativos' },
    { sectionIndex: 1, cardIndex: 2, cardType: 'digital-employee', anchorText: 'funcionário digital', title: 'Funcionário Digital', subtitle: 'Assistente que nunca para' },
    { sectionIndex: 2, cardIndex: 1, cardType: 'business-design', anchorText: 'produtos reais', title: 'Design de Negócio', subtitle: 'Estruturando ideias em minutos' },
    { sectionIndex: 2, cardIndex: 2, cardType: 'content-creator', anchorText: 'e-books, manuais, treinamentos internos', title: 'Coautor de Conteúdo', subtitle: 'Livros e cursos com I.A.' },
    { sectionIndex: 3, cardIndex: 1, cardType: 'content-machine', anchorText: 'linha de produção de conteúdo', title: 'Máquina de Conteúdo', subtitle: 'Produção em escala' },
    { sectionIndex: 3, cardIndex: 2, cardType: 'video-studio', anchorText: 'I.A. criando um vídeo inteiro', title: 'Estúdio de Vídeo I.A.', subtitle: 'Vídeos profissionais automatizados' },
    { sectionIndex: 4, cardIndex: 1, cardType: 'automation', anchorText: 'fluxos e automações', title: 'Fluxos de Automação', subtitle: 'Processos inteligentes' },
    { sectionIndex: 4, cardIndex: 2, cardType: 'presence-amplifier', anchorText: 'versão melhorada de você', title: 'Amplificador de Presença', subtitle: 'Multiplique seu alcance' },
    { sectionIndex: 4, cardIndex: 3, cardType: 'playground-chat', anchorText: 'acessar o Playground', title: 'Playground I.A.', subtitle: 'Experimente agora' },
    { sectionIndex: 5, cardIndex: 1, cardType: 'strategic-advisor', anchorText: 'conselho estratégico de bolso', title: 'Conselho Estratégico', subtitle: 'Análise de cenários com I.A.' },
    { sectionIndex: 5, cardIndex: 2, cardType: 'new-professions', anchorText: 'cria novas profissões', title: 'Novas Profissões', subtitle: 'Carreiras do futuro' },
    { sectionIndex: 5, cardIndex: 3, cardType: 'closing-message', anchorText: 'em cima dessas novas possibilidades', title: 'Próximos Passos', subtitle: 'Sua jornada começa agora' },
  ],
  'aula-2': [
    { sectionIndex: 1, cardIndex: 1, cardType: 'profile-card', anchorText: 'dona de uma pequena loja', title: 'Perfil da Maria', subtitle: 'Conheça a protagonista' },
    { sectionIndex: 1, cardIndex: 2, cardType: 'problem-identifier', anchorText: 'não sabia vender online', title: 'O Desafio', subtitle: 'Identificando barreiras' },
    { sectionIndex: 1, cardIndex: 3, cardType: 'story-revealer', anchorText: 'mudou tudo', title: 'O Segredo', subtitle: 'A virada' },
    { sectionIndex: 2, cardIndex: 1, cardType: 'stats-comparison', anchorText: 'falta de visibilidade', title: 'O Problema Real', subtitle: 'Visibilidade vs Invisibilidade' },
    { sectionIndex: 2, cardIndex: 2, cardType: 'generic-detector', anchorText: 'eram genéricos', title: 'Scanner de Genérico', subtitle: 'Detectando o problema' },
    { sectionIndex: 2, cardIndex: 3, cardType: 'prompt-magic', anchorText: 'segredo', title: 'A Mágica do Prompt', subtitle: 'Transformação do texto' },
    { sectionIndex: 3, cardIndex: 1, cardType: 'amplifier-concept', anchorText: 'amplificadora', title: 'Conceito Amplificador', subtitle: 'IA como multiplicadora' },
    { sectionIndex: 3, cardIndex: 2, cardType: 'emotion-connector', anchorText: 'prompts com emoção', title: 'Conexão Emocional', subtitle: 'Histórias que conectam' },
    { sectionIndex: 3, cardIndex: 3, cardType: 'object-transformer', anchorText: 'Posts que conectam', title: 'Transformação', subtitle: 'De genérico para único' },
    { sectionIndex: 4, cardIndex: 1, cardType: 'transformation-viewer', anchorText: '47 vendas', title: 'Resultados Reais', subtitle: 'A transformação em números' },
    { sectionIndex: 4, cardIndex: 2, cardType: 'prompt-builder', anchorText: 'contar histórias', title: 'Construtor de Prompts', subtitle: 'Passo a passo' },
    { sectionIndex: 4, cardIndex: 3, cardType: 'variation-multiplier', anchorText: 'dezenas de variações', title: 'Multiplicador', subtitle: '1 ideia → muitas versões' },
    { sectionIndex: 5, cardIndex: 1, cardType: 'next-steps', anchorText: 'Próximos passos', title: 'Ação!', subtitle: 'Comece agora' },
    { sectionIndex: 5, cardIndex: 2, cardType: 'closing-message', anchorText: 'possibilidades reais', title: 'Mensagem Final', subtitle: 'Sua jornada começa' },
  ],
  'aula-3': [
    // Seção 1 - O Mercado Invisível (3 cards)
    { sectionIndex: 1, cardIndex: 1, cardType: 'hidden-market', anchorText: 'mercado gigantesco', title: 'Mercado Oculto', subtitle: 'Oportunidades invisíveis' },
    { sectionIndex: 1, cardIndex: 2, cardType: 'need-detector', anchorText: 'milhares de pequenas necessidades', title: 'Detector de Necessidades', subtitle: 'Problemas = oportunidades' },
    { sectionIndex: 1, cardIndex: 3, cardType: 'bridge-builder', anchorText: 'ponte', title: 'Construtor de Pontes', subtitle: 'Conecte problemas a soluções' },
    // Seção 2 - Três Níveis de Oportunidade (3 cards)
    { sectionIndex: 2, cardIndex: 1, cardType: 'level-system', anchorText: 'Nível 1', title: 'Sistema de Níveis', subtitle: 'Evolua passo a passo' },
    { sectionIndex: 2, cardIndex: 2, cardType: 'value-calculator', anchorText: 'Currículos personalizados', title: 'Calculadora de Valor', subtitle: 'Quanto cobrar por serviço' },
    { sectionIndex: 2, cardIndex: 3, cardType: 'reference-builder', anchorText: 'referência', title: 'Construtor de Autoridade', subtitle: 'Vire referência no mercado' },
    // Seção 3 - Casos Reais e Simples (3 cards)
    { sectionIndex: 3, cardIndex: 1, cardType: 'case-viewer', anchorText: 'João cria lojas de e-commerce do zero', title: 'Visualizador de Casos', subtitle: 'João e as lojas online' },
    { sectionIndex: 3, cardIndex: 2, cardType: 'profit-calculator', anchorText: '100 reais por loja', title: 'Calculadora de Ganhos', subtitle: 'Projete sua renda' },
    { sectionIndex: 3, cardIndex: 3, cardType: 'opportunity-identifier', anchorText: 'identificaram oportunidades simples ao redor', title: 'Identificador', subtitle: 'Encontre sua oportunidade' },
    // Seção 4 - Seu Primeiro Teste (3 cards)
    { sectionIndex: 4, cardIndex: 1, cardType: 'problem-solver', anchorText: 'sempre pedem ajuda', title: 'Solucionador', subtitle: 'Transforme problemas em renda' },
    { sectionIndex: 4, cardIndex: 2, cardType: 'template-gallery', anchorText: 'Exemplos para Começar', title: 'Galeria de Templates', subtitle: 'Modelos prontos para usar' },
    { sectionIndex: 4, cardIndex: 3, cardType: 'playground-creator', anchorText: 'Teste agora', title: 'Criador de Soluções', subtitle: 'Pratique no Playground' },
    // Seção 5 - O Caminho Sustentável (4 cards)
    { sectionIndex: 5, cardIndex: 1, cardType: 'timeline-tracker', anchorText: 'Semana 1-2', title: 'Linha do Tempo', subtitle: 'Seu progresso mapeado' },
    { sectionIndex: 5, cardIndex: 2, cardType: 'growth-visualizer', anchorText: 'confiança para cobrar', title: 'Visualizador de Crescimento', subtitle: 'De zero a profissional' },
    { sectionIndex: 5, cardIndex: 3, cardType: 'success-roadmap', anchorText: 'Hoje mesmo', title: 'Mapa do Sucesso', subtitle: 'Comece agora' },
    { sectionIndex: 5, cardIndex: 4, cardType: 'stability-map', anchorText: 'estabilidade', title: 'Mapa da Estabilidade', subtitle: 'Construa bases sólidas' },
  ],
  'aula-4': [
    // Seção 1 - O dia em que a padaria mudou de nível (3 cards)
    { sectionIndex: 1, cardIndex: 1, cardType: 'bakery-transformation', anchorText: 'cartaz novo, bonito', title: 'Transformação da Padaria', subtitle: 'De comum para profissional' },
    { sectionIndex: 1, cardIndex: 2, cardType: 'teenage-designer', anchorText: 'filha de quatorze anos fez isso', title: 'Designer de 14 Anos', subtitle: 'Criando com I.A.' },
    { sectionIndex: 1, cardIndex: 3, cardType: 'first-mover-advantage', anchorText: 'Quem testou primeiro saiu na frente', title: 'Vantagem do Pioneiro', subtitle: 'Quem age primeiro ganha' },
    // Seção 2 - Os três tipos de pessoa diante da I.A. (3 cards)
    { sectionIndex: 2, cardIndex: 1, cardType: 'three-persona-types', anchorText: 'três tipos de pessoa', title: 'Os Três Perfis', subtitle: 'Medroso, Planejador, Fazedor' },
    { sectionIndex: 2, cardIndex: 2, cardType: 'fear-vs-action', anchorText: 'Isso é complicado demais', title: 'Medo vs Ação', subtitle: 'Duas escolhas, dois destinos' },
    { sectionIndex: 2, cardIndex: 3, cardType: 'silent-doer', anchorText: 'O Fazedor Silencioso', title: 'O Fazedor Silencioso', subtitle: 'Testa, erra, ajusta, lucra' },
    // Seção 3 - O que dá para fazer com I.A. no mundo real (4 cards)
    { sectionIndex: 3, cardIndex: 1, cardType: 'real-world-uses', anchorText: 'possibilidades concretas', title: 'Usos no Mundo Real', subtitle: 'Cardápios, descrições, roteiros' },
    { sectionIndex: 3, cardIndex: 2, cardType: 'resume-builder', anchorText: 'rapaz que sempre ajudou amigos com currículo', title: 'O Rapaz do Currículo', subtitle: 'Transformou ajuda em serviço' },
    { sectionIndex: 3, cardIndex: 3, cardType: 'spreadsheet-master', anchorText: 'moça que gosta de organização', title: 'A Moça das Planilhas', subtitle: 'Organização virou negócio' },
    { sectionIndex: 3, cardIndex: 4, cardType: 'script-writer', anchorText: 'roteirista de apoio', title: 'Roteirista de Apoio', subtitle: 'I.A. estrutura, você grava' },
    // Seção 4 - Trazendo isso para a sua realidade (3 cards)
    { sectionIndex: 4, cardIndex: 1, cardType: 'your-reality', anchorText: 'sua vez de olhar para o seu mundo', title: 'Sua Realidade', subtitle: 'Olhe ao seu redor' },
    { sectionIndex: 4, cardIndex: 2, cardType: 'help-network', anchorText: 'pessoas próximas sempre pedem ajuda', title: 'Sua Rede de Ajuda', subtitle: 'Quem você pode ajudar?' },
    { sectionIndex: 4, cardIndex: 3, cardType: 'small-experiment', anchorText: 'pequeno experimento bem-feito', title: 'Pequeno Experimento', subtitle: 'É assim que começa' },
    // Seção 5 - A verdade que ninguém conta (3 cards)
    { sectionIndex: 5, cardIndex: 1, cardType: 'history-parallel', anchorText: 'internet começou a crescer', title: 'Paralelo Histórico', subtitle: 'Internet → I.A.' },
    { sectionIndex: 5, cardIndex: 2, cardType: 'balanced-approach', anchorText: 'Quem entende o equilíbrio', title: 'O Equilíbrio Certo', subtitle: 'Nem ignora, nem exagera' },
    { sectionIndex: 5, cardIndex: 3, cardType: 'practice-preview', anchorText: 'próximas aulas', title: 'Preview da Prática', subtitle: 'Prompts, estruturas, exercícios' },
  ],
  'aula-11': [
    // Seção 1 - Planilhas e organização (3 cards)
    { sectionIndex: 1, cardIndex: 1, cardType: 'fear-breaker', anchorText: 'medo de errar', title: 'A Trava da Planilha', subtitle: 'Do medo da tela em branco ao primeiro passo' },
    { sectionIndex: 1, cardIndex: 2, cardType: 'qa-table', anchorText: 'perguntas e respostas', title: 'Planilha como Q&A', subtitle: 'Cada linha é uma situação real' },
    { sectionIndex: 1, cardIndex: 3, cardType: 'ai-assistant', anchorText: 'assistente de planilhas', title: 'A I.A. como Assistente', subtitle: 'Ela cuida da parte chata' },
    // Seção 2 - Estruturando (3 cards)
    { sectionIndex: 2, cardIndex: 1, cardType: 'three-questions', anchorText: 'três perguntas', title: 'As Três Perguntas Mágicas', subtitle: 'O que acompanhar, com que detalhe, o que ver no final' },
    { sectionIndex: 2, cardIndex: 2, cardType: 'map-visual', anchorText: 'mapa visual', title: 'Transformando Medo em Mapa', subtitle: 'Da confusão para visão clara' },
    { sectionIndex: 2, cardIndex: 3, cardType: 'problem-to-structure', anchorText: 'texto vira planilha', title: 'Você Fala, a I.A. Monta', subtitle: 'Do texto simples à planilha pronta' },
    // Seção 3 - Exemplos reais (3 cards)
    { sectionIndex: 3, cardIndex: 1, cardType: 'finance-example', anchorText: 'finanças pessoais', title: 'Exemplo: Finanças Pessoais', subtitle: 'Do não sei para onde vai ao controle' },
    { sectionIndex: 3, cardIndex: 2, cardType: 'sales-example', anchorText: 'vendas do pequeno negócio', title: 'Exemplo: Vendas', subtitle: 'Visualizando o ritmo de vendas' },
    { sectionIndex: 3, cardIndex: 3, cardType: 'tasks-example', anchorText: 'agenda organizada', title: 'Exemplo: Agenda Organizada', subtitle: 'Tarefas soltas viram painel claro' },
    // Seção 4 - Ferramentas e prática (3 cards)
    { sectionIndex: 4, cardIndex: 1, cardType: 'tool-combo', anchorText: 'chat e planilha', title: 'As Duas Peças Principais', subtitle: 'Chat de I.A. + planilha juntos' },
    { sectionIndex: 4, cardIndex: 2, cardType: 'simulator-call', anchorText: 'simulador guiado', title: 'Simulador Guiado', subtitle: 'Escolha o tipo e monte o pedido' },
    { sectionIndex: 4, cardIndex: 3, cardType: 'you-command', anchorText: 'seu primeiro comando', title: 'Agora é Com Você', subtitle: 'Seu primeiro comando para a planilha nascer' },
    // Seção 5 - Hábitos e visão (3 cards)
    { sectionIndex: 5, cardIndex: 1, cardType: 'habit-builder', anchorText: 'transformando em hábito', title: 'Transformando em Hábito', subtitle: 'Um pequeno ritual para manter tudo em dia' },
    { sectionIndex: 5, cardIndex: 2, cardType: 'pattern-vision', anchorText: 'enxergando padrões', title: 'Enxergando Padrões', subtitle: 'Meses, produtos e dias que contam a história' },
    { sectionIndex: 5, cardIndex: 3, cardType: 'panel-decision', anchorText: 'decidindo com dados', title: 'Decidindo com Seu Painel', subtitle: 'Menos achismo, mais clareza nos números' },
  ],
  'aula-08': [
    // Seção 1 - Explosão de vídeos (3 cards)
    { sectionIndex: 1, cardIndex: 1, cardType: 'video-feed-explosion', anchorText: 'explosão de vídeos', title: 'Explosão no Feed', subtitle: 'Feed transbordando de vídeos virais' },
    { sectionIndex: 1, cardIndex: 2, cardType: 'video-connection', anchorText: 'conexão humana', title: 'Conexão por Vídeo', subtitle: 'Conexão humana através do vídeo' },
    { sectionIndex: 1, cardIndex: 3, cardType: 'blank-screen-block', anchorText: 'tela em branco', title: 'Bloqueio da Tela Branca', subtitle: 'Tela em branco travando criador' },
    // Seção 2 - Estrutura do vídeo (3 cards)
    { sectionIndex: 2, cardIndex: 1, cardType: 'three-video-blocks', anchorText: 'três blocos', title: 'Os 3 Blocos do Vídeo', subtitle: 'Os três blocos essenciais do vídeo' },
    { sectionIndex: 2, cardIndex: 2, cardType: 'hook-power', anchorText: 'gancho poderoso', title: 'Poder do Gancho', subtitle: 'Gancho poderoso nos primeiros segundos' },
    { sectionIndex: 2, cardIndex: 3, cardType: 'call-to-action', anchorText: 'chamada para ação', title: 'Chamada para Ação', subtitle: 'Chamada clara para ação do espectador' },
    // Seção 3 - Criando roteiros (3 cards)
    { sectionIndex: 3, cardIndex: 1, cardType: 'idea-to-script', anchorText: 'ideia ao roteiro', title: 'Da Ideia ao Roteiro', subtitle: 'Transformando ideia em roteiro estruturado' },
    { sectionIndex: 3, cardIndex: 2, cardType: 'three-variations', anchorText: 'três versões', title: 'Três Variações', subtitle: 'Três versões do mesmo conteúdo' },
    { sectionIndex: 3, cardIndex: 3, cardType: 'partnership', anchorText: 'parceira de criação', title: 'Parceria com I.A.', subtitle: 'I.A. como parceira de criação' },
    // Seção 4 - Prática e ferramentas (3 cards)
    { sectionIndex: 4, cardIndex: 1, cardType: 'video-starter', anchorText: 'primeiro vídeo', title: 'Iniciador de Vídeo', subtitle: 'Começando o primeiro vídeo' },
    { sectionIndex: 4, cardIndex: 2, cardType: 'ai-text-engine', anchorText: 'motor de texto', title: 'Motor de Texto com I.A.', subtitle: 'Motor de texto gerando roteiros' },
    { sectionIndex: 4, cardIndex: 3, cardType: 'production-basics', anchorText: 'produção simples', title: 'Produção Básica', subtitle: 'Fundamentos de produção simples' },
    // Seção 5 - Consistência e crescimento (3 cards)
    { sectionIndex: 5, cardIndex: 1, cardType: 'script-guide', anchorText: 'guia de roteiro', title: 'Guia de Roteiro', subtitle: 'Guia passo a passo do roteiro' },
    { sectionIndex: 5, cardIndex: 2, cardType: 'short-blocks', anchorText: 'blocos curtos', title: 'Blocos Curtos', subtitle: 'Blocos curtos e impactantes' },
    { sectionIndex: 5, cardIndex: 3, cardType: 'consistency-wins', anchorText: 'consistência', title: 'Consistência Vence', subtitle: 'Consistência supera perfeição' },
  ],
  'aula-10-plano': [
    // Seção 1 - Ponto de Partida (3 cards)
    { sectionIndex: 1, cardIndex: 1, cardType: 'ia-starting-point', anchorText: 'ponto de partida', title: 'Ponto de Partida I.A.', subtitle: 'Onde você está no mapa da I.A.' },
    { sectionIndex: 1, cardIndex: 2, cardType: 'usage-spectrum', anchorText: 'espectro de uso', title: 'Espectro de Uso', subtitle: 'Diferentes níveis de uso da I.A.' },
    { sectionIndex: 1, cardIndex: 3, cardType: 'self-awareness', anchorText: 'autoconhecimento', title: 'Autoconhecimento', subtitle: 'Entender seu perfil de uso atual' },
    // Seção 2 - Identificando Oportunidades (3 cards)
    { sectionIndex: 2, cardIndex: 1, cardType: 'time-drain', anchorText: 'tarefas que drenam', title: 'Drenagem de Tempo', subtitle: 'Tarefas que roubam seu tempo' },
    { sectionIndex: 2, cardIndex: 2, cardType: 'focus-selection', anchorText: 'escolhendo foco', title: 'Seleção de Foco', subtitle: 'Escolhendo onde focar primeiro' },
    { sectionIndex: 2, cardIndex: 3, cardType: 'impact-forecast', anchorText: 'previsão de impacto', title: 'Previsão de Impacto', subtitle: 'Impacto das mudanças planejadas' },
    // Seção 3 - Estrutura do Plano (3 cards)
    { sectionIndex: 3, cardIndex: 1, cardType: 'weekly-steps', anchorText: 'passos semanais', title: 'Passos Semanais', subtitle: 'Organização semanal do plano' },
    { sectionIndex: 3, cardIndex: 2, cardType: 'iteration-loop', anchorText: 'ciclo de melhoria', title: 'Ciclo de Iteração', subtitle: 'Melhoria contínua a cada semana' },
    { sectionIndex: 3, cardIndex: 3, cardType: 'habit-formation', anchorText: 'formando hábito', title: 'Formação de Hábito', subtitle: 'Transformando ação em hábito' },
    // Seção 4 - Ferramentas e Suporte (3 cards)
    { sectionIndex: 4, cardIndex: 1, cardType: 'plan-builder', anchorText: 'construindo plano', title: 'Construtor de Plano', subtitle: 'Seu plano personalizado' },
    { sectionIndex: 4, cardIndex: 2, cardType: 'ia-coach', anchorText: 'coach pessoal', title: 'Coach I.A.', subtitle: 'I.A. como coach pessoal' },
    { sectionIndex: 4, cardIndex: 3, cardType: 'tool-combination', anchorText: 'combinando ferramentas', title: 'Combinação de Ferramentas', subtitle: 'As ferramentas certas juntas' },
    // Seção 5 - Sustentabilidade (3 cards)
    { sectionIndex: 5, cardIndex: 1, cardType: 'small-steps', anchorText: 'pequenos passos', title: 'Pequenos Passos', subtitle: 'Começando com calma e consistência' },
    { sectionIndex: 5, cardIndex: 2, cardType: 'personal-library', anchorText: 'biblioteca pessoal', title: 'Biblioteca Pessoal', subtitle: 'Seus prompts e templates favoritos' },
    { sectionIndex: 5, cardIndex: 3, cardType: 'safety-boundaries', anchorText: 'limites de segurança', title: 'Limites de Segurança', subtitle: 'Cuidados e limites com I.A.' },
  ],
};

// 🎬 Função para gerar tipos de Card Effects filtrados por aula
const getCardTypesForLesson = (lessonId: string) => {
  const lessonCards = CARD_EFFECTS_BY_LESSON[lessonId] || CARD_EFFECT_TYPES;
  return lessonCards.map(type => ({
    value: type,
    label: CARD_EFFECT_LABELS[type] || type,
    isCinematic: true
  }));
};

// 📝 Tipos de Card com texto (legado)
const TEXT_CARD_TYPES = [
  { value: 'ia-book', label: 'Livro I.A.', isCinematic: false },
  { value: 'ia-chat', label: 'Chat I.A.', isCinematic: false },
  { value: 'comparison', label: 'Comparação', isCinematic: false },
  { value: 'quote', label: 'Citação', isCinematic: false },
];

// 🎨 Esquemas de cores disponíveis
const COLOR_SCHEMES = [
  { value: 'purple', label: 'Roxo', color: '#a855f7' },
  { value: 'blue', label: 'Azul', color: '#3b82f6' },
  { value: 'green', label: 'Verde', color: '#22c55e' },
  { value: 'orange', label: 'Laranja', color: '#f97316' },
  { value: 'pink', label: 'Rosa', color: '#ec4899' },
  { value: 'cyan', label: 'Ciano', color: '#06b6d4' },
  { value: 'gold', label: 'Dourado', color: '#eab308' },
  { value: 'red', label: 'Vermelho', color: '#ef4444' },
];

// 🔣 Ícones disponíveis
const AVAILABLE_ICONS = [
  { value: 'book', label: 'Livro', Icon: Book },
  { value: 'brain', label: 'Cérebro', Icon: Brain },
  { value: 'sparkles', label: 'Brilhos', Icon: Sparkles },
  { value: 'zap', label: 'Raio', Icon: Zap },
  { value: 'star', label: 'Estrela', Icon: Star },
  { value: 'rocket', label: 'Foguete', Icon: Rocket },
  { value: 'target', label: 'Alvo', Icon: Target },
  { value: 'lightbulb', label: 'Lâmpada', Icon: Lightbulb },
  { value: 'trophy', label: 'Troféu', Icon: Trophy },
  { value: 'heart', label: 'Coração', Icon: Heart },
  { value: 'crown', label: 'Coroa', Icon: Crown },
  { value: 'flame', label: 'Chama', Icon: Flame },
];

interface Section {
  id: string;
  markdown?: string;
  visualContent?: string;
}

interface ExperienceCard {
  sectionIndex: number;
  cardIndex: number;
  cardType: string;
  anchorText: string;
  title: string;
  subtitle: string;
  icon?: string;
  colorScheme?: string;
  effectDescription?: string;
  chapters?: string[];
}

interface V5LessonFromDB {
  id: string;
  title: string;
  is_active: boolean;
  content: any;
  created_at: string;
}

// ============================================
// 🎯 COMPONENTE: Aba "Ativar Cards"
// ============================================
interface ActivateCardsTabProps {
  onCardsCreated: (cards: ExperienceCard[]) => void;
  experienceCards: ExperienceCard[];
  isSaving: boolean;
  setIsSaving: (v: boolean) => void;
  generatingProgress: string | null;
  setGeneratingProgress: (v: string | null) => void;
}

function ActivateCardsTab({
  onCardsCreated,
  experienceCards,
  isSaving,
  setIsSaving,
  generatingProgress,
  setGeneratingProgress
}: ActivateCardsTabProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Estados
  const [v5Lessons, setV5Lessons] = useState<V5LessonFromDB[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<V5LessonFromDB | null>(null);
  const [detectedCardTypes, setDetectedCardTypes] = useState<string[]>([]);
  const [createdCards, setCreatedCards] = useState<ExperienceCard[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [cardsCreated, setCardsCreated] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [generatedCode, setGeneratedCode] = useState<{ components: any[]; indexAdditions: any } | null>(null);
  const [showCodeDialog, setShowCodeDialog] = useState(false);

  // Buscar aulas V5 do banco ao montar
  useEffect(() => {
    const fetchV5Lessons = async () => {
      setLoadingLessons(true);
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('id, title, is_active, content, created_at')
          .eq('model', 'v5')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setV5Lessons(data || []);
        console.log('📚 [ACTIVATE-TAB] Aulas V5 carregadas:', data?.length);
      } catch (err: any) {
        console.error('❌ Erro ao buscar aulas V5:', err);
        toast({
          title: "Erro ao carregar aulas",
          description: err.message,
          variant: "destructive"
        });
      } finally {
        setLoadingLessons(false);
      }
    };

    fetchV5Lessons();
  }, [toast]);

  // Quando seleciona uma aula, extrair cardTypes
  useEffect(() => {
    if (!selectedLessonId) {
      setSelectedLesson(null);
      setDetectedCardTypes([]);
      return;
    }

    const lesson = v5Lessons.find(l => l.id === selectedLessonId);
    if (!lesson) return;

    setSelectedLesson(lesson);
    
    // Extrair cardTypes do content.experienceCards
    const content = lesson.content as any;
    let cards: any[] = [];
    
    // Tentar múltiplos locais onde experienceCards podem estar
    if (content?.experienceCards) {
      cards = content.experienceCards;
    } else if (content?.sections) {
      // Pode estar dentro das seções
      content.sections.forEach((s: any) => {
        if (s.experienceCards) cards.push(...s.experienceCards);
      });
    }

    const types = cards.map((c: any) => c.type || c.cardType).filter(Boolean);
    setDetectedCardTypes(types);
    
    console.log('📊 [ACTIVATE-TAB] Aula selecionada:', {
      title: lesson.title,
      cardsCount: types.length,
      cardTypes: types
    });
  }, [selectedLessonId, v5Lessons]);

  // Criar componentes React para os cardTypes
  const handleCreateCardEffects = async () => {
    if (!selectedLesson || detectedCardTypes.length === 0) {
      toast({
        title: "Nenhum card para criar",
        description: "Selecione uma aula com experienceCards primeiro.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      // Verificar quais cardTypes já existem vs faltam
      const missing = detectedCardTypes.filter(t => !isValidCardEffectType(t));
      
      // Extrair cards do content
      const content = selectedLesson.content as any;
      let cards: any[] = content?.experienceCards || [];
      
      if (cards.length === 0 && content?.sections) {
        content.sections.forEach((s: any) => {
          if (s.experienceCards) cards.push(...s.experienceCards);
        });
      }

      // Se há componentes faltando, gerar código para eles
      if (missing.length > 0) {
        const cardsToGenerate = cards
          .filter((c: any) => missing.includes(c.type || c.cardType))
          .map((c: any) => ({
            cardType: c.type || c.cardType,
            title: c.title || c.props?.title || '',
            subtitle: c.subtitle || c.props?.subtitle || '',
            sectionIndex: c.sectionIndex || 1,
            cardIndex: c.cardIndex || 1
          }));

        // Chamar edge function para gerar código
        const { data, error } = await supabase.functions.invoke('generate-card-effects-v2', {
          body: {
            cards: cardsToGenerate,
            lessonTitle: selectedLesson.title
          }
        });

        if (error) throw error;

        if (data.success) {
          setGeneratedCode({
            components: data.components,
            indexAdditions: data.indexAdditions
          });
          setShowCodeDialog(true);
          
          toast({
            title: "🎨 Código gerado!",
            description: `${data.generatedCount} componentes prontos. Copie o código e cole no chat para eu criar.`,
          });
        } else {
          throw new Error(data.error || 'Erro ao gerar código');
        }
        
        setIsCreating(false);
        return;
      }

      // Todos os componentes existem - carregar os cards
      const formattedCards: ExperienceCard[] = cards.map((card: any, idx: number) => ({
        sectionIndex: card.sectionIndex || 1,
        cardIndex: card.cardIndex || idx + 1,
        cardType: card.type || card.cardType,
        anchorText: card.anchorText || '',
        title: card.title || card.props?.title || '',
        subtitle: card.subtitle || card.props?.subtitle || '',
        icon: card.icon || card.props?.icon,
        colorScheme: card.colorScheme || card.props?.colorScheme,
        effectDescription: card.effectDescription,
        chapters: card.chapters || card.props?.chapters || []
      }));

      setCreatedCards(formattedCards);
      onCardsCreated(formattedCards);
      setCardsCreated(true);

      toast({
        title: "✅ Cards carregados!",
        description: `${formattedCards.length} cards prontos para ativar.`,
      });

    } catch (err: any) {
      console.error('❌ Erro ao criar cards:', err);
      toast({
        title: "Erro ao criar cards",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Ativar a aula
  const handleActivateLesson = async () => {
    if (!selectedLesson) return;

    setIsSaving(true);
    setGeneratingProgress("Ativando aula...");

    try {
      const { error } = await supabase
        .from('lessons')
        .update({ is_active: true })
        .eq('id', selectedLesson.id);

      if (error) throw error;

      toast({
        title: "🎉 Aula Ativada!",
        description: `"${selectedLesson.title}" está disponível para os usuários!`,
      });

      // Reset
      setCardsCreated(false);
      setCreatedCards([]);
      setSelectedLessonId('');
      setSelectedLesson(null);
      onCardsCreated([]);

      // Atualizar lista
      const updatedLessons = v5Lessons.map(l => 
        l.id === selectedLesson.id ? { ...l, is_active: true } : l
      );
      setV5Lessons(updatedLessons);

    } catch (err: any) {
      console.error('❌ Erro ao ativar:', err);
      toast({
        title: "Erro ao ativar",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
      setGeneratingProgress(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-green-600" />
          Ativar Experience Cards
        </CardTitle>
        <CardDescription>
          Selecione uma aula V5 que já passou pelo pipeline e ative os cards.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seleção de Aula */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">1</span>
            Selecione a Aula V5
          </Label>

          {loadingLessons ? (
            <div className="p-4 border rounded-lg bg-muted/30 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"
              />
              <p className="text-sm text-muted-foreground">Carregando aulas V5...</p>
            </div>
          ) : v5Lessons.length === 0 ? (
            <div className="p-4 border border-amber-300 rounded-lg bg-amber-50">
              <p className="text-sm text-amber-800">
                ⚠️ Nenhuma aula V5 encontrada no banco. Envie uma aula pelo pipeline primeiro na aba "Colar JSON".
              </p>
            </div>
          ) : (
            <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma aula V5..." />
              </SelectTrigger>
              <SelectContent>
                {v5Lessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    <span className="flex items-center gap-2">
                      {lesson.is_active ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                      )}
                      {lesson.title}
                      {lesson.is_active && (
                        <Badge variant="outline" className="text-xs ml-2">Ativa</Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Info da Aula Selecionada */}
        {selectedLesson && (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-900">{selectedLesson.title}</span>
                {selectedLesson.is_active && (
                  <Badge className="bg-green-500">Ativa</Badge>
                )}
              </div>
              <div className="flex gap-4 text-sm text-purple-700">
                <span>🎬 {detectedCardTypes.length} cards detectados</span>
              </div>
            </div>

            {/* Lista de CardTypes */}
            {detectedCardTypes.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 border-b">
                  <h4 className="font-medium text-slate-800">CardTypes nesta aula:</h4>
                </div>
                <div className="p-3 flex flex-wrap gap-2">
                  {detectedCardTypes.map((type, idx) => (
                    <Badge 
                      key={idx} 
                      variant={isValidCardEffectType(type) ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {isValidCardEffectType(type) ? '✅' : '❌'} {type}
                    </Badge>
                  ))}
                </div>
                
                {/* Resumo de status */}
                {(() => {
                  const missing = detectedCardTypes.filter(t => !isValidCardEffectType(t));
                  if (missing.length > 0) {
                    return (
                      <div className="p-3 bg-amber-50 border-t border-amber-200">
                        <p className="text-sm text-amber-800">
                          ⚠️ <strong>{missing.length} componente(s) a serem criados:</strong>
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Clique no botão abaixo para gerar o código dos componentes.
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div className="p-3 bg-green-50 border-t border-green-200">
                      <p className="text-sm text-green-800">
                        ✅ Todos os componentes existem! Pronto para ativar cards.
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Botão Criar Cards - SEMPRE HABILITADO se há cardTypes */}
            <Button
              onClick={handleCreateCardEffects}
              disabled={isCreating || detectedCardTypes.length === 0}
              className={`w-full ${
                detectedCardTypes.some(t => !isValidCardEffectType(t))
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
              }`}
              size="lg"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {isCreating 
                ? 'Gerando código...' 
                : detectedCardTypes.some(t => !isValidCardEffectType(t))
                  ? `🔨 Criar ${detectedCardTypes.filter(t => !isValidCardEffectType(t)).length} Componentes`
                  : `✅ Carregar ${detectedCardTypes.length} Cards`
              }
            </Button>
          </div>
        )}

        {/* Lista de Cards Criados */}
        {createdCards.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <h4 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Cards Criados ({createdCards.length})
            </h4>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {createdCards
                .sort((a, b) => a.sectionIndex - b.sectionIndex || a.cardIndex - b.cardIndex)
                .map((card, idx) => (
                <div 
                  key={idx}
                  className="p-3 border rounded-lg bg-green-50/50 hover:bg-green-50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">S{card.sectionIndex}</Badge>
                    <Badge variant="secondary">C{card.cardIndex}</Badge>
                    <Badge className="bg-green-600">{card.cardType}</Badge>
                  </div>
                  <p className="text-sm font-medium">{card.title || '(sem título)'}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    AnchorText: "{card.anchorText}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botão Ativar Aula (verde, desabilitado até criar cards) */}
        <Button
          onClick={handleActivateLesson}
          disabled={!cardsCreated || isSaving || selectedLesson?.is_active}
          className={`w-full ${
            cardsCreated && !selectedLesson?.is_active
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
          size="lg"
        >
          <Rocket className="w-4 h-4 mr-2" />
          {generatingProgress 
            ? generatingProgress 
            : selectedLesson?.is_active 
              ? 'Aula já está ativa' 
              : cardsCreated 
                ? `Ativar "${selectedLesson?.title || 'Aula'}"` 
                : 'Crie os cards primeiro'
          }
        </Button>

        {/* Dialog para mostrar código gerado */}
        <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-600" />
                Código Gerado - {generatedCode?.components?.length || 0} Componentes
              </DialogTitle>
              <DialogDescription>
                Copie o código abaixo e cole no chat para que eu crie os componentes React.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
              {/* Lista de componentes */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Componentes a criar:</h4>
                <div className="flex flex-wrap gap-2">
                  {generatedCode?.components?.map((comp: any, idx: number) => (
                    <Badge key={idx} className="bg-purple-100 text-purple-800">
                      {comp.componentName}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Instruções */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800 font-medium mb-2">📋 Instruções:</p>
                <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                  <li>Clique em "Copiar Instrução" abaixo</li>
                  <li>Cole no chat do Lovable</li>
                  <li>Aguarde a criação dos componentes</li>
                  <li>Volte aqui e clique novamente em "Carregar Cards"</li>
                </ol>
              </div>

              {/* Instrução para copiar */}
              <div className="space-y-2">
                <Label>Instrução para o Lovable:</Label>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-green-400 max-h-40 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">
{`Crie os seguintes ${generatedCode?.components?.length || 0} componentes React para a Aula selecionada:

${generatedCode?.components?.map((comp: any) => `- ${comp.componentName} (${comp.cardType})`).join('\n')}

Cada componente deve:
- Seguir padrão visual V5 (min-h-[480px] h-[60vh] max-h-[600px])
- Ter 5 cenas com animações 3s cada (~15s total)
- Loop 2x antes de parar
- Progress indicator inline com mt-4
- Aceitar props: isActive e duration

Após criar, atualize o index.tsx para registrá-los.`}
                  </pre>
                </div>
                <Button
                  onClick={() => {
                    const instruction = `Crie os seguintes ${generatedCode?.components?.length || 0} componentes React para a Aula selecionada:

${generatedCode?.components?.map((comp: any) => `- ${comp.componentName} (${comp.cardType})`).join('\n')}

Cada componente deve:
- Seguir padrão visual V5 (min-h-[480px] h-[60vh] max-h-[600px])
- Ter 5 cenas com animações 3s cada (~15s total)
- Loop 2x antes de parar
- Progress indicator inline com mt-4
- Aceitar props: isActive e duration

Após criar, atualize o index.tsx para registrá-los.`;
                    navigator.clipboard.writeText(instruction);
                    toast({
                      title: "📋 Copiado!",
                      description: "Cole no chat para criar os componentes.",
                    });
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Copiar Instrução
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCodeDialog(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default function AdminV5CardConfig() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [lessonJson, setLessonJson] = useState('');
  const [parsedLesson, setParsedLesson] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [experienceCards, setExperienceCards] = useState<ExperienceCard[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState<string | null>(null);
  
  // Auto-save recovery
  useEffect(() => {
    const saved = localStorage.getItem('v5-card-config-autosave');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.lessonJson && data.timestamp && Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          toast({
            title: "💾 Progresso recuperado",
            description: "Trabalho anterior restaurado automaticamente.",
          });
          setLessonJson(data.lessonJson);
          if (data.parsedLesson) setParsedLesson(data.parsedLesson);
          if (data.sections) setSections(data.sections);
          if (data.experienceCards) setExperienceCards(data.experienceCards);
        }
      } catch (e) {
        console.error('Erro ao recuperar auto-save:', e);
      }
    }
  }, [toast]);

  // Auto-save on changes
  useEffect(() => {
    if (lessonJson || experienceCards.length > 0) {
      localStorage.setItem('v5-card-config-autosave', JSON.stringify({
        lessonJson,
        parsedLesson,
        sections,
        experienceCards,
        timestamp: Date.now()
      }));
    }
  }, [lessonJson, parsedLesson, sections, experienceCards]);
  
  // Novos estados para o fluxo correto
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);
  const [cardsQuantity, setCardsQuantity] = useState<1 | 2 | 3>(1);
  const [selectedLesson, setSelectedLesson] = useState<string>('aula-1');

  // Card types filtrados pela aula selecionada
  const cinematographicCardTypes = getCardTypesForLesson(selectedLesson);
  // LocalStorage keys
  const CARD1_STORAGE_KEY = 'v5-card-config-card1';
  const CARD2_STORAGE_KEY = 'v5-card-config-card2';
  const CARD3_STORAGE_KEY = 'v5-card-config-card3';

  // Inicializar com dados salvos ou valores padrão
  const [card1, setCard1] = useState<Partial<ExperienceCard>>(() => {
    const saved = localStorage.getItem(CARD1_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          cardType: '',
          anchorText: '',
          title: '',
          subtitle: '',
          icon: '',
          colorScheme: '',
          effectDescription: '',
          chapters: []
        };
      }
    }
    return {
      cardType: '',
      anchorText: '',
      title: '',
      subtitle: '',
      icon: '',
      colorScheme: '',
      effectDescription: '',
      chapters: []
    };
  });

  const [card2, setCard2] = useState<Partial<ExperienceCard>>(() => {
    const saved = localStorage.getItem(CARD2_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          cardType: '',
          anchorText: '',
          title: '',
          subtitle: '',
          icon: '',
          colorScheme: '',
          effectDescription: '',
          chapters: []
        };
      }
    }
    return {
      cardType: '',
      anchorText: '',
      title: '',
      subtitle: '',
      icon: '',
      colorScheme: '',
      effectDescription: '',
      chapters: []
    };
  });

  const [card3, setCard3] = useState<Partial<ExperienceCard>>(() => {
    const saved = localStorage.getItem(CARD3_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          cardType: '',
          anchorText: '',
          title: '',
          subtitle: '',
          icon: '',
          colorScheme: '',
          effectDescription: '',
          chapters: []
        };
      }
    }
    return {
      cardType: '',
      anchorText: '',
      title: '',
      subtitle: '',
      icon: '',
      colorScheme: '',
      effectDescription: '',
      chapters: []
    };
  });

  // Auto-save card1 no localStorage
  useEffect(() => {
    localStorage.setItem(CARD1_STORAGE_KEY, JSON.stringify(card1));
  }, [card1]);

  // Auto-save card2 no localStorage
  useEffect(() => {
    localStorage.setItem(CARD2_STORAGE_KEY, JSON.stringify(card2));
  }, [card2]);

  // Auto-save card3 no localStorage
  useEffect(() => {
    localStorage.setItem(CARD3_STORAGE_KEY, JSON.stringify(card3));
  }, [card3]);

  // Estado do preview modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewCards, setPreviewCards] = useState<ExperienceCard[]>([]);

  // Estado para cards detectados do JSON
  const [detectedCards, setDetectedCards] = useState<ExperienceCard[]>([]);
  const [sendingToPipeline, setSendingToPipeline] = useState(false);

  // 🛠️ Helper para mostrar erro de sintaxe JSON com contexto visual
  const formatJsonSyntaxError = (error: Error, jsonString: string): string => {
    const errorMsg = error.message;

    // Extrair posição do erro (funciona para vários formatos de erro)
    const positionMatch = errorMsg.match(/at position (\d+)/);
    const lineColMatch = errorMsg.match(/line (\d+) column (\d+)/);

    if (!positionMatch && !lineColMatch) {
      return errorMsg; // Retorna mensagem original se não conseguir extrair posição
    }

    const lines = jsonString.split('\n');
    let errorLine = 0;
    let errorCol = 0;

    if (lineColMatch) {
      errorLine = parseInt(lineColMatch[1]) - 1; // Line numbers são 1-indexed
      errorCol = parseInt(lineColMatch[2]) - 1; // Column numbers são 1-indexed
    } else if (positionMatch) {
      // Calcular linha e coluna a partir da posição
      const position = parseInt(positionMatch[1]);
      let currentPos = 0;

      for (let i = 0; i < lines.length; i++) {
        const lineLength = lines[i].length + 1; // +1 para o \n
        if (currentPos + lineLength > position) {
          errorLine = i;
          errorCol = position - currentPos;
          break;
        }
        currentPos += lineLength;
      }
    }

    // Montar mensagem com contexto
    const contextLines: string[] = [];
    contextLines.push('🔴 ERRO DE SINTAXE JSON:');
    contextLines.push(errorMsg);
    contextLines.push('');
    contextLines.push('📍 Localização do erro:');

    // Mostrar 2 linhas antes e depois do erro
    const startLine = Math.max(0, errorLine - 2);
    const endLine = Math.min(lines.length - 1, errorLine + 2);

    for (let i = startLine; i <= endLine; i++) {
      const lineNum = (i + 1).toString().padStart(4, ' ');
      const line = lines[i];

      if (i === errorLine) {
        contextLines.push(`${lineNum} ❌ ${line}`);
        // Adicionar seta apontando para o caractere problemático
        const pointer = ' '.repeat(7 + errorCol) + '^ AQUI';
        contextLines.push(pointer);
      } else {
        contextLines.push(`${lineNum}    ${line}`);
      }
    }

    contextLines.push('');
    contextLines.push('💡 Dicas:');
    contextLines.push('• Verifique se há vírgulas faltando ou extras');
    contextLines.push('• Verifique se todas as chaves e colchetes estão fechados');
    contextLines.push('• Verifique se strings estão entre aspas duplas');
    contextLines.push('• JSON não aceita comentários');

    return contextLines.join('\n');
  };

  const handleAnalyzeJson = () => {
    try {
      let parsed = JSON.parse(lessonJson);

      if (Array.isArray(parsed)) {
        if (parsed.length === 0) {
          throw new Error('Array JSON está vazio');
        }
        parsed = parsed[0];
      }

      if (!parsed.title) {
        throw new Error('JSON precisa ter campo "title"');
      }

      const sections = parsed.sections || parsed.content?.sections;

      if (!sections || !Array.isArray(sections)) {
        throw new Error('JSON precisa ter "sections" ou "content.sections" como array');
      }

      // 🎯 VALIDAÇÕES ROBUSTAS PARA MODELO V5
      const errors: string[] = [];
      const warnings: string[] = [];

      // 🔍 Detectar experienceCards do JSON (suporta ambos formatos)
      let rawCards = parsed.experienceCards || [];

      // 🆕 Se não encontrou experienceCards, extrair dos comentários HTML do markdown
      if (rawCards.length === 0) {
        const extractedCards: any[] = [];

        sections.forEach((section: any, sectionIdx: number) => {
          const markdown = section.markdown || section.visualContent || section.content || '';

          // Regex para capturar <!-- archortext: TEXTO --> ou <!-- anchortext: TEXTO -->
          const anchorRegex = /<!--\s*a[rn]chortext:\s*(.+?)\s*-->/gi;
          let match;
          let cardIndex = 1;

          while ((match = anchorRegex.exec(markdown)) !== null) {
            const anchorText = match[1].trim();
            extractedCards.push({
              sectionIndex: sectionIdx + 1,
              cardIndex: cardIndex++,
              type: `card-section${sectionIdx + 1}-${cardIndex}`, // Placeholder type
              cardType: `card-section${sectionIdx + 1}-${cardIndex}`,
              anchorText: anchorText,
              title: anchorText.substring(0, 30) + (anchorText.length > 30 ? '...' : ''),
              subtitle: `Seção ${sectionIdx + 1}`,
            });
          }
        });

        rawCards = extractedCards;

        if (extractedCards.length > 0) {
          console.log('📍 [V5-CONFIG] AnchorTexts extraídos do markdown:', extractedCards.length);
        }
      }

      // ✅ VALIDAÇÃO 1: Campo 'type' obrigatório em TODOS os experienceCards
      rawCards.forEach((card: any, idx: number) => {
        const cardNumber = idx + 1;

        // Verifica se tem 'type' (não aceita apenas 'cardType')
        if (!card.type) {
          if (card.cardType) {
            errors.push(`❌ ERRO CRÍTICO: Card ${cardNumber} tem 'cardType' mas NÃO tem 'type' (obrigatório). Use 'type' ao invés de 'cardType'.`);
          } else {
            errors.push(`❌ ERRO CRÍTICO: Card ${cardNumber} está SEM o campo 'type' (obrigatório).`);
          }
        }

        // ✅ VALIDAÇÃO 2: visualScript deve ser STRING, não objeto
        if (card.visualScript !== undefined) {
          if (typeof card.visualScript === 'object') {
            errors.push(`❌ ERRO CRÍTICO: Card ${cardNumber} (${card.type || card.cardType || 'sem tipo'}) tem 'visualScript' como OBJETO. Deve ser STRING.`);
          } else if (typeof card.visualScript !== 'string') {
            errors.push(`❌ ERRO: Card ${cardNumber} tem 'visualScript' com tipo inválido (${typeof card.visualScript}). Deve ser string.`);
          }
        }

        // Validação de anchorText presente
        if (!card.anchorText || card.anchorText.trim() === '') {
          warnings.push(`⚠️ AVISO: Card ${cardNumber} (${card.type || card.cardType || 'sem tipo'}) não tem 'anchorText'.`);
        }

        // Validação de title
        if (!card.title && !card.props?.title) {
          warnings.push(`⚠️ AVISO: Card ${cardNumber} (${card.type || card.cardType || 'sem tipo'}) não tem 'title'.`);
        }
      });

      // ✅ VALIDAÇÃO 3: playgroundConfig deve estar DENTRO de uma section, não no nível raiz
      if (parsed.playgroundConfig && !parsed.content?.playgroundConfig) {
        errors.push(`❌ ERRO IMPORTANTE: 'playgroundConfig' está no nível RAIZ do JSON. Deve estar DENTRO de uma section (junto com showPlaygroundCall: true).`);
      }

      // ✅ VALIDAÇÃO 4: Verificar se sections com playgroundConfig têm showPlaygroundCall
      sections.forEach((section: any, idx: number) => {
        if (section.playgroundConfig && !section.showPlaygroundCall) {
          warnings.push(`⚠️ AVISO: Section ${idx + 1} tem 'playgroundConfig' mas falta 'showPlaygroundCall: true'.`);
        }
      });

      // 🚨 Se houver ERROS CRÍTICOS, mostrar e parar
      if (errors.length > 0) {
        const errorMessage = errors.join('\n\n');
        console.error('❌ [V5-CONFIG] Erros de validação:', errors);

        toast({
          title: "❌ JSON com ERROS!",
          description: `Encontrados ${errors.length} erro(s) crítico(s). Veja o console para detalhes.`,
          variant: "destructive",
        });

        // Mostrar erros no console de forma destacada
        console.group('🔴 ERROS DE VALIDAÇÃO V5');
        errors.forEach(err => console.error(err));
        console.groupEnd();

        throw new Error(errorMessage);
      }

      // ⚠️ Se houver AVISOS, mostrar mas continuar
      if (warnings.length > 0) {
        console.group('⚠️ AVISOS DE VALIDAÇÃO V5');
        warnings.forEach(warn => console.warn(warn));
        console.groupEnd();
      }

      // Normalizar cards para ter sempre 'type' e outros campos consistentes
      const jsonCards = rawCards.map((card: any) => ({
        ...card,
        type: card.type || card.cardType,
        cardType: card.cardType || card.type,
        title: card.title || card.props?.title || '',
        subtitle: card.subtitle || card.props?.subtitle || '',
      }));

      setParsedLesson(parsed);
      setSections(sections);
      setDetectedCards(jsonCards);

      // Se tem cards no JSON, preencher experienceCards automaticamente
      if (jsonCards.length > 0) {
        setExperienceCards(jsonCards);
      }

      const successMessage = warnings.length > 0
        ? `${sections.length} seções + ${jsonCards.length} cards (${warnings.length} avisos - veja console)`
        : jsonCards.length > 0
          ? `${sections.length} seções + ${jsonCards.length} cards detectados!`
          : `${sections.length} seções detectadas. Nenhum card encontrado.`;

      toast({
        title: warnings.length > 0 ? "⚠️ JSON analisado com avisos" : "✅ JSON analisado!",
        description: successMessage,
        variant: warnings.length > 0 ? "default" : "default",
      });

      console.log('📊 [V5-CONFIG] JSON analisado:', {
        title: parsed.title,
        sectionsCount: sections.length,
        model: parsed.model,
        experienceCardsCount: jsonCards.length,
        errors: errors.length,
        warnings: warnings.length,
      });

    } catch (error: any) {
      // 🆕 Detectar se é erro de sintaxe JSON e formatar com contexto
      const isSyntaxError = error instanceof SyntaxError ||
                            error.message?.includes('JSON') ||
                            error.message?.includes('position') ||
                            error.message?.includes('Unexpected token');

      if (isSyntaxError && lessonJson) {
        const formattedError = formatJsonSyntaxError(error, lessonJson);
        console.error('❌ [V5-CONFIG] Erro de sintaxe JSON:\n' + formattedError);

        toast({
          title: "Erro de Sintaxe no JSON",
          description: "Verifique o console (F12) para ver exatamente onde está o erro.",
          variant: "destructive",
        });
      } else {
        console.error('❌ [V5-CONFIG] Erro ao analisar JSON:', error);
        toast({
          title: "Erro ao analisar JSON",
          description: error.message || "JSON inválido. Verifique a sintaxe.",
          variant: "destructive",
        });
      }
    }
  };

  // 🚀 NOVO: Enviar direto para pipeline (sem passar pela aba manual)
  const handleSendToPipeline = async () => {
    if (!parsedLesson) {
      toast({
        title: "JSON não analisado",
        description: "Cole o JSON e clique em 'Analisar JSON' primeiro.",
        variant: "destructive",
      });
      return;
    }

    if (detectedCards.length === 0) {
      toast({
        title: "Nenhum card no JSON",
        description: "O JSON não contém experienceCards. Use a aba 'Configurar Cards' para adicionar manualmente.",
        variant: "destructive",
      });
      return;
    }

    setSendingToPipeline(true);

    try {
      // Buscar próximo order_index
      const { data: existingLessons } = await supabase
        .from('lessons')
        .select('order_index')
        .eq('trail_id', parsedLesson.trackId)
        .order('order_index', { ascending: false })
        .limit(1);

      const nextOrderIndex = existingLessons && existingLessons.length > 0
        ? existingLessons[0].order_index + 1
        : parsedLesson.orderIndex || 1;

      // Normalizar seções
      const rawSections = parsedLesson.sections || parsedLesson.content?.sections || [];
      const normalizedSections = rawSections.map((section: any, index: number) => ({
        id: section.id || `section-${index + 1}`,
        visualContent: section.visualContent || section.markdown || section.content || '',
        ...(section.title && { title: section.title }),
        ...(section.speechBubbleText || section.speechBubble
          ? { speechBubbleText: section.speechBubbleText || section.speechBubble }
          : {}),
        ...(section.showPlaygroundCall !== undefined && { showPlaygroundCall: section.showPlaygroundCall }),
        ...(section.playgroundConfig && { playgroundConfig: section.playgroundConfig })
      }));

      // Formatar cards para o pipeline
      // CRÍTICO: Garantir que cada card tenha 'type' (não 'cardType')
      const formattedCards = detectedCards.map((card: any) => ({
        type: card.type || card.cardType, // Suporta ambos os formatos
        sectionIndex: card.sectionIndex,
        anchorText: card.anchorText,
        props: {
          title: card.title || card.props?.title || '',
          subtitle: card.subtitle || card.props?.subtitle || '',
          icon: card.icon || card.props?.icon || 'sparkles',
          colorScheme: card.colorScheme || card.props?.colorScheme || 'purple',
          chapters: card.chapters || card.props?.chapters || [],
          effectDescription: card.effectDescription || card.props?.effectDescription,
        }
      }));

      const pipelineInput = {
        title: parsedLesson.title,
        trackId: parsedLesson.trackId,
        trackName: parsedLesson.trackName || "Trilha Desconhecida",
        orderIndex: nextOrderIndex,
        model: 'v5',
        estimatedTime: parsedLesson.estimatedTimeMinutes || 5,
        sections: normalizedSections,
        exercises: parsedLesson.exercises || [],
        experienceCards: formattedCards,
      };

      const { data, error } = await supabase
        .from('pipeline_executions')
        .insert({
          lesson_title: parsedLesson.title,
          model: 'v5',
          track_id: parsedLesson.trackId,
          track_name: parsedLesson.trackName || "Trilha Desconhecida",
          order_index: nextOrderIndex,
          status: 'pending',
          input_data: pipelineInput,
          current_step: 1,
          total_steps: 8
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "🚀 Enviado para Pipeline!",
        description: `"${parsedLesson.title}" com ${detectedCards.length} cards. Redirecionando...`,
      });

      // Limpar estado
      localStorage.removeItem('v5-card-config-autosave');
      setLessonJson('');
      setParsedLesson(null);
      setSections([]);
      setExperienceCards([]);
      setDetectedCards([]);

      // Redirecionar para monitor
      setTimeout(() => navigate('/admin/pipeline/monitor'), 1500);

    } catch (error: any) {
      console.error('❌ [V5-CONFIG] Erro ao enviar:', error);
      toast({
        title: "Erro ao enviar",
        description: error.message || "Não foi possível enviar para o pipeline.",
        variant: "destructive",
      });
    } finally {
      setSendingToPipeline(false);
    }
  };

  const handleAddCardsToSection = () => {
    if (selectedSectionIndex === null) {
      toast({
        title: "❌ Erro",
        description: "Selecione uma seção primeiro",
        variant: "destructive",
      });
      return;
    }

    const newCards: ExperienceCard[] = [];

    // Validar e adicionar Card 1
    if (!card1.cardType || !card1.anchorText) {
      toast({
        title: "❌ Erro no Card 1",
        description: "CardType e AnchorText são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    newCards.push({
      sectionIndex: selectedSectionIndex,
      cardIndex: 1,
      cardType: card1.cardType!,
      anchorText: card1.anchorText!,
      title: card1.title!,
      subtitle: card1.subtitle || '',
      icon: card1.icon,
      colorScheme: card1.colorScheme,
      effectDescription: card1.effectDescription,
      chapters: card1.chapters || []
    });

    // Se quantidade for 2 ou 3, validar e adicionar Card 2
    if (cardsQuantity >= 2) {
      if (!card2.cardType || !card2.anchorText) {
        toast({
          title: "❌ Erro no Card 2",
          description: "CardType e AnchorText são obrigatórios para o Card 2",
          variant: "destructive",
        });
        return;
      }

      newCards.push({
        sectionIndex: selectedSectionIndex,
        cardIndex: 2,
        cardType: card2.cardType!,
        anchorText: card2.anchorText!,
        title: card2.title!,
        subtitle: card2.subtitle || '',
        icon: card2.icon,
        colorScheme: card2.colorScheme,
        effectDescription: card2.effectDescription,
        chapters: card2.chapters || []
      });
    }

    // Se quantidade for 3, validar e adicionar Card 3
    if (cardsQuantity === 3) {
      if (!card3.cardType || !card3.anchorText) {
        toast({
          title: "❌ Erro no Card 3",
          description: "CardType e AnchorText são obrigatórios para o Card 3",
          variant: "destructive",
        });
        return;
      }

      newCards.push({
        sectionIndex: selectedSectionIndex,
        cardIndex: 3,
        cardType: card3.cardType!,
        anchorText: card3.anchorText!,
        title: card3.title!,
        subtitle: card3.subtitle || '',
        icon: card3.icon,
        colorScheme: card3.colorScheme,
        effectDescription: card3.effectDescription,
        chapters: card3.chapters || []
      });
    }

    // Abrir modal de preview ao invés de adicionar direto
    setPreviewCards(newCards);
    setShowPreviewModal(true);
  };

  const handleConfirmCards = () => {
    // Remover cards antigos dessa seção e adicionar os novos
    const filteredCards = experienceCards.filter(c => c.sectionIndex !== selectedSectionIndex);
    setExperienceCards([...filteredCards, ...previewCards]);

    toast({
      title: "✅ Cards adicionados!",
      description: `${previewCards.length} card(s) configurado(s) para Seção ${selectedSectionIndex}`,
    });

    // Resetar formulário E limpar localStorage
    const emptyCard = {
      cardType: '',
      anchorText: '',
      title: '',
      subtitle: '',
      icon: '',
      colorScheme: '',
      effectDescription: '',
      chapters: []
    };
    
    setCard1(emptyCard);
    setCard2(emptyCard);
    setCard3(emptyCard);
    localStorage.removeItem(CARD1_STORAGE_KEY);
    localStorage.removeItem(CARD2_STORAGE_KEY);
    localStorage.removeItem(CARD3_STORAGE_KEY);

    // Fechar modal
    setShowPreviewModal(false);
    setPreviewCards([]);
  };

  const handleCancelPreview = () => {
    setShowPreviewModal(false);
    setPreviewCards([]);
  };

  const handleClearCards = () => {
    const emptyCard = {
      cardType: '',
      anchorText: '',
      title: '',
      subtitle: '',
      icon: '',
      colorScheme: '',
      effectDescription: '',
      chapters: []
    };

    setCard1(emptyCard);
    setCard2(emptyCard);
    setCard3(emptyCard);
    localStorage.removeItem(CARD1_STORAGE_KEY);
    localStorage.removeItem(CARD2_STORAGE_KEY);
    localStorage.removeItem(CARD3_STORAGE_KEY);

    toast({
      title: "🧹 Formulário limpo",
      description: "Dados dos cards foram apagados",
    });
  };

  const handleRemoveCard = (sectionIndex: number, cardIndex: number) => {
    const filtered = experienceCards.filter(
      c => !(c.sectionIndex === sectionIndex && c.cardIndex === cardIndex)
    );
    setExperienceCards(filtered);
    toast({
      title: "🗑️ Card removido",
      description: `Card ${cardIndex} da Seção ${sectionIndex} foi removido`,
    });
  };

  // 🆕 NOVO: handleActivateLesson - Apenas ATIVA a aula que já passou pelo pipeline
  const handleActivateLesson = async () => {
    if (experienceCards.length === 0) {
      toast({
        title: "Nenhum card carregado",
        description: "Carregue os templates da aula primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    setGeneratingProgress("Buscando aula V5 no banco...");

    try {
      // PASSO 1: Buscar a aula V5 mais recente que ainda não está ativa
      const { data: lesson, error: fetchError } = await supabase
        .from('lessons')
        .select('id, title, is_active, content')
        .eq('model', 'v5')
        .eq('is_active', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !lesson) {
        // Tentar buscar qualquer aula V5 mais recente
        const { data: anyLesson, error: anyError } = await supabase
          .from('lessons')
          .select('id, title, is_active, content')
          .eq('model', 'v5')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (anyError || !anyLesson) {
          throw new Error('Nenhuma aula V5 encontrada. Envie para o pipeline primeiro na aba "Colar JSON".');
        }

        if (anyLesson.is_active) {
          toast({
            title: "✅ Aula já está ativa!",
            description: `"${anyLesson.title}" já está ativa e disponível para os usuários.`,
          });
          setIsSaving(false);
          setGeneratingProgress(null);
          return;
        }
      }

      const targetLesson = lesson;
      console.log('📚 [V5-ACTIVATE] Aula encontrada:', targetLesson.title);

      // PASSO 2: Verificar se todos os cardTypes têm componentes
      const lessonContent = targetLesson.content as any;
      const lessonCards = lessonContent?.sections?.flatMap((s: any) => s.experienceCards || []) || [];
      
      const missingComponents = lessonCards
        .map((c: any) => c.type)
        .filter((t: string) => !isValidCardEffectType(t));

      if (missingComponents.length > 0) {
        const uniqueMissing = [...new Set(missingComponents)];
        throw new Error(`Componentes faltando: ${uniqueMissing.join(', ')}. Peça para criar esses componentes primeiro.`);
      }

      setGeneratingProgress("Ativando aula...");

      // PASSO 3: Ativar a aula (is_active = true)
      const { error: updateError } = await supabase
        .from('lessons')
        .update({ is_active: true })
        .eq('id', targetLesson.id);

      if (updateError) throw updateError;

      setGeneratingProgress(null);

      toast({
        title: "🎉 Aula Ativada!",
        description: `"${targetLesson.title}" com ${lessonCards.length} Experience Cards está disponível!`,
      });

      console.log('✅ [V5-ACTIVATE] Aula ativada:', targetLesson.id);

      // Limpar estado
      setExperienceCards([]);

    } catch (error: any) {
      console.error('❌ [V5-ACTIVATE] Erro:', error);
      setGeneratingProgress(null);

      toast({
        title: "Erro ao ativar",
        description: error.message || "Não foi possível ativar a aula.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/manual')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Wand2 className="w-8 h-8 text-purple-600" />
                Criar Lição V5 com Experience Cards
              </h1>
              <p className="text-muted-foreground">
                Cole o JSON, configure cards ancorados no texto, e crie a lição
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const data = {
                  lessonJson,
                  parsedLesson,
                  sections,
                  experienceCards,
                  timestamp: Date.now()
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `v5-progress-${Date.now()}.json`;
                a.click();
                toast({ title: "💾 Backup exportado" });
              }}
              disabled={!lessonJson && experienceCards.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm('Limpar todo o progresso? Esta ação não pode ser desfeita.')) {
                  localStorage.removeItem('v5-card-config-autosave');
                  setLessonJson('');
                  setParsedLesson(null);
                  setSections([]);
                  setExperienceCards([]);
                  toast({ title: "🗑️ Progresso limpo" });
                }
              }}
              disabled={!lessonJson && experienceCards.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Coluna Principal */}
          <div className="space-y-6">
            <Tabs defaultValue="paste" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="paste">1️⃣ Colar JSON</TabsTrigger>
                <TabsTrigger value="manual">2️⃣ Ativar Cards</TabsTrigger>
              </TabsList>

              {/* TAB 1: COLAR JSON */}
              <TabsContent value="paste" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>📋 Cole o JSON da Lição V5</CardTitle>
                    <CardDescription>
                      JSON completo com seções e experienceCards (incluindo anchorText)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={lessonJson}
                      onChange={(e) => setLessonJson(e.target.value)}
                      placeholder='{"title": "...", "trackId": "...", "sections": [...], "experienceCards": [...]}'
                      className="font-mono text-xs min-h-[300px]"
                    />
                    
                    <Button
                      onClick={handleAnalyzeJson}
                      disabled={!lessonJson.trim()}
                      className="w-full"
                      variant="default"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Analisar JSON
                    </Button>

                    {/* 📊 Resumo do JSON Analisado */}
                    {parsedLesson && (
                      <div className="space-y-4">
                        {/* Info da Lição */}
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-green-900">{parsedLesson.title}</span>
                          </div>
                          <div className="flex gap-4 text-sm text-green-700">
                            <span>📑 {sections.length} seções</span>
                            <span>🎬 {detectedCards.length} cards detectados</span>
                          </div>
                        </div>

                        {/* Lista de Cards Detectados */}
                        {detectedCards.length > 0 && (
                          <div className="border rounded-lg overflow-hidden">
                            <div className="bg-purple-50 px-4 py-2 border-b">
                              <h4 className="font-medium text-purple-900 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Experience Cards no JSON ({detectedCards.length})
                              </h4>
                            </div>
                            <div className="max-h-[200px] overflow-y-auto divide-y">
                              {detectedCards.map((card, idx) => (
                                <div key={idx} className="px-4 py-2 flex items-center gap-2 text-sm">
                                  <Badge variant="outline" className="shrink-0">S{card.sectionIndex}</Badge>
                                  <Badge className="shrink-0">{card.cardType}</Badge>
                                  <span className="text-muted-foreground truncate">"{card.anchorText}"</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Aviso se não tem cards */}
                        {detectedCards.length === 0 && (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-800">
                              ⚠️ <strong>Nenhum experienceCard no JSON.</strong> Use a aba "Configurar Cards" para adicionar manualmente.
                            </p>
                          </div>
                        )}

                        {/* 🚀 Botão Enviar para Pipeline */}
                        {detectedCards.length > 0 && (
                          <Button
                            onClick={handleSendToPipeline}
                            disabled={sendingToPipeline}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            size="lg"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            {sendingToPipeline
                              ? 'Enviando...'
                              : `Enviar para Pipeline (${detectedCards.length} cards)`
                            }
                          </Button>
                        )}

                        {/* 🔧 FASE 3: Verificar Componentes React */}
                        {detectedCards.length > 0 && (
                          <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 bg-orange-50">
                            <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                              <Zap className="w-5 h-5" />
                              Fase 3: Verificar Componentes React
                            </h4>
                            
                            {/* Verificar cada cardType */}
                            <div className="space-y-2">
                              {(() => {
                                const uniqueTypes = [...new Set(detectedCards.map(c => c.cardType))];
                                const existing = uniqueTypes.filter(t => isValidCardEffectType(t));
                                const missing = uniqueTypes.filter(t => !isValidCardEffectType(t));
                                
                                return (
                                  <>
                                    {/* Existentes */}
                                    {existing.length > 0 && (
                                      <div className="p-3 bg-green-100 rounded-lg">
                                        <p className="text-sm font-medium text-green-800 mb-2">
                                          ✅ {existing.length} componente(s) já existem:
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                          {existing.map(t => (
                                            <Badge key={t} className="bg-green-600 text-white text-xs">{t}</Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Faltando */}
                                    {missing.length > 0 && (
                                      <div className="p-3 bg-red-100 rounded-lg">
                                        <p className="text-sm font-medium text-red-800 mb-2">
                                          ❌ {missing.length} componente(s) precisam ser criados:
                                        </p>
                                        <div className="flex flex-wrap gap-1 mb-3">
                                          {missing.map(t => (
                                            <Badge key={t} variant="destructive" className="text-xs">{t}</Badge>
                                          ))}
                                        </div>
                                        <p className="text-xs text-red-700 bg-red-50 p-2 rounded">
                                          💡 <strong>Próximo passo:</strong> Me envie uma mensagem pedindo para criar os componentes 
                                          React para os cardTypes faltantes. Exemplo: "Crie os componentes para {missing.slice(0,2).join(', ')}{missing.length > 2 ? '...' : ''}"
                                        </p>
                                      </div>
                                    )}
                                    
                                    {/* Tudo OK */}
                                    {missing.length === 0 && existing.length > 0 && (
                                      <div className="p-3 bg-green-100 rounded-lg">
                                        <p className="text-sm font-medium text-green-800">
                                          🎉 Todos os componentes já existem! A aula está pronta para uso.
                                        </p>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 2: ATIVAR CARDS - Buscar aulas do banco */}
              <TabsContent value="manual" className="space-y-4">
                <ActivateCardsTab 
                  onCardsCreated={(cards) => setExperienceCards(cards)}
                  experienceCards={experienceCards}
                  isSaving={isSaving}
                  setIsSaving={setIsSaving}
                  generatingProgress={generatingProgress}
                  setGeneratingProgress={setGeneratingProgress}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* SUMÁRIO LATERAL */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>📊 Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Seções:</span>
                  <Badge variant="outline">{sections.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cards Configurados:</span>
                  <Badge>{experienceCards.length}</Badge>
                </div>
                <Separator className="my-2" />
                <p className="text-xs text-muted-foreground">
                  Cada seção pode ter até 3 cards ancorados em trechos do markdown.
                </p>
              </CardContent>
            </Card>

            {/* BARRA DE PROGRESSO VISUAL */}
            {generatingProgress && (
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                    />
                    Salvando...
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-accent"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {generatingProgress}
                  </p>
                </CardContent>
              </Card>
            )}

            {parsedLesson && (
              <Card>
                <CardHeader>
                  <CardTitle>📄 Lição</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Título:</strong> {parsedLesson.title}</p>
                    <p><strong>Modelo:</strong> V5</p>
                    <p><strong>Seções:</strong> {sections.length}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* MODAL DE PREVIEW */}
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview dos Experience Cards
              </DialogTitle>
              <DialogDescription>
                Veja como o(s) card(s) vai(ão) aparecer na lição. Confira os detalhes antes de adicionar.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8 py-6">
              {previewCards.map((card, idx) => (
                <div key={idx} className="space-y-4">
                  {/* Header com badges */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Seção {card.sectionIndex}</Badge>
                    <Badge variant="secondary">Card {card.cardIndex}</Badge>
                    <Badge>{card.cardType}</Badge>
                  </div>

                  {/* Info resumida */}
                  <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-1">
                    <p><strong>AnchorText:</strong> "{card.anchorText}"</p>
                    {card.effectDescription && <p><strong>Efeito:</strong> {card.effectDescription}</p>}
                  </div>

                  {/* 🎬 PREVIEW: Cinematográfico ou Texto */}
                  <div className="rounded-xl overflow-hidden bg-slate-900 p-4">
                    <p className="text-xs text-slate-400 mb-3 text-center">
                      {isValidCardEffectType(card.cardType)
                        ? '🎬 Preview Cinematográfico - animação em tempo real'
                        : '✨ Preview - exatamente como aparecerá na aula'
                      }
                    </p>
                    {isValidCardEffectType(card.cardType) ? (
                      <DynamicCardEffect type={card.cardType} isActive={true} />
                    ) : (
                      <DynamicExperienceCard
                        type={card.cardType}
                        title={card.title}
                        subtitle={card.subtitle}
                        icon={card.icon || 'sparkles'}
                        colorScheme={card.colorScheme || 'purple'}
                        chapters={card.chapters || []}
                        effectDescription={card.effectDescription}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleCancelPreview}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmCards} className="gap-2">
                <Plus className="w-4 h-4" />
                Confirmar e Adicionar {previewCards.length} Card(s)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
