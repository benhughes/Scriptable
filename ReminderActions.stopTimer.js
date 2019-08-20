// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: magic;
const {requestCurrentTimer, requestStopTimer} = importModule(
  './ReminderActions.common'
);

const {data} = await requestCurrentTimer();

console.log(data);

if (data) {
  const stopData = await requestStopTimer(data.id);
  console.log(stopData);
}

if (args.queryParameters['x-success']) {
  Safari.open(args.queryParameters['x-success']);
}
Script.complete();
