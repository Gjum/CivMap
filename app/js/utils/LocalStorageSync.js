import throttle from 'lodash/throttle'

import { appLoad } from '../store'

let lastLocalStorageError = {}

function saveState(store) {
  try {
    const {
      mapView,
      visibleLayers,
      features,
      layers,
    } = store.getState()

    // TODO skip if unchanged
    const data = {
      features,
      layers,
    }
    window.localStorage.setItem('CivMap.data', JSON.stringify(data))

    const view = {
      mapView,
      visibleLayers,
    }
    window.localStorage.setItem('CivMap.view', JSON.stringify(view))

  } catch (e) {
    if (lastLocalStorageError.code != e.code) {
      lastLocalStorageError = e
      console.error('Failed storing app state in LocalStorage:', e)
    }
  }
}

export function setupLocalStorageSync(store) {
  store.subscribe(throttle(
    () => saveState(store),
    1000, { trailing: true }
  ))
}

export function loadAppStateFromLocalStorage(store) {
  try {
    let appState = {}

    const dataJson = window.localStorage.getItem('CivMap.data')
    if (dataJson) {
      appState = { ...appState, ...JSON.parse(dataJson) }
    }

    const viewJson = window.localStorage.getItem('CivMap.view')
    if (viewJson) {
      appState = { ...appState, ...JSON.parse(viewJson) }
    }

    store.dispatch(appLoad(appState))

  } catch (e) {
    console.error('Loading from localStorage failed', e)
  }
}
