# Lumira program contract

## Ownership

- `src/components.ts` owns page parts, form controls, chat transcript state, pending indicators, and typed bubbling events.
- `src/program.ts` owns service orchestration. It validates project-chat events, calls the desktop bridge, and returns status or response events to the emitting page part.
- `src/componenting-demo-lab.ts` owns the single demo page generator, selection state, and access gate (Router API in Electron, PTA on GitHub Pages).
- `electron/main.cjs` owns `.env`, endpoint validation, Router API gate validation, in-memory session authentication, and Cognoscere HTTP calls. `electron/preload.cjs` exposes four narrow IPC methods.
- Static GitHub Pages runs without Electron IPC and cannot reach private local configuration. It shows the explicit desktop-only chat error instead of fabricating an AI response.

## Project conversation flow

1. Opening the project builder emits `lumira-project-assistant-status-request` with `{ partId }`.
2. `program()` checks the desktop bridge and emits `lumira-project-assistant-status` with safe status fields only.
3. Submitting the chat emits `lumira-project-assistant-request` with request id, part id, prompt, current project form, selected competencies, milestones, and recent successful turns.
4. Electron main validates the request and sends the conversation to Forge `POST /v1/chat/completions`, using the configured Lumira speciality and memory unit. After the access gate verifies Router API against `/health`, the main process adds `X-Port-Router-Key` from in-memory session state. It returns only the assistant text.
5. `program()` sends `lumira-project-assistant-result` to the originating part. Pending state ends on success and failure; returned text never edits or saves the project form automatically.

The request uses `mode: document_update` to keep Forge in its text-reflection path and avoid creating OKF operations for a project-planning chat. The connected Memory unit is `lumira-cognoscere-monitor` by default.

## Credentials and endpoints

- Electron reads `COGNOSCERE_BASE_URL`, `COGNOSCERE_SLUG`, and `COGNOSCERE_UNIT_ID` from `.env`. The Windows release template points to the active ngrok route `https://ateliotic-jann-paragonless.ngrok-free.dev/19195`; remote endpoints require HTTPS.
- The Electron gate accepts the Router API key only after the main process validates it against `/health`. The key stays in main-process memory for the run and is sent only in the `X-Port-Router-Key` header for authenticated requests; it is never written to disk or returned to the renderer.
- The GitHub Pages presentation retains its static PTA gate. Electron does not use the PTA value for access.
- Renderer receives endpoint/status text and never receives the Router API key back from main; it sends the user's password-field input to IPC only for verification. Context isolation, Node integration off, and renderer sandbox stay enabled.
- `.env.example` documents local configuration. `.env` and `.env.*` are excluded from Git. GitHub Pages cannot read this file and keeps its legacy static presentation gate; it has no Cognoscere bridge.

## Lifecycle and limits

`npm run desktop:dev` starts one local Vite server and one Electron window. `npm run desktop` builds the static renderer and opens it in Electron. Electron does not start or manage Cognoscere systemd services; Forge, Metis, and MiniCPM must already be available. The demo project form remains browser-local and is not persisted to Cognoscere.

`npm run dist:win` typechecks, builds the renderer, and creates a per-user NSIS installer for Windows x64 under `release/`. The installer packages the renderer and Electron entrypoints; `.env.example` is copied to Electron's user data on first launch, while `.env` and Router API keys are never included. Set only endpoint, slug, unit, and timeout in the user-data `.env`; enter Router API key in the app gate.

## Verificação desta implementação

- Percurso Electron real anterior: uma chave PTA temporária liberou a tela; o builder docente consultou status e mostrou Forge online; uma solicitação contextual sobre desperdício de água chegou ao Cognoscere local e a resposta do Metis apareceu no chat após cerca de 60 s. Essa tela foi substituída nesta revisão pelo acesso via Router API.
- Rota ngrok/port-router real: `GET /19195/health` respondeu HTTP 200 com `X-Port-Router-Key` e HTTP 401 sem a chave.
- `.env` local está ignorado pelo Git e com modo `0600`; Vite devolve HTTP 403 ao tentar servi-lo. O bundle estático não contém o cabeçalho Router.
- `npm run typecheck`, `npx vite build`, `node --check` nos arquivos Electron e `git diff --check` passaram. A suíte de testes não foi executada.
- Verificação da integração: o endpoint ngrok foi chamado com e sem `X-Port-Router-Key`; a chamada sem chave recebeu HTTP 401 e a chamada autenticada ao chat escolar respondeu HTTP 200 com texto do Metis. Este build será percorrido pela entrada Router API e pelo chat após a reconstrução do instalador.
