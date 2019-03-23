import { createStore } from 'redux'

import { combinedReducers, createFeature, updateFeatureInCollection } from './store'

describe("createFeature", () => {
  it("creates new feature in user collection", () => {
    const store = createStore(combinedReducers)
    const feature = createFeature({ x: null, z: null })

    store.dispatch(updateFeatureInCollection(feature.collectionId, feature))

    const collectionId = 'civmap:collection/user'
    expect(store.getState().collections).toHaveProperty([collectionId])
    const collection = store.getState().collections[collectionId]
    expect(Object.values(collection.features)[0]).toEqual({ ...feature, collectionId })
  })
})
