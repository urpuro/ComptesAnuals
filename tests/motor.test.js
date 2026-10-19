// Proves del motor comptable i dels escenaris. Execució: node --test
const assert = require('node:assert/strict');
const test = require('node:test');
const motor = require('../js/motor.js');
const { COMPTES } = require('../js/pgc.js');
const escenaris = [...require('../js/escenaris/exploracions.js'), ...require('../js/escenaris/practiques.js')];

test('hi ha 2 exploracions i 5 pràctiques amb identificadors únics', () => {
  assert.equal(escenaris.filter((e) => e.tipus === 'exploracio').length, 2);
  assert.equal(escenaris.filter((e) => e.tipus === 'practica').length, 5);
  assert.equal(new Set(escenaris.map((e) => e.id)).size, escenaris.length);
});

for (const escenari of escenaris) {
  test(`${escenari.id}: tots els assentaments quadren`, () => {
    escenari.passos.forEach((pas, i) => assert.ok(motor.assentamentQuadra(pas.assentament), `pas ${i + 1}`));
  });

  test(`${escenari.id}: el balanç quadra a cada pas`, () => {
    motor.estats(escenari).forEach((e, i) => assert.ok(e.balanc.quadra, `pas ${i}`));
  });

  test(`${escenari.id}: cap compte de balanç té un saldo de signe impossible`, () => {
    motor.estats(escenari).forEach((e, i) => {
      for (const [codi, valor] of Object.entries(e.mapa)) {
        if (codi === '129') continue;
        const impossible = COMPTES[codi].correctora ? valor > 0 : valor < 0;
        assert.ok(!impossible, `pas ${i}: compte ${codi} = ${valor}`);
      }
    });
  });

  test(`${escenari.id}: l'impost és el 25% del resultat abans d'impostos`, () => {
    const pig = motor.estats(escenari).at(-1).pig;
    const bai = pig.linies.find((l) => l.id === 'bai').import;
    const impost = pig.linies.find((l) => l.id === 'impost').import;
    assert.equal(-impost, bai * 0.25);
  });
}

test('exploració bàsica: balanç i resultat finals', () => {
  const final = motor.estats(escenaris.find((e) => e.id === 'basica')).at(-1);
  assert.equal(final.balanc.totalActiu, 186900);
  assert.equal(final.pig.resultat, 6675);
  assert.equal(final.mapa['572'], 61500);
  assert.equal(final.mapa['281'], -9600);
});

test('exploració difícil: el resultat anterior es distribueix i el nou acaba al patrimoni net', () => {
  const estats = motor.estats(escenaris.find((e) => e.id === 'dificil'));
  assert.equal(estats[1].mapa['129'], 20000);
  assert.equal(estats[1].pig.resultat, 0);
  assert.equal(estats.at(-1).mapa['129'], 19575);
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
