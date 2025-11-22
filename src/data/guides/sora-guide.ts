import { GuideV5Data } from '../../types/guide';

export const soraGuide: GuideV5Data = {
  id: 'sora-essentials',
  title: 'Sora Essencial',
  description: 'Aprenda a criar vídeos incríveis com o Sora da OpenAI: a IA que gera vídeos realistas a partir de texto',
  aiName: 'Sora',
  aiLogo: 'https://cdn.openai.com/sora/images/sora-logo.svg',
  category: 'video',
  difficulty: 'intermediate',
  duration: 360, // 6 minutos
  tags: ['sora', 'openai', 'video-generation', 'ai-video'],
  sections: [
    {
      id: 'intro',
      title: 'O que é o Sora?',
      timestamp: 0,
      duration: 60,
      visualContent: `# O que é o Sora?

O **Sora** é o gerador de vídeo da OpenAI, capaz de:

- 🎬 **Criar vídeos de até 1 minuto** a partir de texto
- 🎨 **Realismo impressionante**: Pessoas, animais, objetos realistas
- 🎭 **Física coerente**: Movimento, iluminação e sombras corretos
- 🎞️ **Múltiplos estilos**: Realista, animação, stop-motion, etc.
- 📐 **Diferentes formatos**: Vertical, horizontal, quadrado

## Como funciona

1. Você escreve um **prompt** descrevendo o vídeo
2. Sora cria o vídeo em minutos
3. Você pode refinar e gerar variações

## Capacidades impressionantes

- Múltiplos personagens com emoções
- Cenários complexos
- Transições suaves de câmera
- Consistência ao longo do vídeo

## Limitações atuais

⚠️ Ainda pode ter:
- Física estranha ocasionalmente
- Detalhes de mãos/rostos imperfeitos
- Dificuldade com ações muito complexas

**Status:** Disponível para usuários ChatGPT Plus e Pro`
    },
    {
      id: 'getting-started',
      title: 'Como começar com Sora',
      timestamp: 60,
      duration: 60,
      visualContent: `# Como começar com Sora

## Requisitos

Para usar o Sora:

1. **Conta OpenAI**
2. **Assinatura ChatGPT Plus ($20/mês) ou Pro ($200/mês)**

## Acesso

### ChatGPT Plus
- 50 vídeos/mês (resolução padrão - 480p)
- Vídeos de até 5 segundos
- Sem marca d'água

### ChatGPT Pro
- 500 vídeos/mês (resolução 1080p)
- Vídeos de até 20 segundos
- Geração mais rápida
- Até 5 gerações simultâneas

## Como acessar

1. Acesse [chatgpt.com](https://chatgpt.com)
2. Faça login com sua conta Plus/Pro
3. Clique em "Sora" no menu lateral
4. Digite seu prompt de vídeo

## Interface

- **Prompt box**: Descreva o vídeo
- **Configurações**: Duração, formato (16:9, 9:16, 1:1)
- **Preview**: Assista antes de baixar
- **Download**: Salve em MP4

💡 **Dica**: Comece com vídeos curtos (5s) para economizar créditos!`
    },
    {
      id: 'writing-prompts',
      title: 'Escrevendo prompts eficazes',
      timestamp: 120,
      duration: 90,
      visualContent: `# Escrevendo prompts eficazes

## Estrutura de um bom prompt

\`\`\`
[ESTILO] + [CENA] + [AÇÃO] + [CÂMERA] + [LIGHTING/MOOD]
\`\`\`

## Exemplos práticos

### ❌ Prompt fraco
"Um cachorro correndo"

### ✅ Prompt forte
"Drone shot de um golden retriever correndo em câmera lenta por um campo de flores amarelas ao pôr do sol, estilo cinematográfico, cores quentes, iluminação dourada"

## Elementos-chave

### 1. Estilo visual
- "Estilo cinematográfico"
- "Animação 3D Pixar"
- "Fotografia documental"
- "Stop-motion artesanal"

### 2. Sujeito e ação
- "Uma mulher de 30 anos dançando ballet"
- "Um astronauta flutuando no espaço"
- "Gotas de chuva caindo em uma janela"

### 3. Movimento de câmera
- "Close-up lento"
- "Drone shot aéreo"
- "Câmera girando 360 graus"
- "Tracking shot seguindo o sujeito"

### 4. Ambiente e iluminação
- "Rua de Tóquio à noite com neon"
- "Floresta nublada ao amanhecer"
- "Estúdio com iluminação dramática"

### 5. Humor/atmosfera
- "Atmosfera nostálgica"
- "Vibe energética e vibrante"
- "Tom misterioso e sombrio"

## Templates úteis

### Para produtos
\`\`\`
Close-up rotativo de [produto] sobre fundo [cor], iluminação de estúdio profissional, reflexos sutis, estilo publicitário Apple
\`\`\`

### Para natureza
\`\`\`
Drone shot aéreo de [local], câmera subindo lentamente, golden hour, cores cinematográficas, 4K
\`\`\``
    },
    {
      id: 'use-cases',
      title: 'Casos de uso práticos',
      timestamp: 210,
      duration: 90,
      visualContent: `# Casos de uso práticos

## 🎬 Marketing e publicidade

### Demonstração de produtos
\`\`\`
Slow motion de café sendo servido em xícara branca, vapor subindo, luz natural da manhã, estilo minimalista, fundo neutro
\`\`\`

### Vídeos para redes sociais
\`\`\`
Vertical video (9:16): Pessoa abrindo caixa de produto com reação de surpresa, câmera frontal, iluminação de influencer, cores vibrantes
\`\`\`

### B-roll para edição
\`\`\`
Time-lapse de cidade à noite, luzes de carros criando traços, prédios iluminados, 10 segundos
\`\`\`

## 🎓 Educação e treinamento

### Animações explicativas
\`\`\`
Animação 3D mostrando como funciona o ciclo da água, estilo educacional, cores claras, movimento suave
\`\`\`

### Demonstrações
\`\`\`
Close-up de mãos preparando [receita], câmera top-down, iluminação clara, estilo tutorial de cozinha
\`\`\`

## 🎨 Conteúdo criativo

### Música e arte
\`\`\`
Câmera girando ao redor de bailarina em palco escuro com holofotes coloridos, movimento fluido, estilo music video
\`\`\`

### Storytelling visual
\`\`\`
Criança correndo por floresta encantada com animais mágicos, estilo animação Ghibli, cores vibrantes, atmosfera fantástica
\`\`\`

## 💼 Corporativo

### Apresentações
\`\`\`
Gráfico 3D animado mostrando crescimento de vendas, transição suave de barras, cores corporativas azul e branco, profissional
\`\`\`

### Institucional
\`\`\`
Drone shot de fachada de empresa moderna, câmera se aproximando lentamente, céu azul, estilo corporativo limpo
\`\`\``
    },
    {
      id: 'tips-limitations',
      title: 'Dicas e limitações',
      timestamp: 300,
      duration: 60,
      visualContent: `# Dicas e limitações

## ✅ Dicas profissionais

### 1. Seja específico
Quanto mais detalhes, melhor o resultado

### 2. Use referências visuais
"Estilo Wes Anderson", "como filme Blade Runner"

### 3. Gere variações
Faça múltiplas versões do mesmo prompt

### 4. Combine com edição
Use Sora para criar clipes, depois edite em software

### 5. Teste diferentes durações
5s para ações simples, 20s para cenas complexas

## ⚠️ Limitações atuais

### O que Sora ainda não faz bem:

❌ **Textos**: Não gera texto legível em vídeo
❌ **Física complexa**: Líquidos, colisões podem ficar estranhos
❌ **Rostos famosos**: Não cria celebridades específicas
❌ **Mãos e dedos**: Podem ter anatomia estranha
❌ **Ações muito específicas**: "Amarrar cadarço" pode confundir

### O que funciona muito bem:

✅ Paisagens e natureza
✅ Animais
✅ Objetos em movimento simples
✅ Cenas cinematográficas gerais
✅ Animações abstratas

## Comparação com concorrentes

| Feature | Sora | Runway | Pika |
|---------|------|--------|------|
| Realismo | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Duração | 20s (Pro) | 18s | 3s |
| Preço/mês | $20-200 | $12-76 | $8-58 |
| Qualidade | 1080p | 4K | 720p |

💡 **Melhor para**: Vídeos realistas de alta qualidade com orçamento médio`
    }
  ]
};
