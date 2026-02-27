

# Identidade Visual Unificada - Icones e Banners

## Problema Atual

1. **Icones de Trilha no Dashboard (V7)**: Todas as trilhas usam o icone generico `BookOpen`, ignorando o campo `icon` que ja existe no banco de dados (Brain, Target, Zap, Rocket, etc.)
2. **Icones de Licao**: Nenhuma licao tem icone proprio - todas usam icones genericos de status (PlayCircle, Lock, CheckCircle)
3. **Banners internos desalinhados**: As paginas TrailDetail, CourseDetail e V8TrailDetail usam gradientes antigos (`#6CB1FF -> #837BFF`) que nao combinam com o novo design do Dashboard (Premium Blue e Indigo/Violet)
4. **Falta de harmonia**: Cada pagina interna tem um visual diferente, sem identidade consistente

## Plano de Implementacao

### 1. Corrigir icones das trilhas no Dashboard (V7)

No `Dashboard.tsx`, os TrailCards V7 usam `Icon={BookOpen}` hardcoded. Vou usar o mapeamento `TRAIL_ICONS` que ja existe no arquivo para mapear o campo `trail.icon` do banco de dados ao icone Lucide correto.

**Arquivo**: `src/pages/Dashboard.tsx`
- Trocar `Icon={BookOpen}` por `Icon={TRAIL_ICONS[trail.icon] || BookOpen}` nos dois locais (mobile carousel e desktop grid)

### 2. Adicionar icones semanticos por licao

Criar um sistema de mapeamento de icones baseado em palavras-chave do titulo da licao. Isso atribui automaticamente icones profissionais (Lucide) relevantes ao conteudo de cada aula.

**Novo arquivo**: `src/utils/lessonIconMap.ts`
- Funcao `getLessonIcon(title: string)` que analisa o titulo da licao e retorna um icone Lucide adequado
- Mapeamento por palavras-chave: "fundamento" -> Brain, "video" -> Video, "prompt" -> MessageSquare, "planilha" -> Table, "renda" -> DollarSign, "venda" -> ShoppingCart, etc.
- Fallback para BookOpen quando nao encontrar correspondencia

**Arquivos modificados**:
- `src/components/lessons/v8/V8LessonCard.tsx` - Usar `getLessonIcon` para mostrar icone da licao no lugar do numero
- `src/pages/CourseDetail.tsx` - Usar `getLessonIcon` para mostrar icone da licao no lugar de PlayCircle generico

### 3. Modernizar banners internos das trilhas (V7)

Alinhar o banner da pagina `TrailDetail.tsx` com o design premium do Dashboard.

**Arquivo**: `src/pages/TrailDetail.tsx`
- Alterar gradiente do banner de `#6CB1FF -> #837BFF` para `#1E3A8A -> #1D4ED8 -> #3B82F6` (Premium Blue, alinhado com "Renda Extra PRO")
- Adicionar badge "RENDA EXTRA PRO" no canto superior do banner
- Usar o icone Lucide correto da trilha (mapeamento TRAIL_ICONS) ao inves de apenas o emoji

### 4. Modernizar banner do CourseDetail (Jornadas)

**Arquivo**: `src/pages/CourseDetail.tsx`
- Alterar gradiente de `#6CB1FF -> #837BFF` para gradiente alinhado com a trilha pai
- Adicionar icone Lucide do curso ao lado do titulo

### 5. Alinhar banner do V8TrailDetail

**Arquivo**: `src/pages/V8TrailDetail.tsx`
- Manter gradiente Indigo/Violet (ja esta alinhado com "Seu Caminho de Maestria")
- Verificar consistencia com o card V8 do Dashboard

### 6. Icones do CourseCard nas jornadas

**Arquivo**: `src/pages/TrailDetail.tsx`
- Usar o mapeamento `COURSE_ICONS` para exibir o icone correto de cada curso/jornada, consistente com o icone da trilha pai

---

### Detalhes Tecnicos

**Mapeamento de icones por licao (`getLessonIcon`)**:

```text
Palavras-chave -> Icone Lucide
"fundamento/basico/base"    -> Brain
"ia/inteligencia"           -> Bot
"prompt"                    -> MessageSquare
"video"                     -> Video
"imagem/foto"               -> Image
"planilha/organiza"         -> Table
"renda/dinheiro/monetiz"    -> DollarSign
"venda/cliente"             -> ShoppingCart
"negocio/empresa"           -> Briefcase
"codigo/app/programa"       -> Code
"copyright/direito"         -> Shield
"avancado/expert"           -> Gem
"plano/estrategia"          -> Target
"automacao/automat"         -> Zap
"conteudo/texto/post"       -> FileText
"rede social/instagram"     -> Share2
fallback                    -> BookOpen
```

**Gradientes por contexto**:

```text
V7 Trail Banners:  linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 40%, #3B82F6 100%)  [Premium Blue]
V8 Trail Banners:  linear-gradient(135deg, #6366F1 0%, #7C3AED 50%, #8B5CF6 100%)  [Indigo/Violet]
Course Banners:    Herdam o gradiente da trilha pai
```

**Arquivos afetados**:
1. `src/pages/Dashboard.tsx` - Corrigir mapeamento de icones V7
2. `src/utils/lessonIconMap.ts` - Novo arquivo com mapeamento de icones
3. `src/components/lessons/v8/V8LessonCard.tsx` - Integrar icones por licao
4. `src/pages/CourseDetail.tsx` - Modernizar banner + icones de licao
5. `src/pages/TrailDetail.tsx` - Modernizar banner + icones de curso consistentes
6. `src/pages/V8TrailDetail.tsx` - Ajustes menores de consistencia

