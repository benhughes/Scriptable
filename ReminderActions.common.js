// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: magic;
const TIME_ENTRIES_URL = 'https://www.toggl.com/api/v8/time_entries';
const START_TIMER_URL = 'https://www.toggl.com/api/v8/time_entries/start';
const CURRENT_TIMER_URL = 'https://www.toggl.com/api/v8/time_entries/current';
const GET_PROJECTS_URL =
  'https://www.toggl.com/api/v8/me?with_related_data=true';
const AUTH_DETAILS = btoa('benhuggy@gmail.com:meatball11');
const NOTIFICATION_CREATED_BY_NAME = 'ReminderActions';

const getStopUrl = id => `https://www.toggl.com/api/v8/time_entries/${id}/stop`;

async function requestToggleData(url, settings = {}) {
  const {headers = {}, body = null, method = 'GET'} = settings;
  try {
    const req = new Request(url);
    req.headers = {
      ...headers,
      Authorization: `Basic ${AUTH_DETAILS}`,
    };

    if (body) {
      req.body = body;
    }

    req.method = method;

    return await req.loadJSON();
  } catch (e) {
    QuickLook.present('Something has gone wrong. \n\n' + e);
    return;
  }
}

async function requestCurrentTimer() {
  return await requestToggleData(CURRENT_TIMER_URL);
}

async function requestStopTimer(id) {
  return await requestToggleData(getStopUrl(id), {method: 'PUT'});
}

async function requestProjects(id) {
  return await requestToggleData(GET_PROJECTS_URL);
}

module.exports = {
  TIME_ENTRIES_URL,
  START_TIMER_URL,
  GET_PROJECTS_URL,
  NOTIFICATION_CREATED_BY_NAME,
  AUTH_DETAILS,

  requestCurrentTimer,
  requestStopTimer,
  requestProjects,
};
