import throttle from 'lodash/throttle'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import AppFrame from './components/AppFrame'
import { appLoad, combinedReducers } from './store'
import { getAppStateFromLocalStorage, saveAppStateToLocalStorage } from './utils/localStorage'
import { defaultAppState } from './utils/state'
import { autoImportCollectionsOnStartup, loadAppStateFromUrlData, parseUrlHash } from './utils/importExport'

const preloadedState = {} // TODO unused
const store = createStore(combinedReducers, preloadedState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

export const api = store // TODO this is our "api" for now
// TODO encapsulate in init() function, pass branding options (defaults, texts, links etc.)

store.dispatch(appLoad({ ...defaultAppState, ...getAppStateFromLocalStorage() }))

if (location.hash) {
  const urlData = parseUrlHash(location.hash)
  loadAppStateFromUrlData(urlData, store)
  // prevent page reloading from messing up changes by re-importing the old data
  // if (urlData.feature || urlData.collection) {
  location.hash = ""
  // }
}

autoImportCollectionsOnStartup(store)

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
