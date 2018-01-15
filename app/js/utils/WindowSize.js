import store, { trackWindowSize } from '../store';

export function listenToWindowResize() {
  window.onresize = e => {
    store.dispatch(trackWindowSize({
      height: e.target.innerHeight,
      width: e.target.innerWidth,
    }));
  }
  window.onresize({ target: window });
}
