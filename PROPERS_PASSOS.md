# Possibles propers passos

Llista orientativa d'idees per fer créixer l'aplicatiu. No és un compromís ni un ordre estricte.

## Decisions preses
- Comptabilitat segons el **PGC**.
- **HTML + CSS + JavaScript** sense dependències, publicat a **GitHub Pages**.
- Dos apartats: **Explora** (veure com canvien els estats pas a pas) i **Practica** (construir el balanç de cada pas, amb mode pràctica i mode simulacre d'examen, arrossegant els errors).

## 1. Fonaments
- [x] Triar l'stack: HTML + CSS + JavaScript sense dependències (o un framework lleuger) i allotjament estàtic (p. ex. GitHub Pages).
- [x] Definir el model de dades d'un **escenari**: una empresa, una llista ordenada de **passos**, i per a cada pas les operacions (apunts de partida doble) i un text explicatiu.
- [x] Definir l'estructura del balanç (actiu no corrent / corrent, patrimoni net, passiu no corrent / corrent) i del compte de pèrdues i guanys seguint el **Pla General de Comptabilitat**.
- [x] Motor que, a partir dels apunts acumulats fins al pas N, calculi el balanç i el compte de PiG resultants i comprovi que el balanç quadra.

## 2. Primer escenari jugable
- [x] Escenari bàsic de 6–10 passos: constitució, compra de fàbrica, préstec bancari, compra d'existències, venda al comptat, venda a crèdit, pagament de nòmines, amortització, tancament de l'exercici.
- [x] Navegació endavant / enrere entre passos.
- [x] Ressaltar visualment les partides que canvien a cada pas (què apareix, què puja, què baixa).
- [x] Mostrar balanç i PiG un al costat de l'altre i fer visible el moment en què el resultat de l'exercici passa al patrimoni net.

## 3. Interactivitat i joc
- [ ] Mode "endevina": abans de mostrar el pas següent, l'alumne prediu quines partides canviaran i en quin sentit.
- [x] Mode "construeix" (apartat Practica): l'alumne omple el balanç de cada pas, amb correcció opcional o en simulacre d'examen.
- [ ] El mateix exercici per al compte de pèrdues i guanys.
- [ ] Escollir quin escenari practicar i barrejar-ne l'ordre dels passos quan sigui possible.
- [ ] Revisar a la pantalla final el balanç de l'alumne al costat del correcte, pas a pas.
- [x] Puntuació i retroacció immediata amb explicació dels errors habituals.
- [ ] Preguntes de comprensió al final de l'escenari (p. ex. fons de maniobra, ràtios senzilles).

## 4. Contingut
- [ ] Decidir si es presenta el balanç compte a compte (com ara) o agrupat per epígrafs del model oficial (Immobilitzat material, Deutors comercials...).
- [ ] Diversos escenaris amb dificultat creixent (comerç, indústria, serveis).
- [ ] Operacions més avançades: IVA, provisions, deteriorament, distribució de dividends, ampliació de capital.
- [ ] Encadenar dos exercicis per veure el pas de resultat de l'exercici a reserves.
- [ ] Glossari de partides amb definicions breus.

## 5. Experiència d'usuari
- [ ] Disseny adaptat a mòbil i projector d'aula.
- [ ] Animacions suaus en els canvis d'imports.
- [ ] Interfície en català, preparada per a altres idiomes (castellà, anglès).
- [ ] Accessibilitat (contrast, navegació amb teclat, lectors de pantalla).

## 6. Per al professorat
- [ ] Format d'escenari en JSON fàcil d'escriure perquè el professorat en pugui crear de propis.
- [ ] Carregar un escenari des d'un fitxer o des d'un enllaç (mantenint l'aplicació stateless, p. ex. codificant l'estat a la URL).
- [ ] Exportar/imprimir l'estat d'un pas com a material de classe.

## 7. Qualitat
- [x] Proves automàtiques del motor comptable (el balanç sempre quadra, la PiG suma bé).
- [ ] Validador d'escenaris.
- [ ] Activar GitHub Pages i, si cal, desplegament automàtic amb GitHub Actions.
- [ ] Executar les proves a cada push amb GitHub Actions.
