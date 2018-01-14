import React from 'react';
import { connect } from 'react-redux';

import { default as MuiAppBar } from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import ShareIcon from 'material-ui-icons/Share';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import MenuIcon from 'material-ui-icons/Menu';
import SearchIcon from 'material-ui-icons/Search';
import CloseIcon from 'material-ui-icons/Close';

import { openBrowseMode, openLayerEditor, openSearch, openShare, setDrawerOpen } from '../../actions';

const AppBarLayers = ({
  openBrowseMode,
  openLayerEditor,
  openSearch,
  openShare,
  setDrawerOpen,
}) => {
  return (
    <div className='appbar custom-appbar'>
      <IconButton onClick={setDrawerOpen}>
        <MenuIcon />
      </IconButton>

      <div className='appbar-stretch'>Layers</div>

      <IconButton disabled onClick={openSearch}>
        <SearchIcon />
      </IconButton>

      <IconButton disabled onClick={openShare}>
        <ShareIcon />
      </IconButton>

      <IconButton onClick={openBrowseMode}>
        <CloseIcon />
      </IconButton>
    </div>
  );
};

const mapStateToProps = ({ mapConfig, mapView }) => {
  return {
    borderApothem: mapConfig.borderApothem,
  };
};

const mapDispatchToProps = {
  openBrowseMode,
  openLayerEditor,
  openSearch,
  openShare,
  setDrawerOpen,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppBarLayers);
