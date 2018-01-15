
import { appLoad } from '../actions';
import { loadLayer, showLayer } from '../store';
import store, { defaultMapView } from '../store';
import { getJSON } from '../utils/Net';

export const defaultAppState = {
  mapConfig: {
    basemapPreview: '/z-2/0,0.png',
    basemaps: {
      terrain: { name: 'Terrain', id: 'terrain', bgColor: '#000', isDefault: true },
      biome: { name: 'Biome', id: 'biome', bgColor: '#000' },
      height: { name: 'Height', id: 'height', bgColor: '#888' },
      simple: { name: 'Simple', id: 'simple', bgColor: '#888' },
    },
    borderApothem: 13000,
    tilesRoot: 'https://raw.githubusercontent.com/ccmap/tiles/master/',
  },

  mapView: {
    lastView: { x: 0, z: 0, radius: 13000 },
    basemapId: 'terrain',
  },

  overlay: [],
};

const defaultBasemap = Object.values(defaultAppState.mapConfig.basemaps).find(b => b.isDefault) || {};
defaultAppState.mapView.basemapId = defaultBasemap.id;
defaultAppState.mapView.lastView = {
  x: 0, z: 0,
  radius: defaultAppState.mapConfig.borderApothem,
};

defaultAppState.overlay = [
  {
    id: 1502486398800,
    properties: { name: 'My Waypoints', isWaypointsLayer: true },
    features: [
      { id: 1502486398801, geometry: { type: 'marker', position: [-5100, -6723] }, properties: { name: "Gjum's House in Impasse" } },
    ],
  },
]

export function loadDefaultAppState() {
  store.dispatch(appLoad(defaultAppState));
}

export function loadAppStateFromLocalStorage() {
//   try {
//     const stateJson = window.localStorage.getItem('civMap.state');
//     if (!stateJson) return;

//     const { mapView } = JSON.parse(stateJson);

//     if (!mapView.basemapId) {
//       const defaultBasemap = Object.values(store.getState().mapConfig.basemaps).find(b => b.isDefault) || {};
//       mapView.basemapId = defaultBasemap.id;
//     }

//     const appState = { mapView };

//     const overlayJson = window.localStorage.getItem('civMap.overlay');
//     if (overlayJson) {
//       appState.overlay = JSON.parse(overlayJson);
//     }

//     store.dispatch(appLoad(appState));

//   } catch (e) {
//     console.error('loading localStorage state failed', e);
//   }
}

export function loadPublicLayers(url) {
  getJSON(url,
    data => {
      data.layers.forEach(layer => {
        store.dispatch(loadLayer(layer))
      })
      console.log('Loaded', data.layers.length, 'public layers from', url)
    },
    err => {
      console.error("Could not load public layers from " + url, err)
    }
  )
}
