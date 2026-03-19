

## Plano: Aviso na Etapa Imagens

### O que já está OK
O botão "Avançar Etapa" está no componente pai `AdminV10PipelineEditor.tsx` (linha 368) e **já está sempre habilitado** — só é desabilitado durante o processamento (`disabled={advancing}`). Não há condição baseada em `images_generated` ou `images_approved`. **Mudança 2 não é necessária.**

### O que precisa ser feito (1 mudança)

**Arquivo:** `src/components/admin/v10/stages/Stage3Images.tsx`

Adicionar banner de aviso vermelho no topo do `CardContent`, antes do aviso de "Vincule uma aula" (linha 370), com o texto exato solicitado sobre pular a etapa quando passos foram importados via JSON.

Inserção na linha 369, logo após `<CardContent className="space-y-6">`:

```tsx
{/* Banner: pular etapa se importou JSON */}
<div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
  <div className="text-red-500 text-xl flex-shrink-0">⚠️</div>
  <div>
    <p className="text-red-800 font-bold text-sm">
      Importou os passos via JSON na Etapa 2?
    </p>
    <p className="text-red-600 text-sm mt-1">
      Pule esta etapa. Seus frames já contêm os mockups completos.
      Clique em <strong>"Avançar Etapa"</strong> abaixo para ir direto à Narração.
    </p>
  </div>
</div>
```

### Resultado
Banner vermelho sempre visível no topo da Etapa 4 (Imagens). Botão "Avançar Etapa" já funciona sem bloqueio.

