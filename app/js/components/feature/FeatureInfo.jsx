import React from 'react'
import { connect } from 'react-redux'

import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'

import DeleteIcon from '@material-ui/icons/Delete'
import EditIcon from '@material-ui/icons/Edit'
import FilterIcon from '@material-ui/icons/FilterList'
import ShowOnMapIcon from '@material-ui/icons/Explore'

import { circleBoundsFromFeature, rectBoundsFromFeature } from '../../utils/math'
import { openBrowseMode, removeFeatureInCollection, setViewport, lookupFeature } from '../../store'

export function isUrl(value) {
  return /^https?:\/\/[^\/ ]+\.[a-z]{2,}(\/|$)/i.test(value)
}

function linkify(val) {
  if (isUrl(val)) return <a href={val} target='_blank'>{val}</a>

  const elements = []
  val = '' + val // make string
  val.split(' ').forEach((word, i) => {
    elements.push(' ')
    if (/^\/?[ru]\/[^ \/]+$/.test(word)) {
      elements.push(<a key={i} href={`https://reddit.com/${word}`} target='_blank' rel='noopener'>{word}</a>)
    } else {
      elements.push(word)
    }
  })
  return elements.slice(1)
}

const FeatureProps = ({ feature }) => {
  let image = null
  let title = null
  let otherProps = []

  Object.entries(feature).forEach(([key, val]) => {
    if (key === 'image') {
      image = <div>
        <a href={val} target='_blank' rel='noopener'>
          {/* <img className='feature-props-image' src={val} alt={key} /> */}
          <div className='feature-props-image' style={{ backgroundImage: `url(${val})` }} />
        </a>
      </div>
    } else if (key === 'map_image') {
      // TODO prefer `image` but also preview `mapImage.url`
    } else if (key === 'style') {
      // TODO show compact style (color etc)
    } else if (key === 'collectionId') {
      // TODO show collection name
    } else if (key === 'category') { // already shown
    } else if ('XxZz'.includes(key)) { // don't show x/z in props
    } else if (key === 'id') { // don't show id
    } else if (key === 'line' || key === 'polygon') {
      const plural = val.length !== 1 ? 's' : ''
      otherProps.push({ key, val: `${val.length} part` + plural })
    } else if (key === 'name') {
      title = <h2 className='feature-props-title'>{val}</h2>
    } else {
      otherProps.push({ key, val })
    }
  })

  const circleBounds = circleBoundsFromFeature(feature)

  return <div>
    {image}
    {title}
    <p style={{ margin: '16px' }}>
      {feature.category} at {circleBounds.x} {circleBounds.z}
    </p>
    <ul className='feature-props-list'>
      {otherProps.map(({ key, val }) =>
        <li key={key} className='feature-props-entry'>
          <span className='feature-props-key'>{key}:</span>
          {' '}
          <span className='feature-props-value'>{linkify(val)}</span>
        </li>
      )}
    </ul>
  </div>
}

const RealFeatureInfo = ({
  feature,
  dispatch,
}) => {
  if (!feature) {
    // TODO find clean solution
    // show "Loading" if we're still waiting on collections to load
    return <div style={{ margin: '16px' }}>
      <h2>There might have been an error.</h2>
      <p>Sorry about that.</p>
      <Button variant='contained' onClick={() => dispatch(openBrowseMode())}>
        Close
      </Button>
    </div>
  }

  const rectBounds = rectBoundsFromFeature(feature)

  return <div>
    <FeatureProps feature={feature} />

    <div style={{ margin: '16px' }}>
      <Button variant='contained' onClick={() => dispatch(setViewport(rectBounds))}>
        <ShowOnMapIcon />
        Show on map
      </Button>

      <Button variant='contained' onClick={() => {
        dispatch(removeFeatureInCollection(feature.collectionId, feature.id))
        dispatch(openBrowseMode()) // TODO show similar features in search results instead
      }}>
        <DeleteIcon />
        Delete
      </Button>
    </div>
  </div>
}

const mapStateToProps = (state) => {
  const { control } = state
  return {
    feature: lookupFeature(state, control.activeFeatureId, control.activeFeatureCollection),
  }
}

export default connect(mapStateToProps)(RealFeatureInfo)
