import * as L from 'leaflet'
import PropTypes from 'prop-types'
import React from 'react'
import * as RL from 'react-leaflet'

import { intCoords } from '../../utils/math'
import { openFeatureDetail, updateFeature } from '../../store'

export default class PassiveLabel extends React.PureComponent {
  static contextTypes = {
    leafMap: PropTypes.object,
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.feature.properties.label
      !== this.props.feature.properties.label
      || nextProps.feature.style.label
      !== this.props.feature.style.label) {
      this.icon = null
    }
  }

  recreateLabel(props) {
    this.icon = null

    const { properties, style } = props.feature

    if (properties.label && style.label) {
      // TODO label font size, width/height,
      const { align = 'bottom-left', offset = [0, 0] } = style.label
      const [alignY, alignX] = align.split('-')
      const [offsetX, offsetY] = offset
      const htmlStyle = `${alignX}: ${offsetX}px; ${alignY}: ${offsetY}px;`
      const html = `<span class="leaflabel-text" style="${htmlStyle}">${properties.label}</span>`
      this.icon = L.divIcon({
        className: 'leaflabel',
        html,
        iconSize: [0, 0],
      })
    }
  }

  render() {
    const { geometry, properties, style } = this.props.feature
    if (!this.icon) this.recreateLabel(this.props)

    const [z, x] = geometry.position // TODO get from feature: fixed/relative/auto

    return <RL.Marker
      position={[z + .5, x + .5]}
      icon={this.icon}
    />
  }
}
