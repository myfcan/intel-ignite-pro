# ⚡ GUIA RÁPIDO - IMPLEMENTAÇÃO GAMIFICAÇÃO

**Tempo estimado:** 4-6 horas
**Dificuldade:** Intermediária

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO

### FASE 1: Back-end (1-2h)

#### 1. Criar migrations no Supabase

```bash
# No dashboard do Supabase, SQL Editor:
```

**Migration 1:** Adicionar campos
```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS power_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS patent_level INTEGER DEFAULT 0;

CREATE INDEX idx_users_power_score ON public.users(power_score DESC);
```

**Migration 2:** Criar tabela de eventos
```sql
CREATE TABLE public.user_gamification_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_reference_id UUID,
  xp_delta INTEGER NOT NULL,
  coins_delta INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_type, event_reference_id)
);

CREATE INDEX idx_gamification_events_user_id ON public.user_gamification_events(user_id);
```

**Migration 3:** Criar RPC
```sql
-- Copiar função completa do PLANO-GAMIFICACAO-COMPLETO.md seção 1.3
```

#### 2. Testar no SQL Editor

```sql
-- Testar função
SELECT * FROM register_gamification_event('lesson_completed', gen_random_uuid());

-- Verificar resultado
SELECT power_score, coins, patent_level FROM users WHERE id = auth.uid();

-- Testar idempotência (deve retornar xp_delta = 0)
SELECT * FROM register_gamification_event('lesson_completed', 'MESMO-UUID-ANTERIOR');
```

---

### FASE 2: Front-end - Base (1-2h)

#### 3. Criar serviço

**`src/services/gamification.ts`**
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

export async function registerGamificationEvent(
  eventType: GamificationEventType,
  eventReferenceId?: string,
  payload: Record<string, any> = {}
): Promise<GamificationResult | null> {
  const { data, error } = await supabase.rpc('register_gamification_event', {
    p_event_type: eventType,
    p_event_reference_id: eventReferenceId || null,
    p_payload: payload
  });

  if (error) {
    console.error('[Gamification]', error);
    return null;
  }

  return data as GamificationResult;
}
```

#### 4. Criar hook

**`src/hooks/useUserGamification.ts`**
```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const PATENT_NAMES: Record<number, string> = {
  0: 'Sem patente',
  1: 'Operador Básico de I.A.',
  2: 'Executor de Sistemas',
  3: 'Estrategista em I.A.',
};

export function useUserGamification() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('users')
      .select('power_score, coins, patent_level')
      .eq('id', user.id)
      .single();

    if (data) {
      setStats({
        powerScore: data.power_score || 0,
        coins: data.coins || 0,
        patentLevel: data.patent_level || 0,
        patentName: PATENT_NAMES[data.patent_level || 0],
      });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, refresh: fetchStats };
}
```

---

### FASE 3: Front-end - UI (2h)

#### 5. Criar Header

**`src/components/gamification/GamificationHeader.tsx`**
```typescript
import { Zap, Coins, Award } from 'lucide-react';

const COLORS: Record<number, string> = {
  0: 'bg-slate-800 border-slate-700 text-slate-400',
  1: 'bg-blue-900/40 border-blue-700 text-blue-300',
  2: 'bg-purple-900/40 border-purple-700 text-purple-300',
  3: 'bg-amber-900/40 border-amber-700 text-amber-300',
};

export function GamificationHeader({ powerScore, coins, patentLevel, patentName }) {
  return (
    <div className="flex items-center justify-end gap-4 px-4 py-2 bg-slate-900/60 border-b border-slate-800">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-sky-400" />
        <span className="font-semibold text-sky-300">{powerScore}</span>
      </div>
      <div className="flex items-center gap-2">
        <Coins className="w-4 h-4 text-amber-400" />
        <span className="font-semibold text-amber-300">{coins}</span>
      </div>
      <div className="flex items-center gap-2">
        <Award className="w-4 h-4 text-slate-400" />
        <span className={`px-2 py-0.5 rounded-full text-xs border ${COLORS[patentLevel]}`}>
          {patentName}
        </span>
      </div>
    </div>
  );
}
```

#### 6. Integrar Header no layout

```typescript
import { GamificationHeader } from '@/components/gamification/GamificationHeader';
import { useUserGamification } from '@/hooks/useUserGamification';

export function MainLayout({ children }) {
  const { stats, isLoading } = useUserGamification();

  return (
    <div>
      {/* Seu header atual */}

      {!isLoading && stats && <GamificationHeader {...stats} />}

      {children}
    </div>
  );
}
```

#### 7. Criar Card de Resultado

**`src/components/gamification/LessonResultCard.tsx`**

```typescript
import { Trophy, Zap, Coins, X } from 'lucide-react';

export function LessonResultCard({
  xpDelta,
  coinsDelta,
  newPowerScore,
  newCoins,
  patentName,
  isNewPatent,
  onClose
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full rounded-2xl bg-slate-900 border border-slate-800 p-6">
          <button onClick={onClose} className="absolute top-4 right-4">
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-sky-500/20 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-sky-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-4">
            {isNewPatent ? 'Nova Patente!' : 'Aula Concluída'}
          </h2>

          {isNewPatent && (
            <p className="text-center text-sky-300 mb-4">
              Você subiu para {patentName}!
            </p>
          )}

          <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
            <div className="flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-sky-400" />
                <div>
                  <p className="text-2xl font-bold text-sky-300">+{xpDelta}</p>
                  <p className="text-xs text-slate-400">XP</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-2xl font-bold text-amber-300">+{coinsDelta}</p>
                  <p className="text-xs text-slate-400">Coins</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Power Score</span>
              <span className="text-sky-300">{newPowerScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Coins</span>
              <span className="text-amber-300">{newCoins}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-3 bg-sky-600 hover:bg-sky-500 rounded-lg"
          >
            Continuar
          </button>
        </div>
      </div>
    </>
  );
}
```

---

### FASE 4: Integração (30min)

#### 8. Integrar na conclusão da aula

**No componente onde a aula é concluída:**

```typescript
import { useState } from 'react';
import { registerGamificationEvent } from '@/services/gamification';
import { LessonResultCard } from '@/components/gamification/LessonResultCard';
import { useUserGamification } from '@/hooks/useUserGamification';

export function LessonView({ lessonId }) {
  const [showCard, setShowCard] = useState(false);
  const [result, setResult] = useState(null);
  const { refresh } = useUserGamification();

  const handleComplete = async () => {
    // Sua lógica de conclusão existente
    await markLessonAsCompleted(lessonId);

    // Gamificação
    const data = await registerGamificationEvent('lesson_completed', lessonId);
    if (data) {
      setResult(data);
      setShowCard(true);
      refresh(); // Atualizar header
    }
  };

  return (
    <div>
      {/* Conteúdo da aula */}

      <button onClick={handleComplete}>Concluir Aula</button>

      {showCard && result && (
        <LessonResultCard
          xpDelta={result.xp_delta}
          coinsDelta={result.coins_delta}
          newPowerScore={result.new_power_score}
          newCoins={result.new_coins}
          patentName={result.patent_name}
          isNewPatent={result.is_new_patent}
          onClose={() => setShowCard(false)}
        />
      )}
    </div>
  );
}
```

---

## ✅ CHECKLIST RÁPIDO

### Back-end
- [ ] Migration 1: Campos em users
- [ ] Migration 2: Tabela de eventos
- [ ] Migration 3: Função RPC
- [ ] Teste no SQL Editor

### Front-end
- [ ] Serviço criado
- [ ] Hook criado
- [ ] Header criado
- [ ] Header integrado no layout
- [ ] Card de resultado criado
- [ ] Integrado na conclusão da aula

### Testes
- [ ] Completar aula → ver card
- [ ] Header atualiza
- [ ] Completar mesma aula 2x → não duplica XP
- [ ] Testar mudança de patente (simular 200 XP)

---

## 🐛 TROUBLESHOOTING

**RPC não funciona:**
```sql
-- Verificar permissões
GRANT EXECUTE ON FUNCTION register_gamification_event TO authenticated;
```

**Header não atualiza:**
```typescript
// Chamar refresh() após evento
const { refresh } = useUserGamification();
await registerGamificationEvent(...);
refresh();
```

**Duplicação de XP:**
```sql
-- Verificar UNIQUE constraint
SELECT * FROM user_gamification_events
WHERE user_id = 'SEU_USER_ID'
ORDER BY created_at DESC;
```

---

## 📊 MODELO DE PONTOS

| Evento | XP | Coins |
|--------|----|----|
| Aula completa | +40 | +10 |
| Jornada completa | +120 | +25 |
| Quiz (≥80%) | +50 | +5 |
| Quiz (<80%) | +20 | 0 |

| Patente | XP Mínimo |
|---------|-----------|
| Sem patente | 0-199 |
| Operador Básico | 200-599 |
| Executor | 600-1199 |
| Estrategista | 1200+ |

---

**Documento completo:** Ver `PLANO-GAMIFICACAO-COMPLETO.md`
