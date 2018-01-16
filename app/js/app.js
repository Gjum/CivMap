import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import AppFrame from './components/AppFrame'
import { combinedReducers } from './store'
import { loadAppStateFromLocalStorage, setupLocalStorageSync } from './utils/LocalStorageSync'
import { loadDefaultAppState } from './utils/State'
import { loadAppStateFromUrlData, parseUrlHash } from './utils/Url'
import { listenToWindowResize } from './utils/WindowSize'

const preloadedState = {} // TODO unused
const store = createStore(combinedReducers, preloadedState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

export default store // TODO this is our "api" for now

loadDefaultAppState(store)

loadAppStateFromLocalStorage(store)
setupLocalStorageSync(store)

listenToWindowResize(store)

// TODO load from json if passed in url
// this can be blocking-async (pass continuation callback)
// or we show a loading animation in a corner

const urlData = parseUrlHash(location.hash)
loadAppStateFromUrlData(urlData, store)

// TODO remove unreferenced features/visibleLayers

ReactDOM.render(
  <Provider store={store}>
    <AppFrame />
  </Provider>,
  document.getElementById('app-root')
)
