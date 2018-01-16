import React from 'react'
import { connect } from 'react-redux'

import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import PersonPinCircleIcon from 'material-ui-icons/PersonPinCircle'

import { openWaypointsEditor } from '../../store'

const WaypointsMenuItem = ({
  openWaypointsEditor,
  setDrawerClosed,
}) => {
  return <ListItem button
    disabled
    onClick={() => {
      openWaypointsEditor()
    }}
  >
    <ListItemIcon><PersonPinCircleIcon /></ListItemIcon>
    <ListItemText
      primary='Import your Waypoints'
      secondary='only visible to you'
    />
  </ListItem>
}

const mapDispatchToProps = {
  openWaypointsEditor,
}

export default connect(undefined, mapDispatchToProps)(WaypointsMenuItem)
