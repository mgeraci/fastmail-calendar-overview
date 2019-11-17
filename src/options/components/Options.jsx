import React from 'react';
import PropTypes from 'prop-types';

import Header from './Header';
import Calendar from './Calendar';

const Options = ({
  calendars,
  onChange,
  addCalendar,
  removeCalendar,
  onSave,
  canSave,
  saveStatus,
}) => (
  <>
    <div className="options-content">
      <Header />

      {calendars.map((calendar, i) => {
        const key = `calendar-${i}`;

        return (
          <Calendar
            key={key}
            index={i}
            calendar={calendar}
            onChange={onChange}
            onRemove={() => {
              removeCalendar(i);
            }}
          />
        );
      })}

      <button
        className="options-add"
        onClick={addCalendar}
        type="button"
      >
        Add calendar
      </button>
    </div>

    <div className="options-footer">
      <div className="options-footer-content">
        <button
          className="options-save"
          onClick={onSave}
          type="submit"
          disabled={!canSave}
        >
          Save
        </button>

        {saveStatus && (
          <span className={`options-footer-message options-footer-message--${saveStatus.type}`}>
            {saveStatus.message}
          </span>
        )}
      </div>
    </div>
  </>
);

Options.propTypes = {
  calendars: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  })).isRequired,
  onChange: PropTypes.func.isRequired,
  addCalendar: PropTypes.func.isRequired,
  removeCalendar: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  canSave: PropTypes.bool.isRequired,
  saveStatus: PropTypes.shape({
    type: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
  }),
};

Options.defaultProps = {
  saveStatus: null,
};

export default Options;
