import React from 'react'
import { connect } from 'react-redux'

import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import List, { ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, ListSubheader } from 'material-ui/List'

import DeleteIcon from 'material-ui-icons/Delete'
import EditIcon from 'material-ui-icons/Edit'
import InvisibleIcon from 'material-ui-icons/VisibilityOff'
import VisibleIcon from 'material-ui-icons/Visibility'

import JsonEditor from '../edit/JsonEditor'
import { groupPresentationsByType, makePresentationId } from '../../utils/state';
import { disablePresentation, enablePresentation, openPresentationEdit } from '../../store'

function pluralize(str) {
  if (str.endsWith('y')) {
    return str.slice(0, str.length - 1) + 'ies'
  } else if (str.endsWith('ch')) {
    return str.slice(0, str.length - 2) + 'ches'
  } else {
    return str + 's'
  }
}

const Layer = ({ dispatch, presentation, presentationsEnabled }) => {
  if (!presentation) return null

  const presentationId = makePresentationId(presentation)
  const isEnabled = presentationsEnabled[presentation.type] === presentationId

  return <ListItem button onClick={() => {
    if (isEnabled) dispatch(disablePresentation(presentation))
    else dispatch(enablePresentation(presentation))
  }}>
    <ListItemIcon>{isEnabled ? <VisibleIcon /> : <InvisibleIcon />}</ListItemIcon>
    <ListItemText primary={presentation.name} />
    <ListItemSecondaryAction>
      <IconButton onClick={() => dispatch(openPresentationEdit(presentationId))}>
        <EditIcon />
      </IconButton>
    </ListItemSecondaryAction>
  </ListItem>
}

const LayersForType = ({ dispatch, presentationsByType, presentationsEnabled, type }) => {
  const presentationsOfThisType = Object.values(presentationsByType[type] || {})

  if (presentationsOfThisType.length <= 1) {
    const presentation = presentationsOfThisType[0]
    return <Layer {...{ dispatch, presentation, presentationsEnabled }} />
  }

  let typeHeadText = pluralize(type[0].toUpperCase() + type.slice(1)) + ':'

  return <div>
    <ListItem button onClick={() => {
    }}>
      <ListItemText primary={typeHeadText} style={{color: '#444444'}} />
    </ListItem>
    <List disablePadding>
      {presentationsOfThisType.map((presentation) =>
        <Layer {...{ dispatch, presentation, presentationsEnabled }} key={makePresentationId(presentation)} />
      )}
    </List>
  </div>
}

const LayersControl = ({
  presentationsMerged,
  presentationsEnabled,
  dispatch,
}) => {
  const presentationsByType = groupPresentationsByType(presentationsMerged)

  const enabledTypes = Object.keys(presentationsEnabled)
  const disabledTypes = Object.keys(presentationsByType).filter(pid => !presentationsEnabled[pid])

  enabledTypes.sort((a, b) => Object.keys(presentationsByType[a]).length - Object.keys(presentationsByType[b]).length)
  disabledTypes.sort((a, b) => Object.keys(presentationsByType[a]).length - Object.keys(presentationsByType[b]).length)

  const commonProps = {
    dispatch,
    presentationsByType,
    presentationsEnabled,
  }

  return <div>
    <List disablePadding subheader={<ListSubheader>Visible Layers</ListSubheader>}>
      {enabledTypes.map((type) => <LayersForType {...commonProps} type={type} key={type} />)}
    </List>

    <List disablePadding subheader={<ListSubheader>Invisible Layers</ListSubheader>}>
      {disabledTypes.map((type) => <LayersForType {...commonProps} type={type} key={type} />)}
    </List>
  </div>
}

const mapStateToProps = ({ presentations: { presentationsMerged, presentationsEnabled } }) => {
  return {
    presentationsMerged,
    presentationsEnabled,
  }
}

export default connect(mapStateToProps)(LayersControl)
