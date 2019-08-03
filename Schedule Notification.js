// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: comment-alt;
const FREQUENCY_DAILY = 'daily';
const FREQUENCY_WEEKLY = 'weekly';

// Select the necessary information for scheduling the notification:
// 1. Name of the script to run.
// 2. Frequency to run the script (daily or weekly)
// 3. If weekly, day of the week to send the notification-
// 4. Time of the day to send the notification.
// 5. The message to show in the notification.
let scriptName = await pickScriptName();
if (scriptName == null) {
  return;
}
let frequency = await pickFrequency();
if (frequency == null) {
  return;
}
let dayOfWeek = null;
if (frequency == FREQUENCY_WEEKLY) {
  dayOfWeek = await pickDayOfWeek();
  if (dayOfWeek == null) {
    return;
  }
}
let timeOfDay = null;
if (frequency == FREQUENCY_DAILY || frequency == FREQUENCY_WEEKLY) {
  timeOfDay = await pickTimeOfDay();
  if (timeOfDay == null) {
    return;
  }
}
let message = await writeMessage();
if (message == null) {
  return;
}
// Show how the notification will look when received.
let demoNotif = createNotification(message, scriptName);
await demoNotif.schedule();
// Ask whether the to schedule the repeating notification.
let shouldSchedule = await confirmSchedule();
if (shouldSchedule == false) {
  return;
}
let notif = createNotification(message, scriptName);
if (frequency == FREQUENCY_DAILY) {
  notif.setDailyTrigger(timeOfDay.hour, timeOfDay.minute, true);
} else if (frequency == FREQUENCY_WEEKLY) {
  notif.setWeeklyTrigger(dayOfWeek, timeOfDay.hour, timeOfDay.minute, true);
}
await notif.schedule();

function createNotification(message, scriptName) {
  let notif = new Notification();
  notif.body = message;
  notif.scriptName = scriptName;
  return notif;
}

async function confirmSchedule() {
  let alert = new Alert();
  alert.title = 'Schedule notification?';
  alert.message = 'Are you sure you want to schedule the notification?';
  alert.addAction('Schedule notification');
  alert.addCancelAction('Do not schedule');
  let idx = await alert.presentAlert();
  if (idx == -1) {
    return false;
  } else {
    return true;
  }
}

async function writeMessage() {
  let alert = new Alert();
  alert.title = 'Write Message';
  alert.message = 'Write the message to show in the notification';
  alert.addTextField('Message');
  alert.addAction('OK');
  alert.addCancelAction('Cancel');
  let idx = await alert.presentAlert();
  let text = alert.textFieldValue(0);
  if (idx == -1) {
    return null;
  } else if (text == null || text.length == 0) {
    return null;
  } else {
    return text;
  }
}

async function pickDayOfWeek() {
  let days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  let alert = new Alert();
  alert.title = 'Select day of week';
  for (day of days) {
    alert.addAction(day);
  }
  alert.addCancelAction('Cancel');
  let idx = await alert.presentAlert();
  if (idx == -1) {
    return null;
  } else {
    return idx;
  }
}

async function pickTimeOfDay() {
  let minuteInterval = 15;
  let times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      times.push({
        hour: h,
        minute: m,
        text: zeroPrefix(h.toString()) + ':' + zeroPrefix(m.toString()),
      });
    }
  }
  let alert = new Alert();
  alert.title = 'Pick time of day';
  for (time of times) {
    alert.addAction(time.text);
  }
  alert.addCancelAction('Cancel');
  let idx = await alert.presentAlert();
  if (idx == -1) {
    return null;
  } else {
    return times[idx];
  }
}

async function pickFrequency() {
  let alert = new Alert();
  alert.title = 'Select Frequency';
  alert.message = 'Frequency to send the notification.';
  alert.addAction('Daily');
  alert.addAction('Weekly');
  alert.addCancelAction('Cancel');
  let idx = await alert.presentAlert();
  if (idx == 0) {
    return FREQUENCY_DAILY;
  } else if (idx == 1) {
    return FREQUENCY_WEEKLY;
  } else {
    return null;
  }
}

async function pickScriptName() {
  let scriptNames = getScriptNames();
  let alert = new Alert();
  alert.title = 'Select Script';
  alert.message =
    'The script can be run by force touching or long pressing on the notification.';
  for (scriptName of scriptNames) {
    alert.addAction(scriptName);
  }
  alert.addCancelAction('Cancel');
  let idx = await alert.presentAlert();
  if (idx == -1) {
    return null;
  } else {
    return scriptNames[idx];
  }
}

function getScriptNames() {
  let fm = FileManager.iCloud();
  let docsDir = fm.documentsDirectory();
  return fm
    .listContents(docsDir)
    .filter(f => {
      return f.endsWith('.js');
    })
    .map(f => {
      let suffix = '.js';
      return f.substr(0, f.length - suffix.length);
    })
    .sort();
}

function zeroPrefix(str) {
  return str.length == 1 ? '0' + str : str;
}
