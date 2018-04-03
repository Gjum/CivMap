import * as L from 'leaflet'
import PropTypes from 'prop-types'
import React from 'react'
import * as RL from 'react-leaflet'

import { applyFilterOverrides } from '../../utils/filters'
import { intCoords } from '../../utils/math'
import { openFeatureDetail, updateFeature } from '../../store'

function createIcon(props) {
  let { feature, filter: { overrides } } = props
  feature = applyFilterOverrides({ feature, overrides })

  const { circle_marker, icon_url } = feature.style || {}

  if (icon_url) {
    return L.icon({
      iconUrl: icon_url,
      iconSize: [16, 16], // TODO from style
      // iconAnchor: [0, 0], // TODO from style
    })
  } else if (circle_marker) {
    // TODO implement all other Path styles
    let { color, fillColor, radius = 5, weight = 0, fillOpacity = .5 } = circle_marker
    if (!color) color = feature.color
    if (!color) color = '#000000'
    if (!fillColor) fillColor = color

    const width = 2 * radius
    let htmlStyle = `width:${width}px;height:${width}px;`
    htmlStyle += `border:${weight}px solid ${color};background-color:${fillColor};`
    return L.divIcon({
      className: 'leafmarker-circleicon',
      html: `<div class="leafmarker-circleicon-circle" style="${htmlStyle}" />`,
      iconSize: [width, width],
    })
  }
  else return null
}

export default class EditableMarker extends React.PureComponent {
  static contextTypes = {
    leafMap: PropTypes.object,
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.feature.style
      !== this.props.feature.style) {
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
    const [z, x] = intCoords(this.featureRef.getLatLng())
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
    const { dispatch, editable, feature, filter } = this.props
    const { overrides } = filter
    const { id, x, z, style = {} } = applyFilterOverrides({ feature, overrides })

    if (x === null || z === null) {
      const tempMarker = this.context.leafMap.editTools.startMarker()
      tempMarker.on('editable:drawing:clicked', e => {
        const [z, x] = intCoords(tempMarker.getLatLng())
        tempMarker.remove()
        this.props.dispatch(updateFeature({ ...this.props.feature, x, z }))
      })

      return null
    }

    // let leaflet internals finish updating before we interact with it
    setTimeout(this.resetEditor, 0)

    if (!this.icon) this.icon = createIcon(this.props)

    if (this.icon) return <RL.Marker
      ref={this.onRef.bind(this)}
      onclick={() => editable || dispatch(openFeatureDetail(id))}
      {...style}
      position={[z + .5, x + .5]}
      icon={this.icon}
    />
    return <RL.Marker
      ref={this.onRef.bind(this)}
      onclick={() => editable || dispatch(openFeatureDetail(id))}
      {...style}
      position={[z + .5, x + .5]}
    />
  }
}
