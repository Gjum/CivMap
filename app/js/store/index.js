import { createStore, combineReducers } from 'redux';

const defaultControlState = {
  drawerOpen: false,
};

const control = (state = defaultControlState, action) => {
  switch (action.type) {
    case 'OPEN_DRAWER':
      return { ...state, drawerOpen: true };
    case 'CLOSE_DRAWER':
      return { ...state, drawerOpen: false };
    default:
      return state;
  }
}

const defaultMapConfig = {
  basemapPreview: '/z-2/0,0.png',
  basemaps: {},
  borderApothem: 13000,
  tilesRoot: 'https://raw.githubusercontent.com/ccmap/tiles/master/',
};

const mapConfig = (state = defaultMapConfig, action) => {
  switch (action.type) {
    case 'APP_LOAD':
      return { ...state, ...action.state.mapConfig };
    default:
      return state;
  }
}

const defaultMapView = {
  basemapId: null,
  lastView: null,
  targetView: null,
};

const mapView = (state = defaultMapView, action) => {
  switch (action.type) {
    case 'APP_LOAD':
      return { ...state, ...action.state.mapView };
    case 'SET_ACTIVE_BASEMAP':
      return { ...state, basemapId: action.basemapId };
    case 'SET_TARGET_VIEW':
      return { ...state, targetView: action.targetView };
    case 'TRACK_MAP_VIEW':
      return { ...state, lastView: action.lastView };
    default:
      return state;
  }
}

const feature = (state, action) => {
  switch (action.type) {
    case 'ADD_FEATURE':
      return {
        id: action.featureId,
        geometry: action.geometry,
        style: action.style || {},
        properties: action.properties || {},
      };
    case 'UPDATE_FEATURE':
      if (action.id != state.id) return state;
      return {
        ...state,
        geometry: action.geometry || state.geometry,
        style: action.style || state.style,
        properties: action.properties || state.properties,
      };
    default:
      return state;
  }
}

const features = (state = [], action) => {
  switch (action.type) {
    case 'ADD_FEATURE':
      return [...state, feature(undefined, action)];
    case 'UPDATE_FEATURE':
      return state.map(fState => feature(fState, action));
    case 'REMOVE_FEATURE':
      return state.filter(fState => fState.id != action.id);

    default:
      return state;
  }
}

const collection = (state, action) => {
  switch (action.type) {
    case 'ADD_COLLECTION':
      return {
        id: action.id,
        properties: action.properties,
        features: features(),
      };
    case 'UPDATE_COLLECTION':
      if (action.id != state.id) return state;
      return {
        ...state,
        properties: action.properties,
      };

    case 'ADD_FEATURE':
      if (action.collectionId != state.id) return state;
      return { ...state, features: features(state.features, action) };
    case 'UPDATE_FEATURE':
    case 'REMOVE_FEATURE':
      if (!state.features.find(f => f.id == action.id))
        return state; // optimization: don't create new array if no features change
      return { ...state, features: features(state.features, action) };

    default:
      return state;
  }
}

const overlay = (state = [], action) => {
  switch (action.type) {
    case 'APP_LOAD':
      return action.state.overlay || state;
    case 'ADD_COLLECTION':
      return [...state, collection(undefined, action)];
    case 'UPDATE_COLLECTION':
      return state.map(cState => collection(cState, action));
    case 'REMOVE_COLLECTION':
      return state.filter(cState => cState.id != action.id);

    case 'ADD_FEATURE':
    case 'UPDATE_FEATURE':
    case 'REMOVE_FEATURE':
      return state.map(cState => collection(cState, action));

    default:
      return state;
  }
}

const civMapApp = combineReducers({
  control,
  mapConfig,
  mapView,
  overlay,
});

export default createStore(civMapApp)
