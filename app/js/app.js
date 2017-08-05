import ReactDOM from 'react-dom';

import AppRoot from './components/AppRoot.jsx';
import { loadAppStateFromLocalStorage, loadDefaultAppState } from './utils/State.js';

loadDefaultAppState();

const customUrl = false;
if (customUrl) {
  // TODO load from url
} else {
  loadAppStateFromLocalStorage();
}

ReactDOM.render(
  AppRoot,
  document.getElementById('app-root')
);
