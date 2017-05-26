import {intCoords, radiusToBounds, xz} from './Util';

export function viewToHash(leaf, appState) {
  let boundsObj = leaf.getBounds();
  let [e, n] = intCoords(boundsObj.getNorthEast());
  let [w, s] = intCoords(boundsObj.getSouthWest());
  return '#b=' + [w, n, e, s].join(',')
    + '#t=' + appState.basemap;
}

export function hashToView(hash, appProps, appState) {
  var view = {
    bounds: radiusToBounds(appProps.borderCircleRadius || appProps.borderSquareRadius),
    basemap: appState.basemap,
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
    else if (key == 't') view.basemap = vals;
  });

  return view;
}
