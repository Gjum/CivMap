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
import { groupPresentationsByCategory, makePresentationId } from '../../utils/state';
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
  const isEnabled = presentationsEnabled[presentation.category] === presentationId

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

const LayersForCategory = ({ dispatch, presentationsByCategory, presentationsEnabled, category }) => {
  const presentationsOfThisCategory = Object.values(presentationsByCategory[category] || {})

  if (presentationsOfThisCategory.length <= 1) {
    const presentation = presentationsOfThisCategory[0]
    return <Layer {...{ dispatch, presentation, presentationsEnabled }} />
  }

  let categoryHeadText = pluralize(category[0].toUpperCase() + category.slice(1)) + ':'

  return <div>
    <ListItem button onClick={() => {
    }}>
      <ListItemText primary={categoryHeadText} style={{color: '#444444'}} />
    </ListItem>
    <List disablePadding>
      {presentationsOfThisCategory.map((presentation) =>
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
  const presentationsByCategory = groupPresentationsByCategory(presentationsMerged)

  const enabledCategories = Object.keys(presentationsEnabled).filter(category => presentationsByCategory[category])
  const disabledCategories = Object.keys(presentationsByCategory).filter(category => !presentationsEnabled[category])

  enabledCategories.sort((a, b) => Object.keys(presentationsByCategory[a]).length - Object.keys(presentationsByCategory[b]).length)
  disabledCategories.sort((a, b) => Object.keys(presentationsByCategory[a]).length - Object.keys(presentationsByCategory[b]).length)

  const commonProps = {
    dispatch,
    presentationsByCategory,
    presentationsEnabled,
  }

  return <div>
    <List disablePadding subheader={<ListSubheader>Visible Layers</ListSubheader>}>
      {enabledCategories.map((category) => <LayersForCategory {...commonProps} category={category} key={category} />)}
    </List>

    <List disablePadding subheader={<ListSubheader>Invisible Layers</ListSubheader>}>
      {disabledCategories.map((category) => <LayersForCategory {...commonProps} category={category} key={category} />)}
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
