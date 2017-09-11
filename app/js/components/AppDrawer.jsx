import React from 'react';
import { connect } from 'react-redux';

import Drawer from 'material-ui/Drawer';

import { setDrawerClosed } from '../actions';

const AppDrawer = ({
  drawerOpen,
  setDrawerClosed,
  children,
}) => {
  return (
    <Drawer
      className="drawer"
      open={drawerOpen}
      onRequestClose={setDrawerClosed}
    >
      {children}
    </Drawer>
  );
};

const mapStateToProps = ({ control: { drawerOpen } }, ownProps) => {
  return { drawerOpen };
};

const mapDispatchToProps = {
  setDrawerClosed,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppDrawer);
