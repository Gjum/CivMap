import React, {Component} from 'react';
import * as RL from 'react-leaflet';
import L from 'leaflet'
import update from 'immutability-helper';

import Slider from 'material-ui/Slider';
import Subheader from 'material-ui/Subheader';

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

function renderFeatureMenu(props, feature, key) {
  if (feature.geometry == "group")
    return <FeatureMenuGroup group={feature} key={key} {...props} />;
  if (feature.geometry == "image")
    return <FeatureMenuImage image={feature} key={key} {...props} />;
}

function FeatureMenuGroup(props) {
  return <div>
    {props.group.name}:
    <div style={{paddingLeft: '1em'}}>
      {props.group.features.map((f, key) => renderFeatureMenu(props, f, key))}
    </div>
  </div>;
}

function FeatureMenuImage(props) {
  return <div>
    {props.image.name}
  </div>;
}

class FeaturesMenu extends Component {
  render() {
    var pluginState = this.props.pluginState;
    return <div>
      <Subheader>Overlay opacity</Subheader>
      <div className='menu-inset'>
        <Slider
          value={pluginState.globalOpacity}
          onChange={(e, val) => {
            this.props.pluginApi.setSubStates({plugins: {features: {globalOpacity: {$set: val}}}});
          }}
          sliderStyle={{margin: 0}}
        />
      </div>
      <Subheader>Current overlays</Subheader>
      <div
        className='menu-inset'
        style={{marginBottom: 16}}
        >
        { pluginState.featureGroup && renderFeatureMenu(this.props, pluginState.featureGroup) }
      </div>
    </div>;
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
  menu: FeaturesMenu,
  state: {
    jsonUrl: null,
    featureGroup: {},
    editedFeatureId: -1,
    globalOpacity: 1,
  },
};
