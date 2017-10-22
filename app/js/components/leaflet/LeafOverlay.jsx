import React from 'react';
import { connect } from 'react-redux';
import * as RL from 'react-leaflet';

import { centered } from '../../utils/Math';

function setEditableOnRef(e, elementId, editId) {
  if (!e) return;
  const isEditable = editId == elementId;
  if (isEditable && !e.leafletElement.editEnabled) {
    e.leafletElement.enableEdit(e.leafletElement._map); // XXX is that _map correct?
  } else if (!isEditable && e.leafletElement.editEnabled) {
    e.leafletElement.disableEdit();
  }
}

function renderFeatureOverlay(commonProps, feature, key) {
  if (feature.geometry.type == "image")
    return <FeatureOverlayImage feature={feature} key={key} commonProps={commonProps} />;
  if (feature.geometry.type == "line")
    return <FeatureOverlayLine feature={feature} key={key} commonProps={commonProps} />;
  if (feature.geometry.type == "marker")
    return <FeatureOverlayMarker feature={feature} key={key} commonProps={commonProps} />;
  if (feature.geometry.type == "polygon")
    return <FeatureOverlayPolygon feature={feature} key={key} commonProps={commonProps} />;
  if (feature.geometry.type == "circle")
    return <FeatureOverlayCircle feature={feature} key={key} commonProps={commonProps} />;

  console.error("[FeaturesOverlay] Unknown feature geometry type", feature);
}

function FeatureOverlayImage(props) {
  const { id, geometry, style } = props.feature;
  const { editId, globalOpacity } = props.commonProps;
  return <RL.ImageOverlay
    opacity={globalOpacity}
    positions={centered(geometry.positions)}
    {...style}
  />;
}

function FeatureOverlayLine(props) {
  const { id, geometry, style } = props.feature;
  const { editId, globalOpacity } = props.commonProps;
  return <RL.Polyline
    ref={e => setEditableOnRef(e, id, editId)}
    opacity={globalOpacity}
    positions={centered(geometry.positions)}
    {...style}
  />;
}

function FeatureOverlayMarker(props) {
  const { id, geometry, style } = props.feature;
  const { editId, globalOpacity } = props.commonProps;
  const [z, x] = geometry.position;
  return <RL.Marker
    ref={e => setEditableOnRef(e, id, editId)}
    opacity={globalOpacity}
    {...geometry}
    {...style}
    position={[z + .5, x + .5]}
  />;
}

function FeatureOverlayPolygon(props) {
  const { id, geometry, style } = props.feature;
  const { editId, globalOpacity } = props.commonProps;
  return <RL.Polygon
    ref={e => setEditableOnRef(e, id, editId)}
    opacity={globalOpacity}
    fillOpacity={geometry.filled ? globalOpacity : 0}
    {...geometry}
    {...style}
  />;
}

function FeatureOverlayCircle(props) {
  const { id, geometry, style } = props.feature;
  const { editId, globalOpacity } = props.commonProps;
  const [z, x] = geometry.center;
  return <RL.Circle
    ref={e => setEditableOnRef(e, id, editId)} // TODO circle editing is broken
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
  overlay,
  editId,
}) => {
  if (!overlay)
    return null;
  const commonProps = {
    globalOpacity: 1,
    editId,
  };
  return <RL.FeatureGroup>
    {unlistify(overlay
      .filter(({ properties }) => !properties.hidden)
      .map(({ features, id }, layerKey) => (
        <RL.FeatureGroup key={id || layerKey}>
          {features.map((f, featureKey) => renderFeatureOverlay(commonProps, f, f.id || featureKey))}
        </RL.FeatureGroup>
      )))
    }
  </RL.FeatureGroup>;
}

const mapStateToProps = ({ overlay, control: { editId } }) => {
  return {
    overlay,
    editId,
  };
};

export default connect(mapStateToProps)(LeafOverlay);
