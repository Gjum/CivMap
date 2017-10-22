import React from 'react'
import { connect } from 'react-redux'

import IconButton from 'material-ui/IconButton';
import List, {
  ListSubheader,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from 'material-ui/List'

import InvisibleIcon from 'material-ui-icons/VisibilityOff';
import PersonPinCircleIcon from 'material-ui-icons/PersonPinCircle'
import VisibleIcon from 'material-ui-icons/Visibility';

import { addLayer, openLayerEditor, removeLayer, setLayerHidden } from '../actions'

function getCommonFeatureType(features) {
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
  dispatchers: {
    openLayerEditor,
    setLayerHidden,
  },
}) => {
  return <ListItem button
    onClick={() => openLayerEditor(layer.id)}
  >
    <ListItemIcon><PersonPinCircleIcon /></ListItemIcon>
    <ListItemText
      primary={layer.properties.name}
      secondary={getDescription(layer)}
    />
    <ListItemSecondaryAction>
      <IconButton
        onClick={() => setLayerHidden(layer.id, !layer.properties.hidden)}
      >
        {layer.properties.hidden ? <InvisibleIcon /> : <VisibleIcon />}
      </IconButton>
    </ListItemSecondaryAction>
  </ListItem>
}

const LayersList = ({
  overlay,
  addLayer,
  openLayerEditor,
  setLayerHidden,
}) => {
  const groups = {
    'Visible Layers': [],
    'Hidden Layers': [],
    'Public Layers': [],
  }
  overlay.forEach(layer => {
    const props = layer.properties
    if (props.hidden) {
      groups['Hidden Layers'].push(layer)
    } else {
      groups['Visible Layers'].push(layer)
    }
  })
  // TODO push public layers to groups['Public Layers']
  return <List>
    {Object.keys(groups).map(groupName =>
      <div key={groupName}>
        <ListSubheader>{groupName}</ListSubheader>
        {groups[groupName].map(layer =>
          <Layer
            key={layer.id}
            layer={layer}
            dispatchers={{
              openLayerEditor,
              setLayerHidden,
            }}
          />
        )}
      </div>
    )}
  </List>
}

const mapStateToProps = ({ overlay }) => {
  return {
    overlay,
  }
}

const mapDispatchToProps = {
  addLayer,
  openLayerEditor,
  setLayerHidden,
}

export default connect(mapStateToProps, mapDispatchToProps)(LayersList)
