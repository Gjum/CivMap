
import { appLoad, defaultMapView, loadLayer } from '../store'
import { getJSON } from '../utils/Net'

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
    viewport: { x: 0, z: 0, radius: 13000 },
    basemapId: 'terrain',
  },
}

const defaultBasemap = Object.values(defaultAppState.mapConfig.basemaps).find(b => b.isDefault) || {}
defaultAppState.mapView.basemapId = defaultBasemap.id
defaultAppState.mapView.viewport = {
  x: 0, z: 0,
  radius: defaultAppState.mapConfig.borderApothem,
}

export function loadDefaultAppState(store) {
  store.dispatch(appLoad(defaultAppState))
}

export function loadLayersAsync(url, store) {
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
