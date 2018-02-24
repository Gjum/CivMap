import PropTypes from 'prop-types'
import React from 'react'
import * as RL from 'react-leaflet'

import { intCoords } from '../../utils/math'
import { openFeatureDetail, updateFeature } from '../../store'

export default class EditableCircle extends React.PureComponent {
  static contextTypes = {
    leafMap: PropTypes.object,
  }

  resetEditor = () => {
    const editor = this.featureRef.enableEdit()
    editor.reset() // TODO only reset when radius/center changed

    if (!this.featureRef) {
      console.error('trying to set circle editing without featureRef')
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
      this.featureRef.on('editable:drawing:clicked', this.updatePositions)
      this.featureRef.on('editable:vertex:dragend', this.updatePositions)
    }
  }

  updatePositions = (e) => {
    const { feature } = this.props
    const geometry = {
      ...feature.geometry,
      center: intCoords(this.featureRef.getLatLng()),
      radius: Math.round(this.featureRef.getRadius()),
    }
    this.props.dispatch(updateFeature({ ...feature, geometry }))
  }

  onRef(ref) {
    if (!ref || !ref.leafletElement) return

    this.featureRef = ref.leafletElement

    // let leaflet internals finish updating before we interact with it
    setTimeout(this.resetEditor, 0)
  }

  render() {
    let { feature, dispatch, editable } = this.props
    editable = false // TODO fix radius marker projection

    const { id, geometry, style } = feature
    if (!geometry.center) {
      const tempCircle = this.context.leafMap.editTools.startCircle()
      tempCircle.on('editable:vertex:dragend', e => {
        const { feature } = this.props
        const geometry = {
          ...feature.geometry,
          center: intCoords(tempCircle.getLatLng()),
          radius: Math.round(tempCircle.getRadius()),
        }
        tempCircle.remove()
        this.props.dispatch(updateFeature({ ...feature, geometry }))
      })

      return null
    }

    // let leaflet internals finish updating before we interact with it
    setTimeout(this.resetEditor, 0)

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
