# Changelog

## 0.4.0 — 2026-09-29

- Busca com painel lateral de trechos, navegação por ↑/↓, eventos públicos e
  integração de resultados de capítulos externos.
- Variáveis CSS e seletores documentados para as cores do painel; seleção
  indicada pelo fundo, sem faixa esquerda.
- API `refresh()` para atualizar notas/referências e recalcular a paginação
  depois de alterações de conteúdo, preservando a política de progresso.
- Setas horizontais e roda ignoram campos editáveis e regiões
  `data-paginar-ignore`, inclusive em slots e Shadow DOM.
- Navegação explícita por `origin=` ou fragmento tem prioridade sobre a
  restauração inicial do progresso.
- Sumário com `role="menu"`; itens sem destino ou desabilitados permanecem
  visíveis e são pulados na sequência de capítulos.
- Compatibilidade com hooks de atualização de hospedeiros Vue recentes,
  preservando o runtime embutido; build com ambiente de produção resolvido.

A navegação sequencial para vizinhos apenas com `file` mantém a limitação histórica; veja o
[contrato de integração](docs/events-and-state.md).
