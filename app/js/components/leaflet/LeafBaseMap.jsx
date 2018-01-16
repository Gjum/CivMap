import React from 'react'
import { connect } from 'react-redux'
import * as L from 'leaflet'
import * as RL from 'react-leaflet'

const LeafBaseMap = ({
  borderApothem,
  tilesRoot,
  basemapId,
}) => {
  if (!basemapId) return null
  const tileBounds = [[-borderApothem, -borderApothem], [borderApothem, borderApothem]]
  return <RL.TileLayer
    url={tilesRoot + basemapId + '/z{z}/{x},{y}.png'}
    errorTileUrl={'data:image/gifbase64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}
    tileSize={256}
    bounds={tileBounds}
    minZoom={-6}
    maxNativeZoom={0}
    continuousWorld={true}
  />
}

const mapStateToProps = ({ mapConfig, mapView }, ownProps) => {
  const { tilesRoot, borderApothem } = mapConfig
  return { tilesRoot, borderApothem, basemapId: mapView.basemapId }
}

export default connect(mapStateToProps)(LeafBaseMap)
