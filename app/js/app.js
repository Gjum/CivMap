import throttle from 'lodash/throttle'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import AppFrame from './components/AppFrame'
import { appLoad, combinedReducers } from './store'
import { getAppStateFromLocalStorage, saveAppStateToLocalStorage } from './utils/localStorage'
import { defaultAppState } from './utils/state'
import { autoImportCollectionsOnStartup, loadAppStateFromUrlData, parseUrlHash, loadCollectionJsonAsync } from './utils/importExport'

// TODO encapsulate in init() function, pass branding options (defaults, texts, links etc.)
const preloadedState = {}

const store = createStore(combinedReducers, preloadedState,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

export const api = store // TODO this is our "api" for now

store.dispatch(appLoad(defaultAppState))
store.dispatch(appLoad(getAppStateFromLocalStorage()))

if (location.hash) {
  const urlData = parseUrlHash(location.hash)
  loadAppStateFromUrlData(urlData, store)
  // prevent page reloading from messing up changes by re-importing the old data
  // if (urlData.feature || urlData.collection) {
  location.hash = ""
  // }
}

autoImportCollectionsOnStartup(store)

loadCollectionJsonAsync("/data/settlements.civmap.json", store.dispatch)
loadCollectionJsonAsync("/data/rails.civmap.json", store.dispatch)
loadCollectionJsonAsync("/data/political.civmap.json", store.dispatch)

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
