<!-- markdownlint-disable MD033 -->
# Gela interaktiboko txapelketa · Torneo del aula interactiva · Interactive classroom championship

**CIFP Don Bosco LHII** — Ikastetxe osoarentzako txapelketa gela interaktiboan (ukimen anitzeko pareta). Talde bakoitzak **izen bat** du, eta izen horrekin lortzen ditu puntuak bost probatan. Puntu guztiak Google Sheet batean gordetzen dira **taldearen izenaren arabera**, edozein egunetan eta edozein gailutan jokatuta ere, eta ikastetxeko sailkapenean talde guztiak lehiatzen dira. Dena hiru hizkuntzatan: euskara, gaztelania eta ingelesa.

## Probak eta puntuak

Proba bakoitzak **gehienez 100 puntu** ematen ditu (5 proba = 500 puntu).

| # | Proba | Nola jokatzen da | Puntuak |
|---|---|---|---|
| 1 | 🏫 **Ezagutu Don Bosco** | Talde bakoitzak bere txandan. 14 galdera, erlojurik gabe; aukera bakarra galdera bakoitzean (paretara ohitzeko proba) | Asmatzeen arabera: 100 × zuzenak / 14 (adib. 14 → 100, 10 → 71, 7 → 50) |
| 2 | ⚽ **Paretako bolak** | Talde bakoitzak bere txandan. 3 minijoko jarraian; akats bakoitza +3 s | ≤1:00 → 100 · ≤1:30 → 80 · ≤2:00 → 60 · ≤3:00 → 40 · gehiago → 20 |
| 3 | 🪢 **Soka-tira: AA** | Bi talde aurrez aurre, aldi berean. Adimen artifizialari buruzko 30 galdera | Irabazlea 100 · berdinketa 70 · galtzailea 40 |
| 4 | 🔬 **STEAM erronka** | Talde bakoitzak bere txandan. 6 erronka; huts bakoitza +10 s | ≤4:00 → 100 · ≤6:00 → 80 · ≤8:00 → 60 · ≤11:00 → 40 · gehiago → 20 |
| 5 | 🤝 **Balioak 4.0 dueloa** | Bi talde aurrez aurre. Galdera bera bi aldeetan, presarik gabe; asmatze gehien dituenak irabazten du | Irabazlea 100 · berdinketa 70 · galtzailea 40 |

- Proba bat errepikatzen bada, **emaitzarik onena** zenbatzen da.
- Denbora-tarteak lehen hurbilketa bat dira: **doitu** `js/common.js` fitxategiko `POINTS` atalean, lehen saioak egin ondoren.

## Nola erabili

**Talde bakoitzaren pantailan** (mugikorra, tableta edo ordenagailua):
1. Ireki hasierako orria → aukeratu hizkuntza → idatzi **taldearen izena**.
2. Taldearen puntuak ikusten dira: guztira, proba bakoitzean eta sailkapeneko postua (minuturo eguneratzen da, edo **⟳ Eguneratu** sakatuta).
3. **🏆 Sailkapena** botoiak ikastetxe osoko sailkapena erakusten du (zuen taldea nabarmenduta).

**Paretan**:
1. Ireki hasierako orria → «Talderik gabe jarraitu» → sakatu proba baten **Jokatu**.
2. Proba bakoitzaren aurretik, **idatzi taldearen izena** (bi taldeko probetan, bi izenak: ezkerrekoa eta eskuinekoa).
   - Sheet-ean dauden izenak proposatzen dira idazten hastean. «✓ Talde ezaguna» agertzen bada, puntuak talde horri gehituko zaizkio.
   - «⚠ Talde berria» agertzen bada, egiaztatu izena ondo idatzita dagoela (hala ez bada, beste talde bat sortuko litzateke). Talde berrientzat gela edo zikloa idatz daiteke, aukeran.
   - Maiuskulek, azentuek eta hutsune gehigarriek ez dute eraginik: «Tximistak» eta « tximistak » talde bera dira.
3. Amaitzean puntuak automatikoki gordetzen dira. Bi taldeko probetan irabazleak 100 puntu jasotzen ditu, eta Sheet-ean aurkariaren izena ere gordetzen da.

> Erabili taldeentzako izenak, ez ikasleen izen-abizenak.

## 1. urratsa — Google Sheet-a prestatu (Apps Script)

Sheet-a: `https://docs.google.com/spreadsheets/d/1iFYdHydz8kwc__zuqyH0tNBZM9uE-RsJc7sP0rzonrE`

1. Ireki Sheet-a → **Luzapenak → Apps Script**.
2. Ezabatu dagoen kodea eta itsatsi `apps-script/Code.gs` fitxategiaren edukia. Gorde.
3. Aukeratu `setup` funtzioa eta sakatu **Exekutatu** (baimenak eman). Hiru orri sortzen dira:
   - **Emaitzak**: partida bakoitzaren lerro bat (data, taldearen izena, gela, jolasa, aurkaria, denbora, okerrak, zigorra, guztira, emaitza, **puntuak**…)
   - **Sailkapena**: talde guztien puntu totalak (izenaren arabera), proba bakoitzeko puntuekin (emaitza berri bakoitzean eguneratzen da)
   - **Jolasak**: jolasen zerrenda hiru hizkuntzatan
4. **Inplementatu → Inplementazio berria → Mota: Web aplikazioa**
   - Exekutatu honela: **Ni**
   - Sarbidea duena: **Edonork**
5. Kopiatu `/exec`-ekin amaitzen den URLa eta itsatsi `js/config.js` fitxategian:
   ```js
   window.DB_CONFIG = { SCRIPT_URL: 'https://script.google.com/macros/s/…/exec' };
   ```

URLrik gabe ere funtzionatzen du, baina emaitzak paretako ordenagailuan bakarrik gordetzen dira; ikasleen pantailetan puntuak ikusteko Sheet-a konektatu behar da.

> Aurreko bertsioa (saioak eta A–D letrak) instalatu baduzu: ezabatu **Emaitzak** orriko proba-lerroak, itsatsi Code.gs berria, exekutatu `setup` berriro eta egin bertsio berri bat (zutabeak aldatu dira).

**Izen bat oker idatzi bada**: zuzendu izena **Emaitzak** orrian; hurrengo emaitzarekin Sailkapena eguneratzen da (edo exekutatu `rebuildRanking` eskuz).

> Kodea aldatzen baduzu: **Inplementatu → Kudeatu inplementazioak → Editatu → Bertsio berria**, URL bera mantentzeko.

## 2. urratsa — GitHub Pages-en argitaratu

1. Igo karpeta honetako guztia repositorio berri baten erroan.
2. **Settings → Pages** → branch `main`, folder `/ (root)`.
3. Helbidea: `https://<erabiltzailea>.github.io/<repositorioa>/`

## Egitura

```
index.html            Hasierako orria: hizkuntza, gure taldearen puntuak, probak, sailkapena
js/config.js          Apps Script-aren URLa
js/common.js          Hizkuntza, izenen formularioa, PUNTUAK eta emaitzak gordetzeko kode partekatua
ezagutu/              1. proba  — galderak: ezagutu/questions.js
bolak/                2. proba
sokatira/             3. proba  — galderak: sokatira/questions.js
steam/                4. proba
balioak/              5. proba  — galderak: balioak/questions.js
apps-script/Code.gs   Google Sheet-eko scripta
```

## Galderak aldatu

- **Ezagutu Don Bosco** (`ezagutu/questions.js`): `ok` da erantzun zuzenaren zenbakia (0–3). Irudiak Google Drive-ko IDekin (fitxategiak «esteka duen edonork ikus dezake» moduan partekatuta).
- **Soka-tira** (`sokatira/questions.js`) eta **Balioak 4.0** (`balioak/questions.js`): lehenengo erantzuna da beti zuzena; jolasak berak nahasten ditu. Balioak 4.0-n `v` da balioa: `sol`, `ink`, `eki`, `int`. Galderak balioen artean orekatuta aukeratzen dira.

## Proba berri bat gehitu

Sortu karpeta berri bat, kargatu `../js/config.js` eta `../js/common.js`. Hasieran eskatu izena, eta amaitzean gorde:
```js
DB.nameForm(document.getElementById('izenak'), { count: 1 }, (izenak, gelak) => hasi(izenak[0], gelak[0]));
// ...
DB.saveResult({ game: 'nire-jolasa', teamName: izena, group: gela, total /* segundoak */ });
// bi taldeko proba batean: count: 2, eta talde bakoitzeko:  { teamName, rival, result: 'win' | 'tie' | 'lose' }
```
Gero gehitu: `index.html`-ko `GAMES` zerrendan, `js/common.js`-ko `games` testuetan eta `POINTS`-en, eta `Code.gs`-ko `GAMES` zerrendan.
