import React, {Component} from 'react';
import * as RL from 'react-leaflet';
import L from 'leaflet'

import IconAdd from 'material-ui/svg-icons/content/add-circle';
import IconClose from 'material-ui/svg-icons/navigation/close';
import IconDone from 'material-ui/svg-icons/navigation/check';
import IconHelp from 'material-ui/svg-icons/action/help';

import MenuItem from 'material-ui/MenuItem';
import Subheader from 'material-ui/Subheader';
import TextField from 'material-ui/TextField';

import * as Util from './Util';

export class EditableClaim extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.opacity <= 0)
      return null;
    return <RL.Polygon
        {...this.props.claim}
        color='#fff'
        fillColor={this.props.claim.color}
        opacity={this.props.opacity}
        fillOpacity={this.props.opacity}
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

    var claim = {}; // copy or we would modify global state
    for (var key in props.claim) {
      claim[key] = props.claim[key];
    }
    this.state = {
      claim: claim,
      parseErrorText: null,
    };

    this.poly = L.polygon(claim.positions);
    this.poly.addTo(props.map);
    this.poly.enableEdit();

    var updatePolyPositions = e => {
      var p = Util.deepLatLngToArr(this.poly.getLatLngs());
      if (p.length == 1 && p[0].length == 0) p = [];
      this.state.claim.positions = p;
      this.setState({claim: this.state.claim});
    }

    this.poly.on('editable:drawing:clicked', updatePolyPositions);
    this.poly.on('editable:vertex:dragend', updatePolyPositions);
    this.poly.on('editable:vertex:deleted', updatePolyPositions);

    this.poly.setStyle({
      color: '#ffffff',
      fillColor: claim.color,
      opacity: .5,
      fillOpacity: .3,
    });

    if (claim.positions.length == 0) {
      this.poly.editor.newShape();
    }
  }

  componentWillUnmount() {
    this.poly.remove();
  }

  updateClaimAndPoly(newClaim) {
    var claim = this.state.claim;
    for (var key in newClaim) {
      claim[key] = newClaim[key];
    }

    this.setState({
      claim: claim,
      parseErrorText: null,
    });

    this.poly.setLatLngs(claim.positions);
    this.poly.setStyle({fillColor: claim.color});
    this.poly.disableEdit();
    this.poly.enableEdit();
  }

  render() {
    return <div>
      <MenuItem
        primaryText='Apply changes'
        leftIcon={<IconDone />}
        onTouchTap={() => {
          this.props.onSave(this.state.claim);
          this.props.onClose();
        }}
      />
      <MenuItem
        primaryText='Discard changes'
        leftIcon={<IconClose />}
        onTouchTap={this.props.onClose}
      />
      <MenuItem
        primaryText='Add another polygon'
        leftIcon={<IconAdd />}
        onTouchTap={() => {
          this.poly.editor.commitDrawing();
          this.poly.editor.newShape();
        }}
      />

      <div className='menu-inset'>
        <TextField fullWidth
          floatingLabelText="Claim name"
          value={this.state.claim.name}
          errorText={this.state.claim.name ? null : 'required'}
          onChange={e => this.updateClaimAndPoly({name: e.target.value})}
        />

        <div style={{marginTop: 16}}>
          Color:
          <input type="color"
            style={{marginLeft: 16}}
            value={this.state.claim.color}
            onChange={e => this.updateClaimAndPoly({color: e.target.value})}
          />
        </div>
      </div>

      <Subheader>Claim JSON</Subheader>

      <div className='menu-inset'>
        <TextField fullWidth multiLine rows={1} rowsMax={999}
          hintText="Claim JSON"
          value={this.state.parseErrorText ? undefined : JSON.stringify(this.state.claim)}
          errorText={this.state.parseErrorText}
          onChange={e => {
            try {
              var claim = JSON.parse(e.target.value);
              this.updateClaimAndPoly(claim);
            } catch (err) {
              this.setState({parseErrorText: ''+err});
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
