import React from 'react';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';

export default function BasemapSelector(props) {
  return <SelectField
    style={{width: 220}}
    autoWidth
    floatingLabelText="Base map"
    value={props.selected}
    onChange={props.onChange}
    >
    { props.basemaps.map(mapName =>
      <MenuItem key={mapName} value={mapName} primaryText={mapName} />
    )}
    <MenuItem value="blank" primaryText="blank" />
  </SelectField>;
}
