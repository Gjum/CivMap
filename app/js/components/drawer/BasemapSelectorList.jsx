import React from 'react'
import { connect } from 'react-redux'

import { Avatar, List, ListItem, ListItemAvatar, ListItemText, ListSubheader } from '@mui/material'

import { setDrawerClosed, setActiveBasemap } from '../../store'

const BasemapIcon = ({ basemapId, basemapPreview, tilesRoot }) => {
  return <ListItemAvatar>
    <Avatar
      src={tilesRoot + basemapId + basemapPreview}
    />
  </ListItemAvatar>
}

const BasemapSelectorList = ({
  activeBasemapId,
  basemapPreview,
  basemaps,
  tilesRoot,
  dispatch,
}) => {
  const getClassName = id => id == activeBasemapId ? ' basemap-selector-current' : null
  return <List disablePadding
    subheader={<ListSubheader>Basemap</ListSubheader>}
  >
    {Object.values(basemaps).map(({ id, name }) =>
      <ListItem key={id}
        button
        className={getClassName(id)}
        onClick={() => {
          dispatch(setActiveBasemap(id))
          dispatch(setDrawerClosed())
        }}
      >
        <BasemapIcon basemapId={id} basemapPreview={basemapPreview} tilesRoot={tilesRoot} />
        <ListItemText primary={name} />
      </ListItem>
    )}
  </List >
}

const mapStateToProps = ({ mapConfig, mapView }, ownProps) => {
  return {
    activeBasemapId: mapView.basemapId,
    ...mapConfig,
  }
}

export default connect(mapStateToProps)(BasemapSelectorList)
