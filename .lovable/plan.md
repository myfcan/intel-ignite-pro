

# Diagnóstico: Aula "SDR de Voz com IA" — Tela Escura / Parcial

## Bug Confirmado com Dados Reais

**Registro de progresso no banco:**
```
current_part: B
current_step: 0    ← CAUSA RAIZ
current_frame: 0
completed: false
user_id: 4c59eb45-5d48-4c17-a5f2-40d1b472c0dd
```

## Cadeia de Falha (com linhas reais)

**1. LessonContainer.tsx, linha 449** — calcula `initialStep`:
```tsx
initialStep={Math.min((userProgress?.current_step ?? 1) - 1, Math.max(steps.length - 1, 0))}
```
Com `current_step = 0`: `Math.min((0 - 1), 26)` = **`-1`**

**2. PartBScreen.tsx, linha 57** — inicializa com -1:
```tsx
const [currentStepIndex, setCurrentStepIndex] = useState(initialStep); // useState(-1)
```

**3. PartBScreen.tsx, linhas 73-74** — índice inválido:
```tsx
const currentStep = steps[-1];       // → undefined
const currentFrame = currentStep?.frames?.[0]; // → undefined
```

**4. PartBScreen.tsx, linhas 396-398** — retorna null:
```tsx
if (!currentStep || !currentFrame) {
    return null;  // ← TELA VAZIA
}
```

**Resultado:** Part B renderiza `null`. No desktop, só a sidebar lateral aparece (visível a partir de `lg:flex` / 1024px). No mobile, tudo fica escuro.

## Origem do `current_step: 0`

LessonContainer.tsx, linhas 168-174 — o insert inicial grava `current_step: 0`:
```tsx
const newProgress = {
    user_id: user.id,
    lesson_id: lesson.id,
    current_part: 'A',
    current_step: 0,   // ← default errado (0-based), mas consumido como 1-based
    current_frame: 0,
    ...
};
```

Porém, ao avançar passos (linha 231), salva como 1-based:
```tsx
debouncedSave({ current_step: step + 1, current_frame: frame });
```

O valor 0 é um estado intermediário que ocorre quando o progresso é criado mas o usuário ainda não avançou nenhum passo da Part B. Quando a Part B inicia, esse 0 é transformado em -1 pelo cálculo `(current_step - 1)`.

## Correção

Dois pontos, ambos em **`src/components/lessons/v10/LessonContainer.tsx`**:

**Fix 1 — Linha 449:** Proteger contra valores ≤ 0:
```tsx
initialStep={Math.max(0, Math.min((userProgress?.current_step ?? 1) - 1, steps.length - 1))}
```

**Fix 2 — Linha 174:** Corrigir default para 1 (consistente com a convenção 1-based):
```tsx
current_step: 1,
```

## Análise de Efeito Sistêmico

| Impacto | Risco |
|---|---|
| Outros usuários com `current_step: 0` | Mesmo bug se abrirem a aula. Fix 1 resolve retroativamente. |
| `handleProgressUpdate` (linha 231) | Já salva 1-based (`step + 1`). Sem conflito. |
| `initialFrame` (linha 450) | Usa `current_frame ?? 0`. Sem risco — 0 é válido como índice. |
| Part A / Part C | Não consomem `current_step`. Sem impacto. |
| Dashboard / progresso | Lê `completed` e `current_part`, não `current_step` diretamente. Sem impacto. |

**Conclusão:** Correção cirúrgica de 2 linhas, sem efeitos colaterais.

