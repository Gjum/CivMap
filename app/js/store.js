import { createStore, combineReducers } from 'redux'
import { v4 } from 'node-uuid'

// TODO some of this causes the map to resize, some does not
export const defaultControlState = {
  appMode: 'BROWSE', // TODO rename these
  drawerOpen: false,
  featureId: null,
  layerId: null,
  searchQuery: null,
  windowHeight: NaN, // TODO move window size to its own substate?
  windowWidth: NaN,
}

const control = (state = defaultControlState, action) => {
  switch (action.type) {
    case 'OPEN_DRAWER':
      return { ...state, drawerOpen: true }
    case 'CLOSE_DRAWER':
      return { ...state, drawerOpen: false }
    case 'OPEN_BROWSE_MODE':
      return { ...state, drawerOpen: false, appMode: 'BROWSE' }
    case 'OPEN_FEATURE_EDITOR':
      return {
        ...state, drawerOpen: false, appMode: 'FEATURE',
        featureId: action.featureId,
      }
    case 'OPEN_LAYER_EDITOR':
      return {
        ...state, drawerOpen: false, appMode: 'LAYER',
        layerId: action.layerId,
      }
    case 'OPEN_OVERLAY_EDITOR':
      return { ...state, drawerOpen: false, appMode: 'LAYERS' }
    case 'OPEN_SEARCH':
      return {
        ...state, drawerOpen: false, appMode: 'SEARCH',
        searchQuery: action.query
      }
    case 'OPEN_WAYPOINTS_EDITOR':
      return { ...state, drawerOpen: false, appMode: 'WAYPOINTS' }
    case 'TRACK_WINDOW_SIZE':
      return { ...state, windowHeight: action.height, windowWidth: action.width }
    default:
      return state
  }
}

export const openLayerEditor = (layerId) => ({ type: 'OPEN_LAYER_EDITOR', layerId })

export const defaultMapView = {
  basemapId: null,
  lastView: null, // describes the enclosed "circle" TODO rename
}

const mapView = (state = defaultMapView, action) => {
  switch (action.type) {
    case 'APP_LOAD':
      return { ...state, ...action.state.mapView }
    case 'SET_ACTIVE_BASEMAP':
      return { ...state, basemapId: action.basemapId }
    case 'TRACK_MAP_VIEW':
      return { ...state, lastView: action.lastView }
    case 'SET_MAP_VIEW':
      return { ...state, lastView: action.viewport }
    default:
      return state
  }
}

export const setMapView = (viewport) => ({ type: 'SET_MAP_VIEW', viewport })

// TODO redo this according to todo.md
export const defaultMapConfig = {
  basemapPreview: '/z-2/0,0.png',
  basemaps: {},
  tilesRoot: null,
  borderApothem: NaN,
}

const mapConfig = (state = defaultMapConfig, action) => {
  switch (action.type) {
    case 'APP_LOAD':
      return { ...state, ...action.state.mapConfig }
    default:
      return state
  }
}

const feature = (state, action) => {
  switch (action.type) {
    case 'CREATE_FEATURE':
    case 'LOAD_FEATURE':
      return {
        id: action.feature.id,
        geometry: action.feature.geometry,
        style: action.feature.style || {},
        properties: action.feature.properties || {},
      }
    case 'UPDATE_FEATURE':
      if (action.id != state.id) return state
      return {
        ...state,
        geometry: action.geometry || state.geometry,
        style: action.style || state.style,
        properties: action.properties || state.properties,
      }
    default:
      return state
  }
}

export const loadFeature = (feature) => ({ type: 'LOAD_FEATURE', feature })

const features = (state = {}, action) => {
  switch (action.type) {
    case 'CREATE_FEATURE':
      const newFeature = feature(undefined, action)
      return { ...state, [newFeature.id]: newFeature }
    case 'LOAD_FEATURE':
      return { ...state, [action.feature.id]: action.feature }
    case 'UPDATE_FEATURE':
      return { ...state, [action.id]: feature(state[action.id], action.feature) }
    case 'REMOVE_FEATURE':
      const newState = Object.assign({}, state)
      delete newState[action.id]
      return newState

    case 'LOAD_LAYER': {
      const newFeatures = {}
      action.layer.features.forEach(f =>
        newFeatures[f.id] = feature(null, loadFeature(f))
      )
      return { ...state, ...newFeatures }
    }

    case 'APP_LOAD': {
      const newFeatures = {}
      action.state.overlay.forEach(l =>
        (l.features || []).forEach(f =>
          newFeatures[f.id] = feature(null, loadFeature(f))
        )
      )
      return { ...state, ...newFeatures }
    }

    default:
      return state
  }
}

const layer = (state, action) => {
  switch (action.type) {
    case 'CREATE_LAYER':
    case 'LOAD_LAYER':
      return {
        id: action.layer.id,
        properties: action.layer.properties,
        features: action.layer.features.map(f => f.id),
      }
    case 'UPDATE_LAYER':
      if (action.id != state.id) return state
      return {
        ...state.layer,
        properties: action.layer.properties,
      }
    case 'REMOVE_FEATURE':
      if (state.features.includes(action.id)) return state
      return state.features.filter(fid => fid != action.id)

    default:
      return state
  }
}

export const createFeature = (feature) => ({
  type: 'CREATE_FEATURE',
  feature: {
    id: feature.id || v4(),
    ...feature,
  }
})

export const createLayer = (layer) => ({
  type: 'CREATE_LAYER',
  layer: {
    id: layer.id || v4(),
    ...layer,
  }
})

export const loadLayer = (layer) => ({ type: 'LOAD_LAYER', layer })

const layers = (state = {}, action) => {
  switch (action.type) {
    case 'LOAD_LAYER':
      return {
        ...state,
        [action.layer.id]: layer(state[action.layer.id],
          loadLayer(action.layer))
      }
    case 'UPDATE_LAYER':
      return { ...state, [action.id]: layer(state[action.layer.id], action) }
    case 'REMOVE_LAYER':
      const newState = Object.assign({}, state)
      delete newState[action.id]
      return newState
    case 'REMOVE_FEATURE':
      return state // XXX how to iterate all object key/values

    case 'APP_LOAD':
      const newLayers = {}
      action.state.overlay.forEach(l =>
        newLayers[l.id] = layer(undefined, loadLayer(l))
      )
      return { ...state, ...newLayers }

    default:
      return state
  }
}

const visibleLayers = (state = [], action) => {
  switch (action.type) {
    case 'SHOW_LAYER':
      return [action.layerId, ...state]

    case 'HIDE_LAYER':
      return state.filter(layerId => layerId !== action.layerId)

    default:
      return state
  }
}

export const showLayer = (layerId) => ({ type: 'SHOW_LAYER', layerId })
export const hideLayer = (layerId) => ({ type: 'HIDE_LAYER', layerId })

const combinedStore = combineReducers({
  control,
  mapView,
  mapConfig,
  features,
  layers,
  visibleLayers,
})

const store = createStore(combinedStore, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

export default store
