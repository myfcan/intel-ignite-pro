
Objetivo desta auditoria: validar com evidência real por que o problema persiste (layout e áudio) no V8 da aula `92da570a-32c0-4df0-ac24-be6de43e3e0f`, sem suposições.

1) Provas reais coletadas (código + execução)
- Código do player (arquivo real `src/components/lessons/v8/V8ContentSection.tsx`):
```tsx
<div className="flex justify-center mt-[7px] mb-[7px]">
  <div className="bg-white rounded-2xl">
    <img
      src={section.imageUrl}
      alt={cleanTitle}
      className="max-w-[85%] h-auto object-contain mx-auto"
      loading="lazy"
    />
  </div>
</div>
```
- Ou seja: o ajuste de `7px` foi aplicado no código (fato).

- Dados reais carregados no preview (network real do usuário, `2026-03-01T12:43:02Z`):
  - `section-0.imageUrl = .../v8-images/draft-1772368558827/section-0.png`
  - `section-0.audioUrl = .../section-0.mp3?t=1772368619856` (cache-buster presente)
- Isso confirma que a aula usa URLs novas com `?t=` no áudio.

- Metadados reais no storage (query real):
  - `v8-images/draft-1772368558827/section-0.png` size `678535`
  - `...section-1.png` size `708913`
  - `...section-2.png` size `799067`
  - `...section-3.png` size `728895`
- E o PNG carregado mostra header binário com `IHDR` e dimensão 1024x1024 (canvas grande).

2) Diagnóstico do problema 1 (layout)
Constatação técnica:
- O `gap` externo entre título-imagem-texto foi corrigido para 7px no componente.
- Porém o `<img>` ainda renderiza com `max-w-[85%] h-auto`, sem limite de altura e sem corte de bordas transparentes do PNG.
- Resultado prático: mesmo com `7px` corretos entre elementos, a área visual da arte fica “longe” do texto quando o PNG vem com muito espaço interno (transparente/canvas grande).

Prova visual:
- Screenshot real da execução em `/v8/...` após selecionar “Ouvir” mostra o objeto central distante do texto, apesar do margin externo já aplicado.

3) Diagnóstico do problema 2 (áudio duplicado)
Causa encontrada com prova real: autoplay concorrente de múltiplos blocos.

- Código real `src/components/lessons/v8/V8LessonPlayer.tsx`:
```tsx
{state.phase === "content" && (
  <div className="flex flex-col gap-10 pb-32">
    {timeline.map((item, idx) => { ...render ALL items... })}
```
- Todos os itens do timeline são montados ao mesmo tempo.

- Código real `src/components/lessons/v8/V8ContentSection.tsx`:
```tsx
<V8AudioPlayer
  audioUrl={section.audioUrl}
  autoPlay={mode === "listen"}
/>
```
- Em modo “listen”, todas as seções recebem `autoPlay=true`.

- Código real `src/components/lessons/v8/V8QuizInline.tsx`:
```tsx
{quiz.audioUrl && state === "answering" && (
  <V8AudioPlayer audioUrl={quiz.audioUrl} autoPlay />
)}
```
- Quizzes também auto-iniciam áudio ao montar.

- Log real de rede (browser, timestamp único `2026-03-01T19:34:49Z`):
  - `section-0.mp3` (ID 591.202)
  - `quiz-0.mp3` (ID 591.203)
  - `section-1.mp3` (ID 591.204)
  - `section-2.mp3` (ID 591.205)
  - `quiz-1.mp3` (ID 591.206)
  - `section-3.mp3` (ID 591.207)
- Seis requests de mídia simultâneos no mesmo segundo = reprodução concorrente (origem da percepção de áudio duplicado/sobreposto).

4) Itens solicitados que NÃO consegui localizar
- Logs históricos da função backend `v8-generate` para esse `lesson_id` no coletor de logs: retorno vazio no momento da consulta.
- Registro determinístico de “dimensão útil do objeto sem transparência” (bounding box alpha) no pipeline atual: NÃO LOCALIZADO NO CÓDIGO.

5) Plano de correção (execução após sua aprovação)
A. Correção sistêmica do áudio (prioridade máxima)
- Introduzir controle de “activeTimelineIndex” no player.
- Só permitir `autoPlay` para o item ativo.
- Seções/quizzes/playgrounds fora do item ativo ficam com autoplay desativado.
- Avanço do índice por `onEnded` (modo listen), mantendo comportamento determinístico.
Arquivos:
- `src/components/lessons/v8/V8LessonPlayer.tsx`
- `src/components/lessons/v8/V8ContentSection.tsx`
- `src/components/lessons/v8/V8QuizInline.tsx`
- `src/components/lessons/v8/V8PlaygroundInline.tsx` (se houver áudio narrado automático)

B. Correção sistêmica do layout de imagem
- Frontend: limitar altura visual do bloco de imagem (para impedir “coluna gigante”).
- Pipeline de imagem: adicionar etapa de trim/crop por alpha (remoção de bordas transparentes) antes do upload.
Arquivos:
- `src/components/lessons/v8/V8ContentSection.tsx`
- `supabase/functions/v8-generate-section-image/index.ts`

C. Critérios de aceite com prova real
- Ao entrar em “Ouvir”, rede deve mostrar 1 request de mídia inicial (não 6 simultâneos).
- Ao terminar áudio da seção ativa, próximo item inicia; sem sobreposição.
- Distância visual título→imagem e imagem→texto deve ficar compacta mesmo com PNG 1024.
- Evidência entregue: trechos de código final + logs de rede com timestamps + JSON final da aula com URLs atualizadas.
