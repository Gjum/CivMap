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

For deployment, generate `docs/bundle.js`:
```sh
npm run build
```
Now you can make your webserver serve the `docs` directory.

> **Q:** Why is it called `docs` and not `static`?
>
> **A:** This allows you to easily [host](https://github.com/blog/2228-simpler-github-pages-publishing)
> this subdirectory as a web page on GitHub.
