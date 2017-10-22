export const appLoad = (state) => {
  return {
    type: 'APP_LOAD',
    state,
  };
};

export const addLayer = (properties) => {
  return {
    type: 'ADD_COLLECTION',
    id: Date.now(),
    properties,
  };
};

export const addFeature = (collectionId, { geometry, style, properties }) => {
  return {
    type: 'ADD_FEATURE',
    collectionId,
    featureId: Date.now(),
    geometry,
    style,
    properties,
  };
};

export const setLayerHidden = (id, hidden) => {
  return {
    type: 'SET_LAYER_HIDDEN',
    id,
    hidden,
  };
};

export const openBrowseMode = () => {
  return { type: 'OPEN_BROWSE_MODE' };
};

export const openSearch = () => {
  alert('openSearch is not implemented yet'); // XXX
  return { type: 'OPEN_SEARCH' };
};

export const openShare = () => {
  alert('openShare is not implemented yet'); // XXX
  return { type: 'OPEN_SHARE' };
};

export const openFeatureEditor = (featureId) => {
  alert('openFeatureEditor is not implemented yet'); // XXX
  return {
    type: 'OPEN_FEATURE_EDITOR',
    featureId,
  };
};

export const openLayerEditor = (layerId) => {
  alert('openLayerEditor is not implemented yet'); // XXX
  return {
    type: 'OPEN_LAYER_EDITOR',
    layerId,
  };
};

export const openOverlayEditor = () => {
  return { type: 'OPEN_OVERLAY_EDITOR' };
};

export const openWaypointsEditor = () => {
  alert('openWaypointsEditor is not implemented yet'); // XXX
  return { type: 'OPEN_WAYPOINTS_EDITOR' };
};

export const removeLayer = (id) => {
  return {
    type: 'REMOVE_COLLECTION',
    id,
  };
};

export const removeFeature = (id) => {
  return {
    type: 'REMOVE_FEATURE',
    id,
  };
};

export const setActiveBasemap = (basemapId) => {
  return {
    type: 'SET_ACTIVE_BASEMAP',
    basemapId,
  };
};

export const setDrawerClosed = () => {
  return { type: 'CLOSE_DRAWER' };
};

export const setDrawerOpen = () => {
  return { type: 'OPEN_DRAWER' };
};

export const trackMap = (map) => {
  return {
    type: 'TRACK_MAP',
    map,
  };
};

export const trackMapView = (lastView) => {
  return {
    type: 'TRACK_MAP_VIEW',
    lastView,
  };
};

export const trackWindowSize = ({ height, width }) => {
  return {
    type: 'TRACK_WINDOW_SIZE',
    height,
    width,
  };
};

export const updateLayer = (id, properties) => {
  return {
    type: 'UPDATE_COLLECTION',
    id,
    properties,
  };
};

export const updateFeature = (id, { geometry, style, properties }) => {
  return {
    type: 'UPDATE_FEATURE',
    id,
    geometry,
    style,
    properties,
  };
};
