// Főkontroller – összeköti az összes modult
const App = {

  currentLocation: null,     // { lat, lng } – mindig a GPS pozíció
  origin: null,              // { lat, lng } – kiindulópont (GPS vagy mentett hely)
  destination: null,         // { name, lat, lng }
  pendingPOILocation: null,  // { lat, lng } – POI felvételkor ideiglenesen tárolt helyszín
  stops: [],                 // [{ keyword, place: { name, lat, lng, emoji } }]
  currentRoute: null,        // GeoJSON Feature az ORS-től
  pendingKeyword: null,      // Melyik kulcsszóhoz keresünk éppen
  arrivedStops: new Set(),   // Mely megállóknál jeleztük már az érkezést

  // --- Inicializálás ---

  async init() {
    MapManager.init();
    this.setupEventListeners();
    this.loadSavedPlacesIntoSelect();
    this.requestLocation();
  },

  requestLocation() {
    if (!navigator.geolocation) {
      alert('GPS nem elérhető ebben a böngészőben.');
      return;
    }
    let firstFix = true;
    navigator.geolocation.watchPosition(
      (pos) => {
        this.currentLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        // Csak az első pozíciónál igazítjuk középre a térképet
        MapManager.setCurrentLocation(this.currentLocation.lat, this.currentLocation.lng, firstFix);
        firstFix = false;
        if (document.getElementById('origin-select').value === 'gps') {
          this.origin = this.currentLocation;
        }
        this.checkArrival();
        this.updateRouteInfo();
      },
      () => alert('GPS pozíció nem elérhető. Engedélyezd a helymeghatározást!'),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  },

  // --- Eseménykezelők ---

  setupEventListeners() {
    document.getElementById('origin-select').onchange = (e) => {
      const val = e.target.value;
      if (val === 'gps') {
        this.origin = this.currentLocation;
      } else {
        const places = Storage.getSavedPlaces();
        this.origin = places[parseInt(val)];
      }
      this.currentRoute = null; // útvonal újratervezés szükséges
    };

    document.getElementById('btn-manage-places').onclick  = () => this.showView('places');
    document.getElementById('btn-add-stop').onclick       = () => this.showView('search');
    document.getElementById('btn-plan-route').onclick     = () => this.planAndShowRoute();
    document.getElementById('btn-search').onclick         = () => this.performSearch();
    document.getElementById('btn-cancel-search').onclick  = () => this.showView('main');
    document.getElementById('btn-voice').onclick          = () => this.startVoiceInput();
    document.getElementById('btn-close-results').onclick  = () => {
      MapManager.clearPOIMarkers();
      this.showView('main');
    };
    document.getElementById('btn-close-places').onclick   = () => {
      this.loadSavedPlacesIntoSelect();
      this.showView('main');
    };
    document.getElementById('btn-save-current').onclick   = () => this.saveCurrentPlace();
    document.getElementById('btn-pick-on-map').onclick    = () => this.startPickOnMap();
    document.getElementById('btn-add-custom-poi').onclick = () => this.showView('add-poi');
    document.getElementById('btn-close-add-poi').onclick  = () => this.showView('places');
    document.getElementById('btn-poi-use-gps').onclick    = () => this.setPOILocationFromGPS();
    document.getElementById('btn-poi-pick-map').onclick   = () => this.startPickPOIOnMap();
    document.getElementById('btn-save-poi').onclick       = () => this.saveCustomPOI();

    document.getElementById('destination-select').onchange = (e) => {
      const idx = e.target.value;
      if (idx === '') { this.destination = null; return; }
      const places = Storage.getSavedPlaces();
      this.destination = places[parseInt(idx)];
      MapManager.setDestinationMarker(this.destination.lat, this.destination.lng, this.destination.name);
    };

    document.getElementById('search-input').addEventListener('keyup', (e) => {
      if (e.key === 'Enter') this.performSearch();
    });
  },

  // --- Nézetek váltása ---

  showView(name) {
    ['main', 'search', 'results', 'places', 'add-poi'].forEach(v => {
      document.getElementById(`view-${v}`).classList.toggle('hidden', v !== name);
    });
    if (name === 'search') {
      document.getElementById('search-input').value = '';
      document.getElementById('search-input').focus();
    }
    if (name === 'places') {
      this.renderSavedPlaces();
      this.renderCustomPOIs();
    }
    if (name === 'add-poi') {
      document.getElementById('poi-name').value = '';
      document.getElementById('poi-keyword').value = '';
      this.pendingPOILocation = null;
      this.updatePOILocationStatus(null);
    }
  },

  // --- Hangbevitel ---

  startVoiceInput() {
    const btn = document.getElementById('btn-voice');
    btn.textContent = '🔴';
    Speech.listen(
      (text) => {
        document.getElementById('search-input').value = text;
        btn.textContent = '🎤';
      },
      (err) => {
        alert(err);
        btn.textContent = '🎤';
      }
    );
  },

  // --- Keresés ---

  async performSearch() {
    const keyword = document.getElementById('search-input').value.trim();
    if (!keyword) return;

    if (!this.currentLocation || !this.destination) {
      alert('Kérlek először add meg az úticélt!');
      return;
    }

    // Ha még nincs útvonal, először megtervezzük (de nem jelenítjük meg újra)
    if (!this.currentRoute) {
      try {
        await this.planRouteInternal();
      } catch (e) {
        alert('Útvonal tervezési hiba: ' + e.message);
        return;
      }
    }

    this.pendingKeyword = keyword;
    this.showLoading(true);

    try {
      const coords = this.currentRoute.geometry.coordinates;
      const results = await Places.searchAlongRoute(coords, keyword);
      this.showResults(results, keyword);
    } catch (err) {
      alert('Keresési hiba: ' + err.message);
      this.showView('main');
    } finally {
      this.showLoading(false);
    }
  },

  // --- Találatok megjelenítése ---

  showResults(places, keyword) {
    MapManager.clearPOIMarkers();

    document.getElementById('results-keyword').textContent =
      `Keresés: "${keyword}" — ${places.length} találat`;

    const list = document.getElementById('results-list');
    list.innerHTML = '';

    if (places.length === 0) {
      list.innerHTML = '<p class="empty-msg">Nincs találat az útvonalon belül.<br>Próbálj más kulcsszót!</p>';
    } else {
      places.forEach(place => {
        list.appendChild(this.buildResultItem(place, keyword));
        MapManager.addPOIMarker(place, () => this.selectPlace(place, keyword));
      });
    }

    this.showView('results');
  },

  buildResultItem(place, keyword) {
    const div = document.createElement('div');
    div.className = 'result-item';

    const detourText = place.detourMeters != null
      ? (place.detourMeters < 50 ? '✅ útba esik' : `↗️ ~${place.detourMeters} m kitérő`)
      : '';

    div.innerHTML = `
      <div class="result-emoji">${place.emoji}</div>
      <div class="result-info">
        <div class="result-name">${place.name}</div>
        ${place.address      ? `<div class="result-addr">${place.address}</div>` : ''}
        ${detourText         ? `<div class="result-detour">${detourText}</div>` : ''}
        ${place.openingHours ? `<div class="result-hours">🕐 ${place.openingHours}</div>` : ''}
      </div>
      <button class="select-btn">Kiválaszt</button>
    `;

    div.querySelector('.select-btn').onclick = () => this.selectPlace(place, keyword);
    return div;
  },

  // --- Útvonal optimalizálás (legközelebbi megálló először) ---

  optimizeStopsOrder() {
    if (this.stops.length <= 1) return;

    const start = this.origin || this.currentLocation;
    if (!start) return;

    const remaining = [...this.stops];
    const optimized = [];
    let current = { lat: start.lat, lng: start.lng };

    while (remaining.length > 0) {
      let nearestIdx = 0;
      let nearestDist = Infinity;
      remaining.forEach((stop, i) => {
        const d = Places.haversineMeters(current.lat, current.lng, stop.place.lat, stop.place.lng);
        if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
      });
      optimized.push(remaining[nearestIdx]);
      current = remaining[nearestIdx].place;
      remaining.splice(nearestIdx, 1);
    }

    this.stops = optimized;
    this.arrivedStops.clear();
  },

  // --- Megálló kiválasztása ---

  async selectPlace(place, keyword) {
    this.stops.push({ keyword, place });
    this.optimizeStopsOrder();
    this.renderStops();
    MapManager.clearPOIMarkers();
    this.showView('main');

    // Újratervezzük az útvonalat az új megállóval
    try {
      await this.planRouteInternal();
      MapManager.showRoute(this.currentRoute);
    } catch (e) {
      alert('Útvonal frissítési hiba: ' + e.message);
    }
  },

  // --- Megállók megjelenítése ---

  renderStops() {
    MapManager.setStopMarkers(this.stops);
    const list = document.getElementById('stops-list');
    list.innerHTML = '';
    this.stops.forEach((stop, i) => {
      const div = document.createElement('div');
      div.className = 'stop-item';
      div.innerHTML = `
        <span class="stop-name">${stop.place.emoji} ${stop.place.name}</span>
        <button class="remove-stop" data-idx="${i}">✕</button>
      `;
      div.querySelector('.remove-stop').onclick = async (e) => {
        this.stops.splice(parseInt(e.target.dataset.idx), 1);
        this.optimizeStopsOrder();
        this.renderStops();
        if (this.currentRoute) {
          await this.planRouteInternal();
          MapManager.showRoute(this.currentRoute);
        }
      };
      list.appendChild(div);
    });
  },

  // --- Útvonaltervezés ---

  async planAndShowRoute() {
    try {
      await this.planRouteInternal();
      MapManager.showRoute(this.currentRoute);
      this.updateRouteInfo();
    } catch (e) {
      alert(e.message);
    }
  },

  async planRouteInternal() {
    const startPoint = this.origin || this.currentLocation;
    if (!startPoint) throw new Error('Kiindulópont nem elérhető! Engedélyezd a GPS-t, vagy válassz mentett helyet.');
    if (!this.destination) throw new Error('Kérlek add meg az úticélt!');

    this.showLoading(true);
    try {
      const waypoints = [
        startPoint,
        ...this.stops.map(s => ({ lat: s.place.lat, lng: s.place.lng })),
        this.destination
      ];
      this.currentRoute = await Routing.getRoute(waypoints);
      this.updateRouteInfo();
    } finally {
      this.showLoading(false);
    }
  },

  // --- Mentett helyek ---

  loadSavedPlacesIntoSelect() {
    const places = Storage.getSavedPlaces();

    const destSelect = document.getElementById('destination-select');
    const prevDest = destSelect.value;
    destSelect.innerHTML = '<option value="">Válassz mentett helyet...</option>';

    const origSelect = document.getElementById('origin-select');
    const prevOrig = origSelect.value;
    origSelect.innerHTML = '<option value="gps">📍 Aktuális pozíció (GPS)</option>';

    places.forEach((p, i) => {
      const optD = document.createElement('option');
      optD.value = i;
      optD.textContent = p.name;
      destSelect.appendChild(optD);

      const optO = document.createElement('option');
      optO.value = i;
      optO.textContent = p.name;
      origSelect.appendChild(optO);
    });

    destSelect.value = prevDest;
    origSelect.value = prevOrig || 'gps';
  },

  renderSavedPlaces() {
    const places = Storage.getSavedPlaces();
    const list = document.getElementById('saved-places-list');
    list.innerHTML = '';

    if (places.length === 0) {
      list.innerHTML = '<p class="empty-msg">Még nincs mentett helyed.</p>';
      return;
    }

    places.forEach((p, i) => {
      const div = document.createElement('div');
      div.className = 'saved-place-item';
      div.innerHTML = `
        <span>📌 ${p.name}</span>
        <button class="remove-place" data-idx="${i}">Töröl</button>
      `;
      div.querySelector('.remove-place').onclick = (e) => {
        Storage.removePlace(parseInt(e.target.dataset.idx));
        this.renderSavedPlaces();
      };
      list.appendChild(div);
    });
  },

  saveCurrentPlace() {
    const name = document.getElementById('new-place-name').value.trim();
    if (!name) { alert('Kérlek adj meg egy nevet!'); return; }
    if (!this.currentLocation) { alert('GPS pozíció még nem elérhető!'); return; }

    Storage.addPlace(name, this.currentLocation.lat, this.currentLocation.lng);
    document.getElementById('new-place-name').value = '';
    this.renderSavedPlaces();
  },

  startPickOnMap() {
    const name = document.getElementById('new-place-name').value.trim();
    if (!name) { alert('Kérlek előbb adj meg egy nevet a helynek!'); return; }

    // Elrejtjük a panelt, megmutatjuk a tippet
    document.getElementById('pick-hint').classList.remove('hidden');

    MapManager.enablePickMode((lat, lng) => {
      document.getElementById('pick-hint').classList.add('hidden');
      Storage.addPlace(name, lat, lng);
      document.getElementById('new-place-name').value = '';
      this.renderSavedPlaces();
      this.loadSavedPlacesIntoSelect();
    });
  },

  // --- Saját POI-k ---

  renderCustomPOIs() {
    const pois = Storage.getCustomPOIs();
    const list = document.getElementById('custom-poi-list');
    list.innerHTML = '';

    if (pois.length === 0) {
      list.innerHTML = '<p class="empty-msg">Még nincs saját helyed.</p>';
      return;
    }

    pois.forEach(poi => {
      const div = document.createElement('div');
      div.className = 'custom-poi-item';
      div.innerHTML = `
        <div style="font-size:22px">${poi.emoji}</div>
        <div class="custom-poi-info">
          <div class="custom-poi-name">${poi.name}</div>
          <div class="custom-poi-keyword">🔍 ${poi.keyword}</div>
        </div>
        <button class="remove-place" data-id="${poi.id}">Töröl</button>
      `;
      div.querySelector('.remove-place').onclick = (e) => {
        Storage.removeCustomPOI(parseInt(e.target.dataset.id));
        this.renderCustomPOIs();
      };
      list.appendChild(div);
    });
  },

  setPOILocationFromGPS() {
    if (!this.currentLocation) { alert('GPS pozíció még nem elérhető!'); return; }
    this.pendingPOILocation = this.currentLocation;
    this.updatePOILocationStatus(this.currentLocation);
  },

  startPickPOIOnMap() {
    const hint = document.getElementById('poi-pick-hint');
    hint.textContent = 'Kattints a térképen a hely megjelöléséhez!';
    hint.classList.remove('hidden');
    MapManager.enablePickMode((lat, lng) => {
      hint.classList.add('hidden');
      this.pendingPOILocation = { lat, lng };
      this.updatePOILocationStatus({ lat, lng });
    });
  },

  updatePOILocationStatus(loc) {
    const el = document.getElementById('poi-location-status');
    if (!loc) {
      el.textContent = 'Helyszín nincs megadva';
      el.className = 'location-status';
    } else {
      el.textContent = `✅ Helyszín megadva (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})`;
      el.className = 'location-status set';
    }
  },

  saveCustomPOI() {
    const name    = document.getElementById('poi-name').value.trim();
    const keyword = document.getElementById('poi-keyword').value.trim();
    if (!name)    { alert('Add meg a hely nevét!'); return; }
    if (!keyword) { alert('Add meg a kategóriát (pl. pékség)!'); return; }
    if (!this.pendingPOILocation) { alert('Add meg a helyszínt!'); return; }

    const emoji = Places.getEmojiForKeyword(keyword);
    Storage.addCustomPOI(name, keyword, this.pendingPOILocation.lat, this.pendingPOILocation.lng, emoji);
    this.showView('places');
  },

  // --- Útvonal info (maradék távolság és idő) ---

  updateRouteInfo() {
    try {
      const el = document.getElementById('route-info');
      if (!el || !this.currentRoute) {
        document.getElementById('route-info')?.classList.add('hidden');
        return;
      }

      const coords = this.currentRoute.geometry.coordinates;
      if (!coords || coords.length < 2) { el.classList.add('hidden'); return; }

      let remainingMeters;
      if (this.currentLocation) {
        remainingMeters = this.calcRemainingDistance(coords, this.currentLocation.lat, this.currentLocation.lng);
      } else {
        remainingMeters = this.currentRoute.properties?.summary?.distance
          ?? this.calcTotalDistance(coords);
      }

      if (!remainingMeters || isNaN(remainingMeters)) { el.classList.add('hidden'); return; }

      const distText = remainingMeters >= 1000
        ? `📍 ${(remainingMeters / 1000).toFixed(1)} km`
        : `📍 ${Math.round(remainingMeters)} m`;

      // 5 km/h = 83.3 m/perc
      const minutes = Math.round(remainingMeters / 83.3);
      const timeText = minutes < 1   ? '⏱ < 1 perc'
        : minutes < 60 ? `⏱ ~${minutes} perc`
        : `⏱ ~${Math.floor(minutes / 60)} ó ${minutes % 60} perc`;

      el.innerHTML = `<span>${distText}</span><span>${timeText}</span>`;
      el.classList.remove('hidden');
    } catch (e) {
      console.warn('updateRouteInfo hiba:', e);
    }
  },

  // Maradék távolság az útvonalon a jelenlegi pozíciótól
  calcRemainingDistance(routeCoords, currentLat, currentLng) {
    let minDist = Infinity;
    let nearestIdx = 0;
    let nearestT = 0;

    for (let i = 0; i < routeCoords.length - 1; i++) {
      const aLat = routeCoords[i][1],   aLng = routeCoords[i][0];
      const bLat = routeCoords[i+1][1], bLng = routeCoords[i+1][0];
      const dx = bLng - aLng, dy = bLat - aLat;
      const lenSq = dx*dx + dy*dy;
      let t = 0;
      if (lenSq > 0) {
        t = ((currentLng - aLng)*dx + (currentLat - aLat)*dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
      }
      const d = Places.haversineMeters(currentLat, currentLng, aLat + t*dy, aLng + t*dx);
      if (d < minDist) { minDist = d; nearestIdx = i; nearestT = t; }
    }

    // Részleges szegmens + maradék szegmensek összege
    const bLat = routeCoords[nearestIdx+1][1], bLng = routeCoords[nearestIdx+1][0];
    const aLat = routeCoords[nearestIdx][1],   aLng = routeCoords[nearestIdx][0];
    let remaining = Places.haversineMeters(
      aLat + nearestT*(bLat - aLat), aLng + nearestT*(bLng - aLng),
      bLat, bLng
    );
    for (let i = nearestIdx + 1; i < routeCoords.length - 1; i++) {
      remaining += Places.haversineMeters(
        routeCoords[i][1], routeCoords[i][0],
        routeCoords[i+1][1], routeCoords[i+1][0]
      );
    }
    return remaining;
  },

  calcTotalDistance(routeCoords) {
    let total = 0;
    for (let i = 0; i < routeCoords.length - 1; i++) {
      total += Places.haversineMeters(
        routeCoords[i][1], routeCoords[i][0],
        routeCoords[i+1][1], routeCoords[i+1][0]
      );
    }
    return total;
  },

  // --- Érkezési hangjelzés ---

  checkArrival() {
    if (!this.currentLocation || this.stops.length === 0) return;

    this.stops.forEach((stop, i) => {
      if (this.arrivedStops.has(i)) return;
      const dist = Places.haversineMeters(
        this.currentLocation.lat, this.currentLocation.lng,
        stop.place.lat, stop.place.lng
      );
      if (dist < 50) {
        this.arrivedStops.add(i);
        this.playArrivalSound();
        this.showToast(`Megérkeztél: ${stop.place.emoji} ${stop.place.name}`);
      }
    });
  },

  playArrivalSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [523, 659, 784].forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.22);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.22 + 0.3);
        osc.start(ctx.currentTime + i * 0.22);
        osc.stop(ctx.currentTime + i * 0.22 + 0.3);
      });
    } catch (e) { /* Audio API nem elérhető */ }
  },

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'arrival-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('toast-visible'), 10);
    setTimeout(() => {
      toast.classList.remove('toast-visible');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  },

  // --- Betöltés jelző ---

  showLoading(show) {
    document.getElementById('loading-overlay').classList.toggle('hidden', !show);
  }

};

document.addEventListener('DOMContentLoaded', () => App.init());
