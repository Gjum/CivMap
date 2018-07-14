import Uuid from 'node-uuid'
import { combineReducers } from 'redux'
import { inspect } from 'util'

import { importPositions } from './utils/importExport'
import murmurhash3 from './utils/murmurhash3_gc' // TODO use longer hash for less collisions, or just don't accept features without id

export const defaultControlState = {
  appMode: 'BROWSE',
  activeFeatureId: null,
  activeFeatureCollection: null,
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
        activeFeatureCollection = state.activeFeatureCollection,
        drawerOpen = state.drawerOpen,
        searchQuery = state.searchQuery,
      } = action.state.control
      return { ...state, appMode, activeFeatureId, activeFeatureCollection, drawerOpen, searchQuery }
    }

    case 'SET_DRAWER_OPEN':
      return { ...state, drawerOpen: true }
    case 'SET_DRAWER_CLOSED':
      return { ...state, drawerOpen: false }

    case 'HIGHLIGHT_FEATURE':
      return { ...state, drawerOpen: false, activeFeatureId: action.featureId, activeFeatureCollection: action.collectionId }

    case 'OPEN_BROWSE_MODE':
      return { ...state, drawerOpen: false, appMode: 'BROWSE' }
    case 'OPEN_EDIT_MODE':
      return { ...state, drawerOpen: false, appMode: 'EDIT', activeFeatureId: action.featureId, activeFeatureCollection: action.collectionId }
    case 'OPEN_FEATURE_DETAIL':
      return { ...state, drawerOpen: false, appMode: 'FEATURE', activeFeatureId: action.featureId, activeFeatureCollection: action.collectionId }
    case 'OPEN_LAYERS':
      return { ...state, drawerOpen: false, appMode: 'LAYERS' }
    case 'OPEN_SEARCH':
      return { ...state, drawerOpen: false, appMode: 'SEARCH', searchQuery: action.query }

    default:
      return state
  }
}

export const highlightFeature = (featureId, collectionId) => ({ type: 'HIGHLIGHT_FEATURE', featureId, collectionId })

export const openBrowseMode = () => ({ type: 'OPEN_BROWSE_MODE' })

export const openEditMode = (featureId, collectionId) => ({ type: 'OPEN_EDIT_MODE', featureId, collectionId })

export const openFeatureDetail = (featureId, collectionId) => ({ type: 'OPEN_FEATURE_DETAIL', featureId, collectionId })

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
    case 'UPDATE_FEATURE_IN_COLLECTION':
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

const features = (state = {}, action) => {
  switch (action.type) {
    case 'REMOVE_FEATURE_IN_COLLECTION': {
      const newState = { ...state }
      delete newState[action.featureId]
      return newState
    }
    case 'UPDATE_FEATURE_IN_COLLECTION': {
      const newFeature = feature(state[action.featureId], action)
      return { ...state, [newFeature.id]: newFeature }
    }
    default:
      return state
  }
}

const defaultCollectionState = {
  enabled_presentation: null,
  features: {},
  name: '(unnamed)',
  presentations: {},
  source: 'civmap:no_source',
}

const collection = (state = defaultCollectionState, action) => {
  switch (action.type) {
    case 'IMPORT_COLLECTION': {
      const source = action.collectionId || action.collection.source
      const newState = {
        ...state,
        ...action.collection,
        source, // precedence
        features: {}, // override list with object for indexing
        presentations: {}, // override list with object for indexing
        editable: action.editable,
        persistent: action.persistent,
      }
      if (action.collection.features) action.collection.features.forEach(f => {
        const newFeature = feature(null, updateFeatureInCollection(newState.source, f))
        newState.features[newFeature.id] = { ...newFeature, source }
      })
      if (action.collection.presentations) action.collection.presentations.forEach(p => {
        const newPresentation = p // XXX presentation(null, updatePresentationInCollection(newState.source, p))
        newState.presentations[newPresentation.name] = { ...newPresentation, source }
      })
      return newState
    }

    case 'REMOVE_FEATURE_IN_COLLECTION':
    case 'UPDATE_FEATURE_IN_COLLECTION': {
      if (state.source !== (action.collectionId || action.feature.source)) return state
      return { ...state, features: features(state.features, action) }
    }

    case 'ENABLE_PRESENTATION': {
      if (state.enabled_presentation === action.presentationId) return state // already enabled
      if (!state.presentations[action.presentationId]) return state // invalid id
      return { ...state, enabled_presentation: action.presentationId }
    }

    case 'DISABLE_PRESENTATION': {
      return { ...state, enabled_presentation: null }
    }

    default:
      return state
  }
}

const defaultCollectionsState = {
  'civmap:collection/user': {
    source: "civmap:collection/user",
    name: "My Markings",
    features: {},
    presentations: {},
    enabled_presentation: true,
  },
}

const collections = (state = defaultCollectionsState, action) => {
  switch (action.type) {
    case 'APP_LOAD': {
      if (!action.state.collections) return state
      return { ...state, ...action.state.collections }
    }

    case 'IMPORT_COLLECTION': {
      if (!action.collectionId) {
        console.error(`Not importing collection without id: ${inspect(action)}`)
        return state // require collection id
      }
      const newCollection = collection(state[action.collectionId], action)
      return { ...state, [newCollection.source]: newCollection }
    }

    case 'ENABLE_PRESENTATION':
    case 'DISABLE_PRESENTATION':
    case 'REMOVE_FEATURE_IN_COLLECTION':
    case 'UPDATE_FEATURE_IN_COLLECTION': {
      if (!state[action.collectionId]) {
        console.error(`Not updating unknown collection: ${inspect(action)}`)
        return state // only update existing collections
      }
      const newCollection = collection(state[action.collectionId], action)
      return { ...state, [newCollection.source]: newCollection }
    }

    default:
      return state
  }
}

export const appLoad = (state) => ({ type: 'APP_LOAD', state })

export const importCollection = (collection, collectionId = null) => ({
  type: 'IMPORT_COLLECTION',
  collection,
  collectionId: collectionId || collection.id,
})

export const removeFeatureInCollection = (collectionId, featureId) => ({ type: 'REMOVE_FEATURE_IN_COLLECTION', collectionId, featureId })

export const updateFeatureInCollection = (collectionId, feature, featureId = undefined) => ({
  type: 'UPDATE_FEATURE_IN_COLLECTION',
  collectionId,
  feature,
  featureId: featureId || feature.id,
})

export const disablePresentationInCollection = (collectionId, presentationId = null) => ({ type: 'DISABLE_PRESENTATION', collectionId, presentationId })

export const enablePresentationInCollection = (collectionId, presentationId) => ({ type: 'ENABLE_PRESENTATION', collectionId, presentationId })

export const combinedReducers = combineReducers({
  collections,
  control,
  mapConfig,
  mapView,
})

// XXX
export function lookupFeature(state, featureId, collectionId) {
  if (collectionId) {
    return state.collections[collectionId].features[featureId]
  } else {
    Object.values(state.collections).forEach(collection => {
      const feature = collection.features[featureId]
      if (feature) return feature
    })
  }
}

export const createFeature = (feature) => ({
  id: Uuid.v4(),
  source: 'civmap:collection/user',
  ...feature,
})
