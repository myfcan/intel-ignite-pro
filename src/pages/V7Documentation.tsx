import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Copy, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const documentationContent = `# V7-vv JSON Schema - Documentação Completa

> **Versão:** 1.0 | **Status:** Produção

---

## ⚓ AnchorText - REGRA DE OURO

> **\`anchorText.pauseAt\` SÓ pode existir em cenas INTERATIVAS!**

### 🔴 Cenas NÃO-INTERATIVAS (SEM pauseAt)
| Tipo | Propósito |
|------|-----------|
| \`dramatic\` | Impacto emocional, números chocantes |
| \`narrative\` | Explicação, contexto, história |
| \`comparison\` | Comparar A vs B |
| \`revelation\` | Revelar conceito/método |

### 🟢 Cenas INTERATIVAS (COM pauseAt)
| Tipo | Propósito |
|------|-----------|
| \`interaction\` | Quiz, escolhas do usuário |
| \`playground\` | Teste prático comparativo |
| \`cta\` | Call-to-action, decisão |
| \`gamification\` | Celebração, recompensas |
| \`secret-reveal\` | Revelação com suspense |

---

## 📋 Estrutura Raiz

\`\`\`json
{
  "$schema": "V7-vv Pipeline Input Schema",
  "title": "string",
  "subtitle": "string",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "category": "string",
  "tags": ["string"],
  "learningObjectives": ["string"],
  "voice_id": "string",
  "generate_audio": true,
  "fail_on_audio_error": false,
  "scenes": [Scene]
}
\`\`\`

---

## 🎬 Estrutura de Scene

\`\`\`json
{
  "id": "cena-1-abertura",
  "title": "Título da Cena",
  "type": "dramatic",
  "narration": "Texto da narração...",
  "anchorText": { "pauseAt": "keyword" },  // APENAS interativas!
  "visual": { ... },
  "interaction": { ... }  // APENAS interativas!
}
\`\`\`

---

## 🎨 Tipos de Visual

### 1. \`number-reveal\`
\`\`\`json
{
  "type": "number-reveal",
  "content": {
    "mainValue": "98%",
    "subtitle": "tratam como brinquedo"
  },
  "effects": {
    "mood": "dramatic",
    "particles": "ember",
    "glow": true
  }
}
\`\`\`

### 2. \`text-reveal\`
\`\`\`json
{
  "type": "text-reveal",
  "content": {
    "mainText": "TÍTULO",
    "items": ["Item 1", "Item 2"],
    "impactWord": "DESTAQUE"
  }
}
\`\`\`

### 3. \`split-screen\`
\`\`\`json
{
  "type": "split-screen",
  "content": {
    "leftCard": {
      "label": "ANTES",
      "value": "Amador",
      "details": ["Ponto 1"],
      "isPositive": false
    },
    "rightCard": {
      "label": "DEPOIS",
      "value": "Profissional",
      "details": ["Ponto 1"],
      "isPositive": true
    }
  }
}
\`\`\`

### 4. \`letterbox\`
\`\`\`json
{
  "type": "letterbox",
  "content": {
    "title": "MÉTODO PERFEITO",
    "items": [
      {"icon": "P", "text": "Persona específica"},
      {"icon": "E", "text": "Estrutura clara"}
    ]
  }
}
\`\`\`

---

## 🎮 Sistema de Interações

### Quiz
\`\`\`json
{
  "interaction": {
    "type": "quiz",
    "question": "Qual sua escolha?",
    "options": [
      {
        "id": "opt-1",
        "text": "Opção A",
        "isCorrect": true,
        "feedback": "Correto!"
      }
    ]
  }
}
\`\`\`

### Playground
\`\`\`json
{
  "interaction": {
    "type": "playground",
    "amateurPrompt": "Prompt simples",
    "professionalPrompt": "Prompt elaborado...",
    "amateurResult": {
      "title": "Amador",
      "content": "Resposta genérica",
      "score": 20,
      "verdict": "Fraco"
    },
    "professionalResult": {
      "title": "Profissional",
      "content": "Resposta impactante",
      "score": 95,
      "verdict": "Excelente!"
    }
  }
}
\`\`\`

---

## ✨ Efeitos Visuais

### Mood
| Valor | Uso |
|-------|-----|
| \`dramatic\` | Números chocantes |
| \`success\` | Vitórias |
| \`danger\` | Alertas |
| \`energetic\` | Ação |
| \`mysterious\` | Revelações |

### Particles
| Valor | Efeito |
|-------|--------|
| \`ember\` | Brasas |
| \`confetti\` | Confete |
| \`sparks\` | Faíscas |
| \`success-sparkles\` | Brilhos |

---

## 🖼️ Image Sequence (C12.1) — Boas Práticas

### Regras Obrigatórias
- \`image-sequence\` com **2+ frames** exige \`anchorActions\` com triggers explícitos
- Cada frame após o índice 0 precisa de **1 trigger** com \`payload.frameIndex\`
- **Fallback timer é proibido** — controle determinístico via anchor no áudio

### ⚠️ Keywords Frágeis (EVITAR)
| Keyword | Problema |
|---------|----------|
| \`MARCO1\` | TTS pode tokenizar como "marco" + "1" |
| \`FRAME2\` | Mesmo problema: "frame" + "2" |
| \`PASSO3\` | Alfanumérico = alto risco de split |

### ✅ Keywords Resilientes (PREFERIR)
| Keyword | Por que funciona |
|---------|-----------------|
| \`primeiro\` | Palavra natural da narração |
| \`depois\` | Palavra natural, sem ambiguidade |
| \`premium\` | Única, distintiva, natural |
| \`resultado\` | Clara e presente na fala |

### Checklist C12.1
- [ ] Cada frame > 0 tem um trigger com \`payload.frameIndex\`
- [ ] Keywords são palavras naturais presentes na narração
- [ ] Keywords são únicas dentro da cena
- [ ] Evitar keywords alfanuméricos como \`MARCO1\`

---

## ✅ Checklist

- [ ] \`anchorText.pauseAt\` APENAS em cenas interativas
- [ ] Keywords existem exatamente na narração
- [ ] Cada cena interativa tem \`interaction\` definido
- [ ] IDs únicos em kebab-case
- [ ] Image-sequence: triggers com keywords naturais (C12.1)

---

## 🚨 Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| Aula congela | \`pauseAt\` em cena não-interativa | Remover \`anchorText\` |
| Quiz não aparece | Tipo errado | Usar \`type: "interaction"\` |
| Áudio não pausa | Keyword não encontrada | Verificar palavra na narração |
| C12.1 500 error | Trigger não resolvido no áudio | Usar keywords naturais, evitar alfanuméricos |
`;

export default function V7Documentation() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyFullDoc = () => {
    navigator.clipboard.writeText(documentationContent);
    setCopied(true);
    toast.success('Documentação copiada!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Admin
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold">V7-vv JSON Schema</span>
          </div>
          <Button variant="outline" onClick={copyFullDoc}>
            {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copiado!' : 'Copiar Tudo'}
          </Button>
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h1 className="text-3xl font-bold text-foreground mb-6">{children}</h1>,
              h2: ({ children }) => <h2 className="text-2xl font-bold text-foreground mt-8 mb-4 border-b border-border pb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">{children}</h3>,
              p: ({ children }) => <p className="text-muted-foreground mb-4">{children}</p>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-emerald-500 bg-emerald-500/10 p-4 my-4 rounded-r-lg">
                  {children}
                </blockquote>
              ),
              code: ({ className, children }) => {
                const isInline = !className;
                if (isInline) {
                  return <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-emerald-400">{children}</code>;
                }
                return (
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
                    <code className="text-sm text-foreground">{children}</code>
                  </pre>
                );
              },
              table: ({ children }) => (
                <div className="overflow-x-auto my-4">
                  <table className="w-full border-collapse border border-border">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-border bg-muted px-4 py-2 text-left font-semibold">{children}</th>
              ),
              td: ({ children }) => (
                <td className="border border-border px-4 py-2 text-muted-foreground">{children}</td>
              ),
              hr: () => <hr className="border-border my-8" />,
              ul: ({ children }) => <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-4">{children}</ul>,
            }}
          >
            {documentationContent}
          </ReactMarkdown>
        </div>
      </main>
    </div>
  );
}
