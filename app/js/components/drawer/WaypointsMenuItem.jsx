import React from 'react'
import { connect } from 'react-redux'

import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import PersonPinCircleIcon from 'material-ui-icons/PersonPinCircle'

import { openWaypointsImport } from '../../store'

const WaypointsMenuItem = ({
  openWaypointsImport,
  setDrawerClosed,
}) => {
  return <ListItem button
    disabled
    onClick={() => {
      openWaypointsImport()
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
  openWaypointsImport,
}

export default connect(undefined, mapDispatchToProps)(WaypointsMenuItem)
