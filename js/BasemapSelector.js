import React from 'react';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';

export default function BasemapSelector(props) {
  return <div className='basemap-selector' >
    { props.basemaps.map(mapName =>
      <div key={mapName}
        className='basemap-selector-item'
        onClick={() => props.onBasemapSelect(mapName)}
        >
        <div className={'basemap-selector-item-inner' + (mapName == props.selected ? ' basemap-selector-current' : '')} >
          <img src={props.tilesUrl + mapName + '/z-2/0,0.png'} />
          {mapName}
        </div>
      </div>
    )}
  </div>;
}
