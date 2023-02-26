import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import * as L from 'leaflet'
import * as RL from 'react-leaflet'
import 'leaflet-editable'

import LeafBaseMap from './LeafBaseMap'
import LeafOverlay from './LeafOverlay'

import { equalViewports, setViewport } from '../../store'
import { boundsToContainedCircle, circleToBounds, deepFlip, intCoord } from '../../utils/math'
import { patterns } from '../../utils/presentation'
import Coordinates from './Coordinates'

L.Icon.Default.imagePath = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.1.0/images/'

const mcCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0)
})

class LeafMap extends React.Component {
  constructor(props) {
    super(props)

    this.state = {coords: [0, 0]}
  }

  getChildContext() {
    // TODO this might not fire early enough because we use this.map and not this.state.map
    return { leafMap: this.map }
  }

  componentWillMount() {
    window.onresize = e => {
      // e.target.innerHeight
      if (this.map) this.map.invalidateSize()
    }
  }

  componentWillReceiveProps(newProps) {
    const { viewport } = newProps
    if (viewport !== this.props.viewport) {
      this.checkAndSetView(viewport)
    }
    if (equalViewports(viewport, this.waitingForView)) {
      this.waitingForView = null
    }
  }

  checkAndSetView(view) {
    if (!this.map) return
    if (!view) return
    if (!this.waitingForView) {
      this.map.fitBounds(deepFlip(circleToBounds(view)), { animate: false })
    }
  }

  onRef(ref) {
    if (!ref) return
    const map = ref.leafletElement
    map.invalidateSize()
    if (this.map === map) return
    this.map = map
    for (const pattern of Object.values(patterns)) {
      pattern.addTo(map)
    }
    this.checkAndSetView(this.props.viewport)
  }

  onViewChange(e) {
    const viewport = boundsToContainedCircle(e.target.getBounds())
    this.waitingForView = viewport
    this.props.dispatch(setViewport({ viewport, zoom: e.target.getZoom() }))
  }

  render() {
    const {
      mapBgColor,
    } = this.props
    const [x, z] = this.state.coords

    return <div className="mapContainer full"
      style={{ backgroundColor: mapBgColor }}
    >
      <RL.MapContainer
        className="map"
        ref={this.onRef.bind(this)}
        crs={mcCRS}
        center={[0, 0]}
        zoom={-6}
        maxZoom={5}
        minZoom={-6}
        attributionControl={false}
        zoomControl={false}
        onmoveend={this.onViewChange.bind(this)}
        onzoomend={this.onViewChange.bind(this)}
        editable
      >
        <Coordinates />
        <LeafBaseMap />
        <LeafOverlay />
      </RL.MapContainer>
    </div>
  }
}

const mapStateToProps = ({ control, mapConfig, mapView }) => {
  return {
    mapBgColor: (mapConfig.basemaps[mapView.basemapId] || {}).bgColor,
    viewport: mapView.viewport,
    _appMode: control.appMode, // dummy, only to trigger a re-render
  }
}

export default connect(mapStateToProps)(LeafMap)
