import React from 'react'
import { connect } from 'react-redux'

import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import Tooltip from 'material-ui/Tooltip'

import CloseIcon from 'material-ui-icons/Close'
import ShareIcon from 'material-ui-icons/Share'

import { openLayerEditor, removeFeature } from '../../actions'
import { setMapView } from '../../store'
import { circleBoundsFromFeatureGeometry } from '../../utils/Math'

const FeatureInfo = ({
  feature,
  openLayerEditor, // XXX go back to feature's layer
  removeFeature,
  setMapView,
}) => {
  const circleBounds = circleBoundsFromFeatureGeometry(feature.geometry)
  return (
    <div>
      <h1>{feature.properties.name}</h1>
      <Tooltip title="Search">
        <Button raised dense
        onClick={() => setMapView(circleBounds)}
        >Show on map</Button>
      </Tooltip>
      ({feature.geometry.type})
      <pre>{JSON.stringify(feature, null, '  ')}</pre>
    </div>
  )
}

const mapStateToProps = ({ features, control }) => {
  return {
    feature: features[control.featureId],
  }
}

const mapDispatchToProps = {
  openLayerEditor,
  removeFeature,
  setMapView,
}

export default connect(mapStateToProps, mapDispatchToProps)(FeatureInfo)
