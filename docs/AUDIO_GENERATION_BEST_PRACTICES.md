# 🎙️ Guia de Melhores Práticas - Geração de Áudio

## 📋 Índice

1. [Preparação do Texto](#preparação-do-texto)
2. [Timestamps e Seções](#timestamps-e-seções)
3. [Verificação de Qualidade](#verificação-de-qualidade)
4. [Processo de Regravação](#processo-de-regravação)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 Preparação do Texto

### ✅ DO (Faça)

- Use pontuação clara e consistente (`.`, `,`, `!`, `?`)
- Escreva números por extenso quando possível
- Mantenha frases com comprimento razoável (máximo 40 palavras)
- Use quebras de linha entre parágrafos para melhor estruturação
- Evite abreviações não-convencionais

### ❌ DON'T (Não Faça)

- **NÃO use CAPS LOCK excessivo** - causa mudanças indesejadas na entonação
- **NÃO use caracteres especiais no meio do texto** - pode causar pausas estranhas
- **NÃO coloque números muito grandes sem contexto** - ex: "123456789" (ElevenLabs pode ter dificuldade)
- **NÃO use múltiplas pontuações seguidas** - ex: "!!!" ou "..."

### Exemplo Correto

```text
O ChatGPT é a ferramenta de IA mais conhecida do mundo, criada pela OpenAI.

É como ter um assistente que sabe conversar sobre qualquer assunto de forma natural.

Para usar, basta acessar chat ponto openai ponto com, criar uma conta gratuita e começar a conversar.
```

### Exemplo Incorreto

```text
O ChatGPT é A FERRAMENTA DE IA MAIS CONHECIDA DO MUNDO!!!!

É tipo... um assistente que sabe conversar sobre QUALQUER ASSUNTO...

Para usar, acesse chat.openai.com e crie uma conta.
```

---

## ⏱️ Timestamps e Seções

### Regras Fundamentais

1. **Distância Mínima entre Seções**
   - Seções normais (texto): mínimo 40-60s de diferença
   - Seções interativas (playground): mínimo 5s DEPOIS da seção anterior
   - Seção final (end-audio): sempre 5s+ depois da última seção

2. **Nunca Sobrepor Timestamps**
   ```typescript
   // ❌ ERRADO - Mesmo timestamp
   { id: 'playground', timestamp: 180 }
   { id: 'proxima-secao', timestamp: 180 }
   
   // ✅ CORRETO
   { id: 'playground', timestamp: 180 }
   { id: 'proxima-secao', timestamp: 185 }
   ```

3. **Ajustar Proporcionalmente**
   - Se o áudio gerado for MENOR que o esperado, ajuste todos os timestamps proporcionalmente
   - Exemplo: Áudio de 250s ao invés de 300s → reduzir todos os timestamps em ~17%

### Template de Timestamps para Aula Típica (5 minutos)

```typescript
sections: [
  { id: 'intro', timestamp: 0, type: 'text' },           // 0s
  { id: 'conceito', timestamp: 60, type: 'text' },       // 1min
  { id: 'pratica', timestamp: 120, type: 'text' },       // 2min
  { id: 'playground', timestamp: 180, type: 'playground' }, // 3min
  { id: 'conclusao', timestamp: 185, type: 'text' },     // 3min 5s (5s depois)
  { id: 'fim', timestamp: 300, type: 'end-audio' }       // 5min
]
```

---

## 🔍 Verificação de Qualidade

### Análise Automática

A função `analyze-audio-quality` detecta automaticamente:

1. **Quedas de Volume** (> 40%)
   - Severidade: HIGH se queda > 50%, MEDIUM se 40-50%
   - Impacto no score: -30 (high) ou -15 (medium)

2. **Silêncios Excessivos** (> 3 segundos)
   - Severidade: HIGH se > 5 silêncios, MEDIUM se 2-5
   - Impacto no score: -20 (high) ou -10 (medium)

3. **Clipping/Distorção**
   - Severidade: HIGH sempre
   - Impacto no score: -25

### Scores e Recomendações

- **80-100**: ✅ OK - Qualidade excelente, pode publicar
- **60-79**: ⚠️ REVIEW - Revisar problemas detectados antes de publicar
- **0-59**: ❌ REGENERATE - Qualidade baixa, regenerar áudio

### Checklist Manual

Após gerar o áudio, sempre verificar:

- [ ] Ouvir o áudio completo do início ao fim
- [ ] Verificar se não há mudanças bruscas de volume
- [ ] Confirmar que não há silêncios longos ou pausas estranhas
- [ ] Testar sincronização com timestamps (efeito karaoke)
- [ ] Validar que a voz está consistente (Alice)
- [ ] Executar análise automática de qualidade

---

## 🔄 Processo de Regravação

### Quando Regravar?

1. **Obrigatório:**
   - Mudança de voz (ex: Sarah → Alice)
   - Score de qualidade < 60
   - Problemas de volume detectados
   - Texto da aula foi modificado

2. **Recomendado:**
   - Score de qualidade < 80
   - Feedback de usuários sobre problemas no áudio
   - Atualização de conteúdo educacional

### Passo a Passo - Regravação Rápida

1. **Acessar Admin Audio Generator** (`/admin-audio-generator`)

2. **Selecionar a Aula** na dropdown

3. **Verificar Conteúdo:**
   - O texto e markers serão carregados automaticamente
   - Confirmar que está correto

4. **Clicar "Regenerar [Nome da Aula]"**
   - Sistema vai:
     - ✅ Gerar áudio com Alice (voz padrão)
     - ✅ Extrair timestamps automáticos
     - ✅ Fazer upload para storage
     - ✅ Salvar no banco de dados

5. **Testar Qualidade:**
   - Clicar "Testar Qualidade"
   - Revisar score e problemas
   - Se score < 80, considerar regravar

6. **Validar na Aula:**
   - Acessar a página da aula
   - Testar áudio e sincronização
   - Confirmar que playground funciona corretamente

### Configuração Padrão de Geração

```typescript
{
  voice_id: 'Xb7hH8MSUJpSbSDYk0k2',  // Alice (padrão)
  model_id: 'eleven_multilingual_v2',  // Melhor para português
  quality: '128kbps+'  // Alta qualidade
}
```

---

## 🔧 Troubleshooting

### Problema: Volume abaixa no meio do áudio

**Causa:** Texto com problemas de formatação ou uso excessivo de pontuação

**Solução:**
1. Revisar o texto da seção onde o volume cai
2. Remover CAPS LOCK excessivo
3. Normalizar pontuação (evitar múltiplos `!` ou `...`)
4. Regravar o áudio

### Problema: Áudio começa no playground

**Causa:** Timestamps sobrepostos (playground e próxima seção no mesmo tempo)

**Solução:**
1. Verificar timestamps em `fundamentos-XX.ts`
2. Adicionar +5s ao timestamp da seção APÓS o playground
3. Ajustar `duration` da aula se necessário

### Problema: Sincronização karaoke errada

**Causa:** Word timestamps não correspondem ao áudio real

**Solução:**
1. Regravar áudio + timestamps usando edge function
2. Verificar que `word_timestamps` foi salvo no banco
3. Limpar cache do navegador
4. Testar novamente

### Problema: Score de qualidade baixo sem motivo aparente

**Causa:** Análise heurística pode ter falsos positivos

**Solução:**
1. Ouvir o áudio manualmente
2. Se soar bem, ignorar warning
3. Se confirmar problema, seguir sugestões da análise
4. Considerar ajustar thresholds na edge function

---

## 📊 Dados Técnicos

### ElevenLabs API

- **Voice ID (Alice):** `Xb7hH8MSUJpSbSDYk0k2`
- **Model ID:** `eleven_multilingual_v2`
- **Taxa de bits recomendada:** 128kbps+
- **Formato de saída:** MP3

### Storage Supabase

- **Bucket:** `lesson-audios`
- **Naming:** `lesson-{lesson_id}-{timestamp}.mp3`
- **Público:** Sim (URL pública)

### Database

- **Tabela:** `lessons`
- **Campos atualizados:**
  - `audio_url` (TEXT) - URL pública do áudio
  - `word_timestamps` (JSONB) - Array de timestamps palavra-por-palavra

---

## 🎓 Recursos Adicionais

- [ElevenLabs Docs](https://elevenlabs.io/docs)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- Admin Audio Generator: `/admin-audio-generator`
- Edge Functions:
  - `generate-audio-with-timestamps`
  - `analyze-audio-quality`

---

**Última atualização:** 2025-11-05
**Versão:** 1.0
