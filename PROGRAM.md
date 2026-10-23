# Lumira program contract

## Ownership

- `src/components.ts` owns page parts, form controls, the project chat transcript and reflection state, safe Markdown rendering, the sample student progress dashboard, and typed bubbling events.
- `src/program.ts` owns the local Cognoscere client and service orchestration. It talks only to Forge at `http://127.0.0.1:19195` and returns status or assistant results to the originating page part.
- `src/componenting-demo-lab.ts` owns the single demo page generator, selection state, and the PTA presentation gate.
- GitHub Pages hosts the web application. There is no Electron process, remote model provider, or secret embedded in the published bundle.

## Project conversation and reflection

1. Opening the project builder requests `GET http://127.0.0.1:19195/health` from the browser and shows the local Forge/Metis/MiniCPM status.
2. Typing, changing the audience, marking competencies or social sharing, and adding/removing milestones schedule a 900 ms debounced reflection. The latest request contains the current form values, selected competencies, the social-draft choice, calendar milestones, and recent manual conversation turns.
3. The chat keeps one replaceable `REFLEXÃO DO PROJETO · METIS LOCAL` message. Older reflection requests cannot overwrite the latest state. Clearing the entire form removes its stale reflection.
4. A manual chat turn sends the same current project context and recent successful manual turns. Reflection messages are excluded from conversation history; form edits never add fake user messages.
5. `src/program.ts` posts to the local Forge `/v1/chat/completions` using the Lumira speciality and `lumira-cognoscere-monitor` unit. Metis returns text; Forge reviews locally with MiniCPM. The project chat uses `document_update`, so it does not create OKF operations or save the project.
6. Pending state ends on success or failure. Returned text never edits or saves the form automatically. The renderer escapes model content and supports a limited safe Markdown subset (headings, paragraphs, lists, emphasis, inline/fenced code, blockquotes, and HTTP(S)/`mailto:` links); raw HTML and image markup do not execute or load.

The project form remains a browser-local draft. Saving in this prototype adds it only to the current page state; the chat response is advice and reflection, not a persisted project record.

## Local service boundary and web publication

- The browser calls only loopback Forge at `127.0.0.1:19195`. Forge calls local Metis and MiniCPM. The Lumira web client has no NVIDIA provider path and does not use ngrok or a remote model endpoint.
- Forge's CORS allowlist includes `https://glaucodeveloper.github.io` and the local Vite origins `http://127.0.0.1:5173` and `http://localhost:5173`. Add another exact web origin through `COGNOSCERE_FORGE_ALLOWED_ORIGINS`; do not use `*`.
- The published bundle contains no model, Router API, or service token. A browser must reach a running local Forge and the browser must permit that local connection. A public GitHub Pages origin cannot reach the user's computer when the local service is stopped.
- The PTA gate is a presentation barrier only. GitHub Pages and its JavaScript are public, so the gate is not server authentication.

## Future Administration of AI page

The project-creation controls belong in a future **Administração da IA** page; that page is not implemented yet. Its contract must let an authorized institution configure role-specific project-creation instructions, the reflection policy and debounce behavior, the fields sent as context, the Markdown response format, the local speciality/unit binding, and whether project creation is enabled for each role. It must provide a prompt preview, version history, publish/rollback, and an audit record. Model and service credentials stay in the local Cognoscere service and never enter the browser configuration or published bundle.

## Student profile progress dashboard

The student profile's Competencies part starts with the student's public interests. `Ver todos` switches that part to an in-place progress dashboard, and `Competências` returns to the public list. Its counts, week chart, and step bars are hard-coded demonstration data in `src/components.ts`; labels state that they are samples, not a live student record, grade, or proficiency assessment. The open/closed state belongs to the part's state iterator and is not persisted.

## Build and manual review

`npm run dev` serves the web application. `npm run typecheck` checks TypeScript, and `npx vite build` creates the static GitHub Pages bundle. The workflow `.github/workflows/pages.yml` publishes `dist/` on pushes to `main` and manual dispatches.
