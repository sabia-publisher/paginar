# Cores e seletores do painel de busca

O painel lateral é aberto por **Ver trechos** ou por `searchResults: 'panel'`
nas configurações. O resultado selecionado muda apenas o fundo, sem faixa ou
borda à esquerda. O contorno de foco por teclado continua visível.

## Variáveis CSS

Defina as variáveis no próprio `paginate-content` na página hospedeira. Elas
são herdadas pelo Shadow DOM. Também podem ser definidas em CSS fornecido por
`css-string`, `css-file` ou `reader-settings.cssString`.

| Variável | O que colore | Padrão claro | Padrão escuro |
| --- | --- | --- | --- |
| `--search-panel-bg` | Fundo do painel | `#fff` | `#2d2d2d` |
| `--search-panel-color` | Texto, ícones, borda do campo e contorno de foco | `#222` | `#fff` |
| `--search-result-hover-bg` | Fundo ao passar o mouse sobre um resultado não selecionado | `#00000008` | `#ffffff12` |
| `--search-result-active-bg` | Fundo do resultado selecionado | `#ffa03c26` | `#ffa03c26` |
| `--search-result-divider-color` | Separadores entre resultados | `#8884` | `#8884` |
| `--search-result-highlight-bg` | Fundo do termo destacado no trecho | `#ffc40066` | `#ffc40066` |
| `--search-result-highlight-color` | Texto do termo destacado | Herdado | Herdado |

```css
paginate-content {
	--search-panel-bg: #f7fafc;
	--search-panel-color: #172b4d;
	--search-result-hover-bg: #e8f0fa;
	--search-result-active-bg: #d6e6fb;
	--search-result-divider-color: #ccd8e5;
	--search-result-highlight-bg: #ffe59a;
	--search-result-highlight-color: #382800;
}
```

Valores definidos pelo consumidor valem nos dois modos. Para uma paleta por
modo do leitor, use `css-string` ou `css-file` com regras `.light` e `.dark`
no Shadow DOM, por exemplo:

```css
.light {
	--search-panel-bg: #f7fafc;
	--search-panel-color: #172b4d;
}
.dark {
	--search-panel-bg: #182435;
	--search-panel-color: #f1f5fa;
	--search-result-hover-bg: #ffffff12;
	--search-result-active-bg: #314965;
}
```

O fundo selecionado tem prioridade sobre hover. Essas variáveis afetam a
lista lateral; os destaques sobre o texto do livro continuam usando
`.search-highlight` e `.search-highlight-active`.

## Classes e seletores públicos

| Seletor | Elemento |
| --- | --- |
| `#search-dropdown.search-panel` | Contêiner do painel lateral |
| `.search-panel-title` | Título “Resultados da busca” |
| `#search-input` | Campo de consulta |
| `#search-status` | Contagem/estado da busca |
| `#search-view-button` | Alternância entre compacto e painel |
| `#search-result-list` | Lista com rolagem própria |
| `.search-result` | Botão de cada resultado |
| `.search-result[aria-current="true"]` | Resultado selecionado |
| `.search-result-location` | Capítulo e página; opacidade padrão `0.8` |
| `.search-result-excerpt` | Trecho com contexto |
| `.search-result mark` | Termo destacado dentro do trecho |
| `.search-icon-button` | Controles de ícone compartilhados com a busca compacta |

Seletores de uma folha externa comum não atravessam o Shadow DOM. Para
customizações por classe, forneça o CSS pela API de estilos do leitor:

```html
<paginate-content
	reader-settings='{"search":true,"searchResults":"panel"}'
	css-string='.search-result-location { color: #52657a; opacity: 1; }'
></paginate-content>
```

Veja a [API de busca](events-and-state.md#busca-painel-de-trechos-e-resultados-externos)
e a [demo do painel](../demo/search/index.html?view=panel).
