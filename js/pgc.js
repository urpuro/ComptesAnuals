// Catàleg de comptes del Pla General de Comptabilitat (PGC) utilitzats pel joc.
(function (root) {
  // Masses patrimonials del balanç de situació, en l'ordre en què es presenten.
  const MASSES = [
    { id: 'ANC', nom: 'Actiu no corrent', costat: 'actiu' },
    { id: 'AC', nom: 'Actiu corrent', costat: 'actiu' },
    { id: 'PN', nom: 'Patrimoni net', costat: 'passiu' },
    { id: 'PNC', nom: 'Passiu no corrent', costat: 'passiu' },
    { id: 'PC', nom: 'Passiu corrent', costat: 'passiu' },
  ];

  // Partides del compte de pèrdues i guanys (model del PGC, simplificat).
  // Els subtotals es calculen a partir de les partides anteriors.
  const PARTIDES_PIG = [
    { id: 'xifra', nom: 'Import net de la xifra de negocis' },
    { id: 'aprov', nom: 'Aprovisionaments' },
    { id: 'personal', nom: 'Despeses de personal' },
    { id: 'altres', nom: "Altres despeses d'explotació" },
    { id: 'amort', nom: "Amortització de l'immobilitzat" },
    { subtotal: 'explotacio', nom: "A.1) Resultat d'explotació", inclou: ['xifra', 'aprov', 'personal', 'altres', 'amort'] },
    { id: 'ing_fin', nom: 'Ingressos financers' },
    { id: 'desp_fin', nom: 'Despeses financeres' },
    { subtotal: 'financer', nom: 'A.2) Resultat financer', inclou: ['ing_fin', 'desp_fin'] },
    { subtotal: 'bai', nom: "A.3) Resultat abans d'impostos", inclou: ['explotacio', 'financer'] },
    { id: 'impost', nom: 'Impost sobre beneficis' },
    { subtotal: 'resultat', nom: "A.4) Resultat de l'exercici", inclou: ['bai', 'impost'], final: true },
  ];

  // massa: on va el compte al balanç. pig: partida del compte de pèrdues i guanys.
  // correctora: compte que resta dins la seva massa (es presenta en negatiu).
  const COMPTES = {
    '100': { nom: 'Capital social', massa: 'PN' },
    '112': { nom: 'Reserva legal', massa: 'PN' },
    '129': { nom: "Resultat de l'exercici", massa: 'PN' },
    '170': { nom: 'Deutes a llarg termini amb entitats de crèdit', massa: 'PNC' },
    '210': { nom: 'Terrenys i béns naturals', massa: 'ANC' },
    '211': { nom: 'Construccions', massa: 'ANC' },
    '213': { nom: 'Maquinària', massa: 'ANC' },
    '216': { nom: 'Mobiliari', massa: 'ANC' },
    '217': { nom: "Equips per a processos d'informació", massa: 'ANC' },
    '218': { nom: 'Elements de transport', massa: 'ANC' },
    '281': { nom: "Amortització acumulada de l'immobilitzat material", massa: 'ANC', correctora: true },
    '300': { nom: 'Mercaderies', massa: 'AC' },
    '400': { nom: 'Proveïdors', massa: 'PC' },
    '430': { nom: 'Clients', massa: 'AC' },
    '4752': { nom: 'Hisenda Pública, creditora per impost sobre societats', massa: 'PC' },
    '476': { nom: 'Organismes de la Seguretat Social, creditors', massa: 'PC' },
    '520': { nom: 'Deutes a curt termini amb entitats de crèdit', massa: 'PC' },
    '523': { nom: "Proveïdors d'immobilitzat a curt termini", massa: 'PC' },
    '570': { nom: 'Caixa', massa: 'AC' },
    '572': { nom: 'Bancs i institucions de crèdit', massa: 'AC' },
    '600': { nom: 'Compres de mercaderies', pig: 'aprov' },
    '610': { nom: "Variació d'existències de mercaderies", pig: 'aprov' },
    '621': { nom: 'Arrendaments i cànons', pig: 'altres' },
    '628': { nom: 'Subministraments', pig: 'altres' },
    '630': { nom: 'Impost sobre beneficis', pig: 'impost' },
    '640': { nom: 'Sous i salaris', pig: 'personal' },
    '642': { nom: "Seguretat Social a càrrec de l'empresa", pig: 'personal' },
    '662': { nom: 'Interessos de deutes', pig: 'desp_fin' },
    '681': { nom: "Amortització de l'immobilitzat material", pig: 'amort' },
    '700': { nom: 'Vendes de mercaderies', pig: 'xifra' },
    '769': { nom: 'Altres ingressos financers', pig: 'ing_fin' },
  };

  // Compte on el balanç recull el resultat acumulat del compte de pèrdues i guanys.
  const COMPTE_RESULTAT = '129';

  const pgc = { MASSES, PARTIDES_PIG, COMPTES, COMPTE_RESULTAT };
  if (typeof module !== 'undefined' && module.exports) module.exports = pgc;
  else (root.CA = root.CA || {}).pgc = pgc;
})(this);
