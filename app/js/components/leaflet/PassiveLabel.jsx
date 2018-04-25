import * as L from 'leaflet'
import PropTypes from 'prop-types'
import React from 'react'
import * as RL from 'react-leaflet'

import { applyFilterOverrides } from '../../utils/filters'
import { intCoords } from '../../utils/math'
import { openFeatureDetail, updateFeature } from '../../store'

export default class PassiveLabel extends React.PureComponent {
  static contextTypes = {
    leafMap: PropTypes.object,
  }

  componentWillUpdate(nextProps, nextState) {
    // TODO also check if label placement is different
    if (nextProps.feature.label !== this.props.feature.label
      || nextProps.feature.name !== this.props.feature.name) {
      this.icon = null
    }
  }

  recreateLabel({ feature, filter: { overrides } }) {
    this.icon = null

    feature = applyFilterOverrides({ feature, overrides })

    if (!feature.label && !feature.name) return

    const labelText = feature.label || feature.name
    // TODO configurable label font size, color, positioning, rotation, ...
    // TODO get offset from marker size
    this.icon = L.divIcon({
      className: 'leaflabel',
      html: labelText,
      iconSize: [200, 100],
      iconAnchor: [100, -10],
    })
  }

  render() {
    if (!this.icon) this.recreateLabel(this.props)
    if (!this.icon) {
      console.error(`Could not render label for ${this.props.feature.name} (${this.props.feature.id})`)
      return null
    }

    const { feature, filter: { overrides } } = this.props
    const { x, z } = applyFilterOverrides({ feature, overrides })

    return <RL.Marker
      position={[z + .5, x + .5]}
      icon={this.icon}
    />
  }
}
