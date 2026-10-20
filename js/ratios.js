// Ràtios financeres (annex 3) i indicadors de rendibilitat (annex 4) de les
// orientacions de la PAU de Funcionament de l'Empresa i Disseny de Models de Negoci.
(function (root) {
  const esNode = typeof module !== 'undefined' && module.exports;
  const { COMPTES } = esNode ? require('./pgc.js') : root.CA.pgc;

  // Per a l'anàlisi, l'actiu corrent es classifica en existències, realitzable
  // i disponible. Realitzable = deutors comercials i altres comptes a cobrar +
  // inversions financeres a curt termini. Disponible = efectiu i altres actius líquids.
  const DISPONIBLE = ['570', '572'];
  const REALITZABLE = ['430', '436', '440', '490', '472', '4700'];

  // Magnituds del balanç i del compte de pèrdues i guanys que fan servir les ràtios.
  function magnituds(estat) {
    const { masses, totalActiu, totalPassiu } = estat.balanc;
    const suma = (codis) => codis.reduce((s, codi) => s + (estat.mapa[codi] || 0), 0);
    const partida = (id) => estat.pig.linies.find((l) => l.id === id).import;
    return {
      actiu: totalActiu,
      totalPnP: totalPassiu,
      ac: masses.AC.total,
      pc: masses.PC.total,
      pnc: masses.PNC.total,
      pn: masses.PN.total,
      deutes: masses.PC.total + masses.PNC.total,
      disponible: suma(DISPONIBLE),
      realitzable: suma(REALITZABLE),
      baii: partida('explotacio'),
      bn: partida('resultat'),
      xifra: partida('xifra'),
    };
  }

  // tipus: 'euros' (diferència), 'ratio' (quocient) o 'percent' (quocient x 100).
  // rang: valors de referència [mínim, màxim] per interpretar la ràtio.
  const RATIOS = [
    {
      id: 'fm', referenciaCurta: "Positiu (> 0)", grup: 'financera', nom: 'Fons de maniobra', tipus: 'euros',
      expressio: 'Actiu corrent − Passiu corrent',
      termes: (m) => [['Actiu corrent', m.ac], ['Passiu corrent', m.pc]],
      calcula: (m) => m.ac - m.pc,
      rang: [0, Infinity],
      referencia: "Ha de ser positiu: vol dir que una part de l'actiu corrent es finança amb recursos permanents i que l'empresa està en equilibri financer.",
      interpretacions: { baix: "Negatiu: part de l'actiu no corrent es finança amb deutes a curt termini; hi ha risc de suspensió de pagaments.", ok: 'Positiu: l’empresa està en equilibri financer.' },
    },
    {
      id: 'disponibilitat', referenciaCurta: "Entre 0,3 i 0,4", grup: 'financera', nom: 'Disponibilitat', tipus: 'ratio',
      expressio: 'Disponible / Passiu corrent',
      termes: (m) => [['Disponible', m.disponible], ['Passiu corrent', m.pc]],
      calcula: (m) => m.disponible / m.pc,
      rang: [0.3, 0.4],
      referencia: "Entre 0,3 i 0,4. Disponible = efectiu i altres actius líquids.",
      interpretacions: {
        baix: 'Per sota de 0,3: pot tenir problemes per afrontar els pagaments.',
        ok: 'Entre 0,3 i 0,4: valor òptim.',
        alt: "Per sobre de 0,4: té massa diners ociosos i pot estar perdent rendibilitat dels seus actius.",
      },
    },
    {
      id: 'tresoreria', referenciaCurta: "A prop d'1 (0,8 – 1,2)", grup: 'financera', nom: 'Tresoreria', tipus: 'ratio',
      expressio: '(Realitzable + Disponible) / Passiu corrent',
      termes: (m) => [['Realitzable + Disponible', m.realitzable + m.disponible], ['Passiu corrent', m.pc]],
      calcula: (m) => (m.realitzable + m.disponible) / m.pc,
      rang: [0.8, 1.2],
      referencia: "A prop d'1 (aquí considerem entre 0,8 i 1,2). Realitzable = deutors comercials i altres comptes a cobrar + inversions financeres a curt termini.",
      interpretacions: {
        baix: 'Per sota d’1: amb el realitzable i el disponible no pot pagar els deutes a curt termini.',
        ok: "A prop d'1: pot fer front als deutes a curt termini.",
        alt: "Molt per sobre d'1: té un excés de liquiditat i pot estar perdent rendibilitat.",
      },
    },
    {
      id: 'liquiditat', referenciaCurta: "Entre 1,5 i 2", grup: 'financera', nom: 'Liquiditat', tipus: 'ratio',
      expressio: 'Actiu corrent / Passiu corrent',
      termes: (m) => [['Actiu corrent', m.ac], ['Passiu corrent', m.pc]],
      calcula: (m) => m.ac / m.pc,
      rang: [1.5, 2],
      referencia: 'Entre 1,5 i 2. També es coneix com a ràtio de fons de maniobra o de solvència a curt termini.',
      interpretacions: {
        baix: 'Per sota de 1,5: pot tenir dificultats per pagar els deutes a curt termini (si és menor que 1, el fons de maniobra és negatiu).',
        ok: 'Entre 1,5 i 2: bona capacitat per pagar els deutes a curt termini.',
        alt: 'Per sobre de 2: té actius corrents ociosos que podrien ser més rendibles.',
      },
    },
    {
      id: 'solvencia', referenciaCurta: "A prop de 2 (1,5 – 2,5)", grup: 'financera', nom: 'Solvència (o garantia)', tipus: 'ratio',
      expressio: 'Actiu / Deutes',
      termes: (m) => [['Actiu', m.actiu], ['Deutes (PC + PNC)', m.deutes]],
      calcula: (m) => m.actiu / m.deutes,
      rang: [1.5, 2.5],
      referencia: 'Superior a 1 i pròxim a 2 (aquí considerem entre 1,5 i 2,5). Per sota d’1, l’empresa estaria en situació de fallida.',
      interpretacions: {
        baix: "Per sota de 1,5: com més s'acosta a 1, més risc de fallida (per sota d'1, fallida).",
        ok: 'A prop de 2: amb els seus actius pot fer front a tots els deutes.',
        alt: 'Molt per sobre de 2: té molta garantia; potser podria fer servir més finançament aliè.',
      },
    },
    {
      id: 'endeutament', referenciaCurta: "Entre 0,4 i 0,6", grup: 'financera', nom: 'Endeutament', tipus: 'ratio',
      expressio: 'Deutes / Total patrimoni net i passiu',
      termes: (m) => [['Deutes (PC + PNC)', m.deutes], ['Total PN i passiu', m.totalPnP]],
      calcula: (m) => m.deutes / m.totalPnP,
      rang: [0.4, 0.6],
      referencia: 'Entre 0,4 i 0,6. Com més alt, més dependència del finançament extern.',
      interpretacions: {
        baix: 'Per sota de 0,4: es finança sobretot amb recursos propis.',
        ok: 'Entre 0,4 i 0,6: equilibri entre recursos propis i aliens.',
        alt: 'Per sobre de 0,6: depèn massa del finançament extern.',
      },
    },
    {
      id: 'estructura', referenciaCurta: "Com més a prop de 0, millor (≤ 0,5)", grup: 'financera', nom: 'Estructura del deute', tipus: 'ratio',
      expressio: 'Passiu corrent / Deutes',
      termes: (m) => [['Passiu corrent', m.pc], ['Deutes (PC + PNC)', m.deutes]],
      calcula: (m) => m.pc / m.deutes,
      rang: [0, 0.5],
      referencia: 'Molt a prop de zero: com més petit, millor. Si supera 0,5, el deute és de mala qualitat.',
      interpretacions: {
        ok: 'Fins a 0,5: la major part del deute és a llarg termini (deute de qualitat).',
        alt: 'Per sobre de 0,5: la major part del deute és a curt termini (deute de mala qualitat).',
      },
    },
    {
      id: 're', referenciaCurta: "Com més alta, millor", grup: 'rendibilitat', nom: 'Rendibilitat econòmica (ROA)', tipus: 'percent',
      expressio: 'BAII / Total actiu × 100',
      termes: (m) => [['BAII', m.baii], ['Total actiu', m.actiu]],
      calcula: (m) => (m.baii / m.actiu) * 100,
      referencia: "Euros de benefici abans d'interessos i impostos que generen cada 100 € invertits en l'actiu. Com més alta, millor.",
    },
    {
      id: 'rf', referenciaCurta: "Com més alta, millor", grup: 'rendibilitat', nom: 'Rendibilitat financera (ROE)', tipus: 'percent',
      expressio: 'Benefici net / Patrimoni net × 100',
      termes: (m) => [['Benefici net', m.bn], ['Patrimoni net', m.pn]],
      calcula: (m) => (m.bn / m.pn) * 100,
      referencia: 'Euros de benefici net que obtenen els propietaris per cada 100 € de recursos propis. Com més alta, millor.',
    },
    {
      id: 'rv', referenciaCurta: "Com més alta, millor", grup: 'rendibilitat', nom: 'Rendibilitat de les vendes', tipus: 'percent',
      expressio: 'BAII / Import net de la xifra de negocis × 100',
      termes: (m) => [['BAII', m.baii], ['Xifra de negocis', m.xifra]],
      calcula: (m) => (m.baii / m.xifra) * 100,
      referencia: "Euros de BAII que genera cada 100 € de vendes. Com més alta, més rendibles són les vendes.",
    },
  ];

  // Valor d'una ràtio (null si el denominador és zero).
  function valor(ratio, m) {
    const [, [, denominador]] = ratio.termes(m);
    if (ratio.tipus !== 'euros' && Math.abs(denominador) < 0.005) return null;
    return ratio.calcula(m);
  }

  // Situació respecte del valor de referència: 'baix', 'ok', 'alt' o null.
  function situacio(ratio, v) {
    if (!ratio.rang || v === null) return null;
    const arrodonit = ratio.tipus === 'euros' ? v : Math.round(v * 100) / 100;
    if (arrodonit < ratio.rang[0]) return 'baix';
    if (arrodonit > ratio.rang[1]) return 'alt';
    return 'ok';
  }

  function calcula(estat) {
    const m = magnituds(estat);
    return RATIOS.map((r) => {
      const v = valor(r, m);
      return { ratio: r, valor: v, situacio: situacio(r, v), termes: r.termes(m) };
    });
  }

  // Tolerància per corregir les respostes: arrodoniment a dos decimals.
  function respostaCorrecta(ratio, resposta, correcte) {
    if (correcte === null || resposta === null || Number.isNaN(resposta)) return false;
    const tolerancia = ratio.tipus === 'euros' ? 1 : 0.011;
    return Math.abs(resposta - correcte) <= tolerancia;
  }

  // Llegeix un número escrit amb coma o punt decimal ("1,25", "1.25", "18,5 %").
  function llegeixDecimal(text) {
    let net = String(text).trim().replace(/−/g, '-').replace(/\s|%|€/g, '');
    if (net.includes(',')) net = net.replace(/\./g, '').replace(',', '.');
    else if (/^[-+]?\d{1,3}(\.\d{3})+$/.test(net)) net = net.replace(/\./g, '');
    if (!/^[-+]?\d+(\.\d+)?$/.test(net)) return NaN;
    return Number(net);
  }

  const ratios = { DISPONIBLE, REALITZABLE, RATIOS, magnituds, valor, situacio, calcula, respostaCorrecta, llegeixDecimal };
  if (esNode) module.exports = ratios;
  else (root.CA = root.CA || {}).ratios = ratios;
})(this);
