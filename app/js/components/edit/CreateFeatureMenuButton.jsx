import React from 'react'
import Uuid from 'uuid'

import { IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material'
import { CircleRounded, AddRounded, ImageRounded, TimelineRounded, AddLocationRounded, PentagonRounded, RectangleRounded } from '@mui/icons-material'

import { openEditMode, createFeature, updateFeatureInCollection } from '../../store'

export default class CreateFeatureMenuButton extends React.Component {
  state = {
    anchorEl: null,
  }

  handleOpen = event => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleClose = () => {
    this.setState({ anchorEl: null })
  }

  render() {
    const { anchorEl } = this.state
    const { dispatch } = this.props

    const makeNewAndEdit = (defaultProps) => {
      const feature = createFeature({ ...defaultProps })
      dispatch(updateFeatureInCollection(feature.collectionId, feature))
      this.handleClose()
      dispatch(openEditMode(feature.id, feature.collectionId))
    }

    return <div>
      <IconButton onClick={this.handleOpen}>
        <AddRounded />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={this.handleClose}
      >
        <MenuItem
          onClick={() => makeNewAndEdit({ x: null, z: null })}
        >
          <ListItemIcon><AddLocationRounded /></ListItemIcon>
          Create marker
        </MenuItem>
        <MenuItem
          onClick={() => makeNewAndEdit({ line: null })}
        >
          <ListItemIcon><TimelineRounded /></ListItemIcon>
          Create line
        </MenuItem>
        <MenuItem
          onClick={() => makeNewAndEdit({ rectangle: null })}
        >
          <ListItemIcon><RectangleRounded /></ListItemIcon>
          Create rectangle
        </MenuItem>
        <MenuItem
          onClick={() => makeNewAndEdit({ polygon: null })}
        >
          <ListItemIcon><PentagonRounded /></ListItemIcon>
          Create polygon
        </MenuItem>
        {/* <MenuItem disabled
          onClick={() => makeNewAndEdit({ x: null, z: null, radius: null })}
        >
          <ListItemIcon><CircleRounded /></ListItemIcon>
          Create circle
        </MenuItem>
        <MenuItem disabled
          onClick={() => makeNewAndEdit({ map_image: null })}
        >
          <ListItemIcon><ImageRounded /></ListItemIcon>
          Create image
        </MenuItem> */}
      </Menu>
    </div>
  }
}
