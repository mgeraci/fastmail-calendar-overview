/* global document */

export default {
  wrapper(days) {
    const res = document.createElement('ul');
    res.id = 'fastmail-calendar-overview-wrapper';
    res.innerHTML = days.map((day) => this.day(day)).join('');

    return res;
  },

  day(day) {
    return `
      <li class='fastmail-calendar-overview-event'>
        <h3>${day.displayDate}</h3>
        ${day.events.map((event) => this.event(event)).join('')}
      </li>
    `;
  },

  event(event) {
    return `
      <div class='event'>
        ${event.timeString ? `
          <span class='time'>
            ${event.timeString}
          </span>
        ` : ''}

        ${event.summary}

        <div class='details'>
          <h3>${event.summary}</h3>

          ${event.durationHours ? `
            <span class='duration'>
              ${event.durationHours}
            </span>
          ` : ''}

          ${event.description ? `
            <span class='description'>
              ${event.description}
            </span>
          ` : ''}

          ${event.location ? `
            <span class='location'>
              ${event.location}
              <br>
              <a
                target='_blank'
                href='http://maps.google.com/maps?f=q&hl=en&iwloc=addr&q=${event.location}'
              >
                map
              </a>
            </span>
          ` : ''}

          ${event.calendar ? `
            <span class='calendar'>
              calendar: ${event.calendar}
            </span>
          ` : ''}

        </div>
      </div>
    `;
  },
};
