import { trackWindowSize } from '../actions';
import store from '../store';

export function shouldDrawerDock({ windowHeight, windowWidth }) {
  return windowWidth >= 600 && windowWidth > windowHeight;
}

export function listenToWindowResize() {
  window.onresize = e => {
    store.dispatch(trackWindowSize({
      height: e.target.innerHeight,
      width: e.target.innerWidth,
    }));
  }
  window.onresize({ target: window });
}
