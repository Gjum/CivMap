import React, {Component} from 'react';
import * as RL from 'react-leaflet';
import L from 'leaflet'
import update from 'immutability-helper';

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

  componentWillMount() {
    this.recreateLabel(this.props.claim.positions, !this.props.showLabel);
  }

  componentWillUpdate(nextProps, nextState) {
    this.recreateLabel(nextProps.claim.positions, !nextProps.showLabel);
  }

  recreateLabel(coords, hideLabel) {
    if (hideLabel || coords.length <= 0) {
      this.labelPos = null;
      this.label = null;
      return; // hide; or no points in claim, no place for the label
    }

    // find first point array in arbitrarily nested array of arrays
    // TODO scan all arrays recursively, show label per top region
    // ehh, just manually provide label coords+width in data :P
    while (Array.isArray(coords[0][0])) coords = coords[0];

    var len = coords.length;
    var zmin = coords.map(a => a[0]).reduce((a, b) => Math.min(a, b));
    var zmax = coords.map(a => a[0]).reduce((a, b) => Math.max(a, b));
    var xmin = coords.map(a => a[1]).reduce((a, b) => Math.min(a, b));
    var xmax = coords.map(a => a[1]).reduce((a, b) => Math.max(a, b));
    this.labelPos = [(zmax+zmin)/2, (xmax+xmin)/2];

    this.label = L.divIcon({
      className: 'claim-name',
      html: this.props.claim.name,
      iconSize: [200, 200],
    });
  }

  render() {
    if (this.props.opacity <= 0 || this.props.claim.positions.length <= 0)
      return null;

    return <RL.Polygon
        {...this.props.claim}
        color='#fff'
        fillColor={this.props.claim.color}
        opacity={Math.min(this.props.opacity * 2, 1)}
        fillOpacity={this.props.opacity}
        >
      {this.label && <RL.Marker icon={this.label} position={this.labelPos} />}
      <RL.Popup><span>
        {this.props.claim.name}
        <br />
        <a onClick={this.props.onEditClicked}>edit</a>
      </span></RL.Popup>
    </RL.Polygon>;
  }
}

export class ClaimsOverlay extends Component {
  render() {
    var state = this.props.pluginState;
    if (!state.claims || state.claims.length <= 0)
      return null;
    return <RL.LayerGroup>
      { state.claims.map((claim, claimId) =>
        <EditableClaim
          key={claimId}
          claim={claim}
          opacity={claimId == state.editedClaimId ? 0 : state.claimOpacity}
          showLabel={state.showClaimNames}
          onEditClicked={() => {
            // TODO cancel active editing
            this.props.pluginApi.setSubStates({
              drawerOpen: {$set: true},
              activeDrawer: {$set: 'claimEdit'},
              plugins: {claims: {editedClaimId: {$set: claimId}}},
            });
          }}
        />
      )}
    </RL.LayerGroup>;
  }
}

export class ClaimsDrawerContent extends Component {
  constructor(props) {
    super(props);

    var origClaim = props.pluginState.claims[props.pluginState.editedClaimId];
    var claim = {}; // copy or we would modify global state
    for (var key in origClaim) {
      claim[key] = origClaim[key];
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
        primaryText='Preview locally'
        leftIcon={<IconDone />}
        onTouchTap={() => {
          // TODO delete created claim if empty
          var ownState = this.props.pluginState;
          var newClaims = ownState.claims.slice();
          newClaims[ownState.editedClaimId] = this.state.claim;
          this.props.pluginApi.setSubStates({
            plugins: {claims: {claims: {$set: newClaims}}},
            activeDrawer: {$set: 'main'},
            editedClaimId: {$set: -1},
          });
        }}
      />
      <MenuItem
        primaryText='Discard'
        leftIcon={<IconClose />}
        onTouchTap={() => {
          // TODO delete created claim if empty
          this.props.pluginApi.setSubStates({
            activeDrawer: {$set: 'main'},
            editedClaimId: {$set: -1},
          });
        }}
      />
      <MenuItem
        primaryText='How to publish'
        leftIcon={<IconHelp />}
        href={this.props.claimsPublishHelpUrl || 'https://github.com/dev3map/dev3map.github.io/wiki/Adding-and-editing-claims'}
        target='_blank'
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
    </div>;
  }
}
