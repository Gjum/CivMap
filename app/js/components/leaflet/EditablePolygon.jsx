import PropTypes from 'prop-types'
import React from 'react'
import * as RL from 'react-leaflet'

import { centered, deepFlip, deepLatLngToArr } from '../../utils/math'
import { calculateFeatureStyle, convertStyle } from '../../utils/presentation'
import { openFeatureDetail, updateFeatureInCollection } from '../../store'

export default class EditablePolygon extends React.PureComponent {
  static contextTypes = {
    leafMap: PropTypes.object,
  }

  resetEditor = () => {
    if (!this.featureRef) {
      console.error('trying to set polygon editing without featureRef')
      return
    }
    if (!this.props.editable) {
      this.featureRef.disableEdit()
      return
    }

    this.featureRef.enableEdit() // create editor
    this.featureRef.editor.reset()

    const positions = this.props.feature.polygon
    if (!positions || positions.length <= 0 || positions[positions.length - 1].length <= 0) {
      this.featureRef.editor.disable() // newShape() is broken while editing
      this.featureRef.editor.newShape()
    }

    if (!this.featureRef.civMapIsListening) {
      this.featureRef.civMapIsListening = true
      // TODO add holes by clicking on shape
      this.featureRef.on('editable:drawing:clicked', this.updatePositions)
      this.featureRef.on('editable:vertex:dragend', this.updatePositions)
      this.featureRef.on('editable:vertex:deleted', this.updatePositions)
    }
  }

  updatePositions = (e) => {
    this.featureRef.editor.ensureMulti()
    const positions = deepLatLngToArr(this.featureRef.getLatLngs())
    // TODO ignore updates that only add 1-point segments
    const { feature } = this.props
    this.props.dispatch(updateFeatureInCollection(feature.collectionId, { ...feature, polygon: positions }))
  }

  onRef = (ref) => {
    if (!ref || !ref.leafletElement) return

    this.featureRef = ref.leafletElement

    // let leaflet internals finish updating before we interact with it
    setTimeout(this.resetEditor, 0)
  }

  render() {
    const { dispatch, editable, feature, baseStyle, highlightStyle, zoomStyle } = this.props
    const { id, collectionId, polygon } = feature
    const style = calculateFeatureStyle({ feature, baseStyle, highlightStyle, zoomStyle })

    // let leaflet internals finish updating before we interact with it
    setTimeout(this.resetEditor, 0)

    return <RL.Polygon
      ref={this.onRef}
      onclick={() => editable || dispatch(openFeatureDetail(id, collectionId))}
      {...convertStyle(style)}
      positions={!polygon ? [] : deepFlip(polygon)}
    />
  }
}
