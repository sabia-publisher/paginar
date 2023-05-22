# Paginar

Web Component para transformar conteúdos HTML em uma visualização paginada, melhorando a leitura no browser, navegação, customização etc.

-----

### Como usar

Via CDN, basta incluir ao final do html, antes do fechamento da tag body, o script:

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/sabia-publisher/paginar/dist/index.es.js"></script>
```

No corpo do html, no local onde deseja que seja renderizado o leitor, utilizar o Web Component conforme abaixo, dentro de um div com propriedade slot="content":

```html
<paginate-content id="pagination-el" book-title="Título do livro">
    <div slot="content">
        <p>Conteúdo HTML para paginar</p>
    </div>
</paginate-content>
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
