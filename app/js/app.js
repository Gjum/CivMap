import ReactDOM from 'react-dom'

import AppRoot from './components/AppRoot'
import { loadAppStateFromLocalStorage, loadDefaultAppState, loadPublicLayers } from './utils/State' // xxx remove after rewrite
import { listenToWindowResize } from './utils/WindowSize'
// import { setupLocalStorageSync } from './utils/LocalStorageSync'

import store from './store'
module.exports = store

// XXX implement new init logic

loadDefaultAppState()

const customUrl = false
if (customUrl) {
  // TODO load from url
} else {
  // loadAppStateFromLocalStorage()
}

loadPublicLayers("layers.json")

listenToWindowResize()
// setupLocalStorageSync()

ReactDOM.render(
  AppRoot,
  document.getElementById('app-root')
)
