import React from 'react';
import { connect } from 'react-redux';

import { default as MuiDrawer } from 'material-ui/Drawer';

import { setDrawerClosed } from '../actions';

const Drawer = ({
  setDrawerClosed,
  drawerOpen,
  children,
}) => {
  return (
    <MuiDrawer
      className="drawer"
      open={drawerOpen}
      onRequestClose={setDrawerClosed}
    >
      {children}
    </MuiDrawer>
  );
};

const mapStateToProps = ({ control: { drawerOpen } }, ownProps) => {
  return { drawerOpen };
};

const mapDispatchToProps = {
  setDrawerClosed,
};

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);
