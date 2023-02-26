import { start } from "./app"

var config = {
    defaultCollectionUrls: [
    ],
    initialState: {
        mapConfig: {
            borderApothem: 16000,
            tilesRoot: 'https://raw.githubusercontent.com/CivReignCommunity/Tiles/main/',
            basemaps: {
                terrain: { name: 'Terrain', id: 'terrain', bgColor: '#000', isDefault: true },
            },
        }
    }
}

window.civMapApi = start(config)
