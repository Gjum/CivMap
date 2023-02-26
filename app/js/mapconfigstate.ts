// just stores the default config
// no need to persist as it is rebuilt on load,
// and we might update this server-side

import { AppLoad } from "./store"

// TODO redo basemap config layout according to todo.md
export interface MapConfig {
  basemapPreview: string
  basemaps: {}
  tilesRoot: string
  borderApothem: number
}

export const defaultMapConfig = {
  basemapPreview: '/z-2/0,0.png',
  basemaps: {},
  tilesRoot: null,
  borderApothem: NaN,
}

export const mapConfig = (state: MapConfig = defaultMapConfig, action: AppLoad): MapConfig => {
  switch (action.type) {
    case 'APP_LOAD': {
      if (!action.state.mapConfig) return state
      const {
        basemapPreview = state.basemapPreview,
        basemaps = state.basemaps,
        tilesRoot = state.tilesRoot,
        borderApothem = state.borderApothem,
      } = action.state.mapConfig
      return { basemapPreview, basemaps, tilesRoot, borderApothem }
    }
    default:
      return state
  }
}