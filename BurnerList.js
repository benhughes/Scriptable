// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: magic;

const {
updateBurnerLists
} = importModule('./updateBurnerLists');



await updateBurnerLists();

if (args.queryParameters['x-success']) {
  Safari.open(args.queryParameters['x-success']);
}
Script.complete();
