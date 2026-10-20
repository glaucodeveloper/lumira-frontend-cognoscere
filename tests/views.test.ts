import test from 'node:test';
import assert from 'node:assert/strict';
import { page, landing, shell, calendarHeader } from '../src/components';
import type { AppSnapshot, SessionUser } from '../src/types';
import { createProgramHarness } from './program-test-support';

const signedIn = (snapshot: AppSnapshot | null): AppSnapshot & { user: SessionUser } => {
  assert.ok(snapshot?.user);
  return { ...snapshot, user: snapshot.user };
};

test('rotas docentes renderizam as páginas da plataforma', async () => {
  const harness = createProgramHarness();
  try {
    await harness.system.login({ role: 'professor' });
    const snapshot = signedIn(harness.system.snapshot());
    const routes = ['/professor/inicio','/professor/materias','/professor/competencias','/professor/monitor','/professor/sondagem','/professor/evidencias','/cursos','/perfil','/social','/social/forum-docente','/social/posts/novo','/social/eventos','/social/eventos/ev-mostra','/admin'];
    for (const route of routes) {
      const html = page(route, snapshot);
      assert.equal(typeof html, 'string', route);
      assert.ok(html.length > 200, route);
    }
    assert.match(shell({ route: '/social', user: snapshot.user, navItems: [], content: page('/social', snapshot) }), /calendar-grid/);
    assert.match(landing(), /Lumira/);
  } finally { harness.restore(); }
});

test('rotas de aluno oferecem atividade e sondagem', async () => {
  const harness = createProgramHarness();
  try {
    await harness.system.login({ role: 'aluno' });
    const snapshot = signedIn(harness.system.snapshot());
    for (const route of ['/aluno/inicio','/aluno/sondagem','/aluno/atividade','/aluno/competencias']) assert.ok(page(route, snapshot).length > 200, route);
    assert.match(page('/aluno/atividade', snapshot), /textarea/);
  } finally { harness.restore(); }
});

test('calendário liga cada evento ao dia informado', () => {
  const html = calendarHeader([{ id: 'demo', title: 'Mostra', date: '2026-10-21' }]);
  assert.ok(html.includes('Mostra'));
  assert.ok(html.includes('#/social/eventos/demo'));
  assert.ok(html.includes('Outubro 2026'));
});

test('program aceita renderer substituto e mantém a API do sistema', () => {
  const harness = createProgramHarness({ renderView: () => '<main>Mock components</main>', documentTitle: 'Componentes mock' });
  try {
    assert.equal(harness.mount.innerHTML, '<main>Mock components</main>');
    assert.equal(harness.system.info().mode, 'demo');
    harness.system.render();
    assert.equal(harness.mount.innerHTML, '<main>Mock components</main>');
    harness.system.destroy();
    assert.equal(harness.mount.innerHTML, '');
  } finally { harness.restore(); }
});
