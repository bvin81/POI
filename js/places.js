// POI keresés az Overpass API-n keresztül (OpenStreetMap adatok)
const Places = {

  OVERPASS_URL: 'https://overpass-api.de/api/interpreter',

  // Magyar kulcsszó → OSM tag megfeleltetés
  OSM_TAGS: {
    // --- Étel & ital ---
    'virágüzlet':         [['shop', 'florist']],
    'virág':              [['shop', 'florist']],
    'pékség':             [['shop', 'bakery']],
    'pék':                [['shop', 'bakery']],
    'péksütemény':        [['shop', 'bakery']],
    'kávé':               [['amenity', 'cafe']],
    'kávézó':             [['amenity', 'cafe']],
    'teázó':              [['amenity', 'cafe']],
    'reggelizőhely':      [['amenity', 'cafe']],
    'brunch':             [['amenity', 'cafe']],
    'étterem':            [['amenity', 'restaurant']],
    'bisztró':            [['amenity', 'restaurant']],
    'pizzéria':           [['amenity', 'restaurant']],
    'pizza':              [['amenity', 'restaurant']],
    'halétterem':         [['amenity', 'restaurant']],
    'grill':              [['amenity', 'restaurant']],
    'vegetáriánus':       [['amenity', 'restaurant']],
    'vegán':              [['amenity', 'restaurant']],
    'gyorsétterem':       [['amenity', 'fast_food']],
    'hamburger':          [['amenity', 'fast_food']],
    'street food':        [['amenity', 'fast_food']],
    'büfé':               [['amenity', 'fast_food']],
    'szendvicsbár':       [['amenity', 'fast_food']],
    'salátabár':          [['amenity', 'fast_food']],
    'deli':               [['shop', 'deli']],
    'cukrászda':          [['shop', 'confectionery']],
    'édességbolt':        [['shop', 'confectionery']],
    'fagylalt':           [['shop', 'ice_cream']],
    'fagyizó':            [['shop', 'ice_cream']],
    'söröző':             [['amenity', 'pub']],
    'pub':                [['amenity', 'pub']],
    'bár':                [['amenity', 'bar']],
    'borbár':             [['amenity', 'bar']],
    'koktélbár':          [['amenity', 'bar']],

    // --- Élelmiszer ---
    'szuper':             [['shop', 'supermarket']],
    'szupermarket':       [['shop', 'supermarket']],
    'élelmiszer':         [['shop', 'convenience'], ['shop', 'supermarket']],
    'élelmiszerbolt':     [['shop', 'convenience'], ['shop', 'supermarket']],
    'kisbolt':            [['shop', 'convenience']],
    'bolt':               [['shop', 'convenience']],
    'zöldséges':          [['shop', 'greengrocer']],
    'gyümölcsbolt':       [['shop', 'greengrocer']],
    'hentes':             [['shop', 'butcher']],
    'halbolt':            [['shop', 'seafood']],
    'tejbolt':            [['shop', 'dairy']],
    'bio bolt':           [['shop', 'health_food']],
    'bio':                [['shop', 'health_food']],
    'delikát':            [['shop', 'deli']],
    'csokoládébolt':      [['shop', 'chocolate']],
    'italbolt':           [['shop', 'beverages']],
    'borbolt':            [['shop', 'wine']],
    'sörbolt':            [['shop', 'alcohol']],
    'dohánybolt':         [['shop', 'tobacco']],
    'trafik':             [['shop', 'tobacco']],
    'újságos':            [['shop', 'newsagent']],

    // --- Kiskereskedelem: ruházat ---
    'ruha':               [['shop', 'clothes']],
    'ruhabolt':           [['shop', 'clothes']],
    'ruhaüzlet':          [['shop', 'clothes']],
    'férfi ruházat':      [['shop', 'clothes']],
    'női ruházat':        [['shop', 'clothes']],
    'gyermek ruházat':    [['shop', 'clothes']],
    'sportruházat':       [['shop', 'sports']],
    'fehérnemű':          [['shop', 'underwear']],
    'cipő':               [['shop', 'shoes']],
    'cipőbolt':           [['shop', 'shoes']],
    'táskabolt':          [['shop', 'bag']],
    'ékszerbolt':         [['shop', 'jewelry']],
    'órabolt':            [['shop', 'watches']],
    'napszemüveg':        [['shop', 'optician']],

    // --- Kiskereskedelem: elektronika ---
    'elektronika':        [['shop', 'electronics']],
    'elektromos':         [['shop', 'electronics']],
    'mobiltelefon':       [['shop', 'mobile_phone']],
    'telefon':            [['shop', 'mobile_phone']],
    'számítástechnika':   [['shop', 'computer']],
    'laptop':             [['shop', 'computer']],
    'kamera':             [['shop', 'camera']],
    'gamer':              [['shop', 'computer']],

    // --- Kiskereskedelem: otthon ---
    'bútorbolt':          [['shop', 'furniture']],
    'bútor':              [['shop', 'furniture']],
    'lakberendezés':      [['shop', 'furniture']],
    'konyhafelszerelés':  [['shop', 'kitchen']],
    'világítás':          [['shop', 'lighting']],
    'matrac':             [['shop', 'bed']],
    'lakástextil':        [['shop', 'fabric']],
    'ajándék':            [['shop', 'gift']],
    'könyv':              [['shop', 'books']],
    'könyvesbolt':        [['shop', 'books']],

    // --- Egészség ---
    'gyógyszertár':       [['amenity', 'pharmacy']],
    'patika':             [['amenity', 'pharmacy']],
    'drogéria':           [['shop', 'chemist']],
    'optika':             [['shop', 'optician']],
    'szemüvegbolt':       [['shop', 'optician']],
    'szemüveg':           [['shop', 'optician']],
    'gyógyászati':        [['shop', 'medical_supply']],
    'klinika':            [['amenity', 'clinic']],
    'labor':              [['amenity', 'clinic']],
    'sürgősség':          [['amenity', 'hospital']],
    'kórház':             [['amenity', 'hospital']],
    'orvos':              [['amenity', 'doctors']],
    'fogászat':           [['amenity', 'dentist']],

    // --- Személyes szolgáltatások ---
    'fodrász':            [['shop', 'hairdresser']],
    'fodrászat':          [['shop', 'hairdresser']],
    'borbély':            [['shop', 'barber']],
    'barber':             [['shop', 'barber']],
    'kozmetika':          [['shop', 'beauty']],
    'körömszalon':        [['shop', 'beauty']],
    'masszázs':           [['amenity', 'massage']],
    'spa':                [['leisure', 'spa']],
    'szolárium':          [['shop', 'tanning']],
    'tetoválás':          [['shop', 'tattoo']],
    'tetováló':           [['shop', 'tattoo']],

    // --- Háztartási szolgáltatások ---
    'mosoda':             [['shop', 'laundry']],
    'ruhatisztító':       [['shop', 'dry_cleaning']],
    'cipész':             [['shop', 'shoe_repair']],
    'kulcsmásoló':        [['shop', 'locksmith']],
    'varroda':            [['shop', 'tailor']],
    'csomagpont':         [['amenity', 'parcel_locker']],
    'nyomda':             [['shop', 'copyshop']],
    'fénymásoló':         [['shop', 'copyshop']],
    'internetkávézó':     [['amenity', 'internet_cafe']],
    'coworking':          [['amenity', 'coworking_space']],

    // --- Pénzügyi ---
    'bank':               [['amenity', 'bank']],
    'bankfiók':           [['amenity', 'bank']],
    'atm':                [['amenity', 'atm']],
    'pénzautomata':       [['amenity', 'atm']],
    'pénzváltó':          [['amenity', 'bureau_de_change']],
    'biztosító':          [['amenity', 'insurance']],

    // --- Oktatás ---
    'óvoda':              [['amenity', 'kindergarten']],
    'iskola':             [['amenity', 'school']],
    'középiskola':        [['amenity', 'school']],
    'egyetem':            [['amenity', 'university']],
    'könyvtár':           [['amenity', 'library']],
    'nyelviskola':        [['amenity', 'language_school']],
    'zeneiskola':         [['amenity', 'music_school']],

    // --- Közlekedés ---
    'buszmegálló':        [['highway', 'bus_stop']],
    'villamosmegálló':    [['railway', 'tram_stop']],
    'metróállomás':       [['railway', 'subway_entrance']],
    'vasútállomás':       [['railway', 'station']],
    'taxiállomás':        [['amenity', 'taxi']],
    'parkolóház':         [['amenity', 'parking']],
    'parkoló':            [['amenity', 'parking']],
    'elektromos töltő':   [['amenity', 'charging_station']],
    'töltő':              [['amenity', 'charging_station']],
    'kerékpárkölcsönző':  [['amenity', 'bicycle_rental']],
    'autóbérlés':         [['amenity', 'car_rental']],
    'autómegosztó':       [['amenity', 'car_sharing']],
    'benzinkút':          [['amenity', 'fuel']],
    'autószervíz':        [['shop', 'car_repair']],
    'szervíz':            [['shop', 'car_repair']],
    'autószerelő':        [['shop', 'car_repair']],
    'autókereskedő':      [['shop', 'car']],
    'autómosó':           [['amenity', 'car_wash']],
    'gumiszerelő':        [['shop', 'tyres']],

    // --- Turizmus & kultúra ---
    'múzeum':             [['tourism', 'museum']],
    'galéria':            [['tourism', 'gallery']],
    'színház':            [['amenity', 'theatre']],
    'mozi':               [['amenity', 'cinema']],
    'koncerthelyszín':    [['amenity', 'events_venue']],
    'kulturális központ': [['amenity', 'community_centre']],
    'történelmi emlékhely':[['tourism', 'attraction']],
    'kilátó':             [['tourism', 'viewpoint']],
    'turista információ': [['tourism', 'information']],
    'szálloda':           [['tourism', 'hotel']],
    'hotel':              [['tourism', 'hotel']],

    // --- Szabadidő ---
    'park':               [['leisure', 'park']],
    'játszótér':          [['leisure', 'playground']],
    'edzőterem':          [['leisure', 'fitness_centre']],
    'uszoda':             [['leisure', 'swimming_pool']],
    'sportpálya':         [['leisure', 'pitch']],
    'futópálya':          [['leisure', 'track']],
    'piknik':             [['tourism', 'picnic_site']],

    // --- Vallás & közösség ---
    'templom':            [['amenity', 'place_of_worship']],
    'zsinagóga':          [['amenity', 'place_of_worship']],
    'mecset':             [['amenity', 'place_of_worship']],
    'kápolna':            [['amenity', 'place_of_worship']],
    'közösségi ház':      [['amenity', 'community_centre']],

    // --- Állatok ---
    'állatorvos':         [['amenity', 'veterinary']],
    'állateledel':        [['shop', 'pet']],
    'kutyakozmetika':     [['shop', 'pet_grooming']],
    'kutyafuttató':       [['leisure', 'dog_park']],

    // --- Posta & csomag ---
    'posta':              [['amenity', 'post_office']],
    'postahivatal':       [['amenity', 'post_office']],

    // --- Gyors szükségletek ---
    'wc':                 [['amenity', 'toilets']],
    'nyilvános wc':       [['amenity', 'toilets']],
    'ivókút':             [['amenity', 'drinking_water']],
    'pad':                [['amenity', 'bench']],
  },

  // Emoji az OSM tagek alapján
  EMOJI: {
    // Étel & ital
    'shop=florist':           '💐',
    'shop=bakery':            '🥐',
    'shop=confectionery':     '🍰',
    'shop=ice_cream':         '🍦',
    'shop=deli':              '🫙',
    'shop=chocolate':         '🍫',
    'amenity=cafe':           '☕',
    'amenity=restaurant':     '🍽️',
    'amenity=fast_food':      '🍔',
    'amenity=pub':            '🍺',
    'amenity=bar':            '🍸',
    // Élelmiszer
    'shop=supermarket':       '🛒',
    'shop=convenience':       '🏪',
    'shop=greengrocer':       '🥬',
    'shop=butcher':           '🥩',
    'shop=seafood':           '🐟',
    'shop=dairy':             '🥛',
    'shop=health_food':       '🌿',
    'shop=beverages':         '🥤',
    'shop=wine':              '🍷',
    'shop=alcohol':           '🍺',
    'shop=tobacco':           '🚬',
    'shop=newsagent':         '📰',
    // Kiskereskedelem
    'shop=clothes':           '👕',
    'shop=sports':            '⚽',
    'shop=underwear':         '👙',
    'shop=shoes':             '👟',
    'shop=bag':               '👜',
    'shop=jewelry':           '💍',
    'shop=watches':           '⌚',
    'shop=gift':              '🎁',
    'shop=electronics':       '📱',
    'shop=mobile_phone':      '📱',
    'shop=computer':          '💻',
    'shop=camera':            '📷',
    'shop=furniture':         '🛋️',
    'shop=kitchen':           '🍳',
    'shop=lighting':          '💡',
    'shop=bed':               '🛏️',
    'shop=fabric':            '🧵',
    'shop=books':             '📚',
    'shop=optician':          '👓',
    // Egészség
    'amenity=pharmacy':       '💊',
    'shop=chemist':           '🧴',
    'shop=medical_supply':    '🩺',
    'amenity=hospital':       '🏥',
    'amenity=clinic':         '🏥',
    'amenity=doctors':        '👨‍⚕️',
    'amenity=dentist':        '🦷',
    // Szolgáltatások
    'shop=hairdresser':       '✂️',
    'shop=barber':            '💈',
    'shop=beauty':            '💅',
    'amenity=massage':        '💆',
    'leisure=spa':            '🧖',
    'shop=tanning':           '☀️',
    'shop=tattoo':            '🪡',
    'shop=laundry':           '🧺',
    'shop=dry_cleaning':      '👔',
    'shop=shoe_repair':       '👟',
    'shop=locksmith':         '🔑',
    'shop=tailor':            '🧵',
    'shop=copyshop':          '🖨️',
    'amenity=parcel_locker':  '📦',
    'amenity=internet_cafe':  '💻',
    'amenity=coworking_space':'🏢',
    // Pénzügyi
    'amenity=bank':           '🏦',
    'amenity=atm':            '💳',
    'amenity=bureau_de_change':'💱',
    'amenity=insurance':      '🛡️',
    // Oktatás
    'amenity=kindergarten':   '🧒',
    'amenity=school':         '🏫',
    'amenity=university':     '🎓',
    'amenity=library':        '📚',
    'amenity=language_school':'🗣️',
    'amenity=music_school':   '🎵',
    // Közlekedés
    'highway=bus_stop':       '🚌',
    'railway=tram_stop':      '🚊',
    'railway=subway_entrance':'🚇',
    'railway=station':        '🚂',
    'amenity=taxi':           '🚕',
    'amenity=parking':        '🅿️',
    'amenity=charging_station':'⚡',
    'amenity=bicycle_rental': '🚲',
    'amenity=car_rental':     '🚗',
    'amenity=car_sharing':    '🚗',
    'amenity=fuel':           '⛽',
    'shop=car_repair':        '🔧',
    'shop=car':               '🚗',
    'amenity=car_wash':       '🚿',
    'shop=tyres':             '🛞',
    // Turizmus & kultúra
    'tourism=museum':         '🏛️',
    'tourism=gallery':        '🖼️',
    'amenity=theatre':        '🎭',
    'amenity=cinema':         '🎬',
    'amenity=events_venue':   '🎪',
    'amenity=community_centre':'🏛️',
    'tourism=attraction':     '🗺️',
    'tourism=viewpoint':      '👁️',
    'tourism=information':    'ℹ️',
    'tourism=hotel':          '🏨',
    // Szabadidő
    'leisure=park':           '🌳',
    'leisure=playground':     '🛝',
    'leisure=fitness_centre': '🏋️',
    'leisure=swimming_pool':  '🏊',
    'leisure=pitch':          '⚽',
    'leisure=track':          '🏃',
    'leisure=dog_park':       '🐕',
    'tourism=picnic_site':    '🧺',
    // Vallás
    'amenity=place_of_worship':'⛪',
    // Állatok
    'amenity=veterinary':     '🐾',
    'shop=pet':               '🐾',
    'shop=pet_grooming':      '🐕',
    // Posta
    'amenity=post_office':    '📮',
    // Gyors szükségletek
    'amenity=toilets':        '🚻',
    'amenity=drinking_water': '💧',
    'amenity=bench':          '🪑',
  },

  // Kulcsszóból meghatározza az OSM tag-eket
  resolveKeyword(keyword) {
    const lower = keyword.toLowerCase().trim();

    // Pontos egyezés
    if (this.OSM_TAGS[lower]) return this.OSM_TAGS[lower];

    // Részleges egyezés 1: a bevitt szöveg tartalmaz egy ismert kulcsszót
    // pl. "kávét vennék" → tartalmazza: "kávé"
    for (const key of Object.keys(this.OSM_TAGS)) {
      if (lower.includes(key)) return this.OSM_TAGS[key];
    }

    // Részleges egyezés 2: egy ismert kulcsszó tartalmazza a bevitt szöveget
    // pl. "kávé" → megtalálja: "kávézó"; "bútor" → megtalálja: "bútorbolt"
    if (lower.length >= 4) {
      for (const key of Object.keys(this.OSM_TAGS)) {
        if (key.includes(lower)) return this.OSM_TAGS[key];
      }
    }

    return null;
  },

  // Emoji lekérése az OSM tagek alapján
  getEmoji(tags) {
    if (!tags) return '📍';
    for (const [key, val] of Object.entries(tags)) {
      const combo = `${key}=${val}`;
      if (this.EMOJI[combo]) return this.EMOJI[combo];
    }
    return '📍';
  },

  // Főfüggvény: helyek keresése az útvonal mentén
  async searchAlongRoute(routeCoordinates, keyword) {
    // routeCoordinates: [[lng, lat], ...] formátum (ORS-ből)
    const tags = this.resolveKeyword(keyword);

    if (!tags) {
      throw new Error(
        `A "${keyword}" kulcsszót nem ismerem.\n\nPróbálj konkrétabb kifejezést, pl.:\npékség, kávézó, gyógyszertár, virágüzlet, autószervíz, bank, atm, posta, étterem`
      );
    }

    // Around polyline: az útvonal mentén 200m-es sávban keres
    // Kevés mintapont (15) + kis sugár (200m) = gyors és célzott keresés
    const sampled = this.sampleCoordinates(routeCoordinates, 15);
    const coordString = sampled.map(c => `${c[1]},${c[0]}`).join(',');

    // Tag szűrő összeállítása
    let unionParts = '';
    for (const [k, v] of tags) {
      const filter = `["${k}"="${v}"]`;
      unionParts += `node${filter}(around:200,${coordString});\n`;
      unionParts += `way${filter}(around:200,${coordString});\n`;
    }

    const query = `[out:json][timeout:25];(${unionParts});out 60 center tags;`;

    const response = await fetch(this.OVERPASS_URL, {
      method: 'POST',
      body: 'data=' + encodeURIComponent(query)
    });

    if (!response.ok) throw new Error('Overpass API hiba: ' + response.status);

    const data = await response.json();
    const allResults = this.parseResults(data.elements);

    // Kitérő kiszámítása (az around már 200m-re szűrt, itt csak rendezünk)
    const results = allResults.filter(p => {
      p.detourMeters = this.minDistanceToRoute(p.lat, p.lng, routeCoordinates);
      return p.detourMeters <= 250;
    });

    // Saját (manuálisan felvett) POI-k hozzáadása
    const customMatches = Storage.searchCustomPOIs(keyword).map(p => ({
      ...p,
      address: '',
      openingHours: null,
      custom: true,
      detourMeters: this.minDistanceToRoute(p.lat, p.lng, routeCoordinates)
    }));
    results.push(...customMatches);

    results.sort((a, b) => a.detourMeters - b.detourMeters);
    return results;
  },

  // Bounding box számítása az útvonal koordinátái köré
  getRouteBoundingBox(routeCoords, paddingMeters) {
    const lats = routeCoords.map(c => c[1]);
    const lngs = routeCoords.map(c => c[0]);
    const latPad = paddingMeters / 111000;
    const lngPad = paddingMeters / (111000 * Math.cos(Math.min(...lats) * Math.PI / 180));
    return {
      south: Math.min(...lats) - latPad,
      north: Math.max(...lats) + latPad,
      west:  Math.min(...lngs) - lngPad,
      east:  Math.max(...lngs) + lngPad
    };
  },

  // Nyers Overpass elemek átalakítása
  parseResults(elements) {
    const seen = new Set();
    return elements
      .map(el => ({
        id: el.id,
        lat: el.lat ?? el.center?.lat,
        lng: el.lon ?? el.center?.lon,
        name: el.tags?.name || 'Névtelen hely',
        address: [el.tags?.['addr:street'], el.tags?.['addr:housenumber']]
          .filter(Boolean).join(' '),
        openingHours: el.tags?.opening_hours || null,
        phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
        website: el.tags?.website || el.tags?.['contact:website'] || null,
        emoji: this.getEmoji(el.tags),
        tags: el.tags
      }))
      .filter(p => {
        if (!p.lat || !p.lng) return false;
        if (seen.has(p.name)) return false;  // duplikátumok kiszűrése
        seen.add(p.name);
        return true;
      });
  },

  // Útvonal koordinátáinak ritkítása (Overpass URL-korlát miatt)
  sampleCoordinates(coords, maxPoints) {
    if (coords.length <= maxPoints) return coords;
    const step = Math.floor(coords.length / maxPoints);
    return coords.filter((_, i) => i % step === 0);
  },

  // Emoji meghatározása kulcsszóból (saját POI felvételkor)
  getEmojiForKeyword(keyword) {
    const tags = this.resolveKeyword(keyword);
    if (!tags) return '📍';
    const [k, v] = tags[0];
    return this.EMOJI[`${k}=${v}`] || '📍';
  },

  // Legrövidebb távolság egy pont és az útvonal között (méterben)
  // routeCoords: [[lng, lat], ...] (ORS formátum)
  minDistanceToRoute(lat, lng, routeCoords) {
    let minDist = Infinity;
    for (let i = 0; i < routeCoords.length - 1; i++) {
      const d = this.distanceToSegment(
        lat, lng,
        routeCoords[i][1],   routeCoords[i][0],    // szegmens kezdete: lat, lng
        routeCoords[i+1][1], routeCoords[i+1][0]   // szegmens vége:   lat, lng
      );
      if (d < minDist) minDist = d;
    }
    return Math.round(minDist);
  },

  // Távolság egy pont és egy szakasz között (méterben, Haversine alapú)
  distanceToSegment(pLat, pLng, aLat, aLng, bLat, bLng) {
    const dx = bLng - aLng;
    const dy = bLat - aLat;
    const lenSq = dx * dx + dy * dy;

    let t = 0;
    if (lenSq > 0) {
      t = ((pLng - aLng) * dx + (pLat - aLat) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
    }

    const closestLat = aLat + t * dy;
    const closestLng = aLng + t * dx;
    return this.haversineMeters(pLat, pLng, closestLat, closestLng);
  },

  // Két GPS koordináta közötti távolság méterben
  haversineMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

};
