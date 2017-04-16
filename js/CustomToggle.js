import React from 'react';
import Toggle from 'material-ui/Toggle';

export default function CustomToggle(props) {
  return <Toggle
    labelPosition="right"
    labelStyle={{marginLeft: 10}}
    {...props}
  />;
}
