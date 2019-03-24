import { deepFlip } from './math'

export const currentVersion = '3.0.0-beta3'

export function convertCollectionFromAny(data) {
  if (data.info.version === currentVersion) {
    // current version, nothing to convert
  } else if (data.info.version === '0.3.2') {
    data = convertCollectionFrom032(data)
  } else if (data.info.version === '0.3.1') {
    data = convertCollectionFrom031(data)
  } else if (data.info.version === '2.0.0') {
    data = convertCollectionFrom200(data)
  } else {
    throw Error(`Can't read Collection version "${data.info.version}", use ${currentVersion} please`)
  }
  return data
}

export function convertCollectionFrom032(data) {
  // ignore `category` property: just keep it
  return data
}

export function convertCollectionFrom031(data) {
  // ignore `type` property: just keep it
  return data
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
