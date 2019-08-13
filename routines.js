// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: magic;
const fm = FileManager.iCloud();
const docsDir = fm.documentsDirectory() + '/routine-lists';
const AUTH_TOKEN = 'JeXyZaXGsnqhbZa9DzY7';

const selectedList = args.queryParameters.list || (await pickListtName());

if (!selectedList) {
  return;
}

const completedItems = args.queryParameters.complete
  ? args.queryParameters.complete.split(',')
  : [];

const todos = fm
  .readString(`${docsDir}/${selectedList}.txt`)
  .split('\n')
  .filter(line => Boolean(line))
  .map((t, i) => {
    const completeParam = [...completedItems, i];
    const isCompleted = completedItems.includes(String(i));
    if (isCompleted) {
      return `- [x] ~~${t}~~`;
    }
    return `- [ ] ${t} [Done](scriptable:///run?scriptName=routines&complete=${completeParam.join(
      ','
    )}&list=${selectedList})`;
  })
  .join('\n');

const fileText = `
# ${selectedList}

[Restart](scriptable:///run?scriptName=routines&list=${selectedList})

${todos}
`;

const url = `ia-writer://write?path=/punchlist/routines/${selectedList}.txt&mode=replace&auth-token=${AUTH_TOKEN}&text=${encodeURIComponent(
  fileText
)}`;

Safari.open(url);
console.log(todos);

async function pickListtName() {
  const listNames = getListNames().map(l => l.replace('.txt', ''));
  let alert = new Alert();
  alert.title = 'Select list';

  listNames.forEach(scriptName => alert.addAction(scriptName));
  alert.addCancelAction('Cancel');

  let idx = await alert.presentAlert();
  if (idx == -1) {
    return null;
  } else {
    return listNames[idx];
  }
}

function getListNames() {
  return fm
    .listContents(docsDir)
    .filter(f => {
      return f.endsWith('.txt');
    })
    .sort();
}

function getListContent(listName) {
  return fm.readString(`${docsDir}/${listName}`);
}

Script.complete();
