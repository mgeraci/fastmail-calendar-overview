import React from 'react';

import './Header.scss';

const Header = () => (
  <>
    <h1 className="options-title">
      Fastmail Calendar Overview Settings
    </h1>

    <hr className="options-title-separator" />

    <div className="options-description">
      Add you calendars below and hit save! They must be Fastmail calendars,
      hosted on the domain
      {' '}
      <pre className="options-description-code">https://user.fm</pre>
      .

      To get your calendar url, go to the &ldquo;Calendars&rdquo; section of
      Fastmail&rsquo;s settings page, click the &ldquo;Edit &amp; share&rdquo;
      button next to the calendar that you&rsquo;d like to add, make sure the
      &ldquo;Full event details&rdquo; checkbox is selected, and copy the url
      listed.
    </div>
  </>
);

export default Header;
