import { combineReducers } from 'redux'

import { importPositions } from './utils/math'
import { makePresentationId } from './utils/state'
import murmurhash3 from './utils/murmurhash3_gc' // TODO use longer hash for less collisions, or just don't accept features without id

export const defaultControlState = {
  appMode: 'BROWSE',
  activeFeatureId: null,
  drawerOpen: false,
  searchQuery: null,
}

const control = (state = defaultControlState, action) => {
  switch (action.type) {
    case 'APP_LOAD': {
      if (!action.state.control) return state
      const {
        appMode = state.appMode,
        activeFeatureId = state.activeFeatureId,
        drawerOpen = state.drawerOpen,
        searchQuery = state.searchQuery,
      } = action.state.control
      return { ...state, appMode, activeFeatureId, drawerOpen, searchQuery }
    }

    case 'SET_DRAWER_OPEN':
      return { ...state, drawerOpen: true }
    case 'SET_DRAWER_CLOSED':
      return { ...state, drawerOpen: false }

    case 'HIGHLIGHT_FEATURE':
      return { ...state, drawerOpen: false, activeFeatureId: action.featureId }

    case 'OPEN_BROWSE_MODE':
      return { ...state, drawerOpen: false, appMode: 'BROWSE' }
    case 'OPEN_EDIT_MODE':
      return { ...state, drawerOpen: false, appMode: 'EDIT', activeFeatureId: action.featureId }
    case 'OPEN_FEATURE_DETAIL':
      return { ...state, drawerOpen: false, appMode: 'FEATURE', activeFeatureId: action.featureId }
    case 'OPEN_LAYERS':
      return { ...state, drawerOpen: false, appMode: 'LAYERS' }
    case 'OPEN_SEARCH':
      return { ...state, drawerOpen: false, appMode: 'SEARCH', searchQuery: action.query }

    default:
      return state
  }
}

export const highlightFeature = (featureId) => ({ type: 'HIGHLIGHT_FEATURE', featureId })

export const openBrowseMode = () => ({ type: 'OPEN_BROWSE_MODE' })

export const openEditMode = (featureId) => ({ type: 'OPEN_EDIT_MODE', featureId })

export const openFeatureDetail = (featureId) => ({ type: 'OPEN_FEATURE_DETAIL', featureId })

export const openLayers = () => ({ type: 'OPEN_LAYERS' })

export const openPresentationEdit = (presentationId) => alert('layer editing is not implemented yet') || ({ type: 'OPEN_PRESENTATION', presentationId })

export const openSearch = (query = "") => ({ type: 'OPEN_SEARCH', query })


export const setDrawerClosed = () => ({ type: 'SET_DRAWER_CLOSED' })

export const setDrawerOpen = () => ({ type: 'SET_DRAWER_OPEN' })

export const defaultMapView = {
  basemapId: null,
  // describes the enclosed "circle"
  // XXX use rectangle always, find more descriptive name
  viewport: null,
}

// should be session-local, but we persist it anyway for user convenience
const mapView = (state = defaultMapView, action) => {
  switch (action.type) {
    case 'APP_LOAD': {
      if (!action.state.mapView) return state
      const {
        basemapId = state.basemapId,
        viewport = state.viewport,
      } = action.state.mapView
      return { basemapId, viewport }
    }
    case 'SET_ACTIVE_BASEMAP':
      return { ...state, basemapId: action.basemapId }
    case 'SET_VIEWPORT':
      if (!action.viewport.radius) {
        // convert from bounds to inner circle
        const [[e, n], [w, s]] = action.viewport
        const viewport = {
          x: (e + w) / 2,
          z: (s + n) / 2,
          radius: Math.min(Math.abs(w - e), Math.abs(s - n)), // XXX both max and min are wrong, we should always store rect in viewport
        }
        return { ...state, viewport }
      }
      return { ...state, viewport: action.viewport }

    default:
      return state
  }
}

export const setActiveBasemap = (basemapId) => ({ type: 'SET_ACTIVE_BASEMAP', basemapId })

export const setViewport = (viewport) => ({ type: 'SET_VIEWPORT', viewport })

// just stores the default config
// no need to persist as it is rebuilt on load,
// and we might update this server-side
// TODO redo basemap config layout according to todo.md
export const defaultMapConfig = {
  basemapPreview: '/z-2/0,0.png',
  basemaps: {},
  tilesRoot: null,
  borderApothem: NaN,
}

const mapConfig = (state = defaultMapConfig, action) => {
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

const feature = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FEATURE':
      if (state && (action.id != state.id)) return state
      const f = {
        ...action.feature,
        id: action.feature.id || murmurhash3(JSON.stringify(action.feature), 1),
      }
      if (f.line && !Array.isArray(f.line)) f.line = importPositions(f.line)
      if (f.polygon && !Array.isArray(f.polygon)) f.polygon = importPositions(f.polygon)
      if (f.type && !f.category) f.category = f.type
      return f
    default:
      return state
  }
}

/**
 * Merges the feature sets in the correct order.
 */
function mergeFeatures({ featuresCached, featuresUser, featuresTemp }) {
  return { ...featuresCached, ...featuresUser, ...featuresTemp }
}

const defaultFeatures = {
  featuresCached: {},
  featuresMerged: {},
  featuresTemp: {},
  featuresUser: {},
}

const features = (state = defaultFeatures, action) => {
  const newState = {}
  switch (action.type) {
    case 'APP_LOAD': {
      if (!action.state.features) return state
      const { featuresCached, featuresTemp, featuresUser } = action.state.features
      if (featuresCached) newState.featuresCached = { ...state.featuresCached, ...featuresCached }
      if (featuresTemp) newState.featuresTemp = { ...state.featuresTemp, ...featuresTemp }
      if (featuresUser) newState.featuresUser = { ...state.featuresUser, ...featuresUser }
      break
    }
    case 'CACHE_FEATURES': {
      newState.featuresTemp = { ...state.featuresTemp }
      newState.featuresCached = { ...state.featuresCached }
      action.featureIds.forEach(fid => {
        newState.featuresCached[fid] = state.featuresTemp[fid]
        delete newState.featuresTemp[fid]
      })
      break
    }
    case 'IMPORT_COLLECTION': {
      if (!action.features) return state
      newState.featuresTemp = { ...state.featuresTemp }
      action.features.forEach(f => {
        const newFeature = feature(null, updateFeature(f))
        newState.featuresTemp[newFeature.id] = newFeature
      })
      break
    }
    case 'REMOVE_FEATURE': {
      newState.featuresUser = { ...state.featuresUser }
      delete newState.featuresUser[action.id]
      break
    }
    case 'UPDATE_FEATURE': {
      // add/update user, leave temp/cached alone
      newState.featuresUser = { ...state.featuresUser }
      newState.featuresTemp = { ...state.featuresTemp }
      delete newState.featuresTemp[action.id] // to allow overriding
      const newFeature = feature(state.featuresUser[action.id], action)
      delete newState.featuresUser[action.id] // to allow changing id
      newState.featuresUser[newFeature.id] = newFeature
      break
    }
    default:
      return state
  }
  return { ...state, ...newState, featuresMerged: mergeFeatures({ ...state, ...newState }) }
}

export const cacheFeatures = (featureIds) => ({ type: 'CACHE_FEATURES', featureIds })

export const removeFeature = (id) => ({ type: 'REMOVE_FEATURE', id })


export const updateFeature = (feature, id) => ({ type: 'UPDATE_FEATURE', feature, id: (id || feature.id) })

/**
 * Merges the presentation sets in the correct order.
 */
function mergePresentations({ presentationsCached, presentationsUser, presentationsTemp }) {
  return { ...presentationsCached, ...presentationsUser, ...presentationsTemp }
}

const defaultPresentationsState = {
  presentationsCached: {},
  presentationsEnabled: {},
  presentationsMerged: {},
  presentationsTemp: {},
  presentationsUser: {},
}

const presentations = (state = defaultPresentationsState, action) => {
  const newState = {}
  switch (action.type) {
    case 'APP_LOAD': {
      if (!action.state.presentations) return state
      const { presentationsCached, presentationsEnabled, presentationsTemp, presentationsUser } = action.state.presentations

      if (presentationsCached) newState.presentationsCached = { ...state.presentationsCached, ...presentationsCached }
      if (presentationsTemp) newState.presentationsTemp = { ...state.presentationsTemp, ...presentationsTemp }
      if (presentationsUser) newState.presentationsUser = { ...state.presentationsUser, ...presentationsUser }

      if (presentationsEnabled) newState.presentationsEnabled = presentationsEnabled

      break
    }
    case 'CACHE_PRESENTATIONS': {
      newState.presentationsTemp = { ...state.presentationsTemp }
      newState.presentationsCached = { ...state.presentationsCached }
      action.presentationIds.forEach(pid => {
        newState.presentationsCached[pid] = state.presentationsTemp[pid]
        delete newState.presentationsTemp[pid]
      })
      break
    }
    case 'IMPORT_COLLECTION': {
      if (!action.presentations) return state
      newState.presentationsTemp = { ...state.presentationsTemp }
      action.presentations.filter(p => p.category).forEach(p => {
        newState.presentationsTemp[makePresentationId(p)] = p
      })
      break
    }

    case 'DISABLE_PRESENTATION': {
      const presentationsEnabled = { ...state.presentationsEnabled }
      delete presentationsEnabled[action.presentation.category]
      return { ...state, presentationsEnabled }
    }
    case 'ENABLE_PRESENTATION': {
      if (!action.presentation.category) return state
      const presentationsEnabled = { ...state.presentationsEnabled }
      presentationsEnabled[action.presentation.category] = makePresentationId(action.presentation)
      return { ...state, presentationsEnabled }
    }
    case 'SET_ENABLED_PRESENTATIONS': {
      const presentationsEnabled = { ...state.presentationsEnabled }
      action.presentations.filter(p => p.category).forEach(p =>
        presentationsEnabled[p.category] = makePresentationId(p)
      )
      return { ...state, presentationsEnabled }
    }

    default:
      return state
  }
  return { ...state, ...newState, presentationsMerged: mergePresentations({ ...state, ...newState }) }
}

export const cachePresentations = (presentationIds) => ({ type: 'CACHE_PRESENTATIONS', presentationIds })

export const disablePresentation = (presentation) => ({ type: 'DISABLE_PRESENTATION', presentation })

export const enablePresentation = (presentation) => ({ type: 'ENABLE_PRESENTATION', presentation })

export const setEnabledPresentations = (presentations) => ({ type: 'SET_ENABLED_PRESENTATIONS', presentations })

const collections = (state = {}, action) => {
  switch (action.type) {
    case 'APP_LOAD': {
      if (!action.state.collections) return state
      return { ...state, ...action.state.collections }
    }
    default:
      return state
  }
}

export const appLoad = (state) => ({ type: 'APP_LOAD', state })

export const importCollection = ({ features = [], presentations = [] }, source = undefined) => ({ type: 'IMPORT_COLLECTION', source, features, presentations })

export const combinedReducers = combineReducers({
  collections,
  control,
  features,
  mapConfig,
  mapView,
  presentations,
})
