// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: magic;
const moment = importModule('./libs/moment');
const {
  saveHighlightedProjects,
  loadHighlightedProjects,
  FRONT_BURNER_PROJECT_KEY,
  BACK_BURNER_PROJECT_KEY,
} = importModule('./BurnerList.common');

const reminderLists = await Calendar.forReminders();
const reminderListSorted = reminderLists.sort((a, b) => a.title > b.title);
const highlightedProjects = loadHighlightedProjects();

const frontAlert = new Alert();
frontAlert.title = 'Choose the front burner';
frontAlert.message = `Your current lists are: \n Front Burner: ${highlightedProjects[FRONT_BURNER_PROJECT_KEY]} \n Back Burner: ${highlightedProjects[BACK_BURNER_PROJECT_KEY]}`;

const backAlert = new Alert();
backAlert.title = 'Choose the back burner';

const suitableChoices = [];

for (list of reminderListSorted) {
  const reminders = await Reminder.allIncomplete([list]);
  const remindersNow = reminders.filter(
    reminder =>
      (reminder.notes && reminder.notes.includes('#now')) ||
      isDueOrOverDue(reminder)
  );
  if (remindersNow.length > 0) {
    let preTitle = '';
    if (list.title === highlightedProjects[FRONT_BURNER_PROJECT_KEY]) {
      preTitle = '🔴⚫️ ';
    } else if (list.title === highlightedProjects[BACK_BURNER_PROJECT_KEY]) {
      preTitle = '⚫️🔴 ';
    }
    suitableChoices.push(list);
    frontAlert.addAction(`${preTitle}${list.title} (${remindersNow.length})`);
    backAlert.addAction(`${preTitle}${list.title} (${remindersNow.length})`);
  }
}

const frontBurnerChoice = await frontAlert.present();
backAlert.message = `Your front list is: ${suitableChoices[frontBurnerChoice].title}`;
const backBurnerChoice = await backAlert.present();

const confirmationAlert = new Alert();
confirmationAlert.title = 'Happy with your descision?';
confirmationAlert.message = `You choose: \n Front Burner: ${suitableChoices[frontBurnerChoice].title} \n Back Burner: ${suitableChoices[backBurnerChoice].title}`;
confirmationAlert.addAction("Yes I'm happy");
confirmationAlert.addCancelAction('Cancel');

const confirmationChoice = await confirmationAlert.presentAlert();

if (confirmationChoice > -1) {
  saveHighlightedProjects({
    [FRONT_BURNER_PROJECT_KEY]: suitableChoices[frontBurnerChoice].title,
    [BACK_BURNER_PROJECT_KEY]: suitableChoices[backBurnerChoice].title,
  });
}

if (args.queryParameters['x-success']) {
  Safari.open(args.queryParameters['x-success']);
}
Script.complete();

function isDueOrOverDue(reminder) {
  return moment(reminder.dueDate).isSameOrBefore(moment(), 'day');
}
