import React, {Component} from 'react';
import * as RL from 'react-leaflet';
import L from 'leaflet'

import IconAdd from 'material-ui/svg-icons/content/add-circle';
import IconHelp from 'material-ui/svg-icons/action/help';

import MenuItem from 'material-ui/MenuItem';
import Subheader from 'material-ui/Subheader';
import TextField from 'material-ui/TextField';

import * as Util from './Util';

export class EditableClaim extends Component {
  constructor(props) {
    super(props);
    this.positions = props.claim.positions;
  }

  render() {
    // TODO compare positions, update draw markers
    return <RL.Polygon
        {...this.props.claim}
        positions={this.positions}
        color='#fff'
        fillColor={this.props.claim.color}
        fillOpacity={0.8}
        ref={ref => {if (ref) {
          var poly = ref.leafletElement;
          if (this.props.isEditedClaim) {
            poly.enableEdit();
          }
          else poly.disableEdit();
        }}}
        >
      <RL.Popup><span>
        {this.props.claim.name}
        <br />
        <a onClick={this.props.onEditClicked}>edit</a>
      </span></RL.Popup>
    </RL.Polygon>;
  }
}

export class ClaimsDrawerContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      parseError: null,
    };
  }

  render() {
    return <div>
      <MenuItem
        primaryText='Add another polygon'
        leftIcon={<IconAdd />}
        onTouchTap={() => {
          var p = this.props.claim.positions;
          var newPoly = Util.triangle(L.latLngBounds(p).getCenter());
          if (p.length > 0 && Array.isArray(p[0][0])) {
            p.push(newPoly) // insert into existing array
          } else {
            // add old positions plus new poly to new top level array
            p = [
              p.slice(),
              newPoly, // TODO where to get it? center on claim?
            ];
          }
          this.props.claim.positions = p;
          this.props.onUpdateClaim(this.props.claim);
        }}
      />

      <div className='menu-inset'>
        <TextField fullWidth
          floatingLabelText="Claim name"
          value={this.props.claim.name}
          errorText={this.props.claim.name ? null : 'required'}
          onChange={e => {
            this.props.claim.name = e.target.value;
            this.props.onUpdateClaim(this.props.claim);
          }}
        />

        <div style={{marginTop: 16}}>
          Color:
          <input type="color"
            style={{marginLeft: 16}}
            value={this.props.claim.color}
            onChange={e => {
              this.props.claim.color = e.target.value;
              this.props.onUpdateClaim(this.props.claim);
            }}
          />
        </div>
      </div>

      <Subheader>Result JSON</Subheader>

      <div className='menu-inset'>
        <TextField fullWidth multiLine rows={1} rowsMax={10}
          hintText="Claim JSON"
          value={JSON.stringify(this.props.claim)}
          errorText={this.state.parseError}
          onChange={e => {
            try {
              var claim = JSON.parse(e.target.value);
              this.props.onUpdateClaim(claim);
              this.setState({parseError: null});
            } catch (e) {
              // TODO reset to null everywhere else
              this.setState({parseError: ''+e});
            }
          }}
        />
      </div>

      <MenuItem
        primaryText='Claims how-to'
        leftIcon={<IconHelp />}
        href='https://github.com/dev3map/dev3map.github.io/wiki/Adding-and-editing-claims'
      />
    </div>;
  }
}
