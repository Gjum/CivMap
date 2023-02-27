import React from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'

import { Avatar, List, ListItem, ListItemAvatar, ListItemText, ListSubheader } from '@mui/material'

import { RootState, setActiveBasemap } from '../../../../store'

function BasemapIcon({ basemapId, basemapPreview, tilesRoot }) {
    return <ListItemAvatar>
        <Avatar
            src={tilesRoot + basemapId + basemapPreview}
        />
    </ListItemAvatar>
}

export default function(props) {
    const { activeBasemapId, basemapPreview, basemaps, tilesRoot } = useSelector((state: RootState) => ({ ...state.mapConfig, activeBasemapId: state.mapView.basemapId }))
    const dispatch = useDispatch()

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
                    // dispatch(setDrawerClosed())
                }}
            >
                <BasemapIcon basemapId={id} basemapPreview={basemapPreview} tilesRoot={tilesRoot} />
                <ListItemText primary={name} />
            </ListItem>
        )}
    </List >
}
