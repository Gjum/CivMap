import React, {Component} from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
// import {green200, green900} from 'material-ui/styles/colors';
import IconAdd from 'material-ui/svg-icons/content/add-circle';
import IconClose from 'material-ui/svg-icons/navigation/close';
import IconHelp from 'material-ui/svg-icons/action/help';
import IconStars from 'material-ui/svg-icons/action/stars';
import IconUpload from 'material-ui/svg-icons/file/file-upload';

import AppBar from 'material-ui/AppBar';
import AutoComplete from 'material-ui/AutoComplete';
import CircularProgress from 'material-ui/CircularProgress';
import Dialog from 'material-ui/Dialog';
import Drawer from 'material-ui/Drawer';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

const muiTheme = getMuiTheme({
  palette: {
  },
});

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

class WaypointsDialog extends Component {
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
        label="Cancel"
        icon={<IconClose />}
        onTouchTap={this.props.onClose}
      />,
      <RaisedButton primary
        label="Import"
        icon={<IconUpload />}
        disabled={this.state.inProgress}
        onTouchTap={() => {
          this.setState({inProgress: true});
          // TOOD convert waypoints
          const waypoints = this.state.waypointsText;
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

export default class Main extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      wpDlgOpen: false,
      drawerOpen: false,
      claims: [{name: 'aquila'},{name: 'wawa'},],
    };
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme} className='fullHeight'>
        <div className='fullHeight'>

          <Drawer open={this.state.drawerOpen}>
            <AutoComplete
              hintText="Find a claim"
              filter={AutoComplete.fuzzyFilter}
              maxSearchResults={5}
              dataSource={this.state.claims.map(c => { return {
                text: c.name,
                value: <MenuItem leftIcon={<IconStars />}
                  primaryText={c.name}
                  onTouchTap={() => {
                    alert('TODO fly view to claim\n' + JSON.stringify(c));
                  }}
                />,
              }})}
            />
            <MenuItem
              primaryText='Import waypoints'
              leftIcon={<IconUpload />}
              onTouchTap={() => this.setState({wpDlgOpen: true})}
            />
            <MenuItem
              primaryText='Add a claim'
              leftIcon={<IconAdd />}
              onTouchTap={() => alert('TODO open add claim UI')}
            />
            <MenuItem
              primaryText='How to draw claims'
              leftIcon={<IconHelp />}
              href='https://github.com/dev3map/dev3map.github.io/wiki/Adding-and-editing-claims'
            />
          </Drawer>

          <div
            className='fullHeight'
            style={{
              marginLeft: this.state.drawerOpen ? 256 : 0,
              transition: 'margin-left 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
              backgroundColor: 'rgba(0,128,0,.5)',
            }}
          >
            The Map
            <MenuItem primaryText='TODO open drawer' onTouchTap={() => this.setState({drawerOpen: true})} />
            <MenuItem primaryText='TODO close drawer' onTouchTap={() => this.setState({drawerOpen: false})} />
          </div>

          <WaypointsDialog
            open={this.state.wpDlgOpen}
            onClose={() => this.setState({wpDlgOpen: false})}
            onResult={wpText => {
              console.log('waypoints:', wpText);
              this.setState({wpDlgOpen: false});
            }}
          />

        </div>
      </MuiThemeProvider>
    );
  }
}
