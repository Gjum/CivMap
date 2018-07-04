import { createStore } from 'redux'

import { loadAppStateFromUrlData } from './importExport'
import { combinedReducers } from '../store'

jest.mock('./net')

// @ts-ignore
import { __setMockGetJson } from './net'

describe("loadAppStateFromUrlData", () => {
  it("imports url feature data to url_import collection", () => {
    const store = createStore(combinedReducers)
    const feature = { x: -123, z: 123 }

    loadAppStateFromUrlData({ feature: { ...feature } }, store)

    const generatedFeatureId = 1803919729 // deterministic because of using the same seed during test
    const source = 'civmap:url_import'
    expect(store.getState().collections).toHaveProperty([source])
    const collection = store.getState().collections[source]
    expect(Object.values(collection.features)[0]).toEqual({ ...feature, id: generatedFeatureId, source: source })
  })

  it("imports collection from url", () => {
    const store = createStore(combinedReducers)
    const feature = { id: 'feature_id', x: -123, z: 123 }
    __setMockGetJson({
      info: { version: '0.3.3' },
      features: [{ ...feature }],
    })
    const collectionUrl = 'test://url.please/ignore'

    loadAppStateFromUrlData({ collectionUrl }, store)

    expect(store.getState().collections).toHaveProperty([collectionUrl])
    const collection = store.getState().collections[collectionUrl]
    expect(collection.features).toHaveProperty([feature.id])
    expect(collection.features[feature.id]).toEqual({ ...feature, source: collectionUrl })
  })
})
