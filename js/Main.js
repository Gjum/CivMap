import * as L from'leaflet';
import * as LE from'leaflet-editable';
import * as RL from'react-leaflet';
import React, {Component} from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import IconArrFwd from 'material-ui/svg-icons/navigation/arrow-forward';
import IconClose from 'material-ui/svg-icons/navigation/close';
import IconHelp from 'material-ui/svg-icons/action/help';
import IconMenu from 'material-ui/svg-icons/navigation/menu';
import IconPlace from 'material-ui/svg-icons/maps/place';
import IconStars from 'material-ui/svg-icons/action/stars';

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
import Toggle from 'material-ui/Toggle';

import * as Util from './Util';
import {WaypointsDialog, WaypointsOverlay} from './Waypoints';
import {ClaimsDrawerContent, EditableClaim} from './Claims';

L.Icon.Default.imagePath = '//cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0-rc.3/images/';

var mcCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0)
});

const muiTheme = getMuiTheme();

class CoordsDisplay extends Component {
  render() {
    const [z, x] = Util.intCoords(this.props.cursor);
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

export default class Main extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      // ui state
      wpDlgOpen: false,
      drawerOpen: true,
      activeDrawer: 'main',
      editedClaimId: -1,
      // map state
      showBorder: false,
      showClaims: true,
      showWaypoints: true,
      showTerrain: true,
      // map data
      mapView: Util.hashToView(location.hash), // read only! TODO feedback loop onmoveend <-> setState
      cursorPos: L.latLng(0,0),
      claims: [],
      waypoints: [],
    };
  }

  componentWillMount() {
    Util.getJSON(this.props.claimsUrl, claims => {
      this.setState({claims: this.state.claims.concat(claims)});
    });
  }

  onMapCreated(map) {
    if (!this.map) {
      this.map = map;
    }
  }

  setDrawerState(open) {
    this.setState({drawerOpen: open});
    if (this.map) {
      window.setTimeout(() => {
        this.map && this.map.invalidateSize(true); // animate
      }, 0);
      window.setTimeout(() => {
        this.map && this.map.invalidateSize(true); // animate
      }, 500);
    }
  }

  getSearchableData() {
    return this.state.claims.map(c => { return {
      text: c.name,
      value: <MenuItem
        leftIcon={<IconStars />}
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
    }}).concat(this.state.waypoints.map(w => { return {
      text: w.name,
      value: <MenuItem
        leftIcon={<IconPlace />}
        primaryText={w.name}
        onTouchTap={() => {
          this.map.flyTo(Util.xz(w.x, w.z), 3);
        }}
      />,
    }}));
  }

  render() {
    var tileBounds = Util.radiusToBounds(5120);
    var borderBounds = Util.radiusToBounds(5000);
    var minZoom = -4;

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
              onTouchTap={() => this.setState({wpDlgOpen: true})}
            />
            <MenuItem
              primaryText='Add a claim'
              leftIcon={<IconStars />}
              onTouchTap={() => {
                var claim = {
                  name: '',
                  color: '#000000',
                  positions: [],
                };
                var claimId = this.state.claims.length;
                this.state.claims.push(claim);
                this.setState({
                  activeDrawer: 'claimEdit',
                  editedClaimId: claimId,
                  claims: this.state.claims,
                });
              }}
            />

            <Subheader>Map controls</Subheader>
            <div className='menu-inset'>
              <CustomToggle
                label="Claims"
                toggled={this.state.showClaims}
                onToggle={() => this.setState({showClaims: !this.state.showClaims})}
              />
              <CustomToggle
                label="Terrain"
                toggled={this.state.showTerrain}
                onToggle={() => this.setState({showTerrain: !this.state.showTerrain})}
              />
              <CustomToggle
                label="Waypoints"
                toggled={this.state.showWaypoints}
                onToggle={() => this.setState({showWaypoints: !this.state.showWaypoints})}
              />
              <CustomToggle
                label="World border"
                toggled={this.state.showBorder}
                onToggle={() => this.setState({showBorder: !this.state.showBorder})}
              />
            </div>

            <Subheader>About</Subheader>
            <MenuItem
              primaryText='Help'
              leftIcon={<IconHelp />}
              href='https://github.com/dev3map/dev3map.github.io/wiki/'
            />

          </Drawer>

          <Drawer openSecondary
            open={this.state.drawerOpen
              && this.state.editedClaimId >= 0
              && this.state.activeDrawer == 'claimEdit'}
          >
            { this.state.editedClaimId < 0 ? null :
              <ClaimsDrawerContent
                map={this.map}
                claim={this.state.claims[this.state.editedClaimId]}
                onSave={claim => {
                  var newClaims = this.state.claims.slice();
                  newClaims[this.state.editedClaimId] = claim;
                  this.setState({claims: newClaims});
                }}
                onClose={() => {
                  // TODO delete created claim if empty
                  this.setState({
                    activeDrawer: 'main',
                    editedClaimId: -1,
                  });
                }}
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
              center={Util.xz(this.state.mapView.x, this.state.mapView.z)}
              zoom={this.state.mapView.zoom}
              maxZoom={5}
              minZoom={minZoom}
              onmoveend={e => history.replaceState({}, document.title, '#' + Util.viewToHash(e.target))}
              onmousemove={e => this.setState({cursorPos: e.latlng})}
              editable={true}
            >

              <RL.TileLayer
                attribution={this.props.attribution}
                url={this.props.tilesUrl + 'z{z}/{x},{y}.png'}
                errorTileUrl={'img/no-tile.png'}
                tileSize={256}
                bounds={tileBounds}
                minZoom={minZoom}
                maxNativeZoom={0}
                continuousWorld={true}
                opacity={this.state.showTerrain ? 1 : 0}
                />

              <CoordsDisplay cursor={this.state.cursorPos} />

              { !this.state.showBorder ? null :
                <RL.Rectangle
                  bounds={borderBounds}
                  color='#ff8888'
                  fill={false}
                />
              }

              { this.state.showClaims && this.state.claims.map((claim, claimId) =>
                <EditableClaim
                  key={claimId}
                  claim={claim}
                  opacity={claimId == this.state.editedClaimId ? 0 : .7}
                  onEditClicked={() => {
                    // TODO cancel active editing
                    this.setDrawerState(true);
                    this.setState({
                      activeDrawer: 'claimEdit',
                      editedClaimId: claimId,
                    });
                  }}
                />
              )}

              <WaypointsOverlay waypoints={this.state.showWaypoints && this.state.waypoints} />

            </RL.Map>

            <FloatingActionButton mini
              className='mainMenuButton'
              onTouchTap={() => this.setDrawerState(!this.state.drawerOpen)}
            >
              { this.state.drawerOpen
                ? <IconArrFwd />
                : <IconMenu />
              }
            </FloatingActionButton>
          </div>

          <WaypointsDialog
            open={this.state.wpDlgOpen}
            onClose={() => this.setState({wpDlgOpen: false})}
            onResult={waypoints => {
              this.setState({
                waypoints: waypoints,
                wpDlgOpen: false,
              });
            }}
          />

        </div>
      </MuiThemeProvider>;
  }
}
