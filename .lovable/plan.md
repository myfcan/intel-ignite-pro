

# Correcao Definitiva: Trim Hibrido (Alpha + Cor de Fundo)

## Problema Real (Forense)

O algoritmo atual em `V8TrimmedImage` (linha 76 de `V8ContentSection.tsx`):

```tsx
const alpha = data[(y * width + x) * 4 + 3];
if (alpha > 10) { // <-- ESTE E O BUG
```

As imagens geradas pelo pipeline tem fundo branco opaco (`#FFFFFF`, alpha=255). Todos os pixels passam no teste `alpha > 10`, portanto o crop retorna a imagem inteira sem nenhum recorte. O `mt-[7px]` esta correto no CSS, mas o "espaco" visivel vem do fundo branco dentro do bitmap.

## Correcao

### Arquivo unico: `src/components/lessons/v8/V8ContentSection.tsx`

Substituir o algoritmo de deteccao de bounding box (linhas 68-84) por um algoritmo hibrido:

1. **Amostrar cor de fundo**: Ler os 4 cantos da imagem e calcular a cor media (R, G, B).
2. **Teste hibrido por pixel**: Um pixel e "conteudo" se:
   - `alpha < 10` (transparente) -> NAO e conteudo
   - Distancia de cor ao fundo `< 30` -> NAO e conteudo (e fundo)
   - Caso contrario -> E conteudo (entra no bbox)
3. **Manter padding de seguranca** (4px em vez de 2px para evitar corte agressivo)
4. **Adicionar `block` na tag img** para eliminar gap de baseline

```text
Antes (alpha-only):
+----------------------------------+
|  branco  branco  branco  branco  |  <- alpha=255, passa no teste
|  branco  [ILUSTRACAO]   branco   |  <- alpha=255, passa no teste  
|  branco  branco  branco  branco  |  <- alpha=255, passa no teste
+----------------------------------+
Resultado: bbox = imagem inteira, sem crop

Depois (hibrido):
+----------------------------------+
|  fundo   fundo   fundo   fundo   |  <- cor ~= fundo, IGNORADO
|  fundo   [ILUSTRACAO]   fundo    |  <- cor != fundo, CONTEUDO
|  fundo   fundo   fundo   fundo   |  <- cor ~= fundo, IGNORADO
+----------------------------------+
Resultado: bbox = so a ilustracao, crop real
```

### Codigo exato da correcao

Substituir linhas 68-101 por:

```tsx
// Amostrar cor de fundo dos 4 cantos
const sampleBg = (px: number, py: number) => {
  const i = (py * width + px) * 4;
  return [data[i], data[i + 1], data[i + 2]];
};
const corners = [
  sampleBg(0, 0),
  sampleBg(width - 1, 0),
  sampleBg(0, height - 1),
  sampleBg(width - 1, height - 1),
];
const bgR = Math.round(corners.reduce((s, c) => s + c[0], 0) / 4);
const bgG = Math.round(corners.reduce((s, c) => s + c[1], 0) / 4);
const bgB = Math.round(corners.reduce((s, c) => s + c[2], 0) / 4);

let minX = width, minY = height, maxX = -1, maxY = -1;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 10) continue; // transparente
    const dist = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
    if (dist < 30) continue; // cor igual ao fundo
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
}

if (maxX < 0 || maxY < 0) {
  if (!cancelled) setResolvedSrc(src);
  return;
}

const padding = 4;
const cropX = Math.max(0, minX - padding);
const cropY = Math.max(0, minY - padding);
const cropWidth = Math.min(width - cropX, maxX - minX + 1 + padding * 2);
const cropHeight = Math.min(height - cropY, maxY - minY + 1 + padding * 2);
```

E na linha 142, adicionar `block`:

```tsx
return <img src={resolvedSrc} alt={alt} className={`block ${className ?? ''}`} loading="lazy" />;
```

### Invalidar cache existente

Limpar o cache ao mudar o algoritmo (adicionar na linha 29):

```tsx
const trimmedImageCache = new Map<string, string>();
// Cache version — increment to invalidate when algorithm changes
const TRIM_VERSION = 2;
```

E no `useEffect`, usar chave versionada:

```tsx
const cacheKey = `${TRIM_VERSION}:${src}`;
```

## O que NAO muda

- Estrutura do rolo (scroll continuo) intacta
- Ordem: Titulo -> Markdown -> Imagem -> Audio
- Espacamento CSS: todos os `mt-[7px]` e `gap-[7px]` permanecem
- Logica de timeline, quiz, playground, auto-scroll
- Nenhum outro arquivo e alterado

## Resultado esperado

O trim ira recortar o fundo branco opaco, e o `mt-[7px]` finalmente produzira 7px visuais reais entre o ultimo paragrafo do markdown e o topo visual da ilustracao.

