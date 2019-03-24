import { currentVersion } from "./convertFromOld";

let lastLocalStorageError = {}

export function saveAppStateToLocalStorage(state) {
  try {
    const {
      collections,
      mapView,
    } = state

    // TODO noop if unchanged

    window.localStorage.setItem('CivMap.data.'+currentVersion, JSON.stringify({
      collections, // TODO filter out non-persistent collections (e.g. journeymap)
    }))
    window.localStorage.setItem('CivMap.view.'+currentVersion, JSON.stringify({
      mapView,
    }))

  } catch (e) {
    if (lastLocalStorageError.code != e.code) {
      lastLocalStorageError = e
      console.error('Failed storing app state in LocalStorage:', e)
    }
  }
}

export function getAppStateFromLocalStorage() {
  let state = {}

  try {
    // TODO check if older states exist (e.g. `CivMap.data`)

    const dataJson = window.localStorage.getItem('CivMap.data.'+currentVersion)
    if (dataJson) {
      state = { ...state, ...JSON.parse(dataJson) }
    }

    const viewJson = window.localStorage.getItem('CivMap.view.'+currentVersion)
    if (viewJson) {
      state = { ...state, ...JSON.parse(viewJson) }
    }

  } catch (e) {
    console.error('Loading from localStorage failed', e)
  }

  return state
}
