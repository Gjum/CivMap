import PropTypes from 'prop-types'
import React from 'react'
import * as RL from 'react-leaflet'

import { intCoords, intCoord } from '../../utils/math'
import { calculateFeatureStyle, convertStyle } from '../../utils/presentation'
import { openFeature, updateFeatureInCollection } from '../../store'
import { EditableProps } from './EditableThing'
import { Circle, CircleEditor, LeafletEvent } from 'leaflet'

export default class EditableCircle extends React.PureComponent<EditableProps> {
  featureRef: L.Circle | null

  constructor(props) {
    super(props)

    this.featureRef = null
  }

  resetEditor = () => {
    if (!this.featureRef) {
      console.error('trying to set circle editing without featureRef')
      return
    }
    
    if (!this.props.editable) {
      this.featureRef.disableEdit()
      return
    }

    const editor = this.featureRef.enableEdit() as CircleEditor
    editor.reset() // TODO only reset when radius/center changed
  }

  updatePositions = (e: LeafletEvent) => {
    const { feature } = this.props
    const [x, z] = intCoords(this.featureRef.getLatLng())
    const radius = Math.round(this.featureRef.getRadius())
    // this.props.dispatch(updateFeatureInCollection({ ...feature, x, z, radius }))
  }

  onRef(ref: Circle | null) {
    this.featureRef = ref
    if (ref) {
      this.featureRef.on('editable:drawing:clicked', this.updatePositions)
      this.featureRef.on('editable:vertex:dragend', this.updatePositions)
    }

    // let leaflet internals finish updating before we interact with it
    setTimeout(this.resetEditor, 0)
  }

  render() {
    return <RL.MapConsumer>
      {(map) => {
        let { dispatch, editable, feature, baseStyle, highlightStyle, zoomStyle } = this.props
        editable = false // TODO fix radius marker projection
    
        const { id, collectionId, x, z, radius } = feature
        const style = calculateFeatureStyle({ feature, baseStyle, highlightStyle, zoomStyle })
    
        if (!radius) {
          const tempCircle = map.editTools.startCircle()
          // XXX on react unmount, disable editor and unregister handler
          tempCircle.on('editable:vertex:dragend', e => {
            const [zNew, xNew] = intCoords(tempCircle.getLatLng())
            const radiusNew = Math.round(tempCircle.getRadius())
            tempCircle.remove()
            this.props.dispatch(updateFeatureInCollection(this.props.feature.collectionId, { ...this.props.feature, xNew, zNew, radiusNew }))
          })
    
          return null
        }
    
        // let leaflet internals finish updating before we interact with it
        setTimeout(this.resetEditor, 0)
    
        return <RL.Circle
          ref={this.onRef.bind(this)}
          eventHandlers={{
            click: () => {
              if (!editable) {
                dispatch(openFeature(id, collectionId))
              }
            }
          }}
          {...convertStyle(style)}
          center={[z + .5, x + .5]}
          radius={radius}
        />
      }}
    </RL.MapConsumer>
  }
}
