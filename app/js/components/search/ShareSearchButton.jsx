import React from 'react'
import { connect } from 'react-redux'

import { IconButton } from '@mui/material'
import { Share } from '@mui/icons-material'

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
    <Share />
  </IconButton>
}

const mapStateToProps = ({ control: { searchQuery } }) => {
  return {
    searchQuery,
  }
}

export default connect(mapStateToProps)(ShareSearchButton)
