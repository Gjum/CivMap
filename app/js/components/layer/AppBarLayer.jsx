// XXX implement or remove
import React from 'react'
import { connect } from 'react-redux'

import { default as MuiAppBar } from 'material-ui/AppBar'
import IconButton from 'material-ui/IconButton'
import ShareIcon from 'material-ui-icons/Share'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'

import MenuIcon from 'material-ui-icons/Menu'
import SearchIcon from 'material-ui-icons/Search'
import CloseIcon from 'material-ui-icons/Close'

import { openBrowseMode, openOverlayEditor, openSearch, openShare, setDrawerOpen } from '../../actions'

const AppBarLayer = ({
  layer,
  openBrowseMode,
  openOverlayEditor, // XXX go back to layers
  openSearch,
  openShare,
  setDrawerOpen,
}) => {
  return (
    <div className='appbar custom-appbar'>
      <IconButton onClick={setDrawerOpen}>
        <MenuIcon />
      </IconButton>

      <div className='appbar-stretch'>{layer.properties.name || 'Some ' + layer.geometry.type}</div>

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
  )
}

const mapStateToProps = ({ layers, control }) => {
  return {
    layer: layers[control.layerId],
  }
}

const mapDispatchToProps = {
  openBrowseMode,
  openOverlayEditor,
  openSearch,
  openShare,
  setDrawerOpen,
}

export default connect(mapStateToProps, mapDispatchToProps)(AppBarLayer)
