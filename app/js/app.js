import throttle from 'lodash/throttle'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import AppFrame from './components/AppFrame'
import ErrorBoundary from './components/ErrorBoundary'
import { appLoad, combinedReducers } from './store'
import { getAppStateFromLocalStorage, saveAppStateToLocalStorage } from './utils/localStorage'
import { autoImportCollectionsOnStartup, loadAppStateFromUrlData, parseUrlHash, loadCollectionJsonAsync } from './utils/importExport'

export function start(config, rootElement) {
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
    for (const { source, enabled_presentation } of config.defaultCollectionUrls) {
      // TODO don't load a second time if it's already done by autoImportCollectionsOnStartup
      loadCollectionJsonAsync(source, store.dispatch, null, enabled_presentation)
    }
  }

  store.subscribe(throttle(
    () => saveAppStateToLocalStorage(store.getState()),
    1000, { trailing: true }
  ))

  ReactDOM.render(
    <ErrorBoundary>
      <Provider store={store}>
        <AppFrame />
      </Provider>
    </ErrorBoundary>,
    rootElement || document.getElementById('app-root')
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
