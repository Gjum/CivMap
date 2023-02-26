import Uuid from 'uuid'
import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import { inspect } from 'util'

import { currentVersion } from './utils/convertFromOld';
import { control, ControlState } from './controlstate'
import { Collections, collections } from './collectionstate';
import { MapConfig, mapConfig } from './mapconfigstate';
import { MapView, mapView } from './mapviewstate';

export { createCollection, importCollection, removeFeatureInCollection, removeCollection, updateCollection, updateFeatureInCollection, disablePresentationInCollection, enablePresentationInCollection } from "./collectionstate"
export { highlightFeature, openBrowseMode, openEditMode, openFeatureDetail, openLayers, openCollectionEdit, openSearch, setDrawerClosed, setDrawerOpen } from "./controlstate"
export { setActiveBasemap, setViewport, equalViewports } from "./mapviewstate"

export const combinedReducers = combineReducers({
  collections: collections,
  control: control,
  mapConfig: mapConfig,
  mapView: mapView,
})

export interface RootState {
  collections: Collections
  control: ControlState
  mapConfig: MapConfig
  mapView: MapView
}

export const store = configureStore({
  reducer: combinedReducers
})

export interface AppLoad {
  type: "APP_LOAD"
  state: RootState
}

export const appLoad = (state: RootState): AppLoad => ({ type: 'APP_LOAD', state })

export function lookupFeature(state: RootState, featureId, collectionId) {
  const collection = state.collections[collectionId]
  if (collection) {
    const feature = collection.features[featureId]
    if (feature) return feature
  }
  for (const collection of Object.values(state.collections)) {
    const feature = collection.features[featureId]
    if (feature) return feature
  }
}

// XXX should be action, not just constructor
export const createFeature = (feature) => ({
  id: Uuid.v4(),
  collectionId: 'civmap:collection/user',
  ...feature,
})
