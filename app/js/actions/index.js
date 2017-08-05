let nextId = 1;

export const appLoad = (state) => {
  return {
    type: 'APP_LOAD',
    state,
  };
};

export const addCollection = (properties) => {
  return {
    type: 'ADD_COLLECTION',
    id: nextId++,
    properties,
  };
};

export const addFeature = (collectionId, { geometry, style, properties }) => {
  return {
    type: 'ADD_FEATURE',
    collectionId,
    featureId: nextId++,
    geometry,
    style,
    properties,
  };
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
  alert('openOverlayEditor is not implemented yet'); // XXX
  return { type: 'OPEN_OVERLAY_EDITOR' };
};

export const openWaypointsEditor = () => {
  alert('openWaypointsEditor is not implemented yet'); // XXX
  return { type: 'OPEN_WAYPOINTS_EDITOR' };
};

export const removeCollection = (id) => {
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

export const setTargetView = (targetView) => {
  return {
    type: 'SET_TARGET_VIEW',
    targetView,
  };
};

export const trackMapView = (lastView) => {
  return {
    type: 'TRACK_MAP_VIEW',
    lastView,
  };
};

export const updateCollection = (id, properties) => {
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
