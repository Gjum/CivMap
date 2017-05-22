import React, {Component} from 'react';
import * as RL from 'react-leaflet';
import L from 'leaflet'
import update from 'immutability-helper';

import Slider from 'material-ui/Slider';
import Subheader from 'material-ui/Subheader';

import * as Util from './Util';
import ImageOverlay from './ImageOverlay';

function renderFeatureOverlay(commonProps, feature, key) {
  if (feature.type == "group")
    return <FeatureOverlayGroup group={feature} key={key} commonProps={commonProps} />;
  if (feature.geometry.type == "image")
    return <FeatureOverlayImage image={feature} key={key} commonProps={commonProps} />;
  console.error("[FeaturesOverlay] Unknown feature geometry type", feature);
}

function FeatureOverlayGroup(props) {
  let {group, commonProps} = props;
  return <RL.LayerGroup>
    { group.features.map((f, key) => renderFeatureOverlay(commonProps, f, key)) }
  </RL.LayerGroup>;
}

function FeatureOverlayImage(props) {
  let {image, commonProps} = props;
  return <ImageOverlay
    opacity={commonProps.pluginState.globalOpacity}
    {...image.geometry}
  />;
}

class FeaturesOverlay extends Component {
  render() {
    let {pluginState: {featureGroup}} = this.props;
    if (!featureGroup)
      return null;
    return renderFeatureOverlay(this.props, featureGroup);
  }
}

function renderFeatureMenu(commonProps, feature, key) {
  if (feature.type == "group")
    return <FeatureMenuGroup group={feature} key={key} commonProps={commonProps} />;
  else
    return <FeatureMenuFeature feature={feature} key={key} commonProps={commonProps} />;
}

function FeatureMenuGroup(props) {
  let {group: {properties, features}, commonProps} = props;
  return <div>
    {properties && properties.name || "(unnamed)"}
    <div style={{paddingLeft: '1em'}}>
      {features.map((f, key) => renderFeatureMenu(commonProps, f, key))}
    </div>
  </div>;
}

function FeatureMenuFeature(props) {
  let {feature: {properties, geometry}} = props;
  return <div>
    {properties && properties.name || "(unnamed)"}
    <span style={{float: 'right', color: 'gray'}}>
      {geometry.type}
    </span>
  </div>;
}

class FeaturesMenu extends Component {
  render() {
    let {pluginState: {featureGroup, globalOpacity}} = this.props;
    return <div>
      <Subheader>Overlay opacity</Subheader>
      <div className='menu-inset'>
        <Slider
          value={globalOpacity}
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
        { featureGroup && renderFeatureMenu(this.props, featureGroup) }
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
    featureGroup: {features: []},
    editedFeatureId: -1,
    globalOpacity: 1,
  },
};
