import * as L from 'leaflet'

export function intCoords(point) {
  var x = parseInt(point.lng)
  var z = parseInt(point.lat)
  if (x !== point.lng && point.lng < 0) x -= 1
  if (z !== point.lat && point.lat < 0) z -= 1
  return [x, z]
}

export function intCoord(c) {
  let r = parseInt(c)
  if (c < 0) r -= 1
  return r
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
  return [[x - radius, z - radius], [x + radius, z + radius]]
}

export function deepLatLngToArr(positions) {
  if (Array.isArray(positions))
    return positions.map(e => deepLatLngToArr(e))
  return intCoords(positions)
}

export function centered(positions) {
  if (Array.isArray(positions[0]))
    return positions.map(e => centered(e))
  return [positions[0] + .5, positions[1] + .5]
}

export function deepFlip(positions) {
  if (Array.isArray(positions[0]))
    return positions.map(e => deepFlip(e))
  return [positions[1], positions[0]]
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

export function circleBoundsFromFeature(feature) {
  const has = (k) => feature[k] !== undefined
  // TODO select largest/according to zoom level
  if (has('map_image')) return boundsToEnclosingCircle(L.latLngBounds(deepFlip(feature.map_image.bounds)))
  if (has('polygon')) return boundsToEnclosingCircle(L.latLngBounds(deepFlip(feature.polygon)))
  if (has('line')) return boundsToEnclosingCircle(L.latLngBounds(deepFlip(feature.line)))
  if (has('x') && has('z')) {
    return { x: feature.x, z: feature.z, radius: feature.radius || 100 } // TODO arbitrary radius
  }

  console.error("[circleBoundsFromFeature] Unknown feature geometry", feature)
  return { x: 0, z: 0, radius: 0 }
}
