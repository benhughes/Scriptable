// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: magic;
const test = `PsG: 0
PmG: 1
PsB: 1
PsG: 0
PmB: 1
PvG: 0
PvG: 1
PvB: 1
PsB: 0
PmG: 0
PsG: 0
PsG: 1
PmB: 0
PmG: 1
PmG: 1
PvB: 0
PvB: 1
PvB: 0
PsB: 1
PmB: 1
PmB: 0
PvB: 0
PsG: 0
PmG: 0
PsB: 1
PmG: 1
PsG: 0
PvG: 0
PmB: 0
PsB: 1
PvG: 0
PvB: 0
PmB: 1
PvG: 1
PvG: 0
PsG: 0
PvG: 0
PmG: 0
PsB: 1
PmG: 1
PsB: 1
PmB: 1
PvG: 0
PvB: 0
PsG: 0
PmB: 0
PsB: 0
PvB: 0`;

const types = ['PmB', 'PmG', 'PvB', 'PvG', 'HoB', 'PsB', 'PsG'];

let q = test.split('\n').map(q => q.split(': '));

let result = types
  .map(t => [
    t,
    q
      .filter(([a, b]) => a === t)
      .map(([a, b]) => b)
      .reduce((a, b) => parseInt(a, 10) + parseInt(b, 10), 0),
  ])
  .map(a => a.join(': '))
  .join('\n');
console.log(result);
Pasteboard.copyString(result);
