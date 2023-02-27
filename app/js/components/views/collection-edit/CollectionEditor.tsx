import React from 'react'
import { connect, DispatchProp } from 'react-redux'

import { Button, IconButton, TextField } from '@mui/material'
import { Check, Delete, Download, RestartAlt } from '@mui/icons-material'

import { exportCollection } from '../../../utils/importExport'
import JsonEditor from '../feature-edit/JsonEditor'
import { openTabs, removeCollection, RootState, updateCollection } from '../../../store'
import { Collection, CollectionId } from '../../../collectionstate'

interface OwnProps {
  collectionID: CollectionId
}

type Props = OwnProps & {
  collection: Collection
}

interface State {
  originalCollection: Collection
}

class RealCollectionEditor extends React.PureComponent<DispatchProp & Props, State> {
  constructor(props: DispatchProp & Props) {
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
          <RestartAlt />
          Reset
        </Button>

        <Button variant='contained' onClick={() => {
          dispatch(removeCollection(collection.id))
          dispatch(openTabs())
        }}>
          <Delete />
          Delete
        </Button>

        <Button variant='contained' onClick={() => {
          dispatch(openTabs())
        }}>
          <Check />
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
          <Download />
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

const mapStateToProps = ({ collections }: RootState, props: OwnProps) => {
  return {
    collection: collections[props.collectionID],
  }
}

export default connect(mapStateToProps)(RealCollectionEditor)
