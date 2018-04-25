import React from 'react'
import { connect } from 'react-redux'
import * as RL from 'react-leaflet'

import EditableCircle from './EditableCircle'
import EditableLine from './EditableLine'
import EditableMarker from './EditableMarker'
import EditablePolygon from './EditablePolygon'
import { applyFilterOverrides, checkFilterCondition, doesFeatureHaveLabel } from '../../utils/filters'
import { deepFlip } from '../../utils/math'
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
  const { url, bounds } = map_image
  return <RL.ImageOverlay
    onclick={() => dispatch(openFeatureDetail(id))}
    url={url}
    bounds={deepFlip(bounds)}
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
  filters,
  dispatch,
}) => {

  // TODO use active filters
  const filteredFeatures = {}
  Object.values(features).forEach(feature => {
    for (let filter of filters) {
      let matches = true
      for (let condition of filter.conditions) {
        if (!checkFilterCondition({ condition, feature })) {
          matches = false
          break
        }
      }
      if (matches) {
        filteredFeatures[feature.id] = { feature, filter }
        break
      }
    }
  })

  if (features[editFeatureId] && !filteredFeatures[editFeatureId]) {
    filteredFeatures[editFeatureId] = { feature: features[editFeatureId], filter: { overrides: '{}' } }
  }
  if (features[detailFeatureId] && !filteredFeatures[detailFeatureId]) {
    filteredFeatures[detailFeatureId] = { feature: features[detailFeatureId], filter: { overrides: '{}' } }
  }

  return <RL.FeatureGroup>
    {prepareListForFeatureGroup(
      Object.values(filteredFeatures).map(({ feature, filter }, i) => {
        const editable = editFeatureId === feature.id
        const props = { dispatch, editable, feature, filter }
        const FeatureComponent = getFeatureComponent(feature)
        if (!FeatureComponent) {
          console.error("[FeaturesOverlay] Don't know how to display feature", feature)
          return null
        }
        return <FeatureComponent key={feature.id || i} {...props} />
      })
    )}
    {prepareListForFeatureGroup(
      Object.values(filteredFeatures)
        .filter(({ feature, filter }) => doesFeatureHaveLabel({ feature, filter }))
        .map(({ feature, filter }, i) => {
          return <PassiveLabel key={(feature.id || i) + '_label'} feature={feature} filter={filter} />
        })
    )}
  </RL.FeatureGroup>
}

const mapStateToProps = ({ control, features, filters }) => {
  return {
    detailFeatureId: control.appMode === 'FEATURE' ? control.featureId : null,
    editFeatureId: control.appMode === 'EDIT' ? control.editFeatureId : null,
    features,
    filters,
  }
}

export default connect(mapStateToProps)(LeafOverlay)
