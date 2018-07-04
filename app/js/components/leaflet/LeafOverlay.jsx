import React from 'react'
import { connect } from 'react-redux'
import * as RL from 'react-leaflet'

import EditableCircle from './EditableCircle'
import EditableLine from './EditableLine'
import EditableMarker from './EditableMarker'
import EditablePolygon from './EditablePolygon'
import { deepFlip } from '../../utils/math'
import PassiveLabel from './PassiveLabel'
import { defaultPresentation, getZoomStyle, lookupStyle } from '../../utils/presentation'
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
  const { id, source, map_image, style = {} } = feature
  const { url, bounds } = map_image
  return <RL.ImageOverlay
    onclick={() => dispatch(openFeatureDetail(id, source))}
    url={url}
    bounds={deepFlip(bounds)}
    {...style}
  />
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
  Object.values(collections).forEach(collection => {
    const { enabled_presentation, features, presentations } = collection

    const fallbackPresentation = Object.values(presentations)[0] || defaultPresentation
    const presentation = presentations[enabled_presentation] || fallbackPresentation

    Object.values(features).forEach(feature => {
      if (highlightActiveFeature && activeFeatureId === feature.id && activeFeatureCollection === feature.source) {
        featuresPresentations[feature.id] = {
          feature,
          baseStyle: presentation.style_base,
          zoomStyle: presentation.style_highlight,
        }
      } else if (enabled_presentation) {
        const baseStyle = presentation.style_base
        const zoomStyle = getZoomStyle(presentation, zoom) // TODO we can calculate this once for all enabled presentations before looping the features
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

const mapStateToProps = ({ control, collections }, { zoom }) => {
  return {
    activeFeatureId: control.activeFeatureId,
    activeFeatureCollection: control.activeFeatureCollection,
    appMode: control.appMode,
    collections,
    zoom,
  }
}

export default connect(mapStateToProps)(RealLeafOverlay)
