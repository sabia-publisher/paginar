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
