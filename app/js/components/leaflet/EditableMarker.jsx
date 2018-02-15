import React from 'react'
import * as RL from 'react-leaflet'

import { openFeatureDetail, updateFeature } from '../../store'

export default class EditableMarker extends React.PureComponent {
  startEditing() {
    const editor = this.featureRef.enableEdit()
    editor.reset()

    const { feature } = this.props
    if (!feature.geometry.position) {
      // XXX add on click, show "click on map" prompt/tooltip, change cursor
      editor.startMarker()
    }

    if (!this.isListening) {
      this.isListening = true
      this.featureRef.on('editable:dragend', this.updatePositions.bind(this))
    }
  }

  stopEditing() {
    this.featureRef.disableEdit()
  }

  updatePositions(e) {
    const { lat, lng } = this.featureRef.getLatLng()
    const { feature } = this.props
    const geometry = { ...feature.geometry, position: [parseInt(lat), parseInt(lng)] }
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
    if (!geometry.position) {
      geometry.position = [0,0] // XXX get map center from passed-through props
    }
    const [z, x] = geometry.position

    return <RL.Marker
      ref={this.onRef.bind(this)}
      onclick={() => editable || dispatch(openFeatureDetail(id))}
      {...style}
      position={[z + .5, x + .5]}
      title={feature.properties.name}
    />
  }
}
