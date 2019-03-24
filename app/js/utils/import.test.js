import { createStore } from 'redux'

import { currentVersion } from './convertFromOld';
import { autoImportCollectionsOnStartup, loadAppStateFromUrlData } from './importExport'
import { processCollectionFile } from './importFile'
import murmurhash3 from './murmurhash3_gc'
import { appLoad, combinedReducers } from '../store'

jest.mock('./net')

// @ts-ignore
import { __setMockGetJson } from './net'

describe("loadAppStateFromUrlData", () => {
  it("imports url feature data to url_import collection", () => {
    const store = createStore(combinedReducers)
    const feature = { x: -123, z: 123 }

    loadAppStateFromUrlData({ feature: { ...feature } }, store)

    const generatedFeatureId = murmurhash3(JSON.stringify(feature), 1)
    const id = 'civmap:url_import'

    expect(store.getState().collections).toHaveProperty([id])
    const collection = store.getState().collections[id]
    expect(Object.values(collection.features)[0]).toEqual({ ...feature, id: generatedFeatureId, collectionId: id })
  })

  it("imports collection from url", () => {
    const store = createStore(combinedReducers)
    const feature = { id: 'test_feature_id', x: -123, z: 123 }
    const collectionUrl = 'test://url.please/ignore'

    __setMockGetJson({
      info: { version: currentVersion },
      features: [{ ...feature }],
    })
    loadAppStateFromUrlData({ collectionUrl }, store)
    __setMockGetJson({})

    const cid = collectionUrl
    expect(store.getState().collections).toHaveProperty([cid])
    const collection = store.getState().collections[cid]
    expect(collection.features).toHaveProperty([feature.id])
    expect(collection.features[feature.id]).toEqual({ ...feature, collectionId: cid })
  })
})

describe("processCollectionFile", () => {
  it("imports collection from file", () => {
    const store = createStore(combinedReducers)
    const feature = { id: 'feature_id', x: -123, z: 123 }
    const collectionJson = JSON.stringify({
      info: { version: currentVersion },
      features: [{ ...feature }],
    })
    const fileName = 'test.civmap.json'
    const collectionFile = new File([collectionJson], fileName)

    return processCollectionFile(collectionFile, store.dispatch).then(() => {
      const cid = `civmap:collection/file/${fileName}`
      expect(store.getState().collections).toHaveProperty([cid])
      const collection = store.getState().collections[cid]
      expect(collection.features).toHaveProperty([feature.id])
      expect(collection.features[feature.id]).toEqual({ ...feature, collectionId: cid })
    })
  })
})

describe("autoImportCollectionsOnStartup", () => {

  it("loads present collections from their source url", () => {
    const urls = ['http://example.com/settlements.civmap.json', 'http://example.com/mta_plots.civmap.json']

    const store = createStore(combinedReducers)
    store.dispatch(appLoad({
      collections: {
        [urls[0]]: { source: urls[0] },
        [urls[1]]: { source: urls[1] },
      }
    }))

    const feature = { id: 'test_feature_id', x: -123, z: 123 }
    __setMockGetJson({
      info: { version: currentVersion },
      features: [{ ...feature }],
    })
    autoImportCollectionsOnStartup(store)
    __setMockGetJson({})

    const collections = store.getState().collections
    for (let url of urls) { expect(collections).toHaveProperty([url]) }
    const collection = collections[urls[0]]
    // should have loaded the new feature
    expect(collection.features).toHaveProperty([feature.id])
  })
})
