/** Componentes, páginas e dados iniciais da plataforma e do Componenting Demo Lab. */

import type { AppSnapshot, CommunityEvent, SessionUser } from './types';
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
  'teacher-activity': 'Use a publicação para mostrar a passagem de uma prática pedagógica para uma narrativa compartilhável, com contexto e reações locais.',
  'teacher-projects': 'Apresente projetos com estados e avanço legíveis para dar visão rápida do trabalho em andamento, sem transformar a lista em relatório privado de turma.',
  'teacher-agenda': 'A agenda aproxima compromissos e horários da rotina docente. Os itens servem como cenário de apresentação, sem integração com calendário externo.',
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
  'quest-board': 'As quests oferecem desafios situados e registram participação. Selos pertencem à missão e não funcionam como nível curricular nem classificação de competência.',
  'quest-principles': 'Uma missão pode convidar a investigar, explicar e compartilhar uma produção. Respostas pedagógicas continuam privadas; resultados competitivos só existem dentro de eventos com regras próprias.',
  'competency-question-context': 'Cada pergunta apresenta uma situação e dados suficientes para tornar observável uma relação da competência em foco, sem sugerir uma fórmula ou revelar o contrato interno de avaliação.',
  'competency-question-response': 'A página percorre cinco contextos para a mesma competência, preserva o rascunho por questão e registra cada envio separadamente. A leitura demonstrativa não pontua nem define domínio.',
  'student-hero': 'Apresente a identidade pública do estudante com o mesmo vocabulário visual do perfil docente, adaptado a um papel discente.',
  'student-stories': 'Mostre projetos e momentos que o estudante escolhe compartilhar. A proposta preserva a natureza social dos stories sem expor registros escolares.',
  'student-tabs': 'As abas separam apresentação pública, percurso autorizado e publicações para que cada área mantenha seu contexto.',
  'student-progress': 'Demonstre apenas indicadores explicitamente liberados para o perfil. O estado vazio ou restrito ajuda a discutir consentimento e privacidade.',
  'student-achievements': 'Apresente conquistas como itens públicos escolhidos pelo estudante. A demonstração não inclui notas, respostas ou pareceres pedagógicos.',
  'student-privacy': 'Use este espaço para explicar o que pode aparecer no perfil e o que permanece no ambiente pedagógico reservado.',
  'community-calendar': 'Abra a página social pelo calendário: eventos e datas dão orientação temporal antes da leitura do feed.',
  'community-tabs': 'A navegação distingue feed, eventos e espaços de participação, mantendo cada conversa no contexto adequado.',
  'community-topics': 'Apresente tópicos como caminhos de descoberta por área e assunto, facilitando a entrada em comunidades relevantes.',
  'community-feed': 'O feed central mostra como uma publicação ganha contexto, autoria e interação. Conteúdo e reações são dados de demonstração.',
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
  'teacher-activity': 'Esta parte apresenta uma prática ou material que pode circular depois de ser examinado pela docente. Contexto, propósito e autoria permitem que outras pessoas compreendam a proposta, discutam suas escolhas e a adaptem a novas situações.\n\nA IA pode gerar alternativas; a docente verifica dados e hipóteses, corrige a atividade e decide publicar. A publicação compartilha conhecimento, sem levar junto respostas individuais ou devolutivas reservadas da sondagem.',
  'teacher-projects': 'Os projetos dão forma às sequências de compreensão que a docente planeja, revisa e disponibiliza. Uma sequência pode começar com uma situação, solicitar uma hipótese, oferecer uma representação, pedir uma decisão justificada e então introduzir uma condição que faça o estudante rever sua interpretação.\n\nA docente pode variar cenários, perguntas e apoios para observar outros modos de raciocinar, conservando a finalidade comum. O andamento do projeto deve ajudar a entender esse percurso, não apenas contar exercícios concluídos.',
  'teacher-agenda': 'A agenda organiza no tempo o preparo, a condução e a revisão de atividades docentes, além dos encontros da comunidade. Ela ajuda a relacionar uma sequência às turmas e aos momentos em que será usada, incluindo o tempo para conferir materiais gerados e analisar respostas.\n\nO calendário, por si só, não mede a qualidade da proposta nem comprova aprendizagem. Para isso, são necessárias evidências contextualizadas e a interpretação docente do que cada estudante apresentou.',
  'teacher-personalization': 'A personalização permite à docente ajustar a apresentação do perfil e escolher quais informações deseja tornar visíveis. Essa escolha dá controle sobre a identidade pública e a autoria de suas produções.\n\nQuando a adaptação alcança uma experiência de aprendizagem, a orientação do Capítulo 01 é variar contexto, perguntas e apoios para tornar outros raciocínios observáveis, sem alterar a finalidade comum de compreender a relação estudada. Personalizar não é repetir o mesmo exercício com outra aparência.',
  'pedagogy-context': 'A matéria e a turma situam as condições reais de trabalho: repertório, série, finalidade e possibilidades de participação. O contexto orienta exemplos e materiais, mas não substitui a competência que a atividade pretende mobilizar.\n\nA professora pode trabalhar a mesma relação em situações distintas para tornar a compreensão observável sem presumir características do estudante pelo lugar onde vive ou pelo grupo a que pertence.',
  'pedagogy-competency': 'A habilidade curricular funciona como referência; a competência explicita a ação que será exercida sobre um assunto. Só depois dessa relação a equipe escolhe situações, materiais e critérios para observar o trabalho.\n\nUma tarefa pode mobilizar mais de uma habilidade. A revisão precisa indicar que relações aquela questão realmente permite examinar, sem afirmar que a simples presença de códigos comprova aprendizagem.',
  'pedagogy-activity-builder': 'A professora escreve a compreensão que deseja observar e seleciona referências e contexto. A IA pode propor uma situação e alternativas de enunciado; a docente verifica se os dados são suficientes, se a pergunta exige o raciocínio pretendido e se a resposta não é antecipada pelo próprio texto.\n\nO rascunho permanece editável. A aprovação fixa uma revisão identificável para a turma; gerar outra versão não altera materiais já publicados nem muda silenciosamente os contratos de avaliação.',
  'pedagogy-evidence-review': 'A leitura do monitor descreve realizações em relação a critérios específicos e aponta trechos da resposta que sustentam cada atribuição. A professora pode corrigir a leitura ou registrar que o enunciado não produziu evidência suficiente.\n\nUma resposta pode sustentar um critério e não informar outro. A plataforma não transforma um parecer isolado em nota global, progressão curricular ou decisão automática sobre o próximo conteúdo.',
  'pedagogy-course-sequence': 'Um material de compreensão encadeia texto-base, exemplo comentado, prática guiada, tentativa independente e aplicação em outro contexto. Cada segmento explica a ação que pretende exercitar e a evidência que poderá produzir.\n\nA personalização responde a uma necessidade observada: a IA pode sugerir outra representação ou contexto, e a professora revisa a razão da mudança. Concluir uma etapa não basta para declarar a competência consolidada; é preciso observar a ação em uma situação adequada.',
  'pedagogy-material-share': 'Depois da revisão, a professora escolhe como apresentar o material, a quem disponibilizá-lo e quais partes podem circular. A publicação é um objeto próprio, vinculado à matéria e à competência sem carregar a resposta privada que motivou a produção.\n\nO conteúdo social comunica a proposta pedagógica e preserva sua autoria. Respostas individuais, hipóteses e pareceres de sondagem permanecem no acompanhamento reservado.',
  'learner-activity-brief': 'A atividade apresenta uma situação concreta, fornece os dados necessários e pede uma conclusão justificada sem revelar os critérios internos do monitor. O estudante pode estimar, organizar uma tabela, calcular ou explicar uma relação com suas próprias palavras.\n\nO contexto não dita um procedimento. Ele dá condições para que diferentes estratégias mostrem o que a pessoa considerou e como revisou sua hipótese diante de uma mudança.',
  'learner-response': 'A resposta é uma produção pedagógica privada, ligada à revisão da atividade e às referências usadas. O envio confirma uma tentativa sem apagar versões anteriores e sem publicar o texto no perfil social.\n\nA análise posterior deve localizar as evidências na própria resposta. Se faltar informação, isso descreve o que aquela produção mostrou, não uma característica fixa do estudante.',
  'learner-reflection': 'A reflexão devolve ao estudante uma leitura compreensível do que escreveu, com trechos que sustentam os pontos observados e uma oportunidade de continuar pensando.\n\nEla é um apoio para estudar, não uma nota ou decisão automática. O professor pode revisar o parecer, e uma nova resposta em outro contexto é necessária antes de concluir se a compreensão se mantém.',
  'leveling-invitation': 'O nivelamento começa por um convite associado a uma escola, turma e professora. A conferência desse vínculo evita uma matrícula aberta sem contexto e situa a série em que as questões serão apresentadas.\n\nEsta tela demonstra o caminho de um estudante já autorizado pela instituição. Nome, código e vínculo são dados fictícios; a página não realiza cadastro real nem solicita informações de um menor.',
  'leveling-scope': 'A sondagem inicial reúne cinco perguntas para a competência selecionada. Cada uma usa uma situação distinta para observar como o estudante considera dados, sustenta uma hipótese e reage a uma condição alterada.\n\nAs perguntas são ajustadas à idade e à série. O conjunto orienta uma leitura de evidências; não é uma escala automática, e repetir a análise da mesma resposta não conta como uma nova evidência.',
  'leveling-confirmation': 'A confirmação associa o estudante ao percurso de nivelamento da turma e libera as perguntas previstas. A tela explica o que será registrado antes de iniciar, preserva o caráter reservado das respostas e permite retornar ao convite para conferir seus dados.\n\nO vínculo demonstrativo fica apenas no estado local desta prévia. Nenhuma matrícula, identidade ou resposta é gravada em serviço real.',
  'quest-board': 'As quests criam oportunidades para investigar um problema e apresentar uma produção, em etapas curtas e com contexto identificável. Cada missão informa objetivo, tempo esperado e entrega antes de ser aceita.\n\nConcluir uma quest registra participação naquela proposta e pode liberar um selo demonstrativo. Isso não altera o nível curricular, não substitui a sondagem e não compara estudantes em um ranking de competência.',
  'quest-principles': 'Uma quest pode nascer de uma pergunta da turma, de um material revisado ou de um evento com regras próprias. O estudante sabe quem verá a entrega e pode acompanhar o estado da atividade.\n\nQuando uma produção também servir como evidência pedagógica, essa ligação precisa ser explícita e revisada pela professora. Um selo ou colocação de evento permanece separado da análise curricular.',
  'competency-question-context': 'A competência em foco é relacionar potência total, duração de uso e consumo. O contrato interno verifica essas relações por critérios, mas a questão mostra ao estudante somente a situação, os dados, as referências liberadas e o pedido de resposta.\n\nOs cinco itens mudam o contexto para observar a transferência da relação estudada. Em cada página, é possível salvar uma tentativa e revisar o próprio texto sem receber um rótulo global.',
  'competency-question-response': 'O estudante percorre cinco perguntas contextualizadas, uma por vez, e mantém um rascunho próprio em cada item. O envio guarda a resposta e apresenta uma reflexão estática de demonstração, claramente separada de uma análise real do modelo.\n\nA síntese mostra quais itens foram respondidos e encaminha o conjunto para revisão. Ela não calcula nota, não declara domínio e não muda automaticamente o próximo conteúdo.',
  'student-hero': 'O perfil apresenta a pessoa estudante, suas produções e aspectos de seu percurso que podem ser compartilhados. Ele permite reconhecer autoria e participação sem converter a identidade pública em prontuário de aprendizagem.\n\nRespostas da sondagem, hipóteses, dificuldades observadas e interpretações da IA pertencem ao acompanhamento reservado e não devem aparecer no perfil por padrão. A pessoa pode mostrar o que escolheu produzir enquanto o trabalho pedagógico conserva seu contexto e suas permissões.',
  'student-stories': 'Os stories abrem espaço para o estudante compartilhar trabalhos, descobertas e produções que escolheu divulgar. Uma representação, explicação ou projeto pode convidar outras pessoas a conhecer o raciocínio que ela expressa.\n\nEssa participação não publica automaticamente respostas de sondagem ou dificuldades individuais. Assim, a comunidade circula conhecimento e o acompanhamento formativo mantém privadas as devolutivas dirigidas a quem aprende e a quem orienta.',
  'student-tabs': 'As abas distinguem a apresentação pública, as áreas do percurso de aprendizagem e as produções que o estudante compartilha. Essa organização ajuda a entender para que serve cada informação e quem pode acessá-la.\n\nTambém evita confundir uma atividade social com a sondagem usada para compreender hipóteses e competências. O histórico reservado de respostas e devolutivas conserva seu propósito formativo e não se mistura com o perfil público.',
  'student-progress': 'Esta parte comunica aspectos autorizados do percurso e trata cada indicador como uma pista, não como uma conclusão automática de domínio. O Capítulo 01 propõe observar a compreensão em contextos variados, considerar idade e série e distinguir as evidências que cada resposta realmente apresenta.\n\nUma questão isolada pode revelar uma hipótese ou dificuldade específica, mas não determina sozinha o nível de uma competência. O resumo precisa ser compreensível para o estudante e coerente com a leitura pedagógica que o acompanha.',
  'student-achievements': 'As conquistas destacam participações, produções e marcos que o estudante escolheu apresentar. Elas podem reconhecer esforço ou contribuição e dar visibilidade ao que foi compartilhado com a comunidade.\n\nUma posição em evento ou medalha descreve aquela atividade e suas regras; não equivale ao nível curricular demonstrado. A compreensão de uma competência depende de evidências contextualizadas em diferentes situações e da interpretação pedagógica, não de um selo isolado.',
  'student-privacy': 'Este espaço explica quais informações do perfil podem circular e quais permanecem no ambiente reservado de aprendizagem. A fronteira protege respostas da sondagem, hipóteses, dificuldades identificadas e devolutivas individuais, que servem para orientar o estudo e o planejamento docente.\n\nMateriais e produções escolhidos para divulgação podem alimentar conversas e novas adaptações. A privacidade permite compartilhar conhecimento sem expor a avaliação de quem está aprendendo.',
  'community-calendar': 'O calendário organiza encontros, mostras, desafios e outras atividades coletivas, ajudando a comunidade a saber quando e como participar. Um evento pode partir de materiais preparados em uma sequência e criar novas oportunidades para apresentar ideias e comparar abordagens.\n\nAinda assim, cada evento tem regras, datas e resultados próprios. Uma classificação ou pontuação vale dentro daquela atividade e não deve ser confundida com a progressão curricular ou com o domínio individual do estudante.',
  'community-tabs': 'As abas conduzem entre publicações, eventos e espaços de participação, deixando claro em que contexto ocorre cada interação. No feed, a comunidade consulta e debate conhecimentos; nos eventos, acompanha regras e resultados específicos; nos grupos, sustenta relações e projetos.\n\nEssa organização permite que uma produção revisada circule sem carregar dados do acompanhamento reservado. A área social amplia o trabalho pedagógico, mas não se confunde com sua avaliação.',
  'community-topics': 'Os tópicos ajudam estudantes e docentes a descobrir conversas e materiais ligados a uma matéria, competência ou interesse. A comunidade pode comparar explicações, adaptar referências e propor novas situações para pensar o mesmo conhecimento.\n\nEsse encontro amplia as formas de compreensão descritas no Capítulo 01. Os tópicos organizam conhecimento compartilhável, enquanto diagnósticos, respostas individuais e devolutivas permanecem no espaço de acompanhamento.',
  'community-feed': 'O feed reúne publicações escolhidas por docentes ou estudantes para explicar uma ideia, apresentar uma produção ou iniciar uma discussão. Contexto e autoria permitem que outras pessoas entendam o propósito do material, dialoguem com ele e o adaptem sem apagar sua origem.\n\nEssa circulação prolonga o trabalho para além da aula e pode abrir novas situações de aprendizagem. Respostas da sondagem, erros individuais e pareceres reservados não são conteúdo social e não acompanham a publicação.',
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
    { id: 'quote', label: 'Frase de perfil', type: 'textarea', targetPath: 'quote' },
    { id: 'music', label: 'Status musical', type: 'text', targetPath: 'music' },
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
    presentation: presentationNotes[id] ?? description, evidence, fixtureKey, kind: id,
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
      partSpec('teacher-agenda', 'Agenda', 'Compromissos e horários da docente.', 'observed', 'teacher'),
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
      partSpec('pedagogy-activity-builder', 'Atividade aberta', 'Orientação docente, preenchimento por IA simulada e revisão editável.', 'derived', 'teacher-workspace'),
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
      partSpec('student-progress', 'Percurso autorizado', 'Indicadores liberados pelo estudante.', 'derived', 'student'),
      partSpec('student-achievements', 'Conquistas', 'Conquistas demonstrativas autorizadas.', 'derived', 'student'),
      partSpec('student-privacy', 'Apresentação e privacidade', 'Texto público e limites de visibilidade.', 'derived', 'student'),
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
    id: 'quests', title: 'Quests', description: 'Desafios contextualizados com objetivos e entregas visíveis.',
    presentation: 'Proposta derivada das missões e atividades coletivas descritas no projeto. O estudante escolhe uma quest, confere o objetivo e a entrega esperada, registra sua produção e acompanha o selo de participação sem confundi-lo com o nível curricular.',
    evidence: 'derived', fixtureKey: 'quests', defaultComponentId: 'quest-board',
    regions: [
      ...shellParts('quests', 'derived'),
      partSpec('quest-board', 'Painel de quests', 'Filtros, desafios, aceitação e entrega da missão.', 'derived', 'quests'),
      partSpec('quest-principles', 'Participação e conquistas', 'Escopo dos selos, eventos e dados privados.', 'derived', 'quests'),
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
    activityTitle: 'Linguagem conecta realidades',
    activityText: 'Aplicação de uma sequência didática sobre crônicas urbanas. Os estudantes trouxeram relatos da própria cidade e a sala virou um mapa de histórias.',
    activityTags: ['Língua Portuguesa', 'Crônicas', 'Cidade', 'Sequência didática'],
    likes: '24', comments: '8',
    projects: [
      { title: 'Leitura e Território', status: 'Em andamento', progress: '8/12 atividades' },
      { title: 'Podcast da Turma', status: 'Planejamento', progress: '2/6 atividades' },
      { title: 'Feira de Linguagens', status: 'Ideia', progress: '0/5 atividades' },
    ],
    agenda: [
      { time: '08:00', title: 'Aula 7º ano', detail: 'Análise de crônicas', tone: 'blue' },
      { time: '10:00', title: 'Planejamento', detail: 'Sequência didática', tone: 'teal' },
      { time: '14:00', title: 'Formação BNCC', detail: 'Competências de Linguagem', tone: 'rose' },
      { time: '16:00', title: 'Reunião de projeto', detail: 'Leitura e Território', tone: 'violet' },
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
    activityTitle: '', question: '', activityContext: '', knowledgeRelation: '',
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
      { id: 'energy-library', title: 'Energia em foco', category: 'Ciências · individual', status: 'Disponível', duration: '15 min', seal: 'Observador de energia',
        competency: 'Relacionar potência, duração e consumo', context: 'A biblioteca quer reduzir o uso de energia sem deixar os espaços sem iluminação ou ventilação.',
        challenge: 'Compare duas propostas de horário para os aparelhos. Explique que dados sustentam sua decisão e que condição do ambiente ainda seria preciso observar.',
        deliverable: 'Uma justificativa curta com os dados considerados.',
      },
      { id: 'water-garden', title: 'Rota da água', category: 'Ciências · investigação', status: 'Disponível', duration: '20 min', seal: 'Investigador de sistemas',
        competency: 'Interpretar evidências de uso de água', context: 'A horta da escola tem dois setores irrigados em horários diferentes. A equipe registrou volume e duração por cinco dias.',
        challenge: 'Proponha como comparar os setores e indique uma medição adicional antes de recomendar mudança no calendário de irrigação.',
        deliverable: 'Uma hipótese acompanhada de evidências e de uma pergunta para a próxima medição.',
      },
      { id: 'table-detective', title: 'Detetives da tabela', category: 'Ciências · colaboração', status: 'Disponível', duration: '10 min', seal: 'Leitor de dados',
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
    subtitle: 'Compartilhe práticas, participe de encontros e construa a comunidade.',
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
        author: 'Mariana Oliveira', role: 'Professora · Língua Portuguesa', time: 'há 2h',
        title: 'Sequência didática com crônicas urbanas',
        text: 'Compartilho aqui uma experiência que realizei com meus 7º anos. Os estudantes trouxeram relatos da própria cidade e a sala virou um mapa de histórias.',
        tags: ['Língua Portuguesa', 'Crônicas', 'Cidade', 'Sequência didática'], likes: '48', comments: '12',
      },
      {
        author: 'Rafael Mendes', role: 'Professor · Matemática', time: 'há 5h',
        title: 'Como trabalhar proporcionalidade com dados reais da comunidade?',
        text: 'Estou planejando uma sequência usando dados do comércio local. Alguém já aplicou algo parecido?',
        tags: ['Matemática', 'Dados reais', 'Proporcionalidade'], likes: '23', comments: '17',
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
type DemoPagePartProps = {
  id: string;
  title: string;
  content: string;
  presentation: string;
  evidence: ReferenceEvidence;
  selectedId: string;
  className: string;
  situation: ComponentMockSituation;
  prototypeParameters: PrototypeParameterValues;
};
type DemoPagePartInteraction = {
  groups: Record<string, string>;
  toggles: Record<string, boolean>;
  fields: Record<string, string>;
  publications: string[];
  actions: Record<string, number>;
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
  questionFeedback: string;
  feedback: string;
};
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
function labPart(id: string, content: string, selectedId: string, className = ''): string {
  if (!activePageComposition) throw new Error('Parte de página criada fora da composição de um componente de página.');
  const part = activePageComposition.existing.get(id) ?? document.createElement('lumira-page-part') as DemoPagePartElement;
  const situation = activePageComposition.situation;
  const region = referenceScreenSpecs.find(screen => screen.id === situation.screenId)?.regions.find(item => item.id === id);
  part.configure({
    id,
    title: region?.title ?? id.replaceAll('-', ' '),
    content,
    presentation: region?.presentation ?? '',
    evidence: region?.evidence ?? 'derived',
    selectedId,
    className,
    situation: { ...situation, status: situation.componentStates?.[id] ?? situation.status },
    prototypeParameters: activePageComposition.prototypeParameters[id] ?? {},
  });
  const slot = activePageComposition.parts.push(part) - 1;
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
function renderWorkspaceSidebar(screenId: string, data: ComponentFixture, selectedId: string): string {
  data = prototypeData('workspace-sidebar', data);
  const community = screenId === 'community';
  const teachingSpace = screenId === 'teacher-workspace';
  const learnerActivity = screenId === 'student-activity';
  const levelingEnrollment = screenId === 'leveling-enrollment';
  const questPage = screenId === 'quests';
  const competencyQuestions = screenId === 'competency-questions';
  const student = screenId === 'student-profile' || learnerActivity || levelingEnrollment || questPage || competencyQuestions;
  const name = labText(data, 'name', student ? 'Caio Almeida' : 'Ana Beatriz Silva');
  const labels = community ? ['Feed', 'Meus círculos', 'Explorar', 'Mensagens', 'Salvos']
    : teachingSpace ? ['Início', 'Matérias e turmas', 'Competências', 'Sondagem', 'Evidências', 'Cursos', 'Comunidade']
      : learnerActivity ? ['Início', 'Sondagem', 'Atividade', 'Cursos', 'Meu percurso', 'Comunidade']
        : levelingEnrollment ? ['Início', 'Matrícula', 'Nivelamento', 'Quests', 'Meu percurso']
          : questPage ? ['Início', 'Quests', 'Nivelamento', 'Cursos', 'Meu percurso']
            : competencyQuestions ? ['Início', 'Matrícula', 'Questões', 'Atividade', 'Meu percurso']
        : ['Perfil', 'Áreas', 'Cursos', 'Fórum', 'IA pedagógica'];
  const active = community ? 'Feed' : teachingSpace ? 'Matérias e turmas' : learnerActivity ? 'Atividade'
    : levelingEnrollment ? 'Matrícula' : questPage ? 'Quests' : competencyQuestions ? 'Questões' : 'Perfil';
  const links = labels.map(label => '<button type="button" class="lm-side-link ' + (label === active ? 'active' : '') + '"><span aria-hidden="true">' + (label === active ? '◉' : '◇') + '</span>' + e(label) + (label === 'Mensagens' ? '<i>3</i>' : '') + '</button>').join('');
  const content = '<div class="lm-brand"><span class="lm-brand-symbol">✳</span><span>Lumira</span></div>'
    + '<div class="lm-side-account">' + LabAvatar(name, student ? 'blue' : 'teal', 'small') + '<div><strong>' + e(name) + '</strong><small>' + e(student ? 'Estudante' : 'Professora') + '</small></div></div>'
    + '<nav class="lm-side-nav" aria-label="Navegação de demonstração">' + links + '</nav>'
    + '<aside class="lm-sidebar-promo"><span class="lm-sidebar-promo-mark">✦</span><p>' + e(community ? 'Professores que inspiram professores.' : teachingSpace ? 'Planeje experiências que tornam o conhecimento observável.' : learnerActivity ? 'Responda com suas próprias estratégias.' : levelingEnrollment ? 'Um convite claro para começar seu percurso.' : questPage ? 'Investigue situações e conte como chegou à sua ideia.' : competencyQuestions ? 'Cinco contextos para mostrar seu raciocínio.' : 'Educação que se conecta com o real.') + '</p><button type="button">' + (community ? 'Criar evento' : teachingSpace ? 'Abrir sondagem' : learnerActivity ? 'Ver meu percurso' : levelingEnrollment ? 'Ver as questões' : questPage ? 'Ver meu percurso' : competencyQuestions ? 'Voltar à matrícula' : 'Explorar áreas') + ' →</button></aside>'
    + '<footer class="lm-sidebar-footer">LUMIRA · COMPONENTING LAB</footer>';
  return labPart('workspace-sidebar', content, selectedId, 'lm-product-sidebar');
}
function renderWorkspaceTopbar(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('workspace-topbar', data);
  const name = labText(data, 'name', 'Ana Beatriz Silva');
  const content = '<div class="lm-search"><span aria-hidden="true">⌕</span><input aria-label="Buscar" placeholder="Buscar áreas, cursos, pessoas, conteúdos..." /></div>'
    + '<div class="lm-top-actions"><button type="button" class="lm-top-action">＋ <span>Criar</span></button><button type="button" class="lm-top-action">♧ <span>Notificações</span><i>3</i></button><button type="button" class="lm-user-menu">' + LabAvatar(name, 'teal', 'tiny') + '<span>' + e(name) + '</span><b>⌄</b></button></div>';
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
  const name = labText(data, 'name', student ? 'Caio Almeida' : 'Ana Beatriz Silva');
  const role = labText(data, 'role', student ? 'Estudante · 8º ano' : 'Professora de Língua Portuguesa');
  const chips = labList<string>(data, 'competencies').slice(0, 4).map(item => LabPill(item, 'glass')).join('');
  const school = labText(data, 'school', 'Escola Municipal Nova Esperança');
  const summary = student ? '<p class="lm-profile-school">' + e(school) + '</p>' : '<p class="lm-profile-quote">“' + e(labText(data, 'quote', 'Educação é caminho, colaboração e destino.')) + '”</p>';
  const music = student ? '' : '<div class="lm-music-status"><span>♫</span><span><b>' + e(labText(data, 'music', 'Boa Energia · Jota.Pê')) + '</b><small>NO PERFIL</small></span><button type="button" aria-label="Tocar música">▶</button></div>';
  const image = "url('" + profileCoverAsset + "')";
  const content = '<div class="lm-profile-cover" style="background-image:linear-gradient(90deg,rgba(7,35,67,.65),rgba(8,39,72,.17)),' + image + '">'
    + '<div class="lm-profile-cover-top"><span class="lm-eyebrow">PERFIL · ' + (student ? 'ESTUDANTE' : 'EDUCADORA') + '</span><button type="button" class="lm-cover-more">•••</button></div>'
    + '<div class="lm-profile-identity">' + LabAvatar(name, student ? 'blue' : 'teal', 'portrait') + '<div class="lm-profile-name"><h1>' + e(name) + ' <span class="lm-verified">✓</span></h1><p>' + e(role) + ' <span>·</span> ' + e(school) + '</p>' + summary + '<div class="lm-profile-pills">' + chips + '</div></div>'
    + '<div class="lm-profile-actions">' + music + '<button type="button" class="lm-light-button">✎ <span>Editar perfil</span></button><button type="button" class="lm-icon-button" aria-label="Compartilhar perfil">↗</button></div></div></div>';
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
  const content = '<nav class="lm-profile-tabs" aria-label="Seções do perfil">' + tabs.map((label, index) => '<button type="button" class="' + (index === 0 ? 'active' : '') + '">' + (index === 0 ? '<span>✦</span>' : '') + e(label) + '</button>').join('') + '</nav>';
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
  const content = '<article class="lm-panel lm-skills-panel"><header><h2>Competências principais</h2><button type="button" class="lm-text-action">Ver todas →</button></header><div class="lm-skill-list">' + skills + '</div></article>';
  return labPart('teacher-skills', content, selectedId, 'lm-profile-card-part');
}
function renderAboutPanel(data: ComponentFixture, selectedId: string, student = false): string {
  data = prototypeData(student ? 'student-privacy' : 'teacher-about', data);
  const affiliations = labList<string>(data, 'affiliations');
  const socials = labList<string>(data, 'socials');
  const content = '<article class="lm-panel lm-about-panel"><header><h2>' + (student ? 'Sobre mim' : 'Sobre mim') + '</h2><button type="button" class="lm-panel-edit" aria-label="Editar sobre mim">✎</button></header>'
    + '<p>' + e(labText(data, 'bio', 'Uma apresentação pública sobre aprendizagem, projetos e comunidade.')) + '</p>'
    + (student ? '<div class="lm-privacy-notice">' + e(labText(data, 'privacy', 'Este perfil exibe somente informações autorizadas para publicação.')) + '</div>' : '')
    + (student ? '' : '<div class="lm-affiliations">' + affiliations.map(item => '<span>⌂ ' + e(item) + '</span>').join('') + '</div>')
    + (student ? '' : '<div class="lm-social-links">' + socials.map((item, index) => '<button type="button" class="tone-' + (index % 4) + '" aria-label="' + e(item) + '">' + ['◎', 'in', 'f', '▶'][index % 4] + '</button>').join('') + '</div>');
  return labPart(student ? 'student-privacy' : 'teacher-about', content + '</article>', selectedId, 'lm-profile-card-part');
}
function renderActivityCard(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('teacher-activity', data);
  const content = '<article class="lm-panel lm-activity-panel"><header><h2>Posts e atividades</h2><div class="lm-filter-pills"><button class="active">Todos</button><button>Posts</button><button>Vídeos</button><button>Projetos</button></div><button type="button" class="lm-small-primary">Criar post</button></header>'
    + '<div class="lm-activity-author">' + LabAvatar(labText(data, 'name', 'Ana Beatriz Silva'), 'teal', 'tiny') + '<div><b>' + e(labText(data, 'name', 'Ana Beatriz Silva')) + '</b><small>Professora · há 2 dias</small></div><button type="button" class="lm-panel-more">⌄</button></div>'
    + '<h3>' + e(labText(data, 'activityTitle', 'Linguagem conecta realidades')) + '</h3><p>' + e(labText(data, 'activityText', 'Uma atividade compartilhada com a comunidade escolar.')) + '</p>'
    + '<div class="lm-activity-tags">' + labList<string>(data, 'activityTags').map(tag => LabPill(tag)).join('') + '</div>'
    + '<img class="lm-activity-image" src="' + communityPostAsset + '" alt="Professora e estudantes trabalhando juntos em uma atividade" />'
    + '<footer class="lm-post-actions"><button type="button" class="lm-like-action" aria-label="Curtir publicação">♡ ' + e(labText(data, 'likes', '24')) + '</button><span>◯ ' + e(labText(data, 'comments', '8')) + '</span><button type="button">↗ Compartilhar</button><button type="button">♧ Salvar</button></footer></article>';
  return labPart('teacher-activity', content, selectedId, 'lm-feed-card-part');
}
function renderProjectsPanel(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('teacher-projects', data);
  const projects = labList<ComponentFixture>(data, 'projects');
  const rows = projects.map((project, index) => '<article class="lm-project-row"><span class="lm-project-art art-' + index + '">✦</span><div><b>' + e(labText(project, 'title', 'Projeto')) + '</b><small>' + e(labText(project, 'progress', '0/4 atividades')) + '</small><div class="lm-project-meter"><i style="width:' + [67, 34, 12][index % 3] + '%"></i></div></div>' + LabPill(labText(project, 'status', 'Ideia'), index === 0 ? 'mint' : index === 1 ? 'lilac' : 'gray') + '</article>').join('');
  const content = '<article class="lm-panel lm-projects-panel"><header><h2>Meus projetos em andamento</h2><button type="button" class="lm-text-action">Ver todos →</button></header><div class="lm-project-list">' + rows + '</div><button type="button" class="lm-outline-action">＋ Criar novo projeto</button></article>';
  return labPart('teacher-projects', content, selectedId, 'lm-profile-card-part');
}
function renderAgendaPanel(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('teacher-agenda', data);
  const agenda = labList<ComponentFixture>(data, 'agenda');
  const rows = agenda.map(item => '<div class="lm-agenda-item"><time>' + e(labText(item, 'time', '09:00')) + '</time><i class="tone-' + e(labText(item, 'tone', 'blue')) + '"></i><div><b>' + e(labText(item, 'title', 'Atividade')) + '</b><small>' + e(labText(item, 'detail', 'Encontro da comunidade')) + '</small></div></div>').join('');
  const content = '<article class="lm-panel lm-agenda-panel"><header><h2>Minha agenda</h2><button type="button" class="lm-text-action">Ver agenda →</button></header><div class="lm-agenda-date">▦ <b>Hoje, 14 de outubro</b></div><div class="lm-agenda-list">' + rows + '</div></article>';
  return labPart('teacher-agenda', content, selectedId, 'lm-profile-card-part');
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
    + '<div class="lm-profile-lower">' + renderActivityCard(data, selectedId) + renderProjectsPanel(data, selectedId) + renderAgendaPanel(data, selectedId) + '</div>'
    + renderPersonalizationPanel(data, selectedId) + '</main></div></div>';
}
function renderStudentAchievements(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('student-achievements', data);
  const rows = labList<string>(data, 'achievements').map((item, index) => '<article class="lm-achievement"><span class="lm-achievement-icon tone-' + ['teal', 'sun', 'violet'][index % 3] + '">✦</span><div><b>' + e(item) + '</b><small>Autorizada para exibição pública</small></div><span class="lm-achievement-check">✓</span></article>').join('');
  const content = '<article class="lm-panel lm-student-achievements"><header><h2>Conquistas compartilhadas</h2><span>3 itens</span></header><div>' + rows + '</div></article>';
  return labPart('student-achievements', content, selectedId, 'lm-profile-card-part');
}
function renderStudentProfilePage(props: ComponentPageProps): string {
  const { data, situation } = props, selectedId = situation.selectedRegionId;
  return '<div class="lm-product-page lm-student-profile" data-page-id="student-profile"' + mockAttributes(situation) + '>'
    + renderWorkspaceSidebar('student-profile', data, selectedId)
    + '<div class="lm-product-main">' + renderWorkspaceTopbar(data, selectedId)
    + '<main class="lm-profile-canvas">' + renderProfileHero('student-hero', data, selectedId, true)
    + renderStories('student-stories', data, selectedId) + renderProfileTabs('student-tabs', data, selectedId)
    + '<div class="lm-student-overview">' + renderProgressCard(data, selectedId, true) + renderStudentAchievements(data, selectedId) + renderAboutPanel(data, selectedId, true) + '</div>'
    + '</main></div></div>';
}

function renderPedagogyContext(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('pedagogy-context', data);
  const content = '<section class="lm-workspace-context"><header><div><span class="lm-eyebrow">ESPAÇO DOCENTE · PLANEJAMENTO</span><h1>' + e(labText(data, 'subject', 'Ciências da Natureza')) + '</h1><p>Defina a turma e a situação em que a competência será exercida.</p></div><span class="lm-derived-label">PROPOSTA DERIVADA</span></header>'
    + '<div class="lm-context-fields"><label><span>Turma</span><select name="className" data-ai-field="className"><option ' + (labText(data, 'className') === '8º A' ? 'selected' : '') + '>8º A</option><option>8º B</option></select></label>'
    + '<label><span>Série</span><select name="grade" data-ai-field="grade"><option selected>8º ano</option><option>7º ano</option><option>9º ano</option></select></label>'
    + '<label class="lm-context-wide"><span>Contexto de aplicação</span><input name="context" data-ai-field="context" value="' + e(labText(data, 'context')) + '"></label></div>'
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
  const content = '<article class="lm-panel lm-activity-builder"><header><div><span class="lm-eyebrow">EDITOR DE ATIVIDADE · RASCUNHO V1</span><h2>Preparar uma questão aberta</h2><p>Descreva a compreensão desejada. A proposta simulada será preenchida em campos que você pode revisar.</p></div><span class="lm-ai-badge"><i></i> IA · SIMULAÇÃO</span></header>'
    + '<label class="lm-ai-prompt"><span>Orientação da professora</span><textarea name="prompt" data-ai-field="prompt" rows="4">' + e(labText(data, 'prompt')) + '</textarea></label>'
    + '<div class="lm-ai-actions"><label><span>Formato</span><select name="responseType" data-ai-field="responseType"><option>Resposta aberta com justificativa</option><option>Comparação com tabela</option><option>Explicação oral</option></select></label><button type="button" class="lm-primary-button" data-ai-generate="activity">✦ Gerar proposta demonstrativa</button></div>'
    + '<div class="lm-ai-empty" data-ai-empty><span aria-hidden="true">✳</span><div><b>Prévia ainda não gerada</b><p>A sugestão aparecerá aqui para edição. Nenhum modelo está conectado.</p></div></div>'
    + '<section class="lm-generated-activity" data-ai-generated-card hidden><div class="lm-generated-heading"><div><span class="lm-eyebrow">RASCUNHO SUGERIDO · DEMONSTRAÇÃO LOCAL</span><h3>Revise cada campo antes de aprovar</h3></div><button type="button" class="lm-quiet-action" data-ai-generate="activity">Gerar alternativa</button></div>'
    + '<div class="lm-activity-edit-grid"><label><span>Título</span><input name="activityTitle" data-ai-field="activityTitle" value=""></label><label class="lm-edit-wide"><span>Enunciado apresentado ao estudante</span><textarea name="question" data-ai-field="question" rows="4"></textarea></label><label><span>Contexto e dados</span><textarea name="activityContext" data-ai-field="activityContext" rows="3"></textarea></label><label><span>Relação planejada · uso docente</span><textarea name="teacherRelation" data-ai-field="teacherRelation" rows="3"></textarea></label></div>'
    + '<div class="lm-generated-actions"><label><input type="checkbox" name="teacherReviewed" data-ai-field="teacherReviewed"><span>Conferi se os dados são suficientes e se o enunciado não antecipa a conclusão.</span></label><button type="button" class="lm-primary-button" data-review-action="activity">Aprovar rascunho para revisão</button></div><p class="lm-action-feedback" data-review-feedback role="status"></p></section>'
    + '<p class="lm-pedagogy-note">A aprovação cria uma revisão de demonstração. Não publica nem altera uma atividade real.</p></article>';
  return labPart('pedagogy-activity-builder', content, selectedId, 'lm-pedagogy-panel-part');
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

type QuestFixture = {
  id: string; title: string; category: string; status: string; duration: string; seal: string;
  competency: string; context: string; challenge: string; deliverable: string;
};
function renderQuestBoard(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('quest-board', data);
  const quests = labList<QuestFixture>(data, 'quests');
  const filters: Array<[string, string]> = [['all', 'Todas'], ['available', 'Disponíveis'], ['in-progress', 'Em andamento'], ['completed', 'Concluídas']];
  const content = '<section class="lm-panel lm-quest-board"><header><div><span class="lm-eyebrow">MISSÕES DE APRENDIZAGEM · DEMONSTRAÇÃO</span><h2>Escolha uma quest</h2><p>Cada desafio explica o que investigar e qual produção será registrada.</p></div><span class="lm-quest-count">' + String(quests.length).padStart(2, '0') + ' MISSÕES</span></header>'
    + '<nav class="lm-quest-filters" aria-label="Filtrar quests">' + filters.map(([id, label], index) => '<button type="button" data-quest-filter="' + id + '" class="' + (index === 0 ? 'active' : '') + '" aria-pressed="' + String(index === 0) + '">' + e(label) + '</button>').join('') + '</nav>'
    + '<p class="lm-action-feedback" data-quest-feedback role="status"></p>'
    + '<div class="lm-quest-layout"><div class="lm-quest-list" role="list" aria-label="Quests disponíveis">' + quests.map((quest, index) => '<button type="button" class="lm-quest-card ' + (index === 0 ? 'active' : '') + '" data-quest-select="' + e(quest.id) + '" data-quest-status="available" aria-pressed="' + String(index === 0) + '"><span class="lm-quest-card-icon">' + (index === 0 ? '⌁' : index === 1 ? '◉' : '⌗') + '</span><span><small>' + e(quest.category) + '</small><b>' + e(quest.title) + '</b><i data-quest-card-state>Disponível</i></span><span class="lm-quest-card-arrow">→</span></button>').join('') + '</div>'
    + '<div class="lm-quest-details">' + quests.map(quest => '<article class="lm-quest-detail" data-quest-detail="' + e(quest.id) + '" hidden><header><div><span class="lm-eyebrow">' + e(quest.category) + ' · ' + e(quest.duration) + '</span><h3>' + e(quest.title) + '</h3></div><span class="lm-quest-status" data-quest-status-label>DISPONÍVEL</span></header>'
      + '<div class="lm-quest-competency"><small>RELAÇÃO EM FOCO</small><b>' + e(quest.competency) + '</b></div><div class="lm-quest-story"><small>A SITUAÇÃO</small><p>' + e(quest.context) + '</p></div><div class="lm-quest-challenge"><small>SUA MISSÃO</small><p>' + e(quest.challenge) + '</p></div><div class="lm-quest-deliverable"><span>ENTREGA</span><b>' + e(quest.deliverable) + '</b></div>'
      + '<button type="button" class="lm-primary-button" data-quest-action="accept" data-quest-id="' + e(quest.id) + '">Aceitar missão</button>'
      + '<form data-quest-form="' + e(quest.id) + '" hidden><label><span>Seu registro da missão</span><textarea name="questAnswer" data-interaction-field="quest-answer:' + e(quest.id) + '" rows="4" placeholder="Explique os dados e as escolhas que orientam sua ideia."></textarea></label><div class="lm-quest-submit-row"><span>Seu rascunho fica nesta demonstração local.</span><button type="submit" class="lm-primary-button">Registrar entrega <span aria-hidden="true">→</span></button></div></form>'
      + '<section class="lm-quest-complete" data-quest-complete="' + e(quest.id) + '" hidden><span class="lm-quest-seal">✦</span><div><small>PARTICIPAÇÃO REGISTRADA</small><b>' + e(quest.seal) + '</b><p data-quest-completed-answer></p><span>O selo pertence a esta missão e não altera sua avaliação de competência.</span></div></section></article>').join('') + '</div></div>'
    + '<p class="lm-pedagogy-note">Quests não usam ranking curricular. Uma colocação competitiva só cabe em um evento com regras e resultados próprios.</p></section>';
  return labPart('quest-board', content, selectedId, 'lm-pedagogy-panel-part');
}

function renderQuestPrinciples(selectedId: string): string {
  const content = '<aside class="lm-panel lm-quest-principles"><div><span class="lm-quest-principles-icon">✳</span><div><span class="lm-eyebrow">PARTICIPAÇÃO COM CONTEXTO</span><h2>Uma missão pode abrir novas perguntas</h2></div></div><p>Investigue, compare e explique seu caminho. O selo reconhece participação nesta quest; a compreensão curricular continua acompanhada pelas respostas e evidências de cada competência.</p><button type="button" class="lm-quiet-action" data-screen-select="competency-questions">Ir para questões de competência <span aria-hidden="true">→</span></button></aside>';
  return labPart('quest-principles', content, selectedId, 'lm-pedagogy-panel-part');
}

function renderQuestsPage(props: ComponentPageProps): string {
  const { data, situation } = props, selectedId = situation.selectedRegionId;
  return '<div class="lm-product-page lm-quests-page" data-page-id="quests"' + mockAttributes(situation) + '>'
    + renderWorkspaceSidebar('quests', data, selectedId) + '<div class="lm-product-main">' + renderWorkspaceTopbar(data, selectedId)
    + '<main class="lm-learner-canvas lm-quests-canvas"><header class="lm-learner-heading"><span class="lm-eyebrow">MEU ESPAÇO DE APRENDIZAGEM · DESAFIOS</span><h1>Quests</h1><p>Escolha um desafio, investigue a situação e registre sua produção.</p></header>'
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
    + '<section class="lm-question-session-complete" data-question-session-complete hidden><span class="lm-enrollment-success-mark" aria-hidden="true">✓</span><div><span class="lm-eyebrow">CINCO RESPOSTAS REGISTRADAS</span><h3>Suas respostas seguem para revisão</h3><p>A síntese não calcula nota nem define seu nível. A professora interpreta evidências em conjunto e decide o próximo passo.</p><button type="button" class="lm-primary-button" data-screen-select="quests">Explorar quests <span aria-hidden="true">→</span></button></div></section>'
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
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const offset = 4, daysInMonth = 31;
  const cells = Array.from({ length: offset + daysInMonth }, (_, index) => {
    const day = index - offset + 1;
    if (day < 1) return '<div class="lm-calendar-day empty"></div>';
    const dayEvents = events.filter(event => event.day === day);
    return '<div class="lm-calendar-day"><b>' + day + '</b>' + dayEvents.map(event => '<span class="lm-calendar-event tone-' + e(event.color) + '">' + e(event.title) + '</span>').join('') + '</div>';
  });
  const image = "url('" + profileCoverAsset + "')";
  const content = '<section class="lm-community-cover" style="background-image:linear-gradient(180deg,rgba(5,32,60,.2),rgba(7,32,57,.78)),' + image + '">'
    + '<div class="lm-community-heading"><div><span class="lm-eyebrow">LUMIRA · COMUNIDADE</span><h1>' + e(labText(data, 'title', 'Eventos e encontros')) + '</h1><p>' + e(labText(data, 'subtitle', 'Compartilhe práticas e construa a comunidade.')) + '</p></div><div class="lm-calendar-actions"><button type="button">＋ Criar</button><button type="button">♧ Notificações <i>3</i></button></div></div>'
    + '<div class="lm-calendar-toolbar"><div><button type="button">‹</button><button type="button">›</button><b>' + e(labText(data, 'month', 'Outubro 2026')) + '</b><button type="button">Hoje</button></div><div><button type="button" class="active">Mês</button><button type="button">Semana</button><button type="button">Agenda</button><button type="button" class="lm-calendar-new">＋ Novo evento</button></div></div>'
    + '<div class="lm-calendar-grid">' + weekdays.map(label => '<span class="lm-weekday">' + label + '</span>').join('') + cells.join('') + '</div></section>';
  return labPart('community-calendar', content, selectedId, 'lm-community-calendar-part');
}
function renderCommunityTabs(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('community-tabs', data);
  const tabs = labList<string>(data, 'tabs');
  const content = '<nav class="lm-community-tabs">' + tabs.map((label, index) => '<button type="button" class="' + (index === 0 ? 'active' : '') + '">' + e(label) + '</button>').join('') + '<button type="button" class="lm-community-sort">Mais relevantes⌄</button></nav>';
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
function renderCommunityFeed(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('community-feed', data);
  const posts = labList<ComponentFixture>(data, 'posts');
  const cards = posts.map((post, index) => `
    <article class="lm-panel lm-community-post">
      <header>${LabAvatar(labText(post, 'author', 'Comunidade'), index === 0 ? 'rose' : 'blue', 'tiny')}<div><b>${e(labText(post, 'author', 'Comunidade'))}</b><small>${e(labText(post, 'role', 'Educador · Comunidade'))} · ${e(labText(post, 'time', 'há 2h'))}</small></div><button type="button" class="lm-panel-more">•••</button></header>
      <h2>${e(labText(post, 'title', 'Publicação da comunidade'))}</h2><p>${e(labText(post, 'text', 'Compartilhe uma experiência com a comunidade.'))}</p>
      <div class="lm-post-tags">${labList<string>(post, 'tags').map(tag => LabPill(tag)).join('')}</div>
      ${index === 0 ? '<img class="lm-community-photo" src="' + communityPostAsset + '" alt="Professora e estudantes colaborando em sala de aula" />' : ''}
      <footer class="lm-post-actions"><button type="button" class="lm-like-action" aria-label="Curtir publicação">♡ ${e(labText(post, 'likes', '0'))}</button><span>◯ ${e(labText(post, 'comments', '0'))}</span><button type="button">♧ Salvar</button><button type="button">•••</button></footer>
    </article>`).join('');
  const composer = '<form class="lm-panel lm-post-composer">' + LabAvatar('Ana Beatriz', 'teal', 'tiny') + '<div><textarea name="post" aria-label="Texto da publicação" placeholder="Compartilhe uma ideia, experiência ou dúvida..."></textarea><footer><div class="lm-compose-options"><button type="button">✎ Texto</button><button type="button">▧ Foto</button><button type="button">▶ Vídeo</button><button type="button">▣ Projeto</button></div><button type="submit" class="lm-small-primary">Publicar</button></footer></div></form>';
  return labPart('community-feed', '<div class="lm-community-feed-stack">' + composer + cards + '</div>', selectedId, 'lm-community-column-part');
}
function renderCommunityAside(data: ComponentFixture, selectedId: string): string {
  data = prototypeData('community-aside', data);
  const events = labList<CommunityEventFixture>(data, 'events').slice(0, 12);
  const people = labList<ComponentFixture>(data, 'people'), groups = labList<ComponentFixture>(data, 'groups');
  const eventRows = events.map(event => '<div class="lm-upcoming-event"><span class="lm-date-badge"><b>' + event.day + '</b><small>OUT</small></span><div><b>' + e(event.title) + '</b><small>Online · ' + e(event.time) + '</small><button type="button" class="lm-event-register">Inscrever-se →</button></div></div>').join('');
  const peopleRows = people.map(person => '<div class="lm-suggested-person">' + LabAvatar(labText(person, 'name', 'Educador'), labText(person, 'tone', 'teal'), 'tiny') + '<div><b>' + e(labText(person, 'name', 'Educador')) + '</b><small>' + e(labText(person, 'role', 'Comunidade')) + '</small></div><button type="button">Seguir</button></div>').join('');
  const groupRows = groups.map(group => '<div class="lm-suggested-group"><span class="lm-group-thumb">✳</span><div><b>' + e(labText(group, 'name', 'Grupo')) + '</b><small>' + e(labText(group, 'members', '0 membros')) + '</small></div><button type="button">＋</button></div>').join('');
  const content = '<div class="lm-community-stack"><article class="lm-panel lm-upcoming-panel"><header><h2>Próximos eventos</h2><button class="lm-text-action">Ver agenda →</button></header>' + eventRows + '</article>'
    + '<article class="lm-panel lm-people-panel"><header><h2>Pessoas para seguir</h2><button class="lm-text-action">Ver mais →</button></header>' + peopleRows + '</article>'
    + '<article class="lm-panel lm-groups-panel"><header><h2>Comunidades e grupos</h2><button class="lm-text-action">Ver todas →</button></header>' + groupRows + '</article></div>';
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

      constructor() {
        super();
        this.transitions = componentState<DemoPagePartState>({
          id: '', title: '', content: '', presentation: '', evidence: 'derived', selectedId: '', className: '', situation: emptySituation(''),
          prototypeParameters: {},
          interaction: {
            groups: {}, toggles: {}, fields: {}, publications: [], actions: {}, localStories: [], aiGenerated: {},
            selectedStory: null, storyAnswers: {}, storyComposerOpen: false, storyComposerExpanded: false, storyComposerTool: 'text', storyOrientation: 'portrait',
            storyFilter: 'original', storyImage: '', storyReplies: {}, aiReflection: '', studentSubmissions: [],
            reviewFeedback: '', shareFeedback: '', responseFeedback: '', enrollmentFeedback: '', questFeedback: '', questionFeedback: '', feedback: '',
          },
        });
        this.state = this.transitions.next().value;
        this.addEventListener('click', event => this.onClick(event));
        this.addEventListener('input', event => this.onInput(event));
        this.addEventListener('change', event => this.onChange(event));
        this.addEventListener('submit', event => this.onSubmit(event));
      }
      configure(props: DemoPagePartProps): void {
        const snapshot = structuredClone(props);
        this.state = this.transitions.next(current => ({
          ...snapshot,
          interaction: {
            ...current.interaction,
            selectedStory: current.interaction.selectedStory ?? (props.id.endsWith('-stories') ? 0 : null),
          },
        })).value;
        this.render();
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
        groups.forEach((group, index) => {
          const key = id + ':group:' + index;
          group.dataset.interactionGroup = key;
          const buttons = [...group.querySelectorAll<HTMLButtonElement>('button')].filter(button => !button.classList.contains('lm-community-sort'));
          buttons.forEach((button, buttonIndex) => {
            button.dataset.interactionGroup = key;
            button.dataset.interactionValue = String(buttonIndex);
          });
        });
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
          field.dataset.interactionField = id + ':' + fieldName;
          if (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) {
            field.dataset.interactionToggle = id + ':toggle:' + fieldName;
          }
        });
        this.querySelectorAll<HTMLButtonElement>('button').forEach((button, index) => {
          const scope = button.closest<HTMLElement>('.lm-suggested-person, .lm-suggested-group, .lm-upcoming-event, .lm-community-post, .lm-activity-author, .lm-project-row, .lm-story-card');
          const scopeName = scope?.querySelector('b')?.textContent?.trim() || '';
          button.dataset.interactionKey = id + ':button:' + index + ':' + scopeName;
          button.dataset.actionLabel = button.textContent?.trim() ?? '';
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
      private restoreInteraction(): void {
        const { interaction } = this.state;
        const feed = this.querySelector<HTMLElement>('.lm-community-feed-stack');
        if (feed) {
          for (const text of interaction.publications) {
            const article = document.createElement('article');
            article.className = 'lm-panel lm-community-post lm-local-post';
            const heading = document.createElement('h2');
            heading.textContent = 'Nova publicação';
            const body = document.createElement('p');
            body.textContent = text;
            const footer = document.createElement('small');
            footer.textContent = 'Publicado nesta demonstração';
            article.append(heading, body, footer);
            feed.prepend(article);
          }
        }
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
        this.restorePedagogyDemo();
        if (interaction.feedback) {
          const feedback = document.createElement('p');
          feedback.className = 'lm-component-feedback';
          feedback.setAttribute('role', 'status');
          feedback.textContent = interaction.feedback;
          this.append(feedback);
        }
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
        const activityGenerated = interaction.aiGenerated.activity === true;
        const activityCard = this.querySelector<HTMLElement>('[data-ai-generated-card]');
        const activityEmpty = this.querySelector<HTMLElement>('[data-ai-empty]');
        if (activityCard) activityCard.hidden = !activityGenerated;
        if (activityEmpty) activityEmpty.hidden = activityGenerated;
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

        const questCards = [...this.querySelectorAll<HTMLButtonElement>('[data-quest-select]')];
        const questFilter = interaction.groups['quest-filter'] ?? 'all';
        const selectedQuest = interaction.groups['quest-selected'] ?? questCards[0]?.dataset.questSelect ?? '';
        const questStatus = (id: string): 'available' | 'in-progress' | 'completed' => interaction.toggles['quest-completed:' + id]
          ? 'completed' : interaction.toggles['quest-accepted:' + id] ? 'in-progress' : 'available';
        questCards.forEach(card => {
          const id = card.dataset.questSelect ?? '';
          const status = questStatus(id);
          card.dataset.questStatus = status;
          card.hidden = questFilter !== 'all' && questFilter !== status;
          card.classList.toggle('active', id === selectedQuest);
          card.setAttribute('aria-pressed', String(id === selectedQuest));
          const state = card.querySelector<HTMLElement>('[data-quest-card-state]');
          if (state) state.textContent = status === 'completed' ? 'Concluída' : status === 'in-progress' ? 'Em andamento' : 'Disponível';
        });
        this.querySelectorAll<HTMLButtonElement>('[data-quest-filter]').forEach(button => {
          const active = button.dataset.questFilter === questFilter;
          button.classList.toggle('active', active);
          button.setAttribute('aria-pressed', String(active));
        });
        this.querySelectorAll<HTMLElement>('[data-quest-detail]').forEach(panel => {
          const id = panel.dataset.questDetail ?? '';
          const selected = id === selectedQuest;
          const status = questStatus(id);
          panel.hidden = !selected;
          const statusLabel = panel.querySelector<HTMLElement>('[data-quest-status-label]');
          if (statusLabel) statusLabel.textContent = status === 'completed' ? 'CONCLUÍDA' : status === 'in-progress' ? 'EM ANDAMENTO' : 'DISPONÍVEL';
          const accept = panel.querySelector<HTMLButtonElement>('[data-quest-action="accept"]');
          if (accept) accept.hidden = status !== 'available';
          const form = panel.querySelector<HTMLFormElement>('[data-quest-form]');
          if (form) form.hidden = status !== 'in-progress';
          const complete = panel.querySelector<HTMLElement>('[data-quest-complete]');
          if (complete) complete.hidden = status !== 'completed';
          const answer = complete?.querySelector<HTMLElement>('[data-quest-completed-answer]');
          if (answer) answer.textContent = interaction.fields['quest-answer:' + id] ? 'Seu registro: “' + interaction.fields['quest-answer:' + id] + '”' : '';
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
      private onClick(event: Event): void {
        if (!(event.target instanceof Element)) return;
        const checkbox = event.target.closest<HTMLInputElement>('input[type="checkbox"], input[type="radio"]');
        if (checkbox && this.contains(checkbox)) {
          const key = checkbox.dataset.interactionToggle;
          if (key) {
            const feedback = this.state.id === 'pedagogy-activity-builder'
              ? 'Conferência do rascunho atualizada.'
              : this.state.id === 'pedagogy-competency'
                ? 'Critério de observação atualizado.'
                : this.state.id === 'pedagogy-material-share'
                  ? 'Seleção de publicação atualizada.'
                  : this.state.id === 'leveling-confirmation'
                    ? 'Conferência do convite atualizada.'
                  : 'Preferência atualizada nesta demonstração.';
            this.transitionInteraction(interaction => ({ ...interaction, toggles: { ...interaction.toggles, [key]: checkbox.checked }, feedback }));
            this.render();
          }
          return;
        }
        const button = event.target.closest<HTMLButtonElement>('button');
        if (!button || button.disabled || !this.contains(button)) return;
        if (button.type === 'submit') return;
        // Deixe a navegação entre telas chegar ao Componenting Demo Lab, que
        // controla a montagem da página e a URL selecionada.
        if (button.hasAttribute('data-screen-select')) return;
        if (button.dataset.questFilter) {
          const filter = button.dataset.questFilter;
          const cards = [...this.querySelectorAll<HTMLButtonElement>('[data-quest-select]')];
          const statusFor = (id: string): string => this.state.interaction.toggles['quest-completed:' + id]
            ? 'completed' : this.state.interaction.toggles['quest-accepted:' + id] ? 'in-progress' : 'available';
          const nextSelection = filter === 'all' ? this.state.interaction.groups['quest-selected'] ?? cards[0]?.dataset.questSelect ?? ''
            : cards.find(card => statusFor(card.dataset.questSelect ?? '') === filter)?.dataset.questSelect ?? '';
          this.transitionInteraction(interaction => ({
            ...interaction,
            groups: { ...interaction.groups, 'quest-filter': filter, 'quest-selected': nextSelection },
            questFeedback: filter === 'all' ? 'Mostrando todas as missões.' : filter === 'available' ? 'Mostrando quests disponíveis.' : filter === 'in-progress' ? 'Mostrando quests em andamento.' : 'Mostrando quests concluídas.',
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
        if (button.dataset.questAction === 'accept') {
          const questId = button.dataset.questId ?? '';
          this.transitionInteraction(interaction => ({
            ...interaction,
            groups: { ...interaction.groups, 'quest-selected': questId },
            toggles: { ...interaction.toggles, ['quest-accepted:' + questId]: true },
            questFeedback: 'Quest aceita. Registre sua entrega quando concluir a investigação.',
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
          if (button.dataset.aiGenerate === 'activity' && this.state.id === 'pedagogy-activity-builder') {
            this.fillMockAiFields({
              activityTitle: 'A energia que a biblioteca precisa',
              question: 'A equipe da biblioteca compara duas propostas de uso. Qual delas reduz mais o consumo no período? Construa uma conclusão para a escola, explique quais dados usou e indique se uma informação adicional poderia mudar sua decisão.',
              activityContext: 'Oito lâmpadas de 10 W ficam acesas por 6 horas ao dia. O ventilador de 100 W passará de 8 para 4 horas diárias. O período observado é de 20 dias.',
              teacherRelation: 'Relacionar potência total e duração de uso para comparar a energia consumida. A redução do tempo pode mudar uma conclusão baseada apenas na potência de um aparelho.',
            });
            this.transitionInteraction(interaction => ({ ...interaction, aiGenerated: { ...interaction.aiGenerated, activity: true }, reviewFeedback: 'Rascunho demonstrativo pronto para revisão. Confira dados, pergunta e relação pretendida.' }));
          } else if (button.dataset.aiGenerate === 'sequence' && this.state.id === 'pedagogy-course-sequence') {
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
          if (this.state.id === 'pedagogy-activity-builder') {
            const reviewed = this.querySelector<HTMLInputElement>('[name="teacherReviewed"]')?.checked === true;
            reviewFeedback = reviewed
              ? 'Rascunho aprovado para revisão da professora. A publicação ainda exige a conferência final do material.'
              : 'Marque a conferência dos dados e do enunciado antes de aprovar o rascunho.';
          } else if (this.state.id === 'pedagogy-evidence-review') {
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
      private onInput(event: Event): void {
        if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement)) return;
        const field = event.target;
        const key = field.dataset.interactionField;
        if (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) return;
        if (field.dataset.storyField) {
          this.transitionInteraction(interaction => ({ ...interaction, fields: { ...interaction.fields, [this.storyFieldKey(field.dataset.storyField ?? '')]: field.value } }));
          this.syncStoryComposerPreview();
          return;
        }
        if (!key) return;
        this.transitionInteraction(interaction => ({ ...interaction, fields: { ...interaction.fields, [key]: field.value } }));
      }
      private onChange(event: Event): void {
        if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement)) return;
        const field = event.target;
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
        if (!key) return;
        if (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) {
          const toggle = field.dataset.interactionToggle ?? key;
          const feedback = this.state.id === 'pedagogy-activity-builder'
            ? 'Conferência do rascunho atualizada.'
            : this.state.id === 'pedagogy-competency'
              ? 'Critério de observação atualizado.'
              : this.state.id === 'pedagogy-material-share'
                ? 'Seleção de publicação atualizada.'
                : 'Preferência atualizada nesta demonstração.';
          this.transitionInteraction(interaction => ({ ...interaction, toggles: { ...interaction.toggles, [toggle]: field.checked }, feedback }));
        } else {
          this.transitionInteraction(interaction => ({ ...interaction, fields: { ...interaction.fields, [key]: field.value } }));
        }
        this.render();
      }
      private onSubmit(event: Event): void {
        event.preventDefault();
        const form = event.target instanceof HTMLFormElement ? event.target : undefined;
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
        if (form?.matches('[data-quest-form]') && this.state.id === 'quest-board') {
          const questId = form.dataset.questForm ?? '';
          const response = form.querySelector<HTMLTextAreaElement>('textarea[name="questAnswer"]')?.value.trim() ?? '';
          if (!response) {
            this.transitionInteraction(interaction => ({ ...interaction, questFeedback: 'Escreva seu registro antes de concluir a quest.' }));
          } else {
            this.transitionInteraction(interaction => ({
              ...interaction,
              toggles: { ...interaction.toggles, ['quest-accepted:' + questId]: true, ['quest-completed:' + questId]: true },
              fields: { ...interaction.fields, ['quest-answer:' + questId]: response },
              questFeedback: 'Entrega registrada. O selo reconhece sua participação nesta quest, sem alterar o nível da competência.',
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
        if (this.state.id === 'community-feed' && form) {
          const field = form.querySelector<HTMLTextAreaElement>('textarea[name="post"]');
          const text = field?.value.trim() ?? '';
          if (!text) {
            this.transitionInteraction(interaction => ({ ...interaction, feedback: 'Escreva uma publicação antes de enviar.' }));
            this.render();
            return;
          }
          const fieldKey = field?.dataset.interactionField;
          this.transitionInteraction(interaction => ({
            ...interaction,
            publications: [...interaction.publications, text],
            fields: fieldKey ? { ...interaction.fields, [fieldKey]: '' } : interaction.fields,
            feedback: 'Publicação adicionada ao feed local.',
          }));
        } else if (this.state.id === 'access-form') {
          this.transitionInteraction(interaction => ({ ...interaction, feedback: 'Acesso demonstrativo processado; autenticação real não está conectada.' }));
        } else {
          this.transitionInteraction(interaction => ({ ...interaction, feedback: 'Envio concluído nesta demonstração.' }));
        }
        this.render();
      }
      private render(): void {
        const { id, title, content, presentation, evidence, selectedId, className, situation, prototypeParameters } = this.state;
        this.className = 'lm-page-part ' + e(className) + (id === selectedId ? ' is-selected' : '');
        this.dataset.componentId = id;
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
        const evidenceLabels: Record<ReferenceEvidence, string> = {
          observed: 'Referência observada',
          derived: 'Composição derivada',
          'navigation-only': 'Mapa de navegação',
        };
        const screenSpec = referenceScreenSpecs.find(screen => screen.id === situation.screenId);
        const partIndex = screenSpec?.regions.findIndex(region => region.id === id) ?? -1;
        const flowHeading = situation.presentationMode === 'continuous-list'
          ? '<header class="lm-flow-element-heading"><span class="lm-component-index">' + String(partIndex + 1).padStart(2, '0')
            + '</span><h2>' + e(title) + '</h2><span class="lm-evidence-badge ' + e(evidence) + '">' + e(evidenceLabels[evidence]) + '</span></header>'
          : '';
        if (situation.presentationMode === 'continuous-list') {
          this.id = 'lab-point-' + id;
          this.dataset.scrollpoint = id;
        } else {
          this.removeAttribute('id');
          delete this.dataset.scrollpoint;
        }
        const presentationBlock = situation.presentationMode === 'continuous-list' && presentation
          ? '<aside class="lm-part-presentation"><header><span class="lm-eyebrow">CONTEXTO DA PARTE</span><span class="lm-evidence-badge ' + e(evidence) + '">' + e(evidenceLabels[evidence]) + '</span></header>'
            + '<h3>' + e(title) + '</h3><p>' + e(presentation) + '</p></aside>'
          : '';
        const visibleContent = prototypeParameters.visible === false
          ? '<div class="lm-prototype-hidden" role="status"><strong>Componente oculto</strong><span>Ative “Exibir componente” nos parâmetros para mostrar a peça.</span></div>'
          : content;
        this.innerHTML = flowHeading + presentationBlock + visibleContent + componentStateLayer(situation.status);
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
