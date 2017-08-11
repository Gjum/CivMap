import React from 'react';
import { connect } from 'react-redux';

import { default as MuiAppBar } from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import ShareIcon from 'material-ui-icons/Share';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import MenuIcon from 'material-ui-icons/Menu';
import SearchIcon from 'material-ui-icons/Search';
import ModeEditIcon from 'material-ui-icons/ModeEdit';

import { openOverlayEditor, openSearch, openShare, setDrawerOpen } from '../actions';
import { shouldDrawerDock } from '../utils/WindowSize.js';

const AppBar = ({
  lastView,
  borderApothem,
  windowHeight,
  windowWidth,
  openOverlayEditor,
  openSearch,
  openShare,
  setDrawerOpen,
}) => {
  const showMenuIcon = !shouldDrawerDock({ windowHeight, windowWidth });

  let title = 'ccMap';
  if (lastView && lastView.radius < borderApothem) {
    title = `${lastView.x}, ${lastView.z}`;
  }

  return (
    <MuiAppBar position="static" className='appBar' color='default'>
      <Toolbar>
        {showMenuIcon &&
          <IconButton
            onClick={setDrawerOpen}
          >
            <MenuIcon />
          </IconButton>
        }
        <Typography type="title" className='appBarTitle'>
          {title}
        </Typography>
        <IconButton
          disabled
          onClick={openSearch}
        >
          <SearchIcon />
        </IconButton>
        <IconButton
          disabled
          onClick={openShare}
        >
          <ShareIcon />
        </IconButton>
        <IconButton
          disabled
          onClick={openOverlayEditor}
        >
          <ModeEditIcon />
        </IconButton>
      </Toolbar>
    </MuiAppBar>
  );
};

const mapStateToProps = ({ control, mapConfig, mapView }) => {
  const { windowHeight, windowWidth } = control;
  return {
    lastView: mapView.lastView,
    borderApothem: mapConfig.borderApothem,
    windowHeight,
    windowWidth,
  };
};

const mapDispatchToProps = {
  openOverlayEditor,
  openSearch,
  openShare,
  setDrawerOpen,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppBar);
