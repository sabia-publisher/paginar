# Feature Specification: Retomar progresso de leitura

**Feature Branch**: `001-resume-reading-progress`

**Created**: 2026-09-13

**Status**: Ready

**Input**: User description: "Quando o usuario abre uma pagina que ja tinha visitado, continua de onde parou, com progresso calculado por percentual, persistido localmente, configuravel na integracao e desativavel pelo usuario no menu."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Retomar de onde parou (Priority: P1)

Como pessoa leitora, ao voltar a uma obra que ja comecei, quero ser levada automaticamente para a regiao aproximada em que parei para continuar sem procurar manualmente.

**Why this priority**: Este e o valor principal da funcionalidade e reduz a friccao em leituras longas.

**Independent Test**: Abrir uma obra, avancar alem do inicio, fechar ou recarregar a pagina e confirmar que a leitura retorna a uma pagina correspondente ao percentual salvo.

**Acceptance Scenarios**:

1. **Given** uma obra com retomada habilitada e progresso anterior, **When** a pessoa abre novamente essa obra, **Then** o leitor posiciona a leitura no ponto proporcional salvo.
2. **Given** uma obra sem progresso anterior, **When** a pessoa a abre, **Then** o leitor inicia normalmente no comeco.
3. **Given** uma obra cujo layout ou quantidade de paginas mudou, **When** ela e reaberta, **Then** o leitor converte o percentual salvo para uma pagina valida no layout atual.

---

### User Story 2 - Controlar a retomada no menu (Priority: P2)

Como pessoa leitora, quero desabilitar ou reabilitar a retomada no menu de opcoes para controlar se meu progresso fica registrado neste navegador.

**Why this priority**: O controle explicito atende privacidade e preferencia individual sem depender da integracao hospedeira.

**Independent Test**: Alternar a opcao no menu, navegar, recarregar a obra e confirmar que o comportamento e a persistencia respeitam a escolha.

**Acceptance Scenarios**:

1. **Given** a retomada habilitada, **When** a pessoa a desabilita no menu, **Then** o progresso registrado para a obra atual e removido e novas paginas nao sao registradas.
2. **Given** a retomada desabilitada pela pessoa, **When** ela recarrega o leitor, **Then** a preferencia continua desabilitada e a leitura nao e reposicionada.
3. **Given** a retomada desabilitada, **When** a pessoa a reabilita, **Then** o leitor volta a registrar o progresso a partir da posicao corrente.

---

### User Story 3 - Configurar pela integracao (Priority: P3)

Como responsavel por integrar o componente, quero definir se a retomada fica disponivel e qual e seu estado inicial, preservando compatibilidade com integracoes existentes.

**Why this priority**: A biblioteca precisa permitir adequacao ao contexto do site hospedeiro sem mudar o comportamento atual por surpresa.

**Independent Test**: Inicializar o leitor com a configuracao habilitada, desabilitada e indisponivel, verificando o comportamento e a presenca do controle no menu.

**Acceptance Scenarios**:

1. **Given** uma integracao que habilita a funcionalidade, **When** o leitor e aberto, **Then** a retomada e aplicada e seu controle aparece no menu.
2. **Given** uma integracao que desabilita a funcionalidade por padrao, **When** o leitor e aberto pela primeira vez, **Then** nenhum progresso e restaurado ou salvo ate a pessoa habilita-la.
3. **Given** uma integracao que nao oferece a funcionalidade, **When** o menu e aberto, **Then** o controle de retomada nao aparece e nenhum progresso e armazenado.

### Edge Cases

- Dados de progresso ausentes, invalidos, desatualizados ou inacessiveis nao impedem a abertura e a navegacao da obra.
- Percentuais fora do intervalo valido sao limitados a uma pagina existente.
- A posicao e identificada por obra e, em conteudo dividido, pelo capitulo atual, sem restaurar o progresso de uma obra em outra.
- Se o conteudo ainda nao tiver dimensoes suficientes para calcular paginas, a restauracao aguarda a primeira paginacao valida.
- A pagina final e registrada sem produzir indice fora dos limites ao restaurar.
- Navegacao privada ou armazenamento indisponivel degrada para uma leitura normal durante a sessao.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A integracao MUST poder disponibilizar a retomada de leitura e definir seu estado inicial por meio da configuracao publica existente.
- **FR-002**: Integracoes que nao configuram a funcionalidade MUST manter o comportamento anterior, sem restaurar ou registrar progresso e sem exibir o novo controle.
- **FR-003**: Quando disponivel, o menu de opcoes MUST exibir um controle visual coerente com os demais controles para habilitar ou desabilitar a retomada.
- **FR-004**: A escolha da pessoa leitora MUST persistir no navegador e prevalecer sobre o estado inicial configurado em visitas posteriores.
- **FR-005**: O leitor MUST registrar o progresso como percentual normalizado da leitura, associado a uma identidade estavel da obra e ao contexto do capitulo quando houver.
- **FR-006**: O leitor MUST atualizar o progresso apos mudancas efetivas de pagina, sem bloquear a navegacao.
- **FR-007**: Ao abrir novamente um contexto conhecido, o leitor MUST converter o percentual salvo para uma pagina valida depois que a paginacao estiver disponivel.
- **FR-008**: Ao desabilitar a retomada no menu, o leitor MUST remover o progresso registrado para a obra atual e interromper novas gravacoes enquanto a opcao permanecer desabilitada.
- **FR-009**: Falhas ou dados invalidos no armazenamento MUST ser ignorados sem impedir leitura, configuracao ou navegacao.
- **FR-010**: A funcionalidade MUST operar tanto com conteudo fornecido em slot quanto com obras divididas em arquivos pelo sumario.
- **FR-011**: O novo contrato de configuracao e seu comportamento MUST ser documentados com exemplo de uso e limites de identificacao.

### Key Entities

- **Preferencia de retomada**: escolha persistente da pessoa para permitir ou impedir restauracao e registro, vinculada as configuracoes do leitor.
- **Progresso de leitura**: percentual normalizado, identidade da obra, contexto opcional de capitulo e metadados minimos para validacao.
- **Identidade da obra**: chave fornecida pela integracao ou derivada de dados publicos estaveis da obra e da pagina, usada para isolar registros.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em todos os cenarios de paginação suportados, uma obra reaberta retorna a no maximo uma pagina de distancia da posicao proporcional salva.
- **SC-002**: A pessoa consegue desabilitar ou reabilitar a retomada com uma unica interacao no menu de opcoes.
- **SC-003**: Cem por cento das leituras com a funcionalidade indisponivel preservam o comportamento anterior e nao criam registros de progresso.
- **SC-004**: Cem por cento dos registros invalidos ou falhas de armazenamento testados permitem que a obra abra normalmente no inicio.
- **SC-005**: Progresso de duas obras com identidades distintas nunca e aplicado de uma para a outra nos cenarios de verificacao.

## Assumptions

- A funcionalidade e opt-in para preservar a compatibilidade: so fica disponivel quando a integracao a configura explicitamente.
- Quando disponivel, o estado inicial e habilitado, salvo se a integracao indicar o contrario; uma escolha ja persistida pela pessoa prevalece.
- A identidade explicita da obra e recomendada. Na ausencia dela, o leitor pode usar titulo e localizacao publica como fallback, documentando que mudancas nesses valores criam um novo contexto.
- A restauracao proporcional prioriza continuidade aproximada, pois fonte, viewport, colunas e conteudo podem alterar a quantidade de paginas.
- O progresso fica apenas no armazenamento local da origem e nao e sincronizado entre navegadores ou dispositivos.
