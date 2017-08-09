import React from 'react';
import { connect } from 'react-redux';

import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import PersonPinCircleIcon from 'material-ui-icons/PersonPinCircle';

import { setDrawerClosed, openWaypointsEditor } from '../actions';

const WaypointsMenuItem = ({
  openWaypointsEditor,
  setDrawerClosed,
}) => {
  const getClassName = mapId => mapId == basemap ? ' basemap-selector-current' : null;
  return (
    <ListItem button
      disabled
      onClick={() => {
        openWaypointsEditor();
        setDrawerClosed();
      }}
    >
      <ListItemIcon><PersonPinCircleIcon /></ListItemIcon>
      <ListItemText
        primary='Import your Waypoints'
        secondary='only visible to you'
      />
    </ListItem>
  );
}

const mapDispatchToProps = {
  setDrawerClosed,
  openWaypointsEditor,
};

export default connect(undefined, mapDispatchToProps)(WaypointsMenuItem);
