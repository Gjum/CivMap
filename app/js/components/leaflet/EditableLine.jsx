import React from 'react'
import * as RL from 'react-leaflet'

import { centered, deepLatLngToArr } from '../../utils/math'
import { openEditMode, openFeatureDetail, updateFeature } from '../../store'

export default class EditableLine extends React.PureComponent {

  setupEditing() {
    const positions = this.props.feature.geometry.positions
    if (!positions || positions.length <= 0) {
      this.featureRef.editor.newShape()
    }
    else {
      this.featureRef.editor.disable() // continueForward() is no-op (or broken) while editing
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
    const positions = deepLatLngToArr(this.featureRef.getLatLngs())
    // TODO ignore updates that only add 1-point segments
    const { feature } = this.props
    const geometry = { ...feature.geometry, positions }
    this.props.dispatch(updateFeature({ ...feature, geometry }))
  }

  onRef = (ref) => {
    if (!ref || !ref.leafletElement) return

    this.featureRef = ref.leafletElement

    // let leaflet-edit internals finish init'ing before we interact with it
    setTimeout(() => {
      if (this.props.editable) {
        const editor = this.featureRef.enableEdit()
        this.setupEditing()
        this.featureRef.editor.reset()
      } else {
        this.featureRef.disableEdit()
      }
    }, 0)
  }

  render() {
    const { feature, dispatch, editable } = this.props
    const { id, geometry, style } = feature

    return <RL.Polyline
      ref={this.onRef}
      onclick={() => editable || dispatch(openFeatureDetail(id))}
      {...style}
      positions={!geometry.positions ? [] : centered(geometry.positions)}
    />
  }
}
