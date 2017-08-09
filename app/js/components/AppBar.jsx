import React from 'react';
import { connect } from 'react-redux';

import { default as MuiAppBar } from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import MenuIcon from 'material-ui-icons/Menu';
import SearchIcon from 'material-ui-icons/Search';
import ModeEditIcon from 'material-ui-icons/ModeEdit';

import { setDrawerOpen, openOverlayEditor, openSearch } from '../actions';
import { shouldDrawerDock } from '../utils/WindowSize.js';

const AppBar = ({
  basemapName,
  windowHeight,
  windowWidth,
  setDrawerOpen,
  openOverlayEditor,
  openSearch,
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
  setDrawerOpen,
  openOverlayEditor,
  openSearch,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppBar);
