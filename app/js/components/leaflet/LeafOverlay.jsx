import React from 'react'
import { connect } from 'react-redux'
import * as RL from 'react-leaflet'

import { openFeatureDetail } from '../../store'

function centered(positions) {
  if (Array.isArray(positions[0]))
    return positions.map(e => centered(e))
  return [positions[0] + .5, positions[1] + .5]
}

function renderFeatureOverlay(feature, key, onClick) {
  const props = { feature, onClick }
  switch (feature.geometry.type) {
    case "marker": return <FeatureOverlayMarker key={key} {...props} />
    case "circle": return <FeatureOverlayCircle key={key} {...props} />
    case "image": return <FeatureOverlayImage key={key} {...props} />
    case "line": return <FeatureOverlayLine key={key} {...props} />
    case "polygon": return <FeatureOverlayPolygon key={key} {...props} />
    default:
      console.error("[FeaturesOverlay] Unknown feature geometry type", feature)
  }
}

function FeatureOverlayMarker({ feature, onClick }) {
  const { id, geometry, style } = feature
  const [z, x] = geometry.position
  return <RL.Marker
    onclick={() => onClick(id)}
    {...geometry} // TODO unused? how about CircleMarker?
    {...style}
    position={[z + .5, x + .5]}
  />
}

function FeatureOverlayCircle({ feature, onClick }) {
  const { id, geometry, style } = feature
  return <RL.Circle
    onclick={() => onClick(id)}
    {...style}
    center={centered(geometry.center)}
    radius={geometry.radius}
  />
}

function FeatureOverlayImage({ feature, onClick }) {
  const { id, geometry, style } = feature
  return <RL.ImageOverlay
    onclick={() => onClick(id)}
    {...geometry}
    {...style}
  />
}

function FeatureOverlayLine({ feature, onClick }) {
  const { id, geometry, style } = feature
  return <RL.Polyline
    onclick={() => onClick(id)}
    {...style}
    positions={centered(geometry.positions)}
  />
}

function FeatureOverlayPolygon({ feature, onClick }) {
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
  openFeatureDetail,
}) => {

  const visibleFeatures = []
  visibleLayers.forEach(layerId => {
    const layer = layers[layerId]
    if (!layer) return
    layer.features.forEach(featureId =>
      visibleFeatures.push(features[featureId])
    )
  })

  const onClick = openFeatureDetail

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
  openFeatureDetail,
}

export default connect(mapStateToProps, mapDispatchToProps)(LeafOverlay)
