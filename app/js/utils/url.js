import { circleBoundsFromFeatureGeometry, circleToBounds } from './math'
import { getJSON } from './net'
import { openFeatureDetail, setActiveBasemap, setViewport, loadFeatures } from '../store'

export function loadAppStateFromUrlData(urlData, store) {
  if (urlData.basemap) {
    store.dispatch(setActiveBasemap(urlData.basemap))
  }
  if (urlData.collectionUrl) {
    loadCollectionJsonAsync(urlData.collectionUrl, store, loadDependentThings)
  } else {
    loadDependentThings()
  }
  function loadDependentThings(data, error) {
    if (error) {
      // TODO handle error
    }
    if (urlData.collection) {
      // TODO load collection, move into view if no viewport is set
    }
    if (urlData.feature) {
      // TODO load feature, open feature detail mode, move into view if no viewport is set
    }
    if (urlData.featureId) {
      const feature = store.getState().features[urlData.featureId]
      if (feature) {
        store.dispatch(openFeatureDetail(urlData.featureId))
        if (!urlData.viewport) {
          const viewport = circleBoundsFromFeatureGeometry(feature.geometry)
          store.dispatch(setViewport(viewport))
        }
      } else {
        // TODO handle error
      }
    }
    if (urlData.viewport) {
      store.dispatch(setViewport(urlData.viewport))
    }
  }
}

export function loadCollectionJsonAsync(url, store, cb) {
  getJSON(url,
    data => {
      loadCollectionJson(data, store, url)
      cb && cb(null, data)
    },
    err => {
      console.error("Could not load collection from " + url, err)
      cb && cb(err)
    }
  )
}

export function loadCollectionJson(data, store, url) {
  // TODO check version, fallback/error on unexpected
  data = { ...data }
  if (!data.features) data.features = []
  if (!data.filters) data.filters = []

  store.dispatch(loadFeatures(data.features))
  // store.dispatch(addFilters(data.filters))
  // store.dispatch(enableFilters(data.enabledFilters))

  console.log('Loaded collection with', data.features.length, 'features and',
    data.filters.length, 'filters from', url)
}

export function parseUrlHash(hash) {
  const urlData = {
    basemap: undefined,
    viewport: undefined,
    collectionUrl: undefined,
    featureId: undefined,
    feature: undefined,
    collection: undefined,
  }
  if (!hash) return urlData

  // backwards compatibility
  const oldUrlMatch = hash.match(/^#([-0-9]+)x?\/([-0-9]+)z?\/?([-0-9]*)/)
  if (oldUrlMatch) {
    const [x, z, zoom = 0] = oldUrlMatch.slice(1).map(parseFloat)
    const radius = Math.pow(2, -zoom) * 500 // arbitrary, the old urls didn't track the actual radius
    urlData.viewport = circleToBounds({ x, z, radius })
    return urlData
  }

  hash.slice(1).split('#').map(part => {
    const [key, val] = part.split('=', 2)
    if (key == 'c') {
      let [x, z, radius] = val.split(/[,r]+/, 3).map(parseFloat)
      if (!radius) urlData.marker = true
      radius = radius || 100
      urlData.viewport = { x, z, radius }
    }
    else if (key == 'b') urlData.basemap = val
    else if (key == 't') urlData.basemap = val
    else if (key == 'f') urlData.featureId = val
    else if (key == 'feature') urlData.feature = JSON.parse(val)
    else if (key == 'collection') urlData.collection = JSON.parse(val)
    else if (key == 'u') urlData.collectionUrl = val
    else console.error("Unknown url hash entry", part)
  })

  return urlData
}
