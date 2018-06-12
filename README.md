# CivMap

Interactive, editable personal web map for [Civ-style](https://www.reddit.com/r/CivClassics/) Minecraft servers

Used for [CivClassic](https://ccmap.github.io/), [DevotedMC 3.0](https://dev3map.github.io/), [CivEx 3.0](https://civexmap.github.io/)

The map tiles are created with [a different project](https://github.com/Gjum/voxelmap-cache).

## API

### Collection Format

- `info`: `{ "version": "0.3.2", "last_update": 1522861443 }`
  - `version`: must be set to current version (`"0.3.2"`) to allow converting to future versions
  - `last_update`: unix timestamp, optional
- `features`: array of the [feature objects](#feature-format), optional
- `presentations`: array of the [presentation objects](#presentation-format), optional
- `enabled_presentations`: array of presentation ids that will be shown when collection is loaded, if unset defaults to all `presentations`

### Feature Format

A typical feature looks like this:

```js
{
  "id": "e767a0bc-9df0-4ec1-87b7-f5cb528bb38b",
  "name": "Mount Augusta",
  "x": -6700, "z": 3000, // or "line", "polygon", etc. - see below
  "category": "settlement", // determines look/style of the feature (icon, color, etc.)
  "image": "https://example.com/MtA-Render.png", // shows up in the sidebar
  "web": "/r/MtAugusta" // arbitrary properties are ok, "/r/" etc. get rendered as clickable link
}
```

`id` is globally unique, CivMap uses UUIDs internally but this can be any text, they are needed for updating old features with new info and referring from one feature to another

`polygon, line, x, z, radius, map_image` represent the feature's geometry on the map.
Any feature can have any combination of these, the geometry with the biggest surface at the current zoom level will be displayed, unless configured otherwise in the corresponding Layer.

- `{ "map_image": { "bounds": [[w,n],[e,s]], "url": "https://example.com/overlay.png" } }`
- `{ "polygon": [ [ [x1,z1], [x2,z2], ... ], [optional: holes or more polygon parts], ... ] }`
- `{ "line": [ [ [x1,z1], [x2,z2], ... ], [optional: more line parts], ... ] }`
- polygons/lines also allow `"(((x1,z1!x2,z2!...)),...)"` instead (more compact, especially in URLs)
- circle: `{ "x": 123, "z": -321, "radius": 456 }`
- point: `{ "x": 123, "z": -321 }`

`name, image, color` are also special:

- `name`: shown in selecion menues, distinguishes between all features, ex: `Impasse Rail Station`
- `image`: direct URL, shown in Feature Details
- `color`: depending on the `category`, this sets stroke/fill/icon colors on the map, ex: `#ff8a00`

#### Feature Categories

`category` determines the [style](#style-format) of the feature on the map, and the icon to show on map markers and in the menu (feature details, search results, etc.)

You may use your own non-standard category as long as you make sure the user also receives a matching [Presentation](#presentation-format).

- `settlement`: collection of builds
- `house`: build owned by a player or government
- `nation`: icon shown on the map at capital
- `shop`: a single ItemExchange shop chest
- `library`: a building containing a collection of books
- `rail_station`: entrance to a rail station
- `vault`: heavily protected chest containing player pearls
- `snitch`
- `waypoint`: generic imported waypoint from a mapping mod
- `map_image`: (icon shown in menu only) image overlay with more recent map data or stylized map

##### Proposed Categories

- `rail_connection`: a line following a rail between two stations, icon is shown at both ends
- `player`: uses the player's head as the icon
- `monument`: point of interest, artistic build
- `ruin`: abandoned unfinished build
- `factory`: a single FactoryMod factory
- `land_region`: island, hill, valley, biome, ...
- `water_region`: river, lake, ocean, coast, ...
- `farm_plant`: crop, melon, cactus, ...
- `farm_animal`
- `farm_mob`: spawner, grinder, portal, ...
- `contraption`
- `water_drop`
- `minecart_lift`
- `mine`

### Presentation Format

TODO: name, category, source, style_base, style_highlight, zoom_styles

#### Style Format

TODO allowed keys, prop mapping, prop value replacement

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
