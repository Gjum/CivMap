import React from 'react'
import { connect } from 'react-redux'

import IconButton from 'material-ui/IconButton'

import CloseIcon from 'material-ui-icons/Close'
import EditIcon from 'material-ui-icons/Edit'
import LaunchIcon from 'material-ui-icons/Launch'
import LayersIcon from 'material-ui-icons/Layers'
import MenuIcon from 'material-ui-icons/Menu'
import SearchIcon from 'material-ui-icons/Search'

import CreateFeatureMenuButton from './edit/CreateFeatureMenuButton'
import { openBrowseMode, openLayers, openSearch, setDrawerOpen } from '../store'

const AppBar = ({
  appMode,
  feature,
  searchQuery,
  viewport,
  dispatch,
}) => {
  return <div className='appbar'>
    <IconButton onClick={() => dispatch(setDrawerOpen())}>
      <MenuIcon />
    </IconButton>

    {appMode === 'SEARCH' ||
      <IconButton onClick={() => dispatch(openSearch())}>
        <SearchIcon />
      </IconButton>
    }

    {appMode === 'LAYERS' ||
      <IconButton onClick={() => dispatch(openLayers())}>
        <LayersIcon />
      </IconButton>
    }

    <IconButton onClick={() => {
      if (appMode === 'FEATURE' && feature && feature.source) {
        const name = encodeURIComponent(feature.name || '').replace('%20', '_')
        location.hash = `#q=${name}#f=${encodeURIComponent(feature.id)}#url=${encodeURIComponent(feature.source)}`
      } else  if (appMode === 'SEARCH' && searchQuery) {
        location.hash = `#q=${encodeURIComponent(searchQuery)}`
      } else {
        const { x, z, radius } = viewport
        location.hash = `c=${x},${z},r${radius}`
        // TODO better location sharing
      }
    }}>
      <LaunchIcon />
    </IconButton>

    {appMode === 'EDIT' ||
      <CreateFeatureMenuButton dispatch={dispatch} />
    }

    <div className='appbar-stretch'>
      {/* CivMap */}
    </div>

    {appMode === 'BROWSE' ||
      <IconButton onClick={() => dispatch(openBrowseMode())}>
        <CloseIcon />
      </IconButton>
    }
  </div>
}

const mapStateToProps = ({ control, features, mapView }) => {
  return {
    appMode: control.appMode,
    feature: features.featuresMerged[control.activeFeatureId],
    searchQuery: control.searchQuery,
    viewport: mapView.viewport,
  }
}

export default connect(mapStateToProps)(AppBar)
