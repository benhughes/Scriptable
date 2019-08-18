// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: magic;
const moment = importModule('./libs/moment');

const INTERVALS = 25;
const TIME_ENTRIES_URL = 'https://www.toggl.com/api/v8/time_entries';
const START_TIMER_URL = 'https://www.toggl.com/api/v8/time_entries/start';
const GET_PROJECTS_URL =
  'https://www.toggl.com/api/v8/me?with_related_data=true';
const auth = btoa('benhuggy@gmail.com:meatball11');
const CREATED_BY_NAME = 'ReminderActions';

const actions = [
  {
    displayName: 'start new timer?',
    actions: [startTimer, scheduleNotification],
  },
];

const reminderName =
  args.queryParameters.name || 'Make MP3 of blade runner/rain/apollo';

const reminders = await Reminder.allIncomplete();

await displayReminder();

async function displayReminder() {
  const foundReminder = reminders.find(r => r.title === reminderName);
  if (!foundReminder) {
    const notFoundAlert = new Alert();
    notFoundAlert.title = `${reminderName} Not found`;
    await notFoundAlert.presentAlert();
    return;
  }

  const alert = new Alert();
  alert.title = foundReminder.title;
  alert.message = `
Project: ${foundReminder.calendar.title}
notes: ${foundReminder.notes}

`;

  actions.forEach(action => alert.addAction(action.displayName));

  alert.addCancelAction('Cancel');

  const selectedIndex = await alert.presentAlert();

  if (selectedIndex >= 0) {
    for (let i = 0; i < actions[selectedIndex].actions.length; i++) {
      await actions[selectedIndex].actions[i](foundReminder);
    }
  }
}

async function getProjects() {
  try {
    const req = new Request(GET_PROJECTS_URL);
    req.headers = {
      Authorization: `Basic ${auth}`,
    };

    const startResult = await req.loadJSON();
    return startResult.data.projects.reduce(
      (projects, project) => ({
        ...projects,
        [project.name]: project.id,
      }),
      {}
    );
  } catch (e) {
    QuickLook.present('Something has gone wrong. \n\n' + e);
    return;
  }
}

async function startTimer(reminder) {
  const projects = await getProjects();
  console.log(projects);
  const pid = projects[reminder.calendar.title];
  const body = {
    time_entry: {
      pid,
      description: reminder.title,
      created_with: 'scriptable',
    },
  };

  try {
    const req = new Request(START_TIMER_URL);
    req.headers = {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    };
    req.method = 'POST';
    req.body = JSON.stringify(body);

    const startResult = await req.loadJSON();
    console.log(startResult);
  } catch (e) {
    QuickLook.present('Something has gone wrong. \n\n' + e);
    return;
  }
}

async function removeNotificationsCreatedByScript(notificationsList) {
  const notificationsCreatedByScript = notificationsList.filter(
    n => n.userInfo.createdBy === CREATED_BY_NAME
  );

  for (let i = 0; i < notificationsCreatedByScript.length; i++) {
    console.log(notificationsCreatedByScript[i]);
    await notificationsCreatedByScript[i].remove();
  }
}

async function scheduleNotification(reminder) {
  console.log('scheduling notification');
  const allPending = await Notification.allPending();
  const allDelivered = await Notification.allDelivered();
  console.log('All Pending');
  console.log(allPending);

  await removeNotificationsCreatedByScript(allPending);
  await removeNotificationsCreatedByScript(allDelivered);

  const startNotification = new Notification();
  startNotification.body = `Started timer for: ${reminder.title}`;
  startNotification.userInfo = {createdBy: CREATED_BY_NAME};
  startNotification.addAction(
    'Start it again?',
    'scriptable:///run?scriptName=ReminderActions',
    false
  );
  await startNotification.schedule();

  const notification = new Notification();
  notification.body = `Are you still working on task: ${reminder.title}?`;
  notification.userInfo = {createdBy: CREATED_BY_NAME};
  notification.addAction(
    'Start it again?',
    'scriptable:///run?scriptName=ReminderActions',
    false
  );
  const triggerDate = moment().add(INTERVALS, 'minutes');
  notification.setTriggerDate(triggerDate.toDate());
  await notification.schedule();
}
