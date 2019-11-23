import React from 'react';
import PropTypes from 'prop-types';

import './Switch.scss';

const Switch = ({
  label,
  name,
  value,
  checked,
  disabled,
  hasBg,
  onChange,
  className,
}) => {
  let clickableClasses = 'oknf-switch oknf-switch--has-label';

  if (hasBg) {
    clickableClasses = `${clickableClasses} oknf-switch--has-bg`;
  }

  if (disabled) {
    clickableClasses = `${clickableClasses} oknf-switch--disabled`;
  }

  if (className) {
    clickableClasses = `${clickableClasses} ${className}`;
  }

  return (
    <label className={clickableClasses}>
      <input
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <span className="oknf-switch-decoration" />
      <span className="oknf-switch-label">
        {label}
      </span>
    </label>
  );
};

Switch.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.bool,
  ]),
  label: PropTypes.node.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  name: PropTypes.string,
  hasBg: PropTypes.bool,
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
};

Switch.defaultProps = {
  value: '',
  className: null,
  name: null,
  hasBg: false,
  disabled: false,
  checked: false,
};

export default Switch;
