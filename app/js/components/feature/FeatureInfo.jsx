import React from 'react'
import { connect } from 'react-redux'

import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'

import DeleteIcon from 'material-ui-icons/Delete' // TODO delete feature
import ShareIcon from 'material-ui-icons/Share'

import { openLayerDetail, removeFeature, setViewport } from '../../store'
import { circleBoundsFromFeatureGeometry } from '../../utils/math'

const FeatureInfo = ({
  feature,
  openLayerDetail, // TODO go back to feature's layer
  removeFeature,
  setViewport,
}) => {
  const circleBounds = circleBoundsFromFeatureGeometry(feature.geometry)
  return <div>
    <h1>{feature.properties.name}</h1>
    <Button raised dense onClick={() => setViewport(circleBounds)}>
      Show on map
      </Button>
    ({feature.geometry.type})
      <pre>{JSON.stringify(feature, null, '  ')}</pre>
  </div>
}

const mapStateToProps = ({ features, control }) => {
  return {
    feature: features[control.featureId],
  }
}

const mapDispatchToProps = {
  openLayerDetail,
  removeFeature,
  setViewport,
}

export default connect(mapStateToProps, mapDispatchToProps)(FeatureInfo)
