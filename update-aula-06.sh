#!/bin/bash

# Script para atualizar Aula 06 via SQL direto no Supabase
# Execute: bash update-aula-06.sh

echo "🚀 Atualizando Aula 06 com os 15 novos experienceCards..."
echo ""

# Você pode copiar e colar este SQL diretamente no Supabase Dashboard
echo "📋 OPÇÃO 1: Copie o SQL abaixo e cole no Supabase Dashboard (SQL Editor):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat << 'EOF'

UPDATE lessons
SET content = jsonb_set(
  content,
  '{experienceCards}',
  '[
    {"type": "deep-content-vs-rapido", "sectionIndex": 1, "anchorText": "conteúdo profundo", "props": {"title": "Por que conteúdo profundo importa?", "subtitle": "Da atenção rápida à confiança duradoura."}},
    {"type": "knowledge-structure", "sectionIndex": 1, "anchorText": "organizar seu conhecimento em algo maior", "props": {"title": "Do solto ao estruturado", "subtitle": "Quando o que você sabe vira um projeto único."}},
    {"type": "authority-builder", "sectionIndex": 1, "anchorText": "autoridade e confiança", "props": {"title": "Autoridade não nasce em um post", "subtitle": "Ela é construída em camadas."}},
    {"type": "core-decisions", "sectionIndex": 2, "anchorText": "tema, público e promessa", "props": {"title": "As 3 decisões que destravam tudo", "subtitle": "Tema, público e promessa."}},
    {"type": "module-map", "sectionIndex": 2, "anchorText": "mapa de módulos", "props": {"title": "Mapa de módulos", "subtitle": "Seu conhecimento em etapas claras."}},
    {"type": "objective-focus", "sectionIndex": 2, "anchorText": "objetivos de cada parte", "props": {"title": "Objetivo de cada etapa", "subtitle": "O que o aluno ganha em cada ponto."}},
    {"type": "product-shelf", "sectionIndex": 3, "anchorText": "curso em vídeo", "props": {"title": "Curso em vídeo", "subtitle": "Quando sua voz e presença guiam o aluno."}},
    {"type": "ebook-creator", "sectionIndex": 3, "anchorText": "eBook ou livro", "props": {"title": "eBook ou livro", "subtitle": "Quando o conhecimento ganha páginas."}},
    {"type": "lesson-series", "sectionIndex": 3, "anchorText": "sequência de aulas", "props": {"title": "Série de aulas", "subtitle": "Quando cada encontro empurra o aluno para o próximo nível."}},
    {"type": "text-ai-helper", "sectionIndex": 4, "anchorText": "I.A. de texto", "props": {"title": "I.A. de texto em ação", "subtitle": "Do briefing solto ao esqueleto pronto."}},
    {"type": "visual-ai-helper", "sectionIndex": 4, "anchorText": "I.A. de imagem e vídeo", "props": {"title": "Imagens e vídeos com I.A.", "subtitle": "Visuais que reforçam a mensagem."}},
    {"type": "you-are-the-author", "sectionIndex": 4, "anchorText": "você continua sendo o autor", "props": {"title": "Você é o diretor criativo", "subtitle": "A I.A. acelera, mas não decide por você."}},
    {"type": "ai-limitations", "sectionIndex": 5, "anchorText": "I.A. não substitui revisão humana", "props": {"title": "Limites da I.A.", "subtitle": "Ela acerta muita coisa, mas não tudo."}},
    {"type": "copy-paste-risk", "sectionIndex": 5, "anchorText": "copiar e colar sem adaptar", "props": {"title": "O perigo do copiar e colar", "subtitle": "Quando tudo fica com a mesma cara."}},
    {"type": "next-steps-deep-content", "sectionIndex": 5, "anchorText": "primeiro rascunho, não rascunho final", "props": {"title": "Próximos passos com segurança", "subtitle": "Use a I.A. como ponto de partida, não como ponto final."}}
  ]'::jsonb
)
WHERE id = 'e8a82f35-2818-42ff-b71b-565fca199f59';

EOF

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 PASSOS:"
echo "  1. Acesse: https://supabase.com/dashboard"
echo "  2. Entre no seu projeto"
echo "  3. Vá em SQL Editor (menu lateral)"
echo "  4. Cole o SQL acima"
echo "  5. Clique em 'Run'"
echo ""
echo "✅ Pronto! Os 15 cards serão atualizados no banco de dados."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 OPÇÃO 2: Use o script do console (UPDATE-AULA-06-CONSOLE.js)"
echo "   - Abra o app no navegador"
echo "   - Pressione F12 → Console"
echo "   - Cole o conteúdo de UPDATE-AULA-06-CONSOLE.js"
echo "   - Pressione Enter"
