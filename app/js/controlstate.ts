import { CollectionId, FeatureId } from "./collectionstate"
import { AppLoad } from "./store"

export interface ControlState {
  appMode: string
  activeCollectionId: CollectionId | null
  activeFeatureId: FeatureId | null
  activeFeatureCollection: CollectionId | null
  drawerOpen: boolean
  searchQuery: string | null
}

export const defaultControlState: ControlState = {
  appMode: 'LAYERS',
  activeCollectionId: null,
  activeFeatureId: null,
  activeFeatureCollection: null,
  drawerOpen: false,
  searchQuery: null,
}

export const control = (state: ControlState = defaultControlState, action: Action): ControlState => {
  switch (action.type) {
    case 'APP_LOAD': {
      if (!action.state.control) return state
      const {
        appMode = state.appMode,
        activeFeatureId = state.activeFeatureId,
        activeFeatureCollection = state.activeFeatureCollection,
        drawerOpen = state.drawerOpen,
        searchQuery = state.searchQuery,
      } = action.state.control
      return { ...state, appMode, activeFeatureId, activeFeatureCollection, drawerOpen, searchQuery }
    }

    case 'SET_DRAWER_OPEN':
      return { ...state, drawerOpen: true }
    case 'SET_DRAWER_CLOSED':
      return { ...state, drawerOpen: false }

    case 'HIGHLIGHT_FEATURE':
      return { ...state, drawerOpen: false, activeFeatureId: action.featureId, activeFeatureCollection: action.collectionId }

    case 'OPEN_BROWSE_MODE':
      return { ...state, drawerOpen: false, appMode: 'BROWSE' }
    case 'OPEN_EDIT_MODE':
      return { ...state, drawerOpen: false, appMode: 'EDIT', activeFeatureId: action.featureId, activeFeatureCollection: action.collectionId }
    case 'OPEN_COLLECTION':
      return { ...state, drawerOpen: false, appMode: 'COLLECTION', activeCollectionId: action.collectionId }
    case 'OPEN_FEATURE_DETAIL':
      return { ...state, drawerOpen: false, appMode: 'FEATURE', activeFeatureId: action.featureId, activeFeatureCollection: action.collectionId }
    case 'OPEN_LAYERS':
      return { ...state, drawerOpen: false, appMode: 'LAYERS' }
    case 'OPEN_SEARCH':
      const searchQuery = typeof action.query === 'string' ? action.query : state.searchQuery
      return { ...state, drawerOpen: false, appMode: 'SEARCH', activeFeatureId: null, searchQuery }

    default:
      return state
  }
}

export type Action =
  AppLoad |
  { type: "HIGHLIGHT_FEATURE"; featureId: FeatureId; collectionId: CollectionId } |
  { type: "OPEN_BROWSE_MODE" } |
  { type: "OPEN_EDIT_MODE"; featureId: FeatureId; collectionId: CollectionId } |
  { type: "OPEN_FEATURE_DETAIL"; featureId: FeatureId; collectionId: CollectionId } |
  { type: "OPEN_LAYERS" } |
  { type: "OPEN_COLLECTION"; collectionId: CollectionId } |
  { type: "OPEN_SEARCH"; query: string | null } |
  { type: "SET_DRAWER_CLOSED" } |
  { type: "SET_DRAWER_OPEN" }

export const highlightFeature = (featureId: FeatureId, collectionId: CollectionId): Action => ({ type: 'HIGHLIGHT_FEATURE', featureId, collectionId })

export const openBrowseMode = (): Action => ({ type: 'OPEN_BROWSE_MODE' })

export const openEditMode = (featureId: FeatureId, collectionId: CollectionId): Action => ({ type: 'OPEN_EDIT_MODE', featureId, collectionId })

export const openFeatureDetail = (featureId: FeatureId, collectionId: CollectionId): Action => ({ type: 'OPEN_FEATURE_DETAIL', featureId, collectionId })

export const openLayers = (): Action => ({ type: 'OPEN_LAYERS' })

export const openCollectionEdit = (collectionId: CollectionId): Action => ({ type: 'OPEN_COLLECTION', collectionId })

export const openSearch = (query: string | null = null): Action => ({ type: 'OPEN_SEARCH', query })


export const setDrawerClosed = (): Action => ({ type: 'SET_DRAWER_CLOSED' })

export const setDrawerOpen = (): Action => ({ type: 'SET_DRAWER_OPEN' })