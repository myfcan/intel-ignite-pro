

## Pesquisa Consolidada: Feature 1 (CTA Dinâmico) e Feature 2 (Tour Guiado)

### Dados Reais da Pesquisa

#### Sobre Onboarding e Primeiros Acessos (Feature 1 - CTA Dinâmico)

**O que os dados dizem:**

- **Duolingo** (referência #1 em EdTech) usa a abordagem **"value-first"**: em vez de explicar como o app funciona, joga o usuário direto na primeira lição. Resultado: **churn na primeira semana caiu 47%**, 30% mais usuários completaram a primeira semana, satisfação subiu 15%. (Fonte: Snoopr/Business of Apps)
- **Nielsen Norman Group** descobriu que **tutorials NÃO melhoram a performance das tarefas** -- usuários que leram tutoriais tiveram o mesmo desempenho que quem pulou. Isso reforça: **ação > explicação**.
- **80% dos usuários que não completam onboarding desaparecem no Dia 1** (Userpilot)
- O padrão que funciona: **empurrar o usuário para a primeira ação de valor o mais rápido possível**

**Validação da Feature 1:** O botão CTA dinâmico pulsante ("Comece sua primeira trilha" / "Continue: [lição]") está **100% alinhado** com o padrão Duolingo value-first. Em vez de ensinar o que são trilhas, nós levamos o usuário direto para a ação. O limite de 5 acessos também faz sentido -- é o suficiente para criar o hábito sem ser permanentemente intrusivo.

**Ajuste recomendado pela pesquisa:** Em vez de "esconder" os 3 botões (Ranking/Conquistas/Estudar) durante os 5 primeiros acessos, devemos **manter os 3 botões mas adicionar o CTA pulsante acima deles** como elemento dominante. Remover funcionalidades gera confusão se o usuário ouve falar de "ranking" por outro canal.

---

#### Sobre Tours Guiados / Coach Marks (Feature 2 - Tooltip Tour)

**O que os dados dizem:**

- **70% dos usuários pulam onboarding linear/tradicional** (Chameleon 2025 Benchmark, 550M+ ações analisadas)
- **Taxa de conclusão global de onboarding após 30 dias: apenas 8.4%** (Business of Apps Q2 2025)
- **Cada step adicional perde ~20% dos usuários restantes** (Gabor Cselle, ex-Google/Twitter PM)
- **Tours auto-triggered (forçados) performam 2-3x pior** que tours acionados pelo usuário (Chameleon 2025)
- **Onboarding pulável tem 25% mais conclusão** que obrigatório (Petavue)
- **Vevo** removeu tutorials forçados com 160k+ participantes: logins +9.69%, sign-ups +5.85%, engajamento INALTERADO
- **Coachmarks e tooltips contextuais** funcionam quando: são curtos, acionáveis, e baseados em comportamento (não em tempo)
- **Regra de ouro**: máximo 3-4 steps, sempre com opção "Pular"

**Validação da Feature 2:** O tour de 4 steps está no limite seguro. MAS com ajustes críticos baseados nos dados:

1. **NÃO deve ser forçado/automático** -- deve ser opcional ("Quer um tour rápido?" com botão Sim/Não)
2. **NÃO no 2o acesso** -- deve ser no **1o acesso**, logo após o CTA dinâmico aparecer. Se esperarmos o 2o acesso, 80% já terão desistido.
3. **Máximo 3 steps** (não 4) para manter taxa de conclusão aceitável (cada step = -20%)
4. **Deve ser pulável** a qualquer momento

---

### Plano Revisado com Base na Pesquisa

#### Feature 1: CTA Dinâmico (Validado, com ajuste menor)

- **DB:** Adicionar `dashboard_access_count` (INT DEFAULT 0) na tabela `users`
- **Lógica:** Nos primeiros 5 acessos, exibir botão CTA pulsante **acima** dos 3 botões existentes (não substituindo)
- **Estados:** "Comece sua primeira trilha" (sem progresso) ou "Continue: [nome da lição]" (com progresso)
- **Design:** Full-width, gradiente dourado, animação glow/pulse, ícone Rocket
- **Arquivos:** Migration SQL, `Dashboard.tsx` (incrementar counter), `MobileQuickStats.tsx` (renderizar CTA)

#### Feature 2: Tour Guiado (Validado, com ajustes da pesquisa)

- **Trigger:** 1o acesso (não 2o), após 2s de delay. **Modal leve** perguntando "Quer conhecer o app?" (Sim/Pular)
- **Steps:** Reduzido para **3 steps** (Trilhas, Ferramentas, Missões) -- menos = mais conclusão
- **Sempre pulável** com botão "Pular" visível
- **Persistido** via localStorage para não repetir
- **Arquivos:** Criar `DashboardTour.tsx`, integrar em `Dashboard.tsx`

#### Feature 3: Reorganização + Rename (já validada)

- Trocar "Continue aprendendo" acima de "Missões Diárias"
- Renomear para "Continue sua lição"

### Fontes Utilizadas

- Chameleon Benchmark Report 2025 (550M+ user actions)
- Business of Apps Q2 2025 (onboarding completion rates)
- Snoopr Research 2025 (Duolingo, Vevo case studies)
- DGM News (Coachmarks & Tooltips feature discovery)
- Nielsen Norman Group (tutorial effectiveness research)
- Gabor Cselle (ex-Google/Twitter PM, step drop-off formula)

