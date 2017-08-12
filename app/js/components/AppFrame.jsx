import React from 'react';
import { connect } from 'react-redux';

import Divider from 'material-ui/Divider';
import List from 'material-ui/List';

import AppBar from './AppBar.jsx';
import AppDrawer from './AppDrawer.jsx';
import BasemapSelectorList from './BasemapSelectorList.jsx';
import LayersMenuItem from './LayersMenuItem.jsx';
import LeafMap from './LeafMap.jsx';
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
      <AppBar />
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
