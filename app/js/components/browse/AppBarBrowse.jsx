import React from 'react'
import { connect } from 'react-redux'

import EditIcon from 'material-ui-icons/Edit'
import FilterIcon from 'material-ui-icons/FilterList'
import IconButton from 'material-ui/IconButton'
import MenuIcon from 'material-ui-icons/Menu'
import SearchIcon from 'material-ui-icons/Search'
import ShareIcon from 'material-ui-icons/Share'

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

    <IconButton disabled onClick={() => dispatch(openSearch())}>
      <SearchIcon />
    </IconButton>

    <IconButton disabled onClick={() => dispatch(openShare())}>
      <ShareIcon />
    </IconButton>

    <IconButton onClick={() => dispatch(openFilters())}>
      <FilterIcon />
    </IconButton>

    <IconButton onClick={() => dispatch(openEditMode())}>
      <EditIcon />
    </IconButton>

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
