import * as L from 'leaflet'
import PropTypes from 'prop-types'
import React from 'react'
import * as RL from 'react-leaflet'

import { intCoords } from '../../utils/math'
import { calculateFeatureStyle } from '../../utils/presentation'
import { openFeatureDetail, updateFeature } from '../../store'

function createIcon({ feature, style }) {
  const { icon } = style

  if (icon && icon.startsWith('http')) {
    // TODO icons from url
    return L.icon({
      iconUrl: icon,
      iconSize: [16, 16], // TODO from style
      // iconAnchor: [0, 0], // TODO from style
    })
  } else {
    // TODO implement all other Path styles
    let { color, fill_opacity = 1, icon_size = 14, opacity, stroke_color, stroke_width = 1 } = style
    if (!stroke_color) stroke_color = style.color
    if (!stroke_color) stroke_color = '#000000'
    if (!color) color = '#aaaaaa'

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
    if (nextProps.feature !== this.props.feature
      || nextProps.baseStyle !== this.props.baseStyle
      || nextProps.zoomStyle !== this.props.zoomStyle) {
      this.icon = null
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
    this.props.dispatch(updateFeature({ ...feature, x, z }))
  }

  onRef(ref) {
    if (!ref || !ref.leafletElement) return

    this.featureRef = ref.leafletElement

    // let leaflet internals finish updating before we interact with it
    setTimeout(this.resetEditor, 0)
  }

  render() {
    const { dispatch, editable, feature, baseStyle, zoomStyle } = this.props
    const { id, x, z } = feature
    const style = calculateFeatureStyle({ feature, baseStyle, zoomStyle })

    if (x === null || z === null) {
      const tempMarker = this.context.leafMap.editTools.startMarker()
      tempMarker.on('editable:drawing:clicked', e => {
        const [x, z] = intCoords(tempMarker.getLatLng())
        tempMarker.remove()
        this.props.dispatch(updateFeature({ ...this.props.feature, x, z }))
      })

      return null
    }

    // let leaflet internals finish updating before we interact with it
    setTimeout(this.resetEditor, 0)

    if (!this.icon) this.icon = createIcon({ feature, style })

    if (this.icon) return <RL.Marker
      ref={this.onRef.bind(this)}
      onclick={() => editable || dispatch(openFeatureDetail(id))}
      position={[z + .5, x + .5]}
      icon={this.icon}
    />
    return <RL.Marker
      ref={this.onRef.bind(this)}
      onclick={() => editable || dispatch(openFeatureDetail(id))}
      position={[z + .5, x + .5]}
    />
  }
}
