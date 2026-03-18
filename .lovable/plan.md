

# Plano: Grid Visual de Thumbnails na Etapa 3 (Stage3Images)

## Estado Atual
O componente `Stage3Images.tsx` já possui um grid básico de preview (linhas 296-358) que mostra imagens encontradas nos frames, mas falta:
- **Status por imagem** (gerada/aprovada/rejeitada)
- **Botão regenerar individual**
- **Upload manual por imagem**
- O grid atual é escondido atrás de toggle "Ver Imagens"

## Plano de Implementação

### Mudanças em `src/components/admin/v10/stages/Stage3Images.tsx`

1. **Tornar o grid sempre visível** (remover toggle) e movê-lo para posição central no componente.

2. **Adicionar estado de status por imagem** — usar um `Map<string, 'generated' | 'approved' | 'rejected'>` persistido localmente. Cada imagem será identificada por `stepId:elementIndex`. O status será derivado automaticamente:
   - `generated`: tem `src` preenchido
   - `approved`/`rejected`: controlado por botões no card

3. **Novo layout do card de imagem** com:
   - Thumbnail (já existe)
   - Badge de status colorido (verde=aprovada, amarelo=gerada, vermelho=rejeitada)
   - Botão "Aprovar" / "Rejeitar" toggle
   - Botão "Regenerar" — chama a edge function `v10-generate-images` para apenas aquele step
   - Botão "Upload" — input file hidden que faz upload para `lesson-audios/v10-images/` e atualiza o `src` do elemento no frame

4. **Regenerar individual** — invocar `supabase.functions.invoke('v10-generate-images')` passando `pipeline_id`, `step_ids: [stepId]` como filtro de 1 step. Se a edge function não suportar `step_ids`, fazer fallback gerando para o step completo via prompt direto ao Gemini (novo parâmetro na edge function).

5. **Upload manual** — `<input type="file" accept="image/*">` que:
   - Faz upload para bucket `lesson-audios` path `v10-images/{stepId}/{timestamp}.png`
   - Obtém public URL
   - Atualiza o `src` do elemento image no frame JSONB do step
   - Atualiza o grid

6. **Contadores automáticos** — Após cada ação (aprovar/rejeitar/regenerar/upload), recalcular `imagesGenerated` e `imagesApproved` a partir do estado real do grid.

### Mudança na Edge Function `v10-generate-images/index.ts`

Adicionar suporte ao parâmetro opcional `step_ids: string[]` no body. Quando presente, filtrar apenas esses steps ao invés de processar todos. Isso permite regeneração individual sem reprocessar o lote inteiro.

### Arquivos Alterados
- `src/components/admin/v10/stages/Stage3Images.tsx` — Reescrever grid com status, ações individuais, upload
- `supabase/functions/v10-generate-images/index.ts` — Adicionar filtro `step_ids`

### Sem Novos Arquivos de Migração
Nenhuma mudança de schema necessária. O status das imagens será gerenciado via estado do componente e derivado dos dados existentes nos frames JSONB.

