import React from 'react';
import { Provider } from 'react-redux';

import Divider from 'material-ui/Divider';
import List from 'material-ui/List';

import store from '../store';

import AppBar from './AppBar.jsx';
import AppDrawer from './AppDrawer.jsx';
import BasemapSelectorList from './BasemapSelectorList.jsx';
import LeafMap from './LeafMap.jsx';
import LocalStorageSync from './LocalStorageSync.jsx';
import ViewResetMenuItem from './ViewResetMenuItem.jsx';
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
          <ViewResetMenuItem />
        </List>
      </div>
    </AppDrawer>
    <div className="shiftedContainer">
      <AppBar />
      <LeafMap>
      </LeafMap>
    </div>
  </div>
);

export default (
  <Provider store={store}>
    <CivMapApp />
  </Provider>
);
