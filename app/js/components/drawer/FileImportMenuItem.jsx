import React from 'react'
import { connect } from 'react-redux'

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, ListItem, ListItemIcon, ListItemText, TextField } from '@mui/material'
import { Close, FileUpload } from '@mui/icons-material'

import { getFileProcessor, processVoxelWaypointsText } from '../../utils/importFile'
import { setDrawerClosed } from '../../store'

export class ImportDialog extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      importText: '',
    }
  }

  render() {
    return <Dialog
      open={true}
      onClose={() => this.props.onClose()}
    >
      <DialogTitle>Import anything</DialogTitle>
      <DialogContent>
        <DialogContentText>
          VoxelMap's waypoints are stored in <code>(.minecraft location)\mods\VoxelMods\voxelMap\(server address).points</code>
        </DialogContentText>
        <DialogContentText>
          SnitchMaster's snitches are stored in <code>(.minecraft location)\mods\Snitch-Master\(server address)\Snitches.csv</code>
        </DialogContentText>
        <DialogContentText>
          You can also drag and drop files onto the map to load them.
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth margin="dense"
          multiline rows={2} maxRows={10}
          label="Paste your Waypoints/Snitches/JSON here"
          value={this.state.importText}
          onChange={e => this.setState({ importText: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => this.props.onClose()}>
          <Close />
          Close
        </Button>
        <Button
          color='primary'
          disabled={!this.state.importText}
          onClick={() => this.props.onImport(this.state.importText)}
        >
          <FileUpload />
          Import
        </Button>
      </DialogActions>
    </Dialog>
  }
}

class FileImportMenuItem extends React.Component {
  state = { dialogOpen: false }

  handleFileSelect = (event) => {
    const dispatch = this.props.dispatch

    dispatch(setDrawerClosed())

    const unknownFiles = []

    const files = event.target.files
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      const fp = getFileProcessor(file.name)
      if (fp) {
        fp.process(file, dispatch)
      } else {
        unknownFiles.push(file.name)
      }
    }

    if (unknownFiles.length) {
      alert(`Unknown file types for: ${unknownFiles.join(', ')}`)
    }
  }

  handleTextImport = (importText) => {
    const dispatch = this.props.dispatch
    dispatch(setDrawerClosed())
    // TODO recognize import type from text, import snitches/JSON too
    processVoxelWaypointsText(importText, dispatch, 'text import dialog')
  }

  render() {
    return <ListItem button
      onClick={() => {
        if (this.fileInput) this.fileInput.click()
        this.setState({ dialogOpen: true })
      }}
    >
      <input type="file" multiple
        ref={r => { if (r) this.fileInput = r }}
        style={{ display: "none" }}
        onChange={this.handleFileSelect}
      />
      <ListItemIcon><FileUpload /></ListItemIcon>
      {this.state.dialogOpen && <ImportDialog
        onClose={() => this.setState({ dialogOpen: false })}
        onImport={(importText) => {
          this.setState({ dialogOpen: false })
          this.handleTextImport(importText)
        }}
      />}
      <ListItemText
        primary='Import files or text'
        secondary='Waypoints, Snitches, JSON'
      />
    </ListItem>
  }
}

export default connect()(FileImportMenuItem)
