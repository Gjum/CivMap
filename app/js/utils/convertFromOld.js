import { deepFlip } from './math'

export const currentVersion = '0.3.3'

export function convertCollectionFromAny(data) {
  if (data.info.version === currentVersion) {
    // current version, nothing to convert
  } else if (data.info.version === '0.3.2') {
    data = convertCollectionFrom032(data)
  } else if (data.info.version === '0.3.1') {
    data = convertCollectionFrom031(data)
  } else if (data.info.version === '0.3.0') {
    data = convertCollectionFrom030(data)
  } else if (data.info.version === '2.0.0') {
    data = convertCollectionFrom200(data)
    // } else if (data.info.version === '1.0.0') {
    // TODO convert from 1.0.0: layers
  } else {
    throw Error(`Can't read Collection version "${data.info.version}", use ${currentVersion} please`)
  }
  return data
}

export function convertCollectionFrom032(data) {
  const enabled_presentation = data.presentations[0].id
  return { ...data, enabled_presentation }
}

// XXX update all converters to convert into 0.3.3 instead of 0.3.2
export function convertCollectionFrom031(data) {
  function transformTypeToCategory(e) {
    if (e.type && !e.category) return { ...e, category: e.type }
    return e
  }
  const features = data.features.map(transformTypeToCategory)
  const presentations = data.presentations.map(transformTypeToCategory)
  return { ...data, features, presentations }
}

export function convertCollectionFrom030(data) {
  const features = data.features.map(convertFeatureFrom030)
  // TODO convert filters to presentations
  return { ...data, features }
}

export function convertFeatureFrom030(f) {
  Object.keys(f).forEach(k => {
    if (k.startsWith('is_')) f = { ...f, category: k.slice(3) }
  })
  return f
}

export function convertFeatureFrom200(f) {
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
      console.error('[convertCollectionFrom200] unknown feature geometry', f.geometry.type)
      return f
    }
  }
}

export function convertCollectionFrom200(data) {
  const features = data.features.map(convertFeatureFrom200)
  return { ...data, features }
}
