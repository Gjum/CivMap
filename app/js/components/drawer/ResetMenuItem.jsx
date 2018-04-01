import React from 'react'
import { connect } from 'react-redux'

import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import DeleteForeverIcon from 'material-ui-icons/DeleteForever'

import { appLoad, clearFeatures, setDrawerClosed } from '../../store'
import { defaultAppState } from '../../utils/state'

const ResetMenuItem = ({ dispatch }) => {
  return <ListItem button
    onClick={() => {
      dispatch(clearFeatures())
      dispatch(appLoad(defaultAppState))
      dispatch(setDrawerClosed())
    }}
  >
    <ListItemIcon><DeleteForeverIcon /></ListItemIcon>
    <ListItemText primary='Reset all data' />
  </ListItem>
}

export default connect()(ResetMenuItem)
