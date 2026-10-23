/** Componentes, páginas e dados iniciais da plataforma e do Componenting Demo Lab. */

import type { AppSnapshot, CognoscereStatus, CommunityEvent, OpinionCircleActorRole, OpinionCircleMessageDelivery, OpinionCircleMessageEvent, OpinionCircleMessageRejection, OpinionCircleMessageSendRequest, ProjectAssistantRequest, SessionUser, SubjectSkillUnderstandingRequest, SubjectSkillUnderstandingResult } from './types';
import profileCoverAsset from './assets/profile/serra-dourada-cover.webp';
import communityPostAsset from './assets/community/sala-colaborativa.webp';
import studentRampStoryAsset from './assets/stories/student-ramp-experiment.webp';
import studentReadingStoryAsset from './assets/stories/student-reading-evidence.webp';
import studentWaterStoryAsset from './assets/stories/student-water-project.webp';

// Primitivas HTML tipadas

export const e = (v: unknown): string=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export const tags = (list: readonly unknown[]): string=>`<div class="chips">${list.map(t=>`<span class="chip">${e(t)}</span>`).join('')}</div>`;
export const btn=(text: string,route: string,cls=''): string=>`<button class="btn ${cls}" type="button" data-nav="${e(route)}">${e(text)}</button>`;
export const card=(title: string,content: string,cls=''): string=>`<section class="card ${cls}"><h3>${e(title)}</h3>${content}</section>`;
export const sectionHead=(subtitle: string,title: string,description=''): string=>`<header class="section-heading"><span class="eyebrow">${e(subtitle)}</span><h1>${e(title)}</h1>${description?`<p>${e(description)}</p>`:''}</header>`;
export const field=(name: string,label: string,value='',type='text'): string=>`<label class="field"><span>${e(label)}</span><input name="${e(name)}" type="${e(type)}" value="${e(value)}" /></label>`;
export const textarea=(name: string,label: string,value='',rows=4): string=>`<label class="field"><span>${e(label)}</span><textarea rows="${rows}" name="${e(name)}">${e(value)}</textarea></label>`;
export const badge=(text: string): string=>`<span class="pill">${e(text)}</span>`;

// Iterador de composição da interface

/** Composição procedural: cada componente é um produtor iterável de HTML. */
export interface HtmlIterator<TMessage, TResult> {
  next(message?: TMessage): { done: false; value: TResult };
  [Symbol.iterator](): HtmlIterator<TMessage, TResult>;
}

export function createHtmlIterator<TMessage, TResult>(template: (message: TMessage) => TResult): HtmlIterator<TMessage, TResult> {
  if(typeof template!=='function')throw new TypeError('template deve ser uma função');
  return {
    next(message?: TMessage) {return {done:false as const,value:template(message as TMessage)};},
    [Symbol.iterator](){return this;}
  };
}

// Calendário da comunidade

const weekdays=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
export function calendarHeader(events: Array<Pick<CommunityEvent, 'id' | 'title' | 'date'>>,{month=9,year=2026}: { month?: number; year?: number } = {}) {
  const first=new Date(year,month,1).getDay(),length=new Date(year,month+1,0).getDate();
  const cells=Array.from({length:first+length},(_,i)=>{let day=i-first+1;if(day<1)return `<div class="day faded"></div>`;
    const iso=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return `<div class="day"><small>${day}</small>${events.filter(ev=>ev.date===iso).map(ev=>`<a href="#/social/eventos/${e(ev.id)}" class="event-chip">${e(ev.title)}</a>`).join('')}</div>`;
  });
  return `<section class="social-calendar"><div class="cal-toolbar"><span class="eyebrow">AGENDA DA COMUNIDADE</span><strong>Outubro 2026</strong><a href="#/social/eventos" class="text-link">Ver eventos →</a></div><div class="calendar-grid" aria-label="Calendário de eventos de outubro de 2026">${weekdays.map(d=>`<div class="weekday">${d}</div>`).join('')}${cells.join('')}</div></section>`;
}

// Shell e landing

const logo=`<span class="logo-symbol">✳</span> <span>Lumira</span>`;
export function shell({route,user,navItems,content}: {route: string; user: SessionUser; navItems: readonly (readonly [string,string,string])[]; content: string}): string {
  return `<div class="app-shell"><aside class="sidebar"><a class="logo" href="#/">${logo}</a><span class="small-muted sidebar-role">${user.role==='professor'?'Professor':user.role==='aluno'?'Aluno':'Administração'} · Escola Aurora</span><nav aria-label="Navegação da plataforma">${navItems.map(([name,href])=>`<a class="nav-link ${route===href?'active':''}" href="#${e(href)}">${e(name)}</a>`).join('')}</nav><div class="side-footer"><span class="small-muted">Ambiente demonstrativo</span><button type="button" class="quiet" data-action="logout">Sair da conta</button></div></aside><div class="workspace"><header class="topbar"><div class="searchbox"><span>⌕</span><input aria-label="Buscar" placeholder="Buscar matérias, cursos, pessoas..." /></div><div class="topright"><span class="icon-circle">♧</span><a class="user-pill" href="#/perfil"><span class="avatar-mini">${e(user.name[0])}</span><span>${e(user.name)}</span></a></div></header><main id="main" class="workspace-main ${route.startsWith('/social')?'social-main':''}">${content}</main><nav class="bottom-nav" aria-label="Navegação móvel">${[["Início",user.role==='professor'?'/professor/inicio':'/aluno/inicio'],["Aprender",user.role==='professor'?'/professor/materias':'/aluno/atividade'],["Social",'/social'],["Perfil",'/perfil']].map(([n,href])=>`<a href="#${href}" class="${route===href?'active':''}">${n}</a>`).join('')}</nav></div></div>`;
}
export function landing(): string{return `<div class="landing-root"><div class="landing-hero"><nav class="landing-nav"><a class="logo" href="#/">${logo}</a><div class="landing-links"><a href="#/">Plataforma</a><a href="#/">IA pedagógica</a><a href="#/social">Comunidade</a></div><a href="#/acesso" class="btn btn-light">Entrar na plataforma →</a></nav><div class="landing-message"><span class="eyebrow">PLATAFORMA EDUCACIONAL · BNCC E IA ORIENTADA</span><h1>Lumira</h1><p>Materiais personalizados, competências observáveis e experiências de aprendizagem que conectam a sala de aula à comunidade.</p><div class="actions"><a class="btn primary" href="#/acesso">Conhecer a plataforma →</a><a class="btn glass" href="#/acesso">Abrir demonstração</a></div></div></div><div class="landing-features"><article><strong>Especialidade docente</strong><p>O professor orienta a geração de materiais e define critérios da avaliação.</p></article><article><strong>Compreensão e competências</strong><p>Atividades contextualizadas e sondagens de inferência com evidências por critério.</p></article><article><strong>Social e colaboração</strong><p>Perfis, materiais compartilhados e eventos com calendário na comunidade.</p></article></div></div>`}

// Páginas da plataforma

type AuthenticatedSnapshot = AppSnapshot & { user: SessionUser };
const nav=(path: string,label='Abrir'): string=>`<a href="#${e(path)}" class="text-link">${e(label)} →</a>`;
const task=(title: string,sub: string,href: string): string=>`<a class="task" href="#${e(href)}"><span><strong>${e(title)}</strong><small>${e(sub)}</small></span><b>→</b></a>`;
export function access(): string{return `<div class="access-page"><div class="access-art"><a class="logo" href="#/">✳ Lumira</a><h1>Ensinar, aprender<br>e evoluir juntos.</h1><p>Entre como professor ou estudante e explore a plataforma de demonstração.</p></div><section class="login-card"><span class="eyebrow">ACESSO À PLATAFORMA</span><h1>Entrar na Lumira</h1><p>Escolha um papel para navegar pelo protótipo de UX. Não há autenticação real nesta versão.</p><form data-form="login"><label class="field"><span>Perfil de demonstração</span><select name="role"><option value="professor">Professor</option><option value="aluno">Aluno</option><option value="admin">Administração</option></select></label>${field('email','E-mail institucional (somente apresentação)','professora@escola.exemplo','email')}${field('password','Senha (somente apresentação)','','password')}<button class="btn primary wide" type="submit">Entrar na demonstração →</button></form><a href="#/" class="text-link">Voltar para a landing</a></section></div>`}

export function dashboard(s: AuthenticatedSnapshot): string{const teacher=s.user?.role==='professor';return `<div class="page-stack">${hero(teacher?'Bom dia, Helena.':'Olá, Caio.',teacher?'Planeje experiências de compreensão e acompanhe os materiais da turma.':'Acompanhe suas matérias e descubra novas oportunidades para exercitar sua compreensão.','Seu percurso é feito de descobertas.')}<div class="stat-grid">${stat('Competências',s.competencies.length,'Ações aplicadas a assuntos')}${stat(teacher?'Turmas':'Atividades',teacher?s.classes.length:2,'Em acompanhamento')}${stat('Eventos',s.events.length,'Na comunidade')}${stat('Materiais',s.materials.length,'Biblioteca e cursos')}</div><div class="two-columns"><div class="content-stack">${card(teacher?'Seu espaço docente':'Continue aprendendo',teacher?`${task('Ciências · 8º A','Competências, materiais e turma','/professor/materias')}${task('Contratos de IA','Interpretação, geração e avaliação separadas','/professor/monitor')}${task('Sondagem inicial','Plano por contextos de compreensão','/professor/sondagem')}`:`${task('Atividade de Ciências','Investigar e justificar uma situação','/aluno/atividade')}${task('Sondagem contextual','Questões de compreensão por competência','/aluno/sondagem')}${task('Meu percurso','Competências e registros reservados','/aluno/competencias')}`)}${card('Materiais sugeridos',s.materials.map(m=>task(m.title,`${m.subject} · ${m.status}`,'/cursos')).join(''))}</div><aside class="content-stack">${card('Comunidade',`${s.posts.slice(0,2).map(p=>`<p class="mini-post"><b>${e(p.title)}</b><small>${e(p.author)}</small></p>`).join('')}${nav('/social','Ir para a comunidade')}`)}${card('Próximos eventos',s.events.map(v=>task(v.title,`${v.date} · ${v.kind}`,`/social/eventos/${v.id}`)).join(''))}</aside></div></div>`}
function stat(label: string,number: string | number,desc: string): string{return `<article class="stat"><small>${e(label)}</small><strong>${e(number)}</strong><span>${e(desc)}</span></article>`}
function hero(title: string,desc: string,quote: string): string{return `<section class="page-hero"><div class="hero-content"><span class="eyebrow">LUMIRA · ESCOLA AURORA</span><h1>${e(title)}</h1><p>${e(desc)}</p></div><span class="hero-quote">${e(quote)}</span></section>`}
export function subjects(s: AuthenticatedSnapshot): string{return `<div class="page-stack">${hero('Matérias e turmas','A preparação pedagógica começa em um contexto de trabalho concreto.','Aprender é investigar.')}<div class="grid-cards">${s.classes.map(c=>card(`${c.subject} · ${c.name}`,`<p>${c.students} estudantes · ${e(c.grade)}º ano</p>${tags(['3 competências em foco','Biblioteca ativa'])}<div class="actions">${btn('Competências','/professor/competencias','primary')}${btn('Preparar sondagem','/professor/sondagem')}</div>`)).join('')}</div></div>`}
export function competences(s: AuthenticatedSnapshot): string{return `<div class="page-stack">${sectionHead('CURRÍCULO · COMPETÊNCIA APLICADA','Competências e habilidades','Uma competência descreve uma ação sobre um assunto da disciplina; a atividade pode mobilizar diversas habilidades.') }<div class="grid-cards">${s.competencies.map(c=>card(c.title,`<div class="keyval"><span>Ação</span><b>${e(c.action)}</b></div><div class="keyval"><span>Assunto</span><b>${e(c.object)}</b></div><div class="small-muted">BNCC</div>${tags(c.bncc)}<div class="criteria"><b>Critérios observáveis</b>${c.criteria.map(x=>`<div>• ${e(x)}</div>`).join('')}</div>${nav('/professor/monitor','Editar orientações do monitor')}`)).join('')}</div></div>`}
export function monitor(s: AuthenticatedSnapshot): string{const cs=s.contracts,preview=s.preview;return `<div class="page-stack">${sectionHead('FERRAMENTA DOCENTE · IA','Monitor pedagógico','Interpretação curricular, orientação de geração e contrato de avaliação são objetos distintos e versionados.') }<div class="two-columns monitor-columns"><section class="card"><div class="row title-row"><h3>Orientações do professor</h3>${badge('Rascunhos editáveis')}</div><form data-form="contracts">${textarea('interpretation',`Interpretação curricular · revisão ${cs.interpretation.version}`,cs.interpretation.text,3)}${textarea('generation',`Síntese de geração · revisão ${cs.generation.version}`,cs.generation.text,4)}${textarea('evaluation',`Contrato de avaliação · revisão ${cs.evaluation.version}`,cs.evaluation.text,4)}<div class="actions"><button type="submit" class="btn primary">Salvar nova revisão</button><button type="button" data-action="generate-preview" class="btn">Preparar prévia</button></div></form></section><aside class="content-stack">${card('Prévia do material ao aluno',preview?`<span class="eyebrow">EXEMPLO LOCAL — NÃO GERADO PELO METIS</span><p class="sample-question">${e(preview.question)}</p><div class="small-muted">Contrato de geração v${preview.contractVersion} · ${e(preview.status)}</div><button class="btn primary" data-action="publish-activity" ${preview.status.startsWith('publicado')?'disabled':''}>Publicar para a turma (demo)</button>`:`<p>Ao preparar a prévia, o material destinado ao aluno aparece aqui, separado das notas internas do monitor.</p><div class="empty">Aguardando prévia</div>`)}${card('Contexto operacional',`<div class="keyval"><span>Conexão</span><b>Demo local</b></div><div class="keyval"><span>Modelo Metis</span><b>Não conectado</b></div><div class="keyval"><span>Memória</span><b>Não confirmada</b></div><p>Em produção, as versões são fixadas pelo backend e qualquer inferência deve validar schema e permissões.</p>`)}</aside></div></div>`}
export function sondagemProfessor(s: AuthenticatedSnapshot): string{const p=s.sondagem;return `<div class="page-stack">${hero('Planejamento de sondagem','Contextos variados de inferência, relacionados a competências e ao ano/série do estudante.','Diagnóstico por evidências.')}<div class="two-columns"><section class="card"><h3>Configurar plano de nivelamento</h3><p>O repositório histórico prevê um coeficiente idade/série, mas não define a fórmula. Nesta estrutura a relação funciona apenas como referência contextual, sem atribuição automática de nível.</p><form data-form="prepare-sondagem"><div class="form-grid">${field('birthDate','Nascimento (exemplo)','2013-06-14','date')}<label class="field"><span>Ano do Ensino Fundamental</span><select name="grade">${Array.from({length:9},(_,i)=>`<option value="${i+1}" ${i+1===8?'selected':''}>${i+1}º ano</option>`).join('')}</select></label></div><button class="btn primary" type="submit">Preparar plano contextual</button></form>${p?`<div class="result-box"><b>Contexto calculado</b><div>Idade: ${e(p.ageGrade.age??'—')} anos · Série: ${e(p.grade)}º ano</div><div>Idade de referência: ${e(p.ageGrade.referenceAge??'—')} anos · Diferença: ${e(p.ageGrade.deviationYears??'—')}</div><p>Coeficiente de nivelamento: <strong>pendente de política institucional</strong></p></div>`:''}</section><aside class="card"><h3>Composição da sondagem</h3><p>Plano inicial de cinco situações contextualizadas por competência, conforme a concepção original da Lumira. Cada situação pode cobrir mais de uma habilidade; cobertura não é evidência de domínio.</p>${(p?.competencies??s.competencies.slice(0,2)).map(c=>`<div class="plan-item"><b>${e(c.title)}</b><span>5 contextos sugeridos · revisão docente necessária</span></div>`).join('')}${nav('/professor/monitor','Preparar orientações de geração')}</aside></div></div>`}
export function sondagemAluno(s: AuthenticatedSnapshot): string{return `<div class="page-stack">${sectionHead('MATRÍCULA · NIVELAMENTO','Sondagem de compreensão','O percurso começa com situações que permitem mostrar como você interpreta, compara e explica informações.')}${card('Sua sondagem contextual',`<p>A sondagem agrupa diferentes situações de compreensão. Uma resposta isolada não define sua competência; o professor acompanha as evidências produzidas ao longo das atividades.</p><div class="plan-item"><b>Ciências · 8º ano</b><span>5 situações propostas por competência</span></div>${btn('Abrir uma atividade de exemplo','/aluno/atividade','primary')}`)}</div>`}
export function activityAluno(s: AuthenticatedSnapshot): string{return `<div class="page-stack">${sectionHead('CIÊNCIAS · TURMA 8º A','Atividade de compreensão','Questão contextual e resposta escrita. Critérios internos do monitor não fazem parte do enunciado.') }<div class="two-columns"><section class="card"><h3>Uma decisão sobre consumo de energia</h3><p class="sample-question">${e(s.preview?.question||'A biblioteca da escola pretende reduzir seu consumo de energia. Duas propostas de economia foram sugeridas. Explique quais informações seriam necessárias para comparar o resultado de cada proposta e em que situação uma conclusão inicial poderia mudar.')}</p><form data-form="submit-answer">${textarea('answer','Sua interpretação e justificativa',s.answer?.text||'',6)}<div class="actions"><button class="btn primary" type="submit">Enviar resposta</button><button class="btn" type="button" data-action="save-draft">Guardar rascunho nesta tela</button></div></form>${s.answer?`<div class="result-box">Protocolo: ${e(s.answer.id)} · ${e(s.answer.status)}. A avaliação não é simulada.</div>`:''}</section><aside class="card"><h3>Orientações da atividade</h3><p>Observe o contexto, selecione informações relevantes e apresente uma justificativa compreensível. Materiais de apoio podem ser disponibilizados pelo professor.</p>${tags(['Ciências da Natureza','Inferência','Compreensão'])}<div class="subdued">Sua resposta pertence ao espaço pedagógico reservado, não ao feed social.</div></aside></div></div>`}
export function evidenceTeacher(s: AuthenticatedSnapshot): string{return `<div class="page-stack">${sectionHead('ACOMPANHAMENTO RESERVADO','Evidências por critério','O monitor produz atribuições e trechos justificativos; o professor pode revisar ou contestar. Não existe avaliação automática nesta demonstração.')}${card('Tabela de evidências — estrutura',`<table class="data-table"><thead><tr><th>Critério</th><th>Atribuição</th><th>Trecho observável</th><th>Revisão</th></tr></thead><tbody>${s.competencies[0].criteria.map(c=>`<tr><td>${e(c)}</td><td>Aguardando análise</td><td>—</td><td>Pendente</td></tr>`).join('')}</tbody></table><p class="small-muted">O parecer precisa citar um trecho real da resposta e não pode atualizar a progressão automaticamente.</p>`)}</div>`}
export function courses(s: AuthenticatedSnapshot): string{return `<div class="page-stack">${hero('Cursos e materiais','Percursos de compreensão com referências, práticas e contextos variados.','Percursos que fazem sentido.')}<div class="grid-cards">${s.materials.map(m=>card(m.title,`<p>Área: ${e(m.subject)} · estado: ${e(m.status)}</p>${tags(m.skillIds)}<p>Base conceitual, linha de avanço e contextos de aplicação.</p>${s.user.role==='professor'?btn('Editar orientação de geração','/professor/monitor'):btn('Ver atividade de exemplo','/aluno/atividade')}`)).join('')}</div></div>`}
export function profile(s: AuthenticatedSnapshot): string{return `<div class="profile-layout"><div class="profile-banner"><div class="profile-heading"><span class="profile-avatar">${e(s.user.name[0])}</span><div><h1>${e(s.user.name)}</h1><p>${s.user.role==='professor'?'Professora · Ciências':s.user.role==='aluno'?'Estudante · 8º ano':'Administração'} · Escola Aurora</p><span class="music-status">♫ ${e(s.social.music)}</span></div></div></div><div class="stories-bar">${['＋ Criar story',...s.social.stories].map(x=>`<span class="story">${e(x)}</span>`).join('')}</div><div class="tab-strip"><a href="#/perfil">Visão geral</a><a href="#/aluno/competencias">Competências</a><a href="#/social">Posts</a></div><div class="two-columns"><section class="content-stack">${card('Sobre mim',`<p>${e(s.social.bio)}</p>${tags(['Ciências','Educação','Projetos'])}`)}${card('Perfil social personalizável',`<form data-form="social-profile">${textarea('bio','Apresentação pública',s.social.bio,2)}${field('music','Status musical',s.social.music)}<label class="field"><span>Capa do perfil</span><select name="cover"><option value="golden">Fotografia panorâmica</option><option value="blue" ${s.social.cover==='blue'?'selected':''}>Azul minimalista</option></select></label><label class="checkline"><input name="displayProgress" type="checkbox" ${s.social.displayProgress?'checked':''}/> Exibir conquistas autorizadas no perfil</label><button class="btn primary" type="submit">Salvar personalização</button></form>`)}</section><aside class="content-stack">${card('Espaço pedagógico reservado',`<p>As respostas, avaliações, matrícula e progressão não são propriedades públicas do perfil social.</p>${s.user.role==='aluno'?nav('/aluno/competencias','Meu percurso'):nav('/professor/evidencias','Ver evidências da turma')}`)}${card('Posts e publicações',`${nav('/social','Abrir comunidade')}`)}</aside></div></div>`}
export function studentCompetencies(s: AuthenticatedSnapshot): string{return `<div class="page-stack">${sectionHead('ESPAÇO RESERVADO · ALUNO','Meu percurso por competências','A participação em eventos e o leaderboard são independentes das evidências de aprendizagem.')}${s.competencies.map(c=>card(c.title,`${tags(c.bncc)}<p><b>Estado:</b> ${e(c.status)}</p><p><b>Critérios:</b> ${e(c.criteria.join(' · '))}</p><div class="small-muted">Sem mudança automática de nível com base em uma questão.</div>`)).join('')}</div>`}
export function community(s: AuthenticatedSnapshot,{forum=false}: {forum?: boolean} = {}): string{const posts=s.posts.filter(p=>forum?p.space==='forum-docente':true);return `<div class="community-page"><section class="community-hero"><div class="community-title"><h1>${forum?'Fórum de professores':'Comunidade Lumira'}</h1><p>${forum?'Trocas profissionais e curadoria pedagógica.':'Experiências, projetos e aprendizagem compartilhada.'}</p></div>${calendarHeader(s.events)}</section><div class="community-body"><div class="social-tabs"><a class="${!forum?'active':''}" href="#/social">Feed principal</a>${s.user.role==='professor'?`<a class="${forum?'active':''}" href="#/social/forum-docente">Fórum docente</a>`:''}<a href="#/social/eventos">Eventos e encontros</a><a href="#/social/posts/novo" class="push-right">Criar post +</a></div><div class="social-columns"><aside class="content-stack">${card('Assuntos e matérias',`<div class="topic">Ciências da Natureza</div><div class="topic">Linguagens</div><div class="topic">Projetos interdisciplinares</div>`)}${card('Regras de circulação','<p>O espaço social recebe apenas materiais autorizados; entregas individuais e pareceres privados não são publicados.</p>')}</aside><div class="content-stack">${card('Compartilhar na comunidade',`<p>Publique uma experiência, material autorizado ou pergunta vinculada à sua matéria.</p>${btn('Escrever publicação','/social/posts/novo','primary')}`)}${posts.map(p=>`<article class="card post"><div class="post-meta"><b>${e(p.author)}</b><span>${e(p.subject)} · ${e(p.space==='forum-docente'?'Fórum docente':'Feed social')}</span></div><h3>${e(p.title)}</h3><p>${e(p.text)}</p><div class="post-footer">♡ ${e(p.likes)} apoios · Comentários em construção</div></article>`).join('')}</div><aside class="content-stack">${card('Próximos eventos',s.events.map(ev=>task(ev.title,`${ev.date} · ${ev.status}`,`/social/eventos/${ev.id}`)).join(''))}${card('Círculos de estudo',`<div class="topic">Professores do Nordeste</div><div class="topic">Projetos de Ciências</div><div class="topic">BNCC na prática</div>`)}</aside></div></div></div>`}
export function postComposer(s: AuthenticatedSnapshot): string{const canForum=s.user.role==='professor';return `<div class="page-stack">${sectionHead('PUBLICAÇÃO · ÁREA SOCIAL','Criar publicação','O post é separado do documento pedagógico reservado, mesmo quando deriva de um material aprovado.')}${card('Nova publicação',`<form data-form="publish-post">${field('title','Título')}${textarea('text','Texto da publicação','',7)}<label class="field"><span>Superfície social</span><select name="space"><option value="comunidade">Feed de perfis</option>${canForum?'<option value="forum-docente">Fórum docente</option>':''}</select></label><button class="btn primary" type="submit">Publicar (demonstração)</button></form>`)} </div>`}
export function events(s: AuthenticatedSnapshot): string{return `<div class="page-stack">${sectionHead('COMUNIDADE · CALENDÁRIO','Eventos e encontros','O calendário pertence à área social e cada evento possui sua página de participação.')}${s.events.map(ev=>card(ev.title,`<p>${e(ev.date)} · ${e(ev.time)} · ${e(ev.kind)}</p><p>${e(ev.status)}</p>${nav(`/social/eventos/${ev.id}`,'Abrir evento')}`)).join('')}</div>`}
export function eventDetail(s: AuthenticatedSnapshot,id: string): string{const ev=s.events.find(x=>x.id===id);if(!ev)return notFound();return `<div class="page-stack">${hero(ev.title,`${ev.kind} · ${ev.date} · ${ev.time}`,'Aprender e participar.')}<div class="two-columns">${card('Participação',`<p>Atividade: ${e(ev.title)}</p><p>Status: ${e(ev.status)}. Página demonstrativa de inscrição e regras.</p><div class="empty">Inscrições e submissões aguardam integração com backend.</div>`)}${card('Leaderboard do evento',`<p>Classificação circunscrita ao evento, após homologação.</p><div class="empty">Sem resultados homologados.</div><p class="small-muted">Não altera a progressão curricular.</p>`)}</div></div>`}
export function admin(): string{return `<div class="page-stack">${sectionHead('INSTITUIÇÃO · ADMINISTRAÇÃO','Gestão escolar','Convites, vínculos, papéis, políticas de visibilidade e auditoria.')}${card('Controles previstos',`${task('Pessoas e convites','Autorização por instituição e papel','/admin')}${task('Turmas e professores','Atribuições e vínculos','/admin')}${task('Auditoria e moderação','Publicações e permissões','/admin')}<p class="small-muted">Somente interface. A autorização deve ser implementada no Cloudflare Worker.</p>`)}</div>`}
function notFound(): string{return `<section class="card"><h1>Página não encontrada</h1><a href="#/">Voltar ao início</a></section>`}
export function page(route: string,s: AuthenticatedSnapshot): string{if(route==='/perfil')return profile(s);if(route==='/cursos')return courses(s);if(route==='/social')return community(s);if(route==='/social/forum-docente')return s.user.role==='professor'?community(s,{forum:true}):community(s);if(route==='/social/posts/novo')return postComposer(s);if(route==='/social/eventos')return events(s);if(route.startsWith('/social/eventos/'))return eventDetail(s,route.split('/').pop()??'');if(route==='/professor/inicio'||route==='/aluno/inicio')return dashboard(s);if(route==='/professor/materias')return subjects(s);if(route==='/professor/competencias')return competences(s);if(route==='/professor/monitor')return monitor(s);if(route==='/professor/sondagem')return sondagemProfessor(s);if(route==='/professor/evidencias')return evidenceTeacher(s);if(route==='/aluno/sondagem')return sondagemAluno(s);if(route==='/aluno/atividade')return activityAluno(s);if(route==='/aluno/competencias')return studentCompetencies(s);if(route==='/admin')return admin();return notFound();}

// Componentes das telas demo, partes, fixtures e specs derivados das referências.
export type ComponentFixture = Record<string, unknown>;
export type ComponentMockRole = 'professor' | 'aluno' | 'visitante';
export type ComponentMockStatus = 'ready' | 'loading' | 'empty' | 'error' | 'forbidden';

export interface ComponentMockSituation {
  screenId: string;
  fixtureKey: string;
  selectedRegionId: string;
  role: ComponentMockRole;
  status: ComponentMockStatus;
  presentationMode?: 'continuous-list';
  flowIndexOffset?: number;
  componentStates?: Record<string, ComponentMockStatus>;
}

export interface ComponentPageProps {
  data: ComponentFixture;
  situation: ComponentMockSituation;
  prototypeParameters?: Record<string, PrototypeParameterValues>;
}

export interface ComponentPageElement extends HTMLElement {
  configure(props: ComponentPageProps): void;
}

// Componenting Demo Lab: specs, dados, funções e componentes de página do laboratório.
export type ReferenceEvidence = 'observed' | 'derived' | 'navigation-only';

export type PrototypeParameterValue = string | number | boolean | string[];
export type PrototypeParameterValues = Record<string, PrototypeParameterValue>;
export type PrototypeParameterType = 'text' | 'textarea' | 'list' | 'number' | 'range' | 'count' | 'toggle' | 'select';

export interface PrototypeParameterOption {
  value: string;
  label: string;
}

export interface PrototypeParameterSpec {
  id: string;
  label: string;
  type: PrototypeParameterType;
  targetPath?: string;
  defaultValue?: PrototypeParameterValue;
  options?: readonly PrototypeParameterOption[];
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
}

export interface ReferenceRegionSpec {
  id: string;
  title: string;
  description: string;
  responsibility: string;
  presentation: string;
  evidence: ReferenceEvidence;
  fixtureKey: string;
  kind: string;
  parameters: readonly PrototypeParameterSpec[];
}

export interface ReferenceScreenSpec {
  id: string;
  title: string;
  description: string;
  presentation: string;
  evidence: ReferenceEvidence;
  fixtureKey: string;
  defaultComponentId: string;
  regions: readonly ReferenceRegionSpec[];
}

const presentationNotes: Record<string, string> = {
  'workspace-sidebar': 'Apresente esta faixa como o mapa persistente da plataforma: ela situa a pessoa, o papel e as áreas disponíveis sem interromper a página em foco.',
  'workspace-topbar': 'Mostre como busca, criação e notificações ficam reunidas em uma camada comum às páginas autenticadas.',
  'access-brand': 'Apresente a promessa da Lumira antes do acesso. Esta composição é uma proposta visual baseada no mapa de navegação, que não traz uma captura da tela de login.',
  'access-form': 'Demonstre a entrada por papel e os campos de acesso. O botão seleciona um perfil local para explorar a interface; não autentica uma conta.',
  'teacher-hero': 'Comece pela identidade docente: capa, nome, vínculo e ações dão contexto ao restante do perfil. Música e competências reforçam a dimensão pessoal mostrada na referência.',
  'teacher-stories': 'A faixa de stories destaca atualizações breves e projetos recentes. Use os controles da própria peça para demonstrar a seleção e a criação local de um item.',
  'teacher-tabs': 'As abas organizam as áreas do perfil sem misturar identidade, percurso, atividades e publicações em um único bloco.',
  'teacher-progress': 'Apresente os números como um resumo de participação da docente. Os valores são fixture de demonstração e não representam avaliação institucional.',
  'teacher-skills': 'Mostre competências como indicadores visuais de um percurso profissional. Os percentuais são ilustrativos, não uma medida calculada pela plataforma.',
  'teacher-about': 'Este painel reúne biografia, vínculos e redes públicas para explicar como a docente escolhe se apresentar à comunidade.',
  'teacher-activity': 'Mostre publicações ligadas a uma atividade e ao critério que orientou o trabalho. Antes de uma publicação estudantil aparecer no perfil, a plataforma faz uma vistoria de respeito, privacidade e contribuição para a atividade, preservando a expressão e a autoria de quem publicou.',
  'teacher-projects': 'A lista funciona como um conjunto de publicações de projeto: cada cartão abre autoria, objetivo, justificativa, aprendizagem esperada, competências e próximos marcos. Ao criar, a docente percorre um stepper de autoria, justificativa, avaliação da aprendizagem e plano. No fim, o Cognoscere local comenta a proposta e devolve a pessoa ao primeiro passo; só a confirmação humana cria o rascunho.',
  'teacher-agenda': 'A agenda do perfil reúne compromissos de ensino e encontros sociais. A pessoa escolhe a visibilidade padrão e pode publicar cada compromisso como uma postagem, vinculada a uma questão de competência ou a um desafio social.',
  'teacher-personalization': 'Demonstre os controles de aparência e visibilidade do perfil. Alterações são locais à página de demonstração e podem ser ajustadas nos controles da peça.',
  'pedagogy-context': 'Demonstre como matéria, turma, série e contexto de aplicação delimitam o trabalho antes da geração de qualquer atividade.',
  'pedagogy-competency': 'Mostre a relação entre habilidade curricular, competência aplicada e critérios observáveis. A seleção orienta a proposta sem substituir a revisão docente.',
  'pedagogy-activity-builder': 'A orientação docente alimenta uma geração simulada de atividade contextual. O rascunho volta em campos editáveis para que a professora confira contexto, dados, pergunta e relação de conhecimento antes de aprovar.',
  'pedagogy-evidence-review': 'A revisão reúne respostas fictícias, trechos citados e atribuições por critério. A professora pode aceitar ou contestar a leitura; nenhuma evidência isolada altera automaticamente o percurso.',
  'pedagogy-course-sequence': 'A sequência simulada organiza base conceitual, hipótese inicial, representação, mudança de condição e aplicação independente para ensinar uma relação em mais de um contexto.',
  'pedagogy-material-share': 'A publicação cria uma peça compartilhável a partir do material revisado. A resposta privada e a devolutiva individual ficam fora do conteúdo público.',
  'learner-activity-brief': 'O enunciado oferece contexto, informações e uma pergunta aberta sem mostrar os critérios internos de análise.',
  'learner-response': 'O estudante registra e envia sua explicação no espaço reservado. A tentativa fica visível como demonstração local e pode receber uma reflexão simulada.',
  'learner-reflection': 'A reflexão de IA cita a própria resposta e aponta uma relação a considerar. Ela não atribui nota, não classifica o estudante e não altera seu percurso.',
  'leveling-invitation': 'A matrícula parte de um convite institucional que já relaciona estudante, escola, turma e responsável docente. A demo não cria uma conta nem coleta dados pessoais.',
  'leveling-scope': 'A sondagem inicial organiza cinco situações contextualizadas para uma competência, adequadas à série. As questões variam contexto e raciocínio; uma resposta isolada não determina o nível.',
  'leveling-confirmation': 'A confirmação registra somente o vínculo demonstrativo e libera o início da sondagem. Matrícula e respostas pertencem ao acompanhamento reservado, nunca ao histórico público do repositório.',
  'quest-board': 'As competições sociais são eventos cadastrados com organização, período, formato, regulamento, pontuação e etapas de entrega. A inscrição e cada participação ficam registradas no histórico do evento.',
  'quest-principles': 'Pontuação e colocação seguem o regulamento de cada competição. O resultado social não vira nota curricular; respostas pedagógicas permanecem no espaço reservado.',
  'competency-question-context': 'Cada pergunta apresenta uma situação e dados suficientes para tornar observável uma relação da competência em foco, sem sugerir uma fórmula ou revelar o contrato interno de avaliação.',
  'competency-question-response': 'A página percorre cinco contextos para a mesma competência, preserva o rascunho por questão e registra cada envio separadamente. A leitura demonstrativa não pontua nem define domínio.',
  'student-hero': 'Apresente a identidade pública do estudante com o mesmo vocabulário visual do perfil docente, adaptado a um papel discente.',
  'student-stories': 'Mostre projetos e momentos que o estudante escolhe compartilhar. A proposta preserva a natureza social dos stories sem expor registros escolares.',
  'student-skills': 'Apresente temas e competências que o estudante escolheu explorar, sem transformar interesse em nota ou avaliação pública.',
  'student-activity': 'Destaque uma experiência ou publicação escolhida pelo estudante para compartilhar com a comunidade.',
  'student-projects': 'Os projetos aparecem como publicações expansíveis para que autoria, motivo, aprendizagem, competências e próximos passos tenham contexto. Ao criar uma ideia para o Social, o estudante percorre autoria, justificativa, avaliação e plano; o Cognoscere local comenta a proposta e pede confirmação antes de criar o rascunho. A escolha de publicar permanece separada.',
  'student-agenda': 'A agenda integra o perfil do estudante: organiza encontros e atividades, liga questões do histórico ou desafios de eventos sociais e permite escolher o público de cada postagem.',
  'student-tabs': 'As abas separam apresentação pública, percurso autorizado e publicações para que cada área mantenha seu contexto.',
  'student-progress': 'Demonstre apenas indicadores explicitamente liberados para o perfil. O estado vazio ou restrito ajuda a discutir consentimento e privacidade.',
  'student-achievements': 'Apresente conquistas como itens públicos escolhidos pelo estudante. A demonstração não inclui notas, respostas ou pareceres pedagógicos.',
  'student-privacy': 'Use este espaço para explicar o que pode aparecer no perfil e o que permanece no ambiente pedagógico reservado.',
  'community-calendar': 'Abra a página social pelo calendário: eventos e datas dão orientação temporal antes da leitura do feed.',
  'community-tabs': 'A navegação distingue feed, eventos e espaços de participação, mantendo cada conversa no contexto adequado.',
  'community-topics': 'Apresente tópicos como caminhos de descoberta por área e assunto, facilitando a entrada em comunidades relevantes.',
  'community-feed': 'O feed traz somente publicações ligadas a uma atividade e ao critério em foco. Publicações de estudantes passam por vistoria de respeito, privacidade e contribuição acadêmica antes de circular. Nas rodas, grupos específicos ocupam seus lugares em círculo e acompanham a conversa em cartões no centro.',
  'community-aside': 'O painel reúne próximos eventos e grupos como apoio à descoberta, sem competir com o conteúdo principal do feed.',
};

const platformResponsibilities: Record<string, string> = {
  'workspace-sidebar': 'A navegação lateral situa a pessoa nas áreas da Lumira e mantém seu papel visível enquanto ela trabalha.\n\nA plataforma reúne planejamento docente, experiências de aprendizagem, acompanhamento e convivência social. Os acessos ajudam cada pessoa a retomar o percurso no contexto correto, sem tratar essas finalidades como se fossem a mesma atividade.',
  'workspace-topbar': 'A barra superior mantém acessíveis as ações gerais e a identidade da pessoa ao longo da navegação. Ela dá continuidade entre matérias, atividades e espaços de participação, para que uma mudança de página não apague o contexto de trabalho.\n\nA barra apoia a circulação pela plataforma; decisões sobre conteúdo pedagógico continuam ligadas à matéria, às orientações e às evidências produzidas em cada atividade.',
  'access-brand': 'Esta apresentação situa a Lumira como ambiente de ensino, reforço e desenvolvimento de competências apoiado por inteligência generativa. O Capítulo 01 atribui valor à IA quando sua velocidade permite preparar situações diferentes para explicar, questionar e reconstruir um conhecimento.\n\nA proposta é ampliar as formas de compreensão e aplicação, não apenas multiplicar exercícios iguais. Esta parte apresenta essa finalidade antes de a pessoa entrar em uma área de trabalho.',
  'access-form': 'Esta parte conduz a pessoa ao espaço compatível com sua participação na Lumira. A distinção entre docente e estudante organiza responsabilidades diferentes: a docência articula habilidades curriculares, referências e compreensão pretendida; o estudante encontra situações para exercitar, justificar e apresentar o que compreendeu.\n\nO acesso encaminha cada pessoa a esse percurso. Não substitui escolhas pedagógicas nem transforma papéis em níveis de capacidade.',
  'teacher-hero': 'O perfil docente apresenta quem dá início ao ciclo pedagógico e em qual especialidade esse trabalho acontece. Matéria, vínculo e identidade situam a articulação entre habilidades curriculares e competências aplicadas que a docente pretende observar.\n\nA partir desse conhecimento, ela seleciona referências, descreve à IA a compreensão desejada e orienta a criação de materiais. A IA pode oferecer alternativas; cabe à docente verificar se convocam o raciocínio esperado, corrigi-las e decidir o que será disponibilizado.',
  'teacher-stories': 'Os stories dão visibilidade a momentos, projetos ou sequências que a docente escolheu tornar públicos. Podem mostrar como uma ideia se liga a uma situação de ensino e convidar a comunidade a conhecer um material ou uma atividade.\n\nEssa circulação aproxima a prática pedagógica sem transformar o perfil em registro de avaliação. Respostas de estudantes, hipóteses individuais e devolutivas da sondagem permanecem reservadas; o que aparece aqui é uma seleção consciente da autora.',
  'teacher-tabs': 'As abas distinguem as leituras que compõem o perfil docente: identidade, competências, atividades, materiais e outras áreas de trabalho. Essa separação ajuda a encontrar o contexto de uma produção e a compreender o que cada visão apresenta.\n\nTambém mantém visíveis as fronteiras do percurso: elaborar e revisar uma atividade, acompanhar evidências dos estudantes e publicar uma produção são ações relacionadas, mas não intercambiáveis.',
  'teacher-progress': 'Este resumo ajuda a docente a acompanhar sua participação e a continuidade de seu trabalho na plataforma. Indicadores de atividade podem orientar a navegação e a organização, mas não demonstram por si mesmos a qualidade de uma proposta nem a aprendizagem de uma turma.\n\nNo modelo do Capítulo 01, compreender exige observar respostas em situações contextualizadas, considerar hipóteses e revisar a interpretação diante de novos dados. Um número ou uma frequência não substitui a leitura pedagógica dessas evidências.',
  'teacher-skills': 'Esta parte relaciona a especialidade docente às habilidades curriculares e às competências aplicadas que podem orientar uma atividade. Uma proposta pode mobilizar mais de um código da BNCC; a docente também define qual relação ou forma de raciocínio quer tornar observável.\n\nOs indicadores ajudam a localizar esses focos e a preparar materiais coerentes. Não devem reduzir uma sequência a uma lista de códigos: a compreensão aparece nas justificativas e decisões que os estudantes produzem em diferentes contextos.',
  'teacher-about': 'A apresentação reúne a especialidade, a trajetória e os vínculos que a docente escolheu compartilhar. Esse contexto ajuda estudantes e colegas a reconhecer quem selecionou referências e orientou uma produção, além de situar sua relação com uma matéria ou comunidade.\n\nO perfil dá autoria ao conhecimento que circula sem expor o acompanhamento reservado: respostas de turma, dificuldades individuais e pareceres da sondagem não são parte da biografia pública.',
  'teacher-activity': 'Aqui aparecem posts e atividades que nasceram de um trabalho concreto da turma. Cada publicação aponta a atividade e o critério relacionado; assim, quem chega entende o que foi feito e o que o grupo estava investigando. O tom pode ser leve e próximo, sem perder o contexto.\n\nQuando um estudante publica, a plataforma encaminha o conteúdo para uma vistoria de moderação antes de colocá-lo no perfil. A mediação confere se a expressão respeita as pessoas, protege dados privados e contribui para a atividade ou para a conversa acadêmica. Se algo precisar de ajuste, a orientação deve explicar o motivo e preservar a autoria do estudante. Respostas de sondagem e devolutivas individuais continuam reservadas.',
  'teacher-projects': 'Esta parte liga a intenção pedagógica ao trabalho que a turma vai desenvolver. Cada projeto começa com autoria, pergunta e justificativa; depois define o que pode mostrar aprendizagem, quais competências entram em jogo e quais marcos ajudam a conduzir o processo. A docente pode relacionar o projeto a uma sequência de compreensão: apresentar uma situação, solicitar hipóteses, oferecer representações, pedir decisões justificadas e introduzir condições que levem a rever interpretações.\n\nOs cartões expansíveis contam essa história como publicações de trabalho em andamento, mantendo objetivo, motivo, evidências e próximos passos legíveis para a comunidade. Na criação, um stepper organiza autoria, justificativa, aprendizagem e plano. Ao final, o Cognoscere local lê a proposta e devolve um comentário com pontos coerentes, lacunas e ajustes. A revisão retorna ao início para que a docente confirme a criação ou altere os passos. A IA não salva nem publica por conta própria; a confirmação humana cria somente um rascunho local nesta demonstração.',
  'teacher-agenda': 'A agenda organiza no tempo o preparo, a condução e a revisão de atividades docentes, além dos encontros da comunidade. Cada compromisso pode apontar para uma questão de competência do histórico ou para um desafio associado a um evento social, preservando o contexto do trabalho.\n\nA docente define a visibilidade padrão da agenda no perfil e escolhe quando transformar um compromisso em postagem. Respostas, hipóteses e devolutivas individuais permanecem reservadas; publicar um evento não publica o histórico de aprendizagem.',
  'teacher-personalization': 'A personalização permite à docente ajustar a apresentação do perfil e escolher quais informações deseja tornar visíveis. Essa escolha dá controle sobre a identidade pública e a autoria de suas produções.\n\nQuando a adaptação alcança uma experiência de aprendizagem, a orientação do Capítulo 01 é variar contexto, perguntas e apoios para tornar outros raciocínios observáveis, sem alterar a finalidade comum de compreender a relação estudada. Personalizar não é repetir o mesmo exercício com outra aparência.',
  'pedagogy-context': 'A matéria começa por uma fundação que explica sua natureza, o entendimento que pretende construir, a abordagem para investigar esse conhecimento e os aspectos que devem aparecer em situações de aprendizagem. Essas descrições dão à IA um contexto pedagógico antes que ela sugira materiais ou atividades.\n\nA professora associa habilidades por nome ou código curricular e revê a interpretação sugerida para cada uma. A matéria e a turma então situam série, finalidade e possibilidades de participação; variar contextos ajuda a observar a mesma relação sem presumir características do estudante pelo lugar onde vive ou pelo grupo a que pertence.',
  'pedagogy-competency': 'A habilidade curricular funciona como referência; a competência explicita a ação que será exercida sobre um assunto. Só depois dessa relação a equipe escolhe situações, materiais e critérios para observar o trabalho.\n\nUma tarefa pode mobilizar mais de uma habilidade. A revisão precisa indicar que relações aquela questão realmente permite examinar, sem afirmar que a simples presença de códigos comprova aprendizagem.',
  'pedagogy-activity-builder': 'A professora começa pela compreensão que deseja observar e organiza a atividade em uma sequência de questões. Cada etapa oferece um formulário próprio para editar situação, dados, enunciado e a compreensão que aquela questão deve evidenciar; novas questões podem ser incluídas sem um limite fixo.\n\nNa revisão final, a docente percorre o conjunto e confirma se cada pergunta apresenta dados suficientes e pede o raciocínio planejado. O rascunho fica no estado local desta demonstração: aprová-lo registra a revisão na tela, sem publicar nem alterar uma atividade real.',
  'pedagogy-evidence-review': 'A leitura do monitor descreve realizações em relação a critérios específicos e aponta trechos da resposta que sustentam cada atribuição. A professora pode corrigir a leitura ou registrar que o enunciado não produziu evidência suficiente.\n\nUma resposta pode sustentar um critério e não informar outro. A plataforma não transforma um parecer isolado em nota global, progressão curricular ou decisão automática sobre o próximo conteúdo.',
  'pedagogy-course-sequence': 'Um material de compreensão encadeia texto-base, exemplo comentado, prática guiada, tentativa independente e aplicação em outro contexto. Cada segmento explica a ação que pretende exercitar e a evidência que poderá produzir.\n\nA personalização responde a uma necessidade observada: a IA pode sugerir outra representação ou contexto, e a professora revisa a razão da mudança. Concluir uma etapa não basta para declarar a competência consolidada; é preciso observar a ação em uma situação adequada.',
  'pedagogy-material-share': 'Depois da revisão, a professora escolhe como apresentar o material, a quem disponibilizá-lo e quais partes podem circular. A publicação é um objeto próprio, vinculado à matéria e à competência sem carregar a resposta privada que motivou a produção.\n\nO conteúdo social comunica a proposta pedagógica e preserva sua autoria. Respostas individuais, hipóteses e pareceres de sondagem permanecem no acompanhamento reservado.',
  'learner-activity-brief': 'A atividade apresenta uma situação concreta, fornece os dados necessários e pede uma conclusão justificada sem revelar os critérios internos do monitor. O estudante pode estimar, organizar uma tabela, calcular ou explicar uma relação com suas próprias palavras.\n\nO contexto não dita um procedimento. Ele dá condições para que diferentes estratégias mostrem o que a pessoa considerou e como revisou sua hipótese diante de uma mudança.',
  'learner-response': 'A resposta é uma produção pedagógica privada, ligada à revisão da atividade e às referências usadas. O envio confirma uma tentativa sem apagar versões anteriores e sem publicar o texto no perfil social.\n\nA análise posterior deve localizar as evidências na própria resposta. Se faltar informação, isso descreve o que aquela produção mostrou, não uma característica fixa do estudante.',
  'learner-reflection': 'A reflexão devolve ao estudante uma leitura compreensível do que escreveu, com trechos que sustentam os pontos observados e uma oportunidade de continuar pensando.\n\nEla é um apoio para estudar, não uma nota ou decisão automática. O professor pode revisar o parecer, e uma nova resposta em outro contexto é necessária antes de concluir se a compreensão se mantém.',
  'leveling-invitation': 'O nivelamento começa por um convite associado a uma escola, turma e professora. A conferência desse vínculo evita uma matrícula aberta sem contexto e situa a série em que as questões serão apresentadas.\n\nEsta tela demonstra o caminho de um estudante já autorizado pela instituição. Nome, código e vínculo são dados fictícios; a página não realiza cadastro real nem solicita informações de um menor.',
  'leveling-scope': 'A sondagem inicial reúne cinco perguntas para a competência selecionada. Cada uma usa uma situação distinta para observar como o estudante considera dados, sustenta uma hipótese e reage a uma condição alterada.\n\nAs perguntas são ajustadas à idade e à série. O conjunto orienta uma leitura de evidências; não é uma escala automática, e repetir a análise da mesma resposta não conta como uma nova evidência.',
  'leveling-confirmation': 'A confirmação associa o estudante ao percurso de nivelamento da turma e libera as perguntas previstas. A tela explica o que será registrado antes de iniciar, preserva o caráter reservado das respostas e permite retornar ao convite para conferir seus dados.\n\nO vínculo demonstrativo fica apenas no estado local desta prévia. Nenhuma matrícula, identidade ou resposta é gravada em serviço real.',
  'quest-board': 'As quests são competições sociais cadastradas como eventos: cada uma identifica organização, período, regras, formato de participação, critérios de pontuação e etapas com entregas. Antes de entrar, o estudante confere o regulamento e se inscreve no evento escolhido.\n\nA participação mantém um registro rastreável de inscrição, entregas e conclusão. Pontuação e colocação pertencem às regras daquela competição; não são notas, níveis nem evidências automáticas de domínio curricular.',
  'quest-principles': 'A competição informa quem organiza, quem pode participar, como os pontos serão atribuídos e quando cada etapa termina. O histórico da inscrição e das entregas deixa visível o caminho percorrido pela pessoa ou equipe.\n\nO resultado descreve somente aquela disputa social. A professora continua lendo evidências de aprendizagem no espaço pedagógico, com os critérios próprios de cada competência.',
  'competency-question-context': 'A competência em foco é relacionar potência total, duração de uso e consumo. O contrato interno verifica essas relações por critérios, mas a questão mostra ao estudante somente a situação, os dados, as referências liberadas e o pedido de resposta.\n\nOs cinco itens mudam o contexto para observar a transferência da relação estudada. Em cada página, é possível salvar uma tentativa e revisar o próprio texto sem receber um rótulo global.',
  'competency-question-response': 'O estudante percorre cinco perguntas contextualizadas, uma por vez, e mantém um rascunho próprio em cada item. O envio guarda a resposta e apresenta uma reflexão estática de demonstração, claramente separada de uma análise real do modelo.\n\nA síntese mostra quais itens foram respondidos e encaminha o conjunto para revisão. Ela não calcula nota, não declara domínio e não muda automaticamente o próximo conteúdo.',
  'student-hero': 'O perfil apresenta a pessoa estudante, suas produções e aspectos de seu percurso que podem ser compartilhados. Ele permite reconhecer autoria e participação sem converter a identidade pública em prontuário de aprendizagem.\n\nRespostas da sondagem, hipóteses, dificuldades observadas e interpretações da IA pertencem ao acompanhamento reservado e não devem aparecer no perfil por padrão. A pessoa pode mostrar o que escolheu produzir enquanto o trabalho pedagógico conserva seu contexto e suas permissões.',
  'student-stories': 'Os stories abrem espaço para o estudante compartilhar trabalhos, descobertas e produções que escolheu divulgar. Uma representação, explicação ou projeto pode convidar outras pessoas a conhecer o raciocínio que ela expressa.\n\nEssa participação não publica automaticamente respostas de sondagem ou dificuldades individuais. Assim, a comunidade circula conhecimento e o acompanhamento formativo mantém privadas as devolutivas dirigidas a quem aprende e a quem orienta.',
  'student-skills': 'Esta parte reúne temas e competências que o estudante escolheu explorar. A escolha orienta descobertas, projetos e conversas com a comunidade, mas não afirma domínio nem funciona como resultado de avaliação.\n\nA compreensão continua sendo acompanhada no espaço pedagógico por evidências contextualizadas e devolutivas reservadas. O perfil torna visíveis interesses autorizados sem expor respostas, hipóteses ou pareceres individuais.',
  'student-activity': 'Experiências compartilhadas mostram o que o estudante decidiu apresentar à comunidade: uma investigação, uma leitura, uma produção ou uma pergunta que convide outras pessoas a pensar.\n\nA publicação conserva autoria e contexto. Respostas de sondagem e interpretações pedagógicas ficam no ambiente reservado; compartilhar uma experiência não transfere para o perfil o histórico individual de aprendizagem.',
  'student-projects': 'Esta parte ajuda o estudante a transformar uma pergunta em trabalho coletivo e, quando fizer sentido, preparar uma ideia para compartilhar no Social. O stepper organiza autoria, justificativa, aprendizagem que o grupo pretende demonstrar e plano de marcos. O Cognoscere local comenta relações entre objetivo, competências, evidências e etapas, retorna ao início e pergunta se o grupo confirma ou quer revisar. A pessoa decide; a IA não cria nem publica sozinha.\n\nOs projetos ficam em cartões expansíveis com autoria, público, propósito, competências e próximos passos. O rascunho para o Social continua separado da publicação. O perfil reúne experiências autorizadas, não respostas, avaliações ou um prontuário de aprendizagem.',
  'student-agenda': 'A agenda do perfil reúne compromissos, encontros de grupo e eventos da comunidade escolhidos pelo estudante. Um item pode apontar para uma questão de competência já vista — como referência de estudo — ou para uma pergunta/desafio aberto em um evento social. A ligação identifica o contexto da atividade e não torna pública uma resposta do histórico.\n\nA visibilidade padrão da agenda é uma escolha do perfil pessoal. O estudante pode converter um compromisso em postagem quando o público permitido fizer sentido; a publicação mostra o evento e a conexão escolhida, nunca a tentativa ou devolutiva pedagógica. A agenda local desta demonstração não sincroniza com calendários externos.',
  'student-tabs': 'As abas distinguem a apresentação pública, as áreas do percurso de aprendizagem e as produções que o estudante compartilha. Essa organização ajuda a entender para que serve cada informação e quem pode acessá-la.\n\nTambém evita confundir uma atividade social com a sondagem usada para compreender hipóteses e competências. O histórico reservado de respostas e devolutivas conserva seu propósito formativo e não se mistura com o perfil público.',
  'student-progress': 'Esta parte comunica aspectos autorizados do percurso e trata cada indicador como uma pista, não como uma conclusão automática de domínio. O Capítulo 01 propõe observar a compreensão em contextos variados, considerar idade e série e distinguir as evidências que cada resposta realmente apresenta.\n\nUma questão isolada pode revelar uma hipótese ou dificuldade específica, mas não determina sozinha o nível de uma competência. O resumo precisa ser compreensível para o estudante e coerente com a leitura pedagógica que o acompanha.',
  'student-achievements': 'As conquistas destacam participações, produções e marcos que o estudante escolheu apresentar. Elas podem reconhecer esforço ou contribuição e dar visibilidade ao que foi compartilhado com a comunidade.\n\nUma posição em evento ou medalha descreve aquela atividade e suas regras; não equivale ao nível curricular demonstrado. A compreensão de uma competência depende de evidências contextualizadas em diferentes situações e da interpretação pedagógica, não de um selo isolado.',
  'student-privacy': 'Este espaço explica quais informações do perfil podem circular e quais permanecem no ambiente reservado de aprendizagem. A fronteira protege respostas da sondagem, hipóteses, dificuldades identificadas e devolutivas individuais, que servem para orientar o estudo e o planejamento docente.\n\nMateriais e produções escolhidos para divulgação podem alimentar conversas e novas adaptações. A privacidade permite compartilhar conhecimento sem expor a avaliação de quem está aprendendo.',
  'community-calendar': 'O calendário organiza encontros, mostras, desafios e outras atividades coletivas, ajudando a comunidade a saber quando e como participar. Um evento pode partir de materiais preparados em uma sequência e criar novas oportunidades para apresentar ideias e comparar abordagens.\n\nAinda assim, cada evento tem regras, datas e resultados próprios. Uma classificação ou pontuação vale dentro daquela atividade e não deve ser confundida com a progressão curricular ou com o domínio individual do estudante.',
  'community-tabs': 'As abas conduzem entre publicações, eventos e espaços de participação, deixando claro em que contexto ocorre cada interação. No feed, a comunidade consulta e debate conhecimentos; nos eventos, acompanha regras e resultados específicos; nos grupos, sustenta relações e projetos.\n\nEssa organização permite que uma produção revisada circule sem carregar dados do acompanhamento reservado. A área social amplia o trabalho pedagógico, mas não se confunde com sua avaliação.',
  'community-topics': 'Os tópicos ajudam estudantes e docentes a descobrir conversas e materiais ligados a uma matéria, competência ou interesse. A comunidade pode comparar explicações, adaptar referências e propor novas situações para pensar o mesmo conhecimento.\n\nEsse encontro amplia as formas de compreensão descritas no Capítulo 01. Os tópicos organizam conhecimento compartilhável, enquanto diagnósticos, respostas individuais e devolutivas permanecem no espaço de acompanhamento.',
  'community-feed': 'O feed aproxima pessoas em torno de atividades que aconteceram de verdade: cada post mostra a atividade e o critério que deu rumo ao trabalho. A conversa pode ser informal, curiosa e bem-humorada, mantendo espaço para explicar ideias e ouvir outras leituras.\n\nNas rodas de opinião, um grupo específico conversa a partir de uma atividade comum. Os avatares formam a roda e as mensagens aparecem em sequência no centro, para que seja fácil acompanhar quem disse o quê. Publicações de estudantes passam por vistoria de respeito, privacidade e contribuição acadêmica antes de circular; a mediação orienta ajustes sem apagar a expressão da pessoa. Respostas da sondagem e devolutivas individuais seguem reservadas.',
  'community-aside': 'Este painel aproxima eventos, pessoas e grupos que podem transformar uma consulta em participação coletiva. Ele ajuda a descobrir onde uma produção pode ser discutida, que atividade está aberta e quais comunidades compartilham interesses relacionados.\n\nEventos mantêm inscrição, calendário e resultados em seu próprio escopo; quando há pontuação, ela representa o desempenho segundo aquelas regras. Não substitui evidências curriculares contextualizadas nem define, por si só, a compreensão de um estudante.',
};

const prototypeFieldsByRegion: Record<string, readonly PrototypeParameterSpec[]> = {
  'workspace-sidebar': [{ id: 'name', label: 'Nome do perfil', type: 'text', targetPath: 'name' }],
  'workspace-topbar': [{ id: 'name', label: 'Nome do perfil', type: 'text', targetPath: 'name' }],
  'access-brand': [
    { id: 'subtitle', label: 'Chamada', type: 'text', targetPath: 'subtitle' },
    { id: 'description', label: 'Descrição', type: 'textarea', targetPath: 'description' },
  ],
  'access-form': [
    { id: 'title', label: 'Título do formulário', type: 'text', targetPath: 'title' },
    { id: 'email', label: 'E-mail de demonstração', type: 'text', targetPath: 'email' },
    { id: 'roles', label: 'Papéis disponíveis', type: 'list', targetPath: 'roles', hint: 'Um papel por linha.' },
  ],
  'teacher-hero': [
    { id: 'name', label: 'Nome', type: 'text', targetPath: 'name' },
    { id: 'role', label: 'Função', type: 'text', targetPath: 'role' },
    { id: 'school', label: 'Escola', type: 'text', targetPath: 'school' },
    { id: 'quote', label: 'Frase de perfil', type: 'textarea', targetPath: 'quote' },
    { id: 'musicUrl', label: 'Link de música do Spotify', type: 'text', targetPath: 'musicUrl' },
    { id: 'competencies', label: 'Competências', type: 'list', targetPath: 'competencies', hint: 'Uma competência por linha.' },
  ],
  'teacher-stories': [
    { id: 'stories', label: 'Stories', type: 'list', targetPath: 'stories', hint: 'Um story por linha; aplicar atualiza a faixa.' },
    {
      id: 'storyVisibility', label: 'Visibilidade dos novos stories', type: 'select', defaultValue: 'Público',
      options: [
        { value: 'Público', label: 'Público' },
        { value: 'Seguidores', label: 'Seguidores' },
        { value: 'Privado', label: 'Somente eu' },
      ],
    },
    { id: 'allowReplies', label: 'Permitir respostas', type: 'toggle', defaultValue: true },
    { id: 'allowCreate', label: 'Exibir criação de story', type: 'toggle', defaultValue: true },
  ],
  'teacher-tabs': [{ id: 'tabs', label: 'Abas', type: 'list', targetPath: 'tabs', hint: 'Uma aba por linha.' }],
  'teacher-progress': [
    { id: 'progress', label: 'Progresso', type: 'range', targetPath: 'progress', min: 0, max: 100, step: 1 },
    { id: 'streak', label: 'Dias seguidos', type: 'text', targetPath: 'streak' },
    { id: 'xp', label: 'Pontos de percurso', type: 'text', targetPath: 'xp' },
    { id: 'achievements', label: 'Conquistas', type: 'text', targetPath: 'achievements' },
  ],
  'teacher-skills': [{ id: 'skills', label: 'Competências visíveis', type: 'count', targetPath: 'skills', min: 0, max: 10 }],
  'teacher-about': [
    { id: 'bio', label: 'Biografia', type: 'textarea', targetPath: 'bio' },
    { id: 'affiliations', label: 'Vínculos', type: 'list', targetPath: 'affiliations', hint: 'Um vínculo por linha.' },
    { id: 'socials', label: 'Redes sociais', type: 'list', targetPath: 'socials', hint: 'Uma rede por linha.' },
  ],
  'teacher-activity': [
    { id: 'activityTitle', label: 'Título da publicação', type: 'text', targetPath: 'activityTitle' },
    { id: 'activityText', label: 'Texto', type: 'textarea', targetPath: 'activityText' },
    { id: 'activityTags', label: 'Assuntos', type: 'list', targetPath: 'activityTags', hint: 'Um assunto por linha.' },
    { id: 'likes', label: 'Curtidas', type: 'number', targetPath: 'likes', min: 0, max: 9999 },
  ],
  'pedagogy-context': [
    { id: 'subject', label: 'Matéria', type: 'text', targetPath: 'subject' },
    { id: 'className', label: 'Turma', type: 'text', targetPath: 'className' },
    { id: 'context', label: 'Contexto da atividade', type: 'textarea', targetPath: 'context' },
  ],
  'pedagogy-competency': [{ id: 'competencies', label: 'Competências em foco', type: 'list', targetPath: 'competencies', hint: 'Uma competência por linha.' }],
  'pedagogy-activity-builder': [{ id: 'prompt', label: 'Orientação para IA', type: 'textarea', targetPath: 'prompt', hint: 'A simulação demonstra o formato da proposta.' }],
  'pedagogy-course-sequence': [{ id: 'courseTitle', label: 'Título do percurso', type: 'text', targetPath: 'courseTitle' }],
  'learner-activity-brief': [
    { id: 'activityTitle', label: 'Título da atividade', type: 'text', targetPath: 'activityTitle' },
    { id: 'question', label: 'Enunciado', type: 'textarea', targetPath: 'question' },
  ],
  'teacher-projects': [{ id: 'projects', label: 'Projetos visíveis', type: 'count', targetPath: 'projects', min: 0, max: 10 }],
  'teacher-agenda': [{ id: 'agenda', label: 'Compromissos visíveis', type: 'count', targetPath: 'agenda', min: 0, max: 12 }],
  'teacher-personalization': [{ id: 'preferences', label: 'Opções de visibilidade', type: 'list', targetPath: 'preferences', hint: 'Uma opção por linha.' }],
  'student-hero': [
    { id: 'name', label: 'Nome', type: 'text', targetPath: 'name' },
    { id: 'role', label: 'Função', type: 'text', targetPath: 'role' },
    { id: 'school', label: 'Escola', type: 'text', targetPath: 'school' },
    { id: 'competencies', label: 'Interesses', type: 'list', targetPath: 'competencies', hint: 'Um interesse por linha.' },
    { id: 'musicUrl', label: 'Link de música do Spotify', type: 'text', targetPath: 'musicUrl' },
  ],
  'student-stories': [
    { id: 'stories', label: 'Stories', type: 'list', targetPath: 'stories', hint: 'Um story por linha; aplicar atualiza a faixa.' },
    {
      id: 'storyVisibility', label: 'Visibilidade dos novos stories', type: 'select', defaultValue: 'Público',
      options: [
        { value: 'Público', label: 'Público' },
        { value: 'Seguidores', label: 'Seguidores' },
        { value: 'Privado', label: 'Somente eu' },
      ],
    },
    { id: 'allowReplies', label: 'Permitir respostas', type: 'toggle', defaultValue: true },
    { id: 'allowCreate', label: 'Exibir criação de story', type: 'toggle', defaultValue: true },
  ],
  'student-skills': [{ id: 'competencies', label: 'Interesses e competências escolhidas', type: 'list', targetPath: 'competencies', hint: 'Um tema por linha.' }],
  'student-activity': [
    { id: 'activityTitle', label: 'Experiência em destaque', type: 'text', targetPath: 'activityTitle' },
    { id: 'activityText', label: 'Descrição compartilhada', type: 'textarea', targetPath: 'activityText' },
  ],
  'student-projects': [{ id: 'projects', label: 'Projetos e conquistas visíveis', type: 'count', targetPath: 'projects', min: 0, max: 10 }],
  'student-agenda': [{ id: 'agenda', label: 'Compromissos visíveis', type: 'count', targetPath: 'agenda', min: 0, max: 12 }],
  'student-tabs': [{ id: 'tabs', label: 'Abas', type: 'list', targetPath: 'tabs', hint: 'Uma aba por linha.' }],
  'student-progress': [
    { id: 'progress', label: 'Percurso autorizado', type: 'range', targetPath: 'progress', min: 0, max: 100, step: 1 },
    { id: 'streak', label: 'Dias seguidos', type: 'text', targetPath: 'streak', defaultValue: '8' },
    { id: 'xp', label: 'Pontos de percurso', type: 'text', targetPath: 'xp', defaultValue: '1.250' },
    { id: 'achievements', label: 'Conquistas', type: 'text', targetPath: 'achievements', defaultValue: '3' },
  ],
  'student-achievements': [{ id: 'achievements', label: 'Conquistas visíveis', type: 'list', targetPath: 'achievements', hint: 'Uma conquista por linha.' }],
  'student-privacy': [
    { id: 'bio', label: 'Apresentação', type: 'textarea', targetPath: 'bio' },
    { id: 'privacy', label: 'Aviso de privacidade', type: 'textarea', targetPath: 'privacy' },
  ],
  'community-calendar': [
    { id: 'title', label: 'Título', type: 'text', targetPath: 'title' },
    { id: 'subtitle', label: 'Descrição', type: 'text', targetPath: 'subtitle' },
    { id: 'month', label: 'Mês', type: 'text', targetPath: 'month' },
    { id: 'events', label: 'Eventos exibidos', type: 'count', targetPath: 'events', min: 0, max: 31 },
  ],
  'community-tabs': [{ id: 'tabs', label: 'Abas', type: 'list', targetPath: 'tabs', hint: 'Uma aba por linha.' }],
  'community-topics': [
    { id: 'topics', label: 'Tópicos visíveis', type: 'count', targetPath: 'topics', min: 0, max: 20 },
    { id: 'areas', label: 'Áreas', type: 'list', targetPath: 'areas', hint: 'Uma área por linha.' },
  ],
  'community-feed': [
    { id: 'postTitle', label: 'Título da publicação', type: 'text', targetPath: 'posts.0.title' },
    { id: 'postText', label: 'Texto da publicação', type: 'textarea', targetPath: 'posts.0.text' },
    { id: 'postTags', label: 'Assuntos', type: 'list', targetPath: 'posts.0.tags', hint: 'Um assunto por linha.' },
    { id: 'posts', label: 'Publicações visíveis', type: 'count', targetPath: 'posts', min: 0, max: 10 },
  ],
  'community-aside': [
    { id: 'events', label: 'Eventos visíveis', type: 'count', targetPath: 'events', defaultValue: 3, min: 0, max: 12 },
    { id: 'people', label: 'Pessoas sugeridas', type: 'count', targetPath: 'people', min: 0, max: 10 },
    { id: 'groups', label: 'Grupos sugeridos', type: 'count', targetPath: 'groups', min: 0, max: 10 },
  ],
};

const sharedPrototypeParameters: readonly PrototypeParameterSpec[] = [
  { id: 'visible', label: 'Exibir componente', type: 'toggle', defaultValue: true },
  {
    id: 'density', label: 'Densidade', type: 'select', defaultValue: 'regular',
    options: [
      { value: 'compact', label: 'Compacta' },
      { value: 'regular', label: 'Regular' },
      { value: 'spacious', label: 'Ampla' },
    ],
  },
  {
    id: 'accent', label: 'Cor de destaque', type: 'select', defaultValue: 'teal',
    options: [
      { value: 'teal', label: 'Turquesa' },
      { value: 'blue', label: 'Azul' },
      { value: 'violet', label: 'Violeta' },
      { value: 'rose', label: 'Rosa' },
    ],
  },
];

const partSpec = (id: string, title: string, description: string, evidence: ReferenceEvidence, fixtureKey: string): ReferenceRegionSpec =>
  ({
    id, title, description, responsibility: platformResponsibilities[id] ?? description,
    presentation: platformResponsibilities[id] ?? presentationNotes[id] ?? description, evidence, fixtureKey, kind: id,
    parameters: [...sharedPrototypeParameters, ...(prototypeFieldsByRegion[id] ?? [])],
  });

const shellParts = (fixtureKey: string, evidence: ReferenceEvidence): ReferenceRegionSpec[] => [
  partSpec('workspace-sidebar', 'Navegação lateral', 'Marca, áreas da plataforma e papel ativo.', evidence, fixtureKey),
  partSpec('workspace-topbar', 'Barra superior', 'Busca, criação, notificações e identidade.', evidence, fixtureKey),
];

export const referenceScreenSpecs: readonly ReferenceScreenSpec[] = [
  {
    id: 'access', title: 'Acesso', description: 'Tela pública derivada das rotas do mapa do site.',
    presentation: 'A entrada apresenta a proposta da plataforma e oferece acesso demonstrativo por papel. Como a referência disponível é um mapa de navegação, todo o layout desta tela está identificado como derivado.',
    evidence: 'navigation-only', fixtureKey: 'access', defaultComponentId: 'access-brand',
    regions: [
      partSpec('access-brand', 'Apresentação pública', 'Marca, chamada e contexto do produto.', 'derived', 'access'),
      partSpec('access-form', 'Formulário de acesso', 'Papel de demonstração, e-mail, senha e ação de entrada.', 'derived', 'access'),
    ],
  },
  {
    id: 'teacher-profile', title: 'Perfil professor', description: 'Perfil personalizável, stories, competências e atividade.',
    presentation: 'O perfil docente combina identidade profissional, expressão pessoal e atividade compartilhada. A captura de referência sustenta a estrutura visual; dados e interações são cenários locais para demonstração.',
    evidence: 'observed', fixtureKey: 'teacher', defaultComponentId: 'teacher-hero',
    regions: [
      ...shellParts('teacher', 'observed'),
      partSpec('teacher-hero', 'Hero do perfil', 'Capa, identidade, competências, música e ações.', 'observed', 'teacher'),
      partSpec('teacher-stories', 'Stories', 'Faixa de histórias e momentos do perfil.', 'observed', 'teacher'),
      partSpec('teacher-tabs', 'Abas do perfil', 'Navegação entre visões do perfil.', 'observed', 'teacher'),
      partSpec('teacher-progress', 'Progresso geral', 'Indicadores resumidos de participação e percurso.', 'observed', 'teacher'),
      partSpec('teacher-skills', 'Competências principais', 'Competências e percentuais ilustrativos.', 'observed', 'teacher'),
      partSpec('teacher-about', 'Sobre mim', 'Apresentação pública, vínculo e redes.', 'observed', 'teacher'),
      partSpec('teacher-activity', 'Publicações e atividades', 'Post destacado com imagem, texto e reações.', 'observed', 'teacher'),
      partSpec('teacher-projects', 'Projetos em andamento', 'Projetos e estados de participação.', 'observed', 'teacher'),
      partSpec('teacher-agenda', 'Agenda', 'Compromissos do perfil, visibilidade e publicações vinculadas.', 'observed', 'teacher'),
      partSpec('teacher-personalization', 'Personalização', 'Tema, layout, widgets, mídia e visibilidade.', 'observed', 'teacher'),
    ],
  },
  {
    id: 'teacher-workspace', title: 'Espaço docente', description: 'Matéria, turma, competências, atividade, evidências e materiais de compreensão.',
    presentation: 'Proposta derivada da estratégia pedagógica e da especificação de produto. O fluxo demonstra como a professora orienta uma geração, revisa o material, examina evidências e prepara uma sequência, com sugestões de IA simuladas e editáveis.',
    evidence: 'derived', fixtureKey: 'teacher-workspace', defaultComponentId: 'pedagogy-context',
    regions: [
      ...shellParts('teacher-workspace', 'derived'),
      partSpec('pedagogy-context', 'Matéria e turma', 'Especialidade, turma, série e contexto de aplicação.', 'derived', 'teacher-workspace'),
      partSpec('pedagogy-competency', 'Competência e critérios', 'Referência curricular ligada à ação e às evidências esperadas.', 'derived', 'teacher-workspace'),
      partSpec('pedagogy-activity-builder', 'Atividade aberta', 'Editor em etapas com questões adicionáveis, compreensão esperada por questão e revisão final.', 'derived', 'teacher-workspace'),
      partSpec('pedagogy-evidence-review', 'Revisão de evidências', 'Resposta demonstrativa, trechos citados e revisão docente por critério.', 'derived', 'teacher-workspace'),
      partSpec('pedagogy-course-sequence', 'Material de compreensão', 'Sequência progressiva com hipótese, representação e aplicação independente.', 'derived', 'teacher-workspace'),
      partSpec('pedagogy-material-share', 'Compartilhamento do material', 'Publicação revisada com fronteira explícita para dados privados.', 'derived', 'teacher-workspace'),
    ],
  },
  {
    id: 'student-profile', title: 'Perfil aluno', description: 'Variação discente derivada do perfil de referência.',
    presentation: 'Esta variação aplica a linguagem do perfil a um estudante e explicita limites de privacidade. Não havia captura de perfil discente: a composição é uma proposta derivada, com percurso público somente quando autorizado.',
    evidence: 'derived', fixtureKey: 'student', defaultComponentId: 'student-hero',
    regions: [
      ...shellParts('student', 'derived'),
      partSpec('student-hero', 'Hero do aluno', 'Identidade pública discente e escola.', 'derived', 'student'),
      partSpec('student-stories', 'Stories do aluno', 'Momentos e projetos compartilhados.', 'derived', 'student'),
      partSpec('student-tabs', 'Abas do aluno', 'Visão geral, percurso e publicações.', 'derived', 'student'),
      partSpec('student-skills', 'Competências escolhidas', 'Temas e competências de interesse, sem notas ou níveis públicos.', 'derived', 'student'),
      partSpec('student-progress', 'Percurso autorizado', 'Indicadores liberados pelo estudante.', 'derived', 'student'),
      partSpec('student-achievements', 'Conquistas', 'Conquistas demonstrativas autorizadas.', 'derived', 'student'),
      partSpec('student-privacy', 'Apresentação e privacidade', 'Texto público e limites de visibilidade.', 'derived', 'student'),
      partSpec('student-activity', 'Experiências compartilhadas', 'Produções públicas escolhidas pelo estudante.', 'derived', 'student'),
      partSpec('student-projects', 'Projetos em destaque', 'Projetos e conquistas autorizados para exibição.', 'derived', 'student'),
      partSpec('student-agenda', 'Agenda do perfil', 'Compromissos, conexões pedagógicas e eventos sociais publicáveis.', 'derived', 'student'),
    ],
  },
  {
    id: 'student-activity', title: 'Atividade do aluno', description: 'Enunciado contextual, resposta reservada e reflexão simulada por evidências.',
    presentation: 'Proposta derivada da jornada de atividade aberta. O estudante recebe uma versão aprovada, envia uma resposta privada e vê uma reflexão local que cita o próprio texto sem atribuir nota nem alterar o percurso.',
    evidence: 'derived', fixtureKey: 'student-activity', defaultComponentId: 'learner-activity-brief',
    regions: [
      ...shellParts('student-activity', 'derived'),
      partSpec('learner-activity-brief', 'Enunciado e contexto', 'Material aprovado, contexto e pergunta aberta.', 'derived', 'student-activity'),
      partSpec('learner-response', 'Sua resposta', 'Editor privado da tentativa com envio local demonstrativo.', 'derived', 'student-activity'),
      partSpec('learner-reflection', 'Reflexão sobre a resposta', 'Reflexão de IA simulada com evidências da produção enviada.', 'derived', 'student-activity'),
    ],
  },
  {
    id: 'leveling-enrollment', title: 'Matrícula no nivelamento', description: 'Convite escolar, escopo da sondagem e confirmação do vínculo.',
    presentation: 'Proposta derivada da matrícula institucional e da sondagem inicial. O estudante confere seu convite, entende quais competências e questões compõem o percurso e confirma a participação antes de começar.',
    evidence: 'derived', fixtureKey: 'leveling-enrollment', defaultComponentId: 'leveling-invitation',
    regions: [
      ...shellParts('leveling-enrollment', 'derived'),
      partSpec('leveling-invitation', 'Convite e vínculo escolar', 'Turma, professora responsável e convite demonstrativo.', 'derived', 'leveling-enrollment'),
      partSpec('leveling-scope', 'Escopo do nivelamento', 'Competência escolhida e cinco contextos de sondagem.', 'derived', 'leveling-enrollment'),
      partSpec('leveling-confirmation', 'Confirmar matrícula', 'Conferência do vínculo e início da sondagem.', 'derived', 'leveling-enrollment'),
    ],
  },
  {
    id: 'quests', title: 'Competições', description: 'Eventos sociais competitivos com inscrição e participação rastreável.',
    presentation: 'Cada competição é um evento cadastrado com organização, período, formato, regulamento, critérios de pontuação e etapas. O estudante se inscreve, acompanha prazos e registra entregas em uma trilha verificável; o resultado vale apenas dentro do evento e não substitui a avaliação curricular.',
    evidence: 'derived', fixtureKey: 'quests', defaultComponentId: 'quest-board',
    regions: [
      ...shellParts('quests', 'derived'),
      partSpec('quest-board', 'Competições sociais', 'Eventos cadastrados, inscrição e trilha verificável de entregas.', 'derived', 'quests'),
      partSpec('quest-principles', 'Regulamento e participação', 'Regras, critérios de pontuação, histórico e limite curricular do resultado.', 'derived', 'quests'),
    ],
  },
  {
    id: 'competency-questions', title: 'Questões de competência', description: 'Cinco respostas contextualizadas para uma competência em foco.',
    presentation: 'Proposta derivada do plano de sondagem inicial. A página apresenta cinco contextos variados para a mesma competência, guarda rascunhos e respostas por item e deixa a revisão docente separada da experiência do estudante.',
    evidence: 'derived', fixtureKey: 'competency-questions', defaultComponentId: 'competency-question-context',
    regions: [
      ...shellParts('competency-questions', 'derived'),
      partSpec('competency-question-context', 'Competência e plano de questões', 'Ação aplicada, referências e cobertura da sondagem.', 'derived', 'competency-questions'),
      partSpec('competency-question-response', 'Responder questões', 'Stepper de cinco questões, rascunhos, envios e reflexão mock.', 'derived', 'competency-questions'),
    ],
  },
  {
    id: 'community', title: 'Comunidade', description: 'Calendário, feed, assuntos, eventos e grupos.',
    presentation: 'A área social articula calendário, feed, tópicos e grupos em uma página de descoberta. A referência mostra a composição geral; nomes, posts e eventos são conteúdo fictício de apresentação.',
    evidence: 'observed', fixtureKey: 'community', defaultComponentId: 'community-calendar',
    regions: [
      ...shellParts('community', 'observed'),
      partSpec('community-calendar', 'Cabeçalho e calendário', 'Título da comunidade e calendário mensal.', 'observed', 'community'),
      partSpec('community-tabs', 'Abas da comunidade', 'Feed, destaque, círculos, perguntas e eventos.', 'observed', 'community'),
      partSpec('community-topics', 'Tópicos e áreas', 'Assuntos em alta e áreas da comunidade.', 'observed', 'community'),
      partSpec('community-feed', 'Feed central', 'Composer, publicações, imagem e ações sociais.', 'observed', 'community'),
      partSpec('community-aside', 'Painel lateral', 'Eventos, pessoas para seguir e grupos.', 'observed', 'community'),
    ],
  },
];

export const initialComponentData: Record<string, unknown> = {
  access: {
    brand: 'Lumira', title: 'Entrar na Lumira', subtitle: 'Ensinar, aprender e evoluir juntos.',
    description: 'Entre como professor ou estudante e explore a plataforma de demonstração.',
    email: 'ana.beatriz@escola.exemplo', roles: ['Professora', 'Estudante', 'Coordenação'],
  },
  teacher: {
    name: 'Ana Beatriz Silva', handle: '@anabeatriz', role: 'Professora de Língua Portuguesa',
    school: 'Rede Municipal · Vitória da Conquista', quote: 'Educação é caminho, colaboração e destino.',
    competencies: ['Português', 'Comunicação', 'Pensamento crítico'], music: 'Boa Energia · Jota.Pê',
    stories: ['Sala de aula', 'Projetos', 'Formação', 'Livro da semana', 'Evento BNCC'],
    storyDetails: [
      {
        category: 'Prática docente', caption: 'Leitura de crônicas com o território como ponto de partida.',
        body: 'A turma reuniu relatos da própria cidade e comparou as escolhas de linguagem dos textos. Depois, cada grupo explicou que evidência sustentava sua interpretação.',
        publishedAt: 'Hoje, 08:20', likes: 14, replies: ['Vou experimentar essa proposta com meu grupo.'],
      },
      {
        category: 'Projeto', caption: 'O podcast da turma já tem pauta e pergunta-guia.',
        body: 'Organizamos as etapas para que cada episódio apresente uma hipótese, exemplos e uma conclusão revisada a partir das conversas com a comunidade.',
        publishedAt: 'Ontem, 15:10', likes: 9, replies: [],
      },
      {
        category: 'Formação', caption: 'Planejar outra situação ajuda a observar outras justificativas.',
        body: 'Na formação de hoje, estudamos como variar o contexto sem perder a relação de conhecimento que a atividade pretende tornar observável.',
        publishedAt: 'Há 2 dias', likes: 18, replies: ['Ótima síntese da discussão.'],
      },
      {
        category: 'Leitura', caption: 'Livro da semana: histórias que mudam de perspectiva.',
        body: 'Separei trechos que permitem discutir como ponto de vista, escolha de palavras e contexto alteram a interpretação de uma mesma cena.',
        publishedAt: 'Há 4 dias', likes: 7, replies: [],
      },
      {
        category: 'Evento', caption: 'Encontro de práticas de linguagem confirmado.',
        body: 'A roda de conversa vai reunir materiais revisados e perguntas para trocar experiências entre docentes de diferentes anos escolares.',
        publishedAt: 'Há 1 semana', likes: 11, replies: [],
      },
    ],
    tabs: ['Visão geral', 'Competências', 'Trilhas', 'Atividades', 'Posts', 'Arquivos', 'Conquistas'],
    progress: 78, streak: '12', xp: '1.250', achievements: '3',
    skills: [
      { title: 'Língua Portuguesa', value: 90, tone: 'teal' },
      { title: 'Comunicação', value: 75, tone: 'blue' },
      { title: 'Pensamento crítico', value: 70, tone: 'violet' },
      { title: 'Criatividade', value: 60, tone: 'orange' },
      { title: 'Cultura digital', value: 45, tone: 'gray' },
    ],
    bio: 'Educadora, apaixonada por leitura, linguagens e pelo potencial transformador da educação pública. Aqui compartilho práticas, reflexões e projetos que conectam a sala de aula ao mundo real.',
    affiliations: ['Rede Municipal de Vitória da Conquista', 'Escola Municipal Nova Esperança'],
    socials: ['Instagram', 'LinkedIn', 'Facebook', 'YouTube'],
    activityTitle: 'A praça virou personagem',
    activityText: 'A turma leu duas crônicas sobre a mesma praça. Depois, cada grupo contou uma lembrança dali — e a gente percebeu como o lugar muda quando muda quem está contando.',
    activityTags: ['Leitura', 'Crônicas', 'Nossa cidade'],
    likes: '24', comments: '8',
    activityItems: [
      {
        id: 'city-chronicles', kind: 'post', title: 'A praça virou personagem',
        text: 'A turma leu duas crônicas sobre a mesma praça. Depois, cada grupo contou uma lembrança dali — e a gente percebeu como o lugar muda quando muda quem está contando.',
        activityId: 'reading-viewpoints', activityTitle: 'Roda de leitura: diferentes pontos de vista', criterion: 'Comparar narradores e explicar como cada texto muda a imagem da praça.',
        tags: ['Leitura', 'Crônicas', 'Nossa cidade'], publishedAt: 'Há 2 dias', likes: 24, comments: 8,
        image: communityPostAsset, imageAlt: 'Professora e estudantes trabalhando juntos em uma atividade',
      },
      {
        id: 'reading-activity', kind: 'activity', title: 'Qual narrador conhece melhor a praça?',
        text: 'Em duplas, a turma marcou palavras que dão pistas sobre cada narrador. No fim, apareceram leituras bem diferentes — e bons motivos para defender cada uma.',
        activityId: 'reading-viewpoints', activityTitle: 'Roda de leitura: diferentes pontos de vista', criterion: 'Comparar narradores e explicar como cada texto muda a imagem da praça.',
        tags: ['Leitura', 'Pontos de vista', '7º ano'], publishedAt: 'Ontem', likes: 16, comments: 5,
      },
      {
        id: 'class-podcast', kind: 'video', title: 'Um pedacinho do nosso podcast',
        text: 'Antes de gravar, o grupo mudou a pergunta-guia para deixar a conversa mais aberta. Aqui vai um trecho dos bastidores.',
        activityId: 'territory-map', activityTitle: 'Leitura e Território', criterion: 'Pesquisar histórias locais e organizar as fontes usadas pelo grupo.',
        tags: ['Podcast', 'Histórias locais', 'Trabalho em grupo'], publishedAt: 'Há 3 dias', likes: 31, comments: 11,
        image: communityPostAsset, imageAlt: 'Prévia do registro audiovisual de uma atividade colaborativa',
      },
      {
        id: 'reading-territory', kind: 'project', title: 'Nosso mapa de histórias do bairro',
        text: 'Estamos juntando relatos de quem vive por aqui para montar um mapa de histórias. A próxima parada é conversar com mais moradores e conferir de onde veio cada informação.',
        activityId: 'territory-map', activityTitle: 'Leitura e Território', criterion: 'Pesquisar histórias locais e organizar as fontes usadas pelo grupo.',
        tags: ['Projeto', 'Bairro', 'Em andamento'], publishedAt: 'Esta semana', likes: 12, comments: 3,
      },
    ],
    projects: [
      { id: 'seed-neighborhood-map', title: 'Mapa de histórias do bairro', status: 'Em andamento', progress: '8/12 atividades', authors: 'Ana Beatriz e grupo do 7º ano', audience: 'Moradores do bairro', goal: 'Reunir relatos de quem vive no bairro e montar um mapa de histórias locais.', justification: 'As crônicas fizeram a turma perceber que cada pessoa conta o mesmo lugar de um jeito. O mapa abre espaço para ouvir outras lembranças.', summary: 'O grupo já organizou relatos e fontes. Agora quer conversar com mais moradores, conferir as informações e escolher como cada história vai aparecer no mapa.', learningEvidence: 'O grupo vai comparar narrativas, justificar escolhas e registrar de onde veio cada informação.', competencies: ['Comunicação', 'Pensamento crítico', 'Língua Portuguesa'], milestones: [{ title: 'Conversar com moradores', date: '2026-10-24' }, { title: 'Revisar as fontes', date: '2026-10-28' }] },
      { id: 'seed-class-podcast', title: 'Podcast da Turma', status: 'Planejamento', progress: '2/6 atividades', authors: 'Clube de leitura · 7º ano', audience: 'Comunidade escolar', goal: 'Criar episódios curtos com histórias e vozes do bairro.', justification: 'A turma quer compartilhar as leituras e incluir perspectivas diferentes sobre os lugares que fazem parte da vida local.', summary: 'O grupo está definindo pauta, pergunta-guia e tarefas de gravação antes de entrevistar as pessoas convidadas.', learningEvidence: 'Roteiros e episódios vão mostrar como o grupo organiza fontes, explica escolhas e revê perguntas.', competencies: ['Comunicação', 'Colaboração', 'Cultura digital'], milestones: [{ title: 'Fechar a pauta', date: '2026-10-25' }] },
      { id: 'seed-language-fair', title: 'Feira de Linguagens', status: 'Ideia', progress: '0/5 atividades', authors: 'Ana Beatriz e estudantes', audience: 'Famílias e comunidade escolar', goal: 'Preparar uma mostra de produções feitas nas aulas de linguagem.', justification: 'Uma feira permite que os grupos expliquem como chegaram às próprias interpretações e troquem referências com a comunidade.', summary: 'A ideia ainda vai ganhar formato com os estudantes: exposição, roda de leitura, áudio ou uma mistura dessas possibilidades.', learningEvidence: 'Apresentações devem relacionar a produção escolhida às evidências e decisões do grupo.', competencies: ['Criatividade', 'Colaboração', 'Língua Portuguesa'], milestones: [] },
    ],
    agenda: [
      { time: '08:00', date: '2026-10-22', title: 'Aula 7º ano', detail: 'Análise de crônicas', tone: 'blue', elementId: 'question-reading' },
      { time: '10:00', date: '2026-10-22', title: 'Planejamento', detail: 'Sequência didática', tone: 'teal', elementId: '' },
      { time: '14:00', date: '2026-10-23', title: 'Feira de experiências', detail: 'Encontro da comunidade escolar', tone: 'rose', elementId: 'challenge-fair' },
      { time: '16:00', date: '2026-10-24', title: 'Conversa do projeto', detail: 'Mapa de histórias do bairro', tone: 'violet', elementId: 'challenge-reading' },
    ],
    preferences: ['Mostrar status musical', 'Mostrar stories', 'Mostrar conquistas', 'Mostrar redes sociais'],
  },
  student: {
    name: 'Caio Almeida', handle: '@caioalmeida', role: 'Estudante · 8º ano',
    school: 'Escola Municipal Nova Esperança', quote: 'Curiosidade abre novos caminhos.',
    competencies: ['Ciências', 'Leitura', 'Projetos'],
    stories: ['Experimentos', 'Leituras', 'Clube de ciências'],
    storyDetails: [
      {
        category: 'Experimento', caption: 'O que muda quando alteramos uma variável?',
        body: 'No experimento da rampa, mantive o carrinho e a distância iguais e mudei a inclinação. Comparei as tentativas para perceber como a velocidade se relaciona com a altura.',
        image: studentRampStoryAsset, imageAlt: 'Mãos ajustam uma rampa de madeira para testar o movimento de um carrinho, com régua e caderno sobre a mesa.',
        challenge: {
          subject: 'Ciências · movimento',
          prompt: 'A rampa fica mais inclinada, mantendo o mesmo carrinho e o percurso. O que a hipótese prevê?',
          options: ['O carrinho tende a ganhar velocidade mais rapidamente.', 'O carrinho precisa de mais tempo para percorrer a rampa.'],
          correctOption: 0,
          explanation: 'Com maior inclinação, a componente da gravidade no sentido da rampa aumenta. Repetir o teste sem mudar os outros fatores ajuda a comparar as tentativas.',
        },
        publishedAt: 'Hoje, 10:24', likes: 5, replies: ['Boa comparação entre as tentativas!'],
      },
      {
        category: 'Leitura', caption: 'Uma pista importante estava no segundo parágrafo.',
        body: 'Li o texto procurando evidências para a hipótese inicial. A ideia mudou quando relacionei a descrição do ambiente com a decisão da personagem.',
        image: studentReadingStoryAsset, imageAlt: 'Estudante acompanha um parágrafo de um livro aberto e registra observações em um caderno.',
        challenge: {
          subject: 'Leitura · evidência textual',
          prompt: 'Qual pista apoia a leitura de que o ambiente influenciou a decisão da personagem?',
          options: ['Um trecho que relaciona o ambiente à decisão.', 'O fato de o texto ter dois parágrafos.'],
          correctOption: 0,
          explanation: 'Uma interpretação precisa se apoiar em evidências do texto. A quantidade de parágrafos não confirma, por si só, uma hipótese de leitura.',
        },
        publishedAt: 'Ontem, 16:40', likes: 3, replies: [],
      },
      {
        category: 'Projeto', caption: 'Clube de ciências: pergunta da semana.',
        body: 'Nosso grupo está investigando como reduzir o desperdício de água na escola. Primeiro vamos observar os usos; depois, comparar propostas com os mesmos critérios.',
        image: studentWaterStoryAsset, imageAlt: 'Estudantes medem a água usada na horta escolar com um recipiente graduado.',
        challenge: {
          subject: 'Ciências · uso da água',
          prompt: 'Para comparar dois métodos de rega, qual registro mostra melhor qual deles usa menos água?',
          options: ['O volume usado por cada método no mesmo intervalo.', 'A cor das folhas sem medir a água.'],
          correctOption: 0,
          explanation: 'Comparar volumes no mesmo intervalo controla o tempo observado e ajuda a relacionar os dados ao objetivo de reduzir o desperdício.',
        },
        publishedAt: 'Há 3 dias', likes: 8, replies: ['Vamos registrar os horários também?'],
      },
    ],
    tabs: ['Visão geral', 'Meu percurso', 'Publicações', 'Conquistas'], progress: 68,
    skills: [
      { title: 'Investigação científica', value: 76, tone: 'teal' },
      { title: 'Leitura e interpretação', value: 67, tone: 'blue' },
      { title: 'Colaboração', value: 83, tone: 'violet' },
    ],
    activityTitle: 'Uma investigação sobre movimento',
    activityText: 'Na experiência da rampa, mantive o carrinho e o percurso iguais e mudei a inclinação. Comparei as tentativas para entender o que mudou e compartilhei a pergunta com o clube de ciências.',
    activityTags: ['Ciências', 'Investigação', 'Clube de ciências'],
    agenda: [
      { time: '15:30', date: '2026-10-22', title: 'Clube de Ciências', detail: 'Pergunta da semana · consumo de energia', tone: 'blue', elementId: 'question-library' },
      { time: '09:00', date: '2026-10-24', title: 'Feira de experiências', detail: 'Desafio em grupo · comparar propostas', tone: 'teal', elementId: 'challenge-fair' },
      { time: '17:00', date: '2026-10-26', title: 'Roda do Clube de Leitura', detail: 'Compartilhar interpretações e trechos', tone: 'violet', elementId: 'challenge-reading' },
    ],
    projects: [
      { id: 'seed-student-energy', title: 'Energia na escola', status: 'Em andamento', progress: '3 marcos', authors: 'Caio e grupo de Ciências · 8º ano', audience: 'Comunidade escolar', goal: 'Investigar formas de reduzir o consumo de energia na escola.', justification: 'A turma quer entender quais mudanças fariam diferença sem atrapalhar as atividades do dia.', summary: 'O grupo está registrando os horários de uso e comparando propostas com os mesmos critérios.', learningEvidence: 'Tabela de observações, comparação dos dados e justificativa da proposta escolhida.', competencies: ['Pensamento crítico', 'Colaboração', 'Ciências'], milestones: [{ id: 'energy-observe', title: 'Observar o uso das salas', date: '2026-10-24' }, { id: 'energy-compare', title: 'Comparar as propostas', date: '2026-10-29' }] },
      { id: 'seed-student-reading', title: 'Clube de leitura', status: 'Em conversa', progress: '2 encontros', authors: 'Clube de leitura · 8º ano', audience: 'Comunidade escolar', goal: 'Criar uma roda de leitura com diferentes interpretações de uma mesma história.', justification: 'Cada pessoa reparou em pistas diferentes e o grupo quer entender como essas leituras se relacionam.', summary: 'O clube escolhe trechos, registra perguntas e organiza uma conversa aberta para outras turmas.', learningEvidence: 'Trechos selecionados e explicações que relacionem pistas do texto às interpretações.', competencies: ['Comunicação', 'Língua Portuguesa', 'Colaboração'], milestones: [{ id: 'reading-select', title: 'Escolher os trechos', date: '2026-10-25' }] },
      { id: 'seed-student-garden', title: 'Horta com menos desperdício', status: 'Em andamento', progress: '1 marco', authors: 'Caio e equipe da horta', audience: 'Famílias e comunidade escolar', goal: 'Descobrir como cuidar da horta usando água de forma responsável.', justification: 'A equipe percebeu diferenças na umidade dos canteiros e quer comparar maneiras de regar.', summary: 'Os estudantes medem a água usada, anotam os horários e discutem o que os registros permitem concluir.', learningEvidence: 'Medições feitas em intervalos iguais e uma explicação apoiada nos registros.', competencies: ['Investigação científica', 'Pensamento crítico', 'Colaboração'], milestones: [{ id: 'garden-measure', title: 'Medir a irrigação', date: '2026-10-27' }] },
    ],
    achievements: ['Projeto energia da escola', 'Clube de leitura', 'Feira de ciências'],
    bio: 'Aprendo investigando e gosto de transformar perguntas em projetos com a turma.',
    privacy: 'Este perfil exibe somente informações e conquistas autorizadas pelo estudante e pela escola.',
  },
  'teacher-workspace': {
    name: 'Helena Martins', handle: '@helenamartins', role: 'Professora · Ciências da Natureza',
    school: 'Escola Aurora', subject: 'Ciências da Natureza', className: '8º A', grade: '8º ano',
    context: 'Biblioteca escolar · consumo de energia durante vinte dias letivos.',
    competencies: ['Relacionar potência, tempo de uso e consumo elétrico'],
    skills: ['EF08CI03', 'EF08CI04', 'EF08CI05'],
    criteria: ['Considera a potência do conjunto de lâmpadas', 'Incorpora a mudança na duração de uso', 'Justifica a comparação com os dados do contexto'],
    prompt: 'Crie uma questão aberta situada na biblioteca escolar. Apresente interpretações divergentes e dados suficientes para confrontá-las. Solicite uma conclusão justificada. Não indique a fórmula e mantenha os critérios de análise fora do enunciado.',
    activityTitle: 'Consumo de energia na biblioteca',
    activityUnderstanding: 'Comparar os usos relacionando potência total e duração. Perceber que reduzir o tempo de funcionamento pode mudar a conclusão baseada apenas na potência dos aparelhos.',
    activityQuestions: [
      {
        id: 'question-1',
        title: 'Qual proposta reduz mais o consumo?',
        context: 'Oito lâmpadas de 10 W ficam acesas por 6 horas ao dia. Um ventilador de 100 W, antes ligado por 8 horas ao dia, passará a funcionar por 4 horas. O período observado é de 20 dias.',
        prompt: 'Compare o consumo dos dois usos no período. Explique como chegou à conclusão e indique se uma informação adicional poderia mudar sua decisão.',
        understanding: 'Relacionar potência, quantidade de aparelhos e duração de uso para comparar o consumo no mesmo período; justificar a conclusão com os dados e reconhecer o efeito da mudança no horário.',
      },
    ],
    courseTitle: 'Energia em uso: potência, tempo e consumo',
    shareDescription: 'Sequência de compreensão sobre como potência e duração de uso se relacionam ao consumo elétrico.',
  },
  'student-activity': {
    name: 'Caio Almeida', handle: '@caioalmeida', role: 'Estudante · 8º ano', school: 'Escola Aurora',
    activityTitle: 'Uma decisão sobre o consumo da biblioteca',
    context: 'A biblioteca mantém oito lâmpadas de 10 W acesas por 6 horas ao dia durante 20 dias. Um ventilador de 100 W, antes ligado por 8 horas ao dia, passará a funcionar por 4 horas. A escola quer saber qual mudança reduz mais o consumo.',
    question: 'Compare o consumo dos dois usos no período e explique como a mudança no tempo de funcionamento afeta sua conclusão. Você pode organizar os dados como preferir; mostre como chegou à resposta.',
    competencies: ['Relacionar potência, tempo de uso e consumo elétrico'],
  },
  'leveling-enrollment': {
    name: 'Caio Almeida', handle: '@caioalmeida', role: 'Estudante · 8º ano', school: 'Escola Aurora',
    className: '8º A', teacherName: 'Helena Martins', invitationCode: 'AURORA-8A-NIV',
    invitationStatus: 'Convite válido · demonstração local', responsibleAuthorization: 'Autorização escolar registrada neste cenário',
    competency: 'Relacionar potência total, duração de uso e consumo elétrico',
    skills: ['EF08CI03', 'EF08CI04', 'EF08CI05'], questionCount: 5,
    contexts: ['Biblioteca escolar', 'Horta e bomba-d’água', 'Iluminação dos corredores', 'Ventilação do laboratório', 'Carregamento de dispositivos'],
  },
  quests: {
    name: 'Caio Almeida', handle: '@caioalmeida', role: 'Estudante · 8º ano', school: 'Escola Aurora',
    quests: [
      { id: 'energy-library', title: 'Energia em foco', category: 'Competição social · Ciências', status: 'Inscrições abertas', duration: '7 dias', seal: 'Observador de energia',
        organizer: 'Feira de Ciências · Escola Aurora', format: 'Equipes de 3 a 5 estudantes', dateLabel: '2–9 nov. 2026', registrationDeadline: '30 out. 2026', registrationDeadlineAt: '2026-10-30T23:59:59-03:00', participantLimit: 12, registeredCount: 8,
        eventObjective: 'Comparar propostas de economia de energia com dados, justificativas e um limite identificado para cada conclusão.',
        rules: ['A equipe registra uma hipótese e identifica os dados usados.', 'Cada integrante contribui com ao menos uma observação na etapa de evidências.', 'A apresentação final precisa citar uma limitação ou condição ainda não medida.'],
        scoringCriteria: ['Uso correto dos dados · 40 pontos', 'Comparação entre as propostas · 30 pontos', 'Justificativa e limites reconhecidos · 30 pontos'],
        stages: [
          { id: 'hypothesis', title: 'Registrar a hipótese', dueLabel: 'Até 3 nov.', description: 'Escolha uma proposta e explique que dados sustentam a expectativa inicial.', deliverable: 'Hipótese curta com dois dados citados.' },
          { id: 'evidence', title: 'Enviar evidências da equipe', dueLabel: 'Até 6 nov.', description: 'Compare os registros e inclua as contribuições dos participantes.', deliverable: 'Tabela ou relato comparativo com fontes.' },
          { id: 'presentation', title: 'Apresentar a conclusão', dueLabel: 'Encontro · 9 nov.', description: 'Mostre a decisão da equipe e o que ainda precisa ser verificado.', deliverable: 'Síntese final apresentada no evento.' },
        ],
        competency: 'Relacionar potência, duração e consumo', context: 'A biblioteca quer reduzir o uso de energia sem deixar os espaços sem iluminação ou ventilação.',
        challenge: 'Compare duas propostas de horário para os aparelhos. Explique que dados sustentam sua decisão e que condição do ambiente ainda seria preciso observar.',
        deliverable: 'Uma justificativa curta com os dados considerados.',
      },
      { id: 'water-garden', title: 'Rota da água', category: 'Competição social · investigação', status: 'Inscrições abertas', duration: '10 dias', seal: 'Investigador de sistemas',
        organizer: 'Mostra da Horta · Clube de Ciências', format: 'Equipes de 2 a 4 estudantes', dateLabel: '7–17 nov. 2026', registrationDeadline: '5 nov. 2026', registrationDeadlineAt: '2026-11-05T23:59:59-03:00', participantLimit: 10, registeredCount: 5,
        eventObjective: 'Recomendar um calendário de irrigação apoiado em medições e em condições observadas na horta.',
        rules: ['As equipes usam os mesmos cinco dias de registro.', 'A medição adicional precisa ser realizável pela turma.', 'A recomendação deve indicar em que condição ela deixa de valer.'],
        scoringCriteria: ['Leitura dos registros · 35 pontos', 'Qualidade da medição proposta · 35 pontos', 'Limites da recomendação · 30 pontos'],
        stages: [
          { id: 'reading', title: 'Ler os registros', dueLabel: 'Até 10 nov.', description: 'Compare volume e duração nos dois setores da horta.', deliverable: 'Comparação inicial com dados citados.' },
          { id: 'measurement', title: 'Propor uma medição', dueLabel: 'Até 14 nov.', description: 'Indique uma medição adicional e explique por que ela ajuda.', deliverable: 'Plano curto de coleta e justificativa.' },
          { id: 'recommendation', title: 'Defender a recomendação', dueLabel: 'Mostra · 17 nov.', description: 'Apresente a recomendação, uma ressalva e a evidência usada.', deliverable: 'Apresentação da equipe na mostra.' },
        ],
        competency: 'Interpretar evidências de uso de água', context: 'A horta da escola tem dois setores irrigados em horários diferentes. A equipe registrou volume e duração por cinco dias.',
        challenge: 'Proponha como comparar os setores e indique uma medição adicional antes de recomendar mudança no calendário de irrigação.',
        deliverable: 'Uma hipótese acompanhada de evidências e de uma pergunta para a próxima medição.',
      },
      { id: 'table-detective', title: 'Detetives da tabela', category: 'Competição social · desafio de dados', status: 'Inscrições abertas', duration: '1 tarde', seal: 'Leitor de dados',
        organizer: 'Encontro de Dados · Laboratório Escolar', format: 'Individual', dateLabel: '16 nov. 2026 · 14h', registrationDeadline: '12 nov. 2026', registrationDeadlineAt: '2026-11-12T23:59:59-03:00', participantLimit: 30, registeredCount: 18,
        eventObjective: 'Interpretar uma tabela, apresentar uma comparação permitida pelos dados e sinalizar o que ela não permite concluir.',
        rules: ['Todos recebem a mesma tabela no início do encontro.', 'Não vale acrescentar valores que não aparecem no material.', 'A resposta deve explicar uma conclusão possível e uma pergunta em aberto.'],
        scoringCriteria: ['Comparação coerente · 45 pontos', 'Uso dos valores da tabela · 35 pontos', 'Limite reconhecido · 20 pontos'],
        stages: [
          { id: 'inspect', title: 'Inspecionar a tabela', dueLabel: 'Durante o encontro', description: 'Escolha colunas que possam sustentar uma comparação.', deliverable: 'Registro da comparação escolhida.' },
          { id: 'explain', title: 'Enviar interpretação', dueLabel: 'Até 16 nov. · 16h', description: 'Explique sua leitura e uma conclusão que os dados não autorizam.', deliverable: 'Resposta individual com evidências da tabela.' },
        ],
        competency: 'Relacionar padrões e variações em registros', context: 'Um grupo preparou uma tabela de consumo por sala, mas registrou horários e quantidades em colunas diferentes.',
        challenge: 'Escolha uma comparação que a tabela permite fazer, explique sua escolha e descreva uma conclusão que os dados ainda não autorizam.',
        deliverable: 'Uma observação que cite os dados usados e um limite da conclusão.',
      },
    ],
  },
  'competency-questions': {
    name: 'Caio Almeida', handle: '@caioalmeida', role: 'Estudante · 8º ano', school: 'Escola Aurora',
    competency: 'Relacionar potência total, duração de uso e consumo elétrico',
    skills: ['EF08CI03', 'EF08CI04', 'EF08CI05'],
    questions: [
      { id: 'library', title: 'Uma decisão na biblioteca', context: 'Oito lâmpadas de 10 W ficam acesas por 6 horas ao dia. Um ventilador de 100 W, antes ligado por 8 horas, passa a funcionar por 4. O período observado é de 20 dias.',
        prompt: 'Qual uso representa maior consumo no período? Compare as interpretações de que “o aparelho de maior potência sempre consome mais” e de que “o tempo pode mudar a comparação”. Justifique sua conclusão.',
        evidence: 'Relaciona potência do conjunto de lâmpadas, tempo de funcionamento e condição alterada.' },
      { id: 'garden', title: 'A bomba da horta', context: 'A bomba A tem potência de 0,5 kW e funciona 4 horas por dia. A bomba B tem potência de 0,8 kW e funciona 2 horas por dia. Ambas irrigam por 5 dias.',
        prompt: 'Qual bomba usa mais energia nos cinco dias? Explique por que comparar apenas 0,5 kW e 0,8 kW pode levar a uma resposta incompleta.',
        evidence: 'Considera simultaneamente a potência de cada equipamento e o tempo em uso.' },
      { id: 'corridor', title: 'Luzes do corredor', context: 'No bloco A, doze lâmpadas de 8 W ficam acesas por 7 horas. No bloco B, oito lâmpadas de 15 W ficam acesas por 4 horas. Os registros representam um mesmo dia de aula.',
        prompt: 'Compare os dois blocos e explique como o número de lâmpadas e as horas de uso alteram o resultado. Indique uma suposição que você adotou.',
        evidence: 'Calcula ou estima a potência total e combina a quantidade de horas, explicitando uma suposição.' },
      { id: 'lab', title: 'Ventilação do laboratório', context: 'Uma proposta usa um ventilador de 120 W por 3 horas. Outra usa dois aparelhos de 70 W por 4 horas. A sala precisa permanecer ventilada durante as atividades.',
        prompt: 'Compare o consumo das propostas e avalie se o menor valor, sozinho, basta para recomendar uma delas. Que informação sobre a necessidade da sala também importa?',
        evidence: 'Compara potência total e duração, relacionando a decisão às condições de ventilação.' },
      { id: 'devices', title: 'Carregamento para a feira', context: 'Na preparação de uma feira, 24 tablets de 20 W são carregados durante 1,5 hora. Em outro momento, 16 notebooks de 60 W são carregados durante meia hora.',
        prompt: 'Qual grupo demanda mais energia nesse período? Mostre como a quantidade de dispositivos e o tempo entram na comparação e explique o que seus dados não permitem concluir sobre a energia total da feira.',
        evidence: 'Combina potência por dispositivo, quantidade e duração, distinguindo esse recorte do consumo completo da feira.' },
    ],
  },
  community: {
    title: 'Eventos e encontros',
    subtitle: 'Conte o que a turma está fazendo, participe das conversas e encontre seu grupo.',
    month: 'Outubro 2026',
    tabs: ['Feed principal', 'Em destaque', 'Mais recentes', 'Meus círculos', 'Perguntas', 'Eventos'],
    topics: [
      { title: 'Projetos interdisciplinares', posts: '128' },
      { title: 'BNCC na prática', posts: '96' },
      { title: 'Avaliação formativa', posts: '84' },
      { title: 'Uso de IA em sala', posts: '63' },
      { title: 'Leitura e produção de texto', posts: '59' },
    ],
    areas: ['Linguagens', 'Matemática', 'Ciências da Natureza', 'Ciências Humanas', 'Ensino Religioso', 'Arte e Cultura'],
    posts: [
      {
        author: 'Mariana Oliveira', role: 'Professora · Língua Portuguesa', time: 'há 2 horas',
        title: 'A mesma praça, duas histórias',
        text: 'A turma leu duas crônicas sobre a praça do bairro. Depois, cada grupo contou como conhece esse lugar — e apareceram pontos de vista bem diferentes.',
        activityId: 'reading-viewpoints', activityTitle: 'Roda de leitura: diferentes pontos de vista', criterion: 'Comparar narradores e explicar como cada texto muda a imagem da praça.',
        tags: ['Leitura', 'Crônicas', 'Nossa cidade'], likes: '48', comments: '12',
      },
      {
        author: 'Rafael Mendes', role: 'Professor · Matemática', time: 'há 5 horas',
        title: 'A feira virou nossa sala de matemática',
        text: 'A gente comparou preços e quantidades das barracas para pensar em proporção. Que dado vocês pediriam antes de dizer qual oferta compensa?',
        activityId: 'market-proportions', activityTitle: 'Proporção com dados da feira', criterion: 'Relacionar quantidades e preços para justificar uma comparação.',
        tags: ['Matemática', 'Feira do bairro', 'Proporção'], likes: '23', comments: '17',
      },
    ],
    opinionCircles: [
      {
        id: 'reading-circle', label: 'Roda de leitura · 7º ano', title: 'Roda de opiniões',
        activityTitle: 'Roda de leitura: diferentes pontos de vista',
        criterion: 'Comparar narradores e explicar como cada texto muda a imagem da praça.',
        members: [
          { name: 'Ana Beatriz', role: 'Professora', tone: 'teal' },
          { name: 'Caio Almeida', role: 'Estudante', tone: 'blue' },
          { name: 'Lia Santos', role: 'Estudante', tone: 'violet' },
          { name: 'Davi Rocha', role: 'Estudante', tone: 'sun' },
          { name: 'Bia Nunes', role: 'Estudante', tone: 'rose' },
          { name: 'Enzo Lima', role: 'Estudante', tone: 'blue' },
        ],
        messages: [
          { author: 'Ana Beatriz', role: 'Professora', time: '14:04', tone: 'teal', text: 'Qual detalhe fez a praça parecer diferente em cada crônica?' },
          { author: 'Caio Almeida', role: 'Estudante', time: '14:06', tone: 'blue', text: 'Na primeira, o narrador fala do barulho. Na outra, ele repara mais nas pessoas que se encontram ali.' },
          { author: 'Lia Santos', role: 'Estudante', time: '14:08', tone: 'violet', text: 'Eu conheço a praça mais pela feira. Acho que por isso li a segunda história de outro jeito.' },
          { author: 'Ana Beatriz', role: 'Professora', time: '14:10', tone: 'teal', text: 'Boa! Que trecho do texto ajuda a sustentar essa leitura?' },
        ],
      },
      {
        id: 'market-circle', label: 'Grupo da feira · 8º ano', title: 'Roda de investigação',
        activityTitle: 'Proporção com dados da feira',
        criterion: 'Relacionar quantidades e preços para justificar uma comparação.',
        members: [
          { name: 'Rafael Mendes', role: 'Professor', tone: 'teal' },
          { name: 'Nina Costa', role: 'Estudante', tone: 'rose' },
          { name: 'Igor Alves', role: 'Estudante', tone: 'blue' },
          { name: 'Malu Reis', role: 'Estudante', tone: 'violet' },
          { name: 'Theo Dias', role: 'Estudante', tone: 'sun' },
          { name: 'Luca Melo', role: 'Estudante', tone: 'blue' },
        ],
        messages: [
          { author: 'Rafael Mendes', role: 'Professor', time: '10:12', tone: 'teal', text: 'Duas barracas vendem porções de tamanhos diferentes. O que precisamos comparar primeiro?' },
          { author: 'Nina Costa', role: 'Estudante', time: '10:14', tone: 'rose', text: 'O preço por quilo. Só olhar o valor da embalagem pode enganar.' },
          { author: 'Igor Alves', role: 'Estudante', time: '10:16', tone: 'blue', text: 'E vale conferir se a qualidade e o peso informado são mesmo iguais.' },
        ],
      },
    ],
    events: [
      { day: 1, title: 'Webinário: IA na prática docente', time: '14h às 16h', color: 'violet' },
      { day: 3, title: 'Roda de conversa · Avaliação', time: '18h às 20h', color: 'sun' },
      { day: 6, title: 'Oficina · Projetos interdisciplinares', time: '14h às 17h', color: 'teal' },
      { day: 9, title: 'Grupo de estudo · Leitura', time: '19h às 20h', color: 'blue' },
      { day: 11, title: 'Encontro presencial · STEAM', time: '09h às 12h', color: 'rose' },
      { day: 14, title: 'Planejamento colaborativo', time: '16h às 18h', color: 'teal' },
      { day: 16, title: 'Formação BNCC', time: '14h às 17h', color: 'sun' },
      { day: 21, title: 'Clube de leitura · Cultura digital', time: '18h às 20h', color: 'violet' },
      { day: 24, title: 'Feira de experiências', time: '09h às 16h', color: 'blue' },
      { day: 28, title: 'Roda de conversa · Inclusão', time: '18h às 20h', color: 'rose' },
      { day: 30, title: 'Oficina · Recursos didáticos', time: '14h às 17h', color: 'teal' },
    ],
    people: [
      { name: 'Carla Mendes', role: 'Professora · Ciências da Natureza', initials: 'CM', tone: 'teal' },
      { name: 'João Pedro', role: 'Professor · Matemática', initials: 'JP', tone: 'blue' },
      { name: 'Luciana Rocha', role: 'Professora · Língua Portuguesa', initials: 'LR', tone: 'violet' },
    ],
    groups: [
      { name: 'BNCC na prática', members: '1,2 mil membros' },
      { name: 'Professores do Nordeste', members: '820 membros' },
      { name: 'IA na Educação', members: '540 membros' },
    ],
  },
};

function labText(data: ComponentFixture, key: string, fallback = ''): string {
  const value = data[key];
  return typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;
}
function labNumber(data: ComponentFixture, key: string, fallback = 0): number { return typeof data[key] === 'number' ? data[key] as number : fallback; }
function labList<T = unknown>(data: ComponentFixture, key: string): T[] {
  const list = Array.isArray(data[key]) ? data[key] as T[] : [];
  const limits = data.__prototypeLimits as Record<string, number> | undefined;
  return limits && typeof limits[key] === 'number' ? list.slice(0, Math.max(0, limits[key])) : list;
}
function activityQuestionSeeds(data: ComponentFixture): ActivityQuestionSeed[] {
  const value = data.activityQuestions;
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is ActivityQuestionSeed => Boolean(item && typeof item === 'object'
    && typeof (item as ActivityQuestionSeed).id === 'string'
    && typeof (item as ActivityQuestionSeed).title === 'string'
    && typeof (item as ActivityQuestionSeed).context === 'string'
    && typeof (item as ActivityQuestionSeed).prompt === 'string'
    && typeof (item as ActivityQuestionSeed).understanding === 'string'));
}
type DemoPagePartProps = {
  id: string;
  title: string;
  content: string;
  presentation: string;
  evidence: ReferenceEvidence;
  selectedId: string;
  className: string;
  fixture: ComponentFixture;
  situation: ComponentMockSituation;
  prototypeParameters: PrototypeParameterValues;
};
type DemoPagePartInteraction = {
  groups: Record<string, string>;
  toggles: Record<string, boolean>;
  fields: Record<string, string>;
  subjectFoundation: SubjectFoundation | null;
  subjectSkills: string[] | null;
  subjectSkillQuery: string;
  subjectSkillActiveIndex: number;
  subjectSkillMenuOpen: boolean;
  subjectSkillInsight: { skillName: string; requestId: string; status: 'pending' | 'ready' | 'error'; explanation: string } | null;
  activityQuestionIds: string[] | null;
  communityPosts: CommunityPostDraft[];
  opinionCircleMessages: Record<string, CommunityOpinionMessage[]>;
  opinionMessageRequests: Record<string, string>;
  profileActivityItems: ProfileActivityItem[];
  profileProjects: ProfileProjectItem[];
  profileAgendaItems: ProfileAgendaItem[];
  profileAgendaPosts: ProfileAgendaPost[];
  projectChatMessages: ProjectChatMessage[];
  projectReviewStatus: 'idle' | 'pending' | 'ready' | 'error' | 'stale';
  projectReviewText: string;
  projectChatStatus: CognoscereStatus | null;
  projectChatPending: boolean;
  projectMilestones: ProfileProjectMilestone[];
  actions: Record<string, number>;
  communityEvents: Array<{ title: string; date: string; time: string; color: string }>;
  localStories: Array<{
    title: string; caption: string; body: string; category: string; visibility: string; likes: number;
    image: string; orientation: 'portrait' | 'landscape'; filter: string; overlayText: string; textStyle: string; music: string;
    activity: string; linkLabel: string; linkUrl: string; pollQuestion: string; pollOptionA: string;
    pollOptionB: string; quizQuestion: string; quizOptionA: string; quizOptionB: string; quizAnswer: string;
    question: string; countdown: string; mention: string; location: string;
  }>;
  selectedStory: number | null;
  storyAnswers: Record<string, number>;
  storyComposerOpen: boolean;
  storyComposerExpanded: boolean;
  storyComposerTool: string;
  storyOrientation: 'portrait' | 'landscape';
  storyFilter: string;
  storyImage: string;
  storyReplies: Record<string, string[]>;
  aiGenerated: Record<string, boolean>;
  aiReflection: string;
  studentSubmissions: string[];
  reviewFeedback: string;
  shareFeedback: string;
  responseFeedback: string;
  enrollmentFeedback: string;
  questFeedback: string;
  questParticipations: QuestParticipation[];
  questionFeedback: string;
  feedback: string;
};
type QuestCompetitionStage = { id: string; title: string; dueLabel: string; description: string; deliverable: string };
type QuestFixture = {
  id: string; title: string; category: string; status: string; duration: string; seal: string;
  competency: string; context: string; challenge: string; deliverable: string;
  organizer: string; format: string; dateLabel: string; registrationDeadline: string; registrationDeadlineAt: string;
  participantLimit: number; registeredCount: number; eventObjective: string;
  rules: string[]; scoringCriteria: string[]; stages: QuestCompetitionStage[];
};
type QuestParticipationEvent = { action: string; at: string; detail: string };
type QuestStageSubmission = { submittedAt: string; response: string };
type QuestParticipation = {
  questId: string;
  registrationId: string;
  registeredAt: string;
  status: 'registered' | 'in-progress' | 'completed';
  stageSubmissions: Record<string, QuestStageSubmission>;
  history: QuestParticipationEvent[];
};
function questRegistrationOpen(quest: QuestFixture, now = Date.now()): boolean {
  const deadline = Date.parse(quest.registrationDeadlineAt);
  return quest.status === 'Inscrições abertas'
    && quest.registeredCount < quest.participantLimit
    && Number.isFinite(deadline)
    && deadline >= now;
}
function staleProjectReview(interaction: DemoPagePartInteraction): DemoPagePartInteraction {
  if (interaction.projectReviewStatus === 'idle' || interaction.projectReviewStatus === 'stale') return interaction;
  const wasReviewing = interaction.projectReviewStatus === 'pending';
  return {
    ...interaction,
    projectReviewStatus: 'stale',
    projectReviewText: interaction.projectReviewStatus === 'error' ? '' : interaction.projectReviewText,
    projectChatPending: wasReviewing ? false : interaction.projectChatPending,
    projectChatMessages: wasReviewing
      ? interaction.projectChatMessages.filter(message => !(message.kind === 'review' && message.status === 'pending'))
      : interaction.projectChatMessages,
    toggles: { ...interaction.toggles, 'project-review-confirmed': false },
  };
}
type ProfileActivityKind = 'post' | 'activity' | 'video' | 'project';
type ActivityLink = { id: string; title: string; criterion: string };
const PROFILE_ACTIVITY_LINKS: readonly ActivityLink[] = [
  { id: 'reading-viewpoints', title: 'Roda de leitura: diferentes pontos de vista', criterion: 'Comparar narradores e explicar como cada texto muda a imagem da praça.' },
  { id: 'territory-map', title: 'Leitura e Território', criterion: 'Pesquisar histórias locais e organizar as fontes usadas pelo grupo.' },
  { id: 'market-proportions', title: 'Proporção com dados da feira', criterion: 'Relacionar quantidades e preços para justificar uma comparação.' },
  { id: 'energy-consumption', title: 'Consumo de energia na escola', criterion: 'Relacionar potência, quantidade de aparelhos e tempo de uso.' },
];
type ProfileActivityItem = {
  id: string;
  kind: ProfileActivityKind;
  title: string;
  text: string;
  activityId: string;
  activityTitle: string;
  criterion: string;
  tags: string[];
  publishedAt: string;
  likes: number;
  comments: number;
  image?: string;
  imageAlt?: string;
};
type CommunityPostDraft = {
  id: string;
  title: string;
  text: string;
  activityId: string;
  activityTitle: string;
  criterion: string;
  tags: string[];
  author: string;
  role: string;
  time: string;
  likes: number;
  comments: number;
};
type CommunityOpinionMessage = OpinionCircleMessageEvent;
type SubjectFoundation = {
  name: string;
  nature: string;
  understanding: string;
  approach: string;
  aspects: string;
  skills: string[];
};
type ActivityQuestionSeed = { id: string; title: string; context: string; prompt: string; understanding: string };
type SubjectSkillSuggestion = { name: string; understanding: string };
const SUBJECT_SKILL_SUGGESTIONS: readonly SubjectSkillSuggestion[] = [
  { name: 'EF08CI03 · Transformações de energia', understanding: 'A IA lê esta habilidade como investigação das transformações de energia em aparelhos e situações, relacionando cada explicação ao fenômeno observado.' },
  { name: 'EF08CI04 · Consumo de energia elétrica', understanding: 'A IA procura relações entre potência, quantidade de aparelhos e duração de uso, conferindo se a justificativa usa os dados do contexto.' },
  { name: 'EF08CI05 · Uso consciente de energia', understanding: 'A IA considera propostas de redução do consumo junto com as necessidades e condições do ambiente em que serão aplicadas.' },
  { name: 'Investigar fenômenos', understanding: 'A IA espera uma pergunta investigável, observações ou dados e uma conclusão ligada ao que foi observado.' },
  { name: 'Interpretar evidências', understanding: 'A IA procura uma relação explícita entre evidência, afirmação e limite do que os dados permitem concluir.' },
  { name: 'Comunicar explicações científicas', understanding: 'A IA procura uma explicação compreensível que conecte conceitos, evidências e escolhas feitas durante a investigação.' },
  { name: 'Comparar modelos e representações', understanding: 'A IA observa o que cada representação destaca, quais relações preserva e onde deixa de explicar o fenômeno.' },
  { name: 'Avaliar soluções em contexto', understanding: 'A IA considera critérios, efeitos esperados e restrições locais antes de comparar ou recomendar uma solução.' },
];
type ProfileProjectMilestone = { id: string; title: string; date: string };
type ProjectChatMessage = { id: string; role: 'student' | 'assistant'; text: string; kind?: 'conversation' | 'reflection' | 'review'; revision?: number; status?: 'pending' | 'error' };
type ProfileProjectItem = {
  id: string; title: string; authors: string; goal: string; justification: string; summary: string; audience: string;
  learningEvidence: string;
  competencies: string[]; milestones: ProfileProjectMilestone[]; socialDraft: boolean; createdAt: string;
};
type ProfileAgendaElement = { id: string; type: 'competency-question' | 'social-challenge'; title: string; detail: string };
type ProfileAgendaItem = { id: string; title: string; detail: string; date: string; time: string; elementId: string };
type ProfileAgendaPost = ProfileAgendaItem & { visibility: 'school' | 'community'; publishedAt: string };
type PlatformReferenceNode = { id: string; label: string; description: string; children?: readonly PlatformReferenceNode[] };
type PlatformReferenceContext = { path: string[]; query: string; segmentStart: number; caret: number };
type PlatformReferenceField = HTMLInputElement | HTMLTextAreaElement;
type PlatformReferenceMockProfile = {
  id: string; name: string; handle: string; group: 'alunos' | 'professores'; role: string; school: string; className: string;
  summary: string; biography: string; competencies: Array<{ id: string; label: string }>;
  agenda: Array<{ id: string; title: string; date: string; context: string }>;
};
const PLATFORM_REFERENCE_MOCK_PROFILES: readonly PlatformReferenceMockProfile[] = [
  {
    id: 'caio-almeida', name: 'Caio Almeida', handle: '@caioalmeida', group: 'alunos', role: 'Estudante · 8º ano', school: 'Escola Aurora', className: '8º A',
    summary: 'Aluno fictício · 8º ano · Escola Aurora', biography: 'Aprendo investigando e gosto de transformar perguntas em projetos com a turma.',
    competencies: [
      { id: 'investigacao-cientifica', label: 'Investigação científica' },
      { id: 'leitura-e-interpretacao', label: 'Leitura e interpretação' },
      { id: 'colaboracao', label: 'Colaboração' },
    ],
    agenda: [
      { id: 'clube-de-ciencias', title: 'Clube de Ciências', date: '2026-10-22', context: 'Questão sobre consumo de energia' },
      { id: 'feira-de-experiencias', title: 'Feira de experiências', date: '2026-10-24', context: 'Desafio em grupo' },
    ],
  },
  {
    id: 'lia-santos', name: 'Lia Santos', handle: '@liasantos', group: 'alunos', role: 'Estudante · 7º ano', school: 'Escola Aurora', className: '7º B',
    summary: 'Aluna fictícia · 7º ano · Escola Aurora', biography: 'Gosto de comparar interpretações e encontrar trechos que sustentam uma ideia.',
    competencies: [
      { id: 'leitura-e-interpretacao', label: 'Leitura e interpretação' },
      { id: 'comunicacao', label: 'Comunicação' },
      { id: 'colaboracao', label: 'Colaboração' },
    ],
    agenda: [
      { id: 'roda-de-leitura', title: 'Roda do Clube de Leitura', date: '2026-10-26', context: 'Compartilhar interpretações e trechos' },
      { id: 'feira-de-experiencias', title: 'Feira de experiências', date: '2026-10-24', context: 'Apresentação de projetos' },
    ],
  },
  {
    id: 'ana-beatriz-silva', name: 'Ana Beatriz Silva', handle: '@anabeatriz', group: 'professores', role: 'Professora · Língua Portuguesa', school: 'Escola Aurora', className: '7º ano',
    summary: 'Professora fictícia · Língua Portuguesa · Escola Aurora', biography: 'Organiza rodas de leitura e acompanha como a turma sustenta diferentes interpretações.',
    competencies: [
      { id: 'leitura-e-interpretacao', label: 'Leitura e interpretação' },
      { id: 'argumentacao', label: 'Argumentação com evidências' },
      { id: 'mediacao-de-grupo', label: 'Mediação de grupo' },
    ],
    agenda: [
      { id: 'roda-de-leitura', title: 'Roda de leitura · diferentes pontos de vista', date: '2026-10-21', context: 'Encontro aberto à comunidade escolar' },
      { id: 'planejamento-colaborativo', title: 'Planejamento colaborativo', date: '2026-10-14', context: 'Revisão de critérios de leitura' },
    ],
  },
  {
    id: 'helena-martins', name: 'Helena Martins', handle: '@helenamartins', group: 'professores', role: 'Professora · Ciências da Natureza', school: 'Escola Aurora', className: '8º A',
    summary: 'Professora fictícia · Ciências da Natureza · Escola Aurora', biography: 'Planeja situações investigativas e revisa as evidências antes de orientar a turma.',
    competencies: [
      { id: 'investigacao-cientifica', label: 'Investigação científica' },
      { id: 'pensamento-critico', label: 'Pensamento crítico' },
      { id: 'avaliacao-formativa', label: 'Avaliação formativa' },
    ],
    agenda: [
      { id: 'clube-de-ciencias', title: 'Clube de Ciências', date: '2026-10-22', context: 'Questão sobre potência e consumo' },
      { id: 'feira-de-experiencias', title: 'Feira de experiências', date: '2026-10-24', context: 'Mostra de projetos de Ciências' },
    ],
  },
  {
    id: 'mariana-oliveira', name: 'Mariana Oliveira', handle: '@marianaoliveira', group: 'professores', role: 'Professora · Língua Portuguesa', school: 'Escola Aurora', className: '7º A',
    summary: 'Professora fictícia · Língua Portuguesa · Escola Aurora', biography: 'Trabalha com crônicas, narradores e leitura compartilhada do território.',
    competencies: [
      { id: 'leitura-e-interpretacao', label: 'Leitura e interpretação' },
      { id: 'comunicacao', label: 'Comunicação' },
      { id: 'pensamento-critico', label: 'Pensamento crítico' },
    ],
    agenda: [
      { id: 'roda-de-leitura', title: 'Roda de leitura · histórias do bairro', date: '2026-10-21', context: 'Comparação de narradores' },
    ],
  },
];
const platformReferenceMockProfileNode = (profile: PlatformReferenceMockProfile): PlatformReferenceNode => ({
  id: profile.id, label: profile.name, description: profile.summary, children: [
    { id: 'nome', label: 'Nome', description: profile.name },
    { id: 'identificador', label: 'Identificador', description: 'Perfil demonstrativo · ' + profile.handle },
    { id: 'papel', label: 'Papel', description: profile.role },
    { id: 'escola', label: 'Escola', description: profile.school },
    { id: 'turma', label: 'Turma', description: profile.className },
    { id: 'biografia', label: 'Biografia', description: profile.biography },
    { id: 'competencias', label: 'Competências', description: 'Competências de demonstração do perfil', children: profile.competencies.map(item => ({ ...item, description: 'Competência mock do perfil · ' + item.label })) },
    { id: 'agenda', label: 'Agenda', description: 'Itens de demonstração do calendário do perfil', children: profile.agenda.map(item => ({
      id: item.id, label: item.title, description: item.date + ' · ' + item.context, children: [
        { id: 'titulo', label: 'Título', description: item.title },
        { id: 'data', label: 'Data', description: item.date },
        { id: 'contexto', label: 'Contexto', description: item.context },
      ],
    })) },
  ],
});
const PLATFORM_REFERENCE_TREE: readonly PlatformReferenceNode[] = [
  { id: 'perfis', label: 'Perfis mock', description: 'Pessoas fictícias da demonstração', children: [
    { id: 'alunos', label: 'Alunos', description: 'Perfis demonstrativos de estudantes', children: PLATFORM_REFERENCE_MOCK_PROFILES.filter(profile => profile.group === 'alunos').map(platformReferenceMockProfileNode) },
    { id: 'professores', label: 'Professores', description: 'Perfis demonstrativos de docentes', children: PLATFORM_REFERENCE_MOCK_PROFILES.filter(profile => profile.group === 'professores').map(platformReferenceMockProfileNode) },
  ] },
  { id: 'perfil', label: 'Perfil', description: 'Dados e conteúdo de um perfil', children: [
    { id: 'aluno', label: 'Aluno', description: 'Perfil de estudante', children: [
      { id: 'nome', label: 'Nome', description: 'Nome público do estudante' },
      { id: 'apresentacao', label: 'Apresentação', description: 'Texto curto do perfil' },
      { id: 'biografia', label: 'Biografia', description: 'Descrição pessoal' },
      { id: 'interesses', label: 'Interesses', description: 'Interesses escolhidos para o perfil' },
      { id: 'competencias', label: 'Competências', description: 'Competências em destaque' },
      { id: 'agenda', label: 'Agenda', description: 'Agenda e compromissos do perfil', children: [
        { id: 'visibilidade', label: 'Visibilidade', description: 'Quem pode ver a agenda' },
        { id: 'compromissos', label: 'Compromissos', description: 'Itens da agenda', children: [
          { id: 'titulo', label: 'Título', description: 'Nome do compromisso' },
          { id: 'data', label: 'Data', description: 'Dia do compromisso' },
          { id: 'elemento', label: 'Elemento relacionado', description: 'Questão ou evento associado' },
        ] },
      ] },
    ] },
    { id: 'professor', label: 'Professor', description: 'Perfil de docente', children: [
      { id: 'nome', label: 'Nome', description: 'Nome público do professor' },
      { id: 'apresentacao', label: 'Apresentação', description: 'Texto curto do perfil' },
      { id: 'biografia', label: 'Biografia', description: 'Descrição profissional' },
      { id: 'competencias', label: 'Competências', description: 'Competências em destaque' },
      { id: 'agenda', label: 'Agenda', description: 'Agenda e compromissos do perfil', children: [
        { id: 'visibilidade', label: 'Visibilidade', description: 'Quem pode ver a agenda' },
        { id: 'compromissos', label: 'Compromissos', description: 'Itens da agenda', children: [
          { id: 'titulo', label: 'Título', description: 'Nome do compromisso' },
          { id: 'data', label: 'Data', description: 'Dia do compromisso' },
          { id: 'elemento', label: 'Elemento relacionado', description: 'Questão ou evento associado' },
        ] },
      ] },
    ] },
  ] },
  { id: 'calendarios', label: 'Calendários', description: 'Agendas pessoais e da comunidade', children: [
    { id: 'pessoal', label: 'Pessoal', description: 'Calendário do perfil', children: [
      { id: 'compromissos', label: 'Compromissos', description: 'Itens da agenda', children: [
        { id: 'titulo', label: 'Título', description: 'Nome do compromisso' },
        { id: 'data', label: 'Data', description: 'Dia do compromisso' },
        { id: 'elemento', label: 'Elemento relacionado', description: 'Questão ou evento associado' },
      ] },
    ] },
    { id: 'comunidade', label: 'Comunidade', description: 'Calendário de eventos sociais', children: [
      { id: 'eventos', label: 'Eventos', description: 'Eventos da comunidade', children: [
        { id: 'feira-de-experiencias', label: 'Feira de experiências', description: 'Mostra comunitária', children: [
          { id: 'titulo', label: 'Título', description: 'Nome do evento' },
          { id: 'data', label: 'Data', description: 'Data do evento' },
          { id: 'descricao', label: 'Descrição', description: 'Apresentação do evento' },
          { id: 'perguntas', label: 'Perguntas e desafios', description: 'Atividades abertas do evento' },
        ] },
        { id: 'roda-de-leitura', label: 'Roda de leitura', description: 'Encontro de leitura', children: [
          { id: 'titulo', label: 'Título', description: 'Nome do evento' },
          { id: 'data', label: 'Data', description: 'Data do evento' },
          { id: 'perguntas', label: 'Perguntas e desafios', description: 'Atividades abertas do evento' },
        ] },
      ] },
    ] },
  ] },
  { id: 'eventos', label: 'Eventos', description: 'Eventos e atividades sociais', children: [
    { id: 'feira-de-experiencias', label: 'Feira de experiências', description: 'Mostra comunitária', children: [
      { id: 'titulo', label: 'Título', description: 'Nome do evento' },
      { id: 'data', label: 'Data', description: 'Data do evento' },
      { id: 'descricao', label: 'Descrição', description: 'Apresentação do evento' },
      { id: 'participantes', label: 'Participantes', description: 'Pessoas e grupos inscritos' },
      { id: 'questoes', label: 'Questões', description: 'Questões do evento' },
      { id: 'desafios', label: 'Desafios', description: 'Desafios do evento' },
    ] },
    { id: 'roda-de-leitura', label: 'Roda de leitura', description: 'Encontro de leitura', children: [
      { id: 'titulo', label: 'Título', description: 'Nome do evento' },
      { id: 'data', label: 'Data', description: 'Data do evento' },
      { id: 'pergunta', label: 'Pergunta-guia', description: 'Questão aberta para a roda' },
    ] },
  ] },
  { id: 'competencias', label: 'Competências', description: 'Competências, habilidades e questionários', children: [
    { id: 'comunicacao', label: 'Comunicação', description: 'Expressar ideias e dialogar' },
    { id: 'pensamento-critico', label: 'Pensamento crítico', description: 'Analisar evidências e justificar decisões' },
    { id: 'investigacao-cientifica', label: 'Investigação científica', description: 'Investigar fenômenos com evidências' },
    { id: 'questionarios', label: 'Questionários', description: 'Sondagens e questões por competência', children: [
      { id: 'ciencias-da-natureza', label: 'Ciências da Natureza', description: 'Questões de Ciências', children: [
        { id: 'ef08ci03', label: 'EF08CI03 · Energia', description: 'Relacionar potência, tempo e consumo', children: [
          { id: 'questao-biblioteca', label: 'Questão da biblioteca', description: 'Consumo de energia na biblioteca', children: [
            { id: 'texto', label: 'Texto', description: 'Texto completo da questão' },
            { id: 'enunciado', label: 'Enunciado', description: 'Pedido apresentado ao estudante' },
            { id: 'contexto', label: 'Contexto', description: 'Situação da questão' },
            { id: 'criterios', label: 'Critérios', description: 'Critérios observáveis de resposta' },
          ] },
          { id: 'questao-horta', label: 'Questão da horta', description: 'Uso de água na horta escolar', children: [
            { id: 'texto', label: 'Texto', description: 'Texto completo da questão' },
            { id: 'enunciado', label: 'Enunciado', description: 'Pedido apresentado ao estudante' },
            { id: 'contexto', label: 'Contexto', description: 'Situação da questão' },
            { id: 'criterios', label: 'Critérios', description: 'Critérios observáveis de resposta' },
          ] },
          { id: 'questao-consumo-salas', label: 'Questão do consumo nas salas', description: 'Comparação de registros de consumo', children: [
            { id: 'texto', label: 'Texto', description: 'Texto completo da questão' },
            { id: 'enunciado', label: 'Enunciado', description: 'Pedido apresentado ao estudante' },
            { id: 'contexto', label: 'Contexto', description: 'Situação da questão' },
            { id: 'criterios', label: 'Critérios', description: 'Critérios observáveis de resposta' },
          ] },
        ] },
      ] },
      { id: 'lingua-portuguesa', label: 'Língua Portuguesa', description: 'Questões de leitura e linguagem', children: [
        { id: 'ef69lp44', label: 'EF69LP44 · Leitura', description: 'Relacionar texto, narrador e interpretação', children: [
          { id: 'questao-narrador', label: 'Questão da praça', description: 'Narrador e memórias do bairro', children: [
            { id: 'texto', label: 'Texto', description: 'Texto completo da questão' },
            { id: 'enunciado', label: 'Enunciado', description: 'Pedido apresentado ao estudante' },
            { id: 'contexto', label: 'Contexto', description: 'Situação da questão' },
            { id: 'criterios', label: 'Critérios', description: 'Critérios observáveis de resposta' },
          ] },
        ] },
      ] },
    ] },
  ] },
  { id: 'publicacoes', label: 'Publicações', description: 'Posts ligados a atividades', children: [
    { id: 'posts-de-atividade', label: 'Posts de atividade', description: 'Publicações relacionadas ao trabalho da turma', children: [
      { id: 'titulo', label: 'Título', description: 'Título da publicação' },
      { id: 'texto', label: 'Texto', description: 'Corpo da publicação' },
      { id: 'atividade', label: 'Atividade relacionada', description: 'Atividade e critério associados' },
    ] },
  ] },
  { id: 'projetos', label: 'Projetos', description: 'Projetos colaborativos', children: [
    { id: 'mapa-de-historias-do-bairro', label: 'Mapa de histórias do bairro', description: 'Projeto em andamento', children: [
      { id: 'autoria', label: 'Autoria', description: 'Pessoas e grupo autores' },
      { id: 'objetivo', label: 'Objetivo', description: 'Mudança ou resultado pretendido' },
      { id: 'justificativa', label: 'Justificativa', description: 'Por que o projeto importa' },
      { id: 'competencias', label: 'Competências', description: 'Competências relacionadas' },
      { id: 'etapas', label: 'Etapas', description: 'Marcos e calendário do projeto' },
    ] },
  ] },
];
function platformReferenceNode(path: readonly string[]): PlatformReferenceNode | null {
  let level = PLATFORM_REFERENCE_TREE;
  let node: PlatformReferenceNode | undefined;
  for (const segment of path) {
    node = level.find(item => item.id === segment);
    if (!node) return null;
    level = node.children ?? [];
  }
  return node ?? null;
}
function platformReferenceContext(value: string, caret: number): PlatformReferenceContext | null {
  const prefix = value.slice(0, caret);
  const match = prefix.match(/(^|[\s([{])@([a-z0-9-]*(?:\s*>\s*[a-z0-9-]*)*)$/i);
  if (!match) return null;
  const expression = match[2];
  const segments = expression.split('>');
  const current = segments.pop() ?? '';
  const query = current.trim();
  const segmentStart = caret - current.length;
  const path = segments.map(segment => segment.trim()).filter(Boolean);
  return { path, query, segmentStart, caret };
}
const PROFILE_AGENDA_ELEMENTS: readonly ProfileAgendaElement[] = [
  { id: 'question-reading', type: 'competency-question', title: 'Qual narrador conhece melhor a praça?', detail: 'Histórico de questões · Língua Portuguesa · 7º ano' },
  { id: 'question-library', type: 'competency-question', title: 'Uma decisão na biblioteca', detail: 'Histórico de questões · Ciências · EF08CI03' },
  { id: 'question-garden', type: 'competency-question', title: 'A bomba da horta', detail: 'Histórico de questões · Ciências · EF08CI03' },
  { id: 'challenge-fair', type: 'social-challenge', title: 'Desafio da feira: comparar ofertas', detail: 'Evento social · Feira de experiências · Matemática' },
  { id: 'challenge-reading', type: 'social-challenge', title: 'Pergunta da roda de leitura', detail: 'Evento social · Clube de leitura · Língua Portuguesa' },
];
function isProfileAgendaPart(id: string): boolean { return id === 'teacher-agenda' || id === 'student-agenda'; }
type ProjectPublication = {
  id: string; title: string; status: string; progress: string; authors: string; goal: string;
  justification: string; summary: string; audience: string; competencies: string[]; milestones: ProfileProjectMilestone[];
  learningEvidence: string; socialDraft: boolean;
};
const PROJECT_COMPETENCIES = ['Comunicação', 'Colaboração', 'Pensamento crítico', 'Criatividade', 'Cultura digital', 'Língua Portuguesa'];
function isProfileProjectPart(id: string): boolean { return id === 'teacher-projects' || id === 'student-projects'; }
function projectId(): string { return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }
function formatQuestDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
function projectDateLabel(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(new Date(year, month - 1, day));
}
function renderProjectCalendar(monthKey: string, milestones: ProfileProjectMilestone[], selectedDate: string): string {
  const [yearPart, monthPart] = monthKey.split('-').map(Number);
  const year = Number.isFinite(yearPart) ? yearPart : 2026;
  const month = Number.isFinite(monthPart) ? monthPart - 1 : 9;
  const firstWeekday = new Date(year, month, 1).getDay();
  const dayCount = new Date(year, month + 1, 0).getDate();
  const monthTitle = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(year, month, 1));
  const cells: string[] = Array.from({ length: firstWeekday }, () => '<span class="lm-project-calendar-empty" aria-hidden="true"></span>');
  for (let day = 1; day <= dayCount; day++) {
    const date = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    const marked = milestones.some(milestone => milestone.date === date);
    cells.push('<button type="button" class="lm-project-calendar-day' + (selectedDate === date ? ' selected' : '') + (marked ? ' has-milestone' : '') + '" data-project-calendar-date="' + date + '" aria-pressed="' + String(selectedDate === date) + '" aria-label="' + date + (marked ? ', com marco' : '') + '">' + day + (marked ? '<i></i>' : '') + '</button>');
  }
  const upcoming = milestones.slice().sort((a, b) => a.date.localeCompare(b.date));
  return '<div class="lm-project-calendar-toolbar"><button type="button" data-project-calendar-step="-1" aria-label="Mês anterior">←</button><strong>' + e(monthTitle) + '</strong><button type="button" data-project-calendar-step="1" aria-label="Próximo mês">→</button></div>'
    + '<div class="lm-project-calendar-grid" aria-label="Calendário de marcos">' + ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => '<span class="weekday">' + day + '</span>').join('') + cells.join('') + '</div>'
    + '<div class="lm-project-milestones" data-project-milestone-list>' + (upcoming.length ? upcoming.map(item => '<div class="lm-project-milestone"><span>◆</span><div><b>' + e(item.title) + '</b><small>' + e(projectDateLabel(item.date)) + '</small></div><button type="button" data-project-milestone-remove="' + e(item.id) + '" aria-label="Remover marco ' + e(item.title) + '">×</button></div>').join('') : '<p class="lm-project-no-milestones">Os marcos adicionados aparecem aqui.</p>') + '</div>';
}
function renderProjectPublication(project: ProjectPublication, index: number): string {
  const milestoneRows = project.milestones.map(item => '<li><time>' + e(projectDateLabel(item.date)) + '</time><span>' + e(item.title) + '</span></li>').join('');
  const competencies = project.competencies.map(item => LabPill(item, 'mint')).join('');
  const id = e(project.id);
  return '<article class="lm-project-publication' + (project.id.startsWith('seed-') ? ' is-seed' : ' lm-project-row-local') + '">'
    + '<button type="button" class="lm-project-publication-trigger" data-project-expand="' + id + '" aria-expanded="false" aria-controls="project-publication-' + id + '"><span class="lm-project-art art-' + (index % 4) + '" aria-hidden="true">✦</span><span class="lm-project-publication-summary"><b>' + e(project.title) + '</b><small>' + e(project.authors) + ' · ' + e(project.progress) + '</small><span class="lm-project-meter"><i style="width:' + (project.status === 'Em andamento' ? 62 : project.status === 'Planejamento' ? 28 : 8) + '%"></i></span></span><span class="lm-project-publication-status">' + LabPill(project.status, index === 0 ? 'mint' : index === 1 ? 'lilac' : 'gray') + '<i aria-hidden="true">⌄</i></span></button>'
    + '<div class="lm-project-publication-details" id="project-publication-' + id + '" data-project-publication-details="' + id + '" hidden><div class="lm-project-publication-byline"><span>UMA IDEIA DE</span><b>' + e(project.authors) + '</b><small>Para ' + e(project.audience) + '</small></div>'
    + '<section><span>O QUE QUEREMOS FAZER</span><p>' + e(project.goal) + '</p></section><section><span>POR QUE ISSO IMPORTA</span><p>' + e(project.justification) + '</p></section><section><span>COMO VAMOS OBSERVAR A APRENDIZAGEM</span><p>' + e(project.learningEvidence) + '</p></section>'
    + '<div class="lm-project-publication-foot"><div><span>COMPETÊNCIAS</span><div class="lm-project-tag-row">' + competencies + '</div></div><div><span>PRÓXIMOS PASSOS</span><ul>' + (milestoneRows || '<li><span>Etapas ainda não definidas.</span></li>') + '</ul></div></div><p class="lm-project-publication-story">' + e(project.summary) + '</p><small class="lm-project-publication-state">' + (project.socialDraft ? 'Rascunho preparado para o Social. A publicação depende de confirmação.' : 'Projeto privado em planejamento.') + '</small></div></article>';
}
function renderProjectChatMarkdown(source: string): string {
  const tokenHtml: string[] = [];
  const withLinks = source.replace(/(!?)\[([^\]]+)\]\(((?:[^()\s]+|\([^()\s]*\))*)\)/g, (match, image: string, label: string, rawUrl: string) => {
    if (image) return label;
    const url = rawUrl.trim();
    if (/[\u0000-\u0020\u007f]/.test(url)) return label;
    let parsed: URL;
    try { parsed = new URL(url); } catch { return label; }
    if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) return label;
    const index = tokenHtml.push('<a href="' + e(parsed.href) + '" target="_blank" rel="noopener noreferrer">' + e(label) + '</a>') - 1;
    return '\u0000' + index + '\u0000';
  });
  const inline = (value: string): string => {
    const tokens: string[] = [];
    let html = e(value).replace(/\u0000(\d+)\u0000/g, (_match, index: string) => {
      const token = '\u0001' + tokens.length + '\u0001';
      tokens.push(tokenHtml[Number(index)] ?? '');
      return token;
    });
    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_\n]+)__/g, '<strong>$1</strong>')
      .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
      .replace(/(?<!_)_([^_\n]+)_(?!_)/g, '<em>$1</em>');
    tokens.forEach((token, index) => { html = html.replace('\u0001' + index + '\u0001', token); });
    return html;
  };
  const lines = withLinks.replace(/\r\n?/g, '\n').split('\n');
  const blocks: string[] = [];
  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    if (!line.trim()) { index += 1; continue; }
    const fence = line.match(/^\s*```/);
    if (fence) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !/^\s*```\s*$/.test(lines[index])) code.push(lines[index++]);
      if (index < lines.length) index += 1;
      blocks.push('<pre><code>' + e(code.join('\n')) + '</code></pre>');
      continue;
    }
    const heading = line.match(/^\s{0,3}(#{1,3})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      const level = heading[1].length === 1 ? 2 : 3;
      blocks.push('<h' + level + '>' + inline(heading[2]) + '</h' + level + '>');
      index += 1;
      continue;
    }
    if (/^\s*>/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^\s*>/.test(lines[index])) quote.push(lines[index++].replace(/^\s*>\s?/, ''));
      blocks.push('<blockquote><p>' + quote.map(inline).join('<br>') + '</p></blockquote>');
      continue;
    }
    const listMatch = line.match(/^\s*(?:[-+*]|\d+[.)])\s+(.+)$/);
    if (listMatch) {
      const ordered = /^\s*\d+[.)]/.test(line);
      const tag = ordered ? 'ol' : 'ul';
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index].match(/^\s*(?:[-+*]|\d+[.)])\s+(.+)$/);
        if (!item || /^\s*\d+[.)]/.test(lines[index]) !== ordered) break;
        items.push('<li>' + inline(item[1]) + '</li>');
        index += 1;
      }
      blocks.push('<' + tag + '>' + items.join('') + '</' + tag + '>');
      continue;
    }
    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim()
      && !/^\s{0,3}#{1,3}\s+/.test(lines[index])
      && !/^\s*>/.test(lines[index])
      && !/^\s*```/.test(lines[index])
      && !/^\s*(?:[-+*]|\d+[.)])\s+/.test(lines[index])) paragraph.push(lines[index++].trim());
    blocks.push('<p>' + inline(paragraph.join(' ')) + '</p>');
  }
  return blocks.join('');
}
function renderProjectChatMessages(messages: ProjectChatMessage[]): string {
  const greeting = '<article class="lm-project-chat-message assistant"><small>COGNOSCERE LOCAL · METIS</small><div class="lm-project-chat-body lm-markdown"><p>Escreva ou marque algo na ficha. O assistente acompanha as mudanças e atualiza a reflexão sobre o projeto; use a conversa para pedir ideias e encaminhamentos.</p></div></article>';
  return greeting + messages.map(message => {
    const body = message.status === 'pending' ? '<p><span class="lm-project-chat-spinner" aria-hidden="true"></span>' + (message.kind === 'reflection' ? 'Lendo a ficha atual…' : message.kind === 'review' ? 'Revendo autoria, justificativa e plano…' : 'Conversando com o Cognoscere local…') + '</p>'
      : message.role === 'assistant' && message.status !== 'error' ? '<div class="lm-project-chat-body lm-markdown">' + renderProjectChatMarkdown(message.text) + '</div>'
        : '<p>' + e(message.text) + '</p>';
    const label = message.role === 'student' ? 'VOCÊ' : message.kind === 'reflection' ? 'REFLEXÃO DO PROJETO · METIS LOCAL' : message.kind === 'review' ? 'REVISÃO DO PROJETO · COGNOSCERE LOCAL' : 'COGNOSCERE LOCAL · METIS';
    return '<article class="lm-project-chat-message ' + message.role + (message.kind === 'reflection' ? ' reflection' : '') + (message.status === 'error' ? ' error' : '') + '"' + (message.status === 'pending' ? ' aria-live="polite" aria-busy="true"' : '') + '><small>' + label + '</small>' + body + '</article>';
  }).join('');
}
const PROFILE_ACTIVITY_LABELS: Record<ProfileActivityKind, string> = {
  post: 'Post de atividade', activity: 'Atividade', video: 'Vídeo da atividade', project: 'Projeto da atividade',
};
function renderProfileActivityItem(item: ProfileActivityItem, local = false, author = 'Ana Beatriz Silva'): string {
  const image = item.image
    ? '<img class="lm-activity-image" src="' + e(item.image) + '" alt="' + e(item.imageAlt ?? '') + '" loading="lazy" />'
    : '';
  const tags = item.tags.map(tag => LabPill(tag)).join('');
  const key = 'profile-activity:' + item.id;
  const activityLink = '<div class="lm-activity-link"><span>Ligado à atividade</span><b>' + e(item.activityTitle) + '</b><small>Critério em foco: ' + e(item.criterion) + '</small></div>';
  return '<article class="lm-profile-activity-card' + (local ? ' lm-profile-activity-local' : '') + '" data-profile-activity-type="' + e(item.kind) + '">'
    + '<div class="lm-activity-author">' + LabAvatar(author, 'teal', 'tiny') + '<div><b>' + e(author) + '</b><small>' + e(PROFILE_ACTIVITY_LABELS[item.kind]) + ' · ' + e(item.publishedAt) + '</small></div>'
    + '<span class="lm-activity-kind lm-activity-kind-' + e(item.kind) + '">' + e(PROFILE_ACTIVITY_LABELS[item.kind]) + '</span></div>'
    + '<h3>' + e(item.title) + '</h3><p>' + e(item.text) + '</p>'
    + activityLink + (tags ? '<div class="lm-activity-tags">' + tags + '</div>' : '') + image
    + '<footer class="lm-post-actions"><button type="button" class="lm-like-action" data-interaction-key="' + e(key + ':like') + '" data-interaction-kind="like" data-action-label="♡ ' + String(item.likes) + '" aria-label="Curtir publicação">♡ ' + String(item.likes) + '</button>'
    + '<span>◯ ' + String(item.comments) + ' comentários</span><button type="button" data-interaction-key="' + e(key + ':share') + '" data-action-label="↗ Compartilhar">↗ Compartilhar</button>'
    + '<button type="button" data-interaction-key="' + e(key + ':save') + '" data-interaction-kind="save" data-action-label="♧ Salvar">♧ Salvar</button></footer></article>';
}
type DemoPagePartState = DemoPagePartProps & { interaction: DemoPagePartInteraction };
type ComponentStateIterator<T> = Generator<T, never, (state: T) => T>;
interface DemoPagePartElement extends HTMLElement {
  configure(props: DemoPagePartProps): void;
  syncLearningReflection(aiReflection: string, submissions: string[]): void;
}
type PageCompositionContext = {
  host: HTMLElement;
  situation: ComponentMockSituation;
  prototypeParameters: Record<string, PrototypeParameterValues>;
  existing: Map<string, DemoPagePartElement>;
  parts: DemoPagePartElement[];
};
let activePageComposition: PageCompositionContext | undefined;

function* componentState<T>(initial: T): ComponentStateIterator<T> {
  let state = initial;
  while (true) {
    const transition = yield state;
    state = transition(state);
  }
}
function mockAttributes(situation: ComponentMockSituation): string {
  return ' data-mock-screen="' + e(situation.screenId) + '" data-mock-fixture="' + e(situation.fixtureKey)
    + '" data-mock-role="' + e(situation.role) + '" data-mock-status="' + e(situation.status)
    + '" data-selected-region="' + e(situation.selectedRegionId) + '"';
}
function setFixtureValueAtPath(data: ComponentFixture, path: string, value: PrototypeParameterValue): void {
  const segments = path.split('.');
  let cursor: Record<string | number, unknown> | unknown[] = data;
  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    const key = Array.isArray(cursor) && /^\d+$/.test(segment) ? Number(segment) : segment;
    if (isLast) {
      (cursor as Record<string | number, unknown>)[key] = value;
      return;
    }
    let child = (cursor as Record<string | number, unknown>)[key];
    if (child === null || typeof child !== 'object') {
      child = /^\d+$/.test(segments[index + 1]) ? [] : {};
      (cursor as Record<string | number, unknown>)[key] = child;
    }
    cursor = child as Record<string | number, unknown> | unknown[];
  });
}
function prototypeData(id: string, data: ComponentFixture): ComponentFixture {
  const parameters = activePageComposition?.prototypeParameters[id];
  if (!parameters) return data;
  const screenId = activePageComposition?.situation.screenId;
  const region = referenceScreenSpecs.find(screen => screen.id === screenId)?.regions.find(item => item.id === id);
  if (!region) return data;
  const result = structuredClone(data);
  const limits: Record<string, number> = {};
  region.parameters.forEach(parameter => {
    if (!parameter.targetPath || !Object.hasOwn(parameters, parameter.id)) return;
    const value = parameters[parameter.id];
    if (parameter.type === 'count' && typeof value === 'number') {
      limits[parameter.targetPath] = value;
      return;
    }
    setFixtureValueAtPath(result, parameter.targetPath, value);
  });
  result.__prototypeLimits = limits;
  return result;
}
function labPart(id: string, content: string, selectedId: string, className = '', fixture: ComponentFixture = {}): string {
  if (!activePageComposition) throw new Error('Parte de página criada fora da composição de um componente de página.');
  const part = activePageComposition.existing.get(id) ?? document.createElement('lumira-page-part') as DemoPagePartElement;
  const situation = activePageComposition.situation;
  const region = referenceScreenSpecs.find(screen => screen.id === situation.screenId)?.regions.find(item => item.id === id);
  const title = region?.title ?? id.replaceAll('-', ' ');
  const presentation = region?.presentation ?? '';
  const evidence = region?.evidence ?? 'derived';
  part.configure({
    id,
    title,
    content,
    presentation,
    evidence,
    selectedId,
    className,
    fixture: structuredClone(fixture),
    situation: { ...situation, status: situation.componentStates?.[id] ?? situation.status },
    prototypeParameters: activePageComposition.prototypeParameters[id] ?? {},
  });
  const slot = activePageComposition.parts.push(part) - 1;
  if (situation.presentationMode === 'continuous-list') {
    const evidenceLabels: Record<ReferenceEvidence, string> = {
      observed: 'Referência observada',
      derived: 'Composição derivada',
      'navigation-only': 'Mapa de navegação',
    };
    const screenSpec = referenceScreenSpecs.find(screen => screen.id === situation.screenId);
    const partIndex = screenSpec?.regions.findIndex(item => item.id === id) ?? -1;
    const sequenceIndex = Math.max(0, (situation.flowIndexOffset ?? 0) + partIndex + 1);
    const contextHeading = '<header class="lm-flow-element-heading"><span class="lm-component-index">'
      + String(situation.flowIndexOffset === undefined ? partIndex + 1 : sequenceIndex).padStart(2, '0') + '</span><h2>' + e(title)
      + '</h2><span class="lm-evidence-badge ' + e(evidence) + '">' + e(evidenceLabels[evidence]) + '</span></header>';
    const contextText = presentation
      ? '<div class="lm-part-responsibility">' + presentation.split(/\n\s*\n/).map(paragraph => '<p>' + e(paragraph.trim()) + '</p>').join('') + '</div>'
      : '';
    return '<section class="lm-part-session" id="lab-point-' + e(situation.screenId) + '-' + e(id) + '" data-screen-id="' + e(situation.screenId) + '" data-scrollpoint="' + e(id)
      + '" aria-label="' + e(title) + '"><div class="lm-part-context">'
      + contextHeading + contextText + '</div><span data-demo-part-slot="' + slot + '"></span></section>';
  }
  return '<span data-demo-part-slot="' + slot + '"></span>';
}

function componentStateLayer(status: ComponentMockStatus): string {
  if (status === 'ready') return '';
  const copy: Record<Exclude<ComponentMockStatus, 'ready'>, { title: string; body: string }> = {
    loading: { title: 'Carregando', body: 'Os dados desta parte estão chegando.' },
    empty: { title: 'Sem conteúdo', body: 'Esta parte ainda não tem dados.' },
    error: { title: 'Falha ao carregar', body: 'A demonstração está no estado de erro.' },
    forbidden: { title: 'Acesso restrito', body: 'Esta parte exige outra permissão.' },
  };
  const detail = copy[status];
  const symbol = status === 'loading'
    ? '<span class="lm-spinner" aria-hidden="true"></span>'
    : '<span class="lm-part-state-symbol" aria-hidden="true">' + (status === 'error' ? '!' : status === 'empty' ? '○' : '⌑') + '</span>';
  return '<div class="lm-part-state-layer" role="' + (status === 'error' ? 'alert' : 'status') + '"><div>'
    + symbol + '<strong>' + e(detail.title) + '</strong><p>' + e(detail.body) + '</p></div></div>';
}
function renderPageWithParts(host: HTMLElement, props: ComponentPageProps, render: (props: ComponentPageProps) => string): void {
  const existing = new Map<string, DemoPagePartElement>();
  host.querySelectorAll<DemoPagePartElement>('lumira-page-part').forEach(part => {
    if (part.dataset.componentId) existing.set(part.dataset.componentId, part);
  });
  const context: PageCompositionContext = {
    host, situation: props.situation, prototypeParameters: props.prototypeParameters ?? {}, existing, parts: [],
  };
  const previous = activePageComposition;
  activePageComposition = context;
  try {
    host.innerHTML = render(props);
    context.parts.forEach((part, index) => host.querySelector('[data-demo-part-slot="' + index + '"]')?.replaceWith(part));
  } finally {
    activePageComposition = previous;
  }
}
function labInitials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]?.toUpperCase() ?? '').join('');
}
// Componentes diretos sem estado: identidade, navegação e peças de página.
function LabAvatar(name: string, tone = 'teal', className = ''): string {
  return '<span class="lm-avatar lm-avatar-' + e(tone) + ' ' + e(className) + '" aria-label="' + e(name) + '">' + e(labInitials(name)) + '</span>';
}
function LabPill(text: string, tone = ''): string { return '<span class="lm-pill ' + e(tone) + '">' + e(text) + '</span>'; }
type EditableProfile = { name: string; role: string; school: string; intro: string; bio: string; competencies: string[]; musicUrl: string };
const DEMO_PROFILE_STORAGE_KEY = 'lumira.profile-demo.v1';
function spotifyEmbedUrl(value: string): string {
  const input = value.trim();
  const uri = input.match(/^spotify:(track|album|playlist):([A-Za-z0-9]{22})$/);
  if (uri) return 'https://open.spotify.com/embed/' + uri[1] + '/' + uri[2] + '?utm_source=generator';
  try {
    const url = new URL(input);
    if (url.hostname !== 'open.spotify.com' && url.hostname !== 'www.open.spotify.com') return '';
    const parts = url.pathname.split('/').filter(Boolean);
    const typeIndex = parts.findIndex(part => ['track', 'album', 'playlist'].includes(part));
    const type = parts[typeIndex];
    const id = parts[typeIndex + 1] ?? '';
    if (!type || !/^[A-Za-z0-9]{22}$/.test(id)) return '';
    return 'https://open.spotify.com/embed/' + type + '/' + id + '?utm_source=generator';
  } catch {
    return '';
  }
}
function spotifyEmbedFrame(value: string): string {
  const src = spotifyEmbedUrl(value);
  return src ? '<iframe class="lm-spotify-embed" src="' + e(src) + '" title="Spotify player para a música do perfil" width="100%" height="152" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin"></iframe>' : '';
}
function renderProfileMusic(profile: EditableProfile): string {
  const player = spotifyEmbedFrame(profile.musicUrl);
  return '<div class="lm-profile-music-card" data-profile-music>'
    + (player
      ? '<div class="lm-profile-music-heading"><span class="lm-spotify-mark" aria-hidden="true">♫</span><span><b>Música do perfil</b><small>Escolhida no Spotify</small></span><button type="button" class="lm-profile-music-edit" data-profile-edit data-profile-focus-field="musicUrl">Trocar</button></div>' + player
      : '<div class="lm-profile-music-empty"><span class="lm-spotify-mark" aria-hidden="true">♫</span><span><b>Escolha uma música</b><small>Adicione uma faixa, álbum ou playlist do Spotify.</small></span><button type="button" class="lm-profile-music-edit" data-profile-edit data-profile-focus-field="musicUrl">Escolher</button></div>')
    + '</div>';
}
function readSavedProfile(screenId: string): Partial<EditableProfile> {
  if (!screenId || typeof localStorage === 'undefined') return {};
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(DEMO_PROFILE_STORAGE_KEY) ?? '{}');
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return {};
    const saved = (stored as Record<string, unknown>)[screenId];
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
    const values = saved as Record<string, unknown>;
    return {
      ...(typeof values.name === 'string' ? { name: values.name } : {}),
      ...(typeof values.role === 'string' ? { role: values.role } : {}),
      ...(typeof values.school === 'string' ? { school: values.school } : {}),
      ...(typeof values.intro === 'string' ? { intro: values.intro } : {}),
      ...(typeof values.bio === 'string' ? { bio: values.bio } : {}),
      ...(Array.isArray(values.competencies) ? { competencies: values.competencies.map(String).slice(0, 4) } : {}),
      ...(typeof values.musicUrl === 'string' ? { musicUrl: values.musicUrl } : {}),
    };
  } catch {
    return {};
  }
}
function profileValues(screenId: string, data: ComponentFixture, student: boolean): EditableProfile {
  const fallback: EditableProfile = {
    name: labText(data, 'name', student ? 'Caio Almeida' : 'Ana Beatriz Silva'),
    role: labText(data, 'role', student ? 'Estudante · 8º ano' : 'Professora de Língua Portuguesa'),
    school: labText(data, 'school', 'Escola Municipal Nova Esperança'),
    intro: labText(data, 'quote', student ? 'Curiosidade abre novos caminhos.' : 'Educação é caminho, colaboração e destino.'),
    bio: labText(data, 'bio', student ? 'Aprendo investigando e gosto de transformar perguntas em projetos com a turma.' : 'Educadora, apaixonada por aprendizagem, projetos e comunidade.'),
    competencies: labList<string>(data, 'competencies').slice(0, 4).map(String),
    musicUrl: labText(data, 'musicUrl', ''),
  };
  return { ...fallback, ...readSavedProfile(screenId) };
}
function persistProfileValues(screenId: string, values: EditableProfile): void {
  if (typeof localStorage === 'undefined') throw new Error('Armazenamento local indisponível neste navegador.');
  const stored: Record<string, unknown> = JSON.parse(localStorage.getItem(DEMO_PROFILE_STORAGE_KEY) ?? '{}');
  stored[screenId] = values;
  localStorage.setItem(DEMO_PROFILE_STORAGE_KEY, JSON.stringify(stored));
}
function renderWorkspaceSidebar(screenId: string, data: ComponentFixture, selectedId: string): string {
  data = prototypeData('workspace-sidebar', data);
  const community = screenId === 'community';
  const teachingSpace = screenId === 'teacher-workspace';
  const learnerActivity = screenId === 'student-activity';
  const levelingEnrollment = screenId === 'leveling-enrollment';
  const questPage = screenId === 'quests';
  const competencyQuestions = screenId === 'competency-questions';
  const student = screenId === 'student-profile' || learnerActivity || levelingEnrollment || questPage || competencyQuestions;
  const name = profileValues(activePageComposition?.situation.screenId ?? screenId, data, student).name;
  const labels = community ? ['Feed', 'Meus círculos', 'Explorar', 'Mensagens', 'Salvos']
    : teachingSpace ? ['Início', 'Matérias e turmas', 'Competências', 'Sondagem', 'Evidências', 'Cursos', 'Comunidade']
      : learnerActivity ? ['Início', 'Sondagem', 'Atividade', 'Cursos', 'Meu percurso', 'Comunidade']
        : levelingEnrollment ? ['Início', 'Matrícula', 'Nivelamento', 'Competições', 'Meu percurso']
          : questPage ? ['Início', 'Competições', 'Nivelamento', 'Cursos', 'Meu percurso']
            : competencyQuestions ? ['Início', 'Matrícula', 'Questões', 'Atividade', 'Meu percurso']
        : ['Perfil', 'Áreas', 'Cursos', 'Fórum', 'IA pedagógica'];
  const active = community ? 'Feed' : teachingSpace ? 'Matérias e turmas' : learnerActivity ? 'Atividade'
    : levelingEnrollment ? 'Matrícula' : questPage ? 'Competições' : competencyQuestions ? 'Questões' : 'Perfil';
  const sidebarTargets: Record<string, Record<string, [string, string]>> = {
    community: { Feed: ['community', 'community-feed'], 'Meus círculos': ['community', 'community-aside'], Explorar: ['community', 'community-topics'], Mensagens: ['community', 'community-feed'], Salvos: ['community', 'community-feed'] },
    'teacher-profile': { Perfil: ['teacher-profile', 'teacher-hero'], Áreas: ['teacher-workspace', 'pedagogy-context'], Cursos: ['teacher-workspace', 'pedagogy-course-sequence'], Fórum: ['community', 'community-feed'], 'IA pedagógica': ['teacher-workspace', 'pedagogy-activity-builder'] },
    'student-profile': { Perfil: ['student-profile', 'student-hero'], Áreas: ['student-activity', 'learner-activity-brief'], Cursos: ['competency-questions', 'competency-question-context'], Fórum: ['community', 'community-feed'], 'IA pedagógica': ['student-activity', 'learner-reflection'] },
    'teacher-workspace': { Início: ['teacher-workspace', 'pedagogy-context'], 'Matérias e turmas': ['teacher-workspace', 'pedagogy-context'], Competências: ['teacher-workspace', 'pedagogy-competency'], Sondagem: ['leveling-enrollment', 'leveling-scope'], Evidências: ['teacher-workspace', 'pedagogy-evidence-review'], Cursos: ['teacher-workspace', 'pedagogy-course-sequence'], Comunidade: ['community', 'community-feed'] },
    'student-activity': { Início: ['student-profile', 'student-hero'], Sondagem: ['leveling-enrollment', 'leveling-scope'], Atividade: ['student-activity', 'learner-activity-brief'], Cursos: ['competency-questions', 'competency-question-context'], 'Meu percurso': ['student-profile', 'student-progress'], Comunidade: ['community', 'community-feed'] },
    'leveling-enrollment': { Início: ['student-profile', 'student-hero'], Matrícula: ['leveling-enrollment', 'leveling-invitation'], Nivelamento: ['competency-questions', 'competency-question-context'], Competições: ['quests', 'quest-board'], 'Meu percurso': ['student-profile', 'student-progress'] },
    quests: { Início: ['student-profile', 'student-hero'], Competições: ['quests', 'quest-board'], Nivelamento: ['competency-questions', 'competency-question-context'], Cursos: ['student-activity', 'learner-activity-brief'], 'Meu percurso': ['student-profile', 'student-progress'] },
    'competency-questions': { Início: ['student-profile', 'student-hero'], Matrícula: ['leveling-enrollment', 'leveling-invitation'], Questões: ['competency-questions', 'competency-question-context'], Atividade: ['student-activity', 'learner-activity-brief'], 'Meu percurso': ['student-profile', 'student-progress'] },
  };
  const links = labels.map(label => {
    const [targetScreen, targetComponent] = sidebarTargets[screenId]?.[label] ?? [screenId, selectedId];
    return '<button type="button" class="lm-side-link ' + (label === active ? 'active' : '') + '" data-screen-select="' + e(targetScreen) + '" data-component-select="' + e(targetComponent) + '" data-screen-id="' + e(targetScreen) + '" aria-label="Abrir ' + e(label) + '"><span aria-hidden="true">' + (label === active ? '◉' : '◇') + '</span>' + e(label) + (label === 'Mensagens' ? '<i>3</i>' : '') + '</button>';
  }).join('');
  const promoTarget = teachingSpace ? ['leveling-enrollment', 'leveling-scope'] as const
    : learnerActivity ? ['student-profile', 'student-progress'] as const
      : levelingEnrollment ? ['competency-questions', 'competency-question-context'] as const
        : questPage ? ['student-profile', 'student-progress'] as const
          : competencyQuestions ? ['leveling-enrollment', 'leveling-invitation'] as const
            : community ? ['community', 'community-calendar'] as const
              : student ? ['student-activity', 'learner-activity-brief'] as const
                : ['teacher-workspace', 'pedagogy-context'] as const;
  const content = '<div class="lm-brand"><span class="lm-brand-symbol">✳</span><span>Lumira</span></div>'
    + '<div class="lm-side-account">' + LabAvatar(name, student ? 'blue' : 'teal', 'small') + '<div><strong>' + e(name) + '</strong><small>' + e(student ? 'Estudante' : 'Professora') + '</small></div></div>'
    + '<nav class="lm-side-nav" aria-label="Navegação de demonstração">' + links + '</nav>'
    + '<aside class="lm-sidebar-promo"><span class="lm-sidebar-promo-mark">✦</span><p>' + e(community ? 'Professores que inspiram professores.' : teachingSpace ? 'Planeje experiências que tornam o conhecimento observável.' : learnerActivity ? 'Responda com suas próprias estratégias.' : levelingEnrollment ? 'Um convite claro para começar seu percurso.' : questPage ? 'Participe de eventos com regras e etapas visíveis.' : competencyQuestions ? 'Cinco contextos para mostrar seu raciocínio.' : 'Educação que se conecta com o real.') + '</p><button type="button" data-screen-select="' + e(promoTarget[0]) + '" data-component-select="' + e(promoTarget[1]) + '" data-screen-id="' + e(promoTarget[0]) + '">' + (community ? 'Ver calendário' : teachingSpace ? 'Abrir sondagem' : learnerActivity ? 'Ver meu percurso' : levelingEnrollment ? 'Ver as questões' : questPage ? 'Ver meu percurso' : competencyQuestions ? 'Voltar à matrícula' : 'Explorar áreas') + ' →</button></aside>'
    + '<footer class="lm-sidebar-footer">LUMIRA · COMPONENTING LAB</footer>';
  return labPart('workspace-sidebar', content, selectedId, 'lm-product-sidebar');
}
function renderWorkspaceTopbar(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('workspace-topbar', data);
  const screenId = activePageComposition?.situation.screenId ?? 'teacher-profile';
  const name = profileValues(screenId, data, screenId === 'student-profile').name;
  const quickActions: Record<string, Array<[string, string, string]>> = {
    access: [['Abrir perfil docente', 'teacher-profile', 'teacher-hero'], ['Abrir perfil aluno', 'student-profile', 'student-hero']],
    'teacher-profile': [['Novo story', 'teacher-profile', 'teacher-stories'], ['Preparar atividade', 'teacher-workspace', 'pedagogy-activity-builder']],
    'teacher-workspace': [['Revisar evidências', 'teacher-workspace', 'pedagogy-evidence-review'], ['Criar sequência', 'teacher-workspace', 'pedagogy-course-sequence']],
    'student-profile': [['Criar story', 'student-profile', 'student-stories'], ['Responder atividade', 'student-activity', 'learner-response']],
    'student-activity': [['Ver questões', 'competency-questions', 'competency-question-response'], ['Ver meu percurso', 'student-profile', 'student-progress']],
    'leveling-enrollment': [['Começar sondagem', 'competency-questions', 'competency-question-response'], ['Ver competições', 'quests', 'quest-board']],
    quests: [['Abrir questões', 'competency-questions', 'competency-question-response'], ['Ver matrícula', 'leveling-enrollment', 'leveling-confirmation']],
    'competency-questions': [['Abrir atividade', 'student-activity', 'learner-response'], ['Ver meu percurso', 'student-profile', 'student-progress']],
    community: [['Criar publicação', 'community', 'community-feed'], ['Abrir calendário', 'community', 'community-calendar']],
  };
  const actionButtons = (quickActions[screenId] ?? quickActions.community).map(([label, targetScreen, componentId]) =>
    '<button type="button" data-screen-select="' + e(targetScreen) + '" data-component-select="' + e(componentId) + '" data-screen-id="' + e(targetScreen) + '">' + e(label) + ' →</button>',
  ).join('');
  const profileTarget: [string, string] = screenId === 'student-profile' || screenId === 'student-activity' || screenId === 'leveling-enrollment' || screenId === 'quests' || screenId === 'competency-questions'
    ? ['student-profile', 'student-hero']
    : ['teacher-profile', 'teacher-hero'];
  const content = '<div class="lm-search"><span aria-hidden="true">⌕</span><input data-workspace-search aria-label="Buscar em todas as partes" placeholder="Buscar áreas, cursos, pessoas, conteúdos..." /><output data-workspace-search-count aria-live="polite"></output></div>'
    + '<div class="lm-top-actions"><div class="lm-top-menu-wrap"><button type="button" class="lm-top-action" data-workspace-menu-toggle="create" aria-expanded="false" aria-controls="workspace-create-menu">＋ <span>Criar</span></button><div class="lm-workspace-popover" id="workspace-create-menu" data-workspace-menu="create" hidden><strong>Abrir uma área</strong>' + actionButtons + '</div></div>'
    + '<div class="lm-top-menu-wrap"><button type="button" class="lm-top-action" data-workspace-menu-toggle="notifications" aria-expanded="false" aria-controls="workspace-notifications-menu">♧ <span>Notificações</span><i>3</i></button><div class="lm-workspace-popover lm-notification-popover" id="workspace-notifications-menu" data-workspace-menu="notifications" hidden><strong data-notification-heading>Notificações</strong><p>Uma resposta nova no story “Sala de aula”.</p><p>O encontro de leitura acontece nesta semana.</p><p>Uma pessoa começou a seguir seu perfil.</p><button type="button" data-notification-read>Todas como lidas</button></div></div>'
    + '<div class="lm-top-menu-wrap"><button type="button" class="lm-user-menu" data-workspace-menu-toggle="profile" aria-expanded="false" aria-controls="workspace-profile-menu">' + LabAvatar(name, 'teal', 'tiny') + '<span>' + e(name) + '</span><b>⌄</b></button><div class="lm-workspace-popover lm-profile-popover" id="workspace-profile-menu" data-workspace-menu="profile" hidden><strong>' + e(name) + '</strong><button type="button" data-screen-select="' + e(profileTarget[0]) + '" data-component-select="' + e(profileTarget[1]) + '" data-screen-id="' + e(profileTarget[0]) + '">Ver perfil →</button></div></div></div>';
  return labPart('workspace-topbar', content, selectedId, 'lm-product-topbar');
}
function renderAccessBrand(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('access-brand', data);
  const image = "url('" + profileCoverAsset + "')";
  const content = '<section class="lm-access-brand" style="background-image:linear-gradient(90deg,rgba(8,38,70,.76),rgba(8,38,70,.18)),' + image + '">'
    + '<div class="lm-access-logo"><span class="lm-brand-symbol">✳</span> Lumira</div>'
    + '<div class="lm-access-copy"><span class="lm-eyebrow">PLATAFORMA EDUCACIONAL</span><h1>' + e(labText(data, 'subtitle', 'Ensinar, aprender e evoluir juntos.')) + '</h1><p>' + e(labText(data, 'description', 'Experiências que conectam a escola à comunidade.')) + '</p>'
    + '<div class="lm-access-proof">' + LabPill('Áreas e competências') + LabPill('Comunidade escolar') + LabPill('IA pedagógica') + '</div></div>'
    + '<small class="lm-access-caption">LUMIRA · APRENDER EM COMUNIDADE</small></section>';
  return labPart('access-brand', content, selectedId, 'lm-access-brand-part');
}
function renderAccessForm(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('access-form', data);
  const roles = labList<string>(data, 'roles').map((role, index) => '<option ' + (index === 0 ? 'selected' : '') + '>' + e(role) + '</option>').join('');
  const content = '<section class="lm-access-card"><span class="lm-eyebrow">ÁREA DO ESTUDANTE E EDUCADOR</span><h2>' + e(labText(data, 'title', 'Entrar na Lumira')) + '</h2><p class="lm-access-intro">Use sua conta institucional ou continue com o modo de demonstração.</p>'
    + '<form class="lm-login-form"><label>Perfil de demonstração<select name="role"><option value="">Escolha um perfil</option>' + roles + '</select></label>'
    + '<label>E-mail institucional<input name="email" type="email" required value="' + e(labText(data, 'email', 'ana.beatriz@escola.exemplo')) + '" /></label>'
    + '<label>Senha<input name="password" type="password" required value="lumira-demo" /></label><button type="submit" class="lm-primary-button">Entrar na Lumira <span>→</span></button></form>'
    + '<div class="lm-access-links"><button type="button">Esqueci minha senha</button><button type="button">Entrar na demonstração →</button></div>'
    + '<small class="lm-access-disclaimer">Protótipo visual · autenticação não conectada</small></section>';
  return labPart('access-form', content, selectedId, 'lm-access-form-part');
}
function renderAccessPage(props: ComponentPageProps): string {
  const { data, situation } = props;
  const selectedId = situation.selectedRegionId;
  return '<div class="lm-access-page" data-page-id="access"' + mockAttributes(situation) + '>' + renderAccessBrand(data, selectedId) + renderAccessForm(data, selectedId) + '</div>';
}
function renderProfileHero(id: string, data: ComponentFixture, selectedId: string, student = false): string {
  data = prototypeData(id, data);
  const screenId = activePageComposition?.situation.screenId ?? (student ? 'student-profile' : 'teacher-profile');
  const profile = profileValues(screenId, data, student);
  const chips = profile.competencies.map(item => LabPill(item, 'glass')).join('');
  const summary = student
    ? '<p class="lm-profile-school"><span data-profile-value="school">' + e(profile.school) + '</span><button type="button" class="lm-profile-field-edit" data-profile-field-focus="school" aria-label="Editar escola">✎</button></p>'
    : '<p class="lm-profile-quote"><span data-profile-value="intro">' + e(profile.intro) + '</span><button type="button" class="lm-profile-field-edit" data-profile-field-focus="intro" aria-label="Editar frase do perfil">✎</button></p>';
  const roleAndSchool = student
    ? '<p><span data-profile-value="role">' + e(profile.role) + '</span><button type="button" class="lm-profile-field-edit" data-profile-field-focus="role" aria-label="Editar função">✎</button></p>'
    : '<p><span data-profile-value="role">' + e(profile.role) + '</span><button type="button" class="lm-profile-field-edit" data-profile-field-focus="role" aria-label="Editar função">✎</button><span aria-hidden="true">·</span><span data-profile-value="school">' + e(profile.school) + '</span><button type="button" class="lm-profile-field-edit" data-profile-field-focus="school" aria-label="Editar escola">✎</button></p>';
  const image = "url('" + profileCoverAsset + "')";
  const content = '<div class="lm-profile-cover" style="background-image:linear-gradient(90deg,rgba(7,35,67,.65),rgba(8,39,72,.17)),' + image + '">'
    + '<div class="lm-profile-cover-top"><span class="lm-eyebrow">PERFIL · ' + (student ? 'ESTUDANTE' : 'EDUCADORA') + '</span><button type="button" class="lm-cover-more" aria-label="Opções do perfil">•••</button></div>'
    + '<div class="lm-profile-identity"><span class="lm-avatar lm-avatar-' + (student ? 'blue' : 'teal') + ' portrait" data-profile-avatar aria-hidden="true">' + e(labInitials(profile.name)) + '</span><div class="lm-profile-name"><h1><span data-profile-value="name">' + e(profile.name) + '</span><button type="button" class="lm-profile-field-edit" data-profile-field-focus="name" aria-label="Editar nome">✎</button> <span class="lm-verified">✓</span></h1>' + roleAndSchool + summary + (student ? '<p class="lm-profile-quote"><span data-profile-value="intro">' + e(profile.intro) + '</span><button type="button" class="lm-profile-field-edit" data-profile-field-focus="intro" aria-label="Editar apresentação">✎</button></p>' : '') + '<div class="lm-profile-pills" data-profile-value="competencies">' + chips + '<button type="button" class="lm-profile-field-edit" data-profile-field-focus="competencies" aria-label="Editar interesses e competências">✎</button></div></div>'
    + '<div class="lm-profile-actions">' + renderProfileMusic(profile) + '<button type="button" class="lm-profile-edit-button" data-profile-edit-primary aria-expanded="false">✎ <span>Editar perfil</span></button><button type="button" class="lm-profile-share-button" aria-label="Compartilhar perfil">↗ <span>Compartilhar</span></button></div></div></div>';
  return labPart(id, content, selectedId, 'lm-profile-hero-part');
}
function renderStories(id: string, data: ComponentFixture, selectedId: string): string {
  data = prototypeData(id, data);
  const stories = labList<string>(data, 'stories');
  const details = labList<Record<string, unknown>>(data, 'storyDetails');
  const parameters = activePageComposition?.prototypeParameters[id] ?? {};
  const allowCreate = parameters.allowCreate !== false;
  const allowReplies = parameters.allowReplies !== false;
  const visibility = typeof parameters.storyVisibility === 'string' ? parameters.storyVisibility : 'Público';
  const cards = stories.map((title, index) => {
    const detail = details[index] ?? {};
    const caption = typeof detail.caption === 'string' ? detail.caption : 'Um momento compartilhado por ' + (id === 'student-stories' ? 'Caio' : 'Ana Beatriz') + '.';
    const body = typeof detail.body === 'string' ? detail.body : 'Uma atualização breve sobre ' + title.toLocaleLowerCase() + ', publicada no perfil para compartilhar uma ideia com a comunidade.';
    const category = typeof detail.category === 'string' ? detail.category : 'Momento';
    const publishedAt = typeof detail.publishedAt === 'string' ? detail.publishedAt : (index === 0 ? 'Hoje, 09:15' : 'Há ' + index + ' dia' + (index > 1 ? 's' : ''));
    const likes = typeof detail.likes === 'number' ? detail.likes : 0;
    const replies = Array.isArray(detail.replies) ? detail.replies.map(String) : [];
    const storyVisibility = typeof detail.visibility === 'string' ? detail.visibility : 'Público';
    const image = typeof detail.image === 'string' ? detail.image : '';
    const imageAlt = typeof detail.imageAlt === 'string' ? detail.imageAlt : 'Imagem do story ' + title;
    const challenge = typeof detail.challenge === 'object' && detail.challenge !== null
      ? detail.challenge as Record<string, unknown>
      : {};
    const challengePrompt = typeof challenge.prompt === 'string' ? challenge.prompt : '';
    const challengeSubject = typeof challenge.subject === 'string' ? challenge.subject : 'Questão do story';
    const challengeOptions = Array.isArray(challenge.options) ? challenge.options.map(String).slice(0, 4) : [];
    const challengeAnswer = typeof challenge.correctOption === 'number' ? challenge.correctOption : -1;
    const challengeExplanation = typeof challenge.explanation === 'string' ? challenge.explanation : '';
    const thumbnail = image
      ? '<img class="lm-story-thumb" src="' + e(image) + '" alt="">'
      : LabAvatar(title, ['teal', 'blue', 'violet', 'rose', 'sun'][index % 5], 'story-avatar');
    const challengeAttributes = challengePrompt && challengeOptions.length
      ? ' data-story-question-subject="' + e(challengeSubject) + '" data-story-question-prompt="' + e(challengePrompt) + '" data-story-question-options="' + e(JSON.stringify(challengeOptions)) + '" data-story-question-answer="' + challengeAnswer + '" data-story-question-explanation="' + e(challengeExplanation) + '"'
      : '';
    return '<button type="button" class="lm-story-card" data-story-index="' + index + '" data-story-title="' + e(title) + '" data-story-caption="' + e(caption) + '" data-story-body="' + e(body) + '" data-story-category="' + e(category) + '" data-story-time="' + e(publishedAt) + '" data-story-visibility="' + e(storyVisibility) + '" data-story-likes="' + likes + '" data-story-image="' + e(image) + '" data-story-image-alt="' + e(imageAlt) + '" data-story-replies="' + e(JSON.stringify(replies)) + '"' + challengeAttributes + '><span class="lm-story-ring tone-' + (index % 5) + '">' + thumbnail + '</span><b>' + e(title) + '</b><small>' + e(publishedAt) + '</small></button>';
  }).join('');
  const createCard = allowCreate
    ? '<button type="button" class="lm-story-card lm-new-story" data-story-create><span class="lm-new-story-icon">＋</span><b>Novo story</b><small>Compartilhar</small></button>'
    : '';
  const content = '<section class="lm-stories-experience" aria-label="Stories do perfil">'
    + '<div class="lm-stories-track">' + createCard + cards + '<button type="button" class="lm-story-next" aria-label="Rolar para os próximos stories">›</button></div>'
    + '<div class="lm-story-stage" data-story-stage aria-live="polite"></div>'
    + '<div class="lm-story-composer-mount"></div>'
    + '<p class="lm-story-demo-note">Interações, publicação e respostas ficam somente nesta demonstração.</p>'
    + '<span class="lm-story-settings" data-story-visibility="' + e(visibility) + '" data-story-replies="' + String(allowReplies) + '" data-story-can-create="' + String(allowCreate) + '"></span></section>';
  return labPart(id, content, selectedId, 'lm-stories-part');
}
function renderProfileTabs(id: string, data: ComponentFixture, selectedId: string): string {
  data = prototypeData(id, data);
  const tabs = labList<string>(data, 'tabs');
  const student = id === 'student-tabs';
  const targets = student
    ? ['student-hero', 'student-progress', 'student-activity', 'student-achievements']
    : ['teacher-hero', 'teacher-skills', 'teacher-projects', 'teacher-activity', 'teacher-activity', 'teacher-projects', 'teacher-progress'];
  const screenId = student ? 'student-profile' : 'teacher-profile';
  const content = '<nav class="lm-profile-tabs" aria-label="Seções do perfil">' + tabs.map((label, index) => '<button type="button" class="' + (index === 0 ? 'active' : '') + '" data-component-select="' + e(targets[index] ?? targets[0]) + '" data-screen-id="' + screenId + '" aria-label="Abrir seção ' + e(label) + '">' + (index === 0 ? '<span>✦</span>' : '') + e(label) + '</button>').join('') + '</nav>';
  return labPart(id, content, selectedId, 'lm-tabs-part');
}
function renderProgressCard(data: ComponentFixture, selectedId: string, student = false): string {
  data = prototypeData(student ? 'student-progress' : 'teacher-progress', data);
  const value = Math.max(0, Math.min(100, labNumber(data, 'progress', student ? 68 : 78)));
  const content = '<article class="lm-panel lm-progress-panel"><header><h2>' + (student ? 'Meu percurso' : 'Meu progresso geral') + '</h2><button type="button" class="lm-panel-more">•••</button></header>'
    + '<div class="lm-progress-layout"><div class="lm-progress-ring" style="--progress:' + value + '%"><div><strong>' + value + '%</strong><small>' + (student ? 'Percurso' : 'alinhamento') + '</small></div></div>'
    + '<div class="lm-progress-stats"><div><span class="lm-stat-icon sun">♨</span><b>' + e(labText(data, 'streak', student ? '8' : '12')) + '</b><small>dias seguidos</small></div><div><span class="lm-stat-icon violet">✦</span><b>XP ' + e(labText(data, 'xp', '1.250')) + '</b><small>no percurso</small></div><div><span class="lm-stat-icon teal">♜</span><b>' + e(labText(data, 'achievements', '3')) + '</b><small>conquistas</small></div></div></div>'
    + '<div class="lm-progress-caption"><span>Iniciante</span><span>Intermediário</span><span>Avançado</span></div></article>';
  return labPart(student ? 'student-progress' : 'teacher-progress', content, selectedId, 'lm-profile-card-part');
}
function renderSkillsPanel(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('teacher-skills', data);
  const skills = labList<ComponentFixture>(data, 'skills').map(skill => {
    const title = labText(skill, 'title', 'Competência');
    const value = Math.max(0, Math.min(100, labNumber(skill, 'value', 50)));
    const tone = labText(skill, 'tone', 'teal');
    return '<div class="lm-skill-row"><span>' + e(title) + '</span><div class="lm-skill-track"><i class="tone-' + e(tone) + '" style="width:' + value + '%"></i></div><b>' + value + '%</b></div>';
  }).join('');
  const content = '<article class="lm-panel lm-skills-panel"><header><h2>Competências principais</h2><div><button type="button" class="lm-profile-field-edit" data-profile-edit data-profile-focus-field="competencies" aria-label="Editar competências">✎</button><button type="button" class="lm-text-action">Ver todas →</button></div></header><div class="lm-skill-list">' + skills + '</div></article>';
  return labPart('teacher-skills', content, selectedId, 'lm-profile-card-part');
}
function renderAboutPanel(data: ComponentFixture, selectedId: string, student = false): string {
  data = prototypeData(student ? 'student-privacy' : 'teacher-about', data);
  const screenId = activePageComposition?.situation.screenId ?? (student ? 'student-profile' : 'teacher-profile');
  const bio = profileValues(screenId, data, student).bio;
  const affiliations = labList<string>(data, 'affiliations');
  const socials = labList<string>(data, 'socials');
  const content = '<article class="lm-panel lm-about-panel"><header><h2>Sobre mim</h2><button type="button" class="lm-panel-edit" data-profile-edit data-profile-focus-field="bio" aria-label="Editar sobre mim">✎</button></header>'
    + '<p data-profile-about>' + e(bio) + '</p>'
    + (student ? '<div class="lm-privacy-notice">' + e(labText(data, 'privacy', 'Este perfil exibe somente informações autorizadas para publicação.')) + '</div>' : '')
    + (student ? '' : '<div class="lm-affiliations">' + affiliations.map(item => '<span>⌂ ' + e(item) + '</span>').join('') + '</div>')
    + (student ? '' : '<div class="lm-social-links">' + socials.map((item, index) => '<button type="button" class="tone-' + (index % 4) + '" aria-label="' + e(item) + '">' + ['◎', 'in', 'f', '▶'][index % 4] + '</button>').join('') + '</div>');
  return labPart(student ? 'student-privacy' : 'teacher-about', content + '</article>', selectedId, 'lm-profile-card-part');
}
function renderActivityCard(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('teacher-activity', data);
  const fixtures = labList<ComponentFixture>(data, 'activityItems');
  const items: ProfileActivityItem[] = fixtures.map((fixture, index) => {
    const kindText = labText(fixture, 'kind', 'post');
    const kind: ProfileActivityKind = kindText === 'activity' || kindText === 'video' || kindText === 'project' ? kindText : 'post';
    const tags = Array.isArray(fixture.tags) ? fixture.tags.map(String) : [];
    return {
      id: labText(fixture, 'id', 'activity-' + index), kind,
      title: index === 0 ? labText(data, 'activityTitle', labText(fixture, 'title', 'Linguagem conecta realidades')) : labText(fixture, 'title', 'Publicação'),
      text: index === 0 ? labText(data, 'activityText', labText(fixture, 'text', '')) : labText(fixture, 'text', ''),
      activityId: labText(fixture, 'activityId'), activityTitle: labText(fixture, 'activityTitle'), criterion: labText(fixture, 'criterion'),
      tags: index === 0 ? labList<string>(data, 'activityTags') : tags,
      publishedAt: labText(fixture, 'publishedAt', 'Hoje'), likes: labNumber(fixture, 'likes'), comments: labNumber(fixture, 'comments'),
      image: typeof fixture.image === 'string' ? fixture.image : undefined,
      imageAlt: labText(fixture, 'imageAlt', ''),
    };
  }).filter(item => Boolean(item.activityId && item.activityTitle && item.criterion));
  const counts: Record<ProfileActivityKind | 'all', number> = {
    all: items.length, post: items.filter(item => item.kind === 'post').length,
    activity: items.filter(item => item.kind === 'activity').length,
    video: items.filter(item => item.kind === 'video').length,
    project: items.filter(item => item.kind === 'project').length,
  };
  const filters: Array<{ id: 'all' | ProfileActivityKind; label: string }> = [
    { id: 'all', label: 'Todos' }, { id: 'post', label: 'Posts' }, { id: 'activity', label: 'Atividades' },
    { id: 'video', label: 'Vídeos' }, { id: 'project', label: 'Projetos' },
  ];
  const filterButtons = filters.map(filter => '<button type="button" class="' + (filter.id === 'all' ? 'active' : '') + '" data-profile-activity-filter="' + filter.id + '" aria-pressed="' + String(filter.id === 'all') + '">' + e(filter.label) + '<span data-profile-activity-count="' + filter.id + '">' + String(counts[filter.id]) + '</span></button>').join('');
  const cards = items.map(item => renderProfileActivityItem(item, false, labText(data, 'name', 'Ana Beatriz Silva'))).join('');
  const activityOptions = PROFILE_ACTIVITY_LINKS.map(link => '<option value="' + e(link.id) + '">' + e(link.title) + '</option>').join('');
  const content = '<article class="lm-panel lm-activity-panel"><header class="lm-activity-heading"><div><span class="lm-eyebrow">PERFIL · PUBLICAÇÕES</span><h2>Posts e atividades</h2></div><button type="button" class="lm-small-primary" data-profile-activity-create>＋ Criar novo</button></header>'
    + '<p class="lm-activity-intro">Só entram aqui publicações ligadas a uma atividade e ao critério que a turma está praticando.</p>'
    + '<nav class="lm-filter-pills lm-activity-filters" aria-label="Filtrar posts e atividades">' + filterButtons + '</nav>'
    + '<form class="lm-profile-activity-composer" data-profile-activity-composer hidden novalidate><header><div><span class="lm-eyebrow">NOVA PUBLICAÇÃO</span><h3>Compartilhar com a turma</h3></div><button type="button" class="lm-panel-more" data-profile-activity-cancel aria-label="Fechar criação">×</button></header>'
    + '<label class="lm-activity-composer-type">Formato<select name="activityKind"><option value="post">Post de atividade</option><option value="activity">Atividade</option><option value="video">Vídeo da atividade</option><option value="project">Projeto da atividade</option></select></label>'
    + '<label>Atividade relacionada<select name="activityLink" required><option value="">Escolha uma atividade</option>' + activityOptions + '</select></label>'
    + '<label>Título<input name="activityTitle" maxlength="100" placeholder="Ex.: A praça virou personagem" required></label>'
    + '<label>Conta como foi<textarea name="activityText" rows="4" maxlength="1000" placeholder="O que vocês fizeram? Teve alguma descoberta ou surpresa?" required></textarea></label>'
    + '<label>Assuntos <small>(separe por vírgulas)</small><input name="activityTags" maxlength="180" placeholder="Leitura, bairro, trabalho em grupo"></label>'
    + '<p class="lm-activity-moderation-note"><span aria-hidden="true">✓</span> Na plataforma, publicações de estudantes passam por vistoria de respeito, privacidade e relação com a atividade. Aqui, a regra é ilustrativa; esta demonstração não aprova conteúdo.</p>'
    + '<footer><button type="button" class="lm-activity-cancel" data-profile-activity-cancel>Cancelar</button><button type="submit" class="lm-small-primary">Publicar</button></footer></form>'
    + '<div class="lm-profile-activity-list" data-profile-activity-list>' + cards + '</div>'
    + '<p class="lm-activity-empty" data-profile-activity-empty hidden>Nada por aqui nesse filtro ainda. Escolha outro ou compartilhe uma atividade.</p></article>';
  return labPart('teacher-activity', content, selectedId, 'lm-feed-card-part');
}
function renderProjectsPanel(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('teacher-projects', data);
  const projects = labList<ComponentFixture>(data, 'projects');
  const rows = projects.map((project, index) => {
    const milestones = Array.isArray(project.milestones) ? project.milestones as ProfileProjectMilestone[] : [];
    return renderProjectPublication({
      id: labText(project, 'id', 'seed-project-' + index), title: labText(project, 'title', 'Projeto'),
      status: labText(project, 'status', 'Ideia'), progress: labText(project, 'progress', '0/4 atividades'),
      authors: labText(project, 'authors', 'Grupo de aprendizagem'), goal: labText(project, 'goal', ''),
      justification: labText(project, 'justification', ''), summary: labText(project, 'summary', ''),
      audience: labText(project, 'audience', 'Comunidade escolar'), learningEvidence: labText(project, 'learningEvidence', ''),
      competencies: labList<string>(project, 'competencies'), milestones, socialDraft: true,
    }, index);
  }).join('');
  const content = '<article class="lm-panel lm-projects-panel"><header><div><span class="lm-eyebrow">PERFIL · PROJETOS</span><h2>Meus projetos em andamento</h2><p>Abra um projeto para conhecer quem está criando, por que ele importa e qual é o próximo passo.</p></div><button type="button" class="lm-text-action">Ver todos →</button></header><div class="lm-project-list" data-profile-project-list>' + rows + '</div><button type="button" class="lm-outline-action" data-project-create>＋ Criar novo projeto</button>'
    + renderProjectBuilder('teacher-projects');
  return labPart('teacher-projects', content, selectedId, 'lm-profile-card-part');
}
function renderProjectBuilder(scope: 'teacher-projects' | 'student-projects'): string {
  const fieldKey = (name: string): string => scope + ':' + name;
  const competenceOptions = PROJECT_COMPETENCIES.map((name, index) => '<label><input type="checkbox" name="projectCompetency" value="' + e(name) + '" data-interaction-toggle="project-competency-' + index + '"><span>' + e(name) + '</span></label>').join('');
  const stepNames = ['Autoria', 'Justificativa', 'Aprendizagem', 'Plano'];
  const stepHints = ['Quem está criando', 'Por que importa', 'O que observar', 'Como vai acontecer'];
  const stepper = stepNames.map((title, index) => `<button type="button" role="tab" id="${scope}-project-step-tab-${index}" data-project-wizard-step-select="${index}" aria-selected="${index === 0}" aria-controls="${scope}-project-step-${index}" tabindex="${index === 0 ? 0 : -1}"><span>0${index + 1}</span><b>${title}</b><small>${stepHints[index]}</small></button>`).join('');
  const steps = [
    `<section class="lm-project-step-panel" id="${scope}-project-step-0" role="tabpanel" aria-labelledby="${scope}-project-step-tab-0" data-project-step-panel="0"><span class="lm-eyebrow">01 · AUTORIA E CONTEXTO</span><h4>Quem está por trás da ideia?</h4><p>Nomeie o grupo e escolha para quem o projeto quer fazer diferença.</p><div class="lm-project-form-fields"><label>Nome do projeto<input name="projectTitle" data-interaction-field="${fieldKey('projectTitle')}" maxlength="80" placeholder="Ex.: Mapa de histórias do bairro" required></label><label>Autoria do grupo<input name="projectAuthors" data-interaction-field="${fieldKey('projectAuthors')}" maxlength="120" placeholder="Ex.: Ana Beatriz e grupo do 7º ano" required></label><label>Público ou comunidade<select name="projectAudience" data-interaction-field="${fieldKey('projectAudience')}"><option>Comunidade escolar</option><option>Famílias</option><option>Meu bairro</option><option>Comunidade online da Lumira</option></select></label></div><footer><span>O nome dá autoria ao trabalho coletivo.</span><button type="button" class="lm-small-primary" data-project-step-next>Continuar →</button></footer></section>`,
    `<section class="lm-project-step-panel" id="${scope}-project-step-1" role="tabpanel" aria-labelledby="${scope}-project-step-tab-1" data-project-step-panel="1" hidden><span class="lm-eyebrow">02 · JUSTIFICATIVA</span><h4>Que pergunta move vocês?</h4><p>Registre o objetivo e o motivo de o grupo querer investigar isso.</p><div class="lm-project-form-fields"><label>O que vocês querem realizar?<textarea name="projectGoal" data-interaction-field="${fieldKey('projectGoal')}" rows="3" maxlength="300" placeholder="Qual mudança, pergunta ou criação vai orientar o projeto?" required></textarea></label><label>Por que esse projeto importa?<textarea name="projectJustification" data-interaction-field="${fieldKey('projectJustification')}" rows="3" maxlength="500" placeholder="O que vocês perceberam ou querem transformar?" required></textarea></label></div><footer><button type="button" class="lm-activity-cancel" data-project-step-previous>← Autoria</button><button type="button" class="lm-small-primary" data-project-step-next>Continuar →</button></footer></section>`,
    `<section class="lm-project-step-panel" id="${scope}-project-step-2" role="tabpanel" aria-labelledby="${scope}-project-step-tab-2" data-project-step-panel="2" hidden><span class="lm-eyebrow">03 · APRENDIZAGEM E AVALIAÇÃO</span><h4>Que aprendizagem vai aparecer no caminho?</h4><p>Escolham competências e evidências que ajudem o grupo a explicar o que descobriu.</p><div class="lm-project-form-fields"><fieldset class="lm-project-competencies"><legend>Competências relacionadas <small>Escolha uma ou mais</small></legend>${competenceOptions}</fieldset><label>O que o grupo vai produzir ou demonstrar?<textarea name="projectLearningEvidence" data-interaction-field="${fieldKey('projectLearningEvidence')}" rows="3" maxlength="500" placeholder="Ex.: comparar relatos e justificar como escolhemos as fontes." required></textarea></label><label>Como vão desenvolver a ideia?<textarea name="projectSummary" data-interaction-field="${fieldKey('projectSummary')}" rows="3" maxlength="600" placeholder="Conte as etapas e como a comunidade poderá participar." required></textarea></label></div><footer><button type="button" class="lm-activity-cancel" data-project-step-previous>← Justificativa</button><button type="button" class="lm-small-primary" data-project-step-next>Continuar →</button></footer></section>`,
    `<section class="lm-project-step-panel" id="${scope}-project-step-3" role="tabpanel" aria-labelledby="${scope}-project-step-tab-3" data-project-step-panel="3" hidden><span class="lm-eyebrow">04 · PLANO E REVISÃO</span><h4>Transformem a ideia em próximos passos</h4><p>Marcos ajudam o grupo a combinar o que vem agora e quando quer retomar o projeto.</p><section class="lm-project-calendar"><div><span class="lm-eyebrow">CALENDÁRIO DO GRUPO</span><h5>Marcos e encontros</h5></div><div data-project-calendar></div><div class="lm-project-milestone-add"><label>Nome do marco<input name="projectMilestoneTitle" data-interaction-field="${fieldKey('projectMilestoneTitle')}" maxlength="70" placeholder="Ex.: Conversar com moradores"></label><label>Data<input type="date" name="projectMilestoneDate" data-interaction-field="${fieldKey('projectMilestoneDate')}" value="2026-10-28"></label><button type="button" class="lm-project-add-milestone" data-project-milestone-add>＋ Adicionar marco</button></div></section><label class="lm-project-social-choice"><input type="checkbox" name="projectSocialDraft" value="yes" checked data-interaction-toggle="project-social-draft"><span><b>Preparar para o Social</b><small>O projeto fica como rascunho. Publicar exige uma decisão posterior.</small></span></label><footer><button type="button" class="lm-activity-cancel" data-project-step-previous>← Aprendizagem</button><button type="button" class="lm-small-primary" data-project-review>Revisar com a IA local →</button></footer></section>`,
  ].join('');
  return `<section class="lm-project-builder" data-project-builder hidden><header><div><span class="lm-eyebrow">PROJETO COLABORATIVO</span><h3>Vamos tirar a ideia do papel</h3><p>Conte quem está criando, por que a ideia importa, o que querem aprender e como o grupo vai avançar. No fim, a IA comenta a proposta; vocês decidem se ela está pronta.</p></div><button type="button" class="lm-panel-more" data-project-cancel aria-label="Fechar criação">×</button></header>
    <div class="lm-project-builder-layout"><form class="lm-project-form" data-project-create-form novalidate>
      <section class="lm-project-review" data-project-review-panel hidden aria-live="polite"><header><span class="lm-ai-badge"><i></i> REVISÃO DO COGNOSCERE LOCAL</span><span data-project-review-status>LEITURA CONCLUÍDA</span></header><div class="lm-project-review-comment lm-markdown" data-project-review-comment tabindex="-1"></div><p data-project-review-prompt>Leia o comentário. Confirme para criar o rascunho ou volte aos passos para ajustar.</p><footer><button type="button" class="lm-activity-cancel" data-project-review-edit>Voltar aos passos</button><button type="button" class="lm-activity-cancel" data-project-review-retry hidden>Revisar proposta atualizada</button><button type="button" class="lm-small-primary" data-project-review-confirm>Confirmar projeto</button></footer></section>
      <nav class="lm-project-stepper" role="tablist" aria-label="Etapas de criação do projeto">${stepper}</nav>${steps}
    </form><aside class="lm-project-planner"><header><div><span class="lm-eyebrow">IDEIA E PLANEJAMENTO</span><h4>Conversa do projeto</h4></div><span class="lm-project-local-tag" data-project-assistant-status aria-live="polite">VERIFICANDO COGNOSCERE LOCAL</span></header><div class="lm-project-chat-messages" data-project-chat-messages aria-live="polite"></div><form class="lm-project-chat-form" data-project-chat-form><label for="${scope}-chat-prompt">Peça ajuda para desenvolver uma parte</label><textarea id="${scope}-chat-prompt" name="projectChatPrompt" data-interaction-field="${fieldKey('projectChatPrompt')}" rows="3" maxlength="500" placeholder="Ex.: que fontes a gente pode consultar para esse mapa?" required></textarea><button type="submit" class="lm-small-primary">Conversar com Cognoscere →</button><small>A conversa considera a ficha atual. A revisão final pede sua confirmação antes de criar o projeto.</small></form></aside></div></section>`;
}
function agendaDateLabel(date: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(year, month - 1, day));
}
function renderAgendaEvent(item: ProfileAgendaItem, partId: string, tone: string, local: boolean): string {
  const element = PROFILE_AGENDA_ELEMENTS.find(option => option.id === item.elementId);
  const typeLabel = element?.type === 'competency-question' ? 'QUESTÃO · HISTÓRICO' : element ? 'DESAFIO · EVENTO SOCIAL' : '';
  const elementChip = element ? '<span class="lm-agenda-element-chip"><b>' + typeLabel + '</b><span>' + e(element.title) + '</span><small>' + e(element.detail) + '</small></span>' : '';
  return '<article class="lm-agenda-item' + (local ? ' lm-agenda-item-local' : '') + '" data-agenda-event-id="' + e(item.id) + '" data-agenda-owner="' + e(partId) + '">'
    + '<time datetime="' + e(item.date + 'T' + item.time) + '">' + e(item.time) + '</time><i class="tone-' + e(tone) + '"></i><div class="lm-agenda-item-content">'
    + '<header><b>' + e(item.title) + '</b><time>' + e(agendaDateLabel(item.date)) + '</time></header><small>' + e(item.detail) + '</small>' + elementChip
    + '<div class="lm-agenda-share-row"><button type="button" data-profile-agenda-share="' + e(item.id) + '" data-agenda-title="' + e(item.title) + '" data-agenda-detail="' + e(item.detail) + '" data-agenda-date="' + e(item.date) + '" data-agenda-time="' + e(item.time) + '" data-agenda-element-id="' + e(item.elementId) + '">Compartilhar como postagem</button><small data-agenda-share-state="' + e(item.id) + '">Visibilidade privada</small></div>'
    + '</div></article>';
}
function renderAgendaPanel(data: ComponentFixture, selectedId: string, partId: 'teacher-agenda' | 'student-agenda'): string {
  data = prototypeData(partId, data);
  const agenda = labList<ComponentFixture>(data, 'agenda');
  const events: ProfileAgendaItem[] = agenda.map((item, index) => ({
    id: partId + '-seed-' + index,
    title: labText(item, 'title', 'Atividade'), detail: labText(item, 'detail', 'Encontro da comunidade'),
    date: labText(item, 'date', '2026-10-22'), time: labText(item, 'time', '09:00'), elementId: labText(item, 'elementId'),
  }));
  const options = PROFILE_AGENDA_ELEMENTS.map(option => '<option value="' + e(option.id) + '">' + e((option.type === 'competency-question' ? 'Questão do histórico · ' : 'Evento social · ') + option.title) + '</option>').join('');
  const isStudent = partId === 'student-agenda';
  const heading = isStudent ? 'Agenda do estudante' : 'Minha agenda docente';
  const visibilityKey = partId + ':visibility';
  const content = '<article class="lm-panel lm-agenda-panel" data-agenda-role="' + (isStudent ? 'student' : 'teacher') + '"><header><div><span class="lm-eyebrow">PERFIL · AGENDA</span><h2>' + heading + '</h2></div><button type="button" class="lm-small-primary" data-profile-agenda-create>＋ Novo compromisso</button></header>'
    + '<section class="lm-agenda-visibility"><label for="' + partId + '-visibility">Visibilidade padrão no perfil pessoal</label><select id="' + partId + '-visibility" data-interaction-field="' + visibilityKey + '"><option value="private">Somente eu</option><option value="school">Minha escola</option><option value="community">Comunidade Lumira</option></select><p>Você escolhe quando cada compromisso vira uma postagem. Respostas e devolutivas continuam privadas.</p></section>'
    + '<div class="lm-agenda-date">▦ <b>Compromissos e encontros</b><span>' + events.length + ' itens</span></div><div class="lm-agenda-list" data-profile-agenda-event-list">' + events.map((item, index) => renderAgendaEvent(item, partId, labText(agenda[index], 'tone', 'blue'), false)).join('') + '</div>'
    + '<form class="lm-agenda-composer" data-profile-agenda-composer hidden novalidate><header><div><span class="lm-eyebrow">NOVO ITEM · ' + (isStudent ? 'PERFIL DO ESTUDANTE' : 'PERFIL DOCENTE') + '</span><h3>Adicionar à agenda</h3></div><button type="button" class="lm-panel-more" data-profile-agenda-cancel aria-label="Fechar criação">×</button></header>'
    + '<label>Nome<input name="agendaTitle" data-interaction-field="' + partId + ':title" maxlength="90" placeholder="Ex.: Encontro do clube de Ciências" required></label>'
    + '<div class="lm-agenda-form-row"><label>Data<input type="date" name="agendaDate" data-interaction-field="' + partId + ':date" value="2026-10-24" required></label><label>Horário<input type="time" name="agendaTime" data-interaction-field="' + partId + ':time" value="14:00" required></label></div>'
    + '<label>O que vai acontecer?<textarea name="agendaDetail" data-interaction-field="' + partId + ':detail" rows="2" maxlength="220" placeholder="Conte o contexto do encontro ou da atividade." required></textarea></label>'
    + '<button type="button" class="lm-agenda-element-toggle" data-profile-agenda-element-toggle>＋ Adicionar elemento da plataforma</button><div class="lm-agenda-element-picker" data-profile-agenda-element-picker hidden><label>Vincular questão ou desafio<select name="agendaElementId" data-interaction-field="' + partId + ':elementId"><option value="">Sem vínculo</option>' + options + '</select></label><small>Questões vêm do histórico de competências. Desafios apontam para atividades em eventos sociais.</small></div>'
    + '<footer><button type="button" class="lm-activity-cancel" data-profile-agenda-cancel>Cancelar</button><button type="submit" class="lm-small-primary">Adicionar à agenda</button></footer></form>'
    + '<section class="lm-agenda-published"><header><div><span class="lm-eyebrow">PERFIL · POSTAGENS</span><h3>Publicações da agenda</h3></div><span data-agenda-published-count>0</span></header><div data-profile-agenda-published-list><p class="lm-agenda-empty">Nenhum compromisso foi publicado. A agenda continua privada até você escolher um público e compartilhar um item.</p></div></section>'
    + '<p class="lm-agenda-feedback" data-agenda-feedback role="status" aria-live="polite"></p></article>';
  return labPart(partId, content, selectedId, 'lm-profile-card-part');
}
function renderPersonalizationPanel(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('teacher-personalization', data);
  const preferences = labList<string>(data, 'preferences');
  const toggles = preferences.map((item, index) => '<label>' + e(item) + '<input type="checkbox" ' + (index < 3 ? 'checked' : '') + ' /><span></span></label>').join('');
  const content = '<article class="lm-panel lm-personalization-panel"><header><div><span class="lm-eyebrow">SEU ESPAÇO</span><h2>Personalizar perfil</h2></div><button type="button" class="lm-close-button">×</button></header>'
    + '<nav class="lm-personalization-tabs"><button class="active">Tema</button><button>Layout</button><button>Widgets</button><button>Mídia</button></nav>'
    + '<div class="lm-cover-choices"><button type="button" class="lm-cover-choice cover-one" aria-label="Selecionar capa 1"></button><button type="button" class="lm-cover-choice cover-two selected" aria-label="Selecionar capa 2"></button><button type="button" class="lm-cover-choice cover-three" aria-label="Selecionar capa 3"></button></div>'
    + '<div class="lm-color-choices"><b>Cor de destaque</b><div><button type="button" class="tone-teal selected" aria-label="Selecionar cor turquesa"></button><button type="button" class="tone-navy" aria-label="Selecionar cor azul"></button><button type="button" class="tone-violet" aria-label="Selecionar cor violeta"></button><button type="button" class="tone-rose" aria-label="Selecionar cor rosa"></button><button type="button" class="tone-sun" aria-label="Selecionar cor amarelo"></button><button type="button" class="tone-green" aria-label="Selecionar cor verde"></button></div></div>'
    + '<div class="lm-visibility-list">' + toggles + '</div><button type="button" class="lm-primary-button">Salvar personalização</button></article>';
  return labPart('teacher-personalization', content, selectedId, 'lm-personalization-part');
}
function renderTeacherProfilePage(props: ComponentPageProps): string {
  const { data, situation } = props, selectedId = situation.selectedRegionId;
  return '<div class="lm-product-page lm-teacher-profile" data-page-id="teacher-profile"' + mockAttributes(situation) + '>'
    + renderWorkspaceSidebar('teacher-profile', data, selectedId)
    + '<div class="lm-product-main">' + renderWorkspaceTopbar(data, selectedId)
    + '<main class="lm-profile-canvas">' + renderProfileHero('teacher-hero', data, selectedId)
    + renderStories('teacher-stories', data, selectedId) + renderProfileTabs('teacher-tabs', data, selectedId)
    + '<div class="lm-profile-overview">' + renderProgressCard(data, selectedId) + renderSkillsPanel(data, selectedId) + renderAboutPanel(data, selectedId) + '</div>'
    + '<div class="lm-profile-lower">' + renderActivityCard(data, selectedId) + renderProjectsPanel(data, selectedId) + renderAgendaPanel(data, selectedId, 'teacher-agenda') + '</div>'
    + renderPersonalizationPanel(data, selectedId) + '</main></div></div>';
}
function renderStudentAchievements(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('student-achievements', data);
  const rows = labList<string>(data, 'achievements').map((item, index) => '<article class="lm-achievement"><span class="lm-achievement-icon tone-' + ['teal', 'sun', 'violet'][index % 3] + '">✦</span><div><b>' + e(item) + '</b><small>Autorizada para exibição pública</small></div><span class="lm-achievement-check">✓</span></article>').join('');
  const content = '<article class="lm-panel lm-student-achievements"><header><h2>Conquistas compartilhadas</h2><span>3 itens</span></header><div>' + rows + '</div></article>';
  return labPart('student-achievements', content, selectedId, 'lm-profile-card-part');
}
function renderStudentSkillRows(interests: string[]): string {
  const tones = ['teal', 'blue', 'violet', 'sun'];
  return interests.map((item, index) => '<div class="lm-student-skill"><span class="lm-student-skill-mark tone-' + tones[index % tones.length] + '" aria-hidden="true">✦</span><div><b>' + e(item) + '</b><small>Competência de interesse</small></div><span class="lm-student-skill-check" aria-label="Interesse público">✓</span></div>').join('');
}
const STUDENT_PROGRESS_SAMPLE = {
  completion: 68,
  activityCount: 12,
  evidenceCount: 7,
  projectCount: 4,
  activeWeeks: 3,
  skills: [
    { title: 'Comunicação', steps: '3 de 5 etapas', progress: 60, evidence: '2 registros' },
    { title: 'Pensamento científico', steps: '2 de 4 etapas', progress: 50, evidence: '1 registro' },
    { title: 'Colaboração', steps: '4 de 6 etapas', progress: 67, evidence: '3 registros' },
  ],
  weeks: [2, 4, 3, 5, 4],
};
function renderStudentProgressDashboard(): string {
  const sample = STUDENT_PROGRESS_SAMPLE;
  const skills = sample.skills.map(skill => '<article class="lm-student-progress-skill"><div class="lm-student-progress-skill-copy"><div><b>' + e(skill.title) + '</b><small>' + e(skill.evidence) + '</small></div><span>' + e(skill.steps) + '</span></div><div class="lm-student-progress-track" role="img" aria-label="' + e(skill.title) + ': ' + skill.progress + '% das etapas demonstrativas"><span style="width:' + skill.progress + '%"></span></div></article>').join('');
  const bars = sample.weeks.map((count, index) => '<div class="lm-student-week"><span class="lm-student-week-bar" style="height:' + (count / 5 * 100) + '%" role="img" aria-label="Semana ' + (index + 1) + ': ' + count + ' registros"></span><small>' + ['S−4', 'S−3', 'S−2', 'S−1', 'Agora'][index] + '</small><b>' + count + '</b></div>').join('');
  return '<section class="lm-student-progress-dashboard" data-student-progress-dashboard hidden aria-labelledby="lm-student-progress-title">'
    + '<header class="lm-student-dashboard-header"><div><span class="lm-eyebrow">VISÃO DO ESTUDANTE · AMOSTRA</span><h3 id="lm-student-progress-title">Seu percurso, em contexto</h3><p>Indicadores demonstrativos de participação e etapas; não representam notas nem avaliação de domínio.</p></div><button type="button" class="lm-text-action" data-student-progress-close>← Competências</button></header>'
    + '<div class="lm-student-progress-overview"><div class="lm-student-progress-feature"><div><span>ETAPAS DO CICLO</span><strong>' + sample.completion + '<small>%</small></strong><p>percorridas nesta amostra</p></div><div class="lm-student-progress-track" role="img" aria-label="' + sample.completion + '% das etapas demonstrativas percorridas"><span style="width:' + sample.completion + '%"></span></div><small>Próximo passo: registrar uma nova evidência de aprendizagem.</small></div>'
    + '<div class="lm-student-progress-metrics"><div><b>' + sample.activityCount + '</b><span>atividades</span></div><div><b>' + sample.evidenceCount + '</b><span>registros de evidência</span></div><div><b>' + sample.projectCount + '</b><span>projetos</span></div><div><b>' + sample.activeWeeks + '</b><span>semanas ativas</span></div></div></div>'
    + '<div class="lm-student-progress-details"><section class="lm-student-progress-skills"><header><div><span class="lm-eyebrow">ETAPAS POR COMPETÊNCIA</span><h4>O que está em movimento</h4></div><span>EXEMPLO</span></header>' + skills + '<small class="lm-student-progress-footnote">As barras contam etapas propostas para a demonstração, não medem proficiência.</small></section>'
    + '<section class="lm-student-week-panel"><header><div><span class="lm-eyebrow">PARTICIPAÇÃO</span><h4>Ritmo nas últimas semanas</h4></div><span>REGISTROS</span></header><div class="lm-student-week-chart" aria-label="Registros de atividade por semana">' + bars + '</div><p>Sequência ilustrativa de registros, sem comparação com outros estudantes.</p></section></div>'
    + '<footer class="lm-student-dashboard-next"><span aria-hidden="true">↗</span><div><b>Um próximo passo possível</b><p>Escolha uma atividade e registre o que observou, tentou ou aprendeu.</p></div><button type="button" class="lm-text-action" data-component-select="student-activity" data-screen-id="student-profile">Abrir atividades →</button></footer>'
    + '</section>';
}
function renderStudentSkillsPanel(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('student-skills', data);
  const screenId = activePageComposition?.situation.screenId ?? 'student-profile';
  const interests = profileValues(screenId, data, true).competencies;
  const rows = renderStudentSkillRows(interests);
  const content = '<article class="lm-panel lm-student-skills"><header><div><span class="lm-eyebrow">PERFIL · INTERESSES</span><h2>Competências escolhidas</h2><small>O que quero explorar</small></div><div class="lm-student-skills-actions"><button type="button" class="lm-text-action" data-student-progress-open aria-controls="lm-student-progress-title" aria-expanded="false">Ver todos <span aria-hidden="true">→</span></button><button type="button" class="lm-profile-field-edit" data-profile-edit data-profile-focus-field="competencies" aria-label="Editar interesses escolhidos">✎</button></div></header>'
    + '<div data-student-interest-content><div data-student-interest-list>' + (rows || '<div class="empty">Nenhum interesse selecionado.</div>') + '</div>'
    + '<p class="lm-student-skills-note">Interesses públicos orientam novas explorações; não indicam domínio.</p></div>'
    + renderStudentProgressDashboard() + '</article>';
  return labPart('student-skills', content, selectedId, 'lm-profile-card-part');
}
function renderStudentActivityCard(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('student-activity', data);
  const content = '<article class="lm-panel lm-student-experience-card"><header><div><h2>Experiência compartilhada</h2><small>Escolhida para aparecer no perfil</small></div><button type="button" class="lm-text-action">Ver publicações</button></header>'
    + '<img class="lm-student-activity-image" src="' + studentRampStoryAsset + '" alt="Estudante compara carrinhos em uma rampa de investigação científica">'
    + '<div class="lm-student-activity-copy"><span class="lm-eyebrow">CIÊNCIAS · INVESTIGAÇÃO</span><h3>' + e(labText(data, 'activityTitle', 'Uma investigação sobre movimento')) + '</h3><p>' + e(labText(data, 'activityText', 'Uma experiência escolhida para compartilhar com a comunidade.')) + '</p>'
    + '<div class="lm-activity-tags">' + labList<string>(data, 'activityTags').map(tag => LabPill(tag)).join('') + '</div><footer><button type="button" class="lm-like-action" aria-label="Curtir experiência">♡ 12</button><span>Produção pública autorizada</span></footer></div></article>';
  return labPart('student-activity', content, selectedId, 'lm-feed-card-part');
}
function renderStudentProjectsPanel(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('student-projects', data);
  const projects = labList<ComponentFixture>(data, 'projects');
  const rows = projects.map((project, index) => renderProjectPublication({
    id: labText(project, 'id', 'seed-student-project-' + index), title: labText(project, 'title', 'Projeto'),
    status: labText(project, 'status', 'Em andamento'), progress: labText(project, 'progress', 'Produção compartilhada'),
    authors: labText(project, 'authors', 'Caio e grupo de aprendizagem'), goal: labText(project, 'goal', 'Desenvolver uma ideia em grupo.'),
    justification: labText(project, 'justification', 'A turma quer investigar uma pergunta que surgiu nas atividades.'),
    summary: labText(project, 'summary', 'O grupo combina observações, conversa sobre os resultados e decide como compartilhar a produção.'),
    audience: labText(project, 'audience', 'Comunidade escolar'),
    learningEvidence: labText(project, 'learningEvidence', 'Registros, explicações e decisões justificadas pelo grupo.'),
    competencies: labList<string>(project, 'competencies'),
    milestones: Array.isArray(project.milestones) ? project.milestones as ProfileProjectMilestone[] : [],
    socialDraft: true,
  }, index)).join('');
  const content = '<article class="lm-panel lm-student-projects"><header><div><span class="lm-eyebrow">PERFIL · CRIAÇÃO</span><h2>Projetos em destaque</h2><small>Produções e ideias da turma</small></div><button type="button" class="lm-text-action">Ver todos</button></header><div class="lm-project-list" data-profile-project-list>'
    + (rows || '<div class="empty" data-project-empty>Nenhum projeto em destaque ainda. Comece uma ideia para o Social.</div>') + '</div>'
    + '<button type="button" class="lm-outline-action" data-project-create>＋ Planejar projeto para o Social</button>'
    + renderProjectBuilder('student-projects') + '</article>';
  return labPart('student-projects', content, selectedId, 'lm-profile-card-part');
}
function renderStudentProfilePage(props: ComponentPageProps): string {
  const { data, situation } = props, selectedId = situation.selectedRegionId;
  return '<div class="lm-product-page lm-student-profile" data-page-id="student-profile"' + mockAttributes(situation) + '>'
    + renderWorkspaceSidebar('student-profile', data, selectedId)
    + '<div class="lm-product-main">' + renderWorkspaceTopbar(data, selectedId)
    + '<main class="lm-profile-canvas">' + renderProfileHero('student-hero', data, selectedId, true)
    + renderStories('student-stories', data, selectedId) + renderProfileTabs('student-tabs', data, selectedId)
    + '<div class="lm-student-overview">' + renderStudentSkillsPanel(data, selectedId) + renderProgressCard(data, selectedId, true) + renderStudentAchievements(data, selectedId) + renderAboutPanel(data, selectedId, true) + '</div>'
    + '<div class="lm-student-lower">' + renderStudentActivityCard(data, selectedId) + renderStudentProjectsPanel(data, selectedId) + renderAgendaPanel(data, selectedId, 'student-agenda') + '</div>'
    + '</main></div></div>';
}

function renderPedagogyContext(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('pedagogy-context', data);
  const content = '<section class="lm-workspace-context"><header><div><span class="lm-eyebrow">ESPAÇO DOCENTE · PLANEJAMENTO</span><h1>' + e(labText(data, 'subject', 'Ciências da Natureza')) + '</h1><p>Defina a turma e a situação em que a competência será exercida.</p></div><span class="lm-derived-label">PROPOSTA DERIVADA</span></header>'
    + '<div class="lm-context-fields"><label><span>Turma</span><select name="className" data-ai-field="className"><option ' + (labText(data, 'className') === '8º A' ? 'selected' : '') + '>8º A</option><option>8º B</option></select></label>'
    + '<label><span>Série</span><select name="grade" data-ai-field="grade"><option selected>8º ano</option><option>7º ano</option><option>9º ano</option></select></label>'
    + '<label class="lm-context-wide"><span>Contexto de aplicação</span><input name="context" data-ai-field="context" value="' + e(labText(data, 'context')) + '"></label></div>'
    + '<section class="lm-subject-foundation" data-subject-foundation><div class="lm-subject-foundation-heading"><div><span class="lm-eyebrow">CRIAÇÃO DE MATÉRIA</span><h2>Fundação para orientar a IA</h2><p>Descreva a matéria por quatro dimensões e associe quantas habilidades forem necessárias.</p></div><button type="button" class="lm-secondary-button" data-subject-foundation-toggle aria-expanded="false">＋ Criar matéria</button></div>'
    + '<div class="lm-subject-foundation-summary" data-subject-foundation-summary hidden></div>'
    + '<form class="lm-subject-foundation-editor" data-subject-foundation-form hidden novalidate><label class="lm-subject-name-field"><span>Nome da matéria</span><input name="subjectName" data-interaction-field="pedagogy-context:subject-name" maxlength="100" placeholder="Ex.: Ciências da Natureza" required></label>'
    + '<div class="lm-subject-dimensions"><label><span>Natureza</span><small>Que fenômenos, objetos ou problemas constituem esta matéria?</small><textarea name="subjectNature" data-interaction-field="pedagogy-context:subject-nature" rows="3" maxlength="700" placeholder="Descreva o campo de conhecimento e o que o caracteriza." required></textarea></label>'
    + '<label><span>Entendimento</span><small>Que relações a pessoa deve aprender a compreender?</small><textarea name="subjectUnderstanding" data-interaction-field="pedagogy-context:subject-understanding" rows="3" maxlength="700" placeholder="Explique como reconhecer compreensão além de repetir informações." required></textarea></label>'
    + '<label><span>Abordagem</span><small>Como investigar, interpretar ou produzir conhecimento?</small><textarea name="subjectApproach" data-interaction-field="pedagogy-context:subject-approach" rows="3" maxlength="700" placeholder="Indique práticas, métodos e formas de argumentar." required></textarea></label>'
    + '<label><span>Aspectos</span><small>Que contextos, representações ou limites precisam aparecer?</small><textarea name="subjectAspects" data-interaction-field="pedagogy-context:subject-aspects" rows="3" maxlength="700" placeholder="Descreva aspectos que ajudam a IA a variar exemplos sem perder o foco." required></textarea></label></div>'
    + '<div class="lm-subject-skill-section"><div><b>Habilidades da matéria</b><small>Adicione quantas habilidades precisar. Digite um nome ou código para buscar sugestões.</small></div><div class="lm-subject-skill-chips" data-subject-skill-chips></div>'
    + '<div class="lm-subject-skill-picker" data-subject-skill-picker><label><span class="sr-only">Buscar habilidade</span><input type="text" data-subject-skill-input role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="subject-skill-options" aria-describedby="subject-skill-understanding" placeholder="Ex.: consumo de energia, EF08CI04…" autocomplete="off"></label>'
    + '<div class="lm-subject-skill-menu" data-subject-skill-menu hidden><div class="lm-subject-skill-options" id="subject-skill-options" role="listbox" data-subject-skill-options></div><aside class="lm-subject-skill-understanding" id="subject-skill-understanding" data-subject-skill-understanding role="tooltip" aria-live="polite" hidden></aside></div></div></div>'
    + '<footer class="lm-subject-foundation-actions"><p data-subject-foundation-status role="status" aria-live="polite"></p><div><button type="button" class="lm-quiet-action" data-subject-foundation-cancel>Cancelar</button><button type="submit" class="lm-primary-button">Salvar fundação da matéria <span aria-hidden="true">→</span></button></div></footer></form></section>'
    + '<div class="lm-context-foot"><span>Professora <b>' + e(labText(data, 'name', 'Helena Martins')) + '</b></span><span>Referência curricular <b>BNCC · Ciências</b></span><span>Dados demonstrativos · edição local</span></div></section>';
  return labPart('pedagogy-context', content, selectedId, 'lm-pedagogy-context-part');
}

function renderPedagogyCompetency(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('pedagogy-competency', data);
  const codes = labList<string>(data, 'skills');
  const criteria = labList<string>(data, 'criteria');
  const content = '<article class="lm-panel lm-pedagogy-competency"><header><div><span class="lm-eyebrow">DA REFERÊNCIA À AÇÃO</span><h2>Competência em foco</h2></div><button type="button" class="lm-text-action">Editar relação</button></header>'
    + '<div class="lm-competency-summary"><div><small>HABILIDADES DE REFERÊNCIA · BNCC</small><div class="lm-bncc-codes">' + codes.map(code => LabPill(code, 'blue')).join('') + '</div></div><span class="lm-competency-arrow" aria-hidden="true">→</span><div><small>AÇÃO A OBSERVAR</small><strong>' + e(labList<string>(data, 'competencies')[0] ?? 'Relacionar potência, tempo de uso e consumo elétrico') + '</strong></div></div>'
    + '<div class="lm-observation-criteria"><b>Critérios que orientarão a leitura</b><div>' + criteria.map((criterion, index) => '<label><input type="checkbox" name="criterion-' + index + '" data-ai-field="criterion-' + index + '" ' + (index < 3 ? 'checked' : '') + '><span>' + e(criterion) + '</span></label>').join('') + '</div></div>'
    + '<p class="lm-pedagogy-note">A atividade pode mobilizar mais de uma habilidade. A professora define quais relações a questão realmente permite observar.</p></article>';
  return labPart('pedagogy-competency', content, selectedId, 'lm-pedagogy-panel-part');
}

function renderPedagogyActivityBuilder(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('pedagogy-activity-builder', data);
  const content = '<article class="lm-panel lm-activity-builder"><header><div><span class="lm-eyebrow">EDITOR DE ATIVIDADE · RASCUNHO LOCAL</span><h2>Construir uma sequência de questões</h2><p>Organize a intenção pedagógica, edite cada pergunta em sua própria etapa e revise o conjunto antes de confirmar.</p></div><span class="lm-derived-label">EDITÁVEL NESTA TELA</span></header>'
    + '<section class="lm-activity-editor" data-activity-editor><div data-activity-editor-content></div><p class="lm-action-feedback" data-review-feedback role="status" aria-live="polite"></p></section>'
    + '<p class="lm-pedagogy-note">O rascunho e a aprovação existem somente nesta sessão de demonstração. Não há publicação de atividade real.</p></article>';
  return labPart('pedagogy-activity-builder', content, selectedId, 'lm-pedagogy-panel-part', data);
}

function renderPedagogyEvidenceReview(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('pedagogy-evidence-review', data);
  const criteria = labList<string>(data, 'criteria');
  const answer = 'As oito lâmpadas somam 80 W e ficam ligadas seis horas. O ventilador usa 100 W, mas agora funciona quatro horas. Vou comparar energia no período: as lâmpadas chegam a 9,6 kWh e o ventilador a 8 kWh, então a mudança do horário faz diferença.';
  const mappings = [
    ['Considera a potência do conjunto de lâmpadas', '“As oito lâmpadas somam 80 W”', 'Evidenciado'],
    ['Incorpora a mudança na duração de uso', '“agora funciona quatro horas”', 'Evidenciado'],
    ['Justifica a comparação com os dados do contexto', '“9,6 kWh e o ventilador a 8 kWh”', 'Parcial'],
  ];
  const rows = mappings.map(([criterion, quote, status], index) => '<article class="lm-evidence-row"><div><small>CRITÉRIO ' + String(index + 1).padStart(2, '0') + '</small><b>' + e(criteria[index] ?? criterion) + '</b></div><blockquote>' + e(quote) + '</blockquote><label><span>Leitura do monitor</span><select name="evidence-' + index + '" data-ai-field="evidence-' + index + '"><option ' + (status === 'Evidenciado' ? 'selected' : '') + '>Evidenciado</option><option ' + (status === 'Parcial' ? 'selected' : '') + '>Parcial</option><option>Não evidenciado</option><option>Enunciado insuficiente</option></select></label></article>').join('');
  const content = '<article class="lm-panel lm-evidence-review"><header><div><span class="lm-eyebrow">RESPOSTA FICTÍCIA · 8º A</span><h2>Conferir atribuições do monitor</h2></div><span class="lm-ai-badge"><i></i> IA · MOCK</span></header>'
    + '<blockquote class="lm-student-evidence-answer">“' + e(answer) + '”<small>Caio · tentativa demonstrativa · atividade V1</small></blockquote>'
    + '<div class="lm-evidence-table"><div class="lm-evidence-table-head"><span>CRITÉRIO</span><span>TRECHO CITADO</span><span>ATRIBUIÇÃO</span></div>' + rows + '</div>'
    + '<div class="lm-review-footer"><p>Trechos e parecer são fictícios. Revisar esta resposta não altera outras tentativas nem o estado da competência.</p><div><button type="button" class="lm-secondary-button" data-review-action="request">Pedir nova leitura</button><button type="button" class="lm-primary-button" data-review-action="accept">Confirmar revisão</button></div></div><p class="lm-action-feedback" data-review-feedback role="status"></p></article>';
  return labPart('pedagogy-evidence-review', content, selectedId, 'lm-pedagogy-panel-part');
}

function renderPedagogyCourseSequence(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('pedagogy-course-sequence', data);
  const content = '<article class="lm-panel lm-course-sequence"><header><div><span class="lm-eyebrow">CURSO · SEQUÊNCIA DE COMPREENSÃO</span><h2>Montar um percurso revisável</h2><p>Varie apoio e situação sem perder a ação aplicada que organiza o material.</p></div><button type="button" class="lm-primary-button" data-ai-generate="sequence">✦ Preencher sequência mock</button></header>'
    + '<label class="lm-course-title"><span>Nome do percurso</span><input name="courseTitle" data-ai-field="courseTitle" value="' + e(labText(data, 'courseTitle')) + '"></label>'
    + '<div class="lm-sequence-empty" data-sequence-empty>Peça uma proposta para preencher as etapas. A ordem continua editável pela professora.</div>'
    + '<ol class="lm-sequence-list" data-sequence-generated hidden>' + Array.from({ length: 5 }, (_, index) => '<li><span class="lm-sequence-number">0' + (index + 1) + '</span><div><label><span>Etapa</span><input name="stage-title-' + index + '" data-ai-field="stage-title-' + index + '" data-sequence-title value=""></label><label><span>Material e ação</span><textarea name="stage-body-' + index + '" data-ai-field="stage-body-' + index + '" data-sequence-body rows="2"></textarea></label></div></li>').join('') + '</ol>'
    + '<p class="lm-pedagogy-note">Sugestão local: texto-base → hipótese → representação → nova condição → aplicação independente. Concluir o curso não comprova domínio.</p></article>';
  return labPart('pedagogy-course-sequence', content, selectedId, 'lm-pedagogy-panel-part');
}

function renderPedagogyMaterialShare(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('pedagogy-material-share', data);
  const content = '<article class="lm-panel lm-material-share"><header><div><span class="lm-eyebrow">PUBLICAÇÃO · CONTEÚDO REVISADO</span><h2>Compartilhar o material</h2><p>O material circula como objeto próprio, com autoria e relação curricular.</p></div><span class="lm-derived-label">RASCUNHO</span></header>'
    + '<div class="lm-share-grid"><label><span>Apresentação pública</span><textarea name="shareDescription" data-ai-field="shareDescription" rows="3">' + e(labText(data, 'shareDescription')) + '</textarea></label><label><span>Público</span><select name="audience" data-ai-field="audience"><option>Minha turma</option><option>Minha escola</option><option>Comunidade Lumira</option></select></label></div>'
    + '<fieldset class="lm-share-includes"><legend>Partes que acompanham a publicação</legend><label><input type="checkbox" name="shareQuestion" data-ai-field="shareQuestion" checked><span>Enunciado revisado</span></label><label><input type="checkbox" name="shareContext" data-ai-field="shareContext" checked><span>Contexto e fontes selecionadas</span></label><label><input type="checkbox" name="shareSequence" data-ai-field="shareSequence" checked><span>Sequência de compreensão</span></label></fieldset>'
    + '<div class="lm-private-boundary"><span aria-hidden="true">⌑</span><p><b>Respostas e pareceres permanecem privados.</b> Eles não acompanham esta publicação nem aparecem no feed.</p></div>'
    + '<footer class="lm-share-footer"><p class="lm-action-feedback" data-share-feedback role="status">Nenhum material publicado nesta demonstração.</p><button type="button" class="lm-primary-button" data-share-action="publish">Publicar amostra revisada</button></footer></article>';
  return labPart('pedagogy-material-share', content, selectedId, 'lm-pedagogy-panel-part');
}

function renderTeacherWorkspacePage(props: ComponentPageProps): string {
  const { data, situation } = props, selectedId = situation.selectedRegionId;
  return '<div class="lm-product-page lm-teacher-workspace" data-page-id="teacher-workspace"' + mockAttributes(situation) + '>'
    + renderWorkspaceSidebar('teacher-workspace', data, selectedId) + '<div class="lm-product-main">' + renderWorkspaceTopbar(data, selectedId)
    + '<main class="lm-pedagogy-canvas">' + renderPedagogyContext(data, selectedId) + renderPedagogyCompetency(data, selectedId)
    + renderPedagogyActivityBuilder(data, selectedId) + renderPedagogyEvidenceReview(data, selectedId)
    + renderPedagogyCourseSequence(data, selectedId) + renderPedagogyMaterialShare(data, selectedId) + '</main></div></div>';
}

function renderLearnerActivityBrief(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('learner-activity-brief', data);
  const content = '<article class="lm-panel lm-learner-brief"><header><div><span class="lm-eyebrow">CIÊNCIAS · 8º A · ATIVIDADE ABERTA</span><h2>' + e(labText(data, 'activityTitle', 'Uma decisão sobre o consumo da biblioteca')) + '</h2></div><span class="lm-due-date">Disponível até 24 out.</span></header>'
    + '<div class="lm-activity-context"><span class="lm-context-icon">⌂</span><div><small>A SITUAÇÃO</small><p>' + e(labText(data, 'context')) + '</p></div></div>'
    + '<div class="lm-open-question"><span>DESAFIO</span><p>' + e(labText(data, 'question')) + '</p></div>'
    + '<div class="lm-learner-resources"><span>Referências compartilhadas</span><div>' + LabPill('Ciências da Natureza', 'blue') + LabPill('Consumo elétrico') + LabPill('Resposta aberta') + '</div></div>'
    + '<p class="lm-pedagogy-note">Use os dados da situação e explique seu caminho. Há mais de uma forma de organizar o raciocínio.</p></article>';
  return labPart('learner-activity-brief', content, selectedId, 'lm-pedagogy-panel-part');
}

function renderLearnerResponse(selectedId: string): string {
  const content = '<article class="lm-panel lm-learner-response"><header><div><span class="lm-eyebrow">TENTATIVA 01 · PRIVADA</span><h2>Como você chegou a essa conclusão?</h2></div><span class="lm-lock-label">⌑ Só você e sua professora</span></header>'
    + '<form data-student-answer-form><label><span>Sua resposta e justificativa</span><textarea name="response" data-ai-field="response" rows="8" placeholder="Explique quais dados comparou e como a mudança no tempo de uso afeta sua conclusão."></textarea></label><div class="lm-response-footer"><button type="button" class="lm-secondary-button" data-student-draft>Guardar rascunho</button><span>Resposta não será publicada no perfil.</span><button type="submit" class="lm-primary-button">Enviar tentativa <span aria-hidden="true">→</span></button></div></form><p class="lm-action-feedback" data-response-feedback role="status"></p></article>';
  return labPart('learner-response', content, selectedId, 'lm-pedagogy-panel-part');
}

function renderLearnerReflection(selectedId: string): string {
  const content = '<article class="lm-panel lm-learner-reflection"><header><div><span class="lm-eyebrow">REFLEXÃO APÓS O ENVIO</span><h2>Uma leitura para continuar pensando</h2></div><span class="lm-ai-badge"><i></i> IA · SIMULAÇÃO</span></header>'
    + '<div class="lm-reflection-empty" data-reflection-empty><span aria-hidden="true">✳</span><div><b>A reflexão aparece depois da tentativa</b><p>Ela observa relações no texto enviado e não atribui nota nem muda seu percurso.</p></div></div>'
    + '<section class="lm-reflection-result" data-reflection-result hidden><p data-ai-feedback aria-live="polite"></p><div class="lm-reflection-boundary"><b>O que esta leitura significa</b><span>Uma tentativa mostra evidências situadas. Sua professora revisa a interpretação; nenhum estado de competência muda automaticamente.</span></div></section>'
    + '<div class="lm-attempt-history" data-ai-attempts></div></article>';
  return labPart('learner-reflection', content, selectedId, 'lm-pedagogy-panel-part');
}

function renderStudentActivityPage(props: ComponentPageProps): string {
  const { data, situation } = props, selectedId = situation.selectedRegionId;
  return '<div class="lm-product-page lm-student-activity" data-page-id="student-activity"' + mockAttributes(situation) + '>'
    + renderWorkspaceSidebar('student-activity', data, selectedId) + '<div class="lm-product-main">' + renderWorkspaceTopbar(data, selectedId)
    + '<main class="lm-learner-canvas"><header class="lm-learner-heading"><span class="lm-eyebrow">MEU ESPAÇO DE APRENDIZAGEM</span><h1>Atividade aberta</h1><p>Leia o contexto, organize sua ideia e explique as informações que sustentam sua conclusão.</p></header>'
    + renderLearnerActivityBrief(data, selectedId) + renderLearnerResponse(selectedId) + renderLearnerReflection(selectedId) + '</main></div></div>';
}

function renderLevelingInvitation(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('leveling-invitation', data);
  const skills = labList<string>(data, 'skills');
  const content = '<article class="lm-panel lm-leveling-invitation"><header><div><span class="lm-eyebrow">CONVITE INSTITUCIONAL · DEMONSTRAÇÃO</span><h2>Seu vínculo escolar</h2><p>Confira quem organizou este percurso antes de confirmar a matrícula.</p></div><span class="lm-invitation-status">● CONVITE VÁLIDO</span></header>'
    + '<div class="lm-invitation-card"><div class="lm-invitation-monogram">' + e(labInitials(labText(data, 'school', 'Escola Aurora'))) + '</div><div><small>ESCOLA</small><h3>' + e(labText(data, 'school', 'Escola Aurora')) + '</h3><p>' + e(labText(data, 'className', '8º A')) + ' · Ciências da Natureza</p></div><div class="lm-invitation-owner"><small>PROFESSORA RESPONSÁVEL</small><b>' + e(labText(data, 'teacherName', 'Helena Martins')) + '</b></div></div>'
    + '<div class="lm-invitation-meta"><span>ESTUDANTE <b>' + e(labText(data, 'name', 'Caio Almeida')) + '</b></span><span>CONVITE <code>' + e(labText(data, 'invitationCode', 'AURORA-8A-NIV')) + '</code></span><span>' + e(labText(data, 'responsibleAuthorization', 'Autorização escolar registrada neste cenário')) + '</span></div>'
    + '<p class="lm-pedagogy-note">Identidade e convite são fictícios. Esta prévia não cria conta, vínculo escolar ou matrícula real.</p></article>';
  return labPart('leveling-invitation', content, selectedId, 'lm-pedagogy-panel-part');
}

function renderLevelingScope(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('leveling-scope', data);
  const contexts = labList<string>(data, 'contexts');
  const skills = labList<string>(data, 'skills');
  const content = '<article class="lm-panel lm-leveling-scope"><header><div><span class="lm-eyebrow">SONDAGEM INICIAL · ' + e(String(data.questionCount ?? 5)) + ' QUESTÕES</span><h2>O que este percurso vai observar</h2><p>' + e(labText(data, 'competency', 'Relacionar potência total, duração de uso e consumo elétrico')) + '</p></div><span class="lm-ai-badge"><i></i> CONTEXTOS VARIADOS</span></header>'
    + '<div class="lm-bncc-codes">' + skills.map(skill => LabPill(skill, 'blue')).join('') + '</div>'
    + '<ol class="lm-leveling-contexts">' + contexts.map((context, index) => '<li><span>' + String(index + 1).padStart(2, '0') + '</span><b>' + e(context) + '</b><small>' + (index === 0 ? 'Comparação de potência e tempo' : index === 1 ? 'Hipótese com condição de uso' : index === 2 ? 'Quantidade, potência e duração' : index === 3 ? 'Comparação e necessidade do ambiente' : 'Transferência para outra situação') + '</small></li>').join('') + '</ol>'
    + '<div class="lm-private-boundary"><span aria-hidden="true">⌑</span><p><b>Uma pergunta não define o nível da competência.</b> As respostas serão lidas em conjunto e revisadas por uma professora.</p></div></article>';
  return labPart('leveling-scope', content, selectedId, 'lm-pedagogy-panel-part');
}

function renderLevelingConfirmation(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('leveling-confirmation', data);
  const invitationCode = labText(data, 'invitationCode', 'AURORA-8A-NIV');
  const content = '<article class="lm-panel lm-leveling-confirmation"><header><div><span class="lm-eyebrow">ÚLTIMA CONFERÊNCIA</span><h2>Confirmar matrícula</h2><p>Valide o convite e escolha quando começar. Você poderá salvar respostas e retornar a cada questão.</p></div><span class="lm-lock-label">⌑ ACESSO RESERVADO</span></header>'
    + '<form data-leveling-enrollment-form data-invitation-code="' + e(invitationCode) + '"><label><span>Código do convite</span><input name="invitationCode" data-interaction-field="leveling-invitation-code" value="' + e(invitationCode) + '" autocomplete="off" spellcheck="false"></label>'
    + '<label class="lm-enrollment-confirm-line"><input type="checkbox" name="enrollmentAcknowledged" data-interaction-field="leveling-acknowledged" data-interaction-toggle="leveling-acknowledged"><span>Conferi a escola, a turma e a competência. Entendi que as respostas deste nivelamento são reservadas.</span></label>'
    + '<button type="submit" class="lm-primary-button">Confirmar vínculo e matricular <span aria-hidden="true">→</span></button></form>'
    + '<p class="lm-action-feedback" data-leveling-feedback role="status"></p><section class="lm-enrollment-success" data-leveling-success hidden><span class="lm-enrollment-success-mark" aria-hidden="true">✓</span><div><span class="lm-eyebrow">MATRÍCULA DE DEMONSTRAÇÃO CONFIRMADA</span><h3>Seu nivelamento está pronto</h3><p>O vínculo com ' + e(labText(data, 'className', '8º A')) + ' foi confirmado nesta tela. Nenhuma resposta foi enviada ainda.</p><button type="button" class="lm-primary-button" data-screen-select="competency-questions">Começar as cinco questões <span aria-hidden="true">→</span></button></div></section></article>';
  return labPart('leveling-confirmation', content, selectedId, 'lm-pedagogy-panel-part');
}

function renderLevelingEnrollmentPage(props: ComponentPageProps): string {
  const { data, situation } = props, selectedId = situation.selectedRegionId;
  return '<div class="lm-product-page lm-leveling-enrollment" data-page-id="leveling-enrollment"' + mockAttributes(situation) + '>'
    + renderWorkspaceSidebar('leveling-enrollment', data, selectedId) + '<div class="lm-product-main">' + renderWorkspaceTopbar(data, selectedId)
    + '<main class="lm-learner-canvas"><header class="lm-learner-heading"><span class="lm-eyebrow">MEU ESPAÇO DE APRENDIZAGEM · INÍCIO DO PERCURSO</span><h1>Matrícula no nivelamento</h1><p>Confira seu vínculo, conheça a competência e entenda as cinco situações antes de começar.</p></header>'
    + renderLevelingInvitation(data, selectedId) + renderLevelingScope(data, selectedId) + renderLevelingConfirmation(data, selectedId) + '</main></div></div>';
}

function renderQuestBoard(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('quest-board', data);
  const quests = labList<QuestFixture>(data, 'quests');
  const filters: Array<[string, string]> = [['all', 'Todas'], ['available', 'Inscrições abertas'], ['registered', 'Minhas inscrições'], ['completed', 'Concluídas']];
  const content = '<section class="lm-panel lm-quest-board"><header><div><span class="lm-eyebrow">EVENTOS SOCIAIS · COMPETIÇÕES</span><h2>Competições abertas</h2><p>Confira regulamento e prazos, inscreva-se e acompanhe cada entrega.</p></div><span class="lm-quest-count">' + String(quests.length).padStart(2, '0') + ' EVENTOS</span></header>'
    + '<nav class="lm-quest-filters" aria-label="Filtrar competições">' + filters.map(([id, label], index) => '<button type="button" data-quest-filter="' + id + '" class="' + (index === 0 ? 'active' : '') + '" aria-pressed="' + String(index === 0) + '">' + e(label) + ' <small data-quest-filter-count="' + id + '"></small></button>').join('') + '</nav>'
    + '<p class="lm-action-feedback" data-quest-feedback role="status"></p>'
    + '<div class="lm-quest-layout"><div class="lm-quest-list" role="list" aria-label="Competições cadastradas">' + quests.map((quest, index) => '<button type="button" role="listitem" class="lm-quest-card ' + (index === 0 ? 'active' : '') + '" data-quest-select="' + e(quest.id) + '" data-quest-status="available" aria-pressed="' + String(index === 0) + '"><span class="lm-quest-card-icon">' + (index === 0 ? '⌁' : index === 1 ? '◉' : '⌗') + '</span><span><small>' + e(quest.category) + '</small><b>' + e(quest.title) + '</b><i data-quest-card-state>Inscrições abertas</i></span><span class="lm-quest-card-arrow">→</span></button>').join('') + '<p class="lm-quest-empty-state" data-quest-empty hidden>Não há competições neste filtro. Escolha outra categoria para consultar os eventos.</p></div>'
    + '<div class="lm-quest-details">' + quests.map(quest => '<article class="lm-quest-detail" data-quest-detail="' + e(quest.id) + '" hidden><header><div><span class="lm-eyebrow">' + e(quest.category) + ' · ' + e(quest.format) + '</span><h3>' + e(quest.title) + '</h3></div><span class="lm-quest-status" data-quest-status-label>INSCRIÇÕES ABERTAS</span></header>'
      + '<div class="lm-competition-facts"><div><small>ORGANIZAÇÃO</small><b>' + e(quest.organizer) + '</b></div><div><small>PERÍODO</small><b>' + e(quest.dateLabel) + '</b></div><div><small>INSCRIÇÕES ATÉ</small><b>' + e(quest.registrationDeadline) + '</b></div><div><small>VAGAS</small><b><span data-quest-participant-count>' + quest.registeredCount + '</span> / ' + quest.participantLimit + ' inscrições</b></div></div>'
      + '<div class="lm-quest-competency"><small>OBJETIVO DO EVENTO</small><b>' + e(quest.eventObjective) + '</b></div><div class="lm-quest-story"><small>CONTEXTO</small><p>' + e(quest.context) + '</p></div><div class="lm-quest-challenge"><small>DESAFIO</small><p>' + e(quest.challenge) + '</p></div>'
      + '<div class="lm-competition-rules-grid"><section><h4>Regulamento</h4><ul>' + quest.rules.map(rule => '<li>' + e(rule) + '</li>').join('') + '</ul></section><section><h4>Critérios de pontuação</h4><ul>' + quest.scoringCriteria.map(criterion => '<li>' + e(criterion) + '</li>').join('') + '</ul><small>A pontuação descreve o resultado deste evento; não é nota curricular.</small></section></div>'
      + '<section class="lm-competition-stages"><header><div><span class="lm-eyebrow">PARTICIPAÇÃO POR ETAPAS</span><h4>O que precisa ser registrado</h4></div><span data-quest-progress-label>0 de ' + quest.stages.length + ' etapas</span></header><ol>' + quest.stages.map((stage, index) => '<li data-quest-stage-card="' + e(stage.id) + '"><div class="lm-competition-stage-number">' + String(index + 1).padStart(2, '0') + '</div><div class="lm-competition-stage-body"><header><div><h5>' + e(stage.title) + '</h5><small>' + e(stage.dueLabel) + '</small></div><span data-quest-stage-state>Inscrição necessária</span></header><p>' + e(stage.description) + '</p><div class="lm-quest-deliverable"><span>ENTREGA</span><b>' + e(stage.deliverable) + '</b></div><form data-quest-stage-form="' + e(quest.id) + '" data-stage-id="' + e(stage.id) + '" hidden><label><span>Registro da etapa</span><textarea data-interaction-field="quest-stage:' + e(quest.id) + ':' + e(stage.id) + '" rows="3" maxlength="1600" placeholder="Descreva sua contribuição e os registros que sustentam sua entrega."></textarea></label><div class="lm-quest-submit-row"><span>Entrega com data e hora nesta demonstração.</span><button type="submit" class="lm-primary-button">Registrar etapa</button></div></form><p data-quest-stage-submission hidden></p></div></li>').join('') + '</ol></section>'
      + '<button type="button" class="lm-primary-button" data-quest-action="register" data-quest-id="' + e(quest.id) + '">Inscrever-se na competição</button>'
      + '<section class="lm-quest-registration" data-quest-participation="' + e(quest.id) + '" hidden><header><div><span class="lm-eyebrow">INSCRIÇÃO CONFIRMADA</span><h4>Seu registro de participação</h4></div><b data-quest-registration-code></b></header><p data-quest-registration-summary></p><ol class="lm-quest-audit-trail" data-quest-audit-trail aria-label="Histórico de participação"></ol></section>'
      + '</article>').join('') + '</div></div>'
    + '<p class="lm-pedagogy-note">Inscrições e entregas ficam apenas nesta demonstração local. Resultados competitivos permanecem separados das respostas e da avaliação de competências.</p></section>';
  return labPart('quest-board', content, selectedId, 'lm-pedagogy-panel-part', data);
}

function renderQuestPrinciples(selectedId: string): string {
  const content = '<aside class="lm-panel lm-quest-principles"><div><span class="lm-quest-principles-icon">✳</span><div><span class="lm-eyebrow">REGULAMENTO E REGISTRO</span><h2>Competir sem misturar resultados</h2></div></div><p>Confira quem organiza o evento, como a pontuação é composta, quais são os prazos e o que cada participante precisa entregar. Inscrição, etapas e conclusão formam um histórico local visível para a pessoa.</p><p>Classificação vale somente pelas regras da competição. Questões de competência e respostas pedagógicas continuam em seu percurso reservado.</p><button type="button" class="lm-quiet-action" data-screen-select="competency-questions">Ver questões de competência <span aria-hidden="true">→</span></button></aside>';
  return labPart('quest-principles', content, selectedId, 'lm-pedagogy-panel-part');
}

function renderQuestsPage(props: ComponentPageProps): string {
  const { data, situation } = props, selectedId = situation.selectedRegionId;
  return '<div class="lm-product-page lm-quests-page" data-page-id="quests"' + mockAttributes(situation) + '>'
    + renderWorkspaceSidebar('quests', data, selectedId) + '<div class="lm-product-main">' + renderWorkspaceTopbar(data, selectedId)
    + '<main class="lm-learner-canvas lm-quests-canvas"><header class="lm-learner-heading"><span class="lm-eyebrow">MEU ESPAÇO SOCIAL · EVENTOS COMPETITIVOS</span><h1>Competições</h1><p>Inscreva-se, acompanhe as regras e registre sua participação etapa por etapa.</p></header>'
    + renderQuestBoard(data, selectedId) + renderQuestPrinciples(selectedId) + '</main></div></div>';
}

type CompetencyQuestionFixture = { id: string; title: string; context: string; prompt: string; evidence: string };
function renderCompetencyQuestionContext(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('competency-question-context', data);
  const skills = labList<string>(data, 'skills');
  const content = '<article class="lm-panel lm-competency-question-context"><header><div><span class="lm-eyebrow">SONDAGEM INICIAL · CIÊNCIAS DA NATUREZA · 8º ANO</span><h2>' + e(labText(data, 'competency', 'Relacionar potência total, duração de uso e consumo elétrico')) + '</h2><p>Conjunto inicial com cinco situações diferentes para observar a mesma relação.</p></div><span class="lm-question-set-count">05<br><small>QUESTÕES</small></span></header>'
    + '<div class="lm-bncc-codes">' + skills.map(skill => LabPill(skill, 'blue')).join('') + '</div><div class="lm-question-context-foot"><span>Esta sondagem pertence ao seu vínculo escolar.</span><b>Suas respostas ficam reservadas</b></div></article>';
  return labPart('competency-question-context', content, selectedId, 'lm-pedagogy-panel-part');
}

function renderCompetencyQuestionResponse(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('competency-question-response', data);
  const questions = labList<CompetencyQuestionFixture>(data, 'questions');
  const content = '<section class="lm-panel lm-competency-question-response"><header><div><span class="lm-eyebrow">CADERNO DE RESPOSTAS · ACESSO RESERVADO</span><h2>Responda com suas palavras</h2><p>Salve o rascunho por questão. Uma resposta pode mostrar uma parte da sua ideia sem definir todo o seu percurso.</p></div><span class="lm-lock-label">⌑ PRIVADO</span></header>'
    + '<nav class="lm-question-stepper" aria-label="Questões de competência">' + questions.map((question, index) => '<button type="button" data-question-select="' + index + '" aria-label="Questão ' + (index + 1) + ': ' + e(question.title) + '" aria-current="' + (index === 0 ? 'step' : 'false') + '" class="' + (index === 0 ? 'active' : '') + '"><span>' + String(index + 1).padStart(2, '0') + '</span><small data-question-step-state>Em aberto</small></button>').join('') + '</nav>'
    + '<div class="lm-question-progress-track" aria-hidden="true"><i data-question-progress-fill style="width:0%"></i></div><p class="lm-question-progress-label"><b data-question-count>Questão 1 de ' + questions.length + '</b><span data-question-answered-count>0 respostas registradas</span></p>'
    + questions.map((question, index) => '<form class="lm-question-panel" data-competency-question-form data-question-index="' + index + '" data-question-id="' + e(question.id) + '"' + (index === 0 ? '' : ' hidden') + '><div class="lm-question-panel-heading"><span class="lm-eyebrow">QUESTÃO ' + String(index + 1).padStart(2, '0') + ' · CONTEXTO ' + String(index + 1).padStart(2, '0') + '</span><h3>' + e(question.title) + '</h3></div>'
      + '<div class="lm-question-situation"><small>A SITUAÇÃO</small><p>' + e(question.context) + '</p></div><div class="lm-question-prompt"><small>SEU DESAFIO</small><p>' + e(question.prompt) + '</p></div>'
      + '<label><span>Sua resposta e justificativa</span><textarea name="answer-' + e(question.id) + '" data-interaction-field="competency-answer:' + e(question.id) + '" rows="6" placeholder="Explique como comparou os dados. Você pode usar palavras, estimativas ou cálculos."></textarea></label>'
      + '<div class="lm-question-actions"><button type="button" class="lm-secondary-button" data-question-draft="' + index + '">Guardar rascunho</button><div><button type="button" class="lm-quiet-action" data-question-nav="previous"' + (index === 0 ? ' disabled' : '') + '>← Anterior</button><button type="submit" class="lm-primary-button" data-question-submit>' + (index === questions.length - 1 ? 'Registrar resposta' : 'Salvar e continuar') + ' <span aria-hidden="true">→</span></button></div></div><p class="lm-action-feedback" data-question-item-feedback role="status"></p></form>').join('')
    + '<section class="lm-question-reflection" data-question-reflection hidden><span class="lm-ai-badge"><i></i> IA · MOCK</span><p data-question-reflection-text></p><small>Leitura ilustrativa. Nenhuma inferência real ou avaliação de competência está conectada.</small></section>'
    + '<section class="lm-question-session-complete" data-question-session-complete hidden><span class="lm-enrollment-success-mark" aria-hidden="true">✓</span><div><span class="lm-eyebrow">CINCO RESPOSTAS REGISTRADAS</span><h3>Suas respostas seguem para revisão</h3><p>A síntese não calcula nota nem define seu nível. A professora interpreta evidências em conjunto e decide o próximo passo.</p><button type="button" class="lm-primary-button" data-screen-select="quests">Ver competições sociais <span aria-hidden="true">→</span></button></div></section>'
    + '<p class="lm-pedagogy-note">Você pode voltar a qualquer questão e revisar a resposta. Alterar um texto não cria uma evidência independente antes de novo envio.</p></section>';
  return labPart('competency-question-response', content, selectedId, 'lm-pedagogy-panel-part');
}

function renderCompetencyQuestionsPage(props: ComponentPageProps): string {
  const { data, situation } = props, selectedId = situation.selectedRegionId;
  return '<div class="lm-product-page lm-competency-questions-page" data-page-id="competency-questions"' + mockAttributes(situation) + '>'
    + renderWorkspaceSidebar('competency-questions', data, selectedId) + '<div class="lm-product-main">' + renderWorkspaceTopbar(data, selectedId)
    + '<main class="lm-learner-canvas lm-questions-canvas"><header class="lm-learner-heading"><span class="lm-eyebrow">MEU ESPAÇO DE APRENDIZAGEM · NIVELAMENTO</span><h1>Questões de competência</h1><p>Leia cada contexto, mostre seu raciocínio e use a navegação para revisar os cinco itens.</p></header>'
    + renderCompetencyQuestionContext(data, selectedId) + renderCompetencyQuestionResponse(data, selectedId) + '</main></div></div>';
}

type CommunityEventFixture = { day: number; title: string; time: string; color: string };
function renderCommunityCalendar(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('community-calendar', data);
  const events = labList<CommunityEventFixture>(data, 'events');
  const image = "url('" + profileCoverAsset + "')";
  const content = '<section class="lm-community-cover" style="background-image:linear-gradient(180deg,rgba(5,32,60,.2),rgba(7,32,57,.78)),' + image + '">'
    + '<div class="lm-community-heading"><div><span class="lm-eyebrow">LUMIRA · COMUNIDADE</span><h1>' + e(labText(data, 'title', 'Eventos e encontros')) + '</h1><p>' + e(labText(data, 'subtitle', 'Compartilhe práticas e construa a comunidade.')) + '</p></div><div class="lm-calendar-actions"><button type="button" data-calendar-action="create">＋ Criar evento</button><div class="lm-calendar-notification-wrap"><button type="button" data-calendar-action="notifications" aria-expanded="false" aria-controls="community-calendar-notifications">♧ Notificações <i>3</i></button><div class="lm-calendar-notifications" id="community-calendar-notifications" data-calendar-notifications hidden><strong data-calendar-notification-heading>Notificações da comunidade</strong><p>O encontro de leitura acontece nesta semana.</p><p>Uma nova prática foi compartilhada no feed.</p><p>Há uma resposta nova em uma conversa.</p><button type="button" data-notification-read>Marcar todas como lidas</button></div></div></div></div>'
    + '<div class="lm-calendar-toolbar"><div><button type="button" data-calendar-step="-1" aria-label="Mês anterior">‹</button><button type="button" data-calendar-step="1" aria-label="Próximo mês">›</button><b data-calendar-month-label>' + e(labText(data, 'month', 'Outubro 2026')) + '</b><button type="button" data-calendar-today>Hoje</button></div><div><button type="button" class="active" data-calendar-view="month" aria-pressed="true">Mês</button><button type="button" data-calendar-view="week" aria-pressed="false">Semana</button><button type="button" data-calendar-view="agenda" aria-pressed="false">Agenda</button><button type="button" class="lm-calendar-new" data-calendar-action="create">＋ Novo evento</button></div></div>'
    + '<div class="lm-calendar-grid" data-calendar-events="' + e(JSON.stringify(events)) + '" aria-label="Calendário de eventos"></div>'
    + '<form class="lm-calendar-event-form" data-calendar-event-form hidden><label>Nome do evento<input name="eventTitle" data-interaction-field="calendar-event-title" required maxlength="90" placeholder="Ex.: Mostra de projetos"></label><div><label>Data<input name="eventDate" data-interaction-field="calendar-event-date" type="date" value="2026-10-21" required></label><label>Horário<input name="eventTime" data-interaction-field="calendar-event-time" type="time" value="14:00" required></label></div><footer><button type="button" data-calendar-action="cancel">Cancelar</button><button type="submit" class="lm-calendar-new">Adicionar evento local</button></footer></form>'
    + '<p class="lm-calendar-feedback" data-calendar-feedback role="status"></p></section>';
  return labPart('community-calendar', content, selectedId, 'lm-community-calendar-part');
}
function renderCommunityTabs(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('community-tabs', data);
  const tabs = labList<string>(data, 'tabs');
  const targets = ['community-feed', 'community-feed', 'community-feed', 'community-aside', 'community-feed', 'community-calendar'];
  const content = '<nav class="lm-community-tabs" aria-label="Seções da comunidade">' + tabs.map((label, index) => '<button type="button" class="' + (index === 0 ? 'active' : '') + '" data-component-select="' + e(targets[index] ?? 'community-feed') + '" data-screen-id="community" aria-label="Abrir ' + e(label) + '">' + e(label) + '</button>').join('') + '<button type="button" class="lm-community-sort">Mais relevantes⌄</button></nav>';
  return labPart('community-tabs', content, selectedId, 'lm-community-tabs-part');
}
function renderTopicsPanel(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('community-topics', data);
  const topics = labList<ComponentFixture>(data, 'topics'), areas = labList<string>(data, 'areas');
  const topicRows = topics.map((topic, index) => '<li><i>' + (index + 1) + '</i><span>' + e(labText(topic, 'title', 'Tópico')) + '</span><b>' + e(labText(topic, 'posts', '0')) + ' posts</b></li>').join('');
  const areaRows = areas.map((area, index) => '<div class="lm-area-row"><span class="lm-area-icon tone-' + ['violet', 'blue', 'teal', 'rose', 'sun', 'green'][index % 6] + '">' + ['▦', '✳', '△', '◉', '＋', '✦'][index % 6] + '</span><div><b>' + e(area) + '</b><small>' + [342, 280, 198, 176, 64, 54][index % 6] + ' posts</small></div></div>').join('');
  const content = '<div class="lm-community-stack"><article class="lm-panel lm-topics-panel"><header><h2>🔥 Tópicos em alta</h2></header><ol>' + topicRows + '</ol></article>'
    + '<article class="lm-panel lm-areas-panel"><header><h2>Áreas da comunidade</h2><button type="button" class="lm-text-action">Ver todas →</button></header>' + areaRows + '</article></div>';
  return labPart('community-topics', content, selectedId, 'lm-community-column-part');
}
function renderCommunityPost(post: CommunityPostDraft, index: number, local = false): string {
  const tags = post.tags.map(tag => LabPill(tag)).join('');
  const photo = !local && index === 0
    ? '<img class="lm-community-photo" src="' + communityPostAsset + '" alt="Professora e estudantes colaborando em uma atividade" />'
    : '';
  const activity = '<div class="lm-community-post-context"><span>NA ATIVIDADE</span><b>' + e(post.activityTitle) + '</b><small>Critério: ' + e(post.criterion) + '</small></div>';
  return '<article class="lm-panel lm-community-post' + (local ? ' lm-community-post-local' : '') + '">'
    + '<header>' + LabAvatar(post.author, index % 2 ? 'blue' : 'rose', 'tiny') + '<div><b>' + e(post.author) + '</b><small>' + e(post.role) + ' · ' + e(post.time) + '</small></div><button type="button" class="lm-panel-more" aria-label="Mais opções">•••</button></header>'
    + '<h2>' + e(post.title) + '</h2><p>' + e(post.text) + '</p>' + activity
    + (tags ? '<div class="lm-post-tags">' + tags + '</div>' : '') + photo
    + '<footer class="lm-post-actions"><button type="button" class="lm-like-action" aria-label="Curtir publicação">♡ ' + String(post.likes) + '</button><span>◯ ' + String(post.comments) + ' comentários</span><button type="button">♧ Salvar</button></footer></article>';
}
function renderOpinionCircles(data: ComponentFixture, selectedId: string): string {
  const circles = labList<ComponentFixture>(data, 'opinionCircles');
  if (!circles.length) return '';
  const seats = [
    [50, 4], [82, 21], [82, 72], [50, 89], [18, 72], [18, 21], [50, 0], [88, 48], [12, 48],
  ];
  const circlePanels = circles.map((circle, circleIndex) => {
    const id = labText(circle, 'id', 'circle-' + circleIndex);
    const members = labList<ComponentFixture>(circle, 'members');
    const messages = labList<ComponentFixture>(circle, 'messages');
    const memberMarkup = members.map((member, index) => {
      const [x, y] = seats[index % seats.length];
      const name = labText(member, 'name', 'Participante');
      return '<div class="lm-opinion-seat" style="--seat-x:' + x + '%;--seat-y:' + y + '%" aria-label="' + e(name + ', ' + labText(member, 'role', 'Participante')) + '">' + LabAvatar(name, labText(member, 'tone', 'teal'), 'small') + '<span>' + e(name.split(' ')[0]) + '</span></div>';
    }).join('');
    const messageMarkup = messages.map((message, index) => '<article class="lm-opinion-message"><header>' + LabAvatar(labText(message, 'author', 'Participante'), labText(message, 'tone', 'teal'), 'tiny') + '<div><b>' + e(labText(message, 'author', 'Participante')) + '</b><small>' + e(labText(message, 'role', 'Participante')) + ' · ' + e(labText(message, 'time', String(index + 1))) + '</small></div></header><p>' + e(labText(message, 'text')) + '</p></article>').join('');
    return '<section class="lm-opinion-circle-panel" id="opinion-circle-panel-' + e(id) + '" role="tabpanel" aria-labelledby="opinion-circle-tab-' + e(id) + '" data-opinion-circle-panel="' + e(id) + '"' + (circleIndex ? ' hidden' : '') + '>'
      + '<div class="lm-opinion-circle-heading"><div><span class="lm-eyebrow">' + e(labText(circle, 'label', 'CÍRCULO DE PARTICIPAÇÃO')) + '</span><h3>' + e(labText(circle, 'title', 'Roda de opiniões')) + '</h3><p>' + e(labText(circle, 'activityTitle')) + '</p></div><span class="lm-circle-member-count">' + members.length + ' na roda</span></div>'
      + '<div class="lm-opinion-circle-context"><b>O que estamos investigando</b><span>' + e(labText(circle, 'criterion')) + '</span></div>'
      + '<div class="lm-opinion-arena" role="group" aria-label="Participantes em círculo"><div class="lm-opinion-ring" aria-hidden="true"></div>' + memberMarkup
      + '<div class="lm-opinion-thread" data-opinion-message-list="' + e(id) + '" aria-label="Mensagens da ' + e(labText(circle, 'title', 'roda de opiniões')) + '" aria-live="polite">' + messageMarkup + '</div></div>'
      + '<form class="lm-opinion-reply" data-opinion-message-form="' + e(id) + '"><label class="sr-only" for="opinion-reply-' + e(id) + '">Sua mensagem na roda</label><textarea id="opinion-reply-' + e(id) + '" name="opinionMessage" data-interaction-field="community-feed:circle-message:' + e(id) + '" rows="2" maxlength="500" placeholder="Entre na conversa com uma ideia, pergunta ou exemplo…" required></textarea><button type="submit" class="lm-small-primary">Enviar para a roda <span aria-hidden="true">↗</span></button></form>'
      + '<p class="lm-opinion-moderation">Na demonstração, as mensagens são locais. Na plataforma, publicações de estudantes passam por vistoria de respeito, privacidade e contribuição para a atividade antes de circular.</p></section>';
  }).join('');
  const tabs = circles.map((circle, index) => {
    const id = labText(circle, 'id', 'circle-' + index);
    return '<button type="button" role="tab" id="opinion-circle-tab-' + e(id) + '" class="lm-opinion-circle-tab' + (index === 0 ? ' active' : '') + '" data-opinion-circle-select="' + e(id) + '" aria-controls="opinion-circle-panel-' + e(id) + '" aria-selected="' + String(index === 0) + '" tabindex="' + (index === 0 ? '0' : '-1') + '">' + e(labText(circle, 'label', 'Roda ' + (index + 1))) + '</button>';
  }).join('');
  return '<section class="lm-panel lm-opinion-circles"><header class="lm-opinion-circles-heading"><div><span class="lm-eyebrow">CONVERSAS EM GRUPO</span><h2>Rodas de opiniões</h2><p>Uma atividade em comum, vários pontos de vista para comparar.</p></div></header><nav class="lm-opinion-circle-tabs" role="tablist" aria-label="Escolher roda de participação">' + tabs + '</nav>' + circlePanels + '</section>';
}
function renderCommunityFeed(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('community-feed', data);
  const posts = labList<ComponentFixture>(data, 'posts').filter(post => Boolean(labText(post, 'activityId') && labText(post, 'activityTitle') && labText(post, 'criterion')));
  const cards = posts.map((post, index) => renderCommunityPost({
    id: labText(post, 'id', 'community-' + index), title: labText(post, 'title', 'Publicação da comunidade'),
    text: labText(post, 'text'), activityId: labText(post, 'activityId'), activityTitle: labText(post, 'activityTitle'), criterion: labText(post, 'criterion'),
    tags: labList<string>(post, 'tags'), author: labText(post, 'author', 'Comunidade'), role: labText(post, 'role', 'Comunidade'), time: labText(post, 'time', 'agora'),
    likes: Number(labText(post, 'likes', '0')) || 0, comments: Number(labText(post, 'comments', '0')) || 0,
  }, index)).join('');
  const activityOptions = PROFILE_ACTIVITY_LINKS.map(link => '<option value="' + e(link.id) + '">' + e(link.title) + '</option>').join('');
  const composer = '<form class="lm-panel lm-post-composer" data-community-post-form novalidate>' + LabAvatar('Ana Beatriz', 'teal', 'tiny') + '<div><label class="sr-only" for="community-post-activity">Atividade relacionada</label><select id="community-post-activity" name="activityLink" required><option value="">Escolha a atividade deste post</option>' + activityOptions + '</select><label class="sr-only" for="community-post-title">Título</label><input id="community-post-title" name="postTitle" maxlength="100" placeholder="Um título curto, do jeito que você contaria pra turma" required><label class="sr-only" for="community-post-text">Texto da publicação</label><textarea id="community-post-text" name="post" maxlength="1000" aria-label="Texto da publicação" placeholder="O que vocês fizeram? O que chamou atenção ou ficou como pergunta?" required></textarea><footer><span class="lm-compose-context-note">O post aparece junto com a atividade e o critério relacionado.</span><button type="submit" class="lm-small-primary">Compartilhar</button></footer></div></form>';
  const postsSection = '<section class="lm-community-activity-posts"><header><div><span class="lm-eyebrow">DA ATIVIDADE PARA A COMUNIDADE</span><h2>O que a turma andou fazendo</h2></div><span>Posts com contexto</span></header><div class="lm-community-post-list" data-community-post-list>' + cards + '</div></section>';
  return labPart('community-feed', '<div class="lm-community-feed-stack">' + composer + postsSection + renderOpinionCircles(data, selectedId) + '</div>', selectedId, 'lm-community-column-part');
}
function renderCommunityAside(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('community-aside', data);
  const events = labList<CommunityEventFixture>(data, 'events').slice(0, 12);
  const people = labList<ComponentFixture>(data, 'people'), groups = labList<ComponentFixture>(data, 'groups');
  const eventRows = events.map(event => '<div class="lm-upcoming-event"><span class="lm-date-badge"><b>' + event.day + '</b><small>OUT</small></span><div><b>' + e(event.title) + '</b><small>Online · ' + e(event.time) + '</small><button type="button" class="lm-event-register">Inscrever-se →</button></div></div>').join('');
  const peopleRows = people.map(person => '<div class="lm-suggested-person">' + LabAvatar(labText(person, 'name', 'Educador'), labText(person, 'tone', 'teal'), 'tiny') + '<div><b>' + e(labText(person, 'name', 'Educador')) + '</b><small>' + e(labText(person, 'role', 'Comunidade')) + '</small></div><button type="button">Seguir</button></div>').join('');
  const groupRows = groups.map(group => '<div class="lm-suggested-group"><span class="lm-group-thumb">✳</span><div><b>' + e(labText(group, 'name', 'Grupo')) + '</b><small>' + e(labText(group, 'members', '0 membros')) + '</small></div><button type="button">＋</button></div>').join('');
  const content = '<div class="lm-community-stack"><article class="lm-panel lm-upcoming-panel"><header><h2>Próximos eventos</h2><button type="button" class="lm-text-action" data-component-select="community-calendar" data-screen-id="community" aria-label="Abrir calendário de eventos">Ver agenda →</button></header>' + eventRows + '</article>'
    + '<article class="lm-panel lm-people-panel"><header><h2>Pessoas para seguir</h2><button type="button" class="lm-text-action" data-component-select="community-topics" data-screen-id="community" aria-label="Explorar pessoas e assuntos">Explorar →</button></header>' + peopleRows + '</article>'
    + '<article class="lm-panel lm-groups-panel"><header><h2>Comunidades e grupos</h2><button type="button" class="lm-text-action" data-component-select="community-topics" data-screen-id="community" aria-label="Explorar comunidades e assuntos">Ver temas →</button></header>' + groupRows + '</article></div>';
  return labPart('community-aside', content, selectedId, 'lm-community-column-part');
}
function renderCommunityPage(props: ComponentPageProps): string {
  const { data, situation } = props, selectedId = situation.selectedRegionId;
  return '<div class="lm-product-page lm-community-page" data-page-id="community"' + mockAttributes(situation) + '>'
    + renderWorkspaceSidebar('community', data, selectedId)
    + '<div class="lm-product-main">' + renderWorkspaceTopbar(data, selectedId)
    + '<main class="lm-community-canvas">' + renderCommunityCalendar(data, selectedId) + renderCommunityTabs(data, selectedId)
    + '<div class="lm-community-columns">' + renderTopicsPanel(data, selectedId) + renderCommunityFeed(data, selectedId) + renderCommunityAside(data, selectedId) + '</div>'
    + '</main></div></div>';
}

const emptySituation = (screenId: string): ComponentMockSituation => ({
  screenId, fixtureKey: '', selectedRegionId: '', role: 'visitante', status: 'ready',
});
const emptyPageProps = (screenId: string): ComponentPageProps => ({ data: {}, situation: emptySituation(screenId) });

export function registerComponentElements(): void {
  if (typeof customElements === 'undefined') throw new Error('Componentes Lumira exigem um navegador com Custom Elements.');

  if (!customElements.get('lumira-page-part')) {
    class DemoPagePart extends HTMLElement implements DemoPagePartElement {
      private transitions: ComponentStateIterator<DemoPagePartState>;
      private state: DemoPagePartState;
      private projectReflectionTimer: number | undefined;
      private projectReflectionRevision = 0;
      private subjectSkillInsightTimer: number | undefined;
      private subjectSkillInsightRevision = 0;
      private platformReferenceMenu: HTMLDivElement | null = null;
      private platformReferenceTarget: PlatformReferenceField | null = null;
      private platformReferenceCurrent: PlatformReferenceContext | null = null;
      private platformReferenceOptions: readonly PlatformReferenceNode[] = [];
      private platformReferenceActiveIndex = 0;
      private platformReferenceSkipInput: PlatformReferenceField | null = null;
      private readonly repositionPlatformReferenceMenu = (): void => this.positionPlatformReferenceMenu();
      private readonly closePlatformReferenceOnOutsidePointer = (event: PointerEvent): void => {
        const target = event.target;
        if (target instanceof Node && (this.platformReferenceTarget?.contains(target) || this.platformReferenceMenu?.contains(target))) return;
        this.closePlatformReferenceMenu();
      };

      constructor() {
        super();
        this.transitions = componentState<DemoPagePartState>({
          id: '', title: '', content: '', presentation: '', evidence: 'derived', selectedId: '', className: '', fixture: {}, situation: emptySituation(''),
          prototypeParameters: {},
          interaction: {
          groups: {}, toggles: {}, fields: {}, subjectFoundation: null, subjectSkills: null, subjectSkillQuery: '', subjectSkillActiveIndex: 0, subjectSkillMenuOpen: false, subjectSkillInsight: null, activityQuestionIds: null, communityPosts: [], opinionCircleMessages: {}, opinionMessageRequests: {}, profileActivityItems: [], profileProjects: [], profileAgendaItems: [], profileAgendaPosts: [], projectChatMessages: [], projectReviewStatus: 'idle', projectReviewText: '', projectMilestones: [], actions: {}, communityEvents: [], localStories: [], aiGenerated: {}, questParticipations: [],
          projectChatStatus: null, projectChatPending: false,
            selectedStory: null, storyAnswers: {}, storyComposerOpen: false, storyComposerExpanded: false, storyComposerTool: 'text', storyOrientation: 'portrait',
            storyFilter: 'original', storyImage: '', storyReplies: {}, aiReflection: '', studentSubmissions: [],
            reviewFeedback: '', shareFeedback: '', responseFeedback: '', enrollmentFeedback: '', questFeedback: '', questionFeedback: '', feedback: '',
          },
        });
        this.state = this.transitions.next().value;
        this.addEventListener('click', event => this.onClick(event));
        this.addEventListener('pointerover', event => this.onPointerOver(event));
        this.addEventListener('focusin', event => this.onFocusIn(event));
        this.addEventListener('keydown', event => this.onKeyDown(event));
        this.addEventListener('input', event => this.onInput(event));
        this.addEventListener('change', event => this.onChange(event));
        this.addEventListener('submit', event => this.onSubmit(event));
        this.addEventListener('lumira-opinion-message-delivered', event => this.onOpinionMessageDelivered(event as CustomEvent<OpinionCircleMessageDelivery>));
        this.addEventListener('lumira-opinion-message-rejected', event => this.onOpinionMessageRejected(event as CustomEvent<OpinionCircleMessageRejection>));
        this.addEventListener('lumira-subject-skill-understanding-result', event => this.onSubjectSkillUnderstandingResult(event as CustomEvent<SubjectSkillUnderstandingResult>));
        this.addEventListener('focusout', event => {
          if (event.target === this.platformReferenceTarget) this.closePlatformReferenceMenu();
        });
        this.addEventListener('profile-edit-command', event => {
          if (this.state.id !== 'teacher-hero' && this.state.id !== 'student-hero') return;
          const detail = (event as CustomEvent<{ field?: string }>).detail;
          this.openProfileEditor(detail?.field);
        });
        this.addEventListener('lumira-project-assistant-status', event => {
          if (!isProfileProjectPart(this.state.id)) return;
          const detail = (event as CustomEvent<CognoscereStatus>).detail;
          this.transitionInteraction(interaction => ({ ...interaction, projectChatStatus: detail }));
          this.render();
        });
        this.addEventListener('lumira-project-assistant-result', event => {
          if (!isProfileProjectPart(this.state.id)) return;
          const detail = (event as CustomEvent<{ requestId: string; reply?: string; error?: string }>).detail;
          if (!detail?.requestId) return;
          const pending = this.state.interaction.projectChatMessages.find(message => message.id === detail.requestId && message.status === 'pending');
          if (!pending) return;
          if (pending.kind === 'reflection' && pending.revision !== this.projectReflectionRevision) return;
          if (pending.kind === 'review' && this.state.interaction.projectReviewStatus !== 'pending') return;
          this.transitionInteraction(interaction => ({
            ...interaction,
            projectChatPending: pending.kind === 'reflection' ? interaction.projectChatPending : false,
            ...(pending.kind === 'review' ? {
              projectReviewStatus: detail.error ? 'error' as const : 'ready' as const,
              projectReviewText: detail.reply ?? detail.error ?? 'O Cognoscere local não retornou uma resposta.',
              groups: { ...interaction.groups, 'project-wizard-step': '0' },
              toggles: { ...interaction.toggles, 'project-review-confirmed': false },
            } : {}),
            projectChatMessages: interaction.projectChatMessages.map(message => message.id === detail.requestId
              ? { ...message, role: 'assistant', text: detail.reply ?? detail.error ?? 'O Cognoscere local não retornou uma resposta.', ...(detail.error ? { status: 'error' as const } : { status: undefined }) }
              : message),
          }));
          this.render();
          if (pending.kind === 'review') this.querySelector<HTMLElement>('[data-project-review-comment]')?.focus();
          else if (pending.kind !== 'reflection') this.querySelector<HTMLTextAreaElement>('[data-project-chat-form] textarea')?.focus();
        });
      }
      configure(props: DemoPagePartProps): void {
        const snapshot = structuredClone(props);
        const enteringActivityBuilder = this.state.id !== props.id && props.id === 'pedagogy-activity-builder';
        const activitySeeds = activityQuestionSeeds(snapshot.fixture);
        if (!activitySeeds.length && enteringActivityBuilder) activitySeeds.push({ id: 'question-1', title: '', context: '', prompt: '', understanding: '' });
        if (snapshot.id !== 'pedagogy-context' && this.subjectSkillInsightTimer !== undefined) {
          window.clearTimeout(this.subjectSkillInsightTimer);
          this.subjectSkillInsightTimer = undefined;
          this.subjectSkillInsightRevision += 1;
        }
        if (!isProfileProjectPart(snapshot.id) && this.projectReflectionTimer !== undefined) {
          window.clearTimeout(this.projectReflectionTimer);
          this.projectReflectionTimer = undefined;
          this.projectReflectionRevision += 1;
        }
        this.state = this.transitions.next(current => ({
          ...snapshot,
          interaction: {
            ...current.interaction,
            ...(current.id !== props.id && props.id === 'pedagogy-context' ? {
              subjectFoundation: null,
              subjectSkills: [],
              subjectSkillQuery: '',
              subjectSkillActiveIndex: 0,
              subjectSkillMenuOpen: false,
              subjectSkillInsight: null,
            } : {}),
            ...(enteringActivityBuilder ? {
              activityQuestionIds: activitySeeds.map(question => question.id),
              fields: {
                ...Object.fromEntries(Object.entries(current.interaction.fields).filter(([key]) => !key.startsWith('pedagogy-activity-builder:'))),
                'pedagogy-activity-builder:activityTitle': labText(snapshot.fixture, 'activityTitle'),
                'pedagogy-activity-builder:activityUnderstanding': labText(snapshot.fixture, 'activityUnderstanding'),
                ...Object.fromEntries(activitySeeds.flatMap(question => [
                  ['pedagogy-activity-builder:question:' + question.id + ':title', question.title],
                  ['pedagogy-activity-builder:question:' + question.id + ':context', question.context],
                  ['pedagogy-activity-builder:question:' + question.id + ':prompt', question.prompt],
                  ['pedagogy-activity-builder:question:' + question.id + ':understanding', question.understanding],
                ])),
              },
              groups: { ...current.interaction.groups, 'activity-step': '0' },
              toggles: { ...current.interaction.toggles, 'activity-review-confirmed': false, 'activity-approved': false },
              reviewFeedback: '',
            } : {}),
            selectedStory: current.interaction.selectedStory ?? (props.id.endsWith('-stories') ? 0 : null),
          },
        })).value;
        this.render();
      }
      disconnectedCallback(): void {
        this.closePlatformReferenceMenu();
        if (this.subjectSkillInsightTimer !== undefined) window.clearTimeout(this.subjectSkillInsightTimer);
        this.subjectSkillInsightTimer = undefined;
        this.subjectSkillInsightRevision += 1;
      }
      private platformReferenceField(target: EventTarget | null): target is PlatformReferenceField {
        if (target instanceof HTMLTextAreaElement) return true;
        return target instanceof HTMLInputElement && ['text', 'search', 'url', 'tel'].includes(target.type);
      }
      private updatePlatformReferenceMenu(field: PlatformReferenceField): void {
        const caret = field.selectionStart ?? field.value.length;
        const context = platformReferenceContext(field.value, caret);
        if (!context || !platformReferenceNode(context.path) && context.path.length > 0) {
          this.closePlatformReferenceMenu();
          return;
        }
        const parent = context.path.length ? platformReferenceNode(context.path) : null;
        const candidates = parent ? parent.children ?? [] : PLATFORM_REFERENCE_TREE;
        const query = context.query.toLocaleLowerCase();
        this.platformReferenceOptions = candidates.filter(node => !query
          || node.id.toLocaleLowerCase().includes(query)
          || node.label.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(query.normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
        this.platformReferenceTarget = field;
        this.platformReferenceCurrent = context;
        this.platformReferenceActiveIndex = 0;
        const menu = this.ensurePlatformReferenceMenu();
        const pathLabel = context.path.length ? '@' + context.path.join(' > ') + (context.query ? ' > ' + context.query : '') : (context.query ? '@' + context.query : 'Escolha um namespace');
        const rows = this.platformReferenceOptions.map((node, index) => '<button type="button" role="option" aria-selected="' + String(index === 0) + '" data-platform-reference-option="' + index + '"><span><strong>' + e(node.label) + '</strong><small>' + e(node.description) + '</small></span><code>' + e(node.id) + (node.children?.length ? '　›' : '') + '</code></button>').join('');
        menu.innerHTML = '<div class="lm-reference-menu-heading"><span>ELEMENTO DA PLATAFORMA</span><kbd>@</kbd><kbd>&gt;</kbd><kbd>Esc</kbd></div><div class="lm-reference-menu-path">' + e(pathLabel) + '</div><div class="lm-reference-menu-options" role="listbox" aria-label="Elementos da plataforma">' + (rows || '<p class="lm-reference-menu-empty">Nenhum elemento encontrado. Continue digitando ou ajuste o caminho.</p>') + '</div>';
        field.setAttribute('aria-expanded', 'true');
        field.setAttribute('aria-autocomplete', 'list');
        field.setAttribute('aria-controls', menu.id);
        this.positionPlatformReferenceMenu();
      }
      private ensurePlatformReferenceMenu(): HTMLDivElement {
        if (this.platformReferenceMenu) return this.platformReferenceMenu;
        const menu = document.createElement('div');
        menu.className = 'lm-platform-reference-menu';
        menu.id = 'lumira-platform-reference-menu';
        menu.setAttribute('role', 'presentation');
        menu.addEventListener('pointerdown', event => event.preventDefault());
        menu.addEventListener('click', event => {
          const option = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-platform-reference-option]') : null;
          if (!option) return;
          const index = Number(option.dataset.platformReferenceOption);
          const selected = this.platformReferenceOptions[index];
          if (selected) this.selectPlatformReference(selected);
        });
        document.body.append(menu);
        document.addEventListener('pointerdown', this.closePlatformReferenceOnOutsidePointer, true);
        window.addEventListener('resize', this.repositionPlatformReferenceMenu);
        window.addEventListener('scroll', this.repositionPlatformReferenceMenu, true);
        this.platformReferenceMenu = menu;
        return menu;
      }
      private positionPlatformReferenceMenu(): void {
        const menu = this.platformReferenceMenu;
        const field = this.platformReferenceTarget;
        if (!menu || !field?.isConnected) return;
        const rect = field.getBoundingClientRect();
        const width = Math.min(Math.max(rect.width, 300), Math.max(220, window.innerWidth - 24));
        menu.style.width = width + 'px';
        const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
        menu.style.left = left + 'px';
        menu.style.top = Math.max(8, rect.bottom + 6) + 'px';
        const menuHeight = menu.getBoundingClientRect().height;
        if (rect.bottom + 6 + menuHeight > window.innerHeight - 8) menu.style.top = Math.max(8, rect.top - menuHeight - 6) + 'px';
      }
      private updatePlatformReferenceActiveOption(index: number): void {
        if (!this.platformReferenceOptions.length) return;
        this.platformReferenceActiveIndex = (index + this.platformReferenceOptions.length) % this.platformReferenceOptions.length;
        this.platformReferenceMenu?.querySelectorAll<HTMLElement>('[data-platform-reference-option]').forEach((option, optionIndex) => {
          const active = optionIndex === this.platformReferenceActiveIndex;
          option.setAttribute('aria-selected', String(active));
          if (active) option.scrollIntoView({ block: 'nearest' });
        });
      }
      private selectPlatformReference(node: PlatformReferenceNode): void {
        const field = this.platformReferenceTarget;
        const context = this.platformReferenceCurrent;
        if (!field || !context) return;
        field.setRangeText((context.path.length ? ' ' : '') + node.id, context.segmentStart, context.caret, 'end');
        this.platformReferenceSkipInput = field;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        this.closePlatformReferenceMenu();
        field.focus();
      }
      private closePlatformReferenceMenu(): void {
        const field = this.platformReferenceTarget;
        field?.removeAttribute('aria-expanded');
        field?.removeAttribute('aria-autocomplete');
        field?.removeAttribute('aria-controls');
        this.platformReferenceMenu?.remove();
        this.platformReferenceMenu = null;
        this.platformReferenceTarget = null;
        this.platformReferenceCurrent = null;
        this.platformReferenceOptions = [];
        this.platformReferenceActiveIndex = 0;
        document.removeEventListener('pointerdown', this.closePlatformReferenceOnOutsidePointer, true);
        window.removeEventListener('resize', this.repositionPlatformReferenceMenu);
        window.removeEventListener('scroll', this.repositionPlatformReferenceMenu, true);
      }
      private handlePlatformReferenceKey(event: KeyboardEvent, field: PlatformReferenceField): boolean {
        if (this.platformReferenceTarget === field && this.platformReferenceMenu) {
          if (event.key === 'ArrowDown' && this.platformReferenceOptions.length) {
            event.preventDefault();
            this.updatePlatformReferenceActiveOption(this.platformReferenceActiveIndex + 1);
            return true;
          }
          if (event.key === 'ArrowUp' && this.platformReferenceOptions.length) {
            event.preventDefault();
            this.updatePlatformReferenceActiveOption(this.platformReferenceActiveIndex - 1);
            return true;
          }
          if (event.key === 'Enter' && this.platformReferenceOptions.length) {
            event.preventDefault();
            const option = this.platformReferenceOptions[this.platformReferenceActiveIndex];
            if (option) this.selectPlatformReference(option);
            return true;
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            this.closePlatformReferenceMenu();
            return true;
          }
        }
        if (event.key !== '>' || field.selectionStart === null || field.selectionEnd !== field.selectionStart) return false;
        const caret = field.selectionStart;
        const context = platformReferenceContext(field.value, caret);
        if (!context || !context.query) return false;
        const selected = platformReferenceNode([...context.path, context.query]);
        if (!selected?.children?.length) return false;
        event.preventDefault();
        field.setRangeText(' > ', caret, caret, 'end');
        field.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      syncLearningReflection(aiReflection: string, submissions: string[]): void {
        if (this.state.id !== 'learner-reflection') return;
        this.transitionInteraction(interaction => ({ ...interaction, aiReflection, studentSubmissions: [...submissions] }));
        this.render();
      }
      private transitionInteraction(change: (interaction: DemoPagePartInteraction) => DemoPagePartInteraction): void {
        this.state = this.transitions.next(current => ({
          ...current,
          interaction: change(structuredClone(current.interaction)),
        })).value;
      }
      private prepareControls(): void {
        const { id } = this.state;
        const groups = this.querySelectorAll<HTMLElement>('.lm-side-nav, .lm-profile-tabs, .lm-community-tabs, .lm-personalization-tabs, .lm-filter-pills, .lm-compose-options, .lm-cover-choices, .lm-color-choices>div');
        const initialGroupSelections: Record<string, string> = {};
        groups.forEach((group, index) => {
          const key = id + ':group:' + index;
          group.dataset.interactionGroup = key;
          const buttons = [...group.querySelectorAll<HTMLButtonElement>('button')].filter(button => !button.classList.contains('lm-community-sort'));
          const activeButton = buttons.find(button => button.classList.contains('active'));
          const selected = this.state.interaction.groups[key] ?? (activeButton ? String(buttons.indexOf(activeButton)) : undefined);
          if (this.state.interaction.groups[key] === undefined && selected !== undefined) initialGroupSelections[key] = selected;
          buttons.forEach((button, buttonIndex) => {
            button.dataset.interactionGroup = key;
            button.dataset.interactionValue = String(buttonIndex);
            if (selected !== undefined) button.setAttribute('aria-pressed', String(button.dataset.interactionValue === selected));
          });
        });
        if (Object.keys(initialGroupSelections).length) {
          this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, ...initialGroupSelections } }));
        }
        const storyTrack = this.querySelector<HTMLElement>('.lm-stories-track');
        if (storyTrack) {
          storyTrack.querySelectorAll<HTMLButtonElement>('.lm-story-card:not(.lm-new-story):not(.lm-story-next)').forEach((button, index) => {
            if (!button.classList.contains('lm-new-story')) button.dataset.storyIndex = String(index);
          });
        }
        const calendarViews = [...this.querySelectorAll<HTMLButtonElement>('.lm-calendar-toolbar button')]
          .filter(button => ['mês', 'semana', 'agenda'].includes(button.textContent?.trim().toLocaleLowerCase() ?? ''));
        calendarViews.forEach(button => {
          button.dataset.interactionGroup = id + ':calendar-view';
          button.dataset.interactionValue = button.textContent?.trim() ?? '';
        });
        this.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea').forEach((field, index) => {
          const fieldName = field.name || field.getAttribute('aria-label') || field.getAttribute('placeholder') || 'field-' + index;
          if (!field.dataset.interactionField) field.dataset.interactionField = id + ':' + fieldName;
          if (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) {
            if (!field.dataset.interactionToggle) field.dataset.interactionToggle = id + ':toggle:' + fieldName;
          }
        });
        this.querySelectorAll<HTMLButtonElement>('button').forEach((button, index) => {
          const scope = button.closest<HTMLElement>('.lm-suggested-person, .lm-suggested-group, .lm-upcoming-event, .lm-community-post, .lm-activity-author, .lm-project-row, .lm-story-card');
          const scopeName = scope?.querySelector('b')?.textContent?.trim() || '';
          if (!button.dataset.interactionKey) button.dataset.interactionKey = id + ':button:' + index + ':' + scopeName;
          if (!button.dataset.actionLabel) button.dataset.actionLabel = button.textContent?.trim() ?? '';
          const label = (button.getAttribute('aria-label') || button.textContent || '').trim();
          if (/\b(seguir|seguindo)\b/i.test(label)) button.dataset.interactionKind = 'follow';
          else if (/\b(salvar|salvo)\b/i.test(label)) button.dataset.interactionKind = 'save';
          else if (/tocar música|pausar música/i.test(label)) button.dataset.interactionKind = 'music';
          else if (button.classList.contains('lm-like-action')) button.dataset.interactionKind = 'like';
          else if (button.classList.contains('lm-event-register')) button.dataset.interactionKind = 'register';
          else if (button.closest('.lm-suggested-group') && label.includes('＋')) button.dataset.interactionKind = 'join';
          else if (button.classList.contains('lm-story-next')) button.dataset.interactionKind = 'story-next';
          else if (button.classList.contains('lm-community-sort')) button.dataset.interactionKind = 'sort';
        });
      }
      private restoreWorkspaceMenus(): void {
        const openMenu = this.state.interaction.groups['workspace-menu'] ?? '';
        this.querySelectorAll<HTMLElement>('[data-workspace-menu]').forEach(menu => {
          const open = menu.dataset.workspaceMenu === openMenu;
          menu.hidden = !open;
        });
        this.querySelectorAll<HTMLButtonElement>('[data-workspace-menu-toggle]').forEach(button => {
          button.setAttribute('aria-expanded', String(button.dataset.workspaceMenuToggle === openMenu));
        });
        const read = this.state.interaction.toggles['notifications-read'] === true;
        const badge = this.querySelector<HTMLElement>('[data-workspace-menu-toggle="notifications"] i');
        if (badge) badge.hidden = read;
        const heading = this.querySelector<HTMLElement>('[data-notification-heading]');
        if (heading && read) heading.textContent = 'Você leu todas as notificações';
        const readButton = this.querySelector<HTMLButtonElement>('[data-notification-read]');
        if (readButton) {
          readButton.disabled = read;
          if (read) readButton.textContent = 'Tudo lido';
        }
      }
      private updateWorkspaceSearch(value: string): void {
        const root = this.closest('componenting-demo-lab') ?? document;
        const query = value.trim().toLocaleLowerCase();
        const points = [...root.querySelectorAll<HTMLElement>('.lm-part-session[data-scrollpoint]')];
        let count = 0;
        points.forEach(point => {
          const matches = !query || (point.textContent ?? '').toLocaleLowerCase().includes(query);
          point.classList.toggle('lm-search-match', Boolean(query && matches));
          point.classList.toggle('lm-search-muted', Boolean(query && !matches));
          if (query && matches) count += 1;
        });
        root.querySelectorAll<HTMLInputElement>('[data-workspace-search]').forEach(input => {
          if (input !== this.querySelector('[data-workspace-search]')) input.value = value;
        });
        root.querySelectorAll<HTMLOutputElement>('[data-workspace-search-count]').forEach(output => {
          output.textContent = query ? count + (count === 1 ? ' parte encontrada' : ' partes encontradas') : '';
        });
      }
      private restoreInteraction(): void {
        const { interaction } = this.state;
        this.restoreCommunityParticipation();
        this.querySelectorAll<HTMLElement>('[data-interaction-group]').forEach(group => {
          const selected = interaction.groups[group.dataset.interactionGroup ?? ''];
          if (selected === undefined) return;
          group.querySelectorAll<HTMLButtonElement>('button[data-interaction-value]').forEach(button => {
            const active = button.dataset.interactionValue === selected;
            button.classList.toggle('active', active);
            button.classList.toggle('selected', active);
            button.classList.toggle('is-interaction-active', active);
            button.setAttribute('aria-pressed', String(active));
          });
        });
        this.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[data-interaction-field]').forEach(field => {
          const key = field.dataset.interactionField ?? '';
          if (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) {
            const toggle = field.dataset.interactionToggle ?? '';
            if (interaction.toggles[toggle] !== undefined) field.checked = interaction.toggles[toggle];
          } else if (interaction.fields[key] !== undefined) field.value = interaction.fields[key];
        });
        this.restoreProfileActivities();
        this.restoreProfileProjects();
        this.restoreProfileAgenda();
        this.querySelectorAll<HTMLButtonElement>('[data-interaction-kind]').forEach(button => {
          const active = interaction.toggles[button.dataset.interactionKey ?? ''] === true;
          const kind = button.dataset.interactionKind;
          button.classList.toggle('is-interaction-active', active);
          button.setAttribute('aria-pressed', String(active));
          if (kind === 'follow') button.textContent = active ? 'Seguindo' : button.dataset.actionLabel ?? 'Seguir';
          if (kind === 'join') button.textContent = active ? '✓' : button.dataset.actionLabel ?? '＋';
          if (kind === 'register') button.textContent = active ? 'Inscrito' : button.dataset.actionLabel ?? 'Inscrever-se →';
          if (kind === 'like') {
            const baseCount = Number((button.dataset.actionLabel ?? '').match(/\d+/)?.[0] ?? 0);
            button.textContent = (active ? '♥ ' + (baseCount + 1) : '♡ ' + baseCount);
            button.setAttribute('aria-label', active ? 'Remover curtida' : 'Curtir publicação');
          }
          if (kind === 'save') button.textContent = active ? '✓ Salvo' : button.dataset.actionLabel ?? 'Salvar';
          if (kind === 'music') {
            button.setAttribute('aria-label', active ? 'Pausar música' : 'Tocar música');
            button.textContent = active ? 'Ⅱ' : '▶';
          }
          if (kind === 'sort' && active) button.textContent = 'Mais recentes⌄';
        });
        this.restoreStories();
        this.restoreProfileEditor();
        this.restoreStudentSkillsDashboard();
        this.restorePedagogyDemo();
        this.restoreSubjectFoundation();
        this.restoreWorkspaceMenus();
        this.restoreCommunityCalendar();
        if (interaction.feedback) {
          const feedback = document.createElement('p');
          feedback.className = 'lm-component-feedback';
          feedback.setAttribute('role', 'status');
          feedback.textContent = interaction.feedback;
          this.append(feedback);
        }
      }
      private restoreStudentSkillsDashboard(): void {
        if (this.state.id !== 'student-skills') return;
        const isOpen = this.state.interaction.groups['student-progress-dashboard-open'] === 'yes';
        const interests = this.querySelector<HTMLElement>('[data-student-interest-content]');
        const dashboard = this.querySelector<HTMLElement>('[data-student-progress-dashboard]');
        const openButton = this.querySelector<HTMLButtonElement>('[data-student-progress-open]');
        if (interests) interests.hidden = isOpen;
        if (dashboard) dashboard.hidden = !isOpen;
        openButton?.setAttribute('aria-expanded', String(isOpen));
      }
      private restoreProfileActivities(): void {
        if (this.state.id !== 'teacher-activity') return;
        const list = this.querySelector<HTMLElement>('[data-profile-activity-list]');
        if (!list) return;
        list.querySelectorAll('.lm-profile-activity-local').forEach(item => item.remove());
        const staticCards = [...list.querySelectorAll<HTMLElement>(':scope > [data-profile-activity-type]')];
        const localItems = this.state.interaction.profileActivityItems ?? [];
        const selected = this.state.interaction.groups['teacher-activity-filter'] ?? 'all';
        const countByKind = (kind: string): number => staticCards.filter(card => card.dataset.profileActivityType === kind).length
          + localItems.filter(item => item.kind === kind).length;
        const counts: Record<string, number> = {
          all: staticCards.length + localItems.length,
          post: countByKind('post'), activity: countByKind('activity'),
          video: countByKind('video'), project: countByKind('project'),
        };
        this.querySelectorAll<HTMLButtonElement>('[data-profile-activity-filter]').forEach(button => {
          const filter = button.dataset.profileActivityFilter ?? 'all';
          const active = filter === selected;
          button.classList.toggle('active', active);
          button.setAttribute('aria-pressed', String(active));
          const count = button.querySelector<HTMLElement>('[data-profile-activity-count]');
          if (count) count.textContent = String(counts[filter] ?? 0);
        });
        for (const card of staticCards) card.hidden = selected !== 'all' && card.dataset.profileActivityType !== selected;
        for (const item of localItems) list.insertAdjacentHTML('beforeend', renderProfileActivityItem(item, true));
        const localCards = [...list.querySelectorAll<HTMLElement>('.lm-profile-activity-local')];
        for (const card of localCards) card.hidden = selected !== 'all' && card.dataset.profileActivityType !== selected;
        const visibleCount = staticCards.filter(card => !card.hidden).length + localCards.filter(card => !card.hidden).length;
        const empty = this.querySelector<HTMLElement>('[data-profile-activity-empty]');
        if (empty) empty.hidden = visibleCount > 0;
        const composer = this.querySelector<HTMLFormElement>('[data-profile-activity-composer]');
        if (composer) composer.hidden = this.state.interaction.toggles['profile-activity-composer-open'] !== true;
      }
      private restoreProfileAgenda(): void {
        if (!isProfileAgendaPart(this.state.id)) return;
        const interaction = this.state.interaction;
        const partId = this.state.id;
        const visibilityKey = partId + ':visibility';
        const visibility = interaction.fields[visibilityKey] ?? 'private';
        const visibilitySelect = this.querySelector<HTMLSelectElement>('[data-interaction-field="' + visibilityKey + '"]');
        if (visibilitySelect && visibilitySelect.value !== visibility) visibilitySelect.value = visibility;
        const eventList = this.querySelector<HTMLElement>('[data-profile-agenda-event-list]');
        eventList?.querySelectorAll('.lm-agenda-item-local').forEach(item => item.remove());
        if (eventList) {
          for (const [index, item] of interaction.profileAgendaItems.entries()) {
            eventList.insertAdjacentHTML('beforeend', renderAgendaEvent(item, partId, ['teal', 'violet', 'blue'][index % 3], true));
          }
          const publishedIds = new Set(interaction.profileAgendaPosts.map(post => post.id));
          eventList.querySelectorAll<HTMLButtonElement>('[data-profile-agenda-share]').forEach(button => {
            const id = button.dataset.profileAgendaShare ?? '';
            const published = publishedIds.has(id);
            button.disabled = visibility === 'private' || published;
            button.textContent = published ? 'Publicado no perfil' : 'Compartilhar como postagem';
            const state = [...eventList.querySelectorAll<HTMLElement>('[data-agenda-share-state]')].find(item => item.dataset.agendaShareState === id);
            if (state) state.textContent = published ? 'Postagem nesta demonstração' : visibility === 'private' ? 'Escolha um público para publicar' : 'Público: ' + (visibility === 'school' ? 'minha escola' : 'comunidade Lumira');
          });
        }
        const composer = this.querySelector<HTMLFormElement>('[data-profile-agenda-composer]');
        if (composer) composer.hidden = interaction.toggles[partId + ':composer-open'] !== true;
        const picker = this.querySelector<HTMLElement>('[data-profile-agenda-element-picker]');
        if (picker) picker.hidden = interaction.toggles[partId + ':element-picker-open'] !== true;
        const publishedList = this.querySelector<HTMLElement>('[data-profile-agenda-published-list]');
        if (publishedList) {
          publishedList.replaceChildren();
          if (interaction.profileAgendaPosts.length === 0) {
            publishedList.innerHTML = '<p class="lm-agenda-empty">Nenhum compromisso foi publicado. A agenda continua privada até você escolher um público e compartilhar um item.</p>';
          } else {
            for (const post of interaction.profileAgendaPosts) {
              const element = PROFILE_AGENDA_ELEMENTS.find(option => option.id === post.elementId);
              const audience = post.visibility === 'school' ? 'Minha escola' : 'Comunidade Lumira';
              publishedList.insertAdjacentHTML('beforeend', '<article class="lm-agenda-post"><header><span>POSTAGEM DA AGENDA · ' + e(audience.toLocaleUpperCase()) + '</span><time>' + e(post.publishedAt) + '</time></header><h4>' + e(post.title) + '</h4><p>' + e(post.detail) + '</p><small>' + e(agendaDateLabel(post.date)) + ' · ' + e(post.time) + '</small>' + (element ? '<div class="lm-agenda-post-link"><b>' + (element.type === 'competency-question' ? 'Questão de competência' : 'Desafio social') + '</b><span>' + e(element.title) + '</span></div>' : '') + '</article>');
            }
          }
        }
        const count = this.querySelector<HTMLElement>('[data-agenda-published-count]');
        if (count) count.textContent = String(interaction.profileAgendaPosts.length);
        const feedback = this.querySelector<HTMLElement>('[data-agenda-feedback]');
        if (feedback) {
          feedback.textContent = interaction.fields[partId + ':feedback'] ?? '';
          feedback.hidden = !feedback.textContent;
        }
      }
      private restoreCommunityParticipation(): void {
        if (this.state.id !== 'community-feed') return;
        const postList = this.querySelector<HTMLElement>('[data-community-post-list]');
        if (postList) {
          postList.querySelectorAll('.lm-community-post-local').forEach(post => post.remove());
          const posts = this.state.interaction.communityPosts ?? [];
          for (const [index, post] of posts.entries()) postList.insertAdjacentHTML('afterbegin', renderCommunityPost(post, index, true));
        }
        const panels = [...this.querySelectorAll<HTMLElement>('[data-opinion-circle-panel]')];
        if (!panels.length) return;
        const fallbackId = panels[0].dataset.opinionCirclePanel ?? '';
        const selectedId = this.state.interaction.groups['community-opinion-circle'] || fallbackId;
        this.querySelectorAll<HTMLButtonElement>('[data-opinion-circle-select]').forEach(button => {
          const active = button.dataset.opinionCircleSelect === selectedId;
          button.classList.toggle('active', active);
          button.setAttribute('aria-selected', String(active));
          button.tabIndex = active ? 0 : -1;
        });
        for (const panel of panels) panel.hidden = panel.dataset.opinionCirclePanel !== selectedId;
        for (const [circleId, messages] of Object.entries(this.state.interaction.opinionCircleMessages ?? {})) {
          const list = [...this.querySelectorAll<HTMLElement>('[data-opinion-message-list]')].find(item => item.dataset.opinionMessageList === circleId);
          if (!list) continue;
          list.querySelectorAll('.lm-opinion-message-local').forEach(message => message.remove());
          for (const message of messages) {
            const article = document.createElement('article');
            article.className = 'lm-opinion-message lm-opinion-message-local';
            const header = document.createElement('header');
            header.innerHTML = LabAvatar(message.author, message.tone, 'tiny') + '<div><b>' + e(message.author) + '</b><small>' + e(message.role) + ' · ' + e(message.time) + ' · evento ' + String(message.sequence).padStart(3, '0') + '</small></div>';
            const body = document.createElement('p');
            body.textContent = message.text;
            article.append(header, body);
            list.append(article);
          }
        }
      }
      private focusOpinionMessageComposer(circleId: string): void {
        [...this.querySelectorAll<HTMLFormElement>('[data-opinion-message-form]')]
          .find(form => form.dataset.opinionMessageForm === circleId)
          ?.querySelector<HTMLTextAreaElement>('textarea')?.focus();
      }
      private onOpinionMessageDelivered(event: CustomEvent<OpinionCircleMessageDelivery>): void {
        if (this.state.id !== 'community-feed') return;
        const detail = event.detail;
        const message = detail?.message;
        if (!detail?.requestId || !message || message.type !== 'opinion-circle.message') return;
        const circleId = message.circleId;
        if (this.state.interaction.opinionMessageRequests[circleId] !== detail.requestId) return;
        const requests = { ...this.state.interaction.opinionMessageRequests };
        delete requests[circleId];
        this.transitionInteraction(interaction => {
          const existing = interaction.opinionCircleMessages[circleId] ?? [];
          return {
            ...interaction,
            opinionMessageRequests: requests,
            opinionCircleMessages: {
              ...interaction.opinionCircleMessages,
              [circleId]: existing.some(item => item.id === message.id) ? existing : [...existing, message],
            },
            groups: { ...interaction.groups, 'community-opinion-circle': circleId },
            fields: { ...interaction.fields, ['community-feed:circle-message:' + circleId]: '' },
            feedback: 'Mensagem recebida na roda · evento ' + String(message.sequence).padStart(3, '0') + '.',
          };
        });
        this.render();
        this.focusOpinionMessageComposer(circleId);
      }
      private onOpinionMessageRejected(event: CustomEvent<OpinionCircleMessageRejection>): void {
        if (this.state.id !== 'community-feed') return;
        const detail = event.detail;
        if (!detail?.requestId || this.state.interaction.opinionMessageRequests[detail.circleId] !== detail.requestId) return;
        const requests = { ...this.state.interaction.opinionMessageRequests };
        delete requests[detail.circleId];
        this.transitionInteraction(interaction => ({
          ...interaction,
          opinionMessageRequests: requests,
          feedback: detail.reason,
        }));
        this.render();
        this.focusOpinionMessageComposer(detail.circleId);
      }
      private restoreProfileProjects(): void {
        if (!isProfileProjectPart(this.state.id)) return;
        const interaction = this.state.interaction;
        const fieldKey = (name: string): string => this.state.id + ':' + name;
        const builder = this.querySelector<HTMLElement>('[data-project-builder]');
        const panel = this.querySelector<HTMLElement>('.lm-projects-panel, .lm-student-projects');
        const open = interaction.toggles['profile-project-builder-open'] === true;
        if (builder) builder.hidden = !open;
        panel?.classList.toggle('is-project-builder-open', open);
        this.closest<HTMLElement>('.lm-profile-lower > .lm-page-part, .lm-student-lower > .lm-page-part')?.classList.toggle('is-project-builder-open', open);
        const list = this.querySelector<HTMLElement>('[data-profile-project-list]');
        if (list) {
          list.querySelectorAll('.lm-project-row-local').forEach(row => row.remove());
          for (const [index, project] of (interaction.profileProjects ?? []).entries()) {
            list.insertAdjacentHTML('beforeend', renderProjectPublication({
              id: project.id, title: project.title, authors: project.authors, goal: project.goal,
              justification: project.justification, summary: project.summary, audience: project.audience,
              learningEvidence: project.learningEvidence, competencies: project.competencies, milestones: project.milestones,
              status: 'Em andamento', progress: project.milestones.length + (project.milestones.length === 1 ? ' marco' : ' marcos'), socialDraft: project.socialDraft,
            }, index + list.querySelectorAll('.lm-project-publication.is-seed').length));
          }
          const expandedId = interaction.groups['project-expanded-id'] ?? '';
          list.querySelectorAll<HTMLButtonElement>('[data-project-expand]').forEach(button => {
            const expanded = button.dataset.projectExpand === expandedId;
            button.setAttribute('aria-expanded', String(expanded));
            button.closest('.lm-project-publication')?.classList.toggle('is-expanded', expanded);
            const details = list.querySelector<HTMLElement>('[data-project-publication-details="' + button.dataset.projectExpand + '"]');
            if (details) details.hidden = !expanded;
          });
          const empty = list.querySelector<HTMLElement>('[data-project-empty]');
          if (empty) empty.hidden = interaction.profileProjects.length > 0;
        }
        const wizardStep = Math.max(0, Math.min(3, Number(interaction.groups['project-wizard-step'] ?? '0')));
        this.querySelectorAll<HTMLElement>('[data-project-step-panel]').forEach(panel => { panel.hidden = Number(panel.dataset.projectStepPanel) !== wizardStep; });
        this.querySelectorAll<HTMLButtonElement>('[data-project-wizard-step-select]').forEach(tab => {
          const active = Number(tab.dataset.projectWizardStepSelect) === wizardStep;
          tab.setAttribute('aria-selected', String(active));
          tab.tabIndex = active ? 0 : -1;
          tab.classList.toggle('active', active);
        });
        const reviewPanel = this.querySelector<HTMLElement>('[data-project-review-panel]');
        const reviewStatus = interaction.projectReviewStatus;
        if (reviewPanel) reviewPanel.hidden = reviewStatus !== 'ready' && reviewStatus !== 'error' && reviewStatus !== 'stale';
        const reviewBadge = this.querySelector<HTMLElement>('[data-project-review-status]');
        if (reviewBadge) reviewBadge.textContent = reviewStatus === 'error' ? 'NÃO FOI POSSÍVEL REVISAR'
          : reviewStatus === 'stale' ? 'FICHA ALTERADA · REVISÃO ANTIGA' : 'LEITURA CONCLUÍDA';
        const reviewComment = this.querySelector<HTMLElement>('[data-project-review-comment]');
        if (reviewComment) {
          const previousReview = interaction.projectReviewText ? renderProjectChatMarkdown(interaction.projectReviewText) : '';
          reviewComment.innerHTML = reviewStatus === 'ready' ? previousReview
            : reviewStatus === 'stale' ? previousReview + '<p class="lm-project-review-stale-note">A ficha mudou depois desta leitura. Peça uma nova revisão antes de confirmar.</p>'
              : '<p>' + e(interaction.projectReviewText || 'A revisão local não respondeu. Confira se o Cognoscere está ativo e tente novamente.') + '</p>';
        }
        const reviewConfirm = this.querySelector<HTMLButtonElement>('[data-project-review-confirm]');
        if (reviewConfirm) reviewConfirm.hidden = reviewStatus !== 'ready';
        const reviewRetry = this.querySelector<HTMLButtonElement>('[data-project-review-retry]');
        if (reviewRetry) reviewRetry.hidden = reviewStatus !== 'error' && reviewStatus !== 'stale';
        const calendar = this.querySelector<HTMLElement>('[data-project-calendar]');
        if (calendar) {
          const month = interaction.groups['project-calendar-month'] ?? '2026-10';
          const selectedDate = interaction.fields[fieldKey('projectMilestoneDate')] ?? '2026-10-28';
          calendar.innerHTML = renderProjectCalendar(month, interaction.projectMilestones ?? [], selectedDate);
        }
        const messages = this.querySelector<HTMLElement>('[data-project-chat-messages]');
        if (messages) {
          messages.innerHTML = renderProjectChatMessages(interaction.projectChatMessages ?? []);
          messages.scrollTop = messages.scrollHeight;
        }
        const statusBadge = this.querySelector<HTMLElement>('[data-project-assistant-status]');
        if (statusBadge) {
          const status = interaction.projectChatStatus;
          statusBadge.textContent = !status ? 'VERIFICANDO SERVIÇO LOCAL'
            : status.available && status.configured ? 'METIS LOCAL ONLINE'
              : status.available ? 'FORGE LOCAL · MODELOS OFFLINE' : 'SERVIÇO LOCAL OFFLINE';
          statusBadge.title = status?.message ?? 'Verificando http://127.0.0.1:19195.';
          statusBadge.classList.toggle('is-online', Boolean(status?.available && status.configured));
          statusBadge.classList.toggle('is-offline', Boolean(status && (!status.available || !status.configured)));
        }
        const chatSubmit = this.querySelector<HTMLButtonElement>('[data-project-chat-form] button[type="submit"]');
        if (chatSubmit) {
          chatSubmit.disabled = interaction.projectChatPending;
          chatSubmit.textContent = interaction.projectChatPending ? 'Aguardando Metis local…' : 'Conversar com Metis local →';
        }
        this.querySelectorAll<HTMLButtonElement>('[data-project-review], [data-project-review-retry]').forEach(button => {
          button.disabled = interaction.projectChatPending;
          if (button.hasAttribute('data-project-review')) button.textContent = interaction.projectChatPending ? 'Aguardando revisão local…' : 'Revisar com a IA local →';
        });
        const dateField = this.querySelector<HTMLInputElement>('[data-project-create-form] [name="projectMilestoneDate"]');
        const selectedDate = interaction.fields[fieldKey('projectMilestoneDate')] ?? '2026-10-28';
        if (dateField && dateField.value !== selectedDate) dateField.value = selectedDate;
      }
      private restoreProfileEditor(): void {
        if (this.state.id !== 'teacher-hero' && this.state.id !== 'student-hero') return;
        const student = this.state.id === 'student-hero';
        const screenId = this.state.situation.screenId || (student ? 'student-profile' : 'teacher-profile');
        const page = this.closest<HTMLElement>('.lm-product-page') ?? this;
        const text = (selector: string, fallback = ''): string => this.querySelector<HTMLElement>(selector)?.textContent?.trim() ?? fallback;
        const profile: EditableProfile = {
          name: text('[data-profile-value="name"]', student ? 'Caio Almeida' : 'Ana Beatriz Silva'),
          role: text('[data-profile-value="role"]', student ? 'Estudante · 8º ano' : 'Professora de Língua Portuguesa'),
          school: text('[data-profile-value="school"]', 'Escola Municipal Nova Esperança'),
          intro: text('[data-profile-value="intro"]', student ? 'Curiosidade abre novos caminhos.' : 'Educação é caminho, colaboração e destino.'),
          bio: page.querySelector<HTMLElement>('[data-profile-about]')?.textContent?.trim() ?? 'Uma apresentação pública sobre aprendizagem, projetos e comunidade.',
          competencies: [...(this.querySelector('.lm-profile-pills')?.querySelectorAll<HTMLElement>('.lm-pill') ?? [])].map(item => item.textContent?.trim() ?? '').filter(Boolean),
          musicUrl: this.querySelector<HTMLIFrameElement>('.lm-spotify-embed')?.getAttribute('src') ?? '',
        };
        Object.assign(profile, readSavedProfile(screenId));
        this.querySelector<HTMLElement>('[data-profile-value="name"]')?.replaceChildren(document.createTextNode(profile.name));
        this.querySelector<HTMLElement>('[data-profile-value="role"]')?.replaceChildren(document.createTextNode(profile.role));
        this.querySelector<HTMLElement>('[data-profile-value="school"]')?.replaceChildren(document.createTextNode(profile.school));
        this.querySelector<HTMLElement>('[data-profile-value="intro"]')?.replaceChildren(document.createTextNode(profile.intro));
        page.querySelector<HTMLElement>('[data-profile-about]')?.replaceChildren(document.createTextNode(profile.bio));
        this.querySelector<HTMLElement>('[data-profile-avatar]')?.replaceChildren(document.createTextNode(labInitials(profile.name)));
        const pills = this.querySelector<HTMLElement>('.lm-profile-pills');
        if (pills) pills.innerHTML = profile.competencies.map(item => LabPill(item, 'glass')).join('')
          + '<button type="button" class="lm-profile-field-edit" data-profile-field-focus="competencies" aria-label="Editar interesses e competências">✎</button>';
        const musicMount = this.querySelector<HTMLElement>('[data-profile-music]');
        if (musicMount) musicMount.outerHTML = renderProfileMusic(profile);
        page.querySelector<HTMLElement>('.lm-side-account strong')?.replaceChildren(document.createTextNode(profile.name));
        const sidebarAvatar = page.querySelector<HTMLElement>('.lm-side-account .lm-avatar');
        if (sidebarAvatar) {
          sidebarAvatar.setAttribute('aria-label', profile.name);
          sidebarAvatar.replaceChildren(document.createTextNode(labInitials(profile.name)));
        }
        page.querySelector<HTMLElement>('.lm-user-menu > span:not(.lm-avatar)')?.replaceChildren(document.createTextNode(profile.name));
        const menuAvatar = page.querySelector<HTMLElement>('.lm-user-menu .lm-avatar');
        if (menuAvatar) {
          menuAvatar.setAttribute('aria-label', profile.name);
          menuAvatar.replaceChildren(document.createTextNode(labInitials(profile.name)));
        }
        const studentSkills = page.querySelector<HTMLElement>('.lm-student-skills');
        if (studentSkills) {
          const interestList = studentSkills.querySelector<HTMLElement>('[data-student-interest-list]');
          if (interestList) interestList.innerHTML = renderStudentSkillRows(profile.competencies)
            || '<div class="empty">Nenhum interesse selecionado.</div>';
        }

        const editing = this.state.interaction.groups['profile-editor-open'] === 'yes';
        this.classList.toggle('lm-profile-editing', editing);
        page.classList.toggle('lm-profile-editing', editing);
        const primaryEdit = this.querySelector<HTMLButtonElement>('[data-profile-edit-primary]');
        if (primaryEdit) {
          primaryEdit.setAttribute('aria-expanded', String(editing));
          primaryEdit.innerHTML = editing ? '✓ <span>Concluir edição</span>' : '✎ <span>Editar perfil</span>';
        }
        this.querySelector('[data-profile-editor-inline]')?.remove();
        if (!editing) return;
        const editor = '<section class="lm-profile-editor-inline" data-profile-editor-inline aria-labelledby="lm-profile-editor-title">'
          + '<header><div><span class="lm-eyebrow">MODO DE EDIÇÃO · ' + (student ? 'ESTUDANTE' : 'EDUCADORA') + '</span><h2 id="lm-profile-editor-title">Edite os itens do seu perfil</h2><p>Os campos abaixo atualizam a apresentação pública. O acompanhamento pedagógico permanece reservado.</p></div><button type="button" class="lm-profile-close-button" data-profile-close aria-label="Concluir edição">×</button></header>'
          + '<form data-profile-editor><div class="lm-profile-editor-fields">'
          + '<label>Nome<input name="name" required maxlength="80" value="' + e(profile.name) + '"></label>'
          + '<label>Função ou etapa<input name="role" required maxlength="90" value="' + e(profile.role) + '"></label>'
          + '<label>Escola ou comunidade<input name="school" required maxlength="100" value="' + e(profile.school) + '"></label>'
          + '<label>' + (student ? 'Frase de apresentação' : 'Frase do perfil') + '<input name="intro" maxlength="180" value="' + e(profile.intro) + '"></label>'
          + '<label class="lm-profile-editor-bio">Sobre mim<textarea name="bio" rows="3" maxlength="500">' + e(profile.bio) + '</textarea></label>'
          + '<label class="lm-profile-editor-interests">' + (student ? 'Interesses escolhidos' : 'Competências em destaque') + '<textarea name="competencies" rows="3" maxlength="320">' + e(profile.competencies.join('\n')) + '</textarea><small>Um item por linha. Até quatro aparecem na capa.</small></label>'
          + '</div><section class="lm-profile-music-picker"><header><div><span class="lm-eyebrow">SPOTIFY</span><h3>Escolha a música do perfil</h3><p>Busque no Spotify, copie o link de uma faixa, álbum ou playlist e cole aqui.</p></div><a href="https://open.spotify.com/search/" target="_blank" rel="noopener noreferrer">Buscar no Spotify ↗</a></header>'
          + '<label>Link do Spotify<input name="musicUrl" data-profile-music-url type="text" inputmode="url" autocomplete="url" placeholder="https://open.spotify.com/track/…" value="' + e(profile.musicUrl) + '"></label>'
          + '<div class="lm-profile-spotify-preview" data-profile-spotify-preview aria-live="polite">' + (spotifyEmbedFrame(profile.musicUrl) || '<p>Prévia incorporada aparece aqui depois de colar um link válido do Spotify.</p>') + '</div>'
          + '<small class="lm-profile-editor-note">A reprodução usa o player incorporado pelo Spotify. A escolha e os demais campos são salvos neste navegador.</small></section>'
          + '<p class="lm-profile-edit-error" data-profile-edit-error role="alert" hidden></p>'
          + '<footer><button type="button" class="lm-profile-cancel-button" data-profile-close>Descartar alterações</button><button type="submit" class="lm-profile-save-button">Salvar alterações</button></footer></form></section>';
        this.insertAdjacentHTML('beforeend', editor);
        this.querySelectorAll<HTMLElement>('[data-profile-field-focus]').forEach(button => button.title = 'Clique para editar este item');
      }
      private restoreCommunityCalendar(): void {
        if (this.state.id !== 'community-calendar') return;
        const grid = this.querySelector<HTMLElement>('[data-calendar-events]');
        if (!grid) return;
        type CalendarEvent = { title: string; date: string; time: string; color: string };
        let source: Array<{ day?: number; title?: string; time?: string; color?: string }> = [];
        try { source = JSON.parse(grid.dataset.calendarEvents ?? '[]') as typeof source; } catch { source = []; }
        const monthOffset = Number(this.state.interaction.groups['calendar-month-offset'] ?? '0');
        const firstOfMonth = new Date(2026, 9 + (Number.isFinite(monthOffset) ? monthOffset : 0), 1);
        const year = firstOfMonth.getFullYear(), month = firstOfMonth.getMonth();
        const monthKey = year + '-' + String(month + 1).padStart(2, '0');
        const baseEvents: CalendarEvent[] = source.map(event => ({
          title: String(event.title ?? 'Encontro da comunidade'),
          date: '2026-10-' + String(event.day ?? 1).padStart(2, '0'),
          time: String(event.time ?? '14:00'),
          color: String(event.color ?? 'blue'),
        }));
        const allEvents = [...baseEvents, ...(this.state.interaction.communityEvents ?? [])];
        const events = allEvents.filter(event => event.date.startsWith(monthKey));
        let displayedEvents = events;
        const view = this.state.interaction.groups['community-calendar:calendar-view'] ?? 'Mês';
        const monthLabel = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(firstOfMonth);
        const monthOutput = this.querySelector<HTMLElement>('[data-calendar-month-label]');
        if (monthOutput) monthOutput.textContent = monthLabel.charAt(0).toLocaleUpperCase() + monthLabel.slice(1);
        const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const renderDay = (date: Date): string => {
          const iso = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
          const dayEvents = displayedEvents.filter(event => event.date === iso);
          return '<div class="lm-calendar-day"><b>' + date.getDate() + '</b>' + dayEvents.map(event => '<button type="button" class="lm-calendar-event tone-' + e(event.color) + '" data-calendar-event="' + e(event.title + ' · ' + event.time) + '">' + e(event.title) + '</button>').join('') + '</div>';
        };
        grid.classList.toggle('is-week-view', view === 'Semana');
        grid.classList.toggle('is-agenda-view', view === 'Agenda');
        grid.setAttribute('aria-label', 'Agenda em ' + view.toLocaleLowerCase() + ' de ' + monthLabel);
        if (view === 'Agenda') {
          grid.innerHTML = events.length
            ? events.slice().sort((left, right) => left.date.localeCompare(right.date) || left.time.localeCompare(right.time)).map(event => {
              const date = new Date(event.date + 'T12:00:00');
              return '<article class="lm-calendar-agenda-row"><time>' + date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ' · ' + e(event.time) + '</time><b>' + e(event.title) + '</b><button type="button" data-calendar-event="' + e(event.title + ' · ' + event.time) + '">Ver detalhes</button></article>';
            }).join('')
            : '<p class="lm-calendar-no-events">Nenhum evento neste mês. Use “Novo evento” para adicionar um cenário demonstrativo.</p>';
        } else if (view === 'Semana') {
          const anchorDay = Math.min(14, new Date(year, month + 1, 0).getDate());
          const anchor = new Date(year, month, anchorDay);
          const firstDay = new Date(year, month, anchorDay - anchor.getDay());
          const lastDay = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + 6);
          const firstIso = firstDay.getFullYear() + '-' + String(firstDay.getMonth() + 1).padStart(2, '0') + '-' + String(firstDay.getDate()).padStart(2, '0');
          const lastIso = lastDay.getFullYear() + '-' + String(lastDay.getMonth() + 1).padStart(2, '0') + '-' + String(lastDay.getDate()).padStart(2, '0');
          displayedEvents = allEvents.filter(event => event.date >= firstIso && event.date <= lastIso);
          grid.style.gridTemplateRows = '20px minmax(90px, 1fr)';
          grid.innerHTML = weekdays.map(label => '<span class="lm-weekday">' + label + '</span>').join('')
            + Array.from({ length: 7 }, (_, index) => renderDay(new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + index))).join('');
        } else {
          const dayCount = new Date(year, month + 1, 0).getDate();
          const weekCount = Math.ceil((firstOfMonth.getDay() + dayCount) / 7);
          grid.style.gridTemplateRows = '20px repeat(' + weekCount + ', minmax(37px, 1fr))';
          const blanks = Array.from({ length: firstOfMonth.getDay() }, () => '<div class="lm-calendar-day empty" aria-hidden="true"></div>').join('');
          grid.innerHTML = weekdays.map(label => '<span class="lm-weekday">' + label + '</span>').join('')
            + blanks + Array.from({ length: dayCount }, (_, index) => renderDay(new Date(year, month, index + 1))).join('');
        }
        if (view === 'Agenda') grid.style.gridTemplateRows = '';
        const form = this.querySelector<HTMLFormElement>('[data-calendar-event-form]');
        const eventFormOpen = this.state.interaction.toggles['calendar-event-open'] === true;
        if (form) form.hidden = !eventFormOpen;
        this.querySelectorAll<HTMLButtonElement>('[data-calendar-action="create"]').forEach(button => button.setAttribute('aria-expanded', String(eventFormOpen)));
        const feedback = this.querySelector<HTMLElement>('[data-calendar-feedback]');
        if (feedback) feedback.textContent = this.state.interaction.fields['calendar-feedback'] ?? '';
        const notificationPanel = this.querySelector<HTMLElement>('[data-calendar-notifications]');
        const notificationButton = this.querySelector<HTMLButtonElement>('[data-calendar-action="notifications"]');
        const notificationsOpen = this.state.interaction.groups['calendar-notifications-open'] === 'yes';
        if (notificationPanel) notificationPanel.hidden = !notificationsOpen;
        if (notificationButton) notificationButton.setAttribute('aria-expanded', String(notificationsOpen));
        const notificationsRead = this.state.interaction.toggles['notifications-read'] === true;
        const notificationBadge = notificationButton?.querySelector<HTMLElement>('i');
        if (notificationBadge) notificationBadge.hidden = notificationsRead;
        const notificationHeading = this.querySelector<HTMLElement>('[data-calendar-notification-heading]');
        if (notificationHeading && notificationsRead) notificationHeading.textContent = 'Você leu todas as notificações';
        const notificationReadButton = notificationPanel?.querySelector<HTMLButtonElement>('[data-notification-read]');
        if (notificationReadButton && notificationsRead) {
          notificationReadButton.disabled = true;
          notificationReadButton.textContent = 'Tudo lido';
        }
        this.querySelectorAll<HTMLButtonElement>('[data-calendar-view]').forEach(button => {
          const active = button.textContent?.trim() === view;
          button.classList.toggle('active', active);
          button.setAttribute('aria-pressed', String(active));
        });
      }
      private openProfileEditor(field?: string): void {
        this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'profile-editor-open': 'yes' }, feedback: '' }));
        this.render();
        const name = field || 'name';
        const control = this.querySelector<HTMLFormElement>('[data-profile-editor]')?.elements.namedItem(name);
        if (control instanceof HTMLElement) control.focus();
      }
      private closeProfileEditor(): void {
        this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'profile-editor-open': '' } }));
        this.render();
        this.querySelector<HTMLButtonElement>('[data-profile-edit-primary]')?.focus();
      }
      private restoreStories(): void {
        const track = this.querySelector<HTMLElement>('.lm-stories-track');
        const stage = this.querySelector<HTMLElement>('[data-story-stage]');
        const composerMount = this.querySelector<HTMLElement>('.lm-story-composer-mount');
        if (!track || !stage || !composerMount) return;

        track.querySelectorAll('.lm-local-story').forEach(story => story.remove());
        const baseStories = [...track.querySelectorAll<HTMLButtonElement>('.lm-story-card:not(.lm-new-story):not(.lm-story-next)')];
        const localStartIndex = baseStories.length;
        const localCards = this.state.interaction.localStories.map((story, index) => {
          const storyIndex = localStartIndex + index;
          const card = document.createElement('button');
          card.type = 'button';
          card.className = 'lm-story-card lm-local-story';
          card.dataset.storyIndex = String(storyIndex);
          card.dataset.storyTitle = story.title;
          card.dataset.storyCaption = story.caption;
          card.dataset.storyBody = story.body;
          card.dataset.storyCategory = story.category;
          card.dataset.storyTime = 'Agora';
          card.dataset.storyVisibility = story.visibility;
          card.dataset.storyLikes = String(story.likes);
          card.dataset.storyImage = story.image;
          card.dataset.storyImageAlt = 'Imagem do story ' + story.title;
          const quizOptions = [story.quizOptionA, story.quizOptionB].filter(Boolean);
          const pollOptions = [story.pollOptionA, story.pollOptionB].filter(Boolean);
          const challengeOptions = story.quizQuestion ? quizOptions : pollOptions;
          const challengePrompt = story.quizQuestion || story.pollQuestion;
          if (challengePrompt && challengeOptions.length) {
            card.dataset.storyQuestionSubject = story.quizQuestion ? 'Quiz do story' : 'Enquete do story';
            card.dataset.storyQuestionPrompt = challengePrompt;
            card.dataset.storyQuestionOptions = JSON.stringify(challengeOptions);
            card.dataset.storyQuestionAnswer = story.quizQuestion ? (story.quizAnswer === 'Alternativa B' ? '1' : '0') : '-1';
            card.dataset.storyQuestionExplanation = story.quizQuestion
              ? 'Resposta indicada na criação do quiz: ' + (story.quizAnswer === 'Alternativa B' ? story.quizOptionB : story.quizOptionA)
              : 'Enquete sem resposta certa. A escolha fica registrada nesta demonstração.';
          }
          card.dataset.storyReplies = '[]';
          card.innerHTML = '<span class="lm-story-ring tone-' + (storyIndex % 5) + '">' + (story.image ? '<img class="lm-story-thumb" src="' + e(story.image) + '" alt="">' : LabAvatar(story.title, ['teal', 'blue', 'violet', 'rose', 'sun'][storyIndex % 5], 'story-avatar')) + '</span><b>' + e(story.title) + '</b><small>Agora</small>';
          return card;
        });
        const nextButton = track.querySelector('.lm-story-next');
        localCards.forEach(card => nextButton ? track.insertBefore(card, nextButton) : track.append(card));
        const stories = [...track.querySelectorAll<HTMLButtonElement>('.lm-story-card:not(.lm-new-story):not(.lm-story-next)')];
        let selectedStory = this.state.interaction.selectedStory;
        const safeSelectedStory = stories.length ? Math.max(0, Math.min(selectedStory ?? 0, stories.length - 1)) : null;
        if (safeSelectedStory !== selectedStory) {
          selectedStory = safeSelectedStory;
          this.transitionInteraction(interaction => ({ ...interaction, selectedStory }));
        }
        stories.forEach(button => {
          const active = Number(button.dataset.storyIndex) === selectedStory;
          button.classList.toggle('is-interaction-active', active);
          button.setAttribute('aria-pressed', String(active));
        });
        if (selectedStory === null || selectedStory < 0 || selectedStory >= stories.length) {
          stage.innerHTML = '<div class="lm-story-stage-empty"><span>✳</span><b>Stories do perfil</b><p>Selecione um story para abrir sua publicação e explorar as interações.</p></div>';
        } else {
          const card = stories.find(button => Number(button.dataset.storyIndex) === selectedStory);
          if (!card) return;
          const storyTitle = card.dataset.storyTitle ?? 'Story';
          const caption = card.dataset.storyCaption ?? '';
          const body = card.dataset.storyBody ?? '';
          const category = card.dataset.storyCategory ?? 'Momento';
          const publishedAt = card.dataset.storyTime ?? 'Agora';
          const storyImage = card.dataset.storyImage ?? '';
          const storyImageAlt = card.dataset.storyImageAlt ?? 'Imagem do story ' + storyTitle;
          const questionPrompt = card.dataset.storyQuestionPrompt ?? '';
          const questionSubject = card.dataset.storyQuestionSubject ?? 'Questão do story';
          let questionOptions: string[] = [];
          try {
            const decoded: unknown = JSON.parse(card.dataset.storyQuestionOptions ?? '[]');
            if (Array.isArray(decoded)) questionOptions = decoded.map(String).slice(0, 4);
          } catch { questionOptions = []; }
          const questionAnswer = Number(card.dataset.storyQuestionAnswer ?? -1);
          const questionExplanation = card.dataset.storyQuestionExplanation ?? '';
          const baseLikes = Number(card.dataset.storyLikes ?? 0);
          const replyKey = String(selectedStory);
          const storyAnswer = this.state.interaction.storyAnswers?.[replyKey];
          let initialReplies: string[] = [];
          try {
            const decoded: unknown = JSON.parse(card.dataset.storyReplies ?? '[]');
            if (Array.isArray(decoded)) initialReplies = decoded.map(String);
          } catch { initialReplies = []; }
          const replies = [...initialReplies, ...(this.state.interaction.storyReplies[replyKey] ?? [])];
          const likeKey = 'story-like:' + replyKey;
          const saveKey = 'story-save:' + replyKey;
          const liked = this.state.interaction.toggles[likeKey] === true;
          const saved = this.state.interaction.toggles[saveKey] === true;
          const settings = this.querySelector<HTMLElement>('.lm-story-settings');
          const visibility = this.state.interaction.localStories[selectedStory - localStartIndex]?.visibility
            ?? card.dataset.storyVisibility ?? settings?.dataset.storyVisibility ?? 'Público';
          const localStory = this.state.interaction.localStories[selectedStory - localStartIndex];
          const allowReplies = settings?.dataset.storyReplies !== 'false';
          const replyItems = replies.length
            ? '<div class="lm-story-replies"><b>Respostas (' + replies.length + ')</b>' + replies.map(reply => '<p>' + e(reply) + '</p>').join('') + '</div>'
            : '<p class="lm-story-no-replies">Ainda não há respostas. Inicie a conversa sobre esta publicação.</p>';
          const replyForm = allowReplies
            ? '<form class="lm-story-reply-form" data-story-reply-form><label for="story-reply-' + e(this.state.id) + '">Responder ao story</label><div><input id="story-reply-' + e(this.state.id) + '" name="storyReply" data-interaction-field="' + e(this.state.id) + ':story-reply" maxlength="180" placeholder="Escreva uma resposta…"><button type="submit" aria-label="Enviar resposta">Enviar</button></div></form>'
            : '<p class="lm-story-replies-disabled">As respostas estão desativadas nos controles desta demonstração.</p>';
          const storyStickers = localStory ? [
            localStory.music ? '<div class="lm-story-published-sticker music">♫ ' + e(localStory.music) + '</div>' : '',
            localStory.activity ? '<div class="lm-story-published-sticker">✦ Atividade · ' + e(localStory.activity) + '</div>' : '',
            localStory.linkLabel || localStory.linkUrl ? '<div class="lm-story-published-sticker link">↗ ' + e(localStory.linkLabel || localStory.linkUrl) + (localStory.linkLabel && localStory.linkUrl ? '<small>' + e(localStory.linkUrl) + '</small>' : '') + '</div>' : '',
            localStory.pollQuestion ? '<div class="lm-story-published-sticker poll"><b>ENQUETE · ' + e(localStory.pollQuestion) + '</b><span>' + e(localStory.pollOptionA) + '</span><span>' + e(localStory.pollOptionB) + '</span></div>' : '',
            localStory.quizQuestion ? '<div class="lm-story-published-sticker poll"><b>QUIZ · ' + e(localStory.quizQuestion) + '</b><span>' + e(localStory.quizOptionA) + '</span><span>' + e(localStory.quizOptionB) + '</span><small>Resposta: ' + e(localStory.quizAnswer) + '</small></div>' : '',
            localStory.question ? '<div class="lm-story-published-sticker">? ' + e(localStory.question) + '</div>' : '',
            localStory.countdown ? '<div class="lm-story-published-sticker">◷ ' + e(localStory.countdown) + '</div>' : '',
            localStory.mention ? '<div class="lm-story-published-sticker">@ ' + e(localStory.mention) + '</div>' : '',
            localStory.location ? '<div class="lm-story-published-sticker">⌖ ' + e(localStory.location) + '</div>' : '',
          ].filter(Boolean).join('') : '';
          const publishedArtwork = localStory ? '<div class="lm-story-published-art lm-story-published-art--' + e(localStory.orientation) + '">'
            + '<img class="lm-story-filter-' + e(localStory.filter) + '" src="' + e(localStory.image || profileCoverAsset) + '" alt="Imagem publicada em ' + e(storyTitle) + '">'
            + '<div class="lm-story-art-content">' + (localStory.overlayText ? '<div class="lm-story-art-text lm-story-art-text--' + e(localStory.textStyle) + '">' + e(localStory.overlayText) + '</div>' : '') + storyStickers
            + '<div class="lm-story-art-caption"><strong>' + e(localStory.title) + '</strong><span>' + e(localStory.caption) + '</span></div></div></div>' : storyImage
              ? '<figure class="lm-story-published-art lm-story-published-art--portrait lm-story-published-art--fixture"><img src="' + e(storyImage) + '" alt="' + e(storyImageAlt) + '"><div class="lm-story-art-content"><div class="lm-story-art-caption"><strong>' + e(category) + '</strong><span>' + e(caption) + '</span></div></div></figure>'
              : '';
          const questionOptionsMarkup = questionPrompt && questionOptions.length
            ? '<section class="lm-story-question" role="group" aria-labelledby="story-question-' + e(this.state.id) + '-' + selectedStory + '">'
              + '<header class="lm-story-question-heading"><span>' + (questionAnswer >= 0 ? 'QUESTÃO DO STORY' : 'ENQUETE DO STORY') + '</span><small>' + e(questionSubject) + '</small></header>'
              + '<h4 id="story-question-' + e(this.state.id) + '-' + selectedStory + '">' + e(questionPrompt) + '</h4>'
              + '<div class="lm-story-question-options">' + questionOptions.map((option, index) => {
                const selected = storyAnswer === index;
                const expected = questionAnswer === index;
                const answerClass = storyAnswer === undefined ? '' : expected ? ' is-correct' : selected ? ' is-incorrect' : '';
                const marker = storyAnswer === undefined ? '' : expected ? 'Resposta esperada' : selected ? 'Sua escolha' : '';
                return '<button type="button" class="lm-story-question-option' + answerClass + '" data-story-question-option="' + index + '" aria-pressed="' + String(selected) + '"><span class="lm-story-question-option-copy"><i>' + String.fromCharCode(65 + index) + '</i>' + e(option) + '</span><small>' + e(marker) + '</small></button>';
              }).join('') + '</div>'
              + '<p class="lm-story-question-feedback' + (storyAnswer === undefined ? '' : questionAnswer < 0 || storyAnswer === questionAnswer ? ' is-correct' : ' is-incorrect') + '" role="status">'
              + (storyAnswer === undefined
                ? (questionAnswer < 0 ? 'Escolha uma opção para registrar seu voto.' : 'Escolha a resposta que melhor explica a situação.')
                : questionAnswer < 0
                  ? 'Voto registrado: ' + e(questionOptions[storyAnswer] ?? '') + '. ' + e(questionExplanation)
                  : (storyAnswer === questionAnswer ? 'Resposta correta. ' : 'Essa não é a resposta esperada. ') + e(questionExplanation))
              + '</p></section>'
            : '';
          stage.innerHTML = '<article class="lm-story-viewer" aria-label="Story ' + e(storyTitle) + '">'
            + '<header class="lm-story-viewer-header"><div><span class="lm-story-category">' + e(category) + '</span><b>' + e(storyTitle) + '</b><small>' + e(publishedAt) + ' · ' + e(visibility) + '</small></div>'
            + '<div class="lm-story-viewer-nav"><button type="button" data-story-action="previous" aria-label="Story anterior" ' + (selectedStory === 0 ? 'disabled' : '') + '>‹</button><span>' + (selectedStory + 1) + ' / ' + stories.length + '</span><button type="button" data-story-action="next" aria-label="Próximo story" ' + (selectedStory >= stories.length - 1 ? 'disabled' : '') + '>›</button></div></header>'
            + '<div class="lm-story-progress" aria-hidden="true"><i style="width:' + Math.round(((selectedStory + 1) / stories.length) * 100) + '%"></i></div>'
            + publishedArtwork + (storyImage && !localStory ? '<p class="lm-story-body">' + e(body) + '</p>' : '<h3>' + e(caption) + '</h3><p class="lm-story-body">' + e(body) + '</p>')
            + questionOptionsMarkup
            + '<footer class="lm-story-actions"><button type="button" data-story-action="like" aria-pressed="' + String(liked) + '">' + (liked ? '♥ Curtido' : '♡ Curtir') + ' · ' + (baseLikes + (liked ? 1 : 0)) + '</button><button type="button" data-story-action="save" aria-pressed="' + String(saved) + '">' + (saved ? '✓ Salvo' : '＋ Salvar') + '</button><span>Visibilidade: ' + e(visibility) + '</span></footer>'
            + replyItems + replyForm + '</article>';
        }
        const settings = this.querySelector<HTMLElement>('.lm-story-settings');
        const canCreate = settings?.dataset.storyCanCreate !== 'false';
        composerMount.innerHTML = this.state.interaction.storyComposerOpen && canCreate
          ? this.storyComposerMarkup()
          : '';
        composerMount.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[data-story-field]').forEach(field => {
          const name = field.dataset.storyField ?? '';
          const saved = this.state.interaction.fields[this.storyFieldKey(name)];
          if (saved !== undefined) field.value = saved;
          else if (name === 'visibility') field.value = settings?.dataset.storyVisibility ?? 'Público';
        });
        const preview = composerMount.querySelector<HTMLImageElement>('[data-story-preview-image]');
        if (preview) preview.src = this.state.interaction.storyImage || profileCoverAsset;
        composerMount.querySelector<HTMLElement>('[data-story-image-name]')?.replaceChildren(document.createTextNode(this.state.interaction.storyImage ? 'Imagem carregada nesta sessão' : 'Foto de demonstração · selecione uma imagem para substituir'));
        this.syncStoryComposerPreview();
      }
      private storyFieldKey(name: string): string { return this.state.id + ':story:' + name; }
      private restorePedagogyDemo(): void {
        const interaction = this.state.interaction;
        if (this.state.id === 'pedagogy-activity-builder') this.restoreActivityEditor();
        const sequenceGenerated = interaction.aiGenerated.sequence === true;
        const sequence = this.querySelector<HTMLElement>('[data-sequence-generated]');
        const sequenceEmpty = this.querySelector<HTMLElement>('[data-sequence-empty]');
        if (sequence) sequence.hidden = !sequenceGenerated;
        if (sequenceEmpty) sequenceEmpty.hidden = sequenceGenerated;
        const sequenceValues = [
          ['Texto-base e relação de potência', 'Identifique o que potência descreve e relacione a quantidade de aparelhos ao tempo em que são usados.'],
          ['Hipótese inicial', 'Compare a intuição de que um aparelho mais potente sempre consome mais com o caso de vários aparelhos ligados por mais tempo.'],
          ['Representação dos dados', 'Organize quantidade, potência e duração em uma tabela e explique quais dados precisa combinar para comparar os usos.'],
          ['Mudança de condição', 'Altere o tempo do ventilador de oito para quatro horas, mantenha as outras condições e refaça sua interpretação.'],
          ['Aplicação independente', 'Escolha outra situação da escola, indique que dados seriam necessários e justifique uma proposta de economia.'],
        ];
        sequence?.querySelectorAll<HTMLInputElement>('[data-sequence-title]').forEach((target, index) => { target.value = interaction.fields[target.dataset.interactionField ?? ''] ?? sequenceValues[index]?.[0] ?? ''; });
        sequence?.querySelectorAll<HTMLTextAreaElement>('[data-sequence-body]').forEach((target, index) => { target.value = interaction.fields[target.dataset.interactionField ?? ''] ?? sequenceValues[index]?.[1] ?? ''; });
        const reflectionEmpty = this.querySelector<HTMLElement>('[data-reflection-empty]');
        const reflectionResult = this.querySelector<HTMLElement>('[data-reflection-result]');
        const reflection = this.querySelector<HTMLElement>('[data-ai-feedback]');
        const hasReflection = Boolean(interaction.aiReflection);
        if (reflectionEmpty) reflectionEmpty.hidden = hasReflection;
        if (reflectionResult) reflectionResult.hidden = !hasReflection;
        if (reflection) reflection.textContent = interaction.aiReflection;
        const history = this.querySelector<HTMLElement>('[data-ai-attempts]');
        if (history) {
          history.replaceChildren();
          interaction.studentSubmissions.forEach((submission, index) => {
            const article = document.createElement('article');
            const title = document.createElement('b');
            title.textContent = 'Tentativa ' + (index + 1);
            const excerpt = document.createElement('p');
            excerpt.textContent = submission;
            article.append(title, excerpt);
            history.append(article);
          });
        }
        const reviewFeedback = this.querySelector<HTMLElement>('[data-review-feedback]');
        if (reviewFeedback) reviewFeedback.textContent = interaction.reviewFeedback;
        const shareFeedback = this.querySelector<HTMLElement>('[data-share-feedback]');
        if (shareFeedback && interaction.shareFeedback) shareFeedback.textContent = interaction.shareFeedback;
        const responseFeedback = this.querySelector<HTMLElement>('[data-response-feedback]');
        if (responseFeedback) responseFeedback.textContent = interaction.responseFeedback;

        const enrollmentForm = this.querySelector<HTMLFormElement>('[data-leveling-enrollment-form]');
        const enrollmentConfirmed = interaction.toggles['leveling-confirmed'] === true;
        const enrollmentSuccess = this.querySelector<HTMLElement>('[data-leveling-success]');
        const enrollmentSubmit = enrollmentForm?.querySelector<HTMLButtonElement>('button[type="submit"]');
        if (enrollmentSuccess) enrollmentSuccess.hidden = !enrollmentConfirmed;
        if (enrollmentSubmit) {
          enrollmentSubmit.disabled = enrollmentConfirmed;
          if (enrollmentConfirmed) enrollmentSubmit.textContent = 'Matrícula confirmada';
        }
        const enrollmentFeedback = this.querySelector<HTMLElement>('[data-leveling-feedback]');
        if (enrollmentFeedback) enrollmentFeedback.textContent = interaction.enrollmentFeedback;

        const questFixtures = labList<QuestFixture>(this.state.fixture, 'quests');
        const questById = new Map(questFixtures.map(quest => [quest.id, quest]));
        const questRecords = new Map(interaction.questParticipations.map(record => [record.questId, record]));
        const questCards = [...this.querySelectorAll<HTMLButtonElement>('[data-quest-select]')];
        const questFilter = interaction.groups['quest-filter'] ?? 'all';
        const selectedQuest = interaction.groups['quest-selected'] ?? questCards[0]?.dataset.questSelect ?? '';
        const questStatus = (id: string): 'available' | 'registered' | 'in-progress' | 'completed' | 'closed' => {
          const record = questRecords.get(id);
          const quest = questById.get(id);
          if (record?.status === 'completed') return 'completed';
          if (record?.status === 'in-progress') return 'in-progress';
          if (record) return 'registered';
          if (!quest || !questRegistrationOpen(quest)) return 'closed';
          return 'available';
        };
        const matchesQuestFilter = (status: ReturnType<typeof questStatus>): boolean => questFilter === 'all'
          || questFilter === 'available' && status === 'available'
          || questFilter === 'registered' && (status === 'registered' || status === 'in-progress')
          || questFilter === 'completed' && status === 'completed';
        const questStatusLabel = (status: ReturnType<typeof questStatus>, quest?: QuestFixture): string => status === 'completed' ? 'Concluída · aguardando resultado'
          : status === 'in-progress' ? 'Inscrita · em andamento' : status === 'registered' ? 'Inscrita'
            : status === 'closed' && quest?.registeredCount !== undefined && quest.registeredCount >= quest.participantLimit ? 'Vagas esgotadas'
              : status === 'closed' && quest?.registrationDeadlineAt && Date.parse(quest.registrationDeadlineAt) < Date.now() ? 'Prazo encerrado'
                : status === 'closed' ? 'Inscrições encerradas' : 'Inscrições abertas';
        questCards.forEach(card => {
          const id = card.dataset.questSelect ?? '';
          const status = questStatus(id);
          card.dataset.questStatus = status;
          card.hidden = !matchesQuestFilter(status);
          card.classList.toggle('active', id === selectedQuest);
          card.setAttribute('aria-pressed', String(id === selectedQuest));
          const state = card.querySelector<HTMLElement>('[data-quest-card-state]');
          if (state) state.textContent = questStatusLabel(status, questById.get(id));
        });
        const questEmpty = this.querySelector<HTMLElement>('[data-quest-empty]');
        if (questEmpty) questEmpty.hidden = questCards.some(card => !card.hidden);
        this.querySelectorAll<HTMLButtonElement>('[data-quest-filter]').forEach(button => {
          const active = button.dataset.questFilter === questFilter;
          button.classList.toggle('active', active);
          button.setAttribute('aria-pressed', String(active));
          const count = button.querySelector<HTMLElement>('[data-quest-filter-count]');
          const filter = button.dataset.questFilter ?? 'all';
          if (count) count.textContent = String(questCards.filter(card => {
            const status = questStatus(card.dataset.questSelect ?? '');
            return filter === 'all' || filter === 'available' && status === 'available'
              || filter === 'registered' && (status === 'registered' || status === 'in-progress')
              || filter === 'completed' && status === 'completed';
          }).length);
        });
        this.querySelectorAll<HTMLElement>('[data-quest-detail]').forEach(panel => {
          const id = panel.dataset.questDetail ?? '';
          const selected = id === selectedQuest;
          const status = questStatus(id);
          const quest = questById.get(id);
          const record = questRecords.get(id);
          panel.hidden = !selected;
          const statusLabel = panel.querySelector<HTMLElement>('[data-quest-status-label]');
          if (statusLabel) statusLabel.textContent = questStatusLabel(status, quest).toLocaleUpperCase();
          const register = panel.querySelector<HTMLButtonElement>('[data-quest-action="register"]');
          if (register) {
            register.hidden = Boolean(record);
            register.disabled = status !== 'available';
            register.textContent = status === 'available' ? 'Inscrever-se na competição' : questStatusLabel(status, quest);
          }
          const participation = panel.querySelector<HTMLElement>('[data-quest-participation]');
          if (participation) participation.hidden = !record;
          const registrationCode = participation?.querySelector<HTMLElement>('[data-quest-registration-code]');
          if (registrationCode) registrationCode.textContent = record?.registrationId ?? '';
          const registrationSummary = participation?.querySelector<HTMLElement>('[data-quest-registration-summary]');
          if (registrationSummary && record && quest) registrationSummary.textContent = 'Inscrição de ' + labText(this.state.fixture, 'name', 'Caio Almeida') + ' · ' + quest.format + ' · registrada em ' + formatQuestDateTime(record.registeredAt) + '. Status: ' + (record.status === 'completed' ? 'participação concluída; resultado do evento ainda não apurado.' : record.status === 'in-progress' ? 'etapas em andamento.' : 'aguardando a primeira entrega.');
          const participantCount = panel.querySelector<HTMLElement>('[data-quest-participant-count]');
          if (participantCount && quest) participantCount.textContent = String(quest.registeredCount + (record ? 1 : 0));
          const submittedCount = quest?.stages.filter(stage => Boolean(record?.stageSubmissions[stage.id])).length ?? 0;
          const progress = panel.querySelector<HTMLElement>('[data-quest-progress-label]');
          if (progress && quest) progress.textContent = submittedCount + ' de ' + quest.stages.length + ' etapas registradas';
          const firstIncomplete = quest?.stages.findIndex(stage => !record?.stageSubmissions[stage.id]) ?? -1;
          panel.querySelectorAll<HTMLElement>('[data-quest-stage-card]').forEach((stageCard, index) => {
            const stageId = stageCard.dataset.questStageCard ?? '';
            const submission = record?.stageSubmissions[stageId];
            const stageForm = stageCard.querySelector<HTMLFormElement>('[data-quest-stage-form]');
            if (stageForm) stageForm.hidden = !record || Boolean(submission) || index !== firstIncomplete;
            const stageStatus = stageCard.querySelector<HTMLElement>('[data-quest-stage-state]');
            if (stageStatus) stageStatus.textContent = submission ? 'Entrega registrada' : !record ? 'Inscreva-se para participar' : index === firstIncomplete ? 'Etapa atual' : 'Aguardando etapa anterior';
            stageCard.classList.toggle('is-complete', Boolean(submission));
            stageCard.classList.toggle('is-current', Boolean(record) && index === firstIncomplete);
            const submitted = stageCard.querySelector<HTMLElement>('[data-quest-stage-submission]');
            if (submitted) {
              submitted.hidden = !submission;
              submitted.textContent = submission ? 'Registrada em ' + formatQuestDateTime(submission.submittedAt) + ' · ' + submission.response : '';
            }
          });
          const trail = participation?.querySelector<HTMLOListElement>('[data-quest-audit-trail]');
          if (trail) {
            trail.replaceChildren();
            record?.history.forEach(item => {
              const entry = document.createElement('li');
              const heading = document.createElement('b');
              heading.textContent = item.action;
              const time = document.createElement('time');
              time.dateTime = item.at;
              time.textContent = formatQuestDateTime(item.at);
              const detail = document.createElement('p');
              detail.textContent = item.detail;
              entry.append(heading, time, detail);
              trail.append(entry);
            });
          }
        });
        const questFeedback = this.querySelector<HTMLElement>('[data-quest-feedback]');
        if (questFeedback) questFeedback.textContent = interaction.questFeedback;

        const questionForms = [...this.querySelectorAll<HTMLFormElement>('[data-competency-question-form]')];
        const questionIndex = Math.max(0, Math.min(questionForms.length - 1, Number(interaction.groups['competency-question-index'] ?? '0')));
        const submittedQuestions = questionForms.filter(form => interaction.toggles['competency-submitted:' + (form.dataset.questionId ?? '')] === true);
        questionForms.forEach((form, index) => { form.hidden = index !== questionIndex; });
        this.querySelectorAll<HTMLButtonElement>('[data-question-select]').forEach(button => {
          const index = Number(button.dataset.questionSelect ?? '0');
          const questionId = questionForms[index]?.dataset.questionId ?? '';
          const active = index === questionIndex;
          const submitted = interaction.toggles['competency-submitted:' + questionId] === true;
          button.classList.toggle('active', active);
          button.classList.toggle('answered', submitted);
          button.setAttribute('aria-current', active ? 'step' : 'false');
          const label = button.querySelector<HTMLElement>('[data-question-step-state]');
          if (label) label.textContent = submitted ? 'Respondida' : active ? 'Aberta' : 'Em aberto';
        });
        const progressFill = this.querySelector<HTMLElement>('[data-question-progress-fill]');
        if (progressFill) progressFill.style.width = questionForms.length ? Math.round((submittedQuestions.length / questionForms.length) * 100) + '%' : '0%';
        const questionCount = this.querySelector<HTMLElement>('[data-question-count]');
        if (questionCount) questionCount.textContent = questionForms.length ? 'Questão ' + (questionIndex + 1) + ' de ' + questionForms.length : 'Sem questões configuradas';
        const answeredCount = this.querySelector<HTMLElement>('[data-question-answered-count]');
        if (answeredCount) answeredCount.textContent = submittedQuestions.length + (submittedQuestions.length === 1 ? ' resposta registrada' : ' respostas registradas');
        const questionFeedback = this.querySelector<HTMLElement>('[data-question-item-feedback]');
        if (questionFeedback) questionFeedback.textContent = interaction.questionFeedback;
        const questionReflection = this.querySelector<HTMLElement>('[data-question-reflection]');
        const questionReflectionText = this.querySelector<HTMLElement>('[data-question-reflection-text]');
        if (questionReflection) questionReflection.hidden = !interaction.aiReflection;
        if (questionReflectionText) questionReflectionText.textContent = interaction.aiReflection;
        const questionComplete = this.querySelector<HTMLElement>('[data-question-session-complete]');
        if (questionComplete) questionComplete.hidden = questionForms.length === 0 || submittedQuestions.length !== questionForms.length;
        const questionForm = questionForms[questionIndex];
        const previous = questionForm?.querySelector<HTMLButtonElement>('[data-question-nav="previous"]');
        if (previous) previous.disabled = questionIndex === 0;
      }
      private fillMockAiFields(values: Record<string, string>): void {
        const fields = { ...this.state.interaction.fields };
        this.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[data-ai-field]').forEach(field => {
          const name = field.dataset.aiField ?? '';
          const value = values[name];
          if (value === undefined || field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) return;
          field.value = value;
          const key = field.dataset.interactionField;
          if (key) fields[key] = value;
        });
        this.transitionInteraction(interaction => ({ ...interaction, fields }));
      }
      private restoreActivityEditor(): void {
        const host = this.querySelector<HTMLElement>('[data-activity-editor-content]');
        if (!host) return;
        const interaction = this.state.interaction;
        const questionIds = interaction.activityQuestionIds?.length ? interaction.activityQuestionIds : ['question-1'];
        const lastStep = questionIds.length + 1;
        const selectedStep = Number(interaction.groups['activity-step'] ?? '0');
        const step = Number.isInteger(selectedStep) ? Math.max(0, Math.min(lastStep, selectedStep)) : 0;
        const value = (key: string): string => interaction.fields['pedagogy-activity-builder:' + key] ?? '';
        const questionValue = (id: string, field: string): string => value('question:' + id + ':' + field);
        const isComplete = (id: string): boolean => ['title', 'context', 'prompt', 'understanding'].every(field => Boolean(questionValue(id, field).trim()));
        const stepButtons = [
          { index: 0, label: 'Intenção', complete: Boolean(value('activityTitle').trim() && value('activityUnderstanding').trim()) },
          ...questionIds.map((id, index) => ({ index: index + 1, label: 'Questão ' + (index + 1), complete: isComplete(id) })),
          { index: lastStep, label: 'Revisão', complete: interaction.toggles['activity-approved'] === true },
        ].map((item, index) => '<button type="button" data-activity-step-index="' + item.index + '" class="' + (step === item.index ? 'active' : '') + (item.complete ? ' complete' : '') + '" aria-current="' + (step === item.index ? 'step' : 'false') + '"><span>' + String(index + 1).padStart(2, '0') + '</span><small>' + e(item.label) + '</small></button>').join('');
        const inputField = (label: string, name: string, key: string, current: string, placeholder: string, className = ''): string => '<label class="lm-activity-field ' + className + '"><span>' + e(label) + '</span><input name="' + e(name) + '" data-interaction-field="pedagogy-activity-builder:' + e(key) + '" value="' + e(current) + '" maxlength="140" placeholder="' + e(placeholder) + '"></label>';
        const areaField = (label: string, name: string, key: string, current: string, placeholder: string, hint: string, rows = 4, className = ''): string => '<label class="lm-activity-field ' + className + '"><span>' + e(label) + '</span>' + (hint ? '<small>' + e(hint) + '</small>' : '') + '<textarea name="' + e(name) + '" data-interaction-field="pedagogy-activity-builder:' + e(key) + '" rows="' + rows + '" maxlength="1800" placeholder="' + e(placeholder) + '">' + e(current) + '</textarea></label>';
        let panel = '';
        if (step === 0) {
          panel = '<section class="lm-activity-step-panel" aria-labelledby="activity-step-heading"><span class="lm-eyebrow">ETAPA 1 · INTENÇÃO</span><h3 id="activity-step-heading" tabindex="-1">O que esta atividade deve ajudar a compreender?</h3>'
            + inputField('Título da atividade', 'activityTitle', 'activityTitle', value('activityTitle'), 'Ex.: Consumo de energia na biblioteca')
            + areaField('Compreensão que organiza a atividade', 'activityUnderstanding', 'activityUnderstanding', value('activityUnderstanding'), 'Descreva a ideia ou relação que deve orientar o conjunto de questões.', 'Este objetivo ajuda a manter as questões ligadas a uma mesma aprendizagem.', 4)
            + '<p class="lm-activity-step-note">A próxima etapa abre um formulário próprio para cada questão.</p></section>';
        } else if (step <= questionIds.length) {
          const index = step - 1;
          const id = questionIds[index] ?? '';
          panel = '<section class="lm-activity-step-panel" aria-labelledby="activity-step-heading"><div class="lm-activity-question-heading"><div><span class="lm-eyebrow">QUESTÃO ' + String(step).padStart(2, '0') + ' DE ' + String(questionIds.length).padStart(2, '0') + '</span><h3 id="activity-step-heading" tabindex="-1">Edite esta questão</h3></div><button type="button" class="lm-quiet-action" data-activity-remove-question="' + e(id) + '"' + (questionIds.length === 1 ? ' disabled' : '') + '>Remover questão</button></div>'
            + '<div class="lm-activity-question-fields">'
            + inputField('Título interno', 'questionTitle-' + id, 'question:' + id + ':title', questionValue(id, 'title'), 'Nome curto para identificar a questão')
            + areaField('Contexto e dados', 'questionContext-' + id, 'question:' + id + ':context', questionValue(id, 'context'), 'Descreva a situação, os dados e as condições relevantes.', 'Apresente o que a pessoa poderá considerar para responder.', 4)
            + areaField('Enunciado apresentado ao estudante', 'questionPrompt-' + id, 'question:' + id + ':prompt', questionValue(id, 'prompt'), 'O que a pessoa estudante deverá fazer ou explicar?', '', 4, 'lm-activity-field-wide')
            + areaField('Compreensão que esta questão deve evidenciar', 'questionUnderstanding-' + id, 'question:' + id + ':understanding', questionValue(id, 'understanding'), 'Que compreensão esta questão deve tornar visível?', 'Orientação docente para a questão. Este texto não aparece no enunciado do estudante.', 4, 'lm-activity-field-wide lm-activity-understanding-field')
            + '</div></section>';
        } else {
          const reviewed = interaction.toggles['activity-review-confirmed'] === true;
          panel = '<section class="lm-activity-step-panel" aria-labelledby="activity-step-heading"><span class="lm-eyebrow">ETAPA ' + String(lastStep + 1).padStart(2, '0') + ' · REVISÃO FINAL</span><h3 id="activity-step-heading" tabindex="-1">Confira a atividade inteira</h3><p class="lm-activity-review-intro">' + e(value('activityTitle') || 'Atividade sem título') + ' · ' + questionIds.length + (questionIds.length === 1 ? ' questão' : ' questões') + '</p><p class="lm-activity-review-goal"><b>Compreensão da atividade</b><span>' + e(value('activityUnderstanding') || 'Descrição ainda não preenchida.') + '</span></p><div class="lm-activity-review-list">'
            + questionIds.map((id, index) => '<article><header><span>QUESTÃO ' + String(index + 1).padStart(2, '0') + '</span><button type="button" class="lm-text-action" data-activity-step-index="' + (index + 1) + '">Editar</button></header><h4>' + e(questionValue(id, 'title') || 'Questão sem título') + '</h4><p><b>Contexto:</b> ' + e(questionValue(id, 'context') || 'Contexto ainda não preenchido.') + '</p><p><b>Enunciado:</b> ' + e(questionValue(id, 'prompt') || 'Enunciado ainda não preenchido.') + '</p><small><b>Compreensão esperada:</b> ' + e(questionValue(id, 'understanding') || 'Descrição ainda não preenchida.') + '</small></article>').join('')
            + '</div><label class="lm-activity-review-check"><input type="checkbox" data-interaction-toggle="activity-review-confirmed"' + (reviewed ? ' checked' : '') + '><span>Revisei se contexto, enunciado e compreensão esperada estão coerentes em todas as questões.</span></label></section>';
        }
        const progress = Math.round(step / lastStep * 100);
        const nextLabel = step === lastStep - 1 ? 'Revisar atividade' : 'Próxima etapa';
        host.innerHTML = '<header class="lm-activity-editor-header"><nav class="lm-activity-stepper" aria-label="Etapas do editor de atividade">' + stepButtons + '</nav><button type="button" class="lm-secondary-button" data-activity-add-question>＋ Adicionar questão</button></header><div class="lm-activity-progress" aria-hidden="true"><i style="width:' + progress + '%"></i></div><p class="lm-activity-step-count">Etapa ' + (step + 1) + ' de ' + (lastStep + 1) + ' · ' + questionIds.length + (questionIds.length === 1 ? ' questão' : ' questões') + '</p>' + panel + '<footer class="lm-activity-editor-actions"><button type="button" class="lm-quiet-action" data-activity-nav="previous"' + (step === 0 ? ' disabled' : '') + '>← Voltar</button><div>' + (step === lastStep ? '<button type="button" class="lm-primary-button" data-activity-approve>' + (interaction.toggles['activity-approved'] === true ? 'Rascunho revisado ✓' : 'Confirmar revisão') + '</button>' : '<button type="button" class="lm-primary-button" data-activity-nav="next">' + nextLabel + ' →</button>') + '</div></footer>';
      }
      private handleActivityEditorClick(button: HTMLButtonElement): boolean {
        const interaction = this.state.interaction;
        const ids = [...(interaction.activityQuestionIds ?? [])];
        const currentStep = Math.max(0, Number(interaction.groups['activity-step'] ?? '0'));
        const lastStep = ids.length + 1;
        if (button.dataset.activityStepIndex !== undefined) {
          const next = Number(button.dataset.activityStepIndex);
          if (!Number.isInteger(next) || next < 0 || next > lastStep) return true;
          this.transitionInteraction(state => ({ ...state, groups: { ...state.groups, 'activity-step': String(next) }, reviewFeedback: '' }));
          this.render();
          this.querySelector<HTMLElement>('#activity-step-heading')?.focus();
          return true;
        }
        if (button.hasAttribute('data-activity-add-question')) {
          const id = 'question-' + projectId();
          this.transitionInteraction(state => ({
            ...state,
            activityQuestionIds: [...(state.activityQuestionIds ?? []), id],
            groups: { ...state.groups, 'activity-step': String((state.activityQuestionIds?.length ?? 0) + 1) },
            toggles: { ...state.toggles, 'activity-review-confirmed': false, 'activity-approved': false },
            reviewFeedback: 'Questão adicionada ao rascunho. Preencha o contexto, o enunciado e a compreensão esperada.',
          }));
          this.render();
          this.querySelector<HTMLInputElement>('[data-activity-editor-content] input')?.focus();
          return true;
        }
        if (button.dataset.activityRemoveQuestion) {
          if (ids.length <= 1) return true;
          const removedId = button.dataset.activityRemoveQuestion;
          const removedIndex = ids.indexOf(removedId);
          if (removedIndex < 0) return true;
          const nextIds = ids.filter(id => id !== removedId);
          const fields = Object.fromEntries(Object.entries(interaction.fields).filter(([key]) => !key.startsWith('pedagogy-activity-builder:question:' + removedId + ':')));
          this.transitionInteraction(state => ({
            ...state,
            activityQuestionIds: nextIds,
            fields,
            groups: { ...state.groups, 'activity-step': String(Math.min(removedIndex + 1, nextIds.length)) },
            toggles: { ...state.toggles, 'activity-review-confirmed': false, 'activity-approved': false },
            reviewFeedback: 'Questão removida do rascunho.',
          }));
          this.render();
          this.querySelector<HTMLElement>('#activity-step-heading')?.focus();
          return true;
        }
        if (button.dataset.activityNav) {
          const direction = button.dataset.activityNav === 'next' ? 1 : -1;
          const next = Math.max(0, Math.min(lastStep, currentStep + direction));
          if (direction > 0) {
            const missing = this.activityStepMissing(currentStep);
            if (missing) {
              this.transitionInteraction(state => ({ ...state, reviewFeedback: 'Preencha este passo antes de continuar.' }));
              this.render();
              this.focusActivityField(missing);
              return true;
            }
          }
          this.transitionInteraction(state => ({ ...state, groups: { ...state.groups, 'activity-step': String(next) }, reviewFeedback: '' }));
          this.render();
          this.querySelector<HTMLElement>('#activity-step-heading')?.focus();
          return true;
        }
        if (button.hasAttribute('data-activity-approve')) {
          const title = interaction.fields['pedagogy-activity-builder:activityTitle']?.trim() ?? '';
          const understanding = interaction.fields['pedagogy-activity-builder:activityUnderstanding']?.trim() ?? '';
          const missingOverall = !title ? 'pedagogy-activity-builder:activityTitle' : !understanding ? 'pedagogy-activity-builder:activityUnderstanding' : '';
          if (missingOverall) {
            this.transitionInteraction(state => ({ ...state, groups: { ...state.groups, 'activity-step': '0' }, reviewFeedback: 'Complete o título e a compreensão que orienta a atividade.' }));
            this.render();
            this.focusActivityField(missingOverall);
            return true;
          }
          for (const [index, id] of ids.entries()) {
            const missing = (['title', 'context', 'prompt', 'understanding'] as const).find(field => !interaction.fields['pedagogy-activity-builder:question:' + id + ':' + field]?.trim());
            if (missing) {
              const key = 'pedagogy-activity-builder:question:' + id + ':' + missing;
              this.transitionInteraction(state => ({ ...state, groups: { ...state.groups, 'activity-step': String(index + 1) }, reviewFeedback: 'Complete os quatro campos da questão antes de confirmar a revisão.' }));
              this.render();
              this.focusActivityField(key);
              return true;
            }
          }
          if (interaction.toggles['activity-review-confirmed'] !== true) {
            this.transitionInteraction(state => ({ ...state, reviewFeedback: 'Marque a conferência do conjunto antes de confirmar a revisão.' }));
            this.render();
            this.querySelector<HTMLInputElement>('[data-interaction-toggle="activity-review-confirmed"]')?.focus();
            return true;
          }
          this.transitionInteraction(state => ({ ...state, toggles: { ...state.toggles, 'activity-approved': true }, reviewFeedback: 'Revisão confirmada nesta sessão. O rascunho continua editável e não foi publicado.' }));
          this.render();
          return true;
        }
        return false;
      }
      private activityStepMissing(step: number): string {
        const interaction = this.state.interaction;
        if (step === 0) {
          if (!interaction.fields['pedagogy-activity-builder:activityTitle']?.trim()) return 'pedagogy-activity-builder:activityTitle';
          if (!interaction.fields['pedagogy-activity-builder:activityUnderstanding']?.trim()) return 'pedagogy-activity-builder:activityUnderstanding';
          return '';
        }
        const id = interaction.activityQuestionIds?.[step - 1];
        if (!id) return '';
        const missing = (['title', 'context', 'prompt', 'understanding'] as const).find(field => !interaction.fields['pedagogy-activity-builder:question:' + id + ':' + field]?.trim());
        return missing ? 'pedagogy-activity-builder:question:' + id + ':' + missing : '';
      }
      private focusActivityField(key: string): void {
        const field = [...this.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-interaction-field]')]
          .find(item => item.dataset.interactionField === key);
        field?.focus();
      }
      private subjectSkillSuggestions(query: string): SubjectSkillSuggestion[] {
        const normalized = query.trim().toLocaleLowerCase();
        const selected = new Set((this.state.interaction.subjectSkills ?? []).map(skill => skill.toLocaleLowerCase()));
        const matches = SUBJECT_SKILL_SUGGESTIONS.filter(item =>
          (!normalized || item.name.toLocaleLowerCase().includes(normalized)) && !selected.has(item.name.toLocaleLowerCase()),
        );
        if (!normalized) return matches.slice(0, 6);
        if (matches.length) return matches.slice(0, 6);
        if (selected.has(normalized)) return [];
        return [{ name: query.trim(), understanding: 'Habilidade livre desta matéria. A IA poderá usar o nome junto das quatro descrições da fundação; acrescente uma explicação mais específica se este nome não deixar o objetivo claro.' }];
      }
      private restoreSubjectFoundation(): void {
        if (this.state.id !== 'pedagogy-context') return;
        const interaction = this.state.interaction;
        const open = interaction.groups['subject-foundation-open'] === 'yes';
        const editor = this.querySelector<HTMLElement>('[data-subject-foundation-form]');
        const summary = this.querySelector<HTMLElement>('[data-subject-foundation-summary]');
        const toggle = this.querySelector<HTMLButtonElement>('[data-subject-foundation-toggle]');
        if (editor) editor.hidden = !open;
        if (toggle) {
          toggle.setAttribute('aria-expanded', String(open));
          toggle.textContent = open ? 'Fechar criação' : interaction.subjectFoundation ? '＋ Criar outra matéria' : '＋ Criar matéria';
        }
        if (summary) {
          const foundation = interaction.subjectFoundation;
          summary.hidden = !foundation;
          summary.innerHTML = foundation
            ? '<header><div><span class="lm-eyebrow">FUNDAÇÃO SALVA NESTA DEMONSTRAÇÃO</span><h3>' + e(foundation.name) + '</h3></div><span class="lm-subject-saved-mark">✓ RASCUNHO LOCAL</span></header>'
              + '<div class="lm-subject-saved-skills">' + foundation.skills.map(skill => '<span>' + e(skill) + '</span>').join('') + '</div>'
              + '<details><summary>Ver as quatro descrições para IA</summary><dl><div><dt>Natureza</dt><dd>' + e(foundation.nature) + '</dd></div><div><dt>Entendimento</dt><dd>' + e(foundation.understanding) + '</dd></div><div><dt>Abordagem</dt><dd>' + e(foundation.approach) + '</dd></div><div><dt>Aspectos</dt><dd>' + e(foundation.aspects) + '</dd></div></dl></details>'
            : '';
        }
        const skills = interaction.subjectSkills ?? [];
        const chips = this.querySelector<HTMLElement>('[data-subject-skill-chips]');
        if (chips) chips.innerHTML = skills.map((skill, index) => '<span class="lm-subject-skill-chip">' + e(skill) + '<button type="button" data-subject-skill-remove="' + index + '" aria-label="Remover habilidade ' + e(skill) + '">×</button></span>').join('');
        const input = this.querySelector<HTMLInputElement>('[data-subject-skill-input]');
        const menu = this.querySelector<HTMLElement>('[data-subject-skill-menu]');
        const options = this.querySelector<HTMLElement>('[data-subject-skill-options]');
        const understanding = this.querySelector<HTMLElement>('[data-subject-skill-understanding]');
        const suggestions = this.subjectSkillSuggestions(interaction.subjectSkillQuery);
        const activeIndex = suggestions.length ? Math.max(0, Math.min(suggestions.length - 1, interaction.subjectSkillActiveIndex)) : 0;
        if (input) {
          if (input.value !== interaction.subjectSkillQuery) input.value = interaction.subjectSkillQuery;
          input.setAttribute('aria-expanded', String(open && interaction.subjectSkillMenuOpen && suggestions.length > 0));
          if (open && interaction.subjectSkillMenuOpen && suggestions.length) input.setAttribute('aria-activedescendant', 'subject-skill-option-' + activeIndex);
          else input.removeAttribute('aria-activedescendant');
        }
        if (menu) menu.hidden = !open || !interaction.subjectSkillMenuOpen || suggestions.length === 0;
        if (options) options.innerHTML = suggestions.map((suggestion, index) => '<button type="button" id="subject-skill-option-' + index + '" class="lm-subject-skill-option' + (index === activeIndex ? ' active' : '') + '" role="option" aria-selected="' + String(index === activeIndex) + '" data-subject-skill-index="' + index + '"><span>' + e(suggestion.name) + '</span><small>' + (SUBJECT_SKILL_SUGGESTIONS.some(item => item.name === suggestion.name) ? 'SUGESTÃO' : 'ADICIONAR NOME') + '</small></button>').join('');
        if (understanding) {
          const active = suggestions[activeIndex];
          const insight = interaction.subjectSkillInsight?.skillName === active?.name ? interaction.subjectSkillInsight : null;
          const eyebrow = !active ? '' : insight?.status === 'pending'
            ? 'CONSULTANDO COGNOSCERE LOCAL'
            : insight?.status === 'ready'
              ? 'ENTENDIMENTO DO METIS LOCAL'
              : insight?.status === 'error'
                ? 'REFERÊNCIA · FORGE LOCAL INDISPONÍVEL'
                : 'ENTENDIMENTO DO METIS LOCAL';
          const explanation = insight?.explanation || 'Passe o cursor, use as setas ou digite para consultar como o assistente local entende esta habilidade.';
          understanding.hidden = !active || !open || !interaction.subjectSkillMenuOpen;
          understanding.innerHTML = active
            ? '<span class="lm-eyebrow">' + eyebrow + '</span><b>' + e(active.name) + '</b>'
              + (insight?.status === 'pending' ? '<span class="lm-subject-skill-spinner" aria-hidden="true"></span>' : '')
              + '<p>' + e(explanation) + '</p>'
              + (insight?.status === 'error' && active.understanding ? '<small>Referência demonstrativa: ' + e(active.understanding) + '</small>' : '')
            : '';
        }
      }
      private scheduleSubjectSkillUnderstanding(suggestion: SubjectSkillSuggestion | undefined): void {
        const existing = this.state.interaction.subjectSkillInsight;
        if (suggestion && existing?.skillName === suggestion.name && existing.status !== 'error') return;
        if (this.subjectSkillInsightTimer !== undefined) window.clearTimeout(this.subjectSkillInsightTimer);
        this.subjectSkillInsightTimer = undefined;
        if (!suggestion || this.state.id !== 'pedagogy-context') {
          this.subjectSkillInsightRevision += 1;
          this.transitionInteraction(interaction => ({ ...interaction, subjectSkillInsight: null }));
          return;
        }
        const revision = ++this.subjectSkillInsightRevision;
        const requestId = 'skill-' + Date.now().toString(36) + '-' + revision.toString(36);
        this.transitionInteraction(interaction => ({
          ...interaction,
          subjectSkillInsight: { skillName: suggestion.name, requestId, status: 'pending', explanation: '' },
        }));
        this.restoreSubjectFoundation();
        this.subjectSkillInsightTimer = window.setTimeout(() => {
          this.subjectSkillInsightTimer = undefined;
          const current = this.state.interaction.subjectSkillInsight;
          if (this.state.id !== 'pedagogy-context' || !this.isConnected || current?.requestId !== requestId) return;
          const request: SubjectSkillUnderstandingRequest = { requestId, partId: 'pedagogy-context', skillName: suggestion.name };
          this.dispatchEvent(new CustomEvent('lumira-subject-skill-understanding-request', { bubbles: true, composed: true, detail: request }));
        }, 420);
      }
      private onSubjectSkillUnderstandingResult(event: CustomEvent<SubjectSkillUnderstandingResult>): void {
        if (this.state.id !== 'pedagogy-context') return;
        const detail = event.detail;
        const insight = this.state.interaction.subjectSkillInsight;
        if (!detail?.requestId || !insight || insight.requestId !== detail.requestId || insight.skillName !== detail.skillName) return;
        const failed = Boolean(detail.error || !detail.explanation?.trim());
        this.transitionInteraction(interaction => ({
          ...interaction,
          subjectSkillInsight: {
            skillName: detail.skillName,
            requestId: detail.requestId,
            status: failed ? 'error' : 'ready',
            explanation: failed ? detail.error || 'Não foi possível consultar o entendimento agora.' : detail.explanation!.trim(),
          },
        }));
        this.restoreSubjectFoundation();
      }
      private addSubjectSkill(name: string): void {
        const value = name.trim();
        if (!value || this.state.id !== 'pedagogy-context') return;
        const existing = this.state.interaction.subjectSkills ?? [];
        if (existing.some(skill => skill.toLocaleLowerCase() === value.toLocaleLowerCase())) {
          this.transitionInteraction(interaction => ({ ...interaction, feedback: 'Essa habilidade já está na lista.' }));
          this.restoreSubjectFoundation();
          return;
        }
        this.transitionInteraction(interaction => ({
          ...interaction,
          subjectSkills: [...(interaction.subjectSkills ?? []), value],
          subjectSkillQuery: '',
          subjectSkillActiveIndex: 0,
          subjectSkillMenuOpen: false,
          feedback: '',
        }));
        this.restoreSubjectFoundation();
        this.querySelector<HTMLInputElement>('[data-subject-skill-input]')?.focus();
      }
      private storyComposerMarkup(): string {
        const interaction = this.state.interaction;
        const tool = interaction.storyComposerTool;
        const creatorName = this.state.id === 'student-stories' ? 'Caio Almeida' : 'Ana Beatriz Silva';
        const creatorInitial = creatorName.slice(0, 1).toLocaleUpperCase();
        const select = (name: string, label: string, options: string[]): string =>
          '<label>' + e(label) + '<select name="' + e(name) + '" data-story-field="' + e(name) + '">' + options.map(option => '<option value="' + e(option) + '">' + e(option) + '</option>').join('') + '</select></label>';
        const quickFeatures: Array<[string, string, string]> = [
          ['image', '▧', 'Imagem'], ['text', 'Aa', 'Texto'], ['music', '♫', 'Música'], ['activity', '✦', 'Atividade'],
          ['link', '↗', 'Link'], ['poll', '▤', 'Enquete'], ['quiz', '?', 'Quiz'], ['question', '…', 'Pergunta'],
          ['countdown', '◷', 'Contagem'], ['mention', '@', 'Marcação'], ['location', '⌖', 'Local'],
        ];
        const quickFeatureButtons = quickFeatures.map(([key, icon, label]) => '<button type="button" class="lm-story-quick-feature' + (key === 'image' ? ' lm-story-quick-feature-image' : '') + '" data-story-quick-feature="' + e(key) + '" aria-label="Adicionar ' + e(label.toLocaleLowerCase()) + '" title="' + e(label) + '"><span>' + e(icon) + '</span>' + e(label) + '</button>').join('');
        if (!interaction.storyComposerExpanded) {
          return '<form class="lm-story-quick-composer" data-story-composer aria-label="Criar novo story">'
            + '<header><span class="lm-story-quick-avatar" aria-hidden="true">' + e(creatorInitial) + '</span><div><strong>Criar story</strong><small>Compartilhe um momento com a comunidade</small></div><button type="button" data-story-action="cancel" aria-label="Fechar criação de story">×</button></header>'
            + '<textarea name="body" data-story-field="body" rows="3" maxlength="360" aria-label="Texto do story" placeholder="O que você quer compartilhar?"></textarea>'
            + '<div class="lm-story-quick-tools"><span>ADICIONAR AO STORY</span>' + quickFeatureButtons + '</div>'
            + '<footer><div class="lm-story-quick-visibility">' + select('visibility', 'Público', ['Público', 'Seguidores', 'Somente eu', 'Privado']) + '</div><button type="submit">Compartilhar story <span>↗</span></button></footer></form>';
        }
        const field = (name: string, label: string, placeholder: string, type = 'text', maxlength = 120): string =>
          '<label>' + e(label) + '<input type="' + e(type) + '" name="' + e(name) + '" data-story-field="' + e(name) + '" maxlength="' + maxlength + '" placeholder="' + e(placeholder) + '"></label>';
        const area = (name: string, label: string, placeholder: string, rows = 3, maxlength = 240): string =>
          '<label>' + e(label) + '<textarea name="' + e(name) + '" data-story-field="' + e(name) + '" rows="' + rows + '" maxlength="' + maxlength + '" placeholder="' + e(placeholder) + '"></textarea></label>';
        const tools = [
          ['image', '▧', 'Imagem'], ['text', 'Aa', 'Texto'], ['music', '♫', 'Música'], ['activity', '✦', 'Atividade'], ['link', '↗', 'Link'],
          ['poll', '▤', 'Enquete'], ['quiz', '?', 'Quiz'], ['question', '…', 'Pergunta'], ['countdown', '◷', 'Contagem'],
          ['mention', '@', 'Marcação'], ['location', '⌖', 'Local'],
        ];
        const panels: Record<string, string> = {
          image: '<p class="lm-story-panel-hint">Adicione uma imagem à prévia. Escolha um arquivo logo abaixo da imagem para começar.</p>',
          text: area('overlayText', 'Texto sobre a foto', 'Escreva uma frase para aparecer no story.', 4, 180) + select('textStyle', 'Estilo do texto', ['Clássico', 'Destaque', 'Contorno']),
          music: select('music', 'Faixa musical', ['Escolha uma faixa', 'Boa Energia · Jota.Pê', 'O Sol · Vitor Kley', 'Velha Infância · Tribalistas', 'Instrumental · Lumira']) + '<p class="lm-story-panel-hint">A faixa aparece como sticker musical na publicação.</p>',
          activity: select('activity', 'Atividade da comunidade', ['Escolha uma atividade', 'Feira de ciências', 'Clube de leitura', 'Desafio de matemática', 'Roda de conversa', 'Projeto de artes']) + '<p class="lm-story-panel-hint">Vincule o story a uma atividade demonstrativa do perfil.</p>',
          link: field('linkLabel', 'Texto do link', 'Ex.: Ver projeto completo') + field('linkUrl', 'Endereço', 'https://exemplo.org/projeto', 'url'),
          poll: area('pollQuestion', 'Pergunta da enquete', 'Qual ideia devemos explorar?', 2, 120) + field('pollOptionA', 'Opção 1', 'Primeira resposta', 'text', 48) + field('pollOptionB', 'Opção 2', 'Segunda resposta', 'text', 48),
          quiz: area('quizQuestion', 'Pergunta do quiz', 'Qual resposta está correta?', 2, 120) + field('quizOptionA', 'Resposta A', 'Alternativa A', 'text', 48) + field('quizOptionB', 'Resposta B', 'Alternativa B', 'text', 48) + select('quizAnswer', 'Resposta correta', ['Alternativa A', 'Alternativa B']),
          question: area('question', 'Caixa de perguntas', 'Convide a comunidade a responder.', 3, 120),
          countdown: field('countdown', 'Evento ou prazo', 'Ex.: Mostra de projetos · sexta-feira', 'text', 100) + field('countdownDate', 'Data e hora', '', 'datetime-local'),
          mention: field('mention', 'Marcar perfil', '@nome-do-perfil', 'text', 48),
          location: field('location', 'Localização', 'Escola, cidade ou espaço cultural', 'text', 90),
        };
        const toolButtons = tools.map(([key, icon, label]) => '<button type="button" class="lm-story-tool' + (tool === key ? ' active' : '') + '" data-story-tool="' + e(key) + '" aria-pressed="' + String(tool === key) + '"><span>' + e(icon) + '</span>' + e(label) + '</button>').join('');
        const filterOptions: Array<[string, string]> = [['original', 'Original'], ['warm', 'Quente'], ['cool', 'Frio'], ['mono', 'P&B'], ['soft', 'Suave']];
        const filterButtons = filterOptions.map(([key, label]) => '<button type="button" class="lm-story-filter-option' + (interaction.storyFilter === key ? ' active' : '') + '" data-story-filter="' + e(key) + '" aria-pressed="' + String(interaction.storyFilter === key) + '"><span class="lm-story-filter-swatch ' + e(key) + '"></span>' + e(label) + '</button>').join('');
        return '<form class="lm-story-editor" data-story-composer aria-label="Criar novo story">'
          + '<header class="lm-story-editor-header"><button type="button" class="lm-story-editor-close" data-story-action="cancel" aria-label="Fechar editor">×</button><div><span>NOVA PUBLICAÇÃO</span><strong>Criar story</strong></div><button type="button" class="lm-story-editor-draft" data-story-action="compact">← Versão simples</button><button type="button" class="lm-story-editor-draft" data-story-action="draft">Salvar rascunho</button></header>'
          + '<label class="lm-story-editor-prompt"><span class="lm-story-editor-label">O QUE VOCÊ QUER COMPARTILHAR?</span><textarea name="body" data-story-field="body" rows="3" maxlength="360" placeholder="Escreva algo para acompanhar sua imagem."></textarea></label>'
          + '<div class="lm-story-editor-layout"><aside class="lm-story-tools" aria-label="Adicionais do story"><span class="lm-story-editor-label">ADICIONAIS</span>' + toolButtons + '</aside>'
          + '<section class="lm-story-editor-stage"><div class="lm-story-preview-toolbar"><div><span class="lm-story-editor-label">FORMATO</span><button type="button" class="' + (interaction.storyOrientation === 'portrait' ? 'active' : '') + '" data-story-orientation="portrait" aria-pressed="' + String(interaction.storyOrientation === 'portrait') + '">Vertical · 9:16</button><button type="button" class="' + (interaction.storyOrientation === 'landscape' ? 'active' : '') + '" data-story-orientation="landscape" aria-pressed="' + String(interaction.storyOrientation === 'landscape') + '">Horizontal · 16:9</button></div></div>'
          + '<div class="lm-story-preview lm-story-preview--' + e(interaction.storyOrientation) + '"><img data-story-preview-image class="lm-story-filter-' + e(interaction.storyFilter) + '" src="' + e(interaction.storyImage || profileCoverAsset) + '" alt="Prévia da foto do story"><div class="lm-story-preview-shade"></div><div class="lm-story-preview-content">'
          + '<div class="lm-story-preview-top"><span class="lm-story-preview-avatar">' + e(creatorInitial) + '</span><span>' + e(creatorName) + ' <small>agora</small></span><b>•••</b></div>'
          + '<div class="lm-story-preview-stickers"><div class="lm-story-preview-overlay-text lm-story-preview-text--classic" data-story-preview-text hidden></div>'
          + '<div class="lm-story-preview-sticker music" data-story-preview-music hidden></div><div class="lm-story-preview-sticker" data-story-preview-activity hidden></div><div class="lm-story-preview-sticker link" data-story-preview-link hidden></div>'
          + '<div class="lm-story-preview-sticker poll" data-story-preview-poll hidden><b data-story-preview-poll-question></b><span data-story-preview-poll-a></span><span data-story-preview-poll-b></span></div>'
          + '<div class="lm-story-preview-sticker poll" data-story-preview-quiz hidden><b data-story-preview-quiz-question></b><span data-story-preview-quiz-a></span><span data-story-preview-quiz-b></span></div>'
          + '<div class="lm-story-preview-sticker" data-story-preview-question hidden></div><div class="lm-story-preview-sticker" data-story-preview-countdown hidden></div><div class="lm-story-preview-sticker" data-story-preview-mention hidden></div><div class="lm-story-preview-sticker" data-story-preview-location hidden></div></div>'
          + '<div class="lm-story-preview-caption"><strong data-story-preview-title>Seu título aparece aqui</strong><span data-story-preview-caption>Adicione uma chamada para este story.</span></div></div></div>'
          + '<div class="lm-story-filter-tray"><span class="lm-story-editor-label">FILTROS</span>' + filterButtons + '</div>'
          + '<label class="lm-story-upload"><input type="file" accept="image/*" data-story-image-file><span>＋ Escolher foto</span><small data-story-image-name>Foto de demonstração · selecione uma imagem para substituir</small></label></section>'
          + '<aside class="lm-story-editor-panel"><div class="lm-story-editor-panel-heading"><span class="lm-story-editor-label">ADICIONAL SELECIONADO</span><strong>' + e(tools.find(item => item[0] === tool)?.[2] ?? 'Texto') + '</strong></div><div class="lm-story-tool-fields">' + (panels[tool] ?? panels.text) + '</div>'
          + '<footer class="lm-story-editor-footer"><small>Prévia e publicação permanecem nesta demonstração.</small>' + select('visibility', 'Público', ['Público', 'Seguidores', 'Somente eu', 'Privado']) + '<button type="submit">Compartilhar story <span>↗</span></button></footer></aside></div></form>';
      }
      private syncStoryComposerPreview(): void {
        const mount = this.querySelector<HTMLElement>('.lm-story-composer-mount');
        if (!mount || !this.state.interaction.storyComposerOpen) return;
        const value = (name: string): string => this.state.interaction.fields[this.storyFieldKey(name)] ?? '';
        const setText = (selector: string, text: string, visible = true): void => {
          const target = mount.querySelector<HTMLElement>(selector);
          if (!target) return;
          target.textContent = text;
          target.hidden = !visible;
        };
        setText('[data-story-preview-text]', value('overlayText'), Boolean(value('overlayText')));
        const textPreview = mount.querySelector<HTMLElement>('[data-story-preview-text]');
        if (textPreview) {
          const textStyle = value('textStyle').toLocaleLowerCase();
          textPreview.className = 'lm-story-preview-overlay-text lm-story-preview-text--' + (textStyle === 'destaque' ? 'highlight' : textStyle === 'contorno' ? 'outline' : 'classic');
        }
        setText('[data-story-preview-music]', '♫ ' + value('music'), Boolean(value('music') && value('music') !== 'Escolha uma faixa'));
        setText('[data-story-preview-activity]', '✦ ' + value('activity'), Boolean(value('activity') && value('activity') !== 'Escolha uma atividade'));
        setText('[data-story-preview-link]', '↗ ' + (value('linkLabel') || value('linkUrl')), Boolean(value('linkLabel') || value('linkUrl')));
        setText('[data-story-preview-poll-question]', value('pollQuestion'), Boolean(value('pollQuestion')));
        setText('[data-story-preview-poll-a]', value('pollOptionA'), Boolean(value('pollOptionA')));
        setText('[data-story-preview-poll-b]', value('pollOptionB'), Boolean(value('pollOptionB')));
        const poll = mount.querySelector<HTMLElement>('[data-story-preview-poll]');
        if (poll) poll.hidden = !Boolean(value('pollQuestion') || value('pollOptionA') || value('pollOptionB'));
        setText('[data-story-preview-quiz-question]', value('quizQuestion'), Boolean(value('quizQuestion')));
        setText('[data-story-preview-quiz-a]', value('quizOptionA'), Boolean(value('quizOptionA')));
        setText('[data-story-preview-quiz-b]', value('quizOptionB'), Boolean(value('quizOptionB')));
        const quiz = mount.querySelector<HTMLElement>('[data-story-preview-quiz]');
        if (quiz) quiz.hidden = !Boolean(value('quizQuestion') || value('quizOptionA') || value('quizOptionB'));
        setText('[data-story-preview-question]', '? ' + value('question'), Boolean(value('question')));
        setText('[data-story-preview-countdown]', '◷ ' + (value('countdown') || value('countdownDate')), Boolean(value('countdown') || value('countdownDate')));
        setText('[data-story-preview-mention]', '@ ' + value('mention'), Boolean(value('mention')));
        setText('[data-story-preview-location]', '⌖ ' + value('location'), Boolean(value('location')));
        const storyText = value('body');
        setText('[data-story-preview-title]', value('title') || storyText.slice(0, 48) || 'Seu título aparece aqui', true);
        setText('[data-story-preview-caption]', value('caption') || storyText || 'Adicione uma chamada para este story.', true);
      }
      private scheduleProjectReflection(): void {
        if (!isProfileProjectPart(this.state.id) || !this.querySelector('[data-project-builder]') || this.querySelector<HTMLElement>('[data-project-builder]')?.hidden) return;
        if (this.projectReflectionTimer !== undefined) window.clearTimeout(this.projectReflectionTimer);
        this.projectReflectionRevision += 1;
        this.projectReflectionTimer = window.setTimeout(() => {
          this.projectReflectionTimer = undefined;
          this.requestProjectReflection();
        }, 900);
      }
      private requestProjectReflection(): void {
        const form = this.querySelector<HTMLFormElement>('[data-project-create-form]');
        if (!form || !isProfileProjectPart(this.state.id)) return;
        const values = new FormData(form);
        const context: ProjectAssistantRequest['context'] = {
          title: String(values.get('projectTitle') ?? '').trim(),
          authors: String(values.get('projectAuthors') ?? '').trim(),
          goal: String(values.get('projectGoal') ?? '').trim(),
          justification: String(values.get('projectJustification') ?? '').trim(),
          summary: String(values.get('projectSummary') ?? '').trim(),
          audience: String(values.get('projectAudience') ?? '').trim(),
          competencies: values.getAll('projectCompetency').map(String),
          learningEvidence: String(values.get('projectLearningEvidence') ?? '').trim(),
          socialDraft: values.get('projectSocialDraft') === 'yes',
          milestones: this.state.interaction.projectMilestones.map(({ title, date }) => ({ title, date })),
        };
        const socialChoiceTouched = Object.hasOwn(this.state.interaction.toggles, 'project-social-draft');
        const hasProjectInformation = Boolean(context.title || context.goal || context.summary || context.competencies.length || context.milestones.length
          || context.audience !== 'Comunidade escolar' || socialChoiceTouched);
        if (!hasProjectInformation) {
          if (this.state.interaction.projectChatMessages.some(message => message.kind === 'reflection')) {
            this.transitionInteraction(interaction => ({ ...interaction, projectChatMessages: interaction.projectChatMessages.filter(message => message.kind !== 'reflection') }));
            this.render();
          }
          return;
        }
        const requestId = projectId();
        const conversation = this.state.interaction.projectChatMessages
          .filter(message => message.kind !== 'reflection' && !message.status && message.text.trim())
          .slice(-8)
          .map(message => ({ role: message.role === 'student' ? 'user' as const : 'assistant' as const, content: message.text }));
        const request: ProjectAssistantRequest = {
          requestId,
          partId: this.state.id as ProjectAssistantRequest['partId'],
          kind: 'reflection',
          prompt: 'Atualize sua compreensão do projeto a partir da ficha atual.',
          context,
          conversation,
        };
        const reflectionMessage: ProjectChatMessage = { id: requestId, kind: 'reflection', revision: this.projectReflectionRevision, role: 'assistant', text: '', status: 'pending' };
        this.transitionInteraction(interaction => ({
          ...interaction,
          projectChatMessages: [...interaction.projectChatMessages.filter(message => message.kind !== 'reflection'), reflectionMessage],
        }));
        this.render();
        this.dispatchEvent(new CustomEvent('lumira-project-assistant-request', { bubbles: true, composed: true, detail: request }));
      }
      private requestProjectReview(): void {
        const form = this.querySelector<HTMLFormElement>('[data-project-create-form]');
        if (!form || !isProfileProjectPart(this.state.id) || this.state.interaction.projectChatPending) return;
        const values = new FormData(form);
        const required: Array<{ name: string; step: number; label: string }> = [
          { name: 'projectTitle', step: 0, label: 'Dê um nome ao projeto.' },
          { name: 'projectAuthors', step: 0, label: 'Identifique quem está criando o projeto.' },
          { name: 'projectGoal', step: 1, label: 'Conte o que o grupo quer realizar.' },
          { name: 'projectJustification', step: 1, label: 'Explique por que esse projeto importa.' },
          { name: 'projectLearningEvidence', step: 2, label: 'Defina o que o grupo quer produzir ou demonstrar.' },
          { name: 'projectSummary', step: 2, label: 'Descreva como a ideia vai acontecer.' },
        ];
        const missing = required.find(field => !String(values.get(field.name) ?? '').trim());
        if (missing) {
          this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'project-wizard-step': String(missing.step) }, feedback: missing.label }));
          this.render();
          this.querySelector<HTMLInputElement | HTMLTextAreaElement>('[data-project-create-form] [name="' + missing.name + '"]')?.focus();
          return;
        }
        if (!values.getAll('projectCompetency').length) {
          this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'project-wizard-step': '2' }, feedback: 'Escolha pelo menos uma competência para orientar o projeto.' }));
          this.render();
          this.querySelector<HTMLInputElement>('[data-project-create-form] [name="projectCompetency"]')?.focus();
          return;
        }
        if (!this.state.interaction.projectMilestones.length) {
          this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'project-wizard-step': '3' }, feedback: 'Adicione ao menos um marco para organizar os próximos passos.' }));
          this.render();
          this.querySelector<HTMLInputElement>('[data-project-create-form] [name="projectMilestoneTitle"]')?.focus();
          return;
        }
        if (this.projectReflectionTimer !== undefined) window.clearTimeout(this.projectReflectionTimer);
        this.projectReflectionTimer = undefined;
        this.projectReflectionRevision += 1;
        const context: ProjectAssistantRequest['context'] = {
          title: String(values.get('projectTitle') ?? '').trim(),
          authors: String(values.get('projectAuthors') ?? '').trim(),
          goal: String(values.get('projectGoal') ?? '').trim(),
          justification: String(values.get('projectJustification') ?? '').trim(),
          summary: String(values.get('projectSummary') ?? '').trim(),
          audience: String(values.get('projectAudience') ?? '').trim(),
          competencies: values.getAll('projectCompetency').map(String),
          learningEvidence: String(values.get('projectLearningEvidence') ?? '').trim(),
          socialDraft: values.get('projectSocialDraft') === 'yes',
          milestones: this.state.interaction.projectMilestones.map(({ title, date }) => ({ title, date })),
        };
        const requestId = projectId();
        const prompt = 'Revise esta proposta antes da criação. Comente autoria, justificativa, coerência entre competências e evidências, viabilidade dos marcos e possíveis cuidados. Aponte ajustes concretos e termine perguntando se o grupo confirma ou quer revisar.';
        const conversation = this.state.interaction.projectChatMessages
          .filter(message => message.kind === 'conversation' && !message.status && message.text.trim())
          .slice(-8)
          .map(message => ({ role: message.role === 'student' ? 'user' as const : 'assistant' as const, content: message.text }));
        const request: ProjectAssistantRequest = {
          requestId, partId: this.state.id as ProjectAssistantRequest['partId'], kind: 'review', prompt, context, conversation,
        };
        const userMessage: ProjectChatMessage = { id: requestId + '-user', kind: 'conversation', role: 'student', text: 'Pedi uma revisão da proposta antes de confirmar.' };
        const assistantMessage: ProjectChatMessage = { id: requestId, kind: 'review', role: 'assistant', text: '', status: 'pending' };
        this.transitionInteraction(interaction => ({
          ...interaction,
          projectChatMessages: [...interaction.projectChatMessages.filter(message => message.kind !== 'reflection' && !(message.kind === 'review' && message.status === 'pending')), userMessage, assistantMessage],
          projectChatPending: true,
          projectReviewStatus: 'pending',
          projectReviewText: '',
          toggles: { ...interaction.toggles, 'project-review-confirmed': false },
          feedback: '',
        }));
        this.render();
        this.dispatchEvent(new CustomEvent('lumira-project-assistant-request', { bubbles: true, composed: true, detail: request }));
      }
      private onClick(event: Event): void {
        if (!(event.target instanceof Element)) return;
        const activityEditorButton = event.target.closest<HTMLButtonElement>('[data-activity-step-index], [data-activity-add-question], [data-activity-remove-question], [data-activity-nav], [data-activity-approve]');
        if (this.state.id === 'pedagogy-activity-builder' && activityEditorButton && this.handleActivityEditorClick(activityEditorButton)) return;
        if (this.state.id === 'pedagogy-context' && !event.target.closest('[data-subject-skill-picker]') && this.state.interaction.subjectSkillMenuOpen) {
          this.transitionInteraction(interaction => ({ ...interaction, subjectSkillMenuOpen: false }));
          this.restoreSubjectFoundation();
        }
        const subjectToggle = event.target.closest<HTMLButtonElement>('[data-subject-foundation-toggle]');
        if (subjectToggle && this.state.id === 'pedagogy-context') {
          const opening = this.state.interaction.groups['subject-foundation-open'] !== 'yes';
          const startingFreshDraft = opening && this.state.interaction.groups['subject-foundation-draft-started'] !== 'yes';
          const foundationKeys = ['subject-name', 'subject-nature', 'subject-understanding', 'subject-approach', 'subject-aspects']
            .map(name => 'pedagogy-context:' + name);
          this.transitionInteraction(interaction => ({
            ...interaction,
            groups: { ...interaction.groups, 'subject-foundation-open': opening ? 'yes' : '', ...(opening ? { 'subject-foundation-draft-started': 'yes' } : {}) },
            ...(startingFreshDraft ? { fields: Object.fromEntries(Object.entries(interaction.fields).filter(([key]) => !foundationKeys.includes(key))) } : {}),
            ...(startingFreshDraft ? { subjectSkills: [], subjectSkillQuery: '', subjectSkillMenuOpen: false, subjectSkillActiveIndex: 0 } : {}),
            feedback: '',
          }));
          this.render();
          if (opening) this.querySelector<HTMLInputElement>('[data-subject-foundation-form] [name="subjectName"]')?.focus();
          else subjectToggle.focus();
          return;
        }
        const subjectCancel = event.target.closest<HTMLButtonElement>('[data-subject-foundation-cancel]');
        if (subjectCancel && this.state.id === 'pedagogy-context') {
          this.transitionInteraction(interaction => ({
            ...interaction,
            groups: { ...interaction.groups, 'subject-foundation-open': '', 'subject-foundation-draft-started': '' },
            subjectSkills: [], subjectSkillQuery: '', subjectSkillMenuOpen: false, subjectSkillActiveIndex: 0,
            feedback: '',
          }));
          this.render();
          this.querySelector<HTMLButtonElement>('[data-subject-foundation-toggle]')?.focus();
          return;
        }
        const skillOption = event.target.closest<HTMLButtonElement>('[data-subject-skill-index]');
        if (skillOption && this.state.id === 'pedagogy-context') {
          const suggestion = this.subjectSkillSuggestions(this.state.interaction.subjectSkillQuery)[Number(skillOption.dataset.subjectSkillIndex ?? '0')];
          if (suggestion) this.addSubjectSkill(suggestion.name);
          return;
        }
        const skillRemove = event.target.closest<HTMLButtonElement>('[data-subject-skill-remove]');
        if (skillRemove && this.state.id === 'pedagogy-context') {
          const index = Number(skillRemove.dataset.subjectSkillRemove);
          this.transitionInteraction(interaction => ({
            ...interaction,
            subjectSkills: (interaction.subjectSkills ?? []).filter((_, skillIndex) => skillIndex !== index),
          }));
          this.restoreSubjectFoundation();
          this.querySelector<HTMLInputElement>('[data-subject-skill-input]')?.focus();
          return;
        }
        const checkbox = event.target.closest<HTMLInputElement>('input[type="checkbox"], input[type="radio"]');
        if (checkbox && this.contains(checkbox)) {
          const key = checkbox.dataset.interactionToggle;
          if (key) {
            const editingProject = isProfileProjectPart(this.state.id) && Boolean(checkbox.closest('[data-project-create-form]'));
            const feedback = editingProject ? 'Preferência do projeto atualizada.' : this.state.id === 'pedagogy-activity-builder'
              ? 'Conferência do rascunho atualizada.'
              : this.state.id === 'pedagogy-competency'
                ? 'Critério de observação atualizado.'
                : this.state.id === 'pedagogy-material-share'
                  ? 'Seleção de publicação atualizada.'
                  : this.state.id === 'leveling-confirmation'
                    ? 'Conferência do convite atualizada.'
                  : 'Preferência atualizada nesta demonstração.';
            this.transitionInteraction(interaction => ({
              ...(editingProject ? staleProjectReview(interaction) : interaction),
              toggles: { ...interaction.toggles, [key]: checkbox.checked, ...(editingProject ? { 'project-review-confirmed': false } : {}) },
              feedback,
            }));
            this.render();
            if (editingProject) this.scheduleProjectReflection();
          }
          return;
        }
        const button = event.target.closest<HTMLButtonElement>('button');
        if (!button || button.disabled || !this.contains(button)) return;
        if (button.type === 'submit') return;
        if (this.state.id === 'community-feed' && button.hasAttribute('data-opinion-circle-select')) {
          const circleId = button.dataset.opinionCircleSelect ?? '';
          this.transitionInteraction(interaction => ({
            ...interaction,
            groups: { ...interaction.groups, 'community-opinion-circle': circleId },
          }));
          this.render();
          return;
        }
        if (isProfileProjectPart(this.state.id) && button.hasAttribute('data-project-expand')) {
          const requested = button.dataset.projectExpand ?? '';
          const expandedId = this.state.interaction.groups['project-expanded-id'] === requested ? '' : requested;
          this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'project-expanded-id': expandedId } }));
          this.render();
          this.querySelector<HTMLButtonElement>('[data-project-expand="' + requested + '"]')?.focus();
          return;
        }
        if (isProfileProjectPart(this.state.id) && (button.hasAttribute('data-project-wizard-step-select') || button.hasAttribute('data-project-step-next') || button.hasAttribute('data-project-step-previous'))) {
          const current = Number(this.state.interaction.groups['project-wizard-step'] ?? '0');
          const selected = button.dataset.projectWizardStepSelect;
          const next = selected !== undefined ? Number(selected)
            : button.hasAttribute('data-project-step-next') ? Math.min(3, current + 1) : Math.max(0, current - 1);
          if (button.hasAttribute('data-project-step-next')) {
            const form = this.querySelector<HTMLFormElement>('[data-project-create-form]');
            const values = form ? new FormData(form) : null;
            const fieldsByStep: Record<number, Array<{ name: string; label: string }>> = {
              0: [{ name: 'projectTitle', label: 'Dê um nome ao projeto.' }, { name: 'projectAuthors', label: 'Identifique quem está criando o projeto.' }],
              1: [{ name: 'projectGoal', label: 'Conte o que o grupo quer realizar.' }, { name: 'projectJustification', label: 'Explique por que esse projeto importa.' }],
              2: [{ name: 'projectLearningEvidence', label: 'Defina o que o grupo quer produzir ou demonstrar.' }, { name: 'projectSummary', label: 'Descreva como a ideia vai acontecer.' }],
            };
            const missing = (fieldsByStep[current] ?? []).find(field => !String(values?.get(field.name) ?? '').trim());
            if (missing) {
              this.transitionInteraction(interaction => ({ ...interaction, feedback: missing.label }));
              this.render();
              this.querySelector<HTMLInputElement | HTMLTextAreaElement>('[data-project-create-form] [name="' + missing.name + '"]')?.focus();
              return;
            }
            if (current === 2 && !values?.getAll('projectCompetency').length) {
              this.transitionInteraction(interaction => ({ ...interaction, feedback: 'Escolha pelo menos uma competência para orientar o projeto.' }));
              this.render();
              this.querySelector<HTMLInputElement>('[data-project-create-form] [name="projectCompetency"]')?.focus();
              return;
            }
          }
          this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'project-wizard-step': String(next) }, feedback: '' }));
          this.render();
          this.querySelector<HTMLButtonElement>('[data-project-wizard-step-select="' + next + '"]')?.focus();
          return;
        }
        if (isProfileProjectPart(this.state.id) && (button.hasAttribute('data-project-review') || button.hasAttribute('data-project-review-retry'))) {
          this.requestProjectReview();
          return;
        }
        if (isProfileProjectPart(this.state.id) && button.hasAttribute('data-project-review-edit')) {
          this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'project-wizard-step': '0' }, feedback: '' }));
          this.render();
          this.querySelector<HTMLInputElement>('[data-project-create-form] [name="projectTitle"]')?.focus();
          return;
        }
        if (isProfileProjectPart(this.state.id) && button.hasAttribute('data-project-review-confirm')) {
          if (this.state.interaction.projectReviewStatus !== 'ready') return;
          this.transitionInteraction(interaction => ({ ...interaction, toggles: { ...interaction.toggles, 'project-review-confirmed': true }, feedback: '' }));
          this.render();
          this.querySelector<HTMLFormElement>('[data-project-create-form]')?.requestSubmit();
          return;
        }
        if (this.state.id === 'student-skills' && (button.hasAttribute('data-student-progress-open') || button.hasAttribute('data-student-progress-close'))) {
          const open = button.hasAttribute('data-student-progress-open');
          this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'student-progress-dashboard-open': open ? 'yes' : '' } }));
          this.render();
          this.querySelector<HTMLButtonElement>(open ? '[data-student-progress-close]' : '[data-student-progress-open]')?.focus();
          return;
        }
        if (button.dataset.calendarStep) {
          const delta = Number(button.dataset.calendarStep);
          const current = Number(this.state.interaction.groups['calendar-month-offset'] ?? '0');
          this.transitionInteraction(interaction => ({
            ...interaction,
            groups: { ...interaction.groups, 'calendar-month-offset': String((Number.isFinite(current) ? current : 0) + (delta < 0 ? -1 : 1)) },
            fields: { ...interaction.fields, 'calendar-feedback': '' },
          }));
          this.render();
          return;
        }
        if (button.hasAttribute('data-calendar-today')) {
          this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'calendar-month-offset': '0' }, fields: { ...interaction.fields, 'calendar-feedback': 'Calendário voltou a outubro de 2026.' } }));
          this.render();
          return;
        }
        if (button.dataset.calendarView) {
          const view = button.dataset.calendarView === 'week' ? 'Semana' : button.dataset.calendarView === 'agenda' ? 'Agenda' : 'Mês';
          this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'community-calendar:calendar-view': view }, fields: { ...interaction.fields, 'calendar-feedback': 'Visualização: ' + view.toLocaleLowerCase() + '.' } }));
          this.render();
          return;
        }
        if (button.dataset.calendarAction) {
          if (button.dataset.calendarAction === 'notifications') {
            const open = this.state.interaction.groups['calendar-notifications-open'] !== 'yes';
            this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'calendar-notifications-open': open ? 'yes' : '' } }));
            this.render();
            return;
          }
          const open = button.dataset.calendarAction === 'create';
          this.transitionInteraction(interaction => ({
            ...interaction,
            toggles: { ...interaction.toggles, 'calendar-event-open': open },
            fields: { ...interaction.fields, 'calendar-feedback': open ? '' : 'Criação de evento cancelada.' },
          }));
          this.render();
          if (open) this.querySelector<HTMLInputElement>('[data-calendar-event-form] [name="eventTitle"]')?.focus();
          return;
        }
        if (button.dataset.calendarEvent) {
          this.transitionInteraction(interaction => ({ ...interaction, fields: { ...interaction.fields, 'calendar-feedback': 'Evento selecionado: ' + button.dataset.calendarEvent + '.' } }));
          this.render();
          return;
        }
        if (button.dataset.workspaceMenuToggle) {
          const requested = button.dataset.workspaceMenuToggle;
          const openMenu = this.state.interaction.groups['workspace-menu'] === requested ? '' : requested;
          this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'workspace-menu': openMenu }, feedback: '' }));
          this.render();
          return;
        }
        if (button.hasAttribute('data-notification-read')) {
          this.transitionInteraction(interaction => ({ ...interaction, toggles: { ...interaction.toggles, 'notifications-read': true }, feedback: 'Notificações marcadas como lidas nesta demonstração.' }));
          this.render();
          return;
        }
        if (button.dataset.profileActivityFilter && this.state.id === 'teacher-activity') {
          const filter = button.dataset.profileActivityFilter;
          this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'teacher-activity-filter': filter }, feedback: '' }));
          this.render();
          return;
        }
        if (isProfileProjectPart(this.state.id) && button.hasAttribute('data-project-create')) {
          this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'project-wizard-step': '0' }, toggles: { ...interaction.toggles, 'profile-project-builder-open': true }, feedback: '' }));
          this.render();
          this.dispatchEvent(new CustomEvent('lumira-project-assistant-status-request', { bubbles: true, composed: true, detail: { partId: this.state.id } }));
          this.scheduleProjectReflection();
          this.querySelector<HTMLInputElement>('[data-project-create-form] [name="projectTitle"]')?.focus();
          return;
        }
        if (isProfileProjectPart(this.state.id) && button.hasAttribute('data-project-cancel')) {
          if (this.projectReflectionTimer !== undefined) window.clearTimeout(this.projectReflectionTimer);
          this.projectReflectionTimer = undefined;
          this.projectReflectionRevision += 1;
          this.transitionInteraction(interaction => ({
            ...interaction,
            toggles: { ...interaction.toggles, 'profile-project-builder-open': false },
            projectChatMessages: interaction.projectChatMessages.filter(message => message.kind !== 'reflection'),
            feedback: '',
          }));
          this.render();
          this.querySelector<HTMLButtonElement>('[data-project-create]')?.focus();
          return;
        }
        if (isProfileProjectPart(this.state.id) && button.dataset.projectCalendarStep) {
          const current = this.state.interaction.groups['project-calendar-month'] ?? '2026-10';
          const [year, month] = current.split('-').map(Number);
          const next = new Date(year, month - 1 + Number(button.dataset.projectCalendarStep), 1);
          const monthKey = next.getFullYear() + '-' + String(next.getMonth() + 1).padStart(2, '0');
          this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'project-calendar-month': monthKey } }));
          this.render();
          return;
        }
        if (isProfileProjectPart(this.state.id) && button.dataset.projectCalendarDate) {
          const date = button.dataset.projectCalendarDate;
          const fieldKey = this.state.id + ':projectMilestoneDate';
          this.transitionInteraction(interaction => ({ ...staleProjectReview(interaction), fields: { ...interaction.fields, [fieldKey]: date } }));
          this.render();
          this.scheduleProjectReflection();
          return;
        }
        if (isProfileProjectPart(this.state.id) && button.dataset.projectMilestoneRemove) {
          const milestoneId = button.dataset.projectMilestoneRemove;
          this.transitionInteraction(interaction => ({ ...staleProjectReview(interaction), projectMilestones: interaction.projectMilestones.filter(item => item.id !== milestoneId), feedback: 'Marco removido do calendário do projeto.' }));
          this.render();
          this.scheduleProjectReflection();
          return;
        }
        if (isProfileProjectPart(this.state.id) && button.hasAttribute('data-project-milestone-add')) {
          const titleField = this.querySelector<HTMLInputElement>('[data-project-create-form] [name="projectMilestoneTitle"]');
          const dateField = this.querySelector<HTMLInputElement>('[data-project-create-form] [name="projectMilestoneDate"]');
          const title = titleField?.value.trim() ?? '';
          const date = dateField?.value.trim() ?? '';
          if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            this.transitionInteraction(interaction => ({ ...interaction, feedback: 'Informe o nome do marco e escolha uma data no calendário.' }));
            this.render();
            this.querySelector<HTMLInputElement>('[data-project-create-form] [name="projectMilestoneTitle"]')?.focus();
            return;
          }
          const milestone: ProfileProjectMilestone = { id: projectId(), title, date };
          const monthKey = date.slice(0, 7);
          const fieldKey = this.state.id + ':projectMilestoneTitle';
          this.transitionInteraction(interaction => ({
            ...staleProjectReview(interaction),
            projectMilestones: [...interaction.projectMilestones, milestone],
            groups: { ...interaction.groups, 'project-calendar-month': monthKey },
            fields: { ...interaction.fields, [fieldKey]: '' },
            feedback: 'Marco “' + title + '” adicionado ao calendário do projeto.',
          }));
          this.render();
          this.scheduleProjectReflection();
          this.querySelector<HTMLInputElement>('[data-project-create-form] [name="projectMilestoneTitle"]')?.focus();
          return;
        }
        if (button.hasAttribute('data-profile-activity-create') && this.state.id === 'teacher-activity') {
          this.transitionInteraction(interaction => ({ ...interaction, toggles: { ...interaction.toggles, 'profile-activity-composer-open': true }, feedback: '' }));
          this.render();
          this.querySelector<HTMLInputElement>('[data-profile-activity-composer] [name="activityTitle"]')?.focus();
          return;
        }
        if (button.hasAttribute('data-profile-activity-cancel') && this.state.id === 'teacher-activity') {
          this.transitionInteraction(interaction => ({ ...interaction, toggles: { ...interaction.toggles, 'profile-activity-composer-open': false }, feedback: '' }));
          this.render();
          this.querySelector<HTMLButtonElement>('[data-profile-activity-create]')?.focus();
          return;
        }
        if (isProfileAgendaPart(this.state.id) && button.hasAttribute('data-profile-agenda-create')) {
          this.transitionInteraction(interaction => ({
            ...interaction,
            toggles: { ...interaction.toggles, [this.state.id + ':composer-open']: true, [this.state.id + ':element-picker-open']: false },
            fields: { ...interaction.fields, [this.state.id + ':feedback']: '' },
          }));
          this.render();
          this.querySelector<HTMLInputElement>('[data-profile-agenda-composer] [name="agendaTitle"]')?.focus();
          return;
        }
        if (isProfileAgendaPart(this.state.id) && button.hasAttribute('data-profile-agenda-cancel')) {
          const prefix = this.state.id + ':';
          const draftFields = new Set(['title', 'date', 'time', 'detail', 'elementId'].map(name => prefix + name));
          this.transitionInteraction(interaction => ({
            ...interaction,
            toggles: { ...interaction.toggles, [this.state.id + ':composer-open']: false, [this.state.id + ':element-picker-open']: false },
            fields: Object.fromEntries(Object.entries(interaction.fields).filter(([key]) => !draftFields.has(key))),
          }));
          this.render();
          this.querySelector<HTMLButtonElement>('[data-profile-agenda-create]')?.focus();
          return;
        }
        if (isProfileAgendaPart(this.state.id) && button.hasAttribute('data-profile-agenda-element-toggle')) {
          const key = this.state.id + ':element-picker-open';
          const open = this.state.interaction.toggles[key] !== true;
          this.transitionInteraction(interaction => ({ ...interaction, toggles: { ...interaction.toggles, [key]: open } }));
          this.render();
          if (open) this.querySelector<HTMLSelectElement>('[data-profile-agenda-element-picker] select')?.focus();
          return;
        }
        if (isProfileAgendaPart(this.state.id) && button.dataset.profileAgendaShare) {
          const visibility = this.state.interaction.fields[this.state.id + ':visibility'] ?? 'private';
          if (visibility === 'private') return;
          const id = button.dataset.profileAgendaShare;
          if (this.state.interaction.profileAgendaPosts.some(post => post.id === id)) return;
          const post: ProfileAgendaPost = {
            id,
            title: button.dataset.agendaTitle ?? 'Compromisso',
            detail: button.dataset.agendaDetail ?? '',
            date: button.dataset.agendaDate ?? '',
            time: button.dataset.agendaTime ?? '',
            elementId: button.dataset.agendaElementId ?? '',
            visibility: visibility === 'community' ? 'community' : 'school',
            publishedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          };
          this.transitionInteraction(interaction => ({
            ...interaction,
            profileAgendaPosts: [...interaction.profileAgendaPosts, post],
            fields: { ...interaction.fields, [this.state.id + ':feedback']: '“' + post.title + '” virou uma postagem local para ' + (post.visibility === 'school' ? 'minha escola.' : 'a comunidade Lumira.') },
          }));
          this.render();
          this.querySelector<HTMLElement>('[data-profile-agenda-published-list] .lm-agenda-post:last-child')?.scrollIntoView({ block: 'nearest' });
          return;
        }
        // Deixe a navegação entre telas chegar ao Componenting Demo Lab, que
        // controla a montagem da página e a URL selecionada.
        if (button.hasAttribute('data-screen-select') || button.hasAttribute('data-component-select')) {
          const groupKey = button.dataset.interactionGroup;
          const selectedValue = button.dataset.interactionValue;
          const navigation = button.closest<HTMLElement>('.lm-side-nav, .lm-profile-tabs, .lm-community-tabs');
          if (groupKey && selectedValue !== undefined && navigation) {
            this.transitionInteraction(interaction => ({
              ...interaction,
              groups: { ...interaction.groups, [groupKey]: selectedValue },
            }));
            navigation.querySelectorAll<HTMLButtonElement>('button[data-interaction-value]').forEach(item => {
              const active = item.dataset.interactionGroup === groupKey && item.dataset.interactionValue === selectedValue;
              item.classList.toggle('active', active);
              item.classList.toggle('selected', active);
              item.classList.toggle('is-interaction-active', active);
              item.setAttribute('aria-pressed', String(active));
            });
          }
          return;
        }
        if (button.hasAttribute('data-profile-edit-primary')) {
          if (this.state.id !== 'teacher-hero' && this.state.id !== 'student-hero') {
            const page = this.closest<HTMLElement>('.lm-product-page');
            const hero = page?.querySelector<HTMLElement>('[data-component-id="teacher-hero"], [data-component-id="student-hero"]');
            hero?.dispatchEvent(new CustomEvent('profile-edit-command', { bubbles: true, detail: {} }));
          } else if (this.state.interaction.groups['profile-editor-open'] === 'yes') this.closeProfileEditor();
          else this.openProfileEditor();
          return;
        }
        if (button.hasAttribute('data-profile-edit') || button.hasAttribute('data-profile-field-focus')) {
          const field = button.dataset.profileFocusField ?? button.dataset.profileFieldFocus;
          if (this.state.id === 'teacher-hero' || this.state.id === 'student-hero') this.openProfileEditor(field);
          else {
            const page = this.closest<HTMLElement>('.lm-product-page');
            const hero = page?.querySelector<HTMLElement>('[data-component-id="teacher-hero"], [data-component-id="student-hero"]');
            hero?.dispatchEvent(new CustomEvent('profile-edit-command', { bubbles: true, detail: { field } }));
          }
          return;
        }
        if (button.hasAttribute('data-profile-close')) {
          this.closeProfileEditor();
          return;
        }
        if (button.dataset.questFilter) {
          const filter = button.dataset.questFilter;
          const fixtures = labList<QuestFixture>(this.state.fixture, 'quests');
          const records = new Map(this.state.interaction.questParticipations.map(record => [record.questId, record]));
          const cards = [...this.querySelectorAll<HTMLButtonElement>('[data-quest-select]')];
          const statusFor = (id: string): string => {
            const quest = fixtures.find(item => item.id === id);
            const record = records.get(id);
            if (record?.status === 'completed') return 'completed';
            if (record?.status === 'in-progress') return 'registered';
            if (record) return 'registered';
            return quest && questRegistrationOpen(quest) ? 'available' : 'closed';
          };
          const visibleCards = cards.filter(card => filter === 'all'
            || filter === 'registered' && statusFor(card.dataset.questSelect ?? '') === 'registered'
            || filter === 'available' && statusFor(card.dataset.questSelect ?? '') === 'available'
            || filter === 'completed' && statusFor(card.dataset.questSelect ?? '') === 'completed');
          const currentSelection = this.state.interaction.groups['quest-selected'] ?? cards[0]?.dataset.questSelect ?? '';
          const nextSelection = visibleCards.some(card => card.dataset.questSelect === currentSelection)
            ? currentSelection : visibleCards[0]?.dataset.questSelect ?? '';
          this.transitionInteraction(interaction => ({
            ...interaction,
            groups: { ...interaction.groups, 'quest-filter': filter, 'quest-selected': nextSelection },
            questFeedback: filter === 'all' ? 'Mostrando todas as competições.' : filter === 'available' ? 'Mostrando competições com inscrição aberta.' : filter === 'registered' ? 'Mostrando suas inscrições e participações.' : 'Mostrando participações concluídas.',
          }));
          this.render();
          return;
        }
        if (button.dataset.questSelect) {
          this.transitionInteraction(interaction => ({
            ...interaction,
            groups: { ...interaction.groups, 'quest-selected': button.dataset.questSelect ?? '', 'quest-filter': 'all' },
            questFeedback: '',
          }));
          this.render();
          return;
        }
        if (button.dataset.questAction === 'register') {
          const questId = button.dataset.questId ?? '';
          const quest = labList<QuestFixture>(this.state.fixture, 'quests').find(item => item.id === questId);
          const existing = this.state.interaction.questParticipations.find(record => record.questId === questId);
          if (!quest || existing || !questRegistrationOpen(quest)) {
            this.transitionInteraction(interaction => ({ ...interaction, questFeedback: existing ? 'Sua inscrição já está registrada. Acompanhe as etapas e o histórico neste evento.' : 'As inscrições para esta competição estão encerradas ou sem vagas.' }));
            this.render();
            return;
          }
          const registeredAt = new Date().toISOString();
          const registration: QuestParticipation = {
            questId,
            registrationId: 'LUM-' + questId.toLocaleUpperCase().replace(/[^A-Z0-9]+/g, '-') + '-' + projectId().slice(-5).toLocaleUpperCase(),
            registeredAt,
            status: 'registered',
            stageSubmissions: {},
            history: [{ action: 'Inscrição confirmada', at: registeredAt, detail: 'Participante: ' + labText(this.state.fixture, 'name', 'Caio Almeida') + '. Formato: ' + quest.format + '.' }],
          };
          this.transitionInteraction(interaction => ({
            ...interaction,
            groups: { ...interaction.groups, 'quest-selected': questId, 'quest-filter': 'all' },
            questParticipations: [...interaction.questParticipations, registration],
            questFeedback: 'Inscrição confirmada. O código ' + registration.registrationId + ' identifica sua participação; registre cada etapa para manter o histórico.',
          }));
          this.render();
          return;
        }
        if (button.dataset.questionSelect !== undefined) {
          this.transitionInteraction(interaction => ({
            ...interaction,
            groups: { ...interaction.groups, 'competency-question-index': button.dataset.questionSelect ?? '0' },
            questionFeedback: '',
          }));
          this.render();
          return;
        }
        if (button.dataset.questionNav) {
          const questionCount = this.querySelectorAll('[data-competency-question-form]').length;
          const current = Number(this.state.interaction.groups['competency-question-index'] ?? '0');
          const next = Math.max(0, Math.min(questionCount - 1, current + (button.dataset.questionNav === 'next' ? 1 : -1)));
          this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'competency-question-index': String(next) }, questionFeedback: '' }));
          this.render();
          return;
        }
        if (button.dataset.questionDraft !== undefined) {
          const index = Number(button.dataset.questionDraft);
          const form = this.querySelector<HTMLFormElement>('[data-competency-question-form][data-question-index="' + index + '"]');
          const questionId = form?.dataset.questionId ?? '';
          const textarea = form?.querySelector<HTMLTextAreaElement>('textarea[data-interaction-field]');
          const key = textarea?.dataset.interactionField ?? '';
          const answer = textarea?.value ?? '';
          this.transitionInteraction(interaction => ({
            ...interaction,
            fields: key ? { ...interaction.fields, [key]: answer } : interaction.fields,
            questionFeedback: answer.trim() ? 'Rascunho da questão ' + (index + 1) + ' guardado nesta tela.' : 'Escreva uma ideia antes de guardar o rascunho.',
          }));
          this.render();
          return;
        }
        if (button.dataset.aiGenerate) {
          if (button.dataset.aiGenerate === 'sequence' && this.state.id === 'pedagogy-course-sequence') {
            const values: Record<string, string> = {};
            [
              ['Texto-base e relação de potência', 'Identifique o que potência descreve e relacione a quantidade de aparelhos ao tempo em que são usados.'],
              ['Hipótese inicial', 'Compare a intuição de que um aparelho mais potente sempre consome mais com o caso de vários aparelhos ligados por mais tempo.'],
              ['Representação dos dados', 'Organize quantidade, potência e duração em uma tabela e explique quais dados precisa combinar para comparar os usos.'],
              ['Mudança de condição', 'Altere o tempo do ventilador de oito para quatro horas, mantenha as outras condições e refaça sua interpretação.'],
              ['Aplicação independente', 'Escolha outra situação da escola, indique que dados seriam necessários e justifique uma proposta de economia.'],
            ].forEach(([title, body], index) => { values['stage-title-' + index] = title; values['stage-body-' + index] = body; });
            this.fillMockAiFields(values);
            this.transitionInteraction(interaction => ({ ...interaction, aiGenerated: { ...interaction.aiGenerated, sequence: true }, feedback: 'Sequência preenchida com etapas editáveis · demonstração local.' }));
          }
          this.render();
          return;
        }
        if (button.dataset.reviewAction) {
          let reviewFeedback = '';
          if (this.state.id === 'pedagogy-evidence-review') {
            reviewFeedback = button.dataset.reviewAction === 'accept'
              ? 'Revisão demonstrativa confirmada. O registro não atualiza o estado da competência.'
              : 'Nova leitura demonstrativa solicitada. A resposta e a atribuição original continuam visíveis.';
          }
          this.transitionInteraction(interaction => ({ ...interaction, reviewFeedback }));
          this.render();
          return;
        }
        if (button.dataset.shareAction === 'publish' && this.state.id === 'pedagogy-material-share') {
          const audience = this.querySelector<HTMLSelectElement>('[name="audience"]')?.value ?? 'Minha turma';
          this.transitionInteraction(interaction => ({
            ...interaction,
            shareFeedback: 'Material de demonstração preparado para ' + audience + '. Respostas e pareceres privados foram excluídos.',
          }));
          this.render();
          return;
        }
        if (button.hasAttribute('data-student-draft') && this.state.id === 'learner-response') {
          const response = this.querySelector<HTMLTextAreaElement>('[name="response"]')?.value ?? '';
          const key = this.querySelector<HTMLTextAreaElement>('[name="response"]')?.dataset.interactionField ?? '';
          this.transitionInteraction(interaction => ({
            ...interaction,
            fields: key ? { ...interaction.fields, [key]: response } : interaction.fields,
            responseFeedback: response.trim() ? 'Rascunho guardado nesta tela de demonstração.' : 'Escreva sua ideia para guardar um rascunho.',
          }));
          this.render();
          return;
        }
        if (button.dataset.storyTool) {
          this.transitionInteraction(interaction => ({ ...interaction, storyComposerTool: button.dataset.storyTool ?? 'text', feedback: '' }));
          this.render();
          return;
        }
        if (button.dataset.storyQuickFeature) {
          const feature = button.dataset.storyQuickFeature;
          this.transitionInteraction(interaction => ({ ...interaction, storyComposerOpen: true, storyComposerExpanded: true, storyComposerTool: feature, feedback: '' }));
          this.render();
          this.querySelector<HTMLButtonElement>('[data-story-composer] [data-story-action="compact"]')?.focus();
          return;
        }
        if (button.dataset.storyOrientation) {
          this.transitionInteraction(interaction => ({ ...interaction, storyOrientation: button.dataset.storyOrientation === 'landscape' ? 'landscape' : 'portrait', feedback: '' }));
          this.render();
          return;
        }
        if (button.dataset.storyFilter) {
          this.transitionInteraction(interaction => ({ ...interaction, storyFilter: button.dataset.storyFilter ?? 'original', feedback: '' }));
          this.render();
          return;
        }
        if (button.hasAttribute('data-story-create')) {
          this.transitionInteraction(interaction => ({ ...interaction, storyComposerOpen: true, storyComposerExpanded: false, feedback: '' }));
          this.render();
          this.querySelector<HTMLTextAreaElement>('[data-story-composer] [data-story-field="body"]')?.focus();
          return;
        }
        if (button.dataset.storyQuestionOption !== undefined) {
          const selected = String(this.state.interaction.selectedStory ?? 0);
          const answer = Number(button.dataset.storyQuestionOption);
          if (!Number.isInteger(answer) || answer < 0) return;
          this.transitionInteraction(interaction => ({
            ...interaction,
            storyAnswers: { ...(interaction.storyAnswers ?? {}), [selected]: answer },
          }));
          this.render();
          return;
        }
        const storyAction = button.dataset.storyAction;
        if (storyAction) {
          const selected = this.state.interaction.selectedStory ?? 0;
          const storyCount = this.querySelectorAll('.lm-story-card:not(.lm-new-story):not(.lm-story-next)').length;
          if (storyAction === 'previous' || storyAction === 'next') {
            const nextIndex = Math.max(0, Math.min(storyCount - 1, selected + (storyAction === 'next' ? 1 : -1)));
            this.transitionInteraction(interaction => ({ ...interaction, selectedStory: nextIndex, feedback: 'Story ' + (nextIndex + 1) + ' de ' + storyCount + '.' }));
          } else if (storyAction === 'like' || storyAction === 'save') {
            const key = 'story-' + storyAction + ':' + selected;
            this.transitionInteraction(interaction => {
              const active = !(interaction.toggles[key] ?? false);
              return {
                ...interaction,
                toggles: { ...interaction.toggles, [key]: active },
                feedback: storyAction === 'like' ? (active ? 'Curtida registrada neste story.' : 'Curtida removida deste story.') : (active ? 'Story salvo nesta demonstração.' : 'Story removido dos salvos.'),
              };
            });
          } else if (storyAction === 'compact') {
            this.transitionInteraction(interaction => ({ ...interaction, storyComposerExpanded: false, feedback: '' }));
            this.render();
            this.querySelector<HTMLButtonElement>('[data-story-composer] [data-story-quick-feature="image"]')?.focus();
            return;
          } else if (storyAction === 'cancel') {
            this.transitionInteraction(interaction => ({ ...interaction, storyComposerOpen: false, storyComposerExpanded: false, feedback: 'Editor fechado; rascunho mantido nesta demonstração.' }));
          } else if (storyAction === 'draft') {
            this.transitionInteraction(interaction => ({ ...interaction, storyComposerOpen: false, storyComposerExpanded: false, feedback: 'Rascunho salvo nesta demonstração local.' }));
          } else if (storyAction === 'clear-photo') {
            this.transitionInteraction(interaction => ({ ...interaction, storyImage: '', feedback: 'Foto removida; a imagem de demonstração voltou.' }));
          }
          this.render();
          return;
        }
        if (button.dataset.storyIndex !== undefined) {
          const selected = Number(button.dataset.storyIndex);
          this.transitionInteraction(interaction => ({ ...interaction, selectedStory: selected, feedback: '' }));
          this.render();
          return;
        }
        const group = button.dataset.interactionGroup;
        if (group !== undefined && button.dataset.interactionValue !== undefined) {
          const value = button.dataset.interactionValue;
          const label = button.textContent?.trim() || 'Opção';
          this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, [group]: value }, feedback: label + ' selecionado.' }));
          this.render();
          return;
        }
        const kind = button.dataset.interactionKind;
        if (kind === 'story-next') {
          const key = button.dataset.interactionKey ?? '';
          this.transitionInteraction(interaction => ({ ...interaction, actions: { ...interaction.actions, [key]: (interaction.actions[key] ?? 0) + 1 }, feedback: 'Mais stories disponíveis na faixa.' }));
          this.render();
          this.querySelector<HTMLElement>('.lm-stories-track')?.scrollBy({ left: 220, behavior: 'smooth' });
          return;
        }
        const key = button.dataset.interactionKey ?? '';
        if (kind === 'follow' || kind === 'save' || kind === 'music' || kind === 'sort' || kind === 'like' || kind === 'register' || kind === 'join') {
          this.transitionInteraction(interaction => {
            const active = !(interaction.toggles[key] ?? false);
            const verb = kind === 'follow' ? (active ? 'Seguindo' : 'Deixou de seguir')
              : kind === 'join' ? (active ? 'Entrou no grupo' : 'Saiu do grupo')
                : kind === 'register' ? (active ? 'Inscrição confirmada' : 'Inscrição cancelada')
                  : kind === 'like' ? (active ? 'Curtida registrada' : 'Curtida removida')
              : kind === 'save' ? (active ? 'Salvo' : 'Removido dos salvos')
                : kind === 'music' ? (active ? 'Música iniciada' : 'Música pausada')
                  : (active ? 'Ordenação: mais recentes' : 'Ordenação: mais relevantes');
            return { ...interaction, toggles: { ...interaction.toggles, [key]: active }, feedback: verb + ' · demonstração.' };
          });
        } else {
          const label = button.getAttribute('aria-label') || button.textContent?.trim() || 'Ação';
          const feedback = /editar/i.test(label) ? 'Edição local ativada para esta parte.'
            : /criar|novo/i.test(label) ? 'Ação de criação preparada nesta demonstração.'
              : /publicar|entrar|enviar|salvar/i.test(label) ? 'Ação registrada nesta demonstração.'
                : /notifica/i.test(label) ? 'Preferência de notificações alterada nesta demonstração.'
                  : 'Ação da parte registrada nesta demonstração.';
          this.transitionInteraction(interaction => ({ ...interaction, actions: { ...interaction.actions, [key]: (interaction.actions[key] ?? 0) + 1 }, feedback }));
        }
        this.render();
      }
      private onFocusIn(event: Event): void {
        if (this.state.id !== 'pedagogy-context' || !(event.target instanceof HTMLInputElement) || !event.target.matches('[data-subject-skill-input]')) return;
        this.transitionInteraction(interaction => ({ ...interaction, subjectSkillQuery: event.target instanceof HTMLInputElement ? event.target.value : '', subjectSkillMenuOpen: true, subjectSkillActiveIndex: 0 }));
        this.scheduleSubjectSkillUnderstanding(this.subjectSkillSuggestions(event.target.value)[0]);
        this.restoreSubjectFoundation();
      }
      private onPointerOver(event: Event): void {
        if (this.state.id !== 'pedagogy-context' || !(event.target instanceof Element)) return;
        const option = event.target.closest<HTMLButtonElement>('[data-subject-skill-index]');
        const index = Number(option?.dataset.subjectSkillIndex);
        if (!option || !Number.isInteger(index) || index === this.state.interaction.subjectSkillActiveIndex) return;
        this.transitionInteraction(interaction => ({ ...interaction, subjectSkillActiveIndex: index }));
        this.querySelectorAll<HTMLButtonElement>('[data-subject-skill-index]').forEach(item => {
          const active = Number(item.dataset.subjectSkillIndex) === index;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', String(active));
        });
        const suggestion = this.subjectSkillSuggestions(this.state.interaction.subjectSkillQuery)[index];
        this.scheduleSubjectSkillUnderstanding(suggestion);
        this.restoreSubjectFoundation();
        const input = this.querySelector<HTMLInputElement>('[data-subject-skill-input]');
        if (input) input.setAttribute('aria-activedescendant', 'subject-skill-option-' + index);
      }
      private onKeyDown(event: Event): void {
        if (!(event instanceof KeyboardEvent)) return;
        if (this.platformReferenceField(event.target) && this.handlePlatformReferenceKey(event, event.target)) return;
        if (this.state.id === 'pedagogy-context' && event.target instanceof HTMLInputElement && event.target.matches('[data-subject-skill-input]')) {
          const suggestions = this.subjectSkillSuggestions(event.target.value);
          const activeIndex = this.state.interaction.subjectSkillActiveIndex;
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            if (!suggestions.length) return;
            event.preventDefault();
            const nextIndex = event.key === 'ArrowDown'
              ? (activeIndex + 1) % suggestions.length
              : (activeIndex - 1 + suggestions.length) % suggestions.length;
            this.transitionInteraction(interaction => ({ ...interaction, subjectSkillQuery: event.target instanceof HTMLInputElement ? event.target.value : '', subjectSkillActiveIndex: nextIndex, subjectSkillMenuOpen: true }));
            this.scheduleSubjectSkillUnderstanding(this.subjectSkillSuggestions(event.target.value)[nextIndex]);
            this.restoreSubjectFoundation();
            return;
          }
          if (event.key === 'Enter' && this.state.interaction.subjectSkillMenuOpen) {
            event.preventDefault();
            const suggestion = suggestions[activeIndex] ?? suggestions[0];
            if (suggestion) this.addSubjectSkill(suggestion.name);
            return;
          }
          if (event.key === 'Escape' && this.state.interaction.subjectSkillMenuOpen) {
            event.preventDefault();
            this.transitionInteraction(interaction => ({ ...interaction, subjectSkillMenuOpen: false }));
            this.restoreSubjectFoundation();
            return;
          }
        }
        if (isProfileProjectPart(this.state.id)) {
          const currentStep = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('[data-project-wizard-step-select]') : null;
          if (currentStep && this.contains(currentStep)) {
            const tabs = [...this.querySelectorAll<HTMLButtonElement>('[data-project-wizard-step-select]')];
            if (!tabs.length) return;
            const currentIndex = tabs.indexOf(currentStep);
            let nextIndex = currentIndex;
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % tabs.length;
            else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            else if (event.key === 'Home') nextIndex = 0;
            else if (event.key === 'End') nextIndex = tabs.length - 1;
            else return;
            event.preventDefault();
            const step = tabs[nextIndex].dataset.projectWizardStepSelect ?? '0';
            this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'project-wizard-step': step } }));
            this.render();
            this.querySelector<HTMLButtonElement>('[data-project-wizard-step-select="' + step + '"]')?.focus();
            return;
          }
        }
        if (this.state.id !== 'community-feed') return;
        const current = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('[data-opinion-circle-select]') : null;
        if (!current || !this.contains(current)) return;
        const tabs = [...this.querySelectorAll<HTMLButtonElement>('[data-opinion-circle-select]')];
        if (!tabs.length) return;
        const currentIndex = tabs.indexOf(current);
        let nextIndex = currentIndex;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % tabs.length;
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = tabs.length - 1;
        else return;
        event.preventDefault();
        const nextTab = tabs[nextIndex];
        const circleId = nextTab.dataset.opinionCircleSelect ?? '';
        this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'community-opinion-circle': circleId } }));
        this.render();
        [...this.querySelectorAll<HTMLButtonElement>('[data-opinion-circle-select]')]
          .find(tab => tab.dataset.opinionCircleSelect === circleId)?.focus();
      }
      private onInput(event: Event): void {
        if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement)) return;
        const field = event.target;
        if (this.platformReferenceField(field)) {
          if (this.platformReferenceSkipInput === field) {
            this.platformReferenceSkipInput = null;
            this.closePlatformReferenceMenu();
          } else {
            this.updatePlatformReferenceMenu(field);
          }
        } else {
          this.closePlatformReferenceMenu();
        }
        if (field.hasAttribute('data-workspace-search')) {
          this.updateWorkspaceSearch(field.value);
          return;
        }
        if (field.matches('[data-subject-skill-input]') && this.state.id === 'pedagogy-context') {
          this.transitionInteraction(interaction => ({ ...interaction, subjectSkillQuery: field.value, subjectSkillActiveIndex: 0, subjectSkillMenuOpen: true }));
          this.scheduleSubjectSkillUnderstanding(this.subjectSkillSuggestions(field.value)[0]);
          this.restoreSubjectFoundation();
          return;
        }
        if (field.hasAttribute('data-profile-music-url')) {
          const preview = this.querySelector<HTMLElement>('[data-profile-spotify-preview]');
          const frame = spotifyEmbedFrame(field.value);
          if (preview) preview.innerHTML = frame || '<p>' + (field.value.trim() ? 'Cole um link válido de faixa, álbum ou playlist do Spotify para conferir a prévia.' : 'Prévia incorporada aparece aqui depois de colar um link do Spotify.') + '</p>';
          field.removeAttribute('aria-invalid');
          return;
        }
        const key = field.dataset.interactionField;
        if (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) return;
        if (field.dataset.storyField) {
          this.transitionInteraction(interaction => ({ ...interaction, fields: { ...interaction.fields, [this.storyFieldKey(field.dataset.storyField ?? '')]: field.value } }));
          this.syncStoryComposerPreview();
          return;
        }
        if (!key) return;
        const editingActivity = this.state.id === 'pedagogy-activity-builder' && Boolean(field.closest('[data-activity-editor]'));
        const creatingActivity = this.state.id === 'teacher-activity' && Boolean(field.closest('[data-profile-activity-composer]'));
        const editingProject = isProfileProjectPart(this.state.id) && Boolean(field.closest('[data-project-create-form]'));
        const activityReviewWasConfirmed = editingActivity && (this.state.interaction.toggles['activity-approved'] === true || this.state.interaction.toggles['activity-review-confirmed'] === true);
        const activityReviewFeedback = activityReviewWasConfirmed ? 'O rascunho mudou. Revise o conjunto e confirme novamente.' : '';
        this.transitionInteraction(interaction => ({
          ...(editingProject ? staleProjectReview(interaction) : interaction),
          fields: { ...interaction.fields, [key]: field.value },
          ...(editingActivity ? {
            toggles: { ...interaction.toggles, 'activity-review-confirmed': false, 'activity-approved': false },
            reviewFeedback: activityReviewFeedback,
          } : {}),
          ...(creatingActivity && interaction.feedback ? { feedback: '' } : {}),
        }));
        if (editingActivity) {
          const status = this.querySelector<HTMLElement>('[data-review-feedback]');
          if (status) status.textContent = activityReviewFeedback;
        }
        if (editingProject) {
          this.restoreProfileProjects();
          this.scheduleProjectReflection();
        }
      }
      private onChange(event: Event): void {
        if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement)) return;
        const field = event.target;
        const editingProject = isProfileProjectPart(this.state.id) && Boolean(field.closest('[data-project-create-form]'));
        if (field instanceof HTMLInputElement && field.type === 'file' && field.hasAttribute('data-story-image-file')) {
          const file = field.files?.[0];
          if (!file) return;
          if (!file.type.startsWith('image/')) {
            this.transitionInteraction(interaction => ({ ...interaction, feedback: 'Escolha um arquivo de imagem.' }));
            this.render();
            return;
          }
          if (file.size > 8 * 1024 * 1024) {
            this.transitionInteraction(interaction => ({ ...interaction, feedback: 'A imagem deve ter até 8 MB nesta demonstração.' }));
            this.render();
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result !== 'string') return;
            this.transitionInteraction(interaction => ({ ...interaction, storyImage: reader.result as string, feedback: 'Foto carregada na prévia.' }));
            this.render();
          };
          reader.onerror = () => {
            this.transitionInteraction(interaction => ({ ...interaction, feedback: 'Não foi possível ler a imagem selecionada.' }));
            this.render();
          };
          reader.readAsDataURL(file);
          return;
        }
        if (field.dataset.storyField) {
          this.transitionInteraction(interaction => ({ ...interaction, fields: { ...interaction.fields, [this.storyFieldKey(field.dataset.storyField ?? '')]: field.value } }));
          this.render();
          return;
        }
        const key = field.dataset.interactionField;
        if (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) {
          const toggle = field.dataset.interactionToggle ?? key;
          if (!toggle) return;
          const editingProject = isProfileProjectPart(this.state.id) && Boolean(field.closest('[data-project-create-form]'));
          const feedback = this.state.id === 'pedagogy-activity-builder'
            ? 'Conferência do rascunho atualizada.'
            : this.state.id === 'pedagogy-competency'
              ? 'Critério de observação atualizado.'
              : this.state.id === 'pedagogy-material-share'
                ? 'Seleção de publicação atualizada.'
                : 'Preferência atualizada nesta demonstração.';
          this.transitionInteraction(interaction => ({
            ...(editingProject ? staleProjectReview(interaction) : interaction),
            toggles: { ...interaction.toggles, [toggle]: field.checked, ...(editingProject ? { 'project-review-confirmed': false } : {}), ...(this.state.id === 'pedagogy-activity-builder' && toggle === 'activity-review-confirmed' ? { 'activity-approved': false } : {}) },
            ...(this.state.id === 'pedagogy-activity-builder' && toggle === 'activity-review-confirmed' && interaction.toggles['activity-approved'] ? { reviewFeedback: 'A conferência foi alterada. Confirme novamente a revisão.' } : {}),
            feedback,
          }));
        } else {
          if (!key) return;
          this.transitionInteraction(interaction => ({ ...(editingProject ? staleProjectReview(interaction) : interaction), fields: { ...interaction.fields, [key]: field.value } }));
        }
        this.render();
        if (editingProject) this.scheduleProjectReflection();
      }
      private onSubmit(event: Event): void {
        event.preventDefault();
        const form = event.target instanceof HTMLFormElement ? event.target : undefined;
        if (form?.matches('[data-subject-foundation-form]') && this.state.id === 'pedagogy-context') {
          const values = new FormData(form);
          const foundation: SubjectFoundation = {
            name: String(values.get('subjectName') ?? '').trim(),
            nature: String(values.get('subjectNature') ?? '').trim(),
            understanding: String(values.get('subjectUnderstanding') ?? '').trim(),
            approach: String(values.get('subjectApproach') ?? '').trim(),
            aspects: String(values.get('subjectAspects') ?? '').trim(),
            skills: [...(this.state.interaction.subjectSkills ?? [])],
          };
          if (!foundation.name || !foundation.nature || !foundation.understanding || !foundation.approach || !foundation.aspects || !foundation.skills.length) {
            this.transitionInteraction(interaction => ({ ...interaction, feedback: 'Preencha o nome, as quatro dimensões da matéria e adicione ao menos uma habilidade.' }));
            this.render();
            this.querySelector<HTMLInputElement>('[data-subject-foundation-form] [name="subjectName"]')?.focus();
            return;
          }
          this.transitionInteraction(interaction => ({
            ...interaction,
            subjectFoundation: foundation,
            groups: { ...interaction.groups, 'subject-foundation-open': '', 'subject-foundation-draft-started': '' },
            subjectSkillQuery: '', subjectSkillMenuOpen: false, subjectSkillActiveIndex: 0,
            feedback: 'Fundação de “' + foundation.name + '” registrada nesta demonstração com quatro descrições e ' + foundation.skills.length + (foundation.skills.length === 1 ? ' habilidade.' : ' habilidades.'),
          }));
          this.render();
          this.querySelector<HTMLButtonElement>('[data-subject-foundation-toggle]')?.focus();
          return;
        }
        if (form?.matches('[data-profile-agenda-composer]') && isProfileAgendaPart(this.state.id)) {
          const values = new FormData(form);
          const title = String(values.get('agendaTitle') ?? '').trim();
          const detail = String(values.get('agendaDetail') ?? '').trim();
          const date = String(values.get('agendaDate') ?? '').trim();
          const time = String(values.get('agendaTime') ?? '').trim();
          const elementId = String(values.get('agendaElementId') ?? '').trim();
          const validElement = !elementId || PROFILE_AGENDA_ELEMENTS.some(element => element.id === elementId);
          if (!title || !detail || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time) || !validElement) {
            this.transitionInteraction(interaction => ({ ...interaction, fields: { ...interaction.fields, [this.state.id + ':feedback']: 'Preencha nome, contexto, data e horário válidos. Confira também o vínculo escolhido.' } }));
            this.render();
            this.querySelector<HTMLInputElement>('[data-profile-agenda-composer] [name="agendaTitle"]')?.focus();
            return;
          }
          const item: ProfileAgendaItem = { id: this.state.id + '-' + projectId(), title, detail, date, time, elementId };
          const prefix = this.state.id + ':';
          const draftFields = new Set(['title', 'date', 'time', 'detail', 'elementId'].map(name => prefix + name));
          this.transitionInteraction(interaction => ({
            ...interaction,
            profileAgendaItems: [...interaction.profileAgendaItems, item],
            toggles: { ...interaction.toggles, [prefix + 'composer-open']: false, [prefix + 'element-picker-open']: false },
            fields: { ...Object.fromEntries(Object.entries(interaction.fields).filter(([key]) => !draftFields.has(key))), [prefix + 'feedback']: '“' + title + '” adicionado à agenda do perfil. Escolha um público para convertê-lo em postagem.' },
          }));
          this.render();
          this.querySelector<HTMLButtonElement>('[data-profile-agenda-create]')?.focus();
          return;
        }
        if (form?.matches('[data-project-chat-form]') && isProfileProjectPart(this.state.id)) {
          if (this.state.interaction.projectChatPending) return;
          const values = new FormData(form);
          const prompt = String(values.get('projectChatPrompt') ?? '').trim();
          if (!prompt) {
            this.transitionInteraction(interaction => ({ ...interaction, feedback: 'Escreva uma ideia para conversar sobre o projeto.' }));
            this.render();
            this.querySelector<HTMLTextAreaElement>('[data-project-chat-form] textarea')?.focus();
            return;
          }
          const requestId = projectId();
          const studentMessage: ProjectChatMessage = { id: requestId + '-user', kind: 'conversation', role: 'student', text: prompt };
          const assistantMessage: ProjectChatMessage = { id: requestId, kind: 'conversation', role: 'assistant', text: '', status: 'pending' };
          const projectForm = this.querySelector<HTMLFormElement>('[data-project-create-form]');
          const projectValues = projectForm ? new FormData(projectForm) : null;
          const conversation = this.state.interaction.projectChatMessages
            .filter(message => message.kind !== 'reflection' && !message.status && message.text.trim())
            .slice(-8)
            .map(message => ({ role: message.role === 'student' ? 'user' as const : 'assistant' as const, content: message.text }));
          const request: ProjectAssistantRequest = {
            requestId,
            partId: this.state.id as ProjectAssistantRequest['partId'],
            kind: 'conversation',
            prompt,
            context: {
              title: String(projectValues?.get('projectTitle') ?? ''),
              authors: String(projectValues?.get('projectAuthors') ?? ''),
              goal: String(projectValues?.get('projectGoal') ?? ''),
              justification: String(projectValues?.get('projectJustification') ?? ''),
              summary: String(projectValues?.get('projectSummary') ?? ''),
              audience: String(projectValues?.get('projectAudience') ?? ''),
              competencies: projectValues?.getAll('projectCompetency').map(String) ?? [],
              learningEvidence: String(projectValues?.get('projectLearningEvidence') ?? ''),
              socialDraft: projectValues?.get('projectSocialDraft') === 'yes',
              milestones: this.state.interaction.projectMilestones.map(({ title, date }) => ({ title, date })),
            },
            conversation,
          };
          const fieldKey = this.state.id + ':projectChatPrompt';
          this.transitionInteraction(interaction => ({
            ...interaction,
            projectChatMessages: [...interaction.projectChatMessages, studentMessage, assistantMessage],
            fields: { ...interaction.fields, [fieldKey]: '' },
            projectChatPending: true,
            feedback: '',
          }));
          this.render();
          this.dispatchEvent(new CustomEvent('lumira-project-assistant-request', { bubbles: true, composed: true, detail: request }));
          this.querySelector<HTMLTextAreaElement>('[data-project-chat-form] textarea')?.focus();
          return;
        }
        if (form?.matches('[data-project-create-form]') && isProfileProjectPart(this.state.id)) {
          if (this.state.interaction.projectReviewStatus !== 'ready') {
            this.requestProjectReview();
            return;
          }
          if (this.state.interaction.toggles['project-review-confirmed'] !== true) {
            this.transitionInteraction(interaction => ({ ...interaction, feedback: 'Leia a revisão do Cognoscere local e confirme a criação do rascunho.' }));
            this.render();
            this.querySelector<HTMLButtonElement>('[data-project-review-confirm]')?.focus();
            return;
          }
          const values = new FormData(form);
          const title = String(values.get('projectTitle') ?? '').trim();
          const authors = String(values.get('projectAuthors') ?? '').trim();
          const goal = String(values.get('projectGoal') ?? '').trim();
          const justification = String(values.get('projectJustification') ?? '').trim();
          const summary = String(values.get('projectSummary') ?? '').trim();
          const learningEvidence = String(values.get('projectLearningEvidence') ?? '').trim();
          const audience = String(values.get('projectAudience') ?? 'Comunidade escolar');
          const competencies = values.getAll('projectCompetency').map(String);
          const milestones = this.state.interaction.projectMilestones;
          if (!title || !authors || !goal || !justification || !summary || !learningEvidence) {
            const required = [
              ['projectTitle', title], ['projectAuthors', authors], ['projectGoal', goal],
              ['projectJustification', justification], ['projectLearningEvidence', learningEvidence], ['projectSummary', summary],
            ] as const;
            const missing = required.find(([, value]) => !value)?.[0] ?? 'projectTitle';
            const steps: Record<string, string> = { projectTitle: '0', projectAuthors: '0', projectGoal: '1', projectJustification: '1', projectLearningEvidence: '2', projectSummary: '2' };
            this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'project-wizard-step': steps[missing] }, feedback: 'Complete os campos de autoria, justificativa e aprendizagem antes de criar o projeto.' }));
            this.render();
            this.querySelector<HTMLInputElement | HTMLTextAreaElement>('[data-project-create-form] [name="' + missing + '"]')?.focus();
            return;
          }
          if (!competencies.length) {
            this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'project-wizard-step': '2' }, feedback: 'Escolha ao menos uma competência relacionada ao projeto.' }));
            this.render();
            this.querySelector<HTMLInputElement>('[data-project-create-form] [name="projectCompetency"]')?.focus();
            return;
          }
          if (!milestones.length) {
            this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'project-wizard-step': '3' }, feedback: 'Adicione ao menos um marco no calendário para organizar o trabalho.' }));
            this.render();
            this.querySelector<HTMLInputElement>('[data-project-create-form] [name="projectMilestoneTitle"]')?.focus();
            return;
          }
          if (this.projectReflectionTimer !== undefined) window.clearTimeout(this.projectReflectionTimer);
          this.projectReflectionTimer = undefined;
          this.projectReflectionRevision += 1;
          const project: ProfileProjectItem = {
            id: projectId(), title, authors, goal, justification, summary, audience, learningEvidence, competencies, milestones: milestones.map(item => ({ ...item })),
            socialDraft: values.has('projectSocialDraft'), createdAt: new Date().toISOString(),
          };
          const fieldPrefix = this.state.id + ':';
          const fieldNames = ['projectTitle', 'projectAuthors', 'projectAudience', 'projectGoal', 'projectJustification', 'projectLearningEvidence', 'projectSummary', 'projectMilestoneTitle', 'projectMilestoneDate'];
          const clearedFields = { ...this.state.interaction.fields };
          fieldNames.forEach(name => { delete clearedFields[fieldPrefix + name]; });
          const clearedToggles: Record<string, boolean> = { ...this.state.interaction.toggles, 'project-social-draft': true };
          PROJECT_COMPETENCIES.forEach((_, index) => { clearedToggles['project-competency-' + index] = false; });
          this.transitionInteraction(interaction => ({
            ...interaction,
            profileProjects: [...interaction.profileProjects, project],
            projectMilestones: [],
            projectChatMessages: [],
            projectChatPending: false,
            projectReviewStatus: 'idle',
            projectReviewText: '',
            groups: { ...interaction.groups, 'project-expanded-id': project.id, 'project-wizard-step': '0' },
            fields: clearedFields,
            toggles: { ...clearedToggles, 'profile-project-builder-open': false },
            feedback: 'Projeto “' + title + '” salvo nesta demonstração local como ' + (project.socialDraft ? 'rascunho para o Social.' : 'projeto privado.'),
          }));
          this.render();
          this.querySelector<HTMLButtonElement>('[data-project-create]')?.focus();
          return;
        }
        if (form?.matches('[data-profile-activity-composer]') && this.state.id === 'teacher-activity') {
          const values = new FormData(form);
          const title = String(values.get('activityTitle') ?? '').trim();
          const text = String(values.get('activityText') ?? '').trim();
          const activityId = String(values.get('activityLink') ?? '');
          const activity = PROFILE_ACTIVITY_LINKS.find(link => link.id === activityId);
          const rawKind = String(values.get('activityKind') ?? 'post');
          const kind: ProfileActivityKind = rawKind === 'activity' || rawKind === 'video' || rawKind === 'project' ? rawKind : 'post';
          const tags = String(values.get('activityTags') ?? '').split(/[,;\n]/).map(tag => tag.trim()).filter(Boolean).slice(0, 8);
          if (!title || !text || !activity) {
            this.transitionInteraction(interaction => ({ ...interaction, feedback: 'Escolha a atividade relacionada e preencha o título e o relato.' }));
            this.render();
            this.querySelector<HTMLSelectElement>('[data-profile-activity-composer] [name="activityLink"]')?.focus();
            return;
          }
          const item: ProfileActivityItem = {
            id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7), kind, title, text,
            activityId: activity.id, activityTitle: activity.title, criterion: activity.criterion, tags,
            publishedAt: 'Agora', likes: 0, comments: 0,
          };
          const fieldPrefix = 'teacher-activity:';
          this.transitionInteraction(interaction => ({
            ...interaction,
            profileActivityItems: [...(interaction.profileActivityItems ?? []), item],
            groups: { ...interaction.groups, 'teacher-activity-filter': kind },
            toggles: { ...interaction.toggles, 'profile-activity-composer-open': false },
            fields: Object.fromEntries(Object.entries(interaction.fields).filter(([key]) => ![
              fieldPrefix + 'activityKind', fieldPrefix + 'activityLink', fieldPrefix + 'activityTitle', fieldPrefix + 'activityText', fieldPrefix + 'activityTags',
            ].includes(key))),
            feedback: PROFILE_ACTIVITY_LABELS[kind] + ' adicionado ao perfil nesta demonstração local.',
          }));
          this.render();
          this.querySelector<HTMLButtonElement>('[data-profile-activity-create]')?.focus();
          return;
        }
        if (form?.matches('[data-calendar-event-form]') && this.state.id === 'community-calendar') {
          const values = new FormData(form);
          const title = String(values.get('eventTitle') ?? '').trim();
          const date = String(values.get('eventDate') ?? '').trim();
          const time = String(values.get('eventTime') ?? '').trim();
          if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
            this.transitionInteraction(interaction => ({ ...interaction, fields: { ...interaction.fields, 'calendar-feedback': 'Preencha nome, data e horário do evento.' } }));
          } else {
            this.transitionInteraction(interaction => ({
              ...interaction,
              communityEvents: [...(interaction.communityEvents ?? []), { title, date, time, color: 'teal' }],
              groups: { ...interaction.groups, 'calendar-month-offset': String((Number(date.slice(0, 4)) - 2026) * 12 + (Number(date.slice(5, 7)) - 10)) },
              toggles: { ...interaction.toggles, 'calendar-event-open': false },
              fields: { ...interaction.fields, 'calendar-event-title': '', 'calendar-event-date': date, 'calendar-event-time': time, 'calendar-feedback': '“' + title + '” adicionado ao calendário desta demonstração.' },
            }));
          }
          this.render();
          return;
        }
        if (form?.matches('[data-profile-editor]') && (this.state.id === 'teacher-hero' || this.state.id === 'student-hero')) {
          const values = new FormData(form);
          const name = String(values.get('name') ?? '').trim();
          const role = String(values.get('role') ?? '').trim();
          const school = String(values.get('school') ?? '').trim();
          const intro = String(values.get('intro') ?? '').trim();
          const bio = String(values.get('bio') ?? '').trim();
          const competencies = String(values.get('competencies') ?? '').split(/\r?\n/).map(item => item.trim()).filter(Boolean).slice(0, 4);
          const musicUrl = String(values.get('musicUrl') ?? '').trim();
          const musicField = form.querySelector<HTMLInputElement>('[name="musicUrl"]');
          const editError = form.querySelector<HTMLElement>('[data-profile-edit-error]');
          if (!name || !role || !school) {
            if (editError) {
              editError.textContent = 'Preencha nome, função e escola antes de salvar.';
              editError.hidden = false;
            }
            return;
          }
          if (musicUrl && !spotifyEmbedUrl(musicUrl)) {
            if (musicField) {
              musicField.setAttribute('aria-invalid', 'true');
              musicField.focus();
            }
            if (editError) {
              editError.textContent = 'O link não parece ser uma faixa, álbum ou playlist do Spotify. Confira o endereço copiado.';
              editError.hidden = false;
            }
            return;
          }
          try {
            persistProfileValues(this.state.situation.screenId || (this.state.id === 'student-hero' ? 'student-profile' : 'teacher-profile'), { name, role, school, intro, bio, competencies, musicUrl });
            this.transitionInteraction(interaction => ({ ...interaction, groups: { ...interaction.groups, 'profile-editor-open': '' }, feedback: 'Perfil salvo neste navegador.' }));
          } catch {
            this.transitionInteraction(interaction => ({ ...interaction, feedback: 'Não foi possível salvar neste navegador. Verifique o espaço de armazenamento disponível.' }));
          }
          this.render();
          this.querySelector<HTMLButtonElement>('[data-profile-edit-primary]')?.focus();
          return;
        }
        if (form?.matches('[data-leveling-enrollment-form]') && this.state.id === 'leveling-confirmation') {
          const code = form.querySelector<HTMLInputElement>('[name="invitationCode"]')?.value.trim() ?? '';
          const expectedCode = form.dataset.invitationCode ?? '';
          const acknowledged = form.querySelector<HTMLInputElement>('[name="enrollmentAcknowledged"]')?.checked === true;
          if (code.toLocaleUpperCase() !== expectedCode.toLocaleUpperCase()) {
            this.transitionInteraction(interaction => ({ ...interaction, enrollmentFeedback: 'Este código não corresponde ao convite demonstrativo. Confira o código recebido pela escola.' }));
          } else if (!acknowledged) {
            this.transitionInteraction(interaction => ({ ...interaction, enrollmentFeedback: 'Confirme a escola, a turma e o caráter reservado das respostas para continuar.' }));
          } else {
            this.transitionInteraction(interaction => ({
              ...interaction,
              toggles: { ...interaction.toggles, 'leveling-confirmed': true },
              fields: { ...interaction.fields, 'leveling-invitation-code': code },
              enrollmentFeedback: 'Vínculo confirmado e matrícula registrada nesta demonstração local.',
            }));
          }
          this.render();
          return;
        }
        if (form?.matches('[data-quest-stage-form]') && this.state.id === 'quest-board') {
          const questId = form.dataset.questStageForm ?? '';
          const stageId = form.dataset.stageId ?? '';
          const quest = labList<QuestFixture>(this.state.fixture, 'quests').find(item => item.id === questId);
          const participation = this.state.interaction.questParticipations.find(record => record.questId === questId);
          const stage = quest?.stages.find(item => item.id === stageId);
          const nextStage = quest?.stages.find(item => !participation?.stageSubmissions[item.id]);
          const textarea = form.querySelector<HTMLTextAreaElement>('textarea[data-interaction-field]');
          const response = textarea?.value.trim() ?? '';
          if (!participation || !quest || !stage || participation.status === 'completed') {
            this.transitionInteraction(interaction => ({ ...interaction, questFeedback: 'Inscreva-se na competição antes de registrar etapas.' }));
          } else if (nextStage?.id !== stageId) {
            this.transitionInteraction(interaction => ({ ...interaction, questFeedback: 'Registre as etapas na ordem indicada para preservar a trilha de participação.' }));
          } else if (!response) {
            this.transitionInteraction(interaction => ({ ...interaction, questFeedback: 'Escreva o registro da etapa antes de enviar.' }));
            textarea?.focus();
          } else {
            const submittedAt = new Date().toISOString();
            const completed = quest.stages.every(item => item.id === stageId || Boolean(participation.stageSubmissions[item.id]));
            const submission: QuestStageSubmission = { submittedAt, response };
            const history: QuestParticipationEvent[] = [
              ...participation.history,
              { action: 'Entrega registrada · ' + stage.title, at: submittedAt, detail: 'Registro enviado: ' + response },
              ...(completed ? [{ action: 'Participação concluída', at: submittedAt, detail: 'Todas as ' + quest.stages.length + ' etapas foram registradas. A apuração da pontuação continua a cargo da organização do evento.' }] : []),
            ];
            const updatedParticipation: QuestParticipation = {
              ...participation,
              status: completed ? 'completed' : 'in-progress',
              stageSubmissions: { ...participation.stageSubmissions, [stageId]: submission },
              history,
            };
            this.transitionInteraction(interaction => ({
              ...interaction,
              questParticipations: interaction.questParticipations.map(record => record.questId === questId ? updatedParticipation : record),
              questFeedback: completed ? 'Última etapa registrada. Sua participação está concluída e rastreada; a classificação ainda não foi apurada.' : 'Etapa “' + stage.title + '” registrada com data e hora. A próxima etapa foi liberada.',
            }));
          }
          this.render();
          return;
        }
        if (form?.matches('[data-competency-question-form]') && this.state.id === 'competency-question-response') {
          const questionId = form.dataset.questionId ?? '';
          const questionIndex = Number(form.dataset.questionIndex ?? '0');
          const questionCount = this.querySelectorAll('[data-competency-question-form]').length;
          const questionTitle = form.querySelector<HTMLElement>('.lm-question-panel-heading h3')?.textContent?.trim() ?? 'esta questão';
          const textarea = form.querySelector<HTMLTextAreaElement>('textarea[data-interaction-field]');
          const key = textarea?.dataset.interactionField ?? '';
          const response = textarea?.value.trim() ?? '';
          if (!response) {
            this.transitionInteraction(interaction => ({ ...interaction, questionFeedback: 'Escreva sua resposta antes de registrar esta questão.' }));
          } else {
            const nextIndex = Math.min(questionCount - 1, questionIndex + 1);
            const excerpt = response.length > 160 ? response.slice(0, 157).trimEnd() + '…' : response;
            const aiReflection = 'Leitura demonstrativa: sua resposta foi associada a “' + questionTitle + '”. A professora revisará quais trechos sustentam cada critério e se os dados apresentados bastam para a conclusão.\n\nTrecho reservado: “' + excerpt + '”\n\nEsta resposta isolada não determina o nível da competência.';
            this.transitionInteraction(interaction => ({
              ...interaction,
              fields: key ? { ...interaction.fields, [key]: response } : interaction.fields,
              toggles: { ...interaction.toggles, ['competency-submitted:' + questionId]: true },
              groups: { ...interaction.groups, 'competency-question-index': String(nextIndex) },
              aiReflection,
              questionFeedback: questionCount > 0 && nextIndex === questionCount - 1 && questionIndex === questionCount - 1
                ? 'Quinta resposta registrada. O conjunto está pronto para revisão docente demonstrativa.'
                : 'Questão ' + (questionIndex + 1) + ' registrada. Você pode voltar e revisar qualquer resposta.',
            }));
          }
          this.render();
          return;
        }
        if (form?.matches('[data-student-answer-form]') && this.state.id === 'learner-response') {
          const response = form.querySelector<HTMLTextAreaElement>('[name="response"]')?.value.trim() ?? '';
          if (!response) {
            this.transitionInteraction(interaction => ({ ...interaction, responseFeedback: 'Escreva uma resposta antes de enviar.' }));
            this.render();
            return;
          }
          const hasGroupPower = /\b80\s*w\b|\b80\b|oito\s+l[aâ]mpadas/i.test(response);
          const hasChangedTime = /\b4\s*h(?:oras?)?\b|quatro\s+horas|quatro\s+h/i.test(response);
          const hasReasoning = /porque|por isso|portanto|ent[aã]o|justific|compar/i.test(response);
          const identified: string[] = [];
          if (hasGroupPower) identified.push('potência do conjunto');
          if (hasChangedTime) identified.push('mudança no tempo de uso');
          if (hasReasoning) identified.push('uma justificativa ou comparação');
          const excerpt = response.length > 180 ? response.slice(0, 177).trimEnd() + '…' : response;
          const nextStep = hasGroupPower && hasChangedTime && hasReasoning
            ? 'Você relacionou os dados principais. Confira se sua conclusão explica como eles mudam a comparação no período.'
            : 'Na próxima revisão, compare a potência do conjunto de lâmpadas com a duração alterada do ventilador e explique o que esses dados permitem concluir.';
          const aiReflection = 'Na sua resposta, a leitura simulada encontrou: ' + (identified.length ? identified.join(', ') : 'a ideia inicial registrada') + '.\n\nTrecho considerado: “' + excerpt + '”\n\n' + nextStep;
          this.transitionInteraction(interaction => ({
            ...interaction,
            aiReflection,
            studentSubmissions: [...interaction.studentSubmissions, response],
            responseFeedback: 'Tentativa ' + (interaction.studentSubmissions.length + 1) + ' registrada nesta demonstração. Sua resposta continua privada.',
          }));
          this.parentElement?.querySelector<DemoPagePartElement>('[data-component-id="learner-reflection"]')
            ?.syncLearningReflection(this.state.interaction.aiReflection, this.state.interaction.studentSubmissions);
          this.render();
          return;
        }
        if (form?.matches('[data-story-composer]')) {
          const readField = (name: string): string => form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[data-story-field="' + name + '"]')?.value.trim() ?? '';
          const body = readField('body') || readField('overlayText') || readField('pollQuestion') || 'Story visual compartilhado com a comunidade.';
          const caption = readField('caption') || body.slice(0, 96) || 'Novo momento';
          const title = readField('title') || caption.slice(0, 48) || 'Novo story';
          const visibility = readField('visibility') || 'Público';
          const music = readField('music');
          const activity = readField('activity');
          const selectedTextStyle = readField('textStyle').toLocaleLowerCase();
          const textStyle = selectedTextStyle === 'destaque' ? 'highlight' : selectedTextStyle === 'contorno' ? 'outline' : 'classic';
          const baseCount = this.querySelectorAll('.lm-story-card:not(.lm-new-story):not(.lm-story-next):not(.lm-local-story)').length;
          const fieldPrefix = this.state.id + ':story:';
          this.transitionInteraction(interaction => ({
            ...interaction,
            localStories: [...interaction.localStories, {
              title, caption, body, category: 'Produção', visibility, likes: 0,
              image: interaction.storyImage, orientation: interaction.storyOrientation, filter: interaction.storyFilter,
              overlayText: readField('overlayText'), textStyle, music: music === 'Escolha uma faixa' ? '' : music,
              activity: activity === 'Escolha uma atividade' ? '' : activity, linkLabel: readField('linkLabel'), linkUrl: readField('linkUrl'),
              pollQuestion: readField('pollQuestion'), pollOptionA: readField('pollOptionA'), pollOptionB: readField('pollOptionB'),
              quizQuestion: readField('quizQuestion'), quizOptionA: readField('quizOptionA'), quizOptionB: readField('quizOptionB'), quizAnswer: readField('quizAnswer'),
              question: readField('question'), countdown: [readField('countdown'), readField('countdownDate')].filter(Boolean).join(' · '),
              mention: readField('mention'), location: readField('location'),
            }],
            selectedStory: baseCount + interaction.localStories.length,
            storyComposerOpen: false,
            storyComposerExpanded: false,
            storyImage: '', storyOrientation: 'portrait', storyFilter: 'original', storyComposerTool: 'text',
            fields: Object.fromEntries(Object.entries(interaction.fields).filter(([key]) => !key.startsWith(fieldPrefix))),
            feedback: 'Story publicado e aberto nesta demonstração local.',
          }));
          this.render();
          return;
        }
        if (form?.matches('[data-story-reply-form]')) {
          const replyControl = form.elements.namedItem('storyReply');
          const reply = replyControl instanceof HTMLInputElement ? replyControl.value.trim() : '';
          if (!reply) {
            this.transitionInteraction(interaction => ({ ...interaction, feedback: 'Escreva uma resposta antes de enviar.' }));
            this.render();
            return;
          }
          const key = String(this.state.interaction.selectedStory ?? 0);
          this.transitionInteraction(interaction => ({
            ...interaction,
            storyReplies: { ...interaction.storyReplies, [key]: [...(interaction.storyReplies[key] ?? []), reply] },
            fields: { ...interaction.fields, [this.state.id + ':story-reply']: '' },
            feedback: 'Resposta adicionada ao story nesta demonstração local.',
          }));
          this.render();
          return;
        }
        if (this.state.id === 'community-feed' && form?.matches('[data-opinion-message-form]')) {
          const circleId = form.dataset.opinionMessageForm ?? '';
          const text = String(new FormData(form).get('opinionMessage') ?? '').trim();
          if (!text) {
            this.transitionInteraction(interaction => ({ ...interaction, feedback: 'Escreva uma ideia ou pergunta antes de enviar.' }));
            this.render();
            return;
          }
          if (text.length > 500) {
            this.transitionInteraction(interaction => ({ ...interaction, feedback: 'A mensagem pode ter no máximo 500 caracteres.' }));
            this.render();
            return;
          }
          const requestId = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
          const actorRole: OpinionCircleActorRole = this.state.situation.role;
          this.transitionInteraction(interaction => ({
            ...interaction,
            opinionMessageRequests: { ...interaction.opinionMessageRequests, [circleId]: requestId },
          }));
          this.dispatchEvent(new CustomEvent<OpinionCircleMessageSendRequest>('lumira-opinion-message-send', {
            bubbles: true,
            composed: true,
            detail: { requestId, partId: 'community-feed', circleId, actorRole, text },
          }));
          return;
        }
        if (this.state.id === 'community-feed' && form?.matches('[data-community-post-form]')) {
          const values = new FormData(form);
          const text = String(values.get('post') ?? '').trim();
          const title = String(values.get('postTitle') ?? '').trim();
          const activity = PROFILE_ACTIVITY_LINKS.find(link => link.id === String(values.get('activityLink') ?? ''));
          if (!activity || !title || !text) {
            this.transitionInteraction(interaction => ({ ...interaction, feedback: 'Escolha a atividade relacionada e conte o que aconteceu.' }));
            this.render();
            return;
          }
          const post: CommunityPostDraft = {
            id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7), title, text,
            activityId: activity.id, activityTitle: activity.title, criterion: activity.criterion,
            tags: [], author: 'Ana Beatriz', role: 'Professora · Comunidade', time: 'agora', likes: 0, comments: 0,
          };
          this.transitionInteraction(interaction => ({
            ...interaction,
            communityPosts: [...interaction.communityPosts, post],
            fields: { ...interaction.fields, 'community-feed:post': '', 'community-feed:postTitle': '', 'community-feed:activityLink': '' },
            feedback: 'Post compartilhado com a atividade e o critério relacionados. Ele está visível só nesta demonstração local.',
          }));
          this.render();
          this.querySelector<HTMLSelectElement>('[data-community-post-form] [name="activityLink"]')?.focus();
          return;
        }
        if (this.state.id === 'access-form') {
          this.transitionInteraction(interaction => ({ ...interaction, feedback: 'Acesso demonstrativo processado; autenticação real não está conectada.' }));
        } else {
          this.transitionInteraction(interaction => ({ ...interaction, feedback: 'Envio concluído nesta demonstração.' }));
        }
        this.render();
      }
      private render(): void {
        this.closePlatformReferenceMenu();
        const { id, title, content, selectedId, className, situation, prototypeParameters } = this.state;
        this.className = 'lm-page-part ' + e(className) + (id === selectedId ? ' is-selected' : '');
        this.dataset.componentId = id;
        this.dataset.screenId = situation.screenId;
        this.setAttribute('aria-label', title);
        this.setAttribute('role', 'region');
        this.dataset.mockScreen = situation.screenId;
        this.dataset.mockFixture = situation.fixtureKey;
        this.dataset.mockRole = situation.role;
        this.dataset.mockStatus = situation.status;
        this.dataset.selectedRegion = situation.selectedRegionId;
        this.dataset.prototypeVisible = String(prototypeParameters.visible !== false);
        this.dataset.prototypeDensity = typeof prototypeParameters.density === 'string' ? prototypeParameters.density : 'regular';
        this.dataset.prototypeAccent = typeof prototypeParameters.accent === 'string' ? prototypeParameters.accent : 'teal';
        this.removeAttribute('id');
        delete this.dataset.scrollpoint;
        const visibleContent = prototypeParameters.visible === false
          ? '<div class="lm-prototype-hidden" role="status"><strong>Componente oculto</strong><span>Ative “Exibir componente” nos parâmetros para mostrar a peça.</span></div>'
          : content;
        this.innerHTML = visibleContent + componentStateLayer(situation.status);
        this.prepareControls();
        this.restoreInteraction();
      }
    }
    customElements.define('lumira-page-part', DemoPagePart);
  }

  if (!customElements.get('lumira-access-page')) {
    class AccessPageComponent extends HTMLElement implements ComponentPageElement {
      private transitions: ComponentStateIterator<ComponentPageProps>;
      private state: ComponentPageProps;
      constructor() { super(); this.transitions = componentState(emptyPageProps('access')); this.state = this.transitions.next().value; }
      configure(props: ComponentPageProps): void { this.state = this.transitions.next(() => structuredClone(props)).value; this.render(); }
      private render(): void { renderPageWithParts(this, this.state, renderAccessPage); }
    }
    customElements.define('lumira-access-page', AccessPageComponent);
  }
  if (!customElements.get('lumira-teacher-profile-page')) {
    class TeacherProfilePageComponent extends HTMLElement implements ComponentPageElement {
      private transitions: ComponentStateIterator<ComponentPageProps>;
      private state: ComponentPageProps;
      constructor() { super(); this.transitions = componentState(emptyPageProps('teacher-profile')); this.state = this.transitions.next().value; }
      configure(props: ComponentPageProps): void { this.state = this.transitions.next(() => structuredClone(props)).value; this.render(); }
      private render(): void { renderPageWithParts(this, this.state, renderTeacherProfilePage); }
    }
    customElements.define('lumira-teacher-profile-page', TeacherProfilePageComponent);
  }
  if (!customElements.get('lumira-teacher-workspace-page')) {
    class TeacherWorkspacePageComponent extends HTMLElement implements ComponentPageElement {
      private transitions: ComponentStateIterator<ComponentPageProps>;
      private state: ComponentPageProps;
      constructor() { super(); this.transitions = componentState(emptyPageProps('teacher-workspace')); this.state = this.transitions.next().value; }
      configure(props: ComponentPageProps): void { this.state = this.transitions.next(() => structuredClone(props)).value; this.render(); }
      private render(): void { renderPageWithParts(this, this.state, renderTeacherWorkspacePage); }
    }
    customElements.define('lumira-teacher-workspace-page', TeacherWorkspacePageComponent);
  }
  if (!customElements.get('lumira-student-profile-page')) {
    class StudentProfilePageComponent extends HTMLElement implements ComponentPageElement {
      private transitions: ComponentStateIterator<ComponentPageProps>;
      private state: ComponentPageProps;
      constructor() { super(); this.transitions = componentState(emptyPageProps('student-profile')); this.state = this.transitions.next().value; }
      configure(props: ComponentPageProps): void { this.state = this.transitions.next(() => structuredClone(props)).value; this.render(); }
      private render(): void { renderPageWithParts(this, this.state, renderStudentProfilePage); }
    }
    customElements.define('lumira-student-profile-page', StudentProfilePageComponent);
  }
  if (!customElements.get('lumira-student-activity-page')) {
    class StudentActivityPageComponent extends HTMLElement implements ComponentPageElement {
      private transitions: ComponentStateIterator<ComponentPageProps>;
      private state: ComponentPageProps;
      constructor() { super(); this.transitions = componentState(emptyPageProps('student-activity')); this.state = this.transitions.next().value; }
      configure(props: ComponentPageProps): void { this.state = this.transitions.next(() => structuredClone(props)).value; this.render(); }
      private render(): void { renderPageWithParts(this, this.state, renderStudentActivityPage); }
    }
    customElements.define('lumira-student-activity-page', StudentActivityPageComponent);
  }
  if (!customElements.get('lumira-leveling-enrollment-page')) {
    class LevelingEnrollmentPageComponent extends HTMLElement implements ComponentPageElement {
      private transitions: ComponentStateIterator<ComponentPageProps>;
      private state: ComponentPageProps;
      constructor() { super(); this.transitions = componentState(emptyPageProps('leveling-enrollment')); this.state = this.transitions.next().value; }
      configure(props: ComponentPageProps): void { this.state = this.transitions.next(() => structuredClone(props)).value; this.render(); }
      private render(): void { renderPageWithParts(this, this.state, renderLevelingEnrollmentPage); }
    }
    customElements.define('lumira-leveling-enrollment-page', LevelingEnrollmentPageComponent);
  }
  if (!customElements.get('lumira-quests-page')) {
    class QuestsPageComponent extends HTMLElement implements ComponentPageElement {
      private transitions: ComponentStateIterator<ComponentPageProps>;
      private state: ComponentPageProps;
      constructor() { super(); this.transitions = componentState(emptyPageProps('quests')); this.state = this.transitions.next().value; }
      configure(props: ComponentPageProps): void { this.state = this.transitions.next(() => structuredClone(props)).value; this.render(); }
      private render(): void { renderPageWithParts(this, this.state, renderQuestsPage); }
    }
    customElements.define('lumira-quests-page', QuestsPageComponent);
  }
  if (!customElements.get('lumira-competency-questions-page')) {
    class CompetencyQuestionsPageComponent extends HTMLElement implements ComponentPageElement {
      private transitions: ComponentStateIterator<ComponentPageProps>;
      private state: ComponentPageProps;
      constructor() { super(); this.transitions = componentState(emptyPageProps('competency-questions')); this.state = this.transitions.next().value; }
      configure(props: ComponentPageProps): void { this.state = this.transitions.next(() => structuredClone(props)).value; this.render(); }
      private render(): void { renderPageWithParts(this, this.state, renderCompetencyQuestionsPage); }
    }
    customElements.define('lumira-competency-questions-page', CompetencyQuestionsPageComponent);
  }
  if (!customElements.get('lumira-community-page')) {
    class CommunityPageComponent extends HTMLElement implements ComponentPageElement {
      private transitions: ComponentStateIterator<ComponentPageProps>;
      private state: ComponentPageProps;
      constructor() { super(); this.transitions = componentState(emptyPageProps('community')); this.state = this.transitions.next().value; }
      configure(props: ComponentPageProps): void { this.state = this.transitions.next(() => structuredClone(props)).value; this.render(); }
      private render(): void { renderPageWithParts(this, this.state, renderCommunityPage); }
    }
    customElements.define('lumira-community-page', CommunityPageComponent);
  }
}
