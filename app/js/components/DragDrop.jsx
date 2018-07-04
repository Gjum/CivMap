import React from 'react'
import { connect } from 'react-redux'

import { getFileProcessor } from '../utils/importFile'

class DragDrop extends React.PureComponent {
  componentWillMount() {
    document.addEventListener("dragenter", this.ondragenter, false)
    document.addEventListener("dragover", this.ondragover, false)
    document.addEventListener("dragleave", this.ondragleave, false)
    document.addEventListener("drop", this.ondrop, false)
  }

  componentWillUnmount() {
    document.removeEventListener("dragenter", this.ondragenter)
    document.removeEventListener("dragover", this.ondragover)
    document.removeEventListener("dragleave", this.ondragleave)
    document.removeEventListener("drop", this.ondrop)
  }

  ondragenter = (event) => {
    event.stopPropagation()
    event.preventDefault()

    this.setOverlayStatus(true)
    this.currentDragTarget = event.target
    event.dataTransfer.dropEffect = 'copy'
  }

  ondragover = (event) => {
    event.stopPropagation()
    event.preventDefault()
    // this handler just needs to be registered, no action needed
  }

  ondragleave = (event) => {
    event.stopPropagation()
    event.preventDefault()

    if (this.currentDragTarget === event.target) {
      this.setOverlayStatus(false)
    }
  }

  ondrop = (event) => {
    event.stopPropagation()
    event.preventDefault()

    this.setOverlayStatus(false)

    const unknownFiles = []

    var files = event.dataTransfer.files
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      const fp = getFileProcessor(file.name)
      if (fp) {
        fp.process(file, this.props.dispatch)
      } else {
        unknownFiles.push(file.name)
      }
    }

    if (unknownFiles.length) {
      // TODO show known/unknown files while dragging
      alert(`Unknown file types for: ${unknownFiles.join(', ')}`)
    }

    console.log(`Loaded ${files.length} files from drag-drop`)
  }

  setOverlayStatus(enabled) {
    const modal = document.querySelector('#dragDropModal') // TODO use ref/state instead
    modal.style.display = enabled ? 'block' : 'none'
  }

  render() {
    return <div id="dragDropModal" style={{
      position: "fixed",
      top: 0,
      width: "100%",
      height: "100%",
      zIndex: 99999,
      backgroundColor: "rgba(0, 0, 0, .8)",
      display: "none", // changed on drag/drop events
    }}>
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "90%",
        height: "90%",
        border: "5px dashed white",
      }}>
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          padding: "1em",
          backgroundColor: "#ffffff",
        }}>
          {/* TODO show current dragged files' names and recognized types */}
          Drop files anywhere to import...
        <ul>
            <li>Waypoint files (VoxelMap, Xaero, SnitchMaster)</li>
            <li>CivMap collections (.civmap.json)</li>
            <li>Map data files (JourneyMap - <b>use sparingly! the images are bigger than just an url</b>)</li>
          </ul>
        </div>
      </div>
    </div>
  }
}

export default connect()(DragDrop)
