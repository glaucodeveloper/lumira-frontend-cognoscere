# Arquitetura e limites do esqueleto

## Fluxo de propriedade das informações

```
HTML (componentes puros/iteradores)
          ▲                 │
          │ mensagem        │ data-action / data-form
          │                 ▼
      program() -> system { login, logout, navigate,
                            saveContracts, prepareSondagem,
                            generatePreview, submitAnswer,
                            publishPost, saveProfile }
          │
          ├── demo-gateway (dados fictícios, apenas teste visual)
          └── workers-gateway (contrato a implementar)
                     │
      Cloudflare Workers (backend real futuro)
          ├── GitHub: conteúdos editoriais versionados
          ├── Store privado: identidade, matrícula, entregas, mensagens
          └── Adaptador Metis-4B: geração e avaliação
```

O programa é instanciado uma vez e devolve `system`. A view não chama o backend diretamente; as operações são expostas por `system` e aplicadas via gateway. `startUI` está dentro de `program`, e não é uma instrução global executada fora dele.

## Contexto da sondagem

A política idade/série é entrada do plano de sondagem, não classificador de aprendizagem. O repositório histórico descreve perguntas por competência e série; o algoritmo preciso para "coeficiente idade/série" não foi especificado, portanto está propositalmente em aberto. O documento `docs/ENDPOINTS.md` sugere a persistência versionada da política.

## Contratos de IA

- `interpretation`: entendimento pedagógico das habilidades BNCC.
- `generation`: como gerar enunciados, textos-base, questões e materiais.
- `evaluation`: como examinar respostas por critérios e evidências citáveis.

Cada um tem revisão própria e nunca altera retrospectivamente uma atividade já aplicada. No protótipo, as revisões ficam na memória do navegador somente enquanto a instância estiver aberta. Não há inferência: a prévia exibida é um exemplo fixo identificado como **demonstração local**.

## Duas superfícies com papéis distintos

**Pedagógica, reservada:** matrícula, sondagem, atividades, entregas, monitor, critérios, evidências e decisões docentes.

**Social, compartilhável:** identidade, capa, stories, música, posts, fórum docente, encontros, calendários e resultados homologados de eventos. Não se transfere uma resposta privada para post automaticamente.

## Referências UX mapeadas

| UX | Rota |
|---|---|
| Landing / login | `/`, `/acesso` |
| T01 Início docente | `/professor/inicio` |
| T02 Matéria | `/professor/materias` |
| T03 Editor de contratos | `/professor/monitor` |
| T04 Prévia e revisão | `/professor/monitor` |
| T05 Publicação | ação `publishActivity` (esqueleto no monitor) |
| T06 Resposta do aluno | `/aluno/atividade` |
| T07 Evidências | `/professor/evidencias` |
| T08 Material / curso | `/cursos` |
| T09 Comunidade + calendário | `/social` |
| T10 Evento / leaderboard | `/social/eventos/:id` |
| T11 Perfil | `/perfil` |
| T12 Administração | `/admin` |
| Tela adicional de sondagem | `/professor/sondagem`, `/aluno/sondagem` |

## Projeto TypeScript

`index.html` carrega `src/componenting-demo-lab.ts`, o único ponto de montagem. Seu `function* programGenerator()` define modo e sequência e passa o modo ao `program()`, que instancia internamente as configurações, regras de domínio e gateways; no demo, usa componentes de página, specs e dados iniciais declarados em `src/components.ts`; `src/componenting-demo-lab.ts` mantém `ComponentingDemoLab`, `DemoDataEditor`, o estado interativo e injeta a página completa em `program()`. Os iteradores stateful do laboratório são criados nos construtores. Rotas e política de domínio ficam internas a `program.ts`. `?presentation=application` reserva `program()` para montar a plataforma inteira com seus eventos. `?mode=worker` seleciona o gateway Workers na plataforma. `src/main.ts` apenas reexporta a instância do `componenting-demo-lab.ts`.

No laboratório, `ComponentingDemoLab`, `DemoDataEditor`, as nove páginas de demonstração e cada `<lumira-page-part>` são `HTMLElement`s stateful com iteradores criados em seus `constructor`s. `componenting-demo-lab.ts` envia a fixture e `ComponentMockSituation` (tela, papel, região e estado visual) para a página selecionada; no modo de fluxo contínuo, reúne as telas em sequência e mantém pontos de rolagem entre elas. Funções puras geram o markup interno. `add` e `mountParts` compõem HTML e elementos concretos no DOM, conforme o padrão de `cognoscere/application/memory-studio/frontend/src/main.ts`.

## Navegação e interações da demonstração

No fluxo contínuo, navegação lateral, abas de perfil e comunidade, menus de criação e ações rápidas selecionam o ponto correspondente em qualquer tela. A busca procura texto nas partes montadas e Enter leva à primeira correspondência. A agenda permite alternar mês, semana e lista, avançar datas, cadastrar eventos locais e ler notificações. Os formulários de perfil, stories, atividade, matrícula, quests, questões, publicações e revisão mantêm suas interações na demonstração local; não enviam dados a um serviço de produção.

O frontend usa Vite para desenvolvimento e build. `npm run check` executa o compilador TypeScript em modo estrito e os testes. `src/componenting-demo-lab.ts` concentra interação e montagem imperativa do laboratório; `src/components.ts` contém as páginas, suas partes, specs, fixtures e componentes da plataforma.

Os componentes expõem posições, navegação e operações. **Não constituem uma implementação final de cada critério de aceite.**
