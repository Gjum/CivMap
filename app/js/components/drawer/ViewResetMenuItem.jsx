import React from 'react';
import { connect } from 'react-redux';

import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import RestorePageIcon from 'material-ui-icons/RestorePage';

import { appLoad, setDrawerClosed } from '../../actions';
import { defaultAppState } from '../../utils/State';

const ViewResetMenuItem = ({
  appLoad,
  setDrawerClosed,
}) => {
  return (
    <ListItem button
      onClick={() => {
        appLoad(defaultAppState);
        setDrawerClosed();
      }}
    >
      <ListItemIcon><RestorePageIcon /></ListItemIcon>
      <ListItemText primary='Reset View' />
    </ListItem>
  );
}

const mapDispatchToProps = {
  appLoad,
  setDrawerClosed,
};

export default connect(undefined, mapDispatchToProps)(ViewResetMenuItem);
