import React from 'react'
import { connect } from 'react-redux'

import IconButton from 'material-ui/IconButton'

import EditIcon from 'material-ui-icons/Edit'
import FilterIcon from 'material-ui-icons/FilterList'
import MenuIcon from 'material-ui-icons/Menu'
import SearchIcon from 'material-ui-icons/Search'
import ShareIcon from 'material-ui-icons/Share'

import CreateFeatureMenuButton from '../edit/CreateFeatureMenuButton'
import { openEditMode, openFilters, openSearch, openShare, setDrawerOpen } from '../../store'

const AppBarBrowse = ({
  viewport,
  borderApothem,
  dispatch,
}) => {
  return <div className='appbar custom-appbar'>
    <IconButton onClick={() => dispatch(setDrawerOpen())}>
      <MenuIcon />
    </IconButton>

    <IconButton onClick={() => dispatch(openSearch())}>
      <SearchIcon />
    </IconButton>

    <IconButton onClick={() => {
      const { x, z, radius } = viewport
      location.hash = `c=${x},${z},r${radius}`
      // TODO better location sharing
    }}>
      <ShareIcon />
    </IconButton>

    <IconButton onClick={() => dispatch(openFilters())}>
      <FilterIcon />
    </IconButton>

    <CreateFeatureMenuButton dispatch={dispatch} />

    <div className='appbar-stretch'>
      CivMap
    </div>
  </div>
}

const mapStateToProps = ({ mapConfig, mapView }) => {
  return {
    viewport: mapView.viewport,
    borderApothem: mapConfig.borderApothem,
  }
}

export default connect(mapStateToProps)(AppBarBrowse)
