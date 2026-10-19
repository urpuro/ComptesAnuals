# ComptesAnuals

Joc pedagògic web per aprendre a llegir i entendre els **comptes anuals** d'una empresa: el **balanç de situació** i el **compte de pèrdues i guanys**.

## Motivació

Els comptes anuals solen presentar-se com una fotografia estàtica: unes taules plenes de partides i xifres que costa interpretar si no se sap d'on surten. Però darrere de cada xifra hi ha decisions i fets concrets de l'empresa.

Aquest aplicatiu vol mostrar els comptes anuals **en moviment**. L'alumne avança pas a pas per la història d'una empresa i veu com cada operació modifica els estats financers:

1. **Constitució de l'empresa** — els socis aporten diners: al balanç només hi apareixen el *capital social* (patrimoni net) i l'*efectiu* (actiu).
2. **Compra d'una fàbrica** — apareix un actiu no corrent i disminueix l'efectiu; el balanç continua quadrant.
3. **Petició d'un préstec, compra d'existències, vendes, pagament de sous...** — cada pas fa aparèixer, créixer o desaparèixer partides.

De la mateixa manera, el **compte de pèrdues i guanys** es va construint al llarg d'un exercici: ingressos i despeses s'hi van acumulant fins arribar al resultat, que finalment s'incorpora al patrimoni net del balanç.

L'objectiu és que l'alumne entengui *per què* els comptes són com són, i no només *què* hi diu.

## Apartats

La pàgina d'inici permet triar entre el **balanç de situació** i el **compte de pèrdues i guanys**. Tots dos apartats segueixen el mateix model: una explicació bàsica i, després, triar com començar:

- **Explora** (dues exploracions per apartat: *bàsica* i *difícil*): avança pas a pas per la història d'una empresa i observa com cada operació canvia el balanç de situació i el compte de pèrdues i guanys. A l'apartat de pèrdues i guanys, cada operació porta el mes en què passa, per veure com s'acumula el resultat al llarg de l'exercici. Les partides que apareixen, pugen o baixen queden ressaltades, i cada pas inclou una explicació i l'assentament al llibre diari.
- **Practica** (cinc exercicis per apartat, de dificultat creixent, amb empreses i imports diferents dels de l'apartat Explora): se't presenta una operació i has de construir el balanç (o el compte de pèrdues i guanys) resultant: afegir els conceptes a la massa o partida que toca i escriure'n els imports. Hi ha dos modes:
  - *Pràctica*: pots corregir cada pas, demanar una pista o veure la solució, o bé seguir endavant.
  - *Simulacre d'examen*: sense correcció ni pistes fins al final.

  Si continues amb errors, els vas arrossegant als passos següents. Al final es puntua cada operació respecte al teu propi balanç anterior, de manera que un error inicial no penalitza tota la resta.

## Principis

- **Senzill i accessible**: aplicació web que funciona al navegador, sense instal·lació.
- **Stateless**: no hi ha servidor ni base de dades; tot l'estat viu al navegador.
- **Pedagògic**: cada pas s'acompanya d'una explicació breu de què ha passat i per què.
- **Rigorós**: segueix el Pla General de Comptabilitat (PGC).

## Com fer-lo servir

Obre `index.html` al navegador; no cal instal·lar res. Per publicar-lo, activa GitHub Pages al repositori (*Settings → Pages → Deploy from a branch*, carpeta arrel).

Estructura:

- `js/pgc.js`: catàleg de comptes del PGC, masses del balanç i partides de pèrdues i guanys.
- `js/escenaris/exploracions.js` i `js/escenaris/practiques.js`: escenaris del balanç; `js/escenaris/pig.js`: escenaris del compte de pèrdues i guanys. Cada pas és un assentament de partida doble.
- `js/motor.js`: càlcul del balanç i de la PiG i correcció dels balanços de l'alumne.
- `js/app.js`: interfície.
- `tests/`: proves del motor (`node --test`).
