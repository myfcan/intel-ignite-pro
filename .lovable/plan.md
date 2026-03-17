

## Auditoria: Plano "Rever este passo" + Tooltip — Análise de Gaps e Efeitos Sistêmicos

---

### 1. O que o plano propõe (resumo)

- Adicionar botão **"🔄 Rever este passo"** inline no `StepContent.tsx`, após o último frame
- Adicionar **tooltip de onboarding** apontando para o "Continuar" do `PlayerBar.tsx` apenas na primeira aula

---

### 2. GAPS IDENTIFICADOS

#### Gap A — Não existe callback `onReplayStep` no pipeline

**Evidência real — `PartBScreen.tsx` linhas 304-325:**
```typescript
const handleContinue = useCallback(() => {
    if (!currentStep) return;
    if (currentFrameIndex < (currentStep.frames?.length ?? 1) - 1) {
      setCurrentFrameIndex((prev) => prev + 1);
    } else if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setCurrentFrameIndex(0);
      setCurrentTime(0);
    } else {
      onComplete();
    }
  }, [...]);
```

Existe `handleBack` (linha 328) mas **NÃO existe `handleReplayStep`**. O "Rever este passo" precisa de uma função nova que:
1. Resete `currentFrameIndex` para `0`
2. Resete `currentTime` para `0`
3. Faça `audio.currentTime = 0` e reinicie playback

**Se esquecermos o reset do áudio**, o usuário vê o frame 0 mas ouve o áudio do frame onde parou. Isso é um bug silencioso.

#### Gap B — `StepContent` não recebe nenhum callback de ação

**Evidência real — `StepContent.tsx` linhas 5-11:**
```typescript
interface StepContentProps {
  step: V10LessonStep;
  currentFrame: number;
  totalSteps: number;
  onFrameChange: (frame: number) => void;
  accentColor: string;
}
```

Para adicionar "Rever este passo", precisamos de uma nova prop `onReplayStep: () => void`. Isso altera a interface do componente e o ponto de chamada em `PartBScreen.tsx` (linha 426-432).

#### Gap C — Condição de exibição do botão "Rever"

O plano diz "no final do conteúdo do step" mas não especifica **quando** ele aparece. Se aparece sempre, é inútil no frame 0 (o usuário já está no início). Condição correta: **só exibir quando `currentFrame === lastFrame`** (último frame do step), que é quando o "Continuar" avança para o próximo step.

**Evidência real — `StepContent.tsx` linha 67:**
```typescript
{step.frames?.length > 1 && (
```
O botão "Rever" deve aparecer **após os frame dots**, condicionado a `currentFrame === (step.frames?.length ?? 1) - 1`.

#### Gap D — Tooltip de onboarding: onde persistir "já viu"?

O plano diz "tooltip apenas na primeira aula" mas não especifica **onde armazenar** que o usuário já viu. Opções:
- `localStorage` — simples, mas perde no clear/outro browser
- Tabela no banco — over-engineering para um tooltip

**Recomendação:** `localStorage` com key `v10-onboarding-seen`. É suficiente e não adiciona complexidade ao banco.

#### Gap E — Tooltip no PlayerBar: conflito com layout dark

O `PlayerBar` tem `backgroundColor: '#1A1625'` (linha 49). Um tooltip padrão (branco com border) ficará visualmente desconectado. Precisa de estilo customizado com fundo escuro/gradiente para manter coerência visual.

---

### 3. EFEITO SISTÊMICO

| Componente | Impacto | Risco |
|---|---|---|
| `StepContent.tsx` | Nova prop `onReplayStep` + botão condicional | Baixo — aditivo |
| `PartBScreen.tsx` | Nova função `handleReplayStep` + passar prop | Baixo — aditivo |
| `PlayerBar.tsx` | Tooltip condicional no "Continuar" | Baixo — visual only |
| `LIVFab.tsx` | **Nenhum** | Zero |
| `PartCScreen.tsx` | **Nenhum** | Zero |
| Banco de dados | **Nenhum** (localStorage para tooltip) | Zero |

**Sem efeito colateral destrutivo.** Todas as mudanças são aditivas. Nenhum fluxo existente é alterado — `handleContinue`, `handleBack`, e o pipeline de áudio permanecem intactos.

---

### 4. PLANO REVISADO COM GAPS CORRIGIDOS

#### Arquivos a modificar

| Arquivo | Mudança |
|---|---|
| `src/components/lessons/v10/PartB/PartBScreen.tsx` | Criar `handleReplayStep` (reset frame + audio) e passar como prop para `StepContent` |
| `src/components/lessons/v10/PartB/StepContent.tsx` | Nova prop `onReplayStep`, botão "Rever este passo" condicional (só no último frame) |
| `src/components/lessons/v10/PartB/PlayerBar.tsx` | Tooltip de onboarding no "Continuar" (só se `!localStorage.getItem('v10-onboarding-seen')`) |

#### Detalhes

**1. `PartBScreen.tsx` — nova função `handleReplayStep`**
```typescript
const handleReplayStep = useCallback(() => {
  const audio = audioRef.current;
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  setCurrentFrameIndex(0);
  setCurrentTime(0);
  setIsPlaying(false);
}, []);
```
Passar para `StepContent`: `onReplayStep={handleReplayStep}`

**2. `StepContent.tsx` — botão condicional**
- Nova prop: `onReplayStep?: () => void`
- Exibir após os frame dots, **apenas quando** `currentFrame === (step.frames?.length ?? 1) - 1`
- Design: botão ghost/outline com ícone `RotateCcw` do lucide, texto "Rever este passo", cores `text-indigo-500` com `border-indigo-200`

**3. `PlayerBar.tsx` — tooltip first-time**
- Verificar `localStorage.getItem('v10-onboarding-seen')`
- Se `null`: mostrar tooltip sobre o botão "Continuar" com texto "Toque aqui para avançar ao próximo passo"
- Ao clicar "Continuar" pela primeira vez: `localStorage.setItem('v10-onboarding-seen', 'true')` e remover tooltip
- Estilo: fundo escuro (`#2D2640`), texto branco, seta apontando para baixo, consistente com a paleta dark do PlayerBar

