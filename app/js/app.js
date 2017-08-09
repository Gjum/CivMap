import ReactDOM from 'react-dom';

import AppRoot from './components/AppRoot.jsx';
import { loadAppStateFromLocalStorage, loadDefaultAppState } from './utils/State.js';
import { listenToWindowResize } from './utils/WindowSize';

loadDefaultAppState();

const customUrl = false;
if (customUrl) {
  // TODO load from url
} else {
  loadAppStateFromLocalStorage();
}

listenToWindowResize();

ReactDOM.render(
  AppRoot,
  document.getElementById('app-root')
);
