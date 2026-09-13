# Public contract: `reader-settings.readingProgress`

O atributo `reader-settings` continua recebendo uma string JSON. O novo campo é opcional:

```json
{
  "bookTitle": "A Tale of Two Cities",
  "readingProgress": {
    "id": "a-tale-of-two-cities",
    "enabled": true
  }
}
```

- Campo ausente ou `false`: não restaura, não salva e não mostra o controle.
- Objeto: disponibiliza a função; `enabled` assume `true` quando omitido.
- `id`: recomendado para estabilidade e isolamento. Deve ser uma string não vazia.
- A escolha no menu prevalece sobre `enabled` nas visitas seguintes naquela origem.
- A persistência é local ao navegador/origem e não sincroniza dispositivos.
- Configuração inválida degrada para o recurso indisponível.
