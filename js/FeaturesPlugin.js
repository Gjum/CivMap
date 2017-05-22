import React, {Component} from 'react';
import * as RL from 'react-leaflet';
import L from 'leaflet'
import update from 'immutability-helper';

import * as Util from './Util';
import ImageOverlay from './ImageOverlay';

function renderFeatureOverlay(props, feature, key) {
  if (feature.geometry == "group")
    return <FeatureOverlayGroup group={feature} key={key} {...props} />;
  if (feature.geometry == "image")
    return <FeatureOverlayImage image={feature} key={key} {...props} />;
}

function FeatureOverlayGroup(props) {
  return <RL.LayerGroup>
    { props.group.features.map((f, key) => renderFeatureOverlay(props, f, key)) }
  </RL.LayerGroup>;
}

function FeatureOverlayImage(props) {
  return <ImageOverlay
    url={props.image.url}
    bounds={props.image.bounds}
    opacity={props.pluginState.globalOpacity}
  />;
}

class FeaturesOverlay extends Component {
  render() {
    var featureGroup = this.props.pluginState.featureGroup;
    if (!featureGroup)
      return null;
    return renderFeatureOverlay(this.props, featureGroup);
  }
}

function init(pluginApi, pluginState) {
  if (!pluginState.jsonUrl) {
    console.error("[FeaturesPlugin] No jsonUrl specified");
    return;
  }
  Util.getJSON(pluginState.jsonUrl, featureGroup => {
    pluginApi.setSubStates({plugins: {features: {featureGroup: {$set: featureGroup}}}});
  });
}

export var FeaturesPluginInfo = {
  name: "features",
  init: init,
  overlay: FeaturesOverlay,
  state: {
    jsonUrl: null,
    featureGroup: {},
    editedFeatureId: -1,
    globalOpacity: 1,
  },
};
