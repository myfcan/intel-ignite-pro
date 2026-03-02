

# Modal de Boas-vindas da Liv + Review de Persuasao por Licao

## Resumo

Dois modais distintos, cada um com gatilho e publico diferente:

1. **Liv Welcome (entrada na arvore)** — Para TODOS os usuarios, apenas no primeiro acesso a cada trilha
2. **Review de Licao (clique na licao)** — Apenas para usuarios `basico` (free/paywall), aparece TODA vez que clicam em uma licao, ate virarem assinantes (`ultra` ou `pro`)

---

## Regras de exibicao

| Gatilho | Quem ve | Frequencia | Como sai |
|---|---|---|---|
| Entrar na arvore (V8TrailDetail) | Todos (basico, ultra, pro, admin) | 1x por trilha (localStorage `liv-trail-welcome-{trailId}`) | Clica "Continuar" |
| Clicar em uma licao na arvore | Apenas `basico` | TODA vez que clicar | Clica "Continuar" (nao navega para a licao) |

Quando o usuario vira assinante (`ultra` ou `pro`), o review para de aparecer automaticamente (checagem do `users.plan` no banco).

---

## Componentes

### 1. `V8LivTrailWelcome.tsx` (NOVO)

Modal da Liv que aparece ao entrar na arvore. Reutiliza o visual do `LivWelcomeModal` existente (avatar, glow, particulas) mas com texto contextual sobre a trilha:

- Avatar da Liv com glow
- Texto: "Oi! Que bom te ver aqui na trilha **{trailTitle}**! Preparei tudo com carinho pra voce aprender no seu ritmo."
- Botao "Vamos la!" (delay de 2s para forcar leitura)
- Controle: `localStorage` com chave `liv-trail-welcome-{trailId}` — aparece 1x por trilha

### 2. `V8LessonReviewGate.tsx` (NOVO)

Modal de prova social focado na licao clicada. Aparece como barreira para usuarios `basico`:

- Header: "O que dizem sobre esta aula"
- Nome da licao em destaque
- 3-4 depoimentos hardcoded focados no tema da licao (texto generico mas que funciona para qualquer aula: "Essa aula mudou minha visao", "Conteudo direto ao ponto", etc.)
- Rating visual (estrelas)
- Botao "Continuar" (fecha o modal, NAO navega para a licao — funciona como barreira de persuasao)
- Opcional: botao "Quero desbloquear tudo" que leva para a pagina de pricing

### 3. Alteracoes em `V8TrailDetail.tsx`

- Buscar `users.plan` do usuario logado (query ja disponivel ou nova query simples)
- Estado `showLivWelcome` — controlado por localStorage per-trail
- Estado `showReviewGate` + `selectedLessonForReview` — ativado no clique da licao
- Interceptar `onLessonClick`:
  - Se `plan === 'basico'` e nao admin: abre `V8LessonReviewGate` ao inves de navegar
  - Se `plan === 'ultra'` ou `plan === 'pro'` ou admin: navega normalmente

---

## Fluxo do usuario

```text
Usuario entra na arvore (V8TrailDetail)
  |
  +-- Primeiro acesso nessa trilha?
  |     Sim -> Modal Liv Welcome -> "Continuar" -> fecha
  |     Nao -> nada
  |
  +-- Clica em uma licao
        |
        +-- plan = 'ultra' ou 'pro' ou admin?
        |     Sim -> navega para /v8/{lessonId}
        |
        +-- plan = 'basico'?
              Sim -> Modal Review Gate (com nome da licao)
                     -> "Continuar" (fecha modal, nao navega)
                     -> "Desbloquear tudo" (vai para pricing)
```

---

## Detalhes tecnicos

**Buscar plano do usuario** — Nova query em `V8TrailDetail`:
```text
SELECT plan FROM users WHERE id = auth.uid()
```

**Depoimentos hardcoded** — Array de 5 reviews genericos que servem para qualquer licao:
- "Essa aula foi um divisor de aguas pra mim"
- "Conteudo claro e direto, sem enrolacao"
- "Apliquei no mesmo dia e ja vi resultado"
- "Melhor investimento de tempo que fiz"
- "Nao sabia que IA podia ser tao simples"

Cada review mostra 3-4 desses com rotacao pseudo-aleatoria baseada no ID da licao.

**Arquivos criados:**
- `src/components/lessons/v8/V8LivTrailWelcome.tsx`
- `src/components/lessons/v8/V8LessonReviewGate.tsx`

**Arquivos modificados:**
- `src/pages/V8TrailDetail.tsx` (adicionar queries, estados, interceptar clique)

**Nenhuma mudanca no banco de dados** — tudo frontend, usando dados ja existentes (`users.plan`).
