import { circleBoundsFromFeature, circleToBounds, deepFlip } from './math'
import { getJSON } from './net'
import { activateFilters, addFeature, loadFeatures, loadFilters, openFeatureDetail, setActiveBasemap, setViewport } from '../store'

export function loadAppStateFromUrlData(urlData, store) {
  if (urlData.basemap) {
    store.dispatch(setActiveBasemap(urlData.basemap))
  }
  if (urlData.collectionUrl) {
    loadCollectionJsonAsync(urlData.collectionUrl, store.dispatch, loadDependentThings)
  } else {
    loadDependentThings()
  }
  function loadDependentThings(data, error) {
    if (error) {
      // TODO handle error
    }
    // TODO move into view if collectionUrl but no viewport is set
    if (urlData.collection) {
      // TODO move into view if no viewport is set
      loadCollectionJson(urlData.collection, store, '#')
    }
    if (urlData.feature) {
      if (urlData.feature.geometry && urlData.feature.properties) {
        // probably a v2.0.0 feature
        urlData.feature = convertFeatureFrom2(urlData.feature)
      }
      store.dispatch(addFeature(urlData.feature))
      urlData.featureId = urlData.feature.id
    }
    if (urlData.featureId) {
      const feature = store.getState().features[urlData.featureId]
      if (feature) {
        store.dispatch(openFeatureDetail(urlData.featureId))
        if (!urlData.viewport) {
          const viewport = circleBoundsFromFeature(feature)
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
  data = {
    info: {},
    features: [],
    filters: [],
    ...data,
  }

  if (data.info.version === '0.3.0') {
    // current version, nothing to convert
  } else if (data.info.version === '2.0.0') {
    data = convertCollectionFrom2(data)

    // } else if (data.info.version === '1.0.0') {
    // TODO convert from 1.0.0: layers
  } else {
    alert(`Can't read Collection version "${data.info.version}", use 0.3.0 please`)
    return
  }

  dispatch(loadFeatures(data.features))
  dispatch(loadFilters(data.filters))
  dispatch(activateFilters(data.active_filters || data.filters.map(f => f.name)))

  console.log(`Loaded collection with ${data.features.length} features and ${data.filters.length} filters at version "${data.info.version}" from ${source}`)
}

export function convertFeatureFrom2(f) {
  switch (f.geometry.type) {
    case 'marker': {
      const [z, x] = f.geometry.position
      return {
        ...f.properties, style: f.style, id: f.id,
        x, z,
      }
    }
    case 'circle': {
      const [z, x] = f.geometry.center
      return {
        ...f.properties, style: f.style, id: f.id,
        x, z, radius: f.geometry.radius,
      }
    }
    case 'line': {
      return {
        ...f.properties, style: f.style, id: f.id,
        line: deepFlip(f.geometry.positions),
      }
    }
    case 'polygon': {
      return {
        ...f.properties, style: f.style, id: f.id,
        polygon: deepFlip(f.geometry.positions),
      }
    }
    case 'image': {
      const { bounds, url } = f.geometry
      return {
        ...f.properties, style: f.style, id: f.id,
        map_image: { url, bounds: deepFlip(bounds) },
      }
    }
    default: {
      console.error('[convertCollectionFrom2] unknown feature geometry', f.geometry.type)
      return f
    }
  }
}

export function convertCollectionFrom2(data) {
  const features = data.features.map(convertFeatureFrom2)
  return { ...data, features }
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
    else if (key == 'feature') urlData.feature = JSON.parse(decodeURI(val))
    else if (key == 'collection') urlData.collection = JSON.parse(decodeURI(val))
    else if (key == 'u') urlData.collectionUrl = val
    else console.error("Unknown url hash entry", part)
  })

  return urlData
}

export function getFileProcessor(fileName) {
  if (fileName === 'Snitches.csv') {
    return { process: processSnitchMasterFile, description: 'SnitchMaster snitches' }
  } else if (fileName.endsWith('.civmap.json')) {
    return { process: processCollectionFile, description: 'CivMap Collection' }
  } else if (fileName.endsWith('.points')) {
    return { process: processVoxelWaypointsFile, description: 'VoxelMap waypoints' }
  } else if (/([-0-9]+),([-0-9]+)\.png/.test(fileName)) {
    return { process: processJourneyTileFile, description: 'JourneyMap tile' }
  }
}

export function processJourneyTileFile(file, dispatch) {
  const reader = new FileReader()
  reader.onload = (eventRead) => {
    const imgUrl = eventRead.target.result

    const [_fullMatch, ix, iz] = file.name.match(/([-0-9]+),([-0-9]+)\.png/)
    const n = parseInt(iz) * 512
    const w = parseInt(ix) * 512
    const s = n + 512
    const e = w + 512

    const fid = `ccmap/dragdrop/tile/journeymap/${ix}-${iz}`
    const name = `JourneyMap tile ${ix},${iz}`

    dispatch(addFeature({
      id: fid,
      map_image: {
        url: imgUrl,
        bounds: [[w, n], [e, s]],
      },
      name: name,
      is_journeymap_tile: true,
    }))
  }
  reader.readAsDataURL(file)
}

export function processCollectionFile(file, dispatch) {
  const reader = new FileReader()
  reader.onload = (eventRead) => {
    const text = eventRead.target.result
    const json = JSON.parse(text)
    loadCollectionJson(json, dispatch, 'drag-drop')
  }
  reader.readAsText(file)
}

export function processVoxelWaypointsFile(file, dispatch) {
  const reader = new FileReader()
  reader.onload = (eventRead) => { processVoxelWaypointsText(eventRead.target.result, dispatch, file.name) }
  reader.readAsText(file)
}

export function processVoxelWaypointsText(text, dispatch, source) {
  // name, x, z, y, enabled, red, green, blue, suffix, world, dimensions
  const features = text.split('\n')
    .filter(line => line.includes('x:'))
    .map(line => {
      const p = {}
      line.split(',').map(entry => {
        const [key, val] = entry.split(':')
        p[key] = val
      })
      p.x = parseInt(p.x)
      p.y = parseInt(p.y)
      p.z = parseInt(p.z)
      p.red = parseFloat(p.red)
      p.green = parseFloat(p.green)
      p.blue = parseFloat(p.blue)
      p.enabled = p.enabled == 'true'

      const [r, g, b] = [p.red, p.green, p.blue].map(c => Math.round(255 * c))

      const fid = `ccmap/dragdrop/waypoint/voxelmap/${p.x},${p.y},${p.z},${p.name}`
      const color = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)

      return {
        ...p,
        id: fid,
        color,
        is_voxelmap_waypoint: true,
        is_waypoint: true,
      }
    })

  dispatch(loadFeatures(features))
  console.log('Loaded', features.length, 'waypoints from', source)

  // TODO create+enable preconfigured waypoints filter
}

export function processSnitchMasterFile(file, dispatch) {
  const reader = new FileReader()
  reader.onload = (eventRead) => {
    const text = eventRead.target.result

    const features = text.split('\n')
      .filter(line => line) // skip empty
      .map(line => {
        let [x, y, z, world, source, group, name, cull] = line.split(',')
        x = parseInt(x)
        y = parseInt(y)
        z = parseInt(z)
        cull = parseFloat(cull)

        name = name || `Snitch at ${x},${y},${z} on [${group}]`

        const fid = `ccmap/dragdrop/snitchmaster/${x},${y},${z},${group}`

        // TODO colorize groups

        return {
          id: fid,
          polygon: [[x - 11, z - 11], [x + 12, z - 11], [x + 12, z + 12], [x - 11, z + 12]],
          name, x, y, z, world, source, group, cull,
          is_snitch: true,
          from_snitchmaster: true,
        }
      })

    dispatch(loadFeatures(features))
    console.log('Loaded', features.length, 'snitches from', file.name)

    // TODO create+enable preconfigured snitchmaster filter
  }
  reader.readAsText(file)
}
