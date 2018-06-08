# CivMap

Interactive, editable personal web map for [Civ-style](https://www.reddit.com/r/CivClassics/) Minecraft servers

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
