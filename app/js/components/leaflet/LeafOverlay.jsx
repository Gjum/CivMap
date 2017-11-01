import React from 'react';
import { connect } from 'react-redux';
import * as RL from 'react-leaflet';

import { openFeatureEditor } from '../../actions';

import { centered } from '../../utils/Math';

function renderFeatureOverlay(commonProps, feature, layerId, key) {
  if (feature.geometry.type == "image")
    return <FeatureOverlayImage feature={feature} key={key} layerId={layerId} commonProps={commonProps} />;
  if (feature.geometry.type == "line")
    return <FeatureOverlayLine feature={feature} key={key} layerId={layerId} commonProps={commonProps} />;
  if (feature.geometry.type == "marker")
    return <FeatureOverlayMarker feature={feature} key={key} layerId={layerId} commonProps={commonProps} />;
  if (feature.geometry.type == "polygon")
    return <FeatureOverlayPolygon feature={feature} key={key} layerId={layerId} commonProps={commonProps} />;
  if (feature.geometry.type == "circle")
    return <FeatureOverlayCircle feature={feature} key={key} layerId={layerId} commonProps={commonProps} />;

  console.error("[FeaturesOverlay] Unknown feature geometry type", feature);
}

function FeatureOverlayImage(props) {
  const { id, geometry, style } = props.feature;
  const { featureId, globalOpacity } = props.commonProps;
  return <RL.ImageOverlay
    opacity={globalOpacity}
    positions={centered(geometry.positions)}
    {...style}
  />;
}

function FeatureOverlayLine(props) {
  const { id, geometry, style } = props.feature;
  const { featureId, globalOpacity } = props.commonProps;
  return <RL.Polyline
    opacity={globalOpacity}
    positions={centered(geometry.positions)}
    {...style}
  />;
}

function FeatureOverlayMarker({ commonProps, feature, layerId }) {
  const { id, geometry, style } = feature;
  const { featureId, globalOpacity, openFeatureEditor } = commonProps;
  const [z, x] = geometry.position;
  return <RL.Marker
    onclick={() => openFeatureEditor(id, layerId)}
    opacity={globalOpacity}
    {...geometry}
    {...style}
    position={[z + .5, x + .5]}
  />;
}

function FeatureOverlayPolygon(props) {
  const { id, geometry, style } = props.feature;
  const { featureId, globalOpacity } = props.commonProps;
  return <RL.Polygon
    opacity={globalOpacity}
    fillOpacity={geometry.filled ? globalOpacity : 0}
    {...geometry}
    {...style}
  />;
}

function FeatureOverlayCircle(props) {
  const { id, geometry, style } = props.feature;
  const { featureId, globalOpacity } = props.commonProps;
  const [z, x] = geometry.center;
  return <RL.Circle
    opacity={globalOpacity}
    fillOpacity={geometry.filled ? globalOpacity : 0}
    {...geometry}
    {...style}
    center={[z + .5, x + .5]}
  />;
}

// RL.FeatureGroup has weird expectations about its children...
function unlistify(list) {
  if (!list || list.length > 1) return list
  if (list.length < 1) return null
  return list[0]
}

const LeafOverlay = ({
  featureId,
  layerId,
  overlay,
  openFeatureEditor,
}) => {
  if (!overlay)
    return null;
  const commonProps = {
    globalOpacity: 1,
    featureId,
    layerId,
    openFeatureEditor,
  };
  return <RL.FeatureGroup>
    {unlistify(overlay
      .filter(({ properties }) => !properties.hidden)
      .map(({ features, id: layerId }, layerKey) => (
        <RL.FeatureGroup key={layerId || layerKey}>
          {features.map((f, featureKey) => renderFeatureOverlay(commonProps, f, layerId, f.id || featureKey))}
        </RL.FeatureGroup>
      )))
    }
  </RL.FeatureGroup>;
}

const mapStateToProps = ({ overlay, control: { featureId, layerId } }) => {
  return {
    overlay,
    featureId,
    layerId,
  };
};

const mapDispatchToProps = {
  openFeatureEditor,
};

export default connect(mapStateToProps, mapDispatchToProps)(LeafOverlay);
