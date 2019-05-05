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
  let hay = str, i = 0, n = -1, l
  for (; l = query[i++];) {
    if (!~(n = hay.indexOf(l, n + 1))) {
      return false
    }
  }
  return true
}

function matchScore(query, words, str) {
  if (!str) return 99
  const strLower = str.toLowerCase()
  if (strLower === query) return 0
  if (strLower.startsWith(query)) return 1
  if (strLower.includes(query)) return 2
  const paddedStr = ' ' + strLower + ' '
  for (const word of words) {
    if (paddedStr.includes(' ' + word + ' ')) return 3
  }
  for (const word of words) {
    if (paddedStr.includes(' ' + word)) return 4
  }
  for (const word of words) {
    if (paddedStr.includes(word)) return 5
  }
  if (strLower.length < 200 && fuzzyMatch(query, strLower)) return 9
  return 99
}

function search(query, collections) {
  query = String(query).toLowerCase()
  if (!query || query.length <= 1) return []
  const words = query.split(' ')

  let searchResults = []
  Object.values(collections).forEach(collection =>
    searchResults = searchResults.concat(
      Object.values(collection.features).map(f => {
        const scores = Object.entries(f)
          .filter(([k, v]) => !(['collectionId'].includes(k)))
          .map(([k, v]) => matchScore(query, words, String(v)))
        return [Math.min.apply(null, scores), f]
      }).filter(r => r[0] < 99)
    )
  )
  searchResults.sort()
  return searchResults.map(r => r[1])
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

    const searchResults = search(searchQuery, collections)

    // TODO show matching string as secondary text

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
            <ListItemText
              primary={feature.name || feature.label || feature.id || '(unnamed feature)'}
              secondary={'in ' + (collections[feature.collectionId].name || '(unnamed layer)')}
            />
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
