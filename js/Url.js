import {intCoords, radiusToBounds, xz} from './Util';

export function viewToHash(leaf, appState, defaults) {
  var hash = '';

  if (appState.basemap != defaults.basemap)
    hash += '#t=' + appState.basemap;

  let boundsObj = leaf.getBounds();
  let [x, z] = intCoords(boundsObj.getCenter());
  let [e, n] = intCoords(boundsObj.getNorthEast());
  let [w, s] = intCoords(boundsObj.getSouthWest());
  let radius = parseInt(Math.min(Math.abs(e - w), Math.abs(s - n)) / 2);
  if (radius < defaults.radius)
    hash += '#c=' + x + ',' + z + ',r' + radius;

  return hash || '#';
}

export function hashToView(hash, defaults) {
  var view = {
    bounds: radiusToBounds(defaults.radius),
    basemap: defaults.basemap,
  };
  if (!hash) return view;

  // backwards compatibility
  let oldUrlMatch = hash.match(/^#([-0-9]+)x?\/([-0-9]+)z?\/?([-0-9]*)/);
  if (oldUrlMatch) {
    let [fullMatch, x, z, zoom] = oldUrlMatch;
    [x, z, zoom] = [x, z, zoom || 0].map(parseFloat);
    let radius = Math.pow(2, -zoom) * 500;
    view.bounds = [
      [x - radius, z - radius],
      [x + radius, z + radius],
    ];
    return view;
  }

  hash.slice(1).split('#').map(part => {
    let [key, vals] = part.split('=', 2);
    if (key == 'b') {
      let [w, n, e, s] = vals.split(',', 4).map(parseFloat);
      view.bounds = [xz(w, n), xz(e, s)];
    }
    else if (key == 'c') {
      let [x, z, r] = vals.split(/,r?/, 3).map(parseFloat);
      if (!r) view.marker = true;
      r = r || 10;
      view.bounds = [xz(x - r, z - r), xz(x + r, z + r)];
    }
    else if (key == 't') view.basemap = vals;
  });

  return view;
}
