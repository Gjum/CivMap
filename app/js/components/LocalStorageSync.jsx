import React from 'react';
import { connect } from 'react-redux';

let lastLocalStorageError = {};

const LocalStorageSync = ({
  mapView,
  overlay,
}) => {
  const appStateJson = JSON.stringify({ mapView, overlay });
  try {
    window.localStorage.setItem('civMapState', appStateJson);
  } catch (e) {
    if (lastLocalStorageError.code != e.code) {
      lastLocalStorageError = e;
      console.error('Failed storing app state in LocalStorage:', e);
    }
  }
  return null; // don't render anything
};

const mapStateToProps = ({ mapView, overlay }, ownProps) => {
  return { mapView, overlay };
};

export default connect(mapStateToProps)(LocalStorageSync);
