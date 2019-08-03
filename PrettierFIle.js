// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;
const prettier = importModule('./libs/prettier');

const prettierConfig = {
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: false,
};

const fm = FileManager.iCloud();
const docsDir = fm.documentsDirectory();

async function pickScriptName() {
  let scriptNames = getScriptNames();
  let alert = new Alert();
  alert.title = 'Select Script';
  alert.message =
    'The script can be run by force touching or long pressing on the notification.';
  for (scriptName of scriptNames) {
    alert.addAction(scriptName);
  }
  alert.addCancelAction('Cancel');
  let idx = await alert.presentAlert();
  if (idx == -1) {
    return null;
  } else {
    return scriptNames[idx];
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
  console.log(`${docsDir}/${scriptName}`);
  return fm.readString(`${docsDir}/${scriptName}`);
}

function overwriteScript(scriptName, newContent) {
  return fm.writeString(`${docsDir}/${scriptName}`, newContent);
}

const script = await pickScriptName();
if (!script) {
  return;
}
const scriptContent = getScriptContent(script);
const newScriptContent = prettier(scriptContent, prettierConfig);
overwriteScript(script, newScriptContent);
