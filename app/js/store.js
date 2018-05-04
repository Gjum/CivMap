import { combineReducers } from 'redux'

import { circleBoundsFromFeature, importPositions } from './utils/math';
import murmurhash3 from './utils/murmurhash3_gc';

// this is session-local only, doesn't get persisted/shared
// TODO some of this causes the map to resize, some does not
export const defaultControlState = {
  appMode: 'BROWSE', // TODO rename these
  drawerOpen: false,
  editFeatureId: null,
  editFilterId: null,
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

    case 'HIGHLIGHT_FEATURE':
      return { ...state, featureId: action.feature.id }

    case 'OPEN_BROWSE_MODE':
      return { ...state, drawerOpen: false, appMode: 'BROWSE' }
    case 'OPEN_EDIT_MODE':
      return { ...state, drawerOpen: false, appMode: 'EDIT', editFeatureId: action.featureId }
    case 'OPEN_FEATURE_DETAIL':
      return { ...state, drawerOpen: false, appMode: 'FEATURE', featureId: action.featureId }
    case 'OPEN_FILTERS':
      return { ...state, drawerOpen: false, appMode: 'FILTERS', editFilterId: action.filterId }
    case 'OPEN_SEARCH':
      return { ...state, drawerOpen: false, appMode: 'SEARCH', searchQuery: action.query }

    case 'TRACK_WINDOW_SIZE':
      return { ...state, windowHeight: action.height, windowWidth: action.width }

    default:
      return state
  }
}

export const highlightFeature = (feature) => ({ type: 'HIGHLIGHT_FEATURE', feature })

export const openBrowseMode = () => ({ type: 'OPEN_BROWSE_MODE' })

export const openEditMode = (featureId) => ({ type: 'OPEN_EDIT_MODE', featureId })

export const openFeatureDetail = (featureId) => ({ type: 'OPEN_FEATURE_DETAIL', featureId })

export const openFilters = (filterId = null) => ({ type: 'OPEN_FILTERS', filterId })

export const openSearch = (query = "") => ({ type: 'OPEN_SEARCH', query })

export const openShare = () => ({ type: 'OPEN_SHARE' })

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
    case 'HIGHLIGHT_FEATURE':
      return { ...state, viewport: circleBoundsFromFeature(action.feature) }

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
      const f = {
        ...action.feature,
        id: action.feature.id || murmurhash3(JSON.stringify(action.feature), 1),
      }
      if (f.line && !Array.isArray(f.line)) f.line = importPositions(f.line)
      if (f.polygon && !Array.isArray(f.polygon)) f.polygon = importPositions(f.polygon)
      return f
    case 'UPDATE_FEATURE': {
      if (action.id != state.id) return state
      return action.feature
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
      action.features.forEach(f => {
        const newFeature = feature(null, addFeature(f))
        newState[newFeature.id] = newFeature
      })
      return newState
    }
    case 'ADD_FEATURE':
    case 'UPDATE_FEATURE': {
      const newFeature = feature(state[action.id], action)
      const newState = { ...state }
      delete newState[action.id]
      newState[newFeature.id] = newFeature
      return newState
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

export const addFeature = (feature) => ({ type: 'ADD_FEATURE', feature })

export const updateFeature = (feature, id) => ({ type: 'UPDATE_FEATURE', feature, id: (id || feature.id) })

export const removeFeature = (id) => ({ type: 'REMOVE_FEATURE', id })

export const clearFeatures = () => ({ type: 'CLEAR_FEATURES' })

const filters = (state = {}, action) => {
  switch (action.type) {
    case 'APP_LOAD':
      if (action.state.filters && Array.isArray(action.state.filters)) {
        const newState = {}
        action.state.filters.forEach(f => { newState[f.name] = f })
        return newState
      }
      return action.state.filters || state

    case 'ADD_FILTER': {
      return { ...state, [action.filter.name]: action.filter }
    }

    case 'LOAD_FILTERS': {
      if (Array.isArray(action.filters)) {
        const newState = { ...state }
        action.filters.forEach(f => { newState[f.name] = f })
        return newState
      }
      return { ...state, ...action.filters }
    }

    case 'UPDATE_FILTER': {
      const newState = { ...state }
      delete newState[action.id]
      newState[action.filter.name] = action.filter
      return newState
    }

    case 'REMOVE_FILTER': {
      const newState = { ...state }
      delete newState[action.id]
      return newState
    }

    default:
      return state
  }
}

export const loadFilters = (filters) => ({ type: 'LOAD_FILTERS', filters })

export const addFilter = (filter) => ({ type: 'ADD_FILTER', filter })

export const updateFilter = (filter, id) => ({ type: 'UPDATE_FILTER', filter, id: (id || filter.name) })

export const removeFilter = (id) => ({ type: 'REMOVE_FILTER', id })

function uniqeArray(a) {
  const seen = {}
  return a.filter(item =>
    seen.hasOwnProperty(item)
      ? false
      : (seen[item] = true)
  )
}

const activeFilters = (state = [], action) => {
  switch (action.type) {
    case 'APP_LOAD':
      return uniqeArray(action.state.activeFilters) || state

    case 'ACTIVATE_FILTERS': {
      const seen = {}
      return uniqeArray([
        ...action.ids,
        ...state,
      ])
    }

    case 'DEACTIVATE_FILTER': {
      return state.filter(id => id != action.id)
    }

    case 'MOVE_FILTER_UP': {
      const newState = [...state]
      const i = newState.indexOf(action.id)
      if (i <= 0 || !i) {
        // cannot move further up, gui prevents this but api doesn't
        return state
      }
      const tmp = newState[i - 1]
      newState[i - 1] = newState[i]
      newState[i] = tmp
      return newState
    }

    case 'UPDATE_FILTER': {
      return state.map(n => n === action.id ? action.filter.name : n)
    }

    case 'REMOVE_FILTER': {
      return state.filter(id => id !== action.id)
    }

    default:
      return state
  }
}

export const activateFilters = (ids) => ({ type: 'ACTIVATE_FILTERS', ids })

export const deactivateFilter = (id) => ({ type: 'DEACTIVATE_FILTER', id })

export const moveFilterUp = (id) => ({ type: 'MOVE_FILTER_UP', id })

export const combinedReducers = combineReducers({
  control,
  mapView,
  mapConfig,
  features,
  filters,
  activeFilters,
})

export const appLoad = (state) => ({ type: 'APP_LOAD', state })
