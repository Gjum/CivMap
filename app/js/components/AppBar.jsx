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

const AppBar = ({
  basemapName,
  setDrawerOpen,
  openOverlayEditor,
  openSearch,
}) => {
  return (
    <MuiAppBar position="static" className='appBar'>
      <Toolbar>
        <IconButton color="inherit"
          onClick={setDrawerOpen}
        >
          <MenuIcon />
        </IconButton>
        <Typography type="title" color="inherit" className='appBarTitle'>
          {basemapName} Map
        </Typography>
        <IconButton color="inherit"
          onClick={openSearch}
        >
          <SearchIcon />
        </IconButton>
        <IconButton color="inherit"
          onClick={openOverlayEditor}
        >
          <ModeEditIcon />
        </IconButton>
      </Toolbar>
    </MuiAppBar>
  );
};

const mapStateToProps = ({ mapConfig, mapView }) => {
  return {
    basemapName: mapConfig.basemaps[mapView.basemapId].name,
  };
};

const mapDispatchToProps = {
  setDrawerOpen,
  openOverlayEditor,
  openSearch,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppBar);
