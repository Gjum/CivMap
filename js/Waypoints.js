import React, {Component} from 'react';
import * as RL from 'react-leaflet';
import IconClose from 'material-ui/svg-icons/navigation/close';
import IconUpload from 'material-ui/svg-icons/file/file-upload';

import CircularProgress from 'material-ui/CircularProgress';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

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
    if (!this.props.waypoints || this.props.waypoints.length <= 0)
      return null;
    return <RL.LayerGroup>
      { this.props.waypoints.map(w =>
        w.name.toLowerCase().includes("snitch") ?
          <RL.Rectangle
            key={'snitchRect'+w.name+w.x+w.y+w.z}
            bounds={[[w.z-11, w.x-11], [w.z+12, w.x+12]]}
            title={w.name}
          >
            <RL.Popup><span>
              {w.name}
              <br />
              {w.x}, {w.y}, {w.z}
            </span></RL.Popup>
          </RL.Rectangle>
        :
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
      inProgress: false,
    };
  }

  render() {
    const actions = [
      <FlatButton primary
        label="Close"
        icon={<IconClose />}
        onTouchTap={this.props.onClose}
      />,
      <RaisedButton primary
        label="Import"
        icon={<IconUpload />}
        disabled={this.state.inProgress || !this.state.waypointsText}
        onTouchTap={() => {
          this.setState({inProgress: true});
          const waypoints = parseWaypoints(this.state.waypointsText);
          this.setState({inProgress: false});
          this.props.onResult(waypoints);
        }}
      />,
    ];

    return <Dialog
      open={this.props.open || this.state.inProgress}
      title="Import waypoints"
      actions={actions}
      onRequestClose={this.props.onClose}
    >
      <p>Note that they do not leave your computer, only you can see them, and they are reset when you reload the page.</p>
      <p>Your waypoints are stored in <code>(.minecraft location)\mods\VoxelMods\voxelMap\(server address).points</code></p>
      <TextField fullWidth multiLine rows={2} rowsMax={10}
        hintText="Paste your waypoints here"
        value={this.state.value}
        onChange={e => this.setState({waypointsText: e.target.value})}
      />
      { !this.state.inProgress ? null :
        <p>
          <span style={{float: 'left', padding: 25}}>
            Importing, please wait...</span>
          <CircularProgress />
        </p>
      }
    </Dialog>
  }
};
