import template from 'lodash/template';
import each from 'lodash/each';

export default {
  init() {
    this.wrapper = template(this.wrapperSrc());
    this.day = template(this.daySrc());
    this.event = template(this.eventSrc());
  },

  wrapperSrc() {
    return `\
<ul id='fastmail-calendar-overview-wrapper'>
<% each(events, function(day) { %>
  ${this.daySrc()}
<% }); %>
</ul>\
`;
  },

  daySrc() {
    return `\
<li class='fastmail-calendar-overview-event'>
<h3>
  <%- day.displayDate %>
</h3>
<% each(day.events, function(event) { %>
  ${this.eventSrc()}
<% }); %>
</li>\
`;
  },

  eventSrc() {
    return `\
<div class='event'>
<% if (event.timeString) { %>
  <span class='time'>
    <%- event.timeString %>
  </span>
<% } %>
<%- event.summary %>
<div class='details'>

  <h3>
    <%- event.summary %>
  </h3>

  <% if (event.durationHours) { %>
    <span class='duration'>
      <%- event.durationHours %>
    </span>
  <% } %>

  <% if (event.description) { %>
    <span class='description'>
      <%= event.description %>
    </span>
  <% } %>

  <% if (event.location) { %>
    <span class='location'>
      <%- event.location %>
      <br>
      <a target='_blank' href='http://maps.google.com/maps?f=q&hl=en&iwloc=addr&q=<%- event.location %>'>
        map
      </a>
    </span>
  <% } %>

  <% if (event.calendar) { %>
    <span class='calendar'>
      calendar: <%= event.calendar %>
    </span>
  <% } %>

</div>
</div>\
`;
  },
};
