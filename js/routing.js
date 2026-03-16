// Útvonaltervezés az OpenRouteService API-n keresztül
// Ingyenes API kulcs: https://openrouteservice.org/dev/#/signup
const Routing = {

  // ⚠️ IDE ÍRD BE AZ ORS API KULCSODAT:
  ORS_API_KEY: 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImVlOWY4OTM5NmEzZTQzNzk4MDBkZjRkMDVmNjE1MjQ1IiwiaCI6Im11cm11cjY0In0=',

  // Elérhető közlekedési módok
  PROFILES: {
    gyalog:   'foot-walking',
    kerékpár: 'cycling-regular',
    autó:     'driving-car',
  },

  // Útvonal lekérése több ponton keresztül
  async getRoute(waypoints, profile = 'foot-walking') {
    if (waypoints.length < 2) throw new Error('Legalább 2 pont szükséges!');

    // ORS [lng, lat] sorrendben várja a koordinátákat
    const coordinates = waypoints.map(p => [p.lng, p.lat]);

    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/${profile}/geojson`,
      {
        method: 'POST',
        headers: {
          'Authorization': this.ORS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ coordinates })
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Útvonal tervezési hiba (' + response.status + ')');
    }

    const data = await response.json();
    return data.features[0]; // GeoJSON Feature
  }

};
