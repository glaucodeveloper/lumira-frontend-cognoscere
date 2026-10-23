# Apresentação interativa · Lumira

Explore as telas da Lumira pela [apresentação ao vivo](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/). A página mantém a prévia completa e o laboratório de componentes: o índice troca de tela, a lista lateral abre cada parte e o inspetor ajusta seu estado e seus parâmetros de demonstração.

O PDF [Apresentação inicial — edição de perfil e partes da plataforma](../output/pdf/Lumira_Apresentacao_Inicial_Perfil_e_Componentes.pdf) apresenta o fluxo de edição, capturas anotadas das telas e a conexão de produto com o Documento 01 — Filosofia e Visão.

## Acesso e edição de perfil

A tela de entrada pede um PAT GitHub com acesso ao metadado do segredo `ROUTER_KEY` no repositório `glaucodeveloper/remote-station-support-repo` e a chave local do Port Router. O Port Router valida o token na API do GitHub e cria uma sessão temporária; não lê nem retorna o valor do segredo. O PAT GitHub é descartado após a validação. A credencial do Forge fica no ambiente local e é usada pelo router ao encaminhar conversas. Nenhuma chave é salva no navegador. Essa entrada libera a experiência e a conexão local; GitHub Pages e os arquivos publicados continuam públicos.

## Chat de projetos com Cognoscere

Abrir **Projetos em andamento** consulta `http://127.0.0.1:19195/health` pelo navegador. A conversa envia a ideia, a ficha atual, competências, escolha de compartilhamento, marcos e turnos anteriores ao Forge local. Pausas na edição também atualizam uma única reflexão do entendimento do projeto. Metis responde em texto e MiniCPM revisa dentro do serviço local; o texto aparece em Markdown, sem alterar campos ou salvar o projeto. O navegador precisa alcançar o Forge em loopback, que libera a origem GitHub Pages por CORS. Sem serviço local ativo, o chat informa indisponibilidade.

Nos perfis de professor e aluno, **Editar perfil** abre o modo de edição junto ao conteúdo. Os ícones de lápis levam ao campo correspondente; a pessoa pode alterar nome, função, escola, apresentação, biografia e competências ou interesses. A edição do perfil também permite buscar no Spotify, colar um link de faixa, álbum ou playlist, conferir o player incorporado e salvar a escolha. **Salvar alterações** atualiza a apresentação e os identificadores relacionados. Os valores ficam no `localStorage` deste navegador; não são enviados a um servidor nem sincronizados entre dispositivos. O player é incorporado pelo Spotify e depende de conexão e disponibilidade do serviço.

## Como conduzir a apresentação

1. Escolha **Acesso**, **Perfil professor**, **Perfil aluno** ou **Comunidade** no índice à esquerda.
2. Selecione uma parte na lista do inspetor. A descrição da responsabilidade da parte aparece logo abaixo do título principal da página, dentro da legenda da prévia; a leitura e o contexto da parte acompanham a seleção.
3. Altere o papel ou o estado para demonstrar variações. Loading retorna a pronto após um breve intervalo; vazio, erro e restrito continuam selecionáveis.
4. Em **Protótipo parametrizado**, altere visibilidade, densidade, cor e os campos próprios da parte selecionada. Campos de texto, listas, percentuais e quantidade de itens variam conforme o componente. **Aplicar parâmetros** atualiza apenas essa parte; **Redefinir** recupera seus valores da fixture da página.
5. Edite o JSON de demonstração para alterar os dados compartilhados da página inteira. Aplique-o para atualizar a prévia. O conteúdo permanece apenas no navegador.
6. Use **Compartilhar esta parte** para copiar um link direto. A seleção também aparece no endereço e responde aos comandos voltar/avançar do navegador.
7. Expanda a prévia para apresentar somente a tela; pressione Escape ou volte ao laboratório para continuar a exploração.

Os controles são parte do formato de demonstração: a maioria não indica persistência ou serviço ativo. Os dados são fictícios. O chat de projetos usa o Cognoscere local; respostas e rascunhos do projeto não persistem. Ações e alterações do protótipo ficam no navegador.

## Telas e partes

### Acesso

Tela pública derivada do mapa de navegação. O mapa define destinos e ações, não a composição visual do formulário.

| Parte | Para apresentar | Evidência | Abrir |
|---|---|---|---|
| Apresentação pública | Promessa do produto e contexto antes da entrada. | Derivada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=access&part=access-brand) |
| Formulário de acesso | Entrada demonstrativa por papel; não autentica. | Derivada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=access&part=access-form) |

### Perfil professor

Perfil que reúne identidade profissional, expressão pessoal e atividade compartilhada. A captura sustenta a estrutura visual; conteúdo e interações servem como cenários locais.

| Parte | Para apresentar | Evidência | Abrir |
|---|---|---|---|
| Navegação lateral | Papel ativo e acesso às áreas da plataforma. | Observada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=teacher-profile&part=workspace-sidebar) |
| Barra superior | Busca, criação e notificações comuns às páginas autenticadas. | Observada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=teacher-profile&part=workspace-topbar) |
| Hero do perfil | Capa, identidade, vínculo e ações que contextualizam o perfil. | Observada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=teacher-profile&part=teacher-hero) |
| Stories | Atualizações breves e projetos recentes. | Observada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=teacher-profile&part=teacher-stories) |
| Abas do perfil | Separação entre visão geral, percurso e publicações. | Observada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=teacher-profile&part=teacher-tabs) |
| Progresso geral | Indicadores ilustrativos de participação. | Observada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=teacher-profile&part=teacher-progress) |
| Competências principais | Percurso profissional representado por indicadores visuais. | Observada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=teacher-profile&part=teacher-skills) |
| Sobre mim | Biografia, vínculo escolar e redes públicas. | Observada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=teacher-profile&part=teacher-about) |
| Publicações e atividades | Prática pedagógica apresentada como narrativa compartilhável. | Observada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=teacher-profile&part=teacher-activity) |
| Projetos em andamento | Projetos e seus estados de participação. | Observada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=teacher-profile&part=teacher-projects) |
| Agenda | Compromissos demonstrativos da rotina docente. | Observada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=teacher-profile&part=teacher-agenda) |
| Personalização | Controles de aparência e visibilidade do perfil. | Observada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=teacher-profile&part=teacher-personalization) |

### Perfil aluno

Variação derivada do perfil docente. Não havia captura discente nas referências. A apresentação enfatiza conteúdo público e progresso autorizado; não inclui notas, respostas ou pareceres pedagógicos.

| Parte | Para apresentar | Evidência | Abrir |
|---|---|---|---|
| Navegação lateral | Áreas disponíveis no papel de estudante. | Derivada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=student-profile&part=workspace-sidebar) |
| Barra superior | Busca e ações comuns dentro do workspace. | Derivada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=student-profile&part=workspace-topbar) |
| Hero do aluno | Identidade pública e vínculo escolar. | Derivada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=student-profile&part=student-hero) |
| Stories do aluno | Projetos e momentos que o estudante escolhe compartilhar. | Derivada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=student-profile&part=student-stories) |
| Abas do aluno | Separação entre apresentação, percurso e publicações. | Derivada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=student-profile&part=student-tabs) |
| Competências escolhidas | Interesses públicos escolhidos pelo estudante, sem nota ou afirmação de domínio. | Derivada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=student-profile&part=student-skills) |
| Percurso autorizado | Indicadores liberados para exibição pública. | Derivada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=student-profile&part=student-progress) |
| Experiências compartilhadas | Uma produção escolhida para apresentar autoria e contexto à comunidade. | Derivada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=student-profile&part=student-activity) |
| Projetos em destaque | Projetos e participação pública autorizados pelo estudante. | Derivada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=student-profile&part=student-projects) |
| Conquistas | Itens escolhidos pelo estudante para o perfil. | Derivada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=student-profile&part=student-achievements) |
| Apresentação e privacidade | Limites entre o perfil social e o espaço pedagógico reservado. | Derivada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=student-profile&part=student-privacy) |

### Comunidade

Página social organizada pelo calendário e por um feed em colunas. A captura sustenta a composição geral; postagens, grupos e eventos são dados fictícios.

| Parte | Para apresentar | Evidência | Abrir |
|---|---|---|---|
| Navegação lateral | Entrada no workspace e áreas da comunidade. | Observada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=community&part=workspace-sidebar) |
| Barra superior | Ferramentas compartilhadas de busca e criação. | Observada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=community&part=workspace-topbar) |
| Cabeçalho e calendário | Eventos e datas como orientação temporal do feed. | Observada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=community&part=community-calendar) |
| Abas da comunidade | Caminhos distintos para feed, eventos e espaços de participação. | Observada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=community&part=community-tabs) |
| Tópicos e áreas | Descoberta de assuntos e comunidades por tema. | Observada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=community&part=community-topics) |
| Feed central | Publicação com contexto, autoria e interação local. | Observada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=community&part=community-feed) |
| Painel lateral | Eventos próximos e grupos como apoio à descoberta. | Observada | [Ver parte](https://glaucodeveloper.github.io/lumira-frontend-cognoscere/?screen=community&part=community-aside) |

## Como ler a evidência

- **Observada**: a parte aparece na captura de referência.
- **Derivada**: a composição foi proposta a partir de outra tela ou da estrutura do produto, sem captura direta.
- **Mapa de navegação**: há referência de rotas e ações, mas não da aparência visual.

As imagens de origem estão em [`design-references/`](../design-references/). O inventário estrutural e o diagrama anotado estão em [`ESBOCO_COMPOSICAO_PAGINAS.md`](ESBOCO_COMPOSICAO_PAGINAS.md). Tokens de tipografia e design ficam em `src/design-tokens.json` e `src/design-tokens.css`; os assets locais estão listados em `src/assets/manifest.json`.
