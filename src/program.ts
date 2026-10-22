/** Monólito interno dos programas: domínios, gateways e API operacional da plataforma. */
import { shell, landing, access, page, createHtmlIterator } from './components';
import type { AgeGradeContext, Answer, AppSnapshot, ClassRoom, CognoscereStatus, CommunityEvent, CommunityPost, Competency, Contracts, Gateway, LoginInput, LumiraSystem, Material, Preview, ProjectAssistantRequest, Role, SessionUser, SondagemPlan, SocialProfile } from './types';

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

  function dispatchProjectAssistantEvent(origin: HTMLElement, name: string, detail: unknown): void {
    origin.dispatchEvent(new CustomEvent(name, { detail }));
  }

  async function onProjectAssistantStatus(event: Event): Promise<void> {
    const detail = (event as CustomEvent<{ partId?: string }>).detail;
    const origin = projectAssistantOrigin(event, detail?.partId);
    if (!origin) return;
    let status: CognoscereStatus;
    try {
      status = window.lumiraDesktop
        ? await window.lumiraDesktop.getCognoscereStatus()
        : { available: false, configured: false, systemModelConfigured: false, model: '', endpoint: '', message: 'A conversa com o serviço local exige abrir o app Electron Lumira.' };
    } catch (error) {
      status = { available: false, configured: false, systemModelConfigured: false, model: '', endpoint: '', message: error instanceof Error ? error.message : String(error) };
    }
    if (origin.isConnected) dispatchProjectAssistantEvent(origin, 'lumira-project-assistant-status', status);
  }

  async function onProjectAssistantRequest(event: Event): Promise<void> {
    const detail = (event as CustomEvent<ProjectAssistantRequest>).detail;
    const origin = projectAssistantOrigin(event, detail?.partId);
    if (!origin || !detail || typeof detail.prompt !== 'string') return;
    try {
      if (!window.lumiraDesktop) throw new Error('Abra o app Electron Lumira para conversar com o Cognoscere local.');
      const result = await window.lumiraDesktop.converseAboutProject(detail);
      dispatchProjectAssistantEvent(origin, 'lumira-project-assistant-result', { requestId: detail.requestId, reply: result.reply });
    } catch (error) {
      dispatchProjectAssistantEvent(origin, 'lumira-project-assistant-result', {
        requestId: detail.requestId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // startUI pertence ao próprio program e conecta a interface ao sistema retornado.
  mount.addEventListener('lumira-project-assistant-status-request', onProjectAssistantStatus);
  mount.addEventListener('lumira-project-assistant-request', onProjectAssistantRequest);
  removeListeners.push(
    () => mount.removeEventListener('lumira-project-assistant-status-request', onProjectAssistantStatus),
    () => mount.removeEventListener('lumira-project-assistant-request', onProjectAssistantRequest),
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
      mount.innerHTML = '';
    },
  });
}
