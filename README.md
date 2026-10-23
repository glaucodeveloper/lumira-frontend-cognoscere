# Lumira · apresentação interativa

Projeto frontend TypeScript baseado no esqueleto Cognoscere. A apresentação mantém o laboratório interativo: quatro telas de página, partes selecionáveis, fixtures editáveis e controles de estado. Cada tela e parte tem uma explicação preparada para apresentação; seleções têm links diretos e funcionam com voltar/avançar do navegador.

**Apresentação pública:** [glaucodeveloper.github.io/lumira-frontend-cognoscere](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/). O guia com a descrição de cada parte está em [`docs/APRESENTACAO_PUBLICA.md`](docs/APRESENTACAO_PUBLICA.md).

## Executar o frontend

Requisito: Node.js 20 ou superior.

```sh
npm install
npm run dev
```

Abra o endereço impresso pelo Vite para ver a apresentação. Escolha uma tela e uma parte, altere estados ou fixtures e use **Compartilhar esta parte** para copiar seu link navegável. Para abrir a plataforma, acrescente `?presentation=application` ao endereço e entre como professor, aluno ou administração. A demonstração usa dados locais em memória.

```sh
npm run check  # verificação TypeScript estrita e testes
npm run build  # validação e pacote de produção em dist/
npm run preview # servir o pacote de produção localmente
```

## Aplicação web e Cognoscere local

A aplicação é somente web e publica em GitHub Pages. O chat usa o Forge local em `http://127.0.0.1:19195`; Forge encaminha a conversa ao Metis local e à revisão do MiniCPM local. Não há cliente NVIDIA, túnel, Electron ou chave de serviço no bundle web.

```sh
npm run dev
```

Para usar o chat no site público, Cognoscere Forge, Metis e MiniCPM precisam estar ativos no computador que abre a página. O Forge permite CORS somente para a origem pública Lumira e para as origens locais Vite. Sem o serviço local ativo ou sem autorização do navegador para a conexão local, a interface mostra o estado offline; a página e os demais controles seguem disponíveis.

O chat de **Projetos em andamento** conversa sobre a ficha atual. Alterações digitadas, seleções, competências marcadas e marcos adicionados atualizam uma única reflexão após 900 ms sem edição. A resposta manual também recebe ficha, competências, decisão de compartilhamento social, calendário e histórico recente. A resposta usa Markdown, não altera os campos e não salva o projeto.

## Programa principal

`index.html` carrega `src/componenting-demo-lab.ts`. Seu `programGenerator()` ordena a montagem e entrega o `LumiraSystem` no primeiro `yield`. Sem parâmetro, o generator cria a página stateful do laboratório e a injeta como renderer completo no `program()`; assim, `program()` fornece somente a API de operações e não substitui a ordem visual do laboratório. `?presentation=application` reserva `program()` para montar a plataforma inteira, com seus eventos. `?mode=worker` seleciona o gateway Workers nesse modo. O sistema não é publicado em `window`. `src/main.ts` apenas reexporta o mesmo generator e sistema.

```ts
const system = program({ mount, mode: 'demo' });
system.navigate('/professor/sondagem');
system.snapshot();
```

`src/componenting-demo-lab.ts` reúne a lógica de interação do laboratório: `ComponentingDemoLab`, `DemoDataEditor`, seus state iterators e o `programGenerator()`. `src/components.ts` define as quatro páginas como Custom Elements stateful e cada região selecionável como `<lumira-page-part>`, também stateful; cada elemento cria seu iterator no `constructor`. As funções internas de template são stateless. As partes gerenciam seleção de abas/filtros, toggles, campos de formulário, feedback e publicações locais. O laboratório escolhe a tela, fixture, papel, região selecionada e estado visual e passa a situação mock para a página e suas partes. Specs, fixtures, componentes da plataforma e primitivas HTML compartilhadas também ficam em `components.ts`. `src/program.ts` mantém configurações, regras de domínio e implementações de serviço dentro de `program()`. `?presentation=application` ativa o renderer da plataforma.

O sistema visual usa `src/design-tokens.json` como fonte legível dos nomes e valores de fontes e design, publicado em `src/design-tokens.css` como custom properties. `src/assets/manifest.json` agrupa os arquivos de imagem por contexto; a demo usa imagens locais em `src/assets/profile/` e `src/assets/community/`.

## Publicação

O GitHub Actions publica `dist/` no GitHub Pages quando há push em `main` ou execução manual do workflow `Publicar apresentação no GitHub Pages`. O build usa caminhos relativos para funcionar na URL de projeto do Pages. O workflow verifica os tipos e cria o bundle de produção; dados da apresentação continuam estáticos e locais.

O inventário das telas prioritárias — acesso, perfis de professor/aluno e social — e a arquitetura planejada para o `program` exibir estados e projeções de dados estão em [`docs/ESTRUTURA_TELAS_COMPONENTES_PROGRAM.md`](docs/ESTRUTURA_TELAS_COMPONENTES_PROGRAM.md). A apresentação distingue partes observadas nas referências de propostas derivadas.

## Estrutura

| Caminho | Responsabilidade |
|---|---|
| `src/main.ts` | Reexport compatível do único entrypoint |
| `src/componenting-demo-lab.ts` | Generator imperativo único: escolhe modo e monta a interface; `program()` instancia os serviços |
| `src/program.ts` | Monólito interno de programas: domínios, serviços, roteamento e API `system` |
| `src/components.ts` | Componentes de página e suas partes, specs, dados iniciais, componentes da plataforma e primitivas compartilhadas |
| `src/componenting-demo-lab.ts` | Lógica de interação e montagem imperativa do laboratório, `programGenerator()` |
| `src/types.ts` | Contratos tipados de usuário, snapshot, gateway e sistema |
| `src/program.ts` | Orquestração e cliente HTTP do Cognoscere Forge local |
| `PROGRAM.md` | Eventos, propriedade de estado, integração e limites verificados |
| `tests/` | Testes de domínio e renderização |
| `docs/` | Arquitetura, endpoints e política de nivelamento |

## Limites da demonstração

O gateway padrão mantém dados apenas em memória. A página pública chama somente o Cognoscere Forge em loopback; o serviço aceita a origem Lumira pela allowlist CORS. A autenticação do serviço pede o PAT de chat do Cognoscere e a chave local do Port Router. `?mode=worker` seleciona o contrato HTTP proposto, que depende de uma API Workers implantada.

A referência Lumira menciona um coeficiente idade/série, mas não define a fórmula. O projeto mostra idade e série como contexto e mantém o coeficiente pendente de política institucional; não atribui nível escolar automaticamente. A sondagem continua exigindo revisão docente.

## Origem e arquitetura

A montagem e a composição seguem o padrão de `cognoscere/application/memory-studio/frontend/src/main.ts`: páginas e partes com estado são `HTMLElement`s com state iterators inicializados no `constructor`; templates stateless são funções; o `componenting-demo-lab.ts` envia fixture e cenário mock e `add`/`mountParts` insere elementos reais no DOM; o generator coordena a inicialização imperativa dos serviços. Consulte `AGENTS.md`, `docs/ARQUITETURA.md` e `docs/POLITICA_NIVELAMENTO.md`.

## Documentação do desenvolvimento

O registro de escopo, decisões, execução, validação, sondagem idade/série e materiais preservados está em [`docs/DESENVOLVIMENTO.md`](docs/DESENVOLVIMENTO.md). A versão diagramada está em [`docs/DOCUMENTACAO_TECNICA.pdf`](docs/DOCUMENTACAO_TECNICA.pdf). As telas de referência iniciais ficam em `docs/telas/` e os PDFs de origem em `docs/referencias/iniciais/`.
