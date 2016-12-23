# CivMap

Generic web map for [Civ-style](https://www.reddit.com/r/Civcraft/) Minecraft servers

Used for [DevotedMC 3.0](https://dev3map.github.io/)

## Installation

After cloning the repository, install the dependencies:
```sh
npm install
```

Now you can run your local web server:
```sh
npm start
```
Open the map on [localhost:3000](http://localhost:3000)

### Creating a new release
Update the version info in `package.json`,
create a new tag, and push both to the repo.

Then generate `bundle.js`:
```sh
npm run build
```
and upload it as a "binary" to a [new release](https://github.com/Gjum/CivMap/releases/new).
