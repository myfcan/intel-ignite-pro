

# Setup Wizard de Seções — Configuração Visual Pós-Parse

## Contexto

Hoje o fluxo no Admin V8 é: colar conteúdo bruto -> converter para JSON -> editar JSON manualmente -> validar -> gerar áudio -> salvar.

O problema: nao existe momento visual para configurar **o que cada secao terá** (imagem, quiz, playground). O usuario precisa saber a sintaxe do parser ou editar JSON cru.

## Solucao

Adicionar um passo intermediário **"Setup"** entre a conversão do conteúdo bruto e a validação do JSON. Esse passo mostra cada seção detectada como um card visual onde o usuário configura o que ela terá.

## Fluxo Novo (5 passos)

```text
Conteúdo Bruto -> [Converter] -> SETUP (novo) -> Validar JSON -> Gerar Áudio -> Salvar
```

## O que o Setup mostra

Para cada seção detectada, um card com:

1. **Titulo da seção** (readonly, vem do parse)
2. **Preview do conteúdo** (primeiras 2-3 linhas, truncado)
3. **Toggles/checkboxes de elementos**:
   - Imagem (toggle + campo URL quando ativo)
   - Quiz após esta seção (toggle — se já existe quiz no parse, vem ativo)
   - Playground após esta seção (toggle — se já existe, vem ativo)
4. **Indicadores visuais**: badges coloridos mostrando o que está ativo (ex: "Imagem", "Quiz", "Playground")

## Comportamento

- Ao ativar "Imagem" em uma seção: abre campo de URL. O valor é injetado no `imageUrl` da seção no JSON.
- Ao ativar "Quiz": se já existe quiz com `afterSectionIndex` correspondente, mostra resumo. Se nao existe, mostra aviso "Adicione o bloco [QUIZ] no conteúdo bruto para esta seção".
- Ao ativar "Playground": mesma lógica do quiz.
- Botao "Aplicar Setup" atualiza o JSON e avança para a tela de validação.

## Arquivos

| Arquivo | Acao |
|---------|------|
| `src/components/admin/V8SectionSetup.tsx` | **Criar** — Componente do wizard de setup por seção |
| `src/pages/AdminV8Create.tsx` | **Editar** — Adicionar step "setup" entre convert e validate, renderizar o novo componente |

## Detalhes Tecnicos

### V8SectionSetup.tsx

- Props: `sections: V8Section[]`, `quizzes: V8InlineQuiz[]`, `playgrounds: V8InlinePlayground[]`, `onApply: (updatedSections, updatedQuizzes, updatedPlaygrounds) => void`
- Estado local: array de configs por secao `{ hasImage: boolean, imageUrl: string, hasQuiz: boolean, hasPlayground: boolean }`
- Inicializa a partir dos dados parseados (se secao já tem imageUrl, toggle vem ativo)
- `onApply` injeta os imageUrls nas secoes e retorna os dados atualizados

### AdminV8Create.tsx

- Novo step type: `"setup"` adicionado ao union `Step`
- Após `handleConvertContent`, em vez de ir direto para JSON, vai para step `"setup"`
- Renderiza `V8SectionSetup` quando `step === "setup"`
- Callback do setup atualiza o `jsonText` e avança para validação

### Escopo limitado (V1 do wizard)

- Imagens: configurável via URL manual (futuro: upload direto)
- Quizzes e Playgrounds: apenas indicação visual de presença (edição completa continua no JSON ou conteúdo bruto)
- Nao gera quizzes/playgrounds automaticamente nesta versão — apenas mostra o que já existe e permite adicionar imageUrl

