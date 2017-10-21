import ReactDOM from 'react-dom';

import AppRoot from './components/AppRoot.jsx';
import { loadAppStateFromLocalStorage, loadDefaultAppState } from './utils/State.js';
import { listenToWindowResize } from './utils/WindowSize';
import { setupLocalStorageSync } from './utils/LocalStorageSync';

import store from './store';
module.exports = store;

loadDefaultAppState();

const customUrl = false;
if (customUrl) {
  // TODO load from url
} else {
  loadAppStateFromLocalStorage();
}

listenToWindowResize();
setupLocalStorageSync();

ReactDOM.render(
  AppRoot,
  document.getElementById('app-root')
);
