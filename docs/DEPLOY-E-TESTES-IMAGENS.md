# 🚀 DEPLOY E TESTES - Geração de Imagens V3

**Status:** ✅ OPENAI_API_KEY configurada | ⏳ Aguardando deploy

---

## PASSO 1: Deploy da Edge Function ⏳

### Opção A: Via Lovable (RECOMENDADO)

1. Acesse: **Lovable → Deploy**
2. Encontre: **Edge Functions**
3. Selecione: `generate-slide-images`
4. Clique em: **Deploy**
5. Aguarde: ~30 segundos
6. Confirme: "✅ Deployed successfully"

### Opção B: Via Supabase Dashboard

1. Acesse: [Supabase Dashboard](https://app.supabase.com)
2. Seu projeto → **Edge Functions**
3. Clique em: **Deploy new version**
4. Selecione arquivo: `supabase/functions/generate-slide-images/index.ts`
5. Deploy

### Opção C: Via CLI (se instalado)

```bash
supabase functions deploy generate-slide-images
```

---

## PASSO 2: Testar com 1 Imagem ⏳

### Teste Manual via Navegador

1. Abra o projeto no navegador
2. Abra DevTools (F12)
3. Vá na aba **Console**
4. Cole e execute:

```javascript
// Importar supabase
import { supabase } from '@/integrations/supabase/client';

// Testar 1 imagem
const { data, error } = await supabase.functions.invoke('generate-slide-images', {
  body: {
    slides: [
      {
        id: 'test-1',
        slideNumber: 1,
        contentIdea: 'Uma pessoa trabalhando com inteligência artificial'
      }
    ],
    batchSize: 1,
    batchIndex: 0
  }
});

if (error) {
  console.error('❌ Erro:', error);
} else {
  console.log('✅ Sucesso!');
  console.log('📊 Stats:', data.stats);
  console.log('🖼️ Imagem:', data.slides[0].imageUrl ? 'GERADA' : 'FALHOU');
}
```

### Resultado Esperado:

```
✅ Sucesso!
📊 Stats: {
  total: 1,
  processed: 1,
  success: 1,
  failed: 0,
  batchIndex: 0,
  totalBatches: 1,
  hasMoreBatches: false
}
🖼️ Imagem: GERADA
```

### Se der erro:

| Erro | Causa | Solução |
|------|-------|---------|
| `OPENAI_API_KEY not configured` | Secret não encontrada | Verificar em Supabase → Edge Functions → Secrets |
| `OpenAI API error (401)` | Chave inválida | Verificar chave em platform.openai.com |
| `Timeout` | Imagem muito complexa | Simplificar contentIdea |

---

## PASSO 3: Testar com 14 Imagens (Pipeline Completo) ⏳

### Criar Aula V3 de Teste

1. Vá em: **Admin → Pipeline → Create Batch**

2. Cole este JSON (já pronto para uso):

```json
[
  {
    "model": "v3",
    "title": "Teste: Geração de Imagens V3",
    "trackId": "SUBSTITUA_COM_TRACK_ID_REAL",
    "trackName": "Testes",
    "orderIndex": 999,
    "v3Data": {
      "audioText": "Este é um teste completo de geração de imagens para o modelo V3. Estamos validando que o sistema de batching funciona corretamente com 14 slides. Cada imagem é gerada pela OpenAI DALL-E 3 em alta qualidade. O processo acontece em 4 batches sequenciais para respeitar o limite de tempo da edge function. Ao final, todas as imagens devem estar disponíveis nos slides. Este texto será convertido em áudio apenas DEPOIS que todas as imagens forem geradas com sucesso.",
      "slides": [
        { "id": "slide-1", "slideNumber": 1, "contentIdea": "Pessoa trabalhando com inteligência artificial em laptop moderno" },
        { "id": "slide-2", "slideNumber": 2, "contentIdea": "Gráfico de crescimento exponencial com cores vibrantes" },
        { "id": "slide-3", "slideNumber": 3, "contentIdea": "Rede neural artificial com conexões brilhantes" },
        { "id": "slide-4", "slideNumber": 4, "contentIdea": "Robô colaborativo trabalhando ao lado de humano" },
        { "id": "slide-5", "slideNumber": 5, "contentIdea": "Dashboard empresarial com métricas e KPIs" },
        { "id": "slide-6", "slideNumber": 6, "contentIdea": "Código de programação Python moderno e limpo" },
        { "id": "slide-7", "slideNumber": 7, "contentIdea": "Conceito abstrato de machine learning e aprendizado" },
        { "id": "slide-8", "slideNumber": 8, "contentIdea": "Transformação digital em empresa moderna" },
        { "id": "slide-9", "slideNumber": 9, "contentIdea": "Análise de big data com visualizações futuristas" },
        { "id": "slide-10", "slideNumber": 10, "contentIdea": "Automação de processos em linha de produção" },
        { "id": "slide-11", "slideNumber": 11, "contentIdea": "Interface de usuário futurista e minimalista" },
        { "id": "slide-12", "slideNumber": 12, "contentIdea": "Inovação tecnológica e ideias criativas" },
        { "id": "slide-13", "slideNumber": 13, "contentIdea": "Sucesso empresarial e crescimento estratégico" },
        { "id": "slide-14", "slideNumber": 14, "contentIdea": "Celebração de conquistas com time feliz" }
      ],
      "finalPlaygroundConfig": {
        "type": "real-playground",
        "instruction": "Teste de playground no final"
      }
    },
    "exercises": [
      {
        "type": "multiple-choice",
        "question": "Esta é uma pergunta de teste. Qual a resposta correta?",
        "data": {
          "options": ["Opção A (correta)", "Opção B", "Opção C"],
          "correctAnswer": "Opção A (correta)"
        }
      }
    ],
    "estimatedTimeMinutes": 5
  }
]
```

3. **Antes de executar:** Substitua `"SUBSTITUA_COM_TRACK_ID_REAL"` por um trackId válido do seu banco

4. Clique em: **Create Batch**

5. Monitore os logs (devem aparecer em tempo real)

### Logs Esperados:

```
✅ [STEP 1] Entrada validada com sucesso
✅ [STEP 2] Texto limpo e preparado
🎙️ [V3] Gerando áudio + imagens de slides...
   🎙️ Gerando áudio...
   ✅ Áudio salvo: https://...
   🖼️ Gerando imagens dos slides...
   📦 Processando 14 imagens em 4 batches de 4
   🔄 Batch 1/4...
   ✅ Batch 1/4: 4 imagens geradas
   🔄 Batch 2/4...
   ✅ Batch 2/4: 4 imagens geradas
   🔄 Batch 3/4...
   ✅ Batch 3/4: 4 imagens geradas
   🔄 Batch 4/4...
   ✅ Batch 4/4: 2 imagens geradas
   ✅ Total: 14/14 imagens geradas com sucesso
✅ [V3] Áudio + imagens completos
```

### Tempo Estimado:

- Áudio: ~2 minutos
- Imagens (4 batches): ~8 minutos
- Total: **~10 minutos**

---

## ✅ CHECKLIST DE VALIDAÇÃO

### Edge Function:

- [ ] Deploy concluído com sucesso
- [ ] Teste com 1 imagem funcionou
- [ ] Imagem retornada como data URL base64
- [ ] Tamanho da imagem: ~300-600 KB

### Pipeline V3:

- [ ] Aula criada sem erros
- [ ] Logs mostram 4 batches processados
- [ ] Total: 14/14 imagens geradas
- [ ] Slides no banco têm campo `imageUrl` preenchido
- [ ] Front-end exibe imagens corretamente

### Performance:

- [ ] Batch 1: ~2 min
- [ ] Batch 2: ~2 min
- [ ] Batch 3: ~2 min
- [ ] Batch 4: ~1 min (só 2 imagens)
- [ ] Total: ~8 min para imagens

---

## 🐛 TROUBLESHOOTING

### 1. Edge Function não deployou

**Sintomas:**
- Erro 404 ao chamar função
- Função não aparece na lista

**Solução:**
- Verificar nome da função: `generate-slide-images`
- Tentar deploy via Supabase Dashboard
- Verificar logs de deploy

### 2. Erro "OPENAI_API_KEY not configured"

**Sintomas:**
- Erro 500 ao chamar função
- Mensagem sobre key não configurada

**Solução:**
1. Supabase Dashboard → Project Settings
2. Edge Functions → Secrets
3. Verificar que `OPENAI_API_KEY` existe
4. Se não existe, adicionar novamente
5. Fazer re-deploy da função

### 3. Imagens não são geradas

**Sintomas:**
- Stats mostram `success: 0`
- Slides retornam sem `imageUrl`

**Solução:**
1. Verificar logs da edge function no Supabase
2. Procurar por erros da OpenAI API
3. Verificar se chave tem créditos disponíveis
4. Simplificar os `contentIdea` dos slides

### 4. Timeout nos batches

**Sintomas:**
- Erro "Timeout no batch X"
- Pipeline para no meio

**Solução:**
1. Reduzir `BATCH_SIZE` de 4 para 3
2. Arquivo: `src/lib/lessonPipeline/step3-generate-audio.ts`
3. Linha 280: `const BATCH_SIZE = 3;`
4. Isso aumenta o número de batches mas reduz risco de timeout

### 5. Imagens de baixa qualidade

**Sintomas:**
- Imagens borradas ou pixeladas
- Não refletem o contentIdea

**Solução:**
1. Melhorar os prompts em `contentIdea`
2. Ser mais específico e descritivo
3. Evitar conceitos muito abstratos
4. Exemplo ruim: "IA"
5. Exemplo bom: "Pessoa trabalhando com IA em laptop moderno"

---

## 💰 CUSTOS (OpenAI)

### DALL-E 3 Standard Quality:

- **Tamanho:** 1792x1024 (landscape)
- **Custo por imagem:** $0.040
- **Aula com 14 slides:** $0.56
- **100 aulas/mês:** $56.00

### Como monitorar custos:

1. Acesse: https://platform.openai.com/usage
2. Veja: API usage → DALL-E 3
3. Filtre por data

### Como reduzir custos:

1. **Reduzir tamanho:**
   - Mudar de `1792x1024` para `1024x1024`
   - Economiza ~50% ($0.020/imagem)

2. **Usar cache de imagens:**
   - Salvar imagens no Supabase Storage
   - Reutilizar imagens similares

3. **Limitar slides:**
   - Máximo de 10 slides por aula V3
   - Ao invés de 14 → $0.40/aula

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica | Meta | Atual |
|---------|------|-------|
| Taxa de sucesso | 100% | ⏳ |
| Tempo por imagem | <35s | ⏳ |
| Tempo total (14 img) | <10min | ⏳ |
| Custo por aula | $0.56 | ⏳ |
| Uptime da API | 99%+ | ⏳ |

---

## 🎉 CONCLUSÃO

Após completar os 3 testes, você deve ter:

✅ Edge function deployada e funcionando
✅ Teste com 1 imagem bem-sucedido
✅ Aula V3 completa com 14 imagens geradas
✅ Pipeline V3 100% funcional

**Próximo passo:** Voltar para a implementação da Opção B (refatoração do pipeline) 🚀
