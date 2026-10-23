# Lumira program contract

## Ownership

- `src/components.ts` owns page parts, expandable project publications, the project authoring stepper and review/confirmation state, the questionnaire delivery and monitor receipt state, chat transcript and project reflection state, safe Markdown rendering, sample dashboards, and typed bubbling events.
- `src/program.ts` owns Cognoscere service orchestration and the active service credentials. All browser requests use the fixed Ngrok route to the local Forge and return results to the originating page part.
- `src/componenting-demo-lab.ts` owns the single demo page generator, selection state, and the gate for the Cognoscere chat PAT and local Port Router key.
- GitHub Pages hosts the web application. There is no Electron process, remote model provider, or secret embedded in the published bundle.

## Presentation themes

The demo toolbar offers seven selectable visual themes. **Carbon Light** uses neutral surfaces, blue actions, and precise rules. **Dracula Carbon** uses aubergine-black layers, alternating corner cuts, orchid outlines, violet/pink/cyan/amber accents, serif display headings, sans-serif reading text, and monospace labels. **Midnight Tokyo** uses deep indigo with electric-blue contours. **Porcelain Editorial** uses warm paper, oxblood, brass details, hairline frames, and literary serifs. **Botanical Fieldnotes** uses sage, forest green, clay, organic corner shapes, and humanist serif display. **Solar Pop** uses butter yellow, cobalt, coral, hard square edges, and heavy offset outlines. **Terminal Moss** uses forest-black, acid green, amber status color, double-line frames, and monospaced headings. Page data and component behavior stay shared.

Theme selection belongs to the `componenting-demo-lab` state iterator. It is saved in browser-local storage, reflected in the `theme` query parameter, and included in copied presentation links. A valid `theme` URL parameter takes precedence over the saved local preference; missing or unknown values fall back to the saved theme or **Carbon Light**.

### Theme surface map

| Theme | Palette and surface | Contours and corners | Typography |
| --- | --- | --- | --- |
| Carbon Light | Neutral paper, white, blue actions | Crisp gray rules, small rounded controls | Sans-serif interface and display |
| Dracula Carbon | Plum-black, graphite, violet, pink, cyan, amber | Alternating clipped corners, orchid keylines, pill evidence tags | Serif display, sans reading, monospace metadata |
| Midnight Tokyo | Ink indigo, electric blue, cyan, lilac | Precise inset frames, compact rounded panels | Geometric sans display, monospace metadata |
| Porcelain Editorial | Warm ivory, ink, oxblood, brass | Hairline rules, editorial frames with one cut corner | Baskerville-style serif display, quiet sans reading |
| Botanical Fieldnotes | Mist, sage, forest, clay, harvest gold | Organic asymmetric curves, dotted botanical dividers | Palatino-style serif display, humanist sans reading |
| Solar Pop | Butter yellow, paper white, cobalt, coral, violet | Square corners, heavy outlines, hard offset shadows | Heavy grotesk display, compact sans reading, mono labels |
| Terminal Moss | Forest-black, deep green, acid lime, amber | Square double-line frames and compact rectangular controls | Monospaced display and metadata, sans reading |

The map applies to the lab chrome, continuous page canvas, page responsibility panel, page-level evidence badge, `<lumira-page-part>` custom-element roots and their descendants, nested panels, cards, forms, tabs, buttons, badges, and status overlays. Each theme changes contour rhythm and type alongside its palette; semantic accents indicate selection, focus, status, and supporting emphasis rather than tinting every surface alike. Dark themes replace fixed light gradients on mapped surfaces instead of only changing `background-color`, which leaves the gradient visible. The right inspector and prototype fields follow the same map. Question reference panels, response directives, question markers, topic ranks, area markers, and calendar event chips have explicit mappings; semantic event hues remain distinct over the preserved calendar photograph. Workspace search fields, due-date chips, review states, and opinion-circle controls also map to their structural or semantic roles. Profile photography and story artwork remain unchanged. The seven theme options change those surface roles together; page data and component behavior stay shared.

## Project conversation and reflection

1. Opening the project builder requests `GET /health` through the fixed Ngrok route to local Forge and shows Forge/Metis/MiniCPM status.
2. Typing, changing the audience, marking competencies or social sharing, and adding/removing milestones schedule a 900 ms debounced reflection. The latest request contains the current form values, selected competencies, the social-draft choice, calendar milestones, and recent manual conversation turns.
3. The chat keeps one replaceable `REFLEXÃO DO PROJETO · METIS LOCAL` message. Older reflection requests cannot overwrite the latest state. Clearing the entire form removes its stale reflection.
4. A manual chat turn sends the same current project context and recent successful manual turns. Reflection messages are excluded from conversation history; form edits never add fake user messages.
5. `src/program.ts` posts to local Forge `/v1/chat/completions` through the fixed Ngrok route, using the Lumira speciality and `lumira-cognoscere-monitor` unit. Metis returns text; Forge reviews locally with MiniCPM. The project chat uses `document_update`, so it does not create OKF operations or save the project.
6. Pending state ends on success or failure. Returned text never edits or saves the form automatically. The renderer escapes model content and supports a limited safe Markdown subset (headings, paragraphs, lists, emphasis, inline/fenced code, blockquotes, and HTTP(S)/`mailto:` links); raw HTML and image markup do not execute or load.

The project form remains a browser-local draft. Saving in this prototype adds it only to the current page state; the chat response is advice and reflection, not a persisted project record.

## Subject foundation authoring

The `pedagogy-context` part opens **Criar matéria** as a spaced authoring session. Its form has four vertically ordered sections: **Natureza** defines the field and its phenomena; **Entendimento** describes the relations and evidence that demonstrate learning; **Abordagem** records the practices used to investigate and produce knowledge; **Aspectos e contexto** captures representations, limits and relevant perspectives. The name and an open-ended list of skills complete the foundation. Each section states its responsibility before the teacher writes.

A sticky side panel presents the model's **Correspondência de entendimento**. Opening the authoring session asks Metis to read the initial draft, including an empty draft. Changes to the name, any of the four descriptions, or the skill list schedule a new reflection after an 820 ms pause. While waiting, the previous response is explicitly marked as outdated; request revisions and IDs prevent an older response from replacing a newer one. The teacher can also send a contextual message or correction. That turn includes the latest foundation and recent successful chat turns. The response uses the safe Markdown renderer already used by project conversation. A retry control requests a fresh reflection.

The component emits `lumira-subject-foundation-assistant-request` with `{ requestId, partId: 'pedagogy-context', kind, prompt, context, conversation }`. `src/program.ts` validates the originating part and payload, then posts to local Forge `/v1/chat/completions` through the fixed Ngrok route with model `Metis-4B`, Lumira speciality, and `document_update` mode. Forge returns `lumira-subject-foundation-assistant-result` with the same request ID and either text or an error. The system prompt tells Metis to distinguish the four responsibilities, state what it understood, identify gaps without filling them in, and ask whether its reading corresponds to the teacher's intention. The same contextual request backs manual chat.

All Metis communication in `src/program.ts` uses the shared pedagogical writing contract: contextual Portuguese, an explicit connection between evidence and learning, and developed paragraphs separated by blank lines. The reasoning progresses from what the current data supports to its teaching significance, then to a concrete gap, limit, question, or next step. The model distinguishes recorded facts from interpretation, avoids generic filler and unnecessary lists, and does not expose internal reasoning. Subject-foundation reflections require exactly three paragraphs of two or three sentences each, including when the form is empty; project conversation, questionnaire feedback, and skill interpretation adapt the shared structure to their own evidence and limits. If a first Metis answer misses its requested paragraph count, the program asks Metis once to develop it without adding facts. If that still returns a single block, the program separates existing sentences only; it does not claim that formatting alone adds analysis.

Metis only reflects and converses in natural language. Its response never edits or saves the form. The teacher must explicitly save the foundation; this prototype keeps the saved foundation in the page part's state iterator for the current demo session. The skill autocomplete remains separate: it requests an explanation for the currently active suggestion, and its results are also bound to request IDs.

## Competency definition, performance, and progression

The `pedagogy-competency` part is a complete three-stage competency page. Its stepper switches among **Definição**, **Desempenho**, and **Progressão** inside the part. The selected stage and criterion readings belong to the `DemoPagePart` state iterator; tab buttons also support arrow-key, Home, and End navigation.

**Definição** joins the BNCC references, the action to observe, the intended understanding, the application context, and the criteria that the teacher selects for the proposal. **Desempenho** presents one clearly fictional answer sample and lets the teacher label each criterion as evidenced, partial, or not yet evidenced. The count summary updates from those selections; it is not a score, student profile, or global competence level. **Progressão** suggests contexts that vary conditions and transfer the reasoning, then links to activity creation, evidence review, and material authoring in the same teaching workspace.

The left scrollpoint navigation continues to open this page part. Its marker reads `BNCC` instead of exposing the component's global list ordinal as if it were a learner level. Stage switching, evidence readings, and criterion selection are local demo state; they do not call Forge, persist a record, grade a student, or advance a curriculum automatically.

## Activity editor

The `pedagogy-activity-builder` part opens as a step editor. Step one stores the activity title and the overall understanding it should develop. Each question has a separate step with an internal title, context and data, student-facing prompt, and teacher-only description of the understanding that question should reveal. The final step presents the full set, including each question's context, prompt, and expected understanding, then asks the teacher to confirm the review. Questions can be added without a fixed count; removal is available for the current question while at least one remains.

Step number, question IDs, field values, review checkbox, approval state, and feedback belong to the page part's state iterator. Moving forward validates the current step; final confirmation validates every field, and edits after confirmation invalidate it. The fixture seeds one complete sample question for demonstration. These values last only for the current page session: this editor does not call Forge, save an activity, or publish it. Only TypeScript and production compilation have been checked for this change; the interaction flow has not been manually exercised in a browser.

## Enrollment and competency leveling

The `leveling-enrollment` page contains one `leveling-assessment` part. Its stepper moves through registration, pedagogical thesis, competency and BNCC skills, learning intents, generated questions, and a result summary. The thesis follows the `dossie-tese` skill: delimit the object, state the central claim, develop evidence, confront a strong counterpoint, name limits, and define a verifiable conclusion.

The competency form accepts a title, integrated description, and two to twelve `EF` skill codes with a working focus for each. The teacher selects one or more learning intents and a question count of 3, 5, or 8. The generate action sends the registration context, thesis, competency, skills, and intents to the fixed Ngrok route for the local Forge service, `https://ateliotic-jann-paragonless.ngrok-free.dev/19195/v1/chat/completions`. It uses the `lumira` speciality, `lumira-cognoscere-monitor` unit, Metis-4B, and `document_update` mode. The response must contain exactly the requested count of questions, cover every configured skill, use only selected intents, and provide four options plus a valid reference answer for each question. Invalid or incomplete output is rejected before the questionnaire is shown.

At the authentication gate, the user enters exactly two service credentials: the Cognoscere chat PAT and the local Port Router key. The program sends both to `POST /auth/validate`; Forge checks the Bearer PAT against its configured `COGNOSCERE_API_TOKEN`, while Port Router validates `X-Port-Router-Key`. Successful validation keeps both keys only in the `program()` instance's memory. Reloading the page requires re-entry. All Forge requests use both headers; the leveling form has no separate key input. Keys never enter browser storage, prompts, source, or the published bundle. Forge CORS allows `Authorization` and `X-Port-Router-Key`; Port Router must allow port `19195`.

After generation, answering each question records the response and advances to the next unanswered step. Learners can revisit steps. The summary displays a demonstration score using 20 points per expected answer. The consulted repository does not define an age-grade coefficient or institutional scoring policy, so age and grade only contextualize situations; the score is not a school grade, mastery level, placement decision, or progression rule. Registration and answers remain in the page-part state iterator for the current browser session. The flow does not persist enrollment or associate the student with a school or class.

## Student answer submission and monitor feedback

The `student-activity` page has one `learner-activity-question` part. Each question is a complete unit with reference text, a formal prompt, and an answer control selected by its `responseDirective`: `open` renders a text area, `closed` renders one-choice selection, and `association` renders a select for every item to match. The directive caption appears before the control and explains the expected response shape.

`initialComponentData['student-activity'].questions` seeds three examples about energy use: an open explanation, a closed comparison, and an association between each appliance use and its calculated consumption. The selector changes the active question without losing its local fields; the status marks each question as open, draft, or sent. Saving a draft and sending validate the active format, store the response in the page-part state iterator, and keep it private in this demo. These fixtures demonstrate a directive-selected UI; they are not generated by a live AI request, scored, sent to the monitor, or persisted after the session.

The `competency-questions` page keeps five individual answer forms in `competency-question-response`. Each answer is registered separately. After all five are registered, the student explicitly finalizes the questionnaire; that action sends a typed in-page receipt to the separate `competency-monitor-feedback` component. Editing a registered answer invalidates its submitted state and clears a previously displayed receipt until the student registers it again and resubmits the complete set.

Finalization emits `lumira-questionnaire-monitor-request` from the active `competency-question-response` part. `src/program.ts` validates the origin and five nonempty answers, then posts the competency and answer contexts to Forge `/v1/chat/completions` through the fixed tunnel using Metis-4B, the Lumira speciality, and the `lumira-cognoscere-monitor` unit. Forge returns text feedback; the matching `requestId` routes it back to `competency-monitor-feedback`. That part shows a spinner while pending, the monitor response on success, or the service error with the finalization control available for retry.

Each completed delivery is assigned the demonstrative attempt number `01`. The answer set and feedback remain in the page-part state iterators for the current browser session. Persistent attempt history, reopening, and creating later attempts remain future work; the monitor must not calculate a grade or declare mastery. This flow requires local Cognoscere Forge, the active Ngrok tunnel, both service keys, and an authorized web origin.

## Project narrative, authorship, and AI review

The project part explains how a learning idea becomes collaborative work. Existing projects are expandable publication cards: opening one reveals authorship, audience, goal, justification, learning evidence, competencies, milestones, and its Social draft or private state. Teacher and student project lists use this same narrative structure.

Creating a project proceeds through four validated steps:

1. **Authorship and context:** project name, group authorship, and audience.
2. **Justification:** intended change or question, plus why it matters.
3. **Learning and assessment:** related competencies, what the group will produce or demonstrate, and how it will develop the idea.
4. **Plan:** calendar milestones and an optional Social draft.

The final step sends the whole current proposal to Forge over the fixed tunnel as a `review` conversation. Metis returns a natural-language Markdown review; the local Forge system model checks the response. The review discusses coherence, evidence, gaps, risks, and concrete adjustments, then asks whether the group confirms or wants to revise. The response appears above the stepper and focus returns to step one. A visible **Confirmar projeto** action is available only after a successful review. It creates a local draft only after the person confirms.

Any edit after review marks that review stale, disables confirmation, and asks for a new reading. If a user edits while the review is pending, its pending response is discarded so a late result cannot approve an older version. Review errors offer retry. The assistant never changes fields, saves, creates, or publishes a project by itself. The demo does not persist projects beyond the current page state and does not publish to the Social.

The project page narrative describes these responsibilities outside the component. The publication card and stepper remain focused on their own content, while the chat stays beside the authoring flow as a contextual aid.

## Local service boundary and web publication

- Every browser Forge flow uses the fixed Ngrok route `https://ateliotic-jann-paragonless.ngrok-free.dev/19195` to the local service. Forge uses its configured PAT for Metis and runs MiniCPM locally. The Lumira web client has no NVIDIA provider path.
- The access gate emits `lumira-forge-authentication-request` with `{ requestId, pat, routerKey }`. `src/program.ts` accepts it only from the gate, sends `POST /auth/validate`, then emits `lumira-forge-authentication-result` with `{ requestId, error? }`. Successful credentials stay in the single program instance's memory and are cleared by `destroy()` or page reload. They are never persisted.
- Forge's CORS allowlist includes `https://glaucodeveloper.github.io` and the local Vite origins `http://127.0.0.1:5173` and `http://localhost:5173`. It permits `Authorization` and `X-Port-Router-Key`. Add another exact web origin through `COGNOSCERE_FORGE_ALLOWED_ORIGINS`; do not use `*`.
- The published bundle contains no model or credential value. Users enter PAT and Router key on the authentication screen; they remain in program memory until reload. Forge validates the PAT against its local configuration, and Port Router validates its own key. Both are sent as request headers over HTTPS.
Verification for the service authentication change: `npm run typecheck`, `npx vite build`, and the Go Forge build pass. Local `POST /auth/validate` without a PAT returns 401; the deployed tunnel CORS preflight returns 204 and allows `Authorization` and `X-Port-Router-Key`. A successful login using user-entered keys and a model conversation were not exercised in a browser.

## Future Administration of AI page

The project-creation controls belong in a future **Administração da IA** page; that page is not implemented yet. Its contract must let an authorized institution configure role-specific project-creation instructions, the reflection policy and debounce behavior, the fields sent as context, the Markdown response format, the local speciality/unit binding, and whether project creation is enabled for each role. It must provide a prompt preview, version history, publish/rollback, and an audit record. Model and service credentials stay in the local Cognoscere service and never enter the browser configuration or published bundle.

## Student profile progress dashboard

The student profile's Competencies part starts with the student's public interests. `Ver todos` switches that part to an in-place progress dashboard, and `Competências` returns to the public list. Its counts, week chart, and step bars are hard-coded demonstration data in `src/components.ts`; labels state that they are samples, not a live student record, grade, or proficiency assessment. The open/closed state belongs to the part's state iterator and is not persisted.

## Social competitions and traceable participation

The `quests` route presents quests as registered social competitions, not as curricular questions or skill badges. Each event fixture in `initialComponentData.quests` declares a stable ID, organizer, participant format, period, registration deadline, capacity, objective, rules, scoring criteria, linked competency context, and an ordered list of stages. A stage declares its ID, deadline label, instructions, and required deliverable. `renderQuestBoard` displays those fields before participation.

The student can register only while the event fixture says `Inscrições abertas`, its ISO `registrationDeadlineAt` has not passed, and it has capacity. Registration adds a `QuestParticipation` to the `quest-board` part's state iterator, creates a local registration ID and ISO timestamp, increments the visible participant count for that event, and records an `Inscrição confirmada` history event. Filters distinguish open events, the student's registrations, and completed participation.

Each registration permits one submission per stage, in the declared order. The form stores the participant's text as a `QuestStageSubmission` with its own ISO timestamp. The history records every submitted stage and its text; only the next incomplete stage can be sent. After the final stage, the participation status becomes `completed` and the audit trail records completion. The UI reports that event scoring is still awaiting the organizer; it does not calculate points, invent a ranking, change a competency level, or send this material into private assessment.

These event definitions and participation records are demonstration fixtures and browser-local state. They reset when the page session ends. This prototype has no organizer-facing event creation form, server persistence, team roster/consent flow, cross-user submissions, score adjudication, or published ranking. TypeScript and production build checks do not establish those absent server workflows.

## Activity posts and opinion circles

- Teacher activity posts and community feed posts must include an activity ID, activity title, and the related criterion. The community composer requires the user to choose an activity; its displayed post repeats that activity and criterion so the social feed stays tied to actual learning work.
- The general Metis profile in `src/program.ts` applies to every model flow and includes presentation writing: explain a part's purpose, participants' responsibility, and place in the learning journey; connect it to other stages when the supplied context supports that link; avoid generic promotion, invented features, and control inventories.
- Each page-part presentation is authored as a developed narrative in `platformResponsibilities`, following that same pedagogical voice. Its first paragraph explains the part's purpose; the following paragraph or paragraphs place it in the platform's learning and social journey. The same narrative appears above its demonstrated component and in the selected-part inspector; paragraph breaks remain separate in the UI. These are fixed platform copy, not text generated at runtime by Metis.
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

For the competency page, `npm run typecheck` and `npx vite build` passed on 2026-10-23. Manual browser verification used a temporary localhost key and exercised all three stages, evidence-status changes and live count updates, criterion selection and its progress summary, keyboard arrow navigation, and the three progression links to activity creation, evidence review, and material authoring. Returning through the left scrollpoint navigation preserved the selected stage and evidence reading. No automated test was added or run for this change. The production bundle emitted Vite's existing chunk-size advisory (502 kB JavaScript); build completed successfully. GitHub Pages deployment completed on 2026-10-23 after commits `af2a600` and `c2dd4b4`.
