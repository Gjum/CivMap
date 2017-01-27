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
import Toggle from 'material-ui/Toggle';

import * as Util from './Util';
import {WaypointsDialog, WaypointsOverlay} from './Waypoints';
import {ClaimsDrawerContent, ClaimsOverlay} from './Claims';

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

  plugins: {
    claims: {
      claims: [],
      claimOpacity: .1,
      showClaimNames: false,
      editedClaimId: -1,
    },
    waypoints: {
      waypoints: [],
      showWaypoints: true,
      wpDlgOpen: false,
    },
  },
};

class CoordsDisplay extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {cursor: L.latLng([0,0])};
  }

  setCursor(cursor) {
    this.setState({cursor: cursor});
  }

  render() {
    const [z, x] = Util.intCoords(this.state.cursor);
    return <div className='coords-display control-box leaflet-control leaflet-bar'>
      {'X ' + x + ' ' + z + ' Z'}</div>;
  }
}

class Centered extends Component {
  render() {
    return (
      <div className='center-outer'>
      <div className='center-middle'>
      <div className='center-inner'>
        {this.props.children}
      </div></div></div>);
  }
}

class CustomToggle extends Component {
  render() {
    return <Toggle
      labelPosition="right"
      labelStyle={{marginLeft: 10}}
      {...this.props}
    />;
  }
}

class PluginApi {
  constructor(component) {
    this._component = component;
    this.setState = component.setState.bind(component);
    this.setSubStates = component.setSubStates.bind(component);
  }
}

export default class Main extends Component {
  constructor(props, context) {
    super(props, context);

    if (props.options) {
      this.state = Util.updateJsonObject(defaultState, props.options);
    }

    this.mapView = Util.hashToView(location.hash);

    this.pluginApi = new PluginApi(this);
  }

  componentWillMount() {
    Util.getJSON(this.props.claimsUrl, claims => {
      this.setSubStates({plugins: {claims: {claims: {$set: claims}}}});
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
    }
  }

  getSearchableData() {
    return this.state.plugins.claims.claims.map(c => { return {
      text: c.name,
      value: <MenuItem
        leftIcon={<IconClaim />}
        primaryText={c.name}
        onTouchTap={() => {
          // flip the vertical coordinates to circumvent https://github.com/Leaflet/Leaflet/issues/4886
          var bounds = L.latLngBounds(c.positions);
          var s = bounds._northEast.lat;
          var n = bounds._southWest.lat;
          bounds._northEast.lat = n;
          bounds._southWest.lat = s;
          this.map.flyToBounds(bounds);
        }}
      />,
    }}).concat(this.state.plugins.waypoints.waypoints.map(w => { return {
      text: w.name,
      value: <MenuItem
        leftIcon={<IconPlace />}
        primaryText={w.name}
        onTouchTap={() => this.map.flyTo(Util.xz(w.x, w.z), 3)}
      />,
    }}));
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
                  plugins: {claims: {claims: {$push: claim}}},
                  plugins: {claims: {editedClaimId: {$set: claimId}}},
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
                  if (val < .05) val = 0;
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

          <Drawer openSecondary
            open={this.state.drawerOpen
              && this.state.activeDrawer == 'claimEdit'
              && this.state.plugins.claims.editedClaimId >= 0
            }
          >
            { this.state.plugins.claims.editedClaimId < 0 ? null :
              <ClaimsDrawerContent
                pluginApi={this.pluginApi}
                pluginState={this.state.plugins.claims}
                map={this.map}
                claimsPublishHelpUrl={this.props.claimsPublishHelpUrl}
              />
            }
          </Drawer>

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

              <ClaimsOverlay
                pluginState={this.state.plugins.claims}
                pluginApi={this.pluginApi}
                />

              <WaypointsOverlay pluginState={this.state.plugins.waypoints} />

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

          <WaypointsDialog
            pluginApi={this.pluginApi}
            pluginState={this.state.plugins.waypoints}
            />

        </div>
      </MuiThemeProvider>;
  }
}
