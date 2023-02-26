import React from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'

import { IconButton } from '@mui/material'
import { CloseRounded, EditRounded, LayersRounded, MenuRounded, SearchRounded, ShareRounded } from '@mui/icons-material'

import CreateFeatureMenuButton from './edit/CreateFeatureMenuButton'
import { openBrowseMode, openEditMode, openLayers, openSearch, setDrawerOpen, lookupFeature, RootState } from '../store'

export default function() {
  const {
    collection,
    appMode,
    feature,
    searchQuery,
    viewport,
  } = useSelector(mapStateToProps)
  const dispatch = useDispatch()

  return <div className='appbar'>
    <IconButton onClick={() => dispatch(setDrawerOpen())}>
      <MenuRounded />
    </IconButton>

    {appMode === 'LAYERS' ||
      <IconButton onClick={() => dispatch(openLayers())}>
        <LayersRounded />
      </IconButton>
    }

    {appMode === 'SEARCH' ||
      <IconButton onClick={() => {
        // TODO search close/similar to active feature
        dispatch(openSearch())
      }}>
        <SearchRounded />
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
      <ShareRounded />
    </IconButton>

    <CreateFeatureMenuButton dispatch={dispatch} />

    <div className='appbar-stretch'>
      {/* CivMap */}
    </div>

    {appMode !== 'BROWSE' &&
      <IconButton onClick={() => dispatch(openBrowseMode())}>
        <CloseRounded />
      </IconButton>
    }
  </div>
}

function mapStateToProps(state: RootState) {
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
