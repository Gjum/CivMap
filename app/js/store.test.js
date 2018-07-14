import { createStore } from 'redux'

import { combinedReducers, createFeature, updateFeatureInCollection } from './store'

describe("createFeature", () => {
  it("creates new feature in user collection", () => {
    const store = createStore(combinedReducers)
    const feature = createFeature({ x: null, z: null })

    store.dispatch(updateFeatureInCollection(feature.source, feature))

    const source = 'civmap:collection/user'
    expect(store.getState().collections).toHaveProperty([source])
    const collection = store.getState().collections[source]
    expect(Object.values(collection.features)[0]).toEqual({ ...feature, source: source })
  })
})
