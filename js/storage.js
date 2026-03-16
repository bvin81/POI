// Mentett helyek kezelése (localStorage)
const Storage = {

  getSavedPlaces() {
    return JSON.parse(localStorage.getItem('savedPlaces') || '[]');
  },

  savePlaces(places) {
    localStorage.setItem('savedPlaces', JSON.stringify(places));
  },

  addPlace(name, lat, lng) {
    const places = this.getSavedPlaces();
    places.push({ name, lat, lng });
    this.savePlaces(places);
  },

  removePlace(index) {
    const places = this.getSavedPlaces();
    places.splice(index, 1);
    this.savePlaces(places);
  },

  // --- Saját POI-k (manuálisan felvett helyek kereséshez) ---

  getCustomPOIs() {
    return JSON.parse(localStorage.getItem('customPOIs') || '[]');
  },

  addCustomPOI(name, keyword, lat, lng, emoji) {
    const pois = this.getCustomPOIs();
    pois.push({ id: Date.now(), name, keyword: keyword.toLowerCase(), lat, lng, emoji });
    localStorage.setItem('customPOIs', JSON.stringify(pois));
  },

  removeCustomPOI(id) {
    const pois = this.getCustomPOIs().filter(p => p.id !== id);
    localStorage.setItem('customPOIs', JSON.stringify(pois));
  },

  // Keresés: visszaadja azokat a saját POI-kat, amelyek keyword-je egyezik
  searchCustomPOIs(keyword) {
    const lower = keyword.toLowerCase();
    return this.getCustomPOIs().filter(p =>
      p.keyword.includes(lower) || lower.includes(p.keyword)
    );
  }

};
