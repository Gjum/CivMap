import { trackWindowSize } from '../actions';
import store from '../store';

let lastLocalStorageError = {};

export function setupLocalStorageSync() {
  store.subscribe(() => {
    const { mapView, overlay } = store.getState()
    // TODO how to ignore other changes?
    try {
      window.localStorage.setItem('civMap.state', JSON.stringify({ mapView }));
      window.localStorage.setItem('civMap.overlay', JSON.stringify(overlay));
    } catch (e) {
      if (lastLocalStorageError.code != e.code) {
        lastLocalStorageError = e;
        console.error('Failed storing app state in LocalStorage:', e);
      }
    }
  })
}
