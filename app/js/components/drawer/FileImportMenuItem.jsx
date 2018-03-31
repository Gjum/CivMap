import React from 'react'
import { connect } from 'react-redux'

import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import FileUploadIcon from 'material-ui-icons/FileUpload'

import { getFileProcessor } from '../../utils/importExport'
import { setDrawerClosed } from '../../store'

class FileImportMenuItem extends React.Component {
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

  render() {
    return <ListItem button
      onClick={() => { if (this.fileInput) this.fileInput.click() }}
    >
      <input type="file" multiple
        ref={r => { if (r) this.fileInput = r }}
        style={{ display: "none" }}
        onChange={this.handleFileSelect}
      />
      <ListItemIcon><FileUploadIcon /></ListItemIcon>
      <ListItemText
        primary='Import files'
        secondary='Waypoints, Snitches, JSON'
      />
    </ListItem>
  }
}

export default connect()(FileImportMenuItem)
