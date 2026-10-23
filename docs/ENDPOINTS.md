# Endpoints do protótipo e contrato proposto para Cloudflare Workers

## Integração implementada: autenticação e Cognoscere Forge

O browser chama o serviço local pelo endereço fixo do túnel `https://ateliotic-jann-paragonless.ngrok-free.dev/19195`. A tela pede duas credenciais: um PAT GitHub com acesso ao metadado do segredo `ROUTER_KEY` no repositório configurado do Port Router e a chave local do Port Router. O Port Router valida o PAT na API do GitHub e emite uma sessão aleatória de oito horas. O PAT GitHub é descartado após a validação; o valor do segredo nunca é solicitado à API do GitHub nem lido por esse fluxo. O programa mantém a sessão e a chave local apenas em memória até recarregar a página.

| Método | Rota | Uso |
|---|---|---|
| POST | `/auth/validate` | Validar acesso ao segredo `ROUTER_KEY` do repositório configurado e emitir sessão da Lumira |
| GET | `/health` | Consultar estado do Forge, Metis e MiniCPM |
| POST | `/v1/chat/completions` | Conversas da aplicação e geração de questões de nivelamento |

No `POST /auth/validate`, o PAT GitHub segue em `Authorization: Bearer …` até o Port Router, que consulta `GET /repos/{owner}/{repo}/actions/secrets/{secret_name}`. Para PAT fine-grained, conceda **Secrets: read** apenas no repositório configurado; PAT classic exige escopo `repo` e acesso de colaborador. A API retorna metadados do segredo, nunca seu valor. A chave do Port Router vai em `X-Port-Router-Key` e é validada antes da consulta.

Após autenticar, o Port Router emite um token de sessão aleatório, mantido apenas na memória do processo e válido por oito horas. Nas chamadas da Lumira, o browser envia esse token em `Authorization` e a chave local em `X-Port-Router-Key`; o router troca o token de sessão pela credencial `COGNOSCERE_API_TOKEN` carregada do ambiente local antes de encaminhar ao Forge. O PAT GitHub não é enviado ao Forge nem a prompts. Nenhuma credencial é salva em `localStorage`, `sessionStorage`, URL, fonte ou bundle. O gate da aplicação não torna privado o GitHub Pages ou o repositório.

O túnel deve encaminhar a porta `19195`; o router deve incluí-la em `PORT_ROUTER_ALLOWED_PORTS`, carregar `PORT_ROUTER_GITHUB_REPO`, `PORT_ROUTER_GITHUB_SECRET_NAME` e a variável local `COGNOSCERE_API_TOKEN`. O router aceita a origem web e os headers `Authorization` e `X-Port-Router-Key` no preflight CORS. A geração usa `model: Metis-4B`, `slug: lumira`, `unit_id: lumira-cognoscere-monitor` e `mode: document_update`. O cliente valida quantidade, cobertura de habilidades, intuito selecionado e quatro alternativas antes de exibir o conjunto. A resposta e o estado da matrícula não são persistidos. A aplicação não permite trocar a URL do serviço.

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
