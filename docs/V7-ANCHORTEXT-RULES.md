# V7 AnchorText - Regras Críticas para JSON

## ✅ CORREÇÕES APLICADAS (Dezembro 2024)

### 1. SEM FALLBACKS
O sistema V7 **NUNCA** usa scripts locais de fallback. Sempre usa o banco de dados.
- Se o script não carregar, mostra erro
- Nenhum `fimDaBrincadeiraScript.ts` ou similar é usado

### 2. Quiz NÃO pausa automaticamente
O `V7PhaseQuiz` **NÃO** pausa o áudio ao ser montado.
- A pausa é controlada EXTERNAMENTE via prop `isPausedByAnchor`
- O quiz é renderizado quando a fase "interaction" começa (por tempo)
- O áudio só pausa quando a keyword do `anchorAction` é detectada

### 3. Timing de multi-word keywords
Para keywords com múltiplas palavras (ex: "atual de IA"):
- O sistema encontra a sequência de palavras nos `word_timestamps`
- Retorna o timestamp da **ÚLTIMA** palavra da frase
- O trigger só acontece **APÓS** a última palavra terminar (usa `end` time)
- Janela de 300ms após o `end` da palavra

---

## 📋 ESTRUTURA JSON PARA anchorActions

### Formato correto no banco de dados:

```json
{
  "cinematic_flow": {
    "acts": [
      {
        "id": "act-3-interaction",
        "type": "interaction",
        "anchorActions": [
          {
            "id": "pause-quiz",
            "keyword": "atual de IA",
            "type": "pause",
            "once": true
          }
        ],
        "content": {
          "interaction": {
            "type": "quiz",
            "question": "Como você usa IA no seu dia a dia?",
            "options": [...]
          }
        }
      }
    ]
  }
}
```

### Campos obrigatórios do anchorAction:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string | Identificador único (ex: "pause-quiz") |
| `keyword` | string | Palavra(s) que disparam a ação (ex: "atual de IA") |
| `type` | string | "pause", "resume", "show", "hide", "highlight", "trigger" |
| `once` | boolean | Se true, executa apenas uma vez (default: true) |

### Campos opcionais:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `targetId` | string | ID do elemento alvo (para show/hide/highlight) |
| `payload` | any | Dados extras para a ação |
| `delayMs` | number | Delay em milissegundos antes de executar |

---

## 🎯 COMO ESCOLHER A KEYWORD

### Regras:
1. **Use palavras ÚNICAS** no contexto da narração
2. **Evite palavras comuns** como "honesto", "você", "isso"
3. **Use a última palavra da frase de introdução** antes do quiz
4. **Multi-word é mais preciso** que single-word

### Exemplos:
| ❌ Errado | ✅ Correto | Motivo |
|-----------|------------|--------|
| "honesto" | "atual de IA" | "honesto" aparece no meio da frase |
| "você" | "seu uso atual" | "você" é muito comum |
| "IA" | "atual de IA" | "IA" sozinho pode ter falsos positivos |

---

## 📊 FLUXO DE EXECUÇÃO

```
1. Áudio toca normalmente
2. Tempo entra na fase "interaction" → Quiz é renderizado (mas áudio continua!)
3. useAnchorText monitora currentTime vs word_timestamps
4. Quando "atual de IA" termina de ser falada (end: 33.831s)
5. isPausedByAnchor = true
6. Quiz recebe prop e pausa o áudio
7. Usuário responde o quiz
8. onComplete → áudio retoma
```

---

## ⚠️ WORD_TIMESTAMPS OBRIGATÓRIOS

O sistema AnchorText **DEPENDE** de `word_timestamps` no banco de dados.
Sem eles, o sistema NÃO funciona.

Formato esperado:
```json
[
  {"word": "atual", "start": 32.589, "end": 33.007},
  {"word": "de", "start": 33.088, "end": 33.204},
  {"word": "IA.", "start": 33.297, "end": 33.831}
]
```

---

## 🔧 DEBUGGING

Logs importantes no console:
- `[AnchorText] ✅ Found multi-word keyword "X" at Ys` - Keyword encontrada
- `[AnchorText] 🎯🎯🎯 MATCH!` - Trigger executado
- `[V7PhaseQuiz] 🔇 Narração PAUSADA por anchorAction!` - Quiz pausou áudio

Se não aparecer esses logs, verifique:
1. `word_timestamps` existe e está populado
2. `anchorActions` está no formato correto
3. A keyword existe exatamente nos timestamps
