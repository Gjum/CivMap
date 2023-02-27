import PropTypes from 'prop-types'
import React from 'react'
import { connect, DispatchProp } from 'react-redux'
import * as L from 'leaflet'
import * as RL from 'react-leaflet'
import 'leaflet-editable'

import LeafBaseMap from './LeafBaseMap'
import LeafOverlay from './LeafOverlay'

import { equalViewports, RootState, setViewport } from '../../store'
import { boundsToContainedCircle, Circle, circleToBounds, deepFlip, intCoord } from '../../utils/math'
import { patterns } from '../../utils/presentation'
import Coordinates from './Coordinates'
import AddFab from './AddFab'

L.Icon.Default.imagePath = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.1.0/images/'

const mcCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0)
})

class LeafMap extends React.Component<DispatchProp & ReturnType<typeof mapStateToProps>> {
  map: L.Map | null
  waitingForView: Circle

  constructor(props) {
    super(props)

    this.map = null
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

  whenCreated(ref: L.Map | null) {
    const map = ref
    map?.invalidateSize()
    if (this.map === map) return
    this.map = map
    for (const pattern of Object.values(patterns)) {
      pattern.addTo(map)
    }
    this.checkAndSetView(this.props.viewport)
  }

  onViewChange(event: L.LeafletEvent) {
    const viewport = boundsToContainedCircle(event.target.getBounds())
    this.waitingForView = viewport
    this.props.dispatch(setViewport({ viewport, zoom: event.target.getZoom() }))
  }

  render() {
    const { mapBgColor } = this.props

    return <div className="mapContainer full" style={{ backgroundColor: mapBgColor }}>
      <RL.MapContainer
        className="map"
        whenCreated={this.whenCreated.bind(this)}
        crs={mcCRS}
        center={[0, 0]}
        zoom={-6}
        maxZoom={5}
        minZoom={-6}
        attributionControl={false}
        zoomControl={false}
        editable
      >
        <RL.MapConsumer>
          {(map) => {
            map.on("moveend", (event) => this.onViewChange(event))
            map.on("zoomend", (event) => this.onViewChange(event))
            return null
          }}
        </RL.MapConsumer>
        <AddFab />
        <Coordinates />
        <LeafBaseMap />
        <LeafOverlay />
      </RL.MapContainer>
    </div>
  }
}

const mapStateToProps = ({ mapConfig, mapView }: RootState) => {
  return {
    mapBgColor: (mapConfig.basemaps[mapView.basemapId] || {}).bgColor,
    viewport: mapView.viewport,
  }
}

export default connect(mapStateToProps)(LeafMap)
