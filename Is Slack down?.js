// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: exclamationTriangle;
// Checks if Slack is down by examining
// their status page. This script works
// well when when triggered from a Siri
// Shortcut. You can configure a Siri
// Shortcut from the script settings.
let url = 'https://status.slack.com';
let r = new Request(url);
let body = await r.loadString();
Safari.openInApp(url);
// Use the global variable "config" to check
// if the app is run from Siri before we
// speak a text.
if (config.runsWithSiri) {
  let needle = 'Smooth sailing';
  if (body.includes(needle)) {
    Speech.speak('No');
  } else {
    Speech.speak('Yes');
  }
}
