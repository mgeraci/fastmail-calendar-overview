import React from 'react';
import PropTypes from 'prop-types';

import Switch from './Switch';

const StylePreferences = ({ use24HrTime, onChange24HrTime }) => (
  <>
    <span className="options-section-header">
      Preferences
    </span>
    <Switch
      label="Use 24hr time"
      checked={use24HrTime}
      onChange={onChange24HrTime}
      className="options-preference"
    />
  </>
);

StylePreferences.propTypes = {
  use24HrTime: PropTypes.bool.isRequired,
  onChange24HrTime: PropTypes.func.isRequired,
};

export default StylePreferences;
