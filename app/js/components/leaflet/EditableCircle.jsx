import React from 'react'
import * as RL from 'react-leaflet'

import { openFeatureDetail, updateFeature } from '../../store'

export default class EditableMarker extends React.PureComponent {
  startEditing() {
    const editor = this.featureRef.enableEdit()
    editor.reset()

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
    const { lat, lng } = this.featureRef.getLatLng()
    const { feature } = this.props
    const geometry = {
      ...feature.geometry,
      center: [parseInt(lat), parseInt(lng)],
      radius: this.featureRef.getRadius(),
    }
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
    const [z, x] = geometry.center

    return <RL.Circle
      ref={this.onRef.bind(this)}
      onclick={() => editable || dispatch(openFeatureDetail(id))}
      {...style}
      center={[z + .5, x + .5]}
      radius={geometry.radius}
    />
  }
}
