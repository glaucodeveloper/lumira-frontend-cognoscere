import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgramHarness } from './program-test-support';

test('idade e série chegam ao plano pela API do programa', async () => {
  const harness = createProgramHarness();
  try {
    await harness.system.login({ role: 'professor' });
    await harness.system.prepareSondagem({ birthDate: '2013-11-21', grade: 8 });
    assert.equal(harness.system.snapshot()?.sondagem?.ageGrade.age, 12);
    assert.equal(harness.system.snapshot()?.sondagem?.ageGrade.referenceAge, 13);
    await harness.system.prepareSondagem({ birthDate: '2013-06-14', grade: 8 });
    assert.equal(harness.system.snapshot()?.sondagem?.ageGrade.age, 13);
  } finally { harness.restore(); }
});

test('idade/série não infere nível nem coeficiente institucional', async () => {
  const harness = createProgramHarness();
  try {
    await harness.system.login({ role: 'professor' });
    await harness.system.prepareSondagem({ birthDate: '2013-06-14', grade: 8 });
    const context = harness.system.snapshot()?.sondagem?.ageGrade;
    assert.equal(context?.age, 13);
    assert.equal(context?.referenceAge, 13);
    assert.equal(context?.coefficient, null);
  } finally { harness.restore(); }
});

test('sondagem cria contextos revisáveis, não diagnóstico', async () => {
  const harness = createProgramHarness();
  try {
    await harness.system.login({ role: 'professor' });
    await harness.system.prepareSondagem({ birthDate: '2013-06-14', grade: 8 });
    const plan = harness.system.snapshot()?.sondagem;
    assert.equal(plan?.competencies[0].contexts, 5);
    assert.equal(plan?.reviewRequired, true);
    assert.equal(plan?.gradeAdvance, null);
  } finally { harness.restore(); }
});

test('professor altera contratos; aluno não altera o mesmo estado', async () => {
  const harness = createProgramHarness();
  try {
    await harness.system.login({ role: 'professor' });
    const before = harness.system.snapshot()?.contracts.generation.version;
    await harness.system.saveContracts({ generation: 'Questão revisada de inferência' });
    assert.equal(harness.system.snapshot()?.contracts.generation.version, (before ?? 0) + 1);
    await harness.system.login({ role: 'aluno' });
    await harness.system.saveContracts({ generation: 'Não autorizado' });
    assert.notEqual(harness.system.snapshot()?.contracts.generation.text, 'Não autorizado');
  } finally { harness.restore(); }
});

test('fórum docente restringe aluno e comunidade permite postagem', async () => {
  const harness = createProgramHarness();
  try {
    await harness.system.login({ role: 'aluno' });
    await harness.system.publishPost({ title: 'X', text: 'Post', space: 'forum-docente' });
    assert.equal(harness.system.snapshot()?.posts.some(post => post.title === 'X'), false);
    await harness.system.publishPost({ title: 'Meu projeto', text: 'Relato do projeto', space: 'comunidade' });
    assert.equal(harness.system.snapshot()?.posts[0].title, 'Meu projeto');
  } finally { harness.restore(); }
});

test('prévia demo identifica que não foi gerada pelo Metis', async () => {
  const harness = createProgramHarness();
  try {
    await harness.system.login({ role: 'professor' });
    await harness.system.generatePreview();
    assert.equal(harness.system.snapshot()?.preview?.mode, 'exemplo_local');
  } finally { harness.restore(); }
});
