import React from 'react';
import { connect } from 'react-redux';
import * as RL from 'react-leaflet';

function renderFeatureOverlay(commonProps, feature, key) {
  if (feature.geometry.type == "image")
    return <FeatureOverlayImage image={feature} key={key} commonProps={commonProps} />;
  if (feature.geometry.type == "line")
    return <FeatureOverlayLine line={feature} key={key} commonProps={commonProps} />;
  if (feature.geometry.type == "marker")
    return <FeatureOverlayMarker marker={feature} key={key} commonProps={commonProps} />;
  if (feature.geometry.type == "polygon")
    return <FeatureOverlayPolygon polygon={feature} key={key} commonProps={commonProps} />;
  if (feature.geometry.type == "circle")
    return <FeatureOverlayCircle circle={feature} key={key} commonProps={commonProps} />;

  console.error("[FeaturesOverlay] Unknown feature geometry type", feature);
}

function FeatureOverlayImage(props) {
  let { image: { geometry, style }, commonProps: { globalOpacity } } = props;
  return <RL.ImageOverlay
    opacity={globalOpacity}
    {...geometry}
    {...style}
  />;
}

function FeatureOverlayLine(props) {
  let { line: { geometry, style }, commonProps: { globalOpacity } } = props;
  return <RL.Polyline
    opacity={globalOpacity}
    {...geometry}
    {...style}
  />;
}

function FeatureOverlayMarker(props) {
  let { marker: { geometry, style }, commonProps: { globalOpacity } } = props;
  const [z, x] = geometry.position;
  return <RL.Marker
    opacity={globalOpacity}
    {...geometry}
    {...style}
    position={[z + .5, x + .5]}
  />;
}

function FeatureOverlayPolygon(props) {
  let { polygon: { geometry, style }, commonProps: { globalOpacity } } = props;
  return <RL.Polygon
    opacity={globalOpacity}
    fillOpacity={geometry.filled ? globalOpacity : 0}
    {...geometry}
    {...style}
  />;
}

function FeatureOverlayCircle(props) {
  let { circle: { geometry, style }, commonProps: { globalOpacity } } = props;
  return <RL.Circle
    opacity={globalOpacity}
    fillOpacity={geometry.filled ? globalOpacity : 0}
    {...geometry}
    {...style}
  />;
}

const LeafOverlay = ({ overlay }) => {
  if (!overlay)
    return null;
  const commonProps = {
    globalOpacity: 1,
  };
  return <RL.FeatureGroup>
    {overlay.map(({ features, id }, layerKey) => (
      <RL.FeatureGroup key={id || layerKey}>
        {features.map((f, featureKey) => renderFeatureOverlay(commonProps, f, f.id || featureKey))}
      </RL.FeatureGroup>
    ))}
  </RL.FeatureGroup>;
}

const mapStateToProps = ({ overlay }) => {
  return {
    overlay,
  };
};

export default connect(mapStateToProps)(LeafOverlay);
