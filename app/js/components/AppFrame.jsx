import React from 'react';
import { connect } from 'react-redux';

import Divider from 'material-ui/Divider';
import List from 'material-ui/List';

import * as BROWSE from './browse';
import * as FEATURE from './feature';
import AppDrawer from './AppDrawer';
import BasemapSelectorList from './BasemapSelectorList';
import LayersMenuItem from './layers/LayersMenuItem';
import LeafMap from './leaflet/LeafMap';
import ViewResetMenuItem from './ViewResetMenuItem';
import WaypointsMenuItem from './WaypointsMenuItem';

const modes = {
  BROWSE,
  FEATURE,
  // LAYER, LAYERS,
};

const AppFrame = ({
  appMode,
}) => {
  const { Appbar, Detail } = modes[appMode]
  return <div className='full'>
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
    <div className={"container " + (
      Detail ? "split" : "full-map"
    )}>
      <Appbar />
      <LeafMap />
      {Detail && <div className="mainlist"><Detail /></div>}
    </div>
  </div>
};

const mapStateToProps = ({ control: { appMode } }) => {
  return {
    appMode,
  };
};

export default connect(mapStateToProps)(AppFrame);
