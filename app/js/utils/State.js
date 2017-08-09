
import { appLoad } from '../actions';
import store, { defaultMapView } from '../store';

export const defaultAppState = {
  mapConfig: {
    basemapPreview: '/z-2/0,0.png',
    basemaps: {
      terrain: { name: 'Terrain', id: 'terrain', bgColor: '#000', isDefault: true },
      biome: { name: 'Biome', id: 'biome', bgColor: '#ddd' },
      height: { name: 'Height', id: 'height', bgColor: '#888' },
      simple: { name: 'Simple', id: 'simple', bgColor: '#888' },
    },
    borderApothem: 13000,
    tilesRoot: 'https://raw.githubusercontent.com/ccmap/tiles/master/',
  },

  mapView: {
    ...defaultMapView,
    basemapId: 'terrain',
  },

  overlay: [],
};

const defaultBasemap = Object.values(defaultAppState.mapConfig.basemaps).find(b => b.isDefault) || {};
defaultAppState.mapView.basemapId = defaultBasemap.id;
defaultAppState.mapView.targetView = {
  x: 0, z: 0,
  radius: defaultAppState.mapConfig.borderApothem,
};

export function loadDefaultAppState() {
  store.dispatch(appLoad(defaultAppState));
}

export function loadAppStateFromLocalStorage() {
  try {
    const stateJson = window.localStorage.getItem('civMapState');
    if (!stateJson) return;
    const { mapView, overlay } = JSON.parse(stateJson);

    if (!mapView.basemapId) {
      const defaultBasemap = Object.values(store.getState().mapConfig.basemaps).find(b => b.isDefault) || {};
      mapView.basemapId = defaultBasemap.id;
    }

    if (mapView.lastView) {
      mapView.targetView = mapView.lastView;
    }

    store.dispatch(appLoad({ mapView, overlay }));

  } catch (e) {
    console.error('loading localStorage state failed', e);
  }
}
