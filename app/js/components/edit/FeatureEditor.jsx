import React from 'react'
import { connect } from 'react-redux'
import { v4 } from 'node-uuid'

import Button from 'material-ui/Button'
import TextField from 'material-ui/TextField'

import CheckIcon from 'material-ui-icons/Check'
import DeleteIcon from 'material-ui-icons/Delete'
import LineIcon from 'material-ui-icons/Timeline'
import PolygonIcon from 'material-ui-icons/PanoramaHorizontal'
import ResetIcon from 'material-ui-icons/Undo'
import SwapIcon from 'material-ui-icons/SwapCalls'

import JsonEditor from '../edit/JsonEditor'
import { reversePolyPositions } from '../../utils/math'
import { openBrowseMode, openEditMode, openFeatureDetail, removeFeature, updateFeature } from '../../store'

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
          dispatch(updateFeature(originalFeature, feature.id))
          dispatch(openEditMode(originalFeature.id))
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

        <TextField autoFocus fullWidth
          label="Name"
          value={String(feature.name || '')}
          onChange={e => dispatch(updateFeature({ ...feature, name: e.target.value }))}
          style={{margin: '16px 0px'}}
        />

        <JsonEditor data={feature} onChange={(newFeature) => {
          // TODO validate feature
          dispatch(updateFeature(newFeature, feature.id))
          dispatch(openEditMode(newFeature.id))
        }} />
      </div>
    </div>
  }
}


function closestStop(position, features) {
  const [fz, fx] = position
  let stopId = null
  let minDist = 200 // won't search further than this
  features.filter(f => f.rail_stop_id)
    .forEach(f => {
      const [ax, az] = [f.x, f.z]
      const da = Math.abs(az - fz) + Math.abs(ax - fx)
      if (minDist > da) {
        minDist = da
        stopId = f.rail_stop_id
      }
    })
  return stopId
}

const mapStateToProps = ({ control, features: { featuresMerged } }) => {
  return {
    feature: featuresMerged[control.activeFeatureId],
  }
}

export default connect(mapStateToProps)(FeatureEditor)
