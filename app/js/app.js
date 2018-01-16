import throttle from 'lodash/throttle'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import AppFrame from './components/AppFrame'
import { appLoad, combinedReducers } from './store'
import { getAppStateFromLocalStorage, saveAppStateToLocalStorage } from './utils/localStorage'
import { defaultAppState } from './utils/state'
import { loadAppStateFromUrlData, parseUrlHash } from './utils/url'
import { listenToWindowResize } from './utils/windowSize'

const preloadedState = {} // TODO unused
const store = createStore(combinedReducers, preloadedState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

export default store // TODO this is our "api" for now

listenToWindowResize(store)

store.dispatch(appLoad(defaultAppState))

store.dispatch(appLoad(getAppStateFromLocalStorage()))

const urlData = parseUrlHash(location.hash)
loadAppStateFromUrlData(urlData, store)

// TODO remove unreferenced features/visibleLayers

store.subscribe(throttle(
  () => saveAppStateToLocalStorage(store.getState()),
  1000, { trailing: true }
))

ReactDOM.render(
  <Provider store={store}>
    <AppFrame />
  </Provider>,
  document.getElementById('app-root')
)
