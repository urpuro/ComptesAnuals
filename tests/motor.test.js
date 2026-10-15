// Proves del motor comptable. Execució: node tests/motor.test.js
const assert = require('node:assert/strict');
const test = require('node:test');
const motor = require('../js/motor.js');
const escenaris = require('../js/escenaris.js');

for (const escenari of escenaris) {
  test(`${escenari.id}: tots els assentaments quadren`, () => {
    escenari.passos.forEach((pas, i) => assert.ok(motor.assentamentQuadra(pas.assentament), `pas ${i + 1}`));
  });

  test(`${escenari.id}: el balanç quadra a cada pas`, () => {
    motor.estats(escenari).forEach((e, i) => assert.ok(e.balanc.quadra, `pas ${i}`));
  });
}

test('fusteria: balanç i resultat finals', () => {
  const final = motor.estats(escenaris[0]).at(-1);
  assert.equal(final.balanc.totalActiu, 194000);
  assert.equal(final.pig.resultat, 10500);
  assert.equal(final.mapa['129'], 10500);
  assert.equal(final.mapa['572'], 83000);
  assert.equal(final.mapa['281'], -6000);
});

test('llegeixImport accepta formats habituals', () => {
  assert.equal(motor.llegeixImport('60.000'), 60000);
  assert.equal(motor.llegeixImport('-6.000 €'), -6000);
  assert.equal(motor.llegeixImport('1.234,5'), 1234.5);
  assert.ok(Number.isNaN(motor.llegeixImport('abc')));
});

test('avalua detecta cada tipus d’error', () => {
  const esperat = { '572': 40000, '211': 60000, '281': -6000 };
  const files = [
    { id: 1, massa: 'AC', codi: '572', import: '40.000' },
    { id: 2, massa: 'AC', codi: '211', import: '60.000' },
    { id: 3, massa: 'ANC', codi: '281', import: '6000' },
    { id: 4, massa: 'PC', codi: '400', import: '100' },
  ];
  const r = motor.avalua(files, esperat);
  assert.deepEqual(r.estatFiles, { 1: 'ok', 2: 'massa', 3: 'ok', 4: 'sobra' });
  assert.deepEqual(r.falten, []);
  assert.equal(r.errors, 2);
});

test('esperatRelatiu aplica l’operació sobre el balanç de l’alumne', () => {
  const anteriors = [{ id: 1, massa: 'AC', codi: '572', import: '90.000' }, { id: 2, massa: 'PN', codi: '100', import: '100.000' }];
  const mapa = motor.esperatRelatiu(anteriors, { '572': -60000, '211': 60000 });
  assert.deepEqual(mapa, { '572': 30000, '100': 100000, '211': 60000 });
});
