

# Plano em 3 Partes: Re-design + Voz + Imagens V8

---

## PARTE 1: Re-design da Jornada V8 (Estilo App Mobile Premium)

### Estado Atual (dados reais do codigo)

**V8TrailDetail.tsx** (L130-244):
- Banner gigante de ~220px com gradiente `#6366F1 → #7C3AED → #8B5CF6`
- Icone de 80px dentro de container glassmorphism
- Badge "READ & LISTEN" no header
- Box separado de progresso com texto "4/5 aulas completas"
- Barra de progresso grossa (h-3)

**V8SkillTree.tsx** (L30-324):
- Circulos de 60x68px em zigzag (pattern: center, right, center, left)
- Popover ao clicar (AnimatePresence, 240-280px de largura)
- Sem titulo visivel nos nos — precisa clicar para ver nome da aula
- Certificado como circulo grande no final

**V8SkillNode.tsx** (L38-111):
- Circulos com gradiente violeta, sem label
- Badge de indice numerico no canto inferior direito
- Icone generico por status (Lock/CheckCircle2/Play)

### O Que Sera Feito

**V8TrailDetail.tsx — Header compacto estilo app**
- Remover banner gradiente de 220px
- Header fixo compacto (~56px): botao voltar + titulo centralizado + pill de progresso %
- Card horizontal compacto de "Unidade" (icone 40px + label "UNIDADE 1" + titulo da trilha)
- Card de certificado/progresso slim (icone trophy/lock, barra fina, texto motivacional)
- Body com padding-top para compensar header fixo
- Fundo limpo `#FAFBFC` sem ruido visual

**V8SkillTree.tsx — Nos com labels visiveis e navegacao direta**
- REMOVER popover intermediario (AnimatePresence + selectedId)
- Titulo da aula VISIVEL ao lado do no, alternando esquerda/direita no zigzag
- Click direto dispara `onLessonClick` (sem etapa intermediaria)
- Certificado movido para V8TrailDetail como card separado (nao mais dentro da arvore)
- SVG connectors simplificados: sem glow excessivo, cores limpas

**V8SkillNode.tsx — Containers premium com icone contextual**
- Mudar de circulo (60x68) para container arredondado (56x56 `rounded-2xl`)
- Manter icone contextual via `getLessonIcon(title)` para nos disponiveis
- Badge "Inicio" condicional no primeiro no disponivel (substitui badge numerico)
- Remover badge numerico no canto
- Opacity e cursor corretos para locked

### Arquivos modificados

| Arquivo | Acao |
|---|---|
| `src/pages/V8TrailDetail.tsx` | Reescrever header + card unidade + card certificado |
| `src/components/lessons/v8/V8SkillTree.tsx` | Remover popover, adicionar labels laterais, click direto |
| `src/components/lessons/v8/V8SkillNode.tsx` | Container rounded-2xl, remover badge numerico, badge "Inicio" |

---

## PARTE 2: Padronizar Voz (Mesma ID + Mesmo Modelo em TUDO)

### Estado Atual (dados reais — voice IDs e model_ids)

| Edge Function | Voice ID | model_id | Status |
|---|---|---|---|
| `v8-generate/index.ts` (L10-11) | `Xb7hH8MSUJpSbSDYk0k2` (Alice) | `eleven_v3` | OK |
| `v7-vv/index.ts` (L6872, L3245) | `Xb7hH8MSUJpSbSDYk0k2` (Alice) | `eleven_v3` | OK |
| `elevenlabs-tts-contextual/index.ts` (L96, L124) | `Xb7hH8MSUJpSbSDYk0k2` (Alice) | `eleven_v3` | OK |
| `generate-lesson-audio/index.ts` (L151, L161) | `Xb7hH8MSUJpSbSDYk0k2` (Alice) | `eleven_multilingual_v2` | **ERRADO** |
| `processar-aula/index.ts` (L20, L213) | `Xb7hH8MSUJpSbSDYk0k2` (Alice) | `eleven_multilingual_v2` | **ERRADO** |
| `generate-multiple-audios/index.ts` (L28, L47) | `Xb7hH8MSUJpSbSDYk0k2` (Alice) | `eleven_multilingual_v2` | **ERRADO** |
| `generate-audio-elevenlabs/index.ts` (L38) | `Xb7hH8MSUJpSbSDYk0k2` (default) | `eleven_multilingual_v2` | **ERRADO** |
| `v7-generate-secret-audio/index.ts` (L46) | `Xb7hH8MSUJpSbSDYk0k2` (Alice) | `eleven_multilingual_v2` | **ERRADO** |
| `v7-regenerate-audio/index.ts` (L190-191) | `Xb7hH8MSUJpSbSDYk0k2` (Alice) | `eleven_multilingual_v2` | **ERRADO** |

**Resumo**: Voice ID e o MESMO em todos (Alice `Xb7hH8MSUJpSbSDYk0k2`). O problema e EXCLUSIVAMENTE o `model_id`: 5 funcoes usam `eleven_multilingual_v2` em vez de `eleven_v3`. Isso gera vozes com timbre, prosódia e estilo COMPLETAMENTE diferentes mesmo usando a mesma Alice.

### O Que Sera Feito

Atualizar `model_id` de `eleven_multilingual_v2` para `eleven_v3` em 5 edge functions:

| Arquivo | Linha | De | Para |
|---|---|---|---|
| `generate-lesson-audio/index.ts` | L161 | `eleven_multilingual_v2` | `eleven_v3` |
| `processar-aula/index.ts` | L213 | `eleven_multilingual_v2` | `eleven_v3` |
| `generate-multiple-audios/index.ts` | L47 | `eleven_multilingual_v2` | `eleven_v3` |
| `generate-audio-elevenlabs/index.ts` | L38 | `eleven_multilingual_v2` | `eleven_v3` |
| `v7-generate-secret-audio/index.ts` | L46 | `eleven_multilingual_v2` | `eleven_v3` |
| `v7-regenerate-audio/index.ts` | L191 | `eleven_multilingual_v2` | `eleven_v3` |

Nenhuma mudanca de Voice ID necessaria — ja e a mesma Alice em tudo.

---

## PARTE 3: Imagens por Sessao nas Aulas V8

### Estado Atual (dados reais)

**Tipo V8Section** (`src/types/v8Lesson.ts` L15):
```typescript
imageUrl?: string;  // Imagem com gradient overlay
```
O campo JA EXISTE no tipo.

**V8ContentSection.tsx** (L50-55):
```typescript
{section.imageUrl && (
  <div className="relative rounded-2xl overflow-hidden">
    <img src={section.imageUrl} alt={section.title}
         className="w-full h-48 sm:h-56 object-cover" />
```
O componente de renderizacao JA EXISTE e ja renderiza imagens quando `imageUrl` esta preenchido.

**v8ContentParser.ts**: NAO LOCALIZADO no parser — o campo `imageUrl` nunca e extraido do conteudo bruto. Ou seja, mesmo que o usuario escreva `imageUrl: https://...` no conteudo, o parser ignora.

**Tabela `lessons`**: NAO TEM coluna `image_url`. A imagem da aula (capa/thumbnail) nao tem onde ser armazenada no banco fora do JSON `content`.

### O Que Sera Feito

1. **Parser** (`src/lib/v8ContentParser.ts`): Adicionar extracao do campo `imageUrl` dentro de cada secao. No conteudo bruto, o usuario pode escrever `imageUrl: https://...` logo apos o `## Titulo`. O parser mapeia para `V8Section.imageUrl`.

2. **Migracao SQL**: Adicionar coluna `image_url TEXT` na tabela `lessons` para armazenar thumbnail/capa da aula (usada no SkillTree/lista).

3. **V8TrailDetail.tsx**: Atualizar query para incluir `image_url` no select e passar para o componente de lista/arvore para exibir thumbnails.

4. **Admin (AdminV8Create.tsx)**: O JSON ja aceita `imageUrl` por secao. Nenhuma mudanca necessaria no editor JSON. O parser precisa apenas da linha adicional.

### Arquivos modificados

| Arquivo | Acao |
|---|---|
| Migracao SQL | `ALTER TABLE lessons ADD COLUMN image_url TEXT` |
| `src/lib/v8ContentParser.ts` | Extrair `imageUrl` de cada secao |
| `src/pages/V8TrailDetail.tsx` | Incluir `image_url` na query + passar para componente |

