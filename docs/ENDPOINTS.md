# Contrato proposto — Cloudflare Workers

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
