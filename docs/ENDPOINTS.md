# Endpoints do protótipo e contrato proposto para Cloudflare Workers

## Integração implementada: autenticação e Cognoscere Forge

O browser chama o serviço local pelo endereço fixo do túnel `https://ateliotic-jann-paragonless.ngrok-free.dev/19195`. O usuário informa exatamente duas credenciais na tela de autenticação: o PAT de chat do Cognoscere e a chave local do Port Router. A aplicação envia as chaves ao serviço somente por headers HTTPS; mantém ambas apenas na memória do `program()` até recarregar a página.

| Método | Rota | Uso |
|---|---|---|
| POST | `/auth/validate` | Validar PAT no Forge e confirmar passagem pelo Port Router antes de abrir a aplicação |
| GET | `/health` | Consultar estado do Forge, Metis e MiniCPM |
| POST | `/v1/chat/completions` | Conversas da aplicação e geração de questões de nivelamento |

O PAT é enviado como `Authorization: Bearer …`; Forge compara com `COGNOSCERE_API_TOKEN` configurado no serviço. A chave do router vai em `X-Port-Router-Key` e é validada pelo Port Router. Ambos os headers são exigidos em todas as chamadas do browser. PAT inválido recebe 401; ausência de PAT no Forge recebe 503. As chaves não entram em prompts, `localStorage`, `sessionStorage`, URL ou bundle.

O túnel deve encaminhar a porta `19195`; o router deve incluir essa porta em `PORT_ROUTER_ALLOWED_PORTS`. Forge deve aceitar a origem web e os headers `Authorization` e `X-Port-Router-Key` no preflight CORS. A geração usa `model: Metis-4B`, `slug: lumira`, `unit_id: lumira-cognoscere-monitor` e `mode: document_update`. O cliente valida quantidade, cobertura de habilidades, intuito selecionado e quatro alternativas antes de exibir o conjunto. A resposta e o estado da matrícula não são persistidos. A aplicação não permite trocar a URL do serviço.

Os seguintes endpoints são placeholders de integração em `workers-gateway.ts`. **Não são endpoints confirmados nem exigem o mesmo formato do Metis.**

| Método | Rota | Uso |
|---|---|---|
| GET | `/api/session/snapshot` | Sessão, papel e projeção de objetos autorizados |
| POST | `/api/auth/login` | Login / convite; em produção usar provedor de identidade |
| POST | `/api/auth/logout` | Encerrar sessão |
| PUT | `/api/teacher/contracts` | Criar revisões independentes de interpretação, geração e avaliação |
| POST | `/api/sondagens/plans` | Idade, série, currículo, política e situações de sondagem |
| POST | `/api/monitor/previews` | Solicitar geração assíncrona com contexto autorizado |
| POST | `/api/activities/publish` | Fixar versão aprovada e disponibilizar à turma |
| POST | `/api/submissions` | Enviar resposta pelo aluno (idempotência obrigatória) |
| POST | `/api/social/posts` | Criar post com visibilidade autorizada |
| PATCH | `/api/profile/social` | Atualizar apenas atributos públicos do perfil |

## Segurança necessária antes do deploy

1. Cookies HttpOnly + SameSite e proteção CSRF, vínculo instituição-turma-pessoa e autorização na API.
2. IDs opacos, logs sem resposta de estudante ou segredo de serviço, retenção por política da instituição.
3. Dados privados fora de repositório Git público e de qualquer histórico publicável.
4. GitHub somente para documentos editoriais/versionados; conflito resolvido por SHA/revisão.
5. Metis chamado somente pelo backend; validar schema, proveniência, contrato e ativação de memória efetiva.
6. Avaliação da IA não decide automaticamente progressão. Rankings são estritamente de eventos homologados.

## API `system` e ciclo do frontend

O frontend não conhece a topologia interna do servidor Metis. `workers-gateway.ts` traduz chamadas de `system` em HTTP; o Worker intermedeia os contratos para o modelo apropriado, com versionamento e registros auditáveis.
