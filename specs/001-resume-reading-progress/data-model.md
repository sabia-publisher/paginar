# Data Model: Retomar progresso de leitura

## Configuração pública `readingProgress`

- `enabled`: booleano opcional; padrão `true` quando o objeto existe.
- `id`: string opcional, não vazia; identidade estável recomendada da obra.

Ausência ou `false` significa recurso indisponível. O objeto disponibiliza o controle no menu.

## Preferência do leitor

- `readingProgressEnabled`: booleano.
- Persiste dentro das configurações já salvas.
- Estado: padrão do integrador -> escolha salva -> alternância no menu.

## Registro de progresso

- `version`: número do formato.
- `entries`: mapa entre chave de contexto e percentual.
- Percentual: número finito entre 0 e 1.
- Chave: identidade da obra mais identidade do capítulo/página corrente.

## Transições

- Indisponível -> disponível na inicialização quando há configuração válida.
- Habilitado -> desabilitado: remove entrada atual e para de salvar/restaurar.
- Desabilitado -> habilitado: salva a posição corrente e volta a restaurar.
- Pendente -> restaurado após total de páginas válido; cada contexto restaura uma vez por inicialização.
