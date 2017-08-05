import React from 'react';
import { connect } from 'react-redux';

const LocalStorageSync = ({
  mapView,
  overlay,
}) => {
  window.localStorage.setItem('civMapState', JSON.stringify({ mapView, overlay }));
  return null; // don't render anything
};

const mapStateToProps = ({ mapView, overlay }, ownProps) => {
  return { mapView, overlay };
};

export default connect(mapStateToProps)(LocalStorageSync);
