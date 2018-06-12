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
      if (feature && feature.source) {
        const name = (feature.name || '').replace(' ', '_')
        location.hash = `#q=${name}#f=${feature.id}#url=${feature.source}`
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
    viewport: mapView.viewport,
  }
}

export default connect(mapStateToProps)(AppBar)
