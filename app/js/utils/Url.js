import { boundsToCircle, intCoords, circleToBounds, xz } from './Math';
import { postJSON } from './Net';

export function viewToHash(appState) {
  let hash = '';
  let {
    mapView: { basemapId, bounds },
    mapConfig: { basemaps, borderApothem },
  } = appState;

  const defaultBasemap = basemaps.find(b => b.isDefault) || {};
  if (basemapId != defaultBasemap.id)
    hash += '#t=' + basemapId;

  if (bounds) {
    const { x, z, radius } = boundsToCircle(bounds);
    if (radius < borderApothem) {
      hash += '#c=' + x + ',' + z + ',r' + radius;
    }
  }

  const overlay = appState.overlay;
  if (overlay.length) {
    hash += '#o=' + JSON.stringify(overlay);
  }

  return hash || '#';
}

/*
Returns a JS object with any of the following keys: basemap, bounds, overlay.
`basemap` is always set, or left on the default setting.
If `view.bounds` is set, the app will fit the map view to the bounds.
If `view.bounds` is unset and `view.overlay` or `view.json` is set, the app will set the bounds itself based on the features geometry.
`view.bounds` may be set even though `view.overlay` is set too, in this case `view.bounds` is used.
*/
export function hashToView(hash, defaults) {
  var view = {
    bounds: circleToBounds({ x: 0, z: 0, radius: defaults.radius }),
    basemap: defaults.basemap,
  };
  if (!hash) return view;

  // backwards compatibility
  let oldUrlMatch = hash.match(/^#([-0-9]+)x?\/([-0-9]+)z?\/?([-0-9]*)/);
  if (oldUrlMatch) {
    let [fullMatch, x, z, zoom] = oldUrlMatch;
    [x, z, zoom] = [x, z, zoom || 0].map(parseFloat);
    let radius = Math.pow(2, -zoom) * 500; // arbitrary, the old urls didn't track the actual radius
    view.bounds = circleToBounds({ x, z, radius });
    return view;
  }

  hash.slice(1).split('#').map(part => {
    let [key, vals] = part.split('=', 2);
    if (key == 'b') {
      let [w, n, e, s] = vals.split(',', 4).map(parseFloat);
      view.bounds = [xz(w, n), xz(e, s)];
    }
    else if (key == 'c') {
      let [x, z, radius] = vals.split(/,r?/, 3).map(parseFloat);
      if (!radius) view.marker = true;
      radius = radius || 10;
      view.bounds = circleToBounds({ x, z, radius });
    }
    else if (key == 't') view.basemap = vals;
    else if (key == 'o') {
      view.overlay = JSON.parse(vals);
      view.jsonUrl = null;
    }
  });

  return view;
}

export function shortenUrl(url, token, cb) {
  postJSON('https://www.googleapis.com/urlshortener/v1/url?key=' + token, {
    longUrl: url,
  }, response => {
    if (response.id) {
      return cb(response.id);
    }
    console.error('invalid goo.gl response', response);
  });
}
