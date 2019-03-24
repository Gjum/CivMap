import { convertFeatureFrom200, convertCollectionFromAny } from './convertFromOld'
import { circleBoundsFromFeature, circleToBounds } from './math'
import { getJSON } from './net'
import { enablePresentationInCollection, importCollection, openFeatureDetail, openSearch, setActiveBasemap, setViewport, updateFeatureInCollection, lookupFeature } from '../store'

/**
 * @typedef {{basemap?: String, viewport?: Object, collectionUrl?: String, featureId?: String, feature?: Object, collection?: Object, searchQuery?: String}} UrlData
 */

// the [[#,#],[#,#]] blow up the url size when encoded
// TODO represent number arrays in binary+base64 format
export function exportPositions(positions) {
  return JSON.stringify(positions).replace(/\],\[/g, '!').replace(/\[/g, '(').replace(/\]/g, ')')
}

export function importPositions(positionsStr) {
  return JSON.parse(positionsStr.replace(/!/g, '],[').replace(/\(/g, '[').replace(/\)/g, ']'))
}

export function exportStringFromFeature(feature) {
  const f = exportFeature(feature)
  if (f.line) f.line = exportPositions(f.line)
  if (f.polygon) f.polygon = exportPositions(f.polygon)
  // instead of encodeURIComponent, because here most special characters are fine
  return encodeURI(JSON.stringify(f)).replace(/#/g, '%23')
}

export function exportFeature(feature) {
  const fExport = { name: feature.name, ...feature }
  delete fExport.collectionId
  return fExport
}

export function exportPresentation(presentation) {
  const pExport = { ...presentation }
  delete pExport.collectionId
  return pExport
}

export function exportCollection(collection) {
  const exportedCollection = {
    features: Object.values(collection.features).map(exportFeature),
    presentations: Object.values(collection.presentations).map(exportPresentation),
  }
  const keepKeys = ['enabled_presentation', 'id', 'info', 'name', 'source']
  for (const key of keepKeys) {
    if (collection[key] !== undefined) {
      exportedCollection[key] = collection[key]
    }
  }
  return exportedCollection
}

export function autoImportCollectionsOnStartup(store) {
  for (const collection of Object.values(store.getState().collections)) {
    const source = collection.source
    if (!(typeof source === 'string')) continue
    if (!source.startsWith('http://')
      && !source.startsWith('https://')
      && !source.startsWith('/')) {
      continue
    }
    loadCollectionJsonAsync(source, store.dispatch)
  }
}

const getDefaultUrlCollection = (feature = null) => ({
  id: "civmap:url_import",
  name: "Linked to me",
  mode: "temporary",
  enabled_presentation: true,
  ...(feature && { features: [feature] }),
})

/**
 * @param {UrlData} urlData
 */
export function loadAppStateFromUrlData(urlData, store) {
  urlData = { ...urlData }
  if (urlData.basemap) {
    store.dispatch(setActiveBasemap(urlData.basemap))
  }
  if (urlData.searchQuery) {
    store.dispatch(openSearch(urlData.searchQuery))
  }
  if (urlData.collectionUrl) {
    loadCollectionJsonAsync(urlData.collectionUrl, store.dispatch, loadDependentThings)
  } else {
    loadDependentThings()
  }
  function loadDependentThings(error, urlCollectionData) {
    if (error) {
      // TODO handle error
    }
    // TODO move into view if collectionUrl but no viewport is set
    if (urlData.collection) {
      loadCollectionJson(urlData.collection, store, 'civmap:url_import/collection')
    }
    if (urlData.feature) {
      if (urlData.feature.geometry && urlData.feature.properties) {
        // probably a v2.0.0 feature
        urlData.feature = convertFeatureFrom200(urlData.feature)
      }
      store.dispatch(importCollection(getDefaultUrlCollection(urlData.feature)))
      urlData.featureId = urlData.feature.id
    }
    if (urlData.featureId) {
      const feature = lookupFeature(store.getState(), urlData.featureId, (urlCollectionData || {}).id)
      if (feature) {
        store.dispatch(openFeatureDetail(feature.id, feature.collectionId))
        if (!urlData.viewport) {
          const viewport = circleBoundsFromFeature(feature)
          store.dispatch(setViewport(viewport))
        }
      } else {
        console.warn(`Could not find feature by id from hash: ${urlData.featureId}`)
      }
    }
    if (urlData.viewport) {
      store.dispatch(setViewport(urlData.viewport))
    }
  }
}

export function loadCollectionJsonAsync(url, dispatch, cb) {
  getJSON(url,
    data => {
      loadCollectionJson(data, dispatch, url)
      cb && cb(null, data)
    },
    err => {
      console.error("Could not load collection from " + url, err)
      cb && cb(err)
    }
  )
}

export function loadCollectionJson(data, dispatch, source) {
  const collection = convertCollectionFromAny({
    info: {},
    features: [],
    presentations: [],
    ...data,
    source,
  })

  if (!collection.enabled_presentation && collection.presentations[0]) collection.enabled_presentation = collection.presentations[0].name

  dispatch(importCollection(collection))

  console.log(`Loaded collection with ${collection.features.length} features and ${collection.presentations.length} presentations at version "${collection.info.version}" from ${collection.source}`)

  return data.source
}

/**
 * @returns {UrlData}
 */
export function parseUrlHash(hash) {
  const urlData = {
    basemap: undefined,
    viewport: undefined,
    collectionUrl: undefined,
    featureId: undefined,
    feature: undefined,
    collection: undefined,
    searchQuery: undefined,
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
    const [key, val] = decodeURIComponent(part).split('=', 2)
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
    else if (key == 'q') urlData.searchQuery = val
    else if (key == 'u' || key == 'url') urlData.collectionUrl = val
    else console.error("Unknown url hash entry", part)
  })

  return urlData
}
