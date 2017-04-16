import React from 'react';
import {render} from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {Main} from './Main';
import {WaypointsPluginInfo} from './Waypoints';
import {ClaimsPluginInfo} from './Claims';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

exports.Main = Main;
exports.ClaimsPlugin = ClaimsPluginInfo;
exports.WaypointsPlugin = WaypointsPluginInfo;

export function start(config) {
  render(
    <Main {...config} />,
    document.getElementById('app')
  );
}
