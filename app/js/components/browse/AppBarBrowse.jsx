import React from 'react'
import { connect } from 'react-redux'

import { default as MuiAppBar } from 'material-ui/AppBar'
import IconButton from 'material-ui/IconButton'
import ShareIcon from 'material-ui-icons/Share'
import Toolbar from 'material-ui/Toolbar'
import Tooltip from 'material-ui/Tooltip'
import Typography from 'material-ui/Typography'

import MenuIcon from 'material-ui-icons/Menu'
import SearchIcon from 'material-ui-icons/Search'
import LayersIcon from 'material-ui-icons/Layers'

import { openLayersSelect, openSearch, openShare, setDrawerOpen } from '../../store'

const AppBarBrowse = ({
  viewport,
  borderApothem,
  openLayersSelect,
  openSearch,
  openShare,
  setDrawerOpen,
}) => {

  let title = 'ccMap'
  if (viewport && viewport.radius < borderApothem) {
    title = `${viewport.x}, ${viewport.z}`
  }

  return <div className='appbar custom-appbar'>
    <IconButton onClick={setDrawerOpen}>
      <MenuIcon />
    </IconButton>

    <div className='appbar-stretch'>
      {title}
    </div>

    <Tooltip title="Search everything">
      <IconButton disabled onClick={openSearch}>
        <SearchIcon />
      </IconButton>
    </Tooltip>

    <Tooltip title="Share what you see">
      <IconButton disabled onClick={openShare}>
        <ShareIcon />
      </IconButton>
    </Tooltip>

    <Tooltip title="Edit layers">
      <IconButton onClick={openLayersSelect}>
        <LayersIcon />
      </IconButton>
    </Tooltip>
  </div>
}

const mapStateToProps = ({ mapConfig, mapView }) => {
  return {
    viewport: mapView.viewport,
    borderApothem: mapConfig.borderApothem,
  }
}

const mapDispatchToProps = {
  openLayersSelect,
  openSearch,
  openShare,
  setDrawerOpen,
}

export default connect(mapStateToProps, mapDispatchToProps)(AppBarBrowse)
