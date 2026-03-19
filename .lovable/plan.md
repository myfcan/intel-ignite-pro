

# Plano: Reescrever v10-generate-mockups — Enriquecimento JSON, Não PNG

## 1. DIAGNÓSTICO COM DADOS REAIS

### O que está ERRADO — `v10-generate-mockups/index.ts`

**Linha 82-141 — Gera PNG via Gemini Image:**
```typescript
async function generateMockupImage(prompt: string): Promise<Uint8Array> {
  // ...
  body: JSON.stringify({
    model: "google/gemini-2.5-flash-image",
    messages: [{ role: "user", content: prompt }],
    modalities: ["image", "text"],
  }),
```

**Linha 286-298 — Upload para Storage:**
```typescript
const storagePath = `v10-mockups/${lessonId}/step_${step.step_number}_frame_${frameIdx}.png`;
const { error: uploadError } = await supabase.storage
  .from("lesson-audios")
  .upload(storagePath, imageBytes.buffer as ArrayBuffer, {
```

**Linha 305 — Salva `mockup_url` no frame:**
```typescript
updatedFrames[frameIdx] = { ...updatedFrames[frameIdx], mockup_url: publicUrl };
```

### O que está CERTO — `v10-generate-steps/index.ts`

**Linha 268-269 — Prompt já pede frames ricos:**
```
1. Cada frame DEVE simular a interface REAL do app — use chrome_header + inputs + buttons + tabelas etc.
2. NUNCA gere frames so com texto generico. Cada frame deve parecer uma tela real do app.
```

O `v10-generate-steps` já gera frames com elements ricos. O problema é que DEPOIS, `v10-generate-mockups` ignora esses elements e gera um PNG genérico.

### O que o Player usa — `FrameRenderer.tsx`

**Linha 126-138 — Renderiza elements do JSON, NUNCA usa mockup_url:**
```typescript
const FrameRenderer: React.FC<FrameRendererProps> = ({ frame, accentColor }) => {
  return (
    <MockupChrome barText={frame.bar_text} barSub={frame.bar_sub} barColor={frame.bar_color}
      tip={frame.tip} action={frame.action} check={frame.check} accentColor={accentColor}>
      {(frame.elements || []).map((element, index) => renderElement(element, index))}
    </MockupChrome>
  );
};
```

### Validação ERRADA — `v10-assembly-check/index.ts`

**Linha 141-148:**
```typescript
const mockups_ok =
  steps.every((s: Record<string, unknown>) => {
    const frames = s.frames as any[];
    return frames.every((f: any) => f.mockup_url && f.mockup_url !== "");
  });
```
Valida `mockup_url` — campo que o player nem usa. Deveria validar `elements.length >= 3`.

---

## 2. PLANO DE ALTERAÇÕES

### Arquivo 1: `supabase/functions/v10-generate-mockups/index.ts` — REESCREVER

**Deletar:** `generateMockupImage()` (linhas 82-141), `base64UrlToBytes()` (linhas 72-80), `buildMockupPrompt()` (linhas 14-70), upload para Storage (linhas 286-301)

**Criar:** Função `enrichFrame()` que:
- Recebe: frame JSON atual + step title + step description + app_name
- Chama `google/gemini-3-flash-preview` (TEXT, não image) via Lovable AI Gateway
- Prompt segue EXATAMENTE o spec do usuário: "Você é um especialista em UI/UX. Recebeu este frame JSON... Enriqueça com elements que representem a tela REAL do app. Use cores reais, campos reais, botões com texto real. Use os 15 types. Retorne APENAS o JSON."
- Inclui os 6 exemplos reais do prompt do usuário (Make, Google Sheets, Google Forms, Bland AI, etc.)
- Parse com `JSON.parse()` + try/catch (fallback = frame original)
- Marca `frame.enriched = true`

**Critério de frame que precisa enriquecimento:**
```typescript
const contentElements = frame.elements?.filter(e => 
  ['input','select','button','table','code_block','image'].includes(e.type)
) || [];
const needsEnrichment = !frame.enriched && contentElements.length < 2;
```

**Fluxo:**
1. Fetch pipeline → lesson_id → steps
2. Coletar frames com `needsEnrichment`
3. Aplicar batching (batch_size, batch_index) — MANTER interface atual
4. Para cada frame: chamar `enrichFrame()` → salvar JSON enriquecido de volta em `v10_lesson_steps`
5. ZERO upload para Storage, ZERO geração de PNG
6. Retornar `{ total, processed, success, failed, hasMoreBatches }` — mesma interface

**Preservar:** Auth, CORS, batch logic, retry com backoff para 429, Refero como referência (passar screenshots como contexto textual no prompt, não como imagem)

### Arquivo 2: `src/components/admin/v10/stages/Stage4Mockups.tsx` — Atualizar UI

**Linha 376 — Trocar contagem de "mockups":**
```typescript
// ANTES
const mockupCount = step.frames?.filter((f: any) => f.mockup_url).length || 0;
// DEPOIS
const mockupCount = step.frames?.filter((f: any) => f.enriched || (f.elements?.length >= 3)).length || 0;
```

**Linhas 401-411 — Trocar `<img>` por FrameRenderer em miniatura:**
```typescript
// ANTES
<img src={frame.mockup_url} alt={`Mockup frame ${fi + 1}`} className="h-20 rounded border object-cover" />
// DEPOIS
<div className="mt-2 w-48 transform scale-[0.25] origin-top-left h-[160px] overflow-hidden rounded border pointer-events-none">
  <FrameRenderer frame={frame} accentColor={frame.bar_color || '#6366F1'} />
</div>
```

**Remover:** `handleUploadMockup` (linhas 89-135), `handleDeleteMockup` (linhas 138-162), `handleImportReferoScreen` (linhas 184-205), upload `<input type="file">` (linhas 414-429), Refero import dropdown (linhas 431-449), delete button (linhas 450-458)

**Manter:** Refero search como referência visual, auto-loop em `handleGenerateMockups`, barra de progresso

**Renomear:** Botão "Gerar Mockups com IA" → "Enriquecer Frames com IA"

### Arquivo 3: `supabase/functions/v10-assembly-check/index.ts` — Validação

**Linhas 141-148 — Trocar validação:**
```typescript
// ANTES
return frames.every((f: any) => f.mockup_url && f.mockup_url !== "");
// DEPOIS
return frames.every((f: any) => f.elements && Array.isArray(f.elements) && f.elements.length >= 3);
```

### Arquivo 4: `src/components/admin/v10/stages/Stage6Assembly.tsx` — Label

**Linha 43:**
```typescript
// ANTES
{ key: 'mockups_ok', label: 'Todos os frames têm mockup_url (verificação real)', fixStage: 3, fixLabel: 'Upload Mockups' },
// DEPOIS
{ key: 'mockups_ok', label: 'Todos os frames têm elements suficientes (≥3)', fixStage: 3, fixLabel: 'Enriquecer Frames' },
```

---

## 3. ANÁLISE DE EFEITOS SISTÊMICOS

| Componente | Impacto | Ação |
|---|---|---|
| `FrameRenderer.tsx` (player) | NENHUM — já renderiza elements, nunca usou mockup_url | Nenhuma |
| `v10-generate-images/index.ts` (Stage 4) | NENHUM — gera diagramas conceituais, não mockups | Nenhuma |
| `v10-assembly-check/index.ts` | DIRETO — mockups_ok precisa trocar validação | Alterar |
| `Stage6Assembly.tsx` | DIRETO — label do checklist precisa atualizar | Alterar |
| `Stage4Mockups.tsx` | DIRETO — preview e fluxo de upload precisam mudar | Alterar |
| `v10-generate-mockups/index.ts` | DIRETO — reescrever de image AI para text AI | Alterar |
| `v10_bpa_pipeline` colunas `mockups_total`, `mockups_from_refero`, `mockups_generic` | Podem continuar existindo — `mockups_total` = total frames, semântica muda de "mockup images" para "frames enriched" | Nenhuma migration |
| Storage bucket `lesson-audios` path `v10-mockups/` | Lixo antigo — PNGs gerados anteriormente ficam no Storage mas não são mais usados | Inofensivo |
| `supabase/config.toml` | `v10-generate-mockups` já registrado — nenhuma alteração | Nenhuma |

## 4. GAPS IDENTIFICADOS E COBERTOS

| Gap | Coberto? |
|---|---|
| IA retorna JSON malformado | Sim — try/catch + fallback para frame original |
| Frames já ricos sendo reprocessados | Sim — skip se `enriched === true` ou `elements.length >= 3` |
| FrameRenderer em miniatura cortado no admin | Sim — `transform: scale(0.25)` + `origin-top-left` + `overflow-hidden` com altura fixa |
| Import de FrameRenderer no admin (path) | Sim — import de `@/components/lessons/v10/PartB/FrameRenderer` |
| Timeout da edge function | Sim — batch_size mantido, text AI ~3-5s/frame vs ~10s/frame image |
| Stage 4 (Imagens) gerando mockups por engano | Não afetado — Stage 4 já foi corrigido para gerar apenas diagramas |
| `mockup_url` campo órfão no tipo V10Frame | Inofensivo — campo continua no type mas não é mais populado/usado |

## 5. RISCOS

| Risco | Severidade | Mitigação |
|---|---|---|
| IA não gera elements fiéis à interface real | Médio | Prompt inclui 6 exemplos reais completos + nome do app + lista dos 15 types |
| IA ignora `enriched` flag e reenriquece | Baixo | Filtro no edge function: skip se `frame.enriched === true` |
| Frames com >15 elements ficando pesados | Baixo | Limite no prompt: "máximo 12 elements por frame" |

