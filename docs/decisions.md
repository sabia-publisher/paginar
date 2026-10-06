# Decisões de manutenção

Registre aqui somente decisões duráveis que ajudem a evitar redescoberta. Use data, contexto, decisão e consequência; atualize ou substitua decisões quando deixarem de valer. Histórico de execução e dados privados não pertencem a este arquivo.

## 2026-09-13 — Fluxo leve como padrão

O projeto recebe demandas pequenas. `AGENTS.md` é a entrada comum e `docs/` guarda arquitetura, desenvolvimento e release. Spec Kit é opcional, sem exigir novos artefatos para toda tarefa. Mudanças devem atualizar somente a documentação afetada; não é necessário registrar cada correção aqui.

## 2026-09-13 — Preservar a distribuição existente

O projeto publica uma biblioteca ES no npm e mantém `dist/` no Git, com consumo por CDN do GitHub documentado no README. Preservamos esse formato, os caminhos de entrada e o lockfile Yarn Classic. Migrar bundler, gerenciador, nomes públicos ou deixar de versionar `dist/` exige avaliar os consumidores antes.

## 2026-09-13 — Limitar os arquivos do pacote npm

A inclusão de documentação e ferramentas para agentes não deve ampliar inadvertidamente o pacote publicado. O campo `files` passa a permitir `dist/`; npm acrescenta metadados obrigatórios, README e licença. Fontes presentes nos source maps continuam públicas. O dry-run de cada release deve verificar essa fronteira. Essa proteção não altera o conteúdo já publicado nem remove arquivos do histórico Git.
## 2026-09-13 — Eventos DOM e métodos na instância para integração

O paginador expõe snapshots por `getState()` e navegação imperativa na própria
instância de `<paginate-content>`. Mudanças relevantes são `CustomEvent` com o
prefixo `paginar:`, `bubbles: true` e `composed: true`. Assim consumidores de
qualquer framework usam APIs nativas do navegador sem acessar composables Vue,
o Shadow DOM ou o `localStorage`. Cada evento carrega um snapshot completo para
evitar consultas adicionais e dados reativos compartilhados.

## 2026-09-29 — Busca externa sob controle da aplicação

O leitor pesquisa apenas o DOM carregado. Para livros com capítulos externos,
`paginar:search` e `setSearchResults` integram um provedor sem acoplar a biblioteca
a rede, rotas ou formatos de livro. Um identificador por consulta impede que
respostas atrasadas substituam a busca atual. O painel combina trechos locais
e externos como texto simples; a seleção externa emite `paginar:search-select`,
e a aplicação decide como carregar o destino. O painel sobrepõe o leitor para
preservar paginação e offsets, mantendo o dropdown como apresentação padrão.

## 2026-09-29 — Port de compatibilidade dos patches do consumidor

Os ajustes de atualização de conteúdo, atalhos, prioridade de retomada,
compatibilidade do custom element e itens indisponíveis no sumário preservam
o comportamento da referência `0.3.7-2`. `refresh()` reutiliza a ordem existente
de repaginação, sem prometer Promise ou preservação universal do número da
página. O build resolve o ambiente de produção sem atualizar o Vue embutido.
Os hooks de compatibilidade só são instalados se o runtime não os fornecer.

Não foi incorporado `ResizeObserver`: o hospedeiro continua chamando
`refresh()` conforme as mudanças de layout. (Substituído em 2026-10-05: a
repaginação passou a observar tamanhos; `refresh()` segue necessário para notas
e referências.) A navegação por arquivo sem link
na sequência e a coerção histórica dos campos permanecem caracterizadas nos
testes; corrigi-las requer avaliar uma mudança de contrato separada.

## 2026-10-05 — Desempenho de carregamento e navegação

Medições no Chromium com CPU 4x mais lenta e rede de 4 Mbps mostraram que cada
página virada refazia o layout do capítulo inteiro (`margin-left` em
`.columnsArea`), que fontes ou imagens tardias só corrigiam o total de páginas
no intervalo de 5 s e que o bundle era distribuído sem minificação. Passamos a
deslocar as páginas com `transform`, a repaginar por `ResizeObserver` (com o
intervalo como alternativa) e a minificar `dist/`, inclusive os espaços que o
Vite 3 mantém em bibliotecas ES. Uma variante com `vue` externo é gerada para
aplicações Vue, sem alterar `main`/`module`.

Consequências: o contrato JavaScript, eventos, atributos e o resultado visual
foram comparados com o bundle anterior e permanecem equivalentes. A partir da
página 2, `.columnsArea` passa a ser bloco de contenção para `position: fixed`
e contexto de empilhamento; conteúdo que dependa disso precisa ser revisto.
Remover a medição imediata na montagem não trouxe ganho mensurável e foi
mantida.

O slider de páginas passou a ser um `<input type="range">` (`PageSlider.vue`),
retirando `@vueform/slider` do bundle (de 68 para 54 KB gzip). Ele reproduz o
arrasto contínuo arredondado para a página, o tooltip "X de Y" durante o
arrasto, o clique no trilho, a origem `slider` dos eventos e as variáveis
`--slider-*`. As classes `.slider-*` deixam de existir; a nova raiz é
`.page-slider`. Com o slider em foco, as setas viram uma página (antes o
noUiSlider e o atalho global agiam juntos, pulando cerca de 10% do capítulo).
A versão anterior fica em `VueformPageSlider.vue` e `vueform-slider.css`, e
`@vueform/slider` continua em `dependencies`: para reverter, importe esse
componente em `FooterSlot.vue` e troque o `<style src>` em `App.ce.vue`.
