let lastLocalStorageError = {}

export function saveAppStateToLocalStorage(state) {
  try {
    // TODO noop if unchanged

    const {
      features: {
        featuresCached,
        featuresUser,
      },
      mapView,
      presentations: {
        presentationsCached,
        presentationsEnabled,
        presentationsUser,
      },
    } = state

    window.localStorage.setItem('CivMap.features.0.3.1', JSON.stringify({
      featuresCached,
      featuresUser,
    }))
    window.localStorage.setItem('CivMap.presentations.0.3.1', JSON.stringify({
      presentationsCached,
      presentationsUser,
    }))
    window.localStorage.setItem('CivMap.view.0.3.1', JSON.stringify({
      mapView,
      presentationsEnabled,
    }))

  } catch (e) {
    if (lastLocalStorageError.code != e.code) {
      lastLocalStorageError = e
      console.error('Failed storing app state in LocalStorage:', e)
    }
  }
}

export function getAppStateFromLocalStorage() {
  try {
    // TODO check if older states exist (e.g. `CivMap.data`)

    let state = {}

    const featuresJson = window.localStorage.getItem('CivMap.features.0.3.1')
    if (featuresJson) {
      state = { ...state, features: JSON.parse(featuresJson) }
    }

    const presentationsJson = window.localStorage.getItem('CivMap.presentations.0.3.1')
    if (presentationsJson) {
      state = { ...state, presentations: JSON.parse(presentationsJson) }
    }

    const viewJson = window.localStorage.getItem('CivMap.view.0.3.1')
    if (viewJson) {
      const { presentationsEnabled, ...view } = JSON.parse(viewJson)
      state = { ...state, ...view, presentations: { ...state.presentations, presentationsEnabled } }
    }

    return state

  } catch (e) {
    console.error('Loading from localStorage failed', e)
  }
}
