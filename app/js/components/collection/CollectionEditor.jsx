import React from 'react'
import { connect } from 'react-redux'

import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'

import CheckIcon from '@material-ui/icons/Check'
import DeleteIcon from '@material-ui/icons/Delete'
import DownloadIcon from '@material-ui/icons/CloudDownload'
import ResetIcon from '@material-ui/icons/Undo'

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

    const editableCollection = { ...collection }
    delete editableCollection.features

    return <div>
      <div style={{ margin: '16px' }}>

        <Button variant='contained' onClick={() => {
          dispatch(updateCollection(originalCollection))
        }}>
          <ResetIcon />
          Reset
        </Button>

        <Button variant='contained' onClick={() => {
          dispatch(removeCollection(collection.id))
          dispatch(openLayers())
        }}>
          <DeleteIcon />
          Delete
        </Button>

        <Button variant='contained' onClick={() => {
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

        <Button variant='contained' onClick={() => {
          const exportedCollection = exportCollection(collection)
          exportedCollection.features.sort()
          const content = JSON.stringify(exportedCollection).replace(/\},\{/g, '},\n{')
          const filename = collection.name + ".json"

          const element = document.createElement('a')
          element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(content))
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
          data={editableCollection}
          onChange={(editedCollection) => {
            const newCollection = { ...collection, ...editedCollection, id: collection.id }
            // TODO validate newCollection
            dispatch(updateCollection(newCollection))
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
