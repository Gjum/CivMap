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

import { openBrowseMode, openLayerEditor, openSearch, openShare, setDrawerOpen } from '../actions'

const AppBarFeature = ({
  feature,
  openBrowseMode,
  openLayerEditor, // XXX go back to feature's layer
  openSearch,
  openShare,
  setDrawerOpen,
}) => {
  return (
    <div className='appbar custom-appbar'>
      <IconButton
        onClick={setDrawerOpen}
      >
        <MenuIcon />
      </IconButton>

      <div className='appbar-stretch'>{feature.properties.name || 'Some ' + feature.geometry.type}</div>

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
        onClick={openBrowseMode}
      >
        <CloseIcon />
      </IconButton>
    </div>
  )
}

const mapStateToProps = ({ overlay, control }) => {
  const { featureId, layerId } = control
  const layer = overlay.find(layer => layer.id === layerId)
  const feature = layer.features.find(feature => feature.id === featureId)
  // TODO this is slow and happens often, store features by id in separate map
  return {
    feature,
  }
}

const mapDispatchToProps = {
  openBrowseMode,
  openLayerEditor,
  openSearch,
  openShare,
  setDrawerOpen,
}

export default connect(mapStateToProps, mapDispatchToProps)(AppBarFeature)
