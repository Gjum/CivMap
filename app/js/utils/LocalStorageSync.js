import throttle from 'lodash/throttle'

import store from '../store'

let lastLocalStorageError = {}

function saveState() {
  const {
    mapView,
    features,
    layers,
    visibleLayers,
    } = store.getState()
  try {
    const serializedState = JSON.stringify({
      mapView,
      features,
      layers,
      visibleLayers,
    })
    window.localStorage.setItem('CivMap.state', serializedState)
  } catch (e) {
    if (lastLocalStorageError.code != e.code) {
      lastLocalStorageError = e
      console.error('Failed storing app state in LocalStorage:', e)
    }
  }
}

export function setupLocalStorageSync() {
  store.subscribe(throttle(saveState, 1000, { trailing: true }))
}
