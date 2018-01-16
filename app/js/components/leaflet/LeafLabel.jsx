import React from 'react'
import * as L from 'leaflet'
import * as RL from 'react-leaflet'

// TODO label data: position, offset, direction, text (lines?)
// atm: centered, auto-wrapped with css

export default class LeafLabel extends React.Component {
  componentWillMount() {
    this.recreateLabel(this.props)
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.text === this.props.text) return
    this.recreateLabel(nextProps)
  }

  recreateLabel(props) {
    const html = '<span class="leaflabel-text">' + props.text + '</span>'
    // TODO set props.brightMap depending on basemap bg color
    const colorClass = props.brightMap ? 'leaflabel-black' : 'leaflabel-white'
    this.label = L.divIcon({
      className: 'leaflabel ' + colorClass,
      html,
      iconSize: [100, 100], // TODO arbitrary
    })
  }

  render() {
    return <RL.Marker
      onclick={this.props.onclick}
      icon={this.label}
      position={this.props.position}
    />
  }
}
