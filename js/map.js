// Térkép kezelés (Leaflet.js + OpenStreetMap)
const MapManager = {

  map: null,
  currentLocationMarker: null,
  routeLayer: null,
  poiMarkers: [],
  waypointMarkers: [],   // célpont marker
  stopMarkers: [],       // kiválasztott megállók markerei

  pickModeCallback: null,  // ha be van állítva, a következő térkép kattintás ezt hívja meg

  init() {
    this.map = L.map('map').setView([47.497, 19.040], 13); // Budapest alapértelmezett nézet

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.map.on('click', (e) => {
      if (this.pickModeCallback) {
        this.pickModeCallback(e.latlng.lat, e.latlng.lng);
        this.pickModeCallback = null;
      }
    });
  },

  // Pick mód engedélyezése: következő térkép kattintáskor meghívja a callback-et
  enablePickMode(callback) {
    this.pickModeCallback = callback;
    this.map.getContainer().style.cursor = 'crosshair';
  },

  disablePickMode() {
    this.pickModeCallback = null;
    this.map.getContainer().style.cursor = '';
  },

  // Aktuális pozíció megjelenítése
  // centerMap: csak az első pozíciónál igaz, utána nem ugrik a térkép
  setCurrentLocation(lat, lng, centerMap = false) {
    if (this.currentLocationMarker) {
      this.currentLocationMarker.setLatLng([lat, lng]);
    } else {
      this.currentLocationMarker = L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: '#4285F4',
        color: 'white',
        weight: 3,
        fillOpacity: 1
      }).addTo(this.map).bindPopup('📍 Aktuális pozíció');
    }
    if (centerMap) this.map.setView([lat, lng], 15);
  },

  // Kiválasztott megállók jelölőinek frissítése
  setStopMarkers(stops) {
    this.stopMarkers.forEach(m => this.map.removeLayer(m));
    this.stopMarkers = [];

    stops.forEach((stop, i) => {
      const marker = L.marker([stop.place.lat, stop.place.lng], {
        icon: L.divIcon({
          className: '',
          html: `<div class="stop-map-marker">${i + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        })
      })
        .addTo(this.map)
        .bindPopup(`<b>${stop.place.emoji} ${stop.place.name}</b><br><i>${stop.keyword}</i>`);
      this.stopMarkers.push(marker);
    });
  },

  // Útvonal megjelenítése
  showRoute(geojsonFeature) {
    if (this.routeLayer) this.map.removeLayer(this.routeLayer);

    this.routeLayer = L.geoJSON(geojsonFeature, {
      style: { color: '#4285F4', weight: 5, opacity: 0.8 }
    }).addTo(this.map);

    this.map.fitBounds(this.routeLayer.getBounds(), { padding: [60, 60] });
  },

  // Célpont jelölő hozzáadása
  setDestinationMarker(lat, lng, name) {
    this.waypointMarkers.forEach(m => this.map.removeLayer(m));
    this.waypointMarkers = [];

    const marker = L.marker([lat, lng])
      .addTo(this.map)
      .bindPopup(`🏁 ${name}`);
    this.waypointMarkers.push(marker);
  },

  // Térkép visszaközépre az aktuális pozícióra
  centerOnCurrentLocation() {
    if (this.currentLocationMarker) {
      this.map.setView(this.currentLocationMarker.getLatLng(), Math.max(this.map.getZoom(), 15));
    }
  },

  // POI jelölők törlése
  clearPOIMarkers() {
    this.poiMarkers.forEach(m => this.map.removeLayer(m));
    this.poiMarkers = [];
  },

  // Egy POI megjelenítése a térképen
  addPOIMarker(place, onClick) {
    const marker = L.marker([place.lat, place.lng], {
      icon: L.divIcon({
        className: '',
        html: `<div class="poi-dot">${place.emoji}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      })
    })
      .addTo(this.map)
      .bindPopup(`<b>${place.name}</b>${place.address ? '<br>' + place.address : ''}`);

    marker.on('click', () => onClick(place));
    this.poiMarkers.push(marker);
  }

};
