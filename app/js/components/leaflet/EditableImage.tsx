import React from 'react'
import * as RL from 'react-leaflet'

import { deepFlip } from '../../utils/math'
import { calculateFeatureStyle, convertStyle } from '../../utils/presentation'
import { openFeatureDetail } from '../../store'
import { EditableProps } from './EditableThing'

export default class EditableImage extends React.PureComponent<EditableProps> {
  render() {
    let { dispatch, editable, feature, baseStyle, highlightStyle, zoomStyle } = this.props
    const { id, collectionId, map_image: { url, bounds } } = feature
    const style = calculateFeatureStyle({ feature, baseStyle, highlightStyle, zoomStyle })

    return <RL.ImageOverlay
      eventHandlers={{
        click: () => {
          if (!editable) {
            dispatch(openFeatureDetail(id, collectionId))
          }
        }
      }}
      {...convertStyle(style)}
      bounds={deepFlip(bounds)}
      url={url}
    />
  }
}
