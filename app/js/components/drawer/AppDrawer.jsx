import React from 'react'
import { connect } from 'react-redux'

import Divider from 'material-ui/Divider'
import Drawer from 'material-ui/Drawer'
import List from 'material-ui/List'

import { setDrawerClosed } from '../../store'

import BasemapSelectorList from './BasemapSelectorList'
import ViewResetMenuItem from './ViewResetMenuItem'
import WaypointsMenuItem from './WaypointsMenuItem'

const AppDrawer = ({
  drawerOpen,
  setDrawerClosed,
}) => {
  return <Drawer
    className="drawer"
    open={drawerOpen}
    onClose={setDrawerClosed}
  >
    <div className='drawer-content'>
      <BasemapSelectorList />
      <Divider />
      <List>
        <WaypointsMenuItem />
        <ViewResetMenuItem />
      </List>
    </div>
  </Drawer>
}

const mapStateToProps = ({ control: { drawerOpen } }, ownProps) => {
  return { drawerOpen }
}

const mapDispatchToProps = {
  setDrawerClosed,
}

export default connect(mapStateToProps, mapDispatchToProps)(AppDrawer)
