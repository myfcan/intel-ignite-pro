# 📦 Templates Prontos para Uso - V1 e V2

> **Criado em**: 2025-11-24
> **Status**: ✅ 100% Completos e Testados

---

## 🎯 O Que São Estes Templates?

Templates **completos e prontos** para criar aulas V1 e V2 no formato correto do Pipeline.

- **Copy-paste ready** - Copie, personalize e use!
- **100% validados** - Seguem todas as especificações do Pipeline
- **Exemplos reais** - Conteúdo de qualidade para referência

---

## 📋 Arquivos Disponíveis

### 1️⃣ TEMPLATE_V1_COMPLETO.json

**Características:**
- ✅ **5 seções** completas com markdown rico
- ✅ **Playground automático** após seção 4 (será adicionado pelo Pipeline)
- ✅ **3 exercícios** estruturados:
  - Multiple-choice
  - True-false
  - Scenario-selection
- ✅ Speech bubbles para cada seção
- ✅ Tema: "Como Dominar os Prompts de IA"

**Quando usar:**
- Aulas interativas com prática durante a lição
- Quando quiser playground mid-lesson
- Conteúdo que precisa de aplicação prática no meio

---

### 2️⃣ TEMPLATE_V2_COMPLETO.json

**Características:**
- ✅ **5 seções** completas com markdown rico
- ✅ **SEM playgrounds** (foco em consumo linear)
- ✅ **5 exercícios** estruturados:
  - Multiple-choice
  - True-false
  - Scenario-selection
  - Fill-blanks
  - Data-collection
- ✅ Speech bubbles para cada seção
- ✅ Tema: "IA no Mercado de Trabalho"

**Quando usar:**
- Aulas de consumo linear (storytelling)
- Conteúdo mais denso e informativo
- Quando não precisa de playground mid-lesson

---

## 🚀 Como Usar

### Método 1: Via AdminPipelineCreateBatch

1. Abra `/admin/pipeline/create-batch`
2. Copie o conteúdo do template desejado
3. Cole no campo JSON
4. Personalize:
   - `title` - Seu título
   - `trackId` - UUID da trilha
   - `trackName` - Nome da trilha
   - `orderIndex` - Ordem na trilha
   - Seções - Adapte o conteúdo
   - Exercícios - Customize as perguntas
5. Clique em "Validar JSON"
6. Clique em "Criar Lotes"

### Método 2: Como Base para Novos JSONs

1. Copie o template correspondente
2. Salve com novo nome (ex: `minha-aula-v1.json`)
3. Edite todo o conteúdo
4. Use como referência de estrutura
5. Envie para o Pipeline

---

## 📊 Diferenças Visuais Entre V1 e V2

| Aspecto | V1 | V2 |
|---------|----|----|
| **Seções** | 5 seções | 5 seções |
| **Exercícios** | 3 exercícios | 5 exercícios |
| **Playground Mid** | ✅ Após seção 4 | ❌ Não tem |
| **Playground Final** | ✅ Opcional | ❌ Não tem |
| **Experiência** | Interativa | Linear |
| **Áudio** | Único com timestamps | 1 por seção |
| **Melhor para** | Prática hands-on | Consumo de conteúdo |

---

## ✅ Checklist de Personalização

Ao adaptar um template, lembre-se de mudar:

- [ ] `title` - Título da sua aula
- [ ] `trackId` - UUID correto da trilha
- [ ] `trackName` - Nome correto da trilha
- [ ] `orderIndex` - Posição correta na trilha (0, 1, 2...)
- [ ] `estimatedTimeMinutes` - Tempo real estimado
- [ ] Conteúdo de todas as seções (`markdown`)
- [ ] Todos os `speechBubble`
- [ ] Perguntas e opções de todos os exercícios
- [ ] Feedbacks dos exercícios

**⚠️ NÃO MUDE** (estrutura do Pipeline):
- `model` - Deve ser "v1" ou "v2"
- `id` das seções - Mantenha pattern "section-N"
- `index` das seções - Sequência 1, 2, 3...
- `type` dos exercícios - Use apenas tipos suportados
- Estrutura geral dos objetos

---

## 🎨 Tipos de Exercícios Disponíveis

### Implementados nos Templates:

1. **multiple-choice** ✅
   - Pergunta com 4 opções
   - Uma resposta correta
   - Feedback personalizado

2. **true-false** ✅
   - Afirmação V ou F
   - Resposta booleana
   - Feedback educativo

3. **scenario-selection** ✅
   - 4 cenários/situações
   - Uma resposta correta
   - Ideal para aplicação prática

4. **fill-blanks** ✅
   - Completar lacunas
   - Aceita respostas alternativas
   - Ótimo para fixação

5. **data-collection** ✅
   - Selecionar múltiplos itens corretos
   - Lista de 6-8 opções
   - Valida quantidade mínima/máxima

### Outros Tipos Suportados:

6. **complete-sentence** - Completar frases
7. **drag-drop** - Arrastar e soltar
8. **platform-match** - Combinar plataformas

---

## 💡 Dicas de Ouro

### Para V1:
- ✅ O playground será **adicionado automaticamente** na seção 4 pelo Pipeline
- ✅ Não precisa especificar `playgroundConfig` (a menos que queira customizar)
- ✅ Use seção 4 para introduzir a prática: "Vamos testar!", "Hora de praticar!"
- ✅ 3 exercícios é o ideal (não sobrecarregar)

### Para V2:
- ✅ Foque em storytelling e narrativa contínua
- ✅ Sem interrupções - experiência fluida
- ✅ 5 exercícios finais compensam a falta de playground
- ✅ Use exercícios variados para manter engajamento

### Conteúdo Geral:
- ✅ Use **emojis** para tornar visual atraente
- ✅ **Markdown** rico: negrito, listas, títulos
- ✅ Speech bubbles **curtos** (1-2 frases)
- ✅ Seções com 3-5 parágrafos cada
- ✅ Feedback dos exercícios deve ser **educativo**, não apenas "correto/errado"

---

## 🔍 Validação do Pipeline

Ambos os templates foram validados contra:

1. **Step 1 (Intake)**
   - ✅ Modelo válido
   - ✅ Título presente
   - ✅ Seções válidas
   - ✅ Exercícios válidos

2. **Step 3 (Áudio)**
   - ✅ V1: Gerará 1 áudio único
   - ✅ V2: Gerará 5 áudios (1 por seção)

3. **Step 5.5 (Playground)**
   - ✅ V1: Playground será adicionado na seção 4
   - ✅ V2: Pula esta etapa (não tem playground)

4. **Step 6 (Validação)**
   - ✅ Estrutura completa validada
   - ✅ Pronto para publicação

---

## 📚 Exemplos de Uso Real

### Cenário 1: Aula Prática de Prompts
**Use:** TEMPLATE_V1_COMPLETO.json
**Por quê:** Tem playground para usuário testar prompts na prática

### Cenário 2: Introdução a IA para Iniciantes
**Use:** TEMPLATE_V2_COMPLETO.json
**Por quê:** Conteúdo linear, fácil de seguir, sem distrações

### Cenário 3: Workshop Hands-On
**Use:** TEMPLATE_V1_COMPLETO.json
**Por quê:** Playground mid-lesson permite prática imediata

### Cenário 4: Aula de Conceitos Densos
**Use:** TEMPLATE_V2_COMPLETO.json
**Por quê:** 5 exercícios finais garantem fixação completa

---

## 🆘 Troubleshooting

### Erro: "Model deve ser v1 ou v2"
**Solução:** Verifique se `"model": "v1"` ou `"model": "v2"` está correto

### Erro: "trackId inválido"
**Solução:** Use um UUID válido. Exemplo: `"efa0c22c-26fb-44d2-b1dc-721724ca5c5b"`

### Erro: "Seção sem id"
**Solução:** Toda seção deve ter `"id": "section-N"`

### Erro: "Exercício sem type"
**Solução:** Todo exercício precisa de `"type": "multiple-choice"` (ou outro tipo válido)

### Erro: "JSON inválido"
**Solução:** Use um validador JSON online para verificar vírgulas, chaves, aspas

---

## 📞 Referências

**Documentação Oficial:**
- `FORMATO_JSON_AULAS_V1_V2.md` - Especificação completa
- `docs/LESSON_MODELS.md` - Modelos de aula

**Código do Pipeline:**
- `/src/lib/lessonPipeline/types.ts` - Tipos TypeScript
- `/src/lib/lessonPipeline/step1-intake.ts` - Validações
- `/src/lib/lessonPipeline/step5-5-process-playground.ts` - Playground V1

**Admin:**
- `/admin/pipeline/create-batch` - Interface de criação em lote
- `/admin/pipeline/create-single` - Interface de criação individual

---

## 🎓 Próximos Passos

1. Escolha seu template (V1 ou V2)
2. Copie o conteúdo
3. Personalize para seu tema
4. Valide no admin
5. Execute o Pipeline
6. Teste a aula criada
7. Ajuste conforme necessário

**✨ Bom trabalho!**

---

**Última atualização:** 2025-11-24
**Autor:** Sistema MAIA Pipeline
**Status:** ✅ Pronto para produção
