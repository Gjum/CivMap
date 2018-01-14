import { createStore, combineReducers } from 'redux'

// TODO some of this causes the map to resize, some does not
export const defaultControlState = {
  appMode: 'BROWSE',
  drawerOpen: false,
  featureId: null,
  layerId: null,
  windowHeight: NaN,
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
    case 'OPEN_WAYPOINTS_EDITOR':
      return { ...state, drawerOpen: false, appMode: 'WAYPOINTS' }
    case 'TRACK_WINDOW_SIZE':
      return { ...state, windowHeight: action.height, windowWidth: action.width }
    default:
      return state
  }
}

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

///// XXX refactor everything above /////
// ... according to which subscribers read it

// TODO redo this according to todo.md
export const defaultMapConfig = {
  basemapPreview: '/z-2/0,0.png',
  basemaps: {},
  borderApothem: NaN,
  tilesRoot: null,
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

    default:
      return state
  }
}

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
  features,
  layers,
  visibleLayers,
  mapConfig,
  // TODO restructure the following store members:
  control,
  mapView,
})

const store = createStore(combinedStore, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

export default store
