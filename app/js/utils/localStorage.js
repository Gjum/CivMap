let lastLocalStorageError = {}

export function saveAppStateToLocalStorage(state) {
  try {
    // TODO noop if unchanged

    const {
      collections,
      mapView,
    } = state

    window.localStorage.setItem('CivMap.data.0.3.3', JSON.stringify({
      collections,
    }))
    window.localStorage.setItem('CivMap.view.0.3.3', JSON.stringify({
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

    const dataJson = window.localStorage.getItem('CivMap.data.0.3.3')
    if (dataJson) {
      state = { ...state, ...JSON.parse(dataJson) }
    }

    const viewJson = window.localStorage.getItem('CivMap.view.0.3.3')
    if (viewJson) {
      state = { ...state, ...JSON.parse(viewJson) }
    }

  } catch (e) {
    console.error('Loading from localStorage failed', e)
  }

  return state
}
