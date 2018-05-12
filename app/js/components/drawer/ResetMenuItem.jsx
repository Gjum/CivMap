import React from 'react'
import { connect } from 'react-redux'

import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import RestorePageIcon from 'material-ui-icons/RestorePage'

import { appLoad, openBrowseMode, setDrawerClosed } from '../../store'
import { defaultAppState } from '../../utils/state'

const ResetMenuItem = ({ dispatch }) => {
  return <ListItem button
    onClick={() => {
      dispatch(openBrowseMode())
      dispatch(appLoad(defaultAppState))
      dispatch(setDrawerClosed())
    }}
  >
    <ListItemIcon><RestorePageIcon /></ListItemIcon>
    <ListItemText primary='Reset view' />
  </ListItem>
}

export default connect()(ResetMenuItem)
