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

const AppBarBrowse = ({
  lastView,
  borderApothem,
  openOverlayEditor,
  openSearch,
  openShare,
  setDrawerOpen,
}) => {

  let title = 'ccMap';
  if (lastView && lastView.radius < borderApothem) {
    title = `${lastView.x}, ${lastView.z}`;
  }

  return (
    <div className='appbar custom-appbar'>
      <IconButton
        onClick={setDrawerOpen}
      >
        <MenuIcon />
      </IconButton>

      <div className='appbar-stretch'>
        {title}
      </div>

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
    </div>
  );
};

const mapStateToProps = ({ mapConfig, mapView }) => {
  return {
    lastView: mapView.lastView,
    borderApothem: mapConfig.borderApothem,
  };
};

const mapDispatchToProps = {
  openOverlayEditor,
  openSearch,
  openShare,
  setDrawerOpen,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppBarBrowse);
