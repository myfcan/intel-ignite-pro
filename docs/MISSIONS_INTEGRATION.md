# 🎯 Sistema de Missões Diárias - Integração Completa

## 📋 Resumo da Implementação

O sistema de missões diárias está **100% integrado** com aulas e exercícios, atualizando automaticamente o progresso conforme o usuário interage com o app.

---

## 🔄 Fluxos Implementados

### ✅ FLUXO 1 — Entrar no app / receber missões do dia
- **Status**: ⚠️ Parcialmente implementado
- **Funcionamento**: 
  - Hook `useDailyMissions` carrega missões ao montar
  - ⚠️ **FALTA**: Geração automática se não existirem missões hoje
- **Próximo Passo**: Adicionar verificação + chamada para `generate-daily-missions`

### ✅ FLUXO 2 — Concluir aula → atualizar missão
- **Status**: ✅ **100% IMPLEMENTADO**
- **Arquivos Modificados**:
  - `src/pages/Lesson.tsx` (linha ~191)
  - `src/components/lessons/GuidedLesson.tsx` (linha ~1321)
- **Funcionamento**:
  ```typescript
  // Quando aula é completada
  await updateMissionProgress('aulas', 1);
  ```

### ✅ FLUXO 3 — Acertar exercícios → atualizar missão
- **Status**: ✅ **100% IMPLEMENTADO**
- **Arquivos Modificados**:
  - `src/pages/Lesson.tsx` (linha ~123)
  - `src/components/lessons/ExercisesSection.tsx` (linha ~65)
- **Funcionamento**:
  ```typescript
  // Quando exercício é acertado (score >= 70%)
  if (score >= 70) {
    await updateMissionProgress('exercicios', 1);
  }
  ```

### ✅ FLUXO 4 — Coletar recompensa
- **Status**: ✅ **100% IMPLEMENTADO**
- **Arquivos**:
  - `src/hooks/useDailyMissions.ts`
  - `src/components/gamification/MissoesDiarias.tsx`
  - Edge Function: `supabase/functions/collect-reward/index.ts`
- **Funcionamento**:
  - Botão "Coletar" aparece quando missão está completa
  - Chama edge function que atualiza `user_rewards` e `points_history`
  - Confetti celebra a coleta
  - Atualiza `total_points` do usuário

### ✅ FLUXO 5 — Streak
- **Status**: ✅ **100% IMPLEMENTADO VIA TRIGGER**
- **Arquivo**: Trigger no banco de dados
- **Funcionamento**:
  - Quando missão é completada, trigger atualiza `user_streaks`
  - Incrementa `current_streak` se último dia ativo foi ontem
  - Reseta para 1 se não for consecutivo
  - Atualiza `best_streak` se quebrar recorde

### ⚠️ FLUXO 6 — Quebrar a streak
- **Status**: ⚠️ Parcialmente implementado
- **Funcionamento**: Trigger cuida da lógica
- **FALTA**: Mensagem motivacional no frontend

---

## 📁 Arquitetura de Arquivos

### Frontend
```
src/
├── lib/
│   └── updateMissionProgress.ts         # ⭐ Helper principal
├── hooks/
│   └── useDailyMissions.ts              # Hook para carregar/coletar
├── components/
│   └── gamification/
│       └── MissoesDiarias.tsx           # UI das missões
└── pages/
    ├── Lesson.tsx                       # ✅ Integrado
    └── Dashboard.tsx                    # Exibe componente
```

### Backend (Edge Functions)
```
supabase/functions/
├── update-mission-progress/index.ts     # ⭐ Atualiza progresso
├── collect-reward/index.ts              # Coleta recompensas
└── generate-daily-missions/index.ts     # Gera missões do dia
```

### Database
```
Tables:
- user_daily_missions       # Missões de cada usuário/dia
- missions_daily_templates  # Templates das missões
- user_rewards             # Recompensas a coletar
- user_streaks             # Sequência de dias

Triggers:
- create_reward_on_mission_complete  # Gera recompensa automaticamente
```

---

## 🎮 Uso da Helper Function

### `updateMissionProgress(actionType, increment)`

**Importar**:
```typescript
import { updateMissionProgress } from '@/lib/updateMissionProgress';
```

**Exemplos**:
```typescript
// Quando completa 1 aula
await updateMissionProgress('aulas', 1);

// Quando acerta 1 exercício
await updateMissionProgress('exercicios', 1);

// Quando acerta 5 exercícios de uma vez
await updateMissionProgress('exercicios', 5);
```

**Retorno**:
```typescript
{
  success: boolean;
  error?: string;
}
```

---

## 🔧 Como Adicionar Novos Tipos de Missão

### 1. Criar Template no Banco
```sql
INSERT INTO missions_daily_templates (
  title,
  description,
  requirement_type,
  requirement_value,
  reward_type,
  reward_value
) VALUES (
  'Leia 3 artigos',
  'Explore conteúdos educativos',
  'artigos',              -- Novo tipo
  3,
  'xp',
  50
);
```

### 2. Chamar no Frontend
```typescript
// Quando usuário lê um artigo
await updateMissionProgress('artigos', 1);
```

### 3. Edge Function já Suporta!
A função `update-mission-progress` é **genérica** e aceita qualquer `requirement_type`, então nenhuma mudança é necessária no backend.

---

## 🐛 Debug e Logs

Todos os pontos de integração incluem logs para facilitar debug:

```typescript
console.log('📊 [MISSIONS] Atualizando progresso: aulas +1');
console.log('✅ [MISSIONS] 2 missão(ões) completada(s)!');
console.log('🔥 [MISSIONS] Streak atualizado!');
```

Para ver logs no navegador: **Console do DevTools**
Para ver logs do backend: **Supabase Edge Function Logs**

---

## ✅ Checklist de Integração

- ✅ Helper function criada (`updateMissionProgress.ts`)
- ✅ Integrada em `Lesson.tsx` (aulas completadas)
- ✅ Integrada em `GuidedLesson.tsx` (aulas guiadas)
- ✅ Integrada em `ExercisesSection.tsx` (exercícios corretos)
- ✅ Interface visual completa
- ✅ Sistema de recompensas funcionando
- ✅ Streak atualizado via trigger
- ⚠️ Geração automática de missões (a implementar)
- ⚠️ Mensagens motivacionais (a implementar)

---

## 🚀 Próximos Passos

1. **Geração Automática de Missões**
   - Adicionar verificação ao carregar Dashboard
   - Chamar `generate-daily-missions` se necessário

2. **Mensagens Motivacionais**
   - Array de frases motivacionais
   - Randomizar ao coletar recompensa
   - Mensagem especial ao quebrar streak

3. **Animações Especiais**
   - Pulso/glow no card de streak ao aumentar
   - Shake suave ao quebrar streak

---

## 📞 Suporte

Para dúvidas sobre a integração:
- Ver logs do console
- Checar `docs/DAILY_MISSIONS_ARCHITECTURE.md`
- Verificar edge function logs no Supabase
