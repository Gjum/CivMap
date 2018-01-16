import { trackWindowSize } from '../store'

export function listenToWindowResize(store) {
  window.onresize = e => {
    store.dispatch(trackWindowSize({
      height: e.target.innerHeight,
      width: e.target.innerWidth,
    }))
  }
  window.onresize({ target: window })
}
