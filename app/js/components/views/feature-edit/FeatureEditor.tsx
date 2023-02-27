import React from 'react'
import { connect, DispatchProp } from 'react-redux'

import { Button, Stack, TextField, Snackbar } from '@mui/material'

import { CheckRounded, DeleteRounded, HorizontalRuleRounded, PentagonRounded, RestartAltRounded, SwapHorizRounded, LinkRounded } from '@mui/icons-material'

import { exportStringFromFeature } from '../../../utils/importExport'
import JsonEditor from './JsonEditor'
import { reversePolyPositions } from '../../../utils/math'
import { lookupFeature, openTabs, editFeature, openFeature, removeFeatureInCollection, updateFeatureInCollection, RootState } from '../../../store'
import { CollectionId, Feature, FeatureId } from '../../../collectionstate'

interface Props {
  featureID: FeatureId
  featureCollection: CollectionId
  state: RootState
}

interface State {
  originalFeature: Feature
  open: boolean
}

export class RealFeatureEditor extends React.Component<DispatchProp & Props, State> {
  constructor(props: DispatchProp & Props) {
    super(props)

    const { featureID, featureCollection, state } = this.props
    this.state = {
      originalFeature: lookupFeature(state, featureID, featureCollection),
      open: false,
    }
  }

  render() {
    const { featureID, featureCollection, state, dispatch } = this.props
    const feature = lookupFeature(state, featureID, featureCollection)
    const { originalFeature, open } = this.state

    const dataLink = '#feature=' + exportStringFromFeature(feature)

    return <div>
      <Stack spacing={2} margin={1}>
        <TextField autoFocus fullWidth
          label="Name"
          value={String(feature.name || '')}
          onChange={e => dispatch(updateFeatureInCollection(feature.collectionId, { ...feature, name: e.target.value }))}
        />


        <JsonEditor
          data={feature}
          onChange={(newFeature) => {
            // TODO validate feature
            dispatch(updateFeatureInCollection(feature.collectionId, newFeature, feature.id))
            dispatch(editFeature(newFeature.id, feature.collectionId))
          }}
        />

        <Button variant='contained' onClick={() => {
          dispatch(updateFeatureInCollection(feature.collectionId, originalFeature, feature.id))
          dispatch(editFeature(originalFeature.id, originalFeature.collectionId))
        }}>
          <RestartAltRounded />
          Reset
        </Button>

        <Button variant='contained' onClick={() => {
          dispatch(removeFeatureInCollection(feature.collectionId, feature.id))
          dispatch(openTabs()) // TODO show similar features in search results instead
        }}>
          <DeleteRounded />
          Delete
        </Button>

        <Button variant='contained' onClick={() => {
          dispatch(openFeature(feature.id, feature.collectionId))
        }}>
          <CheckRounded />
          Save
        </Button>

        {
          feature.polygon !== undefined ?
            <Button variant='contained' onClick={() => {
              const f = { ...feature, line: feature.polygon } as Feature
              delete f.polygon
              dispatch(updateFeatureInCollection(f.collectionId, f))
            }}><HorizontalRuleRounded />Convert to line</Button>
            : feature.line !== undefined ?
              <Button variant='contained' onClick={() => {
                const f = { ...feature, polygon: feature.line } as Feature
                delete f.line
                dispatch(updateFeatureInCollection(f.collectionId, f))
              }}><PentagonRounded />Convert to area</Button>
              : null
        }
        {/* TODO button to add new subshape */}
        {feature.line === undefined && feature.polygon === undefined ? null :
          <Button variant='contained' onClick={() => {
            const featureNew = { ...feature }
            if (feature.polygon) featureNew.polygon = reversePolyPositions(feature.polygon)
            if (feature.line) featureNew.line = reversePolyPositions(feature.line)
            dispatch(updateFeatureInCollection(feature.collectionId, featureNew))
          }}><SwapHorizRounded />Reverse line/area direction</Button>
        }
        <Snackbar open={open} autoHideDuration={6000} message="Link copied to clipboard!" onClose={() => {
          this.setState({...this.state, open: false})
        }}/>
        <Button variant="contained" onClick={() => {
          const url = new URL(window.location.href)
          url.hash = dataLink
          navigator.clipboard.writeText(url.toString()).then(() => {
            this.setState({...this.state, open: true})
          })
        }}>
          <LinkRounded /> Copy feature as link
        </Button>
      </Stack>
    </div>
  }
}


const mapStateToProps = (state: RootState) => ({state})

export default connect(mapStateToProps)(RealFeatureEditor)
