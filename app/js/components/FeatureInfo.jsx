import React from 'react'
import { connect } from 'react-redux'

import IconButton from 'material-ui/IconButton'

import CloseIcon from 'material-ui-icons/Close'
import ShareIcon from 'material-ui-icons/Share'

import { removeFeature } from '../actions'

const FeatureInfo = ({
  feature,
}) => {
  return (
    <div>
      <h1>{feature.properties.name}</h1>
      ({feature.geometry.type})
      <pre>{JSON.stringify(feature, null, '  ')}</pre>
    </div>
  )
}

const mapStateToProps = ({ overlay, control }) => {
  const { featureId, layerId } = control
  const layer = overlay.find(layer => layer.id === layerId)
  const feature = layer.features.find(feature => feature.id === featureId)
  // TODO this is slow and happens often, store features by id in separate map
  return {
    feature,
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(FeatureInfo)
