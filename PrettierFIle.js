// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;
const {prettier, parserBabylon} = importModule('./libs/prettier');

const prettierConfig = {
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: false,
  parser: 'babel',
  plugins: [parserBabylon],
};

const fm = FileManager.iCloud();
const docsDir = fm.documentsDirectory();

const scriptNames = getScriptNames();

// change to true if you would like to pick the file first
const askForScriptName = false;

const scripts = askForScriptName ? await pickScriptName() : scriptNames;

scripts.forEach(script => {
  const scriptContent = getScriptContent(script);
  const newScriptContent = prettier.format(scriptContent, prettierConfig);
  if (scriptContent !== newScriptContent) {
    overwriteScript(script, newScriptContent);
    console.log(`updated ${script}`);
  }
});

async function pickScriptName() {
  const alert = new Alert();
  alert.title = 'Select Script';
  alert.message =
    'The script can be run by force touching or long pressing on the notification.';

  alert.addAction('all');
  scriptNames.forEach(scriptName => alert.addAction(scriptName));
  alert.addCancelAction('Cancel');

  const idx = await alert.presentAlert();
  if (idx == -1) {
    return [];
  } else if (idx === 0) {
    return scriptNames;
  } else {
    return [scriptNames[idx - 1]];
  }
}

function getScriptNames() {
  return fm
    .listContents(docsDir)
    .filter(f => {
      return f.endsWith('.js');
    })
    .sort();
}

function getScriptContent(scriptName) {
  return fm.readString(`${docsDir}/${scriptName}`);
}

function overwriteScript(scriptName, newContent) {
  return fm.writeString(`${docsDir}/${scriptName}`, newContent);
}

Script.complete();
