import React from 'react'
import { connect } from 'react-redux'
import * as RL from 'react-leaflet'

import EditableCircle from './EditableCircle'
import EditableLine from './EditableLine'
import EditableMarker from './EditableMarker'
import EditablePolygon from './EditablePolygon'
import { openFeatureDetail } from '../../store'

// TODO CircleMarker

function FeatureOverlayImage({ feature, dispatch }) {
  const { id, geometry, style } = feature
  return <RL.ImageOverlay
    onclick={() => dispatch(openFeatureDetail(id))}
    {...geometry}
    {...style}
  />
}

// RL.FeatureGroup has weird expectations about its children...
function prepareListForFeatureGroup(list) {
  if (!list || list.length > 1) return list
  if (list.length === 1) return list[0]
  return null
}

const LeafOverlay = ({
  detailFeatureId,
  editFeatureId,
  features,
  layers,
  visibleLayers,
  dispatch,
}) => {

  const visibleFeatures = {}
  visibleLayers.forEach(layerId => {
    const layer = layers[layerId]
    if (!layer) return
    layer.features.forEach(featureId =>
      visibleFeatures[featureId] = features[featureId]
    )
  })

  if (editFeatureId) {
    visibleFeatures[editFeatureId] = features[editFeatureId]
  }
  if (detailFeatureId) {
    visibleFeatures[detailFeatureId] = features[detailFeatureId]
  }

  return <RL.FeatureGroup>
    {prepareListForFeatureGroup(
      Object.values(visibleFeatures).map((feature, i) => {
        const editable = editFeatureId === feature.id
        const props = { feature, editable, dispatch }
        switch (feature.geometry.type) {
          case "marker": return <EditableMarker key={feature.id || i} {...props} />
          case "circle": return <EditableCircle key={feature.id || i} {...props} />
          case "image": return <FeatureOverlayImage key={feature.id || i} {...props} />
          case "line": return <EditableLine key={feature.id || i} {...props} />
          case "polygon": return <EditablePolygon key={feature.id || i} {...props} />
          default:
            console.error("[FeaturesOverlay] Unknown feature geometry type", feature)
        }
      })
    )}
  </RL.FeatureGroup>
}

const mapStateToProps = ({ control, features, layers, visibleLayers }) => {
  return {
    detailFeatureId: control.appMode === 'FEATURE' ? control.featureId : null,
    editFeatureId: control.appMode === 'EDIT' ? control.editFeatureId : null,
    features,
    layers,
    visibleLayers,
  }
}

export default connect(mapStateToProps)(LeafOverlay)
