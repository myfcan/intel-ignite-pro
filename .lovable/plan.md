

# Adicionar Titulos de Secao + Link "Ver Todos" nas Trilhas

## O Que Falta Hoje

Os containers de trilha (V8 "Seu Caminho de Maestria" e V7 "Renda Extra PRO") tem headers internos, mas faltam:
1. Um titulo de secao **acima** do container gradiente (ex: "Trilhas")
2. Um link **"Ver todos"** no header de cada container que leva a uma pagina listando todas as jornadas daquela trilha

## Plano

### 1. Adicionar "Ver todos" no header de cada container

Dentro de cada section header (linhas 645-671 para V8, linhas 787-830 para V7), adicionar um link "Ver todos >" ao lado das setas de paginacao:

- **V8**: Link navega para `/v8-trail/{primeiraTrilaV8Id}` (mostra todas as aulas da trilha)
- **V7**: Link navega para `/trail/{primeiraTrilaV7Id}` (mostra todas as jornadas da trilha)

Se houver apenas 1 trilha em cada secao, o link vai direto para o detalhe dela. Se houver multiplas, criaremos uma pagina de listagem.

### 2. Nova Pagina de Listagem (se necessario)

Caso existam multiplas trilhas V8 ou V7, criar uma pagina simples `/trails?type=v8` e `/trails?type=v7` que lista todas as trilhas daquele tipo com seus cursos/aulas.

### 3. Design do Link "Ver todos"

Seguindo o estilo glassmorphism existente:
- Texto "Ver todos" com seta para direita
- Cor: `text-white/70 hover:text-white`
- Fundo semi-transparente pill: `bg-white/10 hover:bg-white/15 backdrop-blur`
- Posicionado no canto direito do header, ao lado das setas de paginacao (desktop) ou sozinho (mobile)

### Detalhes Tecnicos

**Arquivo principal**: `src/pages/Dashboard.tsx`

- Linhas 645-671 (V8 header): Adicionar link "Ver todos" com `onClick={() => navigate('/v8-trail/...')}`
- Linhas 787-830 (V7 header): Adicionar link "Ver todos" com `onClick(() => navigate('/trail/...'))`
- O link sera um `<button>` estilizado como pill compacta, visivel tanto no mobile quanto desktop

**Nova pagina (se multiplas trilhas)**: `src/pages/AllTrails.tsx`
- Rota: `/all-trails/:type` (v7 ou v8)
- Lista todas as trilhas do tipo selecionado com cards e progresso
- Reutiliza `V8TrailCard` e `CourseCard` existentes

**Arquivo de rotas**: `src/App.tsx`
- Adicionar rota `/all-trails/:type` se necessario

