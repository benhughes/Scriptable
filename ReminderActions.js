// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: magic;
const moment = importModule('./libs/moment');
const {
  TIME_ENTRIES_URL,
  START_TIMER_URL,
  GET_PROJECTS_URL,
  NOTIFICATION_CREATED_BY_NAME,
  AUTH_DETAILS,
  requestProjects,
} = importModule('./ReminderActions.common');
const updatePunchlists = importModule('./updatePunchLists');

const INTERVALS = 25;
const FOCUS_TAG = '#focus';

const actions = [
  {
    displayName: 'start new timer?',
    actions: [startTimer, openPostTimerShortcut],
  },
  {
    displayName: 'Toggle focus',
    actions: [focusReminder, updatePunchlists],
  },
  {
    displayName: reminder =>
      reminder.isCompleted ? 'Make Active' : 'Complete Task',
    actions: [toggleCompleteTask, updatePunchlists],
  },
  {
    displayName: 'Show in goodtasks',
    actions: [showInGoodtasks],
  },
  {
    displayName: 'Open URL',
    visible: hasURL,
    actions: [openURL],
  },
];

const reminderName =
  args.queryParameters.name || 'Buy a Autumn/Winter New Jacket';

const reminders = await Reminder.allIncomplete();

const foundReminder = reminders.find(r => r.title === reminderName);

const filteredActions = actions.filter(a =>
  typeof a.visible === 'function' ? a.visible(foundReminder) : true
);

while (true) {
  const selectedIndex = await displayReminder(foundReminder, filteredActions);

  if (selectedIndex >= 0) {
    await handleAction(actions[selectedIndex], foundReminder);
  } else {
    break;
  }
}

await updatePunchlists();

if (args.queryParameters['x-success']) {
  Safari.open(args.queryParameters['x-success']);
}
Script.complete();

function getURL(text) {
  return text && text.match(/(\S{1,})(:\/\/)(\S{1,})/g);
}

function getURLsFromReminder(reminder) {
  const notesURLs = getURL(reminder.notes) || [];
  const titleURLs = getURL(reminder.title) || [];
  return [...notesURLs, ...titleURLs];
}

function hasURL(reminder) {
  return getURLsFromReminder(reminder).length > 0;
}

async function displayReminder(foundReminder, actions) {
  if (!foundReminder) {
    const notFoundAlert = new Alert();
    notFoundAlert.title = `${reminderName} Not found`;
    await notFoundAlert.presentAlert();
    return -1;
  }

  const alert = new Alert();
  alert.title = foundReminder.title;
  alert.message = `
Project: ${foundReminder.calendar.title}
notes: ${foundReminder.notes}
`;

  actions.forEach(action =>
    alert.addAction(
      typeof action.displayName === 'function'
        ? action.displayName(foundReminder)
        : action.displayName
    )
  );

  alert.addCancelAction('Cancel');

  return await alert.presentAlert();
}

async function handleAction(action, foundReminder) {
  for (let i = 0; i < action.actions.length; i++) {
    await action.actions[i](foundReminder);
  }
}

async function getProjects() {
  const startResult = await requestProjects();
  return startResult.data.projects.reduce(
    (projects, project) => ({
      ...projects,
      [project.name]: project.id,
    }),
    {}
  );
}

async function startTimer(reminder) {
  const projects = await getProjects();
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
      Authorization: `Basic ${AUTH_DETAILS}`,
      'Content-Type': 'application/json',
    };
    req.method = 'POST';
    req.body = JSON.stringify(body);

    const startResult = await req.loadJSON();

    scheduleNotification(reminder, startResult.data.id);
  } catch (e) {
    QuickLook.present('Something has gone wrong. \n\n' + e);
    return;
  }
}

async function removeNotificationsCreatedByScript(notificationsList) {
  const notificationsCreatedByScript = notificationsList.filter(
    n => n.userInfo.createdBy === NOTIFICATION_CREATED_BY_NAME
  );

  for (let i = 0; i < notificationsCreatedByScript.length; i++) {
    await notificationsCreatedByScript[i].remove();
  }
}

async function scheduleNotification(reminder, timerId) {
  console.log('scheduling notification');
  const userInfo = {
    createdBy: NOTIFICATION_CREATED_BY_NAME,
    reminderId: reminder.id,
    timerId,
  };
  const allPending = await Notification.allPending();
  const allDelivered = await Notification.allDelivered();
  console.log('All Pending');
  console.log(allPending);

  await removeNotificationsCreatedByScript(allPending);
  await removeNotificationsCreatedByScript(allDelivered);

  const startNotification = new Notification();
  startNotification.body = `Started timer for: ${reminder.title}`;
  startNotification.userInfo = userInfo;
  startNotification.addAction(
    'Start it again?',
    'scriptable:///run?scriptName=ReminderActions',
    false
  );

  startNotification.addAction(
    'Stop',
    'scriptable:///run?scriptName=ReminderActions.stopTimer',
    false
  );

  await startNotification.schedule();

  const delayedNotification = new Notification();
  delayedNotification.body = `Are you still working on task: ${reminder.title}?`;
  delayedNotification.userInfo = userInfo;
  delayedNotification.addAction(
    'Start it again?',
    'scriptable:///run?scriptName=ReminderActions',
    false
  );
  delayedNotification.addAction(
    'Stop',
    'scriptable:///run?scriptName=ReminderActions.stopTimer',
    false
  );

  const triggerDate = moment().add(INTERVALS, 'minutes');
  delayedNotification.setTriggerDate(triggerDate.toDate());
  await delayedNotification.schedule();
}

async function focusReminder(reminder) {
  if (reminder.notes.includes(FOCUS_TAG + '')) {
    reminder.notes = reminder.notes.replace(FOCUS_TAG + ' ', '');
  } else {
    reminder.notes = FOCUS_TAG + ' ' + reminder.notes;
  }
  reminder.save();
}

async function showInGoodtasks(reminder) {
  const encodedTitle = encodeURIComponent(reminder.title);
  const goodtaskLink = `goodtask3://task?title=${encodedTitle}`;
  Safari.open(goodtaskLink);
}

async function openURL(reminder) {
  const URLsToOpen = getURL(reminder.notes) || getURL(reminder.title);
  if (URLsToOpen.length > 1) {
    const alert = new Alert();
    alert.title = 'Which URL shall we open';

    URLsToOpen.forEach(url => alert.addAction(url));
    const chosenIndex = await alert.presentAlert();
    Safari.open(URLsToOpen[chosenIndex]);
  } else {
    Safari.open(URLsToOpen[0]);
  }
}

async function openPostTimerShortcut() {
  const callback = new CallbackURL('shortcuts://run-shortcut');
  callback.addParameter('name', 'Post Timer');
  await callback.open();
}

async function toggleCompleteTask(reminder) {
  reminder.isCompleted = !reminder.isCompleted;
  reminder.save();
}
