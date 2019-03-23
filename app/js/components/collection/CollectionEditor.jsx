import React from 'react'
import { connect } from 'react-redux'

import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import TextField from 'material-ui/TextField'

import CheckIcon from 'material-ui-icons/Check'
import DeleteIcon from 'material-ui-icons/Delete'
import DownloadIcon from 'material-ui-icons/FileDownload'
import ResetIcon from 'material-ui-icons/Undo'

import { exportCollection } from '../../utils/importExport'
import JsonEditor from '../edit/JsonEditor'
import { openLayers, removeCollection, updateCollection } from '../../store'

class RealCollectionEditor extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      originalCollection: props.collection,
    }
  }

  render() {
    const { collection, dispatch } = this.props
    const { originalCollection } = this.state

    return <div>
      <div style={{ margin: '16px' }}>

        <Button variant='raised' onClick={() => {
          dispatch(updateCollection(originalCollection))
        }}>
          <ResetIcon />
          Reset
        </Button>

        <Button variant='raised' onClick={() => {
          dispatch(removeCollection(collection.id))
          dispatch(openLayers())
        }}>
          <DeleteIcon />
          Delete
        </Button>

        <Button variant='raised' onClick={() => {
          dispatch(openLayers())
        }}>
          <CheckIcon />
          Save
        </Button>

        <TextField fullWidth
          label="Name"
          value={String(collection.name || '')}
          onChange={e => dispatch(updateCollection({ ...collection, name: e.target.value }))}
          style={{ margin: '16px 0px' }}
        />

        <Button variant='raised' onClick={(e) => {
          const json = JSON.stringify(exportCollection(collection))
          const filename = collection.name + ".civmap.json"

          const element = document.createElement('a')
          element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(json))
          element.setAttribute('download', filename)
          element.style.display = 'none'
          document.body.appendChild(element)

          element.click()

          document.body.removeChild(element)
        }}>
          <DownloadIcon />
          Download
        </Button>

        <JsonEditor
          style={{ margin: '16px 0px' }}
          data={collection.presentations}
          onChange={(newPresentations) => {
            // TODO validate collection
            dispatch(updateCollection({ ...collection, presentations: newPresentations }))
          }}
        />
      </div>
    </div>
  }
}

const mapStateToProps = ({ collections, control }) => {
  return {
    collection: collections[control.activeCollectionId],
  }
}

export default connect(mapStateToProps)(RealCollectionEditor)
