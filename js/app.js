import React from 'react';
import {render} from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Main from './Main';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

render(
  <Main
    attribution='<a href="https://github.com/dev3map/dev3map.github.io">dev3map.github.io</a>'
    tilesUrl='https://raw.githubusercontent.com/dev3map/tiles/master/world/'
    claimsUrl='claims.json'
  />,
  document.getElementById('app')
);
