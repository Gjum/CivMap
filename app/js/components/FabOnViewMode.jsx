import React from 'react';
import { connect } from 'react-redux';

import Button from 'material-ui/Button';
import ShareIcon from 'material-ui-icons/Share';

import { openShare } from '../actions';

const FabOnViewMode = ({
  openShare,
}) => {
  return (
    <Button
      fab color='primary'
      className='fab-bottomright'
      onClick={openShare}
    >
      <ShareIcon />
    </Button>
  );
}

const mapStateToProps = ({ }, ownProps) => {
  return {};
};

const mapDispatchToProps = {
  openShare,
};

export default connect(mapStateToProps, mapDispatchToProps)(FabOnViewMode);
