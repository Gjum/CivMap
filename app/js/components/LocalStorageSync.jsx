import React from 'react';
import { connect } from 'react-redux';

let lastLocalStorageError = {};

const LocalStorageSync = ({
  appState,
}) => {
  try {
    window.localStorage.setItem('civMapState', JSON.stringify(appState));
  } catch (e) {
    if (lastLocalStorageError.code != e.code) {
      lastLocalStorageError = e;
      console.error('Failed storing app state in LocalStorage:', e);
    }
  }
  return null; // don't render anything
};

const mapStateToProps = ({ mapView, overlay }, ownProps) => {
  const { basemapId, lastView } = mapView;
  mapView = { basemapId, lastView };
  return { appState: { mapView, overlay } };
};

export default connect(mapStateToProps)(LocalStorageSync);
