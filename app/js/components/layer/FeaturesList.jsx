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

import CloseIcon from 'material-ui-icons/Close';
import PersonPinCircleIcon from 'material-ui-icons/PersonPinCircle'

import { openFeatureEditor, removeFeature } from '../../actions'

const FeatureListEntry = ({
  feature,
  dispatch,
}) => {
  const icon = <PersonPinCircleIcon /> // TODO depends on geometry.type
  return <ListItem button
    onClick={() => dispatch(openFeatureEditor(feature.id))}
  >
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText
      primary={feature.properties.name}
      secondary={feature.geometry.type}
    />
    <ListItemSecondaryAction>
      <IconButton
        onClick={() => dispatch(removeFeature(feature.id))}
      >
        <CloseIcon />
      </IconButton>
    </ListItemSecondaryAction>
  </ListItem>
}

const FeaturesList = ({
  layer,
  features,
  dispatch,
}) => {
  return <List>
    {layer.features.map(featureId =>
      <FeatureListEntry
        key={featureId}
        feature={features[featureId]}
        dispatch={dispatch}
      />
    )}
  </List>
}

const mapStateToProps = ({ control, features, layers }) => {
  return {
    layer: layers[control.layerId],
    features,
  }
}

export default connect(mapStateToProps)(FeaturesList)
