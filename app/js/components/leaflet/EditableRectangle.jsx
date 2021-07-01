import PropTypes from 'prop-types'
import React from 'react'
import * as RL from 'react-leaflet'

import { deepFlip, boundsToRect } from '../../utils/math'
import { calculateFeatureStyle, convertStyle } from '../../utils/presentation'
import { openFeatureDetail, updateFeatureInCollection } from '../../store'

export default class EditableCircle extends React.PureComponent {
  static contextTypes = {
    leafMap: PropTypes.object,
  }

  resetEditor = () => {
    if (!this.featureRef) {
      console.error('trying to set rectangle editing without featureRef')
      return
    }
    if (!this.props.editable) {
      this.featureRef.disableEdit()
      return
    }

    const editor = this.featureRef.enableEdit()
    editor.reset() // TODO only reset when radius/center changed

    if (!this.featureRef.civMapIsListening) {
      this.featureRef.civMapIsListening = true
      this.featureRef.on('editable:drawing:clicked', this.updatePositions)
      this.featureRef.on('editable:vertex:dragend', this.updatePositions)
    }
  }

  updatePositions = (e) => {
    const { feature } = this.props
    const rectangle = boundsToRect(this.featureRef.getBounds())
    this.props.dispatch(updateFeatureInCollection(feature.collectionId, { ...feature, rectangle }))
  }

  onRef(ref) {
    if (!ref || !ref.leafletElement) return

    this.featureRef = ref.leafletElement

    // let leaflet internals finish updating before we interact with it
    setTimeout(this.resetEditor, 0)
  }

  render() {
    let { dispatch, editable, feature, baseStyle, highlightStyle, zoomStyle } = this.props

    const { id, collectionId, rectangle } = feature
    const style = calculateFeatureStyle({ feature, baseStyle, highlightStyle, zoomStyle })

    const valid = validRectangle(rectangle)

    if (!valid) {
      const tempRect = this.context.leafMap.editTools.startRectangle()
      // XXX on react unmount, disable editor and unregister handler
      tempRect.on('editable:drawing:commit', e => {
        const rectangle = boundsToRect(tempRect.getBounds())
        tempRect.remove()
        this.props.dispatch(updateFeatureInCollection(this.props.feature.collectionId, { ...this.props.feature, rectangle }))
      })

      return null
    }

    // let leaflet internals finish updating before we interact with it
    setTimeout(this.resetEditor, 0)

    return <RL.Rectangle
      ref={this.onRef.bind(this)}
      onclick={() => editable || dispatch(openFeatureDetail(id, collectionId))}
      {...convertStyle(style)}
      bounds={!valid ? [[1,2],[3,4]] : deepFlip(rectangle)}
    />
  }
}

function validRectangle(rectangle) {
  return Array.isArray(rectangle)
      && rectangle.length === 2
      && Array.isArray(rectangle[0])
      && rectangle[0].length === 2
      && Array.isArray(rectangle[1])
      && rectangle[1].length === 2
}
