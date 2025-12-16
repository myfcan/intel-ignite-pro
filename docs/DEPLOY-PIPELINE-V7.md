# 🚀 DEPLOY DO PIPELINE V7 CORRIGIDO

## ⚠️ ATENÇÃO: Pipeline Precisa Ser Deployado

O código do Pipeline V7 foi **corrigido localmente** (commit `054d599`), mas ainda **não está no Supabase**.

O monitor mostra "0 narrações" porque:
1. ✅ **Frontend corrigido** (commit `83c2e1c`) - conta narrações corretamente
2. ❌ **Backend desatualizado** - Pipeline no Supabase ainda tem o bug

---

## 🔧 CORREÇÕES APLICADAS (Local)

### 1. Pipeline V7 (supabase/functions/v7-pipeline/index.ts)
- ✅ Interface corrigida: `content: { visual, audio }`
- ✅ Linha 225: `act.content?.audio?.narration`
- ✅ Linha 330-340: Reconstrução do cinematic_flow

### 2. AdminV7Create (src/pages/AdminV7Create.tsx)
- ✅ Linha 151: Contagem de narrações corrigida

---

## 📦 COMO FAZER DEPLOY

### Opção 1: Deploy via Lovable (Recomendado)

1. Acesse o projeto no Lovable
2. Faça **Sync do GitHub** para puxar os commits:
   - `054d599` - fix: Corrigir extração de narrações no Pipeline V7
   - `83c2e1c` - fix: Corrigir contagem de narrações no AdminV7Create
3. O Lovable vai fazer deploy automático no Supabase

---

### Opção 2: Deploy Manual via Supabase Dashboard

**⚠️ Método manual - use apenas se Lovable não funcionar**

#### Passo 1: Acessar Supabase Dashboard
1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto `intel-ignite-pro`
3. Clique em **Edge Functions** no menu lateral

#### Passo 2: Editar a Function v7-pipeline
1. Encontre a function `v7-pipeline`
2. Clique em **Edit Function**
3. **SUBSTITUIR TODO O CÓDIGO** pelo conteúdo de:
   ```
   /home/user/intel-ignite-pro/supabase/functions/v7-pipeline/index.ts
   ```

#### Passo 3: Deploy
1. Clique em **Deploy**
2. Aguarde a mensagem de sucesso

---

### Opção 3: Deploy via Supabase CLI

**⚠️ Requer instalação do Supabase CLI**

```bash
# Instalar Supabase CLI (se necessário)
npm install -g supabase

# Login
supabase login

# Link do projeto
supabase link --project-ref [YOUR_PROJECT_REF]

# Deploy da function
supabase functions deploy v7-pipeline
```

---

## ✅ COMO VERIFICAR SE O DEPLOY FUNCIONOU

### Antes do Deploy (BUG):
```json
{
  "stats": {
    "actCount": 7,
    "narrationCount": 0,  ← ERRADO
    "hasAudio": false,     ← ERRADO
    "hasWordTimestamps": false
  }
}
```

### Depois do Deploy (CORRIGIDO):
```json
{
  "stats": {
    "actCount": 7,
    "narrationCount": 7,  ← CORRETO
    "hasAudio": true,      ← CORRETO
    "hasWordTimestamps": true
  }
}
```

---

## 🧪 TESTE COMPLETO APÓS DEPLOY

### 1. Prepare o JSON de Teste
Use: `/docs/v7-complete-lesson-FIXED.json`

### 2. Acesse a Interface de Criação
- Vá para: `/admin/v7/create`

### 3. Cole o JSON e Envie
- Cole o conteúdo do `v7-complete-lesson-FIXED.json`
- Clique em **"Enviar para Pipeline V7"**

### 4. Verifique o Monitor
Você deve ver:
- ✅ **Validando JSON** - JSON validado com sucesso
- ✅ **Processando Atos Cinematográficos** - 7 atos
- ✅ **Extraindo Narrações** - **7 narrações** ← DEVE MOSTRAR 7!
- ✅ **Gerando Áudio** - **Áudio gerado** ← DEVE GERAR ÁUDIO!
- ✅ **Construindo Conteúdo Final** - OK
- ✅ **Salvando no Banco de Dados** - ID: xxxxx

### 5. Verifique os Logs
No console do navegador (F12):
```
[V7Pipeline] Extracted 7 narration segments for TTS
[V7Pipeline] Total narration length: 2847
[V7Pipeline] Step 3: Generating audio with ElevenLabs...
[V7Pipeline] Audio generated: https://...
[V7Pipeline] Word timestamps: 423
```

---

## 🐛 SE AINDA MOSTRAR "0 NARRAÇÕES"

### Possíveis Causas:

1. **Deploy não foi feito**
   - Solução: Fazer deploy do pipeline

2. **Cache do Supabase**
   - Solução: Esperar 1-2 minutos e tentar novamente

3. **JSON com estrutura errada**
   - Verificar se está usando: `act.content.audio.narration`
   - NÃO usar: `act.audio.narration`

4. **ELEVENLABS_API_KEY não configurada**
   - Ir em: Supabase Dashboard → Project Settings → Edge Functions → Secrets
   - Adicionar: `ELEVENLABS_API_KEY`

---

## 📊 RESUMO DAS MUDANÇAS

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `v7-pipeline/index.ts` (linha 37-49) | Interface corrigida | ✅ Local |
| `v7-pipeline/index.ts` (linha 225) | Extração corrigida | ✅ Local |
| `v7-pipeline/index.ts` (linha 330-340) | Reconstrução corrigida | ✅ Local |
| `AdminV7Create.tsx` (linha 151) | Contagem corrigida | ✅ Local |
| **Supabase Edge Function** | **PENDENTE DEPLOY** | ❌ **PRECISA DEPLOY** |

---

## ⏭️ PRÓXIMOS PASSOS

1. ✅ Código corrigido (local)
2. ✅ Commits feitos e pushados
3. ⏳ **FAZER DEPLOY NO SUPABASE** ← VOCÊ ESTÁ AQUI
4. ⏳ Testar criação de lição
5. ⏳ Verificar áudio gerado
6. ⏳ Confirmar funcionamento completo

---

## 📝 NOTAS

- O bug foi causado pelo Lovable gerando código com estrutura incorreta
- A correção foi feita manualmente após auditoria completa
- Todos os bugs identificados foram corrigidos
- A documentação foi atualizada em `/docs/AUDITORIA-PIPELINE-V7.md`

**Status Atual:** ✅ CÓDIGO CORRIGIDO | ⏳ AGUARDANDO DEPLOY
