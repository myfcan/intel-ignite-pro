

# Alteracoes no Dashboard - 6 Pontos

## 1. Adicionar icone profissional na secao V7 (Conquistar e Crescer)
Adicionar um icone (Rocket) ao lado do titulo da secao V7, igual ao Crown usado na V8.
- Arquivo: `src/pages/Dashboard.tsx`, linha 619

## 2. Inverter posicao das secoes
Mover o bloco V8 ("Seu Caminho de Maestria", linhas 754-896) para ANTES do bloco V7 ("Conquistar e Crescer", linhas 604-752).
- Arquivo: `src/pages/Dashboard.tsx`

## 3. Renomear secao V7 para "Renda Extra PRO"
Alterar o texto "Conquistar e Crescer" (linha 619) para "Renda Extra PRO".
- Arquivo: `src/pages/Dashboard.tsx`

## 4. Renomear trilha "Fundamentos de IA" no banco
Executar migracao SQL:
```sql
UPDATE trails SET title = 'Tudo que voce precisa saber' WHERE title = 'Fundamentos de IA';
```

## 5. Tom azul premium na secao "Renda Extra PRO"
Alterar o gradiente do container V7 (linhas 613-614) de violet/indigo para azul escuro premium:
```text
background: linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 40%, #3B82F6 100%)
boxShadow: 0 16px 48px -12px rgba(30, 58, 138, 0.4)
```
Isso diferencia visualmente a secao "Renda Extra PRO" (azul) da "Seu Caminho de Maestria" (indigo/violet).

## 6. Excluir grafico "Horas de Aprendizado"
Remover do `DashboardSidebar.tsx`:
- Import de `Clock, TrendingUp` (se nao usado em outro lugar), `BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip` do recharts
- Array `learningHoursData` (linhas 14-19)
- Componente `CustomTooltip` (linhas 21-37)
- Bloco JSX inteiro do grafico (linhas ~160-225 aprox.)

### Detalhes Tecnicos

**Arquivos modificados:**
1. `src/pages/Dashboard.tsx` - Inverter blocos, renomear titulo, adicionar icone Rocket, alterar gradiente azul
2. `src/components/dashboard/DashboardSidebar.tsx` - Remover grafico e imports/dados relacionados
3. Migracao SQL - Renomear trilha no banco de dados

