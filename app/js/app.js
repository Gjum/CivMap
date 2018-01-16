import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import AppFrame from './components/AppFrame'
import { combinedReducers } from './store'
import { loadAppStateFromLocalStorage, setupLocalStorageSync } from './utils/LocalStorageSync'
import { loadDefaultAppState, loadLayersAsync } from './utils/State'
import { listenToWindowResize } from './utils/WindowSize'

// XXX implement new async init logic

const store = createStore(combinedReducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

export default store

loadDefaultAppState(store)

loadAppStateFromLocalStorage(store)
// TODO remove unreferenced features

// TODO load from json if passed in url

loadLayersAsync("layers.json", store)

listenToWindowResize(store)
setupLocalStorageSync(store)

ReactDOM.render(
  <Provider store={store}>
    <AppFrame />
  </Provider>,
  document.getElementById('app-root')
)
