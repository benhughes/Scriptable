// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: magic;
const {getProjectSettings} = importModule('./ProjectSettings');

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
    id: 'work-shallow',
    displayName: 'Work Shallow Tasks',
    tag: '#work',
    secondaryTags: ['#type-shallow'],
    highlightBookmark: 'punchlist-highlight',
    fileBookmark: 'punchlist-work-shallow',
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

async function updatePunchlists() {
  const reminders = await Reminder.allIncomplete();
  const projectSettings = await getProjectSettings();

  contexts.forEach(context => {
    console.log(`Generating punchlist for ${context.displayName}`);

    overwriteScript(
      context,
      generatePunchlistMarkdown(context, reminders, projectSettings)
    );
    console.log(`Generation complete for ${context.displayName}`);
  });
}

await updatePunchlists();

function generatePunchlistMarkdown(context, reminders, projectSettings) {
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

    let name = title;
    if (isOverDue) {
      name = overDueListName;
    } else if (isToday) {
      name = todayListName;
    }
    return {
      ...obj,
      [name]: obj[name] ? [...obj[name], reminder] : [reminder],
    };
  }, {});

  const prioritisedList = Object.values(projectSettings)
    .sort((a, b) => a.priority < b.priority)
    .map(l => l.name);

  const list = [overDueListName, todayListName, oldListName, ...prioritisedList]
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
