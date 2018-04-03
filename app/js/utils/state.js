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

  filters: [
    {
      conditions: [
        { type: 'has_key', key: 'is_waypoint' },
      ],
      overrides: '{"label":${name},"style":{${...style}, "circle_marker":{"fillOpacity":0.5},"label":{"align":"bottom-left","offset":[6,5]}}}',
    },
    {
      conditions: [], // catch-all
      overrides: '{"style":{${...style}, "label":{"align":"bottom-left","offset":[6,5]}}}',
    },
  ],
}

const defaultBasemap = Object.values(defaultAppState.mapConfig.basemaps).find(b => b.isDefault) || {}
defaultAppState.mapView.basemapId = defaultBasemap.id
defaultAppState.mapView.viewport = {
  x: 0, z: 0,
  radius: defaultAppState.mapConfig.borderApothem,
}
