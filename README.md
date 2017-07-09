# CivMap

Generic web map for [Civ-style](https://www.reddit.com/r/Civcraft/) Minecraft servers

Used for [CivClassic](https://ccmap.github.io/), [DevotedMC 3.0](https://dev3map.github.io/), [CivEx 3.0](https://civexmap.github.io/)

The map tiles are created with [a different project](https://github.com/Gjum/voxelmap-cache).

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

## Creating a new release

Update the version info in `package.json`, create a new tag, and push it to the repo.

Clone the `gh-pages` branch to `dist/`:
```sh
git clone -b gh-pages --single-branch git@github.com:YOUR-GITHUB-ACCOUNT/CivMap.git dist/
```

Generate `bundle.js`:
```sh
npm run build
```

In `dist/`, create a versioned copy of the bundle,
and push everything to `gh-pages`:
```sh
cd dist/
version=$(grep -oP '(?<="version": ")[^"]+' ../package.json)
[ $version ] && cp js/bundle.js js/bundle-v$version.js
git commit -a -m "Release v$version"
```

The bundle is live at https://gjum.github.io/CivMap/js/bundle.js to allow caching.
