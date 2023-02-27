import { CollectionId, FeatureId } from "./collectionstate"
import { AppLoad } from "./store"

export enum MainTabs {
  Layers = 0,
  Markings = 1,
  Search = 2,
}

export enum ViewingKey {
  MainTabs = 0,
  FeatureInfo = 1,
  FeatureEdit = 2,
  CollectionEdit = 3,
}

export type Viewing = {
  type: ViewingKey.MainTabs
} | {
  type: ViewingKey.FeatureInfo
  featureID: FeatureId
  featureCollection: CollectionId
} | {
  type: ViewingKey.FeatureEdit
  featureID: FeatureId
  featureCollection: CollectionId
} | {
  type: ViewingKey.CollectionEdit
  collectionID: CollectionId
}

export interface ControlState {
  tab: MainTabs
  viewing: Viewing
  drawerOpen: boolean
  searchQuery: string | null
}

export const defaultControlState: ControlState = {
  tab: MainTabs.Markings,
  viewing: { type: ViewingKey.MainTabs },
  drawerOpen: false,
  searchQuery: null,
}

export const control = (state: ControlState = defaultControlState, action: Action): ControlState => {
  switch (action.type) {
    case 'APP_LOAD': {
      if (!action.state.control) return state
      const {
        tab = state.tab,
        viewing = state.viewing,
        drawerOpen = state.drawerOpen,
        searchQuery = state.searchQuery,
      } = action.state.control
      return { ...state, tab, viewing, drawerOpen, searchQuery }
    }

    case 'CHANGE_MAIN_TAB': {
      return { ...state, tab: action.to }
    }

    case 'CHANGE_VIEWING': {
      return { ...state, viewing: action.to }
    }

    case 'OPEN_SEARCH': {
      return { ...state, viewing: { type: ViewingKey.MainTabs }, tab: MainTabs.Search, searchQuery: action.query }
    }


    // case 'SET_DRAWER_OPEN':
    //   return { ...state, drawerOpen: true }
    // case 'SET_DRAWER_CLOSED':
    //   return { ...state, drawerOpen: false }

    // case 'HIGHLIGHT_FEATURE':
    //   return { ...state, drawerOpen: false, activeFeatureId: action.featureId, activeFeatureCollection: action.collectionId }

    // case 'OPEN_BROWSE_MODE':
    //   return { ...state, drawerOpen: false, appMode: 'BROWSE' }
    // case 'OPEN_EDIT_MODE':
    //   return { ...state, drawerOpen: false, appMode: 'EDIT', activeFeatureId: action.featureId, activeFeatureCollection: action.collectionId }
    // case 'OPEN_COLLECTION':
    //   return { ...state, drawerOpen: false, appMode: 'COLLECTION', activeCollectionId: action.collectionId }
    // case 'OPEN_FEATURE_DETAIL':
    //   return { ...state, drawerOpen: false, appMode: 'FEATURE', activeFeatureId: action.featureId, activeFeatureCollection: action.collectionId }
    // case 'OPEN_LAYERS':
    //   return { ...state, drawerOpen: false, appMode: 'LAYERS' }
    // case 'OPEN_SEARCH':
    //   const searchQuery = typeof action.query === 'string' ? action.query : state.searchQuery
    //   return { ...state, drawerOpen: false, appMode: 'SEARCH', activeFeatureId: null, searchQuery }

    default:
      return state
  }
}

export type Action =
  AppLoad |
  // { type: "HIGHLIGHT_FEATURE"; featureId: FeatureId; collectionId: CollectionId } |
  { type: "CHANGE_MAIN_TAB"; to: MainTabs } |
  { type: "CHANGE_VIEWING"; to: Viewing } |
  { type: "OPEN_SEARCH"; query: string }
  // { type: "OPEN_EDIT_MODE"; featureId: FeatureId; collectionId: CollectionId } |
  // { type: "OPEN_FEATURE_DETAIL"; featureId: FeatureId; collectionId: CollectionId } |
  // { type: "OPEN_LAYERS" } |
  // { type: "OPEN_COLLECTION"; collectionId: CollectionId } |
  // { type: "OPEN_SEARCH"; query: string | null } |
  // { type: "SET_DRAWER_CLOSED" } |
  // { type: "SET_DRAWER_OPEN" }

// export const highlightFeature = (featureId: FeatureId, collectionId: CollectionId): Action => ({ type: 'HIGHLIGHT_FEATURE', featureId, collectionId })

export const openSearch = (query: string): Action => ({type: "OPEN_SEARCH", query})

export const changeMainTab = (to: MainTabs): Action => ({type: "CHANGE_MAIN_TAB", to})

const changeViewing = (to: Viewing): Action => ({type: "CHANGE_VIEWING", to})

export const openTabs = () => changeViewing({type: ViewingKey.MainTabs})

export const openFeature = (featureID: FeatureId, collectionID: CollectionId): Action => changeViewing({
  type: ViewingKey.FeatureInfo,
  featureID,
  featureCollection: collectionID,
})

export const editFeature = (featureID: FeatureId, collectionID: CollectionId): Action => changeViewing({
  type: ViewingKey.FeatureEdit,
  featureID,
  featureCollection: collectionID,
})

export const editCollection = (collectionID: CollectionId): Action => changeViewing({
  type: ViewingKey.CollectionEdit,
  collectionID,
})

// export const openBrowseMode = (): Action => ({ type: 'OPEN_BROWSE_MODE' })

// export const openEditMode = (featureId: FeatureId, collectionId: CollectionId): Action => ({ type: 'OPEN_EDIT_MODE', featureId, collectionId })

// export const openFeatureDetail = (featureId: FeatureId, collectionId: CollectionId): Action => ({ type: 'OPEN_FEATURE_DETAIL', featureId, collectionId })

// export const openLayers = (): Action => ({ type: 'OPEN_LAYERS' })

// export const openCollectionEdit = (collectionId: CollectionId): Action => ({ type: 'OPEN_COLLECTION', collectionId })

// export const openSearch = (query: string | null = null): Action => ({ type: 'OPEN_SEARCH', query })


// export const setDrawerClosed = (): Action => ({ type: 'SET_DRAWER_CLOSED' })

// export const setDrawerOpen = (): Action => ({ type: 'SET_DRAWER_OPEN' })