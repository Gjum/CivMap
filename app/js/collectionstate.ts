import { importPositionsString } from './utils/importExport'
import murmurhash3 from './utils/murmurhash3_gc'
import { currentVersion } from './utils/convertFromOld';
import { Presentation } from './utils/presentation';
import { AppLoad, RootState } from './store';

export interface Feature {
  id: FeatureId
  [propertyName: string]: any
}

const feature = (state: Feature, action): Feature => {
  switch (action.type) {
    case 'UPDATE_FEATURE_IN_COLLECTION':
      // TODO use longer fallback hash for less collisions, or just don't accept features without id
      const f = {
        ...action.feature,
        id: action.feature.id || murmurhash3(JSON.stringify(action.feature), 1),
      }
      if (f.line && !Array.isArray(f.line)) f.line = importPositionsString(f.line)
      if (f.polygon && !Array.isArray(f.polygon)) f.polygon = importPositionsString(f.polygon)
      return f
    default:
      return state
  }
}

const features = (state = {}, action) => {
  switch (action.type) {
    case 'REMOVE_FEATURE_IN_COLLECTION': {
      const newState = { ...state }
      delete newState[action.featureId]
      return newState
    }
    case 'UPDATE_FEATURE_IN_COLLECTION': {
      const newFeature = feature(state[action.featureId], action)
      return { ...state, [newFeature.id]: newFeature }
    }
    default:
      return state
  }
}

export type FeatureId = string
export type CollectionId = string
export type PresentationId = string
export interface Collection {
  enabled_presentation: PresentationId
  features: {[id: string]: Feature}
  id: string
  info: any
  name: string
  persistent: boolean
  presentations: {[name: string]: Presentation}
  source: string
}
export interface CollectionJson {
  enabled_presentation: PresentationId
  features: [Feature]
  id: string
  info: any
  name: string
  presentations: {[name: string]: Presentation}
}

/** @type {Collection} */
const defaultCollectionState = {
  enabled_presentation: null,
  features: {},
  id: null,
  info: { version: currentVersion },
  name: '(unnamed)',
  persistent: false,
  presentations: {},
  source: null,
}

/**
 * @param {Collection} state
 * @returns Collection
 */
const collection = (state = defaultCollectionState, action) => {
  switch (action.type) {
    case 'CREATE_COLLECTION': {
      const newState = { ...defaultCollectionState, id: action.collectionId }
      const keepKeys = ['enabled_presentation', 'id', 'name', 'persistent', 'presentations', 'source']
      for (const key of keepKeys) {
        if (action.collection[key]) newState[key] = action.collection[key]
      }
      return newState
    }

    case 'UPDATE_COLLECTION': {
      return { ...state, ...action.collection }
    }

    // TODO skip render if collection is deep equal after import
    case 'IMPORT_COLLECTION': {
      /** @type CollectionJson */
      const collection = action.collection
      /** @type Collection */
      const newState = {
        ...state,
        ...collection,
        id: action.collectionId, // precedence
        persistent: action.persistent, // precedence
        features: {}, // override list with object for indexing
        presentations: {}, // override list with object for indexing
      }
      if (state !== defaultCollectionState) {
        newState.enabled_presentation = state.enabled_presentation
      }
      const collectionId = action.collectionId
      if (collection.features) collection.features.forEach(f => {
        const newFeature = feature(null, updateFeatureInCollection(collectionId, f))
        newState.features[newFeature.id] = { ...newFeature, collectionId }
      })
      if (collection.presentations) collection.presentations.forEach(p => {
        const newPresentation = p // XXX presentation(null, updatePresentationInCollection(collectionId, p))
        newState.presentations[newPresentation.name] = { ...newPresentation, collectionId }
      })
      return newState
    }

    case 'REMOVE_FEATURE_IN_COLLECTION':
    case 'UPDATE_FEATURE_IN_COLLECTION': {
      const anyCollectionId = action.collectionId || action.feature.collectionId
      if (state.id !== anyCollectionId) return state
      return { ...state, features: features(state.features, action) }
    }

    case 'ENABLE_PRESENTATION': {
      let presentationId = action.presentationId
      if (state.enabled_presentation === presentationId) return state // already enabled
      return { ...state, enabled_presentation: presentationId }
    }

    case 'DISABLE_PRESENTATION': {
      return { ...state, enabled_presentation: null }
    }

    default:
      return state
  }
}

export interface Collections {
  [id: string]: Collection
}

const defaultCollectionsState: Collections = {
  'civmap:collection/user': {
    id: "civmap:collection/user",
    name: "My Markings",
    info: { version: currentVersion },
    features: {},
    presentations: {},
    enabled_presentation: "true",
    persistent: false,
    source: null
  },
}

export const collections = (state: Collections = defaultCollectionsState, action: Action): Collections => {
  switch (action.type) {
    case 'APP_LOAD': {
      if (!action.state.collections) return state
      // make sure all collections have info.version
      Object.values(action.state.collections).forEach(collection => {
        if (!collection.info || !collection.info.version) {
          collection.info = { ...collection.info, version: currentVersion }
        }
      })
      return { ...state, ...action.state.collections }
    }

    case 'CREATE_COLLECTION':
    case 'IMPORT_COLLECTION': {
      if (!action.collectionId) {
        console.error('Not creating/importing collection without id:', action)
        return state // require collection id
      }
      const newCollection = collection(state[action.collectionId], action)
      return { ...state, [newCollection.id]: newCollection }
    }

    case 'ENABLE_PRESENTATION':
    case 'DISABLE_PRESENTATION':
    case 'UPDATE_COLLECTION':
    case 'REMOVE_FEATURE_IN_COLLECTION':
    case 'UPDATE_FEATURE_IN_COLLECTION': {
      if (!state[action.collectionId]) {
        console.error('Not updating unknown collection:', action)
        return state // only update existing collections
      }
      const newCollection = collection(state[action.collectionId], action)
      return { ...state, [newCollection.id]: newCollection }
    }

    case 'REMOVE_COLLECTION': {
      const newState = { ...state }
      delete newState[action.collectionId]
      return newState
    }

    default:
      return state
  }
}

export type Action =
  AppLoad |
  CreateCollection |
  ImportCollection |
  RemoveFeatureInCollection |
  RemoveCollection |
  UpdateCollection |
  UpdateFeatureInCollection |
  DisablePresentationInCollection |
  EnablePresentationInCollection

export interface CreateCollection {
  type: "CREATE_COLLECTION"
  collectionId: CollectionId
  collection: Collection
}

export const createCollection = (collectionId: CollectionId | null, collection: Collection): CreateCollection => ({
  type: 'CREATE_COLLECTION',
  collection,
  collectionId: collectionId || collection.id,
})

export interface ImportCollection {
  type: "IMPORT_COLLECTION"
  collectionId: CollectionId
  collection: Collection
  persistent: boolean
}

export const importCollection = (collection: Collection, persistent = false): ImportCollection => ({
  type: 'IMPORT_COLLECTION',
  collection,
  collectionId: collection.id,
  persistent,
})

export interface RemoveFeatureInCollection {
  type: "REMOVE_FEATURE_IN_COLLECTION"
  collectionId: CollectionId
  featureId: FeatureId
}

export const removeFeatureInCollection = (collectionId: CollectionId, featureId: FeatureId) => ({
  type: 'REMOVE_FEATURE_IN_COLLECTION',
  collectionId,
  featureId
})

export interface RemoveCollection {
  type: "REMOVE_COLLECTION"
  collectionId: CollectionId
}

export const removeCollection = (collectionId: CollectionId): RemoveCollection => ({ type: 'REMOVE_COLLECTION', collectionId })

export interface UpdateCollection {
  type: "UPDATE_COLLECTION"
  collection: Collection
  collectionId: CollectionId
}

export const updateCollection = (collection: Collection): UpdateCollection => ({ type: 'UPDATE_COLLECTION', collection, collectionId: collection.id })

export interface UpdateFeatureInCollection {
  type: "UPDATE_FEATURE_IN_COLLECTION"
  collectionId: CollectionId
  feature: Feature
  featureId: FeatureId
}

export const updateFeatureInCollection = (collectionId: CollectionId, feature: Feature, featureId: FeatureId | null = null): UpdateFeatureInCollection => ({
  type: 'UPDATE_FEATURE_IN_COLLECTION',
  collectionId,
  feature,
  featureId: featureId || feature.id,
})

export interface DisablePresentationInCollection {
  type: "DISABLE_PRESENTATION"
  collectionId: CollectionId
  presentationId: PresentationId | null
}

export const disablePresentationInCollection = (collectionId: CollectionId, presentationId: PresentationId|null = null): DisablePresentationInCollection => ({ type: 'DISABLE_PRESENTATION', collectionId, presentationId })

export interface EnablePresentationInCollection {
  type: "ENABLE_PRESENTATION"
  collectionId: CollectionId
  presentationId: PresentationId
}

export const enablePresentationInCollection = (collectionId, presentationId) => ({ type: 'ENABLE_PRESENTATION', collectionId, presentationId })
