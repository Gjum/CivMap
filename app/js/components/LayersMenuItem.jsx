import React from 'react';
import { connect } from 'react-redux';

import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import LayersIcon from 'material-ui-icons/Layers';

import { openOverlayEditor, setDrawerClosed } from '../actions';

const LayersMenuItem = ({
  openOverlayEditor,
  setDrawerClosed,
}) => {
  return (
    <ListItem button
      onClick={() => {
        openOverlayEditor();
        setDrawerClosed();
      }}
    >
      <ListItemIcon><LayersIcon /></ListItemIcon>
      <ListItemText primary='Open Overlay Editor' />
    </ListItem>
  );
}

const mapDispatchToProps = {
  openOverlayEditor,
  setDrawerClosed,
};

export default connect(undefined, mapDispatchToProps)(LayersMenuItem);
