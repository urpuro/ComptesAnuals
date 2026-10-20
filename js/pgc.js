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
    { id: 'altres_ing', nom: "Altres ingressos d'explotació" },
    { id: 'personal', nom: 'Despeses de personal' },
    { id: 'altres', nom: "Altres despeses d'explotació" },
    { id: 'amort', nom: "Amortització de l'immobilitzat" },
    { id: 'alien', nom: "Deteriorament i resultat per alienacions de l'immobilitzat" },
    { subtotal: 'explotacio', nom: "A.1) Resultat d'explotació (BAII)", inclou: ['xifra', 'aprov', 'altres_ing', 'personal', 'altres', 'amort', 'alien'] },
    { id: 'ing_fin', nom: 'Ingressos financers' },
    { id: 'desp_fin', nom: 'Despeses financeres' },
    { subtotal: 'financer', nom: 'A.2) Resultat financer', inclou: ['ing_fin', 'desp_fin'] },
    { subtotal: 'bai', nom: "A.3) Resultat abans d'impostos (BAI)", inclou: ['explotacio', 'financer'] },
    { id: 'impost', nom: 'Impost sobre beneficis' },
    { subtotal: 'resultat', nom: "A.4) Resultat de l'exercici (BN)", inclou: ['bai', 'impost'], final: true },
  ];

  // massa: on va el compte al balanç. pig: partida del compte de pèrdues i guanys.
  // correctora: compte que resta dins la seva massa (es presenta en negatiu).
  // natura: només per als comptes de PiG que no segueixen la regla del grup.
  const COMPTES = {
    // Grup 1. Finançament bàsic
    '100': { nom: 'Capital social', massa: 'PN' },
    '110': { nom: "Prima d'emissió o assumpció", massa: 'PN' },
    '112': { nom: 'Reserva legal', massa: 'PN' },
    '113': { nom: 'Reserves voluntàries', massa: 'PN' },
    '129': { nom: "Resultat de l'exercici", massa: 'PN' },
    '170': { nom: 'Deutes a llarg termini amb entitats de crèdit', massa: 'PNC' },
    '173': { nom: "Proveïdors d'immobilitzat a llarg termini", massa: 'PNC' },
    // Grup 2. Actiu no corrent
    '206': { nom: 'Aplicacions informàtiques', massa: 'ANC' },
    '210': { nom: 'Terrenys i béns naturals', massa: 'ANC' },
    '211': { nom: 'Construccions', massa: 'ANC' },
    '213': { nom: 'Maquinària', massa: 'ANC' },
    '216': { nom: 'Mobiliari', massa: 'ANC' },
    '217': { nom: "Equips per a processos d'informació", massa: 'ANC' },
    '218': { nom: 'Elements de transport', massa: 'ANC' },
    '280': { nom: "Amortització acumulada de l'immobilitzat intangible", massa: 'ANC', correctora: true },
    '281': { nom: "Amortització acumulada de l'immobilitzat material", massa: 'ANC', correctora: true },
    // Grup 3. Existències
    '300': { nom: 'Mercaderies', massa: 'AC' },
    // Grup 4. Creditors i deutors per operacions comercials
    '400': { nom: 'Proveïdors', massa: 'PC' },
    '410': { nom: 'Creditors per prestacions de serveis', massa: 'PC' },
    '430': { nom: 'Clients', massa: 'AC' },
    '436': { nom: 'Clients de cobrament dubtós', massa: 'AC' },
    '465': { nom: 'Remuneracions pendents de pagament', massa: 'PC' },
    '472': { nom: 'Hisenda Pública, IVA suportat', massa: 'AC' },
    '4700': { nom: "Hisenda Pública, deutora per IVA", massa: 'AC' },
    '4750': { nom: 'Hisenda Pública, creditora per IVA', massa: 'PC' },
    '4751': { nom: 'Hisenda Pública, creditora per retencions practicades', massa: 'PC' },
    '4752': { nom: 'Hisenda Pública, creditora per impost sobre societats', massa: 'PC' },
    '476': { nom: 'Organismes de la Seguretat Social, creditors', massa: 'PC' },
    '477': { nom: 'Hisenda Pública, IVA repercutit', massa: 'PC' },
    '480': { nom: 'Despeses anticipades', massa: 'AC' },
    '490': { nom: 'Deteriorament de valor de crèdits per operacions comercials', massa: 'AC', correctora: true },
    // Grup 5. Comptes financers
    '520': { nom: 'Deutes a curt termini amb entitats de crèdit', massa: 'PC' },
    '523': { nom: "Proveïdors d'immobilitzat a curt termini", massa: 'PC' },
    '526': { nom: 'Dividend actiu a pagar', massa: 'PC' },
    '527': { nom: 'Interessos a curt termini de deutes amb entitats de crèdit', massa: 'PC' },
    '570': { nom: 'Caixa', massa: 'AC' },
    '572': { nom: 'Bancs i institucions de crèdit', massa: 'AC' },
    // Grup 6. Compres i despeses
    '600': { nom: 'Compres de mercaderies', pig: 'aprov' },
    '609': { nom: 'Ràpels per compres', pig: 'aprov', natura: 'ingres' },
    '607': { nom: 'Treballs realitzats per altres empreses', pig: 'aprov' },
    '610': { nom: "Variació d'existències de mercaderies", pig: 'aprov', natura: 'variable' },
    '621': { nom: 'Arrendaments i cànons', pig: 'altres' },
    '622': { nom: 'Reparacions i conservació', pig: 'altres' },
    '623': { nom: 'Serveis de professionals independents', pig: 'altres' },
    '624': { nom: 'Transports', pig: 'altres' },
    '625': { nom: "Primes d'assegurances", pig: 'altres' },
    '627': { nom: 'Publicitat, propaganda i relacions públiques', pig: 'altres' },
    '626': { nom: 'Serveis bancaris i similars', pig: 'altres' },
    '628': { nom: 'Subministraments', pig: 'altres' },
    '631': { nom: 'Altres tributs', pig: 'altres' },
    '630': { nom: 'Impost sobre beneficis', pig: 'impost' },
    '640': { nom: 'Sous i salaris', pig: 'personal' },
    '642': { nom: "Seguretat Social a càrrec de l'empresa", pig: 'personal' },
    '662': { nom: 'Interessos de deutes', pig: 'desp_fin' },
    '671': { nom: "Pèrdues procedents de l'immobilitzat material", pig: 'alien' },
    '680': { nom: "Amortització de l'immobilitzat intangible", pig: 'amort' },
    '681': { nom: "Amortització de l'immobilitzat material", pig: 'amort' },
    '694': { nom: 'Pèrdues per deteriorament de crèdits per operacions comercials', pig: 'altres' },
    // Grup 7. Vendes i ingressos
    '700': { nom: 'Vendes de mercaderies', pig: 'xifra' },
    '705': { nom: 'Prestacions de serveis', pig: 'xifra' },
    '752': { nom: 'Ingressos per arrendaments', pig: 'altres_ing' },
    '769': { nom: 'Altres ingressos financers', pig: 'ing_fin' },
    '771': { nom: "Beneficis procedents de l'immobilitzat material", pig: 'alien' },
  };

  // Grups del quadre de comptes, per agrupar els conceptes als desplegables.
  const GRUPS = {
    '1': 'Grup 1. Finançament bàsic',
    '2': 'Grup 2. Actiu no corrent',
    '3': 'Grup 3. Existències',
    '4': 'Grup 4. Creditors i deutors per operacions comercials',
    '5': 'Grup 5. Comptes financers',
    '6': 'Grup 6. Compres i despeses',
    '7': 'Grup 7. Vendes i ingressos',
  };

  // Naturalesa d'un compte de pèrdues i guanys: els del grup 7 són ingressos,
  // els del grup 6 despeses, tret dels que ho indiquen explícitament.
  // «variable» vol dir que pot sumar o restar (variació d'existències).
  function natura(codi) {
    const compte = COMPTES[codi];
    if (!compte || !compte.pig) return null;
    if (compte.natura) return compte.natura;
    return codi[0] === '7' ? 'ingres' : 'despesa';
  }

  // Compte on el balanç recull el resultat acumulat del compte de pèrdues i guanys.
  const COMPTE_RESULTAT = '129';

  const pgc = { MASSES, PARTIDES_PIG, COMPTES, GRUPS, COMPTE_RESULTAT, natura };
  if (typeof module !== 'undefined' && module.exports) module.exports = pgc;
  else (root.CA = root.CA || {}).pgc = pgc;
})(this);
