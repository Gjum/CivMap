export function intCoords(point) {
  let x, z
  if (Array.isArray(point)) {
    [x, z] = point
  } else {
    x = point.lng
    z = point.lat
  }
  let rx = parseInt(x)
  let rz = parseInt(z)
  if (rx !== x && x < 0) rx -= 1
  if (rz !== z && z < 0) rz -= 1
  return [rx, rz]
}

export function intCoord(c) {
  let r = parseInt(c)
  if (r !== c && c < 0) r -= 1
  return r
}

export function boundsToContainedCircle(bounds) {
  const [x, z] = intCoords(bounds.getCenter())
  const [e, n] = intCoords(bounds.getNorthEast())
  const [w, s] = intCoords(bounds.getSouthWest())
  const radius = Math.round(Math.min(Math.abs(e - w), Math.abs(s - n)) / 2)
  return { x, z, radius }
}

export function rectToEnclosingCircle(rect) {
  const [[w, n], [e, s]] = rect
  const [x, z] = intCoords([(e + w) / 2, (s + n) / 2])
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
    return positions.reverse() // line: [[x,z],p2,...]
  if (!Array.isArray(positions[0][0][0]))
    return positions.map(l => l.reverse()) // polyline: [[[x,z],p2,...],l2,...]
  if (!Array.isArray(positions[0][0][0][0]))
    return positions.map(s => s.map(l => l.reverse())) // multipolygon: [[[[x,z],p2,...],l2,...],s2,...]
  console.error('cannot reverse too deeply nested positions:', positions)
  return positions
}

export function boundsFromPositions(positions) {
  if (positions[0] instanceof Array) {
    let [[w, n], [e, s]] = boundsFromPositions(positions[0])
    positions.forEach(pos => {
      let [[pw, pn], [pe, ps]] = boundsFromPositions(pos)
      if (w > pw) w = pw
      if (n > pn) n = pn
      if (e < pe) e = pe
      if (s < ps) s = ps
    })
    return [[w, n], [e, s]]
  } else { // point
    const [x, z] = positions

    return [[x, z], [x, z]]
  }
}

export function rectBoundsFromFeature(feature) {
  const has = (k) => feature[k] !== undefined
  // TODO select largest/according to zoom level
  if (has('map_image')) return boundsFromPositions(feature.map_image.bounds)
  if (has('polygon')) return boundsFromPositions(feature.polygon)
  if (has('line')) return boundsFromPositions(feature.line)
  if (has('x') && has('z')) {
    const { x, z, radius = 100 } = feature // TODO arbitrary radius
    return [[x - radius, z - radius], [x + radius, z + radius]]
  }

  console.error("[rectBoundsFromFeature] Unknown feature geometry", feature)
  return [[-9000, -9000], [9000, 9000]]
}

export function circleBoundsFromFeature(feature) {
  return rectToEnclosingCircle(rectBoundsFromFeature(feature))
}
