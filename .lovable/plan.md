
Objetivo do ajuste aprovado: aumentar em 25% o certificado mobile (inclusive o “com cadeado/loader”) sem quebrar o layout premium.

1) Diagnóstico do problema atual
- Hoje o bloco esquerdo do card mobile está em `width: 156`, mas o documento interno (`CertificateDocument` em modo `compact`) usa tamanhos fixos (selo, tipografia, espaçamentos), então ele não cresce proporcionalmente.
- Resultado: mesmo com área maior, o certificado ainda parece pequeno/amador porque o conteúdo útil continua “mini”.

2) Ajuste principal (25% real no certificado mobile)
- Arquivo: `src/components/lessons/v8/V8CertificateCard.tsx`.
- Implementar escala explícita para o modo compacto:
  - Criar fator `compactScale = 1.25`.
  - Aplicar esse fator nos principais tokens do `CertificateDocument` quando `compact=true`:
    - selo e ícone do selo,
    - tamanhos de fonte (título/subtítulo/textos internos),
    - paddings/margens/chamfer do documento,
    - espessura de linhas/divisor no compacto.
- Isso garante que o próprio documento fique 25% maior visualmente (não só o container).

3) Ajuste do container mobile para acompanhar o crescimento
- No card mobile:
  - `width` da coluna esquerda: `156 -> 195` (+25%).
  - `maxHeight` do card: `210 -> ~262` (ou 260/264 arredondado, mantendo proporção de +25%).
- Ajustar padding da coluna esquerda para manter moldura premium sem “apertar” o documento.

4) Compatibilidade em telas menores (evitar quebra em 320px)
- Em vez de valor rígido puro, usar limite responsivo para não esmagar o texto do lado direito:
  - Exemplo de abordagem: `width: min(195px, 58vw)` para a coluna do mini-certificado.
- Mantém o aumento forte em mobile comum (375/390), sem quebrar em devices muito estreitos.

5) O que não será alterado
- Desktop do certificado permanece igual.
- Fluxo do modal, progresso e estados (locked/in_progress/completed) continuam os mesmos.
- Sem mudanças de backend.

6) Validação após implementação
- Verificar em mobile (390x844, 375x812, 320x568):
  - mini-certificado claramente maior (~25%),
  - estado bloqueado com cadeado ainda legível e premium,
  - sem corte/clipping no card,
  - primeira aula continua visível logo abaixo (ou com impacto mínimo aceitável).
- Verificar que no desktop não houve regressão visual.
