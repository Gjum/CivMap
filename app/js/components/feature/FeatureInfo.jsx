import React from 'react'
import { connect } from 'react-redux'

import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'

import DeleteIcon from 'material-ui-icons/Delete'
import EditIcon from 'material-ui-icons/Edit'
import ShowOnMapIcon from 'material-ui-icons/Explore'

import { openBrowseMode, openEditMode, removeFeature, setViewport } from '../../store'
import { circleBoundsFromFeature } from '../../utils/math'

export function isImageUrl(value) {
  return /^https?:\/\/[^\/ ]+\/[^ ]+\.(png|jpe?g|gif|bmp|ico|tif?f)$/i.test(value)
}

export function isUrl(value) {
  return /^https?:\/\/[^\/ ]+\.[a-z]{2,}(\/|$)/i.test(value)
}

function linkify(val) {
  if (isUrl(val)) return <a href={val} target='_blank'>{val}</a>

  const elements = []
  val = '' + val // make string
  val.split(' ').forEach((word, i) => {
    elements.push(' ')
    if (/^[ru]\/[^ \/]+$/.test(word)) {
      elements.push(<a key={i} href={`https://reddit.com/${word}`} target='_blank' rel='noopener'>{word}</a>)
    } else {
      elements.push(word)
    }
  })
  return elements.slice(1)
}

const FeatureProps = ({ featureProps }) => {
  let image = null
  let title = null
  let otherProps = []

  Object.entries(featureProps).forEach(([key, val]) => {
    if (key === 'image' && isImageUrl(val)) {
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
    } else if ('XxZz'.includes(key)) { // don't show x/z in props
    } else if (key === 'id') { // don't show id
    } else if (key === 'line' || key === 'polygon') {
      const plural = val.length !== 1 ? 's' : ''
      otherProps.push({ key, val: `${val.length} point` + plural })
    } else if (key === 'name') {
      title = <h2 className='feature-props-title'>{val}</h2>
    } else {
      otherProps.push({ key, val })
    }
  })

  return <div>
    {image}
    {title}
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

const FeatureInfo = ({
  feature,
  openBrowseMode,
  openEditMode,
  removeFeature,
  setViewport,
}) => {
  const circleBounds = circleBoundsFromFeature(feature)
  return <div>
    <FeatureProps featureProps={feature} />

    <p style={{ margin: '16px' }}>
      at {circleBounds.x} {circleBounds.z}
    </p>

    <div style={{ margin: '16px' }}>
      <Button raised onClick={() => setViewport(circleBounds)}>
        <ShowOnMapIcon />
        Show on map
      </Button>

    </div>
    <div style={{ margin: '16px' }}>
      <Button raised onClick={() => {
        openEditMode(feature.id)
      }}>
        <EditIcon />
        Edit
      </Button>

      <Button raised onClick={() => {
        removeFeature(feature.id)
        openBrowseMode() // TODO show similar features in search results instead
      }}>
        <DeleteIcon />
        Delete
      </Button>
    </div>
  </div>
}

const mapStateToProps = ({ features, control }) => {
  return {
    feature: features[control.featureId],
  }
}

const mapDispatchToProps = {
  openBrowseMode,
  openEditMode,
  removeFeature,
  setViewport,
}

export default connect(mapStateToProps, mapDispatchToProps)(FeatureInfo)
