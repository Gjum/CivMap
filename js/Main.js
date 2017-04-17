import * as _ from'lodash';
import * as L from'leaflet';
import * as LE from'leaflet-editable';
import * as RL from'react-leaflet';
import React, {Component} from 'react';
import update from 'immutability-helper';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import IconArrFwd from 'material-ui/svg-icons/navigation/arrow-forward';
import IconClaim from 'material-ui/svg-icons/social/public';
import IconClose from 'material-ui/svg-icons/navigation/close';
import IconHelp from 'material-ui/svg-icons/action/help';
import IconMenu from 'material-ui/svg-icons/navigation/menu';
import IconPlace from 'material-ui/svg-icons/maps/place';
import ImageTune from 'material-ui/svg-icons/image/tune';

import AppBar from 'material-ui/AppBar';
import AutoComplete from 'material-ui/AutoComplete';
import CircularProgress from 'material-ui/CircularProgress';
import Dialog from 'material-ui/Dialog';
import Drawer from 'material-ui/Drawer';
import FlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import Slider from 'material-ui/Slider';
import Subheader from 'material-ui/Subheader';
import TextField from 'material-ui/TextField';

import {ClaimsDrawer, ClaimsPluginInfo} from './Claims';
import CoordsDisplay from './CoordsDisplay';
import CustomToggle from './CustomToggle';
import {PluginApi} from './PluginApi';
import * as Util from './Util';
import {WaypointsPluginInfo} from './Waypoints';

L.Icon.Default.imagePath = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0-rc.3/images/';

var mcCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0)
});

const muiTheme = getMuiTheme();

var defaultState = {
  // ui state
  drawerOpen: true,
  activeDrawer: 'main',

  // map state
  showBorder: false,
  basemap: 'blank',

  plugins: {},
  installedPlugins: [],
};

export var defaultPlugins = [
  ClaimsPluginInfo,
  WaypointsPluginInfo,
];

export class Main extends Component {
  constructor(props) {
    super(props);

    this.state = defaultState;

    if (props.options && props.options.installedPlugins) {
      this.state.installedPlugins = props.options.installedPlugins;
    } else {
      this.state.installedPlugins = defaultPlugins;
    }

    // install default plugin state
    this.state.installedPlugins.map(pluginInfo => {
      this.state.plugins[pluginInfo.name] = pluginInfo.state;
    });

    if (props.options) {
      this.state = _.merge(this.state, props.options);
    }

    this.mapView = Util.hashToView(location.hash);

    this.pluginApi = new PluginApi(this);

    // initialize plugins (download json etc.)
    this.state.installedPlugins.filter(p => p.init).map(pluginInfo => {
      pluginInfo.init(this.pluginApi, this.state.plugins[pluginInfo.name]);
    });
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.map) {
      window.setTimeout(() => {
        this.map && this.map.invalidateSize(true); // animate
      }, 0);
      window.setTimeout(() => {
        this.map && this.map.invalidateSize(true); // animate
      }, 500);
    }
  }

  setSubStates(newState) {
    return this.setState(update(this.state, newState));
  }

  onMapCreated(map) {
    if (!this.map) {
      this.map = map;
      this.pluginApi.map = map;
    }
  }

  getSearchableData() {
    return Array.prototype.concat.apply([],
      this.state.installedPlugins.filter(p => p.getSearchableData).map((pluginInfo) =>
        pluginInfo.getSearchableData(this.pluginApi, this.state.plugins[pluginInfo.name])
      )
    );
  }

  render() {
    var tileBounds = Util.radiusToBounds(this.props.borderCircleRadius || this.props.borderSquareRadius);
    var minZoom = -6;

    return <MuiThemeProvider muiTheme={muiTheme} className='fullHeight'>
        <div className='fullHeight'>

          <Drawer openSecondary
            open={this.state.drawerOpen && this.state.activeDrawer == 'main'}
          >
            <div className='menu-inset'>
              <AutoComplete fullWidth openOnFocus
                hintText="Find a claim, waypoint, ..."
                filter={AutoComplete.fuzzyFilter}
                dataSource={this.getSearchableData()}
              />
            </div>
            <MenuItem
              primaryText='Import your waypoints'
              leftIcon={<IconPlace />}
              onTouchTap={() => this.setSubStates({
                plugins: {waypoints: {wpDlgOpen: {$set: true}}},
              })}
            />
            <MenuItem
              primaryText='Add a claim'
              leftIcon={<IconClaim />}
              onTouchTap={() => {
                var claim = {
                  name: '',
                  color: '#000000',
                  positions: [],
                };
                var claimId = this.state.plugins.claims.claims.length;
                this.setSubStates({
                  plugins: {claims: {
                    claims: {$push: [claim]},
                    editedClaimId: {$set: claimId},
                  }},
                  activeDrawer: {$set: 'claimEdit'},
                });
              }}
            />

            <Subheader>Map controls</Subheader>
            <div className='menu-inset'>

              <CustomToggle
                label="Waypoints"
                toggled={this.state.plugins.waypoints.showWaypoints}
                onToggle={() => this.setSubStates({plugins: {waypoints: {showWaypoints: {$apply: x => !x}}}})}
              />
              <CustomToggle
                label="World border"
                toggled={this.state.showBorder}
                onToggle={() => this.setState({showBorder: !this.state.showBorder})}
              />

              <SelectField
                floatingLabelText="Base map"
                value={this.state.basemap}
                onChange={(e, i, val) => this.setState({basemap: val})}
                >
                { this.props.basemaps.map(mapName =>
                    <MenuItem key={mapName} value={mapName} primaryText={mapName} />
                )}
                <MenuItem value="blank" primaryText="blank" />
              </SelectField>
            </div>

            <Subheader>Claim controls</Subheader>
            <div className='menu-inset'>
              <Slider
                defaultValue={this.state.plugins.claims.claimOpacity}
                value={this.state.plugins.claims.claimOpacity}
                onChange={(e, val) => {
                  this.setSubStates({plugins: {claims: {claimOpacity: {$set: val}}}});
                }}
                sliderStyle={{marginTop: 0, marginBottom: 16}}
              />
              <CustomToggle
                label="Claim names"
                toggled={this.state.plugins.claims.showClaimNames}
                onToggle={() => this.setSubStates({plugins: {claims: {showClaimNames: {$apply: x => !x}}}})}
              />
            </div>

            <Subheader>About</Subheader>
            <MenuItem
              primaryText='Help'
              leftIcon={<IconHelp />}
              href={this.props.helpUrl || 'https://github.com/Gjum/CivMap/wiki/'}
            />

          </Drawer>

          <ClaimsDrawer
            open={this.state.drawerOpen && this.state.activeDrawer == 'claimEdit'}
            pluginApi={this.pluginApi}
            pluginState={this.state.plugins.claims}
            map={this.map}
            claimsPublishHelpUrl={this.state.plugins.claims.publishHelpUrl}
          />

          <div className={'mapContainer ' +
              (this.state.drawerOpen ? 'drawerOpen' : 'drawerClosed')}
          >

            <RL.Map
              className="map"
              ref={ref => {if (ref) this.onMapCreated(ref.leafletElement)}}
              crs={mcCRS}
              center={[this.mapView.z, this.mapView.x]}
              zoom={this.mapView.zoom}
              maxZoom={5}
              minZoom={minZoom}
              onmoveend={e => history.replaceState({}, document.title, '#' + Util.viewToHash(e.target))}
              onmousemove={e => this.coordsDisplay && this.coordsDisplay.setCursor(e.latlng)}
              editable={true}
              >

              { this.state.basemap == "blank" ? null :
              <RL.TileLayer
                attribution={this.props.attribution}
                url={this.props.tilesUrl + this.state.basemap + '/z{z}/{x},{y}.png'}
                errorTileUrl={'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}
                tileSize={256}
                bounds={tileBounds}
                minZoom={minZoom}
                maxNativeZoom={0}
                continuousWorld={true}
                />
              }

              <CoordsDisplay
                // updated directly through ref for performance reasons
                ref={r => {if (r) this.coordsDisplay = r}} />

              { !this.state.showBorder ? null
                : this.props.borderSquareRadius ?
                <RL.Rectangle
                  bounds={Util.radiusToBounds(this.props.borderSquareRadius)}
                  color='#ff8888'
                  fill={false}
                />
                : this.props.borderCircleRadius ?
                <RL.Circle
                  radius={this.props.borderCircleRadius}
                  center={[0, 0]}
                  color='#ff8888'
                  fill={false}
                />
                : null // no border
              }

              {
                this.state.installedPlugins.filter(p => p.overlay).map((pluginInfo, key) =>
                  <pluginInfo.overlay
                    key={key}
                    pluginState={this.state.plugins[pluginInfo.name]}
                    pluginApi={this.pluginApi}
                    />
                )
              }

            </RL.Map>

            <FloatingActionButton mini
              className='mainMenuButton'
              onTouchTap={() => this.setState({drawerOpen: !this.state.drawerOpen})}
            >
              { this.state.drawerOpen
                ? <IconArrFwd />
                : <ImageTune />
              }
            </FloatingActionButton>
          </div>

          {
            this.state.installedPlugins.filter(p => p.dialog).map((pluginInfo, key) =>
              <pluginInfo.dialog
                key={key}
                pluginState={this.state.plugins[pluginInfo.name]}
                pluginApi={this.pluginApi}
                />
            )
          }

        </div>
      </MuiThemeProvider>;
  }
}
