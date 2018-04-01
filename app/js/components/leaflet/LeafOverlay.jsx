import React from 'react'
import { connect } from 'react-redux'
import * as RL from 'react-leaflet'

import EditableCircle from './EditableCircle'
import EditableLine from './EditableLine'
import EditableMarker from './EditableMarker'
import EditablePolygon from './EditablePolygon'
import PassiveLabel from './PassiveLabel'
import { openFeatureDetail } from '../../store'

export function getFeatureComponent(feature, zoom) {
  const has = (k) => feature[k] !== undefined
  // TODO take zoom vs size into account

  // order matters: first matching determines display mode
  if (has('map_image')) return FeatureOverlayImage
  if (has('polygon')) return EditablePolygon
  if (has('line')) return EditableLine
  if (has('x') && has('z')) {
    if (has('radius')) return EditableCircle
    return EditableMarker
  }

  return null
}

function FeatureOverlayImage({ feature, dispatch }) {
  const { id, map_image, style = {} } = feature
  return <RL.ImageOverlay
    onclick={() => dispatch(openFeatureDetail(id))}
    {...map_image}
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
  dispatch,
}) => {

  // TODO use active filters
  const visibleFeatures = features
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
        const FeatureComponent = getFeatureComponent(feature)
        if (!FeatureComponent) {
          console.error("[FeaturesOverlay] Don't know how to display feature", feature)
          return null
        }
        return <FeatureComponent key={feature.id || i} {...props} />
      })
    )}
    {/* TODO show labels for any kind of feature */}
    {/* {prepareListForFeatureGroup(
      Object.values(visibleFeatures)
        .filter(feature => feature.label) // TODO should be controlled by filter, not feature
        .map((feature, i) => {
          return <PassiveLabel key={(feature.id || i) + '_label'} feature={feature} />
        })
    )} */}
  </RL.FeatureGroup>
}

const mapStateToProps = ({ control, features }) => {
  return {
    detailFeatureId: control.appMode === 'FEATURE' ? control.featureId : null,
    editFeatureId: control.appMode === 'EDIT' ? control.editFeatureId : null,
    features,
  }
}

export default connect(mapStateToProps)(LeafOverlay)
