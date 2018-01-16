import * as L from 'leaflet'

export function intCoords(point) {
  var x = parseInt(point.lng)
  var z = parseInt(point.lat)
  if (point.lng < 0) x -= 1
  if (point.lat < 0) z -= 1
  return [x, z]
}

export function boundsToContainedCircle(bounds) {
  const [x, z] = intCoords(bounds.getCenter())
  const [e, n] = intCoords(bounds.getNorthEast())
  const [w, s] = intCoords(bounds.getSouthWest())
  const radius = Math.round(Math.min(Math.abs(e - w), Math.abs(s - n)) / 2)
  return { x, z, radius }
}

export function boundsToEnclosingCircle(bounds) {
  const [x, z] = intCoords(bounds.getCenter())
  const [e, n] = intCoords(bounds.getNorthEast())
  const [w, s] = intCoords(bounds.getSouthWest())
  const radius = Math.round(Math.max(Math.abs(e - w), Math.abs(s - n)) / 2)
  return { x, z, radius }
}

export function circleToBounds({ x, z, radius }) {
  return [[z - radius, x - radius], [z + radius, x + radius]]
}

export function deepLatLngToArr(o) {
  if (Array.isArray(o))
    return o.map(e => deepLatLngToArr(e))
  return [Math.round(o.lat), Math.round(o.lng)]
}

export function flatLatLngs(o) {
  if (Array.isArray(o[0]))
    return o.map(e => flatLatLngs(e))
  return o
}

export function circleBoundsFromFeatureGeometry(geometry) {
  switch (geometry.type) {
    case 'marker': {
      const { position: [z, x] } = geometry
      return { z, x, radius: 100 } // TODO arbitrary radius
    }
    case 'circle': {
      const { center: [z, x], radius } = geometry
      return { z, x, radius }
    }
    case 'image': {
      return boundsToEnclosingCircle(L.latLngBounds(geometry.bounds))
    }
    case 'line': {
      return boundsToEnclosingCircle(L.latLngBounds(flatLatLngs(geometry.positions)))
    }
    case 'polygon': {
      return boundsToEnclosingCircle(L.latLngBounds(flatLatLngs(geometry.positions)))
    }
    default:
      console.error("[circleBoundsFromFeatureGeometry] Unknown feature geometry type", geometry)
      return { x: 0, z: 0, radius: 0 }
  }
}
