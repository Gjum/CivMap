import React from 'react'
import { connect } from 'react-redux'

import Button from 'material-ui/Button'
import TextField from 'material-ui/TextField'

import CheckIcon from 'material-ui-icons/Check'
import DeleteIcon from 'material-ui-icons/Delete'
import LineIcon from 'material-ui-icons/Timeline'
import PolygonIcon from 'material-ui-icons/PanoramaHorizontal'
import ResetIcon from 'material-ui-icons/Undo'
import SwapIcon from 'material-ui-icons/SwapCalls'

import { exportStringFromFeature } from '../../utils/importExport'
import JsonEditor from '../edit/JsonEditor'
import { reversePolyPositions } from '../../utils/math'
import { lookupFeature, openBrowseMode, openEditMode, openFeatureDetail, removeFeatureInCollection, updateFeatureInCollection } from '../../store'

export class RealFeatureEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      originalFeature: props.feature,
    }
  }

  render() {
    const { feature, dispatch } = this.props
    const { originalFeature } = this.state

    const dataLink = '#feature=' + exportStringFromFeature(feature)

    return <div>
      <div style={{ margin: '16px' }}>

        <Button variant='raised' onClick={() => {
          dispatch(updateFeatureInCollection(feature.source, originalFeature, feature.id))
          dispatch(openEditMode(originalFeature.id, originalFeature.source))
        }}>
          <ResetIcon />
          Reset
        </Button>

        <Button variant='raised' onClick={() => {
          dispatch(removeFeatureInCollection(feature.source, feature.id))
          dispatch(openBrowseMode()) // TODO show similar features in search results instead
        }}>
          <DeleteIcon />
          Delete
        </Button>

        <Button variant='raised' onClick={() => {
          dispatch(openFeatureDetail(feature.id, feature.source))
        }}>
          <CheckIcon />
          Save
        </Button>

        {
          feature.polygon !== undefined ?
            <Button variant='raised' onClick={() => {
              const f = { ...feature, line: feature.polygon }
              delete f.polygon
              dispatch(updateFeatureInCollection(f.source, f))
            }}><LineIcon />Convert to line</Button>
            : feature.line !== undefined ?
              <Button variant='raised' onClick={() => {
                const f = { ...feature, polygon: feature.line }
                delete f.line
                dispatch(updateFeatureInCollection(f.source, f))
              }}><PolygonIcon />Convert to area</Button>
              : null
        }
        {/* TODO button to add new subshape */}
        {feature.line === undefined && feature.polygon === undefined ? null :
          <Button variant='raised' onClick={() => {
            const featureNew = { ...feature }
            if (feature.polygon) featureNew.polygon = reversePolyPositions(feature.polygon)
            if (feature.line) featureNew.line = reversePolyPositions(feature.line)
            dispatch(updateFeatureInCollection(feature.source, featureNew))
          }}><SwapIcon />Reverse line/area direction</Button>
        }

        <TextField autoFocus fullWidth
          label="Name"
          value={String(feature.name || '')}
          onChange={e => dispatch(updateFeatureInCollection(feature.source, { ...feature, name: e.target.value }))}
          style={{ margin: '16px 0px' }}
        />

        <a style={{ margin: '16px 0px' }} href={dataLink}>Export data as link</a>

        <JsonEditor
          style={{ margin: '16px 0px' }}
          data={feature}
          onChange={(newFeature) => {
            // TODO validate feature
            dispatch(updateFeatureInCollection(feature.source, newFeature, feature.id))
            dispatch(openEditMode(newFeature.id, feature.source))
          }}
        />
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

const mapStateToProps = (state) => {
  const { control } = state
  return {
    feature: lookupFeature(state, control.activeFeatureId, control.activeFeatureCollection),
  }
}

export default connect(mapStateToProps)(RealFeatureEditor)
