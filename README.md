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

The "presentation" lets you control the style attributes of the features.

- `style_base` is the same for all features in the collection
- one of the `zoom_styles` is applied to all features according to the current zoom level (see example below)
- `style_highlight` is only applied to highlighted features (selection, search results, ...)

The overriding order is: `combinedStyle = { ...baseStyle, ...zoomStyle, ...highlightStyle }`
The result will be passed through this function and then applied to the leaflet element ([code](https://github.com/Gjum/CivMap/blob/master/app/js/utils/presentation.js#L102)).

#### Style Format

- `label` (default `$name`)
- `opacity` (fill and stroke; 0 means the feature is invisible)
- `fill_opacity`
- `color` (fill and stroke)
- `hue` (`[0..360]`; overrides color if set)
- `stroke_color`
- `stroke_width`
- `dash_array`
- `icon_size`
- `icon` (URL; a circle by default)

More details on marker icon styles in the [code](https://github.com/Gjum/CivMap/blob/master/app/js/components/leaflet/EditableMarker.jsx#L10)

#### Presentations Example

```js
{ // ... other collection properties omitted ...
  "presentations": [
    // there can be none (=default styles), one, or several presentations
    // if there's several, the sidebar lets the user select which one to use for this collection
    {
      "name": "Rails and Stops", // when there's more than one presentation, this name will show up in the sidebar
      "style_base": {
        "color": "#ffffff", // primitives are applied to all features
        // $-prefixed feature keys resolve to the value of that feature property
        // | separates a fallback value: style = feature[key] || fallback
        // this will be fixed to use undefined/NaN check, to allow 0, '', and false as values
        "label": "$nice_name|(unnamed)",
        // objects specify how to compute the style from the feature props
        "stroke_color": {
          // category selectors are like a switch-case statement
          // for each feature, its "stroke_color" style depends on the feature's "elevation" property
          "feature_key": "elevation",
          "categories": {
            "underground": "#00ff00",
            "surface": "#00ffff",
            // the value can also be another nested selector
            "elevated": {
              "feature_key": "elevation_type",
              "categories": {
                "skylimit": "#123123",
                "viaduct": "#345345"
              },
              "default": "#234234"
            }
          },
          "default": "#808080"
        },
        "stroke_width": {
          // range selectors linearly map the value of a feature property to a style value, interpolating/extrapolating appropriately
          // implementation: https://github.com/Gjum/CivMap/blob/master/app/js/utils/presentation.js#L50
          "feature_key": "num_tracks",
          "range": {
            "min_in": 1, "max_in": 5, // in feature units
            "min_out": 2, "max_out": 10 // in style units (here: px)
          }
        }
      },
      "zoom_styles": {
        // searched in ascending order for the largest key that is smaller than or equal to the current zoom
        "-6": { // zoomed out all the way
          // each zoom entry is structured exactly the same as style_base
          "opacity": {
            // example: only features with "importance":"major" are visible when zoomed out
            "feature_key": "importance",
            "categories": {
              "major": 1
            },
            "default": 0
          }
        },
        "0": { // zoomed in at 1 block to 1 pixel
          "opacity": 1 // now all features are visible
        }
      },
      // style_highlight is structured exactly the same as style_base,
      // but applied to selected/highlighted features in addition to style_base
      "style_highlight": {
        "stroke_color": "#ff0000"
      }
    }
  ]
}
```

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
