// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: magic;
const moment = importModule('./libs/moment');


const NOTE_ID = 'C29DC9A9-B7DF-46DA-8FD7-8AE9746CC394-11717-000007FC8F36489D';
const overDueListName = 'Overdue';


const priortisedList = getPrioritisedList();
const isDueOrOverDue = (reminder) => moment(reminder.dueDate).isSameOrBefore(moment(), 'day');

const context = await getContext();
console.log(context);
const reminders = await Reminder.allIncomplete();
const filterdReminders = reminders.filter((reminder) => reminder.notes && reminder.notes.includes(context) && (reminder.notes.includes('#now') || isDueOrOverDue(reminder)));

const filterdReminders2 = reminders.filter((reminder) => isDueOrOverDue(reminder))

const filterdRemindersHash = filterdReminders.reduce((obj, reminder) => {
  const {calendar: {title}} = reminder;
  const isOverDue = moment(reminder.dueDate).isBefore(moment(), 'day');
  const name = isOverDue ? overDueListName : title;
  return {
    ...obj,
    [name]: obj[name] ? [
      ...obj[name],
      reminder,
    ] : [reminder]
  }
}, {});

const nonPrioritisedList = Object.keys(filterdRemindersHash).filter((list) => !priortisedList.includes(list) && list !== overDueListName);

console.log(nonPrioritisedList)

const list = [overDueListName, ...priortisedList]
  .filter(listName => filterdRemindersHash[listName])
  .map((list) => {
    const reminders = filterdRemindersHash[list] || [];
    const tasks = reminders.map(({title, dueDate}) => {
      const goodtaskLink = encodeURI(`goodtask3://task?title=${title}`);
      const shortcutLink = encodeURI(`shortcuts://run-shortcut?name=Start 25 minute focused time&input=${title}`);
      let preTask = '';
      let postTask = '';
      if (moment(dueDate).isSame(moment(), 'day')) {
        preTask = '::';
        postTask = '::';
      }
    
    
      return `- ${preTask}${title}${postTask} [Task](${goodtaskLink}) [Start timer](${shortcutLink})`;
  })
  .join('\n');
    
  return `## ${list}
${tasks}
  `;
}).join('\n');

const text = `${moment().format('dddd, MMMM Do YYYY, h:mm a')}

${list}
`

console.log(filterdRemindersHash)
console.log(filterdReminders.length)
console.log(filterdReminders[0])
console.log(text)

const url = new CallbackURL("bear://x-callback-url/add-text")

url.addParameter('text', text);
url.addParameter('id', NOTE_ID);
url.addParameter('mode', 'replace');
url.addParameter('exclude_trashed', 'yes');

await url.open();


function getPrioritisedList() {
  const files = FileManager.iCloud();
  const bookmarkedFilePath = files.bookmarkedPath('projects-prioritised');
  const priortisedListString = files.readString(bookmarkedFilePath)
  return priortisedListString.split('\n');
}

async function getContext() {
  const contexts = ['#work', '#weekend', '#evening'];
  let alert = new Alert();
  alert.title = "Context?"
  alert.message = "Are you sure you want to schedule the notification?"
  contexts.forEach(context => alert.addAction(context))
  const idx = await alert.presentAlert()
  return contexts[idx];
}
