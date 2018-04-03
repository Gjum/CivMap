import React from 'react'
import { connect } from 'react-redux'

import * as BROWSE from './browse'
import * as EDIT from './edit'
import * as FEATURE from './feature'
import * as FILTERS from './filters'

import AppDrawer from './drawer/AppDrawer'
import DragDrop from './DragDrop'
import LeafMap from './leaflet/LeafMap'

const modes = {
  BROWSE,
  EDIT,
  FEATURE,
  FILTERS,
}

const AppFrame = ({
  appMode,
}) => {
  const { Appbar, Detail } = modes[appMode]
  return <div className='full'>
    <AppDrawer />
    <div className={"container " + (
      Detail ? "split" : "full-map"
    )}>
      <Appbar />
      <LeafMap />
      {Detail && <div className="mainlist"><Detail /></div>}
    </div>
    <DragDrop />
  </div>
}

const mapStateToProps = ({ control: { appMode } }) => {
  return {
    appMode,
  }
}

export default connect(mapStateToProps)(AppFrame)
