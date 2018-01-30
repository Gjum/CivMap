import React from 'react'
import { connect } from 'react-redux'

import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'

import DeleteIcon from 'material-ui-icons/Delete'
import ResetIcon from 'material-ui-icons/Undo'
import SaveIcon from 'material-ui-icons/Check'
import LayersIcon from 'material-ui-icons/Layers'

import { openBrowseMode, openFeatureDetail, openLayerDetail, removeFeature, updateFeature } from '../../store'

const FeatureProps = ({ featureProps }) => {
  // TODO list of key-value text fields
  return <div>
    TODO edit properties here
  </div>
}

class EditFrame extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      originalFeature: props.feature,
    }
  }

  render() {
    const { feature,
      openBrowseMode,
      openFeatureDetail,
      removeFeature,
      updateFeature,
    } = this.props

    return <div>
      <div style={{ margin: '16px' }}>

        <Button raised onClick={() => {
          openFeatureDetail(feature.id)
        }}>
          <SaveIcon />
          Save
      </Button>

        <Button raised onClick={() => {
          updateFeature(this.state.originalFeature)
        }}>
          <ResetIcon />
          Reset
      </Button>

        <Button raised onClick={() => {
          removeFeature(feature.id)
          openBrowseMode() // TODO show layer instead
        }}>
          <DeleteIcon />
          Delete
      </Button>

      </div>

      <FeatureProps featureProps={feature.properties} />
    </div>
  }
}

const mapStateToProps = ({ features, control }) => {
  return {
    feature: features[control.editFeatureId],
    prevLayerId: control.layerId,
  }
}

const mapDispatchToProps = {
  openBrowseMode,
  openFeatureDetail,
  removeFeature,
  updateFeature,
}

export default connect(mapStateToProps, mapDispatchToProps)(EditFrame)
