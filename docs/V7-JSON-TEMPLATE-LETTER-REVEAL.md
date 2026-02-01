# V7 JSON Template: Letter-Reveal (Acrônimo PERFEITO)

## ⚠️ Regra Crítica

**A narração do acrônimo DEVE estar DENTRO da mesma cena que define os microVisuals.**

O Pipeline calcula os timestamps dos microVisuals **apenas dentro do range da cena**. Se a narração estiver em uma cena anterior, os microVisuals não encontrarão as palavras-âncora e usarão fallback incorreto.

---

## ❌ Estrutura ERRADA

```json
{
  "scenes": [
    {
      "id": "cena-8-transicao",
      "type": "transition",
      "narration": "Esse é o método PERFEITO. Persona específica. Estrutura clara. Resultado esperado..."
    },
    {
      "id": "cena-9-perfeito",
      "type": "revelation",
      "narration": "Agora veja a diferença na prática.",
      "visual": {
        "type": "letter-reveal",
        "content": { "word": "PERFEITO", "letters": [...] }
      },
      "microVisuals": [
        { "anchorText": "Persona", "type": "letter-reveal", "content": { "index": 0 } }
      ]
    }
  ]
}
```

**Problema:** A narração "Persona específica..." está na `cena-8`, mas os microVisuals estão na `cena-9`. O Pipeline busca "Persona" apenas no range da `cena-9` e não encontra.

---

## ✅ Estrutura CORRETA

```json
{
  "scenes": [
    {
      "id": "cena-8-transicao",
      "type": "transition",
      "narration": "Agora vou te ensinar um método que vai transformar seus prompts."
    },
    {
      "id": "cena-9-perfeito",
      "type": "revelation",
      "narration": "Esse é o método PERFEITO. Persona específica. Estrutura clara. Resultado esperado. Formato definido. Exemplos práticos. Iteração contínua. Tom adequado. Otimização constante. Com esse método, seus prompts serão imbatíveis.",
      "visual": {
        "type": "letter-reveal",
        "content": {
          "word": "PERFEITO",
          "finalStamp": "PERFEITO",
          "letters": [
            { "letter": "P", "meaning": "Persona Específica" },
            { "letter": "E", "meaning": "Estrutura Clara" },
            { "letter": "R", "meaning": "Resultado Esperado" },
            { "letter": "F", "meaning": "Formato Definido" },
            { "letter": "E", "meaning": "Exemplos Práticos" },
            { "letter": "I", "meaning": "Iteração Contínua" },
            { "letter": "T", "meaning": "Tom Adequado" },
            { "letter": "O", "meaning": "Otimização Constante" }
          ]
        }
      },
      "microVisuals": [
        { "anchorText": "Persona", "type": "letter-reveal", "content": { "index": 0 } },
        { "anchorText": "Estrutura", "type": "letter-reveal", "content": { "index": 1 } },
        { "anchorText": "Resultado", "type": "letter-reveal", "content": { "index": 2 } },
        { "anchorText": "Formato", "type": "letter-reveal", "content": { "index": 3 } },
        { "anchorText": "Exemplos", "type": "letter-reveal", "content": { "index": 4 } },
        { "anchorText": "Iteração", "type": "letter-reveal", "content": { "index": 5 } },
        { "anchorText": "Tom", "type": "letter-reveal", "content": { "index": 6 } },
        { "anchorText": "Otimização", "type": "letter-reveal", "content": { "index": 7 } }
      ],
      "anchorText": {
        "pauseAt": "imbatíveis"
      }
    }
  ]
}
```

**Por que funciona:**
1. A narração "Persona específica. Estrutura clara..." está **dentro** da `cena-9`
2. O Pipeline calcula o range da `cena-9` baseado nessa narração
3. Cada microVisual encontra sua palavra-âncora dentro do range correto
4. Os triggers são calculados com timestamps precisos

---

## 📋 Checklist para Letter-Reveal

| Item | Verificação |
|------|-------------|
| ✅ Narração do acrônimo | Deve estar na **mesma cena** que `visual.type: "letter-reveal"` |
| ✅ Palavras-âncora | Cada `microVisual.anchorText` deve aparecer **literalmente** na narração |
| ✅ Ordem dos microVisuals | Deve corresponder à ordem das letras no array `letters` |
| ✅ Índices corretos | `content.index` deve corresponder à posição no array (0, 1, 2...) |
| ✅ finalStamp | Palavra final que encerra a animação (ex: "PERFEITO") |
| ✅ pauseAt | Palavra para pausar após a revelação completa |

---

## 🔧 Fluxo do Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│ JSON de Entrada (estrutura CORRETA)                                  │
├──────────────────────────────────────────────────────────────────────┤
│ cena-9-perfeito:                                                     │
│   narration: "PERFEITO. Persona... Estrutura... Resultado..."       │
│   visual.type: "letter-reveal"                                       │
│   microVisuals: [{ anchorText: "Persona" }, { anchorText: "..." }]  │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Pipeline v7-vv                                                       │
├──────────────────────────────────────────────────────────────────────┤
│ 1. Gera áudio via ElevenLabs com word-level timestamps              │
│ 2. Calcula range da cena-9: ~60s → ~82s                             │
│ 3. Para cada microVisual:                                            │
│    - Busca "Persona" em [60s, 82s] → ENCONTRA @ 61.417s ✅          │
│    - Busca "Estrutura" em [60s, 82s] → ENCONTRA @ 63.065s ✅        │
│    - ... (todos os 8)                                                │
│ 4. Gera triggerTimes precisos para cada letra                       │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Resultado no Banco de Dados                                          │
│ microVisuals: [                                                      │
│   { anchorText: "Persona", triggerTime: 61.417, content: {index:0} }│
│   { anchorText: "Estrutura", triggerTime: 63.065, content: {index:1}}│
│   ...                                                                │
│ ]                                                                    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📝 Template Completo para Acrônimos

```json
{
  "id": "cena-X-acronimo",
  "type": "revelation",
  "narration": "[PALAVRA]. [Significado letra 1]. [Significado letra 2]. ... [Frase de conclusão].",
  "visual": {
    "type": "letter-reveal",
    "content": {
      "word": "[PALAVRA]",
      "finalStamp": "[PALAVRA]",
      "letters": [
        { "letter": "[L1]", "meaning": "[Significado 1]" },
        { "letter": "[L2]", "meaning": "[Significado 2]" }
      ]
    }
  },
  "microVisuals": [
    { "anchorText": "[Palavra-chave 1]", "type": "letter-reveal", "content": { "index": 0 } },
    { "anchorText": "[Palavra-chave 2]", "type": "letter-reveal", "content": { "index": 1 } }
  ],
  "anchorText": {
    "pauseAt": "[última palavra antes de pausar]"
  }
}
```

**Regras para `anchorText`:**
- Deve ser uma palavra **única e distintiva** na narração
- Preferencialmente a **primeira palavra** de cada significado
- Deve aparecer **exatamente** como escrito (case-insensitive)

---

## 🚫 Erros Comuns

| Erro | Consequência | Solução |
|------|--------------|---------|
| Narração em cena anterior | microVisuals usam fallback | Mover narração para mesma cena |
| anchorText não existe na narração | triggerTime incorreto | Verificar texto exato |
| Índices fora de ordem | Letras aparecem na ordem errada | Sincronizar índices com array |
| Falta finalStamp | Animação não conclui corretamente | Adicionar palavra final |

---

## 📚 Referência

Este template foi criado para garantir processamento automatizado e consistente de aulas V7 com animação de acrônimo (letter-reveal). Seguir esta estrutura garante que o Pipeline calcule timestamps corretos sem necessidade de busca global ou fallbacks.
