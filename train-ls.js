// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: subway;

/*global config Speech Request UITable UITableRow QuickLook */

const IS_TEST = false;

const TIME_TO_ARRIVE = 12 * 60;

const from = {
  name: 'Liverpool Street',
  id: '910GLIVST',
};

const TEST_DATA = [
  {
    $type:
      'Tfl.Api.Prese  §ntation.Entities.Prediction, Tfl.Api.Presentation.Entities',
    id: '-1171929040',
    operationType: 1,
    vehicleId: '4yKO3evZQ6Glrs3_FY9lDQ',
    naptanId: '910GHAKNYNM',
    stationName: 'Hackney Downs Rail Station',
    lineId: 'london-overground',
    lineName: 'London Overground',
    platformName: 'Platform 3',
    direction: 'inbound',
    bearing: '',
    destinationNaptanId: '910GLIVST',
    destinationName: 'London Liverpool Street Rail Station',
    timestamp: '2018-11-27T23:17:48.7206624Z',
    timeToStation: 1555,
    currentLocation: '',
    towards: '',
    expectedArrival: '2018-11-27T23:43:43Z',
    timeToLive: '2018-11-27T23:43:43Z',
    modeName: 'overground',
    timing: {
      $type:
        'Tfl.Api.Presentation.Entities.PredictionTiming, Tfl.Api.Presentation.Entities',
      countdownServerAdjustment: '00:00:00',
      source: '0001-01-01T00:00:00',
      insert: '0001-01-01T00:00:00',
      read: '2018-11-27T23:17:43.718Z',
      sent: '2018-11-27T23:17:48Z',
      received: '0001-01-01T00:00:00',
    },
  },
  {
    $type:
      'Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities',
    id: '289646294',
    operationType: 1,
    vehicleId: 'LATM8hPQmBDuywBV061Zzg',
    naptanId: '910GHAKNYNM',
    stationName: 'Hackney Downs Rail Station',
    lineId: 'london-overground',
    lineName: 'London Overground',
    platformName: 'Platform 3',
    direction: 'inbound',
    bearing: '',
    destinationNaptanId: '910GLIVST',
    destinationName: 'London Liverpool Street Rail Station',
    timestamp: '2018-11-27T23:17:48.7206624Z',
    timeToStation: 2395,
    currentLocation: '',
    towards: '',
    expectedArrival: '2018-11-27T23:57:43Z',
    timeToLive: '2018-11-27T23:57:43Z',
    modeName: 'overground',
    timing: {
      $type:
        'Tfl.Api.Presentation.Entities.PredictionTiming, Tfl.Api.Presentation.Entities',
      countdownServerAdjustment: '00:00:00',
      source: '0001-01-01T00:00:00',
      insert: '0001-01-01T00:00:00',
      read: '2018-11-27T23:17:43.718Z',
      sent: '2018-11-27T23:17:48Z',
      received: '0001-01-01T00:00:00',
    },
  },
  {
    $type:
      'Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities',
    id: '1309849133',
    operationType: 1,
    vehicleId: 'mFH3rbVityaTGupK9jY_Sw',
    naptanId: '910GHAKNYNM',
    stationName: 'Hackney Downs Rail Station',
    lineId: 'london-overground',
    lineName: 'London Overground',
    platformName: 'Platform 1',
    direction: 'inbound',
    bearing: '',
    destinationNaptanId: '910GLIVST',
    destinationName: 'London Liverpool Street Rail Station',
    timestamp: '2018-11-27T23:17:48.7206624Z',
    timeToStation: 1435,
    currentLocation: '',
    towards: '',
    expectedArrival: '2018-11-27T23:41:43Z',
    timeToLive: '2018-11-27T23:41:43Z',
    modeName: 'overground',
    timing: {
      $type:
        'Tfl.Api.Presentation.Entities.PredictionTiming, Tfl.Api.Presentation.Entities',
      countdownServerAdjustment: '00:00:00',
      source: '0001-01-01T00:00:00',
      insert: '0001-01-01T00:00:00',
      read: '2018-11-27T23:17:43.718Z',
      sent: '2018-11-27T23:17:48Z',
      received: '0001-01-01T00:00:00',
    },
  },
  {
    $type:
      'Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities',
    id: '-141784718',
    operationType: 1,
    vehicleId: 'rWdldGI3xoi3cvzz6a-mSg',
    naptanId: '910GHAKNYNM',
    stationName: 'Hackney Downs Rail Station',
    lineId: 'london-overground',
    lineName: 'London Overground',
    platformName: 'Platform 1',
    direction: 'inbound',
    bearing: '',
    destinationNaptanId: '910GLIVST',
    destinationName: 'London Liverpool Street Rail Station',
    timestamp: '2018-11-27T23:17:48.7206624Z',
    timeToStation: 535,
    currentLocation: '',
    towards: '',
    expectedArrival: '2018-11-27T23:26:43Z',
    timeToLive: '2018-11-27T23:26:43Z',
    modeName: 'overground',
    timing: {
      $type:
        'Tfl.Api.Presentation.Entities.PredictionTiming, Tfl.Api.Presentation.Entities',
      countdownServerAdjustment: '00:00:00',
      source: '0001-01-01T00:00:00',
      insert: '0001-01-01T00:00:00',
      read: '2018-11-27T23:17:43.718Z',
      sent: '2018-11-27T23:17:48Z',
      received: '0001-01-01T00:00:00',
    },
  },
  {
    $type:
      'Tfl.Api.Presentation.Entities.Prediction, Tfl.Api.Presentation.Entities',
    id: '38853606',
    operationType: 1,
    vehicleId: 'uOYEetlFTXGE5QjjmRWBUg',
    naptanId: '910GHAKNYNM',
    stationName: 'Hackney Downs Rail Station',
    lineId: 'london-overground',
    lineName: 'London Overground',
    platformName: 'Platform 3',
    direction: 'inbound',
    bearing: '',
    destinationNaptanId: '910GLIVST',
    destinationName: 'London Liverpool Street Rail Station',
    timestamp: '2018-11-27T23:17:48.7206624Z',
    timeToStation: 655,
    currentLocation: '',
    towards: '',
    expectedArrival: '2018-11-27T23:28:43Z',
    timeToLive: '2018-11-27T23:28:43Z',
    modeName: 'overground',
    timing: {
      $type:
        'Tfl.Api.Presentation.Entities.PredictionTiming, Tfl.Api.Presentation.Entities',
      countdownServerAdjustment: '00:00:00',
      source: '0001-01-01T00:00:00',
      insert: '0001-01-01T00:00:00',
      read: '2018-11-27T23:17:43.718Z',
      sent: '2018-11-27T23:17:48Z',
      received: '0001-01-01T00:00:00',
    },
  },
];

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
        `So the next train from ${from.name} runs in ${Math.floor(
          timeToStation / 60
        )} minutes from ${platformName}`
      );
    } else {
      Speech.speak(`So no trains are currently scheduled from ${from.name}`);
    }
  }
};

async function main() {
  const url = `https://api.tfl.gov.uk/Line/london-overground/Arrivals/${from.id}`;

  const req = new Request(url);
  const result = await req.loadJSON();

  const sorted = (IS_TEST ? TEST_DATA : result).sort(
    (a, b) => a.timeToStation - b.timeToStation
  );

  const table = new UITable();
  table.showSeparators = true;

  const topRow = new UITableRow();
  topRow.height = 60;
  topRow.cellSpacing = 10;
  topRow.isHeader = true;
  topRow.addText(`Trains from ${from.name} to Hackney Downs`);
  table.addRow(topRow);

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

main();
