import { Circle, Rectangle } from "./utils/math"
import { AppLoad } from "./store"

export type BasemapId = string

export interface MapView {
  basemapId: BasemapId | null
  viewport: Circle | null
  zoom: number
}

export const defaultMapView: MapView = {
  basemapId: null,
  // describes the enclosed "circle"
  // XXX use rectangle always, find more descriptive name
  viewport: null,
  zoom: -6,
}

// should be session-local, but we persist it anyway for user convenience
export const mapView = (state: MapView = defaultMapView, action: Action) => {
  switch (action.type) {
    case 'APP_LOAD': {
      if (!action.state.mapView) return state
      const {
        basemapId = state.basemapId,
        viewport = state.viewport,
      } = action.state.mapView
      return { basemapId, viewport }
    }
    case 'SET_ACTIVE_BASEMAP': {
      return { ...state, basemapId: action.basemapId }
    }
    case 'SET_VIEWPORT': {
      let viewport = action.viewport
      if (viewport && !("radius" in viewport)) {
        // convert from bounds to inner circle
        const [[e, n], [w, s]] = viewport
        viewport = {
          x: (e + w) / 2,
          z: (s + n) / 2,
          radius: Math.min(Math.abs(w - e), Math.abs(s - n)), // XXX both max and min are wrong, we should always store rect in viewport
        }
      }
      if (!viewport)
        viewport = state.viewport
      const zoom = action.zoom || state.zoom
      if (zoom === state.zoom && equalViewports(viewport, state.viewport)) {
        return state
      }
      return { ...state, viewport, zoom }
    }
    default:
      return state
  }
}

export type Action =
  AppLoad |
  { type: "SET_ACTIVE_BASEMAP"; basemapId: BasemapId } |
  { type: "SET_VIEWPORT"; viewport: Circle | Rectangle | null; zoom: number }

export const equalViewports = (a, b) => a === b || (a && b && (
  a.radius === b.radius && a.x === b.x && a.z === b.z
))

export const setActiveBasemap = (basemapId: BasemapId): Action => ({ type: 'SET_ACTIVE_BASEMAP', basemapId })

// TODO clean up legacy code passing wrong args
export const setViewport = (arg: { viewport: Circle | Rectangle | null; zoom: number } | Circle | Rectangle | null): Action => {
  if ("viewport" in arg) {
    let { viewport, zoom } = arg
    return { type: 'SET_VIEWPORT', viewport, zoom }
  } else {
    return { type: "SET_VIEWPORT", viewport: arg, zoom: -6 }
  }
}