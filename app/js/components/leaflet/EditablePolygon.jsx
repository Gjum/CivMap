import React from 'react'
import * as RL from 'react-leaflet'

import { centered, deepLatLngToArr } from '../../utils/math'
import { openEditMode, openFeatureDetail, updateFeature } from '../../store'

export default class EditableLine extends React.PureComponent {
  startEditing() {
    const editor = this.featureRef.enableEdit()
    editor.reset()

    if (this.props.feature.geometry.positions.length <= 0) {
      this.featureRef.editor.newShape()
    }

    if (!this.isListening) {
      this.isListening = true
      this.featureRef.on('editable:drawing:clicked', this.updatePositions.bind(this))
      this.featureRef.on('editable:vertex:dragend', this.updatePositions.bind(this))
      this.featureRef.on('editable:vertex:deleted', this.updatePositions.bind(this))
    }
  }

  stopEditing() {
    this.featureRef.disableEdit()
  }

  updatePositions(e) {
    const positions = deepLatLngToArr(this.featureRef.getLatLngs())
    const { feature } = this.props
    const geometry = { ...feature.geometry, positions }
    this.props.dispatch(updateFeature({ ...feature, geometry }))
  }

  onRef(ref) {
    if (!ref || !ref.leafletElement) return

    this.featureRef = ref.leafletElement

    setTimeout(() => {
      if (this.props.editable) {
        this.startEditing()
      } else {
        this.stopEditing()
      }
    }, 0)
  }

  render() {
    const { feature, dispatch, editable } = this.props
    const { id, geometry, style } = feature

    return <RL.Polygon
      ref={this.onRef.bind(this)}
      onclick={() => editable || dispatch(openFeatureDetail(id))}
      {...style}
      positions={centered(geometry.positions)}
    />
  }
}
