# Paginar

Web Component para transformar conteúdos HTML em uma visualização paginada, melhorando a leitura no browser, navegação, customização etc.

-----

### Exemplo real em uso (com alguma complexidade)

[link](https://sabia.pub/book/okabayashi-uma-perspectiva-decolonial-para-o-design-no-brasil/read/haDxQvbtIIX4Hh5cOyee/content)


## Como usar

Via CDN, basta incluir ao final do html, antes do fechamento da tag body, o script:

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/sabia-publisher/paginar/dist/index.es.js"></script>
```

No corpo do html, no local onde deseja que seja renderizado o leitor, utilizar o Web Component conforme abaixo, e inclua o conteúdo que deseja paginar dentro de um div com propriedade slot="content":

```html
<paginate-content id="pagination-el" book-title="Título do livro">
    <div slot="content">
        <p>Conteúdo HTML para paginar</p>
    </div>
</paginate-content>
```

## Customização

### Parametros de customização disponíveis

O web component disponibiliza algumas interfaces de customização por via de um objeto a ser linkado ao web component, conforme o exemplo:

```html
<paginate-content id="pagination-el">
    <div slot="content">
        <p>Conteúdo de uma pagina.</p>
    </div>
</paginate-content>

<script>
	const settings = {
		fontSize: 19, // number
	}

	const paginationEl = document.getElementById('pagination-el')
	if (paginationEl) {
		paginationEl.setAttribute("reader-settings", JSON.stringify(settings))
	}
</script>
```

Nesse exemplo, configuramos o tamanho padrão de `font-size` da interface e texto como `19px`. As demais configurações disponíveis até o momento são:

```js
const settings = {
	// fontSize
	// tamanho da fonte
	// tipagem: número
	fontSize: 19, 

	// textFont
	// designa a fonte base a ser usada no corpo do texto
	textFont: 'Times New Roman',

	// baseFont
	// designa a fonte padrão para a interface do paginador como um todo
	baseFont: '"Inter", sans-serif',

	// homeUrl
	// URL a ser direcionado pelo botao de home ao lado do sumário.
	// se nao for adicionada a opcao aqui, o botao de home nao aparecerá
	homeUrl: 'https://sabia.pub',

	// bookTitle
	// titulo do livro, a ser mostrado no cabeçalho do paginador
	bookTitle: 'A Tale of Two Cities',

	// chapterTitle
	// titulo do capítulo, a ser mostrado no cabeçalho do paginador
	chapterTitle: 'Chapter One - The Period',

	// fontsOptions
	// customização da lista de fontes disponíveis para o usuário customizar
	// a tela de leitura. Deve ser uma lista de até 4 opções, com o nome
	// da fonte, o label a ser apresentado para o leitur, se é default ou nao
	// e um link de onde essa fonte deve ser importada, caso não seja uma 
	// fonte de sistema
	fontsOptions: [
		{
			label: 'Times New Roman',
			name: 'TimesNewRoman, Times New Roman, Times, Baskerville, Georgia,serif',
			defaultTextFont: true // fonte padrão do corpo do texto
		},
		{
			label: 'Inter',
			name: '"Inter", sans-serif',
			link: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&display=swap',
			defaultBaseFont: true // fonte padrão da interface de paginação
		},
		{
			label: 'Open Dyslexic',
			name: '"Open-Dyslexic", sans-serif',
			link: 'https://fonts.cdnfonts.com/css/open-dyslexic'
		},
		{
			label: 'Atkinson Hyperlegible',
			name: 'Atkinson Hyperlegible',
			link: 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap'
		}
	],

	// cssString
	// possibilita que CSS seja enxertado no escopo do web component 
	//  para a customização da interface em si (conceito explicado abaixo, 
	// no item de "Aplicando estilos na interface do paginador")
	// no exemplo abaixo, mudamos a cor do cabeçalho para transparente
	// e o padding do cabeçalho. Existem diversas classes e ids auxiliares na
	// interface, que podem ser explorados pelo inspetor de elementos do
	// navegador.
	// no segundo estilo, escondemos o menu de "Notas de rodapé" do menu
	// de opções
	cssString: `
		header#component-header {
			background-color: transparent;
			padding: 5px;
		}

		#footnotes-button {
			display: none;
		}
	`

}
```


### Aplicando estilo no corpo do texto

O conteúdo que vai dentro do `<div slot="content"></div>` pode ser customizado por CSS, seja por importação de um link p/ arquivo CSS, ou seja por uma tag `<style>` fora do componente de `<page-content>`. 

No exemplo abaixo, na classe `.page-break` criamos uma classe-auxiliar que força uma quebra de coluna/página. E também aplicamos uma classe geral em todos os parágrafos, para controlar a indentação:

```html
<style>
	.page-break {
		break-before: column;
	}
	
	p {
		text-indent: 4rem;
	}
</style>

<paginate-content id="pagination-el" book-title="Título do livro">
	<div slot="content">
		<p>Conteúdo de uma pagina.</p>
		<div class="page-break"></div>
		<p>Conteúdo da próxima página.</div>
	</div>
</paginate-content>

```

### Aplicando estilos na interface do paginador

No entanto, a maneira acima demonstrada não possibilita alterar o estilo da interface em sí do paginador. Isso porque o escopo do CSS do paginador está dentro de um [**web component**](https://developer.mozilla.org/en-US/docs/Web/API/Web_components), que possui escopo isolado do restante da página, aninhados no `shadow dom` daquele componente.

Para possibilitar a alteração do estilo da interface do web component, assim, precisamos inserir o CSS almejado no escopo do web component. Para isso, disponibilizamos uma interface via parametros da configuração do componente, conforme exemplo a seguir:

```html

<paginate-content id="pagination-el" book-title="Título do livro">
    <div slot="content">
        <p>Conteúdo de uma pagina.</p>
    </div>
</paginate-content>

<script>
	const settings = {
		cssString: `
			main#rootComponent  {
				transition: background-color 200ms linear;
			}
		`
	}

	const paginationEl = document.getElementById('pagination-el')
	if (paginationEl) {
		paginationEl.setAttribute("reader-settings", JSON.stringify(settings))
	}
</script>

```


-----

### Exemplos didáticos

Para customizações especiais, navegue pelos exemplos abaixo e inspecione o código como ele funciona.

[Uso básico](https://educkf.github.io/paginar-exemplos/exemplo1/exemplo1.html)

[Mostrar logo no cabeçalho](https://educkf.github.io/paginar-exemplos/exemplo1/exemplo1-com-logo-no-cabecalho.html)

[Com sumário](https://educkf.github.io/paginar-exemplos/exemplo2/exemplo2-cap1.html)

[Fontes especiais p/ menu de opções](https://educkf.github.io/paginar-exemplos/exemplo3/exemplo3.html)

Notas de rodapé (em breve)

Referências bibliográficas (em breve)

Customizar cores (em breve)

Customizar apresentaçào de páginas (abertura, cores de fundo, quebra de pagina etc. Em breve)

-----

### Exemplo real em uso (com alguma complexidade)

[link](https://sabia.pub/book/okabayashi-uma-perspectiva-decolonial-para-o-design-no-brasil/read/haDxQvbtIIX4Hh5cOyee/content)


### Desenvolvimento

- [X] Custom Component (or Web Component) to be used in any environment
- [X] Paginate html/markdown content
- [X] Auto-generate Summary
- [X] Auto-recognize references and link accordingly
- [ ] Navigate to specific point in content
- [X] Customize options and summary menu
- [X] Customize header
- [X] CSS-theme structure
