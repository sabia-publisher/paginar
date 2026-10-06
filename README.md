# Paginar

## Manutenção e contribuição

Para trabalhar no projeto, comece pelo [AGENTS.md](AGENTS.md). Consulte também o
[mapa da arquitetura](docs/architecture.md), o [guia de desenvolvimento e validação](docs/development.md)
e o [roteiro de publicação no npm](docs/releasing.md). Tarefas pequenas podem seguir
esse fluxo diretamente; o uso de Specify / Spec Kit é opcional.

Esses documentos estão no [repositório público](https://github.com/sabia-publisher/paginar).

Web Component para transformar conteúdos HTML em uma visualização paginada, melhorando a leitura no browser, navegação, customização etc.

-----

### Exemplo real em uso (com alguma complexidade)

[link](https://sabia.pub/book/okabayashi-uma-perspectiva-decolonial-para-o-design-no-brasil/read/haDxQvbtIIX4Hh5cOyee/content)


## Como usar

Via CDN, basta incluir ao final do html, antes do fechamento da tag body, o script:

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/sabia-publisher/paginar/dist/index.es.js"></script>
```

Esse link acima sempre puxa a última versão disponível para o software, e também as melhorias que eventualmente fazemos.

Para apontar para uma versão estável, e assim evitar possíveis bugs ou desconfigurações vindas das melhorias, pode ser da seguinte maneira:

```html
<script type="module" src="https://unpkg.com/paginar@0.5.0/dist/index.es.js"></script>
```

No corpo do html, no local onde deseja que seja renderizado o leitor, utilizar o Web Component conforme abaixo, e inclua o conteúdo que deseja paginar dentro de um div com propriedade slot="content":

```html
<paginate-content id="pagination-el">
    <div slot="content">
        <p>Conteúdo HTML para paginar</p>
    </div>
</paginate-content>
```

### Carregamento mais rápido

O leitor só começa a buscar o primeiro arquivo do `book-content` e as fontes de
`fontsOptions` depois que o script é executado. A página hospedeira pode antecipar
esses downloads no `<head>`; o `crossorigin` é necessário para que o `fetch` do
leitor reaproveite o arquivo pré-carregado:

```html
<link rel="preload" href="/capitulos/capitulo-1.html" as="fetch" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

Imagens no conteúdo devem declarar `width` e `height` (ou `aspect-ratio` no CSS)
para reservar espaço antes de carregar. O leitor repagina sozinho quando fontes
ou imagens mudam o tamanho do texto, mas reservar o espaço evita que o total de
páginas mude durante a leitura. Capítulos muito longos custam mais para paginar;
dividi-los em arquivos menores reduz o tempo até a primeira página.

Aplicações que já usam Vue 3.5 ou superior com um bundler podem importar
`paginar/dist/index.vue-external.es.js`. Esse arquivo registra o mesmo
`<paginate-content>`, mas importa `vue` da aplicação em vez de embutir o runtime,
reduzindo o download para cerca da metade. Use-o apenas quando `vue` estiver
disponível como módulo (bundler ou import map); o arquivo padrão continua sendo
`dist/index.es.js`.

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

	// search
	// habilita a busca no texto do capítulo atual (desativada por padrão).
	search: true,

	// readingProgress
	// disponibiliza no menu a retomada da leitura e salva a posição por percentual.
	// use um id estável e exclusivo para evitar misturar o progresso entre obras.
	// enabled define o estado inicial; a escolha posterior do leitor prevalece.
	readingProgress: {
		id: 'a-tale-of-two-cities',
		enabled: true
	},

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

`readingProgress` é opcional. Quando ausente ou `false`, o componente não salva
nem restaura posições e não mostra o controle **Retomar leitura**. Quando o objeto
é informado, `enabled` assume `true` se omitido. O progresso fica somente no
`localStorage` da origem atual, não é sincronizado entre dispositivos e é isolado
por obra e contexto de capítulo. Sem `id`, o componente usa o título e o caminho
da página como alternativa; para publicações duradouras, prefira sempre um `id`
explícito e estável.

Ao alterar fonte, tamanho, colunas ou dimensões da janela, o leitor preserva o
percentual anterior e seleciona a página mais próxima no novo total. Quando a
posição fica exatamente entre duas páginas, a página seguinte é escolhida.

### Busca no texto

Defina `search: true` no JSON de `reader-settings`, antes de montar o componente.
Quando omitida ou `false`, a lupa não aparece e Ctrl+F mantém a busca do navegador.
A configuração não é persistida nas preferências do leitor.

Com a busca ativa, a lupa à esquerda de **Opções**, Ctrl+F ou Cmd+F abre o campo
abaixo do cabeçalho. Clicar fora mantém o campo aberto; Esc, o botão de fechar ou
a lupa o fecha. O atalho preserva a busca nativa quando o foco está em um campo
editável externo ao leitor.

A busca funciona no conteúdo atual, tanto em `slot="content"` como em HTML
carregado por arquivo. Não carrega outros capítulos para pesquisá-los. Ignora
maiúsculas, acentos e cedilha, normaliza espaços e pontuação e encontra trechos
de palavras. Também aceita uma inserção, remoção, substituição ou inversão de
letras adjacentes por palavra consultada com cinco ou mais caracteres. Por
exemplo, `acao` encontra `ação` e `lietura` encontra `leitura`.

Após digitar, o leitor desliza até a primeira ocorrência e mostra a posição e o
total. Enter/Shift+Enter e as setas do dropdown percorrem os resultados em ordem,
retornando ao início/fim quando necessário. As ocorrências visíveis recebem um
destaque suave, com cor mais forte e contorno na ocorrência atual, sem modificar
o HTML nem a distribuição das páginas. Limpar o campo remove os destaques.
Alterações no texto ou troca de capítulo atualizam os resultados da consulta.

Use **Ver trechos** para abrir um painel lateral com todas as ocorrências,
palavras antes/depois e o termo destacado. Clicar em um trecho navega à página.
Com o foco na lista, ↑/↓ percorrem os trechos; ao abrir, o foco fica no campo.
Para usar esse modo ao abrir a busca, configure `searchResults: 'panel'` junto
de `search: true`; o modo compacto continua disponível.

Para complementar a busca com outros capítulos, escute `paginar:search` e
injete a resposta com `reader.setSearchResults({ requestId, results })`.
`paginar:search-select` informa a seleção externa para sua aplicação abrir o
capítulo. Veja formatos, controle de respostas atrasadas e métodos no guia de
[integração da busca](docs/events-and-state.md#busca-painel-de-trechos-e-resultados-externos).

Exemplos: [busca compacta](demo/search/index.html),
[painel de trechos](demo/search/index.html?view=panel) e
[busca no livro com resultados externos](demo/search-book/index.html).
Para ajustar a aparência, consulte [cores, variáveis CSS e classes do painel](docs/search-customization.md).

## Eventos, estado e navegação por JavaScript

O componente emite eventos públicos ao mudar de página, usar o slider, abrir o
sumário ou as opções, trocar capítulo e alterar fonte, tamanho, colunas ou tema.
Também oferece `getState()`, `goToPage()`, `nextPage()`, `previousPage()` e `refresh()` no
elemento. Todos os detalhes, nomes e formatos estão no guia de
[eventos e estado público](docs/events-and-state.md).

Depois de atualizar o slot e `book-content`, chame `refresh()` para recalcular
páginas e reler notas/referências. Campos e regiões com `data-paginar-ignore`
preservam suas interações de teclado/roda. No sumário, `disabled: true` ou a
ausência de destino mantém o título visível e o exclui da navegação sequencial.
Os detalhes e limites de compatibilidade estão no mesmo guia.

```js
const reader = document.querySelector('paginate-content')

reader.addEventListener('paginar:page-change', event => {
	console.log(event.detail.source, event.detail.state)
})

reader.addEventListener('paginar:ready', () => {
	console.log(reader.getState())
})
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

Para alterar o estilo da interface do web component, precisamos inserir o CSS almejado no escopo do web component. Para isso, disponibilizamos uma interface via parametros da configuração do componente, conforme exemplo a seguir:

```html
<paginate-content id="pagination-el" book-title="Título do livro">
    <div slot="content">
        <p>Conteúdo de uma pagina.</p>
    </div>
</paginate-content>

<script>
    const settings = {
        // outras opções
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

[Eventos e estado público (exemplo neste repositório)](https://sabia-publisher.github.io/paginar/demo/events/)

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
