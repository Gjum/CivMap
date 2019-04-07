import React from 'react'
import { connect } from 'react-redux'

import IconButton from '@material-ui/core/IconButton'

import CloseIcon from '@material-ui/icons/Close'
import EditIcon from '@material-ui/icons/Edit'
import LayersIcon from '@material-ui/icons/Layers'
import MenuIcon from '@material-ui/icons/Menu'
import SearchIcon from '@material-ui/icons/Search'
import ShareLinkIcon from '@material-ui/icons/Link'

import CreateFeatureMenuButton from './edit/CreateFeatureMenuButton'
import { openBrowseMode, openEditMode, openLayers, openSearch, setDrawerOpen, lookupFeature } from '../store'

const AppBar = ({
  collection,
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

    {appMode === 'LAYERS' ||
      <IconButton onClick={() => dispatch(openLayers())}>
        <LayersIcon />
      </IconButton>
    }

    {appMode === 'SEARCH' ||
      <IconButton onClick={() => {
        // TODO search close/similar to active feature
        dispatch(openSearch())
      }}>
        <SearchIcon />
      </IconButton>
    }

    <IconButton onClick={() => {
      if (appMode === 'FEATURE' && feature && collection && collection.source) {
        const name = encodeURIComponent(feature.name || '')//.replace('%20', '_')
        location.hash = `#q=${name}#f=${encodeURIComponent(feature.id)}#url=${encodeURIComponent(collection.source)}`
      } else if (appMode === 'SEARCH' && searchQuery) {
        location.hash = `#q=${encodeURIComponent(searchQuery)}`
      } else {
        const { x, z, radius } = viewport
        location.hash = `c=${x},${z},r${radius}`
        // TODO better location sharing: create marker with name prompt, add query for close-by features, etc.
      }
    }}>
      <ShareLinkIcon />
    </IconButton>

    {appMode === 'FEATURE' ?
      <IconButton onClick={() => {
        dispatch(openEditMode(feature.id, feature.collectionId))
      }}>
        <EditIcon />
      </IconButton>
      :
      <CreateFeatureMenuButton dispatch={dispatch} />
    }

    <div className='appbar-stretch'>
      {/* CivMap */}
    </div>

    {appMode !== 'BROWSE' &&
      <IconButton onClick={() => dispatch(openBrowseMode())}>
        <CloseIcon />
      </IconButton>
    }
  </div>
}

const mapStateToProps = (state) => {
  const { collections, control, mapView } = state
  const { activeFeatureCollection, activeFeatureId, appMode, searchQuery } = control
  return {
    appMode: appMode,
    collection: collections[activeFeatureCollection],
    feature: lookupFeature(state, activeFeatureId, activeFeatureCollection),
    searchQuery: searchQuery,
    viewport: mapView.viewport,
  }
}

export default connect(mapStateToProps)(AppBar)
