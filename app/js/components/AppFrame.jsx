import React from 'react';
import { connect } from 'react-redux';

import Divider from 'material-ui/Divider';
import List from 'material-ui/List';

import AppBarBrowse from './AppBarBrowse.jsx';
import AppDrawer from './AppDrawer.jsx';
import BasemapSelectorList from './BasemapSelectorList.jsx';
import LayersMenuItem from './LayersMenuItem.jsx';
import LeafMap from './leaflet/LeafMap.jsx';
import ViewResetMenuItem from './ViewResetMenuItem.jsx';
import WaypointsMenuItem from './WaypointsMenuItem.jsx';

const BROWSE = () => (
  <div className='full'>
    <AppDrawer>
      <div className='drawer-content'>
        <BasemapSelectorList />
        <Divider />
        <List>
          <WaypointsMenuItem />
          <LayersMenuItem />
          <ViewResetMenuItem />
        </List>
      </div>
    </AppDrawer>
    <div className="shifted-container flex-container">
      <AppBarBrowse />
      <LeafMap />
    </div>
  </div>
);

const modes = {
  BROWSE,
};

const AppFrame = ({
  appMode,
}) => {
  return modes[appMode]();
};

const mapStateToProps = ({ control: { appMode } }) => {
  return {
    appMode,
  };
};

export default connect(mapStateToProps)(AppFrame);
