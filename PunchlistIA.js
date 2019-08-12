// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: magic;
const moment = importModule('./libs/moment');

const NOTE_ID = 'C29DC9A9-B7DF-46DA-8FD7-8AE9746CC394-11717-000007FC8F36489D';
const overDueListName = 'Overdue';
const todayListName = 'Today';
const oldListName = 'Week or more old';
const contexts = [
  {
    id: 'work',
    displayName: 'Work',
    tag: '#work',
    highlightBookmark: 'punchlist-highlight',
    fileBookmark: 'punchlist-work',
  },
  {
    id: 'evening',
    displayName: 'Evening',
    tag: '#evening',
    highlightBookmark: 'punchlist-highlight',
    fileBookmark: 'punchlist-evening',
  },
  {
    id: 'weekend',
    displayName: 'Weekend',
    tag: '#weekend',
    highlightBookmark: 'punchlist-highlight',
    fileBookmark: 'punchlist-weekend',
  },
  {
    id: 'lunch',
    displayName: 'Lunch',
    tag: '#lunch',
    highlightBookmark: 'punchlist-highlight',
    fileBookmark: 'punchlist-lunch',
  },
  {
    id: 'morning',
    displayName: 'Morning',
    tag: '#morning',
    highlightBookmark: 'punchlist-highlight',
    fileBookmark: 'punchlist-morning',
  },
];

const threeDaysTime = moment().add(3, 'days');

const files = FileManager.iCloud();
const prioritisedList = getPrioritisedList();

const reminders = await Reminder.allIncomplete();

contexts.forEach(context => {
  console.log(`Generating punchlist for ${context.displayName}`);
  const filteredReminders = reminders
    .filter(
      reminder =>
        reminder.notes &&
        reminder.notes.includes(context.tag) &&
        (reminder.notes.includes('#now') || isDueOrOverDue(reminder))
    )
    .sort((a, b) =>
      moment(a.dueDate || threeDaysTime).diff(
        moment(b.dueDate || threeDaysTime)
      )
    );

  const filteredReminders2 = reminders.filter(reminder =>
    isDueOrOverDue(reminder)
  );

  const filteredRemindersHash = filteredReminders.reduce((obj, reminder) => {
    const {
      calendar: {title},
    } = reminder;
    const isOverDue = moment(reminder.dueDate).isBefore(moment(), 'day');
    const isToday = moment(reminder.dueDate).isSame(moment(), 'day');
    const isOld = moment(reminder.creationDate).isBefore(
      moment().subtract(7, 'days')
    );

    let name = title;
    if (isOverDue) {
      name = overDueListName;
    } else if (isToday) {
      name = todayListName;
    } else if (isOld) {
      name = oldListName;
    }
    return {
      ...obj,
      [name]: obj[name] ? [...obj[name], reminder] : [reminder],
    };
  }, {});

  const nonPrioritisedList = Object.keys(filteredRemindersHash).filter(
    list =>
      !prioritisedList.includes(list) &&
      list !== overDueListName &&
      list !== todayListName
  );

  const list = [
    overDueListName,
    todayListName,
    oldListName,
    ...prioritisedList,
    ...nonPrioritisedList,
  ]
    .filter(listName => filteredRemindersHash[listName])
    .map(list => {
      const reminders = filteredRemindersHash[list] || [];
      const tasks = reminders
        .map(({title, calendar}) =>
          parseSingleReminder({
            title,
            listName: calendar.title,
            showList: [todayListName, overDueListName, oldListName].includes(
              list
            ),
          })
        )
        .join('\n');

      return `## ${list}
/project-notes/${list}.txt

${tasks}
  `;
    })
    .join('\n');

  const highlightedTasks = getHighlightedTasks();

  const text = `# ${context.displayName}
- ${moment().format('dddd, MMMM Do YYYY, h:mm a')} | ${
    filteredReminders.length
  } items | [Update](scriptable:///run?scriptName=PunchlistIA&x-success=iawriter://) | [Add a todo](shortcuts://run-shortcut?name=Add%20a%20Todo%20from%20IA%20Writer)

${parseHighlightedTasks(highlightedTasks)}
${list}
`;

  overwriteScript(context, text);
  console.log(`Generation complete for ${context.displayName}`);
});

if (args.queryParameters['x-success']) {
  Safari.open(args.queryParameters['x-success']);
}
Script.complete();

function isDueOrOverDue(reminder) {
  return moment(reminder.dueDate).isSameOrBefore(moment(), 'day');
}

function overwriteScript(context, newContent) {
  const bookmarkedFilePath = files.bookmarkedPath(context.fileBookmark);
  const highlightedTaskObj = files.readString(bookmarkedFilePath);
  return files.writeString(bookmarkedFilePath, newContent);
}

function parseSingleReminder({
  title,
  listName = '',
  showList = false,
  dueDate = false,
  isHighlighted = false,
}) {
  const goodtaskLink = encodeURI(`goodtask3://task?title=${title}`);
  const shortcutLink = encodeURI(
    `shortcuts://run-shortcut?name=Start 25 minute focused time&input=${title}`
  );
  const highlightLink = encodeURI(
    `shortcuts://run-shortcut?name=Punchlist Highlight Task&input=${title}`
  );
  let preTask = '';
  let postTask = '';
  if (showList) {
    postTask += ` (${listName})`;
  }

  const actions = [
    `[Task](${goodtaskLink})`,
    `[Timer](${shortcutLink})`,
    ...(isHighlighted ? [] : [`[Highlight](${highlightLink})`]),
  ];

  return `- [ ] ${preTask}${title}${postTask} ${actions.join(' | ')}`;
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
