import React from 'react'
import { connect } from 'react-redux'
import { v4 } from 'node-uuid'

import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import { MenuItem } from 'material-ui/Menu'
import Select from 'material-ui/Select'
import TextField from 'material-ui/TextField'

import CheckIcon from 'material-ui-icons/Check'
import DeleteIcon from 'material-ui-icons/Delete'
import ResetIcon from 'material-ui-icons/Undo'
import SwapIcon from 'material-ui-icons/SwapCalls'

import CircleIcon from 'material-ui-icons/AddCircle'
import ImageIcon from 'material-ui-icons/InsertPhoto'
import LineIcon from 'material-ui-icons/Timeline'
import MarkerIcon from 'material-ui-icons/AddLocation'
import PolygonIcon from 'material-ui-icons/PanoramaHorizontal'

import { addFeature, openBrowseMode, openEditMode, openFeatureDetail, removeFeature, updateFeature } from '../../store'
import { reversePolyPositions } from '../../utils/math'

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
          dispatch(updateFeature(originalFeature))
        }}>
          <ResetIcon />
          Reset
        </Button>

        <Button raised onClick={() => {
          dispatch(removeFeature(feature.id))
          dispatch(openBrowseMode()) // TODO show similar features in search results instead
        }}>
          <DeleteIcon />
          Delete
        </Button>

        <Button raised onClick={() => {
          dispatch(openFeatureDetail(feature.id))
        }}>
          <CheckIcon />
          Save
        </Button>

      </div>
      <div style={{ margin: '16px' }}>
        {
          feature.geometry.type === 'polygon' ?
            <Button raised onClick={() => {
              dispatch(updateFeature({ ...feature, geometry: { ...feature.geometry, type: "line" } }))
            }}><LineIcon />Convert to line</Button>
            : feature.geometry.type === 'line' ?
              <Button raised onClick={() => {
                dispatch(updateFeature({ ...feature, geometry: { ...feature.geometry, type: "polygon" } }))
              }}><PolygonIcon />Convert to area</Button>
              : null
        }
        {/* {feature.geometry.type !== 'line' && feature.geometry.type !== 'polygon' ? null :
          <Button raised onClick={() => {
            const positions = [...feature.geometry.positions, []]
            dispatch(updateFeature({ ...feature, geometry: { ...feature.geometry, positions } }))
          }}>Add shape</Button>
        } */}
        {feature.geometry.type !== 'line' && feature.geometry.type !== 'polygon' ? null :
          <Button raised onClick={() => {
            const positions = reversePolyPositions(feature.geometry.positions)
            dispatch(updateFeature({ ...feature, geometry: { ...feature.geometry, positions } }))
          }}><SwapIcon />Reverse positions</Button>
        }
      </div>

      <FeatureStyle feature={feature} dispatch={dispatch} />
      <FeatureProps feature={feature} dispatch={dispatch} />
    </div>
  }
}

const FeatureStyle = ({ feature, dispatch }) => {
  return <div style={{ margin: '16px' }}>
    {/* TODO offer color palette */}
    Color: <input type="color"
      style={{ marginLeft: 16 }}
      value={feature.style.color || '#00ffff'}
      onChange={e => dispatch(updateFeature({ ...feature, style: { ...feature.style, color: e.target.value } }))}
    />
    {/* TODO controls for weight, opacity, fillColor, fillOpacity, dash{Array,Offset}, ... */}
  </div>
}

class FeatureProps extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      parseErrorText: undefined,
    }
  }

  render() {
    const { feature, dispatch } = this.props
    return <div style={{ margin: '16px' }}>
      {/* TODO list of key-value text fields */}
      <TextField fullWidth multiline
        rowsMax={9999}
        label="JSON"
        value={this.state.parseErrorText ? undefined : JSON.stringify(feature)}
        error={!!this.state.parseErrorText}
        helperText={this.state.parseErrorText}
        onChange={e => {
          try {
            const newFeature = JSON.parse(e.target.value)
            // TODO validate feature
            dispatch(updateFeature(newFeature))
            this.setState({ parseErrorText: undefined })
          } catch (err) {
            this.setState({ parseErrorText: '' + err })
          }
        }}
      />
    </div>
  }
}

class FeatureCreator extends React.Component {
  makeNewAndEdit(type) {
    const { dispatch } = this.props
    const feature = { id: makeId(), geometry: { type: type } }
    dispatch(addFeature(feature))
    dispatch(openEditMode(feature.id))
  }

  render() {
    return <div>
      <Button onClick={() => {
        this.makeNewAndEdit("marker")
      }}><MarkerIcon />Create marker</Button>
      <br />
      <Button onClick={() => {
        this.makeNewAndEdit("line")
      }}><LineIcon />Create line</Button>
      <br />
      <Button disabled onClick={() => {
        this.makeNewAndEdit("polygon")
      }}><PolygonIcon />Create area</Button>
      <br />
      <Button disabled onClick={() => {
        this.makeNewAndEdit("circle")
      }}><CircleIcon />Create circle</Button>
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
