import React from 'react'
import { connect } from 'react-redux'

import Collapse from '@material-ui/core/Collapse'
import IconButton from '@material-ui/core/IconButton'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'

import MoreIcon from '@material-ui/icons/MoreVert'
import InvisibleIcon from '@material-ui/icons/VisibilityOff'
import VisibleIcon from '@material-ui/icons/Visibility'

import { disablePresentationInCollection, enablePresentationInCollection, openCollectionEdit } from '../../store'

// TODO better visually distinguish multi-layer collections from single-layer collections

const Layer = ({ nested, dispatch, collection, presentation, enabled_presentation }) => {
  if (!presentation) return null

  const isEnabled = enabled_presentation === presentation.name || enabled_presentation === true

  const style = nested ? { paddingLeft: '32px' } : null

  return <ListItem style={style} button onClick={() => {
    if (isEnabled) dispatch(disablePresentationInCollection(collection.id, presentation.name))
    else dispatch(enablePresentationInCollection(collection.id, nested ? presentation.name : true))
  }}>
    <ListItemIcon>{isEnabled ? <VisibleIcon /> : <InvisibleIcon />}</ListItemIcon>
    <ListItemText primary={presentation.name} />
    <ListItemSecondaryAction>
      <IconButton onClick={() =>
        // TODO dispatch(openPresentationEdit(presentation.name))
        dispatch(openCollectionEdit(collection.id))
      }>
        <MoreIcon />
      </IconButton>
    </ListItemSecondaryAction>
  </ListItem>
}

const PresentationsForCollection = ({ dispatch, collection }) => {
  const { enabled_presentation } = collection
  let presentations = Object.values(collection.presentations || {})
  if (enabled_presentation) {
    const matchingPresentation = (collection.presentations || {})[enabled_presentation]
    presentations = presentations.filter(p => p.name !== enabled_presentation)
    if (matchingPresentation) presentations.unshift(matchingPresentation)
  }

  if (presentations.length <= 1) {
    const presentation = presentations[0] || { name: collection.name, id: collection.id }
    return <Layer {...{ dispatch, collection, presentation, enabled_presentation }} />
  }

  return <div>
    <ListItem>
      <ListItemText primary={collection.name} style={{ color: '#444444' }} />
    </ListItem>
    <Collapse in={true}>
      <List disablePadding>
        {presentations.map((presentation) =>
          <Layer nested {...{ dispatch, collection, presentation, enabled_presentation }} key={presentation.name} />
        )}
      </List>
    </Collapse>
  </div>
}

class RealLayersControl extends React.Component {
  constructor(props) {
    super(props)
    // remember initial ordering, so entries don't move around while open
    const enabledCollections = Object.values(props.collections).filter(c => (c.presentations || {})[c.enabled_presentation])
    const disabledCollections = Object.values(props.collections).filter(c => !(c.presentations || {})[c.enabled_presentation])
    enabledCollections.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
    disabledCollections.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
    this.state = {
      initialOrder: [...enabledCollections, ...disabledCollections].map(({ id }) => id),
    }
  }

  render() {
    const {
      collections,
      dispatch,
    } = this.props

    const { initialOrder } = this.state

    // remove collections that have gone away after opening
    const initialExistant = initialOrder.filter(id => this.props.collections[id])

    // add collections that were created after opening
    const newCollections = Object.keys(this.props.collections)
      .filter(id => !initialOrder.includes(id))

    const currentOrder = [...initialExistant, ...newCollections]

    return <div>
      <List disablePadding>
        {currentOrder.map(id => <PresentationsForCollection dispatch={dispatch} collection={collections[id]} key={id} />)}
      </List>
    </div>
  }
}

const mapStateToProps = ({ collections }) => {
  return {
    collections,
  }
}

export default connect(mapStateToProps)(RealLayersControl)
