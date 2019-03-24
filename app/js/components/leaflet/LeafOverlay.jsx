import React from 'react'
import { connect } from 'react-redux'
import * as RL from 'react-leaflet'

import EditableCircle from './EditableCircle'
import EditableImage from './EditableImage';
import EditableLine from './EditableLine'
import EditableMarker from './EditableMarker'
import EditablePolygon from './EditablePolygon'
import PassiveLabel from './PassiveLabel'
import { defaultPresentation, getCurrentPresentation, getZoomStyle, lookupStyle } from '../../utils/presentation'

export function getFeatureComponent(feature, zoom) {
  const has = (k) => feature[k] !== undefined
  // TODO take zoom vs size into account

  // order matters: first matching determines display mode
  if (has('map_image')) return EditableImage
  if (has('polygon')) return EditablePolygon
  if (has('line')) return EditableLine
  if (has('x') && has('z')) {
    if (has('radius')) return EditableCircle
    return EditableMarker
  }

  return null
}

function doesFeatureHaveLabel(featureWithStyles) {
  const { feature } = featureWithStyles
  const label = lookupStyle("label", featureWithStyles, feature.name)

  const hasXZ = feature.x !== undefined && feature.z !== undefined
  return label && (hasXZ || feature.polygon !== undefined)
}

// RL.FeatureGroup has weird expectations about its children...
function prepareListForFeatureGroup(list) {
  if (!list || list.length > 1) return list
  if (list.length === 1) return list[0]
  return null
}

export function selectRenderedFeatures({ activeFeatureCollection, activeFeatureId, appMode, collections, zoom }) {
  const highlightActiveFeature = ['EDIT', 'FEATURE', 'SEARCH'].includes(appMode)

  const featuresPresentations = {}

  // TODO separate RL.FeatureGroup per collection to reduce updates
  // TODO lazily separate into zoom groups, reset that cache when features change
  Object.values(collections).forEach(collection => {
    const { features = {} } = collection
    const presentation = getCurrentPresentation(collection)

    if (!presentation) {
      if (highlightActiveFeature && activeFeatureCollection == collection.id) {
        // show active/edited feature anyway
        const feature = features[activeFeatureId]
        featuresPresentations[feature.id] = {
          feature,
          baseStyle: (presentation || defaultPresentation).style_base,
          zoomStyle: (presentation || defaultPresentation).style_highlight,
        }
      }
      return
    }

    const baseStyle = presentation.style_base
    const zoomStyle = getZoomStyle(presentation, zoom)

    Object.values(features).forEach(feature => {
      if (highlightActiveFeature && activeFeatureId === feature.id && activeFeatureCollection === feature.collectionId) {
        featuresPresentations[feature.id] = {
          feature,
          baseStyle: (presentation || defaultPresentation).style_base,
          zoomStyle: (presentation || defaultPresentation).style_highlight,
        }
      } else if (presentation) {
        const featureWithStyles = { feature, baseStyle, zoomStyle }
        const opacity = lookupStyle("opacity", featureWithStyles, 1)
        if (opacity > 0) {
          featuresPresentations[feature.id] = featureWithStyles
        }
      } else {
        // all presentations disabled for this category, nor highlighted: do not show feature
      }
    })
  })
  return featuresPresentations
}

export const RealLeafOverlay = ({
  activeFeatureId,
  activeFeatureCollection,
  appMode,
  collections,
  zoom,
  dispatch,
}) => {
  const featuresPresentations = selectRenderedFeatures({ activeFeatureCollection, activeFeatureId, appMode, collections, zoom })

  return <RL.FeatureGroup>
    {prepareListForFeatureGroup(
      Object.values(featuresPresentations).map(({ feature, baseStyle, zoomStyle }, i) => {
        const editable = appMode === 'EDIT' && activeFeatureId === feature.id
        const props = { dispatch, editable, feature, baseStyle, zoomStyle }
        const FeatureComponent = getFeatureComponent(feature)
        if (!FeatureComponent) {
          console.error("[FeaturesOverlay] Don't know how to display feature", feature)
          return null
        }
        return <FeatureComponent key={feature.id || i} {...props} />
      })
    )}
    {prepareListForFeatureGroup(
      Object.values(featuresPresentations)
        .filter((featureWithStyles) => doesFeatureHaveLabel(featureWithStyles))
        .map((featureWithStyles, i) => {
          return <PassiveLabel key={(featureWithStyles.feature.id || i) + '_label'} {...featureWithStyles} />
        })
    )}
  </RL.FeatureGroup>
}

const mapStateToProps = ({ control, collections }) => {
  return {
    activeFeatureId: control.activeFeatureId,
    activeFeatureCollection: control.activeFeatureCollection,
    appMode: control.appMode,
    collections,
  }
}

export default connect(mapStateToProps)(RealLeafOverlay)
