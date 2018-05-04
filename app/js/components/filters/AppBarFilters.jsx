import React from 'react'
import { connect } from 'react-redux'

import CloseIcon from 'material-ui-icons/Close'
import EditIcon from 'material-ui-icons/Edit'
import IconButton from 'material-ui/IconButton'
import MenuIcon from 'material-ui-icons/Menu'
import SearchIcon from 'material-ui-icons/Search'
import ShareIcon from 'material-ui-icons/Share'

import CreateFeatureMenuButton from '../edit/CreateFeatureMenuButton'
import { openBrowseMode, openEditMode, openSearch, openShare, setDrawerOpen } from '../../store'

const AppBarFilters = ({
  filters,
  dispatch,
}) => {
  return <div className='appbar custom-appbar'>
    <IconButton onClick={() => dispatch(setDrawerOpen())}>
      <MenuIcon />
    </IconButton>

    <div className='appbar-stretch'>Filters</div>

    <IconButton disabled onClick={() => dispatch(openSearch())}>
      <SearchIcon />
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

const mapStateToProps = ({ features, control }) => {
  return {
    feature: features[control.featureId],
  }
}

export default connect(mapStateToProps)(AppBarFilters)
