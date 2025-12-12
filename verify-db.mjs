/**
 * 🔍 VERIFICAR AULA 06 NO BANCO
 */

console.log('\n🔍 VERIFICANDO AULA 06 NO BANCO DE DADOS\n');
console.log('='.repeat(60));

const AULA_06_ID = 'e8a82f35-2818-42ff-b71b-565fca199f59';
const AULA_06_TITLE = 'Conteúdo profundo: cursos, livros e infoprodutos com I.A.';

// Simular busca (sem acesso real ao banco, vamos verificar através dos arquivos JSON)
console.log('\n📌 ESTRATÉGIA DE VERIFICAÇÃO:');
console.log('   Como não temos acesso direto ao banco via script Node,');
console.log('   vamos verificar:');
console.log('   1. O arquivo JSON que criamos (aula-06-conteudo-profundo.json)');
console.log('   2. O que o AdminV5CardConfig.tsx mostra quando busca do banco');
console.log('   3. O comportamento real do GuidedLessonV5.tsx ao carregar');

console.log('\n' + '='.repeat(60));
console.log('\n✅ SOLUÇÃO: Usar o próprio painel AdminV5CardConfig');
console.log('\n   PASSO A PASSO:');
console.log('   1. Abrir /admin/v5/card-config');
console.log('   2. Ir na aba "Ativar Cards"');
console.log('   3. Selecionar a aula "Conteúdo profundo..."');
console.log('   4. Verificar quantos cards são detectados');
console.log('\n   Isso mostrará a VERDADE do banco de dados.');
console.log('\n' + '='.repeat(60) + '\n');
