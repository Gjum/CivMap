import React from 'react';
import { connect } from 'react-redux';

import * as BROWSE from './browse';
import * as FEATURE from './feature';
import * as LAYERS from './layers';

import AppDrawer from './drawer/AppDrawer';
import LeafMap from './leaflet/LeafMap';

const modes = {
  BROWSE,
  FEATURE,
  LAYERS,
  // LAYER,
};

const AppFrame = ({
  appMode,
}) => {
  const { Appbar, Detail } = modes[appMode]
  return <div className='full'>
    <AppDrawer />
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
