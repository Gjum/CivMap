import React from 'react';
import { Provider } from 'react-redux';

import Divider from 'material-ui/Divider';
import List from 'material-ui/List';

import store from '../store';

import AppBar from './AppBar.jsx';
import BasemapSelectorList from './BasemapSelectorList.jsx';
import Drawer from './Drawer.jsx';
import FabOnViewMode from './FabOnViewMode.jsx';
import LeafBaseMap from './LeafBaseMap.jsx';
import LeafMap from './LeafMap.jsx';
import LeafOverlay from './LeafOverlay.jsx';
import LocalStorageSync from './LocalStorageSync.jsx';
import WaypointsMenuItem from './WaypointsMenuItem.jsx';

const CivMapApp = () => (
  <div className='civMapApp'>
    <LocalStorageSync />

    <Drawer>
      <div>
        <BasemapSelectorList />
        <Divider />
        <List>
          <WaypointsMenuItem />
        </List>
      </div>
    </Drawer>
    <FabOnViewMode />

    <AppBar />
    <LeafMap>
      <LeafBaseMap />
      <LeafOverlay />
    </LeafMap>
  </div>
);

export default (
  <Provider store={store}>
    <CivMapApp />
  </Provider>
);
