import { GuideV5Data } from '../../types/guide';

export const midjourneyGuide: GuideV5Data = {
  id: 'midjourney-essentials',
  title: 'Midjourney Essencial',
  description: 'Crie imagens incríveis com Midjourney: o melhor gerador de imagens IA para arte conceitual e criatividade',
  aiName: 'Midjourney',
  aiLogo: 'https://www.midjourney.com/apple-touch-icon.png',
  category: 'image',
  difficulty: 'intermediate',
  duration: 420, // 7 minutos
  tags: ['midjourney', 'image-generation', 'ai-art', 'discord'],
  sections: [
    {
      id: 'intro',
      title: 'O que é o Midjourney?',
      timestamp: 0,
      duration: 60,
      visualContent: `# O que é o Midjourney?

O **Midjourney** é o gerador de imagens IA mais popular para arte e criatividade:

- 🎨 **Qualidade artística**: Melhor para ilustrações, arte conceitual
- 🖼️ **Estilos diversos**: Realismo, fantasia, anime, pintura, 3D
- ⚡ **Rápido**: Gera imagens em 60 segundos
- 🔄 **Iterativo**: Refine até atingir o resultado perfeito
- 📱 **Mobile**: App iOS/Android (alpha)

## Como funciona

1. Você escreve um **prompt** de texto
2. Midjourney gera **4 variações** da imagem
3. Você escolhe a melhor e pode:
   - **Upscale** (aumentar resolução)
   - **Vary** (criar variações)
   - **Zoom out** (expandir a cena)

## Versões do modelo

- **V5.2**: Realismo fotográfico
- **V6**: Atual, mais detalhes e controle
- **Niji 6**: Especializado em anime/manga

## Diferenciais

| Midjourney | DALL-E | Stable Diffusion |
|------------|--------|------------------|
| Arte conceitual ⭐⭐⭐⭐⭐ | Diversos estilos ⭐⭐⭐⭐ | Customização ⭐⭐⭐⭐⭐ |
| Facilidade ⭐⭐⭐⭐ | Facilidade ⭐⭐⭐⭐⭐ | Facilidade ⭐⭐ |
| Custo $10-120/mês | Custo $20/mês | Custo Grátis |`
    },
    {
      id: 'getting-started',
      title: 'Como começar no Midjourney',
      timestamp: 60,
      duration: 60,
      visualContent: `# Como começar no Midjourney

## Passo 1: Criar conta no Discord

1. Acesse [discord.com](https://discord.com)
2. Crie uma conta (se não tiver)
3. Baixe o app (desktop ou mobile)

## Passo 2: Entrar no servidor Midjourney

1. Acesse [midjourney.com/home](https://midjourney.com/home)
2. Clique em "Join the Beta"
3. Aceite o convite do Discord

## Passo 3: Escolher plano

### Planos disponíveis:

**Basic Plan - $10/mês**
- ~200 imagens/mês
- Acesso a todos os modelos
- Modo privado não incluído

**Standard Plan - $30/mês**
- ~900 imagens/mês
- Modo rápido ilimitado
- Modo privado opcional

**Pro Plan - $60/mês**
- ~1800 imagens/mês
- Modo stealth (privado)
- Acesso prioritário

**Mega Plan - $120/mês**
- ~3600 imagens/mês
- Tudo do Pro

💡 **Não tem mais trial gratuito**, mas você pode ver imagens públicas!

## Passo 4: Primeiro prompt

1. Vá para canal #newbies ou #general
2. Digite /imagine prompt a cat astronaut
3. Aguarde ~60 segundos
4. Veja suas 4 imagens!`
    },
    {
      id: 'commands-parameters',
      title: 'Comandos e parâmetros',
      timestamp: 120,
      duration: 90,
      visualContent: `# Comandos e parâmetros essenciais

## Comando principal

\`\`\`
/imagine prompt: [sua descrição]
\`\`\`

## Parâmetros importantes

### Aspect Ratio (proporção)
\`\`\`
/imagine a sunset --ar 16:9  (horizontal)
/imagine a portrait --ar 9:16  (vertical)
/imagine a logo --ar 1:1  (quadrado)
\`\`\`

### Qualidade e velocidade
\`\`\`
--q 2  (alta qualidade, mais lento)
--q 1  (padrão)
--q 0.5  (rápido, menor qualidade)
\`\`\`

### Estilo
\`\`\`
--style raw  (menos estilizado, mais literal)
--style expressive  (mais artístico)
\`\`\`

### Versão do modelo
\`\`\`
--v 6  (versão 6, padrão atual)
--niji 6  (modo anime/manga)
\`\`\`

### Chaos (aleatoriedade)
\`\`\`
--chaos 0  (consistente)
--chaos 100  (muito variado)
\`\`\`

## Exemplo completo

\`\`\`
/imagine prompt: a mystical forest with glowing mushrooms, ethereal lighting, fantasy art, detailed --ar 16:9 --v 6 --q 2
\`\`\`

## Botões de ação

Após gerar, você verá botões:

**U1, U2, U3, U4** = Upscale (aumentar resolução)
**V1, V2, V3, V4** = Vary (criar variações)
**🔄** = Reroll (gerar 4 novas imagens)

## Comandos úteis

\`\`\`
/describe [upload imagem]  →  Gera prompts baseados na imagem
/blend [imagem1] [imagem2]  →  Combina imagens
/settings  →  Ajustar configurações
\`\`\``
    },
    {
      id: 'writing-prompts',
      title: 'Escrevendo prompts poderosos',
      timestamp: 210,
      duration: 90,
      visualContent: `# Escrevendo prompts poderosos

## Estrutura ideal

\`\`\`
[SUJEITO] + [DESCRIÇÃO] + [ESTILO] + [ILUMINAÇÃO] + [MOOD]
\`\`\`

## Exemplos práticos

### ❌ Prompt fraco
"a dragon"

### ✅ Prompt forte
"a majestic red dragon perched on mountain peak, wings spread wide, golden sunset, fantasy art by Greg Rutkowski, cinematic lighting, epic atmosphere"

## Técnicas avançadas

### 1. Pesos de palavras
\`\`\`
a blue::2 red::1 car  →  Mais azul que vermelho
\`\`\`

### 2. Referências de artistas
\`\`\`
art by Hayao Miyazaki
style of Studio Ghibli
inspired by Artgerm
photograph by Annie Leibovitz
\`\`\`

### 3. Referências de mídia
\`\`\`
cinematic lighting
unreal engine 5
octane render
DSLR photography
analog film grain
\`\`\`

### 4. Palavras mágicas
\`\`\`
highly detailed
intricate
photorealistic
masterpiece
8k
volumetric lighting
depth of field
\`\`\`

## Templates por categoria

### Retratos
\`\`\`
portrait of [person], [age], [expression], [lighting], photographed by [photographer], [lens], [mood]

Exemplo:
portrait of elderly man, 70s, wise expression, soft window light, photographed by Steve McCurry, 85mm lens, contemplative mood --ar 2:3
\`\`\`

### Paisagens
\`\`\`
[location] landscape, [time of day], [weather], [style], [mood], [technical details]

Exemplo:
Norwegian fjord landscape, golden hour, misty morning, cinematic style, serene mood, wide angle, volumetric fog --ar 16:9
\`\`\`

### Produtos
\`\`\`
[product] on [background], [lighting], professional product photography, [details]

Exemplo:
luxury watch on black velvet, studio lighting, professional product photography, reflections, macro shot, commercial style --ar 1:1
\`\`\`

### Fantasia/Ficção
\`\`\`
[character/creature] in [setting], [action], [art style], [mood], [artist reference]

Exemplo:
ancient wizard casting spell in mystical library, glowing runes, concept art style, mysterious atmosphere, art by Donato Giancola --ar 3:2
\`\`\``
    },
    {
      id: 'advanced-features',
      title: 'Features avançadas',
      timestamp: 300,
      duration: 60,
      visualContent: `# Features avançadas

## Image Prompting (usar imagem como base)

### Método 1: Upload
1. Digite \`/imagine\`
2. Arraste imagem antes do prompt
3. Adicione texto

\`\`\`
[imagem do seu gato] make this cat a superhero --ar 1:1
\`\`\`

### Método 2: URL
\`\`\`
/imagine https://example.com/image.jpg in watercolor style
\`\`\`

## Vary Region (editar partes específicas)

1. Clique em "Vary (Region)" após upscale
2. Selecione área com pincel
3. Digite o que quer mudar
4. Gerar

**Exemplo:** Mudar cor de um vestido, adicionar objeto

## Zoom Out (expandir cena)

Após upscale:
- **Zoom Out 2x** = Duplica a cena
- **Zoom Out 1.5x** = Expande moderadamente
- **Custom Zoom** = Controle manual

## Panning (expandir direções)

Após upscale, use setas:
- ⬅️➡️⬆️⬇️ = Expandir para os lados

## Remix Mode

Ative em \`/settings\`:
- Ao usar "Vary", você pode mudar o prompt
- Útil para iterar mantendo composição

## Describe (engenharia reversa)

\`\`\`
/describe [upload imagem]
\`\`\`

Midjourney gera 4 prompts que criariam aquela imagem!
Ótimo para aprender.`
    },
    {
      id: 'tips-best-practices',
      title: 'Dicas e melhores práticas',
      timestamp: 360,
      duration: 60,
      visualContent: `# Dicas e melhores práticas

## ✅ Faça

### 1. Seja específico
❌ "a house"
✅ "Victorian mansion with ivy-covered walls, autumn evening, moody lighting"

### 2. Use referências
- Nomes de artistas conhecidos
- Estilos de arte específicos
- Técnicas fotográficas

### 3. Experimente pesos
\`\`\`
red::2 blue::1  →  Mais vermelho
\`\`\`

### 4. Itere bastante
- Gere 4 versões
- Escolha a melhor
- Varie essa
- Repita até perfeição

### 5. Use o comando /describe
Upload de imagens que você gosta para aprender prompts

## ❌ Evite

### 1. Prompts muito longos
- Limite: ~60 palavras
- Seja conciso mas específico

### 2. Conceitos muito abstratos
- "felicidade pura" → difícil
- "pessoa sorrindo em dia ensolarado" → fácil

### 3. Esperar perfeição na primeira tentativa
- Midjourney é iterativo
- Refine, varie, ajuste

## Palavras que NÃO funcionam

❌ "sem" / "não" / "remover"
→ Use positivo: em vez de "sem árvores", use "campo aberto"

## Organização

### Use pastas no site
1. Acesse [midjourney.com/app](https://midjourney.com/app)
2. Organize suas criações
3. Compartilhe galerias

### Salve prompts bons
Mantenha doc com prompts que funcionaram!

## Ética e direitos

⚠️ **Importante:**
- Imagens geradas são sua propriedade (planos pagos)
- Não crie deepfakes maliciosos
- Respeite direitos autorais ao usar referências
- Imagens públicas no Discord (exceto modo stealth)`
    }
  ]
};
