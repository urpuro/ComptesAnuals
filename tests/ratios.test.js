// Proves de les ràtios de la PAU. Execució: node --test
const assert = require('node:assert/strict');
const test = require('node:test');
const motor = require('../js/motor.js');
const R = require('../js/ratios.js');
const casos = require('../js/escenaris/ratios.js');

const perId = (llista) => Object.fromEntries(llista.map((f) => [f.ratio.id, f]));

test('hi ha 5 casos de ràtios i tots quadren', () => {
  assert.equal(casos.length, 5);
  for (const cas of casos) {
    assert.ok(motor.assentamentQuadra(cas.passos[0].assentament), cas.id);
    assert.ok(motor.estats(cas).at(-1).balanc.quadra, cas.id);
  }
});

test('llibreria: valors i interpretacions de les ràtios', () => {
  const r = perId(R.calcula(motor.estats(casos.find((c) => c.id === 'rat-llibreria')).at(-1)));
  assert.equal(r.fm.valor, 36500);
  assert.equal(r.disponibilitat.valor.toFixed(2), '0.70');
  assert.equal(r.disponibilitat.situacio, 'alt');
  assert.equal(r.tresoreria.valor.toFixed(2), '1.40');
  assert.equal(r.liquiditat.valor.toFixed(2), '2.28');
  assert.equal(r.solvencia.situacio, 'ok');
  assert.equal(r.endeutament.situacio, 'ok');
  assert.equal(r.estructura.situacio, 'ok');
  assert.equal(r.re.valor.toFixed(2), '17.78');
  assert.equal(r.rf.valor.toFixed(2), '24.81');
  assert.equal(r.rv.valor.toFixed(2), '16.00');
});

test('botiga: fons de maniobra negatiu i pèrdues', () => {
  const r = perId(R.calcula(motor.estats(casos.find((c) => c.id === 'rat-botiga')).at(-1)));
  assert.equal(r.fm.valor, -9000);
  assert.equal(r.fm.situacio, 'baix');
  assert.equal(r.estructura.situacio, 'alt');
  assert.ok(r.rf.valor < 0);
});

test('cap ràtio dels casos queda a tocar del límit del valor de referència', () => {
  for (const cas of casos) {
    for (const f of R.calcula(motor.estats(cas).at(-1))) {
      if (!f.ratio.rang || f.ratio.tipus === 'euros') continue;
      for (const limit of f.ratio.rang) assert.ok(Math.abs(f.valor - limit) >= 0.05, `${cas.id} ${f.ratio.id}`);
    }
  }
});

test('sense passiu corrent, les ràtios que hi divideixen no es poden calcular', () => {
  const inicial = motor.estats({ passos: [{ assentament: [['572', 1000, 0], ['100', 0, 1000]] }]}).at(-1);
  const r = perId(R.calcula(inicial));
  assert.equal(r.disponibilitat.valor, null);
  assert.equal(r.disponibilitat.situacio, null);
  assert.equal(r.fm.valor, 1000);
});

test('correcció: tolerància d’arrodoniment i lectura de decimals', () => {
  const liq = R.RATIOS.find((r) => r.id === 'liquiditat');
  assert.ok(R.respostaCorrecta(liq, R.llegeixDecimal('2,28'), 2.28));
  assert.ok(R.respostaCorrecta(liq, R.llegeixDecimal('2.29'), 2.28));
  assert.ok(!R.respostaCorrecta(liq, R.llegeixDecimal('2,31'), 2.28));
  assert.equal(R.llegeixDecimal('36.500'), 36500);
  assert.equal(R.llegeixDecimal('−9.000'), -9000);
  assert.equal(R.llegeixDecimal('18,46 %'), 18.46);
});
