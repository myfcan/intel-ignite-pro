

# Plano: Adicionar botao "Assistir" no LessonRow

## O que muda

Adicionar um botao com icone de Play no componente `LessonRow` dentro de `src/pages/AdminManageLessons.tsx`. O botao navega para a rota de preview da aula.

---

## Detalhe Tecnico

**Arquivo:** `src/pages/AdminManageLessons.tsx`

No bloco de botoes do `LessonRow` (linha ~322-335), adicionar um botao "Assistir" antes do botao de debug:

```typescript
<Button
  variant="outline"
  size="sm"
  onClick={() => navigate(`/admin/v7/preview/${lesson.id}`)}
>
  <Play className="w-3 h-3 mr-1" />
  Assistir
</Button>
```

Tambem sera necessario adicionar `Play` ao import de `lucide-react` no topo do arquivo.

---

## Impacto

- Apenas 1 arquivo modificado
- Zero breaking changes
- Funciona para todas as aulas (orfas, em trilha, qualquer modelo)

