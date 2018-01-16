import React from 'react'
import { connect } from 'react-redux'

import IconButton from 'material-ui/IconButton'
import List, {
  ListSubheader,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from 'material-ui/List'

import InvisibleIcon from 'material-ui-icons/VisibilityOff'
import PersonPinCircleIcon from 'material-ui-icons/PersonPinCircle'
import VisibleIcon from 'material-ui-icons/Visibility'

import { hideLayer, openLayerEditor, removeLayer, showLayer } from '../../store'

/**
 * @param {[{geometry: {type}}]} features
 */
function getCommonFeatureType(features) {
  return null // XXX how to get feature objects in here instead of just ids
  const firstType = features[0].geometry.type
  if (features.every(f => f.geometry.type === firstType)) {
    return firstType
  }
  return null
}

function getDescription({ features, properties }) {
  const infos = []
  if (features.length) {
    let featDesc = getCommonFeatureType(features) || 'feature'
    if (features.length > 1) {
      featDesc += 's'
    }
    infos.push(`${features.length} ${featDesc}`)
  } else {
    infos.push(`empty`)
  }
  if (properties.author) {
    infos.push(`by ${properties.author}`)
  }
  return infos.join(' • ')
}

const Layer = ({
  layer,
  visible,
  dispatch,
}) => {
  return <ListItem button onClick={() => dispatch(openLayerEditor(layer.id))}>
    <ListItemIcon><PersonPinCircleIcon /></ListItemIcon>
    <ListItemText
      primary={layer.properties.name}
      secondary={getDescription(layer)}
    />
    <ListItemSecondaryAction>
      <IconButton onClick={() => dispatch(
        visible ? hideLayer(layer.id) : showLayer(layer.id)
      )}>
        {visible ? <VisibleIcon /> : <InvisibleIcon />}
      </IconButton>
    </ListItemSecondaryAction>
  </ListItem>
}

const LayersList = ({
  layers,
  visibleLayers,
  dispatch,
}) => {
  const groups = {
    'Visible Layers': visibleLayers,
    'Hidden Layers': Object.keys(layers).filter(lid => !visibleLayers.includes(lid)),
    'Public Layers': [],
  }
  return <List>
    {Object.keys(groups)
      .filter(groupName => groups[groupName].length)
      .map(groupName =>
        <div key={groupName}>
          <ListSubheader>{groupName}</ListSubheader>
          {groups[groupName].map(layerId =>
            <Layer
              key={layerId}
              visible={groupName === 'Visible Layers'}
              layer={layers[layerId]}
              dispatch={dispatch}
            />
          )}
        </div>
      )
    }
  </List>
}

const mapStateToProps = ({ layers, visibleLayers }) => {
  return {
    layers,
    visibleLayers,
  }
}

export default connect(mapStateToProps)(LayersList)
