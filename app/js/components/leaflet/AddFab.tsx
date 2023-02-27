import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab, Stack, TextField, Tooltip } from '@mui/material'
import { AddLocationRounded, AddRounded, CloseRounded, FileUploadRounded, PentagonRounded, RectangleRounded, TimelineRounded } from '@mui/icons-material'
import React, { ChangeEvent } from 'react'
import { connect, DispatchProp } from 'react-redux'
import { getFileProcessor, processVoxelWaypointsText } from '../../utils/importFile'

import { editFeature, createFeature, updateFeatureInCollection, RootState } from '../../store'

interface ImportProps {
  onClose: () => void
  onImport: (text: string) => void
}

interface ImportState {
  importText: string
}

class ImportDialog extends React.Component<ImportProps, ImportState> {
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
          <CloseRounded />
          Close
        </Button>
        <Button
          color='primary'
          disabled={!this.state.importText}
          onClick={() => this.props.onImport(this.state.importText)}
        >
          <FileUploadRounded />
          Import
        </Button>
      </DialogActions>
    </Dialog>
  }
}

interface State {
  adding: boolean
  importDialogOpen: boolean
}

class AddFab extends React.Component<DispatchProp, State> {
  fileInput: HTMLInputElement

  constructor(props: DispatchProp) {
    super(props)

    this.state = {
      adding: false,
      importDialogOpen: false,
    }
  }

  handleFileSelect = (event: ChangeEvent) => {
    const dispatch = this.props.dispatch

    // dispatch(setDrawerClosed())

    const unknownFiles = []

    const files = (event.target as HTMLInputElement).files
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

  handleTextImport = (importText: string) => {
    const dispatch = this.props.dispatch
    // dispatch(setDrawerClosed())
    // TODO recognize import type from text, import snitches/JSON too
    processVoxelWaypointsText(importText, dispatch, 'text import dialog')
  }

  makeNewAndEdit(defaultProps) {
    const { dispatch } = this.props
    const feature = createFeature({ ...defaultProps })
    dispatch(updateFeatureInCollection(feature.collectionId, feature))
    this.setState({ ...this.state, adding: false })
    dispatch(editFeature(feature.id, feature.collectionId))
  }

  toggle() {
    this.setState({ ...this.state, adding: !this.state.adding })
  }

  render() {
    const { adding, importDialogOpen } = this.state
    const sidebarVisible = true

    return <Stack id={sidebarVisible ? "add-fab-side" : "add-fab-noside"} alignItems="center" spacing={1}>
      {adding && <Tooltip title="Add Marker" placement="left" open={true} arrow>
        <Fab color="primary" size="small" onClick={() => this.makeNewAndEdit({ x: null, z: null })}>
          <AddLocationRounded />
        </Fab>
      </Tooltip>}
      {adding && <Tooltip title="Add Line" placement="left" open={true} arrow>
        <Fab color="primary" size="small" onClick={() => this.makeNewAndEdit({ line: null })}>
          <TimelineRounded />
        </Fab>
      </Tooltip>}
      {adding && <Tooltip title="Add Rectangle" placement="left" open={true} arrow>
        <Fab color="primary" size="small" onClick={() => this.makeNewAndEdit({ rectangle: null })}>
          <RectangleRounded />
        </Fab>
      </Tooltip>}
      {adding && <Tooltip title="Add Polygon" placement="left" open={true} arrow>
        <Fab color="primary" size="small" onClick={() => this.makeNewAndEdit({ polygon: null })}>
          <PentagonRounded />
        </Fab>
      </Tooltip>}
      {adding && <Tooltip title="Upload Marker" placement="left" open={true} arrow>
        <Fab color="primary" size="small"
          onClick={() => {
            if (this.fileInput) this.fileInput.click()
            this.setState({ ...this.state, adding: false, importDialogOpen: true })
          }}
        >
          <FileUploadRounded />
        </Fab>
      </Tooltip>}
      {(adding || importDialogOpen) && <div>
        <input type="file" multiple
          ref={r => { if (r) this.fileInput = r }}
          style={{ display: "none" }}
          onChange={this.handleFileSelect}
        />
        {this.state.importDialogOpen && <ImportDialog
          onClose={() => this.setState({ ...this.state, importDialogOpen: false })}
          onImport={(importText) => {
            this.setState({ ...this.state, importDialogOpen: false })
            this.handleTextImport(importText)
          }}
        />}
      </div>}
      <Fab color="primary" onClick={this.toggle.bind(this)}>
        {adding ? <CloseRounded /> : <AddRounded />}
      </Fab>
    </Stack>
  }
}

const mapStateToProps = ({ control }: RootState) => {
  return {}
}

export default connect(mapStateToProps)(AddFab)
