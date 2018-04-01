import { combineReducers } from 'redux'
import { v4 } from 'node-uuid'

// this is session-local only, doesn't get persisted/shared
// TODO some of this causes the map to resize, some does not
export const defaultControlState = {
  appMode: 'BROWSE', // TODO rename these
  drawerOpen: false,
  editFeatureId: null,
  featureId: null,
  searchQuery: null,
  windowHeight: NaN, // TODO move window size to its own substate?
  windowWidth: NaN,
}

const control = (state = defaultControlState, action) => {
  switch (action.type) {
    case 'SET_DRAWER_OPEN':
      return { ...state, drawerOpen: true }
    case 'SET_DRAWER_CLOSED':
      return { ...state, drawerOpen: false }

    case 'OPEN_BROWSE_MODE':
      return { ...state, drawerOpen: false, appMode: 'BROWSE' }
    case 'OPEN_EDIT_MODE':
      return { ...state, drawerOpen: false, appMode: 'EDIT', editFeatureId: action.featureId }
    case 'OPEN_FEATURE_DETAIL':
      return {
        ...state, drawerOpen: false, appMode: 'FEATURE',
        featureId: action.featureId,
      }
    case 'OPEN_SEARCH':
      return {
        ...state, drawerOpen: false, appMode: 'SEARCH',
        searchQuery: action.query
      }
    case 'OPEN_WAYPOINTS_IMPORT':
      return { ...state, drawerOpen: false, appMode: 'WAYPOINTS' }

    case 'TRACK_WINDOW_SIZE':
      return { ...state, windowHeight: action.height, windowWidth: action.width }

    default:
      return state
  }
}

export const openBrowseMode = () => ({ type: 'OPEN_BROWSE_MODE' })

export const openEditMode = (featureId) => ({ type: 'OPEN_EDIT_MODE', featureId })

export const openFeatureDetail = (featureId) => ({ type: 'OPEN_FEATURE_DETAIL', featureId })

export const openSearch = (query = "") => ({ type: 'OPEN_SEARCH', query })

export const openShare = () => ({ type: 'OPEN_SHARE' })

export const openWaypointsImport = () => ({ type: 'OPEN_WAYPOINTS_IMPORT' })

export const setDrawerClosed = () => ({ type: 'SET_DRAWER_CLOSED' })

export const setDrawerOpen = () => ({ type: 'SET_DRAWER_OPEN' })

export const trackWindowSize = ({ width, height }) => ({ type: 'TRACK_WINDOW_SIZE', width, height })

// should be session-local, but we persist it anyway for convenience
export const defaultMapView = {
  basemapId: null,
  viewport: null, // describes the enclosed "circle" TODO rename
}

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
    case 'ADD_FEATURE':
      return {
        id: action.feature.id,
        geometry: action.feature.geometry,
        style: action.feature.style || {},
        properties: action.feature.properties || {},
      }
    case 'UPDATE_FEATURE': {
      if (action.feature.id != state.id) return state
      return {
        ...state,
        geometry: action.feature.geometry || state.geometry,
        style: action.feature.style || state.style,
        properties: action.feature.properties || state.properties,
      }
    }
    default:
      return state
  }
}

const features = (state = {}, action) => {
  switch (action.type) {
    case 'APP_LOAD':
      return action.state.features ? { ...state, ...action.state.features } : state
    case 'LOAD_FEATURES': {
      const newState = { ...state }
      action.features.forEach(f =>
        newState[f.id] = feature(null, addFeature(f)))
      return newState
    }
    case 'ADD_FEATURE':
    case 'UPDATE_FEATURE': {
      const newFeature = feature(state[action.feature.id], action)
      return { ...state, [newFeature.id]: newFeature }
    }
    case 'REMOVE_FEATURE': {
      const newState = { ...state }
      delete newState[action.id]
      return newState
    }
    case 'CLEAR_FEATURES': {
      return {}
    }
    default:
      return state
  }
}

export const loadFeatures = (features) => ({ type: 'LOAD_FEATURES', features })

export const addFeature = (feature) => ({
  type: 'ADD_FEATURE',
  feature: {
    id: feature.id || v4(),
    ...feature,
  }
})

export const updateFeature = (feature) => ({ type: 'UPDATE_FEATURE', feature })

export const removeFeature = (id) => ({ type: 'REMOVE_FEATURE', id })

export const clearFeatures = () => ({ type: 'CLEAR_FEATURES' })

// TODO filters: available, active, persist to localStorage

export const combinedReducers = combineReducers({
  control,
  mapView,
  mapConfig,
  features,
})

export const appLoad = (state) => ({ type: 'APP_LOAD', state })
