import { circleBoundsFromFeatureGeometry, circleToBounds } from './math'
import { getJSON } from './net'
import { loadLayer, openFeatureDetail, setActiveBasemap, setViewport, setVisibleLayers } from '../store'

export function loadAppStateFromUrlData(urlData, store) {
  if (urlData.basemap) {
    store.dispatch(setActiveBasemap(urlData.basemap))
  }
  if (urlData.overlayUrl) {
    loadOverlayJsonAsync(urlData.overlayUrl, store, loadDependentThings)
  } else {
    loadDependentThings()
  }
  function loadDependentThings() {
    if (urlData.overlay) {
      // TODO load overlay, open layer detail mode, move into view if no viewport is set
    }
    if (urlData.feature) {
      // TODO load feature, open feature detail mode, move into view if no viewport is set
    }
    if (urlData.featureId) {
      store.dispatch(openFeatureDetail(urlData.featureId))
      if (!urlData.viewport) {
        const feature = store.getState().features[urlData.featureId]
        const viewport = circleBoundsFromFeatureGeometry(feature.geometry)
        store.dispatch(setViewport(viewport))
      }
    }
    if (urlData.viewport) {
      store.dispatch(setViewport(urlData.viewport))
    }
  }
}

export function loadOverlayJsonAsync(url, store, cb) {
  getJSON(url,
    data => {
      if (!data.visibleLayers) {
        data.visibleLayers = data.layers.map(layer => layer.id)
      } else {
        // TODO remove unreferenced visibleLayers
      }

      // TODO remove unreferenced features

      // TODO do this import operation in one batch using loadOverlay action
      // also do it in the caller, not in here, to get rid of store dependency
      // also use promises for this
      data.layers.forEach(layer => store.dispatch(loadLayer(layer)))
      store.dispatch(setVisibleLayers(data.visibleLayers))

      console.log('Loaded', data.layers.length, 'layers from', url)

      cb && cb(null, data)
    },
    err => {
      console.error("Could not load public layers from " + url, err)
      cb && cb(err)
    }
  )
}

export function parseUrlHash(hash) {
  const urlData = {
    basemap: undefined,
    viewport: undefined,
    overlayUrl: undefined,
    featureId: undefined,
    feature: undefined,
    overlay: undefined,
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
    else if (key == 'overlay') urlData.overlay = JSON.parse(val)
    else if (key == 'u') urlData.overlayUrl = val
    else console.log("Unknown url hash entry", part)
  })

  return urlData
}
