# Plano Revisado — Análise Preditiva de 100% de Sucesso  
  
Atue como um engenheiro sênior responsável pelo sistema V10 de todo o sistema e banco de dados, atue com obrigação de precisão técnica absoluta.

&nbsp;

REGRA DESTE PROMPT:  
  
Execute todo o plano, mas caso não execute por alguma razão, você é obrigado é dizer:  
Não implementei todo o plano ou não executei uma das correções. 

&nbsp;

&nbsp;

Você NÃO pode mentir.

Você NÃO pode supor.

Você NÃO pode responder com explicações genéricas.

Você NÃO pode omitir dados.

Você deve executar tudo com DADOS REAIS do código atual.

Você deve copiar e colar trechos REAIS do código.

Você deve usar logs reais e timestamps reais.

Se não souber algo, diga explicitamente: “NÃO LOCALIZADO NO CÓDIGO”.  
  
TUDO ISSO É MANDATÓRIO

## Diagnóstico Real (3 bugs/gaps confirmados no código)

### Bug 1: Modal fora do DOM no cenário sem aula

**Evidência:**

- Linha 599: `if (!pipeline.lesson_id) { return (...); }` — early return
- Linha 650: `onClick={() => setShowInstructionsModal(true)}` — estado muda
- Linha 829-837: `<GenerateWithInstructionsModal>` está **dentro do segundo return** (linha 663+)
- **Resultado**: Estado muda mas modal não existe no DOM. Botão não faz nada.

### Bug 2: `trail_id` e `course_id` não enviados à edge function

**Evidência:**

- Linha 225: `body: { pipeline_id: pipeline.id, num_steps: 10, instructions: instructions || '' }` — sem trail_id/course_id
- Edge function linha 60-71: insere em `v10_lessons` sem `trail_id` nem `course_id`
- Linha 81-82: `selectedTrailId` e `selectedCourseId` existem no componente mas nunca chegam à edge function
- `handleCreateLesson` (L132-133) **já passa** trail_id/course_id. O fluxo "Gerar com IA" não.
- **Resultado**: Aulas criadas via IA ficam órfãs.

### Bug 3: Modal fecha mesmo em erro (perda de instruções)

**Evidência:**

- Linha 832-834:

```tsx
onGenerate={async (instructions) => {
  await handleGenerateWithAI(instructions);
  setShowInstructionsModal(false); // SEMPRE executa
}}
```

- `handleGenerateWithAI` (L228-231, L233-236): faz `return` após toast.error sem lançar exceção
- O `await` resolve normalmente e `setShowInstructionsModal(false)` executa
- **Resultado**: Usuário perde instruções ao ter erro.

---

## Correções (3 alterações, 2 arquivos)

### Alteração 1 — Mover modal para nível raiz do JSX

**Arquivo**: `src/components/admin/v10/stages/Stage2Structure.tsx`

Reestruturar os dois `return` (L599-660 e L663-893) em um único return com condicional, colocando o `<GenerateWithInstructionsModal>` fora de qualquer branch:

```text
return (
  <>
    {!pipeline.lesson_id ? (
      <Card>...branch sem aula (L601-659)...</Card>
    ) : (
      <Card>...branch com aula (L664-892)...</Card>
    )}
    <GenerateWithInstructionsModal
      open={showInstructionsModal}
      onClose={() => setShowInstructionsModal(false)}
      onGenerate={async (instructions) => {
        const ok = await handleGenerateWithAI(instructions);
        if (ok) setShowInstructionsModal(false);
      }}
      isLoading={generating}
    />
  </>
);
```

Remover a instância duplicada do modal que está na linha 829-837.

### Alteração 2 — handleGenerateWithAI retorna boolean + passa trail_id/course_id

**Arquivo**: `src/components/admin/v10/stages/Stage2Structure.tsx`

Linha 221-254: mudar assinatura e body:

```typescript
const handleGenerateWithAI = async (instructions?: string): Promise<boolean> => {
  setGenerating(true);
  try {
    const { data, error } = await supabase.functions.invoke('v10-generate-steps', {
      body: {
        pipeline_id: pipeline.id,
        num_steps: 10,
        instructions: instructions || '',
        trail_id: selectedTrailId || null,
        course_id: selectedCourseId || null,
      },
    });

    if (error) {
      toast.error(`Erro ao gerar passos: ${error.message || 'erro desconhecido'}`);
      return false;
    }
    if (data?.error) {
      toast.error(`Erro: ${data.error}`);
      return false;
    }

    // ... resto igual (L238-249) ...
    return true;
  } catch (err) {
    toast.error(`Erro ao gerar passos: ${err instanceof Error ? err.message : 'erro desconhecido'}`);
    return false;
  } finally {
    setGenerating(false);
  }
};
```

### Alteração 3 — Edge function aceita e usa trail_id/course_id

**Arquivo**: `supabase/functions/v10-generate-steps/index.ts`

Linha 33: extrair novos campos:

```typescript
const { pipeline_id, num_steps, instructions, trail_id, course_id } = await req.json();
```

Linhas 60-71: incluir no insert:

```typescript
.insert({
  slug: pipeline.slug,
  title: pipeline.title,
  status: "draft",
  total_steps: 0,
  estimated_minutes: 0,
  tools: [],
  xp_reward: 0,
  order_in_trail: 0,
  ...(trail_id ? { trail_id } : {}),
  ...(course_id ? { course_id } : {}),
})
```

---

## Análise Preditiva — Checklist de 100%


| Cenário                                                       | Coberto?                                                |
| ------------------------------------------------------------- | ------------------------------------------------------- |
| Clicar "Criar Aula + Gerar com IA" sem lesson_id → modal abre | Sim (Alt. 1)                                            |
| Clicar "Gerar com IA (10 passos)" com lesson_id → modal abre  | Sim (Alt. 1)                                            |
| Instruções chegam à edge function                             | Já funciona (L33, L99-100)                              |
| trail_id/course_id passados na criação de lesson via IA       | Sim (Alt. 2 + 3)                                        |
| Erro na geração → modal permanece aberto com instruções       | Sim (Alt. 2: return false)                              |
| Sucesso → modal fecha                                         | Sim (Alt. 1: `if (ok) setShowInstructionsModal(false)`) |
| Pipeline atualizado com lesson_id após geração                | Já funciona (L245-248)                                  |
| Tipo do modal (`Promise<void>`) compatível com wrapper        | Sim — wrapper retorna void                              |
| Sem migration necessária                                      | Sim — `v10_lessons` já tem `trail_id` e `course_id`     |


## Riscos Residuais

Nenhum identificado. As 3 alterações cobrem todos os gaps encontrados no código real.