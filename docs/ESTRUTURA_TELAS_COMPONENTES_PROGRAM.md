# Telas prioritárias, componentes e composição do `program`

Este documento parte do pacote TypeScript em que `src/program.ts` coordena a aplicação e `src/componenting-demo-lab.ts` realiza a montagem imperativa única. Ele define como organizar e apresentar quatro superfícies: **acesso**, **perfil do professor**, **perfil do aluno** e **social**, usando specs de tela extraídas das referências como dados de componentes. As funções de componente, páginas, specs e dados iniciais da demo ficam reunidos em `src/components.ts`; `src/componenting-demo-lab.ts` cuida da interação e da montagem imperativa.

Para ver a árvore visual de cada página e o diagrama de composição, consulte [Esboço de composição das páginas](ESBOCO_COMPOSICAO_PAGINAS.md).

### Evidência das imagens

- [Mapa do site](/home/icarogdo/Lumira_Frontend_Cognoscere/docs/telas/10_mapa_do_site.png): informa a existência e hierarquia do acesso, mas não detalha seu layout visual. Por isso o spec marca acesso como `navigation-only`.
- [Perfil personalizável](/home/icarogdo/Lumira_Frontend_Cognoscere/docs/telas/11_perfil_personalizavel.png): fonte direta para shell, identidade docente, painel de personalização, stories, abas e painéis do perfil professor.
- [Comunidade e calendário](/home/icarogdo/Lumira_Frontend_Cognoscere/docs/telas/13_comunidade_calendario.png): fonte direta para calendário mensal, navegação social, feed em colunas e painéis comunitários.
- Não há imagem de perfil discente. `student-profile` é um spec derivado da gramática do perfil docente e do mapa de navegação; os componentes derivados carregam essa marca para não sugerir que estavam presentes na referência.

`ReferenceRegionSpec` declara `id`, `title`, `description`, `evidence`, `fixtureKey` e `kind`; `initialComponentData`, componentes e páginas vivem em `components.ts`; `componenting-demo-lab.ts` monta o laboratório interativo dentro do `programGenerator()`. Na demo, cada região vira um `<lumira-page-part>` selecionável da página, com seus elementos internos montados juntos; o editor recebe o fixture JSON da tela e há controles de estado e papel. `AccessPageComponent`, `TeacherProfilePageComponent`, `StudentProfilePageComponent` e `CommunityPageComponent` são Custom Elements stateful para as quatro composições; cada um mantém seu state iterator criado no `constructor`. O laboratório envia fixture e `ComponentMockSituation` para a página; ela propaga a situação às partes. Funções stateless compõem o markup interno. A lista exibe partes de página, não componentes isolados nem uma página de documentação.

O laboratório segue o padrão Cognoscere: `ComponentingDemoLab`, `DemoDataEditor`, as quatro páginas e cada `<lumira-page-part>` são `HTMLElement`s stateful com state iterators criados nos próprios construtores; funções diretas e sem estado geram o markup interno; `add` acumula partes e `mountParts` monta markup e elementos reais. `componenting-demo-lab.ts` declara o cenário mock — página/fixture, papel, região selecionada e estado — e passa-o às páginas. O generator inicializa o serviço e faz uma única montagem imperativa. `src/design-tokens.json` e `src/design-tokens.css` definem fontes e tokens visuais; `src/assets/manifest.json` registra imagens locais agrupadas por página.

## Objetivo de arquitetura

O `program` deve compor uma tela de forma determinística a partir de quatro entradas:

```text
rota + sessão/papel + estado da requisição + projeção de dados
                         ↓
               modelo de tela (ScreenModel)
                         ↓
                 layout + componentes
```

O `program` decide **qual tela e qual estado exibir**; o gateway fornece dados; o layout organiza a moldura da página; componentes apresentam dados e emitem ações declarativas. Nenhum componente visual consulta a URL, a sessão global ou o gateway.

## Superfícies e rotas

| Superfície | Rota | Variação de apresentação |
|---|---|---|
| Acesso | `/acesso` | visitante; formulário pronto, enviando ou com erro |
| Perfil do professor | `/perfil` | `session.role === 'professor'`; resumo docente e atributos públicos editáveis |
| Perfil do aluno | `/perfil` | `session.role === 'aluno'`; progresso somente quando autorizado e aviso de privacidade |
| Social | `/social` | feed e calendário para qualquer sessão; fórum docente só para professor |

O perfil usa uma rota compartilhada, mas duas projeções explícitas: `profile.teacher` e `profile.student`. Não espalhar condicionais de papel em cada controle. Resolver a variante uma vez e passar dados/capacidades apropriados à composição.

## Inventário proposto de componentes

O inventário abaixo descreve a arquitetura da plataforma além da demo. As composições e partes visuais da demonstração já estão implementadas em `src/components.ts`; [Composição das páginas](ESBOCO_COMPOSICAO_PAGINAS.md) registra a árvore correspondente ao código.

### Base e moldura

- `Brand`: identidade Lumira e retorno à entrada.
- `PublicLayout`: moldura sem sessão para landing e acesso.
- `WorkspaceLayout`: navegação autenticada, busca, identidade e área principal.
- `SocialLayout`: cabeçalho da comunidade, calendário e área do feed dentro do workspace.
- `Sidebar`, `Topbar`, `BottomNav`: navegação adaptada ao papel e ao viewport.
- `PageHeading`, `Card`, `Button`, `Field`, `Badge`, `Feedback`, `EmptyState`, `Skeleton`: primitivas de apresentação.

### Acesso

- `AccessScreen`: composição da tela de acesso.
- `AccessForm`: campos e envio; recebe `status`, `error` e callback declarativo.
- `RoleSelector`: papéis que o modo atual permite demonstrar.
- `AccessFeedback`: erro de autenticação ou estado de envio.

O formulário atual é demonstrativo e seleciona um papel. O contrato deve manter esse fato visível e não sugerir autenticação real.

### Perfil

- `ProfileCover({cover})`
- `ProfileIdentity({name, handle, roleLabel, school, avatar})`
- `ProfileStories({items, canCreate})`
- `ProfileTabs({items, activeId})`
- `ProfileAbout({bio, interests})`
- `PublicProfileForm({profile, status, capabilities})`
- `AuthorizedProgress({items})` — apenas conquistas explicitamente autorizadas para exibição pública.
- `TeachingSummary({classes, subjects, publicMaterials})` — sem respostas ou dados individuais de estudantes.
- `PrivacyNotice({text})`

`TeacherProfileScreen` compõe identidade, stories, sobre, formulário e resumo docente. `StudentProfileScreen` compõe identidade, stories, sobre, formulário, progresso autorizado e aviso de privacidade. Ambos podem reutilizar cover, identidade, stories, tabs e formulário sem compartilhar dados privados.

### Social

- `CommunityHeader`: título, descrição e ação de publicar.
- `CalendarStrip({month, events, status})`: eventos públicos e estado vazio/carregando.
- `SocialTabs({activeId, capabilities})`: feed, eventos e fórum quando permitido.
- `TopicList({topics, status})`
- `PostComposerEntry({canPublish})`
- `PostFeed({posts, status})`
- `PostCard({post})`
- `EventList({events, status})`
- `SocialRulesNotice`: explica quais conteúdos podem circular publicamente.

Feed e calendário recebem projeções públicas. Respostas, registros de matrícula, critérios internos de avaliação e notas não entram no modelo de dados social.

## Modelo de tela

Adotar uma união discriminada em `src/types.ts` ou módulo próprio `src/app/screen-model.ts`:

```ts
type ScreenStatus = 'loading' | 'ready' | 'empty' | 'error' | 'forbidden';

interface ScreenModel<TData> {
  id: string;
  status: ScreenStatus;
  data: TData | null;
  capabilities: Record<string, boolean>;
  error: { message: string; retryable: boolean } | null;
  requestId: number;
}
```

Variações importantes:

| Estado | O que a composição mostra |
|---|---|
| `loading` | skeletons com dimensões próximas ao conteúdo; ações temporariamente indisponíveis |
| `ready` | dados tipados e capacidades efetivas da tela |
| `empty` | explicação contextual e ação possível, sem fingir que há conteúdo |
| `error` | mensagem e tentativa de novo carregamento; preservar entrada local quando seguro |
| `forbidden` | acesso restrito, sem renderizar dados protegidos |

Uma lista vazia não implica erro; ausência de snapshot não implica tela vazia. O carregador define o estado, e a tela escolhe a composição correspondente.

## Registro de telas

Separar a decisão de rota da marcação. Caminho sugerido: `src/app/screen-registry.ts`.

```ts
interface ScreenDescriptor<TData> {
  id: string;
  match(route: string): boolean;
  roles: Role[] | 'public';
  layout: 'public' | 'workspace' | 'workspace-social';
  load(context: ScreenLoadContext): Promise<TData>;
  render(model: ScreenModel<TData>): string;
}
```

Descritores prioritários:

```text
access             route=/acesso | public | PublicLayout
profile.teacher    route=/perfil | professor | WorkspaceLayout
profile.student    route=/perfil | aluno | WorkspaceLayout
social.community   route=/social | authenticated | SocialLayout
```

`screen-registry` escolhe um descritor; `program` aplica autorização de navegação e estado; `render` compõe layout + tela. O gateway não conhece HTML e a tela não conhece endpoints.

## Ciclo proposto do `program`

1. Capturar rota e sessão atuais.
2. Redirecionar visitante de rota privada para `/acesso`; escolher descritor pelo caminho e papel.
3. Criar modelo `loading` com `requestId` da navegação e renderizar imediatamente.
4. Chamar o carregador do descritor com gateway, sessão e parâmetros de rota.
5. Converter resultado em `ready` ou `empty`; converter falha em `error`; falta de permissão em `forbidden`.
6. Antes de aceitar a resposta, comparar `requestId` e rota atuais para ignorar resultados atrasados de navegação anterior.
7. Renderizar o layout e a tela a partir do `ScreenModel`.
8. Delegar ações via `data-action`/`data-form` ao `system`; após confirmação, atualizar snapshot e invalidar apenas projeções afetadas.

Exemplo de fluxo de estado:

```text
navigate('/perfil')
  → resolve profile.teacher pelo papel
  → render loading
  → gateway.loadProfile({scope: 'public'})
  → render ready(profile, capabilities)
  → submit save-profile
  → gateway.saveProfile(input)
  → atualizar projeção e apresentar confirmação ou error
```

Cada ação pendente deve ser identificada por operação/tela, em vez de um único booleano global que bloqueie toda a navegação. O contrato atual `LumiraSystem.info()` pode evoluir para expor estado por tela sem expor o objeto interno da máquina.

## Dados por superfície

| Tela | Projeção de dados | Capacidades |
|---|---|---|
| Acesso | papéis habilitados no modo demo; estado do formulário | enviar acesso, voltar |
| Perfil professor | atributos públicos, stories, resumo docente publicável | editar perfil, publicar story quando habilitado |
| Perfil aluno | atributos públicos, stories, conquistas autorizadas | editar perfil, mostrar/ocultar conquistas permitidas |
| Social | posts autorizados, eventos públicos, tópicos públicos | criar post; abrir fórum apenas para professor |

Evitar entregar `AppSnapshot` completo a cada tela. Criar projeções estreitas (`TeacherProfileData`, `StudentProfileData`, `CommunityData`) previne dependência acidental de dados não relacionados. O adaptador demo e o Workers devem obedecer aos mesmos contratos.

## Organização adotada: dois monólitos

```text
src/
  components.ts                 # componentes de página/partes, specs, fixtures e componentes da plataforma
  componenting-demo-lab.ts      # interação da demo, elementos stateful e generator main
  program.ts                    # domínios e serviços privados dos programas
  types.ts                      # contratos compartilhados
```

`components.ts` concentra páginas e suas partes stateful, templates stateless, specs e dados visuais, junto aos componentes da plataforma. `componenting-demo-lab.ts` contém o generator principal, os `HTMLElement`s do laboratório e a orquestração das fixtures e situações mock; cada elemento mantém seu state iterator, inicializado no construtor. `program.ts` contém serviços e domínios internos; o generator instancia-os e monta a interface.

## Relação com o projeto atual

Hoje `src/program.ts` possui um `machine` com `session`, `snapshot`, `pending`, `error` e `message`. No caminho da plataforma, seu renderer decide acesso, shell e `page(route, snapshot)`. No caminho demo, `src/componenting-demo-lab.ts` declara e monta um único `ComponentingDemoLab` stateful e o injeta como renderer completo; `program()` fornece apenas a API `LumiraSystem`, sem sobrepor a ordem de renderização do laboratório. `?presentation=application` reserva `program()` para a plataforma inteira.

Essa implementação é o ponto de partida, não a arquitetura de estados completa descrita acima. O inventário e os contratos deste documento tornam explícitas as próximas fronteiras sem afirmar que loading/empty/error por tela, projeções estreitas ou o registro já estejam implementados.

## Critérios para considerar a arquitetura implantada

- As quatro superfícies têm descritores claros e componente de tela próprio.
- Cada tela prioritária apresenta loading, ready, empty e error sem duplicar sua árvore principal.
- Professor e aluno compartilham componentes de perfil, mas recebem modelos e capacidades específicos.
- Requisições antigas não sobrescrevem o estado da rota atual.
- A superfície social nunca recebe dados de aprendizagem privados.
- O wrapper de demonstração consegue fornecer mais de um fixture/status sem alterar o programa de produção.
- Gateway demo e gateway Workers atendem ao mesmo contrato de dados e ações.
