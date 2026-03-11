

# Auditoria Sênior do Plano — Análise de Aderência e Riscos Sistêmicos

## Dados Forenses Reais (query direta no banco)

Lesson `8b609064`, 9 seções. Busquei TODOS os caracteres não-ASCII:

| Seção | Título | Caractere não-Latin | Tipo |
|-------|--------|---------------------|------|
| 0 | Abertura | `—` (U+2014) | Em dash — **LEGÍTIMO** |
| 3 | Os 3 pilares... | `स्पष्ट` (Devanagari) | **CORRUPÇÃO GEMINI** |
| 4 | Da teoria à prática | `…` (U+2026) | Ellipsis — **LEGÍTIMO** |
| 5 | O poder do formato | `—` | **LEGÍTIMO** |
| 6 | Prova relâmpago | `—` | **LEGÍTIMO** |
| 7 | Checklist mental | `—` | **LEGÍTIMO** |
| 8 | Desafio final | `—` | **LEGÍTIMO** |

**Achado crítico**: Apenas a Seção 3 tem corrupção real (Hindi). As demais têm em dashes e ellipsis que são tipografia normal e NÃO causam accent drift.

---

## Avaliação das 3 Correções Propostas

### Correção A — Strip não-Latin no TTS: **CONTÉM BUG**

A regex proposta no plano anterior:
```
[^\u0000-\u024F\u1E00-\u1EFF\u2000-\u206F...]
```

O range `\u2000-\u206F` inclui General Punctuation (onde vive `…` U+2026), e `\u2014` (em dash) está nesse range. Porém o range proposto **termina em \u23FF** e não é claro se cobre todos os caracteres tipográficos usados em português.

**Risco real**: Se a regex for muito restritiva, pode cortar caracteres legítimos. Se for muito permissiva, não resolve o problema.

**Correção proposta**: Em vez de uma whitelist de ranges Unicode complexa, usar uma **blacklist de scripts específicos** que sabemos serem corrupção:

```typescript
// Strip Devanagari, CJK, Arabic, Cyrillic, Thai, etc.
.replace(/[\u0900-\u097F\u0980-\u09FF\u0600-\u06FF\u0400-\u04FF\u4E00-\u9FFF\u3040-\u30FF\u0E00-\u0E7F\uAC00-\uD7AF]/g, '')
```

Isso é cirúrgico: remove apenas scripts que são comprovadamente corrupção da Gemini, preservando em dashes, ellipsis e toda a tipografia latina.

### Correção B — Regra no prompt do refine: **VÁLIDA**

Adicionar ao prompt a proibição de caracteres não-latinos. Baixo risco, alta eficácia preventiva.

### Correção C — Request Stitching: **INVÁLIDA — PROIBIDA**

A memória `v8/audio/elevenlabs-request-stitching-prohibition` documenta que o modelo `eleven_v3` **NÃO suporta** `previous_text` e `next_text`. Enviar esses parâmetros retorna erro 400 (`unsupported_model`).

**Este ponto do plano é FALSO** — não pode ser implementado sem trocar o modelo TTS (e não queremos trocar, pois `eleven_v3` + Taciana é a configuração estabilizada).

---

## Causa Raiz Real do Accent Drift na Seção 3

O accent drift PT-PT na Seção 3 tem UMA causa confirmada:
- O texto contém `स्पष्टamente` — o motor ElevenLabs encontra caracteres Devanagari no meio do texto português e perde a âncora fonética.

Sobre o "drift no início de cada seção" reportado pelo usuário: **não tenho evidência forense** de que isso aconteça nas seções 0, 1 e 2 (o usuário confirmou que funcionaram). Se acontece brevemente, é um comportamento intrínseco do `eleven_v3` ao inicializar cada segmento independente — e NÃO pode ser corrigido com request stitching (proibido no v3).

---

## Plano Revisado — 2 Correções Reais

### Correção A — Sanitizar scripts não-latinos no TTS (blacklist cirúrgica)

**Arquivo**: `supabase/functions/v8-generate-section-audio/index.ts`

Na função `sanitizeNarrationText`, adicionar:
```typescript
// Strip non-Latin scripts (Devanagari, Arabic, Cyrillic, CJK, Thai, Korean)
// Preserves em dashes (—), ellipsis (…), and all Latin Extended characters
.replace(/[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0600-\u06FF\u0400-\u04FF\u4E00-\u9FFF\u3040-\u30FF\u0E00-\u0E7F\uAC00-\uD7AF]/g, '')
```

Aplicar a mesma regex também em `v8-refine-content/index.ts` (na `sanitizePedagogicalText`) e `v8TextSanitizer.ts` (na `sanitizeV8PedagogicalText`) para proteger todas as camadas.

### Correção B — Proibir caracteres não-latinos no prompt do refine

**Arquivo**: `supabase/functions/v8-refine-content/index.ts`

Adicionar ao `REFINE_SYSTEM_PROMPT`:
```
14. **Sem caracteres não-latinos**: NUNCA insira caracteres de outros alfabetos 
(Devanagari, Cirílico, Árabe, CJK). Todo o texto deve usar exclusivamente 
o alfabeto latino com acentos portugueses (á, é, í, ó, ú, ã, õ, ç, etc.).
```

### NÃO implementar: Request Stitching

Motivo: `eleven_v3` retorna erro 400. Documentado na memória do projeto.

---

## Resumo da Auditoria

| Item do Plano | Veredicto | Ação |
|---------------|-----------|------|
| Correção A (strip non-Latin) | **Bug na regex** — muito ampla, pode cortar `—` e `…` | Substituir por blacklist de scripts |
| Correção B (prompt rule) | **Válida** | Implementar |
| Correção C (request stitching) | **INVÁLIDA** — eleven_v3 não suporta | Remover do plano |
| Accent drift genérico | **Sem evidência forense** — apenas Seção 3 confirmada | Não criar correção sem dados |

### Arquivos impactados: 3
1. `supabase/functions/v8-generate-section-audio/index.ts` — Correção A (sanitização)
2. `supabase/functions/v8-refine-content/index.ts` — Correções A + B (sanitização + prompt)
3. `src/lib/v8TextSanitizer.ts` — Correção A (sincronização da sanitização client-side)

