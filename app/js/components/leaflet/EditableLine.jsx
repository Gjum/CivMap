import React from 'react'
import * as RL from 'react-leaflet'

import { centered, deepFlip, deepLatLngToArr } from '../../utils/math'
import { calculateFeatureStyle, convertStyle } from '../../utils/presentation'
import { openFeatureDetail, updateFeatureInCollection } from '../../store'

export default class EditableLine extends React.PureComponent {
  resetEditor = () => {
    if (!this.featureRef) {
      console.error('trying to set polyline editing without featureRef')
      return
    }
    if (!this.props.editable) {
      this.featureRef.disableEdit()
      return
    }

    this.featureRef.enableEdit() // create editor
    this.featureRef.editor.reset()

    const positions = this.props.feature.line
    if (!positions || positions.length <= 0 || positions[positions.length - 1].length <= 0) {
      this.featureRef.editor.disable() // newShape() is broken while editing
      this.featureRef.editor.newShape()
    }
    else {
      this.featureRef.editor.disable() // continueForward() is broken while editing
      this.featureRef.editor.continueForward()
      this.featureRef.editor.enable() // re-add corner markers
    }

    if (!this.featureRef.civMapIsListening) {
      this.featureRef.civMapIsListening = true
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
    this.props.dispatch(updateFeatureInCollection(feature.collectionId, { ...feature, line: positions }))
  }

  onRef = (ref) => {
    if (!ref || !ref.leafletElement) return

    this.featureRef = ref.leafletElement

    // let leaflet internals finish updating before we interact with it
    setTimeout(this.resetEditor, 0)
  }

  render() {
    let { dispatch, editable, feature, baseStyle, highlightStyle, zoomStyle } = this.props
    const { id, collectionId, line } = feature
    const style = calculateFeatureStyle({ feature, baseStyle, highlightStyle, zoomStyle })

    // let leaflet internals finish updating before we interact with it
    setTimeout(this.resetEditor, 0)

    return <RL.Polyline
      ref={this.onRef}
      onclick={() => editable || dispatch(openFeatureDetail(id, collectionId))}
      {...convertStyle(style)}
      positions={!deepCheckValidLine(line) ? [] : centered(deepFlip(line))}
    />
  }
}

function deepCheckValidLine(line) {
  if (Array.isArray(line)) {
    return line.length > 0 && line.every(deepCheckValidLine)
  } else {
    return Number.isFinite(line)
  }
}
