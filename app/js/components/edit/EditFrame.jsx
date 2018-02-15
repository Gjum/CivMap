import React from 'react'
import { connect } from 'react-redux'
import { v4 } from 'node-uuid'

import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import { MenuItem } from 'material-ui/Menu'
import Select from 'material-ui/Select'

import CheckIcon from 'material-ui-icons/Check'
import DeleteIcon from 'material-ui-icons/Delete'
import ResetIcon from 'material-ui-icons/Undo'

import CircleIcon from 'material-ui-icons/AddCircle'
import ImageIcon from 'material-ui-icons/InsertPhoto'
import LineIcon from 'material-ui-icons/Timeline'
import MarkerIcon from 'material-ui-icons/AddLocation'
import PolygonIcon from 'material-ui-icons/PanoramaHorizontal'

import { addFeature, openBrowseMode, openEditMode, openFeatureDetail, openLayerDetail, removeFeature, showLayer, updateFeature } from '../../store'

function makeId() {
  return v4()
}

class EditorAny extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      originalFeature: props.feature,
    }
  }

  render() {
    const { feature, dispatch } = this.props
    const { originalFeature } = this.state
    return <div>
      <div style={{ margin: '16px' }}>

        <Button raised onClick={() => {
          dispatch(openFeatureDetail(feature.id))
        }}>
          <CheckIcon />
          Save
        </Button>

        <Button raised onClick={() => {
          dispatch(updateFeature(originalFeature))
        }}>
          <ResetIcon />
          Reset
        </Button>

        <Button raised onClick={() => {
          dispatch(removeFeature(feature.id))
          dispatch(openBrowseMode()) // TODO show layer instead
        }}>
          <DeleteIcon />
          Delete
        </Button>

      </div>

      <FeatureProps featureProps={feature.properties} />
    </div>
  }
}

const FeatureProps = ({ featureProps }) => {
  // TODO list of key-value text fields
  return <div style={{ margin: '16px' }}>
    TODO edit properties here
  </div>
}

class FeatureCreator extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      layerId: props.layerId,
    }
  }

  makeNewAndEdit(type) {
    const { dispatch } = this.props
    const feature = { id: makeId(), geometry: { type: type } }
    dispatch(addFeature(feature))
    dispatch(openEditMode(feature.id))

    const { layerId } = this.state
    if (layerId) dispatch(showLayer(layerId))
  }

  render() {
    return <div>
      {/* TODO select layer to add feature to */}

      <Button onClick={() => {
        this.makeNewAndEdit("marker")
      }}><MarkerIcon />Create marker</Button>
      <br />
      <Button onClick={() => {
        this.makeNewAndEdit("circle")
      }}><CircleIcon />Create circle</Button>
      <br />
      <Button onClick={() => {
        this.makeNewAndEdit("line")
      }}><LineIcon />Create line</Button>
      <br />
      <Button onClick={() => {
        this.makeNewAndEdit("polygon")
      }}><PolygonIcon />Create area</Button>
      <br />
      <Button disabled onClick={() => {
        this.makeNewAndEdit("image")
      }}><ImageIcon />Create image</Button>
    </div>
  }
}

class EditFrame extends React.Component {
  render() {
    const { feature, dispatch } = this.props
    if (feature) {
      return <EditorAny {...{ feature, dispatch }} />
    } else {
      return <FeatureCreator dispatch={dispatch} />
    }
  }
}

const mapStateToProps = ({ features, control }) => {
  return {
    feature: features[control.editFeatureId],
  }
}

export default connect(mapStateToProps)(EditFrame)
