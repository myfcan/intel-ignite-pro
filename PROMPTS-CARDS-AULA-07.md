# PROMPTS PARA CRIAR OS 15 CARDS DA AULA 07

**Título da Aula:** Planilhas, organização e automação leve com I.A.

**Instruções:** Copie e cole cada prompt abaixo no Lovable, um por vez.

---

## 📌 CARD 1: Fear Breaker

```
# CRIAR CARD EFFECT: Fear Breaker

Crie o componente `CardEffectFearBreaker.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `fear-breaker`
**Arquivo:** `CardEffectFearBreaker.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

A tela de uma planilha vazia aparece em close, com várias células em branco e um clima de tensão leve (luz fria, cursor piscando). As palavras "medo de errar", "bagunça", "e se eu apagar algo?" surgem flutuando sobre a tela e vão se desfazendo em partículas. A tela muda suavemente para uma visão organizada, com poucas colunas bem nomeadas, e o clima visual fica mais claro e calmo.

**Divisão em 4 cenas progressivas:**
- **Cena 1:** Planilha vazia em close, células em branco, luz fria, cursor piscando
- **Cena 2:** Palavras negativas surgem ("medo de errar", "bagunça", "e se eu apagar?")
- **Cena 3:** Palavras se desfazem em partículas que desaparecem
- **Cena 4:** Planilha organizada com poucas colunas claras, clima visual mais calmo

## Props padrão:
- title: "A trava da planilha!"
- subtitle: "Do medo da tela em branco ao primeiro passo guiado"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-900 dark:to-blue-950/30`

5. **Ícones sugeridos:** FileSpreadsheet (planilha), AlertCircle (medo), Sparkles (transformação), CheckCircle (organização)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 2: QA Table

```
# CRIAR CARD EFFECT: QA Table

Crie o componente `CardEffectQaTable.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `qa-table`
**Arquivo:** `CardEffectQaTable.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Linhas surgem uma a uma em uma tabela: "Compra no mercado", "Venda do dia", "Pagamento de aluguel", com ícones simples ao lado. No topo da tabela aparece a frase "Perguntas" e, no rodapé, a palavra "Respostas", conectadas por uma linha luminosa. O foco da câmera aproxima em uma única linha, destacando como uma situação do dia a dia vira informação organizada.

**Divisão em 4 cenas progressivas:**
- **Cena 1:** Primeira linha surge: "Compra no mercado" com ícone de carrinho
- **Cena 2:** Mais linhas aparecem ("Venda do dia", "Pagamento de aluguel") com ícones
- **Cena 3:** "Perguntas" no topo e "Respostas" no rodapé, linha luminosa conectando
- **Cena 4:** Zoom em uma linha destacando a transformação de situação em informação

## Props padrão:
- title: "Planilha como perguntas e respostas!"
- subtitle: "Cada linha é uma situação real, não só números"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30`

5. **Ícones sugeridos:** ShoppingCart (compra), DollarSign (venda), Home (aluguel), Table (tabela)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 3: AI Assistant

```
# CRIAR CARD EFFECT: AI Assistant

Crie o componente `CardEffectAiAssistant.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `ai-assistant`
**Arquivo:** `CardEffectAiAssistant.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Um pequeno avatar de I.A. aparece ao lado de uma planilha, apontando para células vazias com um efeito de destaque suave. As colunas recebem nomes automaticamente (Data, Categoria, Valor), como se fossem digitadas sozinhas. O avatar faz um gesto de "ok" para a câmera, enquanto a pessoa ajusta apenas um ou dois campos com o cursor.

**Divisão em 4 cenas progressivas:**
- **Cena 1:** Avatar de I.A. aparece ao lado de planilha vazia
- **Cena 2:** Avatar aponta para células vazias com destaque suave
- **Cena 3:** Colunas recebem nomes automaticamente (Data, Categoria, Valor)
- **Cena 4:** Avatar faz gesto de "ok", cursor ajusta poucos campos

## Props padrão:
- title: "A I.A. como assistente de planilhas!"
- subtitle: "Ela cuida da parte chata, você decide"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30`

5. **Ícones sugeridos:** Bot (I.A.), FileSpreadsheet (planilha), Wand2 (automação), ThumbsUp (ok)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 4: Three Questions

```
# CRIAR CARD EFFECT: Three Questions

Crie o componente `CardEffectThreeQuestions.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `three-questions`
**Arquivo:** `CardEffectThreeQuestions.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Três cartões grandes aparecem lado a lado na tela, cada um com um número: 1, 2 e 3. Cada cartão gira e revela uma frase curta: "O que acompanhar?", "Com que detalhe?" e "O que ver no final?". Os três cartões se alinham acima de uma planilha em branco, sugerindo que elas são a base da estrutura.

**Divisão em 4 cenas progressivas:**
- **Cena 1:** Três cartões aparecem com números 1, 2, 3
- **Cena 2:** Primeiro cartão gira revelando "O que acompanhar?"
- **Cena 3:** Segundo e terceiro giram: "Com que detalhe?" e "O que ver no final?"
- **Cena 4:** Cartões se alinham acima de planilha vazia (base da estrutura)

## Props padrão:
- title: "As três perguntas mágicas!"
- subtitle: "O que acompanhar, com que detalhe e o que ver no final"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30`

5. **Ícones sugeridos:** HelpCircle (pergunta), Search (acompanhar), Layers (detalhe), Target (objetivo)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 5: Map Visual

```
# CRIAR CARD EFFECT: Map Visual

Crie o componente `CardEffectMapVisual.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `map-visual`
**Arquivo:** `CardEffectMapVisual.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Um emaranhado de números e símbolos aparece flutuando, dando sensação de confusão. A câmera faz um zoom out e esses elementos se reorganizam em um quadro simples com poucas colunas bem marcadas. Linhas se iluminam em sequência, como se o mapa estivesse "acordando" e fazendo sentido para quem olha.

**Divisão em 4 cenas progressivas:**
- **Cena 1:** Emaranhado de números e símbolos flutuando (confusão)
- **Cena 2:** Zoom out da câmera começando
- **Cena 3:** Elementos se reorganizam em quadro com poucas colunas marcadas
- **Cena 4:** Linhas se iluminam em sequência (mapa "acordando")

## Props padrão:
- title: "Transformando medo em mapa visual!"
- subtitle: "Da confusão para uma visão clara do que importa"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30`

5. **Ícones sugeridos:** Shuffle (confusão), ZoomOut (zoom), Grid (organização), Lightbulb (clareza)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 6: Problem To Structure

```
# CRIAR CARD EFFECT: Problem To Structure

Crie o componente `CardEffectProblemToStructure.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `problem-to-structure`
**Arquivo:** `CardEffectProblemToStructure.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Um campo de texto aparece com uma frase simples sendo digitada: "Quero acompanhar minhas despesas do mês…". Esse texto se transforma em um desenho de planilha com colunas surgindo uma a uma. Um destaque em volta da planilha mostra o antes e depois: de um parágrafo solto para uma estrutura organizada.

**Divisão em 4 cenas progressivas:**
- **Cena 1:** Campo de texto vazio aparece
- **Cena 2:** Frase sendo digitada: "Quero acompanhar minhas despesas do mês…"
- **Cena 3:** Texto se transforma em planilha, colunas surgindo uma a uma
- **Cena 4:** Destaque mostra antes/depois (parágrafo → estrutura organizada)

## Props padrão:
- title: "Você fala, a I.A. monta!"
- subtitle: "Do texto simples à planilha pronta para usar"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30`

5. **Ícones sugeridos:** MessageSquare (texto), ArrowRight (transformação), Table (planilha), Sparkles (magia)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 7: Finance Example

```
# CRIAR CARD EFFECT: Finance Example

Crie o componente `CardEffectFinanceExample.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `finance-example`
**Arquivo:** `CardEffectFinanceExample.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Um extrato confuso cheio de gastos aparece, com vários valores destacados em vermelho. A cena se transforma em uma planilha simples com colunas: Data, Descrição, Categoria, Valor. Uma barra de limite de gastos aparece no topo, e quando os valores ultrapassam, um alerta visual em vermelho pisca levemente.

**Divisão em 4 cenas progressivas:**
- **Cena 1:** Extrato confuso com gastos, valores em vermelho
- **Cena 2:** Transforma em planilha (Data, Descrição, Categoria, Valor)
- **Cena 3:** Barra de limite de gastos aparece no topo
- **Cena 4:** Alerta vermelho pisca quando limite é ultrapassado

## Props padrão:
- title: "Exemplo real: finanças pessoais!"
- subtitle: "Do "não sei para onde vai" ao controle mês a mês"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30`

5. **Ícones sugeridos:** Receipt (extrato), Table (planilha), TrendingDown (limite), AlertTriangle (alerta)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 8: Sales Example

```
# CRIAR CARD EFFECT: Sales Example

Crie o componente `CardEffectSalesExample.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `sales-example`
**Arquivo:** `CardEffectSalesExample.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Pedidos soltos aparecem como ícones (caixinhas, etiquetas, boletos) flutuando sem ordem na tela. Eles são puxados para dentro de uma planilha com colunas de data, produto, canal e valor. Um gráfico de colunas sobe na lateral, mostrando os dias com mais e menos vendas com animação suave.

**Divisão em 4 cenas progressivas:**
- **Cena 1:** Pedidos soltos flutuando (caixinhas, etiquetas, boletos)
- **Cena 2:** Ícones são puxados para dentro da planilha
- **Cena 3:** Colunas aparecem: data, produto, canal, valor
- **Cena 4:** Gráfico de colunas sobe mostrando vendas por dia

## Props padrão:
- title: "Exemplo real: vendas do pequeno negócio!"
- subtitle: "Visualizando o ritmo de vendas com I.A."

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30`

5. **Ícones sugeridos:** Package (pedidos), ShoppingBag (produto), BarChart3 (gráfico), TrendingUp (vendas)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 9: Tasks Example

```
# CRIAR CARD EFFECT: Tasks Example

Crie o componente `CardEffectTasksExample.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `tasks-example`
**Arquivo:** `CardEffectTasksExample.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Vários bilhetes, ícones de mensagens e lembretes aparecem sobrepostos, transmitindo sensação de caos. Tudo é puxado para uma tabela com colunas: Tarefa, Prazo, Prioridade, Status. As tarefas concluídas ficam verdes, as atrasadas em laranja ou vermelho, e a visão semanal se estabiliza como um calendário simples.

**Divisão em 4 cenas progressivas:**
- **Cena 1:** Bilhetes, mensagens e lembretes sobrepostos (caos)
- **Cena 2:** Tudo puxado para tabela (Tarefa, Prazo, Prioridade, Status)
- **Cena 3:** Tarefas concluídas ficam verdes, atrasadas laranja/vermelho
- **Cena 4:** Visão semanal se estabiliza como calendário simples

## Props padrão:
- title: "Exemplo real: agenda organizada!"
- subtitle: "Tarefas soltas viram um painel claro da semana"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30`

5. **Ícones sugeridos:** StickyNote (bilhetes), CheckSquare (tarefas), Calendar (calendário), ListTodo (lista)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 10: Tool Combo

```
# CRIAR CARD EFFECT: Tool Combo

Crie o componente `CardEffectToolCombo.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `tool-combo`
**Arquivo:** `CardEffectToolCombo.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

De um lado da tela, aparece um chat de I.A.; do outro, uma planilha vazia. Um prompt curto aparece no chat, e uma linha de energia liga o chat à planilha. As colunas da planilha começam a ser preenchidas automaticamente, mostrando a parceria entre as duas ferramentas.

**Divisão em 4 cenas progressivas:**
- **Cena 1:** Chat de I.A. de um lado, planilha vazia do outro
- **Cena 2:** Prompt curto aparece no chat
- **Cena 3:** Linha de energia liga chat à planilha
- **Cena 4:** Colunas preenchidas automaticamente (parceria das ferramentas)

## Props padrão:
- title: "As duas peças principais!"
- subtitle: "Chat de I.A. + planilha trabalhando juntos"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30`

5. **Ícones sugeridos:** MessageSquare (chat), Table (planilha), Zap (energia), Link (conexão)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 11: Simulator Call

```
# CRIAR CARD EFFECT: Simulator Call

Crie o componente `CardEffectSimulatorCall.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `simulator-call`
**Arquivo:** `CardEffectSimulatorCall.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Um pequeno painel com quatro passos aparece (1, 2, 3, 4), com ícones simples em cada etapa. Os passos são destacados em sequência: tipo de planilha, o que acompanhar, período, resultado final. Ao final, um botão "Gerar prompt" é enfatizado com brilho leve, indicando o próximo movimento do aluno.

**Divisão em 4 cenas progressivas:**
- **Cena 1:** Painel com 4 passos numerados (1, 2, 3, 4) com ícones
- **Cena 2:** Passos destacados em sequência: tipo, o que acompanhar
- **Cena 3:** Continuação: período, resultado final
- **Cena 4:** Botão "Gerar prompt" enfatizado com brilho leve

## Props padrão:
- title: "Simulador guiado!"
- subtitle: "Você escolhe o tipo de planilha e o pedido é montado"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30`

5. **Ícones sugeridos:** LayoutGrid (painel), ArrowRight (sequência), Sparkles (gerar), Play (iniciar)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 12: You Command

```
# CRIAR CARD EFFECT: You Command

Crie o componente `CardEffectYouCommand.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `you-command`
**Arquivo:** `CardEffectYouCommand.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Um teclado aparece em destaque, com as mãos digitando as informações dentro de colchetes. O prompt final se forma como uma frase completa, com os colchetes preenchidos. O prompt é enviado para o chat de I.A., e a tela se transita para uma planilha com estrutura pronta.

**Divisão em 4 cenas progressivas:**
- **Cena 1:** Teclado em destaque aparece
- **Cena 2:** Mãos digitando informações dentro de colchetes
- **Cena 3:** Prompt completo formado com colchetes preenchidos
- **Cena 4:** Prompt enviado ao chat, transição para planilha pronta

## Props padrão:
- title: "Agora é com você!"
- subtitle: "Seu primeiro comando para a planilha nascer"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30`

5. **Ícones sugeridos:** Keyboard (teclado), Type (digitação), Send (enviar), FileSpreadsheet (planilha)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 13: Habit Builder

```
# CRIAR CARD EFFECT: Habit Builder

Crie o componente `CardEffectHabitBuilder.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `habit-builder`
**Arquivo:** `CardEffectHabitBuilder.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Um calendário semanal aparece, com um horário marcado em destaque (por exemplo, segunda, 8h). Um lembrete suave aparece: "Atualizar planilha agora", com um check box sendo marcado. A planilha se atualiza rapidamente, sugerindo que poucos minutos por semana mantêm tudo em ordem.

**Divisão em 4 cenas progressivas:**
- **Cena 1:** Calendário semanal aparece
- **Cena 2:** Horário em destaque (segunda, 8h)
- **Cena 3:** Lembrete "Atualizar planilha agora", checkbox sendo marcado
- **Cena 4:** Planilha se atualiza rapidamente (poucos minutos mantêm ordem)

## Props padrão:
- title: "Transformando em hábito!"
- subtitle: "Um pequeno ritual para manter tudo em dia"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-lime-50 to-green-50 dark:from-lime-950/30 dark:to-green-950/30`

5. **Ícones sugeridos:** Calendar (calendário), Clock (horário), CheckSquare (checkbox), Repeat (hábito)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 14: Pattern Vision

```
# CRIAR CARD EFFECT: Pattern Vision

Crie o componente `CardEffectPatternVision.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `pattern-vision`
**Arquivo:** `CardEffectPatternVision.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Vários pontos de dados aparecem em um gráfico, primeiro de forma caótica. Linhas de tendência suaves surgem, mostrando uma curva de subida e outra de queda. Ícones de dinheiro, tempo e produtividade aparecem em cima dos trechos mais importantes do gráfico.

**Divisão em 4 cenas progressivas:**
- **Cena 1:** Pontos de dados aparecem de forma caótica no gráfico
- **Cena 2:** Linhas de tendência suaves começam a surgir
- **Cena 3:** Curvas de subida e queda ficam claras
- **Cena 4:** Ícones (dinheiro, tempo, produtividade) destacam trechos importantes

## Props padrão:
- title: "Enxergando padrões!"
- subtitle: "Meses, produtos e dias que contam a história"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/30 dark:to-indigo-950/30`

5. **Ícones sugeridos:** TrendingUp (tendência), LineChart (gráfico), DollarSign (dinheiro), Clock (tempo)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 15: Panel Decision

```
# CRIAR CARD EFFECT: Panel Decision

Crie o componente `CardEffectPanelDecision.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `panel-decision`
**Arquivo:** `CardEffectPanelDecision.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Um painel simples com poucos gráficos e números aparece em uma tela grande, em ambiente calmo. Uma pessoa observa o painel, com duas opções flutuando ao lado: "decidir no achismo" e "decidir com dados". A opção "decidir com dados" é selecionada, e o painel ganha um leve brilho, reforçando a confiança na decisão.

**Divisão em 4 cenas progressivas:**
- **Cena 1:** Painel simples com gráficos e números em tela grande, ambiente calmo
- **Cena 2:** Pessoa observa o painel
- **Cena 3:** Duas opções flutuam: "decidir no achismo" e "decidir com dados"
- **Cena 4:** "Decidir com dados" selecionada, painel ganha brilho (confiança)

## Props padrão:
- title: "Decidindo com seu próprio painel!"
- subtitle: "Menos achismo, mais clareza nos números"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950`

5. **Ícones sugeridos:** LayoutDashboard (painel), Eye (observar), CheckCircle (decisão), Sparkles (confiança)

Crie o componente COMPLETO agora!
```

---

## ✅ FIM DOS 15 PROMPTS

**Próximo passo:** Registrar os 15 componentes no `index.tsx`
