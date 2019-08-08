// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: magic;
const moment = importModule('./libs/moment');

const files = FileManager.iCloud();

const NOTE_ID = 'C29DC9A9-B7DF-46DA-8FD7-8AE9746CC394-11717-000007FC8F36489D';
const overDueListName = 'Overdue';

const prioritisedList = getPrioritisedList();
const isDueOrOverDue = reminder =>
  moment(reminder.dueDate).isSameOrBefore(moment(), 'day');

const context = await getContext();
console.log(context);
const reminders = await Reminder.allIncomplete();
const filteredReminders = reminders.filter(
  reminder =>
    reminder.notes &&
    reminder.notes.includes(context) &&
    (reminder.notes.includes('#now') || isDueOrOverDue(reminder))
);

const filteredReminders2 = reminders.filter(reminder =>
  isDueOrOverDue(reminder)
);

const filteredRemindersHash = filteredReminders.reduce((obj, reminder) => {
  const {
    calendar: {title},
  } = reminder;
  const isOverDue = moment(reminder.dueDate).isBefore(moment(), 'day');
  const name = isOverDue ? overDueListName : title;
  return {
    ...obj,
    [name]: obj[name] ? [...obj[name], reminder] : [reminder],
  };
}, {});

const nonPrioritisedList = Object.keys(filteredRemindersHash).filter(
  list => !prioritisedList.includes(list) && list !== overDueListName
);

console.log(nonPrioritisedList);

const list = [overDueListName, ...prioritisedList, ...nonPrioritisedList]
  .filter(listName => filteredRemindersHash[listName])
  .map(list => {
    const reminders = filteredRemindersHash[list] || [];
    const tasks = reminders
      .map(({title, dueDate}) => parseSingleReminder({title, dueDate}))
      .join('\n');

    return `## ${list}
${tasks}
  `;
  })
  .join('\n');

const highlightedTasks = getHighlightedTasks();

const text = `${moment().format('dddd, MMMM Do YYYY, h:mm a')}

${parseHighlightedTasks(highlightedTasks)}
${list}
`;

const url = new CallbackURL('bear://x-callback-url/add-text');

url.addParameter('text', text);
url.addParameter('id', NOTE_ID);
url.addParameter('mode', 'replace');
url.addParameter('exclude_trashed', 'yes');

await url.open();

if (args.queryParameters['x-success']) {
  Safari.open(args.queryParameters['x-success']);
}
Script.complete();

function parseSingleReminder({title, dueDate = false, isHighlighted = false}) {
  const goodtaskLink = encodeURI(`goodtask3://task?title=${title}`);
  const shortcutLink = encodeURI(
    `shortcuts://run-shortcut?name=Start 25 minute focused time&input=${title}`
  );
  const highlightLink = encodeURI(
    `shortcuts://run-shortcut?name=Punchlist Highlight Task&input=${title}`
  );
  let preTask = '';
  let postTask = '';
  if (dueDate && moment(dueDate).isSame(moment(), 'day')) {
    preTask = '::';
    postTask = '::';
  }

  const actions = [
    `[Task](${goodtaskLink})`,
    `[Start timer](${shortcutLink})`,
    ...(isHighlighted ? [] : [`[Highlight](${highlightLink})`]),
  ];

  return `- ${preTask}${title}${postTask} ${actions.join(' ')}`;
}

function getPrioritisedList() {
  const bookmarkedFilePath = files.bookmarkedPath('projects-prioritised');
  const prioritisedListString = files.readString(bookmarkedFilePath);
  return prioritisedListString.split('\n');
}

function parseHighlightedTasks(highlightedTasks) {
  const highlightLink = encodeURI(
    `shortcuts://run-shortcut?name=Punchlist Clear Highlights`
  );
  const list = highlightedTasks
    .map(text => parseSingleReminder({title: text, isHighlighted: true}))
    .join('\n');
  return list.length > 0
    ? `## Highlighted
[Clear](${highlightLink})
${list}  
`
    : '';
}

function getHighlightedTasks() {
  const bookmarkedFilePath = files.bookmarkedPath('punchlist-highlight');
  const highlightedTaskObj = JSON.parse(files.readString(bookmarkedFilePath));
  return highlightedTaskObj.items;
}

async function getContext() {
  const contexts = ['#work', '#weekend', '#evening'];
  let alert = new Alert();
  alert.title = 'Context?';
  alert.message = 'Are you sure you want to schedule the notification?';
  contexts.forEach(context => alert.addAction(context));
  const idx = await alert.presentAlert();
  return contexts[idx];
}
