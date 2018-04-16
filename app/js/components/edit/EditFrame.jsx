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

        <Button variant='raised' onClick={() => {
          dispatch(updateFeature(originalFeature))
        }}>
          <ResetIcon />
          Reset
        </Button>

        <Button variant='raised' onClick={() => {
          dispatch(removeFeature(feature.id))
          dispatch(openBrowseMode()) // TODO show similar features in search results instead
        }}>
          <DeleteIcon />
          Delete
        </Button>

        <Button variant='raised' onClick={() => {
          dispatch(openFeatureDetail(feature.id))
        }}>
          <CheckIcon />
          Save
        </Button>

      </div>
      <div style={{ margin: '16px' }}>
        {
          feature.polygon !== undefined ?
            <Button variant='raised' onClick={() => {
              const f = { ...feature, line: feature.polygon }
              delete f.polygon
              dispatch(updateFeature(f))
            }}><LineIcon />Convert to line</Button>
            : feature.line !== undefined ?
              <Button variant='raised' onClick={() => {
                const f = { ...feature, polygon: feature.line }
                delete f.line
                dispatch(updateFeature(f))
              }}><PolygonIcon />Convert to area</Button>
              : null
        }
        {/* TODO button to add new subshape */}
        {feature.line === undefined && feature.polygon === undefined ? null :
          <Button variant='raised' onClick={() => {
            const featureNew = { ...feature }
            if (feature.polygon) featureNew.polygon = reversePolyPositions(feature.polygon)
            if (feature.line) featureNew.line = reversePolyPositions(feature.line)
            dispatch(updateFeature(featureNew))
          }}><SwapIcon />Reverse line/area direction</Button>
        }
      </div>

      <FeatureStyle feature={feature} dispatch={dispatch} />
      <FeatureProps feature={feature} dispatch={dispatch} />
    </div>
  }
}

const FeatureStyle = ({ feature, dispatch }) => {
  return null // XXX style representation will have to change

  return <div style={{ margin: '16px' }}>
    {/* TODO offer color palette */}
    Color: <input type="color"
      style={{ marginLeft: 16 }}
      value={(feature.style || {}).color || '#00ffff'}
      onChange={e => dispatch(updateFeature({ ...feature, style: { ...feature.style, color: e.target.value } }))}
    />
    {/* TODO controls for weight, opacity, fillColor, fillOpacity, dash{Array,Offset}, ... */}
  </div>
}

class _FeatureProps extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      parseErrorText: undefined,
    }
  }

  renderRailConnectionControls() {
    const { feature, dispatch } = this.props
    if (!feature.is_rail_connection) return

    const posStart = feature.line[0][0]
    const posEnd = feature.line[0][feature.line[0].length - 1]
    const closestStopIdStart = closestStop(posStart, this.props.features)
    const closestStopIdEnd = closestStop(posEnd, this.props.features)

    const setStartOrEnd = (startOrEnd, value) => dispatch(updateFeature({ ...feature, [startOrEnd]: value }))

    return <div>
      {closestStopIdStart && (closestStopIdStart !== feature.rail_start) && <Button variant='raised'
        onClick={() => setStartOrEnd('rail_start', closestStopIdStart)}
      >Start at {closestStopIdStart}</Button>}
      {closestStopIdEnd && (closestStopIdEnd !== feature.rail_end) && <Button variant='raised'
        onClick={() => setStartOrEnd('rail_end', closestStopIdEnd)}
      >End at {closestStopIdEnd}</Button>}
    </div>
  }

  render() {
    const { feature, dispatch } = this.props
    return <div style={{ margin: '16px' }}>

      {this.renderRailConnectionControls()}

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

const FeatureProps = connect(({ features }) => {
  return {
    features: Object.values(features),
  }
})(_FeatureProps)

function closestStop(position, features) {
  const [fz, fx] = position
  let stopId = null
  let minDist = 200 // won't search further than this
  features.filter(f => f.rail_stop_id)
    .forEach(f => {
      const [az, ax] = [f.z, f.x]
      const da = Math.abs(az - fz) + Math.abs(ax - fx)
      if (minDist > da) {
        minDist = da
        stopId = f.rail_stop_id
      }
    })
  return stopId
}


class FeatureCreator extends React.Component {
  render() {
    const makeNewAndEdit = (defaultProps) => {
      const { dispatch } = this.props
      const feature = { ...defaultProps, id: makeId() }
      dispatch(addFeature(feature))
      dispatch(openEditMode(feature.id))
    }

    return <div>
      <Button onClick={() => {
        makeNewAndEdit({ x: null, z: null })
      }}><MarkerIcon />Create marker</Button>
      <br />
      <Button onClick={() => {
        makeNewAndEdit({ line: null })
      }}><LineIcon />Create line</Button>
      <br />
      <Button disabled onClick={() => {
        makeNewAndEdit({ polygon: null })
      }}><PolygonIcon />Create area</Button>
      <br />
      <Button disabled onClick={() => {
        makeNewAndEdit({ x: null, z: null, radius: null })
      }}><CircleIcon />Create circle</Button>
      <br />
      <Button disabled onClick={() => {
        makeNewAndEdit({ map_image: null })
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
