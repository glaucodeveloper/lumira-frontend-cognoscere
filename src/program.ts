/** Monólito interno dos programas: domínios, gateways e API operacional da plataforma. */
import { shell, landing, access, page, createHtmlIterator } from './components';
import type { AgeGradeContext, Answer, AppSnapshot, ClassRoom, CognoscereStatus, CommunityEvent, CommunityPost, Competency, Contracts, ForgeAuthenticationRequest, ForgeAuthenticationResult, Gateway, LevelingGeneratedQuestion, LevelingQuestionGenerationRequest, LevelingQuestionGenerationResult, LoginInput, LumiraSystem, Material, OpinionCircleActorRole, OpinionCircleMessageDelivery, OpinionCircleMessageEvent, OpinionCircleMessageRejection, OpinionCircleMessageSendRequest, Preview, ProjectAssistantRequest, QuestionnaireMonitorRequest, QuestionnaireMonitorResult, Role, SessionUser, SondagemPlan, SocialProfile, SubjectFoundationAssistantRequest, SubjectFoundationAssistantResult, SubjectSkillUnderstandingRequest, SubjectSkillUnderstandingResult } from './types';

/** Domain policy stays private to this program module. */
export interface ProgramRenderContext {
  route: string;
  session: SessionUser | null;
  snapshot: AppSnapshot | null;
}

export interface ProgramOptions {
  mount: HTMLElement;
  mode?: Gateway['mode'];
  baseUrl?: string;
  renderView?: (context: ProgramRenderContext) => string | HTMLElement;
  documentTitle?: string;
  bindEvents?: boolean;
}

export type ProgramFactory = (options: ProgramOptions) => LumiraSystem;

export function program({ mount, mode = 'demo', baseUrl = '/api', renderView, documentTitle, bindEvents = true }: ProgramOptions): LumiraSystem {
  const cognoscereLocal = Object.freeze({ slug: 'lumira', unitId: 'lumira-cognoscere-monitor' });
  const cognoscereForgeTunnel = 'https://ateliotic-jann-paragonless.ngrok-free.dev/19195';
  let forgeCredentials: { pat: string; routerKey: string } | null = null;
  const metisApplicationProfile = [
    'PERFIL GERAL DO METIS NA LUMIRA: em toda conversa, reflexão, explicação e texto de apresentação, atue como parceiro de reflexão pedagógica. Use linguagem clara, respeitosa e situada na experiência de ensinar e aprender. Este perfil vale para todos os fluxos da aplicação; as instruções específicas da tarefa apenas acrescentam contexto.',
    'Em textos de apresentação sobre uma parte ou percurso da plataforma, desenvolva em prosa a finalidade, a responsabilidade de quem participa e o lugar daquela parte no percurso de aprendizagem. Relacione-a às outras etapas quando os dados permitirem; não escreva propaganda genérica, não invente funcionalidades e não reduza a apresentação a uma enumeração de controles.',
    'Em respostas que interpretam contexto ou aprendizagem, escreva de 2 a 4 parágrafos completos, separados obrigatoriamente por uma linha em branco (\n\n). Não coloque toda a análise em um único parágrafo. Cada parágrafo deve avançar a leitura: contexto e entendimento; significado pedagógico e relações entre elementos; evidências, lacunas ou limites; pergunta ou próximo passo, quando útil.',
    'Construa uma explicação conectada: diga o que os dados permitem compreender, por que isso importa para a aprendizagem e o que ainda precisa ser observado ou decidido. Use exemplos específicos do contexto recebido. Não transforme toda resposta em lista; use títulos ou listas somente quando ajudarem a organizar uma proposta com várias etapas.',
    'Diferencie dado explícito de interpretação, reconheça incertezas e não invente conteúdo, intenção, evidência ou resultado. Não exponha raciocínio interno; apresente apenas a síntese pedagógica que a professora pode revisar.',
  ].join('\n');
  function tunneledForgeEndpoint(path: string): string {
    return cognoscereForgeTunnel.replace(/\/+$/, '') + path;
  }
  async function forgeRequest(path: string, init: RequestInit = {}): Promise<Response> {
    if (!forgeCredentials) throw new Error('Entre com o PAT do Cognoscere e a chave do Port Router na tela de autenticação.');
    const headers = new Headers(init.headers);
    headers.set('Authorization', 'Bearer ' + forgeCredentials.pat);
    headers.set('X-Port-Router-Key', forgeCredentials.routerKey);
    return fetch(tunneledForgeEndpoint(path), { ...init, headers });
  }
  async function readForgeError(response: Response): Promise<Error> {
    if (response.status === 401 || response.status === 403) return new Error('O Cognoscere Forge recusou o PAT ou a chave do Port Router.');
    let detail = '';
    try {
      const payload = await response.json() as { error?: unknown };
      if (typeof payload.error === 'string') detail = payload.error;
    } catch { /* O serviço pode responder sem JSON. */ }
    return new Error(detail || `Cognoscere Forge respondeu com HTTP ${response.status}.`);
  }
  function paragraphCount(text: string): number {
    return text.trim().split(/\n\s*\n/).filter(Boolean).length;
  }
  function separateExistingSentences(text: string, count: number): string {
    const sentences = text.trim().replace(/\s+/g, ' ').split(/(?<=[.!?;:])\s+(?=[A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ])/u).filter(Boolean);
    if (sentences.length < count) return text;
    return Array.from({ length: count }, (_, index) => {
      const start = Math.round(index * sentences.length / count);
      const end = Math.round((index + 1) * sentences.length / count);
      return sentences.slice(start, end).join(' ').trim();
    }).filter(Boolean).join('\n\n');
  }
  async function ensurePedagogicalParagraphs(messages: Array<{ role: string; content: string }>, draft: string, instruction: string, minimumParagraphs: number): Promise<string> {
    if (paragraphCount(draft) >= minimumParagraphs) return draft;
    let revised = '';
    try {
      const response = await forgeRequest('/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'Metis-4B', slug: cognoscereLocal.slug, unit_id: cognoscereLocal.unitId,
          mode: 'document_update', max_tokens: 1500,
          messages: [
            ...messages,
            { role: 'assistant', content: draft },
            { role: 'user', content: 'A resposta anterior não desenvolveu a leitura. Escreva uma nova resposta, sem apenas copiar ou dividir as frases anteriores. ' + instruction + ' Desenvolva cada parágrafo com explicação e consequência pedagógica, usando somente o contexto e as definições presentes na mensagem de sistema. Não invente fatos, matéria, intenção ou evidência. Separe os parágrafos com uma linha em branco real (\\n\\n).' },
          ],
        }),
        signal: AbortSignal.timeout(90000),
      });
      if (response.ok) {
        const payload = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
        const content = payload.choices?.[0]?.message?.content;
        if (typeof content === 'string' && content.trim()) {
          revised = content.trim();
          try {
            const envelope = JSON.parse(revised) as { reply?: unknown; summary?: unknown };
            if (typeof envelope.reply === 'string' && envelope.reply.trim()) revised = envelope.reply.trim();
            else if (typeof envelope.summary === 'string' && envelope.summary.trim()) revised = envelope.summary.trim();
          } catch { /* Texto Markdown simples também é resposta válida. */ }
        }
      }
    } catch { /* Mantém a resposta original se a revisão de formato falhar. */ }
    if (revised && paragraphCount(revised) >= minimumParagraphs) return revised;
    return separateExistingSentences(revised || draft, minimumParagraphs);
  }
  async function requestCognoscereStatus(): Promise<CognoscereStatus> {
    try {
      const response = await forgeRequest('/health', { signal: AbortSignal.timeout(3500) });
      if (!response.ok) throw await readForgeError(response);
      const health = await response.json() as { ok?: boolean; service?: string; configured?: boolean; system_model_configured?: boolean; model?: string };
      if (health.ok !== true || health.service !== 'cognoscere-forge') throw new Error('O endpoint fixo não confirmou Cognoscere Forge.');
      return {
        available: true,
        configured: health.configured === true,
        systemModelConfigured: health.system_model_configured === true,
        model: typeof health.model === 'string' ? health.model : 'Metis local',
        endpoint: cognoscereForgeTunnel,
        message: health.configured === true && health.system_model_configured === true
          ? 'Forge local, Metis e MiniCPM estão prontos pelo túnel.'
          : 'Forge local respondeu pelo túnel; confira se Metis e MiniCPM estão ativos.',
      };
    } catch (error) {
      return {
        available: false, configured: false, systemModelConfigured: false, model: '', endpoint: cognoscereForgeTunnel,
        message: error instanceof Error && error.name === 'TypeError'
          ? 'Não foi possível acessar o Forge local pelo túnel Ngrok. Confira o serviço e as chaves.'
          : error instanceof Error ? error.message : 'Não foi possível consultar o Cognoscere Forge pelo túnel.',
      };
    }
  }
  async function converseAboutProject(request: ProjectAssistantRequest): Promise<{ reply: string }> {
    if (!['teacher-projects', 'student-projects'].includes(request.partId)) throw new Error('Parte do projeto inválida.');
    const reflection = request.kind === 'reflection';
    const review = request.kind === 'review';
    const system = [
      'Você é o assistente local de planejamento colaborativo da plataforma educacional Lumira. A conversa é processada pelo Metis local; o MiniCPM local revisa a resposta no Cognoscere Forge.',
      'Ajude a compreender e desenvolver projetos da comunidade escolar e do Social. Responda em português natural e contextualizado.',
      metisApplicationProfile,
      'Formate com Markdown legível; negrito com moderação; blocos de código somente para código. Evite tabelas, imagens, HTML, JSON e comandos de sistema.',
      reflection
        ? 'Esta é uma reflexão automática da ficha após uma alteração. Explique em parágrafos o entendimento atualizado do projeto com base somente nos campos, competências e marcos atuais. Relacione objetivo, público, competências e marcos apenas quando os dados permitirem. Aponte lacunas sem inventar dados. Não trate esta reflexão como pedido de edição e não afirme que salvou ou publicou.'
        : review
          ? 'Revise a proposta de projeto antes de sua confirmação. Leia autoria, objetivo, justificativa, plano, público, competências, evidência pretendida e marcos. Responda em texto natural e Markdown: comente o que está coerente, indique lacunas ou riscos concretos sem inventar informações e proponha ajustes quando necessário. Termine perguntando se a pessoa confirma a criação ou quer revisar os passos. Não altere, salve, publique nem aprove o projeto por conta própria; a decisão é da pessoa.'
          : 'Converse sobre o pedido considerando a ficha atual e as mensagens anteriores. Sugira objetivos, etapas, competências e marcos quando úteis. A resposta orienta a pessoa; ela revisa e altera a ficha manualmente.',
      `Papel: ${request.partId === 'student-projects' ? 'estudante' : 'professor'}.`,
      `Ficha atual: ${JSON.stringify(request.context)}.`,
    ].join('\n');
    const messages = [
      { role: 'system', content: system },
      ...request.conversation,
      { role: 'user', content: request.prompt },
    ];
    const response = await forgeRequest('/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'Metis-4B', slug: cognoscereLocal.slug, unit_id: cognoscereLocal.unitId,
        mode: 'document_update', messages, max_tokens: reflection ? 650 : 1400,
      }),
      signal: AbortSignal.timeout(240000),
    });
    if (!response.ok) throw await readForgeError(response);
    const payload = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new Error('O Cognoscere local retornou uma resposta vazia.');
    let reply = content.trim();
    try {
      const structured = JSON.parse(reply) as { reply?: unknown; summary?: unknown };
      if (typeof structured.reply === 'string' && structured.reply.trim()) reply = structured.reply.trim();
      else if (typeof structured.summary === 'string' && structured.summary.trim()) reply = structured.summary.trim();
    } catch { /* Texto Markdown simples também é resposta válida. */ }
    reply = await ensurePedagogicalParagraphs(messages, reply, reflection
      ? 'Organize em 2 parágrafos: leitura do projeto com base nos dados atuais; implicações, lacunas e próximo passo.'
      : review
        ? 'Organize em 3 parágrafos: coerência da proposta; lacunas ou riscos ancorados nos dados; ajustes e pergunta de confirmação.'
        : 'Organize em 2 parágrafos: resposta ligada ao contexto do projeto; consequência pedagógica ou próximo passo.', reflection || !review ? 2 : 3);
    return { reply };
  }
  async function reviewQuestionnaireAnswers(request: QuestionnaireMonitorRequest): Promise<{ reply: string }> {
    if (request.partId !== 'competency-question-response') throw new Error('Parte de questionário inválida.');
    if (!Number.isInteger(request.attemptNumber) || request.attemptNumber < 1) throw new Error('Tentativa inválida.');
    if (request.answers.length !== 5 || request.answers.some(answer => !answer.response.trim())) throw new Error('O monitor exige as cinco respostas registradas.');
    if (request.answers.some(answer => [answer.questionId, answer.title, answer.context, answer.prompt, answer.response].some(value => value.length > 12000))) {
      throw new Error('Uma resposta excede o limite de leitura do monitor.');
    }
    const messages = [
      {
        role: 'system',
        content: [
          'Você é o monitor pedagógico local da plataforma educacional Lumira. O Metis compreende o questionário e responde em texto natural; o Cognoscere Forge revisa a resposta localmente.',
          metisApplicationProfile,
          'Leia em conjunto a competência, os cinco contextos, os pedidos e as respostas do estudante. Relacione o raciocínio que aparece no conjunto a evidências concretas, reconheça um aspecto consistente e identifique o que ainda pede revisão. Termine com uma pergunta ou próximo passo útil para a pessoa revisar.',
          'Use evidências concretas das respostas sem expor trechos longos. Se as respostas forem insuficientes ou vazias, diga isso com precisão e peça uma ampliação específica. Não invente dados nem atribua intenção, característica pessoal, nota, nível, diagnóstico ou domínio da competência. Uma tentativa não decide progressão escolar.',
          'Responda somente com feedback em texto natural e Markdown simples. Não gere JSON, operações, comandos de sistema, notas numéricas ou propostas de alteração automática.',
        ].join('\n'),
      },
      { role: 'user', content: JSON.stringify({ competency: request.competency, attemptNumber: request.attemptNumber, answers: request.answers }) },
    ];
    const response = await forgeRequest('/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'Metis-4B', slug: cognoscereLocal.slug, unit_id: cognoscereLocal.unitId,
        mode: 'document_update', messages, max_tokens: 850,
      }),
      signal: AbortSignal.timeout(240000),
    });
    if (!response.ok) throw await readForgeError(response);
    const payload = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new Error('O monitor local não retornou feedback.');
    return { reply: await ensurePedagogicalParagraphs(messages, content.trim(), 'Organize em 3 parágrafos: síntese do raciocínio observado; evidências e limites da leitura; próximo passo útil para o estudante.', 3) };
  }
  async function generateLevelingQuestions(request: LevelingQuestionGenerationRequest): Promise<LevelingGeneratedQuestion[]> {
    if (request.partId !== 'leveling-assessment') throw new Error('Parte de nivelamento inválida.');
    if (!Number.isInteger(request.age) || request.age < 6 || request.age > 18 || ![6, 7, 8, 9].includes(request.grade)) {
      throw new Error('O contexto da matrícula exige idade entre 6 e 18 anos e série do 6º ao 9º ano.');
    }
    if (![3, 5, 8].includes(request.questionCount)) throw new Error('A geração aceita 3, 5 ou 8 questões.');
    const skillCodePattern = /^EF\d{2}[A-Z]{2}\d{2}$/;
    if (!request.competency || request.competency.title.trim().length < 4 || request.competency.title.length > 180
      || request.competency.description.trim().length < 12 || request.competency.description.length > 900
      || !Array.isArray(request.competency.skills) || request.competency.skills.length < 2 || request.competency.skills.length > 12
      || request.competency.skills.some(skill => !skill || !skillCodePattern.test(skill.code) || skill.description.trim().length < 8 || skill.description.length > 300)) {
      throw new Error('A competência exige título, descrição e de duas a doze habilidades BNCC válidas.');
    }
    const skillCodes = request.competency.skills.map(skill => skill.code.toUpperCase());
    if (new Set(skillCodes).size !== skillCodes.length) throw new Error('Remova códigos de habilidade repetidos.');
    const intentLabels: Record<string, string> = {
      'reconhecer-fenomeno': 'Reconhecer fenômenos e conceitos',
      'relacionar-dados': 'Relacionar variáveis e dados',
      'comparar-evidencias': 'Comparar evidências e interpretações',
      'justificar-conclusao': 'Justificar uma conclusão',
      'reconhecer-limites': 'Reconhecer limites da evidência',
      'transferir-contexto': 'Transferir a compreensão para outro contexto',
    };
    if (!Array.isArray(request.intents) || !request.intents.length || request.intents.length > Object.keys(intentLabels).length
      || request.intents.some(intent => !Object.hasOwn(intentLabels, intent)) || new Set(request.intents).size !== request.intents.length) {
      throw new Error('Selecione ao menos um intuito de aprendizagem válido.');
    }
    const thesisFields = Object.values(request.thesis ?? {});
    if (thesisFields.length !== 6 || thesisFields.some(value => typeof value !== 'string' || value.trim().length < 12 || value.length > 1200)) {
      throw new Error('A tese exige delimitação, afirmação, desenvolvimento, contraponto, limites e conclusão preenchidos.');
    }
    const requestedIntentLabels = request.intents.map(intent => intentLabels[intent]);
    const messages = [
      {
        role: 'system',
        content: [
          'Você é Metis, assistente pedagógico da Lumira. Compreenda a tese e a competência antes de propor material. O Cognoscere Forge revisa a resposta com MiniCPM5-2B.',
          metisApplicationProfile,
          'Gere exatamente a quantidade solicitada de questões de nivelamento, em português brasileiro, situadas para a idade e série informadas. A competência é composta somente pelas habilidades BNCC fornecidas. Distribua a cobertura: cada questão deve mobilizar uma ou duas habilidades fornecidas; ao longo do conjunto, cubra todas as habilidades. Não invente códigos nem redação oficial da BNCC; use as descrições de trabalho como orientação, sem apresentá-las como transcrição curricular oficial.',
          'Cada questão deve avaliar um intuito selecionado, criar um contexto com dados suficientes, solicitar raciocínio e ter quatro alternativas plausíveis, somente uma correta. Varie contextos e evite revelar a estratégia no enunciado. A evidência descreve o raciocínio observável; a explicação justifica a alternativa correta com os dados apresentados. Não atribua nota, domínio, diagnóstico ou progressão ao estudante.',
          'Retorne somente um objeto JSON válido, sem bloco Markdown ou texto antes/depois, neste formato: {"questions":[{"title":"...","context":"...","prompt":"...","evidence":"...","choices":["...","...","...","..."],"correctOption":0,"explanation":"...","skillCodes":["EF08CI03"],"intent":"relacionar-dados"}]}. `correctOption` é índice de zero a três. `intent` deve ser um dos IDs selecionados. Não inclua propriedades extras.',
        ].join('\n'),
      },
      {
        role: 'user',
        content: JSON.stringify({
          task: 'Geração de atividade de nivelamento',
          age: request.age,
          grade: request.grade,
          thesis: request.thesis,
          competency: request.competency,
          selectedIntents: request.intents.map(id => ({ id, label: intentLabels[id] })),
          questionCount: request.questionCount,
        }),
      },
    ];
    let response: Response;
    try {
      response = await forgeRequest('/v1/chat/completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'Metis-4B', slug: cognoscereLocal.slug, unit_id: cognoscereLocal.unitId, mode: 'document_update', messages, max_tokens: 8192 }),
        signal: AbortSignal.timeout(240000),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') throw new Error('A geração excedeu quatro minutos. Tente novamente com menos questões.');
      throw new Error('Não foi possível alcançar o endpoint Ngrok. Confira o túnel, o CORS do Forge e a URL configurada.');
    }
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) throw new Error('O túnel recusou a chamada. Confira o PAT e a chave do Port Router na tela de autenticação.');
      throw await readForgeError(response);
    }
    const payload = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
    const rawContent = payload.choices?.[0]?.message?.content;
    if (typeof rawContent !== 'string' || !rawContent.trim()) throw new Error('O Cognoscere Forge não retornou conteúdo de geração.');
    let content = rawContent.trim();
    for (let depth = 0; depth < 3; depth += 1) {
      const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      let parsed: unknown;
      try { parsed = JSON.parse(cleaned); }
      catch {
        const start = cleaned.indexOf('{'), end = cleaned.lastIndexOf('}');
        if (start < 0 || end <= start) throw new Error('A resposta do Forge não contém JSON válido de questões.');
        try { parsed = JSON.parse(cleaned.slice(start, end + 1)); }
        catch { throw new Error('A resposta do Forge contém JSON inválido. Gere novamente.'); }
      }
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const object = parsed as Record<string, unknown>;
        if (typeof object.reply === 'string') { content = object.reply.trim(); continue; }
        if (Array.isArray(object.questions)) {
          if (object.questions.length !== request.questionCount) throw new Error('O Forge devolveu ' + object.questions.length + ' questões; eram esperadas ' + request.questionCount + '.');
          const allowedSkills = new Set(skillCodes);
          const allowedIntents = new Set(request.intents);
          const generated = object.questions.map((item, index): LevelingGeneratedQuestion => {
            if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('A questão ' + (index + 1) + ' tem formato inválido.');
            const question = item as Record<string, unknown>;
            const textFields = ['title', 'context', 'prompt', 'evidence', 'explanation'] as const;
            for (const field of textFields) {
              if (typeof question[field] !== 'string' || !question[field].trim() || question[field].length > 1400) {
                throw new Error('A questão ' + (index + 1) + ' não contém ' + field + ' válido.');
              }
            }
            if (!Array.isArray(question.choices) || question.choices.length !== 4 || question.choices.some(choice => typeof choice !== 'string' || !choice.trim() || choice.length > 500)) {
              throw new Error('A questão ' + (index + 1) + ' precisa conter quatro alternativas.');
            }
            if (!Number.isInteger(question.correctOption) || Number(question.correctOption) < 0 || Number(question.correctOption) > 3) {
              throw new Error('A questão ' + (index + 1) + ' não identificou uma alternativa de referência válida.');
            }
            if (!Array.isArray(question.skillCodes) || !question.skillCodes.length || question.skillCodes.length > 2
              || question.skillCodes.some(code => typeof code !== 'string' || !allowedSkills.has(code.toUpperCase()))) {
              throw new Error('A questão ' + (index + 1) + ' cita habilidade que não pertence à competência.');
            }
            if (typeof question.intent !== 'string' || !allowedIntents.has(question.intent)) {
              throw new Error('A questão ' + (index + 1) + ' não corresponde a um intuito selecionado.');
            }
            return {
              id: 'leveling-question-' + String(index + 1).padStart(2, '0'),
              title: (question.title as string).trim(), context: (question.context as string).trim(), prompt: (question.prompt as string).trim(),
              evidence: (question.evidence as string).trim(), choices: question.choices.map(choice => (choice as string).trim()),
              correctOption: Number(question.correctOption), explanation: (question.explanation as string).trim(), points: 20,
              skillCodes: question.skillCodes.map(code => (code as string).toUpperCase()), intent: question.intent,
            };
          });
          const coverage = new Set(generated.flatMap(question => question.skillCodes));
          const uncovered = skillCodes.filter(code => !coverage.has(code));
          if (uncovered.length) throw new Error('O conjunto não cobriu todas as habilidades da competência: ' + uncovered.join(', ') + '. Gere novamente.');
          return generated;
        }
      }
      throw new Error('A resposta do Forge não trouxe a propriedade questions esperada.');
    }
    throw new Error('O Forge retornou uma resposta estruturada em camadas inesperadas.');
  }
  async function understandSubjectSkill(request: SubjectSkillUnderstandingRequest): Promise<string> {
    if (request.partId !== 'pedagogy-context') throw new Error('Parte de matéria inválida.');
    const skillName = request.skillName.trim();
    if (!skillName || skillName.length > 180) throw new Error('Informe uma habilidade com até 180 caracteres.');
    const messages = [
      {
        role: 'system',
        content: [
          'Você é o assistente pedagógico local da plataforma educacional Lumira. A conversa é processada pelo Metis local e revisada pelo Cognoscere Forge.',
          metisApplicationProfile,
          'Explique como você interpreta a habilidade informada e que ação de aprendizagem ela pode orientar. Desenvolva a explicação em dois parágrafos curtos: interpretação contextualizada e possível observação pedagógica.',
          'Se a habilidade for um código curricular cuja descrição oficial não esteja explícita no pedido, não invente nem atribua uma redação oficial. Expresse a interpretação com cautela e diga que o código precisa ser confirmado no documento curricular.',
          'Não gere atividades, comandos, JSON ou instruções para alterar o sistema. Responda somente com a explicação em texto natural.',
        ].join('\n'),
      },
      { role: 'user', content: 'Habilidade selecionada: ' + skillName },
    ];
    const response = await forgeRequest('/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'Metis-4B', slug: cognoscereLocal.slug, unit_id: cognoscereLocal.unitId, mode: 'document_update', messages, max_tokens: 220 }),
      signal: AbortSignal.timeout(45000),
    });
    if (!response.ok) throw await readForgeError(response);
    const payload = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new Error('O Cognoscere local não retornou uma explicação.');
    return ensurePedagogicalParagraphs(messages, content.trim(), 'Organize em 2 parágrafos curtos: interpretação contextualizada da habilidade; ação ou evidência de aprendizagem que ela pode orientar, com a cautela curricular pedida.', 2);
  }
  async function understandSubjectFoundation(request: SubjectFoundationAssistantRequest): Promise<string> {
    if (request.partId !== 'pedagogy-context' || !['reflection', 'conversation'].includes(request.kind)) throw new Error('Pedido de matéria inválido.');
    if (request.prompt.trim().length > 1600) throw new Error('A mensagem deve ter até 1.600 caracteres.');
    const context = request.context;
    if (!context || [context.name, context.nature, context.understanding, context.approach, context.aspects].some(value => typeof value !== 'string' || value.length > 700)
      || !Array.isArray(context.skills) || context.skills.length > 100 || context.skills.some(skill => typeof skill !== 'string' || skill.length > 180)) {
      throw new Error('A fundação da matéria excede os limites de leitura do assistente.');
    }
    const conversation = Array.isArray(request.conversation) ? request.conversation.slice(-8) : [];
    if (conversation.some(message => !message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string' || message.content.length > 2000)) {
      throw new Error('A conversa contém uma mensagem inválida.');
    }
    const system = [
      'Você é o assistente pedagógico local da Lumira. Metis compreende a matéria e responde em texto natural; o Cognoscere Forge faz a revisão local.',
      metisApplicationProfile,
      'A fundação tem quatro responsabilidades distintas: Natureza delimita o campo, fenômenos e objetos; Entendimento define relações e evidências que demonstram compreensão; Abordagem descreve práticas para investigar, interpretar e produzir conhecimento; Aspectos registram contextos, representações, limites e diversidade relevantes.',
      'Na reflexão sobre a ficha, escreva exatamente 3 parágrafos, cada um com 2 ou 3 frases completas, separados por uma linha em branco real (\n\n). Parágrafo 1: interprete os conteúdos presentes nas dimensões da ficha e cite o que os dados sustentam. Parágrafo 2: explique como natureza, entendimento, abordagem e aspectos se sustentam ou entram em tensão e o que isso orienta no ensino. Parágrafo 3: indique uma lacuna, ambiguidade ou desalinhamento concreto e termine com uma pergunta específica que ajude a professora a decidir o próximo passo. Não use lista, não compacte os três movimentos num parágrafo e não invente informações.',
      'Na primeira interação, a ficha pode estar vazia. Ainda assim, escreva exatamente 3 parágrafos separados por uma linha em branco: primeiro, explique o limite de não haver descrições preenchidas; segundo, desenvolva como Natureza, Entendimento, Abordagem e Aspectos precisam se articular para orientar uma aprendizagem, sem apenas enumerar definições; terceiro, proponha uma decisão inicial concreta e faça uma pergunta que ajude a professora a escolher um fenômeno, problema ou evidência. Não finja que já compreendeu uma matéria específica.',
      'Nas mensagens de conversa, responda à pergunta levando em conta a versão atual da ficha e a conversa anterior. Mantenha pelo menos 2 parágrafos completos. Conecte a pergunta ao projeto pedagógico da matéria e, se uma alteração recente mudar seu entendimento, explique qual relação mudou e qual consequência isso traz para o ensino.',
      'Não altere nem salve a ficha, não proponha comandos de sistema, JSON ou operações. Devolva somente texto natural em português, com Markdown simples quando ajudar.',
    ].join('\n');
    const messages = [
      { role: 'system', content: system },
      ...conversation.map(message => ({ role: message.role, content: message.content })),
      { role: 'user', content: JSON.stringify({ kind: request.kind, instruction: request.prompt, currentSubjectFoundation: context }) },
    ];
    const response = await forgeRequest('/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'Metis-4B', slug: cognoscereLocal.slug, unit_id: cognoscereLocal.unitId, mode: 'document_update', messages, max_tokens: request.kind === 'reflection' ? 1000 : 1100 }),
      signal: AbortSignal.timeout(90000),
    });
    if (!response.ok) throw await readForgeError(response);
    const payload = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new Error('O Metis local não retornou uma reflexão.');
    let reply = content.trim();
    try {
      const envelope = JSON.parse(reply) as { reply?: unknown; summary?: unknown };
      if (typeof envelope.reply === 'string' && envelope.reply.trim()) reply = envelope.reply.trim();
      else if (typeof envelope.summary === 'string' && envelope.summary.trim()) reply = envelope.summary.trim();
    } catch { /* Resposta Markdown simples também é válida. */ }
    return ensurePedagogicalParagraphs(messages, reply, request.kind === 'reflection'
      ? 'Escreva exatamente 3 parágrafos de 2 ou 3 frases: (1) o que a ficha permite compreender e o que ainda falta; (2) como Natureza, Entendimento, Abordagem e Aspectos se articulam e orientam a aprendizagem, explicando essa relação sem enumerar definições; (3) uma decisão pedagógica concreta e uma pergunta específica. Com ficha vazia, explique o papel articulado das quatro dimensões e como começar sem inventar uma matéria.'
      : 'Organize em 2 parágrafos: resposta à pergunta conectada à ficha atual; consequência para o ensino, limite ou próximo passo.', request.kind === 'reflection' ? 3 : 2);
  }
  type AgeGradePolicy = {
    version: string;
    expectedAgeByGrade: Record<number, number>;
    initialContextsPerCompetence: number;
    minIndependentEvidencesForDecision: number;
    coefficient: null | ((context: { age: number; grade: number; referenceAge: number }) => number);
  };
  type DemoDatabase = {
    users: Record<Role, SessionUser>;
    competencies: Competency[];
    classes: ClassRoom[];
    contracts: Contracts;
    materials: Material[];
    posts: CommunityPost[];
    events: CommunityEvent[];
    social: SocialProfile;
    preview: Preview | null;
    sondagem: SondagemPlan | null;
    answer: Answer | null;
    activityOpen: boolean;
  };

  function currentRoute(): string { return decodeURI((location.hash.slice(1) || '/').split('?')[0]); }
  const publicPaths = new Set(['/','/acesso']);
  const menus: Record<Role, readonly (readonly [string,string,string])[]> = {
    professor: [['Início','/professor/inicio','house'],['Matérias e turmas','/professor/materias','book'],['Competências','/professor/competencias','layers'],['Sondagem','/professor/sondagem','scan'],['Monitor de IA','/professor/monitor','brain'],['Evidências','/professor/evidencias','chart'],['Cursos','/cursos','course'],['Comunidade','/social','users'],['Perfil','/perfil','user']],
    aluno: [['Início','/aluno/inicio','house'],['Sondagem','/aluno/sondagem','scan'],['Atividade','/aluno/atividade','book'],['Cursos','/cursos','course'],['Competências','/aluno/competencias','layers'],['Comunidade','/social','users'],['Perfil','/perfil','user']],
    admin: [['Painel','/admin','house'],['Comunidade','/social','users'],['Perfil','/perfil','user']],
  };
  const referencePolicy: AgeGradePolicy = Object.freeze({
    version: 'demo-contexto-v1',
    expectedAgeByGrade: {1:6,2:7,3:8,4:9,5:10,6:11,7:12,8:13,9:14},
    initialContextsPerCompetence: 5,
    minIndependentEvidencesForDecision: 2,
    coefficient: null // implementar apenas depois de política validada da instituição
  });
  function ageAtDate(birthDate: string | undefined, referenceDate: string): number | null {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(birthDate||'')) return null;
    const b = new Date(`${birthDate}T12:00:00Z`), a = new Date(`${referenceDate}T12:00:00Z`);
    if(!Number.isFinite(+b)||!Number.isFinite(+a)||b>a) return null;
    let age=a.getUTCFullYear()-b.getUTCFullYear();
    if(a.getUTCMonth()<b.getUTCMonth()||(a.getUTCMonth()===b.getUTCMonth()&&a.getUTCDate()<b.getUTCDate())) age--;
    return age;
  }
  function ageGradeContext({birthDate, grade, date='2026-10-18', policy=referencePolicy}: {
    birthDate: string;
    grade: string | number;
    date?: string;
    policy?: Pick<AgeGradePolicy, 'version' | 'expectedAgeByGrade' | 'coefficient'>;
  }): AgeGradeContext {
    const age=ageAtDate(birthDate,date), expected=policy.expectedAgeByGrade[Number(grade)]??null;
    return {
      age, grade:Number(grade), referenceAge:expected,
      deviationYears:age!==null&&expected!==null? age-expected:null,
      coefficient:typeof policy.coefficient==='function'&&age!==null&&expected!==null
        ?policy.coefficient({age,grade:Number(grade),referenceAge:expected}):null,
      policyVersion:policy.version,
      note:'Referência contextual, não avaliação de competência. Coeficiente institucional pendente de definição.'
    };
  }
  function sondagemPlan({competencies,grade,ageContext,policy=referencePolicy}: {
    competencies: Array<Pick<Competency, 'id' | 'title' | 'criteria'>>;
    grade: string | number;
    ageContext: AgeGradeContext;
    policy?: AgeGradePolicy;
  }): SondagemPlan {
    return {
      id:'plano-rascunho', status:'draft',grade:Number(grade),ageGrade:ageContext,
      competencies:competencies.map(c=>({id:c.id, title:c.title, contexts:policy.initialContextsPerCompetence,
        evidenceCriteria:c.criteria, items:[], state:'awaiting-generation'})),
      gradeAdvance:null,  // hipótese antiga do repositório, não decisão automática
      reviewRequired:true, policyVersion:policy.version
    };
  }

  /** Gateway local do programa. */

  function clone<T>(obj: T): T { return structuredClone(obj); }
  const seed: DemoDatabase={
   users:{
    professor:{id:'u-helena',name:'Helena Martins',handle:'helenamartins',role:'professor',grade:'8º ano',school:'Escola Aurora'},
    aluno:{id:'u-caio',name:'Caio Almeida',handle:'caioalmeida',role:'aluno',grade:'8º ano',school:'Escola Aurora'},
    admin:{id:'u-admin',name:'Coordenação Aurora',handle:'coordaurora',role:'admin',school:'Escola Aurora'}
   },
   competencies:[
    {id:'c-energia',title:'Relacionar potência e duração ao consumo elétrico',action:'Relacionar',object:'potência, tempo e energia elétrica',bncc:['EF08CI03','EF08CI04','EF08CI05'],criteria:['seleção das variáveis','relação entre grandezas','justificativa com dados','revisão diante de condição alterada'],status:'em observação'},
    {id:'c-texto',title:'Justificar uma interpretação textual',action:'Justificar',object:'posicionamentos e passagens de texto',bncc:['EF89LP04'],criteria:['posição interpretada','passagem citada','nexo entre trecho e interpretação'],status:'em desenvolvimento'},
    {id:'c-matematica',title:'Interpretar situações de proporcionalidade',action:'Interpretar',object:'grandezas proporcionais',bncc:['EF07MA17'],criteria:['identificação das grandezas','relação estabelecida','justificativa do procedimento'],status:'a sondar'}
   ],
   classes:[{id:'t-8a',name:'8º A',subject:'Ciências da Natureza',students:28,teacher:'Helena Martins',grade:8},{id:'t-8b',name:'8º B',subject:'Ciências da Natureza',students:26,teacher:'Helena Martins',grade:8}],
   contracts:{interpretation:{version:1,text:'A interpretação curricular relaciona a situação proposta às habilidades EF08CI03, EF08CI04 e EF08CI05; a atividade pode mobilizar mais de uma delas sem comprovar automaticamente todas.'},generation:{version:2,text:'Elabore uma questão clássica, contextual e inferencial sobre consumo de energia na biblioteca da escola. Inclua dados suficientes para comparar duas situações, peça justificativa e não antecipe a conclusão.'},evaluation:{version:1,text:'Para cada critério associado à competência, descreva a atribuição observada e transcreva apenas trecho efetivo da resposta que a sustenta. Se não houver evidência, registre “não evidenciado”; não classifique a pessoa globalmente.'}},
   materials:[{id:'m1',title:'Investigação sobre consumo de energia',status:'aprovado',subject:'Ciências',skillIds:['EF08CI03','EF08CI04','EF08CI05']},{id:'m2',title:'Textos argumentativos e justificativas',status:'rascunho',subject:'Língua Portuguesa',skillIds:['EF89LP04']}],
   posts:[{id:'p1',author:'Mariana Oliveira',role:'professor',space:'forum-docente',subject:'Língua Portuguesa',title:'Sequências de questões de interpretação',text:'Como vocês ampliam a diversidade de contextos sem deixar a pergunta antecipar a resposta?',likes:18},
   {id:'p2',author:'Escola Aurora',role:'instituicao',space:'comunidade',subject:'Ciências',title:'Mostra de soluções sobre energia',text:'Os projetos elaborados pelas turmas serão apresentados na próxima semana. Participação aberta à comunidade escolar.',likes:36}],
   events:[{id:'ev-mostra',title:'Mostra de Ciências',date:'2026-10-21',time:'14:00',kind:'Mostra',status:'inscrições abertas',leaderboard:[]},{id:'ev-debate',title:'Roda de conversa',date:'2026-10-28',time:'18:30',kind:'Encontro',status:'agendado',leaderboard:[]}],
   social:{cover:'golden',bio:'Educação, ciência e projetos colaborativos.',music:'Instrumental para planejar',stories:['Na sala de aula','Projetos','Leituras'],displayProgress:false},
   preview:null, sondagem:null, answer:null, activityOpen:false,
  };
  function createDemoGateway(): Gateway {
    const db=clone(seed);let currentUser: SessionUser | null=null;
    async function snapshot(): Promise<AppSnapshot>{return clone({user:currentUser,competencies:db.competencies,classes:db.classes,contracts:db.contracts,materials:db.materials,posts:db.posts,events:db.events,social:db.social,preview:db.preview,sondagem:db.sondagem,answer:db.answer,activityOpen:db.activityOpen});}
    return {
      mode:'demo',
      async login({role}){if(!db.users[role])throw new Error('Papel de demonstração desconhecido');currentUser=clone(db.users[role]);return snapshot();},
      async logout(){currentUser=null;return snapshot();},
      snapshot,
      async saveContracts(data){if(currentUser?.role!=='professor')throw new Error('Somente professor edita contratos');for(const k of ['interpretation','generation','evaluation'] as const)if(typeof data[k]==='string' && data[k].trim()){db.contracts[k]={text:data[k].trim(),version:db.contracts[k].version+1};}return snapshot();},
      async prepareSondagem({grade,birthDate}){if(!currentUser)throw new Error('Acesso necessário');const ctx=ageGradeContext({birthDate,grade});db.sondagem=sondagemPlan({competencies:db.competencies.slice(0,2),grade,ageContext:ctx});return snapshot();},
      async generatePreview(){if(currentUser?.role!=='professor')throw new Error('Acesso docente necessário');db.preview={
        id:'prev-demo-01',mode:'exemplo_local',status:'rascunho',contractVersion:db.contracts.generation.version,
        question:'Uma escola pretende reduzir o consumo de energia de sua biblioteca. Duas turmas afirmam que diminuir o tempo de uso do ventilador sempre produz economia maior do que substituir as lâmpadas. Considerando a potência, a quantidade de aparelhos e a duração de funcionamento, explique quais informações seriam necessárias para verificar essa afirmação e em quais condições ela poderia deixar de ser verdadeira.',
        internal:'Prévia didática fixa fornecida pelo frontend. Não foi gerada pelo Metis. Análise só ocorre após integração com backend e contrato de avaliação.'};return snapshot();},
      async publishActivity(){if(currentUser?.role!=='professor'||!db.preview)throw new Error('Gere uma prévia antes');db.activityOpen=true;db.preview.status='publicado (demo)';return snapshot();},
      async submitAnswer(text){if(currentUser?.role!=='aluno')throw new Error('Somente aluno envia resposta');if(!text.trim())throw new Error('Informe uma resposta');db.answer={text:text.trim(),status:'entregue, aguardando avaliação',id:'ent-demo-01'};return snapshot();},
      async publishPost({title,text,space='comunidade'}){if(!currentUser)throw new Error('Acesso necessário');if(space==='forum-docente'&&currentUser.role!=='professor')throw new Error('Fórum restrito a docentes');if(!title.trim()||!text.trim())throw new Error('Título e conteúdo são obrigatórios');db.posts.unshift({id:`p-${db.posts.length+1}`,author:currentUser.name,role:currentUser.role,space,subject:'Comunidade',title:title.trim(),text:text.trim(),likes:0});return snapshot();},
      async saveProfile({bio,music,cover,displayProgress}){if(!currentUser)throw new Error('Acesso necessário');Object.assign(db.social,{bio:bio?.trim()||'',music:music?.trim()||'',cover:cover||'golden',displayProgress:!!displayProgress});return snapshot();}
    };
  }


  function createWorkersGateway({baseUrl='/api'}: {baseUrl?: string} = {}): Gateway {
    async function request(method: string,path: string,body?: unknown): Promise<AppSnapshot>{
      const res=await fetch(baseUrl+path,{method,credentials:'include',headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
      if(!res.ok)throw new Error(`Worker ${res.status}: ${await res.text()}`);
      return await res.json() as AppSnapshot;
    }
    return {
      mode:'worker',snapshot:()=>request('GET','/session/snapshot'),
      login:body=>request('POST','/auth/login',body),logout:()=>request('POST','/auth/logout'),
      saveContracts:body=>request('PUT','/teacher/contracts',body),
      prepareSondagem:body=>request('POST','/sondagens/plans',body),
      generatePreview:()=>request('POST','/monitor/previews',{kind:'generation'}),
      publishActivity:()=>request('POST','/activities/publish'),
      submitAnswer:text=>request('POST','/submissions',{text}),
      publishPost:body=>request('POST','/social/posts',body),
      saveProfile:body=>request('PATCH','/profile/social',body)
    };
  }

  const gateway: Gateway = mode === 'worker' ? createWorkersGateway({ baseUrl }) : createDemoGateway();

  const machine: {
    session: SessionUser | null;
    snapshot: AppSnapshot | null;
    pending: boolean;
    error: string | null;
    message: string | null;
  } = { session: null, snapshot: null, pending: false, error: null, message: null };
  const removeListeners: Array<() => void> = [];
  const opinionCircleStreams = new Map<string, OpinionCircleMessageEvent[]>();
  let opinionMessageSequence = 0;
  const defaultView = ({ route, session, snapshot }: ProgramRenderContext): string => {
    if (route === '/') return landing();
    if (route === '/acesso' || !session) return access();
    const navItems = menus[session.role] ?? menus.aluno;
    if (!snapshot) return shell({ route, user: session, navItems, content: '<section class="card"><h1>Preparando a tela…</h1></section>' });
    return shell({ route, user: session, navItems, content: page(route, snapshot as AppSnapshot & { user: SessionUser }) });
  };
  const view = createHtmlIterator<ProgramRenderContext, string | HTMLElement>(context =>
    renderView?.(context) ?? defaultView(context));

  const readForm = (form: HTMLFormElement): Record<string, string> =>
    Object.fromEntries(Array.from(new FormData(form).entries(), ([key, value]) => [key, String(value)]));
  const home = (): string => machine.session?.role === 'professor'
    ? '/professor/inicio'
    : machine.session?.role === 'admin' ? '/admin' : '/aluno/inicio';

  function navigate(route: string): void {
    const target = route.startsWith('/') ? route : '/';
    if (currentRoute() === target) render();
    else location.hash = target;
  }

  function render(): void {
    const route = currentRoute();
    const content = view.next({ route, session: machine.session, snapshot: machine.snapshot }).value;
    if (typeof content === 'string') mount.innerHTML = content;
    else if (typeof HTMLElement !== 'undefined' && content instanceof HTMLElement) mount.replaceChildren(content);
    else mount.innerHTML = '';
    const notice = machine.error || machine.message;
    if (notice) {
      const toast = document.createElement('div');
      toast.className = `toast ${machine.error ? 'error' : ''}`;
      toast.setAttribute('role', machine.error ? 'alert' : 'status');
      toast.textContent = notice;
      mount.append(toast);
    }
    document.title = documentTitle ?? (route === '/' ? 'Lumira' : `Lumira · ${route.split('/').filter(Boolean).at(-1)}`);
  }

  async function updateFromGateway(
    operation: () => Promise<AppSnapshot>,
    message?: string,
    accept?: (snapshot: AppSnapshot) => void,
  ): Promise<void> {
    if (machine.pending) return;
    machine.pending = true;
    machine.error = null;
    machine.message = null;
    try {
      const snapshot = await operation();
      machine.snapshot = snapshot;
      accept?.(snapshot);
      machine.message = message || null;
    } catch (error) {
      machine.error = error instanceof Error ? error.message : String(error);
    } finally {
      machine.pending = false;
      render();
    }
  }

  const system: Omit<LumiraSystem, 'destroy'> = {
    navigate,
    render,
    login: async ({ role }: LoginInput): Promise<void> => {
      await updateFromGateway(() => gateway.login({ role }), 'Acesso demonstrativo ativo.', snapshot => {
        machine.session = snapshot.user;
      });
      if (machine.session) navigate(home());
    },
    logout: async (): Promise<void> => {
      await updateFromGateway(() => gateway.logout(), undefined, () => { machine.session = null; });
      navigate('/acesso');
    },
    saveContracts: values => updateFromGateway(() => gateway.saveContracts(values), 'Nova revisão registrada na demonstração.'),
    prepareSondagem: values => updateFromGateway(() => gateway.prepareSondagem(values), 'Plano inicial de sondagem preparado; requer revisão docente.'),
    generatePreview: () => updateFromGateway(() => gateway.generatePreview(), 'Prévia local ilustrativa, sem inferência Metis.'),
    publishActivity: () => updateFromGateway(() => gateway.publishActivity(), 'Atividade disponível no ambiente demonstrativo.'),
    submitAnswer: text => updateFromGateway(() => gateway.submitAnswer(text), 'Entrega registrada; avaliação não simulada.'),
    publishPost: async values => {
      const previousCount = machine.snapshot?.posts.length ?? 0;
      await updateFromGateway(() => gateway.publishPost(values), 'Publicação demonstrativa criada.');
      if ((machine.snapshot?.posts.length ?? 0) > previousCount) navigate('/social');
    },
    saveProfile: values => updateFromGateway(() => gateway.saveProfile(values), 'Perfil social atualizado na demonstração.'),
    saveDraft: (): void => {
      const textarea = mount.querySelector<HTMLTextAreaElement>('textarea[name="answer"]');
      if (!textarea) return;
      let note = mount.querySelector<HTMLElement>('#draft-note');
      if (!note) {
        note = document.createElement('small');
        note.id = 'draft-note';
        note.setAttribute('role', 'status');
        textarea.insertAdjacentElement('afterend', note);
      }
      note.textContent = 'Rascunho mantido nesta tela, não persistido no servidor.';
    },
    snapshot: () => machine.snapshot,
    info: () => ({ mode: gateway.mode, role: machine.session?.role ?? null, pending: machine.pending }),
  };

  function routeGuard(): void {
    const route = currentRoute();
    if (machine.session && route === '/acesso') navigate(home());
    else if (!machine.session && !publicPaths.has(route)) navigate('/acesso');
    else if (machine.session?.role === 'aluno' && route.startsWith('/professor/')) navigate('/aluno/inicio');
    else if (machine.session?.role === 'professor' && route.startsWith('/aluno/')) navigate('/professor/inicio');
    else render();
  }

  function onClick(event: MouseEvent): void {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLElement>('[data-action],[data-nav]');
    if (!button) return;
    if (button.dataset.nav) {
      event.preventDefault();
      navigate(button.dataset.nav);
      return;
    }
    const callbacks: Record<string, () => void> = {
      logout: () => { void system.logout(); },
      'generate-preview': () => { void system.generatePreview(); },
      'publish-activity': () => { void system.publishActivity(); },
      'save-draft': () => system.saveDraft(),
    };
    const callback = button.dataset.action ? callbacks[button.dataset.action] : undefined;
    if (callback) {
      event.preventDefault();
      callback();
    }
  }

  function onSubmit(event: SubmitEvent): void {
    if (!(event.target instanceof HTMLFormElement)) return;
    const form = event.target.closest<HTMLFormElement>('form[data-form]');
    if (!form) return;
    event.preventDefault();
    const values = readForm(form);
    switch (form.dataset.form) {
      case 'login': {
        const role = values.role;
        if (role === 'professor' || role === 'aluno' || role === 'admin') void system.login({ role: role as Role });
        break;
      }
      case 'contracts': void system.saveContracts(values); break;
      case 'prepare-sondagem': void system.prepareSondagem({ birthDate: values.birthDate ?? '', grade: values.grade ?? '' }); break;
      case 'submit-answer': void system.submitAnswer(values.answer ?? ''); break;
      case 'publish-post': void system.publishPost({ title: values.title ?? '', text: values.text ?? '', space: values.space === 'forum-docente' ? 'forum-docente' : 'comunidade' }); break;
      case 'social-profile': {
        const displayProgress = form.elements.namedItem('displayProgress') instanceof HTMLInputElement
          && (form.elements.namedItem('displayProgress') as HTMLInputElement).checked;
        void system.saveProfile({ ...values, displayProgress });
        break;
      }
    }
  }

  function projectAssistantOrigin(event: Event, partId: unknown): HTMLElement | null {
    if (!(event.target instanceof HTMLElement) || !mount.contains(event.target)) return null;
    if (partId !== 'teacher-projects' && partId !== 'student-projects') return null;
    return event.target.dataset.componentId === partId ? event.target : null;
  }

  function forgeAuthenticationOrigin(event: Event): HTMLElement | null {
    if (!(event.target instanceof HTMLElement) || !mount.contains(event.target)) return null;
    return event.target.localName === 'lumira-access-gate' ? event.target : null;
  }

  function subjectSkillOrigin(event: Event, partId: unknown): HTMLElement | null {
    if (!(event.target instanceof HTMLElement) || !mount.contains(event.target)) return null;
    if (partId !== 'pedagogy-context' || event.target.dataset.componentId !== 'pedagogy-context') return null;
    return event.target;
  }

  function subjectFoundationOrigin(event: Event, partId: unknown): HTMLElement | null {
    if (!(event.target instanceof HTMLElement) || !mount.contains(event.target)) return null;
    if (partId !== 'pedagogy-context' || event.target.dataset.componentId !== 'pedagogy-context') return null;
    return event.target;
  }

  function questionnaireMonitorOrigin(event: Event, partId: unknown): HTMLElement | null {
    if (!(event.target instanceof HTMLElement) || !mount.contains(event.target)) return null;
    if (partId !== 'competency-question-response' || event.target.dataset.componentId !== 'competency-question-response') return null;
    return event.target;
  }

  function levelingQuestionGenerationOrigin(event: Event, partId: unknown): HTMLElement | null {
    if (!(event.target instanceof HTMLElement) || !mount.contains(event.target)) return null;
    if (partId !== 'leveling-assessment' || event.target.dataset.componentId !== 'leveling-assessment') return null;
    return event.target;
  }

  function opinionMessageOrigin(event: Event, partId: unknown): HTMLElement | null {
    if (!(event.target instanceof HTMLElement) || !mount.contains(event.target)) return null;
    if (partId !== 'community-feed' || event.target.dataset.componentId !== 'community-feed') return null;
    return event.target;
  }

  function dispatchProjectAssistantEvent(origin: HTMLElement, name: string, detail: unknown): void {
    origin.dispatchEvent(new CustomEvent(name, { detail }));
  }

  async function onForgeAuthenticationRequest(event: Event): Promise<void> {
    const detail = (event as CustomEvent<ForgeAuthenticationRequest>).detail;
    const origin = forgeAuthenticationOrigin(event);
    if (!origin || !detail || typeof detail.requestId !== 'string' || !/^lumira-auth-[a-z0-9-]{1,100}$/i.test(detail.requestId)) return;
    const result: ForgeAuthenticationResult = { requestId: detail.requestId };
    forgeCredentials = null;
    const pat = typeof detail.pat === 'string' ? detail.pat.trim() : '';
    const routerKey = typeof detail.routerKey === 'string' ? detail.routerKey.trim() : '';
    if (!pat || pat.length > 4096 || /[\r\n]/.test(pat) || !routerKey || routerKey.length > 300 || /[\r\n]/.test(routerKey)) {
      result.error = 'Informe um PAT válido e a chave do Port Router.';
    } else {
      try {
        const response = await fetch(tunneledForgeEndpoint('/auth/validate'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + pat, 'X-Port-Router-Key': routerKey },
          body: '{}',
          signal: AbortSignal.timeout(15000),
        });
        if (response.status === 401 || response.status === 403) {
          result.error = 'PAT ou chave do Port Router recusada. Confira as duas chaves.';
        } else if (!response.ok) {
          result.error = response.status === 503
            ? 'O Forge local não tem um PAT configurado para validar.'
            : (await readForgeError(response)).message;
        } else {
          forgeCredentials = { pat, routerKey };
        }
      } catch (error) {
        result.error = error instanceof Error && error.name === 'TimeoutError'
          ? 'A validação excedeu 15 segundos. Confira o serviço local e o túnel.'
          : 'Não foi possível validar as chaves pelo túnel Ngrok. Confira o serviço local e tente novamente.';
      }
    }
    if (origin.isConnected) origin.dispatchEvent(new CustomEvent('lumira-forge-authentication-result', { detail: result }));
  }

  async function onProjectAssistantStatus(event: Event): Promise<void> {
    const detail = (event as CustomEvent<{ partId?: string }>).detail;
    const origin = projectAssistantOrigin(event, detail?.partId);
    if (!origin) return;
    const status = await requestCognoscereStatus();
    if (origin.isConnected) dispatchProjectAssistantEvent(origin, 'lumira-project-assistant-status', status);
  }

  async function onProjectAssistantRequest(event: Event): Promise<void> {
    const detail = (event as CustomEvent<ProjectAssistantRequest>).detail;
    const origin = projectAssistantOrigin(event, detail?.partId);
    if (!origin || !detail || typeof detail.prompt !== 'string') return;
    try {
      const result = await converseAboutProject(detail);
      dispatchProjectAssistantEvent(origin, 'lumira-project-assistant-result', { requestId: detail.requestId, reply: result.reply });
    } catch (error) {
      dispatchProjectAssistantEvent(origin, 'lumira-project-assistant-result', {
        requestId: detail.requestId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function onQuestionnaireMonitorRequest(event: Event): Promise<void> {
    const detail = (event as CustomEvent<QuestionnaireMonitorRequest>).detail;
    const origin = questionnaireMonitorOrigin(event, detail?.partId);
    if (!origin || !detail || typeof detail.requestId !== 'string' || !/^[a-z0-9-]{1,100}$/i.test(detail.requestId)) return;
    const result: QuestionnaireMonitorResult = { requestId: detail.requestId };
    try {
      result.reply = (await reviewQuestionnaireAnswers(detail)).reply;
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
    }
    if (origin.isConnected) origin.dispatchEvent(new CustomEvent('lumira-questionnaire-monitor-result', { detail: result }));
  }

  async function onLevelingQuestionGenerationRequest(event: Event): Promise<void> {
    const detail = (event as CustomEvent<LevelingQuestionGenerationRequest>).detail;
    const origin = levelingQuestionGenerationOrigin(event, detail?.partId);
    if (!origin || !detail || typeof detail.requestId !== 'string' || !/^leveling-[a-z0-9-]{1,100}$/i.test(detail.requestId)) return;
    const result: LevelingQuestionGenerationResult = { requestId: detail.requestId };
    try {
      result.questions = await generateLevelingQuestions(detail);
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Falha desconhecida ao gerar questões pelo Cognoscere Forge.';
    }
    if (origin.isConnected) origin.dispatchEvent(new CustomEvent('lumira-leveling-question-generation-result', { detail: result }));
  }

  async function onSubjectSkillUnderstandingRequest(event: Event): Promise<void> {
    const detail = (event as CustomEvent<SubjectSkillUnderstandingRequest>).detail;
    const origin = subjectSkillOrigin(event, detail?.partId);
    if (!origin || !detail || typeof detail.requestId !== 'string' || !/^[a-z0-9-]{1,80}$/i.test(detail.requestId)) return;
    const result: SubjectSkillUnderstandingResult = { requestId: detail.requestId, skillName: typeof detail.skillName === 'string' ? detail.skillName : '' };
    try {
      result.explanation = await understandSubjectSkill(detail);
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
    }
    if (origin.isConnected) origin.dispatchEvent(new CustomEvent('lumira-subject-skill-understanding-result', { detail: result }));
  }

  async function onSubjectFoundationAssistantRequest(event: Event): Promise<void> {
    const detail = (event as CustomEvent<SubjectFoundationAssistantRequest>).detail;
    const origin = subjectFoundationOrigin(event, detail?.partId);
    if (!origin || !detail || !['reflection', 'conversation'].includes(detail.kind)
      || typeof detail.requestId !== 'string' || !/^[a-z0-9-]{1,100}$/i.test(detail.requestId)) return;
    const result: SubjectFoundationAssistantResult = { requestId: detail.requestId, kind: detail.kind };
    try {
      result.reply = await understandSubjectFoundation(detail);
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
    }
    if (origin.isConnected) origin.dispatchEvent(new CustomEvent('lumira-subject-foundation-assistant-result', { detail: result }));
  }

  function dispatchOpinionMessageEvent(origin: HTMLElement, name: string, detail: OpinionCircleMessageDelivery | OpinionCircleMessageRejection): void {
    origin.dispatchEvent(new CustomEvent(name, { detail }));
  }

  function onOpinionMessageSend(event: Event): void {
    const detail = (event as CustomEvent<OpinionCircleMessageSendRequest>).detail;
    const origin = opinionMessageOrigin(event, detail?.partId);
    if (!origin || !detail) return;
    const requestId = typeof detail.requestId === 'string' ? detail.requestId : '';
    const reject = (reason: string): void => dispatchOpinionMessageEvent(origin, 'lumira-opinion-message-rejected', {
      requestId,
      circleId: typeof detail.circleId === 'string' ? detail.circleId : '',
      reason,
    });
    if (!/^[a-z0-9-]{1,80}$/i.test(requestId)) {
      reject('Não foi possível identificar esta mensagem. Tente enviar novamente.');
      return;
    }
    const circleId = typeof detail.circleId === 'string' ? detail.circleId.trim() : '';
    const matchingCircle = [...origin.querySelectorAll<HTMLFormElement>('[data-opinion-message-form]')]
      .some(form => form.dataset.opinionMessageForm === circleId);
    if (!matchingCircle) {
      reject('Esta roda não está disponível nesta página.');
      return;
    }
    const text = typeof detail.text === 'string' ? detail.text.trim() : '';
    if (!text) {
      reject('Escreva uma ideia ou pergunta antes de enviar.');
      return;
    }
    if (text.length > 500) {
      reject('A mensagem pode ter no máximo 500 caracteres.');
      return;
    }
    const actors: Record<OpinionCircleActorRole, { author: string; role: string; tone: string }> = {
      professor: { author: 'Ana Beatriz', role: 'Professora · Comunidade', tone: 'teal' },
      aluno: { author: 'Caio Almeida', role: 'Estudante', tone: 'blue' },
      visitante: { author: 'Visitante', role: 'Participante convidado', tone: 'rose' },
    };
    if (!Object.hasOwn(actors, detail.actorRole)) {
      reject('Escolha um papel válido para participar da roda.');
      return;
    }
    const actor = actors[detail.actorRole];
    const now = new Date();
    const sequence = ++opinionMessageSequence;
    const message: OpinionCircleMessageEvent = {
      type: 'opinion-circle.message',
      id: 'opinion-message-' + String(sequence).padStart(6, '0'),
      sequence,
      circleId,
      author: actor.author,
      role: actor.role,
      tone: actor.tone,
      text,
      createdAt: now.toISOString(),
      time: new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(now),
    };
    const stream = opinionCircleStreams.get(circleId) ?? [];
    stream.push(message);
    if (stream.length > 250) stream.splice(0, stream.length - 250);
    opinionCircleStreams.set(circleId, stream);
    dispatchOpinionMessageEvent(origin, 'lumira-opinion-message-delivered', { requestId, message });
  }

  // startUI pertence ao próprio program e conecta a interface ao sistema retornado.
  mount.addEventListener('lumira-forge-authentication-request', onForgeAuthenticationRequest);
  mount.addEventListener('lumira-project-assistant-status-request', onProjectAssistantStatus);
  mount.addEventListener('lumira-project-assistant-request', onProjectAssistantRequest);
  mount.addEventListener('lumira-questionnaire-monitor-request', onQuestionnaireMonitorRequest);
  mount.addEventListener('lumira-leveling-question-generation-request', onLevelingQuestionGenerationRequest);
  mount.addEventListener('lumira-subject-skill-understanding-request', onSubjectSkillUnderstandingRequest);
  mount.addEventListener('lumira-subject-foundation-assistant-request', onSubjectFoundationAssistantRequest);
  mount.addEventListener('lumira-opinion-message-send', onOpinionMessageSend);
  removeListeners.push(
    () => mount.removeEventListener('lumira-forge-authentication-request', onForgeAuthenticationRequest),
    () => mount.removeEventListener('lumira-project-assistant-status-request', onProjectAssistantStatus),
    () => mount.removeEventListener('lumira-project-assistant-request', onProjectAssistantRequest),
    () => mount.removeEventListener('lumira-questionnaire-monitor-request', onQuestionnaireMonitorRequest),
    () => mount.removeEventListener('lumira-leveling-question-generation-request', onLevelingQuestionGenerationRequest),
    () => mount.removeEventListener('lumira-subject-skill-understanding-request', onSubjectSkillUnderstandingRequest),
    () => mount.removeEventListener('lumira-subject-foundation-assistant-request', onSubjectFoundationAssistantRequest),
    () => mount.removeEventListener('lumira-opinion-message-send', onOpinionMessageSend),
  );

  function startUI(): void {
    if (!bindEvents) {
      render();
      return;
    }
    mount.addEventListener('click', onClick);
    mount.addEventListener('submit', onSubmit);
    const onHashChange = (): void => routeGuard();
    window.addEventListener('hashchange', onHashChange);
    removeListeners.push(
      () => mount.removeEventListener('click', onClick),
      () => mount.removeEventListener('submit', onSubmit),
      () => window.removeEventListener('hashchange', onHashChange),
    );
    routeGuard();
  }

  startUI();
  return Object.freeze({
    ...system,
    destroy: (): void => {
      removeListeners.forEach(remove => remove());
      forgeCredentials = null;
      mount.innerHTML = '';
    },
  });
}
