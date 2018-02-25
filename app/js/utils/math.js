import * as L from 'leaflet'

export function intCoords(point) {
  var z = parseInt(point.lat)
  var x = parseInt(point.lng)
  if (point.lat < 0) z -= 1
  if (point.lng < 0) x -= 1
  return [z, x]
}

export function boundsToContainedCircle(bounds) {
  const [z, x] = intCoords(bounds.getCenter())
  const [n, e] = intCoords(bounds.getNorthEast())
  const [s, w] = intCoords(bounds.getSouthWest())
  const radius = Math.round(Math.min(Math.abs(e - w), Math.abs(s - n)) / 2)
  return { x, z, radius }
}

export function boundsToEnclosingCircle(bounds) {
  const [z, x] = intCoords(bounds.getCenter())
  const [n, e] = intCoords(bounds.getNorthEast())
  const [s, w] = intCoords(bounds.getSouthWest())
  const radius = Math.round(Math.max(Math.abs(e - w), Math.abs(s - n)) / 2)
  return { x, z, radius }
}

export function circleToBounds({ x, z, radius }) {
  return [[z - radius, x - radius], [z + radius, x + radius]]
}

export function deepLatLngToArr(o) {
  if (Array.isArray(o))
    return o.map(e => deepLatLngToArr(e))
  return intCoords(o)
}

export function flatLatLngs(o) {
  if (Array.isArray(o[0]))
    return o.map(e => flatLatLngs(e))
  return o
}

export function centered(positions) {
  if (Array.isArray(positions[0]))
    return positions.map(e => centered(e))
  return [positions[0] + .5, positions[1] + .5]
}

export function reversePolyPositions(positions) {
  if (!positions || !Array.isArray(positions) || !Array.isArray(positions[0]))
    return positions
  if (!Array.isArray(positions[0][0]))
    return positions.reverse() // line: [[z,x],p2,...]
  if (!Array.isArray(positions[0][0][0]))
    return positions.map(l => l.reverse()) // polyline: [[[z,x],p2,...],l2,...]
  if (!Array.isArray(positions[0][0][0][0]))
    return positions.map(s => s.map(l => l.reverse())) // multipolygon: [[[[z,x],p2,...],l2,...],s2,...]
  console.error('cannot reverse too deeply nested positions:', positions)
  return positions
}

export function circleBoundsFromFeatureGeometry(geometry) {
  switch (geometry.type) {
    case 'label':
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