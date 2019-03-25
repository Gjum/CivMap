import React from 'react'
import Uuid from 'uuid'

import IconButton from '@material-ui/core/IconButton'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

import CircleIcon from '@material-ui/icons/AddCircle'
import EditIcon from '@material-ui/icons/Edit'
import ImageIcon from '@material-ui/icons/InsertPhoto'
import LineIcon from '@material-ui/icons/Timeline'
import MarkerIcon from '@material-ui/icons/AddLocation'
import PolygonIcon from '@material-ui/icons/PanoramaHorizontal'

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
        <EditIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={this.handleClose}
      >
        <MenuItem
          onClick={() => makeNewAndEdit({ x: null, z: null })}
        >
          <ListItemIcon><MarkerIcon /></ListItemIcon>
          Create marker
        </MenuItem>
        <MenuItem
          onClick={() => makeNewAndEdit({ line: null })}
        >
          <ListItemIcon><LineIcon /></ListItemIcon>
          Create line
        </MenuItem>
        <MenuItem disabled
          onClick={() => makeNewAndEdit({ polygon: null })}
        >
          <ListItemIcon><PolygonIcon /></ListItemIcon>
          Create area
        </MenuItem>
        <MenuItem disabled
          onClick={() => makeNewAndEdit({ x: null, z: null, radius: null })}
        >
          <ListItemIcon><CircleIcon /></ListItemIcon>
          Create circle
        </MenuItem>
        <MenuItem disabled
          onClick={() => makeNewAndEdit({ map_image: null })}
        >
          <ListItemIcon><ImageIcon /></ListItemIcon>
          Create image
        </MenuItem>
      </Menu>
    </div>
  }
}
