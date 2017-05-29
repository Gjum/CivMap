import React, {Component} from 'react';
import * as RL from 'react-leaflet';
import L from 'leaflet'
import update from 'immutability-helper';

import Slider from 'material-ui/Slider';
import Subheader from 'material-ui/Subheader';

import * as Util from './Util';
import ImageOverlay from './ImageOverlay';

function renderFeatureOverlay(commonProps, feature, key) {
  if (feature.features)
    return <FeatureOverlayGroup group={feature} key={key} commonProps={commonProps} />;

  if (feature.geometry.type == "image")
    return <FeatureOverlayImage image={feature} key={key} commonProps={commonProps} />;
  if (feature.geometry.type == "line")
    return <FeatureOverlayLine line={feature} key={key} commonProps={commonProps} />;
  if (feature.geometry.type == "polygon")
    return <FeatureOverlayPolygon polygon={feature} key={key} commonProps={commonProps} />;
  if (feature.geometry.type == "circle")
    return <FeatureOverlayCircle circle={feature} key={key} commonProps={commonProps} />;

  console.error("[FeaturesOverlay] Unknown feature geometry type", feature);
}

function FeatureOverlayGroup(props) {
  let {group: {features}, commonProps} = props;
  return <RL.LayerGroup>
    { features.map((f, key) => renderFeatureOverlay(commonProps, f, key)) }
  </RL.LayerGroup>;
}

function FeatureOverlayImage(props) {
  let {image: {geometry, style}, commonProps: {pluginState: {globalOpacity}}} = props;
  return <ImageOverlay
    opacity={globalOpacity}
    {...geometry}
    {...style}
  />;
}

function FeatureOverlayLine(props) {
  let {line: {geometry, style}, commonProps: {pluginState: {globalOpacity}}} = props;
  return <RL.Polyline
    opacity={globalOpacity}
    {...geometry}
    {...style}
  />;
}

function FeatureOverlayPolygon(props) {
  let {polygon: {geometry, style}, commonProps: {pluginState: {globalOpacity}}} = props;
  return <RL.Polygon
    opacity={globalOpacity}
    fillOpacity={geometry.filled ? globalOpacity : 0}
    {...geometry}
    {...style}
  />;
}

function FeatureOverlayCircle(props) {
  let {circle: {geometry, style}, commonProps: {pluginState: {globalOpacity}}} = props;
  return <RL.Circle
    opacity={globalOpacity}
    fillOpacity={geometry.filled ? globalOpacity : 0}
    {...geometry}
    {...style}
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
  if (feature.features)
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
