import React from 'react';
import {render} from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {Main} from './Main';
import {WaypointsPluginInfo} from './Waypoints';
import {ClaimsPluginInfo} from './Claims';
import {FeaturesPluginInfo} from './FeaturesPlugin';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

exports.Main = Main;
exports.ClaimsPlugin = ClaimsPluginInfo;
exports.WaypointsPlugin = WaypointsPluginInfo;
exports.FeaturesPlugin = FeaturesPluginInfo;

export function start(config, onRef) {
  render(
    <Main
      ref={r => r && onRef && onRef(r)}
      {...config}
      />,
    document.getElementById('app')
  );
}
