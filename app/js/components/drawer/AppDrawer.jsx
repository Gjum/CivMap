import React from 'react'
import { connect } from 'react-redux'

import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'

import { setDrawerClosed } from '../../store'

import BasemapSelectorList from './BasemapSelectorList'
import FileImportMenuItem from './FileImportMenuItem'

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
        <FileImportMenuItem />
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
