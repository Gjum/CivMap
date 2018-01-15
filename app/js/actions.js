export const appLoad = (state) => {
  return {
    type: 'APP_LOAD',
    state,
  };
};

export const openBrowseMode = () => {
  return { type: 'OPEN_BROWSE_MODE' };
};

export const openSearch = (query = "") => ({ type: 'OPEN_SEARCH', query })

export const openShare = () => {
  return { type: 'OPEN_SHARE' };
};

export const openFeatureEditor = (featureId, layerId) => {
  return {
    type: 'OPEN_FEATURE_EDITOR',
    featureId,
    layerId,
  };
};

export const openOverlayEditor = () => {
  return { type: 'OPEN_OVERLAY_EDITOR' };
};

export const openWaypointsEditor = () => {
  return { type: 'OPEN_WAYPOINTS_EDITOR' };
};

export const removeFeature = (id) => {
  return {
    type: 'REMOVE_FEATURE',
    id,
  };
};

export const removeLayer = (id) => {
  return {
    type: 'REMOVE_LAYER',
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

export const trackMapView = (lastView) => {
  return {
    type: 'TRACK_MAP_VIEW',
    lastView,
  };
};

export const updateLayer = (layer) => {
  return {
    type: 'UPDATE_LAYER',
    id: layer.id,
    layer,
  };
};

export const updateFeature = (feature) => {
  return {
    type: 'UPDATE_FEATURE',
    id: feature.id,
    feature,
  };
};
