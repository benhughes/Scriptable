// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;
const TIME_ENTRIES_URL = 'https://www.toggl.com/api/v8/time_entries';
const START_TIMER_URL = 'https://www.toggl.com/api/v8/time_entries/start';
const auth = btoa('benhuggy@gmail.com:meatball11');

let result;
const table = new UITable();
table.showSeparators = true;

try {
  const req = new Request(TIME_ENTRIES_URL);
  req.headers = {
    Authorization: `Basic ${auth}`,
  };
  result = await req.loadJSON();
} catch (e) {
  QuickLook.present('Something has gone wrong. \n\n' + e);
  return;
}
displayResults(result.reverse());

function displayResults(results) {
  const topRow = new UITableRow();
  topRow.height = 60;
  topRow.cellSpacing = 10;
  topRow.isHeader = true;
  topRow.addText(`Select a time`);
  table.addRow(topRow);

  const row = new UITableRow();
  row.height = 60;
  row.cellSpacing = 10;

  const titleCell = row.addText('Start custom');
  titleCell.widthWeight = 80;

  const displayRemoveButton = row.addButton('🕐');
  displayRemoveButton.widthWeight = 10;
  displayRemoveButton.onTap = () => startTimer({});
  displayRemoveButton.centerAligned();

  table.addRow(row);

  for (const item of results) {
    console.log(item);
    const row = new UITableRow();
    row.height = 60;
    row.cellSpacing = 10;

    const titleCell = row.addText(
      item.description,
      (item.tags || []).join(', ')
    );
    titleCell.widthWeight = 80;

    const displayRemoveButton = row.addButton('🕐');
    displayRemoveButton.widthWeight = 10;
    displayRemoveButton.onTap = () => startTimer(item);
    displayRemoveButton.centerAligned();

    table.addRow(row);
  }

  table.present();
}

async function startTimer(choosenEntry) {
  console.log(choosenEntry);
  table.removeAllRows();
  const body = {
    time_entry: {
      pid: choosenEntry.pid,
      description: choosenEntry.description,
      tags: choosenEntry.tags,
      created_with: 'scriptable',
    },
  };
  console.log(body);

  try {
    const req = new Request(START_TIMER_URL);
    req.headers = {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    };
    req.method = 'POST';
    req.body = JSON.stringify(body);

    const startResult = await req.loadJSON();
    console.log(startResult);
    const resultRow = new UITableRow();
    resultRow.height = 60;
    resultRow.cellSpacing = 10;
    resultRow.isHeader = true;
    resultRow.addText(
      `started a timer for ${startResult.data.description || 'New Timer'}`
    );
    table.addRow(resultRow);

    table.reload();
  } catch (e) {
    QuickLook.present('Something has gone wrong. \n\n' + e);
    return;
  }
}
