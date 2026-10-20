/** Componentes, páginas e dados iniciais da plataforma e do Componenting Demo Lab. */

import type { AppSnapshot, CommunityEvent, SessionUser } from './types';
import profileCoverAsset from './assets/profile/serra-dourada-cover.webp';
import communityPostAsset from './assets/community/sala-colaborativa.webp';

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
  'workspace-sidebar': 'A navegação lateral situa a pessoa nas áreas que compõem a Lumira e mantém o papel ativo como contexto para a experiência. ' +
    'Isso ajuda professor e estudante a chegar às suas superfícies de trabalho sem misturar preparação pedagógica, acompanhamento de respostas e circulação social.',
  'workspace-topbar': 'A barra superior reúne acesso às ações comuns e mantém disponível a identidade da pessoa enquanto ela percorre a plataforma. ' +
    'Sua responsabilidade é dar continuidade ao trabalho entre páginas, deixando matéria, atividade e participação no contexto em que foram iniciadas.',
  'access-brand': 'Esta composição apresenta a Lumira como ambiente de ensino, reforço e desenvolvimento de competências com apoio de inteligência generativa. ' +
    'A velocidade da IA tem valor quando amplia as formas de explicar, questionar e reconstruir um conhecimento, não quando apenas multiplica exercícios iguais.',
  'access-form': 'Esta parte conduz professor e estudante ao espaço compatível com sua participação na plataforma. ' +
    'A entrada deve preservar a distinção entre quem planeja atividades, referências e critérios e quem encontra situações para exercitar e apresentar o que aprendeu.',
  'teacher-hero': 'O perfil coloca a especialidade docente no início do ciclo pedagógico. Identidade, matéria e vínculo ajudam a reconhecer quem articula habilidades curriculares, seleciona referências e define que compreensão deseja observar. ' +
    'As ações do perfil aproximam esse trabalho sem sugerir que a inteligência artificial substitua a escolha e a revisão da professora.',
  'teacher-stories': 'Os stories dão visibilidade a momentos recentes, projetos ou sequências que a docente decidiu compartilhar. ' +
    'Sua função é aproximar a comunidade do trabalho pedagógico e conduzir a produções publicadas, sem expor respostas de estudantes, hipóteses individuais ou devolutivas reservadas.',
  'teacher-tabs': 'As abas organizam as diferentes leituras do perfil para que identidade, competências, materiais e atividade não virem um bloco indistinto. ' +
    'Ao direcionar a pessoa entre essas visões, ajudam a localizar cada etapa do trabalho docente e mantêm separadas elaboração, resposta do estudante e divulgação comunitária.',
  'teacher-progress': 'Este resumo situa a participação e a continuidade da docente no uso da plataforma. ' +
    'Não vale como avaliação pedagógica nem transforma contagem, frequência ou pontuação em prova de domínio; a compreensão é examinada por evidências contextualizadas nas respostas e passa por revisão docente.',
  'teacher-skills': 'Esta parte relaciona a prática docente às competências e habilidades curriculares que podem orientar uma atividade. ' +
    'Como uma proposta pode articular vários códigos e competências aplicadas, os indicadores ajudam a localizar os focos sem substituir as evidências concretas do que cada estudante compreendeu.',
  'teacher-about': 'A apresentação reúne a especialidade da docente, sua biografia e os vínculos que ela escolhe tornar visíveis. ' +
    'Esse contexto ajuda a comunidade a reconhecer a autoria e a origem de um material, enquanto respostas de turma e pareceres individuais permanecem no espaço reservado ao acompanhamento.',
  'teacher-activity': 'Esta parte mostra um exemplo de conhecimento ou prática que pode circular depois da revisão docente. ' +
    'A publicação conserva contexto e autoria para permitir consulta, discussão e adaptação; dificuldades identificadas na sondagem, respostas individuais e devolutivas privadas não acompanham o conteúdo público.',
  'teacher-projects': 'Os projetos organizam sequências e frentes de trabalho que a docente prepara, revisa e pode disponibilizar. ' +
    'A leitura do andamento deve manter visível a finalidade de compreensão: situações, representações e apoios podem variar, mas não se reduzem a uma lista de exercícios repetidos.',
  'teacher-agenda': 'A agenda relaciona compromissos e atividades para apoiar a organização temporal do trabalho docente. ' +
    'Ela ajuda a planejar preparação, revisão e disponibilização de sequências; não define a qualidade pedagógica de uma atividade nem substitui a análise das evidências de aprendizagem.',
  'teacher-personalization': 'A personalização permite à docente ajustar sua apresentação e escolher quais informações do perfil podem circular. ' +
    'Quando a adaptação alcança as experiências de aprendizagem, ela deve variar contextos, perguntas e apoios para os estudantes sem alterar a finalidade comum de compreender a relação estudada.',
  'student-hero': 'O perfil apresenta a pessoa estudante e oferece contexto para reconhecer suas produções e seu percurso. ' +
    'A identidade pública fica separada do registro pedagógico reservado: respostas, dificuldades observadas na sondagem e leituras da IA não viram elementos do perfil por padrão.',
  'student-stories': 'Os stories abrem espaço para o estudante compartilhar trabalhos, descobertas e produções escolhidas para divulgação. ' +
    'Essa circulação dá visibilidade ao que foi aprendido sem publicar automaticamente respostas da sondagem, dificuldades individuais ou devolutivas que pertencem ao acompanhamento reservado.',
  'student-tabs': 'Separar apresentação pública, percurso de aprendizagem e produções compartilhadas ajuda o estudante a entender o contexto e o alcance de cada área. ' +
    'A navegação preserva a finalidade formativa e evita confundir uma experiência social com a atividade de avaliação ou com o histórico reservado.',
  'student-progress': 'Esta parte apresenta evidências autorizadas do percurso sem transformar uma resposta isolada ou um único número em conclusão de domínio. ' +
    'A compreensão considera contextos variados, idade, série e evidências por competência; o que aparece publicamente precisa ser selecionado e compreensível para o estudante.',
  'student-achievements': 'As conquistas destacam participações e produções que o estudante escolheu incluir em sua apresentação. ' +
    'Uma conquista social, uma posição em evento ou um marco de percurso não equivale ao nível curricular demonstrado, que depende de evidências contextualizadas e revisão docente.',
  'student-privacy': 'Este espaço esclarece quais aspectos do perfil podem ser compartilhados e quais permanecem no ambiente reservado de aprendizagem. ' +
    'A regra acompanha a proposta da Lumira: circular conhecimento escolhido e permitir interação comunitária sem expor respostas, dificuldades individuais ou devolutivas da sondagem.',
  'community-calendar': 'O calendário situa encontros e atividades coletivas para que turmas e comunidade organizem sua participação. ' +
    'Mostras, desafios e eventos têm datas e regras próprias; o calendário orienta quando participar sem confundir a classificação de um evento com a progressão curricular do estudante.',
  'community-tabs': 'As abas conduzem entre feed, eventos e espaços de participação, mantendo cada interação em seu contexto. ' +
    'Essa organização permite compartilhar materiais e debater conhecimento sem transportar para a área social respostas, critérios internos ou devolutivas individuais.',
  'community-topics': 'Os tópicos oferecem caminhos para encontrar assuntos, matérias e conversas que podem conectar estudantes e docentes. ' +
    'A descoberta amplia a circulação de conhecimento e estratégias, preservando avaliações, diagnósticos e dificuldades pessoais no espaço reservado a quem acompanha a aprendizagem.',
  'community-feed': 'O feed reúne publicações que docentes ou estudantes escolheram compartilhar para explicar uma ideia, apresentar uma produção ou iniciar uma discussão. ' +
    'Cada item conserva contexto e autoria para consulta e adaptação; respostas e pareceres privados da sondagem não pertencem à circulação social.',
  'community-aside': 'Este painel aproxima eventos, pessoas e grupos que ajudam a transformar leitura em participação coletiva. ' +
    'Cada evento mantém inscrição, calendário e resultados em seu próprio escopo; quando houver pontuação, ela representa aquela atividade, não a competência curricular do estudante.',
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
  'teacher-stories': [{ id: 'stories', label: 'Stories', type: 'list', targetPath: 'stories', hint: 'Um story por linha.' }],
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
  'teacher-projects': [{ id: 'projects', label: 'Projetos visíveis', type: 'count', targetPath: 'projects', min: 0, max: 10 }],
  'teacher-agenda': [{ id: 'agenda', label: 'Compromissos visíveis', type: 'count', targetPath: 'agenda', min: 0, max: 12 }],
  'teacher-personalization': [{ id: 'preferences', label: 'Opções de visibilidade', type: 'list', targetPath: 'preferences', hint: 'Uma opção por linha.' }],
  'student-hero': [
    { id: 'name', label: 'Nome', type: 'text', targetPath: 'name' },
    { id: 'role', label: 'Função', type: 'text', targetPath: 'role' },
    { id: 'school', label: 'Escola', type: 'text', targetPath: 'school' },
    { id: 'competencies', label: 'Interesses', type: 'list', targetPath: 'competencies', hint: 'Um interesse por linha.' },
  ],
  'student-stories': [{ id: 'stories', label: 'Stories', type: 'list', targetPath: 'stories', hint: 'Um story por linha.' }],
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
    competencies: ['Ciências', 'Leitura', 'Projetos'], stories: ['Experimentos', 'Leituras', 'Clube de ciências'],
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
  feedback: string;
};
type DemoPagePartState = DemoPagePartProps & { interaction: DemoPagePartInteraction };
type ComponentStateIterator<T> = Generator<T, never, (state: T) => T>;
interface DemoPagePartElement extends HTMLElement { configure(props: DemoPagePartProps): void }
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
  const student = screenId === 'student-profile';
  const name = labText(data, 'name', student ? 'Caio Almeida' : 'Ana Beatriz Silva');
  const labels = community ? ['Feed', 'Meus círculos', 'Explorar', 'Mensagens', 'Salvos'] : ['Perfil', 'Áreas', 'Cursos', 'Fórum', 'IA pedagógica'];
  const active = community ? 'Feed' : 'Perfil';
  const links = labels.map(label => '<button type="button" class="lm-side-link ' + (label === active ? 'active' : '') + '"><span aria-hidden="true">' + (label === active ? '◉' : '◇') + '</span>' + e(label) + (label === 'Mensagens' ? '<i>3</i>' : '') + '</button>').join('');
  const content = '<div class="lm-brand"><span class="lm-brand-symbol">✳</span><span>Lumira</span></div>'
    + '<div class="lm-side-account">' + LabAvatar(name, student ? 'blue' : 'teal', 'small') + '<div><strong>' + e(name) + '</strong><small>' + e(student ? 'Estudante' : 'Professora') + '</small></div></div>'
    + '<nav class="lm-side-nav" aria-label="Navegação de demonstração">' + links + '</nav>'
    + '<aside class="lm-sidebar-promo"><span class="lm-sidebar-promo-mark">✦</span><p>' + e(community ? 'Professores que inspiram professores.' : 'Educação que se conecta com o real.') + '</p><button type="button">' + (community ? 'Criar evento' : 'Explorar áreas') + ' →</button></aside>'
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
  const cards = stories.map((title, index) => '<button type="button" class="lm-story-card"><span class="lm-story-ring tone-' + (index % 5) + '">' + LabAvatar(title, ['teal', 'blue', 'violet', 'rose', 'sun'][index % 5], 'story-avatar') + '</span><b>' + e(title) + '</b><small>' + (index === 0 ? 'há 2h' : 'há ' + index + ' dia' + (index > 1 ? 's' : '')) + '</small></button>').join('');
  const content = '<div class="lm-stories-track"><button type="button" class="lm-story-card lm-new-story"><span class="lm-new-story-icon">＋</span><b>Novo story</b></button>' + cards + '<button type="button" class="lm-story-next" aria-label="Ver mais stories">›</button></div>';
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
          interaction: { groups: {}, toggles: {}, fields: {}, publications: [], actions: {}, feedback: '' },
        });
        this.state = this.transitions.next().value;
        this.addEventListener('click', event => this.onClick(event));
        this.addEventListener('input', event => this.onInput(event));
        this.addEventListener('change', event => this.onChange(event));
        this.addEventListener('submit', event => this.onSubmit(event));
      }
      configure(props: DemoPagePartProps): void {
        const snapshot = structuredClone(props);
        this.state = this.transitions.next(current => ({ ...snapshot, interaction: current.interaction })).value;
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
          const key = id + ':stories';
          storyTrack.dataset.interactionGroup = key;
          storyTrack.querySelectorAll<HTMLButtonElement>('.lm-story-card:not(.lm-new-story)').forEach((button, index) => {
            button.dataset.interactionGroup = key;
            button.dataset.interactionValue = String(index);
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
        if (interaction.feedback) {
          const feedback = document.createElement('p');
          feedback.className = 'lm-component-feedback';
          feedback.setAttribute('role', 'status');
          feedback.textContent = interaction.feedback;
          this.append(feedback);
        }
      }
      private onClick(event: Event): void {
        if (!(event.target instanceof Element)) return;
        const checkbox = event.target.closest<HTMLInputElement>('input[type="checkbox"], input[type="radio"]');
        if (checkbox && this.contains(checkbox)) {
          const key = checkbox.dataset.interactionToggle;
          if (key) {
            this.transitionInteraction(interaction => ({ ...interaction, toggles: { ...interaction.toggles, [key]: checkbox.checked }, feedback: 'Preferência atualizada nesta demonstração.' }));
            this.render();
          }
          return;
        }
        const button = event.target.closest<HTMLButtonElement>('button');
        if (!button || button.disabled || !this.contains(button)) return;
        if (button.type === 'submit') return;
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
        if (!key || field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) return;
        this.transitionInteraction(interaction => ({ ...interaction, fields: { ...interaction.fields, [key]: field.value } }));
      }
      private onChange(event: Event): void {
        if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement)) return;
        const field = event.target;
        const key = field.dataset.interactionField;
        if (!key) return;
        if (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) {
          const toggle = field.dataset.interactionToggle ?? key;
          this.transitionInteraction(interaction => ({ ...interaction, toggles: { ...interaction.toggles, [toggle]: field.checked }, feedback: 'Preferência atualizada nesta demonstração.' }));
        } else {
          this.transitionInteraction(interaction => ({ ...interaction, fields: { ...interaction.fields, [key]: field.value } }));
        }
        this.render();
      }
      private onSubmit(event: Event): void {
        event.preventDefault();
        const form = event.target instanceof HTMLFormElement ? event.target : undefined;
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
        const presentationBlock = id === selectedId && presentation
          ? '<aside class="lm-part-presentation"><header><span class="lm-eyebrow">CONTEXTO DA PARTE</span><span class="lm-evidence-badge ' + e(evidence) + '">' + e(evidenceLabels[evidence]) + '</span></header>'
            + '<h3>' + e(title) + '</h3><p>' + e(presentation) + '</p></aside>'
          : '';
        const visibleContent = prototypeParameters.visible === false
          ? '<div class="lm-prototype-hidden" role="status"><strong>Componente oculto</strong><span>Ative “Exibir componente” nos parâmetros para mostrar a peça.</span></div>'
          : content;
        this.innerHTML = presentationBlock + visibleContent + componentStateLayer(situation.status);
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
