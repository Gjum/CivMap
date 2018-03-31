import React from 'react'
import { connect } from 'react-redux'

import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import DeleteForeverIcon from 'material-ui-icons/DeleteForever'

import { appLoad, setDrawerClosed } from '../../store'
import { defaultAppState } from '../../utils/state'

const ResetMenuItem = ({
  appLoad,
  setDrawerClosed,
}) => {
  return <ListItem button
    onClick={() => {
      appLoad(defaultAppState)
      setDrawerClosed()
    }}
  >
    <ListItemIcon><DeleteForeverIcon /></ListItemIcon>
    <ListItemText primary='Reset all data' />
  </ListItem>
}

const mapDispatchToProps = {
  appLoad,
  setDrawerClosed,
}

export default connect(undefined, mapDispatchToProps)(ResetMenuItem)
