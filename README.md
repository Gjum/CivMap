# CivMap

Interactive, editable personal web map for [Civ-style](https://www.reddit.com/r/CivClassics/) Minecraft servers

Used for [CivClassic](https://ccmap.github.io/), [DevotedMC 3.0](https://dev3map.github.io/), [CivEx](https://civexmap.github.io/).

The custom map tiles (height, biome, landmasses, night) are created with [a different project](https://github.com/Gjum/voxelmap-cache).

## API

### Collection Format

- `info`: `{ "version": "3.0.0-beta3", "last_update": 1553379758 }`
  - `version`: must be set to current version (`"3.0.0-beta3"`) to allow converting to future versions
  - `last_update`: unix timestamp (seconds), optional
- `name`: displayed in the layer selector menu
- `features`: array of [feature objects](#feature-format), optional
- `presentations`: array of [presentation objects](#presentation-format), optional
- `enabled_presentation`: presentation name that will be shown when collection is loaded, if unset defaults to first presentation

### Feature Format

A typical feature looks like this:

```js
{
  "id": "e767a0bc-9df0-4ec1-87b7-f5cb528bb38b", // must be globally unique
  "name": "Mount Augusta", // displayed in sidebar, typically styles use this as label
  "x": -6700, "z": 3000, // or "line", "polygon", etc. - see below
  "image": "https://example.com/MtA-Render.png", // shows up in the sidebar
  "web": "/r/MtAugusta" // arbitrary properties are ok, "/r/" etc. get rendered as clickable link
}
```

`id` must be globally unique. CivMap uses UUIDs internally but this can be any text (e.g. namespaced: `"com.github.gjum.civclassic.railmap.stations.westminster"`).
They are needed for updating old features with new info and referring from one feature to another.

`polygon, line, x, z, radius, map_image` represent the feature's geometry on the map.
Any feature can have any combination of these, the chosen geometry is currently prioritized `image > polygon > line > circle > marker`. In a future version, the geometry with the biggest surface at the current zoom level will be displayed (marker when zoomed out so the feature only covers a few pixels, polygon/line/circle/image when zoomed in).

- `{ "map_image": { "bounds": [[w,n],[e,s]], "url": "https://example.com/overlay.png" } }` where `w/n/e/s` are west/north/east/south. Accepts PNG, JPG, SVG (but avoid SVGs covering large areas, currently they lag some browsers when zoomed in)
- `{ "polygon": [ [ [x1,z1], [x2,z2], … ], [optional: holes or more polygon parts], … ] }` The polygon will be closed automatically, you do not need to duplicate the first/last point.
- `{ "line": [ [ [x1,z1], [x2,z2], … ], [optional: more line parts], … ] }`
- polygons/lines also allow a string like `"(((x1,z1!x2,z2!…)),…)"` instead (more compact, used in export URLs)
- circle: `{ "x": 123, "z": -321, "radius": 456 }`
- point: `{ "x": 123, "z": -321 }`

All coordinates are centered on the center of a block, except image bounds which align with a block's NW corner.

`name` and `image` are also special:

- `name`: shown in sidebar selecion menues, distinguishes between all features, ex: `Westminster Rail Station`
- `image`: direct URL, shown in Feature Details

### Presentation Format

TODO: name, style_base, style_highlight, zoom_styles

#### Style Format

TODO allowed keys, prop mapping, prop value replacement

### In-Browser Entry Point

Currently, the library exposes a [Redux Store](https://redux.js.org/api/store) as `window.CivMap.api`.

Some examples:

```js
console.log(CivMap.api.getState())
```

returns a read-only snapshot of the whole application data store:

```js
{
  collections: {civmap:collection/user: {…}, /data/settlements.civmap.json: {…}},
  control: {appMode: "LAYERS", searchQuery: null, activeFeatureId: "e767a0bc-9df0-4ec1-87b7-f5cb528bb38b", …},
  mapView: {basemapId: "simple", viewport: {x: -123, z: 321, radius: 4321}},
  // ...
}
```

Do not change anything directly, but reading from it is fine.
To change something, use [`CivMap.api.dispatch(…)`](https://redux.js.org/api/store#dispatch).

For example, to add/update a feature:

```js
CivMap.api.dispatch({
  type: "UPDATE_FEATURE_IN_COLLECTION",
  collectionId: "civmap:collection/user",
  feature: {
    id: "e767a0bc-9df0-4ec1-87b7-f5cb528bb38b",
    name: "My Test Feature",
    x: 0, z: 0
  }
})
```

For now, the action constants and parameters may change any time, and can only be found in the source code ([`app/js/store.js`](https://github.com/Gjum/CivMap/blob/master/app/js/store.js)).

## Installation

After cloning the repository, install the dependencies:
```sh
npm install
```

Now you can run the local development web server:
```sh
npm start
```
Open the map on http://localhost:8080

### Creating a new release

Update the version info in `package.json`, create a new tag, and push it to the repository.

Clone your `gh-pages` branch to `dist/`:
```sh
git clone --single-branch -b gh-pages git@github.com:YOUR-GITHUB-ACCOUNT/CivMap.git dist/
```

Generate `dist/js/bundle.js` and the other assets:
```sh
npm run build
```

Push `dist/` to `gh-pages`:
```sh
cd dist/
git commit -a -m "Release v$version"
```
