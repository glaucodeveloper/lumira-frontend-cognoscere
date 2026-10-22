# Lumira program contract

## Ownership

- `src/components.ts` owns page parts, form controls, chat transcript state, pending indicators, and typed bubbling events.
- `src/program.ts` owns service orchestration. It validates project-chat events, calls the desktop bridge, and returns status or response events to the emitting page part.
- `src/componenting-demo-lab.ts` owns the single demo page generator, selection state, and PTA gate.
- `electron/main.cjs` owns `.env`, endpoint validation, Router API authentication, PTA verification, and Cognoscere HTTP calls. `electron/preload.cjs` exposes only three narrow IPC methods.
- Static GitHub Pages runs without Electron IPC and cannot reach private local configuration. It shows the explicit desktop-only chat error instead of fabricating an AI response.

## Project conversation flow

1. Opening the project builder emits `lumira-project-assistant-status-request` with `{ partId }`.
2. `program()` checks the desktop bridge and emits `lumira-project-assistant-status` with safe status fields only.
3. Submitting the chat emits `lumira-project-assistant-request` with request id, part id, prompt, current project form, selected competencies, milestones, and recent successful turns.
4. Electron main validates the request and sends the conversation to Forge `POST /v1/chat/completions`, using the configured Lumira speciality and memory unit. The main process adds `X-Port-Router-Key` when configured. It returns only the assistant text.
5. `program()` sends `lumira-project-assistant-result` to the originating part. Pending state ends on success and failure; returned text never edits or saves the project form automatically.

The request uses `mode: document_update` to keep Forge in its text-reflection path and avoid creating OKF operations for a project-planning chat. The connected Memory unit is `lumira-cognoscere-monitor` by default.

## Credentials and endpoints

- Electron reads `LUMIRA_PTA_KEY` from an ignored `.env`; the value stays in main process and is checked with a constant-time digest comparison.
- Electron reads `COGNOSCERE_BASE_URL`, `COGNOSCERE_SLUG`, and `COGNOSCERE_UNIT_ID` from `.env`. Default endpoint is `http://127.0.0.1:19195`; remote endpoints require HTTPS.
- A tunneled endpoint uses `X-Port-Router-Key`. `PORT_ROUTER_KEY` may be set in the ignored `.env`; otherwise Electron reads it from `PORT_ROUTER_ENV_FILE` (default `~/.config/port-router/router.env`).
- Renderer receives endpoint/status text, no secret values. Context isolation, Node integration off, and renderer sandbox stay enabled.
- `.env.example` documents local configuration. `.env` and `.env.*` are excluded from Git. GitHub Pages cannot read this file and keeps its legacy static presentation gate; it has no Cognoscere bridge.

## Lifecycle and limits

`npm run desktop:dev` starts one local Vite server and one Electron window. `npm run desktop` builds the static renderer and opens it in Electron. Electron does not start or manage Cognoscere systemd services; Forge, Metis, and MiniCPM must already be available. The demo project form remains browser-local and is not persisted to Cognoscere.

`npm run dist:win` typechecks, builds the renderer, and creates a per-user NSIS installer for Windows x64 under `release/`. The installer packages only the renderer and Electron entrypoints; `.env.example` is copied to Electron's user data on first launch, while `.env` is never included. Set `LUMIRA_PTA_KEY` in that user-data `.env` and restart the app.

## Verificação desta implementação

- Percurso Electron real: PTA temporária de execução liberou a tela; o builder docente consultou status e mostrou Forge online; uma solicitação contextual sobre desperdício de água chegou ao Cognoscere local e a resposta do Metis apareceu no chat após cerca de 60 s.
- Rota ngrok/port-router real: `GET /19195/health` respondeu HTTP 200 com `X-Port-Router-Key` e HTTP 401 sem a chave.
- `.env` local está ignorado pelo Git e com modo `0600`; Vite devolve HTTP 403 ao tentar servi-lo. O bundle estático não contém o cabeçalho Router.
- `npm run typecheck`, `npx vite build`, `node --check` nos arquivos Electron e `git diff --check` passaram. A suíte de testes não foi executada.
- Limite atual: `LUMIRA_PTA_KEY` está vazio no `.env` local. A conversa foi exercitada com uma PTA temporária passada ao processo; o valor PTA pessoal precisa ser colocado no `.env` para novos acessos. O fallback GitHub Pages não foi percorrido no navegador depois desta alteração.
