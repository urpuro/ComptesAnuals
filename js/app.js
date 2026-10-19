// Interfície del joc: apartat «Explora» i apartat «Practica».
(function () {
  const { MASSES, COMPTES } = CA.pgc;
  const motor = CA.motor;
  const exploracions = CA.escenaris.filter((e) => e.tipus === 'exploracio');
  const practiques = CA.escenaris.filter((e) => e.tipus === 'practica');

  const $ = (id) => document.getElementById(id);
  const esc = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function format(n) {
    const signe = n < 0 ? '−' : '';
    const [enter, decimals] = Math.abs(Math.round(n * 100) / 100).toFixed(2).split('.');
    const ambPunts = enter.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${signe}${ambPunts}${decimals === '00' ? '' : ',' + decimals} €`;
  }

  // ---------- Navegació (rutes amb #) ----------
  // #/  ·  #/balanc  ·  #/balanc/explora[/<escenari>]  ·  #/balanc/practica
  function navega() {
    const [, seccio, apartatRuta, idEscenari] = location.hash.split('/');
    let apartat = 'inici';
    if (seccio === 'balanc') apartat = ['explora', 'practica'].includes(apartatRuta) ? apartatRuta : 'balanc';
    if (apartat === 'explora') obreExploracio(exploracions.find((e) => e.id === idEscenari));
    document.querySelectorAll('.apartat').forEach((s) => { s.hidden = s.id !== apartat; });
    const dinsJoc = apartat === 'explora' || apartat === 'practica';
    $('pestanyes').hidden = !dinsJoc;
    document.querySelectorAll('#pestanyes [data-apartat]').forEach((a) => {
      if (a.dataset.apartat === apartat) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    $('subtitol').textContent = apartat === 'inici' ? 'Joc pedagògic per aprendre els comptes anuals' : 'Balanç de situació';
    window.scrollTo(0, 0);
  }

  $('comenca').addEventListener('click', () => {
    location.hash = `#/balanc/${document.querySelector('input[name="manera"]:checked').value}`;
  });

  // ---------- Peces compartides ----------
  const textOperacions = (e) => `${e.passos.length} operacions`;

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

  // ---------- Explora ----------
  let exp = null;

  $('exp-opcions').innerHTML = exploracions.map((e) => `
    <a class="opcio targeta" href="#/balanc/explora/${e.id}">
      <span class="nivell nivell-${esc(e.nivell.toLowerCase())}">${esc(e.nivell)}</span>
      <strong>${esc(e.nom)}</strong>
      <span>${esc(e.descripcio)}</span>
      <span class="peu-opcio">${textOperacions(e)}</span>
    </a>`).join('');

  function obreExploracio(escenari) {
    $('exp-tria').hidden = !!escenari;
    $('exp-joc').hidden = !escenari;
    if (!escenari) return;
    if (!exp || exp.escenari !== escenari) exp = { escenari, estats: motor.estats(escenari), pas: 1 };
    $('exp-nom').innerHTML = `<span class="nivell nivell-${esc(escenari.nivell.toLowerCase())}">${esc(escenari.nivell)}</span> <strong>${esc(escenari.nom)}</strong>`;
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
    const files = pig.linies.map((l) => {
      const canvi = Math.abs(abans[l.id] - l.import) > 0.005;
      const detall = (l.comptes || []).map((c) => `
        <li class="detall"><span class="concepte"><span class="codi">${esc(c.codi)}</span> ${esc(c.nom)}</span><span class="import">${format(c.import)}</span></li>`).join('');
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
    $('exp-titol').textContent = pas.titol;
    $('exp-enunciat').textContent = pas.enunciat;
    $('exp-explicacio').textContent = pas.explicacio;
    $('exp-assentament').innerHTML = htmlAssentament(pas.assentament);
    $('exp-balanc').innerHTML = htmlBalanc(estat.balanc, abans.mapa);
    $('exp-pig').innerHTML = htmlPig(estat.pig, abans.pig);
    $('exp-anterior').disabled = exp.pas === 1;
    $('exp-seguent').disabled = exp.pas === passos.length;
  }

  function mouExplora(salt) {
    const nou = exp.pas + salt;
    if (nou < 1 || nou > exp.escenari.passos.length) return;
    exp.pas = nou;
    renderExplora();
  }
  $('exp-anterior').addEventListener('click', () => mouExplora(-1));
  $('exp-seguent').addEventListener('click', () => mouExplora(1));
  document.addEventListener('keydown', (e) => {
    if ($('exp-joc').hidden || $('explora').hidden || e.target.closest('input, select, textarea')) return;
    if (e.key === 'ArrowRight') mouExplora(1);
    if (e.key === 'ArrowLeft') mouExplora(-1);
  });

  // ---------- Practica ----------
  const MISSATGES = {
    massa: 'Aquest concepte no va en aquesta massa.',
    import: "L'import no és correcte.",
    sobra: 'Aquest concepte no hauria de sortir al balanç.',
    duplicat: 'Aquest concepte ja hi és en una altra fila.',
    incomplet: 'Tria un concepte i escriu un import vàlid.',
  };
  const opcionsComptes = Object.entries(CA.pgc.GRUPS).map(([grup, nomGrup]) => {
    const opcions = Object.entries(COMPTES)
      .filter(([codi, c]) => c.massa && codi[0] === grup)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([codi, c]) => `<option value="${codi}">${codi} · ${esc(c.nom)}</option>`).join('');
    return `<optgroup label="${esc(nomGrup)}">${opcions}</optgroup>`;
  }).join('');

  $('prac-opcions').innerHTML = practiques.map((e, i) => `
    <label class="opcio-escenari targeta">
      <input type="radio" name="exercici" value="${e.id}" ${i === 0 ? 'checked' : ''}>
      <span class="nivell nivell-${esc(e.nivell.toLowerCase())}">${esc(e.nivell)}</span>
      <strong>${i + 1}. ${esc(e.nom)}</strong>
      <span>${esc(e.descripcio)}</span>
      <span class="peu-opcio">${textOperacions(e)}</span>
    </label>`).join('');

  let prac = null;
  let seguentId = 1;

  const copiaFiles = (files) => files.map((f) => ({ ...f, id: seguentId++ }));
  const filesDeMapa = (mapa) => Object.entries(mapa).map(([codi, valor]) => (
    { id: seguentId++, massa: COMPTES[codi].massa, codi, import: String(valor).replace('.', ',') }));

  function iniciaPractica(mode) {
    const id = document.querySelector('input[name="exercici"]:checked').value;
    const escenari = practiques.find((e) => e.id === id);
    prac = {
      escenari, passos: escenari.passos, estats: motor.estats(escenari),
      mode, pas: 1, files: [], filesAnteriors: [], historial: [], correccio: null, ajudes: 0,
    };
    $('prac-nom').innerHTML = `<span class="nivell nivell-${esc(escenari.nivell.toLowerCase())}">${esc(escenari.nivell)}</span> <strong>${esc(escenari.nom)}</strong>`;
    $('prac-inici').hidden = true;
    $('prac-final').hidden = true;
    $('prac-joc').hidden = false;
    renderPas();
  }

  function renderPas() {
    const { passos } = prac;
    const pas = passos[prac.pas - 1];
    const examen = prac.mode === 'examen';
    $('prac-mode').textContent = examen ? "Simulacre d'examen" : 'Pràctica';
    $('prac-comptador').textContent = `Pas ${prac.pas} de ${passos.length}`;
    $('prac-titol').textContent = pas.titol;
    $('prac-enunciat').textContent = pas.enunciat;
    $('prac-pista').hidden = true;
    $('prac-pista').innerHTML = `<p class="explicacio">L'assentament d'aquesta operació és:</p>${htmlAssentament(pas.assentament)}`;
    $('prac-missatge').hidden = true;
    ['prac-pista-boto', 'prac-solucio', 'prac-corregeix'].forEach((id) => { $(id).hidden = examen; });
    $('prac-segueix').textContent = prac.pas === passos.length ? 'Acaba' : 'Segueix →';
    prac.correccio = null;
    renderBalancEditable();
  }

  function renderBalancEditable() {
    const estatFiles = prac.correccio ? prac.correccio.estatFiles : {};
    const columna = (costat, titol) => `<div class="columna"><h4>${titol}</h4>${MASSES.filter((m) => m.costat === costat).map((m) => `
      <div class="massa" data-massa="${m.id}">
        <div class="massa-cap"><span>${esc(m.nom)}</span><span class="subtotal-massa"></span></div>
        <ul>${prac.files.filter((f) => f.massa === m.id).map((f) => {
          const estat = estatFiles[f.id];
          return `
          <li class="fila ${estat ? 'estat-' + estat : ''}" data-id="${f.id}">
            <select aria-label="Concepte"><option value="">— Tria un concepte —</option>${opcionsComptes}</select>
            <input type="text" inputmode="decimal" aria-label="Import" placeholder="Import" value="${esc(f.import)}">
            <button class="treu" title="Treu la fila" aria-label="Treu la fila">×</button>
            ${estat ? `<span class="marca" title="${esc(MISSATGES[estat] || 'Correcte')}">${estat === 'ok' ? '✓' : '✗'}</span>` : ''}
            ${estat && estat !== 'ok' ? `<span class="motiu">${esc(MISSATGES[estat])}</span>` : ''}
          </li>`;
        }).join('')}</ul>
        <button class="afegeix">+ Afegeix un concepte</button>
      </div>`).join('')}<div class="total"><span>Total</span><span class="total-${costat}"></span></div></div>`;
    $('prac-balanc').innerHTML = `<div class="balanc">${columna('actiu', 'Actiu')}${columna('passiu', 'Patrimoni net i passiu')}</div>`;
    for (const f of prac.files) {
      $('prac-balanc').querySelector(`[data-id="${f.id}"] select`).value = f.codi;
    }
    renderTotals();
  }

  function renderTotals() {
    const totals = {};
    for (const m of MASSES) totals[m.id] = 0;
    for (const f of prac.files) {
      const valor = motor.llegeixImport(f.import);
      if (!Number.isNaN(valor)) totals[f.massa] += f.codi && COMPTES[f.codi].correctora ? -Math.abs(valor) : valor;
    }
    $('prac-balanc').querySelectorAll('.massa').forEach((el) => {
      el.querySelector('.subtotal-massa').textContent = format(totals[el.dataset.massa]);
    });
    const actiu = totals.ANC + totals.AC;
    const passiu = totals.PN + totals.PNC + totals.PC;
    $('prac-balanc').querySelector('.total-actiu').textContent = format(actiu);
    $('prac-balanc').querySelector('.total-passiu').textContent = format(passiu);
    const quadra = Math.abs(actiu - passiu) < 0.005;
    $('prac-totals').innerHTML = quadra
      ? '<p class="quadra si">✓ El teu balanç quadra (que quadri no vol dir que sigui correcte!)</p>'
      : `<p class="quadra no">✗ El teu balanç no quadra: diferència de ${format(actiu - passiu)}</p>`;
  }

  function mostraMissatge(html, tipus) {
    const el = $('prac-missatge');
    el.className = `missatge ${tipus}`;
    el.innerHTML = html;
    el.hidden = false;
  }

  $('prac-balanc').addEventListener('click', (e) => {
    const massa = e.target.closest('.massa');
    if (e.target.matches('.afegeix')) {
      prac.files.push({ id: seguentId++, massa: massa.dataset.massa, codi: '', import: '' });
      renderBalancEditable();
      const novaFila = $('prac-balanc').querySelector(`[data-massa="${massa.dataset.massa}"] .fila:last-child select`);
      if (novaFila) novaFila.focus();
    } else if (e.target.matches('.treu')) {
      const id = Number(e.target.closest('.fila').dataset.id);
      prac.files = prac.files.filter((f) => f.id !== id);
      renderBalancEditable();
    }
  });

  function filaEditada(e) {
    const filaEl = e.target.closest('.fila');
    if (!filaEl) return;
    const fila = prac.files.find((f) => f.id === Number(filaEl.dataset.id));
    if (e.target.matches('select')) fila.codi = e.target.value;
    if (e.target.matches('input')) fila.import = e.target.value;
    filaEl.className = 'fila';
    filaEl.querySelectorAll('.marca, .motiu').forEach((el) => el.remove());
    renderTotals();
  }
  $('prac-balanc').addEventListener('input', filaEditada);
  $('prac-balanc').addEventListener('change', filaEditada);

  $('prac-pista-boto').addEventListener('click', () => {
    $('prac-pista').hidden = false;
    prac.ajudes++;
  });

  $('prac-corregeix').addEventListener('click', () => {
    prac.correccio = motor.avalua(prac.files, prac.estats[prac.pas].mapa);
    renderBalancEditable();
    const { errors, falten } = prac.correccio;
    if (errors === 0) {
      mostraMissatge('<strong>Perfecte!</strong> El balanç és correcte. Pots seguir al pas següent.', 'bo');
    } else {
      const textFalten = falten.length ? ` Falten ${falten.length} concepte${falten.length > 1 ? 's' : ''} al balanç.` : '';
      mostraMissatge(`<strong>Hi ha ${errors} error${errors > 1 ? 's' : ''}.</strong>${textFalten} Pots corregir-${errors > 1 ? 'los' : 'lo'} o seguir igualment.`, 'dolent');
    }
  });

  $('prac-solucio').addEventListener('click', () => {
    prac.files = filesDeMapa(prac.estats[prac.pas].mapa);
    prac.correccio = null;
    prac.ajudes++;
    renderBalancEditable();
    mostraMissatge(`<strong>Aquesta és la solució.</strong> ${esc(prac.passos[prac.pas - 1].explicacio)}`, 'info');
  });

  $('prac-segueix').addEventListener('click', () => {
    const i = prac.pas;
    const { estats, passos } = prac;
    const delta = motor.variacio(estats[i - 1].mapa, estats[i].mapa);
    const relatiu = motor.avalua(prac.files, motor.esperatRelatiu(prac.filesAnteriors, delta));
    const absolut = motor.avalua(prac.files, estats[i].mapa);
    prac.historial.push({ pas: i, files: prac.files.map((f) => ({ ...f })), relatiu, absolut });
    if (i === passos.length) {
      renderFinal();
      return;
    }
    prac.filesAnteriors = prac.files.map((f) => ({ ...f }));
    prac.files = copiaFiles(prac.files);
    prac.pas++;
    renderPas();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  $('prac-surt').addEventListener('click', () => {
    if (!confirm('Segur que vols sortir? Es perdrà el progrés.')) return;
    prac = null;
    $('prac-joc').hidden = true;
    $('prac-inici').hidden = false;
  });

  document.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', () => iniciaPractica(b.dataset.mode)));

  function descripcioErrors(files, avaluacio, esperat) {
    const items = [];
    for (const f of files) {
      const estat = avaluacio.estatFiles[f.id];
      if (!estat || estat === 'ok') continue;
      const nom = f.codi ? `${f.codi} ${COMPTES[f.codi].nom}` : '(sense concepte)';
      let detall = MISSATGES[estat];
      if (estat === 'import') detall = `Has posat ${format(motor.llegeixImport(f.import))} i hauria de ser ${format(esperat[f.codi])}.`;
      if (estat === 'massa') detall = `L'has posat a ${MASSES.find((m) => m.id === f.massa).nom}, però va a ${MASSES.find((m) => m.id === COMPTES[f.codi].massa).nom}.`;
      items.push(`<li><strong>${esc(nom)}</strong>: ${esc(detall)}</li>`);
    }
    for (const codi of avaluacio.falten) {
      items.push(`<li><strong>${esc(codi)} ${esc(COMPTES[codi].nom)}</strong>: falta al balanç (${format(esperat[codi])}).</li>`);
    }
    return items.join('');
  }

  function renderFinal() {
    $('prac-joc').hidden = true;
    const { estats, passos } = prac;
    const final = $('prac-final');
    const encerts = prac.historial.filter((h) => h.relatiu.errors === 0).length;
    const nota = Math.round((encerts / passos.length) * 100) / 10;
    let anteriors = [];
    const files = prac.historial.map((h) => {
      const delta = motor.variacio(estats[h.pas - 1].mapa, estats[h.pas].mapa);
      const esperat = motor.esperatRelatiu(anteriors, delta);
      anteriors = h.files;
      const detall = h.relatiu.errors ? `<details><summary>Veure errors</summary><ul>${descripcioErrors(h.files, h.relatiu, esperat)}</ul></details>` : '';
      return `<tr>
        <td>${h.pas}. ${esc(passos[h.pas - 1].titol)}${detall}</td>
        <td class="${h.relatiu.errors ? 'no' : 'si'}">${h.relatiu.errors ? `✗ ${h.relatiu.errors}` : '✓'}</td>
        <td class="${h.absolut.errors ? 'no' : 'si'}">${h.absolut.errors ? '✗' : '✓'}</td>
      </tr>`;
    }).join('');
    final.innerHTML = `
      <h2>Resultat ${prac.mode === 'examen' ? "del simulacre d'examen" : 'de la pràctica'}: ${esc(prac.escenari.nom)}</h2>
      <p class="nota">${String(nota).replace('.', ',')} <small>/ 10</small></p>
      <p>Has registrat bé <strong>${encerts}</strong> de ${passos.length} operacions${prac.ajudes ? ` (has fet servir ${prac.ajudes} ajud${prac.ajudes > 1 ? 'es' : 'a'})` : ''}.</p>
      <p class="explicacio">Una operació compta com a ben registrada si l'has aplicat bé sobre el teu propi balanç anterior, encara que aquest arrossegués errors. La darrera columna indica si el balanç coincidia exactament amb el correcte.</p>
      <table class="resultats">
        <thead><tr><th>Pas</th><th>Operació</th><th>Balanç</th></tr></thead>
        <tbody>${files}</tbody>
      </table>
      <div class="accions">
        <button class="boto primari" id="final-torna">Tria un altre exercici</button>
      </div>`;
    final.hidden = false;
    $('final-torna').addEventListener('click', () => {
      final.hidden = true;
      $('prac-inici').hidden = false;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.addEventListener('hashchange', navega);
  navega();
})();
