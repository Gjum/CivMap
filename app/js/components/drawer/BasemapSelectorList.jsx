import React from 'react';
import { connect } from 'react-redux';

import Avatar from 'material-ui/Avatar';
import List, { ListItem, ListItemAvatar, ListItemText, ListSubheader } from 'material-ui/List';

import { setDrawerClosed, setActiveBasemap } from '../../actions';

const BasemapIcon = ({ basemapId, basemapPreview, tilesRoot }) => {
  return (
    <ListItemAvatar>
      <Avatar
        src={tilesRoot + basemapId + basemapPreview}
      />
    </ListItemAvatar>
  );
}

const BasemapSelectorList = ({
  activeBasemapId,
  basemapPreview,
  basemaps,
  tilesRoot,

  setDrawerClosed,
  setActiveBasemap,
}) => {
  const getClassName = id => id == activeBasemapId ? ' basemap-selector-current' : null;
  return (
    <List disablePadding
      subheader={<ListSubheader>Basemap</ListSubheader>}
    >
      {Object.values(basemaps).map(({ id, name }) =>
        <ListItem key={id}
          button
          className={getClassName(id)}
          onClick={() => {
            setActiveBasemap(id);
            setDrawerClosed();
          }}
        >
          <BasemapIcon basemapId={id} basemapPreview={basemapPreview} tilesRoot={tilesRoot} />
          <ListItemText primary={name} />
        </ListItem>
      )}
    </List >
  );
}

const mapStateToProps = ({ mapConfig, mapView }, ownProps) => {
  return {
    activeBasemapId: mapView.basemapId,
    ...mapConfig,
  };
};

const mapDispatchToProps = {
  setDrawerClosed,
  setActiveBasemap,
};

export default connect(mapStateToProps, mapDispatchToProps)(BasemapSelectorList);
