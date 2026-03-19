# Útvonal Kereső

Mobilbarát webalkalmazás, amely séta vagy ingázás közben valós idejű helyszín-ajánlásokat kínál az útvonal mentén. Megadod, hova tartasz – az app megmutatja, mi esik útba.

## Funkciók

- **Útvonaltervezés** tetszőleges kiindulási pont és úticél között
- **Szabad úticél megadás** – cím vagy helynév alapján (Nominatim geocoding), térkép kattintással, vagy mentett helyből
- **Intelligens keresés** az útvonalon: pékség, kávézó, gyógyszertár és 100+ kategória
- **Hang- és szöveges bevitel** kereséshez
- **Kitérő szerinti rendezés** – a legkevesebbet kitérő helyek kerülnek felülre
- **Több köztes megálló** hozzáadása, automatikus sorrendoptimalizálással
- **Érkezési hangjelzés** 50 méteren belül – köztes megállóknál és végállomásnál egyaránt
- **Mentett helyek** (Otthon, Munkahely stb.) gyors eléréshez
- **Saját helyek felvétele** keresési kategóriával – akkor is ajánlja, ha nincs OSM-ben
- **Folyamatos GPS-követés** – a kék pont mozog, a térkép nem ugrik el
- **Térkép középre gomb** – egy kattintással visszaviszi a nézetet az aktuális pozícióra
- **Valós sebesség alapú érkezési idő** – az utolsó 30 másodperc GPS adataiból számítva, exponenciális simítással
- **PWA – telepíthető Android appként** – kezdőképernyőre adható, offline működés, natív app élmény

## Technológia

| Réteg | Eszköz |
|---|---|
| Térkép | [Leaflet.js](https://leafletjs.com/) + OpenStreetMap |
| Útvonaltervezés | [OpenRouteService API](https://openrouteservice.org/) |
| POI keresés | [Overpass API](https://overpass-api.de/) (OSM adatok) |
| Geocoding | [Nominatim](https://nominatim.org/) |
| Hang bevitel | Web Speech API |
| Adat tárolás | localStorage |
| Offline / PWA | Service Worker + Web App Manifest |

Minden eszköz **ingyenes**, regisztrációhoz csak az OpenRouteService API kulcs szükséges.

## Beállítás

### 1. ORS API kulcs

1. Regisztrálj: [openrouteservice.org](https://openrouteservice.org/dev/#/signup)
2. Másold ki az API kulcsot
3. Nyisd meg `js/routing.js` és írd be:

```js
ORS_API_KEY: 'ide_az_api_kulcsod',
```

### 2. Futtatás

Az app egyszerű HTML/JS, nincs build lépés. Lokálisan HTTPS-t igényel (GPS és hangbevitel miatt):

```bash
# VS Code Live Server extension (ajánlott)
# Jobb klikk az index.html-en → Open with Live Server

# Vagy npx-szel:
npx serve .
```

### 3. Deploy GitHub Pages-re

```bash
# Egyszeri beállítás:
git init
git remote add origin https://github.com/felhasznalonev/utvonal-app.git

# Változások feltöltése (deploy.bat duplaklikk):
deploy.bat
```

GitHub Pages beállítása: repo → Settings → Pages → Branch: `main`

### 4. Telepítés Androidra (PWA)

1. Nyisd meg a GitHub Pages URL-t **Chrome**-ban
2. Chrome megkérdezi: „Hozzáadás a kezdőképernyőhöz?" → **Telepítés**
3. Az app saját ikonnal, böngésző sáv nélkül indul, mint egy natív app

> Az ikonokhoz hozz létre egy `icons/` mappát `icon-192.png` és `icon-512.png` fájlokkal (pl. [favicon.io](https://favicon.io/favicon-generator/) segítségével).

## Fájlstruktúra

```
utvonal-app/
├── index.html          # Főoldal és UI struktúra
├── style.css           # Mobilbarát stílusok
├── manifest.json       # PWA manifest (név, ikon, megjelenítés)
├── sw.js               # Service Worker (offline cache)
├── deploy.bat          # Egy kattintásos GitHub deploy
├── .nojekyll           # Jekyll letiltása GitHub Pages-en
└── js/
    ├── app.js          # Főkontroller
    ├── map.js          # Leaflet térkép, GPS, markerek
    ├── places.js       # Overpass API keresés, kitérő számítás
    ├── routing.js      # OpenRouteService útvonaltervezés
    ├── storage.js      # localStorage (mentett helyek, saját POI-k)
    └── speech.js       # Web Speech API hangbevitel
```

## Használat

1. **Úticél megadása** – írj be egy címet vagy helynevet, válassz a javaslatokból, vagy kattints a térképen
2. **Megálló hozzáadása** – kattints a `+ Megálló hozzáadása` gombra, írd be vagy mondd be, mit keresel
3. **Útvonal tervezése** – az app sorba rendezi a megállókat (legközelebbi először) és megjeleníti az útvonalat
4. **Indulás** – a kék pont követi a pozíciódat, az érkezési idő a valós sebességed alapján frissül, megérkezéskor hangjelzés szól

## Keresési kategóriák (példák)

`pékség` · `kávézó` · `étterem` · `gyógyszertár` · `virágüzlet` · `borbély` · `autószervíz` · `buszmegálló` · `elektromos töltő` · `könyvtár` · `állatorvos` · `ivókút`

Teljes lista: `js/places.js` → `OSM_TAGS` objektum (~130 kategória)

## Ismert korlátok

- Az OpenStreetMap adatok teljessége városonként változó – kisebb településeken hiányos lehet
- Értékelések (csillagok) nem elérhetők az ingyenes OSM adatokban
- A hangbevitel csak Chrome böngészőben működik megbízhatóan
- Az ORS ingyenes tier napi 2000 útvonaltervezési kérést engedélyez
- A mentett helyek localStorage-ban tárolódnak – eszközönként és domain-enként külön

## Lehetséges fejlesztések

- Google Places API integráció értékelésekhez
- Közlekedési mód választó (gyalog / kerékpár / autó)
- Push értesítések háttérben futó ellenőrzéshez

claude --resume 9685c770-dcce-4c9d-bdc6-7124b21f2953
