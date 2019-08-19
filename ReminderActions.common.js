// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: magic;
const TIME_ENTRIES_URL = 'https://www.toggl.com/api/v8/time_entries';
const START_TIMER_URL = 'https://www.toggl.com/api/v8/time_entries/start';
const GET_PROJECTS_URL =
  'https://www.toggl.com/api/v8/me?with_related_data=true';
const AUTH_DETAILS = btoa('benhuggy@gmail.com:meatball11');
const NOTIFICATION_CREATED_BY_NAME = 'ReminderActions';

const getStopUrl = (id) => `https://www.toggl.com/api/v8/time_entries/${id}/stop`;

module.exports = {
  TIME_ENTRIES_URL,
  START_TIMER_URL,
  GET_PROJECTS_URL,
  NOTIFICATION_CREATED_BY_NAME,
  AUTH_DETAILS,
  
  getStopUrl,
}