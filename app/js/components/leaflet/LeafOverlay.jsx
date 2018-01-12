import React from 'react'
import { connect } from 'react-redux'
import * as RL from 'react-leaflet'

import { openFeatureEditor } from '../../actions'

function centered(positions) {
  if (Array.isArray(positions[0]))
    return positions.map(e => centered(e));
  return [positions[0] + .5, positions[1] + .5];
}

function renderFeatureOverlay(feature, key, onClick) {
  const props = { feature, onClick, key }
  switch (feature.geometry.type) {
    case "marker": return <FeatureOverlayMarker {...props} />
    case "circle": return <FeatureOverlayCircle {...props} />
    case "image": return <FeatureOverlayImage {...props} />
    case "line": return <FeatureOverlayLine {...props} />
    case "polygon": return <FeatureOverlayPolygon {...props} />
    default:
      console.error("[FeaturesOverlay] Unknown feature geometry type", feature)
  }
}

function FeatureOverlayMarker({ feature, onClick, key }) {
  const { id, geometry, style } = feature
  const [z, x] = geometry.position
  return <RL.Marker
    onclick={() => onClick(id)}
    {...geometry} // TODO unused? how about CircleMarker?
    {...style}
    position={[z + .5, x + .5]}
  />
}

function FeatureOverlayCircle({ feature, onClick, key }) {
  const { id, geometry, style } = feature
  const [z, x] = geometry.center
  return <RL.Circle
    onclick={() => onClick(id)}
    {...geometry} // TODO enter radius explicitly?
    {...style}
    center={[z + .5, x + .5]}
  />
}

function FeatureOverlayImage({ feature, onClick, key }) {
  const { id, geometry, style } = feature
  return <RL.ImageOverlay
    onclick={() => onClick(id)}
    {...geometry}
    {...style}
  />
}

function FeatureOverlayLine({ feature, onClick, key }) {
  const { id, geometry, style } = feature
  return <RL.Polyline
    onclick={() => onClick(id)}
    {...style}
    positions={centered(geometry.positions)}
  />
}

function FeatureOverlayPolygon({ feature, onClick, key }) {
  const { id, geometry, style } = feature
  return <RL.Polygon
    onclick={() => onClick(id)}
    {...style}
    positions={centered(geometry.positions)}
  />
}

// RL.FeatureGroup has weird expectations about its children...
function prepareListForFeatureGroup(list) {
  if (!list || list.length > 1) return list
  if (list.length === 1) return list[0]
  return null
}

const LeafOverlay = ({
  features,
  layers,
  visibleLayers,
  openFeatureEditor,
}) => {

  const visibleFeatures = []
  visibleLayers.forEach(layerId =>
    layers[layerId].features.forEach(featureId =>
      visibleFeatures.push(features[featureId])
    )
  )

  const onClick = openFeatureEditor

  return <RL.FeatureGroup>
    {prepareListForFeatureGroup(
      visibleFeatures.map((f, featureKey) =>
        renderFeatureOverlay(f, f.id || featureKey, onClick))
    )}
  </RL.FeatureGroup>
}

const mapStateToProps = ({ features, layers, visibleLayers }) => {
  return {
    features,
    layers,
    visibleLayers,
  }
}

const mapDispatchToProps = {
  openFeatureEditor,
}

export default connect(mapStateToProps, mapDispatchToProps)(LeafOverlay)
