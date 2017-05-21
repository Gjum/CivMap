import * as RL from 'react-leaflet';

export default class ImageOverlay extends RL.ImageOverlay {
  updateLeafletElement(fromProps, toProps) {
    if (toProps.url !== fromProps.url) {
      this.leafletElement.setUrl(toProps.url)
    }
    if (toProps.bounds !== fromProps.bounds) {
      this.leafletElement.setBounds(L.latLngBounds(toProps.bounds))
    }
    if (toProps.opacity !== fromProps.opacity) {
      this.leafletElement.setOpacity(toProps.opacity)
    }
  }
}
