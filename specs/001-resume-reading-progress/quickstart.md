# Quickstart validation: Retomar progresso de leitura

## Preparação

1. Execute `yarn install --frozen-lockfile` se necessário.
2. Configure uma demo com `readingProgress: { id: 'demo-book', enabled: true }`.
3. Execute `npm run dev` e abra as demos indicadas por `docs/development.md`.

## Cenário slot

1. Abra `/demo/slot/slot-chapter1.html`, avance para perto de 50% e recarregue.
2. Confirme retorno com diferença máxima de uma página e ausência de erro no console.
3. Altere largura, tamanho da fonte e colunas, recarregue e confirme posição proporcional válida.

## Cenário sumário

1. Abra `/demo/summary/index.html`, avance e recarregue.
2. Confirme restauração no contexto atual sem aplicar o progresso em outro contexto.

## Controle e falhas

1. Desabilite `Retomar leitura` no menu, confirme retorno ao início após recarga e ausência de nova entrada.
2. Reabilite, navegue e confirme nova restauração.
3. Corrompa apenas a chave de progresso da demo e confirme abertura normal.
4. Remova `readingProgress` da configuração e confirme ausência do controle e de gravações.

## Bundle

Execute `npm run build`, revise `git diff --stat` e `git diff --check`, e repita o fluxo principal carregando `dist/index.es.js`, conforme `docs/development.md`.
