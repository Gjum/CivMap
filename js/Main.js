import * as _ from'lodash';
import * as L from'leaflet';
import * as RL from'react-leaflet';
import React, {Component} from 'react';
import update from 'immutability-helper';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import IconArrFwd from 'material-ui/svg-icons/navigation/arrow-forward';
import IconClaim from 'material-ui/svg-icons/social/public';
import IconClose from 'material-ui/svg-icons/navigation/close';
import IconHelp from 'material-ui/svg-icons/action/help';
import IconLink from 'material-ui/svg-icons/content/link';
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
import Subheader from 'material-ui/Subheader';
import TextField from 'material-ui/TextField';

import BasemapSelector from './BasemapSelector';
import {ClaimsPluginInfo} from './Claims';
import CoordsDisplay from './CoordsDisplay';
import CustomToggle from './CustomToggle';
import {PluginApi} from './PluginApi';
import * as Util from './Util';
import {hashToView, viewToHash} from './Url';
import {WaypointsPluginInfo} from './Waypoints';

L.Icon.Default.imagePath = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.3/images/';

var mcCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0)
});

const muiTheme = getMuiTheme();

var defaultState = {
  // ui state
  drawerOpen: true,

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

    this.viewDefaults = {
      radius: props.borderCircleRadius || props.borderSquareRadius,
      basemap: this.state.basemap,
    };

    this.mapView = hashToView(location.hash, this.viewDefaults);
    this.state.basemap = this.mapView.basemap;

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
      map.fitBounds(this.mapView.bounds);
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
            open={this.state.drawerOpen}
          >
            <div className='menu-inset'>
              <AutoComplete fullWidth openOnFocus
                hintText="Search"
                filter={AutoComplete.fuzzyFilter}
                dataSource={this.getSearchableData()}
              />
            </div>

            <BasemapSelector
              selected={this.state.basemap}
              onBasemapSelect={val => this.setState({basemap: val})}
              basemaps={this.props.basemaps}
              tilesUrl={this.props.tilesUrl}
            />

            {
              this.state.installedPlugins.filter(p => p.menu).map((pluginInfo, key) =>
                <pluginInfo.menu
                  key={key}
                  pluginState={this.state.plugins[pluginInfo.name]}
                  pluginApi={this.pluginApi}
                  />
              )
            }

            <div className='menu-inset'>
              <CustomToggle
                label="Show world border"
                toggled={this.state.showBorder}
                onToggle={() => this.setState({showBorder: !this.state.showBorder})}
              />
            </div>

            <MenuItem
              primaryText='Link to current view'
              leftIcon={<IconLink />}
              onTouchTap={() => history.replaceState({}, document.title, viewToHash(this.map, this.state, this.viewDefaults))}
            />

            <Subheader>About</Subheader>
            <MenuItem
              primaryText='Help'
              leftIcon={<IconHelp />}
              href={this.props.helpUrl || 'https://github.com/Gjum/CivMap/wiki/'}
            />

          </Drawer>

          <div className={'mapContainer ' +
              (this.state.drawerOpen ? 'drawerOpen' : 'drawerClosed')}
          >

            <RL.Map
              className="map"
              ref={ref => {if (ref) this.onMapCreated(ref.leafletElement)}}
              crs={mcCRS}
              center={[0, 0]}
              zoom={minZoom}
              maxZoom={5}
              minZoom={minZoom}
              onmousemove={e => this.coordsDisplay && this.coordsDisplay.setCursor(e.latlng)}
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
            this.state.installedPlugins.filter(p => p.gui).map((pluginInfo, key) =>
              <pluginInfo.gui
                key={key}
                pluginState={this.state.plugins[pluginInfo.name]}
                pluginApi={this.pluginApi}
                isDrawerOpen={this.state.drawerOpen}
                />
            )
          }

        </div>
      </MuiThemeProvider>;
  }
}
