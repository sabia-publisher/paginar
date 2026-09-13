# Implementation Plan: Retomar progresso de leitura

**Branch**: `001-resume-reading-progress` | **Date**: 2026-09-13 | **Spec**: [spec.md](spec.md)

## Summary

Adicionar retomada opt-in ao Web Component, configurada dentro de `reader-settings`, com progresso percentual persistido por obra/capitulo. Um composable dedicado coordena identidade, leitura/gravação segura e restauração após a paginação; o menu de opções expõe um controle visual somente quando o integrador disponibiliza a função.

## Technical Context

**Language/Version**: JavaScript, Vue 3 Composition API

**Primary Dependencies**: Vue 3.2, VueUse 9.2, Vite 3, Tailwind CSS 3

**Storage**: `localStorage` do navegador, com chaves versionadas e tratamento de indisponibilidade

**Testing**: Não há suíte automatizada versionada; build, revisão estática e cenários manuais nas demos

**Target Platform**: Navegadores modernos com Custom Elements e Shadow DOM

**Project Type**: Biblioteca pública distribuída como Web Component

**Performance Goals**: Gravações pequenas somente após mudança efetiva de página; restauração após a primeira paginação válida

**Constraints**: Compatibilidade do contrato atual, sem nova dependência, sem backend, degradação segura quando o armazenamento falhar

**Scale/Scope**: Um controle no menu, um composable, integração com paginação/configurações, demos e documentação pública

## Constitution Check

O arquivo de constituição ainda contém apenas o template inicial. Aplicam-se as regras de `AGENTS.md`: mudança mínima em `src/`, preservação do contrato, build dos artefatos rastreados, validação manual de runtime e atualização da documentação. O desenho passa esses gates e não exige exceções.

## Project Structure

### Documentation (this feature)

```text
specs/001-resume-reading-progress/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- reader-settings.md
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- App.ce.vue
|-- composables/
|   |-- usePagination.js
|   |-- useReaderSettings.js
|   `-- useReadingProgress.js
`-- components/HeaderSlot/OptionsButton/
    |-- OptionsDropdown.vue
    `-- OptionsReadingProgress.vue

demo/
|-- slot/
`-- summary/

docs/
|-- architecture.md
`-- development.md
```

**Structure Decision**: Manter o projeto único existente. Persistência e regras ficam em um composable; a raiz fornece configuração/contexto e o menu recebe um componente visual pequeno e isolado.

## Constitution Check (Post-Design)

O contrato usa um campo opcional em configuração existente, a persistência é defensiva, e nenhuma ferramenta ou dependência nova é necessária. A documentação do contrato e os cenários de validação cobrem as consequências duráveis. Gates aprovados.
