// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: magic;
const {
  loadHighlightedProjects,
  FRONT_BURNER_PROJECT_KEY,
  BACK_BURNER_PROJECT_KEY,
} = importModule('./BurnerList.common');

const highlightedProjects = loadHighlightedProjects();

const frontBurnerName = highlightedProjects[FRONT_BURNER_PROJECT_KEY];
const backBurnerName = highlightedProjects[BACK_BURNER_PROJECT_KEY];
const kitchenSinkName = 'Kitchen Sink';

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
];

const threeDaysTime = moment().add(3, 'days');

const files = FileManager.iCloud();

await updatePunchlists();

if (args.queryParameters['x-success']) {
  Safari.open(args.queryParameters['x-success']);
}
Script.complete();

async function updatePunchlists() {
  const reminders = await Reminder.allIncomplete();

  contexts.forEach(context => {
    console.log(`Generating punchlist for ${context.displayName}`);
    overwriteScript(generatePunchlistMarkdown(context, reminders));
    console.log(`Generation complete for ${context.displayName}`);
  });
}

function parseTaskList(list, showList = false) {
  return list.map(reminder =>
    parseSingleReminder({
      reminder,
      showList,
    })
  );
}

function generatePunchlistMarkdown(context, reminders) {
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

  const filteredRemindersHash = filteredReminders.reduce((obj, reminder) => {
    const {
      calendar: {title},
    } = reminder;

    let name = title;
    if (title !== frontBurnerName && title !== backBurnerName) {
      name = kitchenSinkName;
    }

    return {
      ...obj,
      [name]: obj[name] ? [...obj[name], reminder] : [reminder],
    };
  }, {});

  const JOIN_ITEM = '<br />';

  const frontList = parseTaskList(filteredRemindersHash[frontBurnerName]);
  const backList = parseTaskList(filteredRemindersHash[backBurnerName]);
  const kitchenSinkList = parseTaskList(
    filteredRemindersHash[kitchenSinkName],
    true
  );

  const secondCol = [
    backList.join(JOIN_ITEM),
    '<br />',
    `**${kitchenSinkName}**`,
    kitchenSinkList.join(JOIN_ITEM),
  ].join('<br />');

  const topActions = [
    '[Update](scriptable:///run?scriptName=BurnerList&x-success=iawriter://)',
    '[Stop Timer](scriptable:///run?scriptName=ReminderActions.stopTimer&x-success=iawriter://)',
    `[Add a todo](shortcuts://run-shortcut?name=${encodeURIComponent(
      'Add a Todo from IA Writer'
    )}&input=${encodeURIComponent(context.tag)})`,
  ];

  return `- ${moment().format(
    'dddd, MMMM Do YYYY, h:mm a'
  )} | [ ${topActions.join(' | ')} ]

  
|${frontBurnerName} *(${frontList.length})*|${backBurnerName} *(${
    backList.length
  })*|
|:-----------------|:----------------|
|${frontList.join(JOIN_ITEM)}|${backList.join(JOIN_ITEM)}|
||**${kitchenSinkName}** *(${
    kitchenSinkList.length
  })*<br /> ${kitchenSinkList.join(JOIN_ITEM)}|
`;
}

function isDueOrOverDue(reminder) {
  return moment(reminder.dueDate).isSameOrBefore(moment(), 'day');
}

function overwriteScript(newContent) {
  console.log(newContent);
  const bookmarkedFilePath = files.bookmarkedPath('burner-list');
  return files.writeString(bookmarkedFilePath, newContent);
}

function parseSingleReminder({
  reminder: {title, dueDate, calendar, creationDate, notes},
  showList = false,
}) {
  const encodedTitle = encodeURIComponent(title);
  const url = notes.match(/(\S{1,})(:\/\/)(\S{1,})/g);
  const isOverDue = moment(dueDate).isBefore(moment(), 'day');
  const isToday = moment(dueDate).isSame(moment(), 'day');
  const isOld = moment(creationDate).isBefore(moment().subtract(7, 'days'));

  let preTask = '';
  let postTask = '';

  if (showList) {
    postTask += ` *(${calendar.title})*`;
  }

  if (isOverDue) {
    preTask = '❗️';
  } else if (isToday) {
    preTask = '🔜';
  } else if (isOld) {
    preTask = '🕢';
  }

  const actions = [
    `[Actions](scriptable:///run?scriptName=ReminderActions&name=${encodedTitle}&x-success=iawriter://)`,
    ...(url ? [`[Url](${url[0]})`] : []),
  ];

  return `» ${preTask}${title}${postTask} [${actions.join(' | ')}]`;
}
