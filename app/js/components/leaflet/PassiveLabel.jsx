import * as L from 'leaflet'
import PropTypes from 'prop-types'
import React from 'react'
import * as RL from 'react-leaflet'

import { lookupStyle } from '../../utils/presentation'

function firstCenter(positions) {
  while (Array.isArray(positions[0][0])) {
    positions = positions[0]
  }
  const xmin = positions.map(a => a[0]).reduce((a, b) => Math.min(a, b))
  const xmax = positions.map(a => a[0]).reduce((a, b) => Math.max(a, b))
  const zmin = positions.map(a => a[1]).reduce((a, b) => Math.min(a, b))
  const zmax = positions.map(a => a[1]).reduce((a, b) => Math.max(a, b))
  return [(xmax + xmin) / 2, (zmax + zmin) / 2]
}

export default class PassiveLabel extends React.PureComponent {
  static contextTypes = {
    leafMap: PropTypes.object,
  }

  componentWillUpdate(nextProps, nextState) {
    // TODO also check if label placement is different
    for (const propKey of ['feature', 'baseStyle', 'highlightStyle', 'zoomStyle']) {
      if (nextProps[propKey] !== this.props[propKey]) {
        this.icon = null
        break
      }
    }
  }

  recreateLabel({ feature, baseStyle, highlightStyle, zoomStyle }) {
    this.icon = null

    // TODO configurable label font size, color, positioning, rotation, ...
    // TODO get offset from marker size

    let labelText = lookupStyle("label", { feature, baseStyle, highlightStyle, zoomStyle }, feature.name)
    if (!labelText) return
    labelText = (labelText + '').replace(/\n/g, "<br />")

    this.icon = L.divIcon({
      className: 'leaflabel',
      html: labelText,
      iconSize: [200, 100],
      iconAnchor: [100, (feature.polygon || (feature.radius !== undefined)) ? 0 : -10],
    })
  }

  render() {
    if (!this.icon) this.recreateLabel(this.props)
    if (!this.icon) {
      console.error(`Could not render label for ${this.props.feature.name} (${this.props.feature.id})`)
      return null
    }

    const { feature } = this.props

    let { x, z } = feature
    if (feature.polygon && x === undefined && z === undefined) {
      [x, z] = firstCenter(feature.polygon)
    }

    return <RL.Marker
      position={[z + .5, x + .5]}
      icon={this.icon}
    />
  }
}
