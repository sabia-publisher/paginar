# Tasks: Retomar progresso de leitura

**Input**: Design documents from `/specs/001-resume-reading-progress/`

## Phase 1: Setup

- [X] T001 Confirmar estado do repositório e contrato atual em `src/App.ce.vue`, `src/composables/useReaderSettings.js` e `src/composables/usePagination.js`

## Phase 2: Foundational

- [X] T002 Criar armazenamento defensivo, identidade de contexto e cálculo percentual em `src/composables/useReadingProgress.js`

## Phase 3: User Story 1 - Retomar de onde parou (P1)

**Goal**: Restaurar e registrar posição proporcional por obra/contexto.

**Independent Test**: Avançar em uma demo habilitada, recarregar e retornar a no máximo uma página do percentual salvo.

- [X] T003 [US1] Integrar configuração, restauração e gravação ao ciclo do leitor em `src/App.ce.vue`
- [X] T004 [US1] Garantir que mudanças e limites de página usem a API de paginação em `src/composables/usePagination.js`

## Phase 4: User Story 2 - Controlar no menu (P2)

**Goal**: Permitir que a pessoa desabilite/reabilite o recurso e limpar a posição corrente ao desabilitar.

**Independent Test**: Alternar no menu, recarregar e observar que preferência e progresso respeitam a escolha.

- [X] T005 [US2] Persistir preferência e oferecer alternância segura em `src/composables/useReaderSettings.js` e `src/composables/useReadingProgress.js`
- [X] T006 [P] [US2] Criar controle visual acessível coerente com o menu em `src/components/HeaderSlot/OptionsButton/OptionsReadingProgress.vue`
- [X] T007 [US2] Inserir o controle condicional no menu em `src/components/HeaderSlot/OptionsButton/OptionsDropdown.vue`

## Phase 5: User Story 3 - Configurar pela integração (P3)

**Goal**: Expor contrato opt-in com identidade e padrão configuráveis.

**Independent Test**: Comparar configuração ausente, objeto habilitado e objeto inicialmente desabilitado nas demos.

- [X] T008 [US3] Aplicar configuração pública e fallback de identidade em `src/composables/useReadingProgress.js` e `src/App.ce.vue`
- [X] T009 [P] [US3] Habilitar cenários demonstráveis em `demo/slot/slot-chapter1.html` e `demo/summary/index.html`

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T010 [P] Documentar contrato e arquitetura em `README.md`, `docs/architecture.md` e `docs/development.md`
- [X] T011 Gerar e revisar artefatos com `npm run build`, `git diff --check` e `git diff --stat`
- [X] T012 Executar os cenários de `specs/001-resume-reading-progress/quickstart.md` nas demos em navegador headless e confirmar a geração do bundle em `dist/index.es.js`

## Dependencies & Execution Order

- T001 precede T002; T002 precede as histórias.
- US1 fornece o ciclo de persistência usado por US2 e US3; executar histórias na ordem P1, P2, P3.
- T006 pode ser criado em paralelo com T005; T009 e T010 podem ocorrer em paralelo após o contrato estabilizar.
- T011 depende de todas as edições; T012 depende do build concluído.

## Implementation Strategy

O MVP é T001-T004. Em seguida, adicionar controle do leitor, contrato/demos, documentação e validação final. Todas as tarefas usam o formato de checklist com ID, história quando aplicável e caminhos concretos.
