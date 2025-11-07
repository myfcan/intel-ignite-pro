# 🎵 Guia de Sincronização Áudio-Texto com Timestamps

## ⚠️ LIÇÃO APRENDIDA APÓS 2 DIAS DE DEBUG

Este documento foi criado após 2 dias de debugging intenso para resolver problemas de sincronização entre áudio e texto nas aulas interativas. **Siga este guia religiosamente** para evitar os mesmos problemas!

---

## 📋 Processo Completo: Do Zero ao Áudio Sincronizado

### 1️⃣ Gerar o Áudio PRIMEIRO (via ElevenLabs)

**Ordem CRÍTICA:**
1. ✅ Escrever o script completo da aula
2. ✅ Gerar o áudio via ElevenLabs
3. ✅ Analisar o áudio para obter timestamps REAIS
4. ✅ Só DEPOIS atualizar o código e banco de dados

**❌ NUNCA:**
- Usar timestamps estimados/inventados
- Atualizar o código antes de ter o áudio real
- Confiar em cálculos manuais de duração

---

### 2️⃣ Analisar o Áudio para Obter Timestamps Reais

Use a ferramenta de análise de áudio (AdminUpdateTimestamps) para:
- Obter a duração REAL do áudio
- Extrair os timestamps REAIS de cada seção
- Validar a qualidade do áudio

**Exemplo de Output:**
```
Duração: 198.37s
Seção 1: 0s
Seção 2: 31s
Seção 3: 66s
Seção 4: 101s
Seção 5: 128s
Seção 6: 166s
```

---

## ✅ CHECKLIST: 3 Lugares que SEMPRE devem ser atualizados

### 📍 Local 1: Banco de Dados (`lessons` table)

**Arquivo:** Via Supabase Admin ou query direta

**O que atualizar:**
- `content.duration` → duração real do áudio
- `content.sections[].timestamp` → timestamps reais de cada seção

**Exemplo SQL:**
```sql
UPDATE lessons
SET content = jsonb_set(
  jsonb_set(
    content,
    '{duration}',
    '198'
  ),
  '{sections}',
  jsonb_build_array(
    jsonb_build_object('id', 'secao-1', 'timestamp', 0),
    jsonb_build_object('id', 'secao-2', 'timestamp', 31),
    jsonb_build_object('id', 'secao-3', 'timestamp', 66),
    jsonb_build_object('id', 'secao-4', 'timestamp', 101),
    jsonb_build_object('id', 'secao-5', 'timestamp', 128),
    jsonb_build_object('id', 'secao-6', 'timestamp', 166)
  )
)
WHERE id = 'lesson-id-aqui';
```

---

### 📍 Local 2: Arquivo de Configuração da Aula

**Arquivo:** `src/data/lessons/[nome-da-aula].ts`

**O que atualizar:**
- `duration` → duração real do áudio
- Cada `section.timestamp` → timestamps reais

**Exemplo:**
```typescript
export const fundamentos02: GuidedLessonData = {
  id: '22222222-2222-2222-2222-222222222202',
  title: 'Como a IA Aprende com Você',
  trackId: 'trilha-1-fundamentos',
  trackName: 'Fundamentos da IA',
  duration: 198, // ✅ ATUALIZAR: duração real em segundos
  
  sections: [
    {
      id: 'secao-1',
      timestamp: 0, // ✅ SEMPRE começa em 0
      type: 'text',
      // ...
    },
    {
      id: 'secao-2',
      timestamp: 31, // ✅ ATUALIZAR: timestamp real
      type: 'text',
      // ...
    },
    {
      id: 'secao-3',
      timestamp: 66, // ✅ ATUALIZAR: timestamp real
      type: 'text',
      // ...
    },
    {
      id: 'secao-4',
      timestamp: 101, // ✅ ATUALIZAR: timestamp real (seção do playground)
      type: 'text',
      // ...
    },
    {
      id: 'secao-5',
      timestamp: 128, // ✅ ATUALIZAR: timestamp real
      type: 'text',
      // ...
    },
    {
      id: 'secao-6',
      timestamp: 166, // ✅ ATUALIZAR: timestamp real
      type: 'text',
      // ...
    },
  ],
  // ...
};
```

---

### 📍 Local 3: Triggers do Playground em GuidedLesson.tsx

**Arquivo:** `src/components/lessons/GuidedLesson.tsx`

**⚠️ ATENÇÃO:** Este é o lugar mais CRÍTICO e que mais causou problemas!

Existem **3 TRIGGERS** que precisam ser atualizados com os timestamps corretos:

#### 🎯 TRIGGER 1: Principal (Timestamp-based)

**Localização:** ~linha 349  
**Lógica:** Ativa X segundos ANTES da próxima seção

**Fórmula:**
```typescript
const triggerTime = nextSection.timestamp - 0.5;
```

**Exemplo:**
- Se Seção 4 tem playground e Seção 5 começa aos 128s
- Trigger ativa aos: `128 - 0.5 = 127.5s`

**Código:**
```typescript
// TRIGGER 1: Timestamp-based (principal)
useEffect(() => {
  const playgroundSectionIndex = lessonData.sections.findIndex(s => s.id === 'secao-4');
  
  if (playgroundSectionIndex !== -1 && getPlaygroundStatus() === 'not_triggered') {
    const nextSection = lessonData.sections[playgroundSectionIndex + 1];
    
    if (nextSection) {
      // ✅ ATUALIZAR: usar timestamp real da próxima seção
      const triggerTime = nextSection.timestamp - 0.5; // Ex: 128 - 0.5 = 127.5s
      
      if (time >= triggerTime && time < nextSection.timestamp && isPlaying) {
        console.log(`🎮 [TRIGGER-1] Timestamp detectado: ${time.toFixed(1)}s`);
        logTelemetry('PLAYGROUND_TRIGGER', { trigger: 'timestamp-based' });
        activatePlayground();
      }
    }
  }
}, [time, isPlaying, lessonData.sections]);
```

---

#### 🎯 TRIGGER 2: Fallback (Section-based)

**Localização:** ~linha 377  
**Lógica:** Ativa 5 segundos após entrar na seção do playground

**Fórmula:**
```typescript
audio.currentTime >= timestamp_inicio_secao && audio.currentTime < timestamp_proxima_secao
```

**Exemplo:**
- Seção 4 (playground): 101s até 128s
- Trigger verifica: `audio.currentTime >= 101 && audio.currentTime < 128`

**Código:**
```typescript
// TRIGGER 2: Fallback durante a seção de Playground
useEffect(() => {
  if (currentSection === 3 && getPlaygroundStatus() === 'not_triggered') {
    const fallbackTimer = setTimeout(() => {
      const audio = audioRef.current;
      
      // ✅ ATUALIZAR: timestamps reais da seção do playground
      if (audio && audio.currentTime >= 101 && audio.currentTime < 128) {
        console.log('🎮 [TRIGGER-2] Fallback section-based ativado');
        logTelemetry('PLAYGROUND_TRIGGER', { trigger: 'section-fallback' });
        activatePlayground();
      }
    }, 5000);
    
    return () => clearTimeout(fallbackTimer);
  }
}, [currentSection]);
```

---

#### 🎯 TRIGGER 3: Safety Net (Transition detection)

**Localização:** ~linha 407  
**Lógica:** Se usuário pulou a seção, oferece voltar

**Fórmula:**
```typescript
audio.currentTime = timestamp_inicio_secao;
```

**Exemplo:**
- Seção 4 começa aos 101s
- Voltar para: `audio.currentTime = 101`

**Código:**
```typescript
// TRIGGER 3: Safety net se pular da seção 3 para 5
useEffect(() => {
  const prevSection = prevSectionRef.current;
  
  if (currentSection === 4 && prevSection === 3 && getPlaygroundStatus() === 'not_triggered') {
    console.log('🎮 [TRIGGER-3] Safety net - usuário pulou seção 4');
    logTelemetry('PLAYGROUND_TRIGGER', { trigger: 'safety-net' });
    
    setTimeout(() => {
      const wantToTry = window.confirm(
        '🎮 Você passou pelo exercício interativo!\n\nQuer voltar e tentar? (Recomendado)'
      );
      
      if (wantToTry) {
        const audio = audioRef.current;
        if (audio) {
          // ✅ ATUALIZAR: timestamp real do início da seção do playground
          audio.currentTime = 101; // Voltar para início da Seção 4
          setCurrentSection(3);
          activatePlayground();
        }
      } else {
        setPlaygroundStatus('skipped');
      }
    }, 1000);
  }
  
  prevSectionRef.current = currentSection;
}, [currentSection]);
```

---

## 🧮 Fórmulas de Cálculo Rápido

### Para TRIGGER 1 (Principal):
```
triggerTime = timestamp_proxima_secao - 0.5
```

### Para TRIGGER 2 (Fallback):
```
MIN = timestamp_secao_playground
MAX = timestamp_proxima_secao
```

### Para TRIGGER 3 (Safety Net):
```
audio.currentTime = timestamp_secao_playground
```

---

## 🔍 Como Identificar a Seção do Playground

**No arquivo da aula (`fundamentos-XX.ts`):**

Procure pela seção que tem `playgroundConfig`:

```typescript
{
  id: 'secao-4', // ← Esta é a seção do playground
  timestamp: 101, // ← Timestamp de INÍCIO
  type: 'text',
  playgroundConfig: {
    type: 'interactive-simulation',
    // ...
  }
}
```

**Próxima seção:**
```typescript
{
  id: 'secao-5', // ← Próxima seção após playground
  timestamp: 128, // ← Timestamp que define o FIM do playground
  type: 'text',
  // ...
}
```

**Cálculos:**
- TRIGGER 1: `128 - 0.5 = 127.5s`
- TRIGGER 2: `>= 101 && < 128`
- TRIGGER 3: `= 101`

---

## 🚨 Problemas Comuns e Soluções

### ❌ Problema: Playground não entra

**Possíveis causas:**
1. ✅ TRIGGER 1 usa timestamp errado
2. ✅ TRIGGER 2 range de tempo está errado
3. ✅ TRIGGER 3 volta para timestamp errado

**Solução:**
- Verificar TODOS os 3 triggers
- Conferir se timestamps batem com o áudio real
- Testar TRIGGER 2 manualmente (esperar 5s na seção)

---

### ❌ Problema: Texto desincronizado com áudio

**Possíveis causas:**
1. ✅ Timestamps no banco diferentes do arquivo `.ts`
2. ✅ Duração do áudio está errada
3. ✅ Áudio foi regenerado mas timestamps não foram atualizados

**Solução:**
- Garantir que banco e arquivo `.ts` têm os MESMOS timestamps
- Reanalisar o áudio se foi regenerado
- Limpar cache do navegador

---

### ❌ Problema: Playground entra muito cedo/tarde

**Causa:**
- TRIGGER 1 offset incorreto

**Solução:**
- Ajustar o offset em `nextSection.timestamp - X`
- Valor recomendado: `0.5` segundos antes
- Testar com valores entre `0.3` e `1.0` se necessário

---

## 📊 Exemplo Completo: Fundamentos 02

### Timestamps Reais do Áudio:
```
Duração total: 198.37s

Seção 1 (Intro):           0s
Seção 2 (Netflix):        31s
Seção 3 (Spotify):        66s
Seção 4 (Playground):    101s ← SEÇÃO DO PLAYGROUND
Seção 5 (Redes Sociais): 128s
Seção 6 (Conclusão):     166s
```

### TRIGGER 1: Timestamp-based
```typescript
const triggerTime = 128 - 0.5; // = 127.5s
if (time >= 127.5 && time < 128 && isPlaying) {
  activatePlayground();
}
```

### TRIGGER 2: Fallback
```typescript
if (audio.currentTime >= 101 && audio.currentTime < 128) {
  activatePlayground();
}
```

### TRIGGER 3: Safety Net
```typescript
audio.currentTime = 101; // Volta para início da Seção 4
```

---

## ✅ Checklist Final Antes de Deploy

Antes de fazer deploy de uma nova aula com áudio:

- [ ] Áudio gerado via ElevenLabs
- [ ] Áudio analisado para obter timestamps reais
- [ ] Duração real atualizada no banco de dados
- [ ] Timestamps de todas as seções atualizados no banco
- [ ] Duração atualizada no arquivo `.ts` da aula
- [ ] Timestamps de todas as seções atualizados no arquivo `.ts`
- [ ] TRIGGER 1: `nextSection.timestamp - 0.5` atualizado
- [ ] TRIGGER 2: Range `>= inicio && < fim` atualizado
- [ ] TRIGGER 3: `audio.currentTime = inicio` atualizado
- [ ] Testado no preview do Lovable
- [ ] Playground entra no momento correto
- [ ] Texto sincronizado com áudio
- [ ] Console logs sem erros

---

## 🎓 Lições Aprendidas

### ✅ O que FUNCIONA:
1. Gerar áudio PRIMEIRO, código DEPOIS
2. Usar timestamps reais extraídos do áudio
3. Atualizar TODOS os 3 triggers
4. Testar cada trigger individualmente
5. Verificar sincronização em diferentes velocidades de reprodução

### ❌ O que NÃO FUNCIONA:
1. Estimar duração/timestamps manualmente
2. Atualizar código antes de ter o áudio
3. Esquecer algum dos 3 triggers
4. Usar timestamps diferentes no banco vs arquivo `.ts`
5. Confiar que "está próximo o suficiente"

---

## 📞 Troubleshooting Avançado

### Ver logs de debugging:

No console do browser, procure por:
```
🎮 [TRIGGER-1] Timestamp detectado
🎮 [TRIGGER-2] Fallback section-based ativado
🎮 [TRIGGER-3] Safety net
```

Se nenhum aparecer, o problema está nos timestamps dos triggers.

### Testar manualmente:

1. **TRIGGER 1**: Deixar áudio tocar até ~0.5s antes da próxima seção
2. **TRIGGER 2**: Ficar 5+ segundos na seção do playground
3. **TRIGGER 3**: Pular rapidamente da seção antes para a depois do playground

---

## 🚀 Próximos Passos

Para melhorar ainda mais o sistema:

1. ✅ Criar validação automática de timestamps
2. ✅ Adicionar warnings no console se triggers estão inconsistentes
3. ✅ Ferramenta visual para comparar timestamps do áudio vs código
4. ✅ Testes automatizados para sincronização

---

## 📝 Conclusão

**LEMBRE-SE:**
> "Áudio primeiro, código depois. 3 triggers, sempre!"

Seguindo este guia, você nunca mais vai passar 2 dias debugando sincronização! 🎉

---

**Última atualização:** Após 2 dias de debugging intenso em 2025  
**Criado por:** Time de desenvolvimento, com muito sofrimento e aprendizado 😅
