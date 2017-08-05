
import { appLoad } from '../actions';
import store from '../store';

export function loadDefaultAppState() {
  const mapConfig = {
    basemapPreview: '/z-2/0,0.png',
    basemaps: {
      terrain: { name: 'Terrain', id: 'terrain', bgColor: '#000', isDefault: true },
      biome: { name: 'Biome', id: 'biome', bgColor: '#ddd' },
      height: { name: 'Height', id: 'height', bgColor: '#888' },
      simple: { name: 'Simple', id: 'simple', bgColor: '#888' },
    },
    borderApothem: 13000,
    tilesRoot: 'https://raw.githubusercontent.com/ccmap/tiles/master/',
  };

  const overlay = [
    {
      id: -1,
      properties: { name: 'hi test', description: 'foo bar', opacity: .7 },
      features: [
        { id: -2, geometry: { type: 'circle', center: [-5000, -7000], radius: 1000 }, style: {}, properties: {} },
      ],
    },
    {
      id: -3,
      properties: { name: 'My Waypoints', isWaypointsLayer: true },
      features: [
        { id: -4, geometry: { type: 'marker', position: [-5127, -6700] }, style: {}, properties: { name: 'Impasse' } },
      ],
    },
  ];

  const basemapId = Object.values(mapConfig.basemaps).find(b => b.isDefault).id;

  store.dispatch(appLoad({ mapConfig, overlay, mapView: { basemapId } }));
}

export function loadAppStateFromLocalStorage() {
  const stateJson = window.localStorage.getItem('civMapState');
  if (!stateJson) return;
  try {
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
