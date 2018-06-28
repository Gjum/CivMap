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
import { disablePresentationInCollection, enablePresentationInCollection, openPresentationEdit } from '../../store'

const Layer = ({ dispatch, presentation, enabled_presentation }) => {
  if (!presentation) return null

  const isEnabled = enabled_presentation === presentation.name

  return <ListItem button onClick={() => {
    if (isEnabled) dispatch(disablePresentationInCollection(presentation.source, presentation.name))
    else dispatch(enablePresentationInCollection(presentation.source, presentation.name))
  }}>
    <ListItemIcon>{isEnabled ? <VisibleIcon /> : <InvisibleIcon />}</ListItemIcon>
    <ListItemText primary={presentation.name} />
    <ListItemSecondaryAction>
      <IconButton onClick={() => dispatch(openPresentationEdit(presentation.name))}>
        <EditIcon />
      </IconButton>
    </ListItemSecondaryAction>
  </ListItem>
}

const PresentationsForCollection = ({ dispatch, collection }) => {
  const { enabled_presentation } = collection
  let presentations = Object.values(collection.presentations || {})
  if (enabled_presentation) {
    presentations = [
      collection.presentations[enabled_presentation],
      ...presentations.filter(p => p.name !== enabled_presentation),
    ]
  }

  if (presentations.length <= 1) {
    const presentation = presentations[0]
    return <Layer {...{ dispatch, presentation, enabled_presentation }} />
  }

  return <div>
    <ListItem>
      <ListItemText primary={collection.name} style={{ color: '#444444' }} />
    </ListItem>
    <List disablePadding>
      {presentations.map((presentation) =>
        <Layer {...{ dispatch, presentation, enabled_presentation }} key={presentation.name} />
      )}
    </List>
  </div>
}

class LayersControl extends React.PureComponent {
  constructor(props) {
    super(props)
    const enabledCollections = Object.values(props.collections).filter(c => c.presentations[c.enabled_presentation])
    const disabledCollections = Object.values(props.collections).filter(c => !c.presentations[c.enabled_presentation])
    this.state = {
      layerOrder: [...enabledCollections, ...disabledCollections].map(({ source }) => source),
    }
  }

  componentWillReceiveProps(nextProps) {
    // TODO handle collections getting added/removed
  }

  render() {
    const {
      collections,
      dispatch,
    } = this.props

    const { layerOrder } = this.state

    return <div>
      <List disablePadding>
        {layerOrder.map(source => <PresentationsForCollection dispatch={dispatch} collection={collections[source]} key={source} />)}
      </List>
    </div>
  }
}

const mapStateToProps = ({ collections }) => {
  return {
    collections,
  }
}

export default connect(mapStateToProps)(LayersControl)
