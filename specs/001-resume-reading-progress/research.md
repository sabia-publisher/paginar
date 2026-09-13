# Research: Retomar progresso de leitura

## Representação da posição

- **Decision**: Salvar `(pagina atual - 1) / (total de paginas - 1)`, limitado a 0..1, e restaurar com arredondamento para a página mais próxima.
- **Rationale**: Mantém início e fim exatos e tolera mudanças de viewport, fonte, colunas e conteúdo.
- **Alternatives considered**: Índice absoluto quebra após repaginação; offset de texto exigiria mapear DOM e conteúdo em slot com maior complexidade.

## Identidade e isolamento

- **Decision**: Aceitar `readingProgress.id`; usar como fallback o título configurado/propriedade e a URL sem query/hash. Acrescentar o link do capítulo atual quando o sumário existir.
- **Rationale**: Uma chave explícita é estável; o fallback atende integrações simples sem misturar páginas distintas.
- **Alternatives considered**: Uma única chave global mistura obras; hash do conteúdo é custoso e muda com pequenas revisões.

## Compatibilidade e preferência

- **Decision**: `readerSettings.readingProgress` é opt-in. Objeto com `enabled` define padrão; `false` ou ausência não disponibiliza a função. A escolha do usuário persiste junto das preferências existentes.
- **Rationale**: Consumidores atuais não passam a armazenar comportamento novo; o menu só promete o que foi habilitado pelo integrador.
- **Alternatives considered**: Habilitação global por padrão altera privacidade e comportamento de integrações existentes.

## Ciclo de restauração

- **Decision**: Configurar o progresso antes da paginação, tentar restaurar após cada estimativa até obter total válido e depois registrar mudanças de página.
- **Rationale**: Conteúdo remoto e slot podem adquirir dimensões em momentos diferentes; uma restauração idempotente evita timeout fixo.
- **Alternatives considered**: Timeout único é frágil; restaurar antes da medição sempre resulta na primeira página.

## Armazenamento defensivo

- **Decision**: Encapsular parse, leitura, escrita e remoção em `try/catch`, validar formato e manter registros em uma chave versionada separada.
- **Rationale**: Quotas, políticas de privacidade e JSON inválido não podem quebrar o leitor.
- **Alternatives considered**: Misturar progresso em `readerSettings` acopla posições de várias obras ao contrato legado.
