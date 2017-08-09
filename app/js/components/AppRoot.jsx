import React from 'react';
import { Provider } from 'react-redux';

import Divider from 'material-ui/Divider';
import List from 'material-ui/List';

import store from '../store';

import AppBar from './AppBar.jsx';
import AppDrawer from './AppDrawer.jsx';
import BasemapSelectorList from './BasemapSelectorList.jsx';
import FabOnViewMode from './FabOnViewMode.jsx';
import LeafBaseMap from './LeafBaseMap.jsx';
import LeafMap from './LeafMap.jsx';
import LeafOverlay from './LeafOverlay.jsx';
import LocalStorageSync from './LocalStorageSync.jsx';
import WaypointsMenuItem from './WaypointsMenuItem.jsx';

const CivMapApp = () => (
  <div className='civMapApp'>
    <LocalStorageSync />

    <AppDrawer>
      <div className='drawer-content'>
        <BasemapSelectorList />
        <Divider />
        <List>
          <WaypointsMenuItem />
        </List>
      </div>
    </AppDrawer>
    <div className="shiftedContainer">
      <AppBar />
      <FabOnViewMode />
      <LeafMap>
        <LeafBaseMap />
        <LeafOverlay />
      </LeafMap>
    </div>
  </div>
);

export default (
  <Provider store={store}>
    <CivMapApp />
  </Provider>
);
