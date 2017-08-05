import React from 'react';
import { connect } from 'react-redux';
import * as L from 'leaflet';
import * as RL from 'react-leaflet';

import { setTargetView, trackMapView } from '../actions';
import { boundsToCircle, circleToBounds } from '../utils/Math.js';

L.Icon.Default.imagePath = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.1.0/images/';

var mcCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0)
});

const getEventView = e => boundsToCircle(e.target.getBounds());

const LeafMap = ({
  mapBgColor,
  targetView,
  setTargetView,
  trackMapView,
  children,
}) => {
  const onRef = ref => {
    if (ref && targetView) {
      ref.leafletElement.fitBounds(circleToBounds(targetView));
      setTargetView(null);
    }
  }
  return (
    <div className="mapContainer"
      style={{ backgroundColor: mapBgColor }}
    >
      <RL.Map
        className="map"
        ref={onRef}
        crs={mcCRS}
        center={[0, 0]}
        zoom={-6}
        maxZoom={5}
        minZoom={-6}
        attributionControl={false}
        zoomControl={false}
        onmoveend={e => trackMapView(getEventView(e))}
        onzoomend={e => trackMapView(getEventView(e))}
      >
        {children}
      </RL.Map>
    </div>
  );
};


const mapStateToProps = ({ mapConfig, mapView }, ownProps) => {
  return {
    mapBgColor: mapConfig.basemaps[mapView.basemapId].bgColor,
    targetView: mapView.targetView,
  };
};

const mapDispatchToProps = {
  setTargetView,
  trackMapView,
};

export default connect(mapStateToProps, mapDispatchToProps)(LeafMap);
