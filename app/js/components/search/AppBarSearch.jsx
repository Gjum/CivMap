import React from 'react'
import { connect } from 'react-redux'

import CloseIcon from 'material-ui-icons/Close'
import EditIcon from 'material-ui-icons/Edit'
import FiltersIcon from 'material-ui-icons/FilterList'
import IconButton from 'material-ui/IconButton'
import MenuIcon from 'material-ui-icons/Menu'
import ShareIcon from 'material-ui-icons/Share'

import CreateFeatureMenuButton from '../edit/CreateFeatureMenuButton'
import { openBrowseMode, openEditMode, openFilters, openShare, setDrawerOpen } from '../../store'

// TODO search field in appbar instead of sidebar
// so it doesn't disappear when scrolling through the results

const AppBarFilters = ({
  dispatch,
  searchQuery,
}) => {
  return <div className='appbar custom-appbar'>
    <IconButton onClick={() => dispatch(setDrawerOpen())}>
      <MenuIcon />
    </IconButton>

    <div className='appbar-stretch'>Search</div>

    <IconButton onClick={() => dispatch(openFilters())}>
      <FiltersIcon />
    </IconButton>

    <IconButton disabled onClick={() => dispatch(openShare())}>
      <ShareIcon />
    </IconButton>

    <CreateFeatureMenuButton dispatch={dispatch} />

    <IconButton onClick={() => dispatch(openBrowseMode())}>
      <CloseIcon />
    </IconButton>
  </div>
}

const mapStateToProps = ({ control: { searchQuery } }) => {
  return {
    searchQuery,
  }
}

export default connect(mapStateToProps)(AppBarFilters)
