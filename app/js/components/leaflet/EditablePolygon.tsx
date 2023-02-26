import PropTypes from 'prop-types'
import React, { useRef } from 'react'
import * as RL from 'react-leaflet'

import { centered, deepFlip, deepLatLngToArr } from '../../utils/math'
import { calculateFeatureStyle, convertStyle } from '../../utils/presentation'
import { openFeatureDetail, updateFeatureInCollection } from '../../store'
import { EditableProps } from './EditableThing'
import { PolygonEditor } from 'leaflet'

export default class EditablePolygon extends React.PureComponent<EditableProps> {
  featureRef: L.Polygon | null

  constructor(props) {
    super(props)

    this.featureRef = null
  }

  resetEditor = () => {
    if (!this.featureRef) {
      console.error('trying to set polygon editing without featureRef')
      return
    }
    if (!this.props.editable) {
      this.featureRef.disableEdit()
      return
    }

    const editor = this.featureRef.enableEdit() as PolygonEditor // create editor
    editor.reset()
  }

  updatePositions = (e: L.LeafletEvent) => {
    // this.featureRef.editor.ensureNotFlat()
    const positions = deepLatLngToArr(this.featureRef.getLatLngs())
    // TODO ignore updates that only add 1-point segments
    const { feature } = this.props
    this.props.dispatch(updateFeatureInCollection(feature.collectionId, { ...feature, polygon: positions }))
  }

  onRef = (ref: L.Polygon | null) => {
    this.featureRef = ref
    if (ref) {
      this.featureRef.on('editable:drawing:clicked', this.updatePositions)
      this.featureRef.on('editable:vertex:dragend', this.updatePositions)
      this.featureRef.on('editable:vertex:deleted', this.updatePositions)
    }

    // let leaflet internals finish updating before we interact with it
    setTimeout(this.resetEditor, 0)
  }

  render() {
    return <RL.MapConsumer>
      {(map) => {
        const { dispatch, editable, feature, baseStyle, highlightStyle, zoomStyle } = this.props
        const { id, collectionId, polygon } = feature
        const style = calculateFeatureStyle({ feature, baseStyle, highlightStyle, zoomStyle })

        if (!checkValidMultiPoly(polygon)) {
          const tempPoly = map.editTools.startPolygon()
          // XXX on react unmount, disable editor and unregister handler
          tempPoly.on('editable:drawing:clicked', e => {
            const positions = deepLatLngToArr(tempPoly.getLatLngs())
            if (checkValidMultiPoly(positions)) {
              tempPoly.remove()
              this.props.dispatch(updateFeatureInCollection(feature.collectionId, { ...feature, polygon: positions }))
            }
          })

          return null
        }

        // let leaflet internals finish updating before we interact with it
        setTimeout(this.resetEditor, 0)

        return <RL.Polygon
          ref={this.onRef}
          eventHandlers={{
            click: () => {
              if (!editable) {
                dispatch(openFeatureDetail(id, collectionId))
              }
            }
          }}
          {...convertStyle(style)}
          positions={!polygon ? [] : deepFlip(polygon)}
        />
      }}
    </RL.MapConsumer>
  }
}

function checkValidMultiPoly(poly) {
    return poly && poly.length && poly.every(checkValidPoly)
}
function checkValidPoly(poly) {
  return poly && poly.length >= 3 && poly.every(checkValidPos)
}
function checkValidPos(pos) {
    return pos && pos.length === 2 && Number.isFinite(pos[0]) && Number.isFinite(pos[1])
}
