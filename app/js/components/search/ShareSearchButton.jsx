import React from 'react'
import { connect } from 'react-redux'

import IconButton from '@material-ui/core/IconButton'

import ShareIcon from '@material-ui/icons/Share'

const ShareSearchButton = ({
  dispatch,
  searchQuery,
}) => {
  return <IconButton
    onClick={() => {
      location.hash = `q=${encodeURIComponent(searchQuery)}`
      // TODO better search sharing
    }}
  >
    <ShareIcon />
  </IconButton>
}

const mapStateToProps = ({ control: { searchQuery } }) => {
  return {
    searchQuery,
  }
}

export default connect(mapStateToProps)(ShareSearchButton)
