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

/** @param {{ activeFeatureCollection: string, activeFeatureId: string, collections: {[id: string]: any}, zoom: number }} args */
export function selectRenderedLayers(args) {
  const { activeFeatureCollection, activeFeatureId, collections } = args
  const renderedLayers = Object.values(collections).map(layer => {
    let presentationMaybe = getCurrentPresentation(layer)
    if (!presentationMaybe) {
      if (layer.id !== activeFeatureCollection) return null
      const layerHasActiveFeature = layer.features && layer.features[activeFeatureId]
      if (!layerHasActiveFeature) return null
      // else: show (only) active/edited feature anyway - indicated by a false-ish presentationMaybe
    }
    return [layer, presentationMaybe]
  }).filter(pair => pair !== null)
  return renderedLayers.sort()
}

export const RealLeafOverlay = ({
  activeFeatureId,
  activeFeatureCollection,
  appMode,
  collections,
  zoom,
  dispatch,
}) => {
  const editableMode = appMode === 'EDIT'
  if (!['EDIT', 'FEATURE', 'SEARCH'].includes(appMode)) {
    activeFeatureId = null
    activeFeatureCollection = null
  }

  const renderedLayers = selectRenderedLayers({ activeFeatureCollection, activeFeatureId, collections, zoom })
  return <RL.FeatureGroup>
    {prepareListForFeatureGroup(
      renderedLayers.map(([layer, presentationMaybe], i) => {
        const presentation = presentationMaybe || defaultPresentation
        const activeLayer = layer.id === activeFeatureCollection
        const baseStyle = presentation.style_base
        const zoomStyle = getZoomStyle(presentation.zoom_styles, zoom)

        let renderedFeatures
        const onlyRenderActiveFeature = !presentationMaybe
        if (onlyRenderActiveFeature && activeLayer && activeFeatureId) {
          renderedFeatures = [layer.features[activeFeatureId]]
        } else {
          renderedFeatures = Object.values(layer.features)
        }

        return <RL.FeatureGroup key={layer.id || i} >
          {prepareListForFeatureGroup(
            renderedFeatures.map(feature => {
              const editable = editableMode && activeFeatureId === feature.id
              const active = activeLayer && feature.id === activeFeatureId
              const highlightStyle = (active || editable) && (presentation.style_highlight || defaultPresentation.style_highlight)
              const FeatureComponent = getFeatureComponent(feature)
              if (!FeatureComponent) {
                console.error("[LeafOverlay] Don't know how to display feature", feature)
                return null
              }
              const props = { baseStyle, dispatch, editable, feature, highlightStyle, zoomStyle }
              const opacity = lookupStyle("opacity", props, 1)
              if (opacity <= 0) return null // invisible
              return [
                <FeatureComponent key={feature.id} {...props} />,
                doesFeatureHaveLabel(props) && <PassiveLabel key={feature.id + '_label'} {...props} />,
              ]
            })
          )}
        </RL.FeatureGroup>
      })
    )}
  </RL.FeatureGroup>
}

const mapStateToProps = ({ control, collections, mapView }) => {
  return {
    activeFeatureId: control.activeFeatureId,
    activeFeatureCollection: control.activeFeatureCollection,
    appMode: control.appMode,
    collections,
    zoom: mapView.zoom,
  }
}

export default connect(mapStateToProps)(RealLeafOverlay)
