// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: subway;

/*global config Speech Request UITable UITableRow QuickLook FileManager  */

function require(path) {
  let fm;
  try {
    fm = FileManager.iCloud();
  } catch (e) {
    fm = FileManager.local();
  }
  const code = fm.readString(
    fm.joinPath(fm.documentsDirectory(), path.replace(/\.js$/, '') + '.js')
  );
  if (code == null) throw new Error(`Module '${path}' not found.`);
  return Function(`${code}; return exports`)();
}

const TEST_DATA = require('./tfl-test-data');

const IS_TEST = false;

const TIME_TO_ARRIVE = 5 * 60;

const from = {
  name: 'Hackney Downs',
  id: '910GHAKNYNM',
};

const to = {
  name: 'Liverpool Street',
  id: '910GLIVST',
};

const arrivalParse = timeToStation => {
  const minutes = Math.floor(timeToStation / 60);
  return minutes === 0 ? 'Due' : minutes + 'm';
};

const getTimeToLeave = timeToStation => {
  const minutes = Math.floor((timeToStation - TIME_TO_ARRIVE) / 60);
  return minutes < 0 ? 'leaving too soon' : `leave in ${minutes}m`;
};

const speakNextTrain = times => {
  if (config.runsWithSiri) {
    if (times[0]) {
      const {platformName, timeToStation} = times[0];

      Speech.speak(
        `So the next train from ${from.name} to ${to.name} runs in ${Math.floor(
          timeToStation / 60
        )} minutes from ${platformName}`
      );
    } else {
      Speech.speak(`So no trains are currently scheduled from ${from.name}`);
    }
  }
};

async function main() {
  const url = `https://api.tfl.gov.uk/Line/london-overground/Arrivals/${from.id}?destinationStationId=${to.id}`;
  let result;

  if (!IS_TEST) {
    try {
      const req = new Request(url);
      result = await req.loadJSON();
    } catch (e) {
      QuickLook.present('Something has gone wrong. \n\n' + e);
      return;
    }
  } else {
    result = TEST_DATA;
  }

  const resultLength = config.runsInNotification ? 5 : result.length;

  const sorted = result
    .sort((a, b) => a.timeToStation - b.timeToStation)
    .splice(0, resultLength);

  const table = new UITable();
  table.showSeparators = true;

  const topRow = new UITableRow();
  topRow.height = 60;
  topRow.cellSpacing = 10;
  topRow.isHeader = true;
  topRow.addText(`Trains from ${from.name} to ${to.name}`);
  table.addRow(topRow);

  if (IS_TEST) {
    const row = new UITableRow();
    const titleCell = row.addText('Test Mode');
    titleCell.widthWeight = 80;
    row.height = 60;
    row.cellSpacing = 10;
    table.addRow(row);
  }

  for (const item of sorted) {
    const {platformName, timeToStation} = item;
    const row = new UITableRow();
    const timeToArrive = arrivalParse(timeToStation);
    const timeToLeave = getTimeToLeave(timeToStation);
    const subTitle = `${timeToArrive} (${timeToLeave})`;
    const titleCell = row.addText(platformName, subTitle);
    titleCell.widthWeight = 80;
    row.height = 60;
    row.cellSpacing = 10;
    table.addRow(row);
  }

  QuickLook.present(table);
  speakNextTrain(sorted);
}

await main();
