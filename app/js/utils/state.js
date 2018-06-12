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

  collections: {
    "https://ccmap.github.io/data/settlements.civmap.json": { auto_update: true },
    "https://ccmap.github.io/data/mta_plots.civmap.json": { auto_update: true },
  },
}

const defaultBasemap = Object.values(defaultAppState.mapConfig.basemaps).find(b => b.isDefault) || {}
defaultAppState.mapView.basemapId = defaultBasemap.id
defaultAppState.mapView.viewport = {
  x: 0, z: 0,
  radius: defaultAppState.mapConfig.borderApothem,
}

/**
 * Returns a map `{ category -> { id -> presentation } }`
 * to quickly look up all presentations concerning a certain category.
 */
export function groupPresentationsByCategory(presentations) {
  const categoryGroups = {}
  Object.entries(presentations).forEach(([id, p]) => {
    let categoryGroup = categoryGroups[p.category]
    if (!categoryGroup) {
      categoryGroups[p.category] = categoryGroup = {}
    }
    categoryGroup[id] = p
  })
  return categoryGroups
}

export function makePresentationId({ name, source }) {
  return name + '\n' + source
}
