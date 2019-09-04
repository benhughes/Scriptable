// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: magic;
const moment = importModule('./libs/moment');

const overDueListName = 'Overdue';
const todayListName = 'Today';
const oldListName = 'Week or more old';
const focusTag = '#focus';

const contexts = [
  {
    id: 'work',
    displayName: 'Work',
    tag: '#work',
    highlightBookmark: 'punchlist-highlight',
    fileBookmark: 'punchlist-work',
  },
  {
    id: 'work-deep',
    displayName: 'Deep Work',
    tag: '#work',
    secondaryTags: ['#type-deep'],
    highlightBookmark: 'punchlist-highlight',
    fileBookmark: 'punchlist-work-deep',
  },
  {
    id: 'work-small',
    displayName: 'Work Small Tasks',
    tag: '#work',
    secondaryTags: ['#type-small'],
    highlightBookmark: 'punchlist-highlight',
    fileBookmark: 'punchlist-work-small',
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

async function updatePunchlists() {
  const reminders = await Reminder.allIncomplete();

  contexts.forEach(context => {
    console.log(`Generating punchlist for ${context.displayName}`);
    overwriteScript(context, generatePunchlistMarkdown(context, reminders));
    console.log(`Generation complete for ${context.displayName}`);
  });
}

function generatePunchlistMarkdown(context, reminders) {
  const filteredReminders = reminders
    .filter(
      reminder =>
        reminder.notes &&
        ![context.tag, ...(context.secondaryTags || [])].some(
          tag => !reminder.notes.includes(tag)
        ) &&
        (reminder.notes.includes('#now') || isDueOrOverDue(reminder))
    )
    .sort((a, b) =>
      moment(a.dueDate || threeDaysTime).diff(
        moment(b.dueDate || threeDaysTime)
      )
    );

  const focusReminders = filteredReminders.filter(r =>
    r.notes.includes(focusTag)
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
      list !== todayListName &&
      list !== oldListName
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
        .map(({title, calendar, notes}) =>
          parseSingleReminder({
            title,
            notes,
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

  const topActions = [
    '[Update](scriptable:///run?scriptName=PunchlistIA&x-success=iawriter://)',
    '[Stop Timer](scriptable:///run?scriptName=ReminderActions.stopTimer&x-success=iawriter://)',
    `[Add a todo](shortcuts://run-shortcut?name=${encodeURIComponent(
      'Add a Todo from IA Writer'
    )}&input=${encodeURIComponent(context.tag)})`,
  ];

  return `# ${context.displayName}
- ${moment().format('dddd, MMMM Do YYYY, h:mm a')} | ${
    filteredReminders.length
  } items 
- [ ${topActions.join(' | ')} ]

${parseFocusedReminders(focusReminders)}
${list}
`;
}

function isDueOrOverDue(reminder) {
  return moment(reminder.dueDate).isSameOrBefore(moment(), 'day');
}

function overwriteScript(context, newContent) {
  const bookmarkedFilePath = files.bookmarkedPath(context.fileBookmark);
  return files.writeString(bookmarkedFilePath, newContent);
}

function parseSingleReminder({
  title,
  listName = '',
  showList = false,
  notes = '',
}) {
  const encodedTitle = encodeURIComponent(title);
  const url = notes.match(/(\S{1,})(:\/\/)(\S{1,})/g);
  const preTask = '';
  let postTask = '';
  if (showList) {
    postTask += ` (${listName})`;
  }

  const actions = [
    `[Actions](scriptable:///run?scriptName=ReminderActions&name=${encodedTitle}&x-success=iawriter://)`,
    ...(url ? [`[Url](${url[0]})`] : []),
  ];

  return `- [ ] ${preTask}${title}${postTask} [${actions.join(' | ')}]`;
}

function getPrioritisedList() {
  const bookmarkedFilePath = files.bookmarkedPath('projects-prioritised');
  const prioritisedListString = files.readString(bookmarkedFilePath);
  return prioritisedListString.split('\n');
}

function parseFocusedReminders(focusReminders) {
  const focusList = focusReminders
    .map(({title, calendar, notes}) =>
      parseSingleReminder({
        title,
        notes,
        listName: calendar.title,
        showList: true,
      })
    )
    .join('\n');

  return focusReminders.length > 0
    ? `## Focus
${focusList}

`
    : '';
}

module.exports = {
  updatePunchlists,
  generatePunchlistMarkdown,
};
