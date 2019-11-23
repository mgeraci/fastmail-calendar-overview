import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { FIELD_ORDER, EMPTY_CALENDAR } from './util/constants';

import Options from './components/Options';

import './App.scss';

// keys kept on an individual calendar that we don't want to save
const LOCAL_KEYS = ['hasError'];

const SAVE_STATUSES = {
  success: 'success',
  error: 'error',
};

const App = ({ storage }) => {
  const [hasLoadError, setHasLoadError] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [use24HrTime, setUse24HrTime] = useState(false);
  const [calendars, setCalendars] = useState();

  const loadCalendars = () => {
    storage.get()
      .then((res) => {
        const initialCalendars = res.calendars && res.calendars.length
          ? res.calendars
          : [{ ...EMPTY_CALENDAR }];

        setCalendars(initialCalendars);
        setUse24HrTime(res.use24HrTime);
      }).catch((err) => {
        setHasLoadError(true);
        console.error(err); // eslint-disable-line no-console
      });
  };

  useEffect(() => {
    if (!calendars) {
      loadCalendars();
    }
  }, [calendars, setCalendars]);

  const [canSave, setCanSave] = useState(false);

  if (hasLoadError) {
    return (
      <div className="options-loading-error">
        There was a problem getting your calendar data from your browser&rsquo;s storage.
        <br />
        <br />
        Try refreshing, but if that doesn&rsquo;t work, please file a bug
        {' '}
        <a
          href="https://github.com/mgeraci/fastmail-calendar-overview/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="options-loading-error-link"
        >
          here
        </a>
        .
      </div>
    );
  }

  if (!calendars) {
    return (
      <div className="loader" />
    );
  }

  const onChange24HrTime = () => {
    setUse24HrTime(!use24HrTime);
    setCanSave(true);
  };

  const onChange = ({
    index,
    name,
    value,
  }) => {
    const newState = calendars.map((calendar, i) => {
      if (i === index) {
        return {
          ...calendar,
          [name]: value,
        };
      }

      return calendar;
    });

    setCalendars(newState);
    setCanSave(true);
  };

  const addCalendar = () => {
    setCalendars([...calendars, { ...EMPTY_CALENDAR }]);
    setCanSave(true);
  };

  const removeCalendar = (index) => {
    const newState = calendars.filter((calendar, i) => i !== index);

    setCalendars(newState);
    setCanSave(true);
  };

  const validate = () => {
    let isValid = true;
    const newState = calendars.map((_calendar) => {
      const calendar = { ..._calendar };
      let calendarHasError = false;

      // check each field for being blank
      FIELD_ORDER.forEach((field) => {
        if (!calendar[field]) {
          isValid = false;
          calendarHasError = true;
        }
      });

      calendar.hasError = calendarHasError;

      return calendar;
    });

    setCalendars(newState);

    return isValid;
  };

  const onSave = () => {
    const isValid = validate();

    if (!isValid) {
      return;
    }

    // strip local fields before saving
    const calendarsToSave = calendars.map((_calendar) => {
      const calendar = { ..._calendar };

      LOCAL_KEYS.forEach((key) => {
        delete calendar[key];
      });

      return calendar;
    });

    storage.set({
      calendars: calendarsToSave,
      use24HrTime,
    })
      .then(() => {
        setCanSave(false);
        setSaveStatus({
          type: SAVE_STATUSES.success,
          message: 'Saved!',
        });

        setTimeout(() => {
          setSaveStatus(null);
        }, 2000);
      }).catch((err) => {
        setSaveStatus({
          type: SAVE_STATUSES.error,
          message: 'Your calendars failed to save.',
        });
        console.error(err); // eslint-disable-line no-console
      });
  };

  return (
    <Options
      calendars={calendars}
      onChange={onChange}
      addCalendar={addCalendar}
      removeCalendar={removeCalendar}
      onSave={onSave}
      canSave={canSave}
      use24HrTime={use24HrTime}
      onChange24HrTime={onChange24HrTime}
      saveStatus={saveStatus}
    />
  );
};

App.propTypes = {
  storage: PropTypes.shape({
    get: PropTypes.func.isRequired,
    set: PropTypes.func.isRequired,
  }).isRequired,
};

export default App;
