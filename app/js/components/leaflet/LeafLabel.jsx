import React from 'react'
import * as RL from 'react-leaflet';

// TODO label data: coords, offset, direction, text (lines?)
// atm: centered, auto-wrapped (needs css)

export class LeafLabel extends React.Component {
  componentWillMount() {
    this.recreateLabel(this.props)
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.text === this.props.text) return
    this.recreateLabel(nextProps)
  }

  recreateLabel(props) {
    this.label = L.divIcon({
      className: 'leaflabel',
      html: props.text,
      iconSize: [200, 200], // XXX
    })
  }

  render() {
    return <RL.Marker
      icon={this.label}
      position={this.props.coords}
    />
  }
}
