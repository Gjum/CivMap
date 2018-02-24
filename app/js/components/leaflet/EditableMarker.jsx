import PropTypes from 'prop-types'
import React from 'react'
import * as RL from 'react-leaflet'

import { intCoords } from '../../utils/math'
import { openFeatureDetail, updateFeature } from '../../store'

export default class EditableMarker extends React.PureComponent {
  static contextTypes = {
    leafMap: PropTypes.object,
  }

  resetEditor = () => {
    const editor = this.featureRef.enableEdit()
    editor.reset()

    if (!this.featureRef) {
      console.error('trying to set marker editing without featureRef')
      return
    }
    if (!this.props.editable) {
      this.featureRef.disableEdit()
      return
    }

    this.featureRef.enableEdit() // create editor
    this.featureRef.editor.reset()

    if (!this.featureRef.civMapIsListening) {
      this.featureRef.civMapIsListening = true
      this.featureRef.on('editable:dragend', this.updatePositions)
    }
  }

  updatePositions = (e) => {
    const { feature } = this.props
    const geometry = { ...feature.geometry, position: intCoords(this.featureRef.getLatLng()) }
    this.props.dispatch(updateFeature({ ...feature, geometry }))
  }

  onRef(ref) {
    if (!ref || !ref.leafletElement) return

    this.featureRef = ref.leafletElement

    // let leaflet internals finish updating before we interact with it
    setTimeout(this.resetEditor, 0)
  }

  render() {
    const { feature, dispatch, editable } = this.props
    const { id, geometry, style } = feature
    if (!geometry.position) {
      const tempMarker = this.context.leafMap.editTools.startMarker()
      tempMarker.on('editable:drawing:clicked', e => {
        const { feature } = this.props
        const geometry = { ...feature.geometry, position: intCoords(tempMarker.getLatLng()) }
        tempMarker.remove()
        this.props.dispatch(updateFeature({ ...feature, geometry }))
      })

      return null
    }

    // let leaflet internals finish updating before we interact with it
    setTimeout(this.resetEditor, 0)

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
