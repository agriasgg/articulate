import { TableCell } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

const styles = {
  icon: {
    '&:hover': {
      filter: 'invert(0)',
    },
    filter: 'invert(1)',
    cursor: 'pointer',
  },
};

function ImageCell(props) {
  const {
    classes,
    image,
    onClick,
    ...rest
  } = props;
  return <TableCell {...rest}>
    <img alt="" onClick={onClick || _.noop} className={classes.icon} src={image} />
  </TableCell>;
}

ImageCell.propTypes = {
  onClick: PropTypes.func,
  image: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ImageCell);
