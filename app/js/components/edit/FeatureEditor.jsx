import React from 'react'
import { connect } from 'react-redux'
import { v4 } from 'node-uuid'

import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import { ListItemIcon } from 'material-ui/List'
import Menu, { MenuItem } from 'material-ui/Menu'
import Select from 'material-ui/Select'
import TextField from 'material-ui/TextField'

import CheckIcon from 'material-ui-icons/Check'
import DeleteIcon from 'material-ui-icons/Delete'
import EditIcon from 'material-ui-icons/Edit'
import LineIcon from 'material-ui-icons/Timeline'
import PolygonIcon from 'material-ui-icons/PanoramaHorizontal'
import ResetIcon from 'material-ui-icons/Undo'
import SwapIcon from 'material-ui-icons/SwapCalls'

import { addFeature, openBrowseMode, openEditMode, openFeatureDetail, removeFeature, updateFeature } from '../../store'
import { reversePolyPositions } from '../../utils/math'

class FeatureEditor extends React.Component {
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

    // TODO why is this broken?
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
      const [ax, z] = [f.x, f.z]
      const da = Math.abs(az - fz) + Math.abs(ax - fx)
      if (minDist > da) {
        minDist = da
        stopId = f.rail_stop_id
      }
    })
  return stopId
}

const mapStateToProps = ({ features, control }) => {
  return {
    feature: features[control.editFeatureId],
  }
}

export default connect(mapStateToProps)(FeatureEditor)
