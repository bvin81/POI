# Útvonal Kereső

Mobilbarát webalkalmazás, amely séta vagy ingázás közben valós idejű helyszín-ajánlásokat kínál az útvonal mentén. Megadod, hova tartasz – az app megmutatja, mi esik útba.

## Funkciók

- **Útvonaltervezés** tetszőleges kiindulási pont és úticél között
- **Intelligens keresés** az útvonalon: pékség, kávézó, gyógyszertár és 100+ kategória
- **Hang- és szöveges bevitel** kereséshez
- **Kitérő szerinti rendezés** – a legkevesebbet kitérő helyek kerülnek felülre
- **Több köztes megálló** hozzáadása, automatikus sorrendoptimalizálással
- **Érkezési hangjelzés** 50 méteren belül
- **Mentett helyek** (Otthon, Munkahely stb.) gyors eléréshez
- **Saját helyek felvétele** keresési kategóriával – akkor is ajánlja, ha nincs OSM-ben
- **Folyamatos GPS-követés** – a kék pont mozog, a térkép nem ugrik el

## Technológia

| Réteg | Eszköz |
|---|---|
| Térkép | [Leaflet.js](https://leafletjs.com/) + OpenStreetMap |
| Útvonaltervezés | [OpenRouteService API](https://openrouteservice.org/) |
| POI keresés | [Overpass API](https://overpass-api.de/) (OSM adatok) |
| Geocoding | [Nominatim](https://nominatim.org/) |
| Hang bevitel | Web Speech API |
| Adat tárolás | localStorage |

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
# Egyszeri beállítás (GitHub Desktop vagy terminal):
git init
git remote add origin https://github.com/felhasznalonev/utvonal-app.git

# Változások feltöltése (deploy.bat duplaklikk, vagy terminal):
deploy.bat
```

GitHub Pages beállítása: repo → Settings → Pages → Branch: `main`

## Fájlstruktúra

```
utvonal-app/
├── index.html          # Főoldal és UI struktúra
├── style.css           # Mobilbarát stílusok
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

1. **Úticél megadása** – válassz mentett helyet vagy mentsd el az aktuális pozíciót
2. **Megálló hozzáadása** – kattints a `+ Megálló hozzáadása` gombra, írd be vagy mondd be, mit keresel
3. **Útvonal tervezése** – az app sorba rendezi a megállókat (legközelebbi először) és megjeleníti az útvonalat
4. **Indulás** – a kék pont követi a pozíciódat, megérkezéskor hangjelzés szól

## Keresési kategóriák (példák)

`pékség` · `kávézó` · `étterem` · `gyógyszertár` · `virágüzlet` · `borbély` · `autószervíz` · `buszmegálló` · `elektromos töltő` · `könyvtár` · `állatorvos` · `ivókút`

Teljes lista: `js/places.js` → `OSM_TAGS` objektum (~130 kategória)

## Ismert korlátok

- Az OpenStreetMap adatok teljessége városonként változó – kisebb településeken hiányos lehet
- Értékelések (csillagok) nem elérhetők az ingyenes OSM adatokban
- A hangbevitel csak Chrome böngészőben működik megbízhatóan
- Az ORS ingyenes tier napi 2000 útvonaltervezési kérést engedélyez

## Lehetséges fejlesztések

- Google Places API integráció értékelésekhez
- Közlekedési mód választó (gyalog / kerékpár / autó)
- Offline mód előre letöltött térképadatokkal
- Push értesítések háttérben futó ellenőrzéshez
