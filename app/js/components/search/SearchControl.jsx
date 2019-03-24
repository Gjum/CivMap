import React from 'react'
import { connect } from 'react-redux'

import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import TextField from '@material-ui/core/TextField'

import CloseIcon from '@material-ui/icons/Close'
import ShowOnMapIcon from '@material-ui/icons/Explore'

import { rectBoundsFromFeature } from '../../utils/math'
import { highlightFeature, openFeatureDetail, openSearch, setViewport } from '../../store'

function fuzzyMatch(query, str) {
  query = query.toLowerCase()
  let hay = str.toLowerCase(), i = 0, n = -1, l
  for (; l = query[i++];) {
    if (!~(n = hay.indexOf(l, n + 1))) {
      return false
    }
  }
  return true
}

class SearchControl extends React.PureComponent {
  state = {
    parseErrorText: undefined,
  }

  render() {
    const {
      collections,
      dispatch,
      searchQuery,
    } = this.props
    const searchQueryLower = String(searchQuery).toLowerCase()

    let searchResults = []
    Object.values(collections).forEach(collection =>
      searchResults = searchResults.concat(
        Object.values(collection.features).filter(f =>
          !searchQuery
          || f.name && fuzzyMatch(searchQueryLower, f.name)
          || f.nation && fuzzyMatch(searchQueryLower, f.nation)
          || f.contact && fuzzyMatch(searchQueryLower, f.contact)
          || f.notes && fuzzyMatch(searchQueryLower, f.notes.slice(0, 200))
        )
      )
    )

    // TODO show matching string as secondary text
    // TODO sort search results

    const numResults = searchResults.length
    const numTop = 50
    const topResults = searchResults.slice(0, numTop)

    return <div>
      <div style={{ margin: '8px 24px' }}>
        <TextField autoFocus fullWidth
          label="Search"
          value={String(searchQuery || '')}
          onChange={e => dispatch(openSearch(e.target.value))}
        />
        <p>Found {numResults} matching features</p>
        {numResults > numTop && <p>showing top {numTop}</p>}
      </div>
      <List>
        {topResults.map((feature, i) => {
          return <ListItem button key={feature.id}
            onClick={() => {
              dispatch(openFeatureDetail(feature.id, feature.collectionId))
              dispatch(setViewport(rectBoundsFromFeature(feature)))
            }}
          >
            <ListItemText primary={feature.name || feature.label || feature.id || '(unnamed feature)'} />
            <ListItemSecondaryAction>
              <IconButton onClick={() => {
                dispatch(highlightFeature(feature.id, feature.collectionId))
                dispatch(setViewport(rectBoundsFromFeature(feature)))
              }}>
                <ShowOnMapIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        })}
      </List>
    </div>
  }
}

const mapStateToProps = ({ control: { searchQuery }, collections }) => {
  return {
    collections,
    searchQuery,
  }
}

export default connect(mapStateToProps)(SearchControl)
