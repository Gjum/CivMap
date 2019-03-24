import throttle from 'lodash/throttle'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import injectTapEventPlugin from 'react-tap-event-plugin';
import { createStore } from 'redux'

import AppFrame from './components/AppFrame'
import { appLoad, combinedReducers } from './store'
import { getAppStateFromLocalStorage, saveAppStateToLocalStorage } from './utils/localStorage'
import { autoImportCollectionsOnStartup, loadAppStateFromUrlData, parseUrlHash, loadCollectionJsonAsync } from './utils/importExport'

export function start(config) {
  // Needed for onTouchTap
  // http://stackoverflow.com/a/34015469/988941
  injectTapEventPlugin();

  const store = createStore(combinedReducers, {},
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

  if (config.initialState) {
    store.dispatch(appLoad(prepareInitialState(config.initialState)))
  }
  store.dispatch(appLoad(getAppStateFromLocalStorage()))

  if (location.hash) {
    const urlData = parseUrlHash(location.hash)
    loadAppStateFromUrlData(urlData, store)
    location.hash = ""
  }

  autoImportCollectionsOnStartup(store)

  if (Array.isArray(config.defaultCollectionUrls)) {
    for (const url of config.defaultCollectionUrls) {
      loadCollectionJsonAsync(url, store.dispatch)
    }
  }

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

  return { store } // TODO export redux actions
}

function prepareInitialState(initialState) {
  const defaultBasemap = Object.values(initialState.mapConfig.basemaps).find(b => b.isDefault) || {}
  return {
    mapView: {
      viewport: { x: 0, z: 0, radius: initialState.mapConfig.borderApothem },
      basemapId: defaultBasemap.id,
      ...initialState.mapView,
    },
    ...initialState,
  }
}
