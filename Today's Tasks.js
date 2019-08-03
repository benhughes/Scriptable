// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: magic;
const parse = importModule('taskpaper');

const TEST_DATA = importModule('taskpaper_testdata');

const BUTTON_WIDTH = 5;
const TEXT_LENGTH = 80 - BUTTON_WIDTH * (4 + 1);

const parsedTodos = parse(TEST_DATA);

let data = {
  1: null,
  2: null,
  3: null,
  displayRemoveButton: false,
  watch: [],
  hiddenTodos: [],
  todos: parsedTodos,
};

const table = new UITable();

const updateData = (newState = data) => {
  data = {
    ...data,
    ...newState,
  };
  updateTable();
  table.reload();
};

const getData = new Alert();
getData.message = 'Paste everything from omnifocus';
getData.title = 'Paste';
getData.addTextField('paste from OmniFocus');
getData.addAction('OK');
await getData.presentAlert();
const todoInput = getData.textFieldValue(0);
console.log(todoInput);

// parseTodos(getData.textFieldValue(0));
// parseTodos(TEST_DATA);

updateTable({
  todos: todoInput ? parse(todoInput) : parsedTodos,
});
table.present();

function removeTodo(i) {
  updateData({
    hiddenTodos: [...data.hiddenTodos, i],
  });
}

function toggleDisplayRemoveButton() {
  updateData({
    displayRemoveButton: !data.displayRemoveButton,
  });
}

function toggleData(type, value) {
  let newWatch = data.watch;
  if (data.watch.includes(value)) {
    console.log(data.watch.splice(data.watch.indexOf(value), 1));
    const watchIndexOf = data.watch.indexOf(value);
    newWatch = data.watch.filter(x => x !== value);
    console.log('newWatch');

    console.log(newWatch);
  } else if (type === 'watch') {
    newWatch = [...data.watch, value];
  }

  updateData({
    ...data,
    1: data[1] === value ? null : type === '1' ? value : data[1],
    2: data[2] === value ? null : type === '2' ? value : data[2],
    3: data[3] === value ? null : type === '3' ? value : data[3],
    watch: newWatch,
  });
}

function generateClearList() {
  const channel1 = data[1] ? `1️⃣ - ${data.todos.children[data[1]].value}` : '';
  return [
    ...(data[1] ? [`1️⃣ - ${data.todos.children[data[1]].value}`] : []),
    ...(data[2] ? [`2️⃣ - ${data.todos.children[data[2]].value}`] : []),
    ...(data[3] ? [`3️⃣ - ${data.todos.children[data[3]].value}`] : []),
    ...data.watch.map(idx => `👀 - ${data.todos.children[idx].value}`),
  ].join(',');
}

function updateTable() {
  console.log(parsedTodos.children);
  table.removeAllRows();

  table.showSeparators = true;

  const topRow = new UITableRow();
  topRow.height = 60;
  topRow.cellSpacing = 10;
  topRow.isHeader = true;
  const topRowText = topRow.addText(`Choose a Task`);
  topRowText.widthWeight = 85;

  const displayRemoveButton = topRow.addButton('❌');
  displayRemoveButton.widthWeight = BUTTON_WIDTH + 2;
  displayRemoveButton.onTap = () => toggleDisplayRemoveButton();
  displayRemoveButton.centerAligned();

  const debugMode = topRow.addButton('🐞');
  debugMode.widthWeight = BUTTON_WIDTH + 2;
  debugMode.onTap = () => {
    QuickLook.present('Debug Mode \n' + JSON.stringify(data, null, 2));
  };
  debugMode.centerAligned();

  const allDone = topRow.addButton('👍');
  allDone.widthWeight = BUTTON_WIDTH + 2;
  allDone.onTap = () => {
    //     FileManager.iCloud().writeString(FileManager.iCloud().bookmarkedPath('today.json'), JSON.stringify(data, null, 2));
    // ?listName=[[listname]]&listPosition=&tasks=[[tasklist]]&listPosition=bottom

    const url = encodeURI(
      `clearapp://list/create?listName=Today&tasks=${generateClearList()}&listPosition=bottom`
    );
    console.log(url);

    Safari.open(url);
    //     url.open()
    QuickLook.present('All done \n' + JSON.stringify(data, null, 2));
  };
  allDone.centerAligned();

  table.addRow(topRow);

  data.todos.children.forEach((item, i) => {
    if (!data.hiddenTodos.includes(i)) {
      const row = generateRow(item, i);
      table.addRow(row);
    }
  });
}

function generateRowTitle(item) {
  return item.value;
}

function getNotes(item) {
  return item.children
    .filter(({type}) => type === 'note')
    .map(({value}) => value)
    .join('');
}

function generateRowSubtitle(item) {
  let subtitle;
  const tags = item.tags.filter(tag => tag.startsWith('tags(')).join('');
  const due = item.tags.filter(tag => tag.startsWith('due(')).join('');
  return `${tags} ${due}`;
}

function generateRow(item, i) {
  const row = new UITableRow();
  row.height = 60;
  row.cellSpacing = 1;

  const todoNotes = getNotes(item);

  if (data.displayRemoveButton) {
    const removeButton = row.addButton('❌');
    removeButton.widthWeight = BUTTON_WIDTH;
    removeButton.onTap = () => {
      removeTodo(i);
    };
    removeButton.centerAligned();
  }

  const titleCell = row.addText(
    generateRowTitle(item),
    generateRowSubtitle(item)
  );
  titleCell.widthWeight = TEXT_LENGTH - (todoNotes ? BUTTON_WIDTH : 0);

  if (todoNotes) {
    const noteButton = row.addButton('📒');
    noteButton.widthWeight = BUTTON_WIDTH;
    noteButton.onTap = () => {
      QuickLook.present(todoNotes);
    };
    noteButton.centerAligned();
  }

  const channel1 = row.addButton(data[1] === i ? '✔️' : '1️⃣');
  channel1.widthWeight = BUTTON_WIDTH;
  channel1.onTap = () => {
    toggleData('1', i);
  };
  channel1.centerAligned();

  const channel2 = row.addButton(data[2] === i ? '✔️' : '2️⃣');
  channel2.widthWeight = BUTTON_WIDTH;
  channel2.onTap = () => {
    toggleData('2', i);
  };
  channel2.centerAligned();

  const channel3 = row.addButton(data[3] === i ? '✔️' : '3️⃣');
  channel3.widthWeight = BUTTON_WIDTH;
  channel3.onTap = () => {
    toggleData('3', i);
  };
  channel3.centerAligned();

  const watching = row.addButton(data.watch.includes(i) ? '✔️' : '👀');
  watching.widthWeight = BUTTON_WIDTH;
  watching.onTap = () => {
    toggleData('watch', i);
  };
  watching.centerAligned();
  return row;
}
