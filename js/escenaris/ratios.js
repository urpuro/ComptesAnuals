// Casos de l'apartat de ràtios: els comptes anuals de tancament de cinc
// empreses. Cada cas és un sol assentament [compte, deure, haver] que deixa
// el balanç i el compte de pèrdues i guanys finals.
(function (root) {
  const escenaris = [
    {
      id: 'rat-llibreria',
      apartat: 'ratios',
      tipus: 'practica',
      nivell: 'Fàcil',
      nom: 'Llibreria Paper i Tinta, SL',
      descripcio: 'Una llibreria amb local propi que ven llibres i material escolar.',
      passos: [
        {
          titol: 'Comptes anuals a 31 de desembre',
          enunciat: "Aquests són el balanç de situació i el compte de pèrdues i guanys de Llibreria Paper i Tinta, SL a 31 de desembre. Calcula'n les ràtios i interpreta-les.",
          explicacio: '',
          assentament: [
            ['211', 80000, 0], ['216', 20000, 0], ['281', 0, 30000], ['300', 25000, 0],
            ['430', 20000, 0], ['572', 20000, 0], ['100', 0, 50000], ['170', 0, 40000],
            ['400', 0, 18000], ['520', 0, 5000], ['700', 0, 150000], ['600', 80000, 0],
            ['610', 0, 2000], ['640', 30000, 0], ['642', 9000, 0], ['628', 4000, 0],
            ['681', 5000, 0], ['662', 2000, 0], ['630', 5500, 0], ['4752', 0, 5500],
          ],
        },
      ],
    },
    {
      id: 'rat-consultoria',
      apartat: 'ratios',
      tipus: 'practica',
      nivell: 'Fàcil',
      nom: 'Consultoria Nexe, SL',
      descripcio: 'Una empresa de serveis de consultoria, sense existències.',
      passos: [
        {
          titol: 'Comptes anuals a 31 de desembre',
          enunciat: "Aquests són el balanç de situació i el compte de pèrdues i guanys de Consultoria Nexe, SL a 31 de desembre. Calcula'n les ràtios i interpreta-les.",
          explicacio: '',
          assentament: [
            ['206', 12000, 0], ['217', 18000, 0], ['280', 0, 6000], ['281', 0, 9000],
            ['430', 38000, 0], ['572', 27000, 0], ['100', 0, 30000], ['410', 0, 4000],
            ['4751', 0, 3500], ['476', 0, 4500], ['520', 0, 5000], ['113', 0, 11000],
            ['705', 0, 180000], ['640', 90000, 0], ['642', 28000, 0], ['621', 15000, 0],
            ['623', 12000, 0], ['627', 5000, 0], ['680', 3000, 0], ['681', 4500, 0],
            ['662', 800, 0], ['769', 0, 300], ['630', 5500, 0], ['4752', 0, 5500],
          ],
        },
      ],
    },
    {
      id: 'rat-constructora',
      apartat: 'ratios',
      tipus: 'practica',
      nivell: 'Mitjà',
      nom: 'Construccions Montseny, SA',
      descripcio: 'Una constructora amb molta maquinària i préstecs a llarg termini.',
      passos: [
        {
          titol: 'Comptes anuals a 31 de desembre',
          enunciat: "Aquests són el balanç de situació i el compte de pèrdues i guanys de Construccions Montseny, SA a 31 de desembre. Calcula'n les ràtios i interpreta-les.",
          explicacio: '',
          assentament: [
            ['210', 60000, 0], ['211', 150000, 0], ['213', 90000, 0], ['218', 40000, 0],
            ['281', 0, 70000], ['300', 30000, 0], ['430', 45000, 0], ['572', 8000, 0],
            ['100', 0, 60000], ['170', 0, 150000], ['173', 0, 20000], ['400', 0, 40000],
            ['520', 0, 30000], ['476', 0, 8000], ['113', 0, 27000], ['705', 0, 260000],
            ['600', 90000, 0], ['640', 80000, 0], ['642', 25000, 0], ['622', 6000, 0],
            ['625', 4000, 0], ['681', 25000, 0], ['662', 12000, 0], ['630', 4500, 0],
            ['4752', 0, 4500],
          ],
        },
      ],
    },
    {
      id: 'rat-botiga',
      apartat: 'ratios',
      tipus: 'practica',
      nivell: 'Mitjà',
      nom: 'Moda Rambla, SL',
      descripcio: 'Una botiga de roba en un local llogat.',
      passos: [
        {
          titol: 'Comptes anuals a 31 de desembre',
          enunciat: "Aquests són el balanç de situació i el compte de pèrdues i guanys de Moda Rambla, SL a 31 de desembre. Calcula'n les ràtios i interpreta-les.",
          explicacio: '',
          assentament: [
            ['216', 30000, 0], ['217', 10000, 0], ['281', 0, 12000], ['300', 40000, 0],
            ['430', 6000, 0], ['572', 3000, 0], ['100', 0, 25000], ['400', 0, 35000],
            ['520', 0, 15000], ['523', 0, 5000], ['4750', 0, 3000], ['700', 0, 120000],
            ['600', 75000, 0], ['610', 3000, 0], ['640', 24000, 0], ['642', 7500, 0],
            ['621', 9600, 0], ['627', 1500, 0], ['681', 4000, 0], ['662', 1400, 0],
          ],
        },
      ],
    },
    {
      id: 'rat-fabrica',
      apartat: 'ratios',
      tipus: 'practica',
      nivell: 'Difícil',
      nom: 'Mobles Segarra, SA',
      descripcio: 'Una fàbrica de mobles amb un client de cobrament dubtós.',
      passos: [
        {
          titol: 'Comptes anuals a 31 de desembre',
          enunciat: "Aquests són el balanç de situació i el compte de pèrdues i guanys de Mobles Segarra, SA a 31 de desembre. Calcula'n les ràtios i interpreta-les.",
          explicacio: '',
          assentament: [
            ['210', 50000, 0], ['211', 200000, 0], ['213', 120000, 0], ['281', 0, 110000],
            ['300', 45000, 0], ['430', 22000, 0], ['436', 5000, 0], ['490', 0, 5000],
            ['572', 12000, 0], ['100', 0, 150000], ['170', 0, 110000], ['400', 0, 30000],
            ['520', 0, 20000], ['527', 0, 2000], ['113', 0, 5000], ['700', 0, 280000],
            ['600', 130000, 0], ['610', 5000, 0], ['640', 60000, 0], ['642', 19000, 0],
            ['628', 12000, 0], ['694', 5000, 0], ['681', 20000, 0], ['662', 7000, 0],
            ['630', 5500, 0], ['4752', 0, 5500],
          ],
        },
      ],
    },
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = escenaris;
  else (root.CA = root.CA || {}).escenaris = (root.CA.escenaris || []).concat(escenaris);
})(this);
