import React from 'react'
import { connect } from 'react-redux'

import { Button, TextField } from '@mui/material'

import { Check, Delete, HorizontalRule, Pentagon, RestartAlt, SwapHoriz } from '@mui/icons-material'

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

        <Button variant='contained' onClick={() => {
          dispatch(updateFeatureInCollection(feature.collectionId, originalFeature, feature.id))
          dispatch(openEditMode(originalFeature.id, originalFeature.collectionId))
        }}>
          <RestartAlt />
          Reset
        </Button>

        <Button variant='contained' onClick={() => {
          dispatch(removeFeatureInCollection(feature.collectionId, feature.id))
          dispatch(openBrowseMode()) // TODO show similar features in search results instead
        }}>
          <Delete />
          Delete
        </Button>

        <Button variant='contained' onClick={() => {
          dispatch(openFeatureDetail(feature.id, feature.collectionId))
        }}>
          <Check />
          Save
        </Button>

        {
          feature.polygon !== undefined ?
            <Button variant='contained' onClick={() => {
              const f = { ...feature, line: feature.polygon }
              delete f.polygon
              dispatch(updateFeatureInCollection(f.collectionId, f))
            }}><HorizontalRule />Convert to line</Button>
            : feature.line !== undefined ?
              <Button variant='contained' onClick={() => {
                const f = { ...feature, polygon: feature.line }
                delete f.line
                dispatch(updateFeatureInCollection(f.collectionId, f))
              }}><Pentagon />Convert to area</Button>
              : null
        }
        {/* TODO button to add new subshape */}
        {feature.line === undefined && feature.polygon === undefined ? null :
          <Button variant='contained' onClick={() => {
            const featureNew = { ...feature }
            if (feature.polygon) featureNew.polygon = reversePolyPositions(feature.polygon)
            if (feature.line) featureNew.line = reversePolyPositions(feature.line)
            dispatch(updateFeatureInCollection(feature.collectionId, featureNew))
          }}><SwapHoriz />Reverse line/area direction</Button>
        }

        <TextField autoFocus fullWidth
          label="Name"
          value={String(feature.name || '')}
          onChange={e => dispatch(updateFeatureInCollection(feature.collectionId, { ...feature, name: e.target.value }))}
          style={{ margin: '16px 0px' }}
        />

        <a style={{ margin: '16px 0px' }} href={dataLink}>Export data as link</a>

        <JsonEditor
          style={{ margin: '16px 0px' }}
          data={feature}
          onChange={(newFeature) => {
            // TODO validate feature
            dispatch(updateFeatureInCollection(feature.collectionId, newFeature, feature.id))
            dispatch(openEditMode(newFeature.id, feature.collectionId))
          }}
        />
      </div>
    </div>
  }
}


const mapStateToProps = (state) => {
  const { control } = state
  return {
    feature: lookupFeature(state, control.activeFeatureId, control.activeFeatureCollection),
  }
}

export default connect(mapStateToProps)(RealFeatureEditor)
