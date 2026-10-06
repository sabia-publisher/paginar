# Changelog

## 0.5.0 — 2026-10-05

- Virada de página por `transform` em vez de `margin-left`: deixa de refazer o
  layout do capítulo a cada página (no celular, de ~165 ms para ~33 ms por virada
  com CPU 4x mais lenta).
- Repaginação por `ResizeObserver` quando fontes, imagens ou conteúdo mudam de
  tamanho, no lugar do intervalo de 5 s (mantido como alternativa).
- `dist/` minificado: de 98 KB para 54 KB gzip, junto com a troca do slider.
- Slider de páginas com `<input type="range">` nativo, mantendo arrasto,
  tooltip "X de Y", clique no trilho e variáveis `--slider-*`. **As classes
  `.slider-*` foram substituídas por `.page-slider`.** Com o slider em foco, as
  setas viram uma página. O slider anterior fica em `VueformPageSlider.vue`.
- Nova variante `dist/index.vue-external.es.js` (26 KB gzip) para aplicações
  Vue 3.5+ que já carregam o runtime; `main`/`module` não mudaram.
- README com recomendações de carregamento (`preload`, `preconnect`, dimensões
  de imagens) e demo de texto longo em `demo/long/`.
- A partir da página 2, `.columnsArea` é bloco de contenção para conteúdo com
  `position: fixed`.

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
