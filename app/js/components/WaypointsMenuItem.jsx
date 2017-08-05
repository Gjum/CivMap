import React from 'react';
import { connect } from 'react-redux';

import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import PersonPinCircleIcon from 'material-ui-icons/PersonPinCircle';

import { setDrawerClosed, openWaypointsEditor } from '../actions';

const WaypointsMenuItem = ({
  layer,
  setDrawerClosed,
  openWaypointsEditor,
}) => {
  const getClassName = mapId => mapId == basemap ? ' basemap-selector-current' : null;
  return (
    <ListItem button
      onClick={() => {
        openWaypointsEditor();
        setDrawerClosed();
      }}
    >
      <ListItemIcon><PersonPinCircleIcon /></ListItemIcon>
      <ListItemText
        primary='Import your Waypoints'
        secondary='for your eyes only'
      />
    </ListItem>
  );
}

const mapStateToProps = ({ overlay }) => {
  return overlay.find(l => l.properties.isWaypointsLayer);
};

const mapDispatchToProps = {
  setDrawerClosed,
  openWaypointsEditor,
};

export default connect(mapStateToProps, mapDispatchToProps)(WaypointsMenuItem);
