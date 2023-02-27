import React from 'react'
import * as RL from 'react-leaflet'

import { centered, deepFlip, deepLatLngToArr } from '../../utils/math'
import { calculateFeatureStyle, convertStyle } from '../../utils/presentation'
import { openFeature, updateFeatureInCollection } from '../../store'
import { EditableProps } from './EditableThing'
import { LeafletEvent, Polyline, PolylineEditor } from 'leaflet'

export default class EditableLine extends React.PureComponent<EditableProps> {
  featureRef: L.Polyline | null

  constructor(props) {
    super(props)
  }

  resetEditor = () => {
    if (!this.featureRef) {
      console.error('trying to set polyline editing without featureRef')
      return
    }
    if (!this.props.editable) {
      this.featureRef.disableEdit()
      return
    }

    const editor = this.featureRef.enableEdit() as PolylineEditor // create editor
    editor.reset()

    const positions = this.props.feature.line
    if (!positions || positions.length <= 0 || positions[positions.length - 1].length <= 0) {
      editor.disable() // newShape() is broken while editing
      editor.newShape()
    }
    else {
      editor.disable() // continueForward() is broken while editing
      editor.continueForward()
      editor.enable() // re-add corner markers
    }
  }

  updatePositions = (e: LeafletEvent) => {
    // this.featureRef.editor.ensureMulti()
    // for some reason this makes it [[[[]]]] so just get first
    const positions = deepLatLngToArr(this.featureRef.getLatLngs())
    // TODO ignore updates that only add 1-point segments
    const { feature } = this.props
    this.props.dispatch(updateFeatureInCollection(feature.collectionId, { ...feature, line: positions }))
  }

  onRef = (ref: Polyline | null) => {
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
    let { dispatch, editable, feature, baseStyle, highlightStyle, zoomStyle } = this.props
    const { id, collectionId, line } = feature
    const style = calculateFeatureStyle({ feature, baseStyle, highlightStyle, zoomStyle })

    // let leaflet internals finish updating before we interact with it
    setTimeout(this.resetEditor, 0)

    return <RL.Polyline
      ref={this.onRef}
      eventHandlers={{
        click: () => {
          if (!editable) {
            dispatch(openFeature(id, collectionId))
          }
        }
      }}
      {...convertStyle(style)}
      positions={!checkValidMultiLine(line) ? [] : centered(deepFlip(line))}
    />
  }
}

function checkValidMultiLine(line) {
  return line && line.length && line.every(checkValidLine)
}
function checkValidLine(line) {
  return line && line.length && line.every(checkValidPos)
}
function checkValidPos(pos) {
  return pos && pos.length === 2 && Number.isFinite(pos[0]) && Number.isFinite(pos[1])
}
