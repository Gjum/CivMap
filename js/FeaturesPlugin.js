import React, {Component} from 'react';
import * as RL from 'react-leaflet';
import L from 'leaflet'
import update from 'immutability-helper';

import * as Util from './Util';

function renderFeature(props, feature, key) {
  if (feature.geometry == "group")
    return <FeatureGroup group={feature} key={key} {...props} />;
  if (feature.geometry == "image")
    return <FeatureImage image={feature} key={key} {...props} />;
}

function FeatureGroup(props) {
  return <RL.LayerGroup>
    { props.group.features.map((f, key) => renderFeature(props, f, key)) }
  </RL.LayerGroup>;
}

function FeatureImage(props) {
  return <RL.ImageOverlay
    url={props.image.url}
    bounds={props.image.bounds}
    opacity={props.pluginState.globalOpacity}
  />;
}

class FeaturesOverlay extends Component {
  render() {
    var state = this.props.pluginState;
    if (!state.featureGroup)
      return null;
    return renderFeature(this.props, state.featureGroup);
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
