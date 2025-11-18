# 🏗️ Arquitetura do Sistema de Missões Diárias

## 📊 Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────────┐
│                     SISTEMA DE MISSÕES DIÁRIAS                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      FASE 1: BANCO DE DADOS                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│ missions_daily_       │   ← Admins criam templates
│ templates             │      (ex: "Complete 3 aulas")
│                       │
│ - title               │
│ - description         │
│ - requirement_type    │   ← "aulas" | "exercicios" | "streak"
│ - requirement_value   │   ← Meta (ex: 3)
│ - reward_type         │   ← "xp" | "points" | "badge"
│ - reward_value        │   ← Valor (ex: 50)
└──────────────────────┘
         │
         │ Templates usados para gerar →
         │
         ↓
┌──────────────────────┐
│ user_daily_missions  │   ← Missões específicas do usuário
│                       │
│ - user_id            │
│ - mission_id         │   ← FK para template
│ - date               │   ← Data da missão
│ - progress_value     │   ← Progresso atual (ex: 2/3)
│ - completed          │   ← true quando atinge meta
│ - reward_claimed     │   ← true quando usuário coleta
└──────────────────────┘

┌──────────────────────┐
│ user_streaks         │   ← Controle de streak
│                       │
│ - user_id (PK)       │
│ - current_streak     │   ← Dias consecutivos
│ - best_streak        │   ← Recorde do usuário
│ - last_active_date   │   ← Última atividade
└──────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 FASE 2: GERAÇÃO AUTOMÁTICA DIÁRIA               │
└─────────────────────────────────────────────────────────────────┘

             ┌─────────────────────────┐
             │   CRON JOB (00:00 UTC)  │
             │   generate-daily-       │
             │   missions              │
             └───────────┬─────────────┘
                         │
                         │ Executa diariamente
                         ↓
        ┌────────────────────────────────────┐
        │                                    │
        │  1. Busca todos templates          │
        │  2. Busca todos usuários           │
        │  3. Para cada usuário:             │
        │     • Cria missões do dia          │
        │     • Verifica missões de ontem    │
        │     • Atualiza streak              │
        │                                    │
        └────────────────────────────────────┘
                         │
                         ↓
        ┌────────────────────────────────────┐
        │    LÓGICA DE STREAK (Fase 2)       │
        │                                    │
        │  SE completou ≥1 missão ontem:     │
        │    current_streak++                │
        │                                    │
        │  SENÃO (quebrou o streak):         │
        │    current_streak = 0              │
        │                                    │
        │  best_streak = max(current, best)  │
        └────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              FASE 3: TRACKING AUTOMÁTICO EM TEMPO REAL          │
└─────────────────────────────────────────────────────────────────┘

FLUXO 1: Quando usuário completa uma AULA
─────────────────────────────────────────

┌─────────────────┐
│   USUÁRIO       │
│ completa aula   │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────┐
│ user-progress/index.ts          │  ← Edge Function existente
│                                 │
│ 1. Marca aula como completada   │
│ 2. Atualiza user_progress       │
│ 3. Chama update-mission-        │
│    progress:                    │
│    {                            │
│      user_id: "...",            │
│      action_type: "aulas",      │
│      increment: 1               │
│    }                            │
└──────────────┬──────────────────┘
               │
               ↓
┌─────────────────────────────────┐
│ update-mission-progress         │  ← Nova Edge Function
│                                 │
│ 1. Busca missões do tipo        │
│    "aulas" de hoje              │
│                                 │
│ 2. Incrementa progress_value    │
│                                 │
│ 3. SE progress >= requirement:  │
│    → completed = true           │
│    → Atualiza streak            │
└─────────────────────────────────┘

FLUXO 2: Quando usuário acerta um EXERCÍCIO
────────────────────────────────────────────

┌─────────────────┐
│   USUÁRIO       │
│ acerta exercício│
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────┐
│ validate-exercise/index.ts      │  ← Edge Function existente
│                                 │
│ 1. Valida resposta              │
│ 2. Se correto:                  │
│    • Atualiza exercises_        │
│      completed                  │
│    • Chama update-mission-      │
│      progress:                  │
│      {                          │
│        user_id: "...",          │
│        action_type: "exercicios"│
│        increment: 1             │
│      }                          │
└──────────────┬──────────────────┘
               │
               ↓
┌─────────────────────────────────┐
│ update-mission-progress         │
│                                 │
│ 1. Busca missões do tipo        │
│    "exercicios" de hoje         │
│                                 │
│ 2. Incrementa progress_value    │
│                                 │
│ 3. SE progress >= requirement:  │
│    → completed = true           │
│    → Atualiza streak            │
└─────────────────────────────────┘

LÓGICA DE STREAK EM TEMPO REAL (Fase 3)
────────────────────────────────────────

Quando uma missão é COMPLETADA:

┌─────────────────────────────────────┐
│  Verificar last_active_date         │
└──────────────┬──────────────────────┘
               │
               ↓
      ┌────────────────────┐
      │ É primeiro complete │
      │ do dia?             │
      └────────┬────────────┘
               │
      ┌────────┴────────┐
      │                 │
     SIM               NÃO
      │                 │
      ↓                 ↓
┌──────────────┐  ┌──────────────┐
│ Verificar se │  │ Apenas loga  │
│ ontem foi o  │  │ (já atualizou│
│ last_active  │  │ hoje)        │
└──────┬───────┘  └──────────────┘
       │
┌──────┴────────┐
│               │
│ Ontem = last? │
│               │
└───┬───────────┘
    │
┌───┴────┐
│        │
SIM     NÃO
│        │
↓        ↓
Streak++  Streak=1
Best?     Best?

┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND INTEGRATION                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┐
│  useDailyMissions Hook          │  ← Hook React
│                                 │
│  • loadMissions()               │  ← Carrega missões do dia
│  • loadStreak()                 │  ← Carrega streak
│  • claimReward(missionId)       │  ← Marca reward_claimed
│  • Realtime subscription        │  ← Auto-refresh
│                                 │
│  Returns:                       │
│  - missions[]                   │
│  - streak                       │
│  - loading                      │
│  - claimReward()                │
│  - refetch()                    │
└─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO COMPLETO DO USUÁRIO                    │
└─────────────────────────────────────────────────────────────────┘

DIA 1 - 00:00 UTC
─────────────────
Cron job gera missões:
  ✓ Complete 3 aulas (0/3)
  ✓ Acerte 10 exercícios (0/10)
  ✓ Complete 1 aula (0/1)

Streak: 0 dias

DIA 1 - 10:00
─────────────
Usuário completa 1ª aula:
  ✓ Complete 3 aulas (1/3)
  ✓ Acerte 10 exercícios (0/10)
  ✓ Complete 1 aula (1/1) ✅ COMPLETA!

Streak atualizado: 1 dia 🔥

DIA 1 - 11:00
─────────────
Usuário coleta recompensa da missão "Complete 1 aula":
  → +20 XP (reward_claimed = true)

DIA 1 - 14:00
─────────────
Usuário completa 2ª aula:
  ✓ Complete 3 aulas (2/3)

Usuário acerta 5 exercícios:
  ✓ Acerte 10 exercícios (5/10)

DIA 2 - 00:00 UTC
─────────────────
Cron job verifica:
  • Completou ≥1 missão ontem? SIM
  • Streak++: 2 dias 🔥🔥

Gera novas missões:
  ✓ Complete 3 aulas (0/3)
  ✓ Acerte 10 exercícios (0/10)
  ✓ Complete 1 aula (0/1)

DIA 3 - USUÁRIO NÃO ENTRA
─────────────────────────

DIA 4 - 00:00 UTC
─────────────────
Cron job verifica:
  • Completou ≥1 missão DIA 3? NÃO
  • Streak resetado: 0 dias 💔

Gera novas missões para DIA 4...

┌─────────────────────────────────────────────────────────────────┐
│                       SEGURANÇA E RLS                           │
└─────────────────────────────────────────────────────────────────┘

• Usuários só veem SUAS missões
• Usuários só atualizam SUAS missões
• Usuários só veem SEU streak
• Admins têm acesso total
• Edge Functions usam Service Role Key
• Frontend usa Auth Token do usuário
• Todas operações logadas

┌─────────────────────────────────────────────────────────────────┐
│                     ESCALABILIDADE                              │
└─────────────────────────────────────────────────────────────────┘

• Índices em (user_id, date) → Queries rápidas
• Índices em (completed, reward_claimed) → Agregações eficientes
• Cron job processa usuários em loop → Não sobrecarrega
• Edge Functions stateless → Escalam automaticamente
• Realtime apenas para user_daily_missions → Eficiente

┌─────────────────────────────────────────────────────────────────┐
│                      PRÓXIMAS FASES                             │
└─────────────────────────────────────────────────────────────────┘

FASE 4: Sistema de Recompensas
• Criar tabela user_rewards
• Integrar com points_history
• Conectar reward_type com sistema de pontos
• Criar badges/achievements automáticos

FASE 5: Interface Visual
• Componente MissoesDiarias
• Painel de Streak animado
• Cards de missões com progresso
• Botão "Coletar Recompensa"
• Animações de conclusão
• Mensagens motivacionais
