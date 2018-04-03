import PropTypes from 'prop-types'
import React from 'react'
import * as RL from 'react-leaflet'

import { applyFilterOverrides } from '../../utils/filters'
import { intCoords, intCoord } from '../../utils/math'
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
    const [z, x] = intCoords(this.featureRef.getLatLng())
    const radius = Math.round(this.featureRef.getRadius())
    this.props.dispatch(updateFeature({ ...feature, x, z, radius }))
  }

  onRef(ref) {
    if (!ref || !ref.leafletElement) return

    this.featureRef = ref.leafletElement

    // let leaflet internals finish updating before we interact with it
    setTimeout(this.resetEditor, 0)
  }

  render() {
    let { dispatch, editable, feature, filter: { overrides } } = this.props
    editable = false // TODO fix radius marker projection

    const { id, x, z, radius, style = {} } = applyFilterOverrides({ feature, overrides })

    if (!radius) {
      const tempCircle = this.context.leafMap.editTools.startCircle()
      tempCircle.on('editable:vertex:dragend', e => {
        const [zNew, xNew] = intCoords(tempCircle.getLatLng())
        const radiusNew = Math.round(tempCircle.getRadius())
        tempCircle.remove()
        this.props.dispatch(updateFeature({ ...this.props.feature, xNew, zNew, radiusNew }))
      })

      return null
    }

    // let leaflet internals finish updating before we interact with it
    setTimeout(this.resetEditor, 0)

    return <RL.Circle
      ref={this.onRef.bind(this)}
      onclick={() => editable || dispatch(openFeatureDetail(id))}
      {...style}
      center={[z + .5, x + .5]}
      radius={radius}
    />
  }
}
