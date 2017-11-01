import React from 'react';
import { connect } from 'react-redux';

import Divider from 'material-ui/Divider';
import List from 'material-ui/List';

import AppBarBrowse from './AppBarBrowse.jsx';
import AppBarFeature from './AppBarFeature.jsx'
import AppBarOverlay from './AppBarOverlay.jsx';
import AppDrawer from './AppDrawer.jsx';
import BasemapSelectorList from './BasemapSelectorList.jsx';
import FeatureInfo from './FeatureInfo.jsx'
import LayersList from './LayersList.jsx';
import LayersMenuItem from './LayersMenuItem.jsx';
import LeafMap from './leaflet/LeafMap.jsx';
import ViewResetMenuItem from './ViewResetMenuItem.jsx';
import WaypointsMenuItem from './WaypointsMenuItem.jsx';

const drawer = () => (
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
)

const defaultLayout = () => (
  <div className='full'>
    {drawer()}
    <div className="container full-map">
      <AppBarBrowse />
      <LeafMap />
    </div>
  </div>
);

const BROWSE = () => (
  <div className='full'>
    {drawer()}
    <div className="container full-map">
      <AppBarBrowse />
      <LeafMap />
    </div>
  </div>
);

const FEATURE = () => (
  <div className='full'>
    {drawer()}
    <div className="container split">
      <AppBarFeature />
      <LeafMap />
      <div className="mainlist">
        <FeatureInfo />
      </div>
    </div>
  </div>
);

const OVERLAY = () => (
  <div className='full'>
    {drawer()}
    <div className="container split">
      <AppBarOverlay />
      <LeafMap />
      <div className="mainlist">
        <LayersList />
      </div>
    </div>
  </div>
);

const modes = {
  BROWSE,
  FEATURE,
  OVERLAY,
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
