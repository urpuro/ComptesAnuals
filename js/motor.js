// Motor comptable: a partir dels assentaments calcula el balanç de situació i
// el compte de pèrdues i guanys, i avalua els balanços que construeix l'alumne.
(function (root) {
  const pgc = typeof module !== 'undefined' && module.exports ? require('./pgc.js') : root.CA.pgc;
  const { MASSES, PARTIDES_PIG, COMPTES, COMPTE_RESULTAT } = pgc;

  const TOLERANCIA = 0.005;
  const igual = (a, b) => Math.abs(a - b) < TOLERANCIA;

  function costatDe(codi) {
    const massa = MASSES.find((m) => m.id === COMPTES[codi].massa);
    return massa.costat;
  }

  // Saldo deutor (deure - haver) de cada compte després d'aplicar els assentaments.
  function saldos(assentaments) {
    const s = {};
    for (const assentament of assentaments) {
      for (const [codi, deure, haver] of assentament) {
        if (!COMPTES[codi]) throw new Error(`Compte desconegut: ${codi}`);
        s[codi] = (s[codi] || 0) + deure - haver;
      }
    }
    return s;
  }

  function assentamentQuadra(assentament) {
    let deure = 0;
    let haver = 0;
    for (const [, d, h] of assentament) {
      deure += d;
      haver += h;
    }
    return igual(deure, haver);
  }

  // Import amb què cada compte de balanç apareix al balanç (amb signe):
  // positiu en general, negatiu per als comptes correctors.
  // El resultat de l'exercici inclou el saldo de tots els comptes de PiG.
  function mapaBalanc(s) {
    const mapa = {};
    let resultat = 0;
    for (const [codi, saldo] of Object.entries(s)) {
      const compte = COMPTES[codi];
      if (compte.pig) {
        resultat -= saldo;
      } else if (codi === COMPTE_RESULTAT) {
        resultat -= saldo;
      } else {
        const valor = costatDe(codi) === 'actiu' ? saldo : -saldo;
        if (!igual(valor, 0)) mapa[codi] = valor;
      }
    }
    if (!igual(resultat, 0)) mapa[COMPTE_RESULTAT] = resultat;
    return mapa;
  }

  // Balanç agrupat per masses a partir d'un mapa {codi: import}.
  function balancDeMapa(mapa) {
    const masses = {};
    for (const m of MASSES) masses[m.id] = { ...m, linies: [], total: 0 };
    for (const [codi, valor] of Object.entries(mapa)) {
      const massa = masses[COMPTES[codi].massa];
      massa.linies.push({ codi, nom: COMPTES[codi].nom, import: valor });
      massa.total += valor;
    }
    for (const m of Object.values(masses)) m.linies.sort((a, b) => a.codi.localeCompare(b.codi));
    const totalActiu = masses.ANC.total + masses.AC.total;
    const totalPassiu = masses.PN.total + masses.PNC.total + masses.PC.total;
    return { masses, totalActiu, totalPassiu, quadra: igual(totalActiu, totalPassiu) };
  }

  // Compte de pèrdues i guanys: ingressos en positiu, despeses en negatiu.
  function pig(s) {
    const valors = {};
    const comptes = {};
    for (const p of PARTIDES_PIG) {
      if (p.id) {
        valors[p.id] = 0;
        comptes[p.id] = [];
      }
    }
    for (const [codi, saldo] of Object.entries(s)) {
      const partida = COMPTES[codi].pig;
      if (!partida || igual(saldo, 0)) continue;
      valors[partida] -= saldo;
      comptes[partida].push({ codi, nom: COMPTES[codi].nom, import: -saldo });
    }
    const linies = PARTIDES_PIG.map((p) => {
      if (p.subtotal) {
        valors[p.subtotal] = p.inclou.reduce((suma, id) => suma + valors[id], 0);
        return { id: p.subtotal, nom: p.nom, import: valors[p.subtotal], subtotal: true, final: !!p.final };
      }
      return { id: p.id, nom: p.nom, import: valors[p.id], comptes: comptes[p.id] };
    });
    return { linies, resultat: valors.resultat };
  }

  // Estats de l'empresa: l'índex 0 és abans de cap operació i l'índex i és
  // just després del pas i.
  function estats(escenari) {
    const resultat = [];
    for (let i = 0; i <= escenari.passos.length; i++) {
      const s = saldos(escenari.passos.slice(0, i).map((p) => p.assentament));
      const mapa = mapaBalanc(s);
      resultat.push({ saldos: s, mapa, balanc: balancDeMapa(mapa), pig: pig(s) });
    }
    return resultat;
  }

  // Variació del mapa de balanç que provoca un pas.
  function variacio(mapaAbans, mapaDespres) {
    const delta = {};
    const codis = new Set([...Object.keys(mapaAbans), ...Object.keys(mapaDespres)]);
    for (const codi of codis) {
      const d = (mapaDespres[codi] || 0) - (mapaAbans[codi] || 0);
      if (!igual(d, 0)) delta[codi] = d;
    }
    return delta;
  }

  // Converteix un text com "60.000", "-6.000" o "1.234,50" en número.
  function llegeixImport(text) {
    const net = String(text).trim().replace(/\s|€/g, '').replace(/\./g, '').replace(',', '.');
    if (!/^[-+]?\d+(\.\d+)?$/.test(net)) return NaN;
    return Number(net);
  }

  // Valor amb signe d'una fila de l'alumne. Per als comptes correctors s'accepta
  // l'import escrit tant en positiu com en negatiu.
  function valorFila(codi, valor) {
    return COMPTES[codi] && COMPTES[codi].correctora ? -Math.abs(valor) : valor;
  }

  // Mapa {codi: import} del balanç d'un alumne (ignora files incompletes).
  function mapaDeFiles(files) {
    const mapa = {};
    for (const f of files) {
      const valor = llegeixImport(f.import);
      if (!f.codi || Number.isNaN(valor)) continue;
      mapa[f.codi] = (mapa[f.codi] || 0) + valorFila(f.codi, valor);
    }
    for (const codi of Object.keys(mapa)) if (igual(mapa[codi], 0)) delete mapa[codi];
    return mapa;
  }

  // Compara les files de l'alumne amb el balanç esperat ({codi: import}).
  // Retorna l'estat de cada fila, els comptes que falten i el nombre d'errors.
  function avalua(files, esperat) {
    const vistos = new Set();
    const estatFiles = {};
    let errors = 0;
    for (const f of files) {
      const valor = llegeixImport(f.import);
      let estat;
      if (!f.codi && String(f.import).trim() === '') continue;
      if (!f.codi || Number.isNaN(valor)) estat = 'incomplet';
      else if (vistos.has(f.codi)) estat = 'duplicat';
      else if (!(f.codi in esperat)) estat = igual(valor, 0) ? 'ok' : 'sobra';
      else if (COMPTES[f.codi].massa !== f.massa) estat = 'massa';
      else if (!igual(valorFila(f.codi, valor), esperat[f.codi])) estat = 'import';
      else estat = 'ok';
      if (f.codi) vistos.add(f.codi);
      estatFiles[f.id] = estat;
      if (estat !== 'ok') errors++;
    }
    const falten = Object.keys(esperat).filter((codi) => !vistos.has(codi));
    errors += falten.length;
    return { estatFiles, falten, errors };
  }

  // Balanç que hauria de tenir l'alumne si apliqués bé l'operació sobre el seu
  // propi balanç anterior (encara que aquest tingués errors).
  function esperatRelatiu(filesAnteriors, delta) {
    const mapa = mapaDeFiles(filesAnteriors);
    for (const [codi, d] of Object.entries(delta)) mapa[codi] = (mapa[codi] || 0) + d;
    for (const codi of Object.keys(mapa)) if (igual(mapa[codi], 0)) delete mapa[codi];
    return mapa;
  }

  const motor = {
    saldos, assentamentQuadra, mapaBalanc, balancDeMapa, pig, estats, variacio,
    llegeixImport, mapaDeFiles, avalua, esperatRelatiu,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = motor;
  else (root.CA = root.CA || {}).motor = motor;
})(this);
