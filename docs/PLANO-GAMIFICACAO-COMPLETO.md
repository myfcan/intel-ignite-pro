# 🎮 PLANO DE IMPLEMENTAÇÃO - SISTEMA DE GAMIFICAÇÃO

**Projeto:** Intel Ignite Pro
**Data:** 2025-11-25
**Versão:** 1.0

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Arquitetura e Decisões Técnicas](#arquitetura-e-decisões-técnicas)
3. [Modelo de Pontos e Patentes](#modelo-de-pontos-e-patentes)
4. [Etapa 1: Back-end - Fundamentos](#etapa-1-back-end---fundamentos)
5. [Etapa 2: Front-end - Serviço e Hook](#etapa-2-front-end---serviço-e-hook)
6. [Etapa 3: Front-end - Header Global](#etapa-3-front-end---header-global)
7. [Etapa 4: Front-end - Card de Resultado](#etapa-4-front-end---card-de-resultado)
8. [Etapa 5: Mensagens de Mérito](#etapa-5-mensagens-de-mérito)
9. [Etapa 6: Tela de Conquistas (Opcional)](#etapa-6-tela-de-conquistas-opcional)
10. [Checklist de Validação Final](#checklist-de-validação-final)
11. [Próximos Passos](#próximos-passos)

---

## 🎯 VISÃO GERAL

### User Story Principal

> **Como** aluno da plataforma de I.A.,
> **quero** ganhar pontos e moedas sempre que concluo aulas e exercícios,
> **para** enxergar claramente minha evolução, sentir que estou progredindo de verdade e me manter motivado a continuar.

### Critérios de Aceitação (MVP)

1. ✅ Ao concluir uma aula, o aluno vê um card de resultado com:
   - XP ganho total na aula
   - Moedas (coins) ganhas
   - Power Score atualizado
   - Progresso até o próximo nível/patente

2. ✅ O aluno vê, em todas as telas, um mini-dashboard fixo com:
   - Power Score atual
   - Saldo de Coins
   - Nome da patente atual

3. ✅ Toda ação registrada atualiza o banco e a interface sem recarregar a página

4. ✅ Quando o aluno ganha coins, aparece um efeito visual de moedas caindo

---

## 🏗️ ARQUITETURA E DECISÕES TÉCNICAS

### Conflitos Identificados e Soluções

#### Problema 1: Tabela `user_progress` já existe
**Tabela atual:** Rastreia progresso **por lição** (user_id + lesson_id)
```sql
CREATE TABLE public.user_progress (
  user_id UUID,
  lesson_id UUID,
  status lesson_status_type,
  UNIQUE(user_id, lesson_id)
);
```

**Solução adotada:**
- ✅ **Expandir tabela `users`** com campos: `power_score`, `coins`, `patent_level`
- ✅ **Criar nova tabela `user_gamification_events`** para log de eventos
- ✅ **Manter `user_progress`** atual intacta (rastreia lições individuais)

#### Problema 2: Duplicação de pontos
**Campo existente:** `total_points` na tabela `users`

**Solução:**
- ✅ Manter `total_points` por compatibilidade
- ✅ Usar `power_score` como sistema principal de gamificação
- ✅ Sincronizar ambos na função RPC

### Estrutura Final de Dados

```
users (tabela existente - EXPANDIDA)
├── power_score (INTEGER) - XP total
├── coins (INTEGER) - Moedas acumuladas
├── patent_level (INTEGER) - Nível de patente (0-3)
└── gamification_updated_at (TIMESTAMPTZ)

user_gamification_events (NOVA tabela)
├── id (UUID)
├── user_id (UUID)
├── event_type (TEXT) - 'lesson_completed', 'journey_completed', 'quiz_answered'
├── event_reference_id (UUID) - ID da lição/jornada/quiz
├── payload (JSONB)
├── xp_delta (INTEGER)
├── coins_delta (INTEGER)
└── created_at (TIMESTAMPTZ)

UNIQUE(user_id, event_type, event_reference_id) - PREVINE DUPLICATAS
```

---

## 📊 MODELO DE PONTOS E PATENTES

### Tipos de Evento e Recompensas

| Evento | XP (Power Score) | Coins | Condição |
|--------|------------------|-------|----------|
| **lesson_completed** | +40 | +10 | Sempre |
| **journey_completed** | +120 | +25 | Sempre |
| **quiz_answered** | +50 / +20 | +5 / 0 | ≥80% acertos / <80% |

### Patentes por Power Score

| Nível | Nome | Power Score Mínimo | Power Score Máximo |
|-------|------|-------------------|-------------------|
| **0** | Sem patente | 0 | 199 |
| **1** | Operador Básico de I.A. | 200 | 599 |
| **2** | Executor de Sistemas | 600 | 1199 |
| **3** | Estrategista em I.A. | 1200+ | ∞ |

### Cores das Patentes (UI)

```typescript
const PATENT_COLORS = {
  0: 'bg-slate-800/80 border-slate-700 text-slate-400',
  1: 'bg-blue-900/40 border-blue-700 text-blue-300',
  2: 'bg-purple-900/40 border-purple-700 text-purple-300',
  3: 'bg-amber-900/40 border-amber-700 text-amber-300',
};
```

---

## 🔧 ETAPA 1: BACK-END - FUNDAMENTOS

### 1.1 Migration: Adicionar campos de gamificação

**Arquivo:** `supabase/migrations/YYYYMMDD_add_gamification_fields.sql`

```sql
-- ========================================
-- MIGRATION: Adicionar Campos de Gamificação
-- ========================================

-- Adicionar campos à tabela users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS power_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS patent_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS gamification_updated_at TIMESTAMP WITH TIME ZONE;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_power_score ON public.users(power_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_patent_level ON public.users(patent_level);

-- Comentários para documentação
COMMENT ON COLUMN public.users.power_score IS 'XP total acumulado pelo usuário (gamificação)';
COMMENT ON COLUMN public.users.coins IS 'Moedas/créditos de IA acumulados';
COMMENT ON COLUMN public.users.patent_level IS '0=Sem patente, 1=Operador, 2=Executor, 3=Estrategista';
```

### 1.2 Migration: Criar tabela de eventos

**Arquivo:** `supabase/migrations/YYYYMMDD_create_gamification_events.sql`

```sql
-- ========================================
-- MIGRATION: Criar Tabela de Eventos de Gamificação
-- ========================================

-- Tabela de log de eventos
CREATE TABLE IF NOT EXISTS public.user_gamification_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('lesson_completed', 'journey_completed', 'quiz_answered')),
  event_reference_id UUID,
  payload JSONB DEFAULT '{}'::jsonb,
  xp_delta INTEGER NOT NULL DEFAULT 0,
  coins_delta INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- ⚠️ CRITICAL: Previne duplicatas
  UNIQUE(user_id, event_type, event_reference_id)
);

-- Índices
CREATE INDEX idx_gamification_events_user_id ON public.user_gamification_events(user_id);
CREATE INDEX idx_gamification_events_created_at ON public.user_gamification_events(created_at DESC);
CREATE INDEX idx_gamification_events_type ON public.user_gamification_events(event_type);

-- RLS
ALTER TABLE public.user_gamification_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_gamification_events"
ON public.user_gamification_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "system_insert_gamification_events"
ON public.user_gamification_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.user_gamification_events IS 'Log de eventos de gamificação com idempotência';
```

### 1.3 Migration: Criar função RPC

**Arquivo:** `supabase/migrations/YYYYMMDD_create_gamification_rpc.sql`

```sql
-- ========================================
-- MIGRATION: Criar Função RPC de Gamificação
-- ========================================

-- Tipo de retorno
CREATE TYPE public.gamification_result AS (
  xp_delta INTEGER,
  coins_delta INTEGER,
  new_power_score INTEGER,
  new_coins INTEGER,
  new_patent_level INTEGER,
  patent_name TEXT,
  is_new_patent BOOLEAN
);

-- Função principal
CREATE OR REPLACE FUNCTION public.register_gamification_event(
  p_event_type TEXT,
  p_event_reference_id UUID DEFAULT NULL,
  p_payload JSONB DEFAULT '{}'::jsonb
)
RETURNS public.gamification_result
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_xp_delta INTEGER := 0;
  v_coins_delta INTEGER := 0;
  v_power_score INTEGER;
  v_coins INTEGER;
  v_old_patent INTEGER;
  v_new_patent INTEGER;
  v_patent_name TEXT;
  v_is_new_patent BOOLEAN := false;
  v_correct INTEGER;
  v_total INTEGER;
  v_result public.gamification_result;
  v_event_exists BOOLEAN;
BEGIN
  -- Validação de autenticação
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- ✅ IDEMPOTÊNCIA: Verificar se evento já foi registrado
  IF p_event_reference_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.user_gamification_events
      WHERE user_id = v_user_id
        AND event_type = p_event_type
        AND event_reference_id = p_event_reference_id
    ) INTO v_event_exists;

    IF v_event_exists THEN
      -- Retornar valores atuais sem alterar nada
      SELECT power_score, coins, patent_level
      INTO v_power_score, v_coins, v_old_patent
      FROM public.users
      WHERE id = v_user_id;

      v_result.xp_delta := 0;
      v_result.coins_delta := 0;
      v_result.new_power_score := v_power_score;
      v_result.new_coins := v_coins;
      v_result.new_patent_level := v_old_patent;
      v_result.patent_name := CASE v_old_patent
        WHEN 0 THEN 'Sem patente'
        WHEN 1 THEN 'Operador Básico de I.A.'
        WHEN 2 THEN 'Executor de Sistemas'
        WHEN 3 THEN 'Estrategista em I.A.'
        ELSE 'Sem patente'
      END;
      v_result.is_new_patent := false;

      RETURN v_result;
    END IF;
  END IF;

  -- Calcular pontos baseado no tipo de evento
  IF p_event_type = 'lesson_completed' THEN
    v_xp_delta := 40;
    v_coins_delta := 10;

  ELSIF p_event_type = 'journey_completed' THEN
    v_xp_delta := 120;
    v_coins_delta := 25;

  ELSIF p_event_type = 'quiz_answered' THEN
    v_correct := COALESCE((p_payload->>'correctAnswers')::INTEGER, 0);
    v_total := COALESCE((p_payload->>'totalQuestions')::INTEGER, 0);

    IF v_total > 0 AND v_correct::NUMERIC >= v_total::NUMERIC * 0.8 THEN
      v_xp_delta := 50;
      v_coins_delta := 5;
    ELSE
      v_xp_delta := 20;
      v_coins_delta := 0;
    END IF;

  ELSE
    RAISE EXCEPTION 'Unknown event_type: %', p_event_type;
  END IF;

  -- Buscar patente atual
  SELECT patent_level INTO v_old_patent
  FROM public.users
  WHERE id = v_user_id;

  -- Atualizar usuário
  UPDATE public.users
  SET
    power_score = power_score + v_xp_delta,
    coins = coins + v_coins_delta,
    total_points = total_points + v_xp_delta, -- Manter compatibilidade
    gamification_updated_at = NOW()
  WHERE id = v_user_id
  RETURNING power_score, coins, patent_level
  INTO v_power_score, v_coins, v_new_patent;

  -- Recalcular patente baseada no power_score
  IF v_power_score < 200 THEN
    v_new_patent := 0;
  ELSIF v_power_score < 600 THEN
    v_new_patent := 1;
  ELSIF v_power_score < 1200 THEN
    v_new_patent := 2;
  ELSE
    v_new_patent := 3;
  END IF;

  -- Atualizar patente se mudou
  IF v_new_patent != v_old_patent THEN
    UPDATE public.users
    SET patent_level = v_new_patent
    WHERE id = v_user_id;

    v_is_new_patent := true;
  END IF;

  -- Nome da patente
  v_patent_name := CASE v_new_patent
    WHEN 0 THEN 'Sem patente'
    WHEN 1 THEN 'Operador Básico de I.A.'
    WHEN 2 THEN 'Executor de Sistemas'
    WHEN 3 THEN 'Estrategista em I.A.'
    ELSE 'Sem patente'
  END;

  -- Log do evento
  INSERT INTO public.user_gamification_events (
    user_id,
    event_type,
    event_reference_id,
    payload,
    xp_delta,
    coins_delta
  )
  VALUES (
    v_user_id,
    p_event_type,
    p_event_reference_id,
    p_payload,
    v_xp_delta,
    v_coins_delta
  );

  -- Retorno
  v_result.xp_delta := v_xp_delta;
  v_result.coins_delta := v_coins_delta;
  v_result.new_power_score := v_power_score;
  v_result.new_coins := v_coins;
  v_result.new_patent_level := v_new_patent;
  v_result.patent_name := v_patent_name;
  v_result.is_new_patent := v_is_new_patent;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.register_gamification_event IS 'Registra evento de gamificação com idempotência automática';
```

### ✅ Checklist Etapa 1

- [ ] Rodar migration: adicionar campos em `users`
- [ ] Rodar migration: criar tabela `user_gamification_events`
- [ ] Rodar migration: criar função RPC
- [ ] Testar RPC manualmente no Supabase SQL Editor:
  ```sql
  SELECT * FROM register_gamification_event('lesson_completed', gen_random_uuid());
  ```
- [ ] Verificar idempotência (chamar 2x com mesmo `event_reference_id`)
- [ ] Verificar mudança de patente (simular 200+ XP)

---

## 💻 ETAPA 2: FRONT-END - SERVIÇO E HOOK

### 2.1 Criar serviço de gamificação

**Arquivo:** `src/services/gamification.ts`

```typescript
import { supabase } from '@/integrations/supabase/client';

export type GamificationEventType =
  | 'lesson_completed'
  | 'journey_completed'
  | 'quiz_answered';

export type GamificationResult = {
  xp_delta: number;
  coins_delta: number;
  new_power_score: number;
  new_coins: number;
  new_patent_level: number;
  patent_name: string;
  is_new_patent: boolean;
};

/**
 * Registra um evento de gamificação
 *
 * @param eventType - Tipo do evento
 * @param eventReferenceId - ID da lição/jornada/quiz (para idempotência)
 * @param payload - Dados adicionais (ex: { correctAnswers: 8, totalQuestions: 10 })
 */
export async function registerGamificationEvent(
  eventType: GamificationEventType,
  eventReferenceId?: string,
  payload: Record<string, any> = {}
): Promise<GamificationResult | null> {
  try {
    const { data, error } = await supabase.rpc('register_gamification_event', {
      p_event_type: eventType,
      p_event_reference_id: eventReferenceId || null,
      p_payload: payload
    });

    if (error) {
      console.error('[Gamification] Error:', error);
      return null;
    }

    return data as GamificationResult;
  } catch (err) {
    console.error('[Gamification] Exception:', err);
    return null;
  }
}

/**
 * Busca estatísticas de gamificação do usuário
 */
export async function getUserGamificationStats(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('power_score, coins, patent_level')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[Gamification] Error fetching stats:', error);
    return null;
  }

  return data;
}
```

### 2.2 Criar hook personalizado

**Arquivo:** `src/hooks/useUserGamification.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserGamificationStats = {
  powerScore: number;
  coins: number;
  patentLevel: number;
  patentName: string;
};

const PATENT_NAMES: Record<number, string> = {
  0: 'Sem patente',
  1: 'Operador Básico de I.A.',
  2: 'Executor de Sistemas',
  3: 'Estrategista em I.A.',
};

export function useUserGamification() {
  const [stats, setStats] = useState<UserGamificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('power_score, coins, patent_level')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      setStats({
        powerScore: data.power_score || 0,
        coins: data.coins || 0,
        patentLevel: data.patent_level || 0,
        patentName: PATENT_NAMES[data.patent_level || 0],
      });
      setError(null);
    } catch (err) {
      console.error('[useUserGamification] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refresh };
}
```

### ✅ Checklist Etapa 2

- [ ] Criar `src/services/gamification.ts`
- [ ] Criar `src/hooks/useUserGamification.ts`
- [ ] Testar hook em componente isolado:
  ```tsx
  const TestComponent = () => {
    const { stats, isLoading } = useUserGamification();
    return <pre>{JSON.stringify(stats, null, 2)}</pre>;
  };
  ```

---

## 🎨 ETAPA 3: FRONT-END - HEADER GLOBAL

### 3.1 Criar componente de header

**Arquivo:** `src/components/gamification/GamificationHeader.tsx`

```typescript
import React from 'react';
import { Zap, Coins, Award } from 'lucide-react';

type GamificationHeaderProps = {
  powerScore: number;
  coins: number;
  patentLevel: number;
  patentName: string;
};

const PATENT_COLORS: Record<number, string> = {
  0: 'bg-slate-800/80 border-slate-700 text-slate-400',
  1: 'bg-blue-900/40 border-blue-700 text-blue-300',
  2: 'bg-purple-900/40 border-purple-700 text-purple-300',
  3: 'bg-amber-900/40 border-amber-700 text-amber-300',
};

export const GamificationHeader: React.FC<GamificationHeaderProps> = ({
  powerScore,
  coins,
  patentLevel,
  patentName,
}) => {
  const patentColor = PATENT_COLORS[patentLevel] || PATENT_COLORS[0];

  return (
    <div className="flex items-center justify-end gap-3 sm:gap-4 text-xs sm:text-sm px-4 py-2.5 bg-slate-900/60 border-b border-slate-800">
      {/* Power Score */}
      <div className="flex items-center gap-1.5">
        <Zap className="w-4 h-4 text-sky-400" />
        <span className="hidden sm:inline text-slate-300">Power Score</span>
        <span className="font-semibold text-sky-300">{powerScore}</span>
      </div>

      {/* Coins */}
      <div className="flex items-center gap-1.5">
        <Coins className="w-4 h-4 text-amber-400" />
        <span className="font-semibold text-amber-300">{coins}</span>
      </div>

      {/* Patent */}
      <div className="flex items-center gap-1.5">
        <Award className="w-4 h-4 text-slate-400" />
        <span className={`hidden md:inline px-2 py-0.5 rounded-full text-[11px] border ${patentColor}`}>
          {patentName}
        </span>
        <span className={`md:hidden px-1.5 py-0.5 rounded-full text-[10px] border ${patentColor}`}>
          Nv{patentLevel}
        </span>
      </div>
    </div>
  );
};
```

### 3.2 Integrar no layout principal

**Localização:** Encontre seu arquivo de layout (ex: `src/layouts/MainLayout.tsx`, `src/App.tsx`, etc.)

```typescript
import { GamificationHeader } from '@/components/gamification/GamificationHeader';
import { useUserGamification } from '@/hooks/useUserGamification';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { stats, isLoading } = useUserGamification();

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header principal existente */}
      <header className="...">
        {/* Seu header atual */}
      </header>

      {/* Gamification Header */}
      {!isLoading && stats && (
        <GamificationHeader
          powerScore={stats.powerScore}
          coins={stats.coins}
          patentLevel={stats.patentLevel}
          patentName={stats.patentName}
        />
      )}

      {/* Conteúdo */}
      <main>{children}</main>
    </div>
  );
}
```

### ✅ Checklist Etapa 3

- [ ] Criar `src/components/gamification/GamificationHeader.tsx`
- [ ] Integrar no layout principal da aplicação
- [ ] Testar em desktop (largura completa)
- [ ] Testar em mobile (versão compacta)
- [ ] Verificar cores diferentes das patentes (simular levels 0-3)

---

## 🏆 ETAPA 4: FRONT-END - CARD DE RESULTADO

### 4.1 Componente principal do card

**Arquivo:** `src/components/gamification/LessonResultCard.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { Trophy, Zap, Coins, TrendingUp, X } from 'lucide-react';
import { CoinsAnimation } from './CoinsAnimation';

type LessonResultCardProps = {
  xpDelta: number;
  coinsDelta: number;
  newPowerScore: number;
  newCoins: number;
  patentName: string;
  isNewPatent?: boolean;
  nextPatentThreshold?: number;
  onClose: () => void;
};

export const LessonResultCard: React.FC<LessonResultCardProps> = ({
  xpDelta,
  coinsDelta,
  newPowerScore,
  newCoins,
  patentName,
  isNewPatent = false,
  nextPatentThreshold,
  onClose,
}) => {
  const [showCoins, setShowCoins] = useState(false);

  useEffect(() => {
    if (coinsDelta > 0) {
      setTimeout(() => setShowCoins(true), 400);
    }
  }, [coinsDelta]);

  // Calcular progresso até próxima patente
  const getProgressToNextPatent = () => {
    if (!nextPatentThreshold) return null;

    const progress = (newPowerScore / nextPatentThreshold) * 100;
    const remaining = nextPatentThreshold - newPowerScore;

    return { progress: Math.min(progress, 100), remaining };
  };

  const progressData = getProgressToNextPatent();

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative max-w-lg w-full rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 px-6 py-6 shadow-2xl animate-in fade-in zoom-in duration-300">

          {/* Botão fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>

          {/* Ícone principal */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-sky-400" />
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold text-center text-slate-50 mb-2">
            {isNewPatent ? 'Nova Patente Desbloqueada!' : 'Aula Concluída'}
          </h2>

          {/* Mensagem de mérito */}
          {isNewPatent && (
            <p className="text-center text-sky-300 text-sm mb-4 font-medium">
              Você subiu para <span className="font-bold">{patentName}</span>. Poucos alunos chegam aqui.
            </p>
          )}

          {/* Recompensas */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-700/50">
            <div className="flex items-center justify-center gap-6">
              {/* XP */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-sky-300">+{xpDelta}</p>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide">Power Score</p>
                </div>
              </div>

              {/* Divisor */}
              <div className="w-px h-12 bg-slate-700" />

              {/* Coins */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-300">+{coinsDelta}</p>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide">Créditos IA</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status atual */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Power Score total</span>
              <span className="font-semibold text-sky-300">{newPowerScore}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Créditos de IA</span>
              <span className="font-semibold text-amber-300">{newCoins}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Patente atual</span>
              <span className="font-semibold text-slate-200">{patentName}</span>
            </div>

            {/* Barra de progresso para próxima patente */}
            {progressData && progressData.remaining > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Próxima patente
                  </span>
                  <span>{progressData.remaining} XP restantes</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-purple-500 transition-all duration-700 ease-out"
                    style={{ width: `${progressData.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botão de ação */}
          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg transition-colors"
          >
            Continuar
          </button>

          {/* Animação de moedas */}
          {showCoins && coinsDelta > 0 && (
            <CoinsAnimation count={Math.min(coinsDelta, 8)} />
          )}
        </div>
      </div>
    </>
  );
};
```

### 4.2 Componente de animação de moedas

**Arquivo:** `src/components/gamification/CoinsAnimation.tsx`

```typescript
import React from 'react';

type CoinsAnimationProps = {
  count?: number;
};

export const CoinsAnimation: React.FC<CoinsAnimationProps> = ({ count = 5 }) => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="coin-particle absolute"
          style={{
            left: `${45 + (index % 3) * 5}%`,
            top: `${50 + (index % 2) * 5}%`,
            animationDelay: `${index * 0.08}s`,
          }}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border-2 border-amber-200/40 shadow-lg flex items-center justify-center text-[10px] font-bold text-amber-900">
            ₵
          </div>
        </div>
      ))}
    </div>
  );
};
```

### 4.3 CSS para animações

**Arquivo:** `src/index.css` (ou `globals.css`)

```css
/* ========================================
   ANIMAÇÕES DE GAMIFICAÇÃO
   ======================================== */

/* Animação de moedas flutuando */
@keyframes coin-float-up {
  0% {
    transform: translate(0, 0) scale(0.8) rotate(0deg);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), -120px) scale(1.1) rotate(360deg);
    opacity: 0;
  }
}

.coin-particle {
  animation: coin-float-up 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  --tx: calc((var(--index, 0) - 2) * 30px);
}

/* Animações de entrada do card */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes zoom-in {
  from {
    transform: scale(0.95);
  }
  to {
    transform: scale(1);
  }
}

.animate-in {
  animation: fade-in 0.3s ease-out, zoom-in 0.3s ease-out;
}
```

### 4.4 Integração na conclusão da aula

**Exemplo:** (ajuste conforme sua estrutura atual)

```typescript
// Em componente de lição (ex: LessonView.tsx)
import { useState } from 'react';
import { registerGamificationEvent, GamificationResult } from '@/services/gamification';
import { LessonResultCard } from '@/components/gamification/LessonResultCard';
import { useUserGamification } from '@/hooks/useUserGamification';

export function LessonView({ lessonId }: { lessonId: string }) {
  const [showResultCard, setShowResultCard] = useState(false);
  const [resultData, setResultData] = useState<GamificationResult | null>(null);
  const { refresh: refreshGamification } = useUserGamification();

  const handleLessonComplete = async () => {
    try {
      // 1. Marcar aula como completa (sua lógica existente)
      await markLessonAsCompleted(lessonId);

      // 2. Registrar evento de gamificação
      const result = await registerGamificationEvent(
        'lesson_completed',
        lessonId // ID para idempotência
      );

      if (result) {
        setResultData(result);
        setShowResultCard(true);
        refreshGamification(); // Atualizar header global
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const getNextPatentThreshold = (currentLevel: number) => {
    const thresholds = [200, 600, 1200];
    return thresholds[currentLevel] || null;
  };

  return (
    <div>
      {/* Conteúdo da lição */}

      <button onClick={handleLessonComplete} className="...">
        Concluir Aula
      </button>

      {/* Card de resultado */}
      {showResultCard && resultData && (
        <LessonResultCard
          xpDelta={resultData.xp_delta}
          coinsDelta={resultData.coins_delta}
          newPowerScore={resultData.new_power_score}
          newCoins={resultData.new_coins}
          patentName={resultData.patent_name}
          isNewPatent={resultData.is_new_patent}
          nextPatentThreshold={getNextPatentThreshold(resultData.new_patent_level)}
          onClose={() => setShowResultCard(false)}
        />
      )}
    </div>
  );
}
```

### ✅ Checklist Etapa 4

- [ ] Criar `LessonResultCard.tsx`
- [ ] Criar `CoinsAnimation.tsx`
- [ ] Adicionar CSS de animações
- [ ] Integrar na conclusão da aula
- [ ] Testar fluxo: completar aula → ver card → animação de moedas → fechar
- [ ] Testar mudança de patente (simular 200 XP)
- [ ] Verificar idempotência (completar mesma aula 2x)

---

## 💬 ETAPA 5: MENSAGENS DE MÉRITO

### 5.1 Helper de mensagens

**Arquivo:** `src/lib/gamification/messages.ts`

```typescript
export type MeritMessageType = 'high_xp' | 'new_patent' | 'milestone' | 'streak';

export type MeritMessage = {
  title: string;
  message: string;
  icon?: string;
};

export function getMeritMessage(
  type: MeritMessageType,
  data: {
    xpDelta?: number;
    patentName?: string;
    powerScore?: number;
    streakDays?: number;
  }
): MeritMessage {
  switch (type) {
    case 'high_xp':
      if ((data.xpDelta || 0) >= 100) {
        return {
          title: 'Avanço Significativo',
          message: 'Você deu um passo relevante na sua formação em I.A.',
          icon: '🎯',
        };
      }
      return {
        title: 'Progresso Consistente',
        message: 'Cada aula te aproxima do domínio profissional em I.A.',
        icon: '📈',
      };

    case 'new_patent':
      return {
        title: 'Nova Patente Desbloqueada',
        message: `Você subiu para a patente ${data.patentName}. Poucos alunos chegam aqui.`,
        icon: '🏆',
      };

    case 'milestone':
      if ((data.powerScore || 0) >= 1000) {
        return {
          title: 'Marco Alcançado',
          message: `${data.powerScore} Power Score. Você está no caminho certo para se tornar um especialista.`,
          icon: '⚡',
        };
      }
      if ((data.powerScore || 0) >= 500) {
        return {
          title: 'Evolução Notável',
          message: 'Você está desenvolvendo expertise sólida em Inteligência Artificial.',
          icon: '💪',
        };
      }
      return {
        title: 'Começando Forte',
        message: 'Continue assim e você dominará I.A. profissionalmente.',
        icon: '🚀',
      };

    case 'streak':
      const days = data.streakDays || 0;
      if (days >= 7) {
        return {
          title: 'Sequência Impressionante',
          message: `${days} dias consecutivos. Disciplina é o diferencial dos profissionais.`,
          icon: '🔥',
        };
      }
      return {
        title: 'Mantendo o Ritmo',
        message: `${days} dias de sequência. Continue construindo o hábito.`,
        icon: '📅',
      };

    default:
      return {
        title: 'Parabéns',
        message: 'Você está progredindo bem.',
        icon: '✨',
      };
  }
}

// Thresholds para patentes
export const PATENT_THRESHOLDS = {
  0: { min: 0, max: 199, name: 'Sem patente' },
  1: { min: 200, max: 599, name: 'Operador Básico de I.A.' },
  2: { min: 600, max: 1199, name: 'Executor de Sistemas' },
  3: { min: 1200, max: Infinity, name: 'Estrategista em I.A.' },
};

export function getNextPatentInfo(currentScore: number) {
  if (currentScore < 200) {
    return {
      threshold: 200,
      remaining: 200 - currentScore,
      nextPatent: 'Operador Básico de I.A.'
    };
  }
  if (currentScore < 600) {
    return {
      threshold: 600,
      remaining: 600 - currentScore,
      nextPatent: 'Executor de Sistemas'
    };
  }
  if (currentScore < 1200) {
    return {
      threshold: 1200,
      remaining: 1200 - currentScore,
      nextPatent: 'Estrategista em I.A.'
    };
  }
  return null; // Já está no máximo
}
```

### 5.2 Integrar mensagens no card

**Atualizar:** `LessonResultCard.tsx`

```typescript
import { getMeritMessage } from '@/lib/gamification/messages';

// Dentro do componente:
const meritMessage = getMeritMessage('high_xp', {
  xpDelta,
  powerScore: newPowerScore
});

// Renderizar após o título (se NÃO for nova patente):
{!isNewPatent && xpDelta >= 80 && (
  <p className="text-center text-slate-300 text-sm mb-4">
    {meritMessage.message}
  </p>
)}
```

### ✅ Checklist Etapa 5

- [ ] Criar `src/lib/gamification/messages.ts`
- [ ] Integrar mensagens no `LessonResultCard`
- [ ] Testar diferentes cenários:
  - [ ] XP baixo (<80)
  - [ ] XP médio (80-99)
  - [ ] XP alto (≥100)
  - [ ] Nova patente
  - [ ] Marco de 500 XP
  - [ ] Marco de 1000 XP

---

## 🏅 ETAPA 6: TELA DE CONQUISTAS (OPCIONAL)

### 6.1 Migration para conquistas

**Arquivo:** `supabase/migrations/YYYYMMDD_create_achievements.sql`

```sql
-- ========================================
-- MIGRATION: Sistema de Conquistas
-- ========================================

-- Tabela de conquistas disponíveis
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(50), -- 'patent', 'streak', 'milestone'
  requirement_type VARCHAR(50), -- 'power_score', 'lessons_completed', 'streak_days'
  requirement_value INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir conquistas padrão
INSERT INTO public.achievements (code, name, description, icon, category, requirement_type, requirement_value) VALUES
  ('patent_operator', 'Operador Básico de I.A.', 'Alcance 200 de Power Score', '🎖️', 'patent', 'power_score', 200),
  ('patent_executor', 'Executor de Sistemas', 'Alcance 600 de Power Score', '🏅', 'patent', 'power_score', 600),
  ('patent_strategist', 'Estrategista em I.A.', 'Alcance 1200 de Power Score', '🏆', 'patent', 'power_score', 1200),
  ('streak_7', 'Semana Completa', 'Mantenha 7 dias de sequência', '🔥', 'streak', 'streak_days', 7),
  ('streak_30', 'Mês Completo', 'Mantenha 30 dias de sequência', '💎', 'streak', 'streak_days', 30),
  ('milestone_10_lessons', 'Primeiros Passos', 'Complete 10 aulas', '📚', 'milestone', 'lessons_completed', 10),
  ('milestone_50_lessons', 'Estudante Dedicado', 'Complete 50 aulas', '📖', 'milestone', 'lessons_completed', 50),
  ('milestone_500_xp', 'Dedicação Comprovada', 'Alcance 500 de Power Score', '⚡', 'milestone', 'power_score', 500),
  ('milestone_1000_xp', 'Especialista Emergente', 'Alcance 1000 de Power Score', '💫', 'milestone', 'power_score', 1000);

-- Atualizar user_achievements para referenciar achievements
ALTER TABLE public.user_achievements
ADD COLUMN IF NOT EXISTS achievement_code VARCHAR(50) REFERENCES public.achievements(code);

-- RLS para achievements
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievements_public_read"
ON public.achievements
FOR SELECT
TO authenticated
USING (true);

COMMENT ON TABLE public.achievements IS 'Conquistas disponíveis no sistema';
```

### 6.2 Componente de conquistas

**Arquivo:** `src/components/gamification/AchievementsView.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lock } from 'lucide-react';

type Achievement = {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: string;
};

export const AchievementsView: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar todas as conquistas
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value', { ascending: true });

      // Buscar conquistas do usuário
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_code, earned_at')
        .eq('user_id', user.id);

      const unlockedCodes = new Set(
        userAchievements?.map((ua) => ua.achievement_code) || []
      );

      const mapped = allAchievements?.map((ach) => ({
        ...ach,
        unlocked: unlockedCodes.has(ach.code),
        unlockedAt: userAchievements?.find((ua) => ua.achievement_code === ach.code)?.earned_at,
      })) || [];

      setAchievements(mapped);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Carregando conquistas...</div>;
  }

  // Agrupar por categoria
  const groupedAchievements = achievements.reduce((acc, ach) => {
    if (!acc[ach.category]) acc[ach.category] = [];
    acc[ach.category].push(ach);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const categoryNames: Record<string, string> = {
    patent: 'Patentes',
    streak: 'Sequência',
    milestone: 'Marcos',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-50 mb-2">Conquistas</h1>
      <p className="text-slate-400 mb-8">
        Desbloqueie conquistas enquanto avança na sua jornada em I.A.
      </p>

      {Object.entries(groupedAchievements).map(([category, items]) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">
            {categoryNames[category] || category}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((achievement) => (
              <div
                key={achievement.id}
                className={`
                  relative rounded-xl border p-5 transition-all
                  ${achievement.unlocked
                    ? 'bg-slate-800/50 border-sky-700/50'
                    : 'bg-slate-900/30 border-slate-800 opacity-60'
                  }
                `}
              >
                {/* Ícone */}
                <div className="flex items-start gap-4">
                  <div
                    className={`
                      w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0
                      ${achievement.unlocked
                        ? 'bg-sky-500/20 border-2 border-sky-500/40'
                        : 'bg-slate-800 border-2 border-slate-700'
                      }
                    `}
                  >
                    {achievement.unlocked ? (
                      achievement.icon
                    ) : (
                      <Lock className="w-6 h-6 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${achievement.unlocked ? 'text-slate-50' : 'text-slate-500'}`}>
                      {achievement.name}
                    </h3>
                    <p className={`text-sm mt-1 ${achievement.unlocked ? 'text-slate-300' : 'text-slate-600'}`}>
                      {achievement.description}
                    </p>

                    {achievement.unlocked && achievement.unlockedAt && (
                      <p className="text-xs text-sky-400 mt-2">
                        Desbloqueado em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
```

### 6.3 Adicionar rota

**Adicionar em seu router:**

```typescript
import { AchievementsView } from '@/components/gamification/AchievementsView';

// No seu router:
<Route path="/conquistas" element={<AchievementsView />} />
```

### ✅ Checklist Etapa 6

- [ ] Rodar migration de achievements
- [ ] Criar `AchievementsView.tsx`
- [ ] Adicionar rota `/conquistas`
- [ ] Testar visualização de conquistas bloqueadas
- [ ] Testar visualização de conquistas desbloqueadas
- [ ] Adicionar link no menu/header para conquistas

---

## ✅ CHECKLIST DE VALIDAÇÃO FINAL

### Back-end
- [ ] Todas as migrations aplicadas com sucesso
- [ ] Função RPC testada no SQL Editor
- [ ] Idempotência validada (chamada dupla não duplica pontos)
- [ ] RLS configurado corretamente
- [ ] Mudança de patente funcionando (testar com 200+ XP)

### Front-end - Serviços
- [ ] `gamification.ts` criado e funcional
- [ ] `useUserGamification.ts` criado e testado
- [ ] Hook retorna dados corretos

### Front-end - UI
- [ ] `GamificationHeader` visível em todas as páginas
- [ ] Header responsivo (mobile/desktop)
- [ ] `LessonResultCard` aparece ao completar aula
- [ ] Animação de moedas funcionando
- [ ] Card fecha corretamente
- [ ] Barra de progresso para próxima patente visível

### Integração
- [ ] Completar aula registra evento de gamificação
- [ ] Header atualiza após completar aula (sem reload)
- [ ] Idempotência: completar mesma aula 2x não duplica XP
- [ ] Mensagens de mérito aparecem corretamente

### Testes de Cenários
- [ ] Usuário novo (0 XP) → completa 1 aula → vê 40 XP
- [ ] Usuário com 180 XP → completa aula → vê mudança de patente (nível 1)
- [ ] Usuário com 580 XP → completa aula → vê mudança de patente (nível 2)
- [ ] Quiz com 80%+ acertos → 50 XP + 5 coins
- [ ] Quiz com <80% acertos → 20 XP + 0 coins

---

## 🚀 PRÓXIMOS PASSOS

### Curto Prazo (Pós-MVP)
1. **Streak de dias consecutivos**
   - Adicionar lógica para rastrear `last_activity_date`
   - Atualizar header com streak visual

2. **Notificações toast**
   - "+40 XP" aparecendo discretamente no canto

3. **Leaderboard**
   - Ranking dos top 10 alunos por Power Score

4. **Sistema de recompensas**
   - Usar coins para desbloquear conteúdo premium

### Médio Prazo
1. **Achievements automáticos**
   - Função trigger que desbloqueia conquistas ao atingir thresholds

2. **Perfil público**
   - Página `/perfil/:userId` com conquistas e patente

3. **Badges visuais**
   - Emblemas ao lado do nome do usuário

### Longo Prazo
1. **Sistema de missões diárias**
2. **Eventos limitados** (Double XP Weekend)
3. **Títulos e emblemas customizáveis**

---

## 📞 SUPORTE

**Dúvidas sobre implementação?**
- Documentação Supabase: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs
- React: https://react.dev

**Problemas comuns:**
- **RPC não retorna dados:** Verificar RLS e SECURITY DEFINER
- **Idempotência não funciona:** Garantir UNIQUE constraint na tabela
- **Header não atualiza:** Chamar `refresh()` do hook após evento

---

**Versão:** 1.0
**Última atualização:** 2025-11-25
**Autor:** Sistema de Planejamento Intel Ignite Pro
