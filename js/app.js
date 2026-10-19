// Interfície del joc. Hi ha dos apartats (balanç de situació i compte de
// pèrdues i guanys) i cadascun té dues maneres de jugar: «Explora» i «Practica».
(function () {
  const { MASSES, COMPTES, GRUPS, PARTIDES_PIG } = CA.pgc;
  const motor = CA.motor;

  const $ = (id) => document.getElementById(id);
  const esc = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const movimentReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desplaca = (opcions) => window.scrollTo({ ...opcions, behavior: movimentReduit ? 'auto' : 'smooth' });

  // Escriu un import amb punts de milers i coma decimal, mantenint el signe.
  function formatNumero(n) {
    const [enter, decimals] = Math.abs(Math.round(n * 100) / 100).toFixed(2).split('.');
    return `${n < 0 ? '-' : ''}${enter.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}${decimals === '00' ? '' : ',' + decimals}`;
  }

  function format(n) {
    const signe = n < 0 ? '−' : '';
    const [enter, decimals] = Math.abs(Math.round(n * 100) / 100).toFixed(2).split('.');
    const ambPunts = enter.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${signe}${ambPunts}${decimals === '00' ? '' : ',' + decimals} €`;
  }

  // ---------- Apartats ----------
  const APARTATS = {
    balanc: {
      nom: 'Balanç de situació',
      estat: 'el balanç',
      lloc: 'massa',
      triaExplora: "Segueix la història d'una empresa i mira com cada operació canvia el balanç de situació.",
      practicaTitol: 'Construeix el balanç',
      practicaText: "A cada pas se t'explica una operació de l'empresa. Has d'escriure com queda el balanç de situació després de l'operació: tria els conceptes, posa'ls a la massa que toca i escriu-ne l'import.",
      ajuda: "Pots escriure les amortitzacions acumulades i els deterioraments en positiu: el programa ja sap que resten.",
      grups: ['1', '2', '3', '4', '5'],
      mapa: (estat) => estat.mapa,
    },
    pig: {
      nom: 'Compte de pèrdues i guanys',
      estat: 'el compte de pèrdues i guanys',
      lloc: 'partida',
      triaExplora: "Segueix un exercici sencer d'una empresa i mira com es van acumulant els ingressos i les despeses fins arribar al resultat.",
      practicaTitol: 'Construeix el compte de pèrdues i guanys',
      practicaText: "A cada pas se t'explica una operació de l'empresa. Has d'escriure com queda el compte de pèrdues i guanys acumulat de l'exercici: tria els conceptes, posa'ls a la partida que toca i escriu-ne l'import. Compte: algunes operacions no l'afecten!",
      ajuda: "Pots escriure els imports en positiu: el programa ja sap si són ingressos o despeses. Només la variació d'existències (610) porta signe: positiva si l'estoc augmenta i negativa si disminueix.",
      grups: ['6', '7'],
      mapa: (estat) => estat.mapaPig,
    },
  };
  let apartat = 'balanc';
  const cfg = () => APARTATS[apartat];
  const escenarisDe = (ap, tipus) => CA.escenaris.filter((e) => e.apartat === ap && e.tipus === tipus);
  const etiquetaNivell = (e) => `<span class="nivell nivell-${esc(e.nivell.toLowerCase())}">${esc(e.nivell)}</span>`;
  const textOperacions = (e) => `${e.passos.length} operacions`;

  function nomLloc(id) {
    const lloc = MASSES.find((m) => m.id === id) || PARTIDES_PIG.find((p) => p.id === id);
    return lloc ? lloc.nom : id;
  }

  // ---------- Navegació (rutes amb #) ----------
  // #/  ·  #/<apartat>  ·  #/<apartat>/explora[/<escenari>]  ·  #/<apartat>/practica
  let primeraNavegacio = true;

  function navega() {
    const [, ap, mode, idEscenari] = location.hash.split('/');
    let vista = 'inici';
    if (APARTATS[ap]) {
      if (ap !== apartat) canviaApartat(ap);
      vista = ['explora', 'practica'].includes(mode) ? mode : ap;
    }
    if (vista === 'explora') obreExploracio(escenarisDe(apartat, 'exploracio').find((e) => e.id === idEscenari));
    document.querySelectorAll('.apartat').forEach((s) => { s.hidden = s.id !== vista; });
    renderMolles(vista);
    window.scrollTo(0, 0);
    // En canviar de pantalla, el focus va al títol principal (lectors de pantalla i teclat).
    if (!primeraNavegacio) {
      const seccio = $(vista);
      const titol = [...seccio.querySelectorAll('h2')].find((h) => h.offsetParent !== null);
      if (titol) {
        titol.setAttribute('tabindex', '-1');
        titol.focus({ preventScroll: true });
      }
    }
    primeraNavegacio = false;
  }

  // Ruta de navegació («Inici › Balanç de situació › Explora › …») i títol de la pestanya.
  function renderMolles(vista) {
    const molles = [];
    if (vista !== 'inici') {
      molles.push({ text: 'Inici', href: '#/' });
      molles.push({ text: cfg().nom, href: `#/${apartat}` });
      if (vista === 'explora') {
        molles.push({ text: 'Explora', href: `#/${apartat}/explora` });
        if (exp && !$('exp-joc').hidden) molles.push({ text: exp.escenari.nom });
      }
      if (vista === 'practica') {
        molles.push({ text: 'Practica', href: `#/${apartat}/practica` });
        if (prac) molles.push({ text: prac.escenari.nom });
      }
      delete molles[molles.length - 1].href;
    }
    $('molles').innerHTML = vista === 'inici'
      ? '<span class="subtitol">Joc pedagògic per aprendre els comptes anuals</span>'
      : `<ol>${molles.map((m) => `<li>${m.href ? `<a href="${m.href}">${esc(m.text)}</a>` : `<span aria-current="page">${esc(m.text)}</span>`}</li>`).join('')}</ol>`;
    document.title = vista === 'inici'
      ? 'Comptes Anuals · Joc pedagògic'
      : `${molles.slice(1).map((m) => m.text).reverse().join(' · ')} · Comptes Anuals`;
  }

  function canviaApartat(ap) {
    apartat = ap;
    exp = null;
    prac = null;
    $('prac-joc').hidden = true;
    $('prac-final').hidden = true;
    $('prac-inici').hidden = false;
    renderTries();
  }

  // ---------- Peces compartides ----------
  function htmlAssentament(assentament) {
    const files = assentament.map(([codi, deure, haver]) => `
      <tr class="${haver ? 'haver' : ''}">
        <td>${deure ? format(deure) : ''}</td>
        <td>${esc(codi)} ${esc(COMPTES[codi].nom)}</td>
        <td>${haver ? format(haver) : ''}</td>
      </tr>`).join('');
    return `<table class="diari"><thead><tr><th>Deure</th><th>Compte</th><th>Haver</th></tr></thead><tbody>${files}</tbody></table>`;
  }

  function htmlCanvi(abans, ara) {
    if (abans === undefined && ara !== undefined) return '<span class="canvi nou">nou</span>';
    const d = (ara || 0) - (abans || 0);
    if (Math.abs(d) < 0.005) return '';
    return `<span class="canvi ${d > 0 ? 'puja' : 'baixa'}">${d > 0 ? '▲ +' : '▼ '}${format(d)}</span>`;
  }

  function renderTries() {
    $('exp-tria-text').textContent = cfg().triaExplora;
    $('exp-opcions').innerHTML = escenarisDe(apartat, 'exploracio').map((e) => `
      <a class="opcio targeta" href="#/${apartat}/explora/${e.id}">
        ${etiquetaNivell(e)}
        <strong>${esc(e.nom)}</strong>
        <span>${esc(e.descripcio)}</span>
        <span class="peu-opcio">${textOperacions(e)}</span>
      </a>`).join('');
    $('exp-canvia').href = `#/${apartat}/explora`;
    $('prac-inici-titol').textContent = cfg().practicaTitol;
    $('prac-inici-text').textContent = cfg().practicaText;
    $('prac-opcions').innerHTML = escenarisDe(apartat, 'practica').map((e, i) => `
      <label class="opcio-escenari targeta">
        <input type="radio" name="exercici" value="${e.id}" ${i === 0 ? 'checked' : ''}>
        ${etiquetaNivell(e)}
        <strong>${i + 1}. ${esc(e.nom)}</strong>
        <span>${esc(e.descripcio)}</span>
        <span class="peu-opcio">${textOperacions(e)}</span>
      </label>`).join('');
  }

  // ---------- Explora ----------
  let exp = null;

  function obreExploracio(escenari) {
    $('exp-tria').hidden = !!escenari;
    $('exp-joc').hidden = !escenari;
    if (!escenari) return;
    if (!exp || exp.escenari !== escenari) exp = { escenari, estats: motor.estats(escenari), pas: 1 };
    $('exp-nom').innerHTML = `${etiquetaNivell(escenari)} <strong>${esc(escenari.nom)}</strong>`;
    $('exp-estats').classList.toggle('pig-primer', apartat === 'pig');
    renderExplora();
  }

  function htmlBalanc(balanc, mapaAbans) {
    const columna = (costat, titol, total) => {
      const masses = MASSES.filter((m) => m.costat === costat).map((m) => {
        const massa = balanc.masses[m.id];
        const desapareguts = Object.keys(mapaAbans)
          .filter((codi) => COMPTES[codi].massa === m.id && !massa.linies.some((l) => l.codi === codi));
        const linies = massa.linies.map((l) => `
          <li class="${mapaAbans[l.codi] === undefined || Math.abs(mapaAbans[l.codi] - l.import) > 0.005 ? 'canviada' : ''}">
            <span class="concepte"><span class="codi">${esc(l.codi)}</span> ${esc(l.nom)}</span>
            <span class="import">${format(l.import)}</span>
            ${htmlCanvi(mapaAbans[l.codi], l.import)}
          </li>`).join('') + desapareguts.map((codi) => `
          <li class="desapareix canviada">
            <span class="concepte"><span class="codi">${esc(codi)}</span> ${esc(COMPTES[codi].nom)}</span>
            <span class="import">${format(0)}</span>
            <span class="canvi baixa">desapareix</span>
          </li>`).join('');
        return `
          <div class="massa">
            <div class="massa-cap"><span>${esc(m.nom)}</span><span>${format(massa.total)}</span></div>
            <ul>${linies || '<li class="buit">—</li>'}</ul>
          </div>`;
      }).join('');
      return `<div class="columna"><h4>${titol}</h4>${masses}<div class="total"><span>Total</span><span>${format(total)}</span></div></div>`;
    };
    return `<div class="balanc">
      ${columna('actiu', 'Actiu', balanc.totalActiu)}
      ${columna('passiu', 'Patrimoni net i passiu', balanc.totalPassiu)}
    </div>
    <p class="quadra ${balanc.quadra ? 'si' : 'no'}">${balanc.quadra ? '✓ Actiu = Patrimoni net + Passiu' : '✗ El balanç no quadra'}</p>`;
  }

  function htmlPig(pig, pigAbans) {
    const abans = Object.fromEntries(pigAbans.linies.map((l) => [l.id, l.import]));
    const comptesAbans = {};
    for (const l of pigAbans.linies) for (const c of l.comptes || []) comptesAbans[c.codi] = c.import;
    const files = pig.linies.map((l) => {
      const canvi = Math.abs(abans[l.id] - l.import) > 0.005;
      const detall = (l.comptes || []).map((c) => `
        <li class="detall ${comptesAbans[c.codi] === c.import ? '' : 'canviada'}"><span class="concepte"><span class="codi">${esc(c.codi)}</span> ${esc(c.nom)}</span><span class="import">${format(c.import)}</span></li>`).join('');
      return `
        <li class="${l.subtotal ? 'subtotal' : ''} ${l.final ? 'final' : ''} ${canvi ? 'canviada' : ''}">
          <span class="concepte">${esc(l.nom)}</span>
          <span class="import">${format(l.import)}</span>
          ${canvi ? htmlCanvi(abans[l.id], l.import) : ''}
        </li>${detall}`;
    }).join('');
    return `<ul class="pig">${files}</ul>`;
  }

  function renderExplora() {
    const { passos } = exp.escenari;
    const pas = passos[exp.pas - 1];
    const estat = exp.estats[exp.pas];
    const abans = exp.estats[exp.pas - 1];
    $('exp-comptador').textContent = `Pas ${exp.pas} de ${passos.length}`;
    $('exp-progres').style.width = `${(exp.pas / passos.length) * 100}%`;
    $('exp-data').textContent = pas.data || '';
    $('exp-data').hidden = !pas.data;
    $('exp-titol').textContent = pas.titol;
    $('exp-enunciat').textContent = pas.enunciat;
    $('exp-explicacio').textContent = pas.explicacio;
    $('exp-assentament').innerHTML = htmlAssentament(pas.assentament);
    $('exp-balanc').innerHTML = htmlBalanc(estat.balanc, abans.mapa);
    $('exp-pig').innerHTML = htmlPig(estat.pig, abans.pig);
    $('exp-anterior').disabled = exp.pas === 1;
    $('exp-seguent').disabled = exp.pas === passos.length;
    const darrer = exp.pas === passos.length;
    $('exp-final').hidden = !darrer;
    if (darrer) {
      const altra = escenarisDe(apartat, 'exploracio').find((e) => e !== exp.escenari);
      $('exp-final').innerHTML = `
        <p><strong>Has arribat al final de l'exercici.</strong> El resultat de l'exercici és de ${format(estat.pig.resultat)}${apartat === 'balanc' ? ` i el balanç suma ${format(estat.balanc.totalActiu)}` : ''}.</p>
        <div class="accions">
          ${altra ? `<a class="boto" href="#/${apartat}/explora/${altra.id}">Explora «${esc(altra.nom)}» (${esc(altra.nivell.toLowerCase())})</a>` : ''}
          <a class="boto primari" href="#/${apartat}/practica">Ara practica-ho →</a>
        </div>`;
    }
  }

  function mouExplora(salt) {
    const nou = exp.pas + salt;
    if (nou < 1 || nou > exp.escenari.passos.length) return;
    exp.pas = nou;
    renderExplora();
    // Si l'enunciat ha quedat fora de la vista, s'hi torna perquè es llegeixi el pas nou.
    const pas = document.querySelector('#exp-joc .pas');
    const alcadaBarra = document.querySelector('#exp-joc .navegacio').offsetHeight;
    const top = pas.getBoundingClientRect().top;
    if (top < alcadaBarra) desplaca({ top: window.scrollY + top - alcadaBarra - 8 });
  }
  $('exp-anterior').addEventListener('click', () => mouExplora(-1));
  $('exp-seguent').addEventListener('click', () => mouExplora(1));
  document.addEventListener('keydown', (e) => {
    if (!exp || $('exp-joc').hidden || $('explora').hidden || e.target.closest('input, select, textarea, a, button')) return;
    if (e.key === 'ArrowRight') mouExplora(1);
    if (e.key === 'ArrowLeft') mouExplora(-1);
  });

  // ---------- Practica ----------
  function missatge(estat) {
    return {
      lloc: `Aquest concepte no va en aquesta ${cfg().lloc}.`,
      import: "L'import no és correcte.",
      sobra: `Aquest concepte no hauria de sortir ${apartat === 'pig' ? 'al compte de pèrdues i guanys' : 'al balanç'}.`,
      duplicat: 'Aquest concepte ja hi és en una altra fila.',
      incomplet: 'Tria un concepte i escriu un import vàlid.',
    }[estat];
  }

  function opcionsComptes() {
    return cfg().grups.map((grup) => {
      const opcions = Object.entries(COMPTES)
        .filter(([codi]) => codi[0] === grup)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([codi, c]) => `<option value="${codi}">${codi} · ${esc(c.nom)}</option>`).join('');
      return `<optgroup label="${esc(GRUPS[grup])}">${opcions}</optgroup>`;
    }).join('');
  }

  let prac = null;
  let seguentId = 1;

  const copiaFiles = (files) => files.map((f) => ({ ...f, id: seguentId++ }));
  const filesDeMapa = (mapa) => Object.entries(mapa).map(([codi, valor]) => (
    { id: seguentId++, lloc: motor.llocDe(codi), codi, import: formatNumero(valor) }));

  function iniciaPractica(mode, id = document.querySelector('input[name="exercici"]:checked').value) {
    const escenari = escenarisDe(apartat, 'practica').find((e) => e.id === id);
    const estats = motor.estats(escenari);
    prac = {
      escenari, passos: escenari.passos, mapes: estats.map(cfg().mapa),
      mode, pas: 1, files: [], filesAnteriors: [], historial: [], correccio: null, ajudes: 0,
    };
    $('prac-nom').innerHTML = `${etiquetaNivell(escenari)} <strong>${esc(escenari.nom)}</strong>`;
    $('prac-estat-titol').textContent = `${cfg().nom} després de l'operació`;
    $('prac-ajuda').textContent = cfg().ajuda;
    $('prac-inici').hidden = true;
    $('prac-final').hidden = true;
    $('prac-joc').hidden = false;
    renderPas();
    renderMolles('practica');
    window.scrollTo(0, 0);
  }

  function renderPas() {
    const { passos } = prac;
    const pas = passos[prac.pas - 1];
    const examen = prac.mode === 'examen';
    $('prac-mode').textContent = examen ? "Simulacre d'examen" : 'Pràctica';
    $('prac-comptador').textContent = `Pas ${prac.pas} de ${passos.length}`;
    $('prac-progres').style.width = `${((prac.pas - 1) / passos.length) * 100}%`;
    $('prac-data').textContent = pas.data || '';
    $('prac-data').hidden = !pas.data;
    $('prac-titol').textContent = pas.titol;
    $('prac-enunciat').textContent = pas.enunciat;
    $('prac-pista').hidden = true;
    $('prac-pista').innerHTML = `<p class="explicacio">L'assentament d'aquesta operació és:</p>${htmlAssentament(pas.assentament)}`;
    $('prac-missatge').hidden = true;
    ['prac-pista-boto', 'prac-solucio', 'prac-corregeix'].forEach((id) => { $(id).hidden = examen; });
    $('prac-segueix').textContent = prac.pas === passos.length ? 'Acaba' : 'Segueix →';
    prac.correccio = null;
    renderEditable();
  }

  function htmlSeccio(id, nom) {
    const estatFiles = prac.correccio ? prac.correccio.estatFiles : {};
    const files = prac.files.filter((f) => f.lloc === id).map((f) => {
      const estat = estatFiles[f.id];
      return `
        <li class="fila ${estat ? 'estat-' + estat : ''}" data-id="${f.id}">
          <select aria-label="Concepte"><option value="">— Tria un concepte —</option>${opcionsComptes()}</select>
          <input type="text" inputmode="decimal" aria-label="Import" placeholder="p. ex. 12.000" value="${esc(f.import)}">
          <button class="treu" title="Treu la fila" aria-label="Treu la fila">×</button>
          ${estat ? `<span class="marca" title="${esc(missatge(estat) || 'Correcte')}">${estat === 'ok' ? '✓' : '✗'}</span>` : ''}
          ${estat && estat !== 'ok' ? `<span class="motiu">${esc(missatge(estat))}</span>` : ''}
        </li>`;
    }).join('');
    return `
      <div class="massa" data-lloc="${id}">
        <div class="massa-cap"><span>${esc(nom)}</span><span class="subtotal-lloc"></span></div>
        <ul>${files}</ul>
        <button class="afegeix">+ Afegeix un concepte</button>
      </div>`;
  }

  function renderEditable() {
    let html;
    if (apartat === 'balanc') {
      const columna = (costat, titol) => `<div class="columna"><h4>${titol}</h4>${MASSES.filter((m) => m.costat === costat)
        .map((m) => htmlSeccio(m.id, m.nom)).join('')}<div class="total"><span>Total</span><span class="total-${costat}"></span></div></div>`;
      html = `<div class="balanc">${columna('actiu', 'Actiu')}${columna('passiu', 'Patrimoni net i passiu')}</div>`;
    } else {
      html = `<div class="pig-editable">${PARTIDES_PIG.map((p) => (p.subtotal
        ? `<div class="subtotal-pig ${p.final ? 'final' : ''}" data-subtotal="${p.subtotal}"><span>${esc(p.nom)}</span><span class="import"></span></div>`
        : htmlSeccio(p.id, p.nom))).join('')}</div>`;
    }
    const buit = prac.files.length === 0
      ? `<p class="buit-ajuda">Encara no hi ha cap concepte. Fes servir «+ Afegeix un concepte» a la ${cfg().lloc} on el vulguis posar.${apartat === 'pig' ? " Si l'operació no afecta el compte de pèrdues i guanys, deixa'l com està i clica «Segueix»." : ''}</p>`
      : '';
    $('prac-estat').innerHTML = buit + html;
    for (const f of prac.files) $('prac-estat').querySelector(`[data-id="${f.id}"] select`).value = f.codi;
    renderTotals();
  }

  function renderTotals() {
    const totals = {};
    for (const f of prac.files) {
      const valor = motor.llegeixImport(f.import);
      if (!Number.isNaN(valor)) totals[f.lloc] = (totals[f.lloc] || 0) + motor.valorFila(f.codi, valor);
    }
    $('prac-estat').querySelectorAll('[data-lloc]').forEach((el) => {
      el.querySelector('.subtotal-lloc').textContent = format(totals[el.dataset.lloc] || 0);
    });
    const t = (id) => totals[id] || 0;
    if (apartat === 'balanc') {
      const actiu = t('ANC') + t('AC');
      const passiu = t('PN') + t('PNC') + t('PC');
      $('prac-estat').querySelector('.total-actiu').textContent = format(actiu);
      $('prac-estat').querySelector('.total-passiu').textContent = format(passiu);
      const quadra = Math.abs(actiu - passiu) < 0.005;
      $('prac-totals').innerHTML = quadra
        ? '<p class="quadra si">✓ El teu balanç quadra (que quadri no vol dir que sigui correcte!)</p>'
        : `<p class="quadra no">✗ El teu balanç no quadra: diferència de ${format(actiu - passiu)}</p>`;
    } else {
      for (const p of PARTIDES_PIG) {
        if (!p.subtotal) continue;
        totals[p.subtotal] = p.inclou.reduce((suma, id) => suma + t(id), 0);
        $('prac-estat').querySelector(`[data-subtotal="${p.subtotal}"] .import`).textContent = format(totals[p.subtotal]);
      }
      const resultat = totals.resultat;
      $('prac-totals').innerHTML = `<p class="quadra ${resultat >= 0 ? 'si' : 'no'}">Segons el teu compte, l'empresa ${resultat >= 0 ? 'guanya' : 'perd'} ${format(Math.abs(resultat))} fins ara.</p>`;
    }
  }

  function mostraMissatge(html, tipus) {
    const el = $('prac-missatge');
    el.className = `missatge ${tipus}`;
    el.innerHTML = html;
    el.hidden = false;
  }

  $('prac-estat').addEventListener('click', (e) => {
    const seccio = e.target.closest('[data-lloc]');
    if (e.target.matches('.afegeix')) {
      prac.files.push({ id: seguentId++, lloc: seccio.dataset.lloc, codi: '', import: '' });
      renderEditable();
      const nova = $('prac-estat').querySelector(`[data-lloc="${seccio.dataset.lloc}"] .fila:last-child select`);
      if (nova) nova.focus();
    } else if (e.target.matches('.treu')) {
      const id = Number(e.target.closest('.fila').dataset.id);
      prac.files = prac.files.filter((f) => f.id !== id);
      renderEditable();
    }
  });

  function filaEditada(e) {
    const filaEl = e.target.closest('.fila');
    if (!filaEl) return;
    const fila = prac.files.find((f) => f.id === Number(filaEl.dataset.id));
    if (e.target.matches('select')) fila.codi = e.target.value;
    if (e.target.matches('input')) {
      fila.import = e.target.value;
      // En sortir del camp, es reescriu l'import amb punts de milers perquè es vegi com s'ha entès.
      const valor = motor.llegeixImport(fila.import);
      if (e.type === 'change' && !Number.isNaN(valor)) fila.import = e.target.value = formatNumero(valor);
    }
    filaEl.className = 'fila';
    filaEl.querySelectorAll('.marca, .motiu').forEach((el) => el.remove());
    renderTotals();
  }
  $('prac-estat').addEventListener('input', filaEditada);
  $('prac-estat').addEventListener('change', filaEditada);

  $('prac-pista-boto').addEventListener('click', () => {
    $('prac-pista').hidden = false;
    prac.ajudes++;
  });

  $('prac-corregeix').addEventListener('click', () => {
    prac.correccio = motor.avalua(prac.files, prac.mapes[prac.pas]);
    renderEditable();
    const { errors, falten } = prac.correccio;
    if (errors === 0) {
      mostraMissatge(`<strong>Perfecte!</strong> ${apartat === 'pig' ? 'El compte de pèrdues i guanys' : 'El balanç'} és correcte. Pots seguir al pas següent.`, 'bo');
    } else {
      const textFalten = falten.length ? ` Falten ${falten.length} concepte${falten.length > 1 ? 's' : ''}.` : '';
      mostraMissatge(`<strong>Hi ha ${errors} error${errors > 1 ? 's' : ''}.</strong>${textFalten} Pots corregir-${errors > 1 ? 'los' : 'lo'} o seguir igualment.`, 'dolent');
    }
  });

  $('prac-solucio').addEventListener('click', () => {
    prac.files = filesDeMapa(prac.mapes[prac.pas]);
    prac.correccio = null;
    prac.ajudes++;
    renderEditable();
    mostraMissatge(`<strong>Aquesta és la solució.</strong> ${esc(prac.passos[prac.pas - 1].explicacio)}`, 'info');
  });

  $('prac-segueix').addEventListener('click', () => {
    const i = prac.pas;
    const { mapes, passos } = prac;
    const delta = motor.variacio(mapes[i - 1], mapes[i]);
    const relatiu = motor.avalua(prac.files, motor.esperatRelatiu(prac.filesAnteriors, delta), motor.llocsDeFiles(prac.filesAnteriors));
    const absolut = motor.avalua(prac.files, mapes[i]);
    prac.historial.push({ pas: i, files: prac.files.map((f) => ({ ...f })), relatiu, absolut });
    if (i === passos.length) {
      renderFinal();
      return;
    }
    prac.filesAnteriors = prac.files.map((f) => ({ ...f }));
    prac.files = copiaFiles(prac.files);
    prac.pas++;
    renderPas();
    desplaca({ top: 0 });
  });

  $('prac-surt').addEventListener('click', () => {
    if (!confirm('Segur que vols sortir? Es perdrà el progrés.')) return;
    prac = null;
    $('prac-joc').hidden = true;
    $('prac-inici').hidden = false;
    renderMolles('practica');
  });

  // Avisa abans de tancar o recarregar la pàgina amb una pràctica a mitges.
  window.addEventListener('beforeunload', (e) => {
    if (prac && !$('prac-joc').hidden && (prac.pas > 1 || prac.files.length)) e.preventDefault();
  });

  document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => iniciaPractica(b.dataset.mode)));

  function descripcioErrors(files, avaluacio, esperat) {
    const items = [];
    for (const f of files) {
      const estat = avaluacio.estatFiles[f.id];
      if (!estat || estat === 'ok') continue;
      const nom = f.codi ? `${f.codi} ${COMPTES[f.codi].nom}` : '(sense concepte)';
      let detall = missatge(estat);
      if (estat === 'import') detall = `Has posat ${format(motor.valorFila(f.codi, motor.llegeixImport(f.import)))} i hauria de ser ${format(esperat[f.codi])}.`;
      if (estat === 'lloc') detall = `L'has posat a «${nomLloc(f.lloc)}», però va a «${nomLloc(motor.llocDe(f.codi))}».`;
      items.push(`<li><strong>${esc(nom)}</strong>: ${esc(detall)}</li>`);
    }
    for (const codi of avaluacio.falten) {
      items.push(`<li><strong>${esc(codi)} ${esc(COMPTES[codi].nom)}</strong>: falta (${format(esperat[codi])}).</li>`);
    }
    return items.join('');
  }

  function renderFinal() {
    $('prac-joc').hidden = true;
    const { mapes, passos } = prac;
    const final = $('prac-final');
    const encerts = prac.historial.filter((h) => h.relatiu.errors === 0).length;
    const nota = Math.round((encerts / passos.length) * 100) / 10;
    let anteriors = [];
    const files = prac.historial.map((h) => {
      const delta = motor.variacio(mapes[h.pas - 1], mapes[h.pas]);
      const esperat = motor.esperatRelatiu(anteriors, delta);
      anteriors = h.files;
      const detall = h.relatiu.errors ? `<details><summary>Veure errors</summary><ul>${descripcioErrors(h.files, h.relatiu, esperat)}</ul></details>` : '';
      return `<tr>
        <td>${h.pas}. ${esc(passos[h.pas - 1].titol)}${detall}</td>
        <td class="${h.relatiu.errors ? 'no' : 'si'}">${h.relatiu.errors ? `✗ ${h.relatiu.errors}` : '✓'}</td>
        <td class="${h.absolut.errors ? 'no' : 'si'}">${h.absolut.errors ? '✗' : '✓'}</td>
      </tr>`;
    }).join('');
    const nomEstat = apartat === 'pig' ? 'PiG' : 'Balanç';
    final.innerHTML = `
      <h2>Resultat ${prac.mode === 'examen' ? "del simulacre d'examen" : 'de la pràctica'}: ${esc(prac.escenari.nom)}</h2>
      <p class="nota">${String(nota).replace('.', ',')} <small>/ 10</small></p>
      <p>Has registrat bé <strong>${encerts}</strong> de ${passos.length} operacions${prac.ajudes ? ` (has fet servir ${prac.ajudes} ajud${prac.ajudes > 1 ? 'es' : 'a'})` : ''}.</p>
      <p class="explicacio">Una operació compta com a ben registrada si l'has aplicada bé sobre el teu propi estat anterior, encara que aquest arrossegués errors. La darrera columna indica si ${cfg().estat} coincidia exactament amb el correcte.</p>
      <table class="resultats">
        <thead><tr><th>Pas</th><th>Operació</th><th>${nomEstat}</th></tr></thead>
        <tbody>${files}</tbody>
      </table>
      <div class="accions">
        <button class="boto" id="final-torna">Tria un altre exercici</button>
        <button class="boto primari" id="final-repeteix">Repeteix aquest exercici</button>
      </div>`;
    final.hidden = false;
    $('prac-progres').style.width = '100%';
    $('final-torna').addEventListener('click', () => {
      final.hidden = true;
      prac = null;
      $('prac-inici').hidden = false;
      renderMolles('practica');
      window.scrollTo(0, 0);
    });
    $('final-repeteix').addEventListener('click', () => iniciaPractica(prac.mode, prac.escenari.id));
    window.scrollTo(0, 0);
    final.querySelector('h2').setAttribute('tabindex', '-1');
    final.querySelector('h2').focus({ preventScroll: true });
  }

  renderTries();
  window.addEventListener('hashchange', navega);
  navega();
})();
