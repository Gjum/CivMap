import React from 'react';
import { connect } from 'react-redux';

import Drawer from 'material-ui/Drawer';

import { setDrawerClosed } from '../actions';
import { shouldDrawerDock } from '../utils/WindowSize.js';

const AppDrawer = ({
  drawerOpen,
  windowHeight,
  windowWidth,
  setDrawerClosed,
  children,
}) => {
  const drawerDocked = shouldDrawerDock({ windowHeight, windowWidth });
  return (
    <Drawer
      className="drawer"
      docked={drawerDocked}
      open={drawerOpen || drawerDocked}
      onRequestClose={setDrawerClosed}
    >
      {children}
    </Drawer>
  );
};

const mapStateToProps = ({ control: { drawerOpen, windowHeight, windowWidth } }, ownProps) => {
  return { drawerOpen, windowHeight, windowWidth };
};

const mapDispatchToProps = {
  setDrawerClosed,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppDrawer);
