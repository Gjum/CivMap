import React, {Component} from 'react';
import * as RL from 'react-leaflet';

import IconAdd from 'material-ui/svg-icons/content/add-circle';
import IconClose from 'material-ui/svg-icons/navigation/close';
import IconPlace from 'material-ui/svg-icons/maps/place';
import IconUpload from 'material-ui/svg-icons/file/file-upload';

import CircularProgress from 'material-ui/CircularProgress';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';

import CustomToggle from './CustomToggle';
import * as Util from './Util';

function parseWaypoints(text) {
  // name, x, z, y, enabled, red, green, blue, suffix, world, dimensions
  return text.split('\n')
    .filter(line => line.includes(',x:'))
    .map(line => {
      var point = {};
      line.split(',').map(entry => {
        var [key, val] = entry.split(':');
        point[key] = val;
      });
      point.x = parseInt(point.x);
      point.y = parseInt(point.y);
      point.z = parseInt(point.z);
      point.red   = parseInt(point.red);
      point.green = parseInt(point.green);
      point.blue  = parseInt(point.blue);
      point.enabled = point.enabled == 'true';
      return point;
    });
}

export class WaypointsOverlay extends Component {
  render() {
    var pluginState = this.props.pluginState;
    if (!pluginState.showWaypoints
        || !pluginState.waypoints
        || pluginState.waypoints.length <= 0)
      return null;
    return <RL.LayerGroup>
      { pluginState.waypoints.map(w =>
        w.name.toLowerCase().includes("snitch") ?
          <RL.Rectangle
            key={'snitchRect'+w.name+w.x+w.y+w.z}
            bounds={[[w.z-11, w.x-11], [w.z+12, w.x+12]]}
            title={w.name}
            color="#ff8888"
          >
            <RL.Popup><span>
              {w.name}
              <br />
              {w.x}, {w.y}, {w.z}
            </span></RL.Popup>
          </RL.Rectangle>
        : w.name.toLowerCase().includes("citybastion") ?
            <RL.Rectangle
              key={'cityBastionRect'+w.name+w.x+w.y+w.z}
              bounds={[[w.z-20, w.x-20], [w.z+21, w.x+21]]}
              title={w.name}
              color="#ffff88"
            >
              <RL.Popup><span>
                {w.name}
                <br />
                {w.x}, {w.y}, {w.z}
              </span></RL.Popup>
            </RL.Rectangle>
        : w.name.toLowerCase().includes("claimsbastion") ?
            <RL.Circle
              key={'claimsBastionCircle'+w.name+w.x+w.y+w.z}
              radius={100}
              center={[w.z, w.x]}
              title={w.name}
              color="#88ffff"
            >
              <RL.Popup><span>
                {w.name}
                <br />
                {w.x}, {w.y}, {w.z}
              </span></RL.Popup>
            </RL.Circle>
          : // regular waypoint
          <RL.Marker
            key={w.name+w.x+w.y+w.z}
            position={[w.z+.5, w.x+.5]}
            title={w.name}
          >
            <RL.Popup><span>
              {w.name}
              <br />
              {w.x}, {w.y}, {w.z}
            </span></RL.Popup>
          </RL.Marker>
      )}
    </RL.LayerGroup>;
  }
}

export class WaypointsDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      waypointsText: '',
    };
  }

  onClose() {
    this.props.pluginApi.setSubStates({
      plugins: {waypoints: {wpDlgOpen: {$set: false}}},
    });
  }

  onReplace (waypoints) {
    this.props.pluginApi.setSubStates({
      plugins: {waypoints: {
        waypoints: {$set: waypoints},
        wpDlgOpen: {$set: false},
      }},
    });
  }

  onAdd (waypoints) {
    this.props.pluginApi.setSubStates({
      plugins: {waypoints: {
        waypoints: {$apply: w => w.concat(waypoints)},
        wpDlgOpen: {$set: false},
      }},
    });
  }

  render() {
    const actions = [
      <FlatButton default
        label="Close"
        icon={<IconClose />}
        onTouchTap={() => this.onClose()}
      />,
      <FlatButton primary
        label="Replace"
        icon={<IconUpload />}
        disabled={!this.state.waypointsText}
        onTouchTap={() => {
          const waypoints = parseWaypoints(this.state.waypointsText);
          this.onReplace(waypoints);
        }}
      />,
      <FlatButton primary
        label="Add"
        icon={<IconAdd />}
        disabled={!this.state.waypointsText}
        onTouchTap={() => {
          const waypoints = parseWaypoints(this.state.waypointsText);
          this.onAdd(waypoints);
        }}
      />,
    ];

    return <Dialog
      open={this.props.pluginState.wpDlgOpen}
      title="Import waypoints"
      actions={actions}
      onRequestClose={() => this.onClose()}
      >
      <p>Note that they do not leave your computer, only you can see them, and they are reset when you reload the page.</p>
      <p>Your waypoints are stored in <code>(.minecraft location)\mods\VoxelMods\voxelMap\(server address).points</code></p>
      <TextField autoFocus fullWidth multiLine rows={2} rowsMax={10}
        hintText="Paste your waypoints here"
        value={this.state.value}
        onChange={e => this.setState({waypointsText: e.target.value})}
      />
    </Dialog>
  }
};

function WaypointsMenu(props) {
  return <div>
    <MenuItem
      primaryText='Import your waypoints'
      leftIcon={<IconPlace />}
      onTouchTap={() => props.pluginApi.setSubStates({
        plugins: {waypoints: {wpDlgOpen: {$set: true}}},
      })}
    />
    <div className='menu-inset'>
      <CustomToggle
        label="Show Waypoints"
        toggled={props.pluginState.showWaypoints}
        onToggle={() => props.pluginApi.setSubStates({plugins: {waypoints: {showWaypoints: {$apply: x => !x}}}})}
      />
    </div>
  </div>;
}

function getSearchableData(pluginApi, pluginState) {
  return pluginState.waypoints.map(w => { return {
      text: w.name,
      value: <MenuItem
        leftIcon={<IconPlace />}
        primaryText={w.name}
        onTouchTap={() => pluginApi.map.flyTo(Util.xz(w.x, w.z), 3)}
      />,
    }
  });
}

export var WaypointsPluginInfo = {
  name: "waypoints",
  getSearchableData: getSearchableData,
  overlay: WaypointsOverlay,
  gui: WaypointsDialog,
  menu: WaypointsMenu,
  state: {
    waypoints: [],
    showWaypoints: true,
    wpDlgOpen: false,
  },
};
