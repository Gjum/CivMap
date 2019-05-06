import Uuid from 'uuid'
import { combineReducers } from 'redux'
import { inspect } from 'util'

import { importPositionsString } from './utils/importExport'
import murmurhash3 from './utils/murmurhash3_gc'
import { currentVersion } from './utils/convertFromOld';

export const defaultControlState = {
  appMode: 'LAYERS',
  activeCollectionId: null,
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
    case 'OPEN_COLLECTION':
      return { ...state, drawerOpen: false, appMode: 'COLLECTION', activeCollectionId: action.collectionId }
    case 'OPEN_FEATURE_DETAIL':
      return { ...state, drawerOpen: false, appMode: 'FEATURE', activeFeatureId: action.featureId, activeFeatureCollection: action.collectionId }
    case 'OPEN_LAYERS':
      return { ...state, drawerOpen: false, appMode: 'LAYERS' }
    case 'OPEN_SEARCH':
      const searchQuery = typeof action.query === 'string' ? action.query : state.searchQuery
      return { ...state, drawerOpen: false, appMode: 'SEARCH', activeFeatureId: null, searchQuery }

    default:
      return state
  }
}

export const highlightFeature = (featureId, collectionId) => ({ type: 'HIGHLIGHT_FEATURE', featureId, collectionId })

export const openBrowseMode = () => ({ type: 'OPEN_BROWSE_MODE' })

export const openEditMode = (featureId, collectionId) => ({ type: 'OPEN_EDIT_MODE', featureId, collectionId })

export const openFeatureDetail = (featureId, collectionId) => ({ type: 'OPEN_FEATURE_DETAIL', featureId, collectionId })

export const openLayers = () => ({ type: 'OPEN_LAYERS' })

export const openCollectionEdit = (collectionId) => ({ type: 'OPEN_COLLECTION', collectionId })

export const openSearch = (query) => ({ type: 'OPEN_SEARCH', query })


export const setDrawerClosed = () => ({ type: 'SET_DRAWER_CLOSED' })

export const setDrawerOpen = () => ({ type: 'SET_DRAWER_OPEN' })

export const defaultMapView = {
  basemapId: null,
  // describes the enclosed "circle"
  // XXX use rectangle always, find more descriptive name
  viewport: null,
  zoom: -6,
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
    case 'SET_ACTIVE_BASEMAP': {
      return { ...state, basemapId: action.basemapId }
    }
    case 'SET_VIEWPORT': {
      let viewport = action.viewport
      if (viewport && !viewport.radius) {
        // convert from bounds to inner circle
        const [[e, n], [w, s]] = action.viewport
        viewport = {
          x: (e + w) / 2,
          z: (s + n) / 2,
          radius: Math.min(Math.abs(w - e), Math.abs(s - n)), // XXX both max and min are wrong, we should always store rect in viewport
        }
      }
      if (!viewport) viewport = state.viewport
      const zoom = action.zoom || state.zoom
      if (zoom === state.zoom && equalViewports(viewport, state.viewport)) {
        return state
      }
      return { ...state, viewport, zoom }
    }
    default:
      return state
  }
}

export const equalViewports = (a, b) => a === b || (a && b && (
  a.radius === b.radius && a.x === b.x && a.z === b.z
))

export const setActiveBasemap = (basemapId) => ({ type: 'SET_ACTIVE_BASEMAP', basemapId })

// TODO clean up legacy code passing wrong args
export const setViewport = arg => {
  let { viewport, zoom } = arg
  if (!viewport) viewport = arg
  return { type: 'SET_VIEWPORT', viewport, zoom }
}

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

/** @typedef {{id: String, [propertyName: String]: Any}} Feature */

/**
 * @param {Feature} state
 * @returns Feature
 */
const feature = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FEATURE_IN_COLLECTION':
      // TODO use longer fallback hash for less collisions, or just don't accept features without id
      const f = {
        ...action.feature,
        id: action.feature.id || murmurhash3(JSON.stringify(action.feature), 1),
      }
      if (f.line && !Array.isArray(f.line)) f.line = importPositionsString(f.line)
      if (f.polygon && !Array.isArray(f.polygon)) f.polygon = importPositionsString(f.polygon)
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

/** @typedef {String} PresentationId */
/** @typedef {{enabled_presentation: PresentationId, features: {[id: String]: Feature}, id: String, info: any, name: String, persistent: Boolean, presentations: {[name: String]: Presentation}, source: String}} Collection */
/** @typedef {{enabled_presentation: PresentationId, features: [Feature], id: String, info: any, name: String, presentations: {[name: String]: Presentation}}} CollectionJson */

/** @type {Collection} */
const defaultCollectionState = {
  enabled_presentation: null,
  features: {},
  id: null,
  info: { version: currentVersion },
  name: '(unnamed)',
  persistent: false,
  presentations: {},
  source: null,
}

/**
 * @param {Collection} state
 * @returns Collection
 */
const collection = (state = defaultCollectionState, action) => {
  switch (action.type) {
    case 'CREATE_COLLECTION': {
      const newState = { ...defaultCollectionState, id: action.collectionId }
      const keepKeys = ['enabled_presentation', 'id', 'name', 'persistent', 'presentations', 'source']
      for (const key of keepKeys) {
        if (action.collection[key]) newState[key] = action.collection[key]
      }
      return newState
    }

    case 'UPDATE_COLLECTION': {
      return { ...state, ...action.collection }
    }

    // TODO skip render if collection is deep equal after import
    case 'IMPORT_COLLECTION': {
      /** @type CollectionJson */
      const collection = action.collection
      /** @type Collection */
      const newState = {
        ...state,
        ...collection,
        id: action.collectionId, // precedence
        persistent: action.persistent, // precedence
        features: {}, // override list with object for indexing
        presentations: {}, // override list with object for indexing
      }
      if (state !== defaultCollectionState) {
        newState.enabled_presentation = state.enabled_presentation
      }
      const collectionId = action.collectionId
      if (collection.features) collection.features.forEach(f => {
        const newFeature = feature(null, updateFeatureInCollection(collectionId, f))
        newState.features[newFeature.id] = { ...newFeature, collectionId }
      })
      if (collection.presentations) collection.presentations.forEach(p => {
        const newPresentation = p // XXX presentation(null, updatePresentationInCollection(collectionId, p))
        newState.presentations[newPresentation.name] = { ...newPresentation, collectionId }
      })
      return newState
    }

    case 'REMOVE_FEATURE_IN_COLLECTION':
    case 'UPDATE_FEATURE_IN_COLLECTION': {
      const anyCollectionId = action.collectionId || action.feature.collectionId
      if (state.id !== anyCollectionId) return state
      return { ...state, features: features(state.features, action) }
    }

    case 'ENABLE_PRESENTATION': {
      let presentationId = action.presentationId
      if (state.enabled_presentation === presentationId) return state // already enabled
      return { ...state, enabled_presentation: presentationId }
    }

    case 'DISABLE_PRESENTATION': {
      return { ...state, enabled_presentation: null }
    }

    default:
      return state
  }
}

/** @typedef {{[id: String]: Collection}} Collections */

const defaultCollectionsState = {
  'civmap:collection/user': {
    id: "civmap:collection/user",
    name: "My Markings",
    features: {},
    presentations: {},
    enabled_presentation: true,
  },
}

/**
 * @param {Collections} state
 * @returns Collections
 */
const collections = (state = defaultCollectionsState, action) => {
  switch (action.type) {
    case 'APP_LOAD': {
      if (!action.state.collections) return state
      return { ...state, ...action.state.collections }
    }

    case 'CREATE_COLLECTION':
    case 'IMPORT_COLLECTION': {
      if (!action.collectionId) {
        console.error('Not creating/importing collection without id:', action)
        return state // require collection id
      }
      const newCollection = collection(state[action.collectionId], action)
      return { ...state, [newCollection.id]: newCollection }
    }

    case 'ENABLE_PRESENTATION':
    case 'DISABLE_PRESENTATION':
    case 'UPDATE_COLLECTION':
    case 'REMOVE_FEATURE_IN_COLLECTION':
    case 'UPDATE_FEATURE_IN_COLLECTION': {
      if (!state[action.collectionId]) {
        console.error('Not updating unknown collection:', action)
        return state // only update existing collections
      }
      const newCollection = collection(state[action.collectionId], action)
      return { ...state, [newCollection.id]: newCollection }
    }

    case 'REMOVE_COLLECTION': {
      const newState = { ...state }
      delete newState[action.collectionId]
      return newState
    }

    default:
      return state
  }
}

export const appLoad = (state) => ({ type: 'APP_LOAD', state })

export const createCollection = (collectionId, collection) => ({
  type: 'CREATE_COLLECTION',
  collection,
  collectionId: collectionId || collection.id,
})

export const importCollection = (collection, persistent = false) => ({
  type: 'IMPORT_COLLECTION',
  collection,
  collectionId: collection.id,
  persistent,
})

export const removeFeatureInCollection = (collectionId, featureId) => ({ type: 'REMOVE_FEATURE_IN_COLLECTION', collectionId, featureId })

export const removeCollection = (collectionId) => ({ type: 'REMOVE_COLLECTION', collectionId })

export const updateCollection = (collection) => ({ type: 'UPDATE_COLLECTION', collection, collectionId: collection.id })

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

export function lookupFeature(state, featureId, collectionId) {
  const collection = state.collections[collectionId]
  if (collection) {
    const feature = collection.features[featureId]
    if (feature) return feature
  }
  for (const collection of Object.values(state.collections)) {
    const feature = collection.features[featureId]
    if (feature) return feature
  }
}

// XXX should be action, not just constructor
export const createFeature = (feature) => ({
  id: Uuid.v4(),
  collectionId: 'civmap:collection/user',
  ...feature,
})
