# Publicação no npm e distribuição

## Estado confirmado e alcance deste roteiro

O pacote público é [paginar](https://www.npmjs.com/package/paginar). Em 2026-09-13, `npm view paginar version dist-tags repository.url --json --registry=https://registry.npmjs.org/` retornou versão e tag `latest` iguais a `0.3.4`, também presente no `package.json` local. Consulte novamente a cada release; esta informação não é uma versão fixa a publicar.

O repositório deste checkout usa https://github.com/sabia-publisher/paginar. Os metadados npm ainda apontam para `educkf/paginar`. O README oferece tanto CDN do GitHub quanto URL npm via unpkg. Atualizar arquivos no GitHub e publicar no npm são operações independentes.

Não há `.github/workflows`, script de release, `prepack` ou `prepublishOnly` versionados. Não foi possível inferir o procedimento histórico de autenticação/publicação só pelo código. O roteiro abaixo estabelece um procedimento manual para futuras releases, sem presumir automação externa ou acesso a uma conta mantenedora.

## Preparar uma versão revisável

1. Confira `git status --short`, o escopo da release e a versão no registry. Não inclua alterações locais alheias à entrega.
2. Instale com `yarn install --frozen-lockfile`. Escolha a nova versão conforme o impacto público; não reutilize uma versão já publicada. Atualize `version` em `package.json` sem publicar ou criar tag automaticamente. Revise também os metadados do repositório e exemplos versionados no README quando pertinente.
3. Execute `npm run build` e a validação de [desenvolvimento](development.md), incluindo a página que importa o bundle de `dist/`. Revise o diff dos fontes, `src/tailwind.css` e `dist/`.
4. Execute `npm pack --dry-run --json`. A lista deve conter apenas `dist/`, `package.json`, README e licença. Não deve incluir `.env`, credenciais, `.agents/`, `.specify/`, caches, demos privadas ou arquivos pessoais. O campo `files` restringe a seleção, mas os arquivos e source maps dentro de `dist/` também precisam ser revisados.
5. Execute `npm pack` para gerar `paginar-X.Y.Z.tgz`, substituindo `X.Y.Z` pela versão escolhida. Inspecione o tarball com `tar -tf paginar-X.Y.Z.tgz` (ou ferramenta equivalente) e teste seu conteúdo extraído numa pasta temporária, servindo uma página por HTTP que importe o JS extraído. O pacote deve funcionar sem depender de `src/` deste checkout.
6. Confira `git diff --check`, revise os arquivos públicos e registre o resultado da validação na descrição da release/PR. Commits e tags devem corresponder ao mesmo código usado para gerar o tarball. Não adicione o `.tgz` ao Git.

O dry-run não publica e não comprova permissão de publicação. Como não há hook de build, `npm pack` e `npm publish` não garantem que `dist/` esteja atualizado: a construção e a validação anteriores são obrigatórias neste procedimento.

## Publicar quando autorizado

Use uma conta com permissão sobre `paginar`. Autentique-se interativamente com `npm login --registry=https://registry.npmjs.org/`, se necessário, seguindo o fluxo exigido pelo npm. Não grave tokens, códigos de autenticação ou configurações de conta no repositório ou na documentação.

Publique o mesmo tarball que foi revisado, substituindo a versão no nome:

```sh
npm publish ./paginar-X.Y.Z.tgz --access public --tag latest --registry=https://registry.npmjs.org/
```

Para pré-release, escolha explicitamente uma tag como `next` em vez de mover `latest`. Uma combinação nome/versão publicada não pode ser reutilizada; correções posteriores precisam de outra versão. Veja a [documentação oficial de npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/).

Depois da publicação:

```sh
npm view paginar@X.Y.Z version dist.integrity --registry=https://registry.npmjs.org/
npm view paginar dist-tags --json --registry=https://registry.npmjs.org/
```

Compare a integridade publicada com a do pacote preparado e teste `https://unpkg.com/paginar@X.Y.Z/dist/index.es.js` em uma página de consumo. CDNs podem levar tempo para refletir a publicação.

Quando envio ao GitHub fizer parte do escopo autorizado, envie o commit e a tag de release correspondente, conferindo antes o remoto e a convenção de tags existente (`git tag --list`; há tags históricas sem prefixo `v`). Não suponha que a criação de uma tag publique no npm. Para consumo estável via CDN, use versão npm ou referência Git imutável; a URL GitHub sem versão acompanha mudanças do repositório e pode ter cache.

## Proteção de informações públicas

O GitHub e o tarball npm são superfícies públicas diferentes. O campo [`files` do package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#files) controla o segundo; `.gitignore` não remove arquivos já rastreados nem conteúdo de commits antigos. A base possui `.env` rastreado: não use esse arquivo para segredos. Se uma exposição real for identificada, trate a revogação e a limpeza do histórico com o mantenedor, sem reproduzir o valor em uma issue pública.

Não use `npm unpublish` como rollback rotineiro. Prepare uma versão corretiva e combine qualquer mudança de tags ou depreciação com o mantenedor.
