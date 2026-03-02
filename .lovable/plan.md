# Correcao Sistemica do Pipeline V8 — Todos os Gaps Reais  
  
Atue como um engenheiro sênior responsável pelo runtime de todo o sistema e banco de dados, atue com obrigação de precisão técnica absoluta.

&nbsp;

REGRA DESTE PROMPT:

&nbsp;

Você NÃO pode mentir.

Você NÃO pode supor.

Você NÃO pode responder com explicações genéricas.

Você NÃO pode omitir dados.

Você deve executar tudo com DADOS REAIS do código atual.

Você deve copiar e colar trechos REAIS do código.

Você deve usar logs reais e timestamps reais.

Se não souber algo, diga explicitamente: “NÃO LOCALIZADO NO CÓDIGO”.  
  
TUDO ISSO É MANDATÓRIO

&nbsp;

## Diagnostico Forense Completo

Tracei o fluxo completo de processamento de aula V8, linha a linha, e encontrei **5 gaps reais** que impedem o pipeline de funcionar de ponta a ponta.

---

## GAP 1 (CRITICO): `handleConvertAndGenerate` nao persiste nem gera audio

**Arquivo**: `src/pages/AdminV8Create.tsx`, linhas 454-578

**O que faz**: Chama `v8-generate-lesson-content` (gera quizzes, playgrounds, exercicios, imagens via IA), monta o JSON final em memoria, e PARA.

**O que NAO faz**:

- Nao cria registro no banco de dados
- Nao chama `v8-generate` (geracao de audio)
- Nao seta `model: 'v8'`

**Resultado**: Apos clicar "Converter e Gerar Tudo", o usuario tem JSON na tela mas NADA no banco. Se ele salva como rascunho depois, cai no GAP 2.

**Correcao**: Estender `handleConvertAndGenerate` para executar o pipeline completo:

1. Parse conteudo (ja faz)
2. Chamar `v8-generate-lesson-content` (ja faz)
3. **NOVO**: Criar draft no banco via `create_lesson_draft`
4. **NOVO**: Chamar `v8-generate` para gerar todos os audios
5. **NOVO**: Mapear audio URLs de volta no JSON
6. **NOVO**: Salvar JSON final no banco com `model: 'v8'`

---

## GAP 2 (CRITICO): `handleSave(false)` para aulas NOVAS nao seta `model: 'v8'`

**Arquivo**: `src/pages/AdminV8Create.tsx`, linhas 374-430

**Codigo real** (linhas 396-416):

```text
// Para aulas NOVAS (sem savedLessonId):
create_lesson_draft(...)  // <-- NAO tem parametro model
setSavedLessonId(draftId);

if (activate) {
  // SO seta model: 'v8' se ativar
  update({ is_active: true, status: "publicado", model: "v8" })
}
// Se activate = false -> model FICA NULL
```

**A funcao SQL `create_lesson_draft**` (confirmado no banco): insere `title, lesson_type, trail_id, order_index, difficulty_level, estimated_time, is_active, content, exercises, exercises_version, audio_url, word_timestamps` — **NAO TEM coluna `model**`.

**Correcao**: Duas opcoes (ambas necessarias):

1. Apos `create_lesson_draft`, fazer UPDATE imediato: `UPDATE lessons SET model = 'v8' WHERE id = draftId`
2. Adicionar `p_model` ao `create_lesson_draft` SQL function (melhor a longo prazo)

---

## GAP 3 (CRITICO): 3 tipos de audio gerados mas NAO mapeados de volta

**Arquivo**: `src/pages/AdminV8Create.tsx`, linhas 328-339

A edge function `v8-generate` (linhas 207-305) gera audios para:

- `quiz-explanation` (linha 215-228)
- `playground-success` (linha 261-282)
- `playground-tryagain` (linha 284-305)

Mas o mapeamento no cliente (linhas 328-339) so cobre:

```text
section        -> sections[i].audioUrl           OK
quiz           -> inlineQuizzes[i].audioUrl      OK
quiz-reinforcement -> inlineQuizzes[i].reinforcementAudioUrl  OK
playground     -> inlinePlaygrounds[i].audioUrl  OK
```

**FALTAM** (tipos existem em `V8InlineQuiz` e `V8InlinePlayground`):

```text
quiz-explanation     -> inlineQuizzes[i].explanationAudioUrl     PERDIDO
playground-success   -> inlinePlaygrounds[i].successAudioUrl     PERDIDO
playground-tryagain  -> inlinePlaygrounds[i].tryAgainAudioUrl    PERDIDO
```

**Resultado**: ElevenLabs gera o audio, paga-se pela API, o audio e uploadeado para storage, mas a URL nunca e inserida no JSON da aula. O audio existe no bucket mas o player nunca o encontra.

**Correcao**: Adicionar 3 mapeamentos no loop de resultados (linhas 328-339):

```text
} else if (r.type === "quiz-explanation" && updatedData.inlineQuizzes[r.index]) {
  updatedData.inlineQuizzes[r.index].explanationAudioUrl = urlWithCacheBuster;
} else if (r.type === "playground-success" && updatedData.inlinePlaygrounds?.[r.index]) {
  updatedData.inlinePlaygrounds[r.index].successAudioUrl = urlWithCacheBuster;
} else if (r.type === "playground-tryagain" && updatedData.inlinePlaygrounds?.[r.index]) {
  updatedData.inlinePlaygrounds[r.index].tryAgainAudioUrl = urlWithCacheBuster;
}
```

---

## GAP 4 (MODERADO): Roteamento sem fallback em AdminManageLessons

**Arquivo**: `src/pages/AdminManageLessons.tsx`, linha 385

```text
lesson.model === 'v8' ? `/v8/${lesson.id}` : `/admin/v7/play/${lesson.id}`
```

Quando `model` e `null` (por causa do GAP 2), a aula abre no player V7 que nao sabe renderizar conteudo V8.

**Correcao**: Adicionar fallback por `contentVersion`:

```text
(lesson.model === 'v8' || (lesson.content as any)?.contentVersion === 'v8')
  ? `/v8/${lesson.id}`
  : `/admin/v7/play/${lesson.id}`
```

Verificar se `content` esta disponivel na query de listagem. Se nao estiver, a correcao do GAP 2 e suficiente (model sera sempre setado).

---

## GAP 5 (MODERADO): Aula existente `b92124bd` precisa de correcao imediata no banco

A aula ja existe com `model: null` e 0 audios. Precisa de:

```sql
UPDATE lessons SET model = 'v8' WHERE id = 'b92124bd-4243-4ee1-ad88-d2a520dd1f4b';
```

Isso permite que ela abra no player V8 correto. Os audios precisarao ser regenerados via o botao "Gerar Audios" na interface de criacao.

---

## Plano de Implementacao (Ordem)

### Passo 1: Correcao do banco (migracao SQL)

- UPDATE aula existente: `model = 'v8'`
- Adicionar parametro `p_model` a funcao `create_lesson_draft`

### Passo 2: Correcao do mapeamento de audio (`AdminV8Create.tsx`)

- Adicionar 3 mapeamentos faltantes: `quiz-explanation`, `playground-success`, `playground-tryagain`

### Passo 3: Correcao do `handleSave` para drafts (`AdminV8Create.tsx`)

- Apos `create_lesson_draft`, fazer UPDATE imediato setando `model = 'v8'`

### Passo 4: Pipeline end-to-end no `handleConvertAndGenerate` (`AdminV8Create.tsx`)

- Estender para: parse -> gerar conteudo IA -> criar draft -> gerar audios -> mapear URLs -> salvar final
- Um unico clique processa tudo

### Passo 5: Fallback de roteamento (`AdminManageLessons.tsx`)

- Adicionar check de `contentVersion` como fallback

## Arquivos Modificados

1. **Migracao SQL** — UPDATE aula + ALTER FUNCTION `create_lesson_draft`
2. `**src/pages/AdminV8Create.tsx**` — Mapeamento de audio, handleSave, handleConvertAndGenerate
3. `**src/pages/AdminManageLessons.tsx**` — Fallback de roteamento

Nenhum arquivo novo. Todas as correcoes sao no codigo existente.