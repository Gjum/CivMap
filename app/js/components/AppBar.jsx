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
  basemapName,
  windowHeight,
  windowWidth,
  openOverlayEditor,
  openSearch,
  openShare,
  setDrawerOpen,
}) => {
  const showMenuIcon = !shouldDrawerDock({ windowHeight, windowWidth });
  return (
    <MuiAppBar position="static" className='appBar'>
      <Toolbar>
        {showMenuIcon &&
          <IconButton color="inherit" onClick={setDrawerOpen}>
            <MenuIcon />
          </IconButton>
        }
        <Typography type="title" color="inherit" className='appBarTitle'>
          {basemapName} Map
        </Typography>
        <IconButton color="inherit" onClick={openSearch}>
          <SearchIcon />
        </IconButton>
        <IconButton color="inherit" onClick={openShare}>
          <ShareIcon />
        </IconButton>
        <IconButton color="inherit" onClick={openOverlayEditor}>
          <ModeEditIcon />
        </IconButton>
      </Toolbar>
    </MuiAppBar>
  );
};

const mapStateToProps = ({ control, mapConfig, mapView }) => {
  const { windowHeight, windowWidth } = control;
  return {
    basemapName: mapConfig.basemaps[mapView.basemapId].name,
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
