import React from 'react';
import PropTypes from 'prop-types';

import { FIELD_ORDER, FIELD_LABELS } from '../util/constants';

import './Calendar.scss';

const Calendar = ({
  index,
  calendar,
  onChange,
  onRemove,
}) => {
  const id = `calendar-${index}`;

  return (
    <fieldset
      key={id}
      className={`options-calendar${calendar.hasError ? ' options-calendar--hasError' : ''}`}
    >
      {FIELD_ORDER.map((field) => {
        const fieldId = `calendar-${index}-${field}`;

        return (
          <div
            key={fieldId}
            className="options-calendar-field"
          >
            <label
              htmlFor={fieldId}
              className="options-calendar-label"
            >
              {FIELD_LABELS[field]}
            </label>
            <input
              id={fieldId}
              type="text"
              className={`options-calendar-input options-calendar-input--${field}`}
              name={field}
              value={calendar[field]}
              onChange={(e) => {
                onChange({
                  index,
                  name: e.target.name,
                  value: e.target.value,
                });
              }}
            />
          </div>
        );
      })}

      {calendar.hasError && (
        <span className="options-calendar-error">
          No fields can be blank!
        </span>
      )}

      <button
        className="options-calendar-remove"
        onClick={onRemove}
        type="button"
      >
        <span className="options-calendar-remove-icon">
          ×
        </span>
        <span className="options-calendar-remove-text">
          Remove this calendar
        </span>
      </button>
    </fieldset>
  );
};

Calendar.propTypes = {
  index: PropTypes.number.isRequired,
  calendar: PropTypes.shape({
    name: PropTypes.string,
    url: PropTypes.string,
    hasError: PropTypes.bool,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default Calendar;
