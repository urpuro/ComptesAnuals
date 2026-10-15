// Escenaris del joc. Cada pas és una operació de l'empresa, registrada com un
// assentament de partida doble: [compte, deure, haver].
(function (root) {
  const escenaris = [
    {
      id: 'fusteria',
      nom: 'Fusteria Pirineu, SL',
      descripcio: "El primer exercici d'una petita empresa que compra i ven mobles.",
      passos: [
        {
          titol: "Constitució de l'empresa",
          enunciat: "Tres socis constitueixen Fusteria Pirineu, SL i aporten 100.000 € que ingressen al compte bancari de l'empresa.",
          explicacio: "L'empresa rep diners (actiu: Bancs) i, a canvi, té una obligació amb els socis que no s'ha de retornar: el capital social, que forma part del patrimoni net. Actiu = Patrimoni net + Passiu.",
          assentament: [['572', 100000, 0], ['100', 0, 100000]],
        },
        {
          titol: 'Compra d’una nau industrial',
          enunciat: "L'empresa compra una nau industrial per 60.000 € i la paga per transferència bancària.",
          explicacio: "Un actiu es transforma en un altre: baixa l'efectiu del banc i apareix una construcció, que l'empresa farà servir durant molts anys (actiu no corrent). El total del balanç no canvia.",
          assentament: [['211', 60000, 0], ['572', 0, 60000]],
        },
        {
          titol: 'Préstec bancari',
          enunciat: "El banc concedeix a l'empresa un préstec de 50.000 € a retornar d'aquí a 5 anys. Els diners s'ingressen al compte.",
          explicacio: "Augmenta l'efectiu i, alhora, apareix un deute amb el banc. Com que s'ha de retornar en més d'un any, és passiu no corrent.",
          assentament: [['572', 50000, 0], ['170', 0, 50000]],
        },
        {
          titol: 'Compra de maquinària',
          enunciat: "Compra maquinària per 30.000 €. En paga 10.000 € per banc i la resta la pagarà d'aquí a 3 mesos.",
          explicacio: "Apareix un nou actiu no corrent (maquinària). Una part es paga ara (baixa Bancs) i la resta queda com a deute amb el proveïdor de l'immobilitzat a curt termini (passiu corrent). No és «Proveïdors» perquè no són mercaderies.",
          assentament: [['213', 30000, 0], ['572', 0, 10000], ['523', 0, 20000]],
        },
        {
          titol: 'Compra de mercaderies',
          enunciat: 'Compra mobles per revendre per valor de 40.000 €. Els pagarà al proveïdor més endavant.',
          explicacio: "Segons el PGC, les compres de mercaderies es registren com una despesa (compte 600), no com un actiu. Per això el resultat de l'exercici passa a ser negatiu. Les existències que quedin al magatzem es regularitzaran al tancament. A canvi, apareix un deute amb el proveïdor.",
          assentament: [['600', 40000, 0], ['400', 0, 40000]],
        },
        {
          titol: 'Vendes',
          enunciat: "Ven mobles per 70.000 €. Els clients en paguen 30.000 € al moment i els altres 40.000 € els pagaran d'aquí a 60 dies.",
          explicacio: "La venda és un ingrés: millora el resultat de l'exercici. A canvi, entra efectiu al banc i neix un dret de cobrament sobre els clients (actiu corrent).",
          assentament: [['572', 30000, 0], ['430', 40000, 0], ['700', 0, 70000]],
        },
        {
          titol: 'Pagament de nòmines',
          enunciat: "Paga per banc els sous dels treballadors (15.000 €) i la Seguretat Social a càrrec de l'empresa (5.000 €).",
          explicacio: "Són despeses de personal: redueixen el resultat de l'exercici i, com que es paguen al moment, també l'efectiu.",
          assentament: [['640', 15000, 0], ['642', 5000, 0], ['572', 0, 20000]],
        },
        {
          titol: 'Cobrament de clients',
          enunciat: 'Els clients paguen 25.000 € dels 40.000 € pendents.',
          explicacio: "Un actiu es transforma en un altre: baixen els drets de cobrament (Clients) i puja l'efectiu. No afecta el resultat: l'ingrés ja es va registrar quan es va fer la venda.",
          assentament: [['572', 25000, 0], ['430', 0, 25000]],
        },
        {
          titol: 'Pagament a proveïdors',
          enunciat: "Paga 30.000 € al proveïdor de mercaderies.",
          explicacio: "Baixa l'efectiu i baixa el deute amb el proveïdor. El balanç s'escurça pels dos costats. Tampoc afecta el resultat.",
          assentament: [['400', 30000, 0], ['572', 0, 30000]],
        },
        {
          titol: 'Interessos del préstec',
          enunciat: 'Paga per banc 2.000 € d’interessos del préstec.',
          explicacio: "Els interessos són una despesa financera: redueixen el resultat i l'efectiu. El deute amb el banc no canvia perquè no s'ha retornat capital.",
          assentament: [['662', 2000, 0], ['572', 0, 2000]],
        },
        {
          titol: 'Amortització anual',
          enunciat: "Al final de l'any es registra el desgast de l'immobilitzat: 3.000 € de la nau i 3.000 € de la maquinària.",
          explicacio: "L'amortització reparteix el cost de l'immobilitzat al llarg de la seva vida útil. És una despesa que no surt del banc. Al balanç, l'amortització acumulada resta del valor de l'immobilitzat.",
          assentament: [['681', 6000, 0], ['281', 0, 6000]],
        },
        {
          titol: "Regularització d'existències",
          enunciat: "Es fa inventari: al magatzem queden mobles per valor de 12.000 €.",
          explicacio: "Les mercaderies que no s'han venut no són despesa d'aquest any: apareixen com a existències a l'actiu corrent i la variació d'existències corregeix les compres. El resultat millora en 12.000 €.",
          assentament: [['300', 12000, 0], ['610', 0, 12000]],
        },
        {
          titol: 'Impost sobre societats',
          enunciat: "El resultat abans d'impostos és de 14.000 €. L'impost sobre societats (25%) és de 3.500 €, que es pagarà l'any vinent.",
          explicacio: "L'impost és una despesa que redueix el resultat. Com que encara no s'ha pagat, apareix un deute amb Hisenda a curt termini. El resultat final de l'exercici és de 10.500 €, que forma part del patrimoni net.",
          assentament: [['630', 3500, 0], ['4752', 0, 3500]],
        },
      ],
    },
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = escenaris;
  else (root.CA = root.CA || {}).escenaris = escenaris;
})(this);
