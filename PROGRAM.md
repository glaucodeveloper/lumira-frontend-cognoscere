# Lumira program contract

## Ownership

- `src/components.ts` owns page parts, expandable project publications, the project authoring stepper and review/confirmation state, chat transcript and reflection state, safe Markdown rendering, sample dashboards, and typed bubbling events.
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

## Subject foundation authoring

The `pedagogy-context` part can open an inline **Criar matéria** flow. Saving requires a name, a description of the subject's nature, the understanding it should build, the learning approach, relevant aspects and at least one skill. The skill input filters a suggestion catalog, supports keyboard selection, accepts additional free-form names without a fixed item limit and shows a floating tooltip for the active option. After a short input pause or when an option becomes active, the tooltip asks the local Cognoscere Forge to have Metis explain its understanding of that skill. Responses are tied to request IDs so an older response cannot replace the tooltip for a newer option. If Forge is unavailable, the panel says so and marks any catalog copy as a demonstrative reference.

The saved subject foundation and skills live in that page part's state iterator for the current demo session. The four descriptions are collected as structured context for later pedagogy work; this creation flow does not yet send the whole foundation to an AI service or persist the subject beyond the session. The tooltip request sends only the currently active skill name.

The component emits `lumira-subject-skill-understanding-request` with `{ requestId, partId: 'pedagogy-context', skillName }`. `src/program.ts` validates the originating part and requests a short natural-language explanation from local Forge using Metis-4B, then returns `lumira-subject-skill-understanding-result` with the same request ID. The component ignores responses for a different active skill or an obsolete request.

## Activity editor

The `pedagogy-activity-builder` part opens as a step editor. Step one stores the activity title and the overall understanding it should develop. Each question has a separate step with an internal title, context and data, student-facing prompt, and teacher-only description of the understanding that question should reveal. The final step presents the full set, including each question's context, prompt, and expected understanding, then asks the teacher to confirm the review. Questions can be added without a fixed count; removal is available for the current question while at least one remains.

Step number, question IDs, field values, review checkbox, approval state, and feedback belong to the page part's state iterator. Moving forward validates the current step; final confirmation validates every field, and edits after confirmation invalidate it. The fixture seeds one complete sample question for demonstration. These values last only for the current page session: this editor does not call Forge, save an activity, or publish it. Only TypeScript and production compilation have been checked for this change; the interaction flow has not been manually exercised in a browser.

## Project narrative, authorship, and AI review

The project part explains how a learning idea becomes collaborative work. Existing projects are expandable publication cards: opening one reveals authorship, audience, goal, justification, learning evidence, competencies, milestones, and its Social draft or private state. Teacher and student project lists use this same narrative structure.

Creating a project proceeds through four validated steps:

1. **Authorship and context:** project name, group authorship, and audience.
2. **Justification:** intended change or question, plus why it matters.
3. **Learning and assessment:** related competencies, what the group will produce or demonstrate, and how it will develop the idea.
4. **Plan:** calendar milestones and an optional Social draft.

The final step sends the whole current proposal to local Forge as a `review` conversation. Metis returns a natural-language Markdown review; the local Forge system model checks the response. The review discusses coherence, evidence, gaps, risks, and concrete adjustments, then asks whether the group confirms or wants to revise. The response appears above the stepper and focus returns to step one. A visible **Confirmar projeto** action is available only after a successful review. It creates a local draft only after the person confirms.

Any edit after review marks that review stale, disables confirmation, and asks for a new reading. If a user edits while the review is pending, its pending response is discarded so a late result cannot approve an older version. Review errors offer retry. The assistant never changes fields, saves, creates, or publishes a project by itself. The demo does not persist projects beyond the current page state and does not publish to the Social.

The project page narrative describes these responsibilities outside the component. The publication card and stepper remain focused on their own content, while the chat stays beside the authoring flow as a contextual aid.

## Local service boundary and web publication

- The browser calls only loopback Forge at `127.0.0.1:19195`. Forge calls local Metis and MiniCPM. The Lumira web client has no NVIDIA provider path and does not use ngrok or a remote model endpoint.
- Forge's CORS allowlist includes `https://glaucodeveloper.github.io` and the local Vite origins `http://127.0.0.1:5173` and `http://localhost:5173`. Add another exact web origin through `COGNOSCERE_FORGE_ALLOWED_ORIGINS`; do not use `*`.
- The published bundle contains no model, Router API, or service token. A browser must reach a running local Forge and the browser must permit that local connection. A public GitHub Pages origin cannot reach the user's computer when the local service is stopped.
- The PTA gate is a presentation barrier only. GitHub Pages and its JavaScript are public, so the gate is not server authentication.

## Future Administration of AI page

The project-creation controls belong in a future **Administração da IA** page; that page is not implemented yet. Its contract must let an authorized institution configure role-specific project-creation instructions, the reflection policy and debounce behavior, the fields sent as context, the Markdown response format, the local speciality/unit binding, and whether project creation is enabled for each role. It must provide a prompt preview, version history, publish/rollback, and an audit record. Model and service credentials stay in the local Cognoscere service and never enter the browser configuration or published bundle.

## Student profile progress dashboard

The student profile's Competencies part starts with the student's public interests. `Ver todos` switches that part to an in-place progress dashboard, and `Competências` returns to the public list. Its counts, week chart, and step bars are hard-coded demonstration data in `src/components.ts`; labels state that they are samples, not a live student record, grade, or proficiency assessment. The open/closed state belongs to the part's state iterator and is not persisted.

## Activity posts and opinion circles

- Teacher activity posts and community feed posts must include an activity ID, activity title, and the related criterion. The community composer requires the user to choose an activity; its displayed post repeats that activity and criterion so the social feed stays tied to actual learning work.
- Each page-part description is a two-paragraph narrative in `platformResponsibilities`: the first explains the part's purpose, and the second places it in the platform's learning and social journey. The same narrative appears above its demonstrated component and in the selected-part inspector; paragraph breaks remain separate in the UI.
- The opinion-circle demo switches between named groups, places their avatars around a shared table, and shows the discussion as a scrollable sequence of message cards in the center. Sending a message emits `lumira-opinion-message-send` from the `community-feed` part to `src/program.ts`. The program validates the source, circle, role, and 500-character limit; appends an ordered `opinion-circle.message` event to the in-memory stream; then sends `lumira-opinion-message-delivered` back to the part. Invalid messages return `lumira-opinion-message-rejected`. The component projects delivered events into its state iterator and shows the sequence number beside the time.
- Opinion-message streams are local to the running page session and clear on reload. There is no WebSocket, cross-user delivery, durable storage, or Forge request in this prototype. Community posts remain local to their page-part state iterator.
- The part presentation describes the platform's moderation responsibility: review a student's post for respectful expression, privacy, and contribution to the activity or academic discussion, while preserving the student's authorship. This prototype displays that policy but does not implement a real moderation queue, automated classifier, or approval service. Its local posts and messages are clearly labeled as demonstration content.
- Private assessment answers, student-specific feedback, and enrollment data do not enter the public feed or opinion circles.
- In expanded view, the continuous page flow gives each component session more vertical space. Scroll snapping aligns each session heading with the top edge of the scroll area immediately below the presentation toolbar; scrollpoint selection follows that heading.

## Profile agenda and shareable events

- `teacher-agenda` and `student-agenda` use the same internal `ProfileAgendaItem` shape: stable ID, title, context, date, time, and an optional platform element ID. Each profile page renders its own agenda part and fixture data.
- The agenda's **Visibilidade padrão no perfil pessoal** control starts at **Somente eu**. Choosing **Minha escola** or **Comunidade Lumira** enables the per-item **Compartilhar como postagem** action. Sharing creates a `ProfileAgendaPost` in that agenda part's state and renders its post preview with the selected audience.
- **＋ Adicionar elemento da plataforma** opens links to competency questions already in the history or challenges/questions associated with social events. The selected reference is shown on the event and carried into the post preview.
- Agenda items and post previews are local to their page-part state. The demo does not persist them after reload, publish to a real feed, sync an external calendar, or expose question responses and individual feedback. Those remain in the reserved learning space.
- The agenda responsibility text describes how teachers and students can use this format without treating a social post as learning evidence or turning a public profile into an assessment record.

## Platform references in text fields

- Text, search, URL, and telephone inputs plus text areas inside a demonstrated page part accept platform references. Typing `@` opens a filtered list of platform namespaces; selecting an entry inserts its stable path segment into the current field. Password, email, and structured-value controls do not accept references.
- Type `>` after a selected entry with children to open that entry's next level. For example, `@competencias > questionarios > ciencias-da-natureza > ef08ci03 > questao-biblioteca > texto` identifies the text of a specific competency question. `ArrowUp`, `ArrowDown`, `Enter`, and `Escape` operate the list without leaving the field.
- Available roots cover student and teacher profiles, personal and community calendars, social events, competencies and questionnaires, activity posts, and projects. Nested records expose fields such as title, date, event description, question text, prompt, context, and criteria.
- `@perfis > alunos` lists the mock students Caio Almeida and Lia Santos; `@perfis > professores` lists the mock teachers Ana Beatriz Silva, Helena Martins, and Mariana Oliveira. Each profile exposes its matching `@identificador`, role, school, class, biography, competencies, and sample agenda items as nested paths. These fixtures support authoring and demonstration only; they are not real accounts or live platform records.
- The inserted value is a readable state path in the field content. The demo autocomplete does not dereference it into live data, grant access, publish content, or persist a linked record; those actions require platform services and authorization rules.
- The dropdown is attached to the active page part's field, follows it while scrolling, closes on escape/outside click/field change, and removes its document listeners when closed or when its page part is detached.

## Build and manual review

`npm run dev` serves the web application. `npm run typecheck` checks TypeScript, and `npx vite build` creates the static GitHub Pages bundle. The workflow `.github/workflows/pages.yml` publishes `dist/` on pushes to `main` and manual dispatches.
