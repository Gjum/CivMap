import * as L from 'leaflet'
import PropTypes from 'prop-types'
import React from 'react'
import * as RL from 'react-leaflet'

import { intCoords } from '../../utils/math'
import { calculateFeatureStyle } from '../../utils/presentation'
import { openFeatureDetail, updateFeatureInCollection } from '../../store'

function createIcon({ feature, style }) {
  let { color, fill_opacity = 1, icon, icon_size, opacity, stroke_color, stroke_width = 1 } = style
  icon = icon || feature.icon

  if ((icon + '').startsWith('http') || (icon + '').startsWith('/')) {
    if (!icon_size) icon_size = 32
    return L.icon({
      iconUrl: icon,
      iconSize: [icon_size, icon_size],
      // iconAnchor: [icon_anchor_x, icon_anchor_y], // TODO from style, only if both are set
    })
  } else {
    if (!stroke_color) stroke_color = style.color
    if (!stroke_color) stroke_color = '#000000'
    if (!color) color = '#aaaaaa'
    if (!icon_size) icon_size = 14

    // TODO stroke/fill opacity
    if (fill_opacity <= 0) color = 'none'

    let htmlStyle = `width:${icon_size}px;height:${icon_size}px;`
    htmlStyle += `border:${stroke_width}px solid ${stroke_color};background-color:${color};`
    return L.divIcon({
      className: 'leafmarker-circleicon',
      html: `<div class="leafmarker-circleicon-circle" style="${htmlStyle}" />`,
      iconSize: [icon_size, icon_size],
    })
  }
}

export default class EditableMarker extends React.PureComponent {
  static contextTypes = {
    leafMap: PropTypes.object,
  }

  componentWillUpdate(nextProps, nextState) {
    for (const propKey of ['feature', 'baseStyle', 'highlightStyle', 'zoomStyle']) {
      if (nextProps[propKey] !== this.props[propKey]) {
        this.icon = null
        break
      }
    }
  }

  resetEditor = () => {
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
    const [x, z] = intCoords(this.featureRef.getLatLng())
    const { feature } = this.props
    this.props.dispatch(updateFeatureInCollection(feature.collectionId, { ...feature, x, z }))
  }

  onRef(ref) {
    if (!ref || !ref.leafletElement) return

    this.featureRef = ref.leafletElement

    // let leaflet internals finish updating before we interact with it
    setTimeout(this.resetEditor, 0)
  }

  render() {
    const { dispatch, editable, feature, baseStyle, highlightStyle, zoomStyle } = this.props
    const { id, collectionId, x, z } = feature
    const style = calculateFeatureStyle({ feature, baseStyle, highlightStyle, zoomStyle })

    if (x === null || z === null) {
      const tempMarker = this.context.leafMap.editTools.startMarker()
      // XXX on react unmount, disable editor and unregister handler
      tempMarker.on('editable:drawing:clicked', e => {
        const [x, z] = intCoords(tempMarker.getLatLng())
        tempMarker.remove()
        this.props.dispatch(updateFeatureInCollection(this.props.feature.collectionId, { ...this.props.feature, x, z }))
      })

      return null
    }

    // let leaflet internals finish updating before we interact with it
    setTimeout(this.resetEditor, 0)

    if (!this.icon) this.icon = createIcon({ feature, style })

    if (this.icon) return <RL.Marker
      ref={this.onRef.bind(this)}
      onclick={() => editable || dispatch(openFeatureDetail(id, collectionId))}
      position={[z + .5, x + .5]}
      icon={this.icon}
    />
    return <RL.Marker
      ref={this.onRef.bind(this)}
      onclick={() => editable || dispatch(openFeatureDetail(id, collectionId))}
      position={[z + .5, x + .5]}
    />
  }
}
