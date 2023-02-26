import { start } from "./app"

var config = {
    defaultCollectionUrls: [
    ],
    initialState: {
        mapConfig: {
            borderApothem: 16000,
            tilesRoot: 'http://localhost:8080/',
            basemaps: {
                terrain: { name: 'Terrain', id: 'terrain', bgColor: '#000', isDefault: true },
            },
        }
    }
}

window.civMapApi = start(config)
