import React from 'react'
import { connect } from 'react-redux'

import * as BROWSE from './browse'
import * as EDIT from './edit'
import * as FEATURE from './feature'
import * as LAYERS from './layers'
import * as COLLECTION from './collection'
import * as SEARCH from './search'

import AppBar from './AppBar'
import AppDrawer from './drawer/AppDrawer'
import DragDrop from './DragDrop'
import LeafMap from './leaflet/LeafMap'

const modes = {
  BROWSE,
  EDIT,
  FEATURE,
  LAYERS,
  COLLECTION,
  SEARCH,
}

const AppFrame = ({
  appMode,
}) => {
  const { SideContent } = modes[appMode]

  const containerModeClass = SideContent ? "split" : "full-map"

  return <div className='full'>
    <AppDrawer />
    <AppBar />
    <div className={"container " + containerModeClass}>
      <LeafMap />
      {SideContent && <div className="mainlist"><SideContent /></div>}
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
