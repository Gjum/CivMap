export function xz(x, z) {
  return [z, x];
}

export function intCoords(point) {
  var x = parseInt(point.lng);
  var z = parseInt(point.lat);
  if (point.lng < 0) x -= 1;
  if (point.lat < 0) z -= 1;
  return [x, z];
}

export function boundsToCircle(bounds) {
  const [x, z] = intCoords(bounds.getCenter());
  const [e, n] = intCoords(bounds.getNorthEast());
  const [w, s] = intCoords(bounds.getSouthWest());
  const radius = parseInt(Math.min(Math.abs(e - w), Math.abs(s - n)) / 2);
  return { x, z, radius };
}

export function circleToBounds({ x, z, radius }) {
  return [[z - radius, x - radius], [z + radius, x + radius]];
}

export function deepLatLngToArr(o) {
  if (Array.isArray(o))
    return o.map(e => deepLatLngToArr(e));
  return [Math.round(o.lat), Math.round(o.lng)];
}
