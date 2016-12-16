export function getJSON(url, onData, onErr) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.onreadystatechange = function() {
    if (this.readyState === 4) {
      if (this.status >= 200 && this.status < 400) {
        try {
          var json = JSON.parse(this.responseText);
        } catch(e) {
          if (onErr) onErr(e);
          else console.error('Error converting json from', url, e);
          return;
        }
        onData(json);
      } else {
        if (onErr) onErr(this);
        else console.error('Error getting json from', url, this);
      }
    }
  };
  request.send();
  request = null;
}

export function xz(x, z) {
  return [z, x];
}

export function intCoords(point) {
  var x = parseInt(point.lng);
  var z = parseInt(point.lat);
  if (point.lng < 0) x -= 1;
  if (point.lat < 0) z -= 1;
  return [z, x];
}

export function viewToHash(leaf) {
  var [z, x] = intCoords(leaf.getCenter());
  return  '' + x + 'x/' + z + 'z/' + leaf.getZoom() + 'zoom';
}

export function hashToView(hash) {
  if (!hash) return {x: 0, z: 0, zoom: -4};
  var [x, z, zoom] = hash.slice(1).split('/', 3)
    .concat([0,0,0]);
  return {x: parseFloat(x), z: parseFloat(z), zoom: parseFloat(zoom)};
}

export function radiusToBounds(radius) {
  return [xz(-radius, -radius), xz(radius, radius)];
}

export function deepLatLngToArr(o) {
  if (Array.isArray(o))
    return o.map(e => deepLatLngToArr(e));
  return [Math.round(o.lat), Math.round(o.lng)];
}

export function updateJsonObject(oInto, oFrom) {
  if (!oInto) return oFrom;
  if (!oFrom) return oInto;
  for (var key in oFrom) {
    oInto[key] = oFrom[key];
  }
  return oInto;
}

export function mapObj(obj, fn) {
  var results = [];
  for (var key in obj) {
    results.push(fn(obj[key], key));
  }
  return results;
}
